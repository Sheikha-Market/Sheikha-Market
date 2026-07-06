'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  runtimePlan
} = require('../../runtime/arabic-runtime-fabric/v95/sheikha-arabic-runtime-fabric-v95');

router.get('/api/sheikha/arabic-runtime-fabric/v95/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/arabic-runtime-fabric/v95/demo', (_req, res) => res.json(runtimePlan()));
router.post('/api/sheikha/arabic-runtime-fabric/v95/plan', (req, res) => res.json(runtimePlan(req.body || {})));

module.exports = router;
