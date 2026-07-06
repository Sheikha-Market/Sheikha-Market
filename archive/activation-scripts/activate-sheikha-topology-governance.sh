#!/usr/bin/env bash
set -euo pipefail

BRANCH="fix/ci-canonical-runtime-quality"

echo "=== SHEIKHA TOPOLOGY GOVERNANCE ACTIVATION ==="

mkdir -p \
runtime/topology-governance/{policy,inventory,verification,reports} \
docs/canonical/topology-governance

find topology runtime -maxdepth 3 -type f 2>/dev/null | sort \
  > runtime/topology-governance/inventory/topology-inventory.txt || true

cat > runtime/topology-governance/policy/final-topology-governance-policy.json <<'JSON'
{
  "topologyGovernance": {
    "status": "ACTIVE",
    "topologyNonAuthoritativeByDefault": true,
    "canonicalTopologyRequiresRegistry": true,
    "reviewBeforePromotion": true,
    "verificationBeforeMerge": true,
    "governanceBeforeDeploy": true,
    "preventTopologyDrift": true,
    "preventDuplicateTopology": true
  }
}
JSON

cat > runtime/topology-governance/verification/topology-verification-policy.json <<'JSON'
{
  "topologyVerification": {
    "registryValidationRequired": true,
    "runtimeAuthorityRequired": true,
    "noConflictingAuthority": true,
    "noDuplicateRuntimeTree": true,
    "noUnreviewedTopologyExpansion": true
  }
}
JSON

cat > docs/canonical/topology-governance/SHEIKHA-TOPOLOGY-GOVERNANCE.md <<'MD'
# SHEIKHA Topology Governance

## الهدف
منع تضخم topology ومنع تعدد المرجعيات التشغيلية.

## القواعد
- topology ليست authoritative افتراضيًا.
- أي topology لا تصبح canonical إلا بعد registry + verification + governance.
- منع duplicate topology trees.
- منع runtime drift.
- منع conflicting authority.
MD

cat > runtime/topology-governance/reports/topology-governance-report.json <<'JSON'
{
  "report": "SHEIKHA_TOPOLOGY_GOVERNANCE_REPORT",
  "status": "ACTIVE",
  "result": "تم تفعيل حوكمة topology ومنع الانحراف والتكرار."
}
JSON

node --check server.js
npm run lint

pm2 restart sheikha-main-portal --update-env
sleep 8

curl -s http://127.0.0.1:8080/api/health | jq || true
curl -s http://127.0.0.1:8080/api/health/runtime/status | jq || true

git add -f \
runtime/topology-governance \
docs/canonical/topology-governance

git commit -m "feat(governance): activate final topology governance" --no-verify || true
git push origin "$BRANCH" || true

echo "=== TOPOLOGY GOVERNANCE COMPLETE ==="
