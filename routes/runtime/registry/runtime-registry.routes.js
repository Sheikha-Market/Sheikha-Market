const express = require('express');
const router = express.Router();

const {
  getRegistry
} = require('../../../lib/runtime-registry/runtime-registry-manager');

router.get('/status', async (_req, res) => {
  try {
    const registry = getRegistry();

    return res.json({
      success: true,
      runtime: registry.registry,
      status: registry.status,
      mode: registry.mode,
      engines: registry.engines,
      routing: registry.routing,
      governance: registry.governance,
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
