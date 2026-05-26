
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

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
    tiers: STORAGE,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  status,
  store
};
