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

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
  } catch {
    return null;
  }
}

const fabric = readJson('runtime/fabric-bootstrap/sheikha-fabric-routes.json');
const revenue = readJson('runtime/revenue-engine/v1/sheikha-revenue-engine-v1.json');
const partners = readJson('runtime/partner-registry/v1/sheikha-partner-registry-v1.json');
const route = fabric?.routes?.find((item) => item.name === 'commercial-real-activation-v1');

const checks = {
  governanceOrchestrator: exists('runtime/governance-orchestrator/v1/sheikha-governance-orchestrator-v1-report.json'),
  providerComputeFabric: exists('runtime/provider-registry/v1/sheikha-provider-compute-fabric-v1-report.json'),
  providerApprovalEngine: exists('runtime/provider-approval-engine/v1/sheikha-provider-approval-engine-v1.json'),
  workloadOrchestrator: exists('runtime/workload-orchestrator/v1/sheikha-workload-orchestrator-v1.json'),
  slaEngine: exists('runtime/sla-engine/v1/sheikha-sla-engine-v1.json'),
  revenueEngine: exists('runtime/revenue-engine/v1/sheikha-revenue-engine-v1.json'),
  partnerRegistry: exists('runtime/partner-registry/v1/sheikha-partner-registry-v1.json'),
  marketplaceEngine: exists('runtime/marketplace-engine/v1/sheikha-marketplace-engine-v1.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js'),
  zeroUnverifiedCommercialClaims: Boolean(
    revenue?.metrics?.customers === 0 &&
    revenue?.metrics?.contracts === 0 &&
    revenue?.metrics?.licenses === 0 &&
    revenue?.metrics?.invoices === 0 &&
    revenue?.metrics?.paidRevenueSAR === 0 &&
    Array.isArray(partners?.partners) &&
    partners.partners.length === 0
  ),
  fabricRouteMounted: Boolean(
    route &&
    route.mount === '/api/commercial/real-activation' &&
    route.module === 'routes/commercial-real-activation/status.routes.js'
  )
};

const missing = Object.entries(checks).filter(([, ok]) => !ok).map(([k]) => k);

const report = {
  system: 'SHEIKHA_COMMERCIAL_REAL_ACTIVATION_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 8) : 100,
  decision: missing.length ? 'REVIEW_COMMERCIAL_REAL_ACTIVATION_GAPS' : 'COMMERCIAL_REAL_ACTIVATION_ACTIVE_100',
  checks,
  missing,
  realWorldGuardrails: {
    noOpenAIPartnerClaimWithoutAgreement: true,
    noCloudProviderClaimWithoutContract: true,
    noSupercomputerOwnerClaimWithoutAssetOrLease: true,
    noRevenueClaimWithoutPayment: true
  },
  realWorldMetrics: {
    customers: revenue?.metrics?.customers ?? 0,
    contracts: revenue?.metrics?.contracts ?? 0,
    licenses: revenue?.metrics?.licenses ?? 0,
    invoices: revenue?.metrics?.invoices ?? 0,
    paidRevenueSAR: revenue?.metrics?.paidRevenueSAR ?? 0,
    partners: Array.isArray(partners?.partners) ? partners.partners.length : 0
  },
  nextActions: [
    'Prepare first customer proposal.',
    'Prepare MSA/SLA/license templates.',
    'Select first provider subscription or API path.',
    'Set real budget before any paid compute.',
    'Create first customer only after signed agreement.'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

write(
  'runtime/commercial-real-activation/v1/sheikha-commercial-real-activation-v1-report.json',
  JSON.stringify(report, null, 2) + '\n'
);

write(
  'runtime/commercial-real-activation/v1/sheikha-commercial-real-activation-v1-report.md',
  `# SHEIKHA_COMMERCIAL_REAL_ACTIVATION_V1

## الحالة
- النظام: ${report.system}
- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

## الفحوص
${Object.entries(checks).map(([k, v]) => `- ${v ? '✅' : '❌'} ${k}`).join('\n')}

## المقاييس الواقعية
- العملاء: ${report.realWorldMetrics.customers}
- العقود: ${report.realWorldMetrics.contracts}
- التراخيص: ${report.realWorldMetrics.licenses}
- الفواتير: ${report.realWorldMetrics.invoices}
- الإيراد المدفوع SAR: ${report.realWorldMetrics.paidRevenueSAR}
- الشركاء: ${report.realWorldMetrics.partners}

## المسارات
- /api/commercial/real-activation/status
- /api/commercial/real-activation/guardrails

## حواجز الصدق
- لا شراكة OpenAI بلا اتفاقية.
- لا ادعاء مزود سحابي بلا عقد.
- لا ادعاء ملكية Supercomputer بلا أصل أو عقد استئجار.
- لا ادعاء إيراد بلا دفع مؤكد.

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
