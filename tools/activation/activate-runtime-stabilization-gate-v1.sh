#!/usr/bin/env bash
set -euo pipefail

echo "🧩 SHEIKHA RUNTIME STABILIZATION GATE V1"

mkdir -p runtime/stabilization runtime/engines

echo "1) Capture PM2 diagnostics"
pm2 status > runtime/stabilization/pm2-status.txt || true
pm2 describe sheikha-main-portal > runtime/stabilization/pm2-describe.txt || true
pm2 logs sheikha-main-portal --lines 300 --nostream > runtime/stabilization/pm2-logs.txt || true

echo "2) Detect undefined engines"
grep -E "غير متوفر: .* is not defined|not defined" runtime/stabilization/pm2-logs.txt \
  > runtime/stabilization/undefined-engines.txt || true

echo "3) Detect cron blocking"
grep -E "NODE-CRON.*missed execution|Possible blocking IO|high CPU" runtime/stabilization/pm2-logs.txt \
  > runtime/stabilization/node-cron-blocking.txt || true

echo "4) Detect undefined values"
grep -E "undefined" runtime/stabilization/pm2-logs.txt \
  > runtime/stabilization/undefined-values.txt || true

echo "5) Create runtime stabilization report"
node - <<'NODE' > runtime/stabilization/runtime-stabilization-report.json
const fs = require('fs');

function readLines(file) {
  try {
    return fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean);
  } catch {
    return [];
  }
}

const undefinedEngines = readLines('runtime/stabilization/undefined-engines.txt');
const cronBlocking = readLines('runtime/stabilization/node-cron-blocking.txt');
const undefinedValues = readLines('runtime/stabilization/undefined-values.txt');

const report = {
  system: 'SHEIKHA_RUNTIME_STABILIZATION_GATE_V1',
  status: undefinedEngines.length || cronBlocking.length || undefinedValues.length
    ? 'REVIEW_REQUIRED'
    : 'PASSED',
  checks: {
    undefinedEngines: undefinedEngines.length,
    cronBlocking: cronBlocking.length,
    undefinedValues: undefinedValues.length
  },
  action: {
    undefinedEngines: 'Create engine manifest and align exports/classes with loader names.',
    cronBlocking: 'Move heavy cron jobs outside main runtime or disable them during startup.',
    undefinedValues: 'Fill missing config defaults before production lock.'
  },
  generatedAt: new Date().toISOString()
};

console.log(JSON.stringify(report, null, 2));

if (report.status !== 'PASSED') process.exit(2);
NODE
