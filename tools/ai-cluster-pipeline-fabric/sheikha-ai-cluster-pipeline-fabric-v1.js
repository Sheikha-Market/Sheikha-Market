'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const FABRIC_DIR = 'runtime/ai-cluster-pipeline-fabric/v1';

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

function anyFileIn(relativeDir) {
  try {
    return fs.readdirSync(resolvePath(relativeDir)).some((file) => file.endsWith('.json'));
  } catch {
    return false;
  }
}

const registry = readJson(`${FABRIC_DIR}/sheikha-ai-cluster-pipeline-fabric-v1.json`);
const topology = readJson(`${FABRIC_DIR}/registries/cluster-topology-registry.json`);
const stages = readJson(`${FABRIC_DIR}/registries/ai-pipeline-stages-registry.json`);
const tooling = readJson(`${FABRIC_DIR}/registries/ai-pipeline-tooling-registry.json`);
const governance = readJson(`${FABRIC_DIR}/registries/cluster-pipeline-governance-registry.json`);
const commercialProducts = readJson('runtime/commercial-product-layer/v1/registries/commercial-products-registry.json');
const productSheets = readJson('runtime/commercial-product-layer/v1/registries/product-sheets-registry.json');
const fabric = readJson('runtime/fabric-bootstrap/sheikha-fabric-routes.json');

const topologyItems = topology?.topology || [];
const stageItems = stages?.pipeline || [];
const toolItems = tooling?.tools || [];
const policyItems = governance?.policies || [];
const route = fabric?.routes?.find((item) => item.name === 'ai-cluster-pipeline-fabric-v1');

const requiredStages = [
  'DATA_INGESTION',
  'PREPROCESSING_CLEANING',
  'FEATURE_ENGINEERING_OR_RETRIEVAL_PREP',
  'MODEL_TRAINING_OR_ADAPTATION',
  'EVALUATION_TESTING',
  'DEPLOYMENT_INFERENCE',
  'MONITORING_DRIFT_TELEMETRY'
];

const requiredTools = [
  'Scikit-learn Pipeline',
  'Apache Airflow',
  'Apache Spark',
  'Hadoop',
  'Kubernetes',
  'Kubeflow',
  'MLflow',
  'Hugging Face Pipelines',
  'Service Mesh',
  'Vector Store',
  'MoE Router',
  'Multi-Agent Orchestrator'
];

const requiredLevels = [
  'cluster',
  'data_cluster',
  'hpc_training_cluster',
  'container_cluster',
  'service_mesh',
  'data_mesh_lakehouse',
  'supercluster_readiness',
  'geo_distributed_readiness',
  'mixture_of_experts_routing',
  'multi_agent_system'
];

const dependencies = {
  rootAuthorityLayer: exists('runtime/root-authority-layer/v1/sheikha-root-authority-layer-report.json'),
  knowledgeEngineV2: exists('runtime/knowledge-engine/v2/sheikha-knowledge-engine-v2-report.json'),
  decisionRegistryV2: exists('runtime/decision-registry/v2/sheikha-decision-registry-v2-report.json'),
  capabilityRegistryV2: exists('runtime/capability-registry/v2/sheikha-capability-registry-v2-report.json'),
  commercialProductLayer: exists('runtime/commercial-product-layer/v1/sheikha-commercial-product-layer-v1-report.json'),
  commercialExecutionCluster: exists('runtime/commercial-execution-cluster/v1/sheikha-commercial-execution-cluster-v1-report.json'),
  supercomputeFabric: anyFileIn('runtime/supercompute/reports'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const checks = {
  registryActive: registry?.status === 'ACTIVE',
  topologyRegistry: topologyItems.length >= requiredLevels.length,
  topologyLevelsComplete: requiredLevels.every((level) => topologyItems.some((item) => item.level === level)),
  noPhysicalClaims: topologyItems.every((item) => item.physicalClaim === false),
  pipelineStagesComplete: requiredStages.every((stage) => stageItems.some((item) => item.stage === stage)),
  pipelineStagesGated: stageItems.every((item) => Boolean(item.gate)),
  toolingRegistryComplete: requiredTools.every((tool) => toolItems.some((item) => item.name === tool)),
  noToolInstallationClaims: toolItems.every((item) => item.installationClaim === false),
  governancePoliciesPresent: policyItems.length >= 6,
  truthfulnessPolicy: Boolean(
    registry?.truthfulness_policy?.readiness_fabric_only &&
    registry?.truthfulness_policy?.physical_supercluster_claim === false &&
    registry?.truthfulness_policy?.gpu_ownership_claim === false &&
    registry?.truthfulness_policy?.model_training_claim === false &&
    registry?.truthfulness_policy?.cloud_capacity_claim === false &&
    registry?.truthfulness_policy?.tool_installation_claim === false
  ),
  commercialProductLinked: Boolean(
    commercialProducts?.products?.some((product) => product.id === registry?.commercial_product)
  ),
  productSheetLinked: Boolean(
    productSheets?.products?.some((sheet) => sheet.productId === registry?.commercial_product)
  ),
  fabricRouteMounted: Boolean(
    route &&
    route.mount === '/api/ai/cluster-pipeline-fabric' &&
    route.module === 'routes/ai-cluster-pipeline-fabric/status.routes.js'
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
  system: 'SHEIKHA_AI_CLUSTER_PIPELINE_FABRIC_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 5) : 100,
  decision: missing.length ? 'REVIEW_AI_CLUSTER_PIPELINE_FABRIC_GAPS' : 'AI_CLUSTER_PIPELINE_FABRIC_ACTIVE_100',
  activation: {
    type: 'READINESS_AND_GOVERNANCE_FABRIC',
    physicalSuperclusterClaim: false,
    modelTrainingClaim: false,
    toolInstallationClaim: false,
    commercialProduct: registry?.commercial_product
  },
  dependencies,
  checks,
  missing,
  missingDependencies,
  missingChecks,
  coverage: {
    topologyLevels: topologyItems.length,
    pipelineStages: stageItems.length,
    tools: toolItems.length,
    governancePolicies: policyItems.length,
    physicalClaims: topologyItems.filter((item) => item.physicalClaim === true).length,
    installationClaims: toolItems.filter((item) => item.installationClaim === true).length
  },
  nextActions: [
    'Create runnable adapters only when actual cluster credentials, hardware evidence, or local runtime evidence exists.',
    'Keep supercluster and geo-distributed training as readiness layers until signed infrastructure contracts exist.',
    'Measure data rights, evaluation, deployment, monitoring, and drift before any production AI claim.',
    'Commercialize this as PROD-AICL-001 only through legal review and signed contract workflow.'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

fs.mkdirSync(resolvePath(FABRIC_DIR), { recursive: true });
writeJson(`${FABRIC_DIR}/sheikha-ai-cluster-pipeline-fabric-v1-report.json`, report);

fs.writeFileSync(
  resolvePath(`${FABRIC_DIR}/sheikha-ai-cluster-pipeline-fabric-v1-report.md`),
  `# SHEIKHA_AI_CLUSTER_PIPELINE_FABRIC_V1

## الحالة
- النظام: ${report.system}
- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

## نوع التفعيل
- النوع: ${report.activation.type}
- ادعاء امتلاك Supercluster فعلي: ${report.activation.physicalSuperclusterClaim ? 'نعم' : 'لا'}
- ادعاء تدريب نموذج فعلي: ${report.activation.modelTrainingClaim ? 'نعم' : 'لا'}
- ادعاء تثبيت أدوات خارجية: ${report.activation.toolInstallationClaim ? 'نعم' : 'لا'}
- المنتج التجاري: ${report.activation.commercialProduct}

## التغطية
- مستويات الكلاستر: ${report.coverage.topologyLevels}
- مراحل pipeline: ${report.coverage.pipelineStages}
- الأدوات: ${report.coverage.tools}
- سياسات الحوكمة: ${report.coverage.governancePolicies}
- ادعاءات بنية فعلية: ${report.coverage.physicalClaims}
- ادعاءات تثبيت أدوات: ${report.coverage.installationClaims}

## الفحوص
${Object.entries(checks).map(([key, value]) => `- ${value ? 'PASS' : 'FAIL'} ${key}`).join('\n')}

## الاعتماديات
${Object.entries(dependencies).map(([key, value]) => `- ${value ? 'PASS' : 'FAIL'} ${key}`).join('\n')}

## التالي
${report.nextActions.map((action, index) => `${index + 1}. ${action}`).join('\n')}

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
