'use strict';

const express = require('express');

const distributionApex = require(
  '../../runtime/distribution-apex/v1/sheikha-universal-distribution-apex-v1'
);
const universalDeliveryV2 = require(
  '../../runtime/distribution/v2/sheikha-universal-delivery-v2-status'
);
const nativeDeliveryV3 = require(
  '../../runtime/distribution/v3/sheikha-native-delivery-v3-status'
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

router.get('/api/sheikha/distribution-apex/v3/status', (_req, res) => {
  res.json(nativeDeliveryV3.status());
});

router.get('/api/sheikha/distribution-apex/v3/desktop-readiness', (_req, res) => {
  res.json({ success: true, data: nativeDeliveryV3.desktopReadiness() });
});

router.get('/api/sheikha/distribution-apex/v3/eligibility', (_req, res) => {
  res.json({ success: true, data: nativeDeliveryV3.eligibility() });
});

router.get('/api/sheikha/distribution-apex/v3/runners', (_req, res) => {
  res.json({ success: true, data: nativeDeliveryV3.runners() });
});

router.get('/api/sheikha/distribution-apex/v3/release-index', (_req, res) => {
  res.json({ success: true, data: nativeDeliveryV3.releaseIndex() });
});

module.exports = router;
