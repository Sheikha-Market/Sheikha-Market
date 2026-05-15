#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RESTORE_DIR="${RESTORE_DRILL_DIR:-$ROOT_DIR/backups/restore-drill}"
PASSPHRASE="${BACKUP_PASSPHRASE:-}"
ARCHIVE_PATH="${1:-}"

if [[ -z "$ARCHIVE_PATH" ]]; then
  echo "❌ استخدم: $0 /path/to/backup.tar.gz.enc"
  exit 1
fi

if [[ -z "$PASSPHRASE" ]]; then
  echo "❌ BACKUP_PASSPHRASE مطلوب"
  exit 1
fi

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
TARGET_DIR="$RESTORE_DIR/$STAMP"
TMP_ARCHIVE="$(mktemp)"

mkdir -p "$TARGET_DIR"
openssl enc -d -aes-256-cbc -pbkdf2 -in "$ARCHIVE_PATH" -out "$TMP_ARCHIVE" -pass env:BACKUP_PASSPHRASE
tar -C "$TARGET_DIR" -xzf "$TMP_ARCHIVE"
rm -f "$TMP_ARCHIVE"

test -f "$TARGET_DIR/.env"
test -f "$TARGET_DIR/docker-compose.yml"

echo "✅ Restore drill passed"
echo "restored_to=$TARGET_DIR"
