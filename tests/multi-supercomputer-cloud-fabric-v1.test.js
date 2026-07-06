const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

describe('Sheikha Multi Supercomputer Cloud Fabric V1', () => {
  test('multi supercomputer cloud fabric is active above cloud supercomputer fabric', () => {
    const registry = readJson(
      'runtime/multi-supercomputer-cloud-fabric/v1/sheikha-multi-supercomputer-cloud-fabric-v1.json'
    );

    expect(registry.system).toBe('SHEIKHA_MULTI_SUPERCOMPUTER_CLOUD_FABRIC_V1');
    expect(registry.status).toBe('ACTIVE');
    expect(registry.position).toBe('ABOVE_CLOUD_SUPERCOMPUTER_FABRIC');
    expect(registry.fabric_scope).toEqual(expect.arrayContaining([
      'MULTI_CLOUD',
      'MULTI_GPU_PROVIDER',
      'MULTI_HPC_CLUSTER',
      'HYBRID_LOCAL_CLOUD',
      'WORKLOAD_ORCHESTRATION',
      'COST_GOVERNANCE',
      'SLA_GOVERNANCE'
    ]));
  });

  test('multi supercomputer truthfulness prevents unsupported real-world claims', () => {
    const registry = readJson(
      'runtime/multi-supercomputer-cloud-fabric/v1/sheikha-multi-supercomputer-cloud-fabric-v1.json'
    );

    expect(registry.truthfulness.architecture_and_readiness_only).toBe(true);
    expect(registry.truthfulness.no_physical_supercomputer_claim_without_contract).toBe(true);
    expect(registry.truthfulness.no_gpu_farm_claim_without_hardware_or_lease).toBe(true);
    expect(registry.truthfulness.no_cloud_provider_claim_without_service_offering).toBe(true);
    expect(registry.truthfulness.no_partner_claim_without_signed_agreement).toBe(true);
  });

  test('multi supercomputer report is active and route-aware', () => {
    const report = readJson(
      'runtime/multi-supercomputer-cloud-fabric/v1/sheikha-multi-supercomputer-cloud-fabric-v1-report.json'
    );

    expect(report.status).toBe('ACTIVE');
    expect(report.score).toBe(100);
    expect(report.decision).toBe('MULTI_SUPERCOMPUTER_CLOUD_FABRIC_ACTIVE_100');
    expect(report.missing).toEqual([]);
    expect(Object.values(report.checks).every(Boolean)).toBe(true);
    expect(report.checks.fabricRouteMounted).toBe(true);
  });

  test('multi supercomputer cloud fabric has script docs and fabric route', () => {
    const packageJson = readJson('package.json');
    const docs = readText(
      'docs/multi-supercomputer-cloud-fabric/SHEIKHA-MULTI-SUPERCOMPUTER-CLOUD-FABRIC-V1.md'
    );
    const fabric = readJson('runtime/fabric-bootstrap/sheikha-fabric-routes.json');
    const route = fabric.routes.find((item) => item.name === 'multi-supercomputer-cloud-fabric-v1');

    expect(packageJson.scripts['ops:multi-supercomputer-cloud-fabric:v1']).toBe(
      'node tools/multi-supercomputer-cloud-fabric/sheikha-multi-supercomputer-cloud-fabric-v1.js'
    );
    expect(docs).toContain('SHEIKHA_MULTI_SUPERCOMPUTER_CLOUD_FABRIC_V1');
    expect(docs).toContain('/api/ai/multi-supercomputer-cloud-fabric/status');
    expect(route).toEqual(expect.objectContaining({
      mount: '/api/ai/multi-supercomputer-cloud-fabric',
      module: 'routes/multi-supercomputer-cloud-fabric/status.routes.js',
      priority: 232
    }));
  });
});
