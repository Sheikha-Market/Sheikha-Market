'use strict';

const express = require('express');
const router = express.Router();

const fabric =
require('../../core/kernel/signals/sheikha-runtime-signal-fabric');

router.get('/status', (_req, res) => {
  return res.json(fabric.status());
});

router.post('/emit', (req, res) => {
  const body = req.body || {};

  return res.json(
    fabric.emit(
      body.signal || 'runtime',
      body.payload || {}
    )
  );
});

module.exports = router;
