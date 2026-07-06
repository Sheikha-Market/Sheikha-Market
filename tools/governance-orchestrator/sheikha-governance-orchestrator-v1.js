'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

function exists(p) {
  return fs.existsSync(path.join(ROOT, p));
}

function write(p, content) {
  fs.mkdirSync(path.dirname(path.join(ROOT, p)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, p), content);
}

const checks = {
  heartCore: exists('runtime/heart-core/v1/sheikha-heart-core-report.json'),
  rootAuthority: exists('runtime/root-authority-layer/v1/sheikha-root-authority-layer-report.json'),
  architectureFreeze: exists('runtime/architecture-freeze/v1.3/sheikha-architecture-freeze-v1.3.json'),
  unifiedGovernanceFabric: exists('runtime/unified-governance-fabric/v1/sheikha-unified-governance-fabric-v1.json'),
  stabilityLayer: exists('runtime/stability-layer/v1/sheikha-stability-layer-report.json'),
  knowledgeEngine: exists('runtime/knowledge-engine/v2/sheikha-knowledge-engine-v2-report.json'),
  decisionRegistry: exists('runtime/decision-registry/v2/sheikha-decision-registry-v2-report.json'),
  capabilityRegistry: exists('runtime/capability-registry/v2/sheikha-capability-registry-v2-report.json'),
  commercialProductLayer: exists('runtime/commercial-product-layer/v1/sheikha-commercial-product-layer-v1-report.json'),
  licensingEngine: exists('runtime/licensing-engine/v1/sheikha-licensing-engine-v1.json'),
  contractEngine: exists('runtime/contract-engine/v1/sheikha-contract-engine-v1.json'),
  customerRegistry: exists('runtime/customer-registry/v1/sheikha-customer-registry-v1.json'),
  billingEngine: exists('runtime/billing-engine/v1/sheikha-billing-engine-v1.json'),
  commercialGovernanceEngine: exists('runtime/commercial-governance-engine/v1/sheikha-commercial-governance-engine-v1-report.json'),
  commercialExecutionLayer: exists('runtime/commercial-execution-layer/v1/sheikha-commercial-execution-layer-v1-report.json'),
  commercialExecutionCluster: exists('runtime/commercial-execution-cluster/v1/sheikha-commercial-execution-cluster-v1-report.json'),
  sovereignCommercialAiSupercluster: exists('runtime/sovereign-commercial-ai-supercluster/v1/sheikha-sovereign-commercial-ai-supercluster-v1-report.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const missing = Object.entries(checks).filter(([, ok]) => !ok).map(([k]) => k);

const report = {
  system: 'SHEIKHA_GOVERNANCE_ORCHESTRATOR_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 5) : 100,
  decision: missing.length ? 'REVIEW_GOVERNANCE_ORCHESTRATOR_GAPS' : 'GOVERNANCE_ORCHESTRATOR_ACTIVE_100',
  checks,
  missing,
  governedPrinciples: [
    'no_execution_without_governance',
    'no_commercial_claim_without_evidence',
    'no_license_without_contract',
    'no_revenue_claim_without_payment',
    'no_partner_or_customer_claim_without_signed_agreement',
    'human_review_for_high_risk',
    'no_drift_required'
  ],
  nextActions: [
    'Activate Provider Registry V1 under Governance Orchestrator.',
    'Activate Customer Portal V1 only after real signed customer agreement.',
    'Activate License Issuance V1 after contract approval workflow exists.',
    'Activate real payment gateway only after legal and financial review.'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

write(
  'runtime/governance-orchestrator/v1/sheikha-governance-orchestrator-v1-report.json',
  JSON.stringify(report, null, 2) + '\n'
);

write(
  'runtime/governance-orchestrator/v1/sheikha-governance-orchestrator-v1-report.md',
  `# SHEIKHA_GOVERNANCE_ORCHESTRATOR_V1

## الحالة
- النظام: ${report.system}
- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

## الفحوص
${Object.entries(checks).map(([k, v]) => `- ${v ? '✅' : '❌'} ${k}`).join('\n')}

## المبادئ الحاكمة
${report.governedPrinciples.map((x, i) => `${i + 1}. ${x}`).join('\n')}

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
