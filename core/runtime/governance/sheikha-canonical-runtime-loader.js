'use strict';

const path = require('path');
const { execFileSync } = require('child_process');

const CANONICAL_RUNTIME_PATHS = [
  'core/runtime',
  'core/governance',
  'core/neural',
  'core/orchestration',
  'core/ai-gateway',
  'core/development',
  'routes',
  'server.js'
];

const AUDIT_ONLY_PATHS = [
  'docs/architecture/blueprints/auto',
  'reports',
  'exports',
  'public/_archive'
];

const BLOCKED_RUNTIME_PATHS = [
  'exports',
  'Sheikha-Market',
  'repos/git-sheikha',
  'public/_archive',
  'docs/architecture/blueprints/auto',
  'infra/docker/compose/prod/Sheikha-Market'
];

function repoRoot() {
  try {
    return execFileSync('git', ['rev-parse', '--show-toplevel'], {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
  } catch {
    return path.resolve(__dirname, '../../..');
  }
}

function normalizeRelative(candidate, root = repoRoot()) {
  const normalizedCandidate = String(candidate || '')
    .replace(/&amp;#x2F;/gi, '/')
    .replace(/&#x2F;/gi, '/')
    .replace(/&sol;/gi, '/');
  const full = path.isAbsolute(normalizedCandidate)
    ? path.resolve(normalizedCandidate)
    : path.resolve(root, normalizedCandidate);
  return path.relative(root, full).replace(/\\/g, '/');
}

function matchesPath(relativePath, zone) {
  return relativePath === zone || relativePath.startsWith(`${zone}/`);
}

function classifyRuntimePath(candidate, options = {}) {
  const root = options.root || repoRoot();
  const relativePath = normalizeRelative(candidate, root);
  const blockedBy = BLOCKED_RUNTIME_PATHS.find((zone) => matchesPath(relativePath, zone));
  const auditOnlyBy = AUDIT_ONLY_PATHS.find((zone) => matchesPath(relativePath, zone));
  const allowedBy = CANONICAL_RUNTIME_PATHS.find((zone) => matchesPath(relativePath, zone));

  if (blockedBy) {
    return {
      candidate,
      root,
      relativePath,
      allowed: false,
      zone: 'blocked',
      matched: blockedBy,
      action: 'do-not-load-runtime',
      reason: 'non-canonical or audit-only runtime path'
    };
  }

  if (auditOnlyBy) {
    return {
      candidate,
      root,
      relativePath,
      allowed: false,
      zone: 'audit-only',
      matched: auditOnlyBy,
      action: 'audit-reference-only',
      reason: 'path is available for reporting but not runtime loading'
    };
  }

  if (allowedBy) {
    return {
      candidate,
      root,
      relativePath,
      allowed: true,
      zone: 'canonical',
      matched: allowedBy,
      action: 'allow-runtime-load',
      reason: 'canonical runtime path'
    };
  }

  return {
    candidate,
    root,
    relativePath,
    allowed: false,
    zone: 'unregistered',
    matched: null,
    action: 'require-registry-review',
    reason: 'path is not registered as a canonical runtime source'
  };
}

function canLoadRuntimePath(candidate, options = {}) {
  return classifyRuntimePath(candidate, options).allowed;
}

function guardRuntimeLoad(candidate, options = {}) {
  const decision = classifyRuntimePath(candidate, options);
  if (!decision.allowed) {
    const error = new Error(`Blocked non-canonical runtime load: ${decision.relativePath}`);
    error.code = 'SHEIKHA_NON_CANONICAL_RUNTIME_PATH';
    error.decision = decision;
    throw error;
  }
  return decision;
}

function getCanonicalRuntimeStatus(options = {}) {
  const root = options.root || repoRoot();
  return {
    success: true,
    status: 'active',
    runtime: 'canonical',
    governance: 'active',
    mode: 'canonical-runtime-only',
    canonicalRoot: root,
    duplicateRuntimeLoading: false,
    autoBlueprintRuntimeLoading: false,
    nestedRepoExecution: false,
    recursiveScannerRuntimeLoading: false,
    canonicalRuntimePaths: CANONICAL_RUNTIME_PATHS.map((item) => path.resolve(root, item)),
    auditOnlyPaths: AUDIT_ONLY_PATHS.map((item) => path.resolve(root, item)),
    blockedRuntimePaths: BLOCKED_RUNTIME_PATHS.map((item) => path.resolve(root, item)),
    policy: [
      'runtime loads only from canonical paths',
      'audit artifacts never become executable runtime sources',
      'duplicate trees remain reference-only until reviewed',
      'human approval required before new runtime authority',
      'quran-sunnah-governance'
    ],
    governanceBasis: {
      tawheed: true,
      basis: 'quran-and-sunnah',
      humanAuthority: true,
      noConsciousnessClaim: true,
      noGhaybPrediction: true,
      noCreationClaim: true,
      noHarm: true,
      privacyByDefault: true
    },
    message: 'Canonical Runtime Loader active: only registered runtime sources are executable.',
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  CANONICAL_RUNTIME_PATHS,
  AUDIT_ONLY_PATHS,
  BLOCKED_RUNTIME_PATHS,
  repoRoot,
  normalizeRelative,
  classifyRuntimePath,
  canLoadRuntimePath,
  guardRuntimeLoad,
  getCanonicalRuntimeStatus
};
