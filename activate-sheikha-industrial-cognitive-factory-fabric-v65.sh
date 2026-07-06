#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Projects/sheikha/sheikha-main-portal"
cd "$ROOT"

echo "== Activate SHEIKHA_INDUSTRIAL_COGNITIVE_FACTORY_FABRIC_V65 =="

mkdir -p runtime/industrial-cognitive-factory-fabric/v1
mkdir -p routes/industrial-cognitive-factory-fabric
mkdir -p tools/industrial-cognitive-factory-fabric
mkdir -p docs/industrial-cognitive-factory-fabric

cat > runtime/industrial-cognitive-factory-fabric/v1/sheikha-industrial-cognitive-factory-fabric-v65.js <<'JS'
'use strict';

function status() {
  return {
    success: true,
    system: 'SHEIKHA_INDUSTRIAL_COGNITIVE_FACTORY_FABRIC_V65',
    status: 'ACTIVE',
    apexLevel: 65,
    role: 'INDUSTRIAL_COGNITIVE_FACTORY_LINKED_TO_V62_V63_V64',
    integrations: [
      'SHEIKHA_UNIFIED_KNOWLEDGE_SCIENCE_FABRIC_V62',
      'SHEIKHA_KNOWLEDGE_GRAPH_ENGINE_V63',
      'SHEIKHA_DIGITAL_TWIN_FABRIC_V64'
    ],
    domains: [
      'RAW_MATERIALS',
      'MINING',
      'ENERGY',
      'REFINERY',
      'PETROCHEMICAL',
      'MANUFACTURING',
      'ROBOTICS',
      'SUPPLY_CHAIN',
      'LOGISTICS',
      'QUALITY',
      'SAFETY',
      'RECYCLING'
    ],
    lifecycle: [
      'DISCOVER',
      'CLASSIFY',
      'STORE',
      'TRANSPORT',
      'PROCESS',
      'PRODUCE',
      'INSPECT',
      'DELIVER',
      'RECYCLE',
      'IMPROVE'
    ],
    governance: {
      principle: 'لا ضرر ولا ضرار',
      quranSunnahValues: true,
      humanIsPrimary: true,
      aiToolOnly: true,
      calculationOnly: true,
      noConsciousnessClaim: true,
      noFuturePredictionClaim: true,
      humanApprovalForCriticalActions: true,
      antiAsabiyyah: true,
      noTribalArrogance: true,
      noLineageSuperiorityClaim: true,
      dignityByTaqwaAndGoodConduct: true
    }
  };
}

function factoryPlan(input = {}) {
  return {
    success: true,
    system: 'SHEIKHA_INDUSTRIAL_COGNITIVE_FACTORY_FABRIC_V65',
    status: 'FACTORY_PLAN_CREATED',
    name: input.name || 'Sheikha Industrial Cognitive Factory',
    factoryType: input.factoryType || 'GENERAL_INDUSTRIAL',
    inputMaterials: input.inputMaterials || [],
    outputProducts: input.outputProducts || [],
    linkedKnowledgeGraph: 'V63',
    linkedDigitalTwin: 'V64',
    lifecycle: status().lifecycle,
    governance: status().governance
  };
}

function demoPlan() {
  return factoryPlan({
    name: 'Mining Energy Manufacturing Supply Chain Factory',
    factoryType: 'INDUSTRIAL_CLUSTER',
    inputMaterials: ['raw_materials', 'energy', 'knowledge'],
    outputProducts: ['products', 'byproducts', 'recycled_materials', 'knowledge_feedback']
  });
}

module.exports = { status, factoryPlan, demoPlan };
JS

cat > routes/industrial-cognitive-factory-fabric/sheikha-industrial-cognitive-factory-fabric-routes.js <<'JS'
'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  factoryPlan,
  demoPlan
} = require('../../runtime/industrial-cognitive-factory-fabric/v1/sheikha-industrial-cognitive-factory-fabric-v65');

router.get('/api/sheikha/industrial-cognitive-factory-fabric/v65/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/industrial-cognitive-factory-fabric/v65/demo', (_req, res) => res.json(demoPlan()));
router.post('/api/sheikha/industrial-cognitive-factory-fabric/v65/plan', (req, res) => res.json(factoryPlan(req.body || {})));

module.exports = router;
JS

cat > tools/industrial-cognitive-factory-fabric/sheikha-industrial-cognitive-factory-fabric-v65-cli.js <<'JS'
#!/usr/bin/env node
'use strict';

const { status, demoPlan, factoryPlan } = require('../../runtime/industrial-cognitive-factory-fabric/v1/sheikha-industrial-cognitive-factory-fabric-v65');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') console.log(JSON.stringify(status(), null, 2));
else if (cmd === 'demo') console.log(JSON.stringify(demoPlan(), null, 2));
else if (cmd === 'plan') console.log(JSON.stringify(factoryPlan({ name: 'Manual Factory Plan' }), null, 2));
else process.exit(1);
JS

chmod +x tools/industrial-cognitive-factory-fabric/sheikha-industrial-cognitive-factory-fabric-v65-cli.js

cat > docs/industrial-cognitive-factory-fabric/SHEIKHA-INDUSTRIAL-COGNITIVE-FACTORY-FABRIC-V65.md <<'MD'
# SHEIKHA_INDUSTRIAL_COGNITIVE_FACTORY_FABRIC_V65

طبقة مصنع صناعي معرفي تربط V62 المعرفة والعلوم، V63 الرسم المعرفي، وV64 التوأم الرقمي.

## الحوكمة

- لا ضرر ولا ضرار.
- الإنسان مكرم وهو الأصل.
- الذكاء الصناعي أداة حساب وتصنيف وتحليل فقط.
- منع التعصب القبلي والكبر بالنسب.
- التفاضل بالتقوى والعمل الصالح وحسن الخلق، لا بالعصبية.
MD

python3 - <<'PY'
from pathlib import Path

p = Path("server.js")
s = p.read_text()

mount = """
try {
  app.use(require('./routes/industrial-cognitive-factory-fabric/sheikha-industrial-cognitive-factory-fabric-routes'));
} catch (error) {
  console.warn('[sheikha-industrial-cognitive-factory-fabric-v65] route mount skipped:', error.message);
}
"""

if "sheikha-industrial-cognitive-factory-fabric-v65" not in s:
    idx = s.find("app.use(express.json")
    if idx == -1:
        idx = s.find("app.use(")
    if idx == -1:
        raise SystemExit("Cannot find insertion point")
    s = s[:idx] + mount + "\n" + s[idx:]

p.write_text(s)
PY

node --check server.js
node --check runtime/industrial-cognitive-factory-fabric/v1/sheikha-industrial-cognitive-factory-fabric-v65.js
node --check routes/industrial-cognitive-factory-fabric/sheikha-industrial-cognitive-factory-fabric-routes.js
node --check tools/industrial-cognitive-factory-fabric/sheikha-industrial-cognitive-factory-fabric-v65-cli.js

node tools/industrial-cognitive-factory-fabric/sheikha-industrial-cognitive-factory-fabric-v65-cli.js status | jq '.system,.status,.apexLevel,.governance.antiAsabiyyah'
node tools/industrial-cognitive-factory-fabric/sheikha-industrial-cognitive-factory-fabric-v65-cli.js demo | jq '.status,.name,.factoryType'

pm2 restart sheikha-main-portal --update-env
sleep 2

curl -s http://127.0.0.1:8080/api/sheikha/industrial-cognitive-factory-fabric/v65/status | jq '.system,.status,.apexLevel,.governance'

npm test
npm run lint
node --check server.js

git add \
  server.js \
  activate-sheikha-industrial-cognitive-factory-fabric-v65.sh \
  runtime/industrial-cognitive-factory-fabric \
  routes/industrial-cognitive-factory-fabric \
  tools/industrial-cognitive-factory-fabric \
  docs/industrial-cognitive-factory-fabric

git commit -m "Activate Sheikha industrial cognitive factory fabric V65"
git push origin feature/v65-industrial-cognitive-factory

echo "== Done =="
