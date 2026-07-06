'use strict';

const express = require('express');
const apex = require('../runtime/cloud-saas/apex/cloud-saas-apex');

const router = express.Router();

router.get('/api/cloud-saas/apex/status', (req, res) => {
  res.json({ success: true, data: apex.status() });
});

router.get('/api/cloud-saas/regions', (req, res) => {
  res.json({ success: true, data: apex.regions() });
});

router.get('/api/cloud-saas/deployments', (req, res) => {
  res.json({ success: true, data: apex.deployments() });
});

router.get('/api/cloud-saas/reliability', (req, res) => {
  res.json({ success: true, data: apex.reliability() });
});

module.exports = router;
