'use strict';

const express = require('express');
const router = express.Router();

const bus =
require('../../core/kernel/bus/sheikha-runtime-bus');

router.get('/status', (_req, res) => {
  return res.json(bus.status());
});

router.post('/emit', (req, res) => {
  const body = req.body || {};

  return res.json(
    bus.emit(
      body.channel || 'kernel',
      body.payload || {}
    )
  );
});

module.exports = router;
