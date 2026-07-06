'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SUPERCLUSTER_DIR = 'runtime/sovereign-commercial-ai-supercluster/v1';

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

const registry = readJson(`${SUPERCLUSTER_DIR}/sheikha-sovereign-commercial-ai-supercluster-v1.json`);
const aiClusterReport = readJson('runtime/ai-cluster-pipeline-fabric/v1/sheikha-ai-cluster-pipeline-fabric-v1-report.json');
const commercialProducts = readJson('runtime/commercial-product-layer/v1/registries/commercial-products-registry.json');
const fabric = readJson('runtime/fabric-bootstrap/sheikha-fabric-routes.json');
const route = fabric?.routes?.find((item) => item.name === 'sovereign-commercial-ai-supercluster-v1');

const requiredLayers = [
  'ROOT_AUTHORITY',
  'GOVERNANCE_ORCHESTRATION',
  'KNOWLEDGE_ENGINE',
  'DECISION_REGISTRY',
  'CAPABILITY_REGISTRY',
  'COMMERCIAL_PRODUCT_LAYER',
  'LICENSING_ENGINE',
  'CONTRACT_ENGINE',
  'CUSTOMER_REGISTRY',
  'BILLING_ENGINE',
  'COMMERCIAL_EXECUTION_LAYER',
  'COMMERCIAL_EXECUTION_CLUSTER',
  'AI_CLUSTER_PIPELINE_FABRIC'
];

const requiredPipelineStages = [
  'DATA_INGESTION',
  'PREPROCESSING_CLEANING',
  'FEATURE_ENGINEERING_OR_RETRIEVAL_PREP',
  'MODEL_TRAINING_OR_ADAPTATION',
  'EVALUATION_TESTING',
  'DEPLOYMENT_INFERENCE',
  'MONITORING_DRIFT_TELEMETRY',
  'GOVERNANCE_REVIEW',
  'DECISION_GATE',
  'CAPABILITY_GATE',
  'EXECUTION',
  'MEASUREMENT',
  'LESSONS_LEARNED',
  'CONTINUOUS_IMPROVEMENT'
];

const dependencies = {
  heartCore: exists('runtime/heart-core/v1/sheikha-heart-core-report.json'),
  rootAuthority: exists('runtime/root-authority-layer/v1/sheikha-root-authority-layer-report.json'),
  knowledgeEngine: exists('runtime/knowledge-engine/v2/sheikha-knowledge-engine-v2-report.json'),
  decisionRegistry: exists('runtime/decision-registry/v2/sheikha-decision-registry-v2-report.json'),
  capabilityRegistry: exists('runtime/capability-registry/v2/sheikha-capability-registry-v2-report.json'),
  commercialProductLayer: exists('runtime/commercial-product-layer/v1/sheikha-commercial-product-layer-v1-report.json'),
  licensingEngine: exists('runtime/licensing-engine/v1/sheikha-licensing-engine-v1.json'),
  contractEngine: exists('runtime/contract-engine/v1/sheikha-contract-engine-v1.json'),
  customerRegistry: exists('runtime/customer-registry/v1/sheikha-customer-registry-v1.json'),
  billingEngine: exists('runtime/billing-engine/v1/sheikha-billing-engine-v1.json'),
  commercialGovernance: exists('runtime/commercial-governance-engine/v1/sheikha-commercial-governance-engine-v1-report.json'),
  commercialExecutionLayer: exists('runtime/commercial-execution-layer/v1/sheikha-commercial-execution-layer-v1-report.json'),
  commercialExecutionCluster: exists('runtime/commercial-execution-cluster/v1/sheikha-commercial-execution-cluster-v1-report.json'),
  aiClusterPipelineFabric: aiClusterReport?.status === 'ACTIVE',
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const checks = {
  registryActive: registry?.status === 'ACTIVE',
  layersComplete: requiredLayers.every((layer) => registry?.cluster_layers?.includes(layer)),
  aiPipelineComplete: requiredPipelineStages.every((stage) => registry?.ai_pipeline?.includes(stage)),
  commercialProductLinked: commercialProducts?.products?.some((product) => product.id === registry?.commercial_product),
  aiClusterFabricActive100: aiClusterReport?.decision === 'AI_CLUSTER_PIPELINE_FABRIC_ACTIVE_100',
  architecturalOnly: registry?.truthfulness?.architectural_supercluster_only === true,
  noHardwareClaim: Boolean(
    registry?.truthfulness?.no_hardware_supercomputer_claim &&
    registry?.truthfulness?.no_physical_supercluster_claim &&
    registry?.truthfulness?.no_gpu_fleet_claim_without_evidence
  ),
  noModelTrainingClaim: registry?.truthfulness?.no_model_training_claim_without_run_evidence === true,
  noCustomerOrPartnerClaim: Boolean(
    registry?.truthfulness?.no_customer_claim_without_contract &&
    registry?.truthfulness?.no_partner_claim_without_signed_agreement
  ),
  noRevenueClaimWithoutPayment: registry?.truthfulness?.no_revenue_claim_without_payment === true,
  fabricRouteMounted: Boolean(
    route &&
    route.mount === '/api/ai/sovereign-commercial-supercluster' &&
    route.module === 'routes/sovereign-commercial-ai-supercluster/status.routes.js'
  )
};

const missingDependencies = Object.entries(dependencies)
  .filter(([, ok]) => !ok)
  .map(([key]) => key);
const missingChecks = Object.entries(checks)
  .filter(([, ok]) => !ok)
  .map(([key]) => key);
const missing = [...missingDependencies, ...missingChecks];

const report = {
  system: 'SHEIKHA_SOVEREIGN_COMMERCIAL_AI_SUPERCLUSTER_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 5) : 100,
  decision: missing.length ? 'REVIEW_SUPERCLUSTER_GAPS' : 'SOVEREIGN_COMMERCIAL_AI_SUPERCLUSTER_ACTIVE_100',
  dependencies,
  checks,
  missing,
  missingDependencies,
  missingChecks,
  truthfulness: {
    architecturalSuperclusterOnly: true,
    noHardwareSupercomputerClaim: true,
    noPhysicalSuperclusterClaim: true,
    noModelTrainingClaimWithoutRunEvidence: true,
    noCustomerClaimWithoutContract: true,
    noPartnerClaimWithoutSignedAgreement: true,
    noRevenueClaimWithoutPayment: true
  },
  coverage: {
    clusterLayers: registry?.cluster_layers?.length || 0,
    aiPipelineStages: registry?.ai_pipeline?.length || 0,
    commercialProduct: registry?.commercial_product,
    aiClusterPipelineScore: aiClusterReport?.score || 0
  },
  nextActions: [
    'Activate Governance Orchestrator V1 above all governance-producing engines.',
    'Keep AI supercluster as architecture and readiness until hardware, provider, or infrastructure contracts exist.',
    'Activate Customer Portal only after real signed customer agreement.',
    'Activate real billing only after legal and financial review.'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

fs.mkdirSync(resolvePath(SUPERCLUSTER_DIR), { recursive: true });

writeJson(
  `${SUPERCLUSTER_DIR}/sheikha-sovereign-commercial-ai-supercluster-v1-report.json`,
  report
);

fs.writeFileSync(
  resolvePath(`${SUPERCLUSTER_DIR}/sheikha-sovereign-commercial-ai-supercluster-v1-report.md`),
  `# SHEIKHA_SOVEREIGN_COMMERCIAL_AI_SUPERCLUSTER_V1

## الحالة
- النظام: ${report.system}
- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

## التغطية
- طبقات العنقود: ${report.coverage.clusterLayers}
- مراحل AI pipeline: ${report.coverage.aiPipelineStages}
- المنتج التجاري: ${report.coverage.commercialProduct}
- درجة AI Cluster Pipeline Fabric: ${report.coverage.aiClusterPipelineScore}

## الفحوص
${Object.entries(checks).map(([key, value]) => `- ${value ? 'PASS' : 'FAIL'} ${key}`).join('\n')}

## الاعتماديات
${Object.entries(dependencies).map(([key, value]) => `- ${value ? 'PASS' : 'FAIL'} ${key}`).join('\n')}

## ضبط الصدق
- Supercluster معماري/حوكمي فقط.
- لا ادعاء عتاد حوسبة خارقة بلا وجود فعلي.
- لا ادعاء تدريب نموذج بلا run evidence.
- لا ادعاء عميل بلا عقد.
- لا ادعاء إيراد بلا دفع مؤكد.

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
