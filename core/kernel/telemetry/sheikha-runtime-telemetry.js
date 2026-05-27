'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = process.cwd();

function ensure() {
  [
    'runtime/telemetry/health',
    'runtime/telemetry/resources',
    'runtime/telemetry/signals',
    'runtime/telemetry/scheduler',
    'runtime/telemetry/providers',
    'runtime/telemetry/reports'
  ].forEach((dir) => {
    fs.mkdirSync(path.join(ROOT, dir), {
      recursive: true
    });
  });
}

function snapshot() {
  ensure();

  const totalMem = os.totalmem();
  const freeMem = os.freemem();

  return {
    success: true,
    telemetry: 'SHEIKHA_RUNTIME_TELEMETRY_FABRIC',
    canonical: true,
    deterministic: true,
    governance: {
      quranAndSunnah: true,
      noHarm: true,
      halalOnly: true,
      humanAuthority: true
    },
    runtime: {
      uptime: os.uptime(),
      hostname: os.hostname(),
      platform: os.platform(),
      cpuCount: os.cpus().length,
      loadAverage: os.loadavg(),
      memory: {
        total: totalMem,
        free: freeMem,
        used: totalMem - freeMem,
        usagePercent:
          Number((((totalMem - freeMem) / totalMem) * 100).toFixed(2))
      }
    },
    layers: {
      kernel: true,
      scheduler: true,
      signals: true,
      storage: true,
      resources: true,
      intelligence: true,
      governance: true
    },
    timestamp: new Date().toISOString()
  };
}

function report() {
  ensure();

  const data = snapshot();

  const file = path.join(
    ROOT,
    'runtime/telemetry/reports',
    `${Date.now()}-telemetry-report.json`
  );

  fs.writeFileSync(
    file,
    JSON.stringify(data, null, 2) + '\n'
  );

  return {
    success: true,
    report: file,
    data
  };
}

module.exports = {
  snapshot,
  report
};
