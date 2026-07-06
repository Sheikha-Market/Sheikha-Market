'use strict';

const express = require('express');
const { createExecutionEnvelope, status } = require('../core/orchestration/sheikha-supreme-orchestrator-v1');
const { governGovernance } = require('../runtime/governance/sheikha-governance-of-governance-v1');

const router = express.Router();

router.get('/api/sheikha/apex-control-plane/v1/status', (_req, res) => {
  res.json(status());
});

router.post('/api/sheikha/apex-control-plane/v1/plan', express.json({ limit: '1mb' }), (req, res) => {
  const payload = req.body || {};
  const governance = governGovernance({
    actor: payload.actor || 'apex-api',
    channel: payload.channel || 'apex-control-plane',
    action: 'apex_execution_plan',
    message: payload.message || payload.prompt || ''
  });
  const envelope = createExecutionEnvelope(payload, governance);

  res.status(governance.allowed ? 200 : 403).json({
    success: governance.allowed,
    ...envelope
  });
});

module.exports = router;
