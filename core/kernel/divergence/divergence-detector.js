'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

const WATCH = [
  'server.js',
  'dist/sheikha-app/opt/sheikha/server.js',
  'exports/activation-bundle/server/server.js',
  'sheikha-main-portal/server.js'
];

function exists(p) {
  return fs.existsSync(path.join(ROOT, p));
}

function scan() {
  const found = WATCH.filter(exists);

  return {
    success: true,
    detector: 'SHEIKHA_DIVERGENCE_DETECTOR',
    canonicalServer: 'server.js',
    foundRuntimeCopies: found,
    divergenceRisk: found.length > 1,
    policy: {
      canonicalOnlyExecutable: true,
      copiesAreNonAuthoritative: true,
      noDuplicateRuntimeAuthority: true,
      reviewBeforeMerge: true
    },
    governance: 'QURAN_AND_SUNNAH',
    timestamp: new Date().toISOString()
  };
}

module.exports = { scan };
