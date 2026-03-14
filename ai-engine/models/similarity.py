"""
Sentence Similarity Model
Uses sentence-transformers to compute cosine similarity
between a query sentence and candidate texts.
"""

import logging
import numpy as np
from typing import List

logger = logging.getLogger(__name__)

# Try to import sentence-transformers
try:
    from sentence_transformers import SentenceTransformer
    import torch
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False
    logger.warning("sentence-transformers not available, using TF-IDF fallback")


MODEL_NAME = "all-MiniLM-L6-v2"  # Fast, accurate, 80MB


class SimilarityModel:
    """
    Sentence-level cosine similarity using sentence-transformers.
    Falls back to TF-IDF when transformers are unavailable.
    """

    def __init__(self):
        if TRANSFORMERS_AVAILABLE:
            logger.info(f"Loading sentence transformer: {MODEL_NAME}")
            self.model = SentenceTransformer(MODEL_NAME)
            self.mode = "transformer"
            logger.info("Sentence transformer loaded successfully")
        else:
            self._init_tfidf_fallback()
            self.mode = "tfidf"

    def _init_tfidf_fallback(self):
        """Initialize TF-IDF vectorizer as fallback."""
        try:
            from sklearn.feature_extraction.text import TfidfVectorizer
            from sklearn.metrics.pairwise import cosine_similarity as sk_cosine
            self.vectorizer = TfidfVectorizer(
                ngram_range=(1, 2),
                max_features=10000,
                stop_words='english',
            )
            self._cosine = sk_cosine
            logger.info("TF-IDF fallback initialized")
        except ImportError:
            self.mode = "keyword"

    def compute(self, query: str, candidates: List[str]) -> List[float]:
        """
        Compute similarity scores between query and each candidate.
        Returns list of floats in [0, 1].
        """
        if not candidates:
            return []

        if self.mode == "transformer":
            return self._transformer_similarity(query, candidates)
        elif self.mode == "tfidf":
            return self._tfidf_similarity(query, candidates)
        else:
            return self._keyword_similarity(query, candidates)

    def _transformer_similarity(self, query: str, candidates: List[str]) -> List[float]:
        """Compute embeddings and cosine similarity."""
        all_texts = [query] + candidates
        embeddings = self.model.encode(all_texts, convert_to_tensor=True, show_progress_bar=False)

        query_emb = embeddings[0]
        candidate_embs = embeddings[1:]

        # Cosine similarity
        scores = []
        for cand_emb in candidate_embs:
            cos_sim = float(
                torch.nn.functional.cosine_similarity(
                    query_emb.unsqueeze(0),
                    cand_emb.unsqueeze(0)
                ).item()
            )
            scores.append(max(0.0, min(1.0, cos_sim)))  # Clamp to [0, 1]

        return scores

    def _tfidf_similarity(self, query: str, candidates: List[str]) -> List[float]:
        """TF-IDF based cosine similarity."""
        all_texts = [query] + candidates
        try:
            matrix = self.vectorizer.fit_transform(all_texts)
            similarities = self._cosine(matrix[0:1], matrix[1:]).flatten()
            return [float(s) for s in similarities]
        except Exception as e:
            logger.error(f"TF-IDF similarity error: {e}")
            return self._keyword_similarity(query, candidates)

    def _keyword_similarity(self, query: str, candidates: List[str]) -> List[float]:
        """Simple keyword overlap fallback."""
        query_words = set(query.lower().split())
        scores = []
        for cand in candidates:
            cand_words = set(cand.lower().split())
            if not query_words:
                scores.append(0.0)
            else:
                intersection = query_words & cand_words
                score = len(intersection) / len(query_words)
                scores.append(min(1.0, score))
        return scores
