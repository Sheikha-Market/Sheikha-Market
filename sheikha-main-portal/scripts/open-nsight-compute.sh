#!/usr/bin/env bash
set -euo pipefail

# محاولة فتح Nsight Compute بمرونة بين توزيعات لينكس المختلفة.
if command -v ncu-ui >/dev/null 2>&1; then
    exec ncu-ui
fi

if command -v nsight-compute >/dev/null 2>&1; then
    exec nsight-compute
fi

if command -v nv-nsight-cu >/dev/null 2>&1; then
    exec nv-nsight-cu
fi

for p in /usr/local/cuda/bin/ncu-ui /usr/local/NVIDIA-Nsight-Compute/*/ncu-ui; do
    if [ -x "$p" ]; then
        exec "$p"
    fi
done

echo "Nsight Compute غير موجود في PATH."
echo "ثبّته من NVIDIA Developer أو أضف المسار إلى PATH."
exit 1
