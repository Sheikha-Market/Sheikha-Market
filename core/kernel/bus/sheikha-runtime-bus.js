'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

const BUS = {
  name: 'SHEIKHA_RUNTIME_BUS_FABRIC',

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

  channels: {
    kernel: true,
    telemetry: true,
    storage: true,
    scheduler: true,
    intelligence: true,
    providers: true,
    signals: true,
    governance: true
  }
};

function ensure() {
  [
    'runtime/bus/channels',
    'runtime/bus/events',
    'runtime/bus/reports'
  ].forEach((dir) => {
    fs.mkdirSync(
      path.join(ROOT, dir),
      { recursive: true }
    );
  });
}

function status() {
  ensure();

  return {
    success: true,
    bus: BUS.name,
    canonical: BUS.canonical,
    deterministic: BUS.deterministic,
    sovereign: BUS.sovereign,
    governance: BUS.governance,
    channels: BUS.channels,
    timestamp: new Date().toISOString()
  };
}

function emit(channel, payload = {}) {
  ensure();

  if (!BUS.channels[channel]) {
    return {
      success: false,
      blocked: true,
      reason: 'unknown_channel',
      channel
    };
  }

  const event = {
    channel,
    payload,
    timestamp: new Date().toISOString()
  };

  const file = path.join(
    ROOT,
    'runtime/bus/events',
    `${Date.now()}-${channel}.json`
  );

  fs.writeFileSync(
    file,
    JSON.stringify(event, null, 2) + '\n'
  );

  return {
    success: true,
    channel,
    file
  };
}

module.exports = {
  status,
  emit
};
