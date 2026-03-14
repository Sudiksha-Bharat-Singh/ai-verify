/**
 * PDF Report Generator
 * Uses Puppeteer to render a styled HTML report as PDF
 */

const puppeteer = require('puppeteer');
const path = require('path');
const os = require('os');
const { v4: uuidv4 } = require('uuid');
const { logger } = require('../utils/logger');

/**
 * Generate a downloadable PDF report from a plagiarism report object
 * @param {Object} report - Full report data
 * @returns {Promise<string>} Path to the generated PDF file
 */
async function generatePDFReport(report) {
  const outputPath = path.join(os.tmpdir(), `aiverify-${uuidv4()}.pdf`);
  const html = buildReportHTML(report);

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
    });

    logger.info(`PDF generated: ${outputPath}`);
    return outputPath;
  } finally {
    if (browser) await browser.close();
  }
}

/**
 * Build the HTML template for the PDF report
 */
function buildReportHTML(report) {
  const date = new Date(report.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const plagiarismColor = report.plagiarismScore >= 70 ? '#ef4444' :
                          report.plagiarismScore >= 40 ? '#f97316' : '#22c55e';

  const aiColor = report.aiScore >= 70 ? '#ef4444' :
                  report.aiScore >= 40 ? '#f97316' : '#22c55e';

  const highlightedText = report.sentences?.map(s =>
    s.isPlagiarized
      ? `<mark class="plagiarized" title="Similarity: ${(s.similarityScore * 100).toFixed(0)}%">${escapeHtml(s.text)}</mark>`
      : escapeHtml(s.text)
  ).join(' ') || escapeHtml(report.originalText || '');

  const sourcesHTML = (report.sources || []).slice(0, 10).map((src, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><a href="${escapeHtml(src.url)}">${escapeHtml(src.title || src.url)}</a></td>
      <td>${src.matchCount} sentence${src.matchCount !== 1 ? 's' : ''}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; line-height: 1.6; }

  .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 24px; }
  .header h1 { font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
  .header h1 span { color: #6366f1; }
  .header .meta { margin-top: 8px; opacity: 0.7; font-size: 13px; }

  .scores-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
  .score-card { border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; text-align: center; }
  .score-card .label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin-bottom: 8px; }
  .score-card .value { font-size: 48px; font-weight: 900; }
  .score-card .sublabel { font-size: 12px; color: #9ca3af; margin-top: 4px; }

  .section { margin-bottom: 24px; }
  .section h2 { font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 16px; color: #374151; }

  .text-block { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; font-size: 14px; line-height: 1.8; }
  mark.plagiarized { background: #fee2e2; color: #991b1b; border-radius: 2px; padding: 1px 2px; }

  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { background: #f3f4f6; padding: 10px; text-align: left; font-weight: 600; border-bottom: 2px solid #e5e7eb; }
  td { padding: 10px; border-bottom: 1px solid #f3f4f6; }
  td a { color: #6366f1; text-decoration: none; word-break: break-all; }

  .footer { text-align: center; color: #9ca3af; font-size: 11px; border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 32px; }

  @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
</style>
</head>
<body>

<div class="header">
  <h1>AI <span>Verify</span> — Plagiarism Report</h1>
  <div class="meta">
    Report ID: ${report.id} &nbsp;|&nbsp; Date: ${date}
    ${report.fileName ? ` &nbsp;|&nbsp; File: ${escapeHtml(report.fileName)}` : ''}
  </div>
</div>

<div class="scores-grid">
  <div class="score-card">
    <div class="label">Plagiarism Score</div>
    <div class="value" style="color: ${plagiarismColor}">${report.plagiarismScore?.toFixed(1)}%</div>
    <div class="sublabel">Content matched from web sources</div>
  </div>
  <div class="score-card">
    <div class="label">AI-Generated Content</div>
    <div class="value" style="color: ${aiColor}">${report.aiScore?.toFixed(1)}%</div>
    <div class="sublabel">Probability of AI authorship</div>
  </div>
</div>

<div class="section">
  <h2>Analyzed Text (Plagiarism Highlighted)</h2>
  <div class="text-block">${highlightedText}</div>
</div>

${sourcesHTML ? `
<div class="section">
  <h2>Matched Sources</h2>
  <table>
    <thead><tr><th>#</th><th>Source URL</th><th>Matched Sentences</th></tr></thead>
    <tbody>${sourcesHTML}</tbody>
  </table>
</div>
` : ''}

<div class="footer">
  Generated by AI Verify &copy; ${new Date().getFullYear()} &mdash; This report is for informational purposes only.
</div>

</body>
</html>`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = { generatePDFReport };
