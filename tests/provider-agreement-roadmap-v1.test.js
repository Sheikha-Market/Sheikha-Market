const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

describe('Sheikha Provider Agreement Roadmap V1', () => {
  test('provider agreement roadmap is active and truthfulness gated', () => {
    const registry = readJson('runtime/provider-agreement-roadmap/v1/sheikha-provider-agreement-roadmap-v1.json');

    expect(registry.system).toBe('SHEIKHA_PROVIDER_AGREEMENT_ROADMAP_V1');
    expect(registry.status).toBe('ACTIVE');
    expect(registry.position).toBe('UNDER_PROVIDER_COMPUTE_FABRIC_ABOVE_REAL_PROVIDER_CONTRACTS');
    expect(registry.truthfulness.roadmap_is_not_signed_contract).toBe(true);
    expect(registry.truthfulness.roadmap_is_not_active_subscription).toBe(true);
    expect(registry.truthfulness.roadmap_is_not_gpu_ownership_claim).toBe(true);
    expect(registry.truthfulness.roadmap_is_not_supercomputer_ownership_claim).toBe(true);
    expect(registry.rules.no_external_provider_secret_in_repository).toBe(true);
  });

  test('agreement paths cover subscriptions cloud contracts gpu rental and private gpu options', () => {
    const agreementPaths = readJson('runtime/provider-agreement-roadmap/v1/registries/agreement-paths-registry.json');
    const types = new Set(agreementPaths.paths.map((item) => item.type));

    [
      'API_SUBSCRIPTION',
      'GPU_RENTAL',
      'RESERVED_GPU_CAPACITY',
      'ENTERPRISE_CLOUD_CONTRACT',
      'RESELLER_AGREEMENT',
      'PRIVATE_GPU_FARM_PURCHASE_OR_LEASE',
      'HYBRID_CLOUD_OPERATING_AGREEMENT',
      'VPS_CONTROL_PLANE'
    ].forEach((type) => expect(types.has(type)).toBe(true));
    expect(agreementPaths.paths.every((item) =>
      Array.isArray(item.evidenceRequired) && item.evidenceRequired.length > 0
    )).toBe(true);
  });

  test('subscription options include cloud gpu api vps local and remain inactive without evidence', () => {
    const subscriptions = readJson('runtime/provider-agreement-roadmap/v1/registries/subscription-options-registry.json');
    const providers = readJson('runtime/provider-registry/v1/registries/providers.json');
    const providerIds = new Set(providers.providers.map((item) => item.id));
    const optionProviderIds = new Set(subscriptions.options.map((item) => item.providerId));

    [
      'PROV-AWS',
      'PROV-AZURE',
      'PROV-GCP',
      'PROV-OCI',
      'PROV-ALIBABA',
      'PROV-COREWEAVE',
      'PROV-LAMBDA',
      'PROV-CRUSOE',
      'PROV-HOSTINGER',
      'PROV-LOCAL',
      'PROV-OLLAMA',
      'PROV-OPENAI',
      'PROV-ANTHROPIC',
      'PROV-GITHUB-MODELS'
    ].forEach((providerId) => {
      expect(providerIds.has(providerId)).toBe(true);
      expect(optionProviderIds.has(providerId)).toBe(true);
    });

    expect(subscriptions.options.every((item) =>
      item.contractStatus === 'NOT_SIGNED' ||
      item.contractStatus === 'INTERNAL_ONLY'
    )).toBe(true);
    expect(subscriptions.options.every((item) =>
      item.subscriptionStatus === 'NOT_ACTIVE' ||
      item.subscriptionStatus === 'INTERNAL_ONLY'
    )).toBe(true);
    expect(subscriptions.options.every((item) => item.budgetApproved === false)).toBe(true);
    expect(subscriptions.options.every((item) => item.paymentMethodConfigured === false)).toBe(true);
    expect(subscriptions.options.every((item) => item.gpuAvailable === false)).toBe(true);
  });

  test('resource alternatives and activation scripts are mapped', () => {
    const resources = readJson('runtime/provider-agreement-roadmap/v1/registries/resource-options-registry.json');
    const scripts = readJson('runtime/provider-agreement-roadmap/v1/registries/activation-scripts-registry.json');
    const commands = new Set(scripts.scripts.map((item) => item.command));

    expect(resources.options.length).toBeGreaterThanOrEqual(9);
    expect(resources.options.every((item) => item.productionReadyWithoutEvidence === false)).toBe(true);
    [
      'npm run ops:provider-compute-fabric:v1',
      'npm run ops:commercial-real-activation:v1',
      'npm run ops:multi-supercomputer-cloud-fabric:v1',
      'npm run ops:ai-supercomputer-cloud-cluster-pipeline-fabric:v1',
      'npm run ops:customer-classification:v1',
      'npm run ops:provider-agreement-roadmap:v1',
      'npm run ops:compute-integration-readiness:v1'
    ].forEach((command) => expect(commands.has(command)).toBe(true));
  });

  test('provider agreement roadmap report has script docs and fabric route', () => {
    const report = readJson('runtime/provider-agreement-roadmap/v1/sheikha-provider-agreement-roadmap-v1-report.json');
    const packageJson = readJson('package.json');
    const docs = readText('docs/provider-agreement-roadmap/SHEIKHA-PROVIDER-AGREEMENT-ROADMAP-V1.md');
    const fabric = readJson('runtime/fabric-bootstrap/sheikha-fabric-routes.json');
    const route = fabric.routes.find((item) => item.name === 'provider-agreement-roadmap-v1');

    expect(report.status).toBe('ACTIVE');
    expect(report.score).toBe(100);
    expect(report.decision).toBe('PROVIDER_AGREEMENT_ROADMAP_ACTIVE_100');
    expect(report.missing).toEqual([]);
    expect(report.coverage.signedContracts).toBe(0);
    expect(report.coverage.activeSubscriptions).toBe(0);
    expect(report.coverage.gpuAvailableClaims).toBe(0);
    expect(packageJson.scripts['ops:provider-agreement-roadmap:v1']).toBe(
      'node tools/provider-agreement-roadmap/sheikha-provider-agreement-roadmap-v1.js'
    );
    expect(packageJson.scripts['ops:compute-integration-readiness:v1']).toBe(
      'bash tools/activate-sheikha-compute-integration-readiness.sh'
    );
    expect(docs).toContain('SHEIKHA_PROVIDER_AGREEMENT_ROADMAP_V1');
    expect(docs).toContain('/api/provider/agreement-roadmap/status');
    expect(route).toEqual(expect.objectContaining({
      mount: '/api/provider/agreement-roadmap',
      module: 'routes/provider-agreement-roadmap/status.routes.js',
      priority: 236
    }));
  });
});
