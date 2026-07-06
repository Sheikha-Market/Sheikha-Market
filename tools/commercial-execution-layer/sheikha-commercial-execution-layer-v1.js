'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

function exists(p) {
  return fs.existsSync(path.join(ROOT, p));
}

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
  } catch {
    return null;
  }
}

function write(p, content) {
  fs.mkdirSync(path.dirname(path.join(ROOT, p)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, p), content);
}

const dependencies = {
  commercialProductLayer: exists('runtime/commercial-product-layer/v1/sheikha-commercial-product-layer-v1.json'),
  commercialGovernanceEngine: exists('runtime/commercial-governance-engine/v1/sheikha-commercial-governance-engine-v1-report.json'),
  licensingEngine: exists('runtime/licensing-engine/v1/sheikha-licensing-engine-v1.json'),
  contractEngine: exists('runtime/contract-engine/v1/sheikha-contract-engine-v1.json'),
  customerRegistry: exists('runtime/customer-registry/v1/sheikha-customer-registry-v1.json'),
  billingEngine: exists('runtime/billing-engine/v1/sheikha-billing-engine-v1.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const pipeline = readJson('runtime/commercial-execution-layer/v1/registries/commercial-execution-pipeline.json');
const kpis = readJson('runtime/commercial-execution-layer/v1/registries/commercial-kpi-registry.json');

const registryChecks = {
  pipelineRegistry: Boolean(pipeline && pipeline.pipeline && pipeline.pipeline.length),
  kpiRegistry: Boolean(kpis && kpis.kpis),
  truthfulnessRules: Boolean(kpis && kpis.truthfulness),
  requiredStagesPresent: Boolean(
    pipeline &&
    pipeline.pipeline &&
    ['LEAD', 'QUOTATION', 'CONTRACT_SIGNED', 'LICENSE_ISSUED', 'INVOICE_ISSUED', 'PAYMENT_CONFIRMED', 'CUSTOMER_ACTIVATED']
      .every(stage => pipeline.pipeline.some(x => x.stage === stage))
  )
};

const missingDependencies = Object.entries(dependencies).filter(([, ok]) => !ok).map(([k]) => k);
const missingRegistryChecks = Object.entries(registryChecks).filter(([, ok]) => !ok).map(([k]) => k);
const totalMissing = missingDependencies.length + missingRegistryChecks.length;

const report = {
  system: 'SHEIKHA_COMMERCIAL_EXECUTION_LAYER_V1',
  status: totalMissing ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: totalMissing ? Math.max(0, 100 - totalMissing * 8) : 100,
  decision: totalMissing ? 'REVIEW_COMMERCIAL_EXECUTION_GAPS' : 'COMMERCIAL_EXECUTION_LAYER_ACTIVE_100',
  dependencies,
  registryChecks,
  missing: [...missingDependencies, ...missingRegistryChecks],
  coverage: {
    pipelineStages: pipeline?.pipeline?.length || 0,
    kpiCount: kpis?.kpis ? Object.keys(kpis.kpis).length : 0
  },
  nextActions: [
    'Activate customer portal only after signed contract and license issuance.',
    'Connect billing to real payment gateway only after legal and financial review.',
    'Do not claim revenue until payment confirmation exists.',
    'Create first real customer record when a signed agreement exists.'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

write(
  'runtime/commercial-execution-layer/v1/sheikha-commercial-execution-layer-v1-report.json',
  JSON.stringify(report, null, 2) + '\n'
);

write(
  'runtime/commercial-execution-layer/v1/sheikha-commercial-execution-layer-v1-report.md',
  `# SHEIKHA_COMMERCIAL_EXECUTION_LAYER_V1

## الحالة
- النظام: ${report.system}
- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

## التغطية
- مراحل التنفيذ: ${report.coverage.pipelineStages}
- مؤشرات الأداء: ${report.coverage.kpiCount}

## الفحوص
${Object.entries(dependencies).map(([k, v]) => `- ${v ? '✅' : '❌'} ${k}`).join('\n')}

## التالي
${report.nextActions.map((x, i) => `${i + 1}. ${x}`).join('\n')}

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
