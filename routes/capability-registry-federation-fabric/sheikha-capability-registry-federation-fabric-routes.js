'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  capabilityPlan
} = require('../../runtime/capability-registry-federation-fabric/v89/sheikha-capability-registry-federation-fabric-v89');

router.get('/api/sheikha/capability-registry-federation-fabric/v89/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/capability-registry-federation-fabric/v89/demo', (_req, res) => res.json(capabilityPlan()));
router.post('/api/sheikha/capability-registry-federation-fabric/v89/plan', (req, res) => res.json(capabilityPlan(req.body || {})));

module.exports = router;
