#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const OUTPUT = path.join(ROOT, 'runtime/commercial-readiness/v2/dependency-audit-summary.json');
const result = spawnSync('npm', ['audit', '--audit-level=moderate', '--json'], {
  cwd: ROOT,
  encoding: 'utf8',
  timeout: 120000,
  maxBuffer: 32 * 1024 * 1024,
});
if (!result.stdout) throw new Error(`NPM_AUDIT_NO_OUTPUT:${result.status}`);
const audit = JSON.parse(result.stdout);
const counts = audit.metadata?.vulnerabilities || {};
const base = {
  system: 'SHEIKHA_COMMERCIAL_DEPENDENCY_AUDIT_SUMMARY_V2',
  checkedAt: new Date().toISOString(),
  auditExitCode: result.status,
  counts: {
    info: Number(counts.info || 0),
    low: Number(counts.low || 0),
    moderate: Number(counts.moderate || 0),
    high: Number(counts.high || 0),
    critical: Number(counts.critical || 0),
    total: Number(counts.total || 0),
  },
  productionReleaseAllowed: Number(counts.high || 0) === 0 && Number(counts.critical || 0) === 0,
};
const report = { ...base, sha256: crypto.createHash('sha256').update(JSON.stringify(base)).digest('hex') };
fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
process.stdout.write(`${JSON.stringify({ ...report, output: OUTPUT }, null, 2)}\n`);
