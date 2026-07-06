"use strict";

const { monitorEventLoopDelay } = require("perf_hooks");

function createStartupDiagnostics() {
  const histogram = monitorEventLoopDelay({
    resolution: 20
  });

  histogram.enable();

  const startedAt = Date.now();

  function snapshot(label = "runtime") {
    const uptimeMs = Date.now() - startedAt;

    return {
      system: "SHEIKHA_STARTUP_DIAGNOSTICS",
      status: "ACTIVE",
      label,
      uptimeMs,
      eventLoop: {
        meanMs: Number((histogram.mean / 1e6).toFixed(3)),
        maxMs: Number((histogram.max / 1e6).toFixed(3)),
        minMs: Number((histogram.min / 1e6).toFixed(3)),
        p95Ms: Number((histogram.percentile(95) / 1e6).toFixed(3)),
        p99Ms: Number((histogram.percentile(99) / 1e6).toFixed(3))
      },
      memory: {
        rssMb: Number((process.memoryUsage().rss / 1024 / 1024).toFixed(2)),
        heapUsedMb: Number((process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2))
      },
      timestamp: new Date().toISOString()
    };
  }

  return {
    snapshot
  };
}

module.exports = {
  createStartupDiagnostics
};
