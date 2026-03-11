#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

source "$HOME/.nvm/nvm.sh" >/dev/null 2>&1 || true
nvm use 25.6.1 >/dev/null 2>&1 || true

TS="$(date +%Y%m%d-%H%M%S)"
OUT_DIR="$ROOT_DIR/reports/performance/$TS"
mkdir -p "$OUT_DIR"

echo "==> [Baseline] output: $OUT_DIR"

# 1) CUDA baseline
if [ -f "$ROOT_DIR/scripts/vscode-cuda-verify.sh" ]; then
    bash "$ROOT_DIR/scripts/vscode-cuda-verify.sh" >"$OUT_DIR/cuda-verify.txt" 2>&1 || true
fi

# 2) API baseline
curl -sS -m 30 http://127.0.0.1:8080/api/cuda/verify >"$OUT_DIR/api-cuda-verify.json" || true
curl -sS -m 30 http://127.0.0.1:8080/api/nvidia-cuda/capabilities >"$OUT_DIR/api-nvidia-capabilities.json" || true

# 3) Quick latency sample (10 calls)
for i in $(seq 1 10); do
    curl -sS -o /dev/null -w "%{time_total}\n" -m 15 http://127.0.0.1:8080/api/sheikha/status || echo "timeout"
done >"$OUT_DIR/status-latency-seconds.txt"

# 4) Optional Nsight Systems snapshot
if command -v nsys >/dev/null 2>&1; then
    PY_BIN="${SHEIKHA_CUDA_PYTHON:-python3}"
    nsys profile --sample=none --trace=cuda,nvtx,osrt --force-overwrite=true \
        --output "$OUT_DIR/nsys-baseline" \
        "$PY_BIN" "$ROOT_DIR/scripts/cuda-verify.py" >/dev/null 2>&1 || true
fi

echo "done" >"$OUT_DIR/_SUCCESS"
echo "✅ Baseline generated: $OUT_DIR"
