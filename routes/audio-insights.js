// routes/audio-insights.js
const express = require('express');
const multer = require('multer');
const upload = multer();
const router = express.Router();
const { addOrUpdatePatientRecord, getPatientHistory } = require('../utils/excelManager');

// Replace this with Whisper and GPT integration
const fakeTranscribe = async (audioBuffer) => 'Patient says they have a headache and fever.';
const fakeGenerateInsight = async (transcript) => 'Recommend paracetamol and hydration.';

router.post('/audio-insights', upload.single('audio'), async (req, res) => {
  const { patientId } = req.body;

  // Simulated DB – you should replace this with your real DB call
  const patient = global.patients?.find(p => p.id === patientId);

  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  const audioBuffer = req.file.buffer;
  const transcript = await fakeTranscribe(audioBuffer);
  const insight = await fakeGenerateInsight(transcript);

  const record = {
    Name: patient.name,
    Email: patient.email,
    Date: new Date().toLocaleString(),
    Transcript: transcript,
    Insight: insight,
    Symptoms: 'Headache, Fever',
    Prescriptions: 'Paracetamol',
    'Medication Schedules': 'Paracetamol: 2 times/day',
    'Attending Officer': 'Dr. AI Assistant'
  };

  addOrUpdatePatientRecord(record);

  const updatedHistory = getPatientHistory(patient.email);

  res.json({
    transcript,
    newInsight: insight,
    updatedHistory
  });
});

module.exports = router;
