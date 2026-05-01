#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "============================================================"
echo "SHEIKHA GO-LIVE READINESS CHECK"
echo "============================================================"

source "$HOME/.nvm/nvm.sh" >/dev/null 2>&1 || true

if command -v nvm >/dev/null 2>&1; then
    nvm exec 25.6.1 npm run -s dev:vscode:doctor
    nvm exec 25.6.1 npm run -s ops:readiness
    nvm exec 25.6.1 npm run -s ops:auth:readiness
else
    npm run -s dev:vscode:doctor
    npm run -s ops:readiness
    npm run -s ops:auth:readiness
fi

echo "------------------------------------------------------------"
echo "Live endpoint checks"
echo "------------------------------------------------------------"

curl -sS -m 20 http://127.0.0.1:8080/api/health || true
echo
curl -sS -m 20 http://127.0.0.1:8080/api/sheikha/status || true
echo

if command -v lsof >/dev/null 2>&1; then
    lsof -i :8080 -sTCP:LISTEN -Pn || true
elif command -v ss >/dev/null 2>&1; then
    ss -ltnp '( sport = :8080 )' || true
fi

echo "============================================================"
echo "GO-LIVE CHECK COMPLETE"
echo "============================================================"
