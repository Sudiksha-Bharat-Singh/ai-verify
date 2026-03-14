const express = require('express');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  const checks = { api: 'ok', database: 'unknown', aiEngine: 'unknown' };

  // Check database
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'ok';
  } catch {
    checks.database = 'error';
  }

  // Check AI engine
  try {
    await axios.get(`${process.env.AI_ENGINE_URL}/health`, { timeout: 3000 });
    checks.aiEngine = 'ok';
  } catch {
    checks.aiEngine = 'error';
  }

  const allOk = Object.values(checks).every(v => v === 'ok');

  return res.status(allOk ? 200 : 503).json({
    status: allOk ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    checks,
  });
});

module.exports = router;
