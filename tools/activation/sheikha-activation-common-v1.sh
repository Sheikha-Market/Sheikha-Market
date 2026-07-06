#!/usr/bin/env bash

set -euo pipefail

SHEIKHA_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SHEIKHA_MANIFEST="$SHEIKHA_ROOT/tools/activation/sheikha-unified-apex-manifest-v1.json"
SHEIKHA_LOG_ROOT="$SHEIKHA_ROOT/data/sheikha-unified-apex-activation"
SHEIKHA_SNAPSHOT_DIR=""
SHEIKHA_GIT_STATUS_FILE=""
SHEIKHA_GIT_TRACKED_FILE=""

sheikha_timestamp() {
  date -u +'%Y%m%dT%H%M%SZ'
}

sheikha_prepare_log() {
  mkdir -p "$SHEIKHA_LOG_ROOT"
  SHEIKHA_LOG_FILE="$SHEIKHA_LOG_ROOT/${1}-$(sheikha_timestamp).log"
  export SHEIKHA_LOG_FILE
  SHEIKHA_GIT_STATUS_FILE="$(mktemp "${TMPDIR:-/tmp}/sheikha-git-status.XXXXXX")"
  SHEIKHA_GIT_TRACKED_FILE="$(mktemp "${TMPDIR:-/tmp}/sheikha-git-tracked.XXXXXX")"
  export SHEIKHA_GIT_STATUS_FILE SHEIKHA_GIT_TRACKED_FILE
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

sheikha_capture_git_context() {
  git status --short --untracked-files=all >"$SHEIKHA_GIT_STATUS_FILE"
  git ls-files >"$SHEIKHA_GIT_TRACKED_FILE"
  sheikha_log 'Captured a consistent Git context for governed tools.'
}

sheikha_cleanup_git_context() {
  [[ -z "$SHEIKHA_GIT_STATUS_FILE" ]] || rm -f -- "$SHEIKHA_GIT_STATUS_FILE"
  [[ -z "$SHEIKHA_GIT_TRACKED_FILE" ]] || rm -f -- "$SHEIKHA_GIT_TRACKED_FILE"
  SHEIKHA_GIT_STATUS_FILE=""
  SHEIKHA_GIT_TRACKED_FILE=""
  export SHEIKHA_GIT_STATUS_FILE SHEIKHA_GIT_TRACKED_FILE
}

sheikha_manifest_values() {
  local key="$1"
  node -e "const m=require(process.argv[1]); for (const value of m[process.argv[2]] || []) console.log(value);" \
    "$SHEIKHA_MANIFEST" "$key"
}

sheikha_assert_safe_relative_path() {
  local relative_path="$1"
  [[ -n "$relative_path" && "$relative_path" != /* && "$relative_path" != *".."* ]] || {
    sheikha_log "Unsafe manifest path rejected: $relative_path"
    return 1
  }
}

sheikha_snapshot_manifest_paths() {
  local key="$1"
  local relative_path
  local source_path
  local backup_path

  [[ -z "$SHEIKHA_SNAPSHOT_DIR" ]] || {
    sheikha_log 'A report snapshot is already active.'
    return 1
  }

  SHEIKHA_SNAPSHOT_DIR="$(mktemp -d "${TMPDIR:-/tmp}/sheikha-snapshot.XXXXXX")"
  export SHEIKHA_SNAPSHOT_DIR
  : >"$SHEIKHA_SNAPSHOT_DIR/index"

  while IFS= read -r relative_path; do
    [[ -n "$relative_path" ]] || continue
    sheikha_assert_safe_relative_path "$relative_path"
    source_path="$SHEIKHA_ROOT/$relative_path"
    backup_path="$SHEIKHA_SNAPSHOT_DIR/files/$relative_path"
    if [[ -f "$source_path" ]]; then
      mkdir -p "$(dirname "$backup_path")"
      cp -p -- "$source_path" "$backup_path"
      printf 'present\t%s\n' "$relative_path" >>"$SHEIKHA_SNAPSHOT_DIR/index"
    elif [[ ! -e "$source_path" ]]; then
      printf 'absent\t%s\n' "$relative_path" >>"$SHEIKHA_SNAPSHOT_DIR/index"
    else
      sheikha_log "Generated report path must be a file: $relative_path"
      return 1
    fi
  done < <(sheikha_manifest_values "$key")

  sheikha_log "Snapshotted governed generated reports: $key"
}

sheikha_restore_snapshot() {
  local state
  local relative_path
  local target_path
  local backup_path

  [[ -n "$SHEIKHA_SNAPSHOT_DIR" && -f "$SHEIKHA_SNAPSHOT_DIR/index" ]] || return 0

  while IFS=$'\t' read -r state relative_path; do
    [[ -n "$relative_path" ]] || continue
    sheikha_assert_safe_relative_path "$relative_path"
    target_path="$SHEIKHA_ROOT/$relative_path"
    backup_path="$SHEIKHA_SNAPSHOT_DIR/files/$relative_path"
    if [[ "$state" == present ]]; then
      mkdir -p "$(dirname "$target_path")"
      cp -p -- "$backup_path" "$target_path"
    elif [[ "$state" == absent ]]; then
      rm -f -- "$target_path"
    else
      sheikha_log "Unknown snapshot state for $relative_path: $state"
      return 1
    fi
  done <"$SHEIKHA_SNAPSHOT_DIR/index"

  rm -rf -- "$SHEIKHA_SNAPSHOT_DIR"
  SHEIKHA_SNAPSHOT_DIR=""
  export SHEIKHA_SNAPSHOT_DIR
  sheikha_log 'Restored governed generated reports to their pre-activation state.'
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
