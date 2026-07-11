'use strict';

const express = require('express');

const distributionApex = require(
  '../../runtime/distribution-apex/v1/sheikha-universal-distribution-apex-v1'
);
const universalDeliveryV2 = require(
  '../../runtime/distribution/v2/sheikha-universal-delivery-v2-status'
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

router.get('/api/sheikha/distribution-apex/v2/status', (_req, res) => {
  res.json(universalDeliveryV2.status());
});

router.get('/api/sheikha/distribution-apex/v2/matrix', (_req, res) => {
  res.json({ success: true, data: universalDeliveryV2.matrixSummary() });
});

router.get('/api/sheikha/distribution-apex/v2/release-index', (_req, res) => {
  res.json({ success: true, data: universalDeliveryV2.releaseIndex() });
});

module.exports = router;
