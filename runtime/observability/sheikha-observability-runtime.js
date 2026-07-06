'use strict';

const { performance } = require('perf_hooks');
const { evaluateSystemHealth } = require('../self-healing/sheikha-self-healing-engine');

function collectRuntimeMetrics() {
  const memory = process.memoryUsage();
  const cpu = process.cpuUsage();

  return {
    status: 'ACTIVE',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    pid: process.pid,
    nodeVersion: process.version,
    memory,
    cpu,
    performanceNowMs: Math.round(performance.now()),
    health: evaluateSystemHealth()
  };
}

module.exports = { collectRuntimeMetrics };
