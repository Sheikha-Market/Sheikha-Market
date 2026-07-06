const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

describe('Sheikha Customer Classification V1', () => {
  test('customer classification registry is active and evidence gated', () => {
    const registry = readJson('runtime/customer-classification/v1/sheikha-customer-classification-v1.json');

    expect(registry.system).toBe('SHEIKHA_CUSTOMER_CLASSIFICATION_V1');
    expect(registry.status).toBe('ACTIVE');
    expect(registry.position).toBe('UNDER_PLATFORM_OPERATING_ENGINES_ABOVE_CUSTOMER_REGISTRATION');
    expect(registry.truthfulness.classification_is_not_contract_claim).toBe(true);
    expect(registry.truthfulness.classification_is_not_customer_acquisition_claim).toBe(true);
    expect(registry.truthfulness.classification_is_not_revenue_claim).toBe(true);
    expect(registry.rules.no_revenue_customer_without_paid_invoice).toBe(true);
  });

  test('taxonomy covers customer segment type model role verification and priority', () => {
    const taxonomy = readJson('runtime/customer-classification/v1/registries/customer-taxonomy-registry.json');

    [
      'B2G',
      'B2B',
      'B2C',
      'D2C',
      'B2B2C',
      'B2B2G',
      'G2B'
    ].forEach((item) => expect(taxonomy.customerSegments).toContain(item));

    [
      'GOVERNMENT_ENTITY',
      'MINISTRY',
      'PRIVATE_COMPANY',
      'FACTORY',
      'SUPPLIER',
      'BUYER',
      'TRADER',
      'LOGISTICS_PROVIDER',
      'CONSULTANT',
      'INDIVIDUAL_CUSTOMER'
    ].forEach((item) => expect(taxonomy.customerTypes).toContain(item));

    expect(taxonomy.businessModels).toContain('MARKETPLACE');
    expect(taxonomy.businessModels).toContain('ENTERPRISE_LICENSE');
    expect(taxonomy.roles).toContain('GOVERNANCE_REVIEWER');
    expect(taxonomy.verificationLevels).toContain('CONTRACT_VERIFIED');
    expect(taxonomy.commercialPriorities).toContain('STRATEGIC_ACCOUNT');
  });

  test('strategic sectors products values revenue and dashboards are mapped', () => {
    const strategicSegments = readJson('runtime/customer-classification/v1/registries/strategic-segments-registry.json');
    const sectors = readJson('runtime/customer-classification/v1/registries/sector-registry.json');
    const productValueMap = readJson('runtime/customer-classification/v1/registries/product-value-map.json');
    const dashboardRouting = readJson('runtime/customer-classification/v1/registries/dashboard-routing-map.json');

    expect(strategicSegments.segments.map((item) => item.code)).toEqual([
      'S1',
      'S2',
      'S3',
      'S4',
      'S5',
      'S6',
      'S7'
    ]);
    expect(strategicSegments.segments.every((item) => item.accessChannel && item.dashboard)).toBe(true);
    expect(sectors.sectors.map((item) => item.code)).toEqual(expect.arrayContaining([
      'GOV',
      'ECON',
      'TRADE',
      'SCM',
      'LOG',
      'IND',
      'ENERGY',
      'MINING',
      'COM',
      'SPACE',
      'AI',
      'DATA'
    ]));
    expect(productValueMap.productFamilies.length).toBeGreaterThanOrEqual(6);
    expect(productValueMap.revenueStreams.length).toBeGreaterThanOrEqual(10);
    expect(dashboardRouting.routes.length).toBeGreaterThanOrEqual(6);
    expect(dashboardRouting.routes.some((item) =>
      item.dashboard === 'GOVERNANCE_AND_REGULATION_COMMAND_DASHBOARD'
    )).toBe(true);
  });

  test('customer classification report has script docs and fabric route', () => {
    const report = readJson('runtime/customer-classification/v1/sheikha-customer-classification-v1-report.json');
    const packageJson = readJson('package.json');
    const docs = readText('docs/customer-classification/SHEIKHA-CUSTOMER-CLASSIFICATION-V1.md');
    const fabric = readJson('runtime/fabric-bootstrap/sheikha-fabric-routes.json');
    const route = fabric.routes.find((item) => item.name === 'customer-classification-v1');

    expect(report.status).toBe('ACTIVE');
    expect(report.score).toBe(100);
    expect(report.decision).toBe('CUSTOMER_CLASSIFICATION_ACTIVE_100');
    expect(report.missing).toEqual([]);
    expect(packageJson.scripts['ops:customer-classification:v1']).toBe(
      'node tools/customer-classification/sheikha-customer-classification-v1.js'
    );
    expect(docs).toContain('SHEIKHA_CUSTOMER_CLASSIFICATION_V1');
    expect(docs).toContain('/api/customers/classification/status');
    expect(route).toEqual(expect.objectContaining({
      mount: '/api/customers/classification',
      module: 'routes/customer-classification/status.routes.js',
      priority: 230
    }));
  });
});
