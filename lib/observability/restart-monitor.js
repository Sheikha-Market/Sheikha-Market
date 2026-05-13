'use strict';

const { writeMetric } = require('./_writer');

function startRestartMonitor(options) {
  const {
    metricsDir,
    ring,
    intervalMs = 60000
  } = options;

  writeMetric(metricsDir, 'restart', {
    type: 'startup',
    ring,
    pid: process.pid,
    pmId: process.env.pm_id || null,
    nodeAppInstance: process.env.NODE_APP_INSTANCE || null,
    pmUptime: process.env.pm_uptime || null,
    envRestarts: process.env.restart_time || null
  });

  const id = setInterval(() => {
    writeMetric(metricsDir, 'restart', {
      type: 'heartbeat',
      ring,
      pid: process.pid,
      uptimeSec: Math.round(process.uptime())
    });
  }, intervalMs);

  return () => clearInterval(id);
}

module.exports = { startRestartMonitor };
