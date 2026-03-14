"""
AI Verify — Python AI Engine
FastAPI microservice for:
- Sentence similarity (cosine similarity via sentence-transformers)
- AI-generated content detection (HuggingFace RoBERTa)
"""

import os
import logging
from contextlib import asynccontextmanager
from typing import Optional

import torch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator

from models.similarity import SimilarityModel
from models.ai_detector import AIDetectorModel

# ─── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("ai-engine")

# ─── Global model instances ───────────────────────────────────────────────────
similarity_model: Optional[SimilarityModel] = None
ai_detector_model: Optional[AIDetectorModel] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load ML models at startup, release at shutdown."""
    global similarity_model, ai_detector_model

    logger.info("Loading AI models...")

    try:
        similarity_model = SimilarityModel()
        logger.info("✅ Similarity model loaded")
    except Exception as e:
        logger.error(f"Failed to load similarity model: {e}")
        similarity_model = None

    try:
        ai_detector_model = AIDetectorModel()
        logger.info("✅ AI detector model loaded")
    except Exception as e:
        logger.error(f"Failed to load AI detector model: {e}")
        ai_detector_model = None

    logger.info("🚀 AI Engine ready")
    yield

    # Cleanup
    logger.info("Shutting down AI Engine...")
    if torch.cuda.is_available():
        torch.cuda.empty_cache()


# ─── App ──────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="AI Verify — AI Engine",
    description="NLP microservice for plagiarism similarity and AI content detection",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


# ─── Schemas ──────────────────────────────────────────────────────────────────
class SimilarityRequest(BaseModel):
    query: str
    candidates: list[str]

    @validator("query")
    def query_not_empty(cls, v):
        if not v.strip():
            raise ValueError("query cannot be empty")
        return v.strip()[:500]  # Truncate to reasonable length

    @validator("candidates")
    def candidates_not_empty(cls, v):
        if not v:
            raise ValueError("candidates list cannot be empty")
        return [c[:500] for c in v[:20]]  # Max 20 candidates, each truncated


class AIDetectionRequest(BaseModel):
    text: str

    @validator("text")
    def text_not_empty(cls, v):
        if len(v.strip()) < 50:
            raise ValueError("text must be at least 50 characters")
        return v.strip()[:5000]


# ─── Routes ───────────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {
        "status": "ok",
        "models": {
            "similarity": similarity_model is not None,
            "ai_detector": ai_detector_model is not None,
        },
        "device": "cuda" if torch.cuda.is_available() else "cpu",
    }


@app.post("/similarity")
async def compute_similarity(req: SimilarityRequest):
    """
    Compute cosine similarity between a query sentence and candidate texts.
    Returns a list of similarity scores in [0, 1].
    """
    if similarity_model is None:
        raise HTTPException(503, "Similarity model not available")

    try:
        scores = similarity_model.compute(req.query, req.candidates)
        return {"scores": scores, "count": len(scores)}
    except Exception as e:
        logger.error(f"Similarity error: {e}")
        raise HTTPException(500, f"Similarity computation failed: {str(e)}")


@app.post("/detect-ai")
async def detect_ai_content(req: AIDetectionRequest):
    """
    Detect whether text is AI-generated.
    Returns probabilities for AI and human authorship.
    """
    if ai_detector_model is None:
        raise HTTPException(503, "AI detector model not available")

    try:
        result = ai_detector_model.predict(req.text)
        return result
    except Exception as e:
        logger.error(f"AI detection error: {e}")
        raise HTTPException(500, f"AI detection failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("ENV", "development") == "development",
        workers=1,  # Important: models are loaded once in memory
    )
