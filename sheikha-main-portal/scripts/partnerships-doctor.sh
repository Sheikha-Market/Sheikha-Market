#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "[Sheikha Partnerships Doctor]"
echo "Current dir : $PWD"
echo "Project root: $ROOT_DIR"

if [[ ! -f "$ROOT_DIR/package.json" ]]; then
    echo "ERROR: package.json not found at project root"
    exit 1
fi

if [[ "$PWD" != "$ROOT_DIR" ]]; then
    echo "INFO: You are not in project root."
    echo "Run: cd $ROOT_DIR"
fi

if ! command -v npm >/dev/null 2>&1; then
    echo "ERROR: npm is not installed or not in PATH"
    exit 1
fi

echo
npm run | grep "ops:partnerships" || true

echo
echo "OK: Partnerships scripts are available in this repository."
echo "Use one of:"
echo "  npm run ops:partnerships:activate"
echo "  npm run ops:partnerships:contract:tier1"
echo "  npm run ops:partnerships:all"
