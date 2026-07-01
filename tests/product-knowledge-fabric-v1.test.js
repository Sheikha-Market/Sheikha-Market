'use strict';

const {
  getProductKnowledgeFabric,
  normalizeProduct,
  validateProduct
} = require('../core/product-knowledge/product-knowledge-fabric');

describe('Sheikha Product Knowledge Fabric V1', () => {
  test('fabric is active', () => {
    const fabric = getProductKnowledgeFabric();

    expect(fabric.system).toBe('SHEIKHA_PRODUCT_KNOWLEDGE_FABRIC_V1');
    expect(fabric.status).toBe('ACTIVE');
    expect(fabric.domains).toContain('quality');
    expect(fabric.domains).toContain('pricing');
  });

  test('normalizes product knowledge', () => {
    const product = normalizeProduct({
      name: 'Steel Scrap',
      category: 'metals',
      price: { amount: 1000, currency: 'SAR' },
      quality: { score: 85 }
    });

    expect(product.name).toBe('Steel Scrap');
    expect(product.price.pricingStatus).toBe('DEFINED');
    expect(product.quality.inspectionRequired).toBe(true);
  });

  test('validates product quality gate', () => {
    const result = validateProduct({
      name: 'Copper Cable',
      category: 'metals',
      description: 'Industrial copper cable scrap.',
      specifications: { purity: 'mixed', unit: 'kg' },
      standards: ['internal-inspection-required'],
      price: { amount: 25, currency: 'SAR' },
      quality: { score: 80 },
      risk: { level: 'LOW', notes: [] }
    });

    expect(result.valid).toBe(true);
    expect(result.qualityGate).toBe(true);
  });
});
