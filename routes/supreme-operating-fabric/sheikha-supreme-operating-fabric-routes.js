'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  health,
  plan
} = require('../../runtime/supreme-operating-fabric/v1/sheikha-supreme-operating-fabric-v1');

router.get('/api/sheikha/supreme-operating-fabric/v1/status', (_req, res) => {
  res.json(status());
});

router.get('/api/sheikha/supreme-operating-fabric/v1/health', (_req, res) => {
  res.json(health());
});

router.post('/api/sheikha/supreme-operating-fabric/v1/plan', (req, res) => {
  res.json(plan(req.body?.message || '', req.body?.mode || 'smart'));
});

module.exports = router;
