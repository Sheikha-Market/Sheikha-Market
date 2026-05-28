'use strict';

const express = require('express');
const router = express.Router();

const scheduler =
require('../../core/kernel/scheduler/runtime/sheikha-runtime-scheduler-fabric');

router.get('/status', (_req, res) => res.json(scheduler.status()));

router.post('/enqueue', (req, res) => {
  return res.json(scheduler.enqueue(req.body || {}));
});

router.post('/cycle', (req, res) => {
  const body = req.body || {};
  return res.json(scheduler.cycle(body.name || 'runtime-cycle'));
});

module.exports = router;
