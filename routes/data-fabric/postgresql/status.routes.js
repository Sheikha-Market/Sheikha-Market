const express = require('express');
const router = express.Router();
const { health } = require('../../../lib/database/postgresql/postgresql-connection-manager');

router.get('/status', async (_req, res) => {
  const result = await health();

  res.status(result.success ? 200 : 503).json({
    success: result.success,
    fabric: 'SHEIKHA_POSTGRESQL_RUNTIME_CORE',
    provider: 'postgresql',
    governance: {
      envRequired: true,
      noPlaintextPasswordCommit: true,
      migrationRequiresApproval: true,
      backupBeforeMigration: true,
      auditRequired: true
    },
    data: result,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
