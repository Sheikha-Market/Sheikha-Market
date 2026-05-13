#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT_DIR"

OUT_DIR="data/runtime-metrics"
mkdir -p "$OUT_DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT_FILE="$OUT_DIR/metrics-${STAMP}.json"

HEALTH="$(curl -sS http://127.0.0.1:8080/api/health 2>/dev/null || echo '{"error":"health-unavailable"}')"
RUNTIME="$(curl -sS http://127.0.0.1:8080/api/runtime 2>/dev/null || echo '{"error":"runtime-unavailable"}')"

node - <<'NODE' "$OUT_FILE" "$HEALTH" "$RUNTIME"
const fs = require('fs');
const out = process.argv[2];
const healthRaw = process.argv[3];
const runtimeRaw = process.argv[4];

let health, runtime;
try { health = JSON.parse(healthRaw); } catch { health = { parseError: true, raw: healthRaw }; }
try { runtime = JSON.parse(runtimeRaw); } catch { runtime = { parseError: true, raw: runtimeRaw }; }

const payload = {
  timestamp: new Date().toISOString(),
  process: {
    pid: process.pid,
    uptimeSeconds: Math.floor(process.uptime()),
    memory: process.memoryUsage()
  },
  health,
  runtime
};

fs.writeFileSync(out, JSON.stringify(payload, null, 2));
console.log(out);
NODE

echo "[runtime-metrics] wrote $OUT_FILE"
