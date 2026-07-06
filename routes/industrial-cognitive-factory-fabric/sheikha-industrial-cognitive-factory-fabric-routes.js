'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  factoryPlan,
  demoPlan
} = require('../../runtime/industrial-cognitive-factory-fabric/v1/sheikha-industrial-cognitive-factory-fabric-v65');

router.get('/api/sheikha/industrial-cognitive-factory-fabric/v65/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/industrial-cognitive-factory-fabric/v65/demo', (_req, res) => res.json(demoPlan()));
router.post('/api/sheikha/industrial-cognitive-factory-fabric/v65/plan', (req, res) => res.json(factoryPlan(req.body || {})));

module.exports = router;
