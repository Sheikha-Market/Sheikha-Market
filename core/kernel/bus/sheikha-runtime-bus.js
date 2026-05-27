'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const BUS_DIR = path.join(ROOT, 'runtime', 'bus');

function ensure() {
  fs.mkdirSync(BUS_DIR, { recursive: true });
}

function emit(channel, payload = {}) {
  ensure();

  const packet = {
    success: true,
    bus: 'SHEIKHA_RUNTIME_BUS',
    canonical: true,
    deterministic: true,
    channel,
    payload,
    governance: {
      quranAndSunnah: true,
      noHarm: true,
      halalOnly: true,
      humanAuthority: true
    },
    timestamp: new Date().toISOString()
  };

  const file = path.join(
    BUS_DIR,
    `${Date.now()}-${channel}.json`
  );

  fs.writeFileSync(
    file,
    JSON.stringify(packet, null, 2) + '\n'
  );

  return {
    success: true,
    emitted: true,
    file,
    packet
  };
}

function status() {
  ensure();

  return {
    success: true,
    runtimeBus: 'SHEIKHA_RUNTIME_BUS',
    canonical: true,
    deterministic: true,
    busDir: BUS_DIR,
    channels: [
      'kernel',
      'memory',
      'storage',
      'telemetry',
      'providers',
      'governance',
      'execution',
      'scheduler'
    ],
    governance: {
      quranAndSunnah: true,
      noHarm: true,
      halalOnly: true
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  emit,
  status
};
