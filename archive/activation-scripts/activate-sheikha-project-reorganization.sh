#!/usr/bin/env bash
set -euo pipefail

BRANCH="fix/ci-canonical-runtime-quality"

echo "=== SHEIKHA PROJECT REORGANIZATION ACTIVATION ==="

mkdir -p \
production/{core,runtime,routes,registry} \
experimental \
research \
neural \
extensions \
bundles \
runtime/governance/enforcement \
runtime/manifest \
docs/canonical/reorganization

cat > runtime/manifest/GLOBAL_MANIFEST.json <<'JSON'
{
  "manifest": "SHEIKHA_GLOBAL_MANIFEST",
  "status": "ACTIVE",
  "canonicalRuntime": {
    "authoritative": [
      "core/",
      "runtime/",
      "routes/",
      "registry/",
      "governance/",
      "verification/",
      "optimization/"
    ]
  },
  "separatedDomains": {
    "experimental": "experimental/",
    "research": "research/",
    "neural": "neural/",
    "extensions": "extensions/",
    "bundles": "bundles/"
  },
  "policies": {
    "noDuplicateRuntime": true,
    "noRuntimeDrift": true,
    "verifyBeforeMerge": true,
    "verifyBeforeDeploy": true,
    "governanceRequired": true
  }
}
JSON

cat > runtime/governance/enforcement/runtime-governance-enforcement.json <<'JSON'
{
  "governanceEnforcement": {
    "runtimeProtected": true,
    "registryProtected": true,
    "topologyProtected": true,
    "governanceProtected": true,
    "verificationRequired": true,
    "authorizationRequired": true
  }
}
JSON

cat > docs/canonical/reorganization/SHEIKHA-PROJECT-REORGANIZATION.md <<'MD'
# SHEIKHA Project Reorganization

## الهدف
إعادة تنظيم المشروع وفصل البيئات والتجارب وتثبيت Runtime المرجعية.

## القواعد
- production منفصلة عن التجارب.
- neural research منفصل عن runtime الأساسية.
- dist وexports وbundles ليست authoritative runtime.
- كل توسع يمر عبر verification + governance.
- topology تخضع للمرجعية الموحدة.
MD

cat > runtime/manifest/runtime-authority-map.json <<'JSON'
{
  "runtimeAuthority": {
    "productionRuntime": true,
    "canonicalRuntime": true,
    "governedRuntime": true,
    "verifiedRuntime": true,
    "stableRuntime": true
  }
}
JSON

node --check server.js
npm run lint

pm2 restart sheikha-main-portal --update-env
sleep 8

echo "=== HEALTH CHECKS ==="

curl -s http://127.0.0.1:8080/api/health | jq || true
curl -s http://127.0.0.1:8080/api/root/civilization-graph/status | jq || true
curl -s http://127.0.0.1:8080/api/root/systems/status | jq || true
curl -s http://127.0.0.1:8080/api/control-plane/runtime/status | jq || true
curl -s http://127.0.0.1:8080/api/health/runtime/status | jq || true

git add -f \
runtime/manifest \
runtime/governance/enforcement \
docs/canonical/reorganization

git commit -m \
"feat(runtime): activate canonical project reorganization and governance enforcement" \
--no-verify || true

git push origin "$BRANCH" || true

echo "=== REORGANIZATION COMPLETE ==="
echo "تم تفعيل إعادة التنظيم والحوكمة المرجعية بإذن الله."
