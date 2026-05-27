'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

const CHANNELS = {
  kernel: 'SHEIKHA_KERNEL_CHANNEL',
  motherboard: 'SHEIKHA_MOTHERBOARD_CHANNEL',
  telemetry: 'SHEIKHA_TELEMETRY_CHANNEL',
  storage: 'SHEIKHA_STORAGE_CHANNEL',
  memory: 'SHEIKHA_MEMORY_CHANNEL',
  data: 'SHEIKHA_DATA_CHANNEL',
  intelligence: 'SHEIKHA_INTELLIGENCE_CHANNEL',
  scheduler: 'SHEIKHA_SCHEDULER_CHANNEL',
  execution: 'SHEIKHA_EXECUTION_CHANNEL',
  provider: 'SHEIKHA_PROVIDER_CHANNEL',
  federation: 'SHEIKHA_FEDERATION_CHANNEL',
  governance: 'SHEIKHA_GOVERNANCE_CHANNEL'
};

const FORBIDDEN = [
  'خمر', 'كحول', 'مخدر', 'مخدرات', 'حشيش', 'مسكر', 'مفتر',
  'ربا', 'قمار', 'غش', 'ضرر', 'ضرار'
];

function ensure() {
  fs.mkdirSync(path.join(ROOT, 'runtime/bus/events'), { recursive: true });
  fs.mkdirSync(path.join(ROOT, 'runtime/bus/signals'), { recursive: true });
  fs.mkdirSync(path.join(ROOT, 'runtime/bus/reports'), { recursive: true });
}

function guard(payload = {}) {
  const text = JSON.stringify(payload).toLowerCase();
  const violation = FORBIDDEN.find((term) => text.includes(term.toLowerCase()));

  if (
    violation ||
    payload?.meta?.haram === true ||
    payload?.meta?.harmful === true ||
    payload?.meta?.intoxicant === true
  ) {
    return { ok: false, violation: violation || 'metadata_violation' };
  }

  return { ok: true };
}

function status() {
  ensure();

  return {
    success: true,
    bus: 'SHEIKHA_UNIFIED_RUNTIME_BUS_V2',
    canonical: true,
    deterministic: true,
    channels: CHANNELS,
    governance: {
      quranAndSunnah: true,
      noHarm: true,
      halalOnly: true,
      humanAuthority: true
    },
    policy: {
      singleBusAuthority: true,
      allRuntimeSignalsThroughBus: true,
      noDuplicateRuntimeSignals: true,
      externalSystemsAreClientsOnly: true
    },
    timestamp: new Date().toISOString()
  };
}

function publish(channel, event, payload = {}) {
  ensure();

  const checked = guard({ channel, event, payload });

  if (!checked.ok) {
    return {
      success: false,
      blocked: true,
      governance: 'QURAN_AND_SUNNAH',
      noHarm: true,
      violation: checked.violation,
      reason: 'blocked_by_runtime_bus_governance',
      timestamp: new Date().toISOString()
    };
  }

  const safeChannel = CHANNELS[channel] ? channel : 'kernel';
  const safeEvent = String(event || 'runtime-event').replace(/[^a-zA-Z0-9._-]/g, '-');

  const record = {
    bus: 'SHEIKHA_UNIFIED_RUNTIME_BUS_V2',
    channel: safeChannel,
    channelId: CHANNELS[safeChannel],
    event: safeEvent,
    payload,
    canonical: true,
    deterministic: true,
    timestamp: new Date().toISOString()
  };

  const file = path.join(
    ROOT,
    'runtime/bus/events',
    `${Date.now()}-${safeChannel}-${safeEvent}.json`
  );

  fs.writeFileSync(file, JSON.stringify(record, null, 2) + '\n');

  return {
    success: true,
    published: true,
    file,
    record
  };
}

function signal(name, payload = {}) {
  return publish('kernel', name || 'runtime-signal', payload);
}

module.exports = {
  status,
  publish,
  signal
};
