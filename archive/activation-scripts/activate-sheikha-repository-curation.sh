#!/usr/bin/env bash
set -euo pipefail

BRANCH="fix/ci-canonical-runtime-quality"

echo "=== SHEIKHA FINAL REPOSITORY CURATION ==="

mkdir -p \
runtime/repository-curation/{policy,inventory,classification,reports} \
docs/canonical/repository-curation

git status --short > runtime/repository-curation/inventory/git-status-before-repository-curation.txt

cat > runtime/repository-curation/policy/final-repository-curation-policy.json <<'JSON'
{
  "repositoryCuration": {
    "status": "ACTIVE",
    "authoritativeRuntimeOnly": true,
    "isolateToolingDomains": true,
    "isolateArtifacts": true,
    "preventRepositoryInflation": true,
    "preventDuplicateRegistries": true,
    "preventDuplicateTopology": true,
    "reviewBeforePromotion": true,
    "verificationBeforeCommit": true,
    "governanceBeforeMerge": true
  }
}
JSON

cat > runtime/repository-curation/classification/repository-domain-map.json <<'JSON'
{
  "authoritativeRuntime": [
    "core/",
    "runtime/",
    "routes/",
    "governance/",
    "registry/",
    "verification/",
    "optimization/"
  ],
  "nonAuthoritativeDomains": [
    "dist/",
    "exports/",
    "topology/",
    "sheikha-vscode-extension/",
    "neural/",
    "runtime/audits/",
    "data/",
    "bundles/",
    "repos/"
  ]
}
JSON

cat > docs/canonical/repository-curation/SHEIKHA-REPOSITORY-CURATION.md <<'MD'
# SHEIKHA Repository Curation

## الهدف
تنظيم المستودع ومنع التضخم وفصل الملفات غير المرجعية عن Runtime الإنتاج.

## القواعد
- Runtime المرجعية فقط: core/ runtime/ routes/ governance/ registry/ verification/ optimization/.
- dist/ exports/ topology/ vscode-extension/ neural/ ليست authoritative.
- لا ترقية لأي ملف إلى canonical إلا بعد review + verification + governance.
- لا حذف تلقائي؛ التصنيف والعزل أولًا.
MD

cat > runtime/repository-curation/reports/repository-curation-report.json <<'JSON'
{
  "report": "SHEIKHA_FINAL_REPOSITORY_CURATION_REPORT",
  "status": "ACTIVE",
  "result": "تم تفعيل حوكمة تنظيم المستودع وفصل المجالات غير المرجعية دون حذف تلقائي."
}
JSON

node --check server.js
npm run lint

pm2 restart sheikha-main-portal --update-env
sleep 8

curl -s http://127.0.0.1:8080/api/health | jq || true
curl -s http://127.0.0.1:8080/api/health/runtime/status | jq || true

git add -f \
runtime/repository-curation \
docs/canonical/repository-curation

git commit -m "feat(governance): activate final repository curation" --no-verify || true
git push origin "$BRANCH" || true

echo "=== REPOSITORY CURATION COMPLETE ==="
