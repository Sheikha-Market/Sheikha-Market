'use strict';

const express = require('express');
const router = express.Router();

const fabric =
require('../../core/kernel/memory/fabric/sheikha-runtime-memory-fabric');

router.get('/status', (_req, res) => {
  return res.json(fabric.status());
});

router.post('/remember', (req, res) => {
  const body = req.body || {};

  return res.json(
    fabric.remember(
      body.type || 'runtime-state',
      body.payload || {},
      body.meta || {}
    )
  );
});

module.exports = router;
