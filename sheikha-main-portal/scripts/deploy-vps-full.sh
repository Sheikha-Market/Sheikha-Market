#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# بسم الله الرحمن الرحيم
# سكريبت التفعيل الكامل — منظومة شيخة v4
# المالك: سلمان أحمد سلمان الراجح
# الدومين: sheikha.top | core.sheikha.top
# ═══════════════════════════════════════════════════════════════
set -e

# ── ألوان للمخرجات ──
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; GOLD='\033[1;33m'; NC='\033[0m'

SHEIKHA_DIR="/root/sheikha"
NGINX_CONF_SRC="$SHEIKHA_DIR/scripts/nginx-sheikha-v4-subdomain.conf"
NGINX_AVAILABLE="/etc/nginx/sites-available/sheikha-v4"
NGINX_ENABLED="/etc/nginx/sites-enabled/sheikha-v4"
PORT=8090
DOMAIN="core.sheikha.top"

log()  { echo -e "${CYAN}[شيخة]${NC} $1"; }
ok()   { echo -e "${GREEN}✅ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
fail() { echo -e "${RED}❌ $1${NC}"; exit 1; }

echo -e "${GOLD}"
echo "══════════════════════════════════════════════════════════"
echo "   بسم الله الرحمن الرحيم"
echo "   التفعيل الكامل — منظومة شيخة v4"
echo "   المالك: سلمان أحمد سلمان الراجح"
echo "   ﴿رب زدني علمًا﴾ — طه 114"
echo "══════════════════════════════════════════════════════════"
echo -e "${NC}"

# ── ١. التحقق من المتغيرات الحساسة ──
log "١. التحقق من متغيرات البيئة..."
if [[ -z "$SHEIKHA_JWT_SECRET" ]] || [[ ${#SHEIKHA_JWT_SECRET} -lt 32 ]]; then
    fail "SHEIKHA_JWT_SECRET غير موجود أو أقصر من 32 حرفًا\nنفّذ: export SHEIKHA_JWT_SECRET=\$(openssl rand -hex 32)"
fi
if [[ -z "$SHEIKHA_OWNER_PASSWORD" ]] || [[ ${#SHEIKHA_OWNER_PASSWORD} -lt 8 ]]; then
    fail "SHEIKHA_OWNER_PASSWORD غير موجود أو أقصر من 8 أحرف"
fi
export SHEIKHA_OWNER_USER="${SHEIKHA_OWNER_USER:-salman}"
ok "المتغيرات موجودة — JWT: ${#SHEIKHA_JWT_SECRET} حرف"

# ── ٢. التحقق من مجلد المشروع ──
log "٢. التحقق من مجلد المشروع..."
[[ -d "$SHEIKHA_DIR" ]] || fail "المجلد $SHEIKHA_DIR غير موجود — انسخ المشروع أولًا"
[[ -f "$SHEIKHA_DIR/sheikha-v4.js" ]] || fail "sheikha-v4.js غير موجود في $SHEIKHA_DIR"
[[ -f "$SHEIKHA_DIR/ecosystem.sheikha-v4.config.js" ]] || fail "ecosystem config غير موجود"
ok "مجلد المشروع موجود ومكتمل"

# ── ٣. إنشاء مجلد logs ──
log "٣. إنشاء مجلد السجلات..."
mkdir -p "$SHEIKHA_DIR/logs" "$SHEIKHA_DIR/data"
ok "مجلد logs وdata جاهزان"

# ── ٤. تثبيت الحزم ──
log "٤. تثبيت حزم Node.js..."
cd "$SHEIKHA_DIR"
if [[ ! -d node_modules ]]; then
    npm install --production --silent
    ok "تم تثبيت الحزم"
else
    ok "الحزم مثبتة مسبقًا"
fi

# ── ٥. التحقق من PM2 ──
log "٥. التحقق من PM2..."
if ! command -v pm2 &>/dev/null; then
    warn "PM2 غير مثبت — جاري التثبيت..."
    npm install -g pm2 --silent
fi
ok "PM2 متاح: $(pm2 --version)"

# ── ٦. إيقاف وإعادة تشغيل شيخة v4 ──
log "٦. تشغيل شيخة v4 عبر PM2..."
cd "$SHEIKHA_DIR"
pm2 delete sheikha-v4 2>/dev/null || true
pm2 start "$SHEIKHA_DIR/ecosystem.sheikha-v4.config.js" \
    --env production \
    -- \
    2>&1 | tail -5
pm2 save --force
ok "PM2: شيخة v4 تعمل على المنفذ $PORT"

# ── ٧. انتظار بدء الخادم ──
log "٧. الانتظار حتى يصبح الخادم جاهزًا..."
MAX=20; COUNT=0
until curl -sf "http://127.0.0.1:$PORT/api/sheikha/health" &>/dev/null; do
    COUNT=$((COUNT+1))
    [[ $COUNT -ge $MAX ]] && fail "الخادم لم يستجب على المنفذ $PORT بعد $MAX ثانية\nراجع: pm2 logs sheikha-v4"
    sleep 1
done
ok "الخادم يستجيب على http://127.0.0.1:$PORT"

# ── ٨. ضبط Nginx ──
log "٨. ضبط Nginx..."
if [[ ! -f "$NGINX_CONF_SRC" ]]; then
    log "إنشاء ملف nginx تلقائيًا..."
    cat > "$NGINX_CONF_SRC" << 'NGINXEOF'
server {
    listen 80;
    listen [::]:80;
    server_name core.sheikha.top;

    access_log /var/log/nginx/sheikha-v4-access.log;
    error_log  /var/log/nginx/sheikha-v4-error.log;

    location / {
        proxy_pass         http://127.0.0.1:8090;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_set_header   Upgrade           $http_upgrade;
        proxy_set_header   Connection        'upgrade';
        proxy_read_timeout 120s;
    }
}
NGINXEOF
fi

# إزالة الرابط المكسور إن وجد
[[ -L "$NGINX_ENABLED" && ! -e "$NGINX_ENABLED" ]] && rm -f "$NGINX_ENABLED"

cp -f "$NGINX_CONF_SRC" "$NGINX_AVAILABLE"
ln -sf "$NGINX_AVAILABLE" "$NGINX_ENABLED"
ok "ملف Nginx منسوخ ومرتبط"

# ── ٩. اختبار وإعادة تحميل Nginx ──
log "٩. اختبار إعدادات Nginx..."
if nginx -t 2>&1; then
    systemctl reload nginx && ok "Nginx تم إعادة تحميله بنجاح"
else
    fail "خطأ في إعدادات Nginx — راجع nginx -t"
fi

# ── ١٠. HTTPS بـ Certbot ──
log "١٠. تفعيل HTTPS لـ $DOMAIN..."
if command -v certbot &>/dev/null; then
    if [[ ! -d "/etc/letsencrypt/live/$DOMAIN" ]]; then
        certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos \
            --email "market@sheikha.top" --redirect 2>&1 | tail -10
        ok "شهادة SSL مفعّلة لـ $DOMAIN"
    else
        ok "شهادة SSL موجودة مسبقًا لـ $DOMAIN"
        certbot renew --dry-run 2>&1 | grep -E "success|fail|error" || true
    fi
else
    warn "certbot غير مثبت — تخطي HTTPS"
fi

# ── ١١. PM2 Startup (تشغيل تلقائي عند الإقلاع) ──
log "١١. ضبط التشغيل التلقائي عند إقلاع الخادم..."
pm2 startup systemd -u root --hp /root 2>&1 | tail -3 || true
pm2 save --force
ok "PM2 مهيأ للتشغيل التلقائي عند إقلاع الخادم"

# ── ١٢. اختبار نهائي شامل ──
log "١٢. الاختبار النهائي..."
echo ""

test_endpoint() {
    local label="$1" url="$2"
    if curl -sf "$url" | grep -q '"success":true'; then
        ok "$label"
    else
        warn "$label — لم يستجب بالشكل المطلوب"
    fi
}

test_endpoint "صحة النظام"          "http://127.0.0.1:$PORT/api/sheikha/health"
test_endpoint "أولويات الإصلاح"      "http://127.0.0.1:$PORT/api/sheikha/reform/priorities"
test_endpoint "النهضة العلمية"       "http://127.0.0.1:$PORT/api/sheikha/renaissance"
test_endpoint "آيات العلم"          "http://127.0.0.1:$PORT/api/sheikha/ilm/quran"
test_endpoint "حالة المحرك الخلفي"   "http://127.0.0.1:$PORT/api/sheikha/worker/status"
test_endpoint "نظام التجديد"        "http://127.0.0.1:$PORT/api/sheikha/tajdid"

echo ""
echo -e "${GOLD}"
echo "══════════════════════════════════════════════════════════"
echo "   ✅ التفعيل الكامل تم — بفضل الله وحده"
echo ""
echo "   🌐 core.sheikha.top"
echo "   📚 core.sheikha.top/ilm"
echo "   🔄 core.sheikha.top/tajdid"
echo "   🌟 core.sheikha.top/dashboard"
echo ""
echo "   المالك: سلمان أحمد سلمان الراجح"
echo "   «رب زدني علمًا» — طه 114"
echo "══════════════════════════════════════════════════════════"
echo -e "${NC}"

pm2 status
