#!/usr/bin/env bash
set -euo pipefail

export PM2_HOME='${PM2_HOME:-/root/.pm2}'
export HOME='${HOME:-/root}'
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/root/.nvm/versions/node/v25.6.1/bin"

APP_DIR='${SHEIKHA_APP_DIR:-/opt/sheikha/current}'
BASE_URL='${SHEIKHA_BASE_URL:-http://127.0.0.1:8080}'
PM2_APP='${SHEIKHA_PM2_APP:-sheikha-api}'
LOG_FILE='${SHEIKHA_NEURAL_WATCHDOG_LOG:-/var/log/sheikha-neural-gate-watchdog.log}'

mkdir -p "$(dirname "$LOG_FILE")"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"

if [[ ! -d "$APP_DIR" ]]; then
  echo "${timestamp} APP_DIR_NOT_FOUND dir=$APP_DIR" | tee -a "$LOG_FILE"
  exit 1
fi

cd "$APP_DIR"
mkdir -p reports/deploy-health
snapshot="reports/deploy-health/watchdog-gate-${timestamp}.log"

if bash scripts/neural-gate.sh "$BASE_URL" > "$snapshot" 2>&1; then
  echo "${timestamp} WATCHDOG_OK snapshot=$snapshot" | tee -a "$LOG_FILE"
  exit 0
fi

echo "${timestamp} WATCHDOG_FAIL action=pm2_restart snapshot=$snapshot" | tee -a "$LOG_FILE"
if pm2 describe "$PM2_APP" >/dev/null 2>&1; then
  pm2 restart "$PM2_APP" --update-env || true
else
  pm2 restart ecosystem.config.js --update-env || pm2 start ecosystem.config.js --update-env || true
fi
pm2 save --force || true

if bash scripts/neural-gate.sh "$BASE_URL" >> "$snapshot" 2>&1; then
  echo "${timestamp} WATCHDOG_RECOVERED snapshot=$snapshot" | tee -a "$LOG_FILE"
  exit 0
fi

echo "${timestamp} WATCHDOG_CRITICAL snapshot=$snapshot" | tee -a "$LOG_FILE"
exit 1
