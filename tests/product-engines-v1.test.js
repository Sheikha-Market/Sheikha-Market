'use strict';

const { evaluateProductQuality } = require('../core/product-knowledge/product-quality-engine');
const { evaluateProductPricing } = require('../core/product-knowledge/product-pricing-engine');
const { evaluateProductStandards } = require('../core/product-knowledge/product-standards-engine');

describe('Sheikha Product Engines V1', () => {
  const product = {
    price: { amount: 25, currency: 'SAR' },
    quality: { score: 80 },
    risk: { level: 'LOW' },
    standards: ['internal-inspection-required']
  };

  test('quality engine evaluates product quality', () => {
    const result = evaluateProductQuality(product);

    expect(result.system).toBe('SHEIKHA_PRODUCT_QUALITY_ENGINE_V1');
    expect(result.grade).toBe('B');
    expect(result.passed).toBe(true);
  });

  test('pricing engine evaluates product pricing', () => {
    const result = evaluateProductPricing(product);

    expect(result.system).toBe('SHEIKHA_PRODUCT_PRICING_ENGINE_V1');
    expect(result.pricingValid).toBe(true);
    expect(result.currency).toBe('SAR');
  });

  test('standards engine evaluates product standards', () => {
    const result = evaluateProductStandards(product);

    expect(result.system).toBe('SHEIKHA_PRODUCT_STANDARDS_ENGINE_V1');
    expect(result.standardsValid).toBe(true);
  });
});
