'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const CONTROL_DIR = 'runtime/ugit-ai-control-plane/v1';

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

function all(items, predicate) {
  return Array.isArray(items) && items.length > 0 && items.every(predicate);
}

const registry = readJson(`${CONTROL_DIR}/sheikha-ugit-ai-control-plane-v1.json`);
const layers = readJson(`${CONTROL_DIR}/registries/operating-layers-registry.json`);
const domains = readJson(`${CONTROL_DIR}/registries/domain-pipeline-registry.json`);
const tooling = readJson(`${CONTROL_DIR}/registries/tooling-control-registry.json`);
const policies = readJson(`${CONTROL_DIR}/registries/governance-policy-registry.json`);
const commercialProducts = readJson('runtime/commercial-product-layer/v1/registries/commercial-products-registry.json');
const productSheets = readJson('runtime/commercial-product-layer/v1/registries/product-sheets-registry.json');
const valueProof = readJson('runtime/commercial-product-layer/v1/registries/commercial-value-proof-registry.json');
const fabric = readJson('runtime/fabric-bootstrap/sheikha-fabric-routes.json');

const layerItems = layers?.layers || [];
const domainItems = domains?.domains || [];
const toolItems = tooling?.tools || [];
const policyItems = policies?.policies || [];
const proofTargets = valueProof?.proofTargets || [];
const productId = registry?.commercial_product;

const requiredSystems = [
  'SHEIKHA_ROOT_OPERATING_CORE_V1',
  'SHEIKHA_ROOT_AUTHORITY_LAYER_V1',
  'SHEIKHA_STABILITY_LAYER_V1',
  'SHEIKHA_KNOWLEDGE_ENGINE_V2',
  'SHEIKHA_DECISION_REGISTRY_V2',
  'SHEIKHA_CAPABILITY_REGISTRY_V2',
  'SHEIKHA_GOVERNANCE_ORCHESTRATOR_V1',
  'SHEIKHA_AI_CLUSTER_PIPELINE_FABRIC_V1',
  'SHEIKHA_SOVEREIGN_COMMERCIAL_AI_SUPERCLUSTER_V1',
  'SHEIKHA_CLOUD_SUPERCOMPUTER_FABRIC_V1',
  'SHEIKHA_PROVIDER_REGISTRY_V1',
  'SHEIKHA_COMPUTE_CONTRACT_ENGINE_V1',
  'SHEIKHA_BUDGET_GUARD_V1',
  'SHEIKHA_GPU_FARM_READINESS_V1',
  'SHEIKHA_MULTICLOUD_FABRIC_V1',
  'SHEIKHA_PROVIDER_COMPUTE_FABRIC_V1',
  'SHEIKHA_COMMERCIAL_REAL_ACTIVATION_V1',
  'SHEIKHA_MULTI_SUPERCOMPUTER_CLOUD_FABRIC_V1',
  'SHEIKHA_AI_SUPERCOMPUTER_CLOUD_CLUSTER_PIPELINE_FABRIC_V1',
  'SERVICE_MESH_POLICY_LAYER',
  'DATA_MESH_LAKEHOUSE_READINESS',
  'GEO_DISTRIBUTED_AI_READINESS',
  'MIXTURE_OF_EXPERTS_ROUTING_GOVERNANCE',
  'MULTI_AGENT_GOVERNED_OPERATING_SYSTEM',
  'SHEIKHA_COMMERCIAL_PRODUCT_LAYER_V1'
];

const requiredDomains = [
  'governance',
  'industry',
  'trade',
  'supply_chain',
  'recycling',
  'smart_cities',
  'markets',
  'advisory',
  'data',
  'ai'
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
  'Multi-Agent Orchestrator',
  'PM2 Cluster Runtime',
  'Jest',
  'ESLint',
  'Runtime Drift Detector',
  'Runtime Admission Controller',
  'Fabric Bootstrap Loader'
];

const requiredPolicies = [
  'evidence_first_truthfulness',
  'no_unapproved_compute_spend',
  'data_rights_before_ingestion',
  'evaluation_before_deployment',
  'drift_monitoring_required',
  'human_approval_for_high_risk',
  'commercial_claim_contract_gate',
  'model_training_run_evidence_required',
  'geo_distributed_contract_gate',
  'agent_permission_least_privilege',
  'route_binding_integrity',
  'domain_pipeline_traceability'
];

const ugitRoute = fabric?.routes?.find((route) => route.name === 'ugit-ai-control-plane-v1');
const providerComputeRoute = fabric?.routes?.find((route) => route.name === 'provider-compute-fabric-v1');
const commercialRealRoute = fabric?.routes?.find((route) => route.name === 'commercial-real-activation-v1');
const multiSupercomputerRoute = fabric?.routes?.find((route) => route.name === 'multi-supercomputer-cloud-fabric-v1');
const aiSupercomputerPipelineRoute =
  fabric?.routes?.find((route) => route.name === 'ai-supercomputer-cloud-cluster-pipeline-fabric-v1');
const cloudRoute = fabric?.routes?.find((route) => route.name === 'cloud-supercomputer-fabric-v1');

const dependencies = {
  rootOperatingCore: exists('runtime/root-operating-core/v1/sheikha-root-operating-core-report.json'),
  rootAuthorityLayer: exists('runtime/root-authority-layer/v1/sheikha-root-authority-layer-report.json'),
  stabilityLayer: exists('runtime/stability-layer/v1/sheikha-stability-layer-report.json'),
  knowledgeEngineV2: exists('runtime/knowledge-engine/v2/sheikha-knowledge-engine-v2-report.json'),
  decisionRegistryV2: exists('runtime/decision-registry/v2/sheikha-decision-registry-v2-report.json'),
  capabilityRegistryV2: exists('runtime/capability-registry/v2/sheikha-capability-registry-v2-report.json'),
  governanceOrchestrator: exists('runtime/governance-orchestrator/v1/sheikha-governance-orchestrator-v1-report.json'),
  aiClusterPipelineFabric: exists('runtime/ai-cluster-pipeline-fabric/v1/sheikha-ai-cluster-pipeline-fabric-v1-report.json'),
  sovereignCommercialAiSupercluster: exists('runtime/sovereign-commercial-ai-supercluster/v1/sheikha-sovereign-commercial-ai-supercluster-v1-report.json'),
  cloudSupercomputerFabric: exists('runtime/cloud-supercomputer-fabric/v1/sheikha-cloud-supercomputer-fabric-v1-report.json'),
  providerRegistry: exists('runtime/provider-registry/v1/sheikha-provider-registry-v1.json'),
  computeContractEngine: exists('runtime/compute-contract-engine/v1/sheikha-compute-contract-engine-v1.json'),
  budgetGuard: exists('runtime/budget-guard/v1/sheikha-budget-guard-v1.json'),
  gpuFarmReadiness: exists('runtime/gpu-farm-readiness/v1/sheikha-gpu-farm-readiness-v1.json'),
  multicloudFabric: exists('runtime/multicloud-fabric/v1/sheikha-multicloud-fabric-v1.json'),
  providerComputeFabric: exists('runtime/provider-registry/v1/sheikha-provider-compute-fabric-v1-report.json'),
  commercialRealActivation: exists('runtime/commercial-real-activation/v1/sheikha-commercial-real-activation-v1-report.json'),
  multiSupercomputerCloudFabric: exists('runtime/multi-supercomputer-cloud-fabric/v1/sheikha-multi-supercomputer-cloud-fabric-v1-report.json'),
  aiSupercomputerCloudClusterPipelineFabric: exists('runtime/ai-supercomputer-cloud-cluster-pipeline-fabric/v1/sheikha-ai-supercomputer-cloud-cluster-pipeline-fabric-v1-report.json'),
  commercialProductLayer: exists('runtime/commercial-product-layer/v1/sheikha-commercial-product-layer-v1-report.json'),
  runtimeAdmissionController: exists('tools/governance/runtime-admission-controller.js'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const checks = {
  registryActive: registry?.status === 'ACTIVE',
  officialPlatformNamed: registry?.official_platform?.acronym === 'SHEIKHA UGIT-RP',
  positionedAboveCloudAndSupercluster: registry?.position === 'ABOVE_CLOUD_SUPERCOMPUTER_AND_SOVEREIGN_AI_SUPERCLUSTER',
  operatingLayersComplete: requiredSystems.every((system) =>
    layerItems.some((layer) => layer.system === system)
  ),
  layersDoNotClaimExecution: all(layerItems, (layer) => layer.executionClaim === false),
  domainsComplete: requiredDomains.every((domain) =>
    domainItems.some((item) => item.domain === domain)
  ),
  domainsGated: all(domainItems, (domain) => domain.governanceGate === true),
  toolingComplete: requiredTools.every((tool) =>
    toolItems.some((item) => item.name === tool)
  ),
  noToolInstallationClaims: all(toolItems, (tool) => tool.installationClaim === false),
  policiesComplete: requiredPolicies.every((policy) =>
    policyItems.some((item) => item.name === policy)
  ),
  policiesEnforced: all(policyItems, (policy) => policy.enforced === true),
  truthfulnessPolicy: Boolean(
    registry?.truthfulness?.architecture_and_readiness_only &&
    registry?.truthfulness?.no_external_model_claim &&
    registry?.truthfulness?.no_physical_compute_claim &&
    registry?.truthfulness?.no_provider_contract_claim_without_signed_contract &&
    registry?.truthfulness?.no_customer_claim_without_contract &&
    registry?.truthfulness?.no_partner_claim_without_signed_agreement &&
    registry?.truthfulness?.no_revenue_claim_without_payment &&
    registry?.truthfulness?.no_tool_installation_claim_without_runtime_evidence &&
    registry?.truthfulness?.no_model_training_claim_without_run_evidence
  ),
  commercialProductLinked: Boolean(
    commercialProducts?.products?.some((product) => product.id === productId)
  ),
  productSheetLinked: Boolean(
    productSheets?.products?.some((sheet) => sheet.productId === productId)
  ),
  valueProofLinked: Boolean(
    proofTargets.some((proof) => proof.id === 'VP-007' && proof.externalClaimAllowed === false)
  ),
  cloudFabricRouteMounted: Boolean(
    cloudRoute &&
    cloudRoute.mount === '/api/ai/cloud-supercomputer-fabric' &&
    cloudRoute.module === 'routes/cloud-supercomputer-fabric/status.routes.js'
  ),
  providerComputeFabricRouteMounted: Boolean(
    providerComputeRoute &&
    providerComputeRoute.mount === '/api/ai/provider-compute-fabric' &&
    providerComputeRoute.module === 'routes/provider-compute-fabric/status.routes.js'
  ),
  commercialRealActivationRouteMounted: Boolean(
    commercialRealRoute &&
    commercialRealRoute.mount === '/api/commercial/real-activation' &&
    commercialRealRoute.module === 'routes/commercial-real-activation/status.routes.js'
  ),
  multiSupercomputerCloudFabricRouteMounted: Boolean(
    multiSupercomputerRoute &&
    multiSupercomputerRoute.mount === '/api/ai/multi-supercomputer-cloud-fabric' &&
    multiSupercomputerRoute.module === 'routes/multi-supercomputer-cloud-fabric/status.routes.js'
  ),
  aiSupercomputerCloudClusterPipelineFabricRouteMounted: Boolean(
    aiSupercomputerPipelineRoute &&
    aiSupercomputerPipelineRoute.mount === '/api/ai/supercomputer-cloud-cluster-pipeline-fabric' &&
    aiSupercomputerPipelineRoute.module === 'routes/ai-supercomputer-cloud-cluster-pipeline-fabric/status.routes.js'
  ),
  fabricRouteMounted: Boolean(
    ugitRoute &&
    ugitRoute.mount === '/api/ai/ugit-control-plane' &&
    ugitRoute.module === 'routes/ugit-ai-control-plane/status.routes.js' &&
    ugitRoute.priority >= 230
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
  system: 'SHEIKHA_UGIT_AI_CONTROL_PLANE_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 4) : 100,
  decision: missing.length ? 'REVIEW_UGIT_AI_CONTROL_PLANE_GAPS' : 'UGIT_AI_CONTROL_PLANE_ACTIVE_100',
  officialPlatform: registry?.official_platform,
  activation: {
    type: 'CONTROL_PLANE_AND_READINESS_GOVERNANCE',
    commercialProduct: productId,
    noPhysicalComputeClaim: true,
    noModelTrainingClaim: true,
    noToolInstallationClaim: true,
    noProviderOrCustomerClaim: true
  },
  dependencies,
  checks,
  missing,
  missingDependencies,
  missingChecks,
  coverage: {
    operatingLayers: layerItems.length,
    domains: domainItems.length,
    tools: toolItems.length,
    policies: policyItems.length,
    installationClaims: toolItems.filter((tool) => tool.installationClaim === true).length,
    executionClaims: layerItems.filter((layer) => layer.executionClaim === true).length,
    externalClaimsAllowed: proofTargets.filter((proof) => proof.externalClaimAllowed === true).length
  },
  nextActions: [
    'Create provider registry, budget guard, and workload scheduler before real paid compute.',
    'Create adapter contracts for Airflow, Kubernetes, Kubeflow, MLflow, Spark, vector stores, and agent orchestration only after runtime evidence exists.',
    'Keep UGIT-RP AI Control Plane as governed readiness until hardware, cloud, customer, or partner contracts are documented.',
    'Expose customer-facing product material only after legal review, IP review, and signed commercial terms.'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

fs.mkdirSync(resolvePath(CONTROL_DIR), { recursive: true });
writeJson(`${CONTROL_DIR}/sheikha-ugit-ai-control-plane-v1-report.json`, report);

fs.writeFileSync(
  resolvePath(`${CONTROL_DIR}/sheikha-ugit-ai-control-plane-v1-report.md`),
  `# SHEIKHA_UGIT_AI_CONTROL_PLANE_V1

## الحالة
- النظام: ${report.system}
- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

## الاسم الأعلى
- الاسم التسويقي: ${report.officialPlatform?.marketingName}
- الاختصار الرسمي: ${report.officialPlatform?.acronym}
- التعريف: ${report.officialPlatform?.arabicDefinition}

## نوع التفعيل
- النوع: ${report.activation.type}
- المنتج التجاري: ${report.activation.commercialProduct}
- ادعاء حوسبة فعلية: لا
- ادعاء تدريب نموذج: لا
- ادعاء تثبيت أدوات خارجية: لا
- ادعاء مزود أو عميل: لا

## التغطية
- طبقات التشغيل: ${report.coverage.operatingLayers}
- النطاقات: ${report.coverage.domains}
- الأدوات: ${report.coverage.tools}
- السياسات: ${report.coverage.policies}
- ادعاءات تثبيت أدوات: ${report.coverage.installationClaims}
- ادعاءات تنفيذ فعلية: ${report.coverage.executionClaims}
- ادعاءات خارجية مسموحة بلا دليل: ${report.coverage.externalClaimsAllowed}

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
