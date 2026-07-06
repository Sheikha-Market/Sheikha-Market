'use strict';

const express = require('express');
const router = express.Router();

const orchestrator =
require('../../core/kernel/orchestration/runtime/sheikha-runtime-orchestrator');

router.get('/status', (_req, res) => res.json(orchestrator.status()));

router.post('/run', (req, res) => {
  return res.json(orchestrator.run(req.body || {}));
});

module.exports = router;
