# AI Verify — Plagiarism & AI Content Detection Platform

> Production-ready plagiarism detection with AI-generated content analysis, source discovery, and downloadable PDF reports.

![AI Verify](https://img.shields.io/badge/AI%20Verify-v1.0.0-blue)
![Node](https://img.shields.io/badge/Node-20+-green)
![Python](https://img.shields.io/badge/Python-3.10+-yellow)
![License](https://img.shields.io/badge/license-MIT-purple)

---

## Architecture Overview

```
ai-verify/
├── frontend/        # Next.js 14 + TailwindCSS (Vercel)
├── backend/         # Node.js + Express REST API (Render/AWS)
├── ai-engine/       # Python FastAPI NLP microservice (Render/AWS)
├── docker/          # Docker Compose for local dev
└── docs/            # API docs, diagrams
```

---

## Quick Start (Local)

### Prerequisites
- Node.js 20+
- Python 3.10+
- PostgreSQL 15+
- Redis (optional, for rate limiting)

### 1. Clone & Setup Environment

```bash
git clone https://github.com/yourorg/ai-verify
cd ai-verify

# Copy all env files
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
cp ai-engine/.env.example ai-engine/.env
```

### 2. Start with Docker (Recommended)

```bash
cd docker
docker-compose up --build
```

Services:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- AI Engine: http://localhost:8000
- PostgreSQL: localhost:5432

### 3. Manual Start

**Backend:**
```bash
cd backend
npm install
npm run db:migrate
npm run dev
```

**AI Engine:**
```bash
cd ai-engine
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_NAME=AI Verify
```

### Backend (`backend/.env`)
```env
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/aiverify
AI_ENGINE_URL=http://localhost:8000
BING_SEARCH_API_KEY=your_bing_key_here
BING_SEARCH_ENDPOINT=https://api.bing.microsoft.com/v7.0/search
JWT_SECRET=your_jwt_secret_here
UPLOAD_MAX_SIZE_MB=10
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
REDIS_URL=redis://localhost:6379
```

### AI Engine (`ai-engine/.env`)
```env
MODEL_NAME=roberta-base-openai-detector
SIMILARITY_THRESHOLD=0.70
MAX_TEXT_LENGTH=50000
```

---

## API Reference

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/upload` | Upload file (PDF/DOCX/TXT) |
| POST | `/api/check-plagiarism` | Run plagiarism check |
| POST | `/api/detect-ai` | Detect AI-generated content |
| GET | `/api/report/:id` | Get report by ID |
| GET | `/api/report/:id/pdf` | Download PDF report |
| GET | `/api/health` | Health check |

---

## Deployment

### Frontend → Vercel
```bash
cd frontend
npx vercel --prod
```
Set env vars in Vercel dashboard.

### Backend + AI Engine → Render
1. Create two Web Services on render.com
2. Backend: `npm start` (Node)
3. AI Engine: `uvicorn main:app --host 0.0.0.0 --port $PORT` (Python)

### Backend + AI Engine → AWS (ECS)
```bash
# Build and push Docker images
docker build -t ai-verify-backend ./backend
docker build -t ai-verify-ai-engine ./ai-engine
# Push to ECR, deploy via ECS or App Runner
```

---

## Features

- ✅ PDF, DOCX, TXT file upload with drag & drop
- ✅ Real-time plagiarism detection via web search
- ✅ Sentence-level similarity scoring (cosine similarity)
- ✅ Plagiarized sentences highlighted in red
- ✅ Source links with side-by-side comparison
- ✅ AI-generated content probability (Human vs AI %)
- ✅ Downloadable PDF report
- ✅ Rate limiting & input sanitization
- ✅ PostgreSQL report storage

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TailwindCSS, Framer Motion |
| Backend | Node.js, Express, Multer, pdf-parse, mammoth |
| AI Engine | FastAPI, sentence-transformers, HuggingFace |
| Database | PostgreSQL + Prisma ORM |
| Cache | Redis |
| PDF Reports | Puppeteer |
| Containerization | Docker + Compose |
