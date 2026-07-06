'use strict';

const {
  calculateCompletenessScore,
  evaluateProductIntelligence
} = require('../core/product-knowledge/product-intelligence-layer');

describe('Sheikha Enterprise Product Intelligence Layer V1', () => {
  test('calculates completeness score', () => {
    const score = calculateCompletenessScore({
      name: 'Copper Cable',
      category: 'metals',
      description: 'Industrial copper cable scrap',
      specifications: { unit: 'kg' },
      standards: ['internal-inspection-required'],
      price: { amount: 25 },
      quality: { score: 80 },
      risk: { level: 'LOW' }
    });

    expect(score).toBe(100);
  });

  test('evaluates product intelligence readiness', () => {
    const result = evaluateProductIntelligence({
      name: 'Copper Cable',
      category: 'metals',
      description: 'Industrial copper cable scrap',
      specifications: { unit: 'kg' },
      standards: ['internal-inspection-required'],
      price: { amount: 25 },
      quality: { score: 80 },
      risk: { level: 'LOW' },
      status: 'APPROVED'
    });

    expect(result.system).toBe('SHEIKHA_ENTERPRISE_PRODUCT_INTELLIGENCE_LAYER_V1');
    expect(result.status).toBe('READY');
    expect(result.scores.marketReadiness).toBeGreaterThanOrEqual(80);
  });
});
