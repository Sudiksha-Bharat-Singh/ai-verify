/**
 * Plagiarism Detection Route
 * Orchestrates sentence-level web search + similarity scoring
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const { detectPlagiarism } = require('../services/plagiarismDetector');
const { detectAIContent } = require('../services/aiDetector');
const { saveReport } = require('../services/reportService');
const { logger } = require('../utils/logger');
const { checkRateLimiter } = require('../middleware/rateLimiter');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'aiverify-secret-key';

const router = express.Router();

// ─── POST /api/check-plagiarism ────────────────────────────────────────────────
router.post(
  '/',
  checkRateLimiter,
  [
    body('text')
      .trim()
      .isLength({ min: 50, max: 50000 })
      .withMessage('Text must be 50–50,000 characters'),
    body('fileName').optional().isString().trim().escape(),
    body('inputType').optional().isIn(['TEXT', 'FILE']),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { text, fileName, inputType = 'TEXT' } = req.body;

// Get userId from token if logged in
let userId = null;
try {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    const decoded = jwt.verify(token, JWT_SECRET);
    userId = decoded.userId;
  }
} catch (e) {}
    const reportId = uuidv4();

    logger.info(`Starting plagiarism check [${reportId}] — ${text.length} chars`);

    try {
      // Run plagiarism detection and AI detection in parallel
      const [plagiarismResult, aiResult] = await Promise.all([
        detectPlagiarism(text, reportId),
        detectAIContent(text),
      ]);

      // Build complete report
      const report = {
  id: reportId,
  userId: userId,
        fileName: fileName || null,
        inputType,
        originalText: text,
        plagiarismScore: plagiarismResult.overallScore,
        sentences: plagiarismResult.sentences,
        sources: plagiarismResult.sources,
        aiScore: aiResult.aiScore,
        humanScore: aiResult.humanScore,
        aiModelUsed: aiResult.modelUsed,
        status: 'COMPLETED',
      };

      // Persist to database
      await saveReport(report);

      logger.info(`Report completed [${reportId}] — Plagiarism: ${report.plagiarismScore.toFixed(1)}%, AI: ${report.aiScore.toFixed(1)}%`);

      return res.json({
        success: true,
        data: {
          reportId,
          plagiarismScore: report.plagiarismScore,
          sentences: report.sentences,
          sources: report.sources,
          aiScore: report.aiScore,
          humanScore: report.humanScore,
          summary: buildSummary(report),
        },
      });
    } catch (err) {
      logger.error(`Plagiarism check failed [${reportId}]:`, err);
      next(err);
    }
  }
);

/**
 * Build a human-readable summary object
 */
function buildSummary(report) {
  const plagiarizedSentences = report.sentences.filter(s => s.isPlagiarized).length;
  const totalSentences = report.sentences.length;

  return {
    totalSentences,
    plagiarizedSentences,
    uniqueSentences: totalSentences - plagiarizedSentences,
    plagiarismRisk: getRiskLevel(report.plagiarismScore),
    aiContentRisk: getRiskLevel(report.aiScore),
    topSources: report.sources.slice(0, 5).map(s => ({
      url: s.url,
      title: s.title,
      matchCount: s.matchCount,
    })),
  };
}

function getRiskLevel(score) {
  if (score >= 70) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  if (score >= 20) return 'LOW';
  return 'MINIMAL';
}

module.exports = router;
