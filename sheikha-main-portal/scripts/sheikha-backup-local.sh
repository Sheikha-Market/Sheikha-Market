#!/usr/bin/env bash
set -euo pipefail

WORKSPACE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEFAULT_BASE="/var/sheikha/runtime"
FALLBACK_BASE="$WORKSPACE_ROOT/runtime"

if [[ -d "$DEFAULT_BASE" || -w "/var" ]]; then
    BASE="$DEFAULT_BASE"
else
    BASE="$FALLBACK_BASE"
fi

mkdir -p "$BASE/backups"

TS=$(date '+%F-%H%M%S')
DEST="$BASE/backups/sheikha-backup-$TS.tar.gz"

tar -czf "$DEST" \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='runtime/backups' \
  --exclude='reports/education' \
  "$WORKSPACE_ROOT" \
  "$BASE" \
  "$HOME/.pm2/dump.pm2" \
  2>/dev/null || true

find "$BASE/backups" -type f -mtime +7 -delete 2>/dev/null || true

echo "backup=$DEST"
