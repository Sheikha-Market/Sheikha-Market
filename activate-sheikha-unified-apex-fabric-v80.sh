#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Projects/sheikha/sheikha-main-portal"
cd "$ROOT"

echo "== Activate SHEIKHA_UNIFIED_APEX_FABRIC_V80 =="

mkdir -p runtime/unified-apex-fabric/v80
mkdir -p routes/unified-apex-fabric
mkdir -p tools/unified-apex-fabric
mkdir -p docs/unified-apex-fabric

cat > runtime/unified-apex-fabric/v80/sheikha-unified-apex-fabric-v80.js <<'JS'
'use strict';

function status() {
  return {
    success: true,
    system: 'SHEIKHA_UNIFIED_APEX_FABRIC_V80',
    status: 'ACTIVE',
    apexLevel: 80,
    role: 'UNIFIED_APEX_LAYER_FOR_V62_TO_V79',
    domains: [
      'KNOWLEDGE',
      'SCIENCE',
      'INDUSTRY',
      'SUPPLY_CHAIN',
      'EARTH',
      'RESOURCES',
      'HEALTH',
      'QUALITY',
      'SAFETY',
      'RESEARCH',
      'ORCHESTRATION',
      'SELF_HEALING',
      'DECISION_SUPPORT',
      'GOVERNANCE'
    ],
    lifecycle: [
      'COLLECT',
      'CLASSIFY',
      'LINK',
      'ORCHESTRATE',
      'ANALYZE_CALCULATION_ONLY',
      'EVIDENCE',
      'HUMAN_REVIEW',
      'QUALITY_GATE',
      'SAFETY_GATE',
      'IMPROVE'
    ],
    integrations: [
      'SHEIKHA_CIVILIZATION_INTELLIGENCE_FABRIC_V79',
      'SHEIKHA_INDUSTRIAL_ECOSYSTEM_FABRIC_V78',
      'SHEIKHA_PLANETARY_RESOURCE_FABRIC_V77',
      'SHEIKHA_KNOWLEDGE_UNIVERSE_GRAPH_V76',
      'SHEIKHA_GLOBAL_ORCHESTRATOR_FABRIC_V75',
      'SHEIKHA_SELF_HEALING_FABRIC_V74',
      'SHEIKHA_HUMAN_MODEL_FABRIC_V73',
      'SHEIKHA_RESEARCH_INNOVATION_FABRIC_V72',
      'SHEIKHA_QUALITY_SAFETY_FABRIC_V71',
      'SHEIKHA_CIVILIZATION_OPERATING_SYSTEM_V70'
    ],
    governance: {
      principle: 'لا ضرر ولا ضرار',
      quranSunnahValues: true,
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

function apexPlan(input = {}) {
  return {
    success: true,
    system: 'SHEIKHA_UNIFIED_APEX_FABRIC_V80',
    status: 'UNIFIED_APEX_PLAN_CREATED',
    name: input.name || 'Sheikha Unified Apex Plan',
    scope: input.scope || 'V62_TO_V79_UNIFIED_APEX',
    linkedLayers: status().integrations,
    lifecycle: status().lifecycle,
    governance: status().governance
  };
}

module.exports = { status, apexPlan };
JS

cat > routes/unified-apex-fabric/sheikha-unified-apex-fabric-routes.js <<'JS'
'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  apexPlan
} = require('../../runtime/unified-apex-fabric/v80/sheikha-unified-apex-fabric-v80');

router.get('/api/sheikha/unified-apex-fabric/v80/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/unified-apex-fabric/v80/demo', (_req, res) => res.json(apexPlan()));
router.post('/api/sheikha/unified-apex-fabric/v80/plan', (req, res) => res.json(apexPlan(req.body || {})));

module.exports = router;
JS

cat > tools/unified-apex-fabric/sheikha-unified-apex-fabric-v80-cli.js <<'JS'
#!/usr/bin/env node
'use strict';

const {
  status,
  apexPlan
} = require('../../runtime/unified-apex-fabric/v80/sheikha-unified-apex-fabric-v80');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') console.log(JSON.stringify(status(), null, 2));
else if (cmd === 'demo') console.log(JSON.stringify(apexPlan(), null, 2));
else process.exit(1);
JS

chmod +x tools/unified-apex-fabric/sheikha-unified-apex-fabric-v80-cli.js

cat > docs/unified-apex-fabric/SHEIKHA-UNIFIED-APEX-FABRIC-V80.md <<'MD'
# SHEIKHA_UNIFIED_APEX_FABRIC_V80

طبقة عليا موحدة تربط V62 إلى V79.

## الحوكمة

- لا ضرر ولا ضرار.
- الإنسان هو الأصل وصاحب القرار.
- الذكاء الصناعي أداة حساب وتحليل وتصنيف وتنسيق فقط.
- لا ادعاء وعي.
- لا ادعاء تنبؤ بالغيب.
- الدليل مطلوب.
- موافقة بشرية للقرارات الحرجة.
- الجودة والسلامة قبل التنفيذ.
- تحسين مستمر.
MD

python3 - <<'PY'
from pathlib import Path

p = Path("server.js")
s = p.read_text()

mount = """
try {
  app.use(require('./routes/unified-apex-fabric/sheikha-unified-apex-fabric-routes'));
} catch (error) {
  console.warn('[sheikha-unified-apex-fabric-v80] route mount skipped:', error.message);
}
"""

if "sheikha-unified-apex-fabric-v80" not in s:
    idx = s.find("app.use(express.json")
    if idx == -1:
        idx = s.find("app.use(")
    if idx == -1:
        raise SystemExit("Cannot find insertion point")
    s = s[:idx] + mount + "\n" + s[idx:]

p.write_text(s)
PY

node --check server.js
node --check runtime/unified-apex-fabric/v80/sheikha-unified-apex-fabric-v80.js
node --check routes/unified-apex-fabric/sheikha-unified-apex-fabric-routes.js
node --check tools/unified-apex-fabric/sheikha-unified-apex-fabric-v80-cli.js

node tools/unified-apex-fabric/sheikha-unified-apex-fabric-v80-cli.js status | jq '.system,.status,.apexLevel'
node tools/unified-apex-fabric/sheikha-unified-apex-fabric-v80-cli.js demo | jq '.status,.name,.scope'

pm2 restart sheikha-main-portal --update-env
sleep 2

curl -s http://127.0.0.1:8080/api/sheikha/unified-apex-fabric/v80/status | jq '.system,.status,.apexLevel'
curl -s http://127.0.0.1:8080/api/sheikha/unified-apex-fabric/v80/demo | jq '.status,.name'

npm test
npm run lint
node --check server.js

git add   server.js   activate-sheikha-unified-apex-fabric-v80.sh   runtime/unified-apex-fabric   routes/unified-apex-fabric   tools/unified-apex-fabric   docs/unified-apex-fabric

git commit -m "Activate Sheikha unified apex fabric V80"
git push origin feature/v80-unified-sheikha-apex-fabric

echo "== Done =="
