'use strict';

const express = require('express');
const router = express.Router();

const {
  safeStatus,
  inspect,
  governancePlan
} = require('../../runtime/supreme-governance-intelligence-fabric/v1/sheikha-supreme-governance-intelligence-fabric-v1');

router.get('/api/sheikha/supreme-governance-intelligence-fabric/v1/status', (_req, res) => {
  res.json(safeStatus());
});

router.get('/api/sheikha/supreme-governance-intelligence-fabric/v1/inspect', (_req, res) => {
  res.json(inspect());
});

router.post('/api/sheikha/supreme-governance-intelligence-fabric/v1/govern', (req, res) => {
  res.json(governancePlan(Array.isArray(req.body?.findings) ? req.body.findings : []));
});

module.exports = router;
