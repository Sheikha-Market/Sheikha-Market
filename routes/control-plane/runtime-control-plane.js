'use strict';

const express = require('express');
const router = express.Router();

const control =
require('../../core/kernel/control-plane/sheikha-runtime-control-plane');

router.get('/status', (_req, res) => {
  return res.json(control.status());
});

router.post('/activate', (_req, res) => {
  return res.json(control.activate());
});

router.post('/report', (_req, res) => {
  return res.json(control.report());
});

module.exports = router;
