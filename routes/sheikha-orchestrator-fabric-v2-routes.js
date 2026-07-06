'use strict';

const express = require('express');
const { orchestrate, status } = require('../runtime/orchestrator/orchestrator-fabric');
const { governGovernance } = require('../runtime/governance/sheikha-governance-of-governance-v1');

const router = express.Router();

router.get('/api/sheikha/orchestrator-fabric/v2/status', (_req, res) => {
  res.json(status());
});

router.post('/api/sheikha/orchestrator-fabric/v2/orchestrate', express.json({ limit: '1mb' }), (req, res) => {
  const payload = req.body || {};
  const governance = governGovernance({
    actor: payload.actor || 'orchestrator-fabric-api',
    channel: payload.channel || 'orchestrator-fabric',
    action: 'orchestrator_fabric_dispatch',
    message: payload.message || payload.prompt || ''
  });
  const result = orchestrate(payload, governance);

  res.status(governance.allowed ? 200 : 403).json({
    success: governance.allowed,
    ...result
  });
});

module.exports = router;
