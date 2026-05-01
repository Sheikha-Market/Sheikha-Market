const express = require('express');
const router = express.Router();
const controlPlane = require('../lib/sheikha-root-control-plane');

router.use(express.json({ limit: '1mb' }));

router.get('/health', (req, res) => {
  res.json(controlPlane.status());
});

router.get('/layers', (req, res) => {
  res.json(controlPlane.status());
});

router.get('/ports', (req, res) => {
  res.json(controlPlane.ports());
});

router.post('/classify', (req, res) => {
  res.json(controlPlane.classify(req.body?.system || 'unknown', { mode: req.body?.mode }));
});

router.post('/decide', (req, res) => {
  res.json(controlPlane.decide(req.body || {}));
});

module.exports = router;
