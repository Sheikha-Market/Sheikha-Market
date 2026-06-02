const express = require('express');
const router = express.Router();

const {
  health
} = require('../../../lib/database/mongodb/mongodb-connection-manager');

router.get('/status', async (_req, res) => {
  const result = await health();

  res.status(result.success ? 200 : 503).json({
    success: result.success,
    fabric: 'SHEIKHA_MONGODB_DOCUMENT_FABRIC',
    provider: 'mongodb',
    governance: {
      envRequired: true,
      noPlaintextPasswordCommit: true,
      documentGovernanceRequired: true,
      auditRequired: true
    },
    data: result,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
