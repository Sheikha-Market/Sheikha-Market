'use strict';

const express = require('express');
const mission = require('../runtime/executive-mission-control/executive-mission-control-v1');

const router = express.Router();

router.get('/api/executive/mission-control/status', (req, res) => {
  res.json({ success: true, data: mission.status() });
});

router.post('/api/executive/mission-control/scorecard', (req, res) => {
  res.json({ success: true, data: mission.scorecard(req.body || {}) });
});

router.get('/api/executive/mission-control/evidence', (req, res) => {
  res.json({ success: true, data: mission.evidence() });
});

router.get('/api/executive/mission-control/portfolio', (req, res) => {
  res.json({ success: true, data: mission.portfolio() });
});

module.exports = router;
