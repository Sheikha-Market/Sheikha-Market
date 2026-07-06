const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

describe('Sheikha Commercial Product Layer V1', () => {
  test('commercial product layer is active under capability registry before licensing', () => {
    const registry = readJson('runtime/commercial-product-layer/v1/sheikha-commercial-product-layer-v1.json');

    expect(registry.system).toBe('SHEIKHA_COMMERCIAL_PRODUCT_LAYER_V1');
    expect(registry.status).toBe('ACTIVE');
    expect(registry.position).toBe('UNDER_CAPABILITY_REGISTRY_BEFORE_LICENSING_ENGINE');
    expect(registry.next_layer).toBe('SHEIKHA_LICENSING_ENGINE_V1');
    expect(registry.next_layer_status).toBe(
      'GATED_UNTIL_LEGAL_REVIEW_AND_SIGNED_CONTRACT_FOR_EXTERNAL_SALE'
    );
    expect(registry.governed_by).toEqual(expect.arrayContaining([
      'SHEIKHA_ROOT_AUTHORITY_LAYER_V1',
      'SHEIKHA_DECISION_REGISTRY_V2',
      'SHEIKHA_CAPABILITY_REGISTRY_V2'
    ]));
  });

  test('commercial truthfulness blocks unverified partner, customer, and performance claims', () => {
    const registry = readJson('runtime/commercial-product-layer/v1/sheikha-commercial-product-layer-v1.json');
    const readiness = readJson('runtime/commercial-product-layer/v1/registries/commercial-readiness-registry.json');
    const valueProof = readJson('runtime/commercial-product-layer/v1/registries/commercial-value-proof-registry.json');

    expect(registry.commercial_truthfulness_policy.official_partner_claim).toBe(false);
    expect(registry.commercial_truthfulness_policy.official_customer_claim).toBe(false);
    expect(registry.commercial_truthfulness_policy.external_sale_requires_legal_review).toBe(true);
    expect(registry.commercial_truthfulness_policy.external_license_requires_signed_contract).toBe(true);
    expect(readiness.claimPolicy.customerClaimAllowedWithoutContract).toBe(false);
    expect(readiness.claimPolicy.partnerClaimAllowedWithoutContract).toBe(false);
    expect(valueProof.proofTargets.every((proof) => proof.externalClaimAllowed === false)).toBe(true);
  });

  test('all sellable products have product sheets, tests, kpis, evidence, and license models', () => {
    const products = readJson('runtime/commercial-product-layer/v1/registries/commercial-products-registry.json');
    const productSheets = readJson('runtime/commercial-product-layer/v1/registries/product-sheets-registry.json');
    const sheetProductIds = new Set(productSheets.products.map((sheet) => sheet.productId));

    expect(products.products.length).toBeGreaterThanOrEqual(5);
    products.products.forEach((product) => {
      expect(product.id).toMatch(/^PROD-[A-Z]+-\d{3}$/);
      expect(product.sellable).toBe(true);
      expect(product.value.length).toBeGreaterThan(0);
      expect(product.evidence.length).toBeGreaterThan(0);
      expect(product.commercialModels.length).toBeGreaterThan(0);
      expect(sheetProductIds.has(product.id)).toBe(true);
    });

    productSheets.products.forEach((sheet) => {
      expect(sheet.technicalDocumentation).toBe(true);
      expect(sheet.tests.length).toBeGreaterThan(0);
      expect(sheet.kpis.length).toBeGreaterThan(0);
      expect(sheet.licenseModels.length).toBeGreaterThan(0);
      expect(sheet.externalSaleGate).toBe('LEGAL_REVIEW_AND_SIGNED_CONTRACT_REQUIRED');
    });
  });

  test('commercial product layer report is active with complete checks', () => {
    const report = readJson('runtime/commercial-product-layer/v1/sheikha-commercial-product-layer-v1-report.json');

    expect(report.status).toBe('ACTIVE');
    expect(report.score).toBe(100);
    expect(report.decision).toBe('COMMERCIAL_PRODUCT_LAYER_ACTIVE_100');
    expect(report.missing).toEqual([]);
    expect(Object.values(report.checks).every(Boolean)).toBe(true);
    expect(report.coverage.products).toBeGreaterThanOrEqual(5);
    expect(report.coverage.productSheets).toBeGreaterThanOrEqual(5);
    expect(report.coverage.publicClaimsAllowed).toBe(0);
  });

  test('commercial product layer has script, docs, and fabric route', () => {
    const packageJson = readJson('package.json');
    const docs = readText('docs/commercial-product-layer/SHEIKHA-COMMERCIAL-PRODUCT-LAYER-V1.md');
    const fabric = readJson('runtime/fabric-bootstrap/sheikha-fabric-routes.json');
    const route = fabric.routes.find((item) => item.name === 'commercial-product-layer-v1');

    expect(packageJson.scripts['ops:commercial-product-layer:v1']).toBe(
      'node tools/commercial-product-layer/sheikha-commercial-product-layer-v1.js'
    );
    expect(docs).toContain('SHEIKHA_COMMERCIAL_PRODUCT_LAYER_V1');
    expect(docs).toContain('product-sheets-registry.json');
    expect(route).toEqual(expect.objectContaining({
      mount: '/api/commercial/product-layer',
      module: 'routes/commercial-product-layer/status.routes.js'
    }));
  });
});
