'use strict';

const express = require('express');
const router = express.Router();

const telemetry =
require('../../core/kernel/telemetry/sheikha-runtime-telemetry');

router.get('/metrics', (_req, res) => {
  return res.json(telemetry.metrics());
});

router.post('/report', (_req, res) => {
  return res.json(telemetry.report());
});

module.exports = router;
