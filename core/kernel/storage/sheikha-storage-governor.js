
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();


const FORBIDDEN_TERMS = [
  'خمر',
  'كحول',
  'مخدر',
  'مخدرات',
  'حشيش',
  'مسكر',
  'مفتر',
  'ربا',
  'قمار',
  'غش',
  'ضرر',
  'ضرار'
];

function shariaGuard(name, data, meta = {}) {
  const text = JSON.stringify({ name, data, meta }).toLowerCase();

  const violation = FORBIDDEN_TERMS.find((term) =>
    text.includes(term.toLowerCase())
  );

  if (violation || meta.haram === true || meta.harmful === true || meta.intoxicant === true) {
    return {
      ok: false,
      reason: 'blocked_by_quran_sunnah_governance',
      violation: violation || 'metadata_violation'
    };
  }

  return {
    ok: true,
    reason: 'halal_no_harm_storage_allowed'
  };
}


const STORAGE = {
  hot: 'runtime/storage/hot',
  warm: 'runtime/storage/warm',
  cold: 'runtime/storage/cold',
  archive: 'runtime/storage/archive',
  critical: 'runtime/storage/critical'
};

function ensure() {
  Object.values(STORAGE).forEach((p) => {
    fs.mkdirSync(path.join(ROOT, p), {
      recursive: true
    });
  });
}

function classify(meta = {}) {
  if (meta.critical) {
    return 'critical';
  }

  if (meta.runtime) {
    return 'hot';
  }

  if (meta.active) {
    return 'warm';
  }

  if (meta.archive) {
    return 'archive';
  }

  return 'cold';
}

function store(name, data, meta = {}) {
  const guard = shariaGuard(name, data, meta);

  if (!guard.ok) {
    return {
      success: false,
      blocked: true,
      governance: 'QURAN_AND_SUNNAH',
      noHarm: true,
      reason: guard.reason,
      violation: guard.violation,
      message: 'تم منع التخزين لأنه يخالف ضوابط الحلال وعدم الضرر.',
      timestamp: new Date().toISOString()
    };
  }

  ensure();

  const tier = classify(meta);

  const file = path.join(
    ROOT,
    STORAGE[tier],
    `${Date.now()}-${name}.json`
  );

  fs.writeFileSync(
    file,
    JSON.stringify({
      name,
      tier,
      governance: 'ACTIVE',
      canonical: true,
      timestamp: new Date().toISOString(),
      meta,
      data
    }, null, 2)
  );

  return {
    success: true,
    tier,
    file
  };
}

function status() {
  ensure();

  return {
    success: true,
    storageFabric: 'SHEIKHA_STORAGE_GOVERNOR',
    sovereign: true,
    localFirst: true,
    deterministic: true,
    governance: {
      quranAndSunnah: true,
      halalOnly: true,
      noHarm: true,
      noDarar: true,
      noRiba: true,
      noFraud: true,
      noIntoxicants: true,
      noMufattir: true,
      noHaramStorage: true,
      humanAuthority: true
    },
    policy: [
      'quran-sunnah-governed-storage',
      'halal-only-persistence',
      'no-harm-no-darar',
      'no-riba-no-fraud',
      'no-intoxicants',
      'no-mufattir-content',
      'no-haram-storage'
    ],
    tiers: STORAGE,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  status,
  store
};
