#!/usr/bin/env bash
set -euo pipefail

OUT="runtime/performance/reports/speed-benchmark-$(date +%Y%m%d-%H%M%S).json"

API_URL="http://127.0.0.1:8080/api/runtime/health"

api_ms=$(curl -o /dev/null -s -w '%{time_total}' "$API_URL" | awk '{printf "%.3f", $1*1000}')

cli_start=$(date +%s%N)
sheikha-runtime api-health >/dev/null
cli_end=$(date +%s%N)
cli_ms=$(( (cli_end - cli_start) / 1000000 ))

cpu_start=$(date +%s%N)
node -e "let s=0; for(let i=0;i<5000000;i++) s+=i; console.log(s)" >/dev/null
cpu_end=$(date +%s%N)
cpu_ms=$(( (cpu_end - cpu_start) / 1000000 ))

pm2_mem=$(pm2 jlist | node -e "
let d=''; process.stdin.on('data',c=>d+=c);
process.stdin.on('end',()=> {
 const a=JSON.parse(d);
 const p=a.find(x=>x.name && x.name.includes('sheikha-main'));
 console.log(p ? Math.round(p.monit.memory/1024/1024) : 0);
});
")

cat > "$OUT" <<JSON
{
  "benchmark": "SHEIKHA_RUNTIME_SPEED_BENCHMARK",
  "status": "COMPLETE",
  "apiHealthMs": $api_ms,
  "cliApiHealthMs": $cli_ms,
  "cpuLoopMs": $cpu_ms,
  "pm2MemoryMB": $pm2_mem,
  "timestamp": "$(date -Iseconds)"
}
JSON

cat "$OUT" | jq
