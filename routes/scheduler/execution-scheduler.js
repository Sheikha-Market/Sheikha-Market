'use strict';

const express = require('express');
const router = express.Router();

const scheduler =
require('../../core/kernel/scheduler/execution/sheikha-execution-scheduler');

router.get('/status', (_req, res) => res.json(scheduler.status()));

router.post('/schedule', (req, res) => {
  return res.json(scheduler.schedule(req.body || {}));
});

module.exports = router;
