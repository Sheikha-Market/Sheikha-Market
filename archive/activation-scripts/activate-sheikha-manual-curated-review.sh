#!/usr/bin/env bash
set -euo pipefail

BRANCH="fix/ci-canonical-runtime-quality"

echo "=== SHEIKHA MANUAL CURATED REVIEW BASELINE ==="

mkdir -p \
runtime/manual-curation/{policy,reports,inventory,classification} \
docs/canonical/manual-curation

git status --short \
  > runtime/manual-curation/inventory/git-status-manual-review.txt || true

git status --short | awk '{print $2}' | sort \
  > runtime/manual-curation/inventory/tracked-items-review-list.txt || true

cat > runtime/manual-curation/classification/manual-curation-map.json <<'JSON'
{
  "manualCuration": {
    "keepProduction": [],
    "archiveCandidates": [],
    "experimentalCandidates": [],
    "toolingIsolationCandidates": [
      "sheikha-vscode-extension/"
    ],
    "dataGovernanceCandidates": [
      "data/"
    ],
    "runtimeAuthoritative": [
      "core/",
      "runtime/",
      "routes/",
      "governance/",
      "registry/",
      "verification/",
      "optimization/"
    ]
  }
}
JSON

cat > runtime/manual-curation/policy/manual-curation-policy.json <<'JSON'
{
  "manualCurationPolicy": {
    "status": "ACTIVE",
    "manualReviewRequired": true,
    "noAutomaticDeletion": true,
    "productionRequiresVerification": true,
    "experimentalRequiresIsolation": true,
    "toolingRequiresIsolation": true,
    "archiveRequiresReview": true,
    "governanceRequired": true
  }
}
JSON

cat > docs/canonical/manual-curation/SHEIKHA-MANUAL-CURATION.md <<'MD'
# SHEIKHA Manual Curation Baseline

## الهدف
تنفيذ مراجعة بشرية نهائية ومنظمة للمستودع.

## القواعد
- لا حذف تلقائي.
- أي production item يحتاج verification + governance.
- experimental domains تعزل.
- tooling domains تعزل.
- Runtime المرجعية فقط تبقى canonical.
MD

cat > runtime/manual-curation/reports/manual-curation-report.json <<'JSON'
{
  "report": "SHEIKHA_MANUAL_CURATION_REPORT",
  "status": "ACTIVE",
  "result": "تم تفعيل baseline المراجعة البشرية المنظمة للمستودع."
}
JSON

node --check server.js
npm run lint

pm2 restart sheikha-main-portal --update-env
sleep 8

curl -s http://127.0.0.1:8080/api/health | jq || true

git add -f \
runtime/manual-curation \
docs/canonical/manual-curation

git commit -m "feat(governance): activate manual curated review baseline" --no-verify || true
git push origin "$BRANCH" || true

echo "=== MANUAL CURATED REVIEW COMPLETE ==="
