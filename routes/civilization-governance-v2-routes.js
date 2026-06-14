'use strict';

const express = require('express');
const governance = require('../runtime/civilization-governance/civilization-governance-v2');

const router = express.Router();

router.get('/api/civilization-governance/v2/status', (req, res) => {
  res.json({ success: true, data: governance.status() });
});

router.get('/api/civilization-governance/v2/decisions', (req, res) => {
  res.json({ success: true, data: governance.decisionRegistry() });
});

router.get('/api/civilization-governance/v2/initiatives', (req, res) => {
  res.json({ success: true, data: governance.initiativeRegistry() });
});

router.get('/api/civilization-governance/v2/stakeholders', (req, res) => {
  res.json({ success: true, data: governance.stakeholderRegistry() });
});

router.get('/api/civilization-governance/v2/impact-objectives', (req, res) => {
  res.json({ success: true, data: governance.impactObjectives() });
});

module.exports = router;
