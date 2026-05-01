#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
VERIFY_SCRIPT="${ROOT_DIR}/scripts/cuda-verify.py"

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

    if [ -z "$py" ]; then
        echo "ERROR: no python interpreter found"
        exit 1
    fi

    echo "$py"
}

PY_BIN="$(pick_python)"
export SHEIKHA_CUDA_PYTHON="$PY_BIN"

# Ensure torch + numpy exist in the exact interpreter used by VS Code task.
"$PY_BIN" -m pip install -q --upgrade pip >/dev/null 2>&1 || true
"$PY_BIN" -m pip install -q numpy >/dev/null 2>&1 || true
"$PY_BIN" -m pip install -q torch --index-url https://download.pytorch.org/whl/cu121 >/dev/null 2>&1 || true

"$PY_BIN" "$VERIFY_SCRIPT" || true
