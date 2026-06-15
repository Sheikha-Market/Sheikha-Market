#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$ROOT/tools/activation/sheikha-activation-common-v1.sh"

STRICT_EXTERNAL=false
REQUIRE_CLEAN=false
for argument in "$@"; do
  case "$argument" in
    --strict-external) STRICT_EXTERNAL=true ;;
    --require-clean) REQUIRE_CLEAN=true ;;
    *) echo "Unknown option: $argument" >&2; exit 2 ;;
  esac
done

cd "$SHEIKHA_ROOT"
sheikha_prepare_log verify
sheikha_require_command node
sheikha_require_command npm
sheikha_require_command git
trap sheikha_cleanup_git_context EXIT
sheikha_capture_git_context

VALIDATOR_ARGS=()
[[ "$STRICT_EXTERNAL" == true ]] && VALIDATOR_ARGS+=(--strict-external)

sheikha_run node tools/activation/sheikha-unified-apex-validator-v1.js "${VALIDATOR_ARGS[@]}"
sheikha_run node --check server.js
sheikha_run node --check runtime/civilization-command-intelligence-plane/civilization-command-intelligence-plane-v1.js
sheikha_run node --check runtime/runtime-fabric-v5/runtime-fabric-v5.js
sheikha_run node --check runtime/storage-governance/v1/sheikha-storage-governance-v1.js
sheikha_run node --check routes/storage-governance-routes.js
sheikha_run npm run lint
sheikha_run npm test -- --runInBand
sheikha_capture_git_context
sheikha_run node tools/governance/runtime-integrity-verifier.js
sheikha_run node tools/governance/runtime-admission-controller.js

if [[ "$REQUIRE_CLEAN" == true ]]; then
  sheikha_run node tools/drift/sheikha-runtime-drift-detector.js
else
  sheikha_run node tools/drift/sheikha-runtime-drift-detector.js || true
fi

sheikha_cleanup_git_context
trap - EXIT
sheikha_log "Verification completed. Log: $SHEIKHA_LOG_FILE"
