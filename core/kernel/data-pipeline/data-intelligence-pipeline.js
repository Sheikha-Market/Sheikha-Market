'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

const DIRS = {
  raw: 'runtime/data/raw',
  validated: 'runtime/data/validated',
  information: 'runtime/data/information',
  systems: 'runtime/data/systems',
  reports: 'runtime/data/reports'
};

const FORBIDDEN = [
  'خمر', 'كحول', 'مخدر', 'مخدرات', 'حشيش', 'مسكر', 'مفتر',
  'ربا', 'قمار', 'غش', 'ضرر', 'ضرار'
];

function ensure() {
  Object.values(DIRS).forEach((dir) => {
    fs.mkdirSync(path.join(ROOT, dir), { recursive: true });
  });
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
    return {
      ok: false,
      violation: violation || 'metadata_violation'
    };
  }

  return { ok: true };
}

function write(dir, name, data) {
  ensure();
  const safeName = String(name || 'data').replace(/[^a-zA-Z0-9._-]/g, '-');
  const file = path.join(ROOT, dir, `${Date.now()}-${safeName}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
  return file;
}

function processData(input = {}) {
  const checked = guard(input);

  if (!checked.ok) {
    return {
      success: false,
      blocked: true,
      governance: 'QURAN_AND_SUNNAH',
      noHarm: true,
      reason: 'blocked_by_governance',
      violation: checked.violation,
      timestamp: new Date().toISOString()
    };
  }

  const raw = {
    stage: 'raw',
    input,
    timestamp: new Date().toISOString()
  };

  const validated = {
    stage: 'validated',
    halal: true,
    noHarm: true,
    canonical: true,
    data: input.data || {},
    meta: input.meta || {},
    timestamp: new Date().toISOString()
  };

  const information = {
    stage: 'information',
    summary: input.summary || 'Data converted into governed operational information.',
    keys: Object.keys(input.data || {}),
    data: validated.data,
    timestamp: new Date().toISOString()
  };

  const system = {
    stage: 'system',
    systemName: input.systemName || 'SHEIKHA-GOVERNED-INFORMATION-SYSTEM',
    purpose: input.purpose || 'Convert valid data into beneficial governed systems.',
    information,
    controls: {
      localFirst: true,
      noHarm: true,
      halalOnly: true,
      humanAuthority: true
    },
    timestamp: new Date().toISOString()
  };

  const files = {
    raw: write(DIRS.raw, input.name || 'raw', raw),
    validated: write(DIRS.validated, input.name || 'validated', validated),
    information: write(DIRS.information, input.name || 'information', information),
    system: write(DIRS.systems, input.name || 'system', system)
  };

  return {
    success: true,
    pipeline: 'SHEIKHA_DATA_TO_INFORMATION_TO_SYSTEMS',
    governance: 'QURAN_AND_SUNNAH',
    noHarm: true,
    halalOnly: true,
    files,
    output: system,
    timestamp: new Date().toISOString()
  };
}

function status() {
  ensure();
  return {
    success: true,
    pipeline: 'SHEIKHA_DATA_INTELLIGENCE_PIPELINE',
    stages: ['raw', 'validated', 'information', 'systems'],
    governance: 'QURAN_AND_SUNNAH',
    noHarm: true,
    halalOnly: true,
    timestamp: new Date().toISOString()
  };
}

module.exports = { status, processData };
