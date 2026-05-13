'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { writeMetric } = require('./_writer');

function sha256(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

function verifyFingerprint(rootDir) {
  const fpPath = path.join(rootDir, '.runtime-fingerprint');
  if (!fs.existsSync(fpPath)) {
    return { ok: false, status: 'missing-fingerprint-file', mismatches: [{ file: '.runtime-fingerprint', reason: 'missing-file' }] };
  }

  const lines = fs.readFileSync(fpPath, 'utf8')
    .split(/\r?\n/)
    .map((x) => x.trim())
    .filter(Boolean)
    .filter((x) => !x.startsWith('#'));

  const mismatches = [];

  for (const line of lines) {
    const m = line.match(/^([a-f0-9]{64})\s+\*?(.+)$/i);
    if (!m) continue;

    const expected = m[1].toLowerCase();
    const relativePath = m[2];
    const absolutePath = path.join(rootDir, relativePath);

    if (!fs.existsSync(absolutePath)) {
      mismatches.push({ file: relativePath, reason: 'missing-file' });
      continue;
    }

    const actual = sha256(absolutePath);
    if (actual !== expected) {
      mismatches.push({ file: relativePath, reason: 'hash-mismatch' });
    }
  }

  return {
    ok: mismatches.length === 0,
    status: mismatches.length === 0 ? 'verified' : 'mismatch',
    mismatches
  };
}

function startDriftMonitor(options) {
  const {
    rootDir,
    metricsDir,
    intervalMs = 60000
  } = options;

  const id = setInterval(() => {
    const result = verifyFingerprint(rootDir);

    writeMetric(metricsDir, 'drift', {
      type: 'drift',
      status: result.status,
      mismatches: result.mismatches
    });

    if (!result.ok) {
      console.warn('[OBS][DRIFT] fingerprint mismatch detected:', result.mismatches);
    }
  }, intervalMs);

  return () => clearInterval(id);
}

module.exports = { startDriftMonitor };
