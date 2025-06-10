const mongoose = require('mongoose');
const PatientSchema = new mongoose.Schema({
  name: String,
  email: String,
});
module.exports = mongoose.model('Patient', PatientSchema);