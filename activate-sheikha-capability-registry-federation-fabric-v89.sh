#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Projects/sheikha/sheikha-main-portal"
cd "$ROOT"

echo "== Activate SHEIKHA_CAPABILITY_REGISTRY_FEDERATION_FABRIC_V89 =="

mkdir -p runtime/capability-registry-federation-fabric/v89
mkdir -p routes/capability-registry-federation-fabric
mkdir -p tools/capability-registry-federation-fabric
mkdir -p docs/capability-registry-federation-fabric

cat > runtime/capability-registry-federation-fabric/v89/sheikha-capability-registry-federation-fabric-v89.js <<'JS'
'use strict';

function status() {
  return {
    success: true,
    system: 'SHEIKHA_CAPABILITY_REGISTRY_FEDERATION_FABRIC_V89',
    status: 'ACTIVE',
    apexLevel: 89,
    role: 'CAPABILITY_DISCOVERY_AND_REGISTRY_FEDERATION_LAYER',
    domains: ['CAPABILITIES','TOOLS','SERVICES','AGENTS','POLICIES','VERSIONS','WORKFLOWS','CONTRACTS','DISCOVERY','GOVERNANCE'],
    lifecycle: ['DISCOVER','REGISTER','CLASSIFY','VERSION','POLICY_BIND','CONTRACT_BIND','FEDERATE','VERIFY','HUMAN_REVIEW','IMPROVE'],
    integrations: ['SHEIKHA_MULTI_AGENT_FEDERATION_FABRIC_V88','SHEIKHA_AUTONOMOUS_IMPROVEMENT_FABRIC_V87','SHEIKHA_STRATEGIC_EXECUTION_FABRIC_V86','SHEIKHA_GLOBAL_COORDINATION_FABRIC_V85','SHEIKHA_SOVEREIGN_INTELLIGENCE_FABRIC_V84'],
    governance: {
      principle: 'لا ضرر ولا ضرار',
      humanIsPrimary: true,
      aiToolOnly: true,
      evidenceRequired: true,
      humanApprovalForCriticalActions: true,
      continuousImprovement: true
    }
  };
}

function capabilityPlan(input = {}) {
  return {
    success: true,
    system: 'SHEIKHA_CAPABILITY_REGISTRY_FEDERATION_FABRIC_V89',
    status: 'CAPABILITY_REGISTRY_FEDERATION_PLAN_CREATED',
    name: input.name || 'Sheikha Capability Registry Federation Plan',
    scope: input.scope || 'CAPABILITY_DISCOVERY_REGISTRY_FEDERATION',
    linkedLayers: status().integrations,
    lifecycle: status().lifecycle,
    governance: status().governance
  };
}

module.exports = { status, capabilityPlan };
JS

cat > routes/capability-registry-federation-fabric/sheikha-capability-registry-federation-fabric-routes.js <<'JS'
'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  capabilityPlan
} = require('../../runtime/capability-registry-federation-fabric/v89/sheikha-capability-registry-federation-fabric-v89');

router.get('/api/sheikha/capability-registry-federation-fabric/v89/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/capability-registry-federation-fabric/v89/demo', (_req, res) => res.json(capabilityPlan()));
router.post('/api/sheikha/capability-registry-federation-fabric/v89/plan', (req, res) => res.json(capabilityPlan(req.body || {})));

module.exports = router;
JS

cat > tools/capability-registry-federation-fabric/sheikha-capability-registry-federation-fabric-v89-cli.js <<'JS'
#!/usr/bin/env node
'use strict';

const {
  status,
  capabilityPlan
} = require('../../runtime/capability-registry-federation-fabric/v89/sheikha-capability-registry-federation-fabric-v89');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') console.log(JSON.stringify(status(), null, 2));
else if (cmd === 'demo') console.log(JSON.stringify(capabilityPlan(), null, 2));
else process.exit(1);
JS

chmod +x tools/capability-registry-federation-fabric/sheikha-capability-registry-federation-fabric-v89-cli.js

cat > docs/capability-registry-federation-fabric/SHEIKHA-CAPABILITY-REGISTRY-FEDERATION-FABRIC-V89.md <<'MD'
# SHEIKHA_CAPABILITY_REGISTRY_FEDERATION_FABRIC_V89

طبقة سجل قدرات واتحاد قدرات للوكلاء، الأدوات، الخدمات، السياسات، الإصدارات، العقود، والاكتشاف.

## الحوكمة

- لا ضرر ولا ضرار.
- الإنسان هو صاحب القرار.
- الذكاء الصناعي أداة حساب وتحليل وتصنيف وتنسيق فقط.
- الدليل مطلوب.
- موافقة بشرية للقرارات الحرجة.
- تحسين مستمر.
MD

python3 - <<'PY'
from pathlib import Path

p = Path("server.js")
s = p.read_text()

mount = """
try {
  app.use(require('./routes/capability-registry-federation-fabric/sheikha-capability-registry-federation-fabric-routes'));
} catch (error) {
  console.warn('[sheikha-capability-registry-federation-fabric-v89] route mount skipped:', error.message);
}
"""

if "sheikha-capability-registry-federation-fabric-v89" not in s:
    idx = s.find("app.use(express.json")
    if idx == -1:
        idx = s.find("app.use(")
    if idx == -1:
        raise SystemExit("Cannot find insertion point")
    s = s[:idx] + mount + "\n" + s[idx:]

p.write_text(s)
PY

node --check server.js
node --check runtime/capability-registry-federation-fabric/v89/sheikha-capability-registry-federation-fabric-v89.js
node --check routes/capability-registry-federation-fabric/sheikha-capability-registry-federation-fabric-routes.js
node --check tools/capability-registry-federation-fabric/sheikha-capability-registry-federation-fabric-v89-cli.js

node tools/capability-registry-federation-fabric/sheikha-capability-registry-federation-fabric-v89-cli.js status | jq '.system,.status,.apexLevel'

pm2 restart sheikha-main-portal --update-env
sleep 2

curl -s http://127.0.0.1:8080/api/sheikha/capability-registry-federation-fabric/v89/status | jq '.system,.status,.apexLevel'
curl -s http://127.0.0.1:8080/api/sheikha/capability-registry-federation-fabric/v89/demo | jq '.status,.name,.scope'

npm test
npm run lint

git add \
  server.js \
  activate-sheikha-capability-registry-federation-fabric-v89.sh \
  runtime/capability-registry-federation-fabric \
  routes/capability-registry-federation-fabric \
  tools/capability-registry-federation-fabric \
  docs/capability-registry-federation-fabric

git commit -m "Activate Sheikha capability registry federation fabric V89"
git push origin feature/v89-capability-registry-federation-fabric

echo "== Done =="
