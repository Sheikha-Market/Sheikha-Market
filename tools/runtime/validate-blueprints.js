#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

function findRepoRoot() {
  try {
    return execFileSync('git', ['rev-parse', '--show-toplevel'], {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
  } catch {
    return path.resolve(__dirname, '../..');
  }
}

const root = findRepoRoot();

const blocked = [
  'Sheikha-Market',
  'exports',
  'repos/git-sheikha',
  'public/_archive',
  'infra/docker/compose/prod/Sheikha-Market',
  'docs/architecture/blueprints/auto'
];

const allowed = [
  'docs/architecture',
  'docs/architecture/blueprints',
  'core/runtime',
  'core/governance',
  'core/neural',
  'core/orchestration',
  'routes',
  'server.js'
];

const existingAllowed = allowed
  .filter((p) => fs.existsSync(path.join(root, p)))
  .map((p) => ({
    type: 'canonical-runtime-path',
    path: p,
    action: 'allow-runtime-load'
  }));

const violations = blocked
  .filter((p) => fs.existsSync(path.join(root, p)))
  .map((p) => ({
    type: p.includes('blueprints/auto') ? 'audit-only-runtime-block' : 'non-canonical-path',
    path: p,
    action: 'do-not-load-runtime'
  }));

const result = {
  success: true,
  governance: 'ACTIVE',
  mode: 'canonical-convergence',
  canonicalRoot: root,
  allowedRuntimePaths: allowed,
  blockedRuntimePaths: blocked,
  existingAllowedRuntimePaths: existingAllowed,
  violations,
  decision: violations.length
    ? 'runtime_allowed_only_from_canonical_paths'
    : 'canonical_paths_clean',
  timestamp: new Date().toISOString()
};

const reportDir = path.join(root, 'reports/registry');
fs.mkdirSync(reportDir, { recursive: true });
const report = path.join('reports/registry', `blueprint-runtime-validation-${Date.now()}.json`);
fs.writeFileSync(path.join(root, report), JSON.stringify(result, null, 2) + '\n');

console.log(JSON.stringify({ ...result, report }, null, 2));
