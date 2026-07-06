'use strict';

const express = require('express');
const router = express.Router();

const synchronizer =
require('../../core/kernel/synchronization/sheikha-runtime-synchronizer');

router.get('/status', (_req, res) => {
  return res.json(synchronizer.snapshot());
});

router.post('/sync', (_req, res) => {
  return res.json(synchronizer.sync());
});

module.exports = router;
