#!/usr/bin/env bash
set -euo pipefail

HOST="${1:-root@31.97.190.74}"
SCRIPT_PATH="${BASH_SOURCE[0]:-$0}"
ROOT_DIR="$(cd "$(dirname "$SCRIPT_PATH")/.." && pwd)"
REMOTE_BASE="/root/sheikha-split"

SRC_SCRIPT="$ROOT_DIR/scripts/install-sheikha-nginx-split.sh"
SRC_UPSTREAMS="$ROOT_DIR/deploy/nginx/sheikha-split-upstreams.conf"
SRC_PUBLIC="$ROOT_DIR/deploy/nginx/sheikha-public.conf"
SRC_ADMIN="$ROOT_DIR/deploy/nginx/sheikha-admin.conf"
SRC_API="$ROOT_DIR/deploy/nginx/sheikha-api.conf"

for src in "$SRC_SCRIPT" "$SRC_UPSTREAMS" "$SRC_PUBLIC" "$SRC_ADMIN" "$SRC_API"; do
    if [[ ! -f "$src" ]]; then
        echo "Missing required file: $src"
        exit 1
    fi
done

echo "==> Preparing remote directories on $HOST"
ssh "$HOST" "mkdir -p $REMOTE_BASE/scripts $REMOTE_BASE/deploy/nginx"

echo "==> Copying installer and nginx configs"
scp "$SRC_SCRIPT" "$HOST:$REMOTE_BASE/scripts/"
scp "$SRC_UPSTREAMS" "$HOST:$REMOTE_BASE/deploy/nginx/"
scp "$SRC_PUBLIC" "$HOST:$REMOTE_BASE/deploy/nginx/"
scp "$SRC_ADMIN" "$HOST:$REMOTE_BASE/deploy/nginx/"
scp "$SRC_API" "$HOST:$REMOTE_BASE/deploy/nginx/"

echo "==> Applying split nginx topology"
ssh "$HOST" "cd $REMOTE_BASE && bash scripts/install-sheikha-nginx-split.sh"

echo "==> Final verification"
ssh "$HOST" "nginx -t && ls -l /etc/nginx/sites-enabled/sheikha-public /etc/nginx/sites-enabled/sheikha-admin /etc/nginx/sites-enabled/sheikha-api"

echo "✅ Remote split nginx deployment complete on $HOST"
