const express = require('express');
const fs = require('fs');
const path = require('path');
const { health: sqlHealth } = require('../../lib/database/sqlserver/sqlserver-connection-manager');
const { getPostgreSQLRuntimeCoreStatus } = require('../../runtime/neural-cluster/engines/postgresql/runtime-core');

const router = express.Router();

function readJson(relativePath) {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
  );
}

router.get('/status', async (req, res) => {
  try {
    const cluster = readJson('runtime/neural-cluster/sheikha-neural-cluster.json');
    const sql = await sqlHealth();
    const isActive = sql.success;

    return res.status(isActive ? 200 : 503).json({
      success: isActive,
      cluster,
      runtime: {
        api: 'active',
        pm2: 'active',
        sqlserver: sql.success ? 'connected' : 'unavailable',
        sqlHealth: sql
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/health', async (req, res) => {
  try {
    const cluster = readJson('runtime/neural-cluster/sheikha-neural-cluster.json');
    const fabric = readJson('runtime/data-fabric/sheikha-neural-data-fabric.json');
    const sql = await sqlHealth();

    const checks = {
      governance: Boolean(cluster?.rules?.governance_required),
      routing: cluster?.architecture?.routing === 'active',
      fabric: fabric?.status === 'ACTIVE',
      sqlserver: sql.success
    };

    const success = Object.values(checks).every(Boolean);

    return res.status(success ? 200 : 503).json({
      success,
      cluster: cluster.cluster,
      fabric: fabric.fabric,
      checks,
      runtime: {
        api: 'active',
        pm2: 'active',
        sqlserver: sql.success ? 'connected' : 'unavailable',
        sqlHealth: sql
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/health/unified', async (req, res) => {
  try {
    const cluster = readJson('runtime/neural-cluster/sheikha-neural-cluster.json');
    const fabric = readJson('runtime/data-fabric/sheikha-neural-data-fabric.json');
    const sql = await sqlHealth();
    const postgresql = await getPostgreSQLRuntimeCoreStatus();

    const checks = {
      governance: Boolean(cluster?.rules?.governance_required),
      routing: cluster?.architecture?.routing === 'active',
      fabric: fabric?.status === 'ACTIVE',
      sqlserver: sql.success,
      postgresqlRuntimeCore: postgresql.success
    };

    const success = checks.governance && checks.routing && checks.fabric && checks.sqlserver;

    return res.status(success ? 200 : 503).json({
      success,
      topology: {
        cluster: cluster.cluster,
        fabric: fabric.fabric,
        mode: cluster.mode,
        architecture: cluster.architecture
      },
      checks,
      runtime: {
        api: 'active',
        pm2: 'active',
        sqlserver: sql.success ? 'connected' : 'unavailable',
        postgresqlRuntimeCore: postgresql.success ? 'ready' : 'deferred',
        sqlHealth: sql,
        postgresql
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/postgresql/status', async (req, res) => {
  const status = await getPostgreSQLRuntimeCoreStatus();
  res.status(status.success ? 200 : 503).json(status);
});

module.exports = router;
