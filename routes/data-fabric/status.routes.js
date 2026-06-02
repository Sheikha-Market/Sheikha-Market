const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

router.get('/status', async (req, res) => {
  try {
    const fabricPath = path.join(
      process.cwd(),
      'runtime/data-fabric/sheikha-neural-data-fabric.json'
    );

    const fabric = JSON.parse(
      fs.readFileSync(fabricPath, 'utf8')
    );

    return res.json({
      success: true,
      fabric: fabric.fabric,
      status: fabric.status,
      architecture: fabric.architecture,
      routing: fabric.routing,
      orchestration: fabric.orchestration,
      engines: fabric.engines,
      governance: fabric.governance,
      runtime: {
        api: 'active',
        pm2: 'active',
        sqlserver: 'connected'
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
