'use strict';

const express = require('express');
const router = express.Router();

const governor =
require('../../core/kernel/resources/governor/sheikha-resource-governor');

router.get('/status', (_req, res) => {
  return res.json(governor.telemetry());
});

router.post('/allocate', (req, res) => {
  return res.json(
    governor.allocate(req.body || {})
  );
});

module.exports = router;
