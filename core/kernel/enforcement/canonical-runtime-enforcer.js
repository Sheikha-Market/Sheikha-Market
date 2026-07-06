'use strict';

const path = require('path');

const ROOT = process.cwd();

const NON_CANONICAL = [
  'Sheikha-Market/sheikha-main-portal',
  'exports',
  'dist/sheikha-app/opt/sheikha',
  'repos/git-sheikha',
  'public/_archive',
  'infra/docker/compose/prod/Sheikha-Market'
];

function status() {
  return {
    success: true,
    enforcer: 'SHEIKHA_CANONICAL_RUNTIME_ENFORCER',
    canonicalRoot: ROOT,
    writableAuthority: ROOT,
    nonCanonicalPolicy: 'READ_ONLY_AUDIT_ONLY',
    blockedRuntimeRoots: NON_CANONICAL,
    runtimeAuthority: 'core/kernel',
    registryAuthority: 'docs/canonical',
    governance: 'QURAN_AND_SUNNAH',
    noHarm: true,
    timestamp: new Date().toISOString()
  };
}

module.exports = { status };
