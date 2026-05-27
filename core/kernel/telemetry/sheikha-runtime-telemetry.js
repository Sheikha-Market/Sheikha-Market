'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = process.cwd();

function metrics() {
  return {
    success: true,
    telemetry: 'SHEIKHA_RUNTIME_TELEMETRY',
    runtime: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpuLoad: os.loadavg(),
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname()
    },
    governance: {
      quranAndSunnah: true,
      noHarm: true,
      halalOnly: true,
      humanAuthority: true
    },
    deterministic: true,
    canonical: true,
    timestamp: new Date().toISOString()
  };
}

function report() {
  const data = metrics();

  const file =
    path.join(
      ROOT,
      'runtime/telemetry/reports',
      `${Date.now()}-telemetry-report.json`
    );

  fs.mkdirSync(path.dirname(file), {
    recursive: true
  });

  fs.writeFileSync(
    file,
    JSON.stringify(data, null, 2) + '\n'
  );

  return {
    success: true,
    file,
    data
  };
}

module.exports = {
  metrics,
  report
};
