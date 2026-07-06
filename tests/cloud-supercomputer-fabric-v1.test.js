const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

describe('Sheikha Cloud Supercomputer Fabric V1', () => {
  test('cloud supercomputer fabric is active as governed readiness layer', () => {
    const registry = readJson('runtime/cloud-supercomputer-fabric/v1/sheikha-cloud-supercomputer-fabric-v1.json');

    expect(registry.system).toBe('SHEIKHA_CLOUD_SUPERCOMPUTER_FABRIC_V1');
    expect(registry.status).toBe('ACTIVE');
    expect(registry.position).toBe('ABOVE_GOVERNANCE_ORCHESTRATOR_AND_SUPERCLUSTER');
    expect(registry.fabric_layers).toEqual(expect.arrayContaining([
      'SOVEREIGN_COMMERCIAL_AI_SUPERCLUSTER',
      'AI_CLUSTER_PIPELINE_FABRIC',
      'CLOUD_COMPUTE_READY',
      'HPC_READY',
      'KUBERNETES_READY'
    ]));
  });

  test('cloud truthfulness blocks unsupported hardware provider gpu and model training claims', () => {
    const registry = readJson('runtime/cloud-supercomputer-fabric/v1/sheikha-cloud-supercomputer-fabric-v1.json');

    expect(registry.truthfulness.cloud_architecture_activation).toBe(true);
    expect(registry.truthfulness.no_physical_supercomputer_ownership_claim).toBe(true);
    expect(registry.truthfulness.no_gpu_cluster_claim_without_contract).toBe(true);
    expect(registry.truthfulness.no_model_training_claim_without_run_evidence).toBe(true);
    expect(registry.truthfulness.provider_contract_required_for_real_compute).toBe(true);
  });

  test('cloud report is active and route-aware', () => {
    const report = readJson('runtime/cloud-supercomputer-fabric/v1/sheikha-cloud-supercomputer-fabric-v1-report.json');

    expect(report.status).toBe('ACTIVE');
    expect(report.score).toBe(100);
    expect(report.decision).toBe('CLOUD_SUPERCOMPUTER_FABRIC_ACTIVE_100');
    expect(report.missing).toEqual([]);
    expect(Object.values(report.checks).every(Boolean)).toBe(true);
    expect(report.checks.fabricRouteMounted).toBe(true);
  });

  test('cloud fabric has script docs and fabric route', () => {
    const packageJson = readJson('package.json');
    const docs = readText('docs/cloud-supercomputer-fabric/SHEIKHA-CLOUD-SUPERCOMPUTER-FABRIC-V1.md');
    const fabric = readJson('runtime/fabric-bootstrap/sheikha-fabric-routes.json');
    const route = fabric.routes.find((item) => item.name === 'cloud-supercomputer-fabric-v1');

    expect(packageJson.scripts['ops:cloud-supercomputer-fabric:v1']).toBe(
      'node tools/cloud-supercomputer-fabric/sheikha-cloud-supercomputer-fabric-v1.js'
    );
    expect(docs).toContain('SHEIKHA_CLOUD_SUPERCOMPUTER_FABRIC_V1');
    expect(docs).toContain('/api/ai/cloud-supercomputer-fabric/status');
    expect(route).toEqual(expect.objectContaining({
      mount: '/api/ai/cloud-supercomputer-fabric',
      module: 'routes/cloud-supercomputer-fabric/status.routes.js',
      priority: 174
    }));
  });
});
