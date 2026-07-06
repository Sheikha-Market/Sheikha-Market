'use strict';

const eventStore = [];

const allowedEvents = Object.freeze([
  'PRODUCT_CREATED',
  'PRODUCT_UPDATED',
  'PRODUCT_APPROVED',
  'PRODUCT_REJECTED',
  'WORKSPACE_CHANGED',
  'CONTEXT_CHANGED',
  'NAVIGATION_ALLOWED',
  'NAVIGATION_BLOCKED',
  'GOVERNANCE_PASSED',
  'GOVERNANCE_BLOCKED',
  'AI_ASSISTANT_USED',
  'AUDIT_RECORDED',
  'HEALTH_CHECKED',
  'PRODUCTION_GATE_CHECKED'
]);

function publishEvent(input = {}) {
  const type = input.type || 'AUDIT_RECORDED';

  if (!allowedEvents.includes(type)) {
    return {
      system: 'SHEIKHA_ENTERPRISE_EVENT_BUS_V1',
      status: 'BLOCKED',
      error: 'EVENT_TYPE_NOT_ALLOWED',
      type
    };
  }

  const event = {
    id: `evt-${Date.now()}-${eventStore.length + 1}`,
    type,
    source: input.source || 'sheikha-enterprise',
    actor: input.actor || 'system',
    context: input.context || {},
    payload: input.payload || {},
    governance: {
      noHarm: true,
      internalOnly: true,
      externalMutation: false,
      auditRequired: true
    },
    createdAt: new Date().toISOString()
  };

  eventStore.push(event);

  return {
    system: 'SHEIKHA_ENTERPRISE_EVENT_BUS_V1',
    status: 'PUBLISHED',
    event
  };
}

function listEvents(filter = {}) {
  const events = eventStore.filter((event) => {
    if (filter.type && event.type !== filter.type) return false;
    if (filter.source && event.source !== filter.source) return false;
    return true;
  });

  return {
    system: 'SHEIKHA_ENTERPRISE_EVENT_BUS_V1',
    status: 'ACTIVE',
    count: events.length,
    events
  };
}

function clearEvents() {
  eventStore.splice(0, eventStore.length);
}

module.exports = {
  allowedEvents,
  publishEvent,
  listEvents,
  clearEvents
};
