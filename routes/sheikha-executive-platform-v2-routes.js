'use strict';

const express = require('express');
const router = express.Router();
const { status } = require('../core/executive-platform/sheikha-executive-platform-v2');

router.get('/api/sheikha/executive-platform/v2/status', (_req, res) => {
  res.json(status());
});

router.get('/api/sheikha/inspector/v2/status', (_req, res) => {
  const s = status();
  res.json({
    success: true,
    status: 'ACTIVE',
    inspector: s.inspector,
    runtime: s.runtime,
    git: s.git,
    governance: s.governance,
    ai: s.ai
  });
});

module.exports = router;
