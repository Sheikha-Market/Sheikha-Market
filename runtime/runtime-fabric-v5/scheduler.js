'use strict';

const crypto = require('crypto');
const store = require('./store');
const queue = require('./queue-engine');
const events = require('./event-bus');

function schedule(input = {}, context = {}) {
  const runAt = new Date(input.runAt || '');
  if (Number.isNaN(runAt.getTime())) {
    const error = new Error('A valid runAt timestamp is required.');
    error.code = 'INVALID_SCHEDULE_TIME';
    error.statusCode = 400;
    throw error;
  }
  if (!queue.JOB_TYPES.includes(input.type)) {
    const error = new Error('Scheduled job type is not registered.');
    error.code = 'UNREGISTERED_JOB_TYPE';
    error.statusCode = 400;
    throw error;
  }
  const record = store.transact({ action: 'SCHEDULE_CREATED', actorId: context.actorId }, state => {
    const item = {
      id: `sch_${crypto.randomUUID()}`,
      type: input.type,
      payload: input.payload || {},
      priority: input.priority || 'normal',
      runAt: runAt.toISOString(),
      status: 'SCHEDULED',
      createdAt: new Date().toISOString(),
      createdBy: context.actorId || 'runtime-fabric-v5'
    };
    state.schedules.push(item);
    return item;
  });
  events.publish('SCHEDULE_CREATED', { scheduleId: record.id, runAt: record.runAt }, context);
  return record;
}

function tick(context = {}) {
  const due = store.read().schedules.filter(item =>
    item.status === 'SCHEDULED' && new Date(item.runAt) <= new Date()
  );
  const triggered = [];
  for (const item of due) {
    const job = queue.enqueue({
      type: item.type,
      payload: item.payload,
      priority: item.priority,
      idempotencyKey: `schedule:${item.id}`
    }, { ...context, correlationId: item.id });
    store.transact({
      action: 'SCHEDULE_TRIGGERED', actorId: context.actorId, resourceId: item.id
    }, state => {
      const scheduleRecord = state.schedules.find(schedule => schedule.id === item.id);
      scheduleRecord.status = 'TRIGGERED';
      scheduleRecord.triggeredAt = new Date().toISOString();
      scheduleRecord.jobId = job.id;
      return scheduleRecord;
    });
    events.publish('SCHEDULE_TRIGGERED', { scheduleId: item.id, jobId: job.id }, context);
    triggered.push({ scheduleId: item.id, jobId: job.id });
  }
  return { triggered: triggered.length, schedules: triggered };
}

function list(limit = 100) {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 100, 500));
  return store.read().schedules.slice(-safeLimit);
}

function status() {
  const schedules = store.read().schedules;
  return {
    scheduler: 'SHEIKHA_RUNTIME_FABRIC_V5_SCHEDULER',
    status: 'ACTIVE',
    mode: 'EXPLICIT_GOVERNED_TICK',
    backgroundDaemon: false,
    scheduled: schedules.filter(item => item.status === 'SCHEDULED').length,
    triggered: schedules.filter(item => item.status === 'TRIGGERED').length
  };
}

module.exports = { list, schedule, status, tick };
