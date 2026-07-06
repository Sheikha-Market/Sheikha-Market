'use strict';

const express = require('express');
const router = express.Router();
const apex = require('../../runtime/action-first-chat-apex/v1/sheikha-action-first-chat-apex-v1');

router.get('/status', (_req, res) => {
  res.json({ success: true, data: apex.actionPolicy('status') });
});

router.post('/classify', (req, res) => {
  res.json({
    success: true,
    data: apex.actionPolicy(req.body?.message || '')
  });
});

module.exports = router;
