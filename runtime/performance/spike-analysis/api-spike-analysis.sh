#!/usr/bin/env bash
set -euo pipefail

OUT="runtime/performance/reports/api-spike-analysis-$(date +%Y%m%d-%H%M%S).json"
API_URL="http://127.0.0.1:8080/api/runtime/health"
TMP="$(mktemp)"

for i in {1..30}; do
  ts="$(date -Iseconds)"
  api_ms=$(curl -o /dev/null -s -w '%{time_total}' "$API_URL" | awk '{printf "%.3f", $1*1000}')
  load="$(cat /proc/loadavg | awk '{print $1","$2","$3}')"
  mem="$(free -m | awk '/Mem:/ {print $3","$4","$7}')"
  pm2="$(pm2 jlist | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const a=JSON.parse(d);const p=a.find(x=>x.name&&x.name.includes('sheikha-main'));console.log(p?Math.round(p.monit.memory/1024/1024):0)})")"
  echo "{\"t\":\"$ts\",\"apiMs\":$api_ms,\"load\":\"$load\",\"mem\":\"$mem\",\"pm2MB\":$pm2}" >> "$TMP"
  sleep 1
done

node - "$TMP" "$OUT" <<'NODE'
const fs = require('fs');
const input = fs.readFileSync(process.argv[2],'utf8').trim().split('\n').map(JSON.parse);
const out = process.argv[3];
const vals = input.map(x=>x.apiMs);
const avg = vals.reduce((a,b)=>a+b,0)/vals.length;
const max = Math.max(...vals);
const min = Math.min(...vals);
const spikes = input.filter(x=>x.apiMs > 10);
const report = {
  report: "SHEIKHA_API_SPIKE_ANALYSIS",
  status: "COMPLETE",
  runs: input.length,
  apiMs: {
    average: Number(avg.toFixed(3)),
    min,
    max
  },
  spikeThresholdMs: 10,
  spikeCount: spikes.length,
  spikes,
  decision: spikes.length === 0 && avg <= 2.5 ? "LATENCY_STABLE" : "SPIKES_REQUIRE_OPTIMIZATION"
};
fs.writeFileSync(out, JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
NODE

rm -f "$TMP"
