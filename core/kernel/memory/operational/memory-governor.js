'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

const DIRS = {
  operational: 'runtime/memory/operational',
  knowledge: 'runtime/memory/knowledge',
  reports: 'runtime/memory/reports',
  decision: 'runtime/memory/decision'
};

const FORBIDDEN = [
  'خمر', 'كحول', 'مخدر', 'مخدرات', 'حشيش', 'مسكر', 'مفتر',
  'ربا', 'قمار', 'غش', 'ضرر', 'ضرار'
];

function ensure() {
  Object.values(DIRS).forEach((dir) =>
    fs.mkdirSync(path.join(ROOT, dir), { recursive: true })
  );
}

function guard(payload) {
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

function tier(meta = {}) {
  if (meta.decision) return 'decision';
  if (meta.report) return 'reports';
  if (meta.knowledge) return 'knowledge';
  return 'operational';
}

function remember(input = {}) {
  ensure();

  const checked = guard(input);
  if (!checked.ok) {
    return {
      success: false,
      blocked: true,
      governance: 'QURAN_AND_SUNNAH',
      noHarm: true,
      violation: checked.violation,
      reason: 'blocked_by_memory_governance',
      timestamp: new Date().toISOString()
    };
  }

  const selected = tier(input.meta || {});
  const safeName = String(input.name || 'memory').replace(/[^a-zA-Z0-9._-]/g, '-');
  const file = path.join(ROOT, DIRS[selected], `${Date.now()}-${safeName}.json`);

  const record = {
    memory: 'SHEIKHA_OPERATIONAL_MEMORY',
    tier: selected,
    governance: 'QURAN_AND_SUNNAH',
    halalOnly: true,
    noHarm: true,
    canonical: true,
    input,
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync(file, JSON.stringify(record, null, 2) + '\n');

  return { success: true, tier: selected, file, record };
}

function status() {
  ensure();
  return {
    success: true,
    memory: 'SHEIKHA_OPERATIONAL_MEMORY_GOVERNOR',
    tiers: DIRS,
    governance: 'QURAN_AND_SUNNAH',
    halalOnly: true,
    noHarm: true,
    localFirst: true,
    timestamp: new Date().toISOString()
  };
}

module.exports = { status, remember };
