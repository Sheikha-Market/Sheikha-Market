'use strict';

const express = require('express');
const router = express.Router();

const health =
require('../../core/kernel/health/runtime/sheikha-runtime-health-recovery-fabric');

router.get('/status', (_req, res) => {
  return res.json(health.status());
});

router.post('/heartbeat', (_req, res) => {
  return res.json(health.heartbeat());
});

router.post('/integrity', (_req, res) => {
  return res.json(health.integrity());
});

router.post('/recovery', (_req, res) => {
  return res.json(health.recovery());
});

router.post('/report', (_req, res) => {
  return res.json(health.report());
});

module.exports = router;
