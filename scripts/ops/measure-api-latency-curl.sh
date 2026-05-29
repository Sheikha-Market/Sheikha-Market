#!/usr/bin/env bash
set -euo pipefail

URL="${1:-http://127.0.0.1:8080/api/health}"
RUNS="${2:-500}"

TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT

for i in $(seq 1 "$RUNS"); do
  curl -s -o /dev/null -w "%{time_total}\n" "$URL" >> "$TMP"
done

awk '
{
  ms=$1*1000
  a[NR]=ms
  sum+=ms
  if (ms>10) spikes++
}
END {
  n=NR
  asort(a)
  p95=a[int(n*0.95)]
  p99=a[int(n*0.99)]
  printf "{\n"
  printf "  \"runs\": %d,\n", n
  printf "  \"averageApiMs\": %.3f,\n", sum/n
  printf "  \"minApiMs\": %.3f,\n", a[1]
  printf "  \"p95ApiMs\": %.3f,\n", p95
  printf "  \"p99ApiMs\": %.3f,\n", p99
  printf "  \"maxApiMs\": %.3f,\n", a[n]
  printf "  \"spikesAbove10ms\": %d\n", spikes+0
  printf "}\n"
}' "$TMP"
