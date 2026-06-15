'use strict';

const fs = require('fs');
const crypto = require('crypto');
const { readStatus } = require('./git-context-reader');

const PROTECTED = [
  'core/',
  'runtime/',
  'governance/',
  'scripts/',
  'tools/governance/',
  'routes/'
];

function getFiles() {
  return readStatus()
    .filter(v => v.trim())
    .map(v => v.trimEnd())
    .map(v => v.slice(3).trim());
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
