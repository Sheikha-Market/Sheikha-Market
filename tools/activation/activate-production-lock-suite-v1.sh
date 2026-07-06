#!/usr/bin/env bash
set -euo pipefail

echo "🔐 SHEIKHA PRODUCTION LOCK SUITE V1"

mkdir -p runtime/security runtime/release-lock release

echo "1) Semantic secret scan"
node tools/security/semantic-secret-scan-v1.js

cat > runtime/security/production-secret-scan.json <<'JSON'
{
  "stage": "PRODUCTION_SECRET_SCAN",
  "status": "PASSED",
  "engine": "SHEIKHA_SEMANTIC_SECRET_SCAN_V1"
}
JSON

echo "2) Full validation"
npm test
npm run lint

echo "3) Runtime restart"
pm2 restart sheikha-main-portal --update-env

RUNTIME_READY=0

for i in {1..60}; do
  PM2_STATUS=$(pm2 jlist | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const a=JSON.parse(d);const p=a.find(x=>x.name==='sheikha-main-portal');console.log(p?.pm2_env?.status || 'missing')})")

  if [ "$PM2_STATUS" != "online" ]; then
    echo "⏳ PM2 status: $PM2_STATUS"
    sleep 2
    continue
  fi

  if curl -fsS http://127.0.0.1:8080/api/health >/dev/null; then
    echo "✅ Runtime ready"
    RUNTIME_READY=1
    break
  fi

  sleep 2
done

if [ "$RUNTIME_READY" != "1" ]; then
  echo "❌ Runtime health gate failed"
  pm2 status
  pm2 logs sheikha-main-portal --lines 80 --nostream || true
  exit 1
fi

echo "4) Release manifests"
COMMIT="$(git rev-parse HEAD)"
BRANCH="$(git rev-parse --abbrev-ref HEAD)"

cat > release/SHEIKHA-PRODUCTION-LOCK-V1.json <<JSON
{
  "system": "SHEIKHA_PRODUCTION_LOCK_V1",
  "status": "LOCKED_FOR_PRODUCTION_REVIEW",
  "branch": "$BRANCH",
  "commit": "$COMMIT",
  "tests": "PASSED",
  "lint": "PASSED",
  "runtime": "READY",
  "securityScan": "PASSED",
  "humanApprovalRequired": true,
  "createdAt": "$(date -Iseconds)"
}
JSON

sha256sum \
  release/SHEIKHA-PRODUCTION-LOCK-V1.json \
  runtime/security/production-secret-scan.json \
  > runtime/release-lock/SHA256SUMS.txt

echo "5) Final status"
git status --short
pm2 status

echo "✅ SHEIKHA PRODUCTION LOCK SUITE V1 PASSED"
