/**
 * AI Content Detection Route
 * Proxies to Python AI engine for HuggingFace inference
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { detectAIContent } = require('../services/aiDetector');
const { checkRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// ─── POST /api/detect-ai ───────────────────────────────────────────────────────
router.post(
  '/',
  checkRateLimiter,
  [
    body('text')
      .trim()
      .isLength({ min: 100, max: 50000 })
      .withMessage('Text must be 100–50,000 characters for AI detection'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const result = await detectAIContent(req.body.text);

      return res.json({
        success: true,
        data: {
          aiScore: result.aiScore,
          humanScore: result.humanScore,
          confidence: result.confidence,
          modelUsed: result.modelUsed,
          verdict: result.aiScore > 70 ? 'AI_GENERATED' : result.aiScore > 40 ? 'MIXED' : 'HUMAN_WRITTEN',
          details: result.details || null,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
