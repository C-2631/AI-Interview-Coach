# 🚀 AI Interview Coach • Real-Time STAR & Voice Practice Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React_18%2F19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python_3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![ElevenLabs](https://img.shields.io/badge/ElevenLabs_AI_Voice-FF3366?style=for-the-badge&logo=elevenlabs&logoColor=white)](https://elevenlabs.io/)

A state-of-the-art, full-stack **AI Interview Practicum Platform** designed to prepare candidates for rigorous technical and behavioral interviews. By blending **OCR Resume Parsing**, **Dynamic STAR/Technical Question Generation**, **Interactive 3D Graphics**, **Real-Time Speech-to-Text (STT)**, and **HD Voice Synthesis (TTS)** with a **Triple-Tier Cascading Failover Engine**, this platform delivers an authentic, high-pressure interview experience with zero downtime.

---

## 🏗️ End-to-End Workflow

```
[Candidate PDF Resume Upload] 
         │
         ▼
[Backend: pypdf + LLM OCR Extraction] 
  ├── Candidate Name, Email, & Skills Matrix
  └── Experience & Project History Mapping
         │
         ▼
[Dynamic 10-Question Synthesizer]
  ├── 4 Technical Questions (Easy/Medium/Hard)
  ├── 3 Project-Specific Architectural Questions
  └── 3 Behavioral STAR & Conflict-Resolution Questions
         │
         ▼
[Interactive 3D Voice Practicum (`App.jsx`)]
  ├── 🔊 HD Voice Playback (ElevenLabs / Browser Speech API)
  ├── 🎙️ Native Web Speech STT Capture (with Auto-Restart)
  ├── ⏱️ Circular Time Pressure Timer (Freezes on Pause/Resume)
  └── 🛡️ Anti-Cheat Safeguards (Copy/Paste & Large Insertion Blocker)
         │
         ▼
[Multi-Dimensional Evaluation Engine]
  ├── Clarity Score (1-10) | Technical Depth (1-10) | STAR Structure (1-10)
  ├── Strengths & Actionable Improvements
  └── 🌟 10/10 Perfect Model Answer Benchmark Reference
         │
         ▼
[Executive Evaluation Dashboard & Report]
  ├── Overall Readiness Level Indicator & Charts
  ├── Download Markdown Coaching Brief (`.md`)
  └── Export Styled Print-Ready PDF (`handleExportPDF`)
```

---

## 🛠️ Comprehensive Tech Stack & Libraries

### 🎨 Frontend Architecture (`/frontend`)
| Technology / Library | Role & Purpose |
| :--- | :--- |
| **React 18 / 19** (`react`, `react-dom`) | Component-driven UI architecture, state management (`useState`, `useRef`, `useMemo`, `useEffect`). |
| **Vite** (`vite`, `@vitejs/plugin-react`) | Next-generation frontend bundler providing lightning-fast HMR and optimized production build (`467ms`). |
| **Three.js & React Three Fiber** (`three`, `@react-three/fiber`) | Renders an interactive, GPU-accelerated 3D background featuring dynamic rotating Neural Spheres and glowing Wave Grids connected to user mouse movements. |
| **Framer Motion** (`framer-motion`) | Fluid animations, layout transitions (`AnimatePresence`), step navigation, and smooth modal entrances. |
| **Tailwind CSS v4** (`tailwindcss`, `@tailwindcss/vite`) | Utility-first, responsive styling system featuring custom gradients, glassmorphism, and dark/light system theme synchronization. |
| **Lucide React Icons** (`lucide-react`) | Lightweight, clean vector icons for navigation, status badges, timers, audio controls, and PDF export buttons. |
| **Web Speech API** (`SpeechRecognition` & `SpeechSynthesisUtterance`) | Zero-latency, browser-native speech-to-text (STT) voice capture and fallback text-to-speech (TTS) voice synthesis. |

---

### ⚙️ Backend Architecture (`/backend`)
| Technology / Library | Role & Purpose |
| :--- | :--- |
| **FastAPI** (`fastapi`) | High-performance asynchronous Python web framework for REST endpoints (`/api/sessions`, `/api/tts`, `/api/sessions/{id}/analytics`) and WebSocket connections (`/ws`). |
| **Uvicorn** (`uvicorn`) | Lightning-fast ASGI web server implementation. |
| **Pydantic v2** (`pydantic`) | Strict data validation, schema serialization (`SessionCreate`, `AnswerSubmit`, `QuestionEvaluation`), and settings management (`BaseSettings`). |
| **SQLAlchemy & SQLite/PostgreSQL** (`sqlalchemy`, `aiofiles`) | ORM data persistence layer with indexed foreign keys (`session_id`, `question_id`) tracking candidates, questions, transcripts, and `model_answer` benchmarks. |
| **HTTPX Async Client** (`httpx`) | Non-blocking HTTP calls with rate-limit retries and exponential backoff connecting to external LLM and TTS APIs. |
| **PyPDF** (`pypdf`) | Binary PDF parsing engine extracting text from candidate resumes before LLM OCR structured extraction. |
| **OpenRouter & Groq APIs** | Cloud AI inference engines (`llama-3.3-70b-versatile`, `gemma-4-31b-it:free`) synthesizing customized interview questions and real-time STAR feedback. |
| **ElevenLabs Voice API** (`xi-api-key`) | Natural, human-like voice synthesis converting question prompts into professional spoken speech, backed by in-memory byte caching. |

---

## 🏆 Key Innovations & Engineering Highlights

### 1. 🛡️ Triple-Tier Cascading Failover & Self-Healing Engine (`llm.py` & `App.jsx`)
To guarantee **100% uptime during live production demos** without crashing or freezing if API quotas (`429 / 401 / 402`) are exhausted:
- **AI / LLM Tiering**: The backend cascades sequentially from **Primary Custom LLM (`Groq`)** $\rightarrow$ **Backup OpenRouter (`Gemma`)** $\rightarrow$ **High-Fidelity Offline Production Benchmark Engine**. Even with zero external API keys, the application generates all 10 customized questions and evaluates answers with realistic scores and **10/10 Perfect Model Answers**.
- **Voice / TTS Tiering**: Voice playback cascades from **In-Memory Audio Cache** $\rightarrow$ **ElevenLabs Cloud API (`/api/tts`)** $\rightarrow$ **Browser HD Voice (`SpeechSynthesisUtterance`)**. If ElevenLabs credits run out, the browser instantly speaks the question using native high-clarity voice.

### 2. 🎙️ High-Sensitivity Microphone & Auto-Restart Loop
Traditional Web Speech API recognition stops unexpectedly when a candidate pauses or speaks softly (`onend`). We introduced an `isRecordingRef` tracking hook that catches premature dropouts and **instantly auto-restarts the listening engine** (`recognition.start()`), ensuring low-volume speech or deliberate pauses are never cut off.

### 3. 🚫 Anti-Cheat & Authentic Practice Enforcement
To prevent candidates from copying pre-generated answers from ChatGPT or external tools:
- **`onPaste` Event Blocker**: Intercepts and blocks paste attempts inside the answer `textarea`, showing an immediate warning toast.
- **Large Block Insertion Guard**: Detects instantaneous character jumps (`diff > 80 chars`) during typing, alerting candidates that authentic practice requires original articulation.

### 4. ⏱️ Timer Freeze & Resume Architecture
The circular countdown timer (`TimerRing.jsx`) binds to the active `resetKey` (`questionId`). When a candidate toggles voice recording off to pause and think, the timer **freezes right where it left off** (e.g., `45s`) and resumes smoothly without resetting back to 120 seconds.

### 5. 📑 Professional 10/10 Benchmark PDF Generator
Instead of relying on heavy external PDF binaries, `handleExportPDF()` generates a dedicated print-ready DOM window featuring exact color adjustments (`print-color-adjust: exact`), A4 pagination (`@page`), candidate readiness scorecards, question-by-question multi-dimensional score badges, and highlighted gold boxes for every **🌟 10/10 Perfect Model Answer**, automatically calling `window.print()` for instant high-fidelity PDF export.

---

## 💻 Local Setup & Development Guide

### 1. Clone & Setup Backend (FastAPI)
```powershell
# Navigate into backend directory
cd backend

# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate  # On macOS/Linux: source .venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Configure environment variables
copy .env.example .env
# Edit .env and insert your API keys (optional: platform runs with zero keys via failover!)

# Launch FastAPI ASGI server
python -m uvicorn app.main:app --reload --port 8000
```

### 2. Setup Frontend (React + Vite)
```powershell
# Open a new terminal and navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Launch Vite development server
npm run dev
```

Visit `http://localhost:3000` (`Vite` dev server) or `http://localhost:8000/docs` (FastAPI Swagger Interactive API Documentation).

---

## ⌨️ Keyboard Navigation & Shortcuts

| Key | Action |
| :--- | :--- |
| **`Space`** | Start / Stop voice recording using the browser microphone. |
| **`Enter`** | Submit the current transcribed answer for real-time STAR evaluation. |
| **`Arrow Left` / `Arrow Right`** | Navigate backward or forward through the 10 practice questions. |
| **`Escape`** | Stop / Silence active text-to-speech audio playback immediately. |

---

## 🧪 Build & Verification Commands

| Component | Command | Output Status |
| :--- | :--- | :--- |
| **Backend Syntax Check** | `python -m py_compile backend/app/api/endpoints.py` | ✅ Clean Compilation (0 Errors) |
| **Frontend Production Build** | `cd frontend && npm run build` | ✅ Built 2,192 modules in `467ms` (`dist/` ready) |

---

## 🌐 Production Deployment Guide

1. **Backend Deployment (Render / Railway)**:
   - Create a Web Service pointing to the `/backend` folder.
   - Set Build Command: `pip install -r requirements.txt`
   - Set Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Add environment variables (`OPENROUTER_API_KEY`, `ELEVENLABS_API_KEY`, `ALLOWED_ORIGINS`).

2. **Frontend Deployment (Vercel / Netlify)**:
   - Create a Vite project pointing to the `/frontend` folder.
   - Set Environment Variable `VITE_API_URL` = `https://your-backend.onrender.com`.
   - Click Deploy. Your Vite client will automatically route all API requests and WebSocket streams to your live cloud backend!

---
*Built with ❤️ for candidate success and engineering excellence.*
