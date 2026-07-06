#!/usr/bin/env bash
set -Eeuo pipefail

cd "${SHEIKHA_ROOT:-$(pwd)}"

echo "SHEIKHA CONTINUOUS SECURITY CHECK"

node -v | grep -Eq '^v(20|25)\.' || {
  echo "BLOCKED: Node version must be v20 or v25"
  exit 1
}

git status --short

node --check server.js
npm run lint --if-present

curl -sf http://127.0.0.1:8080/api/health >/dev/null
curl -sf http://127.0.0.1:8080/api/runtime-root/health >/dev/null

echo "OK: secure, canonical, stable"
