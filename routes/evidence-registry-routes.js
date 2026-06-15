'use strict';

const express = require('express');
const evidence = require('../runtime/evidence-registry/sheikha-evidence-registry-v1');

const router = express.Router();

router.get('/api/sheikha/evidence-registry/status', (req, res) => {
  res.json({ success: true, data: evidence.status() });
});

router.get('/api/sheikha/evidence-registry/schema', (req, res) => {
  res.json({ success: true, data: evidence.schema() });
});

router.post('/api/sheikha/evidence-registry/classify', (req, res) => {
  res.json({ success: true, data: evidence.classify(req.body || {}) });
});

router.post('/api/sheikha/evidence-registry/create', (req, res) => {
  res.json({ success: true, data: evidence.createEvidence(req.body || {}) });
});

router.post('/api/sheikha/evidence-registry/link', (req, res) => {
  res.json({ success: true, data: evidence.linkEvidence(req.body || {}) });
});

module.exports = router;
