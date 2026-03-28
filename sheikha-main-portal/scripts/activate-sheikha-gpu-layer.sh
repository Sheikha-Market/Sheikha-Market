#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! bash scripts/sheikha-gpu-readiness.sh; then
    echo "⚠️  GPU layer not activated: environment is not ready."
    exit 1
fi

pm2 delete sheikha-gpu-layer 2>/dev/null || true
pm2 start bash --name sheikha-gpu-layer -- scripts/sheikha-gpu-layer-loop.sh
pm2 save >/dev/null 2>&1 || true

echo "✅ GPU layer activated in isolated mode (sheikha-gpu-layer)"
