'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

const SIGNALS = {
  runtime: true,
  telemetry: true,
  scheduler: true,
  governance: true,
  intelligence: true,
  storage: true,
  health: true
};

function ensure() {
  [
    'runtime/signals/events',
    'runtime/signals/alerts',
    'runtime/signals/routes'
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
    fabric: 'SHEIKHA_RUNTIME_SIGNAL_FABRIC',
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
    signals: SIGNALS,
    timestamp: new Date().toISOString()
  };
}

function emit(signal, payload = {}) {
  ensure();

  if (!SIGNALS[signal]) {
    return {
      success: false,
      blocked: true,
      reason: 'unknown_signal',
      signal
    };
  }

  const event = {
    signal,
    payload,
    timestamp: new Date().toISOString()
  };

  const file = path.join(
    ROOT,
    'runtime/signals/events',
    `${Date.now()}-${signal}.json`
  );

  fs.writeFileSync(
    file,
    JSON.stringify(event, null, 2) + '\n'
  );

  return {
    success: true,
    signal,
    file
  };
}

module.exports = {
  status,
  emit
};
