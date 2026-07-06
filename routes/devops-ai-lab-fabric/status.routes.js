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
    'runtime/devops-ai-lab-fabric/v1/sheikha-devops-ai-lab-fabric-v1.json'
  );
  const report = readJson(
    'runtime/devops-ai-lab-fabric/v1/sheikha-devops-ai-lab-fabric-v1-report.json'
  );

  return res.json({
    success: true,
    registry,
    report,
    timestamp: new Date().toISOString()
  });
});

router.get('/loop', (_req, res) => {
  const loop = readJson(
    'runtime/devops-ai-lab-fabric/v1/registries/issue-to-impact-loop-registry.json'
  );

  return res.json({
    success: true,
    loop,
    timestamp: new Date().toISOString()
  });
});

router.get('/registries', (_req, res) => {
  const gitWorkflow = readJson(
    'runtime/devops-ai-lab-fabric/v1/registries/git-workflow-registry.json'
  );
  const pipeline = readJson(
    'runtime/devops-ai-lab-fabric/v1/registries/pipeline-registry.json'
  );
  const apiIntegrationLab = readJson(
    'runtime/devops-ai-lab-fabric/v1/registries/api-integration-lab-registry.json'
  );
  const experimentToProduct = readJson(
    'runtime/devops-ai-lab-fabric/v1/registries/experiment-to-product-registry.json'
  );

  return res.json({
    success: true,
    registries: {
      gitWorkflow,
      pipeline,
      apiIntegrationLab,
      experimentToProduct
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
