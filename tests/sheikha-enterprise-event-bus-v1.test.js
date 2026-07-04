'use strict';

const {
  publishEvent,
  listEvents,
  clearEvents
} = require('../core/enterprise-event-bus/sheikha-enterprise-event-bus-v1');

describe('Sheikha Enterprise Event Bus V1', () => {
  beforeEach(() => clearEvents());

  test('publishes governed internal event', () => {
    const result = publishEvent({
      type: 'PRODUCT_APPROVED',
      source: 'product-knowledge',
      actor: 'salman',
      payload: { productId: 'copper-cable' }
    });

    expect(result.system).toBe('SHEIKHA_ENTERPRISE_EVENT_BUS_V1');
    expect(result.status).toBe('PUBLISHED');
    expect(result.event.governance.noHarm).toBe(true);
    expect(result.event.governance.externalMutation).toBe(false);
  });

  test('blocks unknown event type', () => {
    const result = publishEvent({ type: 'UNKNOWN_EVENT' });

    expect(result.status).toBe('BLOCKED');
    expect(result.error).toBe('EVENT_TYPE_NOT_ALLOWED');
  });

  test('lists published events', () => {
    publishEvent({ type: 'CONTEXT_CHANGED', source: 'context-engine' });

    const result = listEvents({ type: 'CONTEXT_CHANGED' });

    expect(result.status).toBe('ACTIVE');
    expect(result.count).toBe(1);
  });
});
