#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Projects/sheikha/sheikha-main-portal"
cd "$ROOT"

echo "== Activate SHEIKHA_PLANETARY_RESOURCE_FABRIC_V77 =="

mkdir -p runtime/planetary-resource-fabric/v77
mkdir -p routes/planetary-resource-fabric
mkdir -p tools/planetary-resource-fabric
mkdir -p docs/planetary-resource-fabric

cat > runtime/planetary-resource-fabric/v77/sheikha-planetary-resource-fabric-v77.js <<'JS'
'use strict';

function status() {
  return {
    success: true,
    system: 'SHEIKHA_PLANETARY_RESOURCE_FABRIC_V77',
    status: 'ACTIVE',
    apexLevel: 77,
    role: 'PLANETARY_RESOURCE_MAPPING_MONITORING_OPTIMIZATION_LAYER',
    domains: [
      'WATER',
      'FOOD',
      'ENERGY',
      'MINERALS',
      'METALS',
      'OIL_GAS',
      'AGRICULTURE',
      'LOGISTICS',
      'RECYCLING',
      'ENVIRONMENT',
      'SUSTAINABILITY',
      'RESOURCE_BALANCE'
    ],
    lifecycle: [
      'DISCOVER',
      'CLASSIFY',
      'MAP',
      'MONITOR',
      'ANALYZE_CALCULATION_ONLY',
      'OPTIMIZE',
      'RECYCLE',
      'HUMAN_REVIEW',
      'CONTINUOUS_IMPROVEMENT'
    ],
    integrations: [
      'SHEIKHA_KNOWLEDGE_UNIVERSE_GRAPH_V76',
      'SHEIKHA_GLOBAL_ORCHESTRATOR_FABRIC_V75',
      'SHEIKHA_SELF_HEALING_FABRIC_V74',
      'SHEIKHA_CIVILIZATION_OPERATING_SYSTEM_V70'
    ],
    governance: {
      principle: 'لا ضرر ولا ضرار',
      humanIsPrimary: true,
      aiToolOnly: true,
      calculationOnly: true,
      noConsciousnessClaim: true,
      noFuturePredictionClaim: true,
      humanApprovalForCriticalChanges: true,
      sustainability: true,
      continuousImprovement: true
    }
  };
}

function resourcePlan(input = {}) {
  return {
    success: true,
    system: 'SHEIKHA_PLANETARY_RESOURCE_FABRIC_V77',
    status: 'PLANETARY_RESOURCE_PLAN_CREATED',
    name: input.name || 'Sheikha Planetary Resource Plan',
    scope: input.scope || 'RESOURCE_MAPPING_AND_BALANCE',
    resources: input.resources || status().domains,
    linkedLayers: status().integrations,
    lifecycle: status().lifecycle,
    governance: status().governance
  };
}

module.exports = { status, resourcePlan };
JS

cat > routes/planetary-resource-fabric/sheikha-planetary-resource-fabric-routes.js <<'JS'
'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  resourcePlan
} = require('../../runtime/planetary-resource-fabric/v77/sheikha-planetary-resource-fabric-v77');

router.get('/api/sheikha/planetary-resource-fabric/v77/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/planetary-resource-fabric/v77/demo', (_req, res) => res.json(resourcePlan()));
router.post('/api/sheikha/planetary-resource-fabric/v77/plan', (req, res) => res.json(resourcePlan(req.body || {})));

module.exports = router;
JS

cat > tools/planetary-resource-fabric/sheikha-planetary-resource-fabric-v77-cli.js <<'JS'
#!/usr/bin/env node
'use strict';

const {
  status,
  resourcePlan
} = require('../../runtime/planetary-resource-fabric/v77/sheikha-planetary-resource-fabric-v77');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') console.log(JSON.stringify(status(), null, 2));
else if (cmd === 'demo') console.log(JSON.stringify(resourcePlan(), null, 2));
else process.exit(1);
JS

chmod +x tools/planetary-resource-fabric/sheikha-planetary-resource-fabric-v77-cli.js

cat > docs/planetary-resource-fabric/SHEIKHA-PLANETARY-RESOURCE-FABRIC-V77.md <<'MD'
# SHEIKHA_PLANETARY_RESOURCE_FABRIC_V77

طبقة موارد كوكبية لحصر وتصنيف وربط ومراقبة وتحسين استخدام الموارد: الماء، الغذاء، الطاقة، المعادن، النفط والغاز، الزراعة، اللوجستيات، إعادة التدوير، البيئة، والاستدامة.

## الحوكمة

- لا ضرر ولا ضرار.
- الإنسان هو الأصل المكرم.
- الذكاء الصناعي أداة حساب وتحليل وتصنيف فقط.
- لا ادعاء تنبؤ بالغيب.
- موافقة بشرية للتغييرات الحرجة.
- استدامة وتحسين مستمر.
MD

python3 - <<'PY'
from pathlib import Path

p = Path("server.js")
s = p.read_text()

mount = """
try {
  app.use(require('./routes/planetary-resource-fabric/sheikha-planetary-resource-fabric-routes'));
} catch (error) {
  console.warn('[sheikha-planetary-resource-fabric-v77] route mount skipped:', error.message);
}
"""

if "sheikha-planetary-resource-fabric-v77" not in s:
    idx = s.find("app.use(express.json")
    if idx == -1:
        idx = s.find("app.use(")
    if idx == -1:
        raise SystemExit("Cannot find insertion point")
    s = s[:idx] + mount + "\n" + s[idx:]

p.write_text(s)
PY

node --check server.js
node --check runtime/planetary-resource-fabric/v77/sheikha-planetary-resource-fabric-v77.js
node --check routes/planetary-resource-fabric/sheikha-planetary-resource-fabric-routes.js
node --check tools/planetary-resource-fabric/sheikha-planetary-resource-fabric-v77-cli.js

node tools/planetary-resource-fabric/sheikha-planetary-resource-fabric-v77-cli.js status | jq '.system,.status,.apexLevel'
node tools/planetary-resource-fabric/sheikha-planetary-resource-fabric-v77-cli.js demo | jq '.status,.name,.scope'

pm2 restart sheikha-main-portal --update-env
sleep 2

curl -s http://127.0.0.1:8080/api/sheikha/planetary-resource-fabric/v77/status | jq '.system,.status,.apexLevel'
curl -s http://127.0.0.1:8080/api/sheikha/planetary-resource-fabric/v77/demo | jq '.status,.name'

npm test
npm run lint
node --check server.js

git add \
  server.js \
  activate-sheikha-planetary-resource-fabric-v77.sh \
  runtime/planetary-resource-fabric \
  routes/planetary-resource-fabric \
  tools/planetary-resource-fabric \
  docs/planetary-resource-fabric

git commit -m "Activate Sheikha planetary resource fabric V77"
git push origin feature/v77-planetary-resource-fabric

echo "== Done =="
