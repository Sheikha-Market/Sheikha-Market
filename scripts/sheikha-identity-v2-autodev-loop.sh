#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

unset npm_config_prefix NPM_CONFIG_PREFIX || true

while true; do
  node scripts/sheikha-identity-v2-autodev.js --apply
  sleep 21600
done
