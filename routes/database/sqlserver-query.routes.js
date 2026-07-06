'use strict';

const express = require('express');

const {
  executeQuery
} = require('../../lib/database/sqlserver/sqlserver-query-gateway');

const {
  writeAudit
} = require('../../lib/database/sqlserver/sqlserver-audit-logger');

const router = express.Router();

router.post('/query', async (req, res) => {
  const query = req.body?.query || '';

  try {
    const result = await executeQuery(query);

    writeAudit({
      type: 'sql-query',
      success: result.success,
      governance: result.governance,
      latencyMs: result.latencyMs
    });

    res.status(result.success ? 200 : 403).json({
      success: result.success,
      fabric: 'SHEIKHA_SQLSERVER_QUERY_GATEWAY',
      data: result
    });

  } catch (error) {

    writeAudit({
      type: 'sql-query-error',
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
