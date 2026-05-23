'use strict';

const express = require('express');
const router = express.Router();
const orchestrator = require('../../core/orchestration/sheikha-root-orchestrator');

router.get('/orchestration', (_req, res) => {
  res.json(orchestrator.status());
});

router.get('/health', (_req, res) => {
  const o = orchestrator.status();
  res.json({
    success: true,
    kernel: 'Sheikha Runtime Kernel',
    version: '1.0.0',
    status: 'active',
    layers: {
      governance: true,
      ai: true,
      memory: true,
      orchestration: o.orchestration,
      neural: true,
      gateway: true,
      runtimeBus: o.layers.runtimeBus,
      eventFabric: o.layers.eventFabric,
      recovery: o.layers.recoveryEngine
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
