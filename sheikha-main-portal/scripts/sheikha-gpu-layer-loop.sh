#!/usr/bin/env bash
set -euo pipefail

INTERVAL="${SHEIKHA_GPU_LAYER_INTERVAL_SEC:-600}"

while true; do
    bash scripts/nvidia-dev-auto.sh || true
    sleep "$INTERVAL"
done
