'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  capabilityPlan
} = require('../../runtime/capability-registry-mesh-fabric/v123/sheikha-capability-registry-mesh-fabric-v123');

router.get('/api/sheikha/capability-registry-mesh-fabric/v123/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/capability-registry-mesh-fabric/v123/demo', (_req, res) => res.json(capabilityPlan()));
router.post('/api/sheikha/capability-registry-mesh-fabric/v123/plan', (req, res) => res.json(capabilityPlan(req.body || {})));

module.exports = router;
