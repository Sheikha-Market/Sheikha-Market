'use strict';

const express = require('express');
const router = express.Router();
const { runCognitivePipeline } = require('../../runtime/cognitive-governance-v3/sheikha-cognitive-pipeline-v3');

router.use(express.json({ limit: '5mb' }));

router.get('/api/sheikha/cognitive-pipeline/v3/status', (_req, res) => {
  res.json({
    success: true,
    status: 'ACTIVE',
    engine: 'SHEIKHA_COGNITIVE_PIPELINE_V3',
    includes: [
      'Intent Analyzer',
      'Risk Analyzer',
      'Memory Governance V2',
      'Context Minimization',
      'Inspector Review',
      'Governed Thinking Stream',
      'Answer Verification'
    ]
  });
});

router.post('/api/sheikha/cognitive-pipeline/v3/process', (req, res) => {
  res.json(runCognitivePipeline(req.body || {}));
});

module.exports = router;
