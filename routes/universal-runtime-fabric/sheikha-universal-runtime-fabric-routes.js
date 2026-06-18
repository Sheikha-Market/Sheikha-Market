'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  runtimePlan
} = require('../../runtime/universal-runtime-fabric/v82/sheikha-universal-runtime-fabric-v82');

router.get('/api/sheikha/universal-runtime-fabric/v82/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/universal-runtime-fabric/v82/demo', (_req, res) => res.json(runtimePlan()));
router.post('/api/sheikha/universal-runtime-fabric/v82/plan', (req, res) => res.json(runtimePlan(req.body || {})));

module.exports = router;
