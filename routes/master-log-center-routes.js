'use strict';

const express = require('express');
const center = require('../runtime/master-log-center/sheikha-master-log-center-v1');

const router = express.Router();

router.get('/api/sheikha/master-log-center/status', (req, res) => {
  res.json({ success: true, data: center.status() });
});

router.get('/api/sheikha/master-log-center/dashboard', (req, res) => {
  res.json({ success: true, data: center.dashboard() });
});

router.post('/api/sheikha/master-log-center/search', (req, res) => {
  res.json({ success: true, data: center.search(req.body || {}) });
});

router.post('/api/sheikha/master-log-center/correlate', (req, res) => {
  res.json({ success: true, data: center.correlate(req.body || {}) });
});

router.post('/api/sheikha/master-log-center/audit-package', (req, res) => {
  res.json({ success: true, data: center.auditPackage(req.body || {}) });
});

router.post('/api/sheikha/master-log-center/trace', (req, res) => {
  res.json({ success: true, data: center.trace(req.body || {}) });
});

module.exports = router;
