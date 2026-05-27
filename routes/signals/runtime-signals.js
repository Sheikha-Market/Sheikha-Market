'use strict';

const express = require('express');
const router = express.Router();

const signals = require('../../core/kernel/signals/sheikha-runtime-signals');

router.get('/status', (_req, res) => res.json(signals.status()));

router.post('/emit', (req, res) => {
  return res.json(signals.emit(req.body || {}));
});

module.exports = router;
