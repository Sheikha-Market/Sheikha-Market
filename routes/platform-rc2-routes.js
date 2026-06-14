'use strict';

const express = require('express');
const rc2 = require('../runtime/platform-rc2/sheikha-platform-rc2-v1');

const router = express.Router();

router.get('/api/sheikha/platform-rc2/status', (req, res) => {
  res.json({ success: true, data: rc2.status() });
});

router.get('/api/sheikha/hub/status', (req, res) => {
  res.json({ success: true, data: rc2.hub() });
});

router.get('/api/sheikha/studio/status', (req, res) => {
  res.json({ success: true, data: rc2.studio() });
});

router.get('/api/sheikha/command-center/status', (req, res) => {
  res.json({ success: true, data: rc2.commandCenter() });
});

router.get('/api/sheikha/identity/status', (req, res) => {
  res.json({ success: true, data: rc2.identity() });
});

router.get('/api/sheikha/vision/status', (req, res) => {
  res.json({ success: true, data: rc2.visionPortal() });
});

router.get('/api/sheikha/knowledge/status', (req, res) => {
  res.json({ success: true, data: rc2.knowledgePortal() });
});

router.get('/api/sheikha/database/status', (req, res) => {
  res.json({ success: true, data: rc2.databasePortal() });
});

router.post('/api/sheikha/platform-rc2/score', (req, res) => {
  res.json({ success: true, data: rc2.score(req.body || {}) });
});

module.exports = router;
