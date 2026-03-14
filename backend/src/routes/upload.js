/**
 * Upload Route
 * Handles PDF, DOCX, TXT file uploads and text extraction
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');

const { extractText } = require('../services/textExtractor');
const { sanitizeText } = require('../utils/sanitizer');
const { logger } = require('../utils/logger');
const { uploadRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// ─── Multer Configuration ──────────────────────────────────────────────────────
const MAX_SIZE_MB = parseInt(process.env.UPLOAD_MAX_SIZE_MB || '10');
const ALLOWED_MIMES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];
const ALLOWED_EXTS = ['.pdf', '.docx', '.txt'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_MIMES.includes(file.mimetype) || !ALLOWED_EXTS.includes(ext)) {
    return cb(new Error(`Only PDF, DOCX, and TXT files are allowed. Got: ${file.mimetype}`), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_SIZE_MB * 1024 * 1024,
    files: 1,
  },
});

// ─── POST /api/upload ──────────────────────────────────────────────────────────
/**
 * Upload a file and extract its text content
 * Returns extracted text for plagiarism checking
 */
router.post('/', uploadRateLimiter, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded. Please provide a PDF, DOCX, or TXT file.',
      });
    }

    logger.info(`File uploaded: ${req.file.filename} (${req.file.size} bytes)`);

    // Extract text from uploaded file
    const extractedText = await extractText(req.file.path, req.file.mimetype);

    if (!extractedText || extractedText.trim().length < 50) {
      return res.status(422).json({
        success: false,
        error: 'Could not extract meaningful text from the uploaded file. Please check the file content.',
      });
    }

    const sanitized = sanitizeText(extractedText);

    return res.json({
      success: true,
      data: {
        fileId: req.file.filename,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        extractedText: sanitized,
        wordCount: sanitized.split(/\s+/).filter(Boolean).length,
        charCount: sanitized.length,
      },
    });
  } catch (err) {
    logger.error('Upload error:', err);
    next(err);
  }
});

// ─── POST /api/upload/text ─────────────────────────────────────────────────────
/**
 * Accept raw pasted text
 */
router.post(
  '/text',
  uploadRateLimiter,
  [
    body('text')
      .trim()
      .isLength({ min: 50, max: 50000 })
      .withMessage('Text must be between 50 and 50,000 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const sanitized = sanitizeText(req.body.text);

    return res.json({
      success: true,
      data: {
        fileId: null,
        originalName: null,
        extractedText: sanitized,
        wordCount: sanitized.split(/\s+/).filter(Boolean).length,
        charCount: sanitized.length,
      },
    });
  }
);

// Handle multer errors
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        error: `File too large. Maximum size is ${MAX_SIZE_MB}MB.`,
      });
    }
    return res.status(400).json({ success: false, error: err.message });
  }
  if (err.message?.includes('Only PDF')) {
    return res.status(415).json({ success: false, error: err.message });
  }
  next(err);
});

module.exports = router;
