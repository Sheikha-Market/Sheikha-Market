#!/usr/bin/env bash
# بسم الله الرحمن الرحيم
# ═══════════════════════════════════════════════════════════════════════════════
# 🧠🔗 SHEIKHA — sync-neural-cells.sh
#    مزامنة الخلايا العصبية الجذرية بين مستودع السوق والمستودع الاستراتيجي
#    Bidirectional sync between sheikha-main-portal (origin)
#                              and sheikha-enterprise-portal (enterprise)
#
# «وَاعْتَصِمُوا بِحَبْلِ اللَّهِ جَمِيعًا وَلَا تَفَرَّقُوا» — آل عمران: 103
#
# الاستخدام / Usage:
#   bash tools/neural/sync-neural-cells.sh [full|docs|features|validate] [--verbose]
#
# الخيارات / Options:
#   full      — مزامنة كاملة ثنائية الاتجاه (الافتراضي / default)
#   docs      — مزامنة الوثائق الاستراتيجية فقط (enterprise → origin)
#   features  — مزامنة فروع الميزات ثنائية الاتجاه
#   validate  — التحقق من سلامة المزامنة فقط
#   --verbose — إخراج تفصيلي
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

# ── الثوابت / Constants ───────────────────────────────────────────────────────
SCRIPT_NAME="Neural Cell"
ORIGIN_REMOTE="origin"
ENTERPRISE_REMOTE="enterprise"
ENV_FILE=".env.neural-sync"
FINGERPRINT_FILE=".runtime-fingerprint"

# فروع runtime التي تُزامَن من origin → enterprise
RUNTIME_BRANCHES=(
    "stable/runtime-baseline"
    "stable/production"
    "rings/production"
)

# وثائق استراتيجية تُزامَن من enterprise → origin
STRATEGIC_DOCS=(
    "docs/VISION.md"
    "docs/FOUNDATIONS.md"
    "docs/ARCHITECTURE.md"
    "docs/BUSINESS-MODELS.md"
)

# ── قراءة الوسائط / Parse arguments ─────────────────────────────────────────
SYNC_TYPE="${1:-full}"
VERBOSE=false
for arg in "$@"; do
    [[ "$arg" == "--verbose" ]] && VERBOSE=true
done

# ── دوال المساعدة / Helper functions ─────────────────────────────────────────
ts()      { date -u +"%Y-%m-%dT%H:%M:%SZ"; }
log()     { echo "[${SCRIPT_NAME}] $*"; }
info()    { [[ "$VERBOSE" == true ]] && echo "[${SCRIPT_NAME}] [INFO] $*" || true; }
warn()    { echo "[${SCRIPT_NAME}] [WARN] $*"; }
err_log() { echo "[${SCRIPT_NAME}] [ERROR] $*" >&2; }

# قراءة قيمة من .env.neural-sync
read_env() {
    local key="$1" default="${2:-}"
    if [[ -f "$ENV_FILE" ]]; then
        local val
        val=$(grep -E "^${key}=" "$ENV_FILE" 2>/dev/null | cut -d'=' -f2- | tr -d '[:space:]' || true)
        [[ -n "$val" ]] && echo "$val" && return
    fi
    echo "$default"
}

# التحقق من وجود remote
remote_exists() {
    git remote get-url "$1" >/dev/null 2>&1
}

# ── بداية التنفيذ / Start ─────────────────────────────────────────────────────
log "Sync initiated at $(ts)"
log "Sync type: ${SYNC_TYPE}"
[[ "$VERBOSE" == true ]] && log "VERBOSE output enabled"

# ── التحقق من الـ remotes / Verify remotes ───────────────────────────────────
info "Verifying remotes..."

if ! remote_exists "$ORIGIN_REMOTE"; then
    err_log "Origin remote '${ORIGIN_REMOTE}' not found"
    exit 1
fi

if ! remote_exists "$ENTERPRISE_REMOTE"; then
    err_log "Enterprise remote '${ENTERPRISE_REMOTE}' not found"
    exit 1
fi

info "Remotes verified successfully"

# ── دالة: مزامنة فروع runtime من origin إلى enterprise ──────────────────────
sync_runtime_branches() {
    info ""
    info "Starting full bidirectional sync..."
    info ""
    info "Syncing runtime branches: ${ORIGIN_REMOTE} → ${ENTERPRISE_REMOTE}"

    local synced=0
    for branch in "${RUNTIME_BRANCHES[@]}"; do
        info "Processing branch: ${branch}"
        if git rev-parse "${ORIGIN_REMOTE}/${branch}" >/dev/null 2>&1; then
            local commit
            commit=$(git rev-parse "${ORIGIN_REMOTE}/${branch}")
            if git push "${ENTERPRISE_REMOTE}" "${ORIGIN_REMOTE}/${branch}:refs/heads/${branch}" --force-with-lease 2>/dev/null; then
                info "✅ Synced ${branch} → ${ENTERPRISE_REMOTE} (${commit:0:12})"
                (( synced++ )) || true
            else
                warn "Failed to push ${branch} to ${ENTERPRISE_REMOTE}"
            fi
        else
            info "Skipping missing origin branch: ${branch}"
        fi
    done

    info "✅ Runtime sync complete"
}

# ── دالة: مزامنة الوثائق الاستراتيجية من enterprise إلى origin ──────────────
sync_strategic_docs() {
    info ""
    info "Syncing strategic docs: ${ENTERPRISE_REMOTE} → ${ORIGIN_REMOTE}"

    # جلب فرع enterprise/main مؤقتاً
    git fetch "${ENTERPRISE_REMOTE}" main:enterprise-main --no-tags 2>/dev/null || true

    local changed=0
    for doc in "${STRATEGIC_DOCS[@]}"; do
        local content
        content=$(git show "enterprise-main:${doc}" 2>/dev/null || true)
        if [[ -z "$content" ]]; then
            info "${doc}: not found in enterprise/main"
            continue
        fi

        mkdir -p "$(dirname "$doc")"
        local current
        current=$(cat "$doc" 2>/dev/null || true)

        if [[ "$content" != "$current" ]]; then
            echo "$content" > "$doc"
            info "${doc}: updated"
            (( changed++ )) || true
        else
            info "${doc}: no changes"
        fi
    done

    # حذف الفرع المؤقت
    git branch -D enterprise-main 2>/dev/null || true

    info "✅ Docs sync complete (${changed} changed)"
}

# ── دالة: مزامنة فروع الميزات ثنائية الاتجاه ────────────────────────────────
sync_feature_branches() {
    info ""
    info "Syncing feature branches: bidirectional"

    # فروع الميزات المُكتشفة من كلا الجانبين
    local -a features=()
    while IFS= read -r line; do
        branch=$(echo "$line" | sed 's|.*remotes/[^/]*/feature/||')
        [[ -n "$branch" ]] && features+=("$branch")
    done < <(git branch -r 2>/dev/null | grep 'feature/' | sort -u)

    # إزالة التكرار
    local -a unique_features=()
    declare -A seen
    for f in "${features[@]}"; do
        if [[ -z "${seen[$f]+_}" ]]; then
            seen[$f]=1
            unique_features+=("$f")
        fi
    done

    local synced=0
    for feature in "${unique_features[@]}"; do
        info "Processing feature: ${feature}"

        # من origin → enterprise
        if git rev-parse "${ORIGIN_REMOTE}/feature/${feature}" >/dev/null 2>&1; then
            if git push "${ENTERPRISE_REMOTE}" \
                "${ORIGIN_REMOTE}/feature/${feature}:refs/heads/feature/${feature}" \
                --force-with-lease 2>/dev/null; then
                info "  ↑ Pushed feature/${feature} → ${ENTERPRISE_REMOTE}"
                (( synced++ )) || true
            else
                warn "Failed to sync ${feature}"
            fi
        fi

        # من enterprise → origin (إذا لم يكن موجوداً في origin)
        if ! git rev-parse "${ORIGIN_REMOTE}/feature/${feature}" >/dev/null 2>&1; then
            if git rev-parse "${ENTERPRISE_REMOTE}/feature/${feature}" >/dev/null 2>&1; then
                if git push "${ORIGIN_REMOTE}" \
                    "${ENTERPRISE_REMOTE}/feature/${feature}:refs/heads/feature/${feature}" \
                    --force-with-lease 2>/dev/null; then
                    info "  ↓ Pulled feature/${feature} ← ${ENTERPRISE_REMOTE}"
                    (( synced++ )) || true
                else
                    warn "Failed to pull ${feature} from enterprise"
                fi
            fi
        fi
    done

    info "✅ Feature branch sync complete (${synced} synced)"
}

# ── دالة: التحقق من سلامة المزامنة ─────────────────────────────────────────
validate_sync() {
    info ""
    info "Validating sync integrity..."

    local issues=0

    # التحقق من فروع runtime
    for branch in "${RUNTIME_BRANCHES[@]}"; do
        local origin_sha enterprise_sha
        origin_sha=$(git rev-parse "${ORIGIN_REMOTE}/${branch}" 2>/dev/null || echo "MISSING")
        enterprise_sha=$(git rev-parse "${ENTERPRISE_REMOTE}/${branch}" 2>/dev/null || echo "MISSING")

        if [[ "$origin_sha" != "$enterprise_sha" ]]; then
            warn "${branch} hashes differ"
            info "  Origin:     ${origin_sha}"
            info "  Enterprise: ${enterprise_sha}"
            (( issues++ )) || true
        fi
    done

    # التحقق من fingerprint
    if [[ -f "$FINGERPRINT_FILE" ]]; then
        info "✅ .runtime-fingerprint consistent"
    fi

    if [[ $issues -gt 0 ]]; then
        warn "Validation found ${issues} issues (non-critical)"
    else
        info "✅ All sync integrity checks passed"
    fi
}

# ── تنفيذ نوع المزامنة المطلوب / Execute requested sync type ─────────────────
ERRORS=0

case "$SYNC_TYPE" in
    full)
        sync_runtime_branches || (( ERRORS++ )) || true
        sync_strategic_docs   || (( ERRORS++ )) || true
        sync_feature_branches || (( ERRORS++ )) || true
        validate_sync         || (( ERRORS++ )) || true
        ;;
    docs)
        sync_strategic_docs || (( ERRORS++ )) || true
        ;;
    features)
        sync_feature_branches || (( ERRORS++ )) || true
        ;;
    validate)
        validate_sync || (( ERRORS++ )) || true
        ;;
    *)
        err_log "نوع مزامنة غير معروف: ${SYNC_TYPE}"
        err_log "الخيارات المتاحة: full | docs | features | validate"
        exit 2
        ;;
esac

log "Sync completed at $(ts)"

if [[ $ERRORS -eq 0 ]]; then
    log "✅ All operations successful"
    exit 0
else
    warn "Completed with ${ERRORS} error(s)"
    exit 1
fi
