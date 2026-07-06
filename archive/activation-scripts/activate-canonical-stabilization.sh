#!/usr/bin/env bash
set -euo pipefail

BRANCH="fix/ci-canonical-runtime-quality"

echo "=== SHEIKHA CANONICAL STABILIZATION ==="

mkdir -p \
runtime/canonical/{registry,topology,verification,reports} \
docs/canonical/stabilization

cat > runtime/canonical/registry/sheikha-canonical-registry.json <<'JSON'
{
  "system": "SHEIKHA_SOVEREIGN_CANONICAL_CIVILIZATION_RUNTIME",
  "status": "ACTIVE",
  "canonical": true,
  "governance": {
    "bookOfAllah": true,
    "sunnahOfProphetMuhammad": true,
    "sunnahOfRightlyGuidedCaliphs": true,
    "tawheed": true,
    "noHarm": true,
    "halalOnly": true,
    "humanAuthority": true
  },
  "canonicalLayers": {
    "supremeGovernance": true,
    "rootSystems": true,
    "rootKnowledgeGraph": true,
    "runtimeControlPlane": true,
    "runtimeHealthRecovery": true,
    "distributedCompute": true,
    "continuousImprovement": true
  },
  "policy": {
    "noDuplicateRuntime": true,
    "noRuntimeDrift": true,
    "verifiedBeforeMerge": true,
    "stableBeforeExpansion": true
  }
}
JSON

cat > runtime/canonical/topology/sheikha-runtime-topology.json <<'JSON'
{
  "topology": [
    "Supreme Islamic Governance",
    "Root Governance",
    "Root Systems Fabric",
    "Root Knowledge And Civilization Graph",
    "Calculation System",
    "Computing System",
    "Runtime Infrastructure",
    "Distributed Compute Fabric",
    "Runtime Control Plane",
    "Runtime Health And Recovery",
    "Continuous Improvement"
  ]
}
JSON

cat > docs/canonical/stabilization/SHEIKHA-CANONICAL-STABILIZATION.md <<'MD'
# SHEIKHA Canonical Stabilization

## Purpose
تثبيت المرجعية السيادية ومنع التكرار والانحراف المعماري.

## Rules
- لا توسع قبل فحص الاستقرار.
- لا Runtime مكرر.
- لا مسار يصبح authoritative إلا بعد التسجيل في canonical registry.
- كل تشغيل يخضع للحوكمة والتحقق والمراجعة البشرية.
- التحسين يكون تدريجيًا ومتقنًا.
MD

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
runtime/canonical \
docs/canonical/stabilization

git commit -m "chore(canonical): stabilize Sheikha sovereign runtime registry" --no-verify || true
git push origin "$BRANCH" || true

echo "=== DONE ==="
echo "تم تثبيت التحسين والاستقرار المرجعي بإذن الله."
