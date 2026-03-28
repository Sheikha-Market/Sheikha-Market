#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_CONF="$ROOT_DIR/deploy/nginx/sheikha-cloudflare-production.conf"
TARGET_CONF="/etc/nginx/sites-available/sheikha"
TARGET_LINK="/etc/nginx/sites-enabled/sheikha"
REALIP_CONF="/etc/nginx/conf.d/sheikha-cloudflare-realip.conf"
FALLBACK_DIR="/var/www/sheikha"
FALLBACK_FILE="$FALLBACK_DIR/sheikha-fallback.html"
DRY_RUN="${1:-}"

require_root() {
    if [[ "${EUID}" -ne 0 ]]; then
        echo "Run as root: sudo bash scripts/install-sheikha-nginx-production.sh"
        exit 1
    fi
}

write_cloudflare_realip() {
    cat > "$REALIP_CONF" <<'EOF'
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

write_fallback_page() {
    mkdir -p "$FALLBACK_DIR"
    cat > "$FALLBACK_FILE" <<'EOF'
<!doctype html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>شيخة - الخدمة قيد الاستعادة</title>
    <style>
        body { font-family: Tahoma, sans-serif; background: #111827; color: #f9fafb; display: grid; place-items: center; min-height: 100vh; margin: 0; }
        .card { max-width: 640px; padding: 32px; background: #1f2937; border: 1px solid #374151; border-radius: 18px; }
        h1 { margin-top: 0; color: #fbbf24; }
        p { line-height: 1.8; }
    </style>
</head>
<body>
    <div class="card">
        <h1>الخدمة قيد الاستعادة</h1>
        <p>منظومة شيخة تعمل على إعادة التوازن للخدمة. يرجى المحاولة بعد قليل.</p>
        <p>يمكن التحقق من الصحة عبر المسار <strong>/sheikha-health</strong>.</p>
    </div>
</body>
</html>
EOF
}

if [[ "$DRY_RUN" == "--dry-run" ]]; then
    echo "[dry-run] source config: $SOURCE_CONF"
    echo "[dry-run] target config: $TARGET_CONF"
    echo "[dry-run] real ip file: $REALIP_CONF"
    echo "[dry-run] fallback file: $FALLBACK_FILE"
    exit 0
fi

require_root
mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled /etc/nginx/conf.d
cp "$SOURCE_CONF" "$TARGET_CONF"
ln -sfn "$TARGET_CONF" "$TARGET_LINK"
write_cloudflare_realip
write_fallback_page
nginx -t
systemctl reload nginx

echo "✅ Sheikha production Nginx config installed"
echo "✅ Healthcheck: http://public.sheikha.top/sheikha-health"
echo "✅ Admin restricted to localhost + Tailscale"
