# InterviewIQ (TalentIQ) - Full-Stack AI Interview Platform

InterviewIQ is an advanced AI-powered mock interview and technical evaluation platform. It conducts personalized live technical, behavioral, and system design interviews, evaluates spoken and written answers in real time, generates 6-axis performance radar charts and workmap scores, and provides comprehensive post-interview feedback reports.

---

## Architecture & Technology Stack

```
InterviewIQ/
├── frontend/             # React 19 + Vite + Tailwind CSS + Lucide + Web Speech API
├── backend/              # Node.js + Express REST APIs + Socket.IO + JWT + Multer
├── ai-service/           # Python + FastAPI + Pydantic + LLM Evaluation Engine
├── docker-compose.yml    # Complete container orchestration (Postgres, Redis, Backend, AI, Frontend)
├── .gitignore
└── README.md
```

### Stack Breakdown
- **Frontend**: React 19, Vite, Tailwind CSS, Lucide React, Web Speech API (Speech-to-Text & Text-to-Speech)
- **Backend**: Node.js, Express, TypeScript, Socket.IO (Live Room Events), JWT & bcryptjs, Multer & pdf-parse (Resume Parsing), Zod (Validation), BullMQ & Job Queues
- **AI Service**: Python 3.13, FastAPI, Uvicorn, Pydantic, Gemini/OpenAI API integrations with deterministic heuristic fallback
- **Data & Cache**: PostgreSQL / SQLite, Prisma ORM, Redis
- **Containerization**: Docker Compose

---

## Key Features

1. **Four Workflow Tracks**:
   - **Student / Candidate**: Builds profile, uploads resume (PDF/DOCX) with automatic skill extraction, selects target company & role.
   - **AI Interviewer**: Conducts adaptive technical, behavioral, or system design mock interviews with audio speech synthesis and speech-to-text.
   - **Evaluation Engine**: Scores answers in real time, analyzes trade-offs, generates dynamic follow-up questions, and compiles 6-axis radar metrics.
   - **Analytics Dashboard**: Tracks interview history, accuracy rates, average score, practice hours, and actionable recommendations.

2. **Real-Time Video Call Experience**:
   - Live AI interviewer avatar with audio wave animation and speaking indicator.
   - Candidate webcam preview with audio/video controls.
   - Subtitle transcript bar: *"Conversation now: [live speech subtitle]"*.
   - Built-in sandboxed code editor with test execution output for coding questions.
   - Multi-axis Radar Chart: Professionalism, Attitude, Creativity, Communication, Leadership, Teamwork.
   - Workmap Breakdown: Presentation, Opportunistic, Business Acumen, Closing Technique.

---

## Quickstart Guide

### Option 1: Run Services Locally

#### 1. Backend (Node.js & Express)
```bash
cd backend
npm install
npm run dev
```
Backend will start on `http://localhost:5000`. Health check: `http://localhost:5000/health`.

#### 2. AI Service (Python & FastAPI)
```bash
cd ai-service
pip install -r requirements.txt
python main.py
```
FastAPI AI Service will start on `http://localhost:8000`. Interactive docs: `http://localhost:8000/docs`.

#### 3. Frontend (React & Vite)
```bash
cd frontend
npm install
npm run dev
```
Frontend will be accessible at `http://localhost:5173`.

---

### Option 2: Run with Docker Compose
To launch the entire platform (PostgreSQL, Redis, AI Service, Backend, and Frontend):
```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- AI Service: `http://localhost:8000`

---

## API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT token |
| `GET` | `/api/users/profile` | Get candidate profile, skills, and target role |
| `PUT` | `/api/users/profile` | Update profile and skills list |
| `POST` | `/api/resumes/upload` | Upload resume file (PDF/DOCX), parse text & detect skills |
| `GET` | `/api/resumes/latest` | Retrieve latest uploaded resume |
| `POST` | `/api/interviews` | Create an interview session |
| `GET` | `/api/interviews` | List all historical interviews for current user |
| `GET` | `/api/interviews/:id` | Get interview details, questions, answers, and evaluation |
| `POST` | `/api/interviews/:id/start` | Start live interview session & generate questions |
| `POST` | `/api/interviews/:id/answer` | Submit candidate answer, evaluate score & get follow-up |
| `GET` | `/api/interviews/:id/report` | Get synthesized final evaluation report |
| `GET` | `/api/analytics/dashboard` | Get high-level candidate metrics (28 interviews, 8.5/10, etc.) |

---

## Default Demo Credentials
- **Email**: `john@interviewiq.com`
- **Password**: `password123`
*(Pre-seeded with John Doe's full history, resume, and 28 interview analytics)*

---

## License
MIT License. Built for full-stack engineering interview excellence.

