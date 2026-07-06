'use strict';

const express = require('express');
const router = express.Router();

const bus =
require('../../core/kernel/runtime-bus/sheikha-unified-runtime-bus');

const scheduler =
require('../../core/kernel/scheduler/sheikha-runtime-scheduler');

const execution =
require('../../core/kernel/execution-plane/sheikha-execution-plane');

router.get('/status', (_req, res) => {
  return res.json({
    bus: bus.status(),
    scheduler: scheduler.status(),
    execution: execution.status()
  });
});

router.post('/event', (req, res) => {
  const body = req.body || {};

  return res.json(
    bus.emit(
      body.event || 'runtime-event',
      body.payload || {}
    )
  );
});

router.post('/task', (req, res) => {
  return res.json(
    scheduler.register(req.body || {})
  );
});

module.exports = router;
