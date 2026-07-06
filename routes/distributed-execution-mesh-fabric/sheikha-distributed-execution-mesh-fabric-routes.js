'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  executionPlan
} = require('../../runtime/distributed-execution-mesh-fabric/v117/sheikha-distributed-execution-mesh-fabric-v117');

router.get('/api/sheikha/distributed-execution-mesh-fabric/v117/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/distributed-execution-mesh-fabric/v117/demo', (_req, res) => res.json(executionPlan()));
router.post('/api/sheikha/distributed-execution-mesh-fabric/v117/plan', (req, res) => res.json(executionPlan(req.body || {})));

module.exports = router;
