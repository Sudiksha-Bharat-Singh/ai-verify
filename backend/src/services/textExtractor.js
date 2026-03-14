/**
 * Text Extractor Service
 * Extracts plain text from PDF, DOCX, and TXT files
 */

const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { logger } = require('../utils/logger');

/**
 * Extract text from a file based on its MIME type
 * @param {string} filePath - Absolute path to the file
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<string>} Extracted plain text
 */
async function extractText(filePath, mimeType) {
  logger.info(`Extracting text from: ${path.basename(filePath)} [${mimeType}]`);

  const ext = path.extname(filePath).toLowerCase();

  try {
    switch (true) {
      case mimeType === 'application/pdf' || ext === '.pdf':
        return await extractFromPDF(filePath);

      case mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || ext === '.docx':
        return await extractFromDOCX(filePath);

      case mimeType === 'text/plain' || ext === '.txt':
        return await extractFromTXT(filePath);

      default:
        throw new Error(`Unsupported file type: ${mimeType}`);
    }
  } catch (err) {
    logger.error(`Text extraction failed: ${err.message}`);
    throw new Error(`Failed to extract text: ${err.message}`);
  }
}

/**
 * Extract text from PDF using pdf-parse
 */
async function extractFromPDF(filePath) {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer, {
    // Normalize whitespace
    pagerender: (pageData) => {
      const renderOptions = {
        normalizeWhitespace: true,
        disableCombineTextItems: false,
      };
      return pageData.getTextContent(renderOptions).then((textContent) => {
        let lastY, text = '';
        for (const item of textContent.items) {
          if (lastY !== item.transform[5] && text) {
            text += '\n';
          }
          text += item.str;
          lastY = item.transform[5];
        }
        return text;
      });
    },
  });

  // Clean up extracted PDF text
  return cleanText(data.text);
}

/**
 * Extract text from DOCX using mammoth
 */
async function extractFromDOCX(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });

  if (result.messages.length > 0) {
    logger.warn('DOCX extraction warnings:', result.messages);
  }

  return cleanText(result.value);
}

/**
 * Extract text from plain text file
 */
async function extractFromTXT(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return cleanText(content);
}

/**
 * Clean and normalize extracted text
 * - Remove excessive whitespace
 * - Normalize line endings
 * - Remove null bytes
 */
function cleanText(text) {
  return text
    .replace(/\0/g, '')                    // Remove null bytes
    .replace(/\r\n/g, '\n')               // Normalize line endings
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')                  // Tabs → spaces
    .replace(/[ ]{2,}/g, ' ')             // Multiple spaces → single
    .replace(/\n{3,}/g, '\n\n')           // Max 2 consecutive newlines
    .trim();
}

module.exports = { extractText };
