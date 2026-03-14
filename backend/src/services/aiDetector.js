/**
 * AI Content Detection Service
 * Calls Python AI engine for HuggingFace-based detection
 */

const axios = require('axios');
const { logger } = require('../utils/logger');

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

/**
 * Detect whether text was AI-generated
 * @param {string} text - Text to analyze
 * @returns {Promise<{aiScore, humanScore, confidence, modelUsed, details}>}
 */
async function detectAIContent(text) {
  try {
    const response = await axios.post(
      `${AI_ENGINE_URL}/detect-ai`,
      { text: text.slice(0, 5000) }, // Model max input
      { timeout: 30000 }
    );

    return {
      aiScore: response.data.ai_probability * 100,
      humanScore: response.data.human_probability * 100,
      confidence: response.data.confidence,
      modelUsed: response.data.model,
      details: response.data.details || null,
    };
  } catch (err) {
    logger.warn(`AI detection failed, using fallback: ${err.message}`);

    // Fallback: statistical heuristics
    return fallbackDetection(text);
  }
}

/**
 * Statistical fallback when AI engine is unavailable
 * Based on known patterns of AI-generated text
 */
function fallbackDetection(text) {
  let aiScore = 0;
  const words = text.split(/\s+/);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

  // Heuristic 1: Average sentence length (AI tends to be more uniform)
  const avgLen = words.length / Math.max(sentences.length, 1);
  if (avgLen > 20 && avgLen < 35) aiScore += 15;

  // Heuristic 2: Vocabulary diversity
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  const diversity = uniqueWords.size / words.length;
  if (diversity < 0.6) aiScore += 10;

  // Heuristic 3: Common AI phrases
  const aiPhrases = [
    'it is important to note', 'in conclusion', 'furthermore',
    'it is worth noting', 'this is a', 'in summary', 'to summarize',
    'it is essential', 'in today\'s world', 'as an ai language model',
  ];
  const textLower = text.toLowerCase();
  const phraseCount = aiPhrases.filter(p => textLower.includes(p)).length;
  aiScore += phraseCount * 8;

  // Cap at 85 for fallback (we can't be certain without the model)
  aiScore = Math.min(aiScore, 85);
  const humanScore = 100 - aiScore;

  return {
    aiScore,
    humanScore,
    confidence: 0.5, // Low confidence since it's a fallback
    modelUsed: 'heuristic-fallback',
    details: { note: 'Statistical estimation — AI engine unavailable' },
  };
}

module.exports = { detectAIContent };
