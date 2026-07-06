const express = require('express');
const fs = require('fs');
const path = require('path');
const { health: sqlHealth } = require('../../lib/database/sqlserver/sqlserver-connection-manager');

const router = express.Router();

function readFabricDefinition() {
  const fabricPath = path.join(
    process.cwd(),
    'runtime/data-fabric/sheikha-neural-data-fabric.json'
  );

  return JSON.parse(fs.readFileSync(fabricPath, 'utf8'));
}

router.get('/status', async (req, res) => {
  try {
    const fabric = readFabricDefinition();
    const sql = await sqlHealth();
    const isActive = sql.success;

    return res.status(isActive ? 200 : 503).json({
      success: isActive,
      fabric: fabric.fabric,
      status: isActive ? fabric.status : 'DEGRADED',
      architecture: fabric.architecture,
      routing: fabric.routing,
      orchestration: fabric.orchestration,
      engines: fabric.engines,
      governance: fabric.governance,
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

module.exports = router;
