'use strict';

const { registerProduct } = require('../core/product-knowledge/product-registry');
const { buildProductDigitalTwin } = require('../core/product-knowledge/product-digital-twin');

describe('Sheikha Product Digital Twin V1', () => {
  test('builds active digital twin for registered product', () => {
    registerProduct({
      id: 'digital-twin-copper-cable',
      name: 'Copper Cable',
      category: 'metals',
      description: 'Industrial copper cable scrap',
      specifications: { unit: 'kg' },
      standards: ['internal-inspection-required'],
      price: { amount: 25, currency: 'SAR' },
      quality: { score: 80 },
      risk: { level: 'LOW' },
      status: 'APPROVED'
    });

    const twin = buildProductDigitalTwin('digital-twin-copper-cable');

    expect(twin.system).toBe('SHEIKHA_PRODUCT_DIGITAL_TWIN_V1');
    expect(twin.status).toBe('ACTIVE');
    expect(twin.productId).toBe('digital-twin-copper-cable');
    expect(twin.noHarm).toBe(true);
    expect(twin.intelligence.status).toBe('READY');
    expect(twin.graph.status).toBe('ACTIVE');
  });
});
