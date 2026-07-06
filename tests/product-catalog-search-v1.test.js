'use strict';

const {
  registerProduct,
  listProducts
} = require('../core/product-knowledge/product-registry');

describe('Sheikha Product Catalog Search V1', () => {
  test('catalog contains registered searchable products', () => {
    registerProduct({
      id: 'catalog-copper-cable',
      name: 'Copper Cable',
      category: 'metals',
      description: 'Industrial copper cable scrap'
    });

    const products = listProducts();
    const found = products.find((p) => p.id === 'catalog-copper-cable');

    expect(found).not.toBeNull();
    expect(found.category).toBe('metals');
  });
});
