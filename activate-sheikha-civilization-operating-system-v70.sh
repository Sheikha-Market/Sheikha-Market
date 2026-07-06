#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Projects/sheikha/sheikha-main-portal"
cd "$ROOT"

echo "== Activate SHEIKHA_CIVILIZATION_OPERATING_SYSTEM_V70 =="

mkdir -p runtime/civilization-operating-system/v70
mkdir -p routes/civilization-operating-system
mkdir -p tools/civilization-operating-system
mkdir -p docs/civilization-operating-system

cat > runtime/civilization-operating-system/v70/sheikha-civilization-operating-system-v70.js <<'JS'
'use strict';

function status() {
  return {
    success: true,
    system: 'SHEIKHA_CIVILIZATION_OPERATING_SYSTEM_V70',
    status: 'ACTIVE',
    apexLevel: 70,
    role: 'UNIFIED_ORCHESTRATION_LAYER_FOR_V62_TO_V69',
    integrations: [
      'SHEIKHA_UNIFIED_KNOWLEDGE_SCIENCE_FABRIC_V62',
      'SHEIKHA_KNOWLEDGE_GRAPH_ENGINE_V63',
      'SHEIKHA_DIGITAL_TWIN_FABRIC_V64',
      'SHEIKHA_INDUSTRIAL_COGNITIVE_FACTORY_FABRIC_V65',
      'SHEIKHA_GLOBAL_SUPPLY_CHAIN_GRAPH_V66',
      'SHEIKHA_EARTH_DIGITAL_TWIN_FABRIC_V67',
      'SHEIKHA_UNIFIED_SCIENTIFIC_KNOWLEDGE_GRAPH_V68',
      'SHEIKHA_INDUSTRIAL_CLUSTER_FABRIC_V69'
    ],
    engines: [
      'KNOWLEDGE_ENGINE',
      'GRAPH_ENGINE',
      'DIGITAL_TWIN_ENGINE',
      'FACTORY_ENGINE',
      'SUPPLY_CHAIN_ENGINE',
      'INDUSTRIAL_CLUSTER_ENGINE',
      'RESEARCH_ENGINE',
      'QUALITY_ENGINE',
      'SAFETY_ENGINE',
      'GOVERNANCE_ENGINE',
      'CONTINUOUS_IMPROVEMENT_ENGINE',
      'ORCHESTRATOR_ENGINE'
    ],
    domains: [
      'HUMAN','HEALTH','FOOD','WATER','AGRICULTURE','ENERGY','MINING',
      'METALS','REFINERY','PETROCHEMICAL','MANUFACTURING','ROBOTICS','AI',
      'SUPPLY_CHAIN','LOGISTICS','SPACE','SATELLITES','RESEARCH','EDUCATION',
      'QUALITY','SAFETY','GOVERNANCE'
    ],
    lifecycle: [
      'OBSERVE',
      'CLASSIFY',
      'MODEL',
      'CONNECT',
      'PLAN',
      'EXECUTE_WITH_HUMAN_APPROVAL',
      'MONITOR',
      'QUALITY_GATE',
      'SAFETY_GATE',
      'AUDIT',
      'CONTINUOUS_IMPROVEMENT'
    ],
    governance: {
      principle: 'لا ضرر ولا ضرار',
      quranSunnahValues: true,
      humanIsPrimary: true,
      aiToolOnly: true,
      calculationOnly: true,
      noConsciousnessClaim: true,
      noFuturePredictionClaim: true,
      noHazardousInstructions: true,
      noMedicalReplacement: true,
      antiAsabiyyah: true,
      humanApprovalForCriticalActions: true,
      continuousImprovement: true
    }
  };
}

function orchestrationPlan(input = {}) {
  return {
    success: true,
    system: 'SHEIKHA_CIVILIZATION_OPERATING_SYSTEM_V70',
    status: 'ORCHESTRATION_PLAN_CREATED',
    name: input.name || 'Sheikha Civilization Operating System Plan',
    scope: input.scope || 'V62_TO_V69_UNIFIED_OPERATION',
    layers: status().integrations,
    engines: status().engines,
    domains: input.domains || status().domains,
    lifecycle: status().lifecycle,
    governance: status().governance
  };
}

module.exports = { status, orchestrationPlan };
JS

cat > routes/civilization-operating-system/sheikha-civilization-operating-system-routes.js <<'JS'
'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  orchestrationPlan
} = require('../../runtime/civilization-operating-system/v70/sheikha-civilization-operating-system-v70');

router.get('/api/sheikha/civilization-operating-system/v70/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/civilization-operating-system/v70/demo', (_req, res) => res.json(orchestrationPlan()));
router.post('/api/sheikha/civilization-operating-system/v70/plan', (req, res) => res.json(orchestrationPlan(req.body || {})));

module.exports = router;
JS

cat > tools/civilization-operating-system/sheikha-civilization-operating-system-v70-cli.js <<'JS'
#!/usr/bin/env node
'use strict';

const {
  status,
  orchestrationPlan
} = require('../../runtime/civilization-operating-system/v70/sheikha-civilization-operating-system-v70');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') console.log(JSON.stringify(status(), null, 2));
else if (cmd === 'demo') console.log(JSON.stringify(orchestrationPlan(), null, 2));
else process.exit(1);
JS

chmod +x tools/civilization-operating-system/sheikha-civilization-operating-system-v70-cli.js

cat > docs/civilization-operating-system/SHEIKHA-CIVILIZATION-OPERATING-SYSTEM-V70.md <<'MD'
# SHEIKHA_CIVILIZATION_OPERATING_SYSTEM_V70

طبقة تشغيل عليا توحد V62 إلى V69 ضمن Orchestration Layer واحد.

## الطبقات المرتبطة

- V62 Unified Knowledge Science Fabric
- V63 Knowledge Graph Engine
- V64 Digital Twin Fabric
- V65 Industrial Cognitive Factory Fabric
- V66 Global Supply Chain Graph
- V67 Earth Digital Twin Fabric
- V68 Unified Scientific Knowledge Graph
- V69 Industrial Cluster Fabric

## الحوكمة

- لا ضرر ولا ضرار.
- الإنسان هو الأصل المكرم.
- الذكاء الصناعي أداة حساب وتحليل وتصنيف.
- لا ادعاء وعي.
- لا ادعاء تنبؤ بالغيب.
- منع التعليمات الخطرة.
- لا بديل عن الطبيب أو المختص.
- منع العصبية.
- موافقة بشرية في القرارات الحرجة.
- تحسين مستمر.
MD

python3 - <<'PY'
from pathlib import Path

p = Path("server.js")
s = p.read_text()

mount = """
try {
  app.use(require('./routes/civilization-operating-system/sheikha-civilization-operating-system-routes'));
} catch (error) {
  console.warn('[sheikha-civilization-operating-system-v70] route mount skipped:', error.message);
}
"""

if "sheikha-civilization-operating-system-v70" not in s:
    idx = s.find("app.use(express.json")
    if idx == -1:
        idx = s.find("app.use(")
    if idx == -1:
        raise SystemExit("Cannot find insertion point")
    s = s[:idx] + mount + "\n" + s[idx:]

p.write_text(s)
PY

node --check server.js
node --check runtime/civilization-operating-system/v70/sheikha-civilization-operating-system-v70.js
node --check routes/civilization-operating-system/sheikha-civilization-operating-system-routes.js
node --check tools/civilization-operating-system/sheikha-civilization-operating-system-v70-cli.js

node tools/civilization-operating-system/sheikha-civilization-operating-system-v70-cli.js status | jq '.system,.status,.apexLevel'
node tools/civilization-operating-system/sheikha-civilization-operating-system-v70-cli.js demo | jq '.status,.name,.scope'

pm2 restart sheikha-main-portal --update-env
sleep 2

curl -s http://127.0.0.1:8080/api/sheikha/civilization-operating-system/v70/status | jq '.system,.status,.apexLevel'
curl -s http://127.0.0.1:8080/api/sheikha/civilization-operating-system/v70/demo | jq '.status,.name'

npm test
npm run lint
node --check server.js

git add \
  server.js \
  activate-sheikha-civilization-operating-system-v70.sh \
  runtime/civilization-operating-system \
  routes/civilization-operating-system \
  tools/civilization-operating-system \
  docs/civilization-operating-system

git commit -m "Activate Sheikha civilization operating system V70"
git push origin feature/v70-civilization-operating-system

echo "== Done =="
