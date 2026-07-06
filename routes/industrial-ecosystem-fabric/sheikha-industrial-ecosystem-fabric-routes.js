'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  ecosystemPlan
} = require('../../runtime/industrial-ecosystem-fabric/v78/sheikha-industrial-ecosystem-fabric-v78');

router.get('/api/sheikha/industrial-ecosystem-fabric/v78/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/industrial-ecosystem-fabric/v78/demo', (_req, res) => res.json(ecosystemPlan()));
router.post('/api/sheikha/industrial-ecosystem-fabric/v78/plan', (req, res) => res.json(ecosystemPlan(req.body || {})));

module.exports = router;
