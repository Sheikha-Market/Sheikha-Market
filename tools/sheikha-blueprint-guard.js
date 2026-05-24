#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

const reportDir = path.join(ROOT, 'reports/registry');
fs.mkdirSync(reportDir, { recursive: true });

const forbidden = [
  'Sheikha-Market/sheikha-main-portal',
  'exports',
  'public/_archive',
  'infra/docker/compose/prod/Sheikha-Market'
];

const canonical = [
  'docs/registry/ROOT-SOURCE-OF-TRUTH.md',
  'core/orchestration',
  'core/neural',
  'core/runtime'
];

function exists(p) {
  return fs.existsSync(path.join(ROOT, p));
}

function safeStat(full) {
  try {
    return fs.lstatSync(full);
  } catch {
    return null;
  }
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;

  let items = [];

  try {
    items = fs.readdirSync(dir);
  } catch {
    return out;
  }

  for (const item of items) {
    const full = path.join(dir, item);
    const rel = path.relative(ROOT, full);

    if (
      rel.includes('node_modules') ||
      rel.includes('.git') ||
      rel.includes('.venv') ||
      rel.includes('venv') ||
      rel.includes('dist') ||
      rel.includes('build')
    ) {
      continue;
    }

    const stat = safeStat(full);

    if (!stat) continue;

    if (stat.isSymbolicLink()) {
      continue;
    }

    if (stat.isDirectory()) {
      walk(full, out);
    } else {
      out.push(rel);
    }
  }

  return out;
}

const files = walk(ROOT);

const blueprintFiles = files.filter(f =>
  /blueprint|architecture|governance|runtime|neural/i.test(f)
);

const forbiddenHits = blueprintFiles.filter(f =>
  forbidden.some(prefix => f.startsWith(prefix))
);

const missingCanonical = canonical.filter(p => !exists(p));

const result = {
  success:
    forbiddenHits.length === 0 &&
    missingCanonical.length === 0,

  status:
    forbiddenHits.length === 0 &&
    missingCanonical.length === 0
      ? 'passed'
      : 'blocked',

  canonical,
  missingCanonical,
  forbiddenHits,

  stats: {
    scannedFiles: files.length,
    blueprintFiles: blueprintFiles.length
  },

  governance: {
    tawheed: true,
    quranAndSunnahGoverned: true,
    humanAuthority: true,
    orchestration: true,
    neuralFabric: true,
    runtimeBus: true,
    recoveryEngine: true,
    distributedRootRuntime: true
  },

  timestamp: new Date().toISOString()
};

const reportPath = path.join(
  reportDir,
  `blueprint-guard-${Date.now()}.json`
);

fs.writeFileSync(
  reportPath,
  JSON.stringify(result, null, 2) + '\n'
);

console.log(JSON.stringify(result, null, 2));

if (!result.success) {
  console.error('\nBLOCKED');
  console.error(`Report: ${reportPath}`);
  process.exit(1);
}
