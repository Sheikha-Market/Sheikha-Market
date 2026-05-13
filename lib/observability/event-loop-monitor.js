'use strict';

const { monitorEventLoopDelay } = require('perf_hooks');
const { writeMetric } = require('./_writer');

function startEventLoopMonitor(options) {
  const {
    metricsDir,
    intervalMs = 30000
  } = options;

  const hist = monitorEventLoopDelay({ resolution: 20 });
  hist.enable();

  const id = setInterval(() => {
    const meanMs = Math.round(hist.mean / 1e6);
    const p95Ms = Math.round(hist.percentile(95) / 1e6);
    const maxMs = Math.round(hist.max / 1e6);

    writeMetric(metricsDir, 'event-loop', {
      type: 'event_loop',
      meanMs,
      p95Ms,
      maxMs
    });

    if (p95Ms > 200) {
      console.warn('[OBS][EVENT_LOOP] high latency:', { p95Ms, maxMs });
    }

    hist.reset();
  }, intervalMs);

  return () => {
    clearInterval(id);
    hist.disable();
  };
}

module.exports = { startEventLoopMonitor };
