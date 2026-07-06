'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  orchestrationPlan
} = require('../../runtime/civilization-operating-system/v70/sheikha-civilization-operating-system-v70');

router.get('/api/sheikha/civilization-operating-system/v70/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/civilization-operating-system/v70/demo', (_req, res) => res.json(orchestrationPlan()));
router.post('/api/sheikha/civilization-operating-system/v70/plan', (req, res) => res.json(orchestrationPlan(req.body || {})));

module.exports = router;
