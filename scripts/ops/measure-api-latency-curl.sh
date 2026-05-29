#!/usr/bin/env bash
set -euo pipefail

URL="${1:-http://127.0.0.1:8080/api/health}"
RUNS="${2:-500}"

TMP="$(mktemp)"
SORTED="$(mktemp)"
trap 'rm -f "$TMP" "$SORTED"' EXIT

for i in $(seq 1 "$RUNS"); do
  curl -s -o /dev/null -w "%{time_total}\n" "$URL" | awk '{printf "%.6f\n", $1*1000}' >> "$TMP"
done

sort -n "$TMP" > "$SORTED"

AVG="$(awk '{sum+=$1} END {printf "%.3f", sum/NR}' "$SORTED")"
MIN="$(head -n 1 "$SORTED")"
MAX="$(tail -n 1 "$SORTED")"
P95_LINE=$(( RUNS * 95 / 100 ))
P99_LINE=$(( RUNS * 99 / 100 ))
P95="$(sed -n "${P95_LINE}p" "$SORTED")"
P99="$(sed -n "${P99_LINE}p" "$SORTED")"
SPIKES="$(awk '$1>10 {c++} END {print c+0}' "$SORTED")"

cat <<JSON
{
  "runs": $RUNS,
  "averageApiMs": $AVG,
  "minApiMs": $MIN,
  "p95ApiMs": $P95,
  "p99ApiMs": $P99,
  "maxApiMs": $MAX,
  "spikesAbove10ms": $SPIKES
}
JSON
