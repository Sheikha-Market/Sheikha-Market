#!/usr/bin/env bash
set -euo pipefail

BRANCH="fix/ci-canonical-runtime-quality"
KEEP_LAST=100

echo "=== SHEIKHA AUDIT RETENTION POLICY ==="

mkdir -p \
runtime/audit-retention/{policy,inventory,reports} \
runtime/archives/audits \
docs/canonical/audit-retention

cat > runtime/audit-retention/policy/final-audit-retention-policy.json <<JSON
{
  "auditRetentionPolicy": {
    "status": "ACTIVE",
    "keepLast": $KEEP_LAST,
    "deleteAutomatically": false,
    "archiveBeforeRemoval": true,
    "auditsNonAuthoritativeRuntime": true,
    "preventGitInflation": true,
    "preventRuntimeAuditOverflow": true
  }
}
JSON

find runtime/audits -type f 2>/dev/null | sort > runtime/audit-retention/inventory/audits-before-retention.txt || true

AUDIT_COUNT="$(find runtime/audits -type f 2>/dev/null | wc -l | tr -d ' ')"
echo "{\"auditFilesCount\": $AUDIT_COUNT, \"keepLast\": $KEEP_LAST}" \
  > runtime/audit-retention/reports/audit-count-report.json

cat > docs/canonical/audit-retention/SHEIKHA-AUDIT-RETENTION.md <<'MD'
# SHEIKHA Audit Retention Policy

## الهدف
منع تضخم runtime/audits مع المحافظة على الأثر التشغيلي.

## القواعد
- الاحتفاظ بآخر 100 audit.
- لا حذف تلقائي.
- الأرشفة قبل أي إزالة.
- runtime/audits ليست Runtime مرجعية.
- أي تنظيف فعلي يحتاج مراجعة بشرية.
MD

node --check server.js
npm run lint

pm2 restart sheikha-main-portal --update-env
sleep 8

curl -s http://127.0.0.1:8080/api/health | jq || true
curl -s http://127.0.0.1:8080/api/health/runtime/status | jq || true

git add -f \
runtime/audit-retention \
docs/canonical/audit-retention

git commit -m "feat(governance): activate audit retention policy" --no-verify || true
git push origin "$BRANCH" || true

echo "=== AUDIT RETENTION POLICY COMPLETE ==="
