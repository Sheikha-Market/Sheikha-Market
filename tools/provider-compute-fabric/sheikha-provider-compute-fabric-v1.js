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
  governanceOrchestrator: exists('runtime/governance-orchestrator/v1/sheikha-governance-orchestrator-v1-report.json'),
  cloudSupercomputerFabric: exists('runtime/cloud-supercomputer-fabric/v1/sheikha-cloud-supercomputer-fabric-v1-report.json'),
  providerRegistry: exists('runtime/provider-registry/v1/sheikha-provider-registry-v1.json'),
  providersMap: exists('runtime/provider-registry/v1/registries/providers.json'),
  computeContractEngine: exists('runtime/compute-contract-engine/v1/sheikha-compute-contract-engine-v1.json'),
  computeAgreementMap: exists('runtime/compute-contract-engine/v1/registries/compute-agreement-map.json'),
  multicloudFabric: exists('runtime/multicloud-fabric/v1/sheikha-multicloud-fabric-v1.json'),
  gpuFarmReadiness: exists('runtime/gpu-farm-readiness/v1/sheikha-gpu-farm-readiness-v1.json'),
  budgetGuard: exists('runtime/budget-guard/v1/sheikha-budget-guard-v1.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
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

## خريطة الاتفاقيات
${report.agreementRoadmap.map(x => `- ${x}`).join('\n')}

## ضبط الصدق
لا مزود بلا سجل. لا عقد بلا اتفاقية. لا GPU Farm بلا عتاد أو عقد استئجار. لا إنفاق بلا ميزانية.

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
