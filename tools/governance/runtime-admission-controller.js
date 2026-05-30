'use strict';

const { execSync } = require('child_process');

const CLASSIFICATION_RULES = [
  { prefix: 'core/', classification: 'PROTECTED' },
  { prefix: 'runtime/', classification: 'PROTECTED' },
  { prefix: 'routes/', classification: 'ACTIVE' },
  { prefix: 'scripts/', classification: 'REVIEW_REQUIRED' },
  { prefix: 'docs/', classification: 'ACTIVE' },
  { prefix: 'topology/', classification: 'EXPERIMENTAL' },
  { prefix: 'governance/', classification: 'PROTECTED' },
  { prefix: 'lib/runtime/', classification: 'STAGING' },
  { prefix: 'sheikha-vscode-extension/', classification: 'STAGING' }
];

const BLOCKED_PATTERNS = [
  '.env',
  '.pem',
  '.key',
  'id_rsa',
  'secret',
  'password'
];

function getUntrackedFiles() {
  const output = execSync(
    'git status --short --untracked-files=all',
    { encoding: 'utf8' }
  );

  return output
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .filter(line => line.startsWith('?? '))
    .map(line => line.slice(3));
}

function classify(file) {
  const matched =
    CLASSIFICATION_RULES.find(rule =>
      file.startsWith(rule.prefix)
    );

  if (!matched) {
    return {
      classification: 'REVIEW_REQUIRED'
    };
  }

  return matched;
}

function isEnvTemplate(file) {
  const lower = file.toLowerCase();
  return (
    lower.startsWith('.env') &&
    lower.endsWith('.example')
  );
}

function isBlocked(file) {
  if (isEnvTemplate(file)) {
    return false;
  }

  return BLOCKED_PATTERNS.some(pattern =>
    file.toLowerCase().includes(pattern)
  );
}

function evaluateFile(file) {

  if (isBlocked(file)) {
    return {
      file,
      decision: 'BLOCKED',
      reason: 'Sensitive or forbidden pattern detected'
    };
  }

  const result = classify(file);

  if (
    result.classification ===
    'REVIEW_REQUIRED'
  ) {
    return {
      file,
      decision: 'REVIEW_REQUIRED',
      reason: 'No governance ownership'
    };
  }

  return {
    file,
    decision: 'ALLOWED',
    classification:
      result.classification
  };
}

function runAdmissionController() {

  const files =
    getUntrackedFiles();

  const evaluations =
    files.map(evaluateFile);

  const blocked =
    evaluations.filter(
      item => item.decision === 'BLOCKED'
    );

  const review =
    evaluations.filter(
      item =>
        item.decision ===
        'REVIEW_REQUIRED'
    );

  const allowed =
    evaluations.filter(
      item => item.decision === 'ALLOWED'
    );

  return {
    runtime:
      'SHEIKHA_RUNTIME_ADMISSION_CONTROLLER',

    status:
      blocked.length > 0
        ? 'BLOCKED'
        : 'ACTIVE',

    totals: {
      files: files.length,
      allowed: allowed.length,
      review: review.length,
      blocked: blocked.length
    },

    principle:
      'لا ضرر ولا ضرار',

    evaluations
  };
}

const result =
  runAdmissionController();

console.log(
  JSON.stringify(result, null, 2)
);
