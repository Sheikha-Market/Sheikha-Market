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
    'runtime/agi-asi-research-science-fabric/v1/sheikha-agi-asi-research-science-fabric-v1.json'
  );
  const report = readJson(
    'runtime/agi-asi-research-science-fabric/v1/sheikha-agi-asi-research-science-fabric-v1-report.json'
  );

  return res.json({
    success: true,
    registry,
    report,
    timestamp: new Date().toISOString()
  });
});

router.get('/evidence', (_req, res) => {
  const evidence = readJson(
    'runtime/agi-asi-research-science-fabric/v1/registries/frontier-research-evidence-registry.json'
  );

  return res.json({
    success: true,
    evidence,
    timestamp: new Date().toISOString()
  });
});

router.get('/cycle', (_req, res) => {
  const cycle = readJson(
    'runtime/agi-asi-research-science-fabric/v1/registries/scientific-method-cycle-registry.json'
  );

  return res.json({
    success: true,
    cycle,
    timestamp: new Date().toISOString()
  });
});

router.get('/experiments', (_req, res) => {
  const experiments = readJson(
    'runtime/agi-asi-research-science-fabric/v1/registries/experiment-and-evaluation-governance.json'
  );

  return res.json({
    success: true,
    experiments,
    timestamp: new Date().toISOString()
  });
});

router.get('/curriculum', (_req, res) => {
  const curriculum = readJson(
    'runtime/agi-asi-research-science-fabric/v1/registries/science-curriculum-production-registry.json'
  );

  return res.json({
    success: true,
    curriculum,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
