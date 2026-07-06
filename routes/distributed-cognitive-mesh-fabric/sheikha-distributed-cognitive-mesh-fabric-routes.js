'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  meshPlan
} = require('../../runtime/distributed-cognitive-mesh-fabric/v90/sheikha-distributed-cognitive-mesh-fabric-v90');

router.get('/api/sheikha/distributed-cognitive-mesh-fabric/v90/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/distributed-cognitive-mesh-fabric/v90/demo', (_req, res) => res.json(meshPlan()));
router.post('/api/sheikha/distributed-cognitive-mesh-fabric/v90/plan', (req, res) => res.json(meshPlan(req.body || {})));

module.exports = router;
