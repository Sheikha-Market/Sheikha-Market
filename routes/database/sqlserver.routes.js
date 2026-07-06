'use strict';

const express = require('express');
const { health } = require('../../lib/database/sqlserver/sqlserver-connection-manager');

const router = express.Router();

router.get('/status', async (_req, res) => {
  const result = await health();

  res.status(result.success ? 200 : 503).json({
    success: result.success,
    fabric: 'SHEIKHA_SQLSERVER_FABRIC',
    provider: 'mssql',
    governance: {
      noPlaintextPasswordCommit: true,
      envRequired: true,
      humanApprovalBeforeSchemaChange: true,
      auditTrailRequired: true
    },
    data: result,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
