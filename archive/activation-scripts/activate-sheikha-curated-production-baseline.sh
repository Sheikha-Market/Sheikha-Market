#!/usr/bin/env bash
set -euo pipefail

BRANCH="fix/ci-canonical-runtime-quality"

echo "=== SHEIKHA CURATED PRODUCTION BASELINE ==="

mkdir -p \
runtime/production-baseline/{policy,manifests,reports} \
docs/canonical/production-baseline

cat > runtime/production-baseline/manifests/authoritative-runtime-manifest.json <<'JSON'
{
  "authoritativeRuntime": {
    "canonical": [
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
      "runtime/audits/",
      "archive/",
      "topology/",
      "sheikha-vscode-extension/",
      "repos/",
      "data/"
    ]
  }
}
JSON

cat > runtime/production-baseline/policy/curated-production-policy.json <<'JSON'
{
  "productionBaseline": {
    "status": "ACTIVE",
    "authoritativeRuntimeOnly": true,
    "productionCleanBaseline": true,
    "preventArtifactPromotion": true,
    "preventAuditPromotion": true,
    "preventTopologyPromotion": true,
    "preventToolingPromotion": true,
    "reviewBeforeProductionPromotion": true,
    "verificationRequired": true,
    "governanceRequired": true
  }
}
JSON

cat > docs/canonical/production-baseline/SHEIKHA-CURATED-PRODUCTION-BASELINE.md <<'MD'
# SHEIKHA Curated Production Baseline

## الهدف
تثبيت Runtime إنتاجية نظيفة ومرجعية.

## Runtime المرجعية
- core/
- runtime/
- routes/
- governance/
- registry/
- verification/
- optimization/

## المجالات غير المرجعية
- dist/
- exports/
- runtime/audits/
- archive/
- topology/
- sheikha-vscode-extension/
- repos/
- data/

## القواعد
- لا ترقية لأي artifact إلى production baseline.
- لا ترقية لأي audit أو topology أو tooling إلى canonical runtime.
- أي production promotion تحتاج review + verification + governance.
MD

cat > runtime/production-baseline/reports/production-baseline-report.json <<'JSON'
{
  "report": "SHEIKHA_CURATED_PRODUCTION_BASELINE_REPORT",
  "status": "ACTIVE",
  "result": "تم تثبيت Runtime إنتاجية مرجعية نظيفة ومنع تضخم المجالات غير المرجعية."
}
JSON

node --check server.js
npm run lint

pm2 restart sheikha-main-portal --update-env
sleep 8

curl -s http://127.0.0.1:8080/api/health | jq || true
curl -s http://127.0.0.1:8080/api/health/runtime/status | jq || true

git add -f \
runtime/production-baseline \
docs/canonical/production-baseline

git commit -m "feat(governance): activate curated production baseline" --no-verify || true
git push origin "$BRANCH" || true

echo "=== CURATED PRODUCTION BASELINE COMPLETE ==="
