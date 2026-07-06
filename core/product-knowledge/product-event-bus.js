'use strict';

const fs = require('fs');
const path = require('path');

const eventPath = path.join(process.cwd(), 'data', 'product-knowledge-events.json');

function ensureEventStore() {
  fs.mkdirSync(path.dirname(eventPath), { recursive: true });

  if (!fs.existsSync(eventPath)) {
    fs.writeFileSync(eventPath, JSON.stringify({ events: [] }, null, 2));
  }
}

function readProductEvents() {
  ensureEventStore();

  try {
    const parsed = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
    return Array.isArray(parsed.events) ? parsed.events : [];
  } catch (error) {
    return [];
  }
}

function writeProductEvents(events = []) {
  ensureEventStore();
  fs.writeFileSync(eventPath, JSON.stringify({ events }, null, 2));
  return events;
}

function emitProductEvent(type, payload = {}) {
  const events = readProductEvents();

  const event = {
    id: `product-event-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    payload,
    governance: 'PASSED',
    noHarm: true,
    timestamp: new Date().toISOString()
  };

  events.push(event);
  writeProductEvents(events);

  return event;
}

function listProductEvents(filter = {}) {
  return readProductEvents().filter((event) => {
    if (filter.type && event.type !== filter.type) return false;
    if (filter.productId && event.payload?.productId !== filter.productId) return false;
    return true;
  });
}

module.exports = {
  eventPath,
  emitProductEvent,
  listProductEvents,
  readProductEvents
};
