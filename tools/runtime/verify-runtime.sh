#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT_DIR"

echo "[runtime-verify] branch: $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)"
echo "[runtime-verify] node: $(node -v 2>/dev/null || echo missing)"
echo "[runtime-verify] pm2: $(pm2 -v 2>/dev/null || echo missing)"

echo "[runtime-verify] endpoint health:"
curl -sS http://127.0.0.1:8080/api/health || true

echo

echo "[runtime-verify] endpoint runtime:"
curl -sS http://127.0.0.1:8080/api/runtime || true

echo

echo "[runtime-verify] done"
