'use strict';

const express = require('express');
const router = express.Router();

const orchestrator =
require('../../core/kernel/orchestration/intelligence/runtime-intelligence-orchestrator');

router.get('/status', (_req, res) => {
  return res.json(orchestrator.collect());
});

router.post('/report', (_req, res) => {
  return res.json(orchestrator.report());
});

module.exports = router;
