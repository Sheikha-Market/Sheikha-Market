const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

describe('Sheikha AI Supercomputer Cloud Cluster Pipeline Fabric V1', () => {
  test('ai supercomputer cloud cluster pipeline fabric is active above multi supercomputer fabric', () => {
    const registry = readJson(
      'runtime/ai-supercomputer-cloud-cluster-pipeline-fabric/v1/sheikha-ai-supercomputer-cloud-cluster-pipeline-fabric-v1.json'
    );

    expect(registry.system).toBe('SHEIKHA_AI_SUPERCOMPUTER_CLOUD_CLUSTER_PIPELINE_FABRIC_V1');
    expect(registry.status).toBe('ACTIVE');
    expect(registry.position).toBe('ABOVE_MULTI_SUPERCOMPUTER_CLOUD_FABRIC');
    expect(registry.fabric_components).toEqual(expect.arrayContaining([
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
    ]));
  });

  test('truthfulness prevents unsupported compute provider model and partner claims', () => {
    const registry = readJson(
      'runtime/ai-supercomputer-cloud-cluster-pipeline-fabric/v1/sheikha-ai-supercomputer-cloud-cluster-pipeline-fabric-v1.json'
    );

    expect(registry.truthfulness.architecture_and_readiness_only).toBe(true);
    expect(registry.truthfulness.no_physical_supercomputer_claim_without_contract).toBe(true);
    expect(registry.truthfulness.no_gpu_farm_claim_without_hardware_or_lease).toBe(true);
    expect(registry.truthfulness.no_model_training_claim_without_run_log).toBe(true);
    expect(registry.truthfulness.no_cloud_provider_claim_without_service_offering).toBe(true);
    expect(registry.truthfulness.no_partner_claim_without_signed_agreement).toBe(true);
  });

  test('ai supercomputer cloud cluster pipeline report is active and route-aware', () => {
    const report = readJson(
      'runtime/ai-supercomputer-cloud-cluster-pipeline-fabric/v1/sheikha-ai-supercomputer-cloud-cluster-pipeline-fabric-v1-report.json'
    );

    expect(report.status).toBe('ACTIVE');
    expect(report.score).toBe(100);
    expect(report.decision).toBe('AI_SUPERCOMPUTER_CLOUD_CLUSTER_PIPELINE_FABRIC_ACTIVE_100');
    expect(report.missing).toEqual([]);
    expect(Object.values(report.checks).every(Boolean)).toBe(true);
    expect(report.coverage.physicalSupercomputerClaims).toBe(0);
    expect(report.coverage.gpuFarmClaims).toBe(0);
    expect(report.coverage.modelTrainingClaims).toBe(0);
    expect(report.coverage.providerClaims).toBe(0);
  });

  test('ai supercomputer cloud cluster pipeline has script docs and fabric route', () => {
    const packageJson = readJson('package.json');
    const docs = readText(
      'docs/ai-supercomputer-cloud-cluster-pipeline-fabric/SHEIKHA-AI-SUPERCOMPUTER-CLOUD-CLUSTER-PIPELINE-FABRIC-V1.md'
    );
    const fabric = readJson('runtime/fabric-bootstrap/sheikha-fabric-routes.json');
    const route = fabric.routes.find((item) => item.name === 'ai-supercomputer-cloud-cluster-pipeline-fabric-v1');

    expect(packageJson.scripts['ops:ai-supercomputer-cloud-cluster-pipeline-fabric:v1']).toBe(
      'node tools/ai-supercomputer-cloud-cluster-pipeline-fabric/sheikha-ai-supercomputer-cloud-cluster-pipeline-fabric-v1.js'
    );
    expect(docs).toContain('SHEIKHA_AI_SUPERCOMPUTER_CLOUD_CLUSTER_PIPELINE_FABRIC_V1');
    expect(docs).toContain('/api/ai/supercomputer-cloud-cluster-pipeline-fabric/status');
    expect(route).toEqual(expect.objectContaining({
      mount: '/api/ai/supercomputer-cloud-cluster-pipeline-fabric',
      module: 'routes/ai-supercomputer-cloud-cluster-pipeline-fabric/status.routes.js',
      priority: 231
    }));
  });
});
