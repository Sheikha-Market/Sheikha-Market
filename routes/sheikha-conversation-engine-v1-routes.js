'use strict';

const express = require('express');
const {
  handleConversation,
  status
} = require('../runtime/conversation-engine/sheikha-conversation-engine-v1');

const router = express.Router();

router.get('/api/sheikha/conversation-engine/v1/status', (req, res) => {
  res.json(status());
});

router.get('/api/sheikha/conversation-engine/v1/chat', (req, res) => {
  res.json({
    success: true,
    engine: 'SHEIKHA_CONVERSATION_ENGINE_V1',
    status: 'READY',
    message: 'هذا المسار جاهز. استخدم POST لإرسال الرسائل.',
    methodRequired: 'POST',
    endpoint: '/api/sheikha/conversation-engine/v1/chat',
    example: {
      method: 'POST',
      body: {
        message: 'شيخة اختبري الذاكرة والحوكمة'
      }
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

router.post('/api/sheikha/conversation-engine/v1/chat', (req, res) => {
  const result = handleConversation(req.body || {});
  res.json(result);
});

module.exports = router;
