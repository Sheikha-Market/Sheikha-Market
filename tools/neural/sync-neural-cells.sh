#!/bin/bash
# Neural Cell Sync Automation Script
# Synchronizes Sheikha repositories across cells
# Usage: bash scripts/sync-neural-cells.sh [sync-type] [--dry-run] [--verbose]

set -o pipefail

# Configuration
ORIGIN_REPO="origin"
ENTERPRISE_REPO="enterprise"
SYNC_LOG_DIR="logs"
SYNC_AUDIT_FILE="${SYNC_LOG_DIR}/sync-audit.ndjson"
SCRIPT_VERSION="1.0.0"
ENTERPRISE_AVAILABLE=1

# Options
SYNC_TYPE=${1:-full}
DRY_RUN=0
VERBOSE=0

# Parse additional arguments
shift || true
while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      DRY_RUN=1
      shift
      ;;
    --verbose)
      VERBOSE=1
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Helper functions
log_audit() {
  local level=$1
  local event=$2
  local detail=$3

  if [[ ! -d "$SYNC_LOG_DIR" ]]; then
    mkdir -p "$SYNC_LOG_DIR"
  fi

  local timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  local entry=$(cat <<EOF
{
  "timestamp": "$timestamp",
  "level": "$level",
  "event": "$event",
  "detail": "$detail",
  "syncType": "$SYNC_TYPE",
  "dryRun": $DRY_RUN,
  "user": "$(git config user.name)",
  "hostname": "$(hostname)"
}
EOF
)

  echo "$entry" >> "$SYNC_AUDIT_FILE"
}

log_message() {
  local level=$1
  local message=$2

  if [[ $VERBOSE -eq 1 ]] || [[ "$level" == "ERROR" ]] || [[ "$level" == "WARN" ]]; then
    echo "[Neural Cell] [$level] $message"
  fi
}

verify_remotes() {
  log_message "INFO" "Verifying remotes..."

  if ! git remote get-url $ORIGIN_REPO > /dev/null 2>&1; then
    log_message "ERROR" "Origin remote '$ORIGIN_REPO' not found"
    log_audit "ERROR" "VERIFY_REMOTES" "Origin remote not found"
    exit 1
  fi

  if ! git remote get-url $ENTERPRISE_REPO > /dev/null 2>&1; then
    log_message "WARN" "Enterprise remote '$ENTERPRISE_REPO' not found, skipping enterprise sync"
    log_audit "WARN" "VERIFY_REMOTES" "Enterprise remote not found; enterprise sync disabled"
    ENTERPRISE_AVAILABLE=0
    return 0
  fi

  if ! git ls-remote --heads $ENTERPRISE_REPO > /dev/null 2>&1; then
    log_message "WARN" "Enterprise remote exists but is not accessible (auth/policy), skipping enterprise sync"
    log_audit "WARN" "VERIFY_REMOTES" "Enterprise remote inaccessible; enterprise sync disabled"
    ENTERPRISE_AVAILABLE=0
    return 0
  fi

  log_message "INFO" "Remotes verified successfully"
  return 0
}

sync_runtime_branches() {
  if [[ $ENTERPRISE_AVAILABLE -eq 0 ]]; then
    log_message "WARN" "Enterprise sync disabled; skipping runtime branch push"
    log_audit "WARN" "SYNC_RUNTIME_SKIPPED" "Enterprise unavailable"
    return 0
  fi

  log_message "INFO" "Syncing runtime branches: $ORIGIN_REPO → $ENTERPRISE_REPO"
  log_audit "INFO" "SYNC_RUNTIME_START" "Synchronizing stable/runtime-baseline"

  local branches=("stable/runtime-baseline" "stable/production" "rings/production")
  local failed=0

  for branch in "${branches[@]}"; do
    log_message "INFO" "Processing branch: $branch"

    # Skip branches that do not exist on origin
    if ! git ls-remote --heads $ORIGIN_REPO "$branch" | grep -q "$branch"; then
      log_message "INFO" "Skipping missing origin branch: $branch"
      continue
    fi

    # Fetch from origin
    if ! git fetch $ORIGIN_REPO "$branch" 2>&1 | tee -a "$SYNC_LOG_DIR/fetch.log"; then
      log_message "WARN" "Failed to fetch $branch from origin"
      ((failed++))
      continue
    fi

    if [[ $DRY_RUN -eq 1 ]]; then
      log_message "INFO" "[DRY-RUN] Would push $branch to enterprise"
      continue
    fi

    # Push to enterprise
    if ! git push $ENTERPRISE_REPO "$ORIGIN_REPO/$branch:$branch" -f 2>&1 | tee -a "$SYNC_LOG_DIR/push.log"; then
      log_message "WARN" "Failed to push $branch to enterprise"
      log_audit "WARN" "SYNC_RUNTIME_PUSH_FAILED" "$branch"
      ((failed++))
      continue
    fi

    log_message "INFO" "✅ Synced $branch"
  done

  if [[ $failed -gt 0 ]]; then
    log_message "WARN" "Sync runtime branches completed with $failed failures"
    log_audit "WARN" "SYNC_RUNTIME_END" "Completed with $failed failures"
    return 1
  fi

  log_message "INFO" "✅ Runtime sync complete"
  log_audit "INFO" "SYNC_RUNTIME_END" "Successfully synced all branches"
  return 0
}

sync_docs() {
  if [[ $ENTERPRISE_AVAILABLE -eq 0 ]]; then
    log_message "WARN" "Enterprise sync disabled; skipping docs sync"
    log_audit "WARN" "SYNC_DOCS_SKIPPED" "Enterprise unavailable"
    return 0
  fi

  log_message "INFO" "Syncing strategic docs: $ENTERPRISE_REPO → $ORIGIN_REPO"
  log_audit "INFO" "SYNC_DOCS_START" "Synchronizing strategic documents"

  local docs=("docs/VISION.md" "docs/FOUNDATIONS.md" "docs/ARCHITECTURE.md" "docs/BUSINESS-MODELS.md")
  local changed=0

  # Fetch from enterprise
  if ! git fetch $ENTERPRISE_REPO main:enterprise-main 2>&1 | tee -a "$SYNC_LOG_DIR/fetch-enterprise.log"; then
    log_message "ERROR" "Failed to fetch from enterprise"
    log_audit "ERROR" "SYNC_DOCS_FETCH_FAILED" "Enterprise fetch failed"
    return 1
  fi

  # Check which docs changed
  for doc in "${docs[@]}"; do
    if git diff --quiet main enterprise-main -- "$doc"; then
      log_message "INFO" "$doc: no changes"
    else
      log_message "INFO" "$doc: changed, updating..."
      ((changed++))

      if [[ $DRY_RUN -eq 1 ]]; then
        log_message "INFO" "[DRY-RUN] Would update $doc"
        continue
      fi

      # Merge the specific doc
      git checkout main > /dev/null 2>&1
      if git merge -X theirs --no-commit enterprise-main -- "$doc" 2>&1 | tee -a "$SYNC_LOG_DIR/merge.log"; then
        git add "$doc"
      else
        log_message "WARN" "Merge conflict in $doc, keeping origin version"
        git merge --abort > /dev/null 2>&1
      fi
    fi
  done

  # Commit and push if there are changes
  if [[ $changed -gt 0 ]] && [[ $DRY_RUN -eq 0 ]]; then
    local status=$(git status --porcelain)
    if [[ -n "$status" ]]; then
      git commit -m "chore(docs): sync strategic documents from enterprise cell" -q

      if ! git push $ORIGIN_REPO main 2>&1 | tee -a "$SYNC_LOG_DIR/push-docs.log"; then
        log_message "ERROR" "Failed to push synced docs"
        log_audit "ERROR" "SYNC_DOCS_PUSH_FAILED" "Docs push failed"
        return 1
      fi

      log_message "INFO" "✅ Pushed $changed doc(s)"
    fi
  fi

  # Cleanup
  git branch -D enterprise-main 2>/dev/null || true

  log_message "INFO" "✅ Docs sync complete ($changed changed)"
  log_audit "INFO" "SYNC_DOCS_END" "Synced $changed documents"
  return 0
}

sync_feature_branches() {
  if [[ $ENTERPRISE_AVAILABLE -eq 0 ]]; then
    log_message "WARN" "Enterprise sync disabled; skipping feature sync"
    log_audit "WARN" "SYNC_FEATURES_SKIPPED" "Enterprise unavailable"
    return 0
  fi

  log_message "INFO" "Syncing feature branches: bidirectional"
  log_audit "INFO" "SYNC_FEATURES_START" "Synchronizing feature branches"

  # Get all feature branches on origin
  local feature_branches=$(git branch -r | grep "$ORIGIN_REPO/feature/" | sed 's|.*/||')
  local synced=0

  for branch in $feature_branches; do
    log_message "INFO" "Processing feature: $branch"

    if [[ $DRY_RUN -eq 1 ]]; then
      log_message "INFO" "[DRY-RUN] Would sync $branch to enterprise"
      ((synced++))
      continue
    fi

    # Push to enterprise
    if git push $ENTERPRISE_REPO "$ORIGIN_REPO/$branch:$branch" -f 2>&1 | tee -a "$SYNC_LOG_DIR/push-features.log"; then
      log_message "INFO" "✅ Synced $branch"
      ((synced++))
    else
      log_message "WARN" "Failed to sync $branch"
      log_audit "WARN" "SYNC_FEATURES_FAILED" "$branch"
    fi
  done

  log_message "INFO" "✅ Feature branch sync complete ($synced synced)"
  log_audit "INFO" "SYNC_FEATURES_END" "Synced $synced feature branches"
  return 0
}

validate_sync() {
  log_message "INFO" "Validating sync integrity..."
  log_audit "INFO" "VALIDATE_START" "Validating neural cell sync"

  local issues=0

  if [[ $ENTERPRISE_AVAILABLE -eq 0 ]]; then
    log_message "INFO" "Enterprise unavailable; running origin-only validation"

    local origin_main_hash=$(git rev-parse $ORIGIN_REPO/main 2>/dev/null || echo "MISSING")
    if [[ "$origin_main_hash" == "MISSING" ]]; then
      log_message "WARN" "Origin main branch not found"
      ((issues++))
    else
      log_message "INFO" "✅ Origin main visible: $origin_main_hash"
    fi

    log_audit "INFO" "VALIDATE_END" "Origin-only validation completed with $issues issues"

    if [[ $issues -gt 0 ]]; then
      log_message "WARN" "Validation found $issues issues (non-critical)"
      return 1
    fi

    log_message "INFO" "✅ Origin-only validations passed"
    return 0
  fi

  # Check stable/runtime-baseline consistency
  local origin_hash=$(git rev-parse $ORIGIN_REPO/stable/runtime-baseline 2>/dev/null || echo "MISSING")
  local enterprise_hash=$(git rev-parse $ENTERPRISE_REPO/stable/runtime-baseline 2>/dev/null || echo "MISSING")

  if [[ "$origin_hash" != "$enterprise_hash" ]]; then
    log_message "WARN" "stable/runtime-baseline hashes differ"
    log_message "INFO" "  Origin:     $origin_hash"
    log_message "INFO" "  Enterprise: $enterprise_hash"
    ((issues++))
  else
    log_message "INFO" "✅ stable/runtime-baseline consistent"
  fi

  # Check .runtime-fingerprint
  if ! git diff $ORIGIN_REPO/stable/runtime-baseline -- .runtime-fingerprint | grep -q "^"; then
    log_message "INFO" "✅ .runtime-fingerprint consistent"
  else
    log_message "WARN" ".runtime-fingerprint differs from origin"
    ((issues++))
  fi

  log_audit "INFO" "VALIDATE_END" "Validation completed with $issues issues"

  if [[ $issues -gt 0 ]]; then
    log_message "WARN" "Validation found $issues issues (non-critical)"
    return 1
  fi

  log_message "INFO" "✅ All validations passed"
  return 0
}

main() {
  local timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)

  echo "[Neural Cell] Sync initiated at $timestamp"
  echo "[Neural Cell] Sync type: $SYNC_TYPE"
  [[ $DRY_RUN -eq 1 ]] && echo "[Neural Cell] ⚠️  DRY-RUN MODE"
  [[ $VERBOSE -eq 1 ]] && echo "[Neural Cell] VERBOSE output enabled"

  log_audit "INFO" "SYNC_START" "Sync type: $SYNC_TYPE, dry-run: $DRY_RUN"

  # Verify setup
  if ! verify_remotes; then
    log_message "ERROR" "Remote verification failed"
    log_audit "ERROR" "SYNC_FAILED" "Remote verification failed"
    exit 1
  fi

  local exit_code=0

  case "$SYNC_TYPE" in
    runtime)
      sync_runtime_branches || exit_code=$?
      ;;

    docs)
      sync_docs || exit_code=$?
      ;;

    features)
      sync_feature_branches || exit_code=$?
      ;;

    full)
      echo ""
      log_message "INFO" "Starting full bidirectional sync..."
      echo ""

      sync_runtime_branches || exit_code=$?
      echo ""

      sync_docs || exit_code=$?
      echo ""

      sync_feature_branches || exit_code=$?
      echo ""

      validate_sync || true
      ;;

    *)
      log_message "ERROR" "Unknown sync type: $SYNC_TYPE"
      echo "Usage: bash tools/neural/sync-neural-cells.sh [runtime|docs|features|full] [--dry-run] [--verbose]"
      exit 1
      ;;
  esac

  echo ""
  local end_timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  echo "[Neural Cell] Sync completed at $end_timestamp"
  log_audit "INFO" "SYNC_END" "Sync completed, exit_code: $exit_code"

  if [[ $exit_code -eq 0 ]]; then
    echo "[Neural Cell] ✅ All operations successful"
  else
    echo "[Neural Cell] ⚠️  Sync completed with warnings (exit code: $exit_code)"
  fi

  exit $exit_code
}

# Run main function
main
