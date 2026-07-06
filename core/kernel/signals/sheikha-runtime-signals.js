'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

const FORBIDDEN = [
  'خمر', 'كحول', 'مخدر', 'مخدرات', 'حشيش',
  'مسكر', 'مفتر', 'ربا', 'قمار', 'غش',
  'ضرر', 'ضرار'
];

const CHANNELS = [
  'kernel',
  'health',
  'orchestration',
  'providers',
  'telemetry',
  'scheduler',
  'storage',
  'memory',
  'governance'
];

function ensure() {
  [
    'runtime/signals/events',
    'runtime/signals/interrupts',
    'runtime/signals/health',
    'runtime/signals/orchestration',
    'runtime/signals/providers',
    'runtime/signals/reports'
  ].forEach((dir) => fs.mkdirSync(path.join(ROOT, dir), { recursive: true }));
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
    signals: 'SHEIKHA_RUNTIME_SIGNAL_FABRIC',
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
      deterministicSignals: true,
      noDuplicateSignals: true,
      governanceFirstPropagation: true,
      internalExternalSeparation: true
    },
    timestamp: new Date().toISOString()
  };
}

function emit(signal = {}) {
  ensure();

  const checked = guard(signal);

  if (!checked.ok) {
    return {
      success: false,
      blocked: true,
      governance: 'QURAN_AND_SUNNAH',
      noHarm: true,
      violation: checked.violation,
      reason: 'blocked_by_signal_governance',
      timestamp: new Date().toISOString()
    };
  }

  const channel = CHANNELS.includes(signal.channel) ? signal.channel : 'kernel';
  const type = String(signal.type || 'runtime-signal').replace(/[^a-zA-Z0-9._-]/g, '-');

  const record = {
    success: true,
    signalFabric: 'SHEIKHA_RUNTIME_SIGNAL_FABRIC',
    channel,
    type,
    priority: signal.priority || 'normal',
    payload: signal.payload || {},
    meta: signal.meta || {},
    canonical: true,
    deterministic: true,
    timestamp: new Date().toISOString()
  };

  const file = path.join(
    ROOT,
    'runtime/signals/events',
    `${Date.now()}-${channel}-${type}.json`
  );

  fs.writeFileSync(file, JSON.stringify(record, null, 2) + '\n');

  return {
    success: true,
    emitted: true,
    file,
    record
  };
}

module.exports = { status, emit };
