'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  orchestrationPlan
} = require('../../runtime/global-orchestrator-fabric/v75/sheikha-global-orchestrator-fabric-v75');

router.get('/api/sheikha/global-orchestrator-fabric/v75/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/global-orchestrator-fabric/v75/demo', (_req, res) => res.json(orchestrationPlan()));
router.post('/api/sheikha/global-orchestrator-fabric/v75/plan', (req, res) => res.json(orchestrationPlan(req.body || {})));

module.exports = router;
