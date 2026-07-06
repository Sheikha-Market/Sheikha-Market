const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

describe('Sheikha Commercial Real Activation V1', () => {
  test('commercial real activation layers are active but evidence gated', () => {
    const providerApproval = readJson('runtime/provider-approval-engine/v1/sheikha-provider-approval-engine-v1.json');
    const workload = readJson('runtime/workload-orchestrator/v1/sheikha-workload-orchestrator-v1.json');
    const sla = readJson('runtime/sla-engine/v1/sheikha-sla-engine-v1.json');
    const revenue = readJson('runtime/revenue-engine/v1/sheikha-revenue-engine-v1.json');
    const partners = readJson('runtime/partner-registry/v1/sheikha-partner-registry-v1.json');
    const marketplace = readJson('runtime/marketplace-engine/v1/sheikha-marketplace-engine-v1.json');

    expect(providerApproval.status).toBe('ACTIVE');
    expect(workload.status).toBe('ACTIVE');
    expect(sla.status).toBe('ACTIVE');
    expect(revenue.status).toBe('ACTIVE');
    expect(partners.status).toBe('ACTIVE');
    expect(marketplace.status).toBe('ACTIVE');
    expect(providerApproval.rules.no_provider_activation_without_contract).toBe(true);
    expect(workload.rules.provider_approval_required).toBe(true);
    expect(sla.rules.sla_requires_contract).toBe(true);
    expect(revenue.rules.no_revenue_claim_without_payment).toBe(true);
    expect(partners.rules.no_partner_claim_without_signed_agreement).toBe(true);
    expect(marketplace.rules.no_sale_without_contract).toBe(true);
  });

  test('real commercial metrics remain zero until contracts payments and partners exist', () => {
    const revenue = readJson('runtime/revenue-engine/v1/sheikha-revenue-engine-v1.json');
    const partners = readJson('runtime/partner-registry/v1/sheikha-partner-registry-v1.json');

    expect(revenue.metrics).toEqual(expect.objectContaining({
      customers: 0,
      contracts: 0,
      licenses: 0,
      invoices: 0,
      paidRevenueSAR: 0
    }));
    expect(partners.partners).toEqual([]);
  });

  test('commercial real activation report is active and route-aware', () => {
    const report = readJson('runtime/commercial-real-activation/v1/sheikha-commercial-real-activation-v1-report.json');

    expect(report.status).toBe('ACTIVE');
    expect(report.score).toBe(100);
    expect(report.decision).toBe('COMMERCIAL_REAL_ACTIVATION_ACTIVE_100');
    expect(report.missing).toEqual([]);
    expect(Object.values(report.checks).every(Boolean)).toBe(true);
    expect(report.realWorldMetrics).toEqual(expect.objectContaining({
      customers: 0,
      contracts: 0,
      licenses: 0,
      invoices: 0,
      paidRevenueSAR: 0,
      partners: 0
    }));
  });

  test('commercial real activation has script docs and fabric route', () => {
    const packageJson = readJson('package.json');
    const docs = readText('docs/commercial-real-activation/SHEIKHA-COMMERCIAL-REAL-ACTIVATION-V1.md');
    const fabric = readJson('runtime/fabric-bootstrap/sheikha-fabric-routes.json');
    const route = fabric.routes.find((item) => item.name === 'commercial-real-activation-v1');

    expect(packageJson.scripts['ops:commercial-real-activation:v1']).toBe(
      'node tools/commercial-real-activation/sheikha-commercial-real-activation-v1.js'
    );
    expect(docs).toContain('SHEIKHA_COMMERCIAL_REAL_ACTIVATION_V1');
    expect(docs).toContain('/api/commercial/real-activation/status');
    expect(route).toEqual(expect.objectContaining({
      mount: '/api/commercial/real-activation',
      module: 'routes/commercial-real-activation/status.routes.js',
      priority: 233
    }));
  });
});
