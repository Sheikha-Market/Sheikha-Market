'use strict';

const express = require('express');
const router = express.Router();

const fabric = require('../../core/kernel/supercompute/sheikha-datacenter-supercompute-fabric');
const delivery = require('../../core/kernel/supercompute/sheikha-supercompute-delivery-report');

router.get('/status', (_req, res) => res.json(fabric.status()));

router.post('/node', (req, res) => {
  return res.json(fabric.registerNode(req.body || {}));
});

router.post('/report', (_req, res) => res.json(fabric.report()));

router.get('/delivery', (_req, res) => {
  return res.json(delivery.buildDeliveryReport());
});

router.post('/delivery', (_req, res) => {
  return res.json(delivery.writeDeliveryReport());
});

module.exports = router;
