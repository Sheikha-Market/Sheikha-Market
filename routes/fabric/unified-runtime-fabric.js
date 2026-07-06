'use strict';

const express = require('express');
const router = express.Router();

const fabric =
require('../../core/kernel/fabric/unified/sheikha-unified-runtime-fabric');

router.get('/status', (_req, res) => {
  return res.json(fabric.status());
});

router.post('/activate', (_req, res) => {
  return res.json(fabric.activate());
});

router.post('/topology', (_req, res) => {
  return res.json(fabric.topology());
});

module.exports = router;
