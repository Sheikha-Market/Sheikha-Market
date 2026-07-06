'use strict';

const express = require('express');
const router = express.Router();
const { therapeuticPipeline } = require('../../runtime/chat-therapy/sheikha-chat-therapeutic-pipeline-v1');

router.use(express.json({ limit: '5mb' }));

router.post('/api/sheikha/chat-therapy/v1/process', (req, res) => {
  res.json(therapeuticPipeline(req.body || {}));
});

router.get('/api/sheikha/chat-therapy/v1/status', (_req, res) => {
  res.json({
    success: true,
    status: 'ACTIVE',
    engine: 'SHEIKHA_CHAT_THERAPEUTIC_PIPELINE_V1',
    includes: [
      'Input Intake',
      'Sanitization',
      'Intent Classification',
      'Memory Governance',
      'Governance Review',
      'Context Minimization',
      'Safe Execution Readiness'
    ]
  });
});

module.exports = router;
