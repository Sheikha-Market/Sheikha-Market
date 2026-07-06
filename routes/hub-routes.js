'use strict';

const express = require('express');
const hub = require('../runtime/hub/sheikha-hub-v1');

const router = express.Router();

router.get('/api/sheikha/hub/status', (req, res) => {
  res.json({ success: true, data: hub.status() });
});

router.get('/api/sheikha/hub/map', (req, res) => {
  res.json({ success: true, data: hub.map() });
});

router.post('/api/sheikha/hub/portal', (req, res) => {
  res.json({ success: true, data: hub.portal(req.body || {}) });
});

router.post('/api/sheikha/hub/readiness', (req, res) => {
  res.json({ success: true, data: hub.readiness(req.body || {}) });
});

module.exports = router;
