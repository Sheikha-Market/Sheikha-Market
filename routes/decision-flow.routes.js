const express = require('express');
const router = express.Router();
const engine = require('../lib/sheikha-decision-flow-engine');

router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'operational',
    service: 'decision-flow',
    engine: engine.name,
    version: engine.version,
    flow: engine.flow,
    timestamp: new Date().toISOString()
  });
});

router.post('/decide', (req, res) => {
  const result = engine.decide(req.body || {});
  res.status(result.allowed ? 200 : 403).json(result);
});

module.exports = router;
