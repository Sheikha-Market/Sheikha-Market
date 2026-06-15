#!/usr/bin/env bash

set -euo pipefail

SHEIKHA_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SHEIKHA_MANIFEST="$SHEIKHA_ROOT/tools/activation/sheikha-unified-apex-manifest-v1.json"
SHEIKHA_LOG_ROOT="$SHEIKHA_ROOT/data/sheikha-unified-apex-activation"

sheikha_timestamp() {
  date -u +'%Y%m%dT%H%M%SZ'
}

sheikha_prepare_log() {
  mkdir -p "$SHEIKHA_LOG_ROOT"
  SHEIKHA_LOG_FILE="$SHEIKHA_LOG_ROOT/${1}-$(sheikha_timestamp).log"
  export SHEIKHA_LOG_FILE
}

sheikha_log() {
  printf '[SHEIKHA] %s\n' "$*" | tee -a "${SHEIKHA_LOG_FILE:-/dev/null}"
}

sheikha_require_command() {
  command -v "$1" >/dev/null 2>&1 || {
    sheikha_log "Required command is missing: $1"
    return 1
  }
}

sheikha_run() {
  local output_file
  local status

  sheikha_log "RUN: $*"
  output_file="$(mktemp "${TMPDIR:-/tmp}/sheikha-run.XXXXXX")"
  set +e
  "$@" >"$output_file" 2>&1
  status=$?
  set -e
  tee -a "$SHEIKHA_LOG_FILE" <"$output_file"
  rm -f "$output_file"
  return "$status"
}

sheikha_manifest_values() {
  local key="$1"
  node -e "const m=require(process.argv[1]); for (const value of m[process.argv[2]] || []) console.log(value);" \
    "$SHEIKHA_MANIFEST" "$key"
}

sheikha_assert_branch() {
  local expected="$1"
  local current
  current="$(git branch --show-current)"
  [[ "$current" == "$expected" ]] || {
    sheikha_log "Branch mismatch. Expected '$expected', found '$current'."
    return 1
  }
}

sheikha_assert_no_unstaged_changes() {
  local pending
  pending="$(git status --porcelain --untracked-files=all | awk '
    substr($0, 1, 2) == "??" || substr($0, 2, 1) != " " { print }
  ')"
  [[ -z "$pending" ]] || {
    sheikha_log 'Unstaged changes remain; release aborted.'
    printf '%s\n' "$pending" | tee -a "$SHEIKHA_LOG_FILE"
    return 1
  }
}
