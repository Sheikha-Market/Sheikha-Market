'use strict';

function createArabicEventBus() {
  return {
    events: [],
    deterministic: true
  };
}

function emitArabicRuntimeEvent(bus, event = {}) {
  return {
    ...bus,
    events: [
      ...bus.events,
      {
        id: `event_${Date.now()}_${bus.events.length + 1}`,
        type: event.type || 'UNKNOWN_EVENT',
        payload: event.payload || {},
        createdAt: Date.now(),
        deterministic: true
      }
    ]
  };
}

function filterArabicRuntimeEvents(bus, type) {
  return {
    type,
    events: bus.events.filter(event => event.type === type)
  };
}

module.exports = {
  createArabicEventBus,
  emitArabicRuntimeEvent,
  filterArabicRuntimeEvents
};
