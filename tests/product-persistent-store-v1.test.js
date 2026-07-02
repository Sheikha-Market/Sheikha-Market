'use strict';

const fs = require('fs');
const {
  storePath,
  readProducts,
  upsertProduct
} = require('../core/product-knowledge/product-persistent-store');

describe('Sheikha Product Persistent Store V1', () => {
  test('persists product catalog records', () => {
    const record = {
      id: 'persistent-copper-cable',
      name: 'Copper Cable',
      category: 'metals'
    };

    upsertProduct(record);

    const products = readProducts();
    const found = products.find((item) => item.id === record.id);

    expect(fs.existsSync(storePath)).toBe(true);
    expect(found).not.toBeNull();
    expect(found.category).toBe('metals');
  });
});
