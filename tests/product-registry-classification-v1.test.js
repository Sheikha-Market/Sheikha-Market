'use strict';

const {
  registerProduct,
  getProductById,
  listProducts
} = require('../core/product-knowledge/product-registry');

const {
  classifyProduct
} = require('../core/product-knowledge/product-classification-engine');

describe('Sheikha Product Registry and Classification V1', () => {
  test('registers and lists products', () => {
    const record = registerProduct({
      id: 'test-copper-cable',
      name: 'Copper Cable',
      category: 'metals'
    });

    expect(record.id).toBe('test-copper-cable');
    expect(getProductById('test-copper-cable')).not.toBeNull();
    expect(listProducts().length).toBeGreaterThanOrEqual(1);
  });

  test('classifies product by name and category', () => {
    const result = classifyProduct({
      name: 'Copper Cable',
      category: 'general'
    });

    expect(result.system).toBe('SHEIKHA_PRODUCT_CLASSIFICATION_ENGINE_V1');
    expect(result.detectedCategory).toBe('metals');
    expect(result.confidence).toBeGreaterThanOrEqual(75);
  });
});
