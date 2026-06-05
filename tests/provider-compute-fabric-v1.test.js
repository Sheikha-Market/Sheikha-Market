const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

describe('Sheikha Provider Compute Fabric V1', () => {
  test('provider compute fabric is active with provider contract budget and readiness layers', () => {
    const providerRegistry = readJson('runtime/provider-registry/v1/sheikha-provider-registry-v1.json');
    const contractEngine = readJson('runtime/compute-contract-engine/v1/sheikha-compute-contract-engine-v1.json');
    const budgetGuard = readJson('runtime/budget-guard/v1/sheikha-budget-guard-v1.json');
    const gpuReadiness = readJson('runtime/gpu-farm-readiness/v1/sheikha-gpu-farm-readiness-v1.json');
    const multicloud = readJson('runtime/multicloud-fabric/v1/sheikha-multicloud-fabric-v1.json');

    expect(providerRegistry.system).toBe('SHEIKHA_PROVIDER_REGISTRY_V1');
    expect(providerRegistry.status).toBe('ACTIVE');
    expect(contractEngine.system).toBe('SHEIKHA_COMPUTE_CONTRACT_ENGINE_V1');
    expect(contractEngine.rules.no_gpu_allocation_without_contract).toBe(true);
    expect(budgetGuard.rules.no_paid_training_without_approval).toBe(true);
    expect(gpuReadiness.truthfulness.no_physical_gpu_farm_claim).toBe(true);
    expect(multicloud.rules.no_live_routing_without_provider_credentials).toBe(true);
  });

  test('provider map does not claim signed provider contracts', () => {
    const providers = readJson('runtime/provider-registry/v1/registries/providers.json');
    const providerIds = new Set(providers.providers.map((provider) => provider.id));

    [
      'PROV-AWS',
      'PROV-AZURE',
      'PROV-GCP',
      'PROV-OCI',
      'PROV-ALIBABA',
      'PROV-HOSTINGER',
      'PROV-LOCAL',
      'PROV-OLLAMA',
      'PROV-OPENAI',
      'PROV-ANTHROPIC',
      'PROV-GITHUB-MODELS',
      'PROV-COREWEAVE',
      'PROV-LAMBDA',
      'PROV-CRUSOE'
    ].forEach((providerId) => expect(providerIds.has(providerId)).toBe(true));

    expect(providers.providers.length).toBeGreaterThanOrEqual(11);
    expect(providers.providers.every((provider) => (
      provider.contractStatus === 'NOT_SIGNED' ||
      provider.contractStatus === 'INTERNAL_ONLY'
    ))).toBe(true);
    expect(providers.providers.every((provider) => (
      provider.provider &&
      provider.budget &&
      typeof provider.budget.monthlyLimitSAR === 'number' &&
      provider.budget.humanApprovalRequired === true &&
      provider.capabilities.length > 0 &&
      provider.regions.length > 0 &&
      provider.approvalState &&
      provider.usageStatus !== 'ACTIVE'
    ))).toBe(true);
    expect(providers.providers.filter((provider) => provider.budget.status === 'APPROVED')).toEqual([]);
  });

  test('provider compute report is active and route-aware', () => {
    const report = readJson('runtime/provider-registry/v1/sheikha-provider-compute-fabric-v1-report.json');

    expect(report.status).toBe('ACTIVE');
    expect(report.score).toBe(100);
    expect(report.decision).toBe('PROVIDER_COMPUTE_FABRIC_ACTIVE_100');
    expect(report.missing).toEqual([]);
    expect(Object.values(report.checks).every(Boolean)).toBe(true);
    expect(report.checks.fabricRouteMounted).toBe(true);
    expect(report.coverage.providers).toBeGreaterThanOrEqual(11);
    expect(report.coverage.signedContracts).toBe(0);
    expect(report.coverage.approvedBudgets).toBe(0);
    expect(report.coverage.activeUsageClaims).toBe(0);
  });

  test('provider compute fabric has script docs and fabric route', () => {
    const packageJson = readJson('package.json');
    const docs = readText('docs/provider-compute-fabric/SHEIKHA-PROVIDER-COMPUTE-FABRIC-V1.md');
    const fabric = readJson('runtime/fabric-bootstrap/sheikha-fabric-routes.json');
    const route = fabric.routes.find((item) => item.name === 'provider-compute-fabric-v1');

    expect(packageJson.scripts['ops:provider-compute-fabric:v1']).toBe(
      'node tools/provider-compute-fabric/sheikha-provider-compute-fabric-v1.js'
    );
    expect(docs).toContain('SHEIKHA_PROVIDER_COMPUTE_FABRIC_V1');
    expect(docs).toContain('/api/ai/provider-compute-fabric/status');
    expect(route).toEqual(expect.objectContaining({
      mount: '/api/ai/provider-compute-fabric',
      module: 'routes/provider-compute-fabric/status.routes.js',
      priority: 234
    }));
  });
});
