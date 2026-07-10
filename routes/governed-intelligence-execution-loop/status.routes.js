'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const {
  runReasoning,
  status: computingCognitiveStatus
} = require('../../runtime/computing-cognitive-layers/v1/sheikha-computing-cognitive-layers-v1');

router.use(express.json({ limit: '1mb' }));

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8'));
}

router.get('/status', (_req, res) => {
  return res.json({
    success: true,
    registry: readJson('runtime/governed-intelligence-execution-loop/v1/sheikha-governed-intelligence-execution-loop-v1.json'),
    report: readJson('runtime/governed-intelligence-execution-loop/v1/sheikha-governed-intelligence-execution-loop-v1-report.json'),
    timestamp: new Date().toISOString()
  });
});

router.get('/modes', (_req, res) => {
  return res.json({
    success: true,
    modes: readJson('runtime/governed-intelligence-execution-loop/v1/registries/intelligence-mode-execution-registry.json'),
    timestamp: new Date().toISOString()
  });
});

router.get('/loop', (_req, res) => {
  return res.json({
    success: true,
    loop: readJson('runtime/governed-intelligence-execution-loop/v1/registries/execution-impact-loop-registry.json'),
    timestamp: new Date().toISOString()
  });
});

router.get('/reasoning/status', (_req, res) => {
  return res.json({
    success: true,
    system: computingCognitiveStatus(),
    timestamp: new Date().toISOString()
  });
});

router.post('/reasoning', (req, res) => {
  const result = runReasoning(req.body || {});
  return res.status(result.status === 'BLOCKED_BY_SAFETY_POLICY' ? 403 : 200).json({
    success: result.status !== 'BLOCKED_BY_SAFETY_POLICY',
    result,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
