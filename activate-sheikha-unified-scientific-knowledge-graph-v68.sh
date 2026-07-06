#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Projects/sheikha/sheikha-main-portal"
cd "$ROOT"

echo "== Activate SHEIKHA_UNIFIED_SCIENTIFIC_KNOWLEDGE_GRAPH_V68 =="

mkdir -p runtime/unified-scientific-knowledge-graph/v1
mkdir -p routes/unified-scientific-knowledge-graph
mkdir -p tools/unified-scientific-knowledge-graph
mkdir -p docs/unified-scientific-knowledge-graph

cat > runtime/unified-scientific-knowledge-graph/v1/sheikha-unified-scientific-knowledge-graph-v68.js <<'JS'
'use strict';

function status() {
  return {
    success: true,
    system: 'SHEIKHA_UNIFIED_SCIENTIFIC_KNOWLEDGE_GRAPH_V68',
    status: 'ACTIVE',
    apexLevel: 68,
    role: 'UNIFIED_SCIENCE_KNOWLEDGE_GRAPH_LINKED_TO_V62_V67',
    integrations: [
      'SHEIKHA_UNIFIED_KNOWLEDGE_SCIENCE_FABRIC_V62',
      'SHEIKHA_KNOWLEDGE_GRAPH_ENGINE_V63',
      'SHEIKHA_DIGITAL_TWIN_FABRIC_V64',
      'SHEIKHA_INDUSTRIAL_COGNITIVE_FACTORY_FABRIC_V65',
      'SHEIKHA_GLOBAL_SUPPLY_CHAIN_GRAPH_V66',
      'SHEIKHA_EARTH_DIGITAL_TWIN_FABRIC_V67'
    ],
    scienceDomains: [
      'MATHEMATICS',
      'PHYSICS',
      'CHEMISTRY',
      'BIOLOGY',
      'MEDICINE',
      'NUTRITION',
      'PHARMACY',
      'MATERIALS_SCIENCE',
      'MINING',
      'METALLURGY',
      'ENERGY',
      'PETROLEUM',
      'GAS',
      'ELECTRICITY',
      'HYDROGEN',
      'MANUFACTURING',
      'ROBOTICS',
      'COMPUTER_SCIENCE',
      'AI',
      'SPACE',
      'SATELLITES',
      'COMMUNICATIONS',
      'ENVIRONMENT',
      'WATER',
      'FOOD',
      'AGRICULTURE'
    ],
    relationTypes: [
      'EXPLAINS',
      'MEASURES',
      'CALCULATES',
      'TRANSFORMS',
      'CAUSES',
      'SUPPORTS',
      'REQUIRES',
      'PRODUCES',
      'VALIDATES',
      'IMPROVES'
    ],
    lifecycle: [
      'OBSERVE',
      'CLASSIFY',
      'CONNECT',
      'CALCULATE',
      'EVIDENCE_LINK',
      'QUALITY_GATE',
      'SAFETY_GATE',
      'HUMAN_REVIEW',
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
      noMedicalReplacement: true,
      noHazardousInstructions: true,
      humanApprovalForCriticalActions: true,
      antiAsabiyyah: true
    }
  };
}

function buildScienceGraph(input = {}) {
  return {
    success: true,
    system: 'SHEIKHA_UNIFIED_SCIENTIFIC_KNOWLEDGE_GRAPH_V68',
    status: 'SCIENCE_GRAPH_BUILT',
    name: input.name || 'Sheikha Unified Scientific Knowledge Graph',
    domains: input.domains || status().scienceDomains,
    relations: input.relations || [
      ['MATHEMATICS', 'PHYSICS', 'CALCULATES'],
      ['PHYSICS', 'ENERGY', 'EXPLAINS'],
      ['CHEMISTRY', 'PETROCHEMICAL', 'SUPPORTS'],
      ['BIOLOGY', 'MEDICINE', 'SUPPORTS'],
      ['NUTRITION', 'HEALTH', 'IMPROVES'],
      ['MATERIALS_SCIENCE', 'MANUFACTURING', 'SUPPORTS'],
      ['COMPUTER_SCIENCE', 'AI', 'PRODUCES'],
      ['SPACE', 'SATELLITES', 'REQUIRES'],
      ['WATER', 'AGRICULTURE', 'SUPPORTS'],
      ['SCIENCE', 'CONTINUOUS_IMPROVEMENT', 'IMPROVES']
    ],
    linkedLayers: status().integrations,
    lifecycle: status().lifecycle,
    governance: status().governance
  };
}

module.exports = { status, buildScienceGraph };
JS

cat > routes/unified-scientific-knowledge-graph/sheikha-unified-scientific-knowledge-graph-routes.js <<'JS'
'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  buildScienceGraph
} = require('../../runtime/unified-scientific-knowledge-graph/v1/sheikha-unified-scientific-knowledge-graph-v68');

router.get('/api/sheikha/unified-scientific-knowledge-graph/v68/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/unified-scientific-knowledge-graph/v68/demo', (_req, res) => res.json(buildScienceGraph()));
router.post('/api/sheikha/unified-scientific-knowledge-graph/v68/build', (req, res) => res.json(buildScienceGraph(req.body || {})));

module.exports = router;
JS

cat > tools/unified-scientific-knowledge-graph/sheikha-unified-scientific-knowledge-graph-v68-cli.js <<'JS'
#!/usr/bin/env node
'use strict';

const {
  status,
  buildScienceGraph
} = require('../../runtime/unified-scientific-knowledge-graph/v1/sheikha-unified-scientific-knowledge-graph-v68');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') console.log(JSON.stringify(status(), null, 2));
else if (cmd === 'demo') console.log(JSON.stringify(buildScienceGraph(), null, 2));
else process.exit(1);
JS

chmod +x tools/unified-scientific-knowledge-graph/sheikha-unified-scientific-knowledge-graph-v68-cli.js

cat > docs/unified-scientific-knowledge-graph/SHEIKHA-UNIFIED-SCIENTIFIC-KNOWLEDGE-GRAPH-V68.md <<'MD'
# SHEIKHA_UNIFIED_SCIENTIFIC_KNOWLEDGE_GRAPH_V68

موسوعة علمية معرفية مترابطة تربط الرياضيات، الفيزياء، الكيمياء، الأحياء، الطب، التغذية، علوم المواد، التعدين، الطاقة، التصنيع، الروبوتات، علوم الحاسب، الذكاء الصناعي، الفضاء، المياه، الغذاء، والزراعة.

ترتبط مع V62 إلى V67.

الحوكمة:
- لا ضرر ولا ضرار
- الإنسان هو الأصل
- الذكاء الصناعي أداة حساب وتحليل
- لا ادعاء تنبؤ بالغيب
- لا بديل عن الطبيب أو المختص
- منع التعليمات الخطرة
- منع العصبية
MD

python3 - <<'PY'
from pathlib import Path

p = Path("server.js")
s = p.read_text()

mount = """
try {
  app.use(require('./routes/unified-scientific-knowledge-graph/sheikha-unified-scientific-knowledge-graph-routes'));
} catch (error) {
  console.warn('[sheikha-unified-scientific-knowledge-graph-v68] route mount skipped:', error.message);
}
"""

if "sheikha-unified-scientific-knowledge-graph-v68" not in s:
    idx = s.find("app.use(express.json")
    if idx == -1:
        idx = s.find("app.use(")
    if idx == -1:
        raise SystemExit("Cannot find insertion point")
    s = s[:idx] + mount + "\n" + s[idx:]

p.write_text(s)
PY

node --check server.js
node --check runtime/unified-scientific-knowledge-graph/v1/sheikha-unified-scientific-knowledge-graph-v68.js
node --check routes/unified-scientific-knowledge-graph/sheikha-unified-scientific-knowledge-graph-routes.js
node --check tools/unified-scientific-knowledge-graph/sheikha-unified-scientific-knowledge-graph-v68-cli.js

node tools/unified-scientific-knowledge-graph/sheikha-unified-scientific-knowledge-graph-v68-cli.js status | jq '.system,.status,.apexLevel'
node tools/unified-scientific-knowledge-graph/sheikha-unified-scientific-knowledge-graph-v68-cli.js demo | jq '.status,.name,.relations[0:4]'

pm2 restart sheikha-main-portal --update-env
sleep 2

curl -s http://127.0.0.1:8080/api/sheikha/unified-scientific-knowledge-graph/v68/status | jq '.system,.status,.apexLevel'
curl -s http://127.0.0.1:8080/api/sheikha/unified-scientific-knowledge-graph/v68/demo | jq '.status,.name'

npm test
npm run lint
node --check server.js

git add \
  server.js \
  activate-sheikha-unified-scientific-knowledge-graph-v68.sh \
  runtime/unified-scientific-knowledge-graph \
  routes/unified-scientific-knowledge-graph \
  tools/unified-scientific-knowledge-graph \
  docs/unified-scientific-knowledge-graph

git commit -m "Activate Sheikha unified scientific knowledge graph V68"
git push origin feature/v68-unified-scientific-knowledge-graph

echo "== Done =="
