# 🏥 AI-Powered Medical Documentation Platform

An intelligent and secure platform for doctors to manage and document patient interactions using AI. This system allows recording of doctor-patient conversations, generates clinical insights using LLMs, and supports uploading and viewing medical documents like blood and sugar reports. It also provides manual and voice-based patient search features.

---

## 🚀 Features

### 🎙️ Conversation Recording & Insight Generation
- Securely record doctor-patient conversations.
- Transcribe recordings using Whisper or similar speech-to-text model.
- Generate clinical summaries and insights using Large Language Models (LLMs) like OpenAI's GPT.

### 📄 Medical Document Upload & Viewing
- Upload medical reports such as blood reports, sugar tests, prescriptions, etc.
- View uploaded documents within the patient's profile.
- Supported formats: PDF, JPEG, PNG, etc.

### 👩‍⚕️ Patient Management
- Add, edit, and manage patient records.
- View full interaction and documentation history per patient.

### 🔍 Smart Patient Search
- **Manual Search**: Search patients by name, ID, or health condition.
- **Voice Search**: Use voice input to locate a patient quickly via speech recognition.

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Tailwind CSS
- React Router
- Axios

### Backend
- Node.js
- Express.js
- MongoDB (via Mongoose)
- Multer for file upload

### AI Services
- OpenAI GPT (for insight generation)
- OpenAI Whisper or SpeechRecognition API (for voice transcription)

### Storage
- AWS S3 / Firebase Storage for audio and document files

---

## 📦 Installation Guide

### Prerequisites
- Node.js and npm
- MongoDB Atlas or local instance
- OpenAI API Key
- AWS or Firebase credentials for storage

---

### Clone the Repository

```bash
git clone https://github.com/your-org/ai-medical-docs.git
cd ai-medical-docs
