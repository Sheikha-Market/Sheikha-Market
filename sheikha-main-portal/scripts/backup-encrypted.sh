#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_DIR="$ROOT_DIR/infra/docker/compose/prod"
ENV_FILE="${ENV_FILE:-$COMPOSE_DIR/.env}"
OUTPUT_DIR="${BACKUP_OUTPUT_DIR:-$ROOT_DIR/backups/encrypted}"
PASSPHRASE="${BACKUP_PASSPHRASE:-}"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
WORK_DIR="$(mktemp -d)"
ARCHIVE_BASENAME="sheikha-backup-${TIMESTAMP}"
ARCHIVE_PATH="$OUTPUT_DIR/${ARCHIVE_BASENAME}.tar.gz"
ENCRYPTED_PATH="${ARCHIVE_PATH}.enc"
CHECKSUM_PATH="${ENCRYPTED_PATH}.sha256"

cleanup() {
  rm -rf "$WORK_DIR"
}
trap cleanup EXIT

if [[ -z "$PASSPHRASE" ]]; then
  echo "❌ BACKUP_PASSPHRASE مطلوب"
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

cp "$ENV_FILE" "$WORK_DIR/.env"
cp "$COMPOSE_DIR/docker-compose.yml" "$WORK_DIR/docker-compose.yml"

if command -v docker >/dev/null 2>&1 && docker ps --format '{{.Names}}' | grep -qx 'sheikha-postgres'; then
  docker exec sheikha-postgres pg_dump -U "${POSTGRES_USER:-sheikha}" "${POSTGRES_DB:-sheikha}" > "$WORK_DIR/postgres.sql"
fi

tar -C "$WORK_DIR" -czf "$ARCHIVE_PATH" .
openssl enc -aes-256-cbc -pbkdf2 -salt -in "$ARCHIVE_PATH" -out "$ENCRYPTED_PATH" -pass env:BACKUP_PASSPHRASE
sha256sum "$ENCRYPTED_PATH" > "$CHECKSUM_PATH"
rm -f "$ARCHIVE_PATH"

echo "✅ Encrypted backup created"
echo "archive=$ENCRYPTED_PATH"
echo "checksum=$CHECKSUM_PATH"
