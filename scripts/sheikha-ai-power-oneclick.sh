#!/usr/bin/env bash
set -euo pipefail

# One-click activation:
# - Node env + PM2 start
# - CUDA verify
# - API verify
# - Nsight Systems profile (optional, quick)
# - Nsight Compute profile (best effort for old package layout)

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> [Sheikha] One-click AI power activation"
echo "==> [Sheikha] Root: $ROOT_DIR"

source "$HOME/.nvm/nvm.sh" >/dev/null 2>&1 || true
nvm use 25.6.1 >/dev/null 2>&1 || true

# تحميل متغيرات البيئة المحلية بشكل آمن دون تنفيذ أوامر من .env
load_env_file() {
    local env_file="$1"
    [ -f "$env_file" ] || return 0

    while IFS= read -r line || [ -n "$line" ]; do
        [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
        [[ "$line" =~ ^[A-Za-z_][A-Za-z0-9_]*= ]] || continue
        export "$line"
    done < "$env_file"
}

load_env_file "$ROOT_DIR/.env"

# VS Code tasks sometimes use a minimal PATH.
export PATH="/usr/local/bin:/usr/bin:/bin:$PATH"

pick_python() {
    local candidates=(
        "${SHEIKHA_CUDA_PYTHON:-}"
        "${SHEIKHA_VENV_PYTHON:-}"
        "/home/sheikha/codex/venv/bin/python3"
        "/home/sheikha/codex/venv/bin/python"
        "python3"
        "python"
    )
    local py=""
    for c in "${candidates[@]}"; do
        [ -z "$c" ] && continue
        if command -v "$c" >/dev/null 2>&1; then
            py="$(command -v "$c")"
            break
        elif [ -x "$c" ]; then
            py="$c"
            break
        fi
    done
    echo "$py"
}

PY_BIN="$(pick_python)"
VERIFY_SCRIPT="$ROOT_DIR/scripts/cuda-verify.py"

if [ -z "$PY_BIN" ] || [ ! -x "$PY_BIN" ]; then
    echo "❌ Python not executable: $PY_BIN"
    exit 1
fi

if [ ! -f "$VERIFY_SCRIPT" ]; then
    echo "❌ Verify script missing: $VERIFY_SCRIPT"
    exit 1
fi

echo "==> [Python] using: $PY_BIN"

# Ensure CUDA verify dependencies exist in the interpreter used by this script.
if ! "$PY_BIN" -c "import torch, numpy" >/dev/null 2>&1; then
    echo "==> [Python] installing torch/numpy for selected interpreter"
    "$PY_BIN" -m pip install -q --upgrade pip >/dev/null 2>&1 || true
    "$PY_BIN" -m pip install -q numpy >/dev/null 2>&1 || true
    "$PY_BIN" -m pip install -q torch --index-url https://download.pytorch.org/whl/cu121 >/dev/null 2>&1 || true
fi

echo "==> [PM2] ensure single API owner on :8080"
npx pm2 delete sheikha-main-portal >/dev/null 2>&1 || true
if npx pm2 describe sheikha-api >/dev/null 2>&1; then
    npx pm2 restart sheikha-api --update-env >/dev/null 2>&1 || true
else
    npx pm2 start ecosystem.config.js --only sheikha-api >/dev/null 2>&1 || true
fi
npx pm2 save >/dev/null 2>&1 || true

echo "==> [CUDA] verify"
"$PY_BIN" "$VERIFY_SCRIPT" || true

echo "==> [API] verify"
curl -sS -m 30 http://127.0.0.1:8080/api/cuda/verify >/tmp/sheikha-cuda-verify.json || true
curl -sS -m 30 http://127.0.0.1:8080/api/nvidia-cuda/capabilities >/tmp/sheikha-nvidia-cap.json || true
echo "CUDA verify saved: /tmp/sheikha-cuda-verify.json"
echo "NVIDIA capabilities saved: /tmp/sheikha-nvidia-cap.json"

TS="$(date +%Y%m%d-%H%M%S)"
REPORT_DIR="$ROOT_DIR/reports/nvidia"
mkdir -p "$REPORT_DIR"

if command -v nsys >/dev/null 2>&1; then
    echo "==> [Nsight Systems] quick profile"
    nsys profile --sample=none --trace=cuda,nvtx,osrt --force-overwrite=true \
        --output "$REPORT_DIR/nsys-cuda-verify-$TS" \
        "$PY_BIN" "$VERIFY_SCRIPT" >/dev/null 2>&1 || true
    echo "Nsight Systems report: $REPORT_DIR/nsys-cuda-verify-$TS.qdrep"
else
    echo "⚠️ nsys not found"
fi

if command -v ncu >/dev/null 2>&1; then
    echo "==> [Nsight Compute] best-effort profile"
    NCU_SECTION_DIR="/usr/lib/x86_64-linux-gnu/nsight-compute/sections"
    if [ ! -d "$NCU_SECTION_DIR" ]; then
        NCU_SECTION_DIR="/usr/lib/x86_64-linux-gnu/nsight-compute/target/linux-desktop-glibc_2_11_3-x64/sections"
    fi
    if [ -d "$NCU_SECTION_DIR" ]; then
        ncu --section-folder-recursive "$NCU_SECTION_DIR" --target-processes all --set full --force-overwrite \
            --export "$REPORT_DIR/ncu-cuda-verify-$TS" \
            "$PY_BIN" "$VERIFY_SCRIPT" >/dev/null 2>&1 || true
        echo "Nsight Compute report: $REPORT_DIR/ncu-cuda-verify-$TS.ncu-rep"
    else
        echo "⚠️ ncu sections dir not found (older package), skipped"
    fi
else
    echo "⚠️ ncu not found"
fi

echo "✅ [Sheikha] One-click activation finished"
