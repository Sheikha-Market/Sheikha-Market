#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Projects/sheikha/sheikha-main-portal"
cd "$ROOT"

echo "== Activate SHEIKHA_SOVEREIGN_INTELLIGENCE_FABRIC_V84 =="

mkdir -p runtime/sovereign-intelligence-fabric/v84
mkdir -p routes/sovereign-intelligence-fabric
mkdir -p tools/sovereign-intelligence-fabric
mkdir -p docs/sovereign-intelligence-fabric

cat > runtime/sovereign-intelligence-fabric/v84/sheikha-sovereign-intelligence-fabric-v84.js <<'JS'
'use strict';

function status() {
  return {
    success: true,
    system: 'SHEIKHA_SOVEREIGN_INTELLIGENCE_FABRIC_V84',
    status: 'ACTIVE',
    apexLevel: 84,
    role: 'SOVEREIGN_GOVERNED_INTELLIGENCE_SUPPORT_LAYER',
    domains: [
      'INTELLIGENCE',
      'EVIDENCE',
      'KNOWLEDGE',
      'SEMANTICS',
      'COORDINATION',
      'REASONING_SUPPORT',
      'ORCHESTRATION',
      'GOVERNANCE',
      'EXECUTION_SUPPORT',
      'DECISION_SUPPORT'
    ],
    lifecycle: [
      'COLLECT',
      'NORMALIZE',
      'SEMANTIC_LINK',
      'EVIDENCE_LINK',
      'REASONING_SUPPORT',
      'COORDINATE',
      'VERIFY',
      'HUMAN_REVIEW',
      'CONTINUOUS_IMPROVEMENT'
    ],
    integrations: [
      'SHEIKHA_META_KNOWLEDGE_FABRIC_V83',
      'SHEIKHA_UNIVERSAL_RUNTIME_FABRIC_V82',
      'SHEIKHA_GLOBAL_KNOWLEDGE_MESH_V81',
      'SHEIKHA_UNIFIED_APEX_FABRIC_V80',
      'SHEIKHA_CIVILIZATION_INTELLIGENCE_FABRIC_V79'
    ],
    governance: {
      principle: 'لا ضرر ولا ضرار',
      humanIsPrimary: true,
      aiToolOnly: true,
      calculationOnly: true,
      noConsciousnessClaim: true,
      noFuturePredictionClaim: true,
      evidenceRequired: true,
      humanApprovalForCriticalActions: true,
      continuousImprovement: true
    }
  };
}

function sovereignPlan(input = {}) {
  return {
    success: true,
    system: 'SHEIKHA_SOVEREIGN_INTELLIGENCE_FABRIC_V84',
    status: 'SOVEREIGN_INTELLIGENCE_PLAN_CREATED',
    name: input.name || 'Sheikha Sovereign Intelligence Plan',
    scope: input.scope || 'GOVERNED_INTELLIGENCE_DECISION_SUPPORT',
    domains: input.domains || status().domains,
    linkedLayers: status().integrations,
    lifecycle: status().lifecycle,
    governance: status().governance
  };
}

module.exports = { status, sovereignPlan };
JS

cat > routes/sovereign-intelligence-fabric/sheikha-sovereign-intelligence-fabric-routes.js <<'JS'
'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  sovereignPlan
} = require('../../runtime/sovereign-intelligence-fabric/v84/sheikha-sovereign-intelligence-fabric-v84');

router.get('/api/sheikha/sovereign-intelligence-fabric/v84/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/sovereign-intelligence-fabric/v84/demo', (_req, res) => res.json(sovereignPlan()));
router.post('/api/sheikha/sovereign-intelligence-fabric/v84/plan', (req, res) => res.json(sovereignPlan(req.body || {})));

module.exports = router;
JS

cat > tools/sovereign-intelligence-fabric/sheikha-sovereign-intelligence-fabric-v84-cli.js <<'JS'
#!/usr/bin/env node
'use strict';

const {
  status,
  sovereignPlan
} = require('../../runtime/sovereign-intelligence-fabric/v84/sheikha-sovereign-intelligence-fabric-v84');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') console.log(JSON.stringify(status(), null, 2));
else if (cmd === 'demo') console.log(JSON.stringify(sovereignPlan(), null, 2));
else process.exit(1);
JS

chmod +x tools/sovereign-intelligence-fabric/sheikha-sovereign-intelligence-fabric-v84-cli.js

cat > docs/sovereign-intelligence-fabric/SHEIKHA-SOVEREIGN-INTELLIGENCE-FABRIC-V84.md <<'MD'
# SHEIKHA_SOVEREIGN_INTELLIGENCE_FABRIC_V84

طبقة ذكاء محكوم وسيادي للدعم الحسابي والتنسيق والتحقق واتخاذ القرار البشري.

## الحوكمة

- لا ضرر ولا ضرار.
- الإنسان هو الأصل وصاحب القرار.
- الذكاء الصناعي أداة حساب وتحليل وربط وتصنيف فقط.
- لا ادعاء وعي.
- لا ادعاء تنبؤ بالغيب.
- الدليل مطلوب.
- مراجعة بشرية للقرارات الحرجة.
- تحسين مستمر.
MD

python3 - <<'PY'
from pathlib import Path

p = Path("server.js")
s = p.read_text()

mount = """
try {
  app.use(require('./routes/sovereign-intelligence-fabric/sheikha-sovereign-intelligence-fabric-routes'));
} catch (error) {
  console.warn('[sheikha-sovereign-intelligence-fabric-v84] route mount skipped:', error.message);
}
"""

if "sheikha-sovereign-intelligence-fabric-v84" not in s:
    idx = s.find("app.use(express.json")
    if idx == -1:
        idx = s.find("app.use(")
    if idx == -1:
        raise SystemExit("Cannot find insertion point")
    s = s[:idx] + mount + "\n" + s[idx:]

p.write_text(s)
PY

node --check server.js
node --check runtime/sovereign-intelligence-fabric/v84/sheikha-sovereign-intelligence-fabric-v84.js
node --check routes/sovereign-intelligence-fabric/sheikha-sovereign-intelligence-fabric-routes.js
node --check tools/sovereign-intelligence-fabric/sheikha-sovereign-intelligence-fabric-v84-cli.js

node tools/sovereign-intelligence-fabric/sheikha-sovereign-intelligence-fabric-v84-cli.js status | jq '.system,.status,.apexLevel'
node tools/sovereign-intelligence-fabric/sheikha-sovereign-intelligence-fabric-v84-cli.js demo | jq '.status,.name,.scope'

pm2 restart sheikha-main-portal --update-env
sleep 2

curl -s http://127.0.0.1:8080/api/sheikha/sovereign-intelligence-fabric/v84/status | jq '.system,.status,.apexLevel'
curl -s http://127.0.0.1:8080/api/sheikha/sovereign-intelligence-fabric/v84/demo | jq '.status,.name'

npm test
npm run lint
node --check server.js

git add   server.js   activate-sheikha-sovereign-intelligence-fabric-v84.sh   runtime/sovereign-intelligence-fabric   routes/sovereign-intelligence-fabric   tools/sovereign-intelligence-fabric   docs/sovereign-intelligence-fabric

git commit -m "Activate Sheikha sovereign intelligence fabric V84"
git push origin feature/v84-sovereign-intelligence-fabric

echo "== Done =="
