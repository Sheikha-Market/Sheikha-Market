const express = require('express');
const router = express.Router();
const root = require('../lib/sheikha-root-governance-core');

router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'operational',
    service: 'root-governance',
    engine: root.name,
    version: root.version,
    owner: root.owner,
    sources: root.sources,
    timestamp: new Date().toISOString()
  });
});

router.post('/decide', (req, res) => {
  res.json(root.decide(req.body || {}));
});

module.exports = router;
