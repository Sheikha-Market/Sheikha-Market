'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = process.cwd();
const EVENTS_DIR = path.join(ROOT, 'runtime/bus/events');
const MAX_EVENT_FILES = Number(process.env.SHEIKHA_RUNTIME_BUS_MAX_EVENTS || 5000);

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

async function pruneOldEvents() {
  try {
    const entries = await fs.promises.readdir(EVENTS_DIR, { withFileTypes: true });
    const files = entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
      .map((entry) => entry.name)
      .sort();

    const overflow = files.length - MAX_EVENT_FILES;
    if (overflow <= 0) {
      return;
    }

    await Promise.all(
      files.slice(0, overflow).map((name) =>
        fs.promises.unlink(path.join(EVENTS_DIR, name)).catch(() => undefined)
      )
    );
  } catch {
    // Best-effort pruning to keep emit path non-blocking.
  }
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

  const file = path.join(EVENTS_DIR, `${Date.now()}-${channel}.json`);

  fs.promises
    .writeFile(file, JSON.stringify(event, null, 2) + '\n')
    .then(() => pruneOldEvents())
    .catch(() => undefined);

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
