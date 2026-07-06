'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  intelligencePlan
} = require('../../runtime/civilization-intelligence-fabric/v79/sheikha-civilization-intelligence-fabric-v79');

router.get('/api/sheikha/civilization-intelligence-fabric/v79/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/civilization-intelligence-fabric/v79/demo', (_req, res) => res.json(intelligencePlan()));
router.post('/api/sheikha/civilization-intelligence-fabric/v79/plan', (req, res) => res.json(intelligencePlan(req.body || {})));

module.exports = router;
