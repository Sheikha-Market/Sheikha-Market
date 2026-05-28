'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = process.cwd();

const FABRIC = {
  name: 'SHEIKHA_RUNTIME_RESOURCE_FABRIC',

  canonical: true,
  deterministic: true,
  sovereign: true,

  governance: {
    quranAndSunnah: true,
    tawheed: true,
    noHarm: true,
    halalOnly: true,
    humanAuthority: true
  }
};

function ensure() {
  [
    'runtime/resources/allocation',
    'runtime/resources/capacity',
    'runtime/resources/usage',
    'runtime/resources/reports'
  ].forEach((dir) => {
    fs.mkdirSync(
      path.join(ROOT, dir),
      { recursive: true }
    );
  });
}

function collect() {
  ensure();

  return {
    fabric: FABRIC.name,

    cpu: {
      cores: os.cpus().length,
      loadAverage: os.loadavg()
    },

    memory: {
      total: os.totalmem(),
      free: os.freemem(),
      used: os.totalmem() - os.freemem()
    },

    uptime: os.uptime(),

    runtime: {
      localFirst: true,
      deterministic: true,
      canonical: true
    },

    governance: FABRIC.governance,

    timestamp: new Date().toISOString()
  };
}

function status() {
  return {
    success: true,
    resources: collect()
  };
}

function allocate(resource = {}) {
  ensure();

  const record = {
    success: true,

    allocation: {
      target: resource.target || 'runtime',
      priority: resource.priority || 'normal',
      reservation: resource.reservation || 'standard'
    },

    governance: FABRIC.governance,

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
    file,
    record
  };
}

function report() {
  ensure();

  const data = collect();

  const file = path.join(
    ROOT,
    'runtime/resources/reports',
    `${Date.now()}-resource-report.json`
  );

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
  status,
  allocate,
  report
};
