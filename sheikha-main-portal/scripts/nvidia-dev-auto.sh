#!/usr/bin/env bash

set -euo pipefail

# تكامل آلي لـ NVIDIA Nsight Systems + Nsight Compute مع مشروع شيخة.
# الاستخدام:
#   bash scripts/nvidia-dev-auto.sh
#   bash scripts/nvidia-dev-auto.sh --nsys
#   bash scripts/nvidia-dev-auto.sh --ncu

MODE="all"
if [[ "${1:-}" == "--nsys" ]]; then
    MODE="nsys"
elif [[ "${1:-}" == "--ncu" ]]; then
    MODE="ncu"
fi

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPORT_DIR="${PROJECT_ROOT}/reports/nvidia"
VERIFY_SCRIPT="${PROJECT_ROOT}/scripts/cuda-verify.py"
PYTHON_BIN="${SHEIKHA_CUDA_PYTHON:-/home/sheikha/codex/venv/bin/python3}"
TS="$(date +%Y%m%d-%H%M%S)"

mkdir -p "${REPORT_DIR}"

echo "==> [NVIDIA] Project root: ${PROJECT_ROOT}"
echo "==> [NVIDIA] Report dir: ${REPORT_DIR}"
echo "==> [NVIDIA] Python: ${PYTHON_BIN}"

if [[ ! -f "${VERIFY_SCRIPT}" ]]; then
    echo "❌ سكربت التحقق غير موجود: ${VERIFY_SCRIPT}"
    exit 1
fi

if [[ ! -x "${PYTHON_BIN}" ]]; then
    echo "❌ مسار Python غير قابل للتنفيذ: ${PYTHON_BIN}"
    echo "   عدّل SHEIKHA_CUDA_PYTHON في .env"
    exit 1
fi

echo "==> [CUDA] تحقق أولي"
"${PYTHON_BIN}" "${VERIFY_SCRIPT}" || true

run_nsys() {
    if ! command -v nsys >/dev/null 2>&1; then
        echo "⚠️ nsys غير موجود في PATH — تخطي Nsight Systems"
        return 0
    fi
    local out="${REPORT_DIR}/nsys-cuda-verify-${TS}"
    echo "==> [Nsight Systems] Profiling..."
    if ! nsys profile \
        --sample=none \
        --trace=cuda,nvtx,osrt \
        --force-overwrite=true \
        --output "${out}" \
        "${PYTHON_BIN}" "${VERIFY_SCRIPT}"; then
        echo "⚠️ فشل Nsight Systems في هذه الجلسة (قد يكون بسبب صلاحيات/بيئة GPU)."
        return 0
    fi
    echo "✅ [Nsight Systems] تم الحفظ: ${out}.qdrep"
}

run_ncu() {
    if ! command -v ncu >/dev/null 2>&1; then
        echo "⚠️ ncu غير موجود في PATH — تخطي Nsight Compute"
        return 0
    fi
    local out="${REPORT_DIR}/ncu-cuda-verify-${TS}"
    local section_dir=""
    if [[ -d "/usr/lib/nsight-compute/sections" ]]; then
        section_dir="/usr/lib/nsight-compute/sections"
    elif [[ -d "/usr/lib/x86_64-linux-gnu/nsight-compute/sections" ]]; then
        section_dir="/usr/lib/x86_64-linux-gnu/nsight-compute/sections"
    fi
    mkdir -p "${HOME}/Documents/NVIDIA Nsight Compute/2021.3.1/Sections" >/dev/null 2>&1 || true
    echo "==> [Nsight Compute] Profiling..."
    if [[ -n "${section_dir}" ]]; then
        if ! ncu \
            --target-processes all \
            --set full \
            --force-overwrite \
            --section-folder-recursive "${section_dir}" \
            --export "${out}" \
            "${PYTHON_BIN}" "${VERIFY_SCRIPT}"; then
            echo "⚠️ فشل Nsight Compute في هذه الجلسة (قد لا توجد kernels كافية أو صلاحيات GPU)."
            return 0
        fi
    elif ! ncu \
        --target-processes all \
        --set full \
        --force-overwrite \
        --export "${out}" \
        "${PYTHON_BIN}" "${VERIFY_SCRIPT}"; then
        echo "⚠️ فشل Nsight Compute في هذه الجلسة (قد لا توجد kernels كافية أو صلاحيات GPU)."
        return 0
    fi
    echo "✅ [Nsight Compute] تم الحفظ: ${out}.ncu-rep"
}

case "${MODE}" in
    nsys)
        run_nsys
        ;;
    ncu)
        run_ncu
        ;;
    *)
        run_nsys
        run_ncu
        ;;
esac

echo "✅ اكتمل التكامل الآلي لأدوات NVIDIA."
