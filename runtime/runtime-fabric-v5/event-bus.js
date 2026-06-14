'use strict';

const crypto = require('crypto');
const { EventEmitter } = require('events');
const store = require('./store');
const observability = require('./observability');

const emitter = new EventEmitter();
emitter.setMaxListeners(50);

const EVENT_TYPES = Object.freeze([
  'ISSUE_RECEIVED',
  'GOVERNANCE_APPROVED',
  'GOVERNANCE_BLOCKED',
  'JOB_QUEUED',
  'JOB_STARTED',
  'PIPELINE_STAGE_COMPLETED',
  'JOB_COMPLETED',
  'JOB_FAILED',
  'SCHEDULE_CREATED',
  'SCHEDULE_TRIGGERED'
]);

function publish(type, payload = {}, context = {}) {
  if (!EVENT_TYPES.includes(type)) {
    const error = new Error(`Unsupported Runtime Fabric event: ${type}`);
    error.code = 'UNSUPPORTED_EVENT_TYPE';
    error.statusCode = 400;
    throw error;
  }
  const event = store.transact({
    action: 'EVENT_PUBLISHED', actorId: context.actorId, metadata: { type }
  }, state => {
    const record = {
      id: `evt_${crypto.randomUUID()}`,
      type,
      payload,
      correlationId: context.correlationId || null,
      causationId: context.causationId || null,
      actorId: context.actorId || 'runtime-fabric-v5',
      createdAt: new Date().toISOString()
    };
    state.events.push(record);
    if (state.events.length > 5000) state.events.splice(0, state.events.length - 5000);
    return record;
  });
  observability.record('eventsPublished');
  emitter.emit(type, event);
  emitter.emit('*', event);
  return event;
}

function subscribe(type, handler) {
  if (type !== '*' && !EVENT_TYPES.includes(type)) {
    throw new Error(`Unsupported Runtime Fabric subscription: ${type}`);
  }
  emitter.on(type, handler);
  return () => emitter.off(type, handler);
}

function recent(limit = 100) {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 100, 500));
  return store.read().events.slice(-safeLimit);
}

function status() {
  return {
    bus: 'SHEIKHA_RUNTIME_FABRIC_V5_EVENT_BUS',
    status: 'ACTIVE',
    transport: 'IN_PROCESS_WITH_DURABLE_EVENT_LOG',
    distributedTransport: 'NOT_CONNECTED',
    supportedEvents: EVENT_TYPES,
    listeners: EVENT_TYPES.reduce((result, type) => {
      result[type] = emitter.listenerCount(type);
      return result;
    }, {})
  };
}

module.exports = { EVENT_TYPES, publish, recent, status, subscribe };
