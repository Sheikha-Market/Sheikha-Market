'use strict';

const express = require('express');
const router = express.Router();
const living = require('../../runtime/living-conversation-apex/v1/sheikha-living-conversation-apex-v1');

router.get('/status', (_req, res) => {
  res.json({ success: true, data: living.sense('status') });
});

router.post('/sense', (req, res) => {
  res.json({ success: true, data: living.sense(req.body?.message || '', req.body?.context || {}) });
});

router.post('/compose', (req, res) => {
  res.json({ success: true, data: living.composeReply(req.body?.message || '', req.body?.context || {}) });
});

module.exports = router;
