'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  resourcePlan
} = require('../../runtime/planetary-resource-fabric/v77/sheikha-planetary-resource-fabric-v77');

router.get('/api/sheikha/planetary-resource-fabric/v77/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/planetary-resource-fabric/v77/demo', (_req, res) => res.json(resourcePlan()));
router.post('/api/sheikha/planetary-resource-fabric/v77/plan', (req, res) => res.json(resourcePlan(req.body || {})));

module.exports = router;
