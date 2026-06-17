'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  health,
  plan
} = require('../../runtime/autonomous-enterprise-fabric/v1/sheikha-autonomous-enterprise-fabric-v1');

router.get('/api/sheikha/autonomous-enterprise-fabric/v1/status', (_req, res) => {
  res.json(status());
});

router.get('/api/sheikha/autonomous-enterprise-fabric/v1/health', (_req, res) => {
  res.json(health());
});

router.post('/api/sheikha/autonomous-enterprise-fabric/v1/plan', (req, res) => {
  res.json(plan(req.body?.message || ''));
});

module.exports = router;
