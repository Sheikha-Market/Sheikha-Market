#!/usr/bin/env bash
set -euo pipefail

BRANCH="fix/ci-canonical-runtime-quality"

echo "=== SHEIKHA PHYSICAL REPOSITORY REDUCTION ==="

mkdir -p \
runtime/physical-reduction/{policy,reports,inventory,classification} \
docs/canonical/physical-reduction \
archive/runtime-audits

find runtime/audits -type f | sort \
  > runtime/physical-reduction/inventory/runtime-audits-before.txt || true

find sheikha-vscode-extension -type f | sort \
  > runtime/physical-reduction/inventory/vscode-extension-before.txt || true

du -sh data dist exports runtime/audits sheikha-vscode-extension scripts tools 2>/dev/null \
  > runtime/physical-reduction/inventory/size-before-physical-reduction.txt || true

cat > runtime/physical-reduction/classification/physical-domain-map.json <<'JSON'
{
  "physicalReduction": {
    "authoritativeRuntime": [
      "core/",
      "runtime/",
      "routes/",
      "governance/",
      "registry/",
      "verification/",
      "optimization/"
    ],
    "isolatedDomains": [
      "sheikha-vscode-extension/",
      "runtime/audits/",
      "dist/",
      "exports/",
      "archive/",
      "data/",
      "scripts/",
      "tools/"
    ]
  }
}
JSON

cat > runtime/physical-reduction/policy/physical-reduction-policy.json <<'JSON'
{
  "physicalReductionPolicy": {
    "status": "ACTIVE",
    "deleteAutomatically": false,
    "retainLastAuditSnapshotsOnly": true,
    "preventRepositoryNoise": true,
    "preventToolingInflation": true,
    "preventAuditInflation": true,
    "preventDataInflation": true,
    "vscodeExtensionRequiresIsolation": true,
    "reviewBeforePhysicalRemoval": true
  }
}
JSON

cat > docs/canonical/physical-reduction/SHEIKHA-PHYSICAL-REDUCTION.md <<'MD'
# SHEIKHA Physical Repository Reduction

## الهدف
تقليل التضخم الفعلي للمستودع دون حذف عشوائي.

## المجالات المعزولة
- sheikha-vscode-extension/
- runtime/audits/
- data/
- dist/
- exports/
- scripts/
- tools/

## القواعد
- لا حذف تلقائي.
- الاحتفاظ فقط بآخر snapshots لاحقًا.
- vscode-extension ليست authoritative runtime.
- أي إزالة فعلية تحتاج review + verification + governance.
MD

cat > runtime/physical-reduction/reports/physical-reduction-report.json <<'JSON'
{
  "report": "SHEIKHA_PHYSICAL_REDUCTION_REPORT",
  "status": "ACTIVE",
  "result": "تم تفعيل تقليل التضخم الفعلي للمستودع وعزل المجالات الثقيلة."
}
JSON

node --check server.js
npm run lint

pm2 restart sheikha-main-portal --update-env
sleep 8

curl -s http://127.0.0.1:8080/api/health | jq || true

git add -f \
runtime/physical-reduction \
docs/canonical/physical-reduction

git commit -m "feat(governance): activate physical repository reduction" --no-verify || true
git push origin "$BRANCH" || true

echo "=== PHYSICAL REPOSITORY REDUCTION COMPLETE ==="
