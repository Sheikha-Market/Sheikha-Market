const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

function readJson(relativePath) {
  return JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), relativePath),
      'utf8'
    )
  );
}

router.get('/status', (_req, res) => {
  const registry = readJson(
    'runtime/sovereign-commercial-ai-supercluster/v1/sheikha-sovereign-commercial-ai-supercluster-v1.json'
  );
  const report = readJson(
    'runtime/sovereign-commercial-ai-supercluster/v1/sheikha-sovereign-commercial-ai-supercluster-v1-report.json'
  );

  return res.json({
    success: true,
    registry,
    report,
    timestamp: new Date().toISOString()
  });
});

router.get('/layers', (_req, res) => {
  const registry = readJson(
    'runtime/sovereign-commercial-ai-supercluster/v1/sheikha-sovereign-commercial-ai-supercluster-v1.json'
  );

  return res.json({
    success: true,
    clusterLayers: registry.cluster_layers,
    aiPipeline: registry.ai_pipeline,
    truthfulness: registry.truthfulness,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
