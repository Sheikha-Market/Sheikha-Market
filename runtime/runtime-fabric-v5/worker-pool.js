'use strict';

const queue = require('./queue-engine');
const events = require('./event-bus');
const observability = require('./observability');

const handlers = new Map();

function register(type, handler) {
  if (!queue.JOB_TYPES.includes(type)) throw new Error(`Cannot register unknown job type: ${type}`);
  if (typeof handler !== 'function') throw new Error('Worker handler must be a function.');
  handlers.set(type, handler);
}

async function drain({ limit = 10, actorId = 'runtime-worker' } = {}) {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 10, 100));
  const processed = [];
  for (let index = 0; index < safeLimit; index += 1) {
    const job = queue.claim();
    if (!job) break;
    events.publish('JOB_STARTED', { jobId: job.id, type: job.type }, {
      actorId, correlationId: job.correlationId, causationId: job.id
    });
    const handler = handlers.get(job.type);
    if (!handler) {
      const failed = queue.fail(job.id, new Error(`No registered handler for ${job.type}`));
      events.publish('JOB_FAILED', { jobId: job.id, error: failed.error }, {
        actorId, correlationId: job.correlationId, causationId: job.id
      });
      processed.push(failed);
      continue;
    }
    try {
      const result = await handler(job.payload, job);
      const completed = queue.complete(job.id, result);
      events.publish('JOB_COMPLETED', { jobId: job.id, result }, {
        actorId, correlationId: job.correlationId, causationId: job.id
      });
      processed.push(completed);
    } catch (error) {
      const failed = queue.fail(job.id, error);
      events.publish('JOB_FAILED', { jobId: job.id, error: failed.error }, {
        actorId, correlationId: job.correlationId, causationId: job.id
      });
      processed.push(failed);
    }
  }
  return { processed: processed.length, jobs: processed, metrics: observability.snapshot().queue };
}

function status() {
  return {
    pool: 'SHEIKHA_RUNTIME_FABRIC_V5_WORKER_POOL',
    status: 'ACTIVE',
    mode: 'BOUNDED_IN_PROCESS',
    arbitraryCodeExecution: false,
    registeredHandlers: [...handlers.keys()],
    distributedWorkersConnected: false
  };
}

module.exports = { drain, register, status };
