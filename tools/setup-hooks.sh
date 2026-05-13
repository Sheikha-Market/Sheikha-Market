#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT_DIR"

if [[ ! -f .githooks/pre-commit ]]; then
  echo "Missing .githooks/pre-commit"
  exit 1
fi

if [[ ! -f .githooks/pre-push ]]; then
  echo "Missing .githooks/pre-push"
  exit 1
fi

chmod +x .githooks/pre-commit
chmod +x .githooks/pre-push

git config core.hooksPath .githooks

echo "Hooks path configured: $(git config --get core.hooksPath)"
echo "Done. Tracked reliability hook is now active."
