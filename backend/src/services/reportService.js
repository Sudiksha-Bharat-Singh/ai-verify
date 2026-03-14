/**
 * Report Service
 * CRUD operations for plagiarism reports using Prisma + PostgreSQL
 */

const { PrismaClient } = require('@prisma/client');
const { logger } = require('../utils/logger');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

/**
 * Save a completed report to the database
 */
async function saveReport(report) {
  try {
    const saved = await prisma.report.upsert({
      where: { id: report.id },
      create: {
        id: report.id,
        fileName: report.fileName,
        inputType: report.inputType,
        originalText: report.originalText,
        plagiarismScore: report.plagiarismScore,
        sentences: report.sentences,
        sources: report.sources,
        aiScore: report.aiScore,
        humanScore: report.humanScore,
        aiModelUsed: report.aiModelUsed,
        status: report.status,
      },
      update: {
        plagiarismScore: report.plagiarismScore,
        sentences: report.sentences,
        sources: report.sources,
        aiScore: report.aiScore,
        humanScore: report.humanScore,
        status: report.status,
        updatedAt: new Date(),
      },
    });

    logger.info(`Report saved: ${saved.id}`);
    return saved;
  } catch (err) {
    logger.error(`Failed to save report: ${err.message}`);
    // Don't throw — report saving shouldn't fail the entire request
    return null;
  }
}

/**
 * Retrieve a report by ID
 */
async function getReport(id) {
  try {
    const report = await prisma.report.findUnique({ where: { id } });
    return report;
  } catch (err) {
    logger.error(`Failed to fetch report ${id}: ${err.message}`);
    throw err;
  }
}

/**
 * List recent reports (paginated)
 */
async function listReports({ page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;
  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fileName: true,
        inputType: true,
        plagiarismScore: true,
        aiScore: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.report.count(),
  ]);

  return { reports, total, page, limit, pages: Math.ceil(total / limit) };
}

module.exports = { saveReport, getReport, listReports };
