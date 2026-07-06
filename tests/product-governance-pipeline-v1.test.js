'use strict';

const {
  runProductGovernancePipeline
} = require('../core/product-knowledge/product-governance-pipeline');

describe('Sheikha Enterprise Product Governance Pipeline V1', () => {
  test('approves governed valid product', () => {
    const result = runProductGovernancePipeline({
      name: 'Copper Cable',
      category: 'metals',
      description: 'Industrial copper cable scrap',
      specifications: { unit: 'kg' },
      standards: ['internal-inspection-required'],
      price: { amount: 25, currency: 'SAR' },
      quality: { score: 80 },
      risk: { level: 'LOW' }
    });

    expect(result.system).toBe('SHEIKHA_ENTERPRISE_PRODUCT_GOVERNANCE_PIPELINE_V1');
    expect(result.status).toBe('PASSED');
    expect(result.passed).toBe(true);
    expect(result.finalDecision).toBe('APPROVED');
  });

  test('blocks incomplete or duplicate product', () => {
    const result = runProductGovernancePipeline(
      {
        name: 'Copper Cable',
        category: 'metals',
        description: '',
        specifications: {},
        standards: [],
        price: { amount: 0 },
        quality: { score: 40 },
        risk: { level: 'HIGH' }
      },
      [
        {
          id: 'existing-copper',
          name: 'Copper Cable',
          category: 'metals',
          description: 'Industrial copper cable scrap'
        }
      ]
    );

    expect(result.status).toBe('BLOCKED');
    expect(result.passed).toBe(false);
    expect(result.finalDecision).toBe('REVIEW_REQUIRED');
    expect(result.blockers.length).toBeGreaterThanOrEqual(1);
  });
});
