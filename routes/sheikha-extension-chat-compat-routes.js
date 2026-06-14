'use strict';

const express = require('express');
const router = express.Router();
const { handleConversation } = require('../runtime/conversation-engine/sheikha-conversation-engine-v1');

router.get('/api/sheikha/extension/chat/status', (_req, res) => {
  res.json({
    success: true,
    status: 'ACTIVE',
    route: 'SHEIKHA_EXTENSION_CHAT_COMPAT_V1',
    conversationEngine: '/api/sheikha/conversation-engine/v1/chat',
    unifiedChatFallback: '/api/sheikha/unified-chat',
    governedBy: 'SHEIKHA_CONVERSATION_ENGINE_V1'
  });
});

router.post('/api/sheikha/extension/chat', express.json({ limit: '5mb' }), async (req, res) => {
  const result = await handleConversation({ ...(req.body || {}), channel: 'extension-chat' });
  res.status(result.blocked ? 403 : 200).json(result);
});

module.exports = router;
