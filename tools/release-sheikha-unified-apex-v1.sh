#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$ROOT/tools/activation/sheikha-activation-common-v1.sh"

EXPECTED_BRANCH=""
COMMIT_MESSAGE=""
PUSH=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --branch) EXPECTED_BRANCH="${2:-}"; shift 2 ;;
    --message) COMMIT_MESSAGE="${2:-}"; shift 2 ;;
    --push) PUSH=true; shift ;;
    *) echo "Unknown option: $1" >&2; exit 2 ;;
  esac
done

[[ -n "$EXPECTED_BRANCH" ]] || { echo '--branch is required' >&2; exit 2; }
[[ -n "$COMMIT_MESSAGE" ]] || { echo '--message is required' >&2; exit 2; }

cd "$SHEIKHA_ROOT"
sheikha_prepare_log release
sheikha_require_command git
sheikha_assert_branch "$EXPECTED_BRANCH"
sheikha_run git diff --check

while IFS= read -r releasePath; do
  [[ -e "$releasePath" ]] && sheikha_run git add -- "$releasePath"
done < <(sheikha_manifest_values releasePaths)

sheikha_assert_no_unstaged_changes
git diff --cached --quiet && {
  sheikha_log 'No staged release changes; nothing to commit.'
  exit 0
}

sheikha_run git commit -m "$COMMIT_MESSAGE"
if [[ "$PUSH" == true ]]; then
  sheikha_run git push origin "$EXPECTED_BRANCH"
fi

sheikha_run node tools/drift/sheikha-runtime-drift-detector.js
sheikha_log "Release completed. Log: $SHEIKHA_LOG_FILE"
