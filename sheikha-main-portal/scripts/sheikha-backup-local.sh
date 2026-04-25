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
MAX_SIZE_MB="${SHEIKHA_BACKUP_MAX_MB:-4096}"
MAX_SIZE_BYTES=$((MAX_SIZE_MB * 1024 * 1024))

# نبقي النسخة الاحتياطية خفيفة ونستبعد المسارات الضخمة ومجلدات التشغيل المؤقتة.
BACKUP_EXCLUDES=(
  --exclude='node_modules'
  --exclude='.git'
  --exclude='runtime'
  --exclude='reports'
  --exclude='logs'
  --exclude='backups'
  --exclude='.venv'
  --exclude='.checkpoints'
  --exclude='.cache'
  --exclude='reports/education'
  --exclude='*.log'
  --exclude='*.tar'
  --exclude='*.tar.gz'
  --exclude="$BASE/backups"
  --exclude='/var/sheikha/runtime/backups'
)

BACKUP_SOURCES=(
  "$WORKSPACE_ROOT"
)

if [[ -f "$HOME/.pm2/dump.pm2" ]]; then
  BACKUP_SOURCES+=("$HOME/.pm2/dump.pm2")
fi

tar -czf "$DEST" \
  "${BACKUP_EXCLUDES[@]}" \
  "${BACKUP_SOURCES[@]}" \
  2>/dev/null || true

if [[ -f "$DEST" ]]; then
  FILE_SIZE=$(stat -c%s "$DEST" 2>/dev/null || echo 0)
  if [[ "$FILE_SIZE" -gt "$MAX_SIZE_BYTES" ]]; then
    rm -f "$DEST"
    echo "backup=skipped(size-limit:${MAX_SIZE_MB}MB)"
    echo "warning=backup_exceeded_limit"
  fi
fi

find "$BASE/backups" -type f -mtime +7 -delete 2>/dev/null || true

# حذف أي نسخة ضخمة قديمة بشكل احترازي (> 8GB).
find "$BASE/backups" -type f -name 'sheikha-backup-*.tar.gz' -size +8G -delete 2>/dev/null || true

# احتفاظ إضافي: أقصى 3 ملفات نسخ احتياطي.
ls -1t "$BASE"/backups/sheikha-backup-*.tar.gz 2>/dev/null | tail -n +4 | xargs -r rm -f

echo "backup=$DEST"
