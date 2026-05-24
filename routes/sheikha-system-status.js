'use strict';

const express = require('express');
const router = express.Router();

router.get('/system/status', (_req, res) => {
  res.json({
    success: true,
    name: 'Sheikha Unified System',
    status: 'active',
    editor: { name: 'Sheikha Editor', status: 'active' },
    ide: require('../core/ide/sheikha-ide'),
    runtime: require('../core/runtime/sheikha-runtime'),
    ai: require('../core/ai/sheikha-ai'),
    enterprise: require('../core/enterprise/sheikha-enterprise'),
    os: require('../core/os/sheikha-os'),
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
