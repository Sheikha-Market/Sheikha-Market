'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  researchPlan
} = require('../../runtime/research-innovation-fabric/v72/sheikha-research-innovation-fabric-v72');

router.get('/api/sheikha/research-innovation-fabric/v72/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/research-innovation-fabric/v72/demo', (_req, res) => res.json(researchPlan()));
router.post('/api/sheikha/research-innovation-fabric/v72/plan', (req, res) => res.json(researchPlan(req.body || {})));

module.exports = router;
