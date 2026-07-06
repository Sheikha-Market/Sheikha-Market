'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  compilerPlan
} = require('../../runtime/arabic-compiler-fabric/v92/sheikha-arabic-compiler-fabric-v92');

router.get('/api/sheikha/arabic-compiler-fabric/v92/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/arabic-compiler-fabric/v92/demo', (_req, res) => res.json(compilerPlan()));
router.post('/api/sheikha/arabic-compiler-fabric/v92/plan', (req, res) => res.json(compilerPlan(req.body || {})));

module.exports = router;
