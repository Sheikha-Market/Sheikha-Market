const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { health: sqlserverHealth } = require('../../lib/database/sqlserver/sqlserver-connection-manager');

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), file), 'utf8'));
}

router.get('/health', async (_req, res) => {
  const startedAt = Date.now();

  try {
    const dataFabric = readJson('runtime/data-fabric/sheikha-neural-data-fabric.json');
    const neuralCluster = readJson('runtime/neural-cluster/sheikha-neural-cluster.json');
    const sqlserver = await sqlserverHealth();

    return res.json({
      success: true,
      fabric: 'SHEIKHA_UNIFIED_DATA_HEALTH',
      status: sqlserver.success ? 'healthy' : 'degraded',
      dataFabric,
      neuralCluster,
      engines: {
        sqlserver
      },
      governance: {
        audit_required: true,
        rollback_required: true,
        human_approval_required: true,
        no_plaintext_secrets: true
      },
      latencyMs: Date.now() - startedAt,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
