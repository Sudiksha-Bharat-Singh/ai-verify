/**
 * Rate Limiting Middleware
 * Protects API endpoints from abuse
 */

const rateLimit = require('express-rate-limit');

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 min
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');

const defaultOptions = {
  windowMs,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil(windowMs / 1000),
    });
  },
};

// Global: 100 requests per 15 minutes
const globalRateLimiter = rateLimit({
  ...defaultOptions,
  max: maxRequests,
});

// Upload: 20 uploads per 15 minutes
const uploadRateLimiter = rateLimit({
  ...defaultOptions,
  max: 20,
  message: 'Too many uploads. Maximum 20 uploads per 15 minutes.',
});

// Check: 30 plagiarism checks per 15 minutes
const checkRateLimiter = rateLimit({
  ...defaultOptions,
  max: 30,
});

module.exports = { globalRateLimiter, uploadRateLimiter, checkRateLimiter };
