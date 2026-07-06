#!/usr/bin/env bash
set -euo pipefail

OUT="runtime/operational-verification/sheikha-operational-readiness-v1-$(date +%Y%m%d%H%M%S).log"
mkdir -p "$(dirname "$OUT")"
exec > >(tee "$OUT") 2>&1

verify_operational_backup() {
  local backup_dir="backups/verification"
  local restore_dir="/tmp/sheikha-restore-test-$(date +%Y%m%d%H%M%S)"
  local backup_file="$backup_dir/sheikha-operational-backup-$(date +%Y%m%d%H%M%S).tar.gz"

  mkdir -p "$backup_dir" "$restore_dir"

  if [ -f "Salman_Alrajeh_Eternal_Legacy.zip" ]; then
    echo "BACKUP_EXCLUDED_LARGE_FILE=Salman_Alrajeh_Eternal_Legacy.zip"
  fi

  tar \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=backups \
    --exclude=runtime/operational-verification \
    --exclude=.venv \
    --exclude=reports \
    --exclude=logs \
    --exclude=Salman_Alrajeh_Eternal_Legacy.zip \
    -czf "$backup_file" .

  test -s "$backup_file"
  echo "BACKUP_FILE=$backup_file"

  tar -tzf "$backup_file" >/tmp/sheikha-backup-list.txt
  echo "BACKUP_ARCHIVE_VALID=true"

  tar -xzf "$backup_file" -C "$restore_dir" ./package.json ./server.js

  test -f "$restore_dir/package.json"
  echo "PACKAGE_RESTORED=true"

  test -f "$restore_dir/server.js"
  echo "SERVER_RESTORED=true"

  echo "RESTORE_SAMPLE_DIR=$restore_dir"
}

echo "SHEIKHA OPERATIONAL READINESS V1"
echo "Started: $(date -Is)"
echo

echo "1) Git status"
git status --short

echo
echo "2) Node syntax"
node --check server.js

echo
echo "3) Lint"
npm run lint

echo
echo "4) Tests"
npm test

echo
echo "5) Production hardening gate"
npm run ops:production-hardening-closure:v1

echo
echo "6) Operational backup and restore verification"
verify_operational_backup

echo
echo "7) PM2 status"
pm2 status

echo
echo "8) Health endpoint"
curl -fsS http://127.0.0.1:8080/api/health
echo

echo
echo "9) Marketplace route"
curl -I http://127.0.0.1:8080/marketplace || true

echo
echo "10) Recent PM2 logs"
pm2 logs sheikha-main-portal --lines 120 --nostream

echo
echo "Finished: $(date -Is)"
echo "REPORT=$OUT"
