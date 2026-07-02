'use strict';

const {
  registerProduct,
  getProductById,
  listProducts
} = require('../core/product-knowledge/product-registry');

const {
  detectProductDuplicates
} = require('../core/product-knowledge/product-duplicate-detection');

const {
  evaluateProductGovernance
} = require('../core/product-knowledge/product-governance-rules');

const {
  evaluateLifecycleTransition
} = require('../core/product-knowledge/product-lifecycle-engine');

const {
  buildProductGraph
} = require('../core/product-knowledge/product-graph');

describe('Sheikha Product Knowledge Integration V1', () => {
  test('registers, retrieves, governs, detects duplicates, and builds graph', () => {
    const product = {
      id: 'integration-copper-cable',
      name: 'Copper Cable',
      category: 'metals',
      description: 'Industrial copper cable scrap',
      standards: ['internal-inspection-required'],
      price: { amount: 25, currency: 'SAR' },
      quality: { score: 80 },
      risk: { level: 'LOW' }
    };

    const record = registerProduct(product);

    expect(record.id).toBe('integration-copper-cable');
    expect(getProductById('integration-copper-cable')).not.toBeNull();

    const governance = evaluateProductGovernance(product);
    expect(governance.passed).toBe(true);

    const duplicates = detectProductDuplicates(product, listProducts(), 0.5);
    expect(duplicates.matches.length).toBeGreaterThanOrEqual(1);

    const lifecycle = evaluateLifecycleTransition('DRAFT', 'PENDING_REVIEW');
    expect(lifecycle.allowed).toBe(true);

    const graph = buildProductGraph(listProducts());
    expect(graph.status).toBe('ACTIVE');
    expect(graph.summary.products).toBeGreaterThanOrEqual(1);
  });
});
