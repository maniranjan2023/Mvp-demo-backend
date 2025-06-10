const mongoose = require('mongoose');
const MeetingSchema = new mongoose.Schema({
  patientId: mongoose.Schema.Types.ObjectId,
  transcript: String,
  audioPath: String,
  insights: String,
  timestamp: Date,
});
module.exports = mongoose.model('Meeting', MeetingSchema);