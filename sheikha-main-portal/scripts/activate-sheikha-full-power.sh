#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

mode="apply"
cloud_apply="false"

for arg in "$@"; do
    case "$arg" in
        --plan)
            mode="plan"
            ;;
        --apply)
            mode="apply"
            ;;
        --cloud-apply)
            cloud_apply="true"
            ;;
        *)
            ;;
    esac
done

print_plan() {
    cat <<'EOF'
[Sheikha] Full Power Plan
1) Preflight analysis (ops:activation:analyze)
2) Security activation (scripts/activate-sheikha-secure.sh)
3) Full AI power bootstrap (scripts/sheikha-full-ai-power.sh)
4) Optional cloud apply hooks (when --cloud-apply is set)
EOF
}

if [[ "$mode" == "plan" ]]; then
    print_plan
    exit 0
fi

echo "==> [Sheikha] Full Power Apply"

echo "==> [1/4] Preflight analysis"
if [[ -f "scripts/pre-activation-analysis.js" ]]; then
    npm run -s ops:activation:analyze || true
else
    echo "⚠️ pre-activation-analysis.js غير موجود — تم التجاوز بأمان"
fi

echo "==> [2/4] Security activation"
bash scripts/activate-sheikha-secure.sh || true

echo "==> [3/4] Full AI power bootstrap"
bash scripts/sheikha-full-ai-power.sh

if [[ "$cloud_apply" == "true" ]]; then
    echo "==> [4/4] Cloud apply hooks"
    npm run -s ops:gcloud:alliance:apply || true
else
    echo "==> [4/4] Cloud apply hooks skipped"
fi

echo "✅ [Sheikha] Full Power Apply complete"
