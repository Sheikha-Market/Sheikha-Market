const express = require('express');
const router = express.Router();
const fiqh = require('../lib/sheikha-fiqh-engine');

router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'operational',
    service: 'sharia-governance',
    engine: fiqh.name,
    version: fiqh.version,
    sources: fiqh.sources,
    timestamp: new Date().toISOString()
  });
});

router.post('/evaluate', (req, res) => {
  res.json(fiqh.evaluate(req.body || {}));
});

router.post('/transaction', (req, res) => {
  res.json(fiqh.evaluate({
    ...req.body,
    context: 'commercial-transaction'
  }));
});

module.exports = router;
