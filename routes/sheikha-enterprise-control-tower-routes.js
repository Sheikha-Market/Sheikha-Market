'use strict';

const express = require('express');
const router = express.Router();
const { collectControlTowerStatus } = require('../core/enterprise/sheikha-enterprise-control-tower-v1');

router.get('/api/sheikha/control-tower/status', (_req, res) => {
  res.json(collectControlTowerStatus());
});

router.get('/api/sheikha/observability/status', (_req, res) => {
  const s = collectControlTowerStatus();
  res.json({
    success: true,
    status: 'ACTIVE',
    runtime: s.runtime,
    apis: s.apis,
    observability: s.observability
  });
});

router.get('/api/sheikha/governance/status', (_req, res) => {
  const s = collectControlTowerStatus();
  res.json({
    success: true,
    status: 'ACTIVE',
    governance: s.governance
  });
});

router.get('/api/sheikha/runtime/status', (_req, res) => {
  const s = collectControlTowerStatus();
  res.json({
    success: true,
    status: 'ACTIVE',
    runtime: s.runtime
  });
});

module.exports = router;
