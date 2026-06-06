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
    'runtime/root-knowledge-agentic-fabric/v1/sheikha-root-knowledge-agentic-fabric-v1.json'
  );
  const report = readJson(
    'runtime/root-knowledge-agentic-fabric/v1/sheikha-root-knowledge-agentic-fabric-v1-report.json'
  );

  return res.json({
    success: true,
    registry,
    report,
    timestamp: new Date().toISOString()
  });
});

router.get('/levels', (_req, res) => {
  const intelligenceLevels = readJson(
    'runtime/root-knowledge-agentic-fabric/v1/registries/intelligence-levels-registry.json'
  );

  return res.json({
    success: true,
    intelligenceLevels,
    timestamp: new Date().toISOString()
  });
});

router.get('/workflow', (_req, res) => {
  const workflow = readJson(
    'runtime/root-knowledge-agentic-fabric/v1/registries/agentic-workflow-registry.json'
  );

  return res.json({
    success: true,
    workflow,
    timestamp: new Date().toISOString()
  });
});

router.get('/rag', (_req, res) => {
  const rag = readJson(
    'runtime/root-knowledge-agentic-fabric/v1/registries/rag-retrieval-registry.json'
  );

  return res.json({
    success: true,
    rag,
    timestamp: new Date().toISOString()
  });
});

router.get('/knowledge-map', (_req, res) => {
  const knowledgeMap = readJson(
    'runtime/root-knowledge-agentic-fabric/v1/registries/root-knowledge-fabric-map.json'
  );

  return res.json({
    success: true,
    knowledgeMap,
    timestamp: new Date().toISOString()
  });
});

router.get('/coverage', (_req, res) => {
  const report = readJson(
    'runtime/root-knowledge-agentic-fabric/v1/sheikha-root-knowledge-agentic-fabric-v1-report.json'
  );

  return res.json({
    success: true,
    coverage: report.coverage,
    checks: report.checks,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
