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
  commercialProductLayer: exists('runtime/commercial-product-layer/v1/sheikha-commercial-product-layer-v1.json'),
  commercialGovernanceEngine: exists('runtime/commercial-governance-engine/v1/sheikha-commercial-governance-engine-v1-report.json'),
  commercialExecutionLayer: exists('runtime/commercial-execution-layer/v1/sheikha-commercial-execution-layer-v1-report.json'),
  executionPipeline: exists('runtime/commercial-execution-layer/v1/registries/commercial-execution-pipeline.json'),
  kpiRegistry: exists('runtime/commercial-execution-layer/v1/registries/commercial-kpi-registry.json'),
  licensingEngine: exists('runtime/licensing-engine/v1/sheikha-licensing-engine-v1.json'),
  contractEngine: exists('runtime/contract-engine/v1/sheikha-contract-engine-v1.json'),
  customerRegistry: exists('runtime/customer-registry/v1/sheikha-customer-registry-v1.json'),
  billingEngine: exists('runtime/billing-engine/v1/sheikha-billing-engine-v1.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const missing = Object.entries(checks).filter(([, ok]) => !ok).map(([k]) => k);

const report = {
  system: 'SHEIKHA_COMMERCIAL_EXECUTION_CLUSTER_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 8) : 100,
  decision: missing.length ? 'REVIEW_COMMERCIAL_EXECUTION_CLUSTER_GAPS' : 'COMMERCIAL_EXECUTION_CLUSTER_ACTIVE_100',
  checks,
  missing,
  clusterNodes: [
    'COMMERCIAL_PRODUCT_NODE',
    'COMMERCIAL_GOVERNANCE_NODE',
    'LICENSING_NODE',
    'CONTRACT_NODE',
    'CUSTOMER_NODE',
    'BILLING_NODE',
    'KPI_NODE',
    'RENEWAL_NODE'
  ],
  nextActions: [
    'Create first real customer only after signed agreement.',
    'Create first real license only after contract approval.',
    'Create first invoice only after license issuance.',
    'Claim revenue only after payment confirmation.'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

write(
  'runtime/commercial-execution-cluster/v1/sheikha-commercial-execution-cluster-v1-report.json',
  JSON.stringify(report, null, 2) + '\n'
);

write(
  'runtime/commercial-execution-cluster/v1/sheikha-commercial-execution-cluster-v1-report.md',
  `# SHEIKHA_COMMERCIAL_EXECUTION_CLUSTER_V1

## الحالة
- النظام: ${report.system}
- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

## العقد
${report.clusterNodes.map((x, i) => `${i + 1}. ${x}`).join('\n')}

## الفحوص
${Object.entries(checks).map(([k, v]) => `- ${v ? '✅' : '❌'} ${k}`).join('\n')}

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
