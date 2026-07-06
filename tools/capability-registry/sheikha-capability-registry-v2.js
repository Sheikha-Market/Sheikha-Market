'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const CAPABILITY_DIR = 'runtime/capability-registry/v2';
const CANONICAL_ITEMS = `${CAPABILITY_DIR}/registries/capability-registry-items.json`;
const COMPATIBILITY_ITEMS = `${CAPABILITY_DIR}/registries/capability-items.json`;

function resolvePath(relativePath) {
  return path.join(ROOT, relativePath);
}

function exists(relativePath) {
  return fs.existsSync(resolvePath(relativePath));
}

function readJson(relativePath) {
  try {
    return JSON.parse(fs.readFileSync(resolvePath(relativePath), 'utf8'));
  } catch {
    return null;
  }
}

function writeJson(relativePath, value) {
  fs.writeFileSync(resolvePath(relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function hasEntries(value) {
  return Array.isArray(value) && value.length > 0;
}

function hasMeasurement(value) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return typeof value === 'string' && value.length > 0;
}

const mainRegistry = readJson(`${CAPABILITY_DIR}/sheikha-capability-registry-v2.json`);
const capabilityRegistry = readJson(CANONICAL_ITEMS);
const decisionRegistry = readJson('runtime/decision-registry/v2/registries/decision-registry-items.json');
const items = capabilityRegistry?.items || [];
const decisionIds = new Set((decisionRegistry?.items || []).map((item) => item.id));

const dependencies = {
  heartCore: exists('runtime/heart-core/v1/sheikha-heart-core-report.json'),
  rootAuthorityLayer: exists('runtime/root-authority-layer/v1/sheikha-root-authority-layer-report.json'),
  knowledgeEngineV2: exists('runtime/knowledge-engine/v2/sheikha-knowledge-engine-v2-report.json'),
  decisionRegistryV2: exists('runtime/decision-registry/v2/sheikha-decision-registry-v2-report.json'),
  stabilityLayer: exists('runtime/stability-layer/v1/sheikha-stability-layer-report.json'),
  runtimeContractEnforcer: exists('runtime/runtime-contract-enforcer/v1/sheikha-runtime-contract-enforcer-report.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

function decisionRefsFor(item) {
  return hasEntries(item.decisionRefs) ? item.decisionRefs : [item.decision].filter(Boolean);
}

const registryChecks = {
  mainRegistryActive: mainRegistry?.status === 'ACTIVE',
  capabilityRegistryActive: capabilityRegistry?.status === 'ACTIVE',
  capabilityItems: items.length >= 10,
  activeOrGated: items.every((item) => ['ACTIVE', 'GATED'].includes(item.status)),
  decisionLinked: items.every((item) => decisionRefsFor(item).length > 0),
  decisionRefsResolvable: items.every((item) => (
    decisionRefsFor(item).every((decisionId) => decisionIds.has(decisionId))
  )),
  policyRefsLinked: items.every((item) => hasEntries(item.policyRefs)),
  guardrailsLinked: items.every((item) => hasEntries(item.guardrails)),
  measurementLinked: items.every((item) => hasMeasurement(item.measurement)),
  scoped: items.every((item) => hasEntries(item.scope) || hasEntries(item.scopes)),
  noModelPull: Boolean(
    mainRegistry?.rules?.no_model_pull &&
    mainRegistry?.truthfulness_policy?.model_pull_requested === false &&
    mainRegistry?.truthfulness_policy?.provider_model_download_requested === false
  ),
  capabilityActivationOnly: mainRegistry?.truthfulness_policy?.capability_activation_only === true,
  noUnverifiedModelClaim: Boolean(
    mainRegistry?.policies?.no_unverified_model_claims &&
    mainRegistry?.truthfulness_policy?.external_model_activation_claim === false &&
    mainRegistry?.truthfulness_policy?.model_name_is_not_asserted === true
  ),
  executionFabricGated: mainRegistry?.next_layer_status === 'GATED_UNTIL_CAPABILITY_REGISTRY_V2_ACTIVE_100'
};

const missingDependencies = Object.entries(dependencies)
  .filter(([, ok]) => !ok)
  .map(([key]) => key);
const missingRegistryChecks = Object.entries(registryChecks)
  .filter(([, ok]) => !ok)
  .map(([key]) => key);
const missing = [...missingDependencies, ...missingRegistryChecks];

const coverage = {
  capabilityItems: items.length,
  activeItems: items.filter((item) => item.status === 'ACTIVE').length,
  gatedCapabilities: items.filter((item) => item.status === 'GATED').length,
  humanReviewItems: items.filter((item) => item.requiresHumanReview === true).length,
  decisionLinkedItems: items.filter((item) => decisionRefsFor(item).length > 0).length,
  policyLinkedItems: items.filter((item) => hasEntries(item.policyRefs)).length,
  guardrailedItems: items.filter((item) => hasEntries(item.guardrails)).length,
  measuredItems: items.filter((item) => hasMeasurement(item.measurement)).length
};

const report = {
  system: 'SHEIKHA_CAPABILITY_REGISTRY_V2',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 5) : 100,
  decision: missing.length ? 'REVIEW_CAPABILITY_REGISTRY_GAPS' : 'CAPABILITY_REGISTRY_V2_ACTIVE_100',
  activation: {
    type: 'CAPABILITY_ONLY',
    noModelPull: true,
    externalModelClaim: false
  },
  dependencies,
  checks: registryChecks,
  registryChecks,
  missing,
  missingDependencies,
  missingRegistryChecks,
  coverage,
  nextActions: [
    'Keep Execution Fabric V2 gated until Capability Registry V2 remains clean.',
    'Allow execution only for registered capabilities linked to decisions, policies, guardrails, and measurements.',
    'Connect capability execution to tests, drift detector, PR governance, and runtime admission control.'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

const outDir = resolvePath(CAPABILITY_DIR);
fs.mkdirSync(outDir, { recursive: true });

writeJson(`${CAPABILITY_DIR}/sheikha-capability-registry-v2-report.json`, report);
writeJson(COMPATIBILITY_ITEMS, capabilityRegistry);

fs.writeFileSync(
  resolvePath(`${CAPABILITY_DIR}/sheikha-capability-registry-v2-report.md`),
  `# SHEIKHA_CAPABILITY_REGISTRY_V2

## الحالة
- النظام: ${report.system}
- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}
- نوع التفعيل: ${report.activation.type}
- سحب نموذج خارجي: ${report.activation.noModelPull ? 'لا' : 'نعم'}

## التغطية
- القدرات: ${report.coverage.capabilityItems}
- القدرات النشطة: ${report.coverage.activeItems}
- القدرات المؤجلة ببوابة: ${report.coverage.gatedCapabilities}
- قدرات تحتاج مراجعة بشرية: ${report.coverage.humanReviewItems}
- قدرات مرتبطة بقرار: ${report.coverage.decisionLinkedItems}
- قدرات مرتبطة بسياسة: ${report.coverage.policyLinkedItems}
- قدرات مرتبطة بحواجز: ${report.coverage.guardrailedItems}
- قدرات مرتبطة بقياس: ${report.coverage.measuredItems}

## الفحوص
${Object.entries(registryChecks).map(([key, value]) => `- ${value ? 'PASS' : 'FAIL'} ${key}`).join('\n')}

## الاعتماديات
${Object.entries(dependencies).map(([key, value]) => `- ${value ? 'PASS' : 'FAIL'} ${key}`).join('\n')}

## التالي
${report.nextActions.map((action, index) => `${index + 1}. ${action}`).join('\n')}

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
