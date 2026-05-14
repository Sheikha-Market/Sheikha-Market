#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="${SHEIKHA_PROJECT_DIR:-/opt/sheikha/current}"
REPORT_DIR="$PROJECT_DIR/reports/final-status"
STATUS_URL="${SHEIKHA_STATUS_URL:-http://127.0.0.1:8080/api/neural-sync/status}"
HEALTH_URL="${SHEIKHA_HEALTH_URL:-http://127.0.0.1:8080/api/health}"
PM2_APP="${SHEIKHA_PM2_APP:-sheikha-main-portal}"

mkdir -p "$REPORT_DIR"

report_file="$REPORT_DIR/vps-final-$(date +%F-%H%M%S).txt"

{
  echo "SHEIKHA VPS FINAL STATUS - $(date -u)"
  echo
  pm2 status
  echo
  curl -fsS "$HEALTH_URL"
  echo
  curl -fsS "$STATUS_URL"
  echo
  echo "app=$PM2_APP"
} > "$report_file"

echo "$report_file"
