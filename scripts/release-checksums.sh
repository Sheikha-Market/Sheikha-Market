#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_FILE="${ROOT_DIR}/release-checksums.sha256"

cd "${ROOT_DIR}"

sha256sum \
  package.json \
  package-lock.json \
  server.js \
  config/config.js \
  scripts/install.sh \
  scripts/uninstall.sh \
  scripts/build-deb.sh \
  > "${OUT_FILE}"

echo "✅ checksums generated: ${OUT_FILE}"
