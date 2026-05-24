'use strict';

const express = require('express');
const router = express.Router();

const {
  CHAT_FABRIC,
  evaluateChatRequest
} = require('../../core/chat-fabric/sheikha-unified-chat-fabric');

router.get('/status', (_req, res) => {
  res.json({
    success: true,
    ...CHAT_FABRIC,
    timestamp: new Date().toISOString()
  });
});

router.post('/evaluate', express.json(), (req, res) => {
  res.json(evaluateChatRequest(req.body));
});

module.exports = router;
