#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Projects/sheikha/sheikha-main-portal"
cd "$ROOT"

echo "== Activate SHEIKHA_CIVILIZATION_INTELLIGENCE_FABRIC_V79 =="

mkdir -p runtime/civilization-intelligence-fabric/v79
mkdir -p routes/civilization-intelligence-fabric
mkdir -p tools/civilization-intelligence-fabric
mkdir -p docs/civilization-intelligence-fabric

cat > runtime/civilization-intelligence-fabric/v79/sheikha-civilization-intelligence-fabric-v79.js <<'JS'
'use strict';

function status() {
  return {
    success: true,
    system: 'SHEIKHA_CIVILIZATION_INTELLIGENCE_FABRIC_V79',
    status: 'ACTIVE',
    apexLevel: 79,
    role: 'CIVILIZATION_DECISION_SUPPORT_COORDINATION_LAYER',
    domains: [
      'KNOWLEDGE',
      'SCIENCE',
      'INDUSTRY',
      'HEALTH',
      'ENERGY',
      'SUPPLY_CHAIN',
      'LOGISTICS',
      'QUALITY',
      'SAFETY',
      'RESEARCH',
      'DECISION_SUPPORT',
      'COORDINATION'
    ],
    lifecycle: [
      'COLLECT',
      'CLASSIFY',
      'LINK',
      'ANALYZE_CALCULATION_ONLY',
      'EVIDENCE',
      'COORDINATE',
      'DECISION_SUPPORT',
      'HUMAN_REVIEW',
      'CONTINUOUS_IMPROVEMENT'
    ],
    integrations: [
      'SHEIKHA_INDUSTRIAL_ECOSYSTEM_FABRIC_V78',
      'SHEIKHA_PLANETARY_RESOURCE_FABRIC_V77',
      'SHEIKHA_KNOWLEDGE_UNIVERSE_GRAPH_V76',
      'SHEIKHA_GLOBAL_ORCHESTRATOR_FABRIC_V75',
      'SHEIKHA_SELF_HEALING_FABRIC_V74',
      'SHEIKHA_QUALITY_SAFETY_FABRIC_V71'
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

function intelligencePlan(input = {}) {
  return {
    success: true,
    system: 'SHEIKHA_CIVILIZATION_INTELLIGENCE_FABRIC_V79',
    status: 'CIVILIZATION_INTELLIGENCE_PLAN_CREATED',
    name: input.name || 'Sheikha Civilization Intelligence Plan',
    scope: input.scope || 'DECISION_SUPPORT_AND_COORDINATION',
    domains: input.domains || status().domains,
    linkedLayers: status().integrations,
    lifecycle: status().lifecycle,
    governance: status().governance
  };
}

module.exports = { status, intelligencePlan };
JS

cat > routes/civilization-intelligence-fabric/sheikha-civilization-intelligence-fabric-routes.js <<'JS'
'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  intelligencePlan
} = require('../../runtime/civilization-intelligence-fabric/v79/sheikha-civilization-intelligence-fabric-v79');

router.get('/api/sheikha/civilization-intelligence-fabric/v79/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/civilization-intelligence-fabric/v79/demo', (_req, res) => res.json(intelligencePlan()));
router.post('/api/sheikha/civilization-intelligence-fabric/v79/plan', (req, res) => res.json(intelligencePlan(req.body || {})));

module.exports = router;
JS

cat > tools/civilization-intelligence-fabric/sheikha-civilization-intelligence-fabric-v79-cli.js <<'JS'
#!/usr/bin/env node
'use strict';

const {
  status,
  intelligencePlan
} = require('../../runtime/civilization-intelligence-fabric/v79/sheikha-civilization-intelligence-fabric-v79');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') console.log(JSON.stringify(status(), null, 2));
else if (cmd === 'demo') console.log(JSON.stringify(intelligencePlan(), null, 2));
else process.exit(1);
JS

chmod +x tools/civilization-intelligence-fabric/sheikha-civilization-intelligence-fabric-v79-cli.js

cat > docs/civilization-intelligence-fabric/SHEIKHA-CIVILIZATION-INTELLIGENCE-FABRIC-V79.md <<'MD'
# SHEIKHA_CIVILIZATION_INTELLIGENCE_FABRIC_V79

طبقة ذكاء حضاري للدعم الحسابي واتخاذ القرار البشري والتنسيق بين المعرفة، العلم، الصناعة، الصحة، الطاقة، سلاسل الإمداد، الجودة، السلامة، والبحث.

## الحوكمة

- لا ضرر ولا ضرار.
- الإنسان هو الأصل وصاحب القرار.
- الذكاء الصناعي أداة حساب وتحليل وتصنيف فقط.
- لا ادعاء وعي.
- لا ادعاء تنبؤ بالغيب.
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
  app.use(require('./routes/civilization-intelligence-fabric/sheikha-civilization-intelligence-fabric-routes'));
} catch (error) {
  console.warn('[sheikha-civilization-intelligence-fabric-v79] route mount skipped:', error.message);
}
"""

if "sheikha-civilization-intelligence-fabric-v79" not in s:
    idx = s.find("app.use(express.json")
    if idx == -1:
        idx = s.find("app.use(")
    if idx == -1:
        raise SystemExit("Cannot find insertion point")
    s = s[:idx] + mount + "\n" + s[idx:]

p.write_text(s)
PY

node --check server.js
node --check runtime/civilization-intelligence-fabric/v79/sheikha-civilization-intelligence-fabric-v79.js
node --check routes/civilization-intelligence-fabric/sheikha-civilization-intelligence-fabric-routes.js
node --check tools/civilization-intelligence-fabric/sheikha-civilization-intelligence-fabric-v79-cli.js

node tools/civilization-intelligence-fabric/sheikha-civilization-intelligence-fabric-v79-cli.js status | jq '.system,.status,.apexLevel'
node tools/civilization-intelligence-fabric/sheikha-civilization-intelligence-fabric-v79-cli.js demo | jq '.status,.name,.scope'

pm2 restart sheikha-main-portal --update-env
sleep 2

curl -s http://127.0.0.1:8080/api/sheikha/civilization-intelligence-fabric/v79/status | jq '.system,.status,.apexLevel'
curl -s http://127.0.0.1:8080/api/sheikha/civilization-intelligence-fabric/v79/demo | jq '.status,.name'

npm test
npm run lint
node --check server.js

git add   server.js   activate-sheikha-civilization-intelligence-fabric-v79.sh   runtime/civilization-intelligence-fabric   routes/civilization-intelligence-fabric   tools/civilization-intelligence-fabric   docs/civilization-intelligence-fabric

git commit -m "Activate Sheikha civilization intelligence fabric V79"
git push origin feature/v79-civilization-intelligence-fabric

echo "== Done =="
