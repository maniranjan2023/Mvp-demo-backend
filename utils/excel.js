// const fs = require('fs');
// const XLSX = require('xlsx');

// function ensureExcelFile(filePath) {
//   if (!fs.existsSync(filePath)) {
//     const wb = XLSX.utils.book_new();
//     const ws = XLSX.utils.json_to_sheet([]);
//     XLSX.utils.book_append_sheet(wb, ws, 'Patients');
//     XLSX.writeFile(wb, filePath);
//     console.log('✅ Created new Excel file');
//   }
// }

// function readSheet(filePath) {
//   const wb = XLSX.readFile(filePath);
//   const ws = wb.Sheets['Patients'];
//   return XLSX.utils.sheet_to_json(ws);
// }

// function writeSheet(filePath, data) {
//   const ws = XLSX.utils.json_to_sheet(data);
//   const wb = XLSX.utils.book_new();
//   XLSX.utils.book_append_sheet(wb, ws, 'Patients');
//   XLSX.writeFile(wb, filePath);
// }

// function findPatient(filePath, name) {
//   const rows = readSheet(filePath);
//   const match = rows.find(r => r.patientName?.toLowerCase() === name.toLowerCase());

//   if (!match) return { found: false };

//   const insights = JSON.parse(match.insights || '[]');
//   return { found: true, patient: { ...match, pastInsights: insights } };
// }

// function addPatient(filePath, { patientId, patientName }) {
//   const data = readSheet(filePath);
//   data.push({
//     patientId,
//     patientName,
//     insights: JSON.stringify([]),
//     symptoms: "",
//     prescription: "",
//     diagnosis: "",
//     dietPlan: "",
//     misc: ""
//   });
//   writeSheet(filePath, data);
// }

// function updateInsights(filePath, patientId, newInsight) {
//   const data = readSheet(filePath);
//   const index = data.findIndex(p => p.patientId === patientId);
//   if (index === -1) return false;

//   const past = JSON.parse(data[index].insights || '[]');
//   past.unshift(newInsight);
//   data[index].insights = JSON.stringify(past);
//   writeSheet(filePath, data);
//   return true;
// }

// module.exports = {
//   ensureExcelFile,
//   findPatient,
//   addPatient,
//   updateInsights
// };

// const fs = require('fs');
// const XLSX = require('xlsx');

// // Ensure Excel file exists
// function ensureExcelFile(filePath) {
//   if (!fs.existsSync(filePath)) {
//     const wb = XLSX.utils.book_new();
//     const ws = XLSX.utils.json_to_sheet([]);
//     XLSX.utils.book_append_sheet(wb, ws, 'Patients');
//     XLSX.writeFile(wb, filePath);
//     console.log('✅ Created new Excel file');
//   }
// }

// // Read Excel sheet
// function readSheet(filePath) {
//   const wb = XLSX.readFile(filePath);
//   const ws = wb.Sheets['Patients'];
//   return XLSX.utils.sheet_to_json(ws);
// }

// // Write data to Excel
// function writeSheet(filePath, data) {
//   const ws = XLSX.utils.json_to_sheet(data);
//   const wb = XLSX.utils.book_new();
//   XLSX.utils.book_append_sheet(wb, ws, 'Patients');
//   XLSX.writeFile(wb, filePath);
// }

// // Basic fuzzy match: trims + lowercases names
// function fuzzyMatch(str1, str2) {
//   const normalize = s => s.toLowerCase().replace(/\s+/g, '');
//   return normalize(str1) === normalize(str2);
// }

// // Main patient search with fuzzy logic (exact + fuzzy single match)
// function findPatient(filePath, name) {
//   const data = readSheet(filePath);

//   // Exact match first
//   const exactMatch = data.find(p => p.patientName?.toLowerCase() === name.toLowerCase());
//   if (exactMatch) {
//     return {
//       status: 'found',
//       patient: {
//         ...exactMatch,
//         pastInsights: JSON.parse(exactMatch.insights || '[]')
//       }
//     };
//   }

//   // Fuzzy matches
//   const matches = data.filter(p => fuzzyMatch(p.patientName, name));
//   if (matches.length > 1) {
//     return {
//       status: 'multiple_matches',
//       options: matches,
//       originalName: name
//     };
//   }

//   // Single fuzzy match (safe fallback)
//   if (matches.length === 1) {
//     return {
//       status: 'found',
//       patient: {
//         ...matches[0],
//         pastInsights: JSON.parse(matches[0].insights || '[]')
//       }
//     };
//   }

//   // Not found
//   return { status: 'not_found' };
// }

// // New function: fuzzyMatchPatient
// // Returns an array of matches with patientId and patientName for a given name
// function fuzzyMatchPatient(filePath, name) {
//   const data = readSheet(filePath);
//   const search = name.toLowerCase().replace(/\s+/g, '');

//   // Match patients whose names include the search string (simple fuzzy)
//   const matches = data.filter(p => {
//     if (!p.patientName) return false;
//     const normalized = p.patientName.toLowerCase().replace(/\s+/g, '');
//     return normalized.includes(search);
//   });

//   // Return simplified list of matches
//   return matches.map(p => ({
//     patientId: p.patientId,
//     patientName: p.patientName
//   }));
// }

// // Add a new patient
// function addPatient(filePath, { patientId, patientName }) {
//   const data = readSheet(filePath);
//   data.push({
//     patientId,
//     patientName,
//     insights: JSON.stringify([]),
//     symptoms: "",
//     prescription: "",
//     diagnosis: "",
//     dietPlan: "",
//     misc: ""
//   });
//   writeSheet(filePath, data);
// }

// // Add a new insight to existing patient
// function updateInsights(filePath, patientId, newInsight) {
//   const data = readSheet(filePath);
//   const index = data.findIndex(p => p.patientId === patientId);
//   if (index === -1) return false;

//   const past = JSON.parse(data[index].insights || '[]');
//   past.unshift(newInsight);
//   data[index].insights = JSON.stringify(past);
//   writeSheet(filePath, data);
//   return true;
// }

// module.exports = {
//   ensureExcelFile,
//   readSheet,
//   findPatient,
//   fuzzyMatchPatient, // <-- exported new fuzzy match function
//   addPatient,
//   updateInsights
// };



// 📁 backend/utils/excel.js
const fs = require('fs');
const xlsx = require('xlsx');
const path = require('path');

function ensureExcelFile(filePath) {
  if (!fs.existsSync(filePath)) {
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet([]);
    xlsx.utils.book_append_sheet(wb, ws, 'Patients');
    xlsx.writeFile(wb, filePath);
    console.log('✅ Excel file created at', filePath);
  }
}

function readSheet(filePath) {
  const wb = xlsx.readFile(filePath);
  const ws = wb.Sheets['Patients'];
  const data = xlsx.utils.sheet_to_json(ws) || [];

  // Parse insights back to array format
  return data.map(p => ({
    ...p,
    pastInsights: Array.isArray(p.insights)
      ? p.insights
      : typeof p.insights === 'string'
        ? JSON.parse(p.insights || '[]')
        : []
  }));
}

function writeSheet(filePath, data) {
  const cleaned = data.map(p => ({
    ...p,
    insights: JSON.stringify(p.pastInsights || [])
  }));

  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.json_to_sheet(cleaned);
  xlsx.utils.book_append_sheet(wb, ws, 'Patients');
  xlsx.writeFile(wb, filePath);
}

function addPatient(filePath, { patientId, patientName }) {
  const patients = readSheet(filePath);

  if (patients.some(p => p.patientId === patientId)) return false;

  patients.push({
    patientId,
    patientName,
    pastInsights: [],
    symptoms: "",
    prescription: "",
    diagnosis: "",
    dietPlan: "",
    misc: ""
  });

  writeSheet(filePath, patients);
  return true;
}

function findPatient(filePath, name) {
  const patients = readSheet(filePath);
  const matches = patients.filter(p =>
    p.patientName?.toLowerCase().trim() === name?.toLowerCase().trim()
  );

  if (matches.length === 1) {
    return { status: 'found', patient: matches[0] };
  } else if (matches.length > 1) {
    return {
      status: 'multiple_matches',
      options: matches.map(p => ({ patientId: p.patientId, patientName: p.patientName })),
      originalName: name
    };
  }

  return { status: 'not_found' };
}

function fuzzyMatchPatient(filePath, partialName) {
  const patients = readSheet(filePath);
  const query = partialName?.toLowerCase().replace(/\s+/g, '') || '';

  return patients
    .filter(p => p.patientName?.toLowerCase().replace(/\s+/g, '').includes(query))
    .map(p => ({ patientId: p.patientId, patientName: p.patientName }));
}

function updateInsights(filePath, patientId, newInsight) {
  const patients = readSheet(filePath);
  const index = patients.findIndex(p => p.patientId === patientId);

  if (index === -1) return false;

  patients[index].pastInsights.unshift(newInsight);
  writeSheet(filePath, patients);
  return true;
}

function updatePatientFields(filePath, patientId, fields) {
  const patients = readSheet(filePath);
  const index = patients.findIndex(p => p.patientId === patientId);
  if (index === -1) return false;

  patients[index] = {
    ...patients[index],
    ...fields
  };

  writeSheet(filePath, patients);
  return true;
}



function writeSheet(filePath, data) {
  const cleaned = data.map(p => ({
    ...p,
    insights: JSON.stringify(p.pastInsights || []),
    documentsUrl: JSON.stringify(p.documentsUrl || [])
  }));
  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.json_to_sheet(cleaned);
  xlsx.utils.book_append_sheet(wb, ws, 'Patients');
  xlsx.writeFile(wb, filePath);
}

function addPatientDocument(filePath, patientId, documentObj) {
  const patients = readSheet(filePath);
  const idx = patients.findIndex(p => p.patientId === patientId);
  if (idx === -1) return false;

  // Always ensure documentsUrl is an array
  if (!Array.isArray(patients[idx].documentsUrl)) {
    try {
      patients[idx].documentsUrl = JSON.parse(patients[idx].documentsUrl || '[]');
    } catch {
      patients[idx].documentsUrl = [];
    }
  }
  patients[idx].documentsUrl.unshift(documentObj);
  writeSheet(filePath, patients);
  return true;
}

function getPatientDocuments(filePath, patientId) {
  const patients = readSheet(filePath);
  const patient = patients.find(p => p.patientId == patientId);
  if (!patient) return [];
  let docs = patient.documentsUrl;
  // Defensive: handle possible string, empty, or array
  if (typeof docs === "string") {
    try {
      docs = docs.trim() ? JSON.parse(docs) : [];
    } catch {
      docs = [];
    }
  }
  if (!Array.isArray(docs)) docs = [];
  return docs;
}


module.exports = {
  ensureExcelFile,
  readSheet,
  writeSheet,
  addPatient,
  findPatient,
  fuzzyMatchPatient,
  updateInsights,
  updatePatientFields,
  addPatientDocument,
  getPatientDocuments,
};

