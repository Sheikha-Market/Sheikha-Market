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
  'docs/architecture/SHEIKHA-CANONICAL-PATHS-AND-BLUEPRINTS.md'
];

function exists(p) {
  return fs.existsSync(path.join(ROOT, p));
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const rel = path.relative(ROOT, full);
    if (rel.includes('node_modules') || rel.includes('.git')) continue;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, out);
    else out.push(rel);
  }
  return out;
}

const files = walk(ROOT);
const blueprintFiles = files.filter(f =>
  /(^|\/)SHEIKHA.*\.(md|txt)$/i.test(f) ||
  /blueprint|architecture|dashboard|governance/i.test(path.basename(f))
);

const forbiddenHits = blueprintFiles.filter(f =>
  forbidden.some(prefix => f.startsWith(prefix))
);

const missingCanonical = canonical.filter(p => !exists(p));

const result = {
  success: forbiddenHits.length === 0 && missingCanonical.length === 0,
  name: 'Sheikha Blueprint Guard',
  status: forbiddenHits.length === 0 && missingCanonical.length === 0 ? 'passed' : 'blocked',
  canonical,
  missingCanonical,
  forbiddenHits,
  blueprintFilesCount: blueprintFiles.length,
  governance: {
    tawheed: true,
    quranAndSunnahGoverned: true,
    humanAuthority: true,
    noDuplication: true,
    noUnsafeArchitectureDrift: true
  },
  timestamp: new Date().toISOString()
};

const report = path.join(reportDir, `blueprint-guard-${Date.now()}.json`);
fs.writeFileSync(report, JSON.stringify(result, null, 2) + '\n');

console.log(JSON.stringify(result, null, 2));

if (!result.success) {
  console.error(`\nBLOCKED: review report ${report}`);
  process.exit(1);
}
