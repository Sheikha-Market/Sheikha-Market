'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  execute
} = require('../../runtime/autonomous-execution-bridge/v1/sheikha-autonomous-execution-bridge-v1');

router.get('/api/sheikha/autonomous-execution-bridge/v1/status', (_req, res) => {
  res.json(status());
});

router.post('/api/sheikha/autonomous-execution-bridge/v1/execute', async (req, res) => {
  res.json(await execute(req.body?.message || '', {
    mode: req.body?.mode || 'smart',
    safeMode: req.body?.safeMode !== false,
    timeoutMs: req.body?.timeoutMs,
    numPredict: req.body?.numPredict
  }));
});

module.exports = router;
