'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  governRequest
} = require('../../runtime/sharia-governance-fabric/v1/sheikha-sharia-governance-fabric-v1');

router.get('/api/sheikha/sharia-governance-fabric/v1/status', (_req, res) => {
  res.json(status());
});

router.post('/api/sheikha/sharia-governance-fabric/v1/govern', (req, res) => {
  res.json({
    success: true,
    system: 'SHEIKHA_SHARIA_GOVERNANCE_FABRIC_V1',
    governance: governRequest(req.body?.message || '')
  });
});

module.exports = router;
