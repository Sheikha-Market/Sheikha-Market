'use strict';

const {
  evaluateLifecycleTransition,
  applyLifecycleTransition
} = require('../core/product-knowledge/product-lifecycle-engine');

describe('Sheikha Product Lifecycle Engine V1', () => {
  test('allows valid lifecycle transition', () => {
    const result = evaluateLifecycleTransition('DRAFT', 'PENDING_REVIEW');

    expect(result.system).toBe('SHEIKHA_PRODUCT_LIFECYCLE_ENGINE_V1');
    expect(result.status).toBe('ALLOWED');
    expect(result.allowed).toBe(true);
  });

  test('blocks invalid lifecycle transition', () => {
    const result = evaluateLifecycleTransition('DRAFT', 'PUBLISHED');

    expect(result.status).toBe('BLOCKED');
    expect(result.allowed).toBe(false);
  });

  test('applies allowed transition to record', () => {
    const transition = applyLifecycleTransition(
      { id: 'lifecycle-product', status: 'DRAFT' },
      'PENDING_REVIEW'
    );

    expect(transition.evaluation.allowed).toBe(true);
    expect(transition.record.status).toBe('PENDING_REVIEW');
    expect(transition.record.lifecycle.status).toBe('PENDING_REVIEW');
  });
});
