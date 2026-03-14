import logging
import re
from typing import Dict, Any

logger = logging.getLogger(__name__)

try:
    from transformers import pipeline
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False
    logger.warning("transformers not available, using statistical fallback")


class AIDetectorModel:
    def __init__(self):
        self.classifier = None
        self.model_name = None
        if TRANSFORMERS_AVAILABLE:
            self._load_model()

    def _load_model(self):
    models_to_try = []
        for model_name in models_to_try:
            try:
                logger.info(f"Loading AI detector: {model_name}")
                self.classifier = pipeline(
                    "text-classification",
                    model=model_name,
                    truncation=True,
                    max_length=512,
                )
                self.model_name = model_name
                logger.info(f"✅ AI detector loaded: {model_name}")
                return
            except Exception as e:
                logger.warning(f"Could not load {model_name}: {e}")
        logger.warning("No AI model loaded, using heuristics")

    def predict(self, text: str) -> Dict[str, Any]:
        if self.classifier:
            return self._model_predict(text)
        return self._heuristic_predict(text)

    def _model_predict(self, text: str) -> Dict[str, Any]:
        try:
            results = self.classifier(text[:3000], top_k=None)
            ai_prob = 0.5
            for r in results:
                label = r["label"].upper()
                if any(x in label for x in ["FAKE", "AI", "MACHINE", "LABEL_1", "CHATGPT"]):
                    ai_prob = r["score"]
                elif any(x in label for x in ["REAL", "HUMAN", "LABEL_0"]):
                    ai_prob = 1 - r["score"]
            return {
                "ai_probability": round(ai_prob, 4),
                "human_probability": round(1 - ai_prob, 4),
                "confidence": round(max(ai_prob, 1 - ai_prob), 4),
                "model": self.model_name,
                "details": {"raw_results": results},
            }
        except Exception as e:
            logger.error(f"Model prediction failed: {e}")
            return self._heuristic_predict(text)

    def _heuristic_predict(self, text: str) -> Dict[str, Any]:
        score = 0.0
        words = text.split()
        sentences = [s.strip() for s in re.split(r'[.!?]+', text) if s.strip()]

        if not sentences:
            return {"ai_probability": 0.5, "human_probability": 0.5,
                    "confidence": 0.3, "model": "heuristic", "details": {}}

        # Uniform sentence length
        if len(sentences) > 3:
            lengths = [len(s.split()) for s in sentences]
            avg = sum(lengths) / len(lengths)
            variance = sum((l - avg) ** 2 for l in lengths) / len(lengths)
            if variance < 15 and avg > 15:
                score += 0.15

        # AI phrases
        ai_phrases = [
            r"\bfurthermore\b", r"\bmoreover\b", r"\bin conclusion\b",
            r"\bto summarize\b", r"\bdelve into\b", r"\bin summary\b",
            r"\bnotably\b", r"\bin the realm of\b", r"\bit is worth noting\b",
            r"\bcomprehensive\b", r"\bfacilitate\b", r"\butilize\b",
            r"\bin today's world\b", r"\bit is important to\b",
        ]
        hits = sum(1 for p in ai_phrases if re.search(p, text.lower()))
        score += min(0.40, hits * 0.08)

        # No contractions
        contractions = re.findall(r"\b\w+'(t|ve|ll|re|d|s)\b", text.lower())
        if len(contractions) / max(len(words), 1) < 0.01 and len(words) > 50:
            score += 0.15

        # Low vocabulary diversity
        if words:
            unique_ratio = len(set(w.lower() for w in words)) / len(words)
            if unique_ratio < 0.55:
                score += 0.10

        # Very long sentences
        avg_sentence_len = sum(len(s.split()) for s in sentences) / max(len(sentences), 1)
        if avg_sentence_len > 25:
            score += 0.10

        score = min(score, 0.92)
        return {
            "ai_probability": round(score, 4),
            "human_probability": round(1 - score, 4),
            "confidence": 0.6,
            "model": "heuristic-v2",
            "details": {"ai_phrases_found": hits},
        }