'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  federationPlan
} = require('../../runtime/multi-agent-federation-fabric/v88/sheikha-multi-agent-federation-fabric-v88');

router.get('/api/sheikha/multi-agent-federation-fabric/v88/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/multi-agent-federation-fabric/v88/demo', (_req, res) => res.json(federationPlan()));
router.post('/api/sheikha/multi-agent-federation-fabric/v88/plan', (req, res) => res.json(federationPlan(req.body || {})));

module.exports = router;
