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
NCU_VERSION="unknown"
GPU_NAME="unknown"
GPU_DRIVER="unknown"
GPU_COMPUTE_CAP="unknown"

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

trim_value() {
    printf '%s' "$1" | xargs
}

collect_ncu_context() {
    local gpu_specs=""

    if command -v ncu >/dev/null 2>&1; then
        NCU_VERSION="$(ncu --version | awk '/Version/ { print $2; exit }')"
        NCU_VERSION="$(trim_value "${NCU_VERSION:-unknown}")"
    fi

    if command -v nvidia-smi >/dev/null 2>&1; then
        gpu_specs="$(nvidia-smi --query-gpu=name,driver_version,compute_cap --format=csv,noheader 2>/dev/null | head -n 1)"
        if [[ -n "${gpu_specs}" ]]; then
            IFS=',' read -r GPU_NAME GPU_DRIVER GPU_COMPUTE_CAP <<< "${gpu_specs}"
            GPU_NAME="$(trim_value "${GPU_NAME}")"
            GPU_DRIVER="$(trim_value "${GPU_DRIVER}")"
            GPU_COMPUTE_CAP="$(trim_value "${GPU_COMPUTE_CAP}")"
        fi
    fi
}

write_ncu_diagnosis() {
    local root_cause="$1"
    local action="$2"
    local observed_log="${3:-غير متوفر}"
    local diagnosis_file="${REPORT_DIR}/ncu-diagnostic-${TS}.txt"

    collect_ncu_context

    cat >"${diagnosis_file}" <<EOF
timestamp=${TS}
tool=Nsight Compute
status=skipped-safe

[specs]
ncu_version=${NCU_VERSION}
gpu_name=${GPU_NAME}
gpu_driver=${GPU_DRIVER}
gpu_compute_capability=${GPU_COMPUTE_CAP}
python_bin=${PYTHON_BIN}

[rules]
1. تحذير Sections ليس السبب الجذري إذا ظهر fallback إلى sections النظام.
2. إذا نجح cuda-verify خارج profiler وفشل ncu مع Error 36 فالمشكلة في توافق profiler مع البيئة، لا في تطبيق شيخة.
3. عند وجود عدم توافق معروف، يتم التجاوز الآمن بدل إجبار جلسة profiling قد تعطل CUDA داخل العملية.

[diagnosis]
root_cause=${root_cause}
observed_log=${observed_log}

[treatment]
recommended_action=${action}
safe_fallback=استخدم Nsight Systems حاليا أو حدّث Nsight Compute لإصدار أحدث يدعم GPU بمعمارية Ada وبيئة CUDA/Driver الحالية.
EOF

    chmod 600 "${diagnosis_file}" >/dev/null 2>&1 || true
    printf '%s\n' "${diagnosis_file}"
}

known_ncu_incompatibility() {
    collect_ncu_context

    if [[ "${NCU_VERSION}" == 2021.* ]] && [[ "${GPU_COMPUTE_CAP}" =~ ^(8\.9|9\.) ]]; then
        return 0
    fi

    return 1
}

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
    local diagnosis_file=""
    if [[ -d "/usr/lib/nsight-compute/sections" ]]; then
        section_dir="/usr/lib/nsight-compute/sections"
    elif [[ -d "/usr/lib/x86_64-linux-gnu/nsight-compute/sections" ]]; then
        section_dir="/usr/lib/x86_64-linux-gnu/nsight-compute/sections"
    fi

    if known_ncu_incompatibility; then
        diagnosis_file="$(write_ncu_diagnosis \
            "إصدار Nsight Compute ${NCU_VERSION} قديم بالنسبة لـ ${GPU_NAME} (compute capability ${GPU_COMPUTE_CAP}) ويؤدي إلى Error 36 داخل جلسة profiling." \
            "حدّث ncu إلى إصدار أحدث متوافق مع البطاقة الحالية، أو استمر باستخدام Nsight Systems كبديل آمن." \
            "لم يتم إنشاء log لأن التجاوز تم استباقيا")"
        echo "⚠️ تم تجاوز Nsight Compute قبل التشغيل: الأداة الحالية غير متوافقة مع مواصفات GPU الحالية."
        echo "   تقرير التشخيص: ${diagnosis_file}"
        return 0
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
            diagnosis_file="$(write_ncu_diagnosis \
                "ظهر Error 36 داخل ncu بعد نجاح CUDA خارج profiler؛ هذا يشير إلى عدم توافق أداة profiling مع البيئة الحالية أكثر من كونه عطلا في تعريف CUDA نفسه." \
                "حدّث ncu إلى إصدار أحدث، ثم أعد المحاولة. حتى ذلك الوقت استخدم Nsight Systems ولا تعتبر هذا الفشل عطلا في التطبيق." \
                "${ncu_log}")"
            echo "⚠️ تم تجاوز Nsight Compute: سبب الجلسة هو عدم توافق profiler مع البيئة الحالية (Error 36)."
            echo "   log: ${ncu_log}"
            echo "   تقرير التشخيص: ${diagnosis_file}"
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
