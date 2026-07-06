'use strict';

const express = require('express');
const router = express.Router();

const fabric =
require('../../core/kernel/distributed/sheikha-distributed-cluster-fabric');

router.get('/status', (_req, res) => {
  return res.json(fabric.status());
});

router.post('/node', (req, res) => {
  return res.json(
    fabric.registerNode(req.body || {})
  );
});

router.post('/mesh', (_req, res) => {
  return res.json(fabric.mesh());
});

module.exports = router;
