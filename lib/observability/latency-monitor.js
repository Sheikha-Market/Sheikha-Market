'use strict';

const { writeMetric } = require('./_writer');

function createLatencyMiddleware(options) {
  const {
    metricsDir,
    slowMs = 1000
  } = options;

  return function latencyMiddleware(req, res, next) {
    const startNs = process.hrtime.bigint();

    res.on('finish', () => {
      const endNs = process.hrtime.bigint();
      const durationMs = Number(endNs - startNs) / 1e6;
      const rounded = Math.round(durationMs);
      const slow = rounded >= slowMs;

      writeMetric(metricsDir, 'latency', {
        type: 'http_latency',
        method: req.method,
        path: req.path,
        status: res.statusCode,
        durationMs: rounded,
        slow
      });

      if (slow) {
        console.warn('[OBS][LATENCY] slow request:', {
          method: req.method,
          path: req.path,
          status: res.statusCode,
          durationMs: rounded
        });
      }
    });

    next();
  };
}

module.exports = { createLatencyMiddleware };
