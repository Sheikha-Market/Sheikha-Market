'use strict';

const { performance } = require('perf_hooks');
const store = require('./store');

const counters = {
  requests: 0,
  admitted: 0,
  blocked: 0,
  eventsPublished: 0,
  jobsQueued: 0,
  jobsCompleted: 0,
  jobsFailed: 0,
  totalLatencyMs: 0
};
let lastElu = performance.eventLoopUtilization();

function record(metric, value = 1) {
  if (!Object.prototype.hasOwnProperty.call(counters, metric)) return;
  counters[metric] += Number(value) || 0;
}

function measure(startedAt) {
  counters.requests += 1;
  counters.totalLatencyMs += Math.max(0, performance.now() - startedAt);
}

function snapshot() {
  const memory = process.memoryUsage();
  const elu = performance.eventLoopUtilization(lastElu);
  lastElu = performance.eventLoopUtilization();
  const state = store.read();
  const queued = state.jobs.filter(job => job.status === 'QUEUED').length;
  const processing = state.jobs.filter(job => job.status === 'PROCESSING').length;
  const failed = state.jobs.filter(job => job.status === 'FAILED').length;

  return {
    system: 'SHEIKHA_RUNTIME_FABRIC_V5_OBSERVABILITY',
    status: 'ACTIVE',
    runtime: {
      pid: process.pid,
      node: process.version,
      uptimeSeconds: Math.round(process.uptime()),
      memoryMb: {
        rss: Math.round(memory.rss / 1024 / 1024),
        heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memory.heapTotal / 1024 / 1024)
      },
      eventLoopUtilizationPercent: Number((elu.utilization * 100).toFixed(2))
    },
    counters: {
      ...counters,
      averageLatencyMs: counters.requests
        ? Number((counters.totalLatencyMs / counters.requests).toFixed(2))
        : 0
    },
    queue: { queued, processing, failed, deadLetters: state.deadLetters.length },
    stateRevision: state.revision,
    measuredAt: new Date().toISOString()
  };
}

module.exports = { measure, record, snapshot };
