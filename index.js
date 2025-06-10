
// 📁 backend/server.js
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const cloudinary = require('cloudinary').v2; // Added for Cloudinary
const fetch = require('node-fetch');

const {
  ensureExcelFile,
  findPatient,
  addPatient,
  updateInsights,
  fuzzyMatchPatient,
  updatePatientFields,
  addPatientDocument,
  getPatientDocuments,
} = require('./utils/excel');

const {
  transcribeAudioAndGenerateInsight,
} = require('./utils/processAudio');

const app = express();
const PORT = process.env.PORT || 5000;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });
const EXCEL_FILE = path.join(__dirname, 'patient_records.xlsx');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const { summarizeInsights } = require('./utils/summarizeInsights');

ensureExcelFile(EXCEL_FILE);

ensureExcelFile(EXCEL_FILE);

function safeDeleteFile(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

app.post('/api/upload-document', upload.single('file'), async (req, res) => {
  try {
    const { patientId, filename } = req.body;
    if (!req.file) return res.status(400).json({ error: 'Document file is required' });
    if (!patientId) {
      safeDeleteFile(req.file.path);
      return res.status(400).json({ error: 'Patient ID is required' });
    }
    const finalFilename = filename || req.file.originalname;
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'auto',
      folder: 'patient-documents',
      public_id: finalFilename ? require('path').parse(finalFilename).name : undefined,
      use_filename: true,
      unique_filename: false,
      overwrite: false
    });
    safeDeleteFile(req.file.path);

    const fileUrl = uploadResult.secure_url;
    const success = addPatientDocument(EXCEL_FILE, patientId, {
      url: fileUrl,
      filename: finalFilename,
      uploadedAt: new Date().toISOString()
    });
    if (!success) return res.status(404).json({ error: 'Patient not found' });

    return res.json({ success: true, url: fileUrl, filename: finalFilename });
  } catch (error) {
    if (req.file) safeDeleteFile(req.file.path);
    return res.status(500).json({ error: 'Failed to upload document' });
  }
});

// ===== Route to fetch all docs for a patient =====
app.get('/api/patient-documents/:patientId', (req, res) => {
  try {
    const { patientId } = req.params;
    if (!patientId) return res.status(400).json({ error: 'Patient ID is required' });

    const documents = getPatientDocuments(EXCEL_FILE, patientId);
    res.json({ documents });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});



app.post('/api/summarize-insights', async (req, res) => {
  try {
    const { insights } = req.body;
    if (!insights || !Array.isArray(insights) || insights.length === 0) {
      return res.status(400).json({ error: 'No insights provided' });
    }
    const summary = await summarizeInsights(insights, OPENAI_API_KEY);
    res.json({ summary });
  } catch (err) {
    console.error('❌ Error in /api/summarize-insights:', err);
    res.status(500).json({ error: 'Failed to summarize insights' });
  }
});



app.post('/api/search-patient', upload.single('audio'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Audio file is required' });

  const audioPath = req.file.path;
  try {
    const patientName = await transcribeAudioAndGenerateInsight(
      audioPath,
      OPENAI_API_KEY,
      { mode: 'transcribeOnly' }
    );

    safeDeleteFile(audioPath);

    const result = findPatient(EXCEL_FILE, patientName);

    if (result.status === 'found') {
      const { patient } = result;
      return res.json({
        status: 'found',
        patientId: patient.patientId,
        patientName: patient.patientName,
        pastInsights: patient.pastInsights || [],
      });
    }

    if (result.status === 'multiple_matches') {
      return res.json({
        status: 'multiple_matches',
        options: result.options,
        originalName: result.originalName,
      });
    }

    const newId = `${patientName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
    addPatient(EXCEL_FILE, { patientId: newId, patientName });

    return res.json({
      status: 'not_found',
      newPatientCreated: true,
      patientName,
      patientId: newId,
      pastInsights: [],
    });
  } catch (error) {
    safeDeleteFile(audioPath);
    console.error('❌ Error in /api/search-patient:', error);
    return res.status(500).json({ error: 'Failed to search patient' });
  }
});

app.post('/api/search-patient-name', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const matches = fuzzyMatchPatient(EXCEL_FILE, name);

    const exactMatch = matches.find(p => p.patientName.toLowerCase() === name.toLowerCase());
    if (exactMatch) {
      const { patientId, patientName } = exactMatch;
      const { patient } = findPatient(EXCEL_FILE, patientName);
      return res.json({
        status: 'found',
        patientId,
        patientName,
        pastInsights: patient.pastInsights || []
      });
    }

    if (matches.length === 1) {
      const { patientId, patientName } = matches[0];
      const { patient } = findPatient(EXCEL_FILE, patientName);
      res.json({
        status: 'found',
        patientId,
        patientName,
        pastInsights: patient.pastInsights || []
      });
    } else if (matches.length > 1) {
      res.json({
        status: 'multiple_matches',
        options: matches,
        originalName: name
      });
    } else {
      const newId = `${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
      addPatient(EXCEL_FILE, { patientId: newId, patientName: name });
      res.json({
        status: 'not_found',
        newPatientCreated: true,
        patientName: name,
        patientId: newId,
        pastInsights: []
      });
    }
  } catch (error) {
    console.error('❌ Error in /api/search-patient-name:', error);
    res.status(500).json({ error: 'Failed to search patient by name' });
  }
});

app.post('/api/audio-insights', upload.single('audio'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Audio file is required' });
  const audioPath = req.file.path;

  try {
    const { patientId } = req.body;
    if (!patientId) {
      safeDeleteFile(audioPath);
      return res.status(400).json({ error: 'Patient ID is required' });
    }

    // Upload audio to Cloudinary
    const audioUpload = await cloudinary.uploader.upload(audioPath, {
      resource_type: 'video',
      folder: 'patient-insights'
    });

    const { transcript, insight } = await transcribeAudioAndGenerateInsight(audioPath, OPENAI_API_KEY);
    safeDeleteFile(audioPath);

    const timestamp = new Date().toISOString().split('T')[0];
    const newInsight = { 
      date: timestamp, 
      insight,
      audioUrl: audioUpload.secure_url // Store Cloudinary URL
    };

    const success = updateInsights(EXCEL_FILE, patientId, newInsight);
    if (!success) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    return res.json({ success: true, newInsight });
  } catch (error) {
    safeDeleteFile(audioPath);
    console.error('❌ Error in /api/audio-insights:', error);
    return res.status(500).json({ error: 'Failed to process audio insight' });
  }
});

app.post('/api/update-fields', async (req, res) => {
  try {
    const { patientId, fields } = req.body;
    if (!patientId || !fields || typeof fields !== 'object') {
      return res.status(400).json({ error: 'Patient ID and fields are required' });
    }

    const success = updatePatientFields(EXCEL_FILE, patientId, fields);
    if (!success) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('❌ Error in /api/update-fields:', error);
    return res.status(500).json({ error: 'Failed to update fields' });
  }
});

app.post('/api/add-patient', async (req, res) => {
  try {
    const { name, age, gender, phone } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const newId = `${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
    const newPatient = {
      patientId: newId,
      patientName: name,
      age: age || '',
      gender: gender || '',
      phone: phone || '',
      pastInsights: [],
    };

    addPatient(EXCEL_FILE, newPatient);
    res.json({ success: true, patientId: newId, patientName: name });
  } catch (error) {
    console.error('❌ Error in /api/add-patient:', error);
    res.status(500).json({ error: 'Failed to add new patient' });
  }
});

app.post('/api/update-patient-name', async (req, res) => {
  try {
    const { patientId, newName } = req.body;
    if (!patientId || !newName) {
      return res.status(400).json({ error: 'Patient ID and new name are required' });
    }

    const success = updatePatientFields(EXCEL_FILE, patientId, { patientName: newName });
    if (!success) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('❌ Error in /api/update-patient-name:', error);
    return res.status(500).json({ error: 'Failed to update name' });
  }
});

app.listen(PORT, () => console.log(`🚀 Backend running at http://localhost:${PORT}`));