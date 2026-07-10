'use strict';

const express = require('express');

const distributionApex = require(
  '../../runtime/distribution-apex/v1/sheikha-universal-distribution-apex-v1'
);

const router = express.Router();

router.get('/api/sheikha/distribution-apex/v1/status', (_req, res) => {
  res.json(distributionApex.status());
});

router.get('/api/sheikha/distribution-apex/v1/matrix', (_req, res) => {
  res.json({ success: true, data: distributionApex.matrixSummary() });
});

router.get('/api/sheikha/distribution-apex/v1/release-index', (_req, res) => {
  res.json({ success: true, data: distributionApex.releaseIndex() });
});

module.exports = router;
