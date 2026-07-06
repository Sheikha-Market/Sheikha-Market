'use strict';

const express = require('express');
const router = express.Router();
const { evaluateAlert, registerRepair, gitReport } = require('../runtime/self-healing/sheikha-direct-repair-governance-v1');

router.get('/api/sheikha/self-healing/direct-repair/status', (_req, res) => {
  res.json({
    success: true,
    governance: 'SHEIKHA_DIRECT_REPAIR_GOVERNANCE_V1',
    status: 'ACTIVE',
    mode: 'SAFE_DIRECT_REPAIR_WITH_GIT_REPORT_AND_REGISTRY',
    git: gitReport()
  });
});

router.post('/api/sheikha/self-healing/direct-repair/evaluate', express.json(), (req, res) => {
  res.json(evaluateAlert(req.body || {}));
});

router.post('/api/sheikha/self-healing/direct-repair/register', express.json(), (req, res) => {
  res.json({ success: true, record: registerRepair(req.body || {}) });
});

module.exports = router;
