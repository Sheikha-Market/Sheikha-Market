#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

# تحميل nvm إن كان متاحاً ثم استخدام نسخة المشروع إن وجدت.
if [ -s "$HOME/.nvm/nvm.sh" ]; then
    # shellcheck disable=SC1090
    source "$HOME/.nvm/nvm.sh"
    if [ -f "$ROOT_DIR/../.nvmrc" ]; then
        nvm use >/dev/null 2>&1 || true
    fi
fi

exec node "$ROOT_DIR/sheikha-mcp-server.js"
