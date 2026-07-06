'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  createPlan,
  recordEvent,
  selfHeal
} = require('../../runtime/cosmic-production-fabric/v1/sheikha-cosmic-production-fabric-v1');

router.get('/api/sheikha/cosmic-production-fabric/v1/status', (_req, res) => res.json(status()));
router.post('/api/sheikha/cosmic-production-fabric/v1/plan', (req, res) => res.json(createPlan(req.body || {})));
router.post('/api/sheikha/cosmic-production-fabric/v1/event', (req, res) => res.json(recordEvent(req.body || {})));
router.post('/api/sheikha/cosmic-production-fabric/v1/self-heal', (_req, res) => res.json(selfHeal()));

module.exports = router;
