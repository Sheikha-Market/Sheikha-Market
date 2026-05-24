#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = process.cwd();

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
  violations,
  decision: violations.length
    ? 'runtime_allowed_only_from_canonical_paths'
    : 'canonical_paths_clean',
  timestamp: new Date().toISOString()
};

fs.mkdirSync('reports/registry', { recursive: true });
const report = `reports/registry/blueprint-runtime-validation-${Date.now()}.json`;
fs.writeFileSync(report, JSON.stringify(result, null, 2) + '\n');

console.log(JSON.stringify({ ...result, report }, null, 2));
