const express = require('express');
const router = express.Router();
const runtime = require('../lib/sheikha-runtime-root-neural-network');

router.get('/health', (req, res) => {
  res.json(runtime.status());
});

router.get('/audit', (req, res) => {
  res.json(runtime.audit(req.query.limit || 50));
});

router.post('/record', (req, res) => {
  res.json({
    success: true,
    record: runtime.record(req.body || {})
  });
});

module.exports = router;
