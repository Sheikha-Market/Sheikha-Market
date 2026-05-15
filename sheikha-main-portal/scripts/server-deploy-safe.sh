#!/usr/bin/env bash
# بسم الله الرحمن الرحيم
# نشر آمن للخادم مع استرجاع تلقائي — Safe server deployment with rollback

set -euo pipefail

APP_DIR="${APP_DIR:-$(pwd)}"
REMOTE="${REMOTE:-origin}"
BRANCH="${BRANCH:-main}"
PM2_APP="${PM2_APP:-sheikha-api}"
SYSTEMD_SERVICE="${SYSTEMD_SERVICE:-sheikha-main-portal}"
PORT="${PORT:-8080}"
HEALTH_PATH="${HEALTH_PATH:-/api/health}"
EXTERNAL_HEALTH_URL="${EXTERNAL_HEALTH_URL:-}"
LAST_GOOD_FILE="${LAST_GOOD_FILE:-/opt/sheikha/last_good_commit.txt}"
HEALTH_RETRIES="${HEALTH_RETRIES:-10}"
HEALTH_RETRY_DELAY="${HEALTH_RETRY_DELAY:-3}"

log() { echo "[SAFE-DEPLOY] $*"; }
warn() { echo "[SAFE-DEPLOY] ⚠️  $*"; }
fail() { echo "[SAFE-DEPLOY] ❌ $*"; exit 1; }

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "Required command not found: $1"
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
    if pm2 describe "$PM2_APP" >/dev/null 2>&1; then
      log "Restarting PM2 app: $PM2_APP"
      pm2 restart "$PM2_APP"
    else
      if [ -f "$APP_DIR/ecosystem.config.js" ]; then
        log "Starting PM2 app from ecosystem: $PM2_APP"
        pm2 start "$APP_DIR/ecosystem.config.js" --only "$PM2_APP"
      else
        fail "PM2 app '$PM2_APP' not found and ecosystem.config.js missing"
      fi
    fi
    pm2 save
    return 0
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

main() {
  require_cmd git
  require_cmd curl

  [ -d "$APP_DIR/.git" ] || fail "APP_DIR is not a git repository: $APP_DIR"

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

  log "Checking out branch: $BRANCH"
  git -C "$APP_DIR" checkout "$BRANCH"

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
