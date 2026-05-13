'use strict';

const fs = require('fs');
const path = require('path');

function resolveMetricsDir(rootDir) {
  const preferred = process.env.SHEIKHA_RUNTIME_METRICS_DIR || path.join(rootDir, 'data', 'runtime-metrics');
  try {
    fs.mkdirSync(preferred, { recursive: true });
    fs.accessSync(preferred, fs.constants.W_OK);
    return preferred;
  } catch (_) {
    const fallback = path.join('/tmp', 'sheikha-runtime-metrics');
    fs.mkdirSync(fallback, { recursive: true });
    return fallback;
  }
}

function writeMetric(metricsDir, streamName, payload) {
  const line = JSON.stringify({ ts: new Date().toISOString(), ...payload }) + '\n';
  const target = path.join(metricsDir, streamName + '.ndjson');
  fs.appendFile(target, line, () => {});
}

module.exports = {
  resolveMetricsDir,
  writeMetric
};
