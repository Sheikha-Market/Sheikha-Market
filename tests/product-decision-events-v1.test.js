'use strict';

const { emitProductEvent, listProductEvents } = require('../core/product-knowledge/product-event-bus');

describe('Sheikha Product Decision Events V1', () => {
  test('records approved and review required decision events', () => {
    emitProductEvent('PRODUCT_APPROVED', {
      productId: 'decision-approved-product',
      finalDecision: 'APPROVED',
      blockers: []
    });

    emitProductEvent('PRODUCT_REVIEW_REQUIRED', {
      productId: 'decision-review-product',
      finalDecision: 'REVIEW_REQUIRED',
      blockers: ['QUALITY_FAILED']
    });

    expect(listProductEvents({ productId: 'decision-approved-product' }).map((e) => e.type))
      .toContain('PRODUCT_APPROVED');

    expect(listProductEvents({ productId: 'decision-review-product' }).map((e) => e.type))
      .toContain('PRODUCT_REVIEW_REQUIRED');
  });
});
