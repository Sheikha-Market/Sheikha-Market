#!/usr/bin/env bash
set -euo pipefail

OUT="runtime/performance/reports/ten-run-decision-$(date +%Y%m%d-%H%M%S).json"
TMP="$(mktemp)"

for i in {1..10}; do
  ./runtime/performance/benchmarks/sheikha-fast-benchmark.sh | tee -a "$TMP" >/dev/null
  sleep 1
done

node - "$TMP" "$OUT" <<'NODE'
const fs = require('fs');
const input = fs.readFileSync(process.argv[2], 'utf8');
const out = process.argv[3];

const rows = input
  .split(/\n(?=\{)/)
  .map(x => x.trim())
  .filter(Boolean)
  .map(x => JSON.parse(x));

const avg = k => rows.reduce((s, r) => s + Number(r[k] || 0), 0) / rows.length;
const min = k => Math.min(...rows.map(r => Number(r[k] || 0)));
const max = k => Math.max(...rows.map(r => Number(r[k] || 0)));

const summary = {
  report: 'SHEIKHA_TEN_RUN_PERFORMANCE_DECISION',
  status: 'COMPLETE',
  runs: rows.length,
  averages: {
    apiHealthMs: Number(avg('apiHealthMs').toFixed(3)),
    directApiMs: Number(avg('directApiMs').toFixed(3)),
    cpuLoopMs: Number(avg('cpuLoopMs').toFixed(3)),
    pm2MemoryMB: Number(avg('pm2MemoryMB').toFixed(3))
  },
  min: {
    apiHealthMs: min('apiHealthMs'),
    directApiMs: min('directApiMs'),
    cpuLoopMs: min('cpuLoopMs')
  },
  max: {
    apiHealthMs: max('apiHealthMs'),
    directApiMs: max('directApiMs'),
    cpuLoopMs: max('cpuLoopMs')
  },
  targets: {
    apiHealthMsMax: 1.5,
    cpuLoopMsMax: 40,
    memoryMBMax: 180
  }
};

summary.decision =
  summary.averages.apiHealthMs <= 1.5 &&
  summary.averages.cpuLoopMs <= 40 &&
  summary.averages.pm2MemoryMB <= 180
    ? 'PROMOTION_READY'
    : 'NEAR_PROMOTION_READY_OPTIMIZE_FIRST';

fs.writeFileSync(out, JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
NODE

rm -f "$TMP"
