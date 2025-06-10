// utils/excelManager.js
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const filePath = path.join(__dirname, '../data/patient_records.xlsx');

const requiredColumns = [
  'Name',
  'Email',
  'Date',
  'Transcript',
  'Insight',
  'Symptoms',
  'Prescriptions',
  'Medication Schedules',
  'Attending Officer'
];

function ensureExcelExists() {
  if (!fs.existsSync(filePath)) {
    const worksheet = XLSX.utils.json_to_sheet([], { header: requiredColumns });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'PatientRecords');
    XLSX.writeFile(workbook, filePath);
    console.log('✅ Created new Excel file with required columns.');
  } else {
    console.log('📝 Excel file already exists.');
  }
}

function addOrUpdatePatientRecord(record) {
  ensureExcelExists();
  const workbook = XLSX.readFile(filePath);
  const worksheet = workbook.Sheets['PatientRecords'];
  const data = XLSX.utils.sheet_to_json(worksheet);

  data.push(record); // Always append a new session row

  const newWorksheet = XLSX.utils.json_to_sheet(data, { header: requiredColumns });
  workbook.Sheets['PatientRecords'] = newWorksheet;
  XLSX.writeFile(workbook, filePath);
}

function getPatientHistory(email) {
  ensureExcelExists();
  const workbook = XLSX.readFile(filePath);
  const worksheet = workbook.Sheets['PatientRecords'];
  const data = XLSX.utils.sheet_to_json(worksheet);
  return data.filter(row => row.Email === email);
}

module.exports = { ensureExcelExists, addOrUpdatePatientRecord, getPatientHistory };
