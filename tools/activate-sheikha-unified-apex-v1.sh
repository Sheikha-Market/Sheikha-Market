#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$ROOT/tools/activation/sheikha-activation-common-v1.sh"

RESTART_PM2=false
STRICT_EXTERNAL=false
REQUIRE_CLEAN=false
for argument in "$@"; do
  case "$argument" in
    --restart-pm2) RESTART_PM2=true ;;
    --strict-external) STRICT_EXTERNAL=true ;;
    --require-clean) REQUIRE_CLEAN=true ;;
    *) echo "Unknown option: $argument" >&2; exit 2 ;;
  esac
done

cd "$SHEIKHA_ROOT"
sheikha_prepare_log activate
sheikha_require_command node
sheikha_require_command npm
sheikha_require_command git

sheikha_activation_cleanup() {
  if [[ "$REQUIRE_CLEAN" == true ]]; then
    sheikha_restore_snapshot
  fi
  sheikha_cleanup_git_context
}
trap sheikha_activation_cleanup EXIT

sheikha_capture_git_context

if [[ "$REQUIRE_CLEAN" == true ]]; then
  sheikha_run node tools/drift/sheikha-runtime-drift-detector.js
  sheikha_snapshot_manifest_paths generatedReportPaths
fi

VALIDATOR_ARGS=()
[[ "$STRICT_EXTERNAL" == true ]] && VALIDATOR_ARGS+=(--strict-external)
sheikha_run node tools/activation/sheikha-unified-apex-validator-v1.js "${VALIDATOR_ARGS[@]}"

while IFS= read -r script; do
  [[ -n "$script" ]] && sheikha_run npm run "$script"
done < <(sheikha_manifest_values activationScripts)

VERIFY_ARGS=()
[[ "$STRICT_EXTERNAL" == true ]] && VERIFY_ARGS+=(--strict-external)
sheikha_run "$SHEIKHA_ROOT/tools/verify-sheikha-unified-apex-v1.sh" "${VERIFY_ARGS[@]}"

if [[ "$REQUIRE_CLEAN" == true ]]; then
  sheikha_restore_snapshot
  sheikha_capture_git_context
  sheikha_run node tools/drift/sheikha-runtime-drift-detector.js
fi

if [[ "$RESTART_PM2" == true ]]; then
  sheikha_require_command pm2
  sheikha_run pm2 restart sheikha-main-portal --update-env
  sheikha_run pm2 save
  sleep 3
  sheikha_run curl -fsS http://127.0.0.1:8080/api/sheikha/civilization-command/v1/status
  sheikha_run curl -fsS http://127.0.0.1:8080/api/sheikha/runtime-fabric/v5/status
  sheikha_run curl -fsS http://127.0.0.1:8080/api/sheikha/storage-governance/v1/status
fi

sheikha_cleanup_git_context
trap - EXIT
sheikha_log "Activation completed. Log: $SHEIKHA_LOG_FILE"
