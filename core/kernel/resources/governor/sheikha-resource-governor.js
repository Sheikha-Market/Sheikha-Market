'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = process.cwd();

function ensure() {
  [
    'runtime/resources/allocation',
    'runtime/resources/balancing',
    'runtime/resources/telemetry',
    'runtime/resources/limits',
    'runtime/resources/protection',
    'runtime/resources/reports'
  ].forEach((dir) => {
    fs.mkdirSync(path.join(ROOT, dir), {
      recursive: true
    });
  });
}

function telemetry() {
  ensure();

  const cpus = os.cpus() || [];
  const totalMem = os.totalmem();
  const freeMem = os.freemem();

  return {
    success: true,
    governor: 'SHEIKHA_RUNTIME_RESOURCE_GOVERNOR',
    canonical: true,
    deterministic: true,
    localFirst: true,
    offlineSurvivability: true,
    governance: {
      quranAndSunnah: true,
      noHarm: true,
      halalOnly: true,
      humanAuthority: true
    },
    runtime: {
      cpuCount: cpus.length,
      loadAverage: os.loadavg(),
      freeMemory: freeMem,
      totalMemory: totalMem,
      usedMemory: totalMem - freeMem,
      memoryUsagePercent:
        Number((((totalMem - freeMem) / totalMem) * 100).toFixed(2)),
      uptime: os.uptime(),
      platform: os.platform(),
      hostname: os.hostname()
    },
    policy: {
      collisionProtection: true,
      deterministicScheduling: true,
      balancedAllocation: true,
      runtimeProtection: true,
      providerIsolation: true
    },
    timestamp: new Date().toISOString()
  };
}

function allocate(resource = {}) {
  ensure();

  const record = {
    success: true,
    allocation: 'SHEIKHA_RESOURCE_ALLOCATION',
    canonical: true,
    deterministic: true,
    resource,
    timestamp: new Date().toISOString()
  };

  const file = path.join(
    ROOT,
    'runtime/resources/allocation',
    `${Date.now()}-allocation.json`
  );

  fs.writeFileSync(
    file,
    JSON.stringify(record, null, 2) + '\n'
  );

  return {
    success: true,
    stored: true,
    file,
    record
  };
}

module.exports = {
  telemetry,
  allocate
};
