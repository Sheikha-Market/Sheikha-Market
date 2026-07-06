const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

describe('Sheikha AI Cluster Pipeline Fabric V1', () => {
  test('ai cluster pipeline fabric is active as governed readiness fabric', () => {
    const registry = readJson('runtime/ai-cluster-pipeline-fabric/v1/sheikha-ai-cluster-pipeline-fabric-v1.json');

    expect(registry.system).toBe('SHEIKHA_AI_CLUSTER_PIPELINE_FABRIC_V1');
    expect(registry.status).toBe('ACTIVE');
    expect(registry.position).toBe('ABOVE_COMMERCIAL_PRODUCT_LAYER_AS_AI_INFRASTRUCTURE_PRODUCT');
    expect(registry.commercial_product).toBe('PROD-AICL-001');
    expect(registry.governed_by).toEqual(expect.arrayContaining([
      'SHEIKHA_CAPABILITY_REGISTRY_V2',
      'SHEIKHA_COMMERCIAL_PRODUCT_LAYER_V1',
      'SHEIKHA_COMMERCIAL_EXECUTION_CLUSTER_V1'
    ]));
  });

  test('truthfulness policy blocks unsupported infrastructure, tool, and model claims', () => {
    const registry = readJson('runtime/ai-cluster-pipeline-fabric/v1/sheikha-ai-cluster-pipeline-fabric-v1.json');
    const topology = readJson('runtime/ai-cluster-pipeline-fabric/v1/registries/cluster-topology-registry.json');
    const tools = readJson('runtime/ai-cluster-pipeline-fabric/v1/registries/ai-pipeline-tooling-registry.json');

    expect(registry.truthfulness_policy.readiness_fabric_only).toBe(true);
    expect(registry.truthfulness_policy.physical_supercluster_claim).toBe(false);
    expect(registry.truthfulness_policy.gpu_ownership_claim).toBe(false);
    expect(registry.truthfulness_policy.model_training_claim).toBe(false);
    expect(registry.truthfulness_policy.tool_installation_claim).toBe(false);
    expect(topology.topology.every((item) => item.physicalClaim === false)).toBe(true);
    expect(tools.tools.every((item) => item.installationClaim === false)).toBe(true);
  });

  test('cluster hierarchy, ai pipeline stages, and tools are complete', () => {
    const topology = readJson('runtime/ai-cluster-pipeline-fabric/v1/registries/cluster-topology-registry.json');
    const stages = readJson('runtime/ai-cluster-pipeline-fabric/v1/registries/ai-pipeline-stages-registry.json');
    const tools = readJson('runtime/ai-cluster-pipeline-fabric/v1/registries/ai-pipeline-tooling-registry.json');

    const levels = new Set(topology.topology.map((item) => item.level));
    const pipelineStages = new Set(stages.pipeline.map((item) => item.stage));
    const toolNames = new Set(tools.tools.map((item) => item.name));

    [
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
    ].forEach((level) => expect(levels.has(level)).toBe(true));

    [
      'DATA_INGESTION',
      'PREPROCESSING_CLEANING',
      'FEATURE_ENGINEERING_OR_RETRIEVAL_PREP',
      'MODEL_TRAINING_OR_ADAPTATION',
      'EVALUATION_TESTING',
      'DEPLOYMENT_INFERENCE',
      'MONITORING_DRIFT_TELEMETRY'
    ].forEach((stage) => expect(pipelineStages.has(stage)).toBe(true));

    [
      'Apache Airflow',
      'Apache Spark',
      'Kubernetes',
      'Kubeflow',
      'MLflow',
      'Hugging Face Pipelines',
      'MoE Router',
      'Multi-Agent Orchestrator'
    ].forEach((tool) => expect(toolNames.has(tool)).toBe(true));
  });

  test('fabric report is active and linked to the commercial product layer', () => {
    const report = readJson('runtime/ai-cluster-pipeline-fabric/v1/sheikha-ai-cluster-pipeline-fabric-v1-report.json');
    const products = readJson('runtime/commercial-product-layer/v1/registries/commercial-products-registry.json');
    const sheets = readJson('runtime/commercial-product-layer/v1/registries/product-sheets-registry.json');

    expect(report.status).toBe('ACTIVE');
    expect(report.score).toBe(100);
    expect(report.decision).toBe('AI_CLUSTER_PIPELINE_FABRIC_ACTIVE_100');
    expect(report.missing).toEqual([]);
    expect(Object.values(report.checks).every(Boolean)).toBe(true);
    expect(products.products.some((product) => product.id === 'PROD-AICL-001')).toBe(true);
    expect(sheets.products.some((sheet) => sheet.productId === 'PROD-AICL-001')).toBe(true);
  });

  test('fabric has script, docs, and fabric bootstrap route', () => {
    const packageJson = readJson('package.json');
    const docs = readText('docs/ai-cluster-pipeline-fabric/SHEIKHA-AI-CLUSTER-PIPELINE-FABRIC-V1.md');
    const fabric = readJson('runtime/fabric-bootstrap/sheikha-fabric-routes.json');
    const route = fabric.routes.find((item) => item.name === 'ai-cluster-pipeline-fabric-v1');

    expect(packageJson.scripts['ops:ai-cluster-pipeline-fabric:v1']).toBe(
      'node tools/ai-cluster-pipeline-fabric/sheikha-ai-cluster-pipeline-fabric-v1.js'
    );
    expect(docs).toContain('SHEIKHA_AI_CLUSTER_PIPELINE_FABRIC_V1');
    expect(docs).toContain('PROD-AICL-001');
    expect(route).toEqual(expect.objectContaining({
      mount: '/api/ai/cluster-pipeline-fabric',
      module: 'routes/ai-cluster-pipeline-fabric/status.routes.js'
    }));
  });
});
