# AI Interview Coach - Interactive Voice Simulation

A premium interactive mock interview web application that parses candidate resumes, generates tailored behavioral & technical questions, conducts real-time speech-to-text practice sessions with a simulated AI interviewer, and yields detailed STAR-method feedback metrics.

---

## 🌟 Key Features

1. **OCR Resume Parser:** Supports uploading PDF resumes to parse candidate names, email, professional experience, and technical skills using structured LLM analysis.
2. **Dynamic 10-Question generator:** Generates exactly 10 customized questions matching the candidate's background across Technical (4), Project-specific (3), and Behavioral (3) areas.
3. **Interviewer Persona & Tone:** Calibrates standard technical, FAANG design lead, startup CTO, or strict live proctor interview styles.
4. **Vocal Auditory Practice (TTS):** Converts questions to natural spoken speech via ElevenLabs API (with smart caching to save quota characters).
5. **Real-time Voice Transcription (STT):** Captures spoken answers natively inside the browser via the free Web Speech Recognition API.
6. **Time Pressure Ring Timer:** Configurable 120-second circular timer per question simulating realistic interview constraints.
7. **STAR Method Evaluation:** Multi-dimensional score breakdown (Clarity, Technical depth, STAR Structure compliance) with detailed feedback.
8. **Final Session Analytics & Report:** Aggregated session charts, readiness indicators, and downloadable Markdown briefing reports.
9. **Cyberpunk Theme Engine:** Supports Light, Dark (Neon Cyberpunk), and System modes.

---

## 🏗️ Architecture

- **Frontend:** React 19 + Framer Motion (Transitions) + Three.js (3D Neural Particles Background).
- **Backend:** FastAPI (Python 3.10+) + SQLAlchemy + PostgreSQL (auto-fallback to SQLite locally).
- **AI Models:** Groq Cloud (`llama-3.3-70b-versatile` / `gemma2-9b-it`) or local self-hosted models (via Ollama).

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your Groq API key and ElevenLabs credentials

# Run development server
python -m uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
cd frontend
# Install dependencies
npm install

# Run development server
npm run dev
```

---

## 📝 Keyboard Shortcuts

- `Space` — Start/stop voice answer recording.
- `Enter` — Submit answer for STAR evaluation.
- `Arrow Left` / `Arrow Right` — Step through questions.
- `Escape` — Stop audio playback.
