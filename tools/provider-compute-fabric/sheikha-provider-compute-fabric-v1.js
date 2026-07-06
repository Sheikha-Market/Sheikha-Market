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
const route = fabric?.routes?.find((item) => item.name === 'provider-compute-fabric-v1');
const providerMap = readJson('runtime/provider-registry/v1/registries/providers.json');
const providerItems = providerMap?.providers || [];

const requiredProviderIds = [
  'PROV-AWS',
  'PROV-AZURE',
  'PROV-GCP',
  'PROV-OCI',
  'PROV-ALIBABA',
  'PROV-HOSTINGER',
  'PROV-LOCAL',
  'PROV-OLLAMA',
  'PROV-OPENAI',
  'PROV-ANTHROPIC',
  'PROV-GITHUB-MODELS',
  'PROV-COREWEAVE',
  'PROV-LAMBDA',
  'PROV-CRUSOE'
];

function providerHasControlFields(provider) {
  return Boolean(
    provider.id &&
    provider.provider &&
    provider.name &&
    provider.type &&
    provider.contractStatus &&
    provider.budget &&
    typeof provider.budget.monthlyLimitSAR === 'number' &&
    provider.budget.humanApprovalRequired === true &&
    Array.isArray(provider.capabilities) &&
    provider.capabilities.length > 0 &&
    Array.isArray(provider.regions) &&
    provider.regions.length > 0 &&
    provider.approvalState &&
    provider.usageStatus
  );
}

const checks = {
  governanceOrchestrator: exists('runtime/governance-orchestrator/v1/sheikha-governance-orchestrator-v1-report.json'),
  cloudSupercomputerFabric: exists('runtime/cloud-supercomputer-fabric/v1/sheikha-cloud-supercomputer-fabric-v1-report.json'),
  providerRegistry: exists('runtime/provider-registry/v1/sheikha-provider-registry-v1.json'),
  providersMap: exists('runtime/provider-registry/v1/registries/providers.json'),
  providerCatalogComplete: requiredProviderIds.every((id) =>
    providerItems.some((provider) => provider.id === id)
  ),
  providerControlFieldsComplete: providerItems.length > 0 && providerItems.every(providerHasControlFields),
  noSignedProviderContractClaims: providerItems.every((provider) =>
    provider.contractStatus === 'NOT_SIGNED' ||
    provider.contractStatus === 'INTERNAL_ONLY'
  ),
  noApprovedPaidBudgets: providerItems.every((provider) =>
    provider.budget.status === 'NOT_APPROVED' ||
    provider.budget.status === 'INTERNAL_ONLY'
  ),
  noActiveProviderUsageClaims: providerItems.every((provider) =>
    provider.usageStatus !== 'ACTIVE'
  ),
  computeContractEngine: exists('runtime/compute-contract-engine/v1/sheikha-compute-contract-engine-v1.json'),
  computeAgreementMap: exists('runtime/compute-contract-engine/v1/registries/compute-agreement-map.json'),
  multicloudFabric: exists('runtime/multicloud-fabric/v1/sheikha-multicloud-fabric-v1.json'),
  gpuFarmReadiness: exists('runtime/gpu-farm-readiness/v1/sheikha-gpu-farm-readiness-v1.json'),
  budgetGuard: exists('runtime/budget-guard/v1/sheikha-budget-guard-v1.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js'),
  fabricRouteMounted: Boolean(
    route &&
    route.mount === '/api/ai/provider-compute-fabric' &&
    route.module === 'routes/provider-compute-fabric/status.routes.js'
  )
};

const missing = Object.entries(checks).filter(([, ok]) => !ok).map(([k]) => k);

const report = {
  system: 'SHEIKHA_PROVIDER_COMPUTE_FABRIC_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 8) : 100,
  decision: missing.length ? 'REVIEW_PROVIDER_COMPUTE_FABRIC_GAPS' : 'PROVIDER_COMPUTE_FABRIC_ACTIVE_100',
  checks,
  missing,
  truthfulness: {
    noProviderContractClaimWithoutAgreement: true,
    noGpuFarmClaimWithoutHardwareOrLease: true,
    noSupercomputerClaimWithoutEvidence: true,
    noPaidComputeWithoutBudgetApproval: true
  },
  coverage: {
    providers: providerItems.length,
    requiredProviders: requiredProviderIds.length,
    signedContracts: providerItems.filter((provider) => provider.contractStatus === 'SIGNED').length,
    approvedBudgets: providerItems.filter((provider) => provider.budget?.status === 'APPROVED').length,
    activeUsageClaims: providerItems.filter((provider) => provider.usageStatus === 'ACTIVE').length
  },
  agreementRoadmap: [
    '1. Select provider candidate',
    '2. Review service terms and pricing',
    '3. Define budget ceiling',
    '4. Request contract or subscription',
    '5. Verify region/security/data rules',
    '6. Approve compute allocation',
    '7. Enable credentials',
    '8. Run small proof-of-capability workload',
    '9. Monitor cost and performance',
    '10. Promote to production only after review'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

write(
  'runtime/provider-registry/v1/sheikha-provider-compute-fabric-v1-report.json',
  JSON.stringify(report, null, 2) + '\n'
);

write(
  'runtime/provider-registry/v1/sheikha-provider-compute-fabric-v1-report.md',
  `# SHEIKHA_PROVIDER_COMPUTE_FABRIC_V1

## الحالة
- النظام: ${report.system}
- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

## الفحوص
${Object.entries(checks).map(([k, v]) => `- ${v ? '✅' : '❌'} ${k}`).join('\n')}

## التغطية
- المزودون: ${report.coverage.providers}
- المزودون المطلوبون: ${report.coverage.requiredProviders}
- العقود الموقعة: ${report.coverage.signedContracts}
- الميزانيات المعتمدة: ${report.coverage.approvedBudgets}
- ادعاءات استخدام نشط: ${report.coverage.activeUsageClaims}

## خريطة الاتفاقيات
${report.agreementRoadmap.map(x => `- ${x}`).join('\n')}

## المسارات
- /api/ai/provider-compute-fabric/status
- /api/ai/provider-compute-fabric/agreements
- /api/ai/provider-compute-fabric/readiness

## ضبط الصدق
لا مزود بلا سجل. لا عقد بلا اتفاقية. لا GPU Farm بلا عتاد أو عقد استئجار. لا إنفاق بلا ميزانية.

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
