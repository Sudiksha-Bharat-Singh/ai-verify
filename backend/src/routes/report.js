/**
 * Report Route
 * Retrieve saved reports and generate downloadable PDFs
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const { param, validationResult } = require('express-validator');

const { getReport } = require('../services/reportService');
const { generatePDFReport } = require('../services/pdfGenerator');
const { logger } = require('../utils/logger');

const router = express.Router();

// ─── GET /api/report/:id ───────────────────────────────────────────────────────
router.get(
  '/:id',
  [param('id').isUUID().withMessage('Invalid report ID')],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const report = await getReport(req.params.id);

      if (!report) {
        return res.status(404).json({ success: false, error: 'Report not found' });
      }

      return res.json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/report/:id/pdf ───────────────────────────────────────────────────
router.get(
  '/:id/pdf',
  [param('id').isUUID().withMessage('Invalid report ID')],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const report = await getReport(req.params.id);
      if (!report) {
        return res.status(404).json({ success: false, error: 'Report not found' });
      }

      logger.info(`Generating PDF for report ${req.params.id}`);
      const pdfPath = await generatePDFReport(report);

      // Stream PDF to client
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="aiverify-report-${req.params.id.slice(0, 8)}.pdf"`
      );

      const stream = fs.createReadStream(pdfPath);
      stream.pipe(res);

      // Clean up temp file after sending
      stream.on('end', () => {
        fs.unlink(pdfPath, (err) => {
          if (err) logger.warn(`Could not delete temp PDF: ${pdfPath}`);
        });
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
