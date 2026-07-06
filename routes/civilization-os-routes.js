'use strict';

const express = require('express');
const civilization = require('../runtime/civilization-os/civilization-operating-system');

const router = express.Router();

router.get('/api/civilization-os/status', (req, res) => {
  res.json({ success: true, data: civilization.status() });
});

router.get('/api/civilization-os/registries', (req, res) => {
  res.json({ success: true, data: civilization.registries() });
});

router.get('/api/civilization-os/lifecycle', (req, res) => {
  res.json({ success: true, data: civilization.lifecycle() });
});

router.post('/api/civilization-os/score', (req, res) => {
  res.json({ success: true, data: civilization.score(req.body || {}) });
});

module.exports = router;
