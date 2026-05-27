'use strict';

const express = require('express');
const router = express.Router();
const memory = require('../../core/kernel/memory/operational/memory-governor');

router.get('/status', (_req, res) => res.json(memory.status()));

router.post('/remember', (req, res) => {
  return res.json(memory.remember(req.body || {}));
});

module.exports = router;
