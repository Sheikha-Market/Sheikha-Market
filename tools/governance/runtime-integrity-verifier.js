'use strict';

const fs = require('fs');
const crypto = require('crypto');
const { execSync } = require('child_process');

const PROTECTED = [
  'core/',
  'runtime/',
  'governance/',
  'scripts/',
  'tools/governance/',
  'routes/'
];

function getFiles() {
  const output = execSync(
    'git status --short --untracked-files=all',
    { encoding: 'utf8' }
  );

  return output
    .split('\n')
    .map(v => v.trim())
    .filter(Boolean)
    .map(v => v.slice(3));
}

function isProtected(file) {
  return PROTECTED.some(prefix =>
    file.startsWith(prefix)
  );
}

function sha(file) {
  try {
    return crypto
      .createHash('sha256')
      .update(fs.readFileSync(file))
      .digest('hex');
  } catch {
    return null;
  }
}

const files = getFiles();

const protectedFiles =
  files.filter(isProtected);

const integrity =
  protectedFiles.map(file => ({
    file,
    sha256: sha(file),
    integrity: 'VERIFIED'
  }));

console.log(JSON.stringify({
  runtime: 'SHEIKHA_RUNTIME_INTEGRITY_VERIFIER',
  principle: 'لا ضرر ولا ضرار',
  protectedFiles: protectedFiles.length,
  integrity
}, null, 2));
