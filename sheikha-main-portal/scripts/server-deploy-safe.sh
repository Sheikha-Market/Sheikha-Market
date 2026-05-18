#!/usr/bin/env bash
# بسم الله الرحمن الرحيم
# نشر آمن للخادم مع استرجاع تلقائي — Safe server deployment with rollback

set -euo pipefail

APP_DIR="${APP_DIR:-$(pwd)}"
REMOTE="${REMOTE:-origin}"
BRANCH="${BRANCH:-main}"
PM2_APP="${PM2_APP:-sheikha-main-portal}"
PM2_FALLBACK_APP="${PM2_FALLBACK_APP:-sheikha-api}"
SYSTEMD_SERVICE="${SYSTEMD_SERVICE:-sheikha-main-portal}"
PORT="${PORT:-8080}"
HEALTH_PATH="${HEALTH_PATH:-/api/health}"
EXTERNAL_HEALTH_URL="${EXTERNAL_HEALTH_URL:-}"
LAST_GOOD_FILE="${LAST_GOOD_FILE:-/opt/sheikha/last_good_commit.txt}"
HEALTH_RETRIES="${HEALTH_RETRIES:-10}"
HEALTH_RETRY_DELAY="${HEALTH_RETRY_DELAY:-3}"
ALLOW_NON_MAIN="${ALLOW_NON_MAIN:-false}"
CLEAN_UNTRACKED="${CLEAN_UNTRACKED:-false}"

log() { echo "[SAFE-DEPLOY] $*"; }
warn() { echo "[SAFE-DEPLOY] ⚠️  $*"; }
fail() { echo "[SAFE-DEPLOY] ❌ $*"; exit 1; }

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "Required command not found: $1"
}

assert_ssh_remote() {
  local remote_url
  remote_url="$(git -C "$APP_DIR" remote get-url "$REMOTE" 2>/dev/null || true)"
  [ -n "$remote_url" ] || fail "Remote '$REMOTE' not found"

  case "$remote_url" in
    git@*|ssh://*)
      log "✅ SSH remote confirmed: $remote_url"
      ;;
    *)
      fail "Remote '$REMOTE' is not SSH ($remote_url). Use SSH only for Git."
      ;;
  esac
}

healthcheck_with_retry() {
  local url="$1"
  local label="$2"
  local attempt=1

  while [ "$attempt" -le "$HEALTH_RETRIES" ]; do
    if curl -fsS --max-time 8 "$url" >/dev/null; then
      log "✅ $label passed ($url)"
      return 0
    fi

    warn "$label failed (attempt $attempt/$HEALTH_RETRIES): $url"
    attempt=$((attempt + 1))
    sleep "$HEALTH_RETRY_DELAY"
  done

  return 1
}

restart_service() {
  if command -v pm2 >/dev/null 2>&1; then
    local candidates=("$PM2_APP" "$PM2_FALLBACK_APP")
    local candidate
    for candidate in "${candidates[@]}"; do
      if pm2 describe "$candidate" >/dev/null 2>&1; then
        log "Restarting PM2 app: $candidate"
        pm2 restart "$candidate"
        pm2 save
        return 0
      fi
    done

    if [ -f "$APP_DIR/ecosystem.config.js" ]; then
      for candidate in "${candidates[@]}"; do
        if pm2 start "$APP_DIR/ecosystem.config.js" --only "$candidate" >/dev/null 2>&1; then
          log "Starting PM2 app from ecosystem: $candidate"
          pm2 save
          return 0
        fi
      done
    fi

    fail "PM2 apps not found (${candidates[*]}) and could not start from ecosystem"
  fi

  if command -v systemctl >/dev/null 2>&1; then
    log "Restarting systemd service: $SYSTEMD_SERVICE"
    systemctl restart "$SYSTEMD_SERVICE"
    systemctl status "$SYSTEMD_SERVICE" --no-pager -l >/dev/null
    return 0
  fi

  fail "No supported process manager found (pm2/systemctl)"
}

rollback_and_recover() {
  local previous_sha="$1"

  warn "Deployment failed. Starting rollback to $previous_sha"
  git -C "$APP_DIR" reset --hard "$previous_sha"

  restart_service

  local internal_url="http://127.0.0.1:${PORT}${HEALTH_PATH}"
  if ! healthcheck_with_retry "$internal_url" "Internal healthcheck after rollback"; then
    fail "Rollback completed but healthcheck still failing"
  fi

  if [ -n "$EXTERNAL_HEALTH_URL" ]; then
    if ! healthcheck_with_retry "$EXTERNAL_HEALTH_URL" "External healthcheck after rollback"; then
      fail "Rollback completed but external healthcheck still failing"
    fi
  fi

  fail "Rollback executed successfully. Investigate the failed deployment before retrying"
}

ensure_branch_tracking() {
  git -C "$APP_DIR" show-ref --verify --quiet "refs/remotes/${REMOTE}/${BRANCH}" \
    || fail "Remote branch not found: ${REMOTE}/${BRANCH}"

  if git -C "$APP_DIR" show-ref --verify --quiet "refs/heads/${BRANCH}"; then
    git -C "$APP_DIR" checkout "$BRANCH"
  else
    git -C "$APP_DIR" checkout -b "$BRANCH" --track "${REMOTE}/${BRANCH}"
  fi

  git -C "$APP_DIR" branch --set-upstream-to="${REMOTE}/${BRANCH}" "$BRANCH" >/dev/null
  log "Branch tracking aligned: ${BRANCH} -> ${REMOTE}/${BRANCH}"
}

main() {
  require_cmd git
  require_cmd curl

  [ -d "$APP_DIR/.git" ] || fail "APP_DIR is not a git repository: $APP_DIR"
  [ "$BRANCH" = "main" ] || [ "$ALLOW_NON_MAIN" = "true" ] || fail "Target branch must be main (current BRANCH=$BRANCH)"

  log "Remote verification:"
  git -C "$APP_DIR" remote -v
  assert_ssh_remote

  local current_branch
  current_branch="$(git -C "$APP_DIR" rev-parse --abbrev-ref HEAD)"
  log "Current branch: $current_branch | Target branch: $BRANCH"

  if [ "$CLEAN_UNTRACKED" = "true" ]; then
    warn "Cleaning untracked files before deployment"
    git -C "$APP_DIR" clean -fd
  fi

  if [ -n "$(git -C "$APP_DIR" status --porcelain)" ]; then
    fail "Repository has uncommitted changes. Commit/stash before deployment"
  fi

  local previous_sha
  previous_sha="$(git -C "$APP_DIR" rev-parse HEAD)"

  mkdir -p "$(dirname "$LAST_GOOD_FILE")"
  printf '%s\n' "$previous_sha" > "$LAST_GOOD_FILE"
  log "Saved rollback point: $previous_sha -> $LAST_GOOD_FILE"

  log "Fetching latest refs from $REMOTE"
  git -C "$APP_DIR" fetch "$REMOTE" --prune

  log "Checking out and aligning branch: $BRANCH"
  ensure_branch_tracking

  log "Pulling latest commit with fast-forward only"
  if ! git -C "$APP_DIR" pull --ff-only "$REMOTE" "$BRANCH"; then
    rollback_and_recover "$previous_sha"
  fi

  restart_service

  local internal_url="http://127.0.0.1:${PORT}${HEALTH_PATH}"
  if ! healthcheck_with_retry "$internal_url" "Internal healthcheck"; then
    rollback_and_recover "$previous_sha"
  fi

  if [ -n "$EXTERNAL_HEALTH_URL" ]; then
    if ! healthcheck_with_retry "$EXTERNAL_HEALTH_URL" "External healthcheck"; then
      rollback_and_recover "$previous_sha"
    fi
  fi

  log "✅ Safe deployment completed successfully"
}

main "$@"
