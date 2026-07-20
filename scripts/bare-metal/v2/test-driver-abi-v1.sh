#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
BINARY="${TMPDIR:-/tmp}/sheikha-driver-abi-v1-smoke-${UID}"

gcc \
  -std=c11 \
  -Wall \
  -Wextra \
  -Werror \
  -I "${ROOT_DIR}/bare-metal/include" \
  "${ROOT_DIR}/bare-metal/hal/sheikha_driver_abi_v1_smoke.c" \
  -o "${BINARY}"

"${BINARY}"
printf '%s\n' 'SHEIKHA_DRIVER_ABI_V1_SMOKE_OK'
node \
  "${ROOT_DIR}/bare-metal/build/sheikha-driver-abi-v1-evidence.js" \
  'SHEIKHA_DRIVER_ABI_V1_SMOKE_OK' >/dev/null
