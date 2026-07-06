'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

const TIERS = [
  'runtime/storage/hot',
  'runtime/storage/warm',
  'runtime/storage/cold',
  'runtime/storage/archive',
  'runtime/storage/critical'
];

function dirStats(dir) {
  const full = path.join(ROOT, dir);

  if (!fs.existsSync(full)) {
    return { path: dir, files: 0, bytes: 0 };
  }

  let files = 0;
  let bytes = 0;

  for (const item of fs.readdirSync(full)) {
    const p = path.join(full, item);
    const st = fs.statSync(p);
    if (st.isFile()) {
      files += 1;
      bytes += st.size;
    }
  }

  return { path: dir, files, bytes };
}

function health() {
  const tiers = TIERS.map(dirStats);
  const totalBytes = tiers.reduce((s, t) => s + t.bytes, 0);

  return {
    success: true,
    storageHealth: 'ACTIVE',
    governance: 'QURAN_AND_SUNNAH',
    noHarm: true,
    halalOnly: true,
    totalBytes,
    totalMB: +(totalBytes / 1024 / 1024).toFixed(3),
    tiers,
    policy: {
      keepCritical: true,
      reviewArchive: true,
      preventStorageExplosion: true
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = { health };
