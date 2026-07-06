'use strict';

const express = require('express');
const router = express.Router();

router.get('/health', (_req, res) => {
  res.json({
    success: true,
    service: 'Sheikha Runtime Root Gateway',
    status: 'active',
    governance: true,
    timestamp: new Date().toISOString()
  });
});

router.use('/', require('./root-orchestration'));
router.use('/', require('./canonical-runtime-status'));

module.exports = router;
