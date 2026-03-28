#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERIFY_SCRIPT="$ROOT_DIR/scripts/cuda-verify.py"

ok_count=0
warn_count=0

ok() {
    echo "[OK] $1"
    ok_count=$((ok_count + 1))
}

warn() {
    echo "[WARN] $1"
    warn_count=$((warn_count + 1))
}

echo "=== SHEIKHA GPU READINESS ==="

if command -v nvidia-smi >/dev/null 2>&1; then
    if nvidia-smi >/dev/null 2>&1; then
        ok "nvidia-smi available"
    else
        warn "nvidia-smi موجود لكن السائق غير سليم أو غير متوافق"
    fi
else
    warn "nvidia-smi غير موجود: لا يوجد GPU driver tooling"
fi

if command -v nvcc >/dev/null 2>&1; then
    ok "nvcc available"
else
    warn "nvcc غير موجود: CUDA toolkit غير مكتمل"
fi

if ls /dev/nvidia0 >/dev/null 2>&1; then
    ok "/dev/nvidia0 exists"
else
    warn "جهاز /dev/nvidia0 غير متاح داخل البيئة"
fi

if command -v python3 >/dev/null 2>&1; then
    if python3 "$VERIFY_SCRIPT" >/tmp/sheikha-gpu-readiness.log 2>&1; then
        ok "cuda-verify.py passed"
    else
        warn "cuda-verify.py failed (راجع /tmp/sheikha-gpu-readiness.log)"
    fi
else
    warn "python3 غير متاح للتحقق من torch/cuda"
fi

echo "--------------------------------"
echo "ok=${ok_count} warn=${warn_count}"

if [[ "$warn_count" -eq 0 ]]; then
    echo "GPU_READY=true"
    exit 0
fi

echo "GPU_READY=false"
echo "السبب الجذري: بيئة التشغيل لا توفر طبقة NVIDIA/CUDA كاملة بشكل مستقر (driver + device + toolkit + runtime)."
exit 1
