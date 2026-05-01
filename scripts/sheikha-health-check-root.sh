#!/usr/bin/env bash
# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║                   sheikha-health-check-root.sh                              ║
# ║         فحص صحة منظومة شيخة الأساسية — Sheikha Root Health Check           ║
# ╚══════════════════════════════════════════════════════════════════════════════╝
#
# الاستخدام:
#   ./scripts/sheikha-health-check-root.sh [--json] [--port PORT]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
JSON_OUT=false
PORT="${PORT:-8080}"

# معالجة الوسائط
for arg in "$@"; do
    case "$arg" in
        --json)    JSON_OUT=true ;;
        --port=*)  PORT="${arg#--port=}" ;;
    esac
done

# ─── Colors ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RESET='\033[0m'

log()  { [[ "$JSON_OUT" == false ]] && echo -e "${CYAN}[HEALTH]${RESET} $*" || true; }
ok()   { [[ "$JSON_OUT" == false ]] && echo -e "${GREEN}[HEALTH] ✅${RESET} $*" || true; }
warn() { [[ "$JSON_OUT" == false ]] && echo -e "${YELLOW}[HEALTH] ⚠️ ${RESET} $*" || true; }
fail() { [[ "$JSON_OUT" == false ]] && echo -e "${RED}[HEALTH] ❌${RESET} $*" || true; }

# ─── State ────────────────────────────────────────────────────────────────────

OVERALL="healthy"
declare -a CHECKS=()
declare -a WARNINGS=()
declare -a FAILURES=()

add_ok()   { CHECKS+=("$1:ok"); }
add_warn() { CHECKS+=("$1:warn"); WARNINGS+=("$1"); [[ "$OVERALL" != "unhealthy" ]] && OVERALL="degraded"; }
add_fail() { CHECKS+=("$1:fail"); FAILURES+=("$1"); OVERALL="unhealthy"; }

# ─── Checks ───────────────────────────────────────────────────────────────────

check_node() {
    if command -v node &>/dev/null; then
        NODE_VER=$(node --version)
        ok "Node.js: $NODE_VER"
        add_ok "node"
    else
        fail "Node.js غير مثبّت"
        add_fail "node"
    fi
}

check_server() {
    if command -v curl &>/dev/null; then
        STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
            --connect-timeout 3 --max-time 5 \
            "http://localhost:${PORT}/health" 2>/dev/null || echo "000")
        if [[ "$STATUS" == "200" ]]; then
            ok "HTTP /health: $STATUS"
            add_ok "http_health"
        elif [[ "$STATUS" == "000" ]]; then
            warn "الخادم لا يستجيب على المنفذ $PORT"
            add_warn "http_health"
        else
            warn "HTTP /health: $STATUS"
            add_warn "http_health"
        fi
    else
        warn "curl غير متوفر"
        add_warn "curl_unavailable"
    fi
}

check_memory() {
    if command -v free &>/dev/null; then
        MEM_PCT=$(free | awk '/^Mem:/{printf "%.0f", $3/$2*100}')
        if [[ ${MEM_PCT:-0} -gt 90 ]]; then
            fail "ذاكرة حرجة: ${MEM_PCT}% مستخدمة"
            add_fail "memory"
        elif [[ ${MEM_PCT:-0} -gt 75 ]]; then
            warn "ذاكرة مرتفعة: ${MEM_PCT}% مستخدمة"
            add_warn "memory"
        else
            ok "الذاكرة: ${MEM_PCT:-unknown}% مستخدمة"
            add_ok "memory"
        fi
    else
        warn "أمر free غير متوفر"
        add_warn "memory_check_unavailable"
    fi
}

check_disk() {
    if command -v df &>/dev/null; then
        DISK_PCT=$(df -h "$PROJECT_DIR" 2>/dev/null | awk 'NR==2{gsub(/%/,""); print $5}' || echo "0")
        if [[ ${DISK_PCT:-0} -gt 90 ]]; then
            fail "مساحة القرص حرجة: ${DISK_PCT}% مستخدمة"
            add_fail "disk"
        elif [[ ${DISK_PCT:-0} -gt 75 ]]; then
            warn "مساحة القرص مرتفعة: ${DISK_PCT}% مستخدمة"
            add_warn "disk"
        else
            ok "القرص: ${DISK_PCT:-unknown}% مستخدمة"
            add_ok "disk"
        fi
    fi
}

check_core_files() {
    local -a CORE_FILES=(
        "core/sheikha-root.js"
        "core/sheikha-os.js"
        "core/sheikha-control-plane.js"
        "core/sheikha-voice.js"
        "core/sheikha-governance.json"
        "core/sheikha-saas-root.js"
        "core/sheikha-cloud-root.js"
        "core/sheikha-impact-engine.js"
    )
    local MISSING=0
    for f in "${CORE_FILES[@]}"; do
        if [[ ! -f "${PROJECT_DIR}/$f" ]]; then
            warn "ملف core مفقود: $f"
            ((MISSING++)) || true
        fi
    done
    if [[ $MISSING -eq 0 ]]; then
        ok "ملفات core: كاملة (${#CORE_FILES[@]}/${#CORE_FILES[@]})"
        add_ok "core_files"
    else
        warn "ملفات core مفقودة: $MISSING"
        add_warn "core_files"
    fi
}

check_lib_dirs() {
    local -a LIB_DIRS=("lib/meta" "lib/ai" "lib/integrations" "lib/data" "lib/runtime")
    local MISSING=0
    for d in "${LIB_DIRS[@]}"; do
        if [[ ! -d "${PROJECT_DIR}/$d" ]]; then
            warn "مجلد lib مفقود: $d"
            ((MISSING++)) || true
        fi
    done
    if [[ $MISSING -eq 0 ]]; then
        ok "مجلدات lib: كاملة"
        add_ok "lib_dirs"
    else
        add_warn "lib_dirs"
    fi
}

check_pm2() {
    if command -v pm2 &>/dev/null; then
        ONLINE=$(pm2 jlist 2>/dev/null | node -e \
            "try{const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));console.log(d.filter(p=>p.pm2_env.status==='online').length);}catch(e){console.log(0);}" \
            2>/dev/null || echo "0")
        if [[ "${ONLINE:-0}" -gt 0 ]]; then
            ok "PM2: $ONLINE عملية نشطة"
            add_ok "pm2"
        else
            warn "PM2: لا توجد عمليات نشطة"
            add_warn "pm2"
        fi
    else
        warn "PM2 غير مثبّت"
        add_warn "pm2_unavailable"
    fi
}

# ─── Run All Checks ───────────────────────────────────────────────────────────

TIMESTAMP=$(date -u '+%Y-%m-%dT%H:%M:%SZ')

if [[ "$JSON_OUT" == false ]]; then
    echo ""
    echo "╔══════════════════════════════════════════╗"
    echo "║    SHEIKHA ROOT — فحص الصحة الشامل       ║"
    echo "╚══════════════════════════════════════════╝"
    log "الوقت: $TIMESTAMP | المنفذ: $PORT"
    echo ""
fi

check_node
check_server
check_memory
check_disk
check_pm2
check_core_files
check_lib_dirs

# ─── Output ───────────────────────────────────────────────────────────────────

if [[ "$JSON_OUT" == true ]]; then
    CHECKS_STR=$(IFS=','; printf '"%s",' "${CHECKS[@]}" | sed 's/,$//')
    WARN_STR=$(IFS=',';   printf '"%s",' "${WARNINGS[@]}" 2>/dev/null | sed 's/,$//' || echo "")
    FAIL_STR=$(IFS=',';   printf '"%s",' "${FAILURES[@]}" 2>/dev/null | sed 's/,$//' || echo "")

    printf '{\n  "status":    "%s",\n  "timestamp": "%s",\n  "port":      %s,\n  "checks":    [%s],\n  "warnings":  [%s],\n  "failures":  [%s]\n}\n' \
        "$OVERALL" "$TIMESTAMP" "$PORT" "$CHECKS_STR" "$WARN_STR" "$FAIL_STR"
else
    echo ""
    case "$OVERALL" in
        healthy)   ok  "المنظومة صحية تمامًا ✔" ;;
        degraded)  warn "المنظومة تعمل مع تحذيرات" ;;
        unhealthy) fail "المنظومة تحتاج انتباهًا فوريًا!" ;;
    esac
    echo ""
fi

case "$OVERALL" in
    healthy)   exit 0 ;;
    degraded)  exit 1 ;;
    unhealthy) exit 2 ;;
esac
