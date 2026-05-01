#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

TOTAL_MEM_KB="$(awk '/MemTotal/ {print $2}' /proc/meminfo)"
TOTAL_MEM_GB="$((TOTAL_MEM_KB / 1024 / 1024))"

if [[ "$TOTAL_MEM_GB" -ge 64 ]]; then
    NODE_MEM_MB=8192
elif [[ "$TOTAL_MEM_GB" -ge 32 ]]; then
    NODE_MEM_MB=6144
elif [[ "$TOTAL_MEM_GB" -ge 16 ]]; then
    NODE_MEM_MB=4096
else
    NODE_MEM_MB=3072
fi

mkdir -p .vscode

cat > .vscode/settings.performance.generated.json <<EOF
{
    "files.watcherExclude": {
        "**/node_modules/**": true,
        "**/.git/objects/**": true,
        "**/.git/subtree-cache/**": true,
        "**/reports/**": true
    },
    "search.exclude": {
        "**/node_modules": true,
        "**/reports": true,
        "**/server.js.backup*": true
    },
    "typescript.tsserver.maxTsServerMemory": 4096,
    "editor.minimap.enabled": false,
    "extensions.autoUpdate": true,
    "github.copilot.enable": {
        "*": true
    }
}
EOF

if [[ ! -f .env.local ]]; then
    touch .env.local
fi

if grep -q '^NODE_OPTIONS=' .env.local; then
    sed -i "s|^NODE_OPTIONS=.*|NODE_OPTIONS=--max-old-space-size=${NODE_MEM_MB}|" .env.local
else
    echo "NODE_OPTIONS=--max-old-space-size=${NODE_MEM_MB}" >> .env.local
fi

npm config set fund false >/dev/null 2>&1 || true
npm config set audit false >/dev/null 2>&1 || true
npm config set progress false >/dev/null 2>&1 || true
npm config set prefer-offline true >/dev/null 2>&1 || true
npm config set fetch-retries 5 >/dev/null 2>&1 || true

if command -v code >/dev/null 2>&1; then
    code --install-extension GitHub.copilot --force >/dev/null 2>&1 || true
    code --install-extension GitHub.copilot-chat --force >/dev/null 2>&1 || true
fi

echo "============================================================"
echo "SHEIKHA DEV LAPTOP TUNE COMPLETE"
echo "============================================================"
echo "Detected RAM      : ${TOTAL_MEM_GB} GB"
echo "NODE_OPTIONS set  : --max-old-space-size=${NODE_MEM_MB} (.env.local)"
echo "VS Code profile   : .vscode/settings.performance.generated.json"
echo "npm tuning        : fund/audit/progress disabled, prefer-offline enabled"
echo "Next              : source .venv/bin/activate && npm run ops:dev:doctor"
echo "============================================================"
