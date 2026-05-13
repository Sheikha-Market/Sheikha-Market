'use strict';

const fs = require('fs');
const path = require('path');
const { resolveMetricsDir } = require('./_writer');
const { startMemoryMonitor } = require('./memory-monitor');
const { startEventLoopMonitor } = require('./event-loop-monitor');
const { startRestartMonitor } = require('./restart-monitor');
const { startDriftMonitor } = require('./drift-monitor');
const { createLatencyMiddleware } = require('./latency-monitor');

function readTail(filePath, lines = 2) {
  if (!fs.existsSync(filePath)) {
    return { exists: false, count: 0, last: [] };
  }

  const content = fs.readFileSync(filePath, 'utf8').trim();
  if (!content) {
    return { exists: true, count: 0, last: [] };
  }

  const rows = content.split(/\r?\n/).filter(Boolean);
  const last = rows.slice(-lines).map((row) => {
    try {
      return JSON.parse(row);
    } catch (_) {
      return { raw: row };
    }
  });

  return { exists: true, count: rows.length, last };
}

function summarizeMetrics(metricsDir) {
  const streams = ['memory', 'event-loop', 'restart', 'drift', 'latency'];
  const summary = {};

  for (const stream of streams) {
    summary[stream] = readTail(path.join(metricsDir, `${stream}.ndjson`), 3);
  }

  return summary;
}

function initObservability(options = {}) {
  const {
    rootDir,
    ring,
    intervalMs = 30000
  } = options;

  const metricsDir = resolveMetricsDir(rootDir);
  const stops = [];

  stops.push(startMemoryMonitor({ metricsDir, intervalMs }));
  stops.push(startEventLoopMonitor({ metricsDir, intervalMs }));
  stops.push(startRestartMonitor({ metricsDir, ring, intervalMs: 60000 }));
  stops.push(startDriftMonitor({ rootDir, metricsDir, intervalMs: 60000 }));

  return {
    metricsDir,
    createLatencyMiddleware: (opts = {}) => createLatencyMiddleware({ metricsDir, ...opts }),
    summarize: () => ({
      metricsDir,
      streams: summarizeMetrics(metricsDir)
    }),
    stopAll: () => stops.forEach((stop) => {
      try { stop(); } catch (_) {}
    })
  };
}

module.exports = { initObservability };
