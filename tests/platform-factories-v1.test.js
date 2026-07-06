const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

describe('Sheikha Platform Factories V1', () => {
  test('platform factories registry is active and truthfulness gated', () => {
    const registry = readJson('runtime/platform-factories/v1/sheikha-platform-factories-v1.json');

    expect(registry.system).toBe('SHEIKHA_PLATFORM_FACTORIES_V1');
    expect(registry.status).toBe('ACTIVE');
    expect(registry.position).toBe('ABOVE_CUSTOMER_REVENUE_EXPERIENCE_BELOW_UGIT_CONTROL_PLANE');
    expect(registry.factories).toEqual([
      'SCIENCE_FACTORY',
      'EDUCATION_FACTORY',
      'PRODUCT_FACTORY',
      'IMPACT_FACTORY'
    ]);
    expect(registry.truthfulness.no_academic_accreditation_claim_without_approval).toBe(true);
    expect(registry.truthfulness.no_scientific_publication_claim_without_review).toBe(true);
    expect(registry.truthfulness.no_product_market_claim_without_launch_evidence).toBe(true);
    expect(registry.truthfulness.no_impact_claim_without_measurement).toBe(true);
  });

  test('all four factories define inputs outputs gates and metrics', () => {
    [
      'science-factory',
      'education-factory',
      'product-factory',
      'impact-factory'
    ].forEach((fileName) => {
      const factory = readJson(`runtime/platform-factories/v1/registries/${fileName}.json`);

      expect(factory.status).toBe('ACTIVE');
      expect(factory.inputs.length).toBeGreaterThanOrEqual(5);
      expect(factory.outputs.length).toBeGreaterThanOrEqual(5);
      expect(factory.qualityGates.length).toBeGreaterThanOrEqual(5);
      expect(factory.metrics.length).toBeGreaterThanOrEqual(4);
    });
  });

  test('factory pipeline maps science education product and impact flow', () => {
    const pipeline = readJson('runtime/platform-factories/v1/registries/factory-pipeline-map.json');
    const factories = new Set(pipeline.pipeline.map((item) => item.factory));

    expect(pipeline.status).toBe('ACTIVE');
    expect(factories.has('SCIENCE_FACTORY')).toBe(true);
    expect(factories.has('EDUCATION_FACTORY')).toBe(true);
    expect(factories.has('PRODUCT_FACTORY')).toBe(true);
    expect(factories.has('IMPACT_FACTORY')).toBe(true);
    expect(pipeline.governanceFlow).toContain('decision_registry_update');
  });

  test('platform factories report has script docs and fabric route', () => {
    const report = readJson('runtime/platform-factories/v1/sheikha-platform-factories-v1-report.json');
    const packageJson = readJson('package.json');
    const docs = readText('docs/platform-factories/SHEIKHA-PLATFORM-FACTORIES-V1.md');
    const fabric = readJson('runtime/fabric-bootstrap/sheikha-fabric-routes.json');
    const route = fabric.routes.find((item) => item.name === 'platform-factories-v1');

    expect(report.status).toBe('ACTIVE');
    expect(report.score).toBe(100);
    expect(report.decision).toBe('PLATFORM_FACTORIES_ACTIVE_100');
    expect(report.missing).toEqual([]);
    expect(report.coverage.factories).toBe(4);
    expect(packageJson.scripts['ops:platform-factories:v1']).toBe(
      'node tools/platform-factories/sheikha-platform-factories-v1.js'
    );
    expect(docs).toContain('SHEIKHA_PLATFORM_FACTORIES_V1');
    expect(docs).toContain('/api/platform/factories/status');
    expect(route).toEqual(expect.objectContaining({
      mount: '/api/platform/factories',
      module: 'routes/platform-factories/status.routes.js',
      priority: 229
    }));
  });
});
