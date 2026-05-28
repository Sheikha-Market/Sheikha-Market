'use strict';

const express = require('express');
const router = express.Router();

const fabric = require('../../core/kernel/supercompute/sheikha-datacenter-supercompute-fabric');

router.get('/status', (_req, res) => res.json(fabric.status()));

router.post('/node', (req, res) => {
  return res.json(fabric.registerNode(req.body || {}));
});

router.post('/report', (_req, res) => res.json(fabric.report()));

module.exports = router;
