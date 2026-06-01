#!/usr/bin/env bash
# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║           neural-canary-deploy.sh — نشر Canary + Blue/Green                 ║
# ║      شبكة الخلايا العصبية الجذرية — Zero-Downtime Neural Deploy             ║
# ╚══════════════════════════════════════════════════════════════════════════════╝
#
# الاستخدام:
#   ./scripts/neural-canary-deploy.sh [--dry-run] [--canary-pct=5] [--rollback-secs=2]
#
# المراحل:
#   1. تشغيل نسخة جديدة (Canary) على منفذ 8090
#   2. إرسال CANARY_PCT% من الطلبات عبر nginx split_clients
#   3. قياس استجابة الـ Canary (صحة + أخطاء)
#   4a. نجاح → Blue/Green: تحويل nginx كلياً إلى 8090، وإيقاف 8080
#   4b. فشل  → Rollback: حذف التهيئة + إعادة nginx إلى 8080 خلال ROLLBACK_SECS

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# ─── خيارات CLI ──────────────────────────────────────────────────────────────
DRY_RUN=false
CANARY_PCT=5
ROLLBACK_SECS=2

for arg in "$@"; do
    case "$arg" in
        --dry-run)          DRY_RUN=true ;;
        --canary-pct=*)     CANARY_PCT="${arg#--canary-pct=}" ;;
        --rollback-secs=*)  ROLLBACK_SECS="${arg#--rollback-secs=}" ;;
    esac
done

# ─── إعدادات ─────────────────────────────────────────────────────────────────
BLUE_PORT=8080    # النسخة الحالية (Blue)
GREEN_PORT=8090   # النسخة الجديدة (Green / Canary)
PM2_BLUE='sheikha-api'
PM2_GREEN='sheikha-api-green'
NGINX_SITE='/etc/nginx/sites-available/default'
NGINX_CANARY_CONF='/etc/nginx/conf.d/sheikha-canary.conf'
LOG_FILE='/var/log/sheikha-canary.log'
CANARY_PROBE_COUNT=10  # عدد طلبات الاختبار
CANARY_SUCCESS_PCT=80  # نسبة نجاح مطلوبة (%)

TELEGRAM_BOT_TOKEN="${SHEIKHA_TG_BOT_TOKEN:-}"
TELEGRAM_CHAT_ID="${SHEIKHA_TG_CHAT_ID:-}"

# ─── ألوان ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN_C='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; MAGENTA='\033[0;35m'; BLUE_C='\033[0;34m'; RESET='\033[0m'

log()   { echo -e "${CYAN}[CANARY]${RESET} $*"; }
ok()    { echo -e "${GREEN_C}[CANARY] ✅${RESET} $*"; }
warn()  { echo -e "${YELLOW}[CANARY] ⚠️ ${RESET} $*"; }
err()   { echo -e "${RED}[CANARY] ❌${RESET} $*"; }
step()  { echo -e "\n${MAGENTA}══ $* ══${RESET}"; }
dry()   { echo -e "${BLUE_C}[DRY-RUN]${RESET} $*"; }

run() {
    if [[ "$DRY_RUN" == true ]]; then
        dry "$*"
    else
        eval "$@"
    fi
}

send_alert() {
    local msg="$1"
    echo "$(date '+%F %T') $msg" >> "$LOG_FILE" 2>/dev/null || true
    logger -t sheikha-canary "$msg" 2>/dev/null || true
    if [[ -n "$TELEGRAM_BOT_TOKEN" && -n "$TELEGRAM_CHAT_ID" ]]; then
        curl -fsS --max-time 10 \
            "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
            -d "chat_id=${TELEGRAM_CHAT_ID}" \
            -d "text=🚦 شيخة-Canary — ${msg}" \
            -d "parse_mode=HTML" > /dev/null 2>&1 || true
    fi
}

# ─── التحقق من المتطلبات ─────────────────────────────────────────────────────
preflight() {
    step "فحص المتطلبات قبل النشر"

    command -v node &>/dev/null   || { err "Node.js غير مثبّت"; exit 1; }
    ok "Node.js: $(node --version)"

    if [[ "$DRY_RUN" == false ]]; then
        command -v pm2 &>/dev/null || { err "PM2 غير مثبّت"; exit 1; }
        ok "PM2: $(pm2 --version 2>/dev/null | head -1)"

        command -v curl &>/dev/null || { err "curl غير مثبّت"; exit 1; }
        ok "curl: متوفر"
    fi

    [[ -f "${PROJECT_DIR}/server.js" ]] || { err "server.js غير موجود"; exit 1; }
    ok "server.js: موجود"
}

# ─── المرحلة 1: تشغيل Canary (Green) على 8090 ───────────────────────────────
start_canary() {
    step "المرحلة 1 — تشغيل Canary على منفذ ${GREEN_PORT}"

    if [[ "$DRY_RUN" == true ]]; then
        dry "pm2 start server.js --name ${PM2_GREEN} -- --port ${GREEN_PORT}"
        dry "انتظار 5 ثوان للتهيئة"
        return 0
    fi

    # إيقاف أي نسخة Green قديمة
    pm2 delete "$PM2_GREEN" 2>/dev/null || true

    # تشغيل النسخة الجديدة
    PORT=$GREEN_PORT pm2 start "${PROJECT_DIR}/server.js" \
        --name "$PM2_GREEN" \
        --env production \
        -- --port "$GREEN_PORT" \
        2>/dev/null || {
        err "فشل تشغيل Canary على المنفذ ${GREEN_PORT}"
        exit 1
    }

    log "انتظار 5 ثوان للتهيئة..."
    sleep 5

    # التحقق من نجاح البدء
    local code
    code=$(curl -s -o /dev/null -w "%{http_code}" \
        --max-time 5 "http://127.0.0.1:${GREEN_PORT}/api/health" 2>/dev/null || echo '000')
    if [[ "$code" == '200' ]]; then
        ok "Canary يعمل على المنفذ ${GREEN_PORT}: HTTP $code"
    else
        err "Canary فشل في البدء (HTTP $code)"
        pm2 delete "$PM2_GREEN" 2>/dev/null || true
        exit 1
    fi
}

# ─── المرحلة 2: تهيئة nginx للـ Canary Split ─────────────────────────────────
configure_nginx_canary() {
    step "المرحلة 2 — تهيئة nginx Canary Split (${CANARY_PCT}%)"

    if [[ "$DRY_RUN" == true ]]; then
        dry "كتابة ${NGINX_CANARY_CONF} بنسبة ${CANARY_PCT}% → Green"
        dry "nginx -t && systemctl reload nginx"
        return 0
    fi

    if [[ ! -f "$NGINX_SITE" ]]; then
        warn "nginx site غير موجود ($NGINX_SITE) — تخطي split"
        return 0
    fi

    # كتابة تهيئة Canary: split_clients يوجّه CANARY_PCT% إلى Green
    # ملاحظة: $remote_addr بديل متوافق مع جميع nginx — $request_id يتطلب ngx_http_request_id_module
    cat > "$NGINX_CANARY_CONF" <<NGINX_CONF
# شيخة — Canary Split (${CANARY_PCT}% → Green:${GREEN_PORT})
# مولّد تلقائياً بواسطة neural-canary-deploy.sh
split_clients "\${remote_addr}AAA" \$sheikha_canary_backend {
    ${CANARY_PCT}%   127.0.0.1:${GREEN_PORT};
    *               127.0.0.1:${BLUE_PORT};
}
NGINX_CONF

    # التحقق من صحة التهيئة
    if nginx -t &>/dev/null 2>&1; then
        systemctl reload nginx 2>/dev/null || nginx -s reload 2>/dev/null || true
        ok "nginx: تم إعداد Canary Split (${CANARY_PCT}%)"
    else
        warn "تهيئة nginx غير صالحة — تخطي split"
        rm -f "$NGINX_CANARY_CONF" || true
    fi
}

# ─── المرحلة 3: قياس أداء الـ Canary ────────────────────────────────────────
probe_canary() {
    step "المرحلة 3 — قياس أداء Canary (${CANARY_PROBE_COUNT} طلب)"

    local success=0
    local failed=0

    for i in $(seq 1 "$CANARY_PROBE_COUNT"); do
        local code
        if [[ "$DRY_RUN" == true ]]; then
            dry "فحص ${i}/${CANARY_PROBE_COUNT}: محاكاة نجاح"
            ((success++)) || true
            continue
        fi

        code=$(curl -s -o /dev/null -w "%{http_code}" \
            --max-time 5 "http://127.0.0.1:${GREEN_PORT}/api/health" 2>/dev/null || echo '000')

        if [[ "$code" == '200' ]]; then
            ((success++)) || true
            log "فحص ${i}/${CANARY_PROBE_COUNT}: ✅ HTTP $code"
        else
            ((failed++)) || true
            warn "فحص ${i}/${CANARY_PROBE_COUNT}: ❌ HTTP $code"
        fi
        sleep 0.5
    done

    local pct=$(( success * 100 / CANARY_PROBE_COUNT ))
    log "نتيجة الـ Canary: $success/$CANARY_PROBE_COUNT نجاح ($pct%)"

    if [[ $pct -ge $CANARY_SUCCESS_PCT ]]; then
        ok "Canary ناجح: $pct% ≥ ${CANARY_SUCCESS_PCT}% المطلوبة"
        return 0
    else
        err "Canary فاشل: $pct% < ${CANARY_SUCCESS_PCT}% المطلوبة"
        return 1
    fi
}

# ─── المرحلة 4a: Blue/Green — تحويل كامل إلى Green ──────────────────────────
promote_green() {
    step "المرحلة 4a — Blue/Green Promotion: تحويل كامل إلى Green"

    send_alert "canary_success → promoting Green:${GREEN_PORT} to primary"

    if [[ "$DRY_RUN" == true ]]; then
        dry "sed -i: تحويل nginx من ${BLUE_PORT} إلى ${GREEN_PORT}"
        dry "rm ${NGINX_CANARY_CONF}"
        dry "nginx reload"
        dry "pm2 delete ${PM2_BLUE}"
        dry "pm2 restart ${PM2_GREEN} (يصبح الرئيسي)"
        ok "[DRY-RUN] Blue/Green اكتمل"
        return 0
    fi

    # تحديث nginx ليوجّه 100% إلى Green
    if [[ -f "$NGINX_SITE" ]]; then
        sed -i "s/127.0.0.1:${BLUE_PORT}/127.0.0.1:${GREEN_PORT}/g" "$NGINX_SITE" || true
    fi

    # حذف تهيئة Canary المؤقتة
    rm -f "$NGINX_CANARY_CONF" || true

    if nginx -t &>/dev/null 2>&1; then
        systemctl reload nginx 2>/dev/null || nginx -s reload 2>/dev/null || true
        ok "nginx: يوجّه 100% إلى Green (${GREEN_PORT})"
    fi

    # إيقاف النسخة Blue القديمة وحذفها
    pm2 stop "$PM2_BLUE"   2>/dev/null || true
    pm2 delete "$PM2_BLUE" 2>/dev/null || true

    # Green تبقى تعمل باسمها — لا حاجة لإعادة تشغيل
    ok "Green (${PM2_GREEN}) يعمل على ${GREEN_PORT} وأصبح الرئيسي"

    send_alert "blue_green_complete new_primary=${GREEN_PORT}"
    ok "Blue/Green اكتمل — الخادم الجديد على المنفذ ${GREEN_PORT} هو الرئيسي"
}

# ─── المرحلة 4b: Rollback إلى Blue ──────────────────────────────────────────
rollback() {
    step "المرحلة 4b — Rollback إلى Blue (${ROLLBACK_SECS}s)"

    send_alert "canary_failed → rollback to Blue:${BLUE_PORT}"

    if [[ "$DRY_RUN" == true ]]; then
        dry "حذف ${NGINX_CANARY_CONF}"
        dry "nginx reload"
        dry "pm2 delete ${PM2_GREEN}"
        ok "[DRY-RUN] Rollback اكتمل"
        return 0
    fi

    # حذف تهيئة Canary
    rm -f "$NGINX_CANARY_CONF" || true

    if nginx -t &>/dev/null 2>&1; then
        systemctl reload nginx 2>/dev/null || nginx -s reload 2>/dev/null || true
    fi

    # إيقاف Canary الفاشل
    sleep "$ROLLBACK_SECS"
    pm2 delete "$PM2_GREEN" 2>/dev/null || true

    send_alert "rollback_complete primary=${BLUE_PORT}"
    ok "Rollback اكتمل — Blue (${BLUE_PORT}) لا يزال هو الرئيسي"
}

# ─── الدالة الرئيسية ─────────────────────────────────────────────────────────
main() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║  🚦 شيخة — Canary + Blue/Green Deploy                        ║"
    echo "║  Neural Canary Deploy — شبكة الخلايا العصبية الجذرية         ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    log "Blue=${BLUE_PORT} | Green=${GREEN_PORT} | Canary=${CANARY_PCT}%"
    [[ "$DRY_RUN" == true ]] && warn "وضع DRY-RUN: لن تُجرى تغييرات فعلية"
    echo ""

    send_alert "canary_deploy_start blue=${BLUE_PORT} green=${GREEN_PORT} pct=${CANARY_PCT}"

    preflight
    start_canary
    configure_nginx_canary

    if probe_canary; then
        promote_green
    else
        rollback
        exit 1
    fi

    echo ""
    echo "╔══════════════════════════════════════════╗"
    echo "║    🚀 النشر اكتمل بنجاح!                  ║"
    echo "╚══════════════════════════════════════════╝"
    echo ""
}

main "$@"
