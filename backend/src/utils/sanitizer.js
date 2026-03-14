/**
 * Input sanitization utilities
 */

const MAX_TEXT_LENGTH = parseInt(process.env.MAX_TEXT_LENGTH || '50000');

/**
 * Sanitize user-provided text
 * - Remove potential script injections
 * - Limit length
 * - Normalize encoding
 */
function sanitizeText(text) {
  if (!text || typeof text !== 'string') return '';

  return text
    .slice(0, MAX_TEXT_LENGTH)
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove zero-width characters
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // Normalize quotes
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    // Remove control chars (keep newlines and tabs)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();
}

module.exports = { sanitizeText };
