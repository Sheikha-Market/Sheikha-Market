#!/usr/bin/env bash
set -euo pipefail

SCRIPT_PATH="${BASH_SOURCE[0]:-$0}"
ROOT_DIR="$(cd "$(dirname "$SCRIPT_PATH")/.." && pwd)"

SRC_UPSTREAMS="$ROOT_DIR/deploy/nginx/sheikha-split-upstreams.conf"
SRC_PUBLIC="$ROOT_DIR/deploy/nginx/sheikha-public.conf"
SRC_ADMIN="$ROOT_DIR/deploy/nginx/sheikha-admin.conf"
SRC_API="$ROOT_DIR/deploy/nginx/sheikha-api.conf"

CF_REALIP_CONF="/etc/nginx/snippets/sheikha-cloudflare-realip.conf"
TARGET_UPSTREAMS="/etc/nginx/conf.d/sheikha-split-upstreams.conf"

SITE_AVAILABLE_DIR="/etc/nginx/sites-available"
SITE_ENABLED_DIR="/etc/nginx/sites-enabled"

TGT_PUBLIC="$SITE_AVAILABLE_DIR/sheikha-public"
TGT_ADMIN="$SITE_AVAILABLE_DIR/sheikha-admin"
TGT_API="$SITE_AVAILABLE_DIR/sheikha-api"

LINK_PUBLIC="$SITE_ENABLED_DIR/sheikha-public"
LINK_ADMIN="$SITE_ENABLED_DIR/sheikha-admin"
LINK_API="$SITE_ENABLED_DIR/sheikha-api"

require_root() {
    if [[ "${EUID}" -ne 0 ]]; then
        echo "Run as root: sudo bash scripts/install-sheikha-nginx-split.sh"
        exit 1
    fi
}

ensure_sources_exist() {
    local missing=0
    for source_file in "$SRC_UPSTREAMS" "$SRC_PUBLIC" "$SRC_ADMIN" "$SRC_API"; do
        if [[ ! -f "$source_file" ]]; then
            echo "Missing source file: $source_file"
            missing=1
        fi
    done

    if [[ "$missing" -ne 0 ]]; then
        echo "Run this script from inside the Sheikha project checkout."
        echo "Example: cd /path/to/sheikha-main-portal && sudo bash scripts/install-sheikha-nginx-split.sh"
        exit 1
    fi
}

write_cloudflare_realip() {
    cat > "$CF_REALIP_CONF" <<'EOF'
set_real_ip_from 173.245.48.0/20;
set_real_ip_from 103.21.244.0/22;
set_real_ip_from 103.22.200.0/22;
set_real_ip_from 103.31.4.0/22;
set_real_ip_from 141.101.64.0/18;
set_real_ip_from 108.162.192.0/18;
set_real_ip_from 190.93.240.0/20;
set_real_ip_from 188.114.96.0/20;
set_real_ip_from 197.234.240.0/22;
set_real_ip_from 198.41.128.0/17;
set_real_ip_from 162.158.0.0/15;
set_real_ip_from 104.16.0.0/13;
set_real_ip_from 104.24.0.0/14;
set_real_ip_from 172.64.0.0/13;
set_real_ip_from 131.0.72.0/22;
set_real_ip_from 2400:cb00::/32;
set_real_ip_from 2606:4700::/32;
set_real_ip_from 2803:f800::/32;
set_real_ip_from 2405:b500::/32;
set_real_ip_from 2405:8100::/32;
set_real_ip_from 2a06:98c0::/29;
set_real_ip_from 2c0f:f248::/32;
EOF
}

DRY_RUN="${1:-}"
if [[ "$DRY_RUN" == "--dry-run" ]]; then
    echo "[dry-run] $SRC_UPSTREAMS -> $TARGET_UPSTREAMS"
    echo "[dry-run] $SRC_PUBLIC -> $TGT_PUBLIC"
    echo "[dry-run] $SRC_ADMIN -> $TGT_ADMIN"
    echo "[dry-run] $SRC_API -> $TGT_API"
    echo "[dry-run] realip -> $CF_REALIP_CONF"
    exit 0
fi

require_root
ensure_sources_exist

mkdir -p /etc/nginx/conf.d /etc/nginx/snippets "$SITE_AVAILABLE_DIR" "$SITE_ENABLED_DIR"

cp "$SRC_UPSTREAMS" "$TARGET_UPSTREAMS"
cp "$SRC_PUBLIC" "$TGT_PUBLIC"
cp "$SRC_ADMIN" "$TGT_ADMIN"
cp "$SRC_API" "$TGT_API"

write_cloudflare_realip

for target in "$TGT_PUBLIC" "$TGT_ADMIN" "$TGT_API"; do
    if ! grep -q "real_ip_header CF-Connecting-IP;" "$target"; then
        sed -i '1i real_ip_header CF-Connecting-IP;' "$target"
    fi

    if ! grep -q "real_ip_recursive on;" "$target"; then
        sed -i '1i real_ip_recursive on;' "$target"
    fi

    if ! grep -q "include /etc/nginx/conf.d/sheikha-split-upstreams.conf;" "$target"; then
        sed -i '1i include /etc/nginx/conf.d/sheikha-split-upstreams.conf;' "$target"
    fi

    if ! grep -q "include /etc/nginx/snippets/sheikha-cloudflare-realip.conf;" "$target"; then
        sed -i '1i include /etc/nginx/snippets/sheikha-cloudflare-realip.conf;' "$target"
    fi
done

ln -sfn "$TGT_PUBLIC" "$LINK_PUBLIC"
ln -sfn "$TGT_ADMIN" "$LINK_ADMIN"
ln -sfn "$TGT_API" "$LINK_API"

rm -f /etc/nginx/sites-enabled/sheikha

nginx -t
systemctl reload nginx

echo "✅ Split Nginx topology applied"
echo "✅ public.sheikha.top: proxy_pass only"
echo "✅ admin.sheikha.top: isolated policy"
echo "✅ api.sheikha.top: isolated policy"
