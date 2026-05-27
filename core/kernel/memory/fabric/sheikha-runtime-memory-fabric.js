'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

const FORBIDDEN = [
  'خمر','كحول','مخدر','مخدرات','حشيش',
  'مسكر','مفتر','ربا','قمار','غش',
  'ضرر','ضرار'
];

function ensure() {
  [
    'runtime/memory/fabric',
    'runtime/memory/states',
    'runtime/memory/cache',
    'runtime/memory/knowledge',
    'runtime/memory/signals'
  ].forEach((p) => {
    fs.mkdirSync(path.join(ROOT, p), {
      recursive: true
    });
  });
}

function governanceGuard(payload = {}) {
  const text =
    JSON.stringify(payload).toLowerCase();

  const violation = FORBIDDEN.find((term) =>
    text.includes(term.toLowerCase())
  );

  if (
    violation ||
    payload?.meta?.haram === true ||
    payload?.meta?.harmful === true
  ) {
    return {
      success: false,
      blocked: true,
      governance: 'QURAN_AND_SUNNAH',
      noHarm: true,
      violation,
      reason: 'blocked_by_memory_governance',
      timestamp: new Date().toISOString()
    };
  }

  return { success: true };
}

function status() {
  ensure();

  return {
    success: true,
    fabric: 'SHEIKHA_RUNTIME_MEMORY_FABRIC',
    canonical: true,
    deterministic: true,
    localFirst: true,
    normalizedMemory: true,
    governance: {
      quranAndSunnah: true,
      noHarm: true,
      halalOnly: true,
      humanAuthority: true
    },
    memoryLayers: {
      operational: 'runtime/memory/states',
      cache: 'runtime/memory/cache',
      knowledge: 'runtime/memory/knowledge',
      signals: 'runtime/memory/signals',
      fabric: 'runtime/memory/fabric'
    },
    timestamp: new Date().toISOString()
  };
}

function remember(type, payload = {}, meta = {}) {
  ensure();

  const checked =
    governanceGuard({ type, payload, meta });

  if (!checked.success) {
    return checked;
  }

  const safeType =
    String(type || 'memory')
      .replace(/[^a-zA-Z0-9._-]/g, '-');

  const record = {
    success: true,
    fabric: 'SHEIKHA_RUNTIME_MEMORY_FABRIC',
    type: safeType,
    payload,
    meta,
    canonical: true,
    deterministic: true,
    timestamp: new Date().toISOString()
  };

  let layer = 'states';

  if (meta.cache) {
    layer = 'cache';
  }

  if (meta.knowledge) {
    layer = 'knowledge';
  }

  if (meta.signal) {
    layer = 'signals';
  }

  const file = path.join(
    ROOT,
    `runtime/memory/${layer}`,
    `${Date.now()}-${safeType}.json`
  );

  fs.writeFileSync(
    file,
    JSON.stringify(record, null, 2) + '\n'
  );

  return {
    success: true,
    stored: true,
    layer,
    file,
    record
  };
}

module.exports = {
  status,
  remember
};
