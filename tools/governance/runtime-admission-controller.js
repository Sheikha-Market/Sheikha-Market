'use strict';

const { execSync } = require('child_process');
const os = require('os');
const path = require('path');

const CLASSIFICATION_RULES = [
  { prefix: '.env', classification: 'REVIEW_REQUIRED', owner: 'Security Governance' },
  { prefix: '.githooks/', classification: 'REVIEW_REQUIRED', owner: 'Governance Automation' },
  { prefix: 'ACTIVATION-', classification: 'ACTIVE', owner: 'Activation Governance' },
  { prefix: 'GLOBAL_MANIFEST.md', classification: 'ACTIVE', owner: 'System Manifest Governance' },
  { prefix: 'PR_', classification: 'REVIEW_REQUIRED', owner: 'Pull Request Governance' },
  { prefix: 'README_', classification: 'ACTIVE', owner: 'Documentation Governance' },
  { prefix: 'ecosystem.config.js.save', classification: 'REVIEW_REQUIRED', owner: 'Runtime Operations Governance' },
  { prefix: 'eslint', classification: 'REVIEW_REQUIRED', owner: 'Tooling Governance' },
  { prefix: 'core/', classification: 'PROTECTED', owner: 'Runtime Kernel Organization' },
  { prefix: 'runtime/', classification: 'PROTECTED', owner: 'Runtime Governance Organization' },
  { prefix: 'routes/', classification: 'ACTIVE', owner: 'API Federation Organization' },
  { prefix: 'scripts/activate-', classification: 'REVIEW_REQUIRED', owner: 'Activation Governance' },
  { prefix: 'scripts/sheikha-', classification: 'REVIEW_REQUIRED', owner: 'Sheikha Operations Governance' },
  { prefix: 'scripts/universal-', classification: 'REVIEW_REQUIRED', owner: 'Universal Runtime Governance' },
  { prefix: 'scripts/neural-', classification: 'REVIEW_REQUIRED', owner: 'Neural Runtime Governance' },
  { prefix: 'scripts/auto-', classification: 'REVIEW_REQUIRED', owner: 'Runtime Automation Governance' },
  { prefix: 'scripts/patch-', classification: 'REVIEW_REQUIRED', owner: 'Runtime Patch Governance' },
  { prefix: 'scripts/', classification: 'REVIEW_REQUIRED', owner: 'Automation Organization' },
  { prefix: 'docs/', classification: 'ACTIVE', owner: 'Documentation Governance' },
  { prefix: 'topology/', classification: 'EXPERIMENTAL', owner: 'Architecture Organization' },
  { prefix: 'governance/', classification: 'PROTECTED', owner: 'Governance Organization' },
  { prefix: 'lib/runtime/', classification: 'STAGING', owner: 'Runtime Kernel Organization' },
  { prefix: 'sheikha-vscode-extension/', classification: 'STAGING', owner: 'IDE Organization' },
  { prefix: 'tools/governance/', classification: 'PROTECTED', owner: 'Governance Tooling Organization' },
  { prefix: 'tools/runtime/', classification: 'REVIEW_REQUIRED', owner: 'Runtime Tooling Governance' },
  { prefix: 'sheikha-enterprise-al-portal@', classification: 'REVIEW_REQUIRED', owner: 'Enterprise Portal Governance' }
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
    .map(line => {
      const status = line.slice(0, 2);
      const file = line.slice(3).trim();
      return file || line.trim();
    });
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
      reason: result.owner
        ? 'Governance review required'
        : 'No governance ownership',
      owner: result.owner || 'Unassigned Governance Review'
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

  // سجل تدقيق محلي (audit log)
  try {
    const auditLogPath = path.join(__dirname, 'audit-log.jsonl');
    const auditEntry = {
      timestamp: new Date().toISOString(),
      user: os.userInfo().username,
      cwd: process.cwd(),
      files,
      status: blocked.length > 0 ? 'BLOCKED' : 'ACTIVE',
      blocked: blocked.map(b => b.file),
      review: review.map(r => r.file),
      allowed: allowed.map(a => a.file)
    };
    require('fs').appendFileSync(auditLogPath, JSON.stringify(auditEntry) + '\n');
  } catch (e) {
    // تجاهل أي خطأ في التدقيق
  }
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
