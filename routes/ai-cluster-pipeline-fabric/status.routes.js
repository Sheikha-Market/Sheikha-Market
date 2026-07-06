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
    'runtime/ai-cluster-pipeline-fabric/v1/sheikha-ai-cluster-pipeline-fabric-v1.json'
  );
  const report = readJson(
    'runtime/ai-cluster-pipeline-fabric/v1/sheikha-ai-cluster-pipeline-fabric-v1-report.json'
  );

  return res.json({
    success: true,
    registry,
    report,
    timestamp: new Date().toISOString()
  });
});

router.get('/topology', (_req, res) => {
  const topology = readJson(
    'runtime/ai-cluster-pipeline-fabric/v1/registries/cluster-topology-registry.json'
  );
  const pipeline = readJson(
    'runtime/ai-cluster-pipeline-fabric/v1/registries/ai-pipeline-stages-registry.json'
  );

  return res.json({
    success: true,
    topology,
    pipeline,
    timestamp: new Date().toISOString()
  });
});

router.get('/tools', (_req, res) => {
  const tooling = readJson(
    'runtime/ai-cluster-pipeline-fabric/v1/registries/ai-pipeline-tooling-registry.json'
  );
  const governance = readJson(
    'runtime/ai-cluster-pipeline-fabric/v1/registries/cluster-pipeline-governance-registry.json'
  );

  return res.json({
    success: true,
    tooling,
    governance,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
