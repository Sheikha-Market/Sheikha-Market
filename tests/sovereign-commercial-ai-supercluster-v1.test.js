const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

describe('Sheikha Sovereign Commercial AI Supercluster V1', () => {
  test('sovereign commercial ai supercluster is active above ai cluster pipeline fabric', () => {
    const registry = readJson(
      'runtime/sovereign-commercial-ai-supercluster/v1/sheikha-sovereign-commercial-ai-supercluster-v1.json'
    );

    expect(registry.system).toBe('SHEIKHA_SOVEREIGN_COMMERCIAL_AI_SUPERCLUSTER_V1');
    expect(registry.status).toBe('ACTIVE');
    expect(registry.position).toBe('ABOVE_AI_CLUSTER_PIPELINE_FABRIC_AND_COMMERCIAL_EXECUTION_CLUSTER');
    expect(registry.commercial_product).toBe('PROD-AICL-001');
    expect(registry.cluster_layers).toEqual(expect.arrayContaining([
      'COMMERCIAL_EXECUTION_CLUSTER',
      'AI_CLUSTER_PIPELINE_FABRIC'
    ]));
  });

  test('supercluster truthfulness forbids unsupported hardware, customer, partner, training, and revenue claims', () => {
    const registry = readJson(
      'runtime/sovereign-commercial-ai-supercluster/v1/sheikha-sovereign-commercial-ai-supercluster-v1.json'
    );

    expect(registry.truthfulness.architectural_supercluster_only).toBe(true);
    expect(registry.truthfulness.no_hardware_supercomputer_claim).toBe(true);
    expect(registry.truthfulness.no_physical_supercluster_claim).toBe(true);
    expect(registry.truthfulness.no_gpu_fleet_claim_without_evidence).toBe(true);
    expect(registry.truthfulness.no_model_training_claim_without_run_evidence).toBe(true);
    expect(registry.truthfulness.no_customer_claim_without_contract).toBe(true);
    expect(registry.truthfulness.no_partner_claim_without_signed_agreement).toBe(true);
    expect(registry.truthfulness.no_revenue_claim_without_payment).toBe(true);
  });

  test('supercluster report is active with complete dependencies and checks', () => {
    const report = readJson(
      'runtime/sovereign-commercial-ai-supercluster/v1/sheikha-sovereign-commercial-ai-supercluster-v1-report.json'
    );

    expect(report.status).toBe('ACTIVE');
    expect(report.score).toBe(100);
    expect(report.decision).toBe('SOVEREIGN_COMMERCIAL_AI_SUPERCLUSTER_ACTIVE_100');
    expect(report.missing).toEqual([]);
    expect(Object.values(report.dependencies).every(Boolean)).toBe(true);
    expect(Object.values(report.checks).every(Boolean)).toBe(true);
    expect(report.coverage.aiClusterPipelineScore).toBe(100);
  });

  test('supercluster has script, docs, and fabric route', () => {
    const packageJson = readJson('package.json');
    const docs = readText(
      'docs/sovereign-commercial-ai-supercluster/SHEIKHA-SOVEREIGN-COMMERCIAL-AI-SUPERCLUSTER-V1.md'
    );
    const fabric = readJson('runtime/fabric-bootstrap/sheikha-fabric-routes.json');
    const route = fabric.routes.find((item) => item.name === 'sovereign-commercial-ai-supercluster-v1');

    expect(packageJson.scripts['ops:sovereign-commercial-ai-supercluster:v1']).toBe(
      'node tools/sovereign-commercial-ai-supercluster/sheikha-sovereign-commercial-ai-supercluster-v1.js'
    );
    expect(docs).toContain('SHEIKHA_SOVEREIGN_COMMERCIAL_AI_SUPERCLUSTER_V1');
    expect(route).toEqual(expect.objectContaining({
      mount: '/api/ai/sovereign-commercial-supercluster',
      module: 'routes/sovereign-commercial-ai-supercluster/status.routes.js'
    }));
  });
});
