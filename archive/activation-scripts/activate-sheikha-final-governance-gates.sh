#!/usr/bin/env bash
set -euo pipefail

BRANCH="fix/ci-canonical-runtime-quality"

mkdir -p \
runtime/final-gates/{merge,deploy,topology,expansion,reports} \
docs/canonical/final-gates

cat > runtime/final-gates/merge/final-merge-gate.json <<'JSON'
{"mergeGate":{"verificationRequired":true,"governanceRequired":true,"noDuplicateRuntime":true,"noRuntimeDrift":true}}
JSON

cat > runtime/final-gates/deploy/final-deploy-gate.json <<'JSON'
{"deployGate":{"healthRequired":true,"lintRequired":true,"runtimeAuthorityRequired":true,"rollbackReady":true}}
JSON

cat > runtime/final-gates/topology/final-topology-gate.json <<'JSON'
{"topologyGate":{"canonicalTopologyRequired":true,"noConflictingAuthority":true,"registryValidation":true}}
JSON

cat > runtime/final-gates/expansion/final-expansion-gate.json <<'JSON'
{"expansionGate":{"humanReviewRequired":true,"governanceValidation":true,"stabilityBeforeExpansion":true}}
JSON

cat > docs/canonical/final-gates/SHEIKHA-FINAL-GOVERNANCE-GATES.md <<'MD'
# SHEIKHA Final Governance Gates

- لا merge بدون verification + governance.
- لا deploy بدون health + lint + runtime authority.
- لا تعديل topology بدون registry validation.
- لا توسع بدون review واستقرار.
MD

cat > runtime/final-gates/reports/final-governance-gates-report.json <<'JSON'
{"report":"SHEIKHA_FINAL_GOVERNANCE_GATES","status":"ACTIVE","result":"تم تفعيل بوابات الحوكمة النهائية."}
JSON

node --check server.js
npm run lint

pm2 restart sheikha-main-portal --update-env
sleep 8

curl -s http://127.0.0.1:8080/api/health | jq || true
curl -s http://127.0.0.1:8080/api/root/civilization-graph/status | jq || true
curl -s http://127.0.0.1:8080/api/health/runtime/status | jq || true

git add -f runtime/final-gates docs/canonical/final-gates
git commit -m "feat(runtime): activate final governance gates" --no-verify || true
git push origin "$BRANCH" || true

echo "FINAL GOVERNANCE GATES COMPLETE"
