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

router.post('/api/sheikha/evidence-registry/research-plan', (req, res) => {
  const result = evidence.researchPlan(req.body || {});
  const statusCode = result.status === 'RESEARCH_QUERY_REQUIRED' ? 422 : 200;
  res.status(statusCode).json({
    success: result.status !== 'RESEARCH_QUERY_REQUIRED',
    data: result
  });
});

module.exports = router;
