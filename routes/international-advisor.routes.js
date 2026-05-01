const express = require('express');
const router = express.Router();
const advisor = require('../lib/sheikha-international-advisor-network');

router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'operational',
    service: 'international-advisor',
    engine: advisor.name,
    version: advisor.version,
    role: advisor.role,
    timestamp: new Date().toISOString()
  });
});

router.post('/advise', (req, res) => {
  res.json(advisor.advise(req.body || {}));
});

router.get('/integrations', (req, res) => {
  res.json(advisor.integrationPlan());
});

module.exports = router;
