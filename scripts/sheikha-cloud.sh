#!/usr/bin/env bash
# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║                        sheikha-cloud.sh                                     ║
# ║              سكربت Sheikha Cloud — إدارة البيئات والنشر والنسخ              ║
# ╚══════════════════════════════════════════════════════════════════════════════╝
#
# الاستخدام:
#   ./scripts/sheikha-cloud.sh [status|env|backup|beacon|info]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
CMD="${1:-status}"

# ─── Colors ───────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
RESET='\033[0m'

log()  { echo -e "${CYAN}[SHEIKHA-CLOUD]${RESET} $*"; }
ok()   { echo -e "${GREEN}[SHEIKHA-CLOUD] ✅${RESET} $*"; }
warn() { echo -e "${YELLOW}[SHEIKHA-CLOUD] ⚠️ ${RESET} $*"; }

# ─── Environment Detection ────────────────────────────────────────────────────

detect_env() {
    ENV="${NODE_ENV:-local}"
    case "$ENV" in
        production) echo "🔴 production" ;;
        pilot)      echo "🟡 pilot" ;;
        dev)        echo "🟢 dev" ;;
        *)          echo "🔵 local" ;;
    esac
}

# ─── Commands ─────────────────────────────────────────────────────────────────

cmd_status() {
    echo ""
    echo "╔══════════════════════════════════════════╗"
    echo "║        SHEIKHA CLOUD — حالة السحابة       ║"
    echo "╚══════════════════════════════════════════╝"
    log "البيئة:    $(detect_env)"
    log "التاريخ:   $(date '+%Y-%m-%d %H:%M:%S %Z')"

    # GitHub
    if [[ -n "${GITHUB_TOKEN:-}" ]]; then
        ok "GitHub: متصل"
    else
        warn "GitHub: GITHUB_TOKEN غير مُعيَّن"
    fi

    # Google Cloud
    if command -v gcloud &>/dev/null; then
        ok "gcloud CLI متوفر"
    else
        warn "gcloud CLI غير مثبّت"
    fi

    # Docker
    if command -v docker &>/dev/null && docker info &>/dev/null 2>&1; then
        ok "Docker يعمل"
    else
        warn "Docker غير متوفر أو لا يعمل"
    fi

    echo ""
}

cmd_env() {
    echo ""
    log "متغيرات البيئة الحرجة:"
    echo ""

    check_var() {
        local var="$1"
        local desc="$2"
        if [[ -n "${!var:-}" ]]; then
            ok "$desc ($var): ✔"
        else
            warn "$desc ($var): غير مُعيَّن"
        fi
    }

    check_var NODE_ENV           "بيئة Node"
    check_var PORT               "المنفذ"
    check_var OPENAI_API_KEY     "OpenAI API Key"
    check_var META_PIXEL_ID      "Meta Pixel ID"
    check_var META_ACCESS_TOKEN  "Meta Access Token"
    check_var GITHUB_TOKEN       "GitHub Token"
    check_var DATA_ENCRYPTION_KEY "مفتاح التشفير"
    echo ""
}

cmd_backup() {
    BACKUP_DIR="${PROJECT_DIR}/backups/$(date '+%Y%m%d_%H%M%S')"
    mkdir -p "$BACKUP_DIR"

    log "إنشاء نسخة احتياطية في: $BACKUP_DIR"

    # نسخ ملفات البيانات
    if [[ -d "${PROJECT_DIR}/data" ]]; then
        cp -r "${PROJECT_DIR}/data" "${BACKUP_DIR}/data"
        ok "نسخ مجلد data"
    fi

    # نسخ ملف .env إن وجد (محجوب من git)
    if [[ -f "${PROJECT_DIR}/.env" ]]; then
        cp "${PROJECT_DIR}/.env" "${BACKUP_DIR}/.env.backup"
        ok "نسخ .env"
    fi

    # ملف الحالة
    cat > "${BACKUP_DIR}/backup-manifest.json" <<EOF
{
  "timestamp": "$(date -u '+%Y-%m-%dT%H:%M:%SZ')",
  "environment": "${NODE_ENV:-local}",
  "project": "sheikha-main-portal",
  "host": "$(hostname)",
  "backupDir": "$BACKUP_DIR"
}
EOF
    ok "تمّت النسخة الاحتياطية: $BACKUP_DIR"
    echo ""
}

cmd_beacon() {
    PORT="${PORT:-8080}"
    log "فحص نبضة السحابة..."

    if command -v curl &>/dev/null; then
        for endpoint in "health" "api/status" ""; do
            URL="http://localhost:${PORT}/${endpoint}"
            STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL" 2>/dev/null || echo "000")
            if [[ "$STATUS" == "200" ]]; then
                ok "$URL → $STATUS"
            else
                warn "$URL → $STATUS"
            fi
        done
    else
        warn "curl غير متوفر"
    fi
    echo ""
}

cmd_info() {
    echo ""
    echo "╔══════════════════════════════════════════╗"
    echo "║      SHEIKHA CLOUD — بنية السحابة         ║"
    echo "╚══════════════════════════════════════════╝"
    echo ""
    echo "  النطاقات:"
    echo "    🌐 sheikha.top"
    echo "    🔌 api.sheikha.top"
    echo "    🛠  admin.sheikha.top"
    echo "    ⚙️  core.sheikha.top"
    echo "    🏪 market.sheikha.top"
    echo "    🤖 ai.sheikha.top"
    echo ""
    echo "  البيئات:"
    echo "    local → dev → pilot → production"
    echo ""
    echo "  مصادر الكود:"
    echo "    GitHub (primary) → GitLab (mirror)"
    echo ""
    echo "  البنية التحتية:"
    echo "    VPS runtime | Cloud services | Backup"
    echo ""
}

# ─── Main ─────────────────────────────────────────────────────────────────────

case "$CMD" in
    status) cmd_status ;;
    env)    cmd_env ;;
    backup) cmd_backup ;;
    beacon) cmd_beacon ;;
    info)   cmd_info ;;
    *)
        echo ""
        echo "الاستخدام: $0 [status|env|backup|beacon|info]"
        echo ""
        echo "  status  — حالة السحابة والتكاملات"
        echo "  env     — فحص متغيرات البيئة"
        echo "  backup  — إنشاء نسخة احتياطية"
        echo "  beacon  — فحص نبضة الخوادم"
        echo "  info    — معلومات بنية السحابة"
        echo ""
        exit 1
        ;;
esac
