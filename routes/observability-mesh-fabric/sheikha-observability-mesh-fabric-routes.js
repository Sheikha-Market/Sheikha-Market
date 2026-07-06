'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  observabilityPlan
} = require('../../runtime/observability-mesh-fabric/v121/sheikha-observability-mesh-fabric-v121');

router.get('/api/sheikha/observability-mesh-fabric/v121/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/observability-mesh-fabric/v121/demo', (_req, res) => res.json(observabilityPlan()));
router.post('/api/sheikha/observability-mesh-fabric/v121/plan', (req, res) => res.json(observabilityPlan(req.body || {})));

module.exports = router;
