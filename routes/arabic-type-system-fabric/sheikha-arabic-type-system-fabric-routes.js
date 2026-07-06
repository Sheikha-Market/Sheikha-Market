'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  typePlan
} = require('../../runtime/arabic-type-system-fabric/v93/sheikha-arabic-type-system-fabric-v93');

router.get('/api/sheikha/arabic-type-system-fabric/v93/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/arabic-type-system-fabric/v93/demo', (_req, res) => res.json(typePlan()));
router.post('/api/sheikha/arabic-type-system-fabric/v93/plan', (req, res) => res.json(typePlan(req.body || {})));

module.exports = router;
