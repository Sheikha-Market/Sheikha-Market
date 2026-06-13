'use strict';

const express = require('express');
const router = express.Router();
const { handleConversation } = require('../../runtime/conversation-engine/sheikha-conversation-engine-v1');

router.use(express.json({ limit: '5mb' }));

router.get('/api/sheikha/conversation-engine/v1/status', (_req, res) => {
  res.json({
    success: true,
    status: 'ACTIVE',
    engine: 'SHEIKHA_CONVERSATION_ENGINE_V1',
    role: 'Primary human conversational response layer before inspector output'
  });
});

router.post('/api/sheikha/conversation-engine/v1/chat', (req, res) => {
  res.json(handleConversation(req.body || {}));
});

module.exports = router;
