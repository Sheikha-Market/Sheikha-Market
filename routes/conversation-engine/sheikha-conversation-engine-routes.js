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

router.get('/api/sheikha/conversation-engine/v1/chat', (_req, res) => {
  res.json({
    success: true,
    status: 'ACTIVE',
    engine: 'SHEIKHA_CONVERSATION_ENGINE_V1',
    endpoint: '/api/sheikha/conversation-engine/v1/chat',
    method: 'POST',
    browserStatus: 'READY'
  });
});

router.post('/api/sheikha/conversation-engine/v1/chat', async (req, res) => {
  const result = await handleConversation(req.body || {});
  res.status(result.blocked ? 403 : 200).json(result);
});

module.exports = router;
