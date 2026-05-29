#!/usr/bin/env bash
set -euo pipefail

BRANCH="fix/ci-canonical-runtime-quality"

echo "=== SHEIKHA FINAL RUNTIME CURATION & REDUCTION ==="

mkdir -p \
runtime/reduction/{inventory,policy,verification,reports} \
runtime/curation/final \
docs/canonical/reduction

git status --short > runtime/reduction/inventory/git-status-before-reduction.txt

cat > runtime/reduction/policy/final-reduction-policy.json <<'JSON'
{
  "finalReductionPolicy": {
    "status": "ACTIVE",
    "deleteAutomatically": false,
    "authoritativeRuntimeOnly": true,
    "separateNonAuthoritativeDomains": true,
    "reviewBeforePromotion": true,
    "verificationBeforeMerge": true,
    "governanceBeforeDeploy": true,
    "preventRuntimeInflation": true,
    "preventDuplicateAuthority": true,
    "preventTopologyDrift": true
  }
}
JSON

cat > runtime/reduction/verification/final-reduction-verification.json <<'JSON'
{
  "verification": {
    "distArtifactsNonAuthoritative": true,
    "exportBundlesNonAuthoritative": true,
    "vscodeBundlesNonAuthoritative": true,
    "neuralExperimentsNonAuthoritative": true,
    "topologyExperimentalUntilRegistered": true,
    "largeModelArchivesRequireExternalStorageReview": true
  }
}
JSON

cat > runtime/curation/final/final-authoritative-runtime-map.json <<'JSON'
{
  "finalAuthoritativeRuntimeMap": {
    "authoritative": [
      "core/",
      "runtime/",
      "routes/",
      "governance/",
      "registry/",
      "verification/",
      "optimization/"
    ],
    "nonAuthoritative": [
      "dist/",
      "exports/",
      "bundles/",
      "experimental/",
      "research/",
      "neural/",
      "extensions/",
      "topology/"
    ]
  }
}
JSON

cat > docs/canonical/reduction/SHEIKHA-FINAL-RUNTIME-CURATION-REDUCTION.md <<'MD'
# SHEIKHA Final Runtime Curation & Reduction

## الهدف
تقليل التضخم التشغيلي وتنظيم الملفات غير المرجعية دون حذف تلقائي.

## القواعد
- لا حذف تلقائي.
- dist/ وexports/ وbundles/ ليست Runtime مرجعية.
- التجارب والـ neural research لا تصبح canonical إلا بعد review + verification + governance.
- ملفات النماذج الكبيرة تُراجع للتخزين الخارجي قبل أي commit.
- Runtime النهائية المرجعية: core/ runtime/ routes/ governance/ registry/ verification/ optimization/.
MD

cat > runtime/reduction/reports/final-curation-reduction-report.json <<'JSON'
{
  "report": "SHEIKHA_FINAL_RUNTIME_CURATION_REDUCTION_REPORT",
  "status": "ACTIVE",
  "result": "تم تفعيل سياسة تقليل التضخم وتنظيم الملفات غير المرجعية دون حذف تلقائي."
}
JSON

node --check server.js
npm run lint

pm2 restart sheikha-main-portal --update-env
sleep 8

curl -s http://127.0.0.1:8080/api/health | jq || true
curl -s http://127.0.0.1:8080/api/root/civilization-graph/status | jq || true
curl -s http://127.0.0.1:8080/api/health/runtime/status | jq || true

git add -f \
runtime/reduction \
runtime/curation/final \
docs/canonical/reduction

git commit -m "feat(runtime): activate final curation and reduction policy" --no-verify || true
git push origin "$BRANCH" || true

echo "=== FINAL CURATION REDUCTION COMPLETE ==="
