'use strict';

const express = require('express');
const router = express.Router();

const { status, livingTwinPlan } = require('../../runtime/living-digital-twin-agriculture-fabric/v125/sheikha-living-digital-twin-agriculture-fabric-v125');

router.get('/api/sheikha/living-digital-twin-agriculture-fabric/v125/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/living-digital-twin-agriculture-fabric/v125/demo', (_req, res) => res.json(livingTwinPlan()));
router.post('/api/sheikha/living-digital-twin-agriculture-fabric/v125/plan', (req, res) => res.json(livingTwinPlan(req.body || {})));

module.exports = router;
