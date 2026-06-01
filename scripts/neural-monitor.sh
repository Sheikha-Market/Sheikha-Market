#!/usr/bin/env bash
# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║              neural-monitor.sh — شبكة الخلايا العصبية الجذرية               ║
# ║        طبقات متعددة + نظام أوزان للقرار الذكي — Neural Monitoring Mesh      ║
# ╚══════════════════════════════════════════════════════════════════════════════╝
#
# الاستخدام:
#   ./scripts/neural-monitor.sh [--json] [--once] [--interval=SECONDS]
#
# الطبقات:
#   طبقة 0 (النواة)   : HTTP /health على 8080 + 8090
#   طبقة 1 (العصبون) : ملفات JSON في data/ + API حيوية
#   طبقة 2 (الشبكة)  : PM2 + nginx + CPU/RAM/Disk
#
# نظام الأوزان (مجموع = 1.0):
#   HTTP 8080          → 0.40
#   PM2 active         → 0.20
#   nginx              → 0.20
#   DB/JSON readable   → 0.10
#   RAM < 90%          → 0.10
#
# قرار ذكي:
#   درجة ≥ 0.60 → طبيعي (OK)
#   درجة ≥ 0.40 → تحذير + إعادة تشغيل sheikha-api
#   درجة < 0.40 → حرج  + failover إلى 8090 + تنبيه

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# ── PATH: يدعم NVM + مسارات النظام القياسية ─────────────────────────────
export PATH="/root/.nvm/versions/node/v25.6.1/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:${PATH:-}"

# ─── خيارات CLI ──────────────────────────────────────────────────────────────
JSON_OUT=false
RUN_ONCE=false
INTERVAL=60

for arg in "$@"; do
    case "$arg" in
        --json)         JSON_OUT=true ;;
        --once)         RUN_ONCE=true ;;
        --interval=*)   INTERVAL="${arg#--interval=}" ;;
    esac
done

# ─── إعدادات ─────────────────────────────────────────────────────────────────
PRIMARY_PORT=8080
FALLBACK_PORT=8090
PRIMARY_URL="http://127.0.0.1:${PRIMARY_PORT}/api/health"
FALLBACK_URL="http://127.0.0.1:${FALLBACK_PORT}/api/health"
NGINX_SITE_FILE='/etc/nginx/sites-available/default'
LOG_FILE='/var/log/sheikha-neural.log'
PM2_APP_NAME='sheikha-api'

TELEGRAM_BOT_TOKEN="${SHEIKHA_TG_BOT_TOKEN:-}"
TELEGRAM_CHAT_ID="${SHEIKHA_TG_CHAT_ID:-}"

# أوزان الخلايا العصبية (مجموع = 1.0)
W_HTTP=40   # HTTP 8080     → 0.40  (× 100 لتجنب الكسور في bash)
W_PM2=20    # PM2 active    → 0.20
W_NGINX=20  # nginx         → 0.20
W_DB=10     # JSON/data     → 0.10
W_RAM=10    # RAM < 90%     → 0.10

# ─── ألوان (تُعطَّل تلقائيًّا مع --json) ─────────────────────────────────────
if [[ "$JSON_OUT" == false ]]; then
    RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
    CYAN='\033[0;36m'; MAGENTA='\033[0;35m'; RESET='\033[0m'
else
    RED=''; GREEN=''; YELLOW=''; CYAN=''; MAGENTA=''; RESET=''
fi

log()   { [[ "$JSON_OUT" == false ]] && echo -e "${CYAN}[NCN]${RESET} $*" || true; }
ok()    { [[ "$JSON_OUT" == false ]] && echo -e "${GREEN}[NCN] ✅${RESET} $*" || true; }
warn()  { [[ "$JSON_OUT" == false ]] && echo -e "${YELLOW}[NCN] ⚠️ ${RESET} $*" || true; }
fail()  { [[ "$JSON_OUT" == false ]] && echo -e "${RED}[NCN] ❌${RESET} $*" || true; }
pulse() { [[ "$JSON_OUT" == false ]] && echo -e "${MAGENTA}[NCN] 🧠${RESET} $*" || true; }

# ─── تسجيل + تنبيه ───────────────────────────────────────────────────────────
send_alert() {
    local msg="$1"
    echo "$(date '+%F %T') $msg" >> "$LOG_FILE" 2>/dev/null || true
    logger -t neural-monitor "$msg" 2>/dev/null || true
    if [[ -n "$TELEGRAM_BOT_TOKEN" && -n "$TELEGRAM_CHAT_ID" ]]; then
        curl -fsS --max-time 10 \
            "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
            -d "chat_id=${TELEGRAM_CHAT_ID}" \
            -d "text=🧠 شيخة-NCN — ${msg}" \
            -d "parse_mode=HTML" > /dev/null 2>&1 || true
    fi
}

# ─── فحص HTTP (طبقة 0 — النواة) ─────────────────────────────────────────────
check_http() {
    local url="$1"
    local code
    code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>/dev/null || echo '000')
    echo "$code"
}

# ─── طبقة 0: HTTP على المنفذ الرئيسي ─────────────────────────────────────────
layer0_http() {
    local score=0
    local code
    code=$(check_http "$PRIMARY_URL")
    if [[ "$code" == '200' ]]; then
        ok "طبقة-0 HTTP/${PRIMARY_PORT}: $code — طبيعي"
        score=$W_HTTP
    else
        local fallback_code
        fallback_code=$(check_http "$FALLBACK_URL")
        if [[ "$fallback_code" == '200' ]]; then
            warn "طبقة-0 HTTP/${PRIMARY_PORT}: $code — الاحتياطي ${FALLBACK_PORT} يعمل"
            score=$(( W_HTTP / 2 ))
        else
            fail "طبقة-0 HTTP: كلا المنفذين فشلا (${PRIMARY_PORT}=$code / ${FALLBACK_PORT}=$fallback_code)"
            score=0
        fi
    fi
    echo "$score"
}

# ─── طبقة 1: قواعد البيانات JSON ─────────────────────────────────────────────
layer1_db() {
    local score=0
    local data_dir="${PROJECT_DIR}/data"
    local readable=0
    local total=0

    if [[ -d "$data_dir" ]]; then
        while IFS= read -r -d '' f; do
            ((total++)) || true
            # تمرير المسار كوسيط بدلاً من الإدراج المباشر في النص
            if [[ -r "$f" ]] && node -e "JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'))" -- "$f" 2>/dev/null; then
                ((readable++)) || true
            fi
        done < <(find "$data_dir" -maxdepth 2 -name '*.json' -print0 2>/dev/null)
    fi

    if [[ $total -eq 0 ]]; then
        warn "طبقة-1 JSON: لا يوجد ملفات بيانات"
        score=$(( W_DB / 2 ))
    elif [[ $readable -eq $total ]]; then
        ok "طبقة-1 JSON: $readable/$total ملفات قابلة للقراءة"
        score=$W_DB
    elif [[ $readable -ge $(( total / 2 )) ]]; then
        warn "طبقة-1 JSON: $readable/$total ملفات قابلة للقراءة"
        score=$(( W_DB / 2 ))
    else
        fail "طبقة-1 JSON: $readable/$total ملفات — فشل"
        score=0
    fi
    echo "$score"
}

# ─── طبقة 2: PM2 ─────────────────────────────────────────────────────────────
layer2_pm2() {
    local score=0
    if ! command -v pm2 &>/dev/null; then
        warn "طبقة-2 PM2: غير مثبّت"
        score=$(( W_PM2 / 2 ))
    else
        local online
        online=$(pm2 jlist 2>/dev/null \
            | node -e "try{const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
                console.log(d.filter(p=>p.pm2_env&&p.pm2_env.status==='online').length);}
                catch(e){console.log(0);}" 2>/dev/null || echo '0')
        if [[ "${online:-0}" -gt 0 ]]; then
            ok "طبقة-2 PM2: $online عملية نشطة"
            score=$W_PM2
        else
            fail "طبقة-2 PM2: لا عمليات نشطة"
            score=0
        fi
    fi
    echo "$score"
}

# ─── طبقة 2: nginx ───────────────────────────────────────────────────────────
layer2_nginx() {
    local score=0
    if command -v systemctl &>/dev/null && systemctl is-active --quiet nginx 2>/dev/null; then
        ok "طبقة-2 nginx: يعمل"
        score=$W_NGINX
    elif command -v nginx &>/dev/null && nginx -t &>/dev/null; then
        warn "طبقة-2 nginx: التهيئة صحيحة لكن الخدمة غير نشطة"
        score=$(( W_NGINX / 2 ))
    else
        warn "طبقة-2 nginx: غير متوفر أو متوقف"
        score=$(( W_NGINX / 2 ))
    fi
    echo "$score"
}

# ─── طبقة 2: RAM ─────────────────────────────────────────────────────────────
layer2_ram() {
    local score=0
    if command -v free &>/dev/null; then
        local mem_pct
        mem_pct=$(free | awk '/^Mem:/{printf "%.0f", $3/$2*100}')
        if [[ ${mem_pct:-0} -lt 90 ]]; then
            ok "طبقة-2 RAM: ${mem_pct}% مستخدمة — طبيعي"
            score=$W_RAM
        elif [[ ${mem_pct:-0} -lt 95 ]]; then
            warn "طبقة-2 RAM: ${mem_pct}% مستخدمة — مرتفع"
            score=$(( W_RAM / 2 ))
        else
            fail "طبقة-2 RAM: ${mem_pct}% مستخدمة — حرج"
            score=0
        fi
    else
        warn "طبقة-2 RAM: أمر free غير متوفر"
        score=$(( W_RAM / 2 ))
    fi
    echo "$score"
}

# ─── القرار الذكي ─────────────────────────────────────────────────────────────
smart_decision() {
    local total_score="$1"
    # total_score هو مجموع الأوزان × 100 (الحد الأقصى = 100)
    # عتبة التحذير: 60 / عتبة الحرج: 40

    if [[ $total_score -ge 60 ]]; then
        pulse "القرار: صحي — درجة=${total_score}/100"
        echo "$(date '+%F %T') score=${total_score} status=healthy" >> "$LOG_FILE" 2>/dev/null || true
        return 0
    fi

    if [[ $total_score -ge 40 ]]; then
        warn "القرار: تدهور — درجة=${total_score}/100 — إعادة تشغيل ${PM2_APP_NAME}"
        send_alert "score=${total_score} status=degraded action=restart service=${PM2_APP_NAME}"
        if command -v pm2 &>/dev/null; then
            pm2 restart "$PM2_APP_NAME" 2>/dev/null || true
        elif command -v systemctl &>/dev/null; then
            systemctl restart sheikha-main 2>/dev/null || true
        fi
        return 1
    fi

    # درجة < 40 — حرج: failover إلى 8090
    fail "القرار: حرج — درجة=${total_score}/100 — failover إلى ${FALLBACK_PORT}"
    send_alert "score=${total_score} status=critical action=failover from=${PRIMARY_PORT} to=${FALLBACK_PORT}"

    if [[ -f "$NGINX_SITE_FILE" ]] && grep -q "127.0.0.1:${PRIMARY_PORT}" "$NGINX_SITE_FILE" 2>/dev/null; then
        sed -i "s/127.0.0.1:${PRIMARY_PORT}/127.0.0.1:${FALLBACK_PORT}/g" "$NGINX_SITE_FILE" || true
        if nginx -t &>/dev/null 2>&1; then
            systemctl reload nginx 2>/dev/null || true
            send_alert "nginx_failover_done from=${PRIMARY_PORT} to=${FALLBACK_PORT}"
        fi
    fi
    return 2
}

# ─── دورة مراقبة واحدة ───────────────────────────────────────────────────────
run_cycle() {
    local ts
    ts=$(date -u '+%Y-%m-%dT%H:%M:%SZ')

    if [[ "$JSON_OUT" == false ]]; then
        echo ""
        echo "╔══════════════════════════════════════════════════════╗"
        echo "║  🧠 شبكة الخلايا العصبية الجذرية — Neural Monitoring ║"
        echo "╚══════════════════════════════════════════════════════╝"
        log "الوقت: $ts"
        echo ""
        log "── طبقة 0: النواة (HTTP) ──────────────────────────────"
    fi

    local s0 s1 s2 s3 s4
    s0=$(layer0_http)

    if [[ "$JSON_OUT" == false ]]; then
        log "── طبقة 1: العصبون (JSON/DB) ──────────────────────────"
    fi
    s1=$(layer1_db)

    if [[ "$JSON_OUT" == false ]]; then
        log "── طبقة 2: الشبكة (PM2 / nginx / RAM) ─────────────────"
    fi
    s2=$(layer2_pm2)
    s3=$(layer2_nginx)
    s4=$(layer2_ram)

    local total=$(( s0 + s1 + s2 + s3 + s4 ))

    if [[ "$JSON_OUT" == true ]]; then
        # إخراج JSON
        local status
        if   [[ $total -ge 60 ]]; then status='healthy'
        elif [[ $total -ge 40 ]]; then status='degraded'
        else                            status='critical'
        fi
        printf '{\n  "timestamp": "%s",\n  "score": %d,\n  "max_score": 100,\n  "status": "%s",\n  "layers": {\n    "http_8080": %d,\n    "json_db": %d,\n    "pm2": %d,\n    "nginx": %d,\n    "ram": %d\n  },\n  "weights": {\n    "http_8080": %d,\n    "json_db": %d,\n    "pm2": %d,\n    "nginx": %d,\n    "ram": %d\n  }\n}\n' \
            "$ts" "$total" "$status" \
            "$s0" "$s1" "$s2" "$s3" "$s4" \
            "$W_HTTP" "$W_DB" "$W_PM2" "$W_NGINX" "$W_RAM"
    else
        echo ""
        pulse "درجة الصحة الإجمالية: ${total}/100"
        echo ""
        smart_decision "$total"
    fi
}

# ─── الحلقة الرئيسية ─────────────────────────────────────────────────────────
if [[ "$JSON_OUT" == false ]]; then
    echo ""
    echo "  ╔══════════════════════════════════════╗"
    echo "  ║  بسم الله الرحمن الرحيم              ║"
    echo "  ║  Neural Control Network — شيخة       ║"
    echo "  ╚══════════════════════════════════════╝"
    echo ""
fi

if [[ "$RUN_ONCE" == true ]]; then
    run_cycle
else
    while true; do
        run_cycle
        if [[ "$JSON_OUT" == false ]]; then
            log "الجولة التالية بعد ${INTERVAL} ثانية..."
        fi
        sleep "$INTERVAL"
    done
fi
