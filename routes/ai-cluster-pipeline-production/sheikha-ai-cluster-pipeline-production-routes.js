'use strict';

const express = require('express');
const router = express.Router();

const {
  getApexStatus
} = require('../../runtime/ai-cluster-pipeline-production/v1/sheikha-ai-cluster-pipeline-production-apex-v1');

const {
  generateWithSheikhaCore,
  fastLeast
} = require('../../runtime/model-core/v1/sheikha-ollama-core-v1');

router.get('/api/sheikha/ai-cluster-pipeline-production/v1/status', (_req, res) => {
  res.json(getApexStatus());
});

router.post('/api/sheikha/ai-cluster-pipeline-production/v1/run', async (req, res) => {
  const message = req.body?.message || '';
  const mode = req.body?.mode || 'smart';

  if (mode === 'least' || req.body?.fast === true) {
    return res.json(await fastLeast(message));
  }

  try {
    const result = await generateWithSheikhaCore(message, {
      mode,
      timeoutMs: req.body?.timeoutMs || 180000,
      numPredict: req.body?.numPredict || 128
    });
    return res.json(result);
  } catch (error) {
    const fallback = await fastLeast(message);
    return res.json({
      ...fallback,
      clusterFallback: true,
      deepError: error.message
    });
  }
});

module.exports = router;
