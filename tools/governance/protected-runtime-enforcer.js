'use strict';

const { execSync } = require('child_process');

const PROTECTED_PREFIXES = [
  'core/',
  'runtime/',
  'governance/',
  'routes/',
  'scripts/',
  'tools/governance/'
];

const FORBIDDEN_PATTERNS = [
  '.pem',
  '.key',
  'id_rsa',
  'password',
  'secret',
  '.env.local',
  '.env.production'
];

function gitStatus() {
  return execSync('git status --short --untracked-files=all', { encoding: 'utf8' })
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);
}

function fileOf(line) {
  return line.slice(3);
}

function isProtected(file) {
  return PROTECTED_PREFIXES.some(prefix => file.startsWith(prefix));
}

function isEnvTemplate(file) {
  const lower = file.toLowerCase();
  return lower.startsWith('.env') && lower.endsWith('.example');
}

function isForbidden(file) {
  if (isEnvTemplate(file)) {
    return false;
  }

  const lower = file.toLowerCase();
  return FORBIDDEN_PATTERNS.some(pattern => lower.includes(pattern));
}

function run() {
  const lines = gitStatus();
  const files = lines.map(fileOf);

  const protectedFiles = files.filter(isProtected);
  const forbiddenFiles = files.filter(isForbidden);

  const decision =
    forbiddenFiles.length > 0
      ? 'BLOCKED'
      : 'REVIEW_REQUIRED';

  return {
    enforcer: 'SHEIKHA_PROTECTED_RUNTIME_ENFORCER',
    status: decision,
    principle: 'لا ضرر ولا ضرار',
    totals: {
      changedFiles: files.length,
      protectedFiles: protectedFiles.length,
      forbiddenFiles: forbiddenFiles.length
    },
    protectedFiles,
    forbiddenFiles
  };
}

console.log(JSON.stringify(run(), null, 2));
