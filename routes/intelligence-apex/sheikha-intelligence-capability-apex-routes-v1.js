'use strict';

const fs = require('node:fs');
const path = require('node:path');
const express = require('express');

const {
  FILES,
  MODE_PROFILES,
  buildCapabilityRegistry,
  buildRoutingPlan,
  buildStatus,
  discoverLocalModels,
  executeIntelligenceRequest
} = require(
  '../../core/intelligence-apex/' +
  'sheikha-intelligence-capability-apex-v1'
);

const router = express.Router();
const ROOT = path.resolve(__dirname, '..', '..');

router.use(express.json({ limit: '256kb' }));

function normalizeInput(body = {}) {
  return {
    ...body,
    prompt: String(
      body.prompt || body.message || body.text || ''
    ).trim()
  };
}

function publicRoutingPlan(plan) {
  const {
    sanitizedPrompt: _sanitizedPrompt,
    ...publicPlan
  } = plan;
  return publicPlan;
}

router.get('/status', async (_req, res) => {
  const data = await buildStatus();
  res.set('Cache-Control', 'no-store');
  res.status(data.passed ? 200 : 503).json({
    ok: data.passed,
    data
  });
});

router.get('/modes', (_req, res) => {
  res.json({
    ok: true,
    data: {
      modes: MODE_PROFILES,
      automaticHighImpactExecution: false,
      ultraBudgetApprovalRequired: true,
      independentModelProcessesClaimed: false
    }
  });
});

router.get('/models', async (_req, res) => {
  const data = await discoverLocalModels();
  res.set('Cache-Control', 'no-store');
  res.status(data.online ? 200 : 503).json({
    ok: data.online,
    data
  });
});

router.get('/capabilities', async (_req, res) => {
  const inventory = await discoverLocalModels();
  const data = buildCapabilityRegistry(inventory);
  res.set('Cache-Control', 'no-store');
  res.json({ ok: true, data });
});

router.post('/route', async (req, res) => {
  const input = normalizeInput(req.body);
  const inventory = await discoverLocalModels();
  const data = publicRoutingPlan(
    buildRoutingPlan(input, inventory)
  );
  const blocked = data.status === 'BLOCKED';
  res.set('Cache-Control', 'no-store');
  res.status(blocked ? 422 : 200).json({
    ok: !blocked,
    data
  });
});

router.post('/ask', async (req, res) => {
  const result = await executeIntelligenceRequest(
    normalizeInput(req.body)
  );
  res.set('Cache-Control', 'no-store');
  res.status(result.status === 'BLOCKED_BY_GOVERNANCE' ? 403 : 200)
    .json({
      ok: result.success,
      data: result
    });
});

router.get('/benchmark', (_req, res) => {
  const target = path.join(ROOT, FILES.benchmark);
  try {
    const data = JSON.parse(fs.readFileSync(target, 'utf8'));
    res.set('Cache-Control', 'no-store');
    res.json({ ok: true, data });
  } catch {
    res.status(404).json({
      ok: false,
      error: 'LOCAL_BENCHMARK_NOT_EXECUTED',
      comparisonClaimAllowed: false
    });
  }
});

module.exports = router;
