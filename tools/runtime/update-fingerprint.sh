#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT_DIR"

files=("server.js" "ecosystem.config.js" ".env.runtime.example")
{
  echo "# sha256 fingerprint for baseline runtime files"
  for f in "${files[@]}"; do
    if [[ -f "$f" ]]; then
      sha256sum "$f"
    fi
  done
} > .runtime-fingerprint

echo "Updated .runtime-fingerprint"
