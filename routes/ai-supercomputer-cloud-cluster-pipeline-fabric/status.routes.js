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
    'runtime/ai-supercomputer-cloud-cluster-pipeline-fabric/v1/sheikha-ai-supercomputer-cloud-cluster-pipeline-fabric-v1.json'
  );
  const report = readJson(
    'runtime/ai-supercomputer-cloud-cluster-pipeline-fabric/v1/sheikha-ai-supercomputer-cloud-cluster-pipeline-fabric-v1-report.json'
  );

  return res.json({
    success: true,
    registry,
    report,
    timestamp: new Date().toISOString()
  });
});

router.get('/components', (_req, res) => {
  const registry = readJson(
    'runtime/ai-supercomputer-cloud-cluster-pipeline-fabric/v1/sheikha-ai-supercomputer-cloud-cluster-pipeline-fabric-v1.json'
  );

  return res.json({
    success: true,
    components: registry.fabric_components,
    rules: registry.rules,
    truthfulness: registry.truthfulness,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
