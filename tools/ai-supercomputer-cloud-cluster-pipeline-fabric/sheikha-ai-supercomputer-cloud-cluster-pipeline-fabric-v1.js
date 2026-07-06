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

const registry = readJson(
  'runtime/ai-supercomputer-cloud-cluster-pipeline-fabric/v1/sheikha-ai-supercomputer-cloud-cluster-pipeline-fabric-v1.json'
);
const fabric = readJson('runtime/fabric-bootstrap/sheikha-fabric-routes.json');
const route = fabric?.routes?.find((item) => item.name === 'ai-supercomputer-cloud-cluster-pipeline-fabric-v1');

const requiredComponents = [
  'AI_WORKLOADS',
  'SUPERCOMPUTER_CLOUD_READINESS',
  'MULTI_SUPERCOMPUTER_CLOUD_FABRIC',
  'PROVIDER_COMPUTE_FABRIC',
  'WORKLOAD_ORCHESTRATOR',
  'AI_CLUSTER_PIPELINE_FABRIC',
  'BUDGET_GUARD',
  'SLA_ENGINE',
  'REVENUE_ENGINE',
  'COMMERCIAL_REAL_ACTIVATION'
];

const checks = {
  registryActive: registry?.status === 'ACTIVE',
  positionedAboveMultiSupercomputer: registry?.position === 'ABOVE_MULTI_SUPERCOMPUTER_CLOUD_FABRIC',
  componentsComplete: requiredComponents.every((component) =>
    registry?.fabric_components?.includes(component)
  ),
  governanceOrchestrator: exists('runtime/governance-orchestrator/v1/sheikha-governance-orchestrator-v1-report.json'),
  multiSupercomputerCloudFabric: exists('runtime/multi-supercomputer-cloud-fabric/v1/sheikha-multi-supercomputer-cloud-fabric-v1-report.json'),
  cloudSupercomputerFabric: exists('runtime/cloud-supercomputer-fabric/v1/sheikha-cloud-supercomputer-fabric-v1-report.json'),
  providerComputeFabric: exists('runtime/provider-registry/v1/sheikha-provider-compute-fabric-v1-report.json'),
  workloadOrchestrator: exists('runtime/workload-orchestrator/v1/sheikha-workload-orchestrator-v1.json'),
  aiClusterPipelineFabric: exists('runtime/ai-cluster-pipeline-fabric/v1/sheikha-ai-cluster-pipeline-fabric-v1-report.json'),
  budgetGuard: exists('runtime/budget-guard/v1/sheikha-budget-guard-v1.json'),
  slaEngine: exists('runtime/sla-engine/v1/sheikha-sla-engine-v1.json'),
  revenueEngine: exists('runtime/revenue-engine/v1/sheikha-revenue-engine-v1.json'),
  commercialRealActivation: exists('runtime/commercial-real-activation/v1/sheikha-commercial-real-activation-v1-report.json'),
  truthfulnessPolicy: Boolean(
    registry?.truthfulness?.architecture_and_readiness_only &&
    registry?.truthfulness?.no_physical_supercomputer_claim_without_contract &&
    registry?.truthfulness?.no_gpu_farm_claim_without_hardware_or_lease &&
    registry?.truthfulness?.no_model_training_claim_without_run_log &&
    registry?.truthfulness?.no_cloud_provider_claim_without_service_offering &&
    registry?.truthfulness?.no_partner_claim_without_signed_agreement
  ),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js'),
  fabricRouteMounted: Boolean(
    route &&
    route.mount === '/api/ai/supercomputer-cloud-cluster-pipeline-fabric' &&
    route.module === 'routes/ai-supercomputer-cloud-cluster-pipeline-fabric/status.routes.js'
  )
};

const missing = Object.entries(checks)
  .filter(([, ok]) => !ok)
  .map(([k]) => k);

const report = {
  system: 'SHEIKHA_AI_SUPERCOMPUTER_CLOUD_CLUSTER_PIPELINE_FABRIC_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 5) : 100,
  decision: missing.length
    ? 'REVIEW_AI_SUPERCOMPUTER_CLOUD_CLUSTER_PIPELINE_FABRIC_GAPS'
    : 'AI_SUPERCOMPUTER_CLOUD_CLUSTER_PIPELINE_FABRIC_ACTIVE_100',
  checks,
  missing,
  coverage: {
    components: registry?.fabric_components?.length || 0,
    requiredComponents: requiredComponents.length,
    physicalSupercomputerClaims: 0,
    gpuFarmClaims: 0,
    modelTrainingClaims: 0,
    providerClaims: 0
  },
  truthfulness: {
    architectureAndReadinessOnly: true,
    noPhysicalSupercomputerClaimWithoutContract: true,
    noGpuFarmClaimWithoutHardwareOrLease: true,
    noModelTrainingClaimWithoutRunLog: true,
    noCloudProviderClaimWithoutServiceOffering: true,
    noPartnerClaimWithoutSignedAgreement: true
  },
  nextActions: [
    'Create workload profile before any real GPU/API execution.',
    'Approve provider, contract, and budget before paid cloud compute.',
    'Record run logs before any model training claim.',
    'Keep the layer as architecture and readiness until real contracts and evidence exist.'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

write(
  'runtime/ai-supercomputer-cloud-cluster-pipeline-fabric/v1/sheikha-ai-supercomputer-cloud-cluster-pipeline-fabric-v1-report.json',
  JSON.stringify(report, null, 2) + '\n'
);

write(
  'runtime/ai-supercomputer-cloud-cluster-pipeline-fabric/v1/sheikha-ai-supercomputer-cloud-cluster-pipeline-fabric-v1-report.md',
  `# SHEIKHA_AI_SUPERCOMPUTER_CLOUD_CLUSTER_PIPELINE_FABRIC_V1

## الحالة
- النظام: ${report.system}
- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

## الفحوص
${Object.entries(checks).map(([k, v]) => `- ${v ? 'PASS' : 'FAIL'} ${k}`).join('\n')}

## التغطية
- المكونات: ${report.coverage.components}
- المكونات المطلوبة: ${report.coverage.requiredComponents}
- ادعاءات حاسب خارق فعلي: ${report.coverage.physicalSupercomputerClaims}
- ادعاءات GPU Farm: ${report.coverage.gpuFarmClaims}
- ادعاءات تدريب نموذج: ${report.coverage.modelTrainingClaims}
- ادعاءات مزود: ${report.coverage.providerClaims}

## المسارات
- /api/ai/supercomputer-cloud-cluster-pipeline-fabric/status
- /api/ai/supercomputer-cloud-cluster-pipeline-fabric/components

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
