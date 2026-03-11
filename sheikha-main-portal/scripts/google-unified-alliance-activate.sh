#!/usr/bin/env bash
set -euo pipefail

# منظومة شيخة - تفعيل الهيكلية السيادية على Google Cloud
# يدعم وضعين:
#   1) --dry-run (افتراضي): عرض ما سيتم تنفيذه بدون تغييرات
#   2) --apply: تنفيذ فعلي

ORG_ID="${ORG_ID:-224557279528}"
PROD_PROJECT="${PROD_PROJECT:-sheikha-marketplace}"
DEV_PROJECT="${DEV_PROJECT:-sheikha-core}"
TEST_PROJECT="${TEST_PROJECT:-sheikha-test}"
BILLING_ACCOUNT="${BILLING_ACCOUNT:-}"
REGION="${REGION:-me-central2}"
REPORT_PATH="${REPORT_PATH:-SHEIKHA-GCLOUD-UNIFIED-ACTIVATION-REPORT.md}"
OPERATOR_PRINCIPAL="${OPERATOR_PRINCIPAL:-}"

MODE="dry-run"
if [[ "${1:-}" == "--apply" ]]; then
    MODE="apply"
fi

API_LIST=(
    "aiplatform.googleapis.com"
    "run.googleapis.com"
    "bigquery.googleapis.com"
    "storage.googleapis.com"
    "cloudfunctions.googleapis.com"
    "monitoring.googleapis.com"
    "cloudresourcemanager.googleapis.com"
    "iam.googleapis.com"
    "serviceusage.googleapis.com"
)

SA_NAME="sheikha-orchestrator"
SA_ROLES=(
    "roles/run.admin"
    "roles/aiplatform.user"
    "roles/bigquery.admin"
    "roles/storage.admin"
    "roles/cloudfunctions.admin"
    "roles/monitoring.editor"
)

OPERATOR_ROLES=(
    "roles/viewer"
    "roles/serviceusage.serviceUsageAdmin"
    "roles/run.admin"
    "roles/aiplatform.user"
    "roles/bigquery.jobUser"
    "roles/storage.objectAdmin"
    "roles/cloudfunctions.developer"
)

log() {
    printf '%s\n' "$*"
}

run_cmd() {
    local cmd="$*"
    if [[ "$MODE" == "dry-run" ]]; then
        log "[DRY-RUN] $cmd"
    else
        log "[APPLY] $cmd"
        eval "$cmd"
    fi
}

run_cmd_soft() {
    local cmd="$*"
    if [[ "$MODE" == "dry-run" ]]; then
        log "[DRY-RUN] $cmd"
        return 0
    fi

    log "[APPLY] $cmd"
    if ! eval "$cmd"; then
        log "⚠️ فشل غير حرج: $cmd"
        return 1
    fi

    return 0
}

ensure_cmd() {
    local cmd="$1"
    if ! command -v "$cmd" >/dev/null 2>&1; then
        if [[ "$MODE" == "dry-run" ]]; then
            log "⚠️ الأداة غير موجودة: $cmd (متابعة بوضع dry-run التحليلي)"
            return 1
        fi

        log "❌ الأداة المطلوبة غير موجودة: $cmd"
        log "   ثبّت Google Cloud CLI أولاً: https://cloud.google.com/sdk/docs/install"
        exit 2
    fi

    return 0
}

project_exists() {
    local project_id="$1"
    gcloud projects describe "$project_id" --format='value(projectId)' >/dev/null 2>&1
}

enable_apis() {
    local project_id="$1"
    local failed_apis=()

    for api in "${API_LIST[@]}"; do
        if ! run_cmd_soft "gcloud services enable $api --project=$project_id"; then
            failed_apis+=("$api")
        fi
    done

    if [[ ${#failed_apis[@]} -gt 0 ]]; then
        log "⚠️ تعذر تفعيل بعض الخدمات في $project_id (غالبًا بسبب Billing/صلاحيات):"
        for api in "${failed_apis[@]}"; do
            log "   - $api"
        done
    fi
}

create_or_verify_project() {
    local project_id="$1"
    if project_exists "$project_id"; then
        log "✅ المشروع موجود: $project_id"
    else
        run_cmd "gcloud projects create $project_id --organization=$ORG_ID"
    fi

    run_cmd "gcloud config set project $project_id"

    if [[ -n "$BILLING_ACCOUNT" ]]; then
        run_cmd "gcloud beta billing projects link $project_id --billing-account=$BILLING_ACCOUNT"
    else
        log "⚠️ BILLING_ACCOUNT غير محدد. سيتم تجاوز ربط الفوترة لهذا المشروع: $project_id"
    fi

    enable_apis "$project_id"
}

ensure_service_account() {
    local project_id="$1"
    local sa_email="$SA_NAME@$project_id.iam.gserviceaccount.com"

    if gcloud iam service-accounts describe "$sa_email" --project "$project_id" >/dev/null 2>&1; then
        log "✅ Service Account موجود: $sa_email"
    else
        run_cmd "gcloud iam service-accounts create $SA_NAME --project=$project_id --display-name='Sheikha Unified Orchestrator'"
    fi

    for role in "${SA_ROLES[@]}"; do
        run_cmd "gcloud projects add-iam-policy-binding $project_id --member=serviceAccount:$sa_email --role=$role"
    done

    run_cmd "mkdir -p credentials"
    run_cmd "gcloud iam service-accounts keys create credentials/${project_id}-${SA_NAME}.json --iam-account=$sa_email --project=$project_id"
}

grant_operator_access() {
    local project_id="$1"

    if [[ -z "$OPERATOR_PRINCIPAL" ]]; then
        log "⚠️ OPERATOR_PRINCIPAL غير محدد. تخطّي منح صلاحيات المشغّل في المشروع: $project_id"
        return 0
    fi

    for role in "${OPERATOR_ROLES[@]}"; do
        run_cmd "gcloud projects add-iam-policy-binding $project_id --member=$OPERATOR_PRINCIPAL --role=$role"
    done
}

write_report() {
    local active_account=""
    if command -v gcloud >/dev/null 2>&1; then
        active_account="$(gcloud auth list --filter=status:ACTIVE --format='value(account)' 2>/dev/null || true)"
    fi
    local timestamp="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"
    local gcloud_status="غير متوفر"
    if command -v gcloud >/dev/null 2>&1; then
        gcloud_status="متوفر"
    fi

    cat > "$REPORT_PATH" <<EOF
# تقرير تفعيل الهيكلية السيادية - Google Cloud

- الوقت: $timestamp
- الوضع: $MODE
- المنظمة: $ORG_ID
- الحساب النشط: ${active_account:-غير متاح}
- الإقليم الافتراضي: $REGION
- حالة gcloud: $gcloud_status

## المشاريع المستهدفة
- إنتاج: $PROD_PROJECT
- تطوير: $DEV_PROJECT
- اختبار: $TEST_PROJECT

## الفوترة
- BILLING_ACCOUNT: ${BILLING_ACCOUNT:-غير محدد}
- ملاحظة: بدون BILLING_ACCOUNT لن يتم الربط التلقائي للفوترة

## حساب التشغيل (بدون بطاقة شخصية)
- OPERATOR_PRINCIPAL: ${OPERATOR_PRINCIPAL:-غير محدد}
- ملاحظة: يفضّل صيغة member كاملة مثل user:market@sheikha.top

## الخدمات المفعلة
$(for api in "${API_LIST[@]}"; do echo "- $api"; done)

## حساب الخدمة
- الاسم: $SA_NAME
- الأدوار:
$(for r in "${SA_ROLES[@]}"; do echo "  - $r"; done)

## أدوار المشغّل
$(for r in "${OPERATOR_ROLES[@]}"; do echo "- $r"; done)

## حالة التنفيذ
- في وضع dry-run: تم عرض الأوامر فقط بدون أي تغيير
- في وضع apply: تم تنفيذ الأوامر الفعلية بحسب الصلاحيات المتاحة
- عند غياب gcloud: يتم إصدار تقرير جاهزية فقط بدون تنفيذ

## أوامر التشغيل
- معاينة: 
  - \
    \
    \
    bash scripts/google-unified-alliance-activate.sh
- تنفيذ فعلي:
  - \
    \
    \
        BILLING_ACCOUNT=XXXX-XXXX-XXXX OPERATOR_PRINCIPAL=user:market@sheikha.top bash scripts/google-unified-alliance-activate.sh --apply
EOF
}

main() {
    log "══════════════════════════════════════════════════════════════"
    log "🚀 تفعيل الهيكلية السيادية Google Cloud | الوضع: $MODE"
    log "══════════════════════════════════════════════════════════════"

    local has_gcloud="false"
    if ensure_cmd gcloud; then
        has_gcloud="true"
    fi

    if [[ "$has_gcloud" != "true" && "$MODE" == "dry-run" ]]; then
        write_report
        log "✅ اكتمل وضع التحليل بدون gcloud. التقرير: $REPORT_PATH"
        exit 0
    fi

    if ! gcloud auth list --filter=status:ACTIVE --format='value(account)' | grep -q .; then
        log "❌ لا يوجد حساب gcloud نشط. نفّذ: gcloud auth login"
        exit 3
    fi

    # تحقق وصول المنظمة
    gcloud organizations describe "$ORG_ID" --format='value(name)' >/dev/null

    create_or_verify_project "$PROD_PROJECT"
    create_or_verify_project "$DEV_PROJECT"
    create_or_verify_project "$TEST_PROJECT"

    ensure_service_account "$PROD_PROJECT"
    grant_operator_access "$PROD_PROJECT"
    grant_operator_access "$DEV_PROJECT"
    grant_operator_access "$TEST_PROJECT"

    write_report

    log "✅ اكتمل التنفيذ. التقرير: $REPORT_PATH"
}

main "$@"
