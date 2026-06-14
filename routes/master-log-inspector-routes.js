'use strict';

const express = require('express');
const integration = require('../runtime/master-log-inspector/sheikha-master-log-inspector-v1');

const router = express.Router();

router.get('/api/sheikha/master-log-inspector/status', (req, res) => {
  res.json({ success: true, data: integration.status() });
});

router.post('/api/sheikha/master-log-inspector/inspect', (req, res) => {
  res.json({ success: true, data: integration.inspectEvent(req.body || {}) });
});

router.get('/api/sheikha/master-log-inspector/report', (req, res) => {
  res.json({ success: true, data: integration.inspectorReport() });
});

module.exports = router;
