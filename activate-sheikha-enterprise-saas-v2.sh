#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

echo "[SHEIKHA] Verifying Enterprise SaaS V2 control plane"

node --check runtime/saas/enterprise-v2/store.js
node --check runtime/saas/enterprise-v2/rbac.js
node --check runtime/saas/subscriptions/subscription-manager.js
node --check runtime/tenancy/tenant-isolation.js
node --check runtime/security/api-keys/api-key-manager.js
node --check routes/enterprise-saas-v2-routes.js
node --check sdk/sheikha-api/index.js
node --check bin/sheikha
python3 -m py_compile sdk/sheikha-python/__init__.py sdk/sheikha-python/sheikha_saas.py

npm run -s ops:enterprise-saas:v2
npm test -- --runInBand tests/enterprise-saas-v2.test.js tests/sheikha-orchestrator-fabric-v2.test.js
npm run lint

echo "[SHEIKHA] ENTERPRISE_SAAS_V2_CONTROL_PLANE_ACTIVE_100"
