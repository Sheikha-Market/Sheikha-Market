'use strict';

const express = require('express');
const {
  handleConversation,
  status
} = require('../runtime/conversation-engine/sheikha-conversation-engine-v1');
const {
  buildConversationLayerStack
} = require('../runtime/conversation-engine/sheikha-conversation-layer-stack-v1');

const router = express.Router();

router.get('/api/sheikha/conversation-engine/v1/status', (req, res) => {
  res.json(status());
});

router.get('/api/sheikha/conversation-engine/v1/layers', async (_req, res) => {
  const stack = await buildConversationLayerStack('conversation layer readiness', {
    governance: {
      allowed: true,
      engine: 'SHEIKHA_GOVERNANCE_OF_GOVERNANCE_V1'
    }
  });
  res.json({ success: true, ...stack });
});

router.get('/api/sheikha/conversation-engine/v1/chat', (_req, res) => {
  res.json({
    ...status(),
    endpoint: '/api/sheikha/conversation-engine/v1/chat',
    method: 'POST',
    methodRequired: 'POST',
    browserStatus: 'READY',
    message: 'هذا المسار جاهز. استخدم POST لإرسال الرسائل.',
    requestExample: {
      message: 'اكتب رسالتك هنا',
      mode: 'smart',
      channel: 'general-web-chat'
    },
    productsReadyForActivation: [
      'SRM',
      'Procurement',
      'Supply Chain',
      'ERP',
      'HCM',
      'Asset Management',
      'Projects',
      'Executive Command Center',
      'AI Governance',
      'Enterprise Integration Hub'
    ]
  });
});

router.post('/api/sheikha/conversation-engine/v1/chat', express.json({ limit: '5mb' }), async (req, res) => {
  const result = await handleConversation(req.body || {});
  res.status(result.blocked ? 403 : 200).json(result);
});

module.exports = router;
