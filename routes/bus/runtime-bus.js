'use strict';

const express = require('express');
const router = express.Router();

const bus = require('../../core/kernel/bus/sheikha-unified-runtime-bus-v2');

router.get('/status', (_req, res) => res.json(bus.status()));

router.post('/publish', (req, res) => {
  const body = req.body || {};
  return res.json(
    bus.publish(
      body.channel || 'kernel',
      body.event || 'runtime-event',
      body.payload || {}
    )
  );
});

router.post('/signal', (req, res) => {
  const body = req.body || {};
  return res.json(bus.signal(body.name || 'runtime-signal', body.payload || {}));
});

module.exports = router;
