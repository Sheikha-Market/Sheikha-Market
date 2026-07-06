'use strict';

const express = require('express');
const gcp = require('../runtime/global-control-plane/global-control-plane');

const router = express.Router();

router.get('/api/global-control-plane/status', (req, res) => {
  res.json({ success: true, data: gcp.status() });
});

router.get('/api/global-control-plane/federation', (req, res) => {
  res.json({ success: true, data: gcp.federation() });
});

router.get('/api/global-control-plane/policies', (req, res) => {
  res.json({ success: true, data: gcp.policies() });
});

router.get('/api/global-control-plane/deployments', (req, res) => {
  res.json({ success: true, data: gcp.deploymentFederation() });
});

router.get('/api/global-control-plane/intelligence', (req, res) => {
  res.json({ success: true, data: gcp.intelligencePlane() });
});

module.exports = router;
