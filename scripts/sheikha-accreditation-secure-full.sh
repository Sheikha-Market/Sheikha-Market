#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

unset npm_config_prefix NPM_CONFIG_PREFIX || true

if [[ ! -f security/keys/sheikha-accreditation-signing-private.pem || ! -f security/keys/sheikha-accreditation-signing-public.pem ]]; then
  node scripts/sheikha-generate-accreditation-keys.js
fi

node scripts/sheikha-prepare-external-accreditation.js
node scripts/sheikha-verify-external-accreditation.js reports/SHEIKHA-EXTERNAL-ACCREDITATION-LATEST.json
