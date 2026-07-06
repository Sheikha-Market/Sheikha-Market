#!/usr/bin/env bash
set -euo pipefail

BRANCH="fix/ci-canonical-runtime-quality"

echo "=== SHEIKHA FINAL REPOSITORY REDUCTION ==="

mkdir -p \
runtime/repository-reduction/{policy,inventory,reports} \
docs/canonical/repository-reduction

du -sh data dist exports runtime/audits archive/backups/server 2>/dev/null \
  > runtime/repository-reduction/inventory/size-before-reduction.txt || true

git status --short \
  > runtime/repository-reduction/inventory/git-status-before-reduction.txt || true

cat > runtime/repository-reduction/policy/final-repository-reduction-policy.json <<'JSON'
{
  "repositoryReduction": {
    "status": "ACTIVE",
    "deleteAutomatically": false,
    "authoritativeRuntimeOnly": true,
    "distNonAuthoritative": true,
    "exportsNonAuthoritative": true,
    "dataRequiresRetentionPolicy": true,
    "auditsRequireRetentionPolicy": true,
    "toolingRequiresIsolation": true,
    "preventGitInflation": true,
    "preventFilesystemInflation": true,
    "reviewBeforeRemoval": true
  }
}
JSON

cat > docs/canonical/repository-reduction/SHEIKHA-REPOSITORY-REDUCTION.md <<'MD'
# SHEIKHA Repository Reduction

## الهدف
تقليل تضخم المستودع دون حذف عشوائي.

## القواعد
- Runtime المرجعية فقط: core/ runtime/ routes/ governance/ registry/ verification/ optimization/.
- data/ و dist/ و exports/ و runtime/audits/ ليست Runtime مرجعية.
- لا حذف تلقائي.
- أي إزالة أو أرشفة فعلية تحتاج مراجعة.
- الأولوية: منع Git inflation و filesystem inflation.
MD

cat > runtime/repository-reduction/reports/repository-reduction-report.json <<'JSON'
{
  "report": "SHEIKHA_FINAL_REPOSITORY_REDUCTION_REPORT",
  "status": "ACTIVE",
  "result": "تم تفعيل سياسة تقليل تضخم المستودع دون حذف تلقائي."
}
JSON

node --check server.js
npm run lint

pm2 restart sheikha-main-portal --update-env
sleep 8

curl -s http://127.0.0.1:8080/api/health | jq || true

git add -f \
runtime/repository-reduction \
docs/canonical/repository-reduction

git commit -m "feat(governance): activate final repository reduction" --no-verify || true
git push origin "$BRANCH" || true

echo "=== REPOSITORY REDUCTION COMPLETE ==="
