const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const FormData = require('form-data');
const { execSync } = require('child_process');

function convertToMp3IfNeeded(inputPath) {
  const ext = path.extname(inputPath).toLowerCase();
  if (['.mp3', '.m4a', '.wav'].includes(ext)) return inputPath;

  const outputPath = `${inputPath}.mp3`;
  execSync(`ffmpeg -y -i "${inputPath}" "${outputPath}"`);
  return outputPath;
}


async function transcribeAudioWithOpenAI(filePath, apiKey) {
  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));
  formData.append('model', 'whisper-1');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      ...formData.getHeaders(),
      Authorization: `Bearer ${apiKey}`
    },
    body: formData
  });

  if (!response.ok) throw new Error(`Transcription failed: ${response.statusText}`);
  const result = await response.json();
  return result.text;
}

async function generateInsightsFromTranscript(transcript, apiKey) {
  const today = new Date().toISOString().split('T')[0];
  const prompt = `
You are an intelligent and empathetic medical assistant reviewing the transcript of an audio conversation between a doctor and a patient.

The transcript includes clearly labeled speaker turns, such as:

"Doctor: (statements made by the doctor)"
"Patient: (statements made by the patient)"

Carefully read the entire conversation and generate a structured and insightful medical summary with the following sections:

Patient’s Reported Symptoms:
Extract all symptoms described by the patient, including onset, duration, severity, and any known triggers.

Doctor’s Clinical Observations & Questions:
Summarize diagnostic reasoning, clinical observations, and important questions the doctor asks the patient.

Doctor’s Prescription and Medications:
List all medications prescribed or recommended by the doctor, including dosage, usage instructions, and purpose.

Health & Diet Recommendations:
Summarize any advice provided by the doctor regarding lifestyle, physical activity, nutrition, or sleep.

Diagnoses or Suspected Conditions:
Note any diagnoses confirmed or conditions the doctor suspects, including differential diagnoses if mentioned.

Tests and Diagnostic Procedures:
Include any lab tests, imaging, or diagnostic evaluations recommended by the doctor.

Next Steps or Follow-Up Instructions:
Outline the doctor’s plan for follow-up, such as appointments, monitoring, referrals, or additional actions.

Miscellaneous:
Include any other relevant details from the conversation not covered above, such as family history, emotional or social context, administrative notes, or additional comments.



Transcript (Date: ${today}):
${transcript}
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 700
    })
  });

  if (!response.ok) throw new Error(`Insight generation failed: ${response.statusText}`);
  const data = await response.json();
  return data.choices[0].message.content.trim();
}

async function transcribeAudioAndGenerateInsight(filePath, apiKey, options = {}) {
  const convertedPath = convertToMp3IfNeeded(filePath);
  const transcript = await transcribeAudioWithOpenAI(convertedPath, apiKey);
  if (options.mode === 'transcribeOnly') return transcript;

  const insight = await generateInsightsFromTranscript(transcript, apiKey);
  return { transcript, insight };
}

module.exports = {
  transcribeAudioAndGenerateInsight
};
