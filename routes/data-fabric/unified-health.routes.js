const express = require('express');
const router = express.Router();
const fs = require('node:fs');
const path = require('node:path');

const { health: sqlserverHealth } = require('../../lib/database/sqlserver/sqlserver-connection-manager');
const { health: postgresqlHealth } = require('../../lib/database/postgresql/postgresql-connection-manager');
const { health: redisHealth } = require('../../lib/database/redis/redis-connection-manager');
const { health: mongodbHealth } = require('../../lib/database/mongodb/mongodb-connection-manager');

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), file), 'utf8'));
}

router.get('/health', async (_req, res) => {
  const startedAt = Date.now();

  try {
    const dataFabric = readJson('runtime/data-fabric/sheikha-neural-data-fabric.json');
    const neuralCluster = readJson('runtime/neural-cluster/sheikha-neural-cluster.json');

    const sqlserver = await sqlserverHealth();
    const postgresql = await postgresqlHealth();
    const redis = await redisHealth();
    const mongodb = await mongodbHealth();

    const healthy = sqlserver.success && postgresql.success && redis.success && mongodb.success;

    return res.json({
      success: true,
      fabric: 'SHEIKHA_UNIFIED_DATA_HEALTH',
      status: healthy ? 'healthy' : 'degraded',
      dataFabric,
      neuralCluster,
      engines: {
        sqlserver,
        postgresql,
        redis,
        mongodb
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
