'use strict';

const { writeMetric } = require('./_writer');

function startMemoryMonitor(options) {
  const {
    metricsDir,
    intervalMs = 30000,
    heapWarnPercent = 85,
    rssWarnMB = 512
  } = options;

  const id = setInterval(() => {
    const m = process.memoryUsage();
    const heapUsedMB = Math.round(m.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(m.heapTotal / 1024 / 1024);
    const rssMB = Math.round(m.rss / 1024 / 1024);
    const heapPercent = heapTotalMB > 0 ? Math.round((m.heapUsed / m.heapTotal) * 100) : 0;
    const pressure = heapPercent >= heapWarnPercent || rssMB >= rssWarnMB;

    writeMetric(metricsDir, 'memory', {
      type: 'memory',
      heapUsedMB,
      heapTotalMB,
      rssMB,
      heapPercent,
      pressure
    });

    if (pressure) {
      console.warn('[OBS][MEMORY] pressure detected:', { heapPercent, rssMB });
    }
  }, intervalMs);

  return () => clearInterval(id);
}

module.exports = { startMemoryMonitor };
