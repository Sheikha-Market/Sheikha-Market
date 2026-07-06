'use strict';

const {
  emitProductEvent,
  listProductEvents
} = require('../core/product-knowledge/product-event-bus');

describe('Sheikha Product Event Bus V1', () => {
  test('emits and lists product events', () => {
    const event = emitProductEvent('PRODUCT_CREATED', {
      productId: 'event-copper-cable',
      status: 'DRAFT'
    });

    const events = listProductEvents({ productId: 'event-copper-cable' });

    expect(event.type).toBe('PRODUCT_CREATED');
    expect(event.noHarm).toBe(true);
    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events.map((item) => item.type)).toContain('PRODUCT_CREATED');
  });
});
