'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  routingPlan
} = require('../../runtime/hyper-routing-fabric/v114/sheikha-hyper-routing-fabric-v114');

router.get('/api/sheikha/hyper-routing-fabric/v114/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/hyper-routing-fabric/v114/demo', (_req, res) => res.json(routingPlan()));
router.post('/api/sheikha/hyper-routing-fabric/v114/plan', (req, res) => res.json(routingPlan(req.body || {})));

module.exports = router;
