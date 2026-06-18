'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  apexPlan
} = require('../../runtime/unified-apex-fabric/v80/sheikha-unified-apex-fabric-v80');

router.get('/api/sheikha/unified-apex-fabric/v80/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/unified-apex-fabric/v80/demo', (_req, res) => res.json(apexPlan()));
router.post('/api/sheikha/unified-apex-fabric/v80/plan', (req, res) => res.json(apexPlan(req.body || {})));

module.exports = router;
