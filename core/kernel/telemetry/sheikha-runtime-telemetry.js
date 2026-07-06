'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = process.cwd();

const DIRS = [
  'runtime/telemetry/health',
  'runtime/telemetry/resources',
  'runtime/telemetry/signals',
  'runtime/telemetry/scheduler',
  'runtime/telemetry/providers',
  'runtime/telemetry/reports'
];

function ensure() {
  DIRS.forEach((dir) => {
    fs.mkdirSync(
      path.join(ROOT, dir),
      { recursive: true }
    );
  });
}

function snapshot() {
  ensure();

  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;

  return {
    success: true,

    telemetry:
      'SHEIKHA_RUNTIME_TELEMETRY_FABRIC',

    canonical: true,
    deterministic: true,
    sovereign: true,

    governance: {
      quranAndSunnah: true,
      tawheed: true,
      noHarm: true,
      halalOnly: true,
      humanAuthority: true
    },

    runtime: {
      uptime: os.uptime(),
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),

      cpuCount:
        os.cpus().length,

      loadAverage:
        os.loadavg(),

      memory: {
        total: totalMem,
        free: freeMem,
        used: usedMem,

        usagePercent:
          Number(
            (
              (usedMem / totalMem) * 100
            ).toFixed(2)
          )
      }
    },

    layers: {
      kernel: true,
      providers: true,
      storage: true,
      scheduler: true,
      signals: true,
      telemetry: true,
      governance: true,
      intelligence: true
    },

    timestamp:
      new Date().toISOString()
  };
}

function report() {
  ensure();

  const data = snapshot();

  const reportFile = path.join(
    ROOT,
    'runtime/telemetry/reports',
    `${Date.now()}-telemetry-report.json`
  );

  fs.writeFileSync(
    reportFile,
    JSON.stringify(data, null, 2) + '\n'
  );

  return {
    success: true,
    report: reportFile,
    data
  };
}

module.exports = {
  snapshot,
  report
};
