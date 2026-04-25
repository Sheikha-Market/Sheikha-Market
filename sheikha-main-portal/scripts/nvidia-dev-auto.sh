#!/usr/bin/env bash

set -euo pipefail
umask 077

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
PROFILE_SCRIPT="${PROJECT_ROOT}/scripts/cuda-profile.py"
PROTECT_SCRIPT="${PROJECT_ROOT}/scripts/nvidia-cuda-protect.js"
PYTHON_BIN="${SHEIKHA_CUDA_PYTHON:-/home/sheikha/codex/venv/bin/python3}"
TS="$(date +%Y%m%d-%H%M%S)"

mkdir -p "${REPORT_DIR}"
chmod 700 "${REPORT_DIR}" >/dev/null 2>&1 || true

echo "==> [NVIDIA] Project root: ${PROJECT_ROOT}"
echo "==> [NVIDIA] Report dir: ${REPORT_DIR}"
echo "==> [NVIDIA] Python: ${PYTHON_BIN}"

if [[ ! -f "${VERIFY_SCRIPT}" ]]; then
    echo "❌ سكربت التحقق غير موجود: ${VERIFY_SCRIPT}"
    exit 1
fi

if [[ ! -f "${PROFILE_SCRIPT}" ]]; then
    echo "❌ سكربت الـ profiling غير موجود: ${PROFILE_SCRIPT}"
    exit 1
fi

if [[ ! -x "${PYTHON_BIN}" ]]; then
    echo "❌ مسار Python غير قابل للتنفيذ: ${PYTHON_BIN}"
    echo "   عدّل SHEIKHA_CUDA_PYTHON في .env"
    exit 1
fi

if [[ ! -f "${PROTECT_SCRIPT}" ]]; then
    echo "❌ سكربت حماية NVIDIA/CUDA غير موجود: ${PROTECT_SCRIPT}"
    exit 1
fi

echo "==> [IP/Encryption] NVIDIA/CUDA protection"
node "${PROTECT_SCRIPT}" --mode="${MODE}" --report-dir="${REPORT_DIR}"

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
    local ncu_home="${REPORT_DIR}/.ncu-home"
    local ncu_log="${REPORT_DIR}/ncu-cuda-verify-${TS}.log"
    local section_dir=""
    local ncu_status=0
    if [[ -d "/usr/lib/nsight-compute/sections" ]]; then
        section_dir="/usr/lib/nsight-compute/sections"
    elif [[ -d "/usr/lib/x86_64-linux-gnu/nsight-compute/sections" ]]; then
        section_dir="/usr/lib/x86_64-linux-gnu/nsight-compute/sections"
    fi
    mkdir -p "${ncu_home}/Documents/NVIDIA Nsight Compute/2021.3.1/Sections" >/dev/null 2>&1 || true
    echo "==> [Nsight Compute] Profiling..."
    if [[ -n "${section_dir}" ]]; then
        HOME="${ncu_home}" ncu \
            --target-processes all \
            --set full \
            --force-overwrite \
            --section-folder-recursive "${section_dir}" \
            --export "${out}" \
            "${PYTHON_BIN}" "${PROFILE_SCRIPT}" >"${ncu_log}" 2>&1 || ncu_status=$?
    else
        HOME="${ncu_home}" ncu \
        --target-processes all \
        --set full \
        --force-overwrite \
        --export "${out}" \
        "${PYTHON_BIN}" "${PROFILE_SCRIPT}" >"${ncu_log}" 2>&1 || ncu_status=$?
    fi

    if [[ ${ncu_status} -ne 0 ]]; then
        if grep -q 'API call is not supported in the installed CUDA driver' "${ncu_log}"; then
            echo "⚠️ تم تجاوز Nsight Compute: تعريف CUDA الحالي لا يدعم جلسة profiling هذه (Error 36)."
            echo "   راجع: ${ncu_log}"
            return 0
        fi

        if grep -q 'No kernels were profiled' "${ncu_log}"; then
            echo "⚠️ تم تجاوز Nsight Compute: لم يتم رصد أي kernel CUDA في هذه الجلسة."
            echo "   راجع: ${ncu_log}"
            return 0
        fi

        echo "⚠️ فشل Nsight Compute في هذه الجلسة (قد لا توجد kernels كافية أو صلاحيات GPU)."
        echo "   راجع: ${ncu_log}"
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
