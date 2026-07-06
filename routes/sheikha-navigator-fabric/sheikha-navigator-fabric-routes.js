'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  navigatorPlan
} = require('../../runtime/sheikha-navigator-fabric/v111/sheikha-navigator-fabric-v111');

router.get('/api/sheikha/navigator-fabric/v111/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/navigator-fabric/v111/demo', (_req, res) => res.json(navigatorPlan()));
router.post('/api/sheikha/navigator-fabric/v111/plan', (req, res) => res.json(navigatorPlan(req.body || {})));

module.exports = router;
