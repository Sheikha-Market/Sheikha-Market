'use strict';

const express = require('express');
const storageGovernance = require(
  '../runtime/storage-governance/v1/sheikha-storage-governance-v1'
);

const router = express.Router();
router.use(express.json({ limit: '128kb' }));

router.get('/api/sheikha/storage-governance/v1/status', (req, res) => {
  res.json({ success: true, data: storageGovernance.status() });
});

router.post('/api/sheikha/storage-governance/v1/plan', (req, res) => {
  res.json({ success: true, data: storageGovernance.plan(req.body || {}) });
});

module.exports = router;
