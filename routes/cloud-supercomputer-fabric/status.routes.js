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
    'runtime/cloud-supercomputer-fabric/v1/sheikha-cloud-supercomputer-fabric-v1.json'
  );
  const report = readJson(
    'runtime/cloud-supercomputer-fabric/v1/sheikha-cloud-supercomputer-fabric-v1-report.json'
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
    'runtime/cloud-supercomputer-fabric/v1/sheikha-cloud-supercomputer-fabric-v1.json'
  );

  return res.json({
    success: true,
    layers: registry.fabric_layers,
    rules: registry.rules,
    truthfulness: registry.truthfulness,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
