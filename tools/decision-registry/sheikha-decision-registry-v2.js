'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

function resolvePath(p) {
  return path.join(ROOT, p);
}

function exists(p) {
  return fs.existsSync(resolvePath(p));
}

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(resolvePath(p), 'utf8'));
  } catch {
    return null;
  }
}

function mkdir(p) {
  fs.mkdirSync(resolvePath(p), { recursive: true });
}

const dependencies = {
  heartCore: exists('runtime/heart-core/v1/sheikha-heart-core-report.json'),
  rootAuthorityLayer: exists('runtime/root-authority-layer/v1/sheikha-root-authority-layer-report.json'),
  knowledgeEngineV2: exists('runtime/knowledge-engine/v2/sheikha-knowledge-engine-v2-report.json'),
  stabilityLayer: exists('runtime/stability-layer/v1/sheikha-stability-layer-report.json'),
  runtimeContractEnforcer: exists('runtime/runtime-contract-enforcer/v1/sheikha-runtime-contract-enforcer-report.json'),
  apiContractRegistryV2: exists('runtime/api-contract-registry/v2/sheikha-api-contract-registry-v2.json'),
  prGovernance: exists('runtime/pr-governance/reviews/pr-22/review-decision.json')
};

const lessons = readJson('runtime/knowledge-engine/v2/registries/lessons-learned-registry.json');
const governance = readJson('runtime/knowledge-engine/v2/registries/governance-knowledge-registry.json');
const runtime = readJson('runtime/knowledge-engine/v2/registries/runtime-knowledge-registry.json');

function registryItems(registry) {
  return Array.isArray(registry?.items) ? registry.items : [];
}

const knowledgeCoverage = {
  lessonsLearnedItems: registryItems(lessons).length,
  governanceKnowledgeItems: registryItems(governance).length,
  runtimeKnowledgeItems: registryItems(runtime).length
};

const decisions = [
  {
    id: 'DRV2-001',
    title: 'Root Authority remains the governing layer',
    decision: 'Heart Core and Root Authority govern all downstream runtime, knowledge, registry, and execution layers.',
    status: 'ACTIVE',
    authority: 'SHEIKHA_ROOT_AUTHORITY_LAYER_V1',
    risk: 'HIGH',
    protected: true,
    knowledgeLinks: ['GK-002', 'RK-002'],
    evidence: [
      'runtime/root-authority-layer/v1/sheikha-root-authority-layer-report.json',
      'runtime/heart-core/v1/sheikha-heart-core-report.json'
    ],
    enforcement: {
      rootAuthorityRequired: true,
      humanReviewForHighRisk: true
    }
  },
  {
    id: 'DRV2-002',
    title: 'Knowledge evidence is required before decisions',
    decision: 'Every governed decision must link to knowledge, lessons, runtime evidence, or PR governance output.',
    status: 'ACTIVE',
    authority: 'SHEIKHA_KNOWLEDGE_ENGINE_V2',
    risk: 'HIGH',
    protected: true,
    knowledgeLinks: ['GK-001', 'LL-PR22-003'],
    evidence: [
      'runtime/knowledge-engine/v2/sheikha-knowledge-engine-v2-report.json',
      'runtime/knowledge-engine/v2/registries/lessons-learned-registry.json'
    ],
    enforcement: {
      evidenceRequired: true,
      knowledgeLinkRequired: true
    }
  },
  {
    id: 'DRV2-003',
    title: 'Runtime API contract stability is mandatory',
    decision: 'Extension-facing runtime APIs must follow API Contract V2 or pass through a governed compatibility adapter.',
    status: 'ACTIVE',
    authority: 'SHEIKHA_API_CONTRACT_REGISTRY_V2',
    risk: 'MEDIUM',
    protected: true,
    knowledgeLinks: ['RK-001', 'LL-PR22-002'],
    evidence: [
      'runtime/api-contract-registry/v2/sheikha-api-contract-check-report-v2.json',
      'runtime/extension-compatibility/v2/sheikha-extension-compatibility-v2.json'
    ],
    enforcement: {
      successDataMetaRequired: true,
      liveIntegrationTestsGated: true
    }
  },
  {
    id: 'DRV2-004',
    title: 'Stability baseline gates expansion',
    decision: 'No new upper layer is considered active until tests, lint, stability score, and drift checks are clean.',
    status: 'ACTIVE',
    authority: 'SHEIKHA_STABILITY_LAYER_V1',
    risk: 'HIGH',
    protected: true,
    knowledgeLinks: ['GK-003', 'RK-003'],
    evidence: [
      'runtime/stability-layer/v1/sheikha-stability-layer-report.json',
      'tools/drift/sheikha-runtime-drift-detector.js'
    ],
    enforcement: {
      stabilityScoreRequired: 100,
      noDriftRequired: true
    }
  },
  {
    id: 'DRV2-005',
    title: 'Curated merge is required',
    decision: 'Raw merge is disallowed; PRs require checks, governance review, drift control, and curated human decision.',
    status: 'ACTIVE',
    authority: 'SHEIKHA_PR_GOVERNANCE',
    risk: 'HIGH',
    protected: true,
    knowledgeLinks: ['GK-001', 'LL-PR22-001'],
    evidence: [
      'runtime/pr-governance/reviews/pr-22/review-decision.json',
      'tools/governance/runtime-admission-controller.js'
    ],
    enforcement: {
      rawMergeAllowed: false,
      checksRequired: true,
      admissionRequired: true
    }
  },
  {
    id: 'DRV2-006',
    title: 'Capability Registry V2 is the next allowed layer',
    decision: 'Capability Registry V2 may activate only after Decision Registry V2 is ACTIVE with score 100.',
    status: 'ACTIVE',
    authority: 'SHEIKHA_DECISION_REGISTRY_V2',
    risk: 'MEDIUM',
    protected: true,
    knowledgeLinks: ['GK-003', 'RK-003'],
    evidence: [
      'tools/decision-registry/sheikha-decision-registry-v2.js',
      'docs/decision-registry/SHEIKHA-DECISION-REGISTRY-V2.md'
    ],
    enforcement: {
      decisionRegistryScoreRequired: 100,
      capabilityRegistryBlockedUntilReady: true
    }
  },
  {
    id: 'DRV2-007',
    title: 'Execution Fabric V2 remains gated',
    decision: 'Execution Fabric V2 must wait until Decision Registry V2 and Capability Registry V2 are both active and governed.',
    status: 'ACTIVE',
    authority: 'SHEIKHA_DECISION_REGISTRY_V2',
    risk: 'HIGH',
    protected: true,
    knowledgeLinks: ['GK-001', 'GK-003'],
    evidence: [
      'docs/knowledge/SHEIKHA-KNOWLEDGE-ENGINE-V2.md',
      'runtime/knowledge-engine/v2/sheikha-knowledge-engine-v2-report.json'
    ],
    enforcement: {
      noExecutionWithoutDecisionRegistry: true,
      noExecutionWithoutCapabilityRegistry: true
    }
  }
];

function decisionComplete(decision) {
  return Boolean(
    decision.id &&
    decision.title &&
    decision.decision &&
    decision.status === 'ACTIVE' &&
    decision.authority &&
    decision.protected === true &&
    Array.isArray(decision.knowledgeLinks) &&
    decision.knowledgeLinks.length > 0 &&
    Array.isArray(decision.evidence) &&
    decision.evidence.length > 0 &&
    decision.enforcement &&
    Object.keys(decision.enforcement).length > 0
  );
}

const knownKnowledgeIds = new Set([
  ...registryItems(lessons).map((item) => item.id),
  ...registryItems(governance).map((item) => item.id),
  ...registryItems(runtime).map((item) => item.id)
]);

const registry = {
  system: 'SHEIKHA_DECISION_REGISTRY_V2',
  registry: 'SHEIKHA_DECISION_REGISTRY_V2',
  status: 'ACTIVE',
  arabic_name: 'سجل قرارات شيخة V2',
  purpose: 'Convert governed knowledge into traceable decisions before capability registration and execution fabric activation.',
  position: 'UNDER_KNOWLEDGE_ENGINE_BEFORE_CAPABILITY_REGISTRY',
  governed_by: [
    'SHEIKHA_HEART_CORE_V1',
    'SHEIKHA_ROOT_AUTHORITY_LAYER_V1',
    'SHEIKHA_KNOWLEDGE_ENGINE_V2',
    'SHEIKHA_STABILITY_LAYER_V1'
  ],
  decision_model: {
    idRequired: true,
    titleRequired: true,
    authorityRequired: true,
    evidenceRequired: true,
    knowledgeLinksRequired: true,
    enforcementRequired: true,
    protectedDefault: true
  },
  dependencies,
  knowledgeCoverage,
  decisions,
  rules: {
    no_decision_without_evidence: true,
    no_execution_without_decision_registry: true,
    no_capability_registry_without_decision_registry: true,
    no_raw_merge: true,
    no_drift_required: true,
    stability_score_required: 100,
    human_review_for_high_risk: true
  },
  next_layer: 'SHEIKHA_CAPABILITY_REGISTRY_V2',
  blocked_until_ready: [
    'SHEIKHA_EXECUTION_FABRIC_V2'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

const checks = {
  dependenciesReady: Object.values(dependencies).every(Boolean),
  knowledgeRegistriesReady: Object.values(knowledgeCoverage).every((count) => count > 0),
  decisionCountReady: decisions.length >= 7,
  everyDecisionComplete: decisions.every(decisionComplete),
  everyDecisionProtected: decisions.every((decision) => decision.protected === true),
  everyDecisionHasEvidence: decisions.every((decision) => decision.evidence.length > 0),
  everyDecisionEvidenceExists: decisions.every((decision) =>
    decision.evidence.every((evidencePath) => exists(evidencePath))
  ),
  everyDecisionHasKnowledgeLinks: decisions.every((decision) => decision.knowledgeLinks.length > 0),
  everyDecisionKnowledgeLinksResolvable: decisions.every((decision) =>
    decision.knowledgeLinks.every((id) => knownKnowledgeIds.has(id))
  ),
  capabilityRegistryGated: registry.next_layer === 'SHEIKHA_CAPABILITY_REGISTRY_V2',
  executionFabricGated: registry.blocked_until_ready.includes('SHEIKHA_EXECUTION_FABRIC_V2')
};

const missing = Object.entries(checks).filter(([, ok]) => !ok).map(([key]) => key);

const report = {
  system: 'SHEIKHA_DECISION_REGISTRY_V2',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  arabicName: 'سجل قرارات شيخة V2',
  score: missing.length ? Math.max(0, 100 - missing.length * 8) : 100,
  decision: missing.length ? 'REVIEW_DECISION_REGISTRY_GAPS' : 'DECISION_REGISTRY_V2_ACTIVE_100',
  checks,
  missing,
  dependencies,
  knowledgeCoverage,
  decisionCount: decisions.length,
  nextLayer: registry.next_layer,
  blockedUntilReady: registry.blocked_until_ready,
  nextActions: [
    'Activate Capability Registry V2 only after Decision Registry V2 is clean.',
    'Map each capability to one or more governed decisions.',
    'Keep Execution Fabric V2 gated until capability registry and decision registry are both active.'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

mkdir('runtime/decision-registry/v2');

fs.writeFileSync(
  resolvePath('runtime/decision-registry/v2/sheikha-decision-registry-v2.json'),
  JSON.stringify(registry, null, 2)
);

fs.writeFileSync(
  resolvePath('runtime/decision-registry/v2/sheikha-decision-registry-v2-report.json'),
  JSON.stringify(report, null, 2)
);

fs.writeFileSync(
  resolvePath('runtime/decision-registry/v2/sheikha-decision-registry-v2-report.md'),
  `# SHEIKHA_DECISION_REGISTRY_V2

## الحالة
- النظام: ${report.system}
- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

## السلسلة
1. SHEIKHA_HEART_CORE_V1
2. SHEIKHA_ROOT_AUTHORITY_LAYER_V1
3. SHEIKHA_KNOWLEDGE_ENGINE_V2
4. SHEIKHA_DECISION_REGISTRY_V2
5. SHEIKHA_CAPABILITY_REGISTRY_V2
6. SHEIKHA_EXECUTION_FABRIC_V2

## الفحوص
${Object.entries(checks).map(([k, v]) => `- ${v ? '✅' : '❌'} ${k}`).join('\n')}

## القرارات
${decisions.map((item) => `- ${item.id}: ${item.title}`).join('\n')}

## التالي
${report.nextActions.map((x, i) => `${i + 1}. ${x}`).join('\n')}

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
