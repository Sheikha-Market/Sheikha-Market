'use strict';

const {
  jaccardSimilarity,
  detectProductDuplicates
} = require('../core/product-knowledge/product-duplicate-detection');

describe('Sheikha Product Duplicate Detection V1', () => {
  test('calculates similarity between product names', () => {
    const similarity = jaccardSimilarity('Copper Cable Scrap', 'Copper Cable Industrial Scrap');

    expect(similarity).toBeGreaterThan(0.5);
  });

  test('detects likely duplicate products', () => {
    const result = detectProductDuplicates(
      {
        name: 'Copper Cable Scrap',
        category: 'metals',
        description: 'Industrial copper cable scrap'
      },
      [
        {
          id: 'existing-copper-cable',
          name: 'Copper Cable Industrial Scrap',
          category: 'metals',
          description: 'Industrial copper cable scrap'
        }
      ],
      0.5
    );

    expect(result.system).toBe('SHEIKHA_PRODUCT_DUPLICATE_DETECTION_ENGINE_V1');
    expect(result.status).toBe('DUPLICATE_SUSPECTED');
    expect(result.duplicateSuspected).toBe(true);
    expect(result.matches[0].id).toBe('existing-copper-cable');
  });
});
