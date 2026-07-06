const express = require('express');
const router = express.Router();

const fs = require('fs');
const path = require('path');

router.get('/health', async (_req, res) => {
  try {

    const registryPath = path.join(
      process.cwd(),
      'runtime/runtime-registry/sheikha-runtime-registry.json'
    );

    const fabricPath = path.join(
      process.cwd(),
      'runtime/data-fabric/sheikha-neural-data-fabric.json'
    );

    const bootstrapPath = path.join(
      process.cwd(),
      'runtime/fabric-bootstrap/sheikha-fabric-routes.json'
    );

    const runtimeRegistry = JSON.parse(
      fs.readFileSync(registryPath, 'utf8')
    );

    const dataFabric = JSON.parse(
      fs.readFileSync(fabricPath, 'utf8')
    );

    const bootstrap = JSON.parse(
      fs.readFileSync(bootstrapPath, 'utf8')
    );

    return res.json({
      success: true,
      platform: 'SHEIKHA_UNIFIED_NEURAL_PLATFORM',
      status: 'ACTIVE',
      runtimeRegistry,
      dataFabric,
      bootstrap,
      runtime: {
        node: process.version,
        uptimeSeconds: process.uptime(),
        memory: process.memoryUsage(),
        pid: process.pid
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
