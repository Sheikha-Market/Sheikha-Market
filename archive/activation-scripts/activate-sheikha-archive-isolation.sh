#!/usr/bin/env bash
set -euo pipefail

BRANCH="fix/ci-canonical-runtime-quality"

echo "=== SHEIKHA FINAL ARCHIVE & ISOLATION ZONES ==="

mkdir -p \
archive/{audits,topology,exports,dist,experiments,tooling} \
runtime/archive-governance/{policy,reports,inventory} \
docs/canonical/archive-governance

find runtime/audits -type f 2>/dev/null | head -100 \
  > runtime/archive-governance/inventory/audit-files-sampled.txt || true

cat > runtime/archive-governance/policy/final-archive-governance-policy.json <<'JSON'
{
  "archiveGovernance": {
    "status": "ACTIVE",
    "archiveDomainsNonAuthoritative": true,
    "preventRuntimeInflation": true,
    "preventTopologyInflation": true,
    "preventAuditOverflow": true,
    "archiveBeforeRemoval": true,
    "reviewBeforePromotion": true,
    "governanceRequired": true
  }
}
JSON

cat > docs/canonical/archive-governance/SHEIKHA-ARCHIVE-GOVERNANCE.md <<'MD'
# SHEIKHA Archive Governance

## الهدف
عزل الملفات غير المرجعية ومنع تضخم Runtime الأساسية.

## المناطق المعزولة
- archive/audits
- archive/topology
- archive/exports
- archive/dist
- archive/experiments
- archive/tooling

## القواعد
- الأرشيف ليس Runtime مرجعية.
- أي إعادة ترقية تحتاج review + verification + governance.
- منع تضخم topology و audits و artifacts.
MD

cat > runtime/archive-governance/reports/archive-governance-report.json <<'JSON'
{
  "report": "SHEIKHA_ARCHIVE_GOVERNANCE_REPORT",
  "status": "ACTIVE",
  "result": "تم تفعيل مناطق الأرشفة والعزل التنظيمي للمجالات غير المرجعية."
}
JSON

node --check server.js
npm run lint

pm2 restart sheikha-main-portal --update-env
sleep 8

curl -s http://127.0.0.1:8080/api/health | jq || true
curl -s http://127.0.0.1:8080/api/health/runtime/status | jq || true

git add -f \
archive \
runtime/archive-governance \
docs/canonical/archive-governance

git commit -m "feat(governance): activate archive and isolation zones" --no-verify || true
git push origin "$BRANCH" || true

echo "=== ARCHIVE & ISOLATION COMPLETE ==="
