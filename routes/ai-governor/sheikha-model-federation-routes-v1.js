'use strict';

const express = require('express');
const fs = require('node:fs');
const path = require('node:path');
const federation = require(
  '../../runtime/sheikha-ai-governor/v1/sheikha-model-federation-v1.json'
);
const { transportPolicy } = require(
  '../../runtime/sheikha-ai-governor/v1/sheikha-model-renewal-v1'
);
const {
  OPERATIONS,
  buildTrainingPlan,
  decideLicense
} = require(
  '../../runtime/sheikha-ai-governor/v1/sheikha-model-license-training-engine-v1'
);
const ownedRouterModel = require(
  '../../runtime/sheikha-ai-governor/v1/training/sheikha-owned-router-model-v1.json'
);
const { predict } = require(
  '../../runtime/sheikha-ai-governor/v1/sheikha-owned-router-trainer-v1'
);
const { assessDistributedTraining } = require(
  '../../runtime/sheikha-ai-governor/v1/sheikha-distributed-llm-training-v1'
);
const trainingClusterInventory = require(
  '../../runtime/sheikha-ai-governor/v1/llm-training/sheikha-training-cluster-inventory-v1.json'
);
const { buildFoundryStatus } = require(
  '../../runtime/sheikha-ai-governor/v1/sheikha-model-foundry-v1'
);
const pilotTrainingReport = require(
  '../../runtime/sheikha-ai-governor/v1/llm-training/sheikha-qwen-lora-pilot-v1-report.json'
);
const pilotEvaluation = require(
  '../../runtime/sheikha-ai-governor/v1/llm-training/sheikha-qwen-lora-pilot-v1-evaluation.json'
);
const { admitGpuNode, issueInternalLicense } = require(
  '../../runtime/sheikha-ai-governor/v1/sheikha-secure-large-training-v1'
);
const { planRegionalExecution } = require(
  '../../runtime/sheikha-ai-governor/v1/sheikha-regional-provider-orchestrator-v1'
);
const regionalProviderInventory = require(
  '../../runtime/sheikha-ai-governor/v1/llm-training/sheikha-regional-provider-inventory-v1.json'
);
const { routeIntelligence } = require(
  '../../runtime/sheikha-ai-governor/v1/sheikha-value-intelligence-v1'
);
const { buildCompositeExecutionPlan } = require(
  '../../runtime/sheikha-ai-governor/v1/sheikha-composite-model-v1'
);
const localModelInventory = require(
  '../../runtime/sheikha-ai-governor/v1/sheikha-model-inventory-v1.json'
);
const nativeModelEvaluation = require(
  '../../runtime/sheikha-ai-governor/v1/sheikha-model-evaluation-v1.json'
);
const arabicGovernedEvaluation = require(
  '../../runtime/sheikha-ai-governor/v1/llm-training/' +
  'sheikha-arabic-governed-4b-evaluation.json'
);
const { buildCommercialModelReadiness } = require(
  '../../runtime/sheikha-ai-governor/v1/sheikha-commercial-model-readiness-v1'
);
const { decideLearningRun, buildPolicyCatalog } = require(
  '../../runtime/sheikha-ai-governor/v1/sheikha-learning-production-policy-v1'
);
const {
  RARITY_LEVELS,
  classifySpecializationRarity,
  buildChatLlmIntegrationPlan
} = require(
  '../../runtime/sheikha-ai-governor/v1/sheikha-llm-specialization-rarity-v1'
);

const router = express.Router();
const MAX_PAGE_SIZE = 100;

function compositeEvaluationResults() {
  const results = Object.fromEntries(
    (nativeModelEvaluation.evaluations || []).map((evaluation) => [
      evaluation.model,
      {
        passed: evaluation.status === 'EVALUATION_PASSED',
        score: evaluation.totalCount > 0
          ? evaluation.passedCount / evaluation.totalCount
          : 0,
        maximumLatencyMs: Math.max(
          0,
          ...(evaluation.results || []).map((item) =>
            Number(item.latencyMs || 0))
        )
      }
    ])
  );
  results[arabicGovernedEvaluation.model] = {
    passed: arabicGovernedEvaluation.qualityGatePassed === true,
    score: arabicGovernedEvaluation.totalCases > 0
      ? arabicGovernedEvaluation.passedCases /
        arabicGovernedEvaluation.totalCases
      : 0,
    p95LatencyMs: arabicGovernedEvaluation.p95LatencyMs
  };
  return results;
}

function bool(value) {
  if (value === undefined) return null;
  return String(value).toLowerCase() === 'true';
}

function listModels(query = {}) {
  const text = String(query.q || '').trim().toLowerCase().slice(0, 200);
  const capability = String(query.capability || '').trim().toLowerCase().slice(0, 100);
  const free = bool(query.free);
  const callable = bool(query.callable);
  const commercial = bool(query.commercial);
  const requestedLimit = Number.parseInt(query.limit, 10);
  const limit = Math.min(
    Number.isFinite(requestedLimit) && requestedLimit > 0 ? requestedLimit : 25,
    MAX_PAGE_SIZE
  );
  const filtered = federation.models.filter((model) => {
    const identity = model.upstreamIdentity;
    if (text && ![
      model.sheikhaDisplayName,
      identity.id,
      identity.name,
      identity.author,
      identity.source
    ].some((value) => String(value).toLowerCase().includes(text))) return false;
    if (capability && !model.classification.capabilities.some(
      (value) => value.toLowerCase().includes(capability)
    )) return false;
    if (free !== null && model.classification.freeAtSnapshot !== free) return false;
    if (callable !== null && model.classification.callable !== callable) return false;
    if (commercial !== null && model.rights.commercialUseVerified !== commercial) return false;
    return true;
  });
  return { total: filtered.length, limit, models: filtered.slice(0, limit) };
}

function routeDecision(body = {}) {
  const required = Array.isArray(body.capabilities)
    ? [...new Set(body.capabilities.map((value) => String(value).trim().toLowerCase()).filter(Boolean))].slice(0, 20)
    : [];
  const candidates = federation.models.filter((model) =>
    model.classification.callable &&
    model.classification.productionApproved &&
    model.rights.commercialUseVerified &&
    required.every((requiredCapability) => model.classification.capabilities.some(
      (value) => value.toLowerCase().includes(requiredCapability)
    ))
  );
  return {
    decision: candidates.length ? 'ROUTE_APPROVED' : 'NO_GOVERNED_PRODUCTION_MODEL',
    selected: candidates[0] || null,
    requiredCapabilities: required,
    modelInvoked: false,
    defaultAuthorization: 'DENY',
    missingRequirements: candidates.length ? [] : [
      'CALLABLE_PROVIDER_BINDING',
      'VERIFIED_COMMERCIAL_RIGHTS',
      'PRODUCTION_EVALUATION',
      'HUMAN_APPROVAL'
    ]
  };
}

router.get('/status', (_req, res) => res.json({
  ok: true,
  data: {
    system: federation.system,
    governingLayer: federation.governingLayer,
    summary: federation.summary,
    continuousImprovement: federation.continuousImprovement,
    transportPolicy: transportPolicy(),
    federationSha256: federation.federationSha256
  }
}));

router.post('/composite/plan', express.json({ limit: '16kb' }), (req, res) => {
  const roles = Array.isArray(req.body?.roles)
    ? req.body.roles.slice(0, 8)
    : ['arabic_governance'];
  const plan = buildCompositeExecutionPlan(localModelInventory, {
    roles,
    commercial: req.body?.commercial === true,
    evaluationResults: compositeEvaluationResults()
  });
  res.status(plan.productionCommercialApproved ? 200 : 202).json({
    ok: true,
    data: plan
  });
});

router.get('/models', (req, res) => res.json({ ok: true, data: listModels(req.query) }));

router.post('/classify', express.json({ limit: '16kb' }), (req, res) => {
  const text = String(req.body?.text || '').trim().slice(0, 4000);
  if (!text) return res.status(400).json({ ok: false, error: 'TEXT_REQUIRED' });
  return res.json({
    ok: true,
    data: {
      ...predict(ownedRouterModel, text),
      model: ownedRouterModel.system,
      modelSha256: ownedRouterModel.modelSha256,
      scope: 'REQUEST_CAPABILITY_CLASSIFICATION_ONLY'
    }
  });
});

router.get('/license/operations', (_req, res) => res.json({ ok: true, data: OPERATIONS }));

router.post('/license/decision', express.json({ limit: '32kb' }), (req, res) => {
  const decision = decideLicense(req.body || {});
  res.status(decision.reasons.length ? 409 : 200).json({
    ok: decision.reasons.length === 0,
    data: decision
  });
});

router.post('/training/plan', express.json({ limit: '64kb' }), (req, res) => {
  const plan = buildTrainingPlan(req.body || {});
  res.status(plan.blockers.length ? 409 : 200).json({
    ok: plan.blockers.length === 0,
    data: plan
  });
});

router.get('/training/distributed/status', (_req, res) => {
  const assessment = assessDistributedTraining({
    parametersB: 7,
    nodes: trainingClusterInventory.nodes
  });
  res.status(assessment.blockers.length ? 409 : 200).json({
    ok: assessment.blockers.length === 0,
    data: assessment
  });
});

router.post('/training/distributed/plan', express.json({ limit: '64kb' }), (req, res) => {
  const assessment = assessDistributedTraining({
    ...(req.body || {}),
    nodes: trainingClusterInventory.nodes
  });
  res.status(assessment.blockers.length ? 409 : 200).json({
    ok: assessment.blockers.length === 0,
    data: assessment
  });
});

router.get('/training/foundry/status', (_req, res) => {
  const data = buildFoundryStatus({
    parametersB: 7,
    nodes: trainingClusterInventory.nodes,
    pilot: {
      modelId: pilotTrainingReport.system,
      artifactSha256: pilotEvaluation.adapterSha256,
      nativeInferencePassed: pilotEvaluation.nativeInferencePassed,
      qualityGatePassed: pilotEvaluation.qualityGatePassed,
      safetyGatePassed: false,
      licenseGatePassed: false,
      securityGatePassed: false,
      canaryPassed: false,
      humanCommercialApproval: false
    }
  });
  res.json({ ok: true, data });
});

router.post('/training/nodes/admit', express.json({ limit: '32kb' }), (req, res) => {
  const decision = admitGpuNode(req.body || {});
  res.status(decision.admitted ? 200 : 409).json({ ok: decision.admitted, data: decision });
});

router.post('/training/licenses/internal/issue', express.json({ limit: '32kb' }), (req, res) => {
  const decision = issueInternalLicense(req.body || {});
  const issued = decision.status === 'INTERNAL_LICENSE_ISSUED';
  res.status(issued ? 200 : 409).json({ ok: issued, data: decision });
});

router.get('/training/providers/status', (_req, res) => res.json({
  ok: true,
  data: regionalProviderInventory
}));

router.post('/training/providers/plan', express.json({ limit: '32kb' }), (req, res) => {
  const plan = planRegionalExecution(req.body || {}, regionalProviderInventory.providers);
  res.status(plan.selected ? 200 : 409).json({ ok: Boolean(plan.selected), data: plan });
});

router.post('/intelligence/value/plan', express.json({ limit: '32kb' }), (req, res) => {
  const plan = routeIntelligence(req.body || {});
  res.status(plan.status === 'QUERY_REQUIRED' ? 400 : 200).json({
    ok: plan.status !== 'QUERY_REQUIRED',
    data: plan
  });
});

router.get('/training/scheduler/status', (_req, res) => {
  const statePath = path.join(process.cwd(),
    'runtime/sheikha-ai-governor/v1/llm-training/sheikha-training-scheduler-state-v1.json');
  try {
    const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    res.json({ ok: true, data: state });
  } catch {
    res.status(503).json({ ok: false, error: 'TRAINING_SCHEDULER_STATE_UNAVAILABLE' });
  }
});

router.get('/commercial-readiness', (_req, res) => {
  try {
    const readiness = require(
      '../../runtime/sheikha-ai-governor/v1/llm-training/sheikha-arabic-commercial-readiness-v1.json'
    );
    const evaluation = require(
      '../../runtime/sheikha-ai-governor/v1/llm-training/qwen3-4b-arabic-evaluation.json'
    );
    const gpuReportPath = path.join(process.cwd(),
      'runtime/sheikha-ai-governor/v1/llm-training/sheikha-gpu-runtime-readiness-v1.json');
    const gpuReport = fs.existsSync(gpuReportPath)
      ? JSON.parse(fs.readFileSync(gpuReportPath, 'utf8'))
      : null;
    const data = buildCommercialModelReadiness({
      brand: {
        name: 'SHEIKHA',
        arabicName: 'شيخة',
        website: 'https://www.sheikha.top',
        trademarkStatus: 'REGISTRATION_NOT_EVIDENCED'
      },
      readiness,
      evaluation,
      runtime: {
        gpuInferenceVerified: gpuReport?.local?.ollamaGpuInferenceVerified === true,
        securityGatePassed: false,
        loadGatePassed: false,
        recoveryGatePassed: false,
        legalApproval: false,
        humanApproval: false
      }
    });
    data.gpuRuntime = gpuReport;
    res.json({ ok: true, data });
  } catch {
    res.status(503).json({ ok: false, error: 'COMMERCIAL_READINESS_EVIDENCE_UNAVAILABLE' });
  }
});

router.get('/production-tiers', (_req, res) => {
  const reportPath = path.join(process.cwd(),
    'runtime/sheikha-ai-governor/v1/llm-training/sheikha-production-tier-readiness-v1.json');
  try {
    res.json({ ok: true, data: JSON.parse(fs.readFileSync(reportPath, 'utf8')) });
  } catch {
    res.status(503).json({ ok: false, error: 'PRODUCTION_TIER_EVIDENCE_UNAVAILABLE' });
  }
});

router.get('/learning/policy', (_req, res) => res.json({
  ok: true,
  data: buildPolicyCatalog()
}));

router.get('/specializations/rarity/levels', (_req, res) => res.json({
  ok: true,
  data: {
    system: 'SHEIKHA_LLM_SPECIALIZATION_RARITY_LEVELS_V1',
    levels: RARITY_LEVELS,
    boundary: 'RARITY_REQUIRES_DOMAIN_EVIDENCE_AND_DOES_NOT_PROVE_MODEL_SUPERIORITY'
  }
}));

router.post('/specializations/rarity/classify', express.json({ limit: '16kb' }), (req, res) => {
  const result = classifySpecializationRarity(req.body || {});
  res.status(result.status === 'RARITY_NOT_MEASURED' ? 422 : 200).json({
    ok: result.status !== 'RARITY_NOT_MEASURED',
    data: result
  });
});

router.post('/chat-llm/integration/plan', express.json({ limit: '32kb' }), (req, res) => {
  const plan = buildChatLlmIntegrationPlan(req.body || {});
  res.status(plan.blockers.length ? 409 : 200).json({
    ok: plan.blockers.length === 0,
    data: plan
  });
});

router.post('/learning/decision', express.json({ limit: '64kb' }), (req, res) => {
  const decision = decideLearningRun(req.body || {});
  res.status(decision.admitted ? 200 : 409).json({ ok: decision.admitted, data: decision });
});

router.post('/route', express.json({ limit: '32kb' }), (req, res) => {
  const decision = routeDecision(req.body || {});
  res.status(decision.selected ? 200 : 409).json({
    ok: Boolean(decision.selected),
    data: decision
  });
});

module.exports = router;
module.exports.listModels = listModels;
module.exports.routeDecision = routeDecision;
