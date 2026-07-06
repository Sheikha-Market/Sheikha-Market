'use strict';

const crypto = require('crypto');
const store = require('./store');
const events = require('./event-bus');
const observability = require('./observability');

const JOB_TYPES = Object.freeze([
  'executive.issue.pipeline',
  'runtime.health.snapshot',
  'service.registry.refresh'
]);
const PRIORITY = Object.freeze({ critical: 1, high: 2, normal: 3, low: 4 });

function enqueue(input = {}, context = {}) {
  const type = String(input.type || '').trim();
  if (!JOB_TYPES.includes(type)) {
    const error = new Error('Only registered Runtime Fabric job types may be queued.');
    error.code = 'UNREGISTERED_JOB_TYPE';
    error.statusCode = 400;
    throw error;
  }
  const idempotencyKey = String(input.idempotencyKey || '').trim() || `auto_${crypto.randomUUID()}`;
  const job = store.transact({
    action: 'JOB_QUEUED', actorId: context.actorId, metadata: { type, idempotencyKey }
  }, state => {
    const existing = state.jobs.find(item => item.idempotencyKey === idempotencyKey);
    if (existing) return store.noChange({ ...existing, idempotentReplay: true });
    const now = new Date().toISOString();
    const record = {
      id: `job_${crypto.randomUUID()}`,
      type,
      payload: input.payload || {},
      priority: PRIORITY[input.priority] ? input.priority : 'normal',
      priorityValue: PRIORITY[input.priority] || PRIORITY.normal,
      idempotencyKey,
      correlationId: context.correlationId || null,
      status: 'QUEUED',
      attempts: 0,
      maxAttempts: Math.max(1, Math.min(Number(input.maxAttempts) || 3, 10)),
      availableAt: input.availableAt || now,
      createdAt: now,
      startedAt: null,
      completedAt: null,
      result: null,
      error: null
    };
    state.jobs.push(record);
    return record;
  });
  if (job.idempotentReplay) return job;
  observability.record('jobsQueued');
  events.publish('JOB_QUEUED', { jobId: job.id, type: job.type }, context);
  return job;
}

function claim() {
  const now = new Date();
  return store.transact({ action: 'JOB_CLAIM_ATTEMPT' }, state => {
    const record = state.jobs
      .filter(job => job.status === 'QUEUED' && new Date(job.availableAt) <= now)
      .sort((a, b) => a.priorityValue - b.priorityValue || a.createdAt.localeCompare(b.createdAt))[0];
    if (!record) return store.noChange(null);
    record.status = 'PROCESSING';
    record.attempts += 1;
    record.startedAt = now.toISOString();
    return record;
  });
}

function complete(jobId, result) {
  const job = store.transact({ action: 'JOB_COMPLETED', resourceId: jobId }, state => {
    const record = state.jobs.find(item => item.id === jobId);
    if (!record || record.status !== 'PROCESSING') throw new Error('Processing job not found.');
    record.status = 'COMPLETED';
    record.completedAt = new Date().toISOString();
    record.result = result;
    record.error = null;
    return record;
  });
  observability.record('jobsCompleted');
  return job;
}

function fail(jobId, error) {
  const job = store.transact({ action: 'JOB_FAILED', resourceId: jobId }, state => {
    const record = state.jobs.find(item => item.id === jobId);
    if (!record || record.status !== 'PROCESSING') throw new Error('Processing job not found.');
    record.error = String(error?.message || error || 'Unknown worker failure').slice(0, 1000);
    if (record.attempts < record.maxAttempts) {
      record.status = 'QUEUED';
      record.availableAt = new Date(Date.now() + Math.min(30000, record.attempts * 1000)).toISOString();
    } else {
      record.status = 'FAILED';
      record.completedAt = new Date().toISOString();
      state.deadLetters.push({ ...record, deadLetteredAt: record.completedAt });
    }
    return record;
  });
  observability.record('jobsFailed');
  return job;
}

function list({ status = null, limit = 100 } = {}) {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 100, 500));
  return store.read().jobs
    .filter(job => !status || job.status === status)
    .slice(-safeLimit);
}

function status() {
  const state = store.read();
  const counts = state.jobs.reduce((result, job) => {
    result[job.status] = (result[job.status] || 0) + 1;
    return result;
  }, {});
  return {
    queue: 'SHEIKHA_RUNTIME_FABRIC_V5_QUEUE',
    status: 'ACTIVE',
    backend: 'DURABLE_SINGLE_NODE_FILE_QUEUE',
    redisConfigured: Boolean(process.env.REDIS_URL),
    redisConnected: false,
    multiNodeSafe: false,
    supportedJobTypes: JOB_TYPES,
    counts,
    deadLetters: state.deadLetters.length
  };
}

module.exports = { JOB_TYPES, claim, complete, enqueue, fail, list, status };
