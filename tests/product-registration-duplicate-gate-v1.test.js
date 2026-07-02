'use strict';

const {
  detectProductDuplicates
} = require('../core/product-knowledge/product-duplicate-detection');

describe('Sheikha Product Registration Duplicate Gate V1', () => {
  test('flags duplicate before registration', () => {
    const duplicates = detectProductDuplicates(
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

    expect(duplicates.duplicateSuspected).toBe(true);
    expect(duplicates.status).toBe('DUPLICATE_SUSPECTED');
  });
});
