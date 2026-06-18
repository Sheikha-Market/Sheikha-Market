#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Projects/sheikha/sheikha-main-portal"
cd "$ROOT"

echo "== Activate SHEIKHA_GLOBAL_SUPPLY_CHAIN_GRAPH_V66 =="

mkdir -p runtime/global-supply-chain-graph/v1
mkdir -p routes/global-supply-chain-graph
mkdir -p tools/global-supply-chain-graph
mkdir -p docs/global-supply-chain-graph

cat > runtime/global-supply-chain-graph/v1/sheikha-global-supply-chain-graph-v66.js <<'JS'
'use strict';

function status() {
  return {
    success: true,
    system: 'SHEIKHA_GLOBAL_SUPPLY_CHAIN_GRAPH_V66',
    status: 'ACTIVE',
    apexLevel: 66,
    role: 'GLOBAL_SUPPLY_CHAIN_KNOWLEDGE_GRAPH_LINKED_TO_V63_V64_V65',
    integrations: [
      'SHEIKHA_KNOWLEDGE_GRAPH_ENGINE_V63',
      'SHEIKHA_DIGITAL_TWIN_FABRIC_V64',
      'SHEIKHA_INDUSTRIAL_COGNITIVE_FACTORY_FABRIC_V65'
    ],
    nodes: [
      'SUPPLIER',
      'RAW_MATERIAL',
      'MINE',
      'ENERGY_SOURCE',
      'REFINERY',
      'PETROCHEMICAL_PLANT',
      'FACTORY',
      'ROBOTICS_CELL',
      'WAREHOUSE',
      'PORT',
      'AIRPORT',
      'RAIL',
      'TRUCKING',
      'DISTRIBUTION_CENTER',
      'CUSTOMER',
      'REVERSE_LOGISTICS',
      'RECYCLING',
      'KNOWLEDGE_FEEDBACK'
    ],
    lifecycle: [
      'SOURCE',
      'CLASSIFY',
      'PROCURE',
      'STORE',
      'MOVE',
      'PRODUCE',
      'INSPECT',
      'DISTRIBUTE',
      'DELIVER',
      'RETURN',
      'RECYCLE',
      'LEARN',
      'IMPROVE'
    ],
    governance: {
      principle: 'لا ضرر ولا ضرار',
      quranSunnahValues: true,
      humanIsPrimary: true,
      aiToolOnly: true,
      calculationOnly: true,
      noFuturePredictionClaim: true,
      humanApprovalForCriticalActions: true,
      antiAsabiyyah: true
    }
  };
}

function buildSupplyChain(input = {}) {
  return {
    success: true,
    system: 'SHEIKHA_GLOBAL_SUPPLY_CHAIN_GRAPH_V66',
    status: 'SUPPLY_CHAIN_GRAPH_BUILT',
    name: input.name || 'Sheikha Global Supply Chain Graph',
    nodes: input.nodes || status().nodes,
    edges: input.edges || [
      ['SUPPLIER', 'RAW_MATERIAL'],
      ['RAW_MATERIAL', 'MINE'],
      ['MINE', 'REFINERY'],
      ['REFINERY', 'FACTORY'],
      ['FACTORY', 'WAREHOUSE'],
      ['WAREHOUSE', 'DISTRIBUTION_CENTER'],
      ['DISTRIBUTION_CENTER', 'CUSTOMER'],
      ['CUSTOMER', 'REVERSE_LOGISTICS'],
      ['REVERSE_LOGISTICS', 'RECYCLING'],
      ['RECYCLING', 'KNOWLEDGE_FEEDBACK']
    ],
    linkedKnowledgeGraph: 'V63',
    linkedDigitalTwin: 'V64',
    linkedFactoryFabric: 'V65',
    lifecycle: status().lifecycle,
    governance: status().governance
  };
}

module.exports = { status, buildSupplyChain };
JS

cat > routes/global-supply-chain-graph/sheikha-global-supply-chain-graph-routes.js <<'JS'
'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  buildSupplyChain
} = require('../../runtime/global-supply-chain-graph/v1/sheikha-global-supply-chain-graph-v66');

router.get('/api/sheikha/global-supply-chain-graph/v66/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/global-supply-chain-graph/v66/demo', (_req, res) => res.json(buildSupplyChain()));
router.post('/api/sheikha/global-supply-chain-graph/v66/build', (req, res) => res.json(buildSupplyChain(req.body || {})));

module.exports = router;
JS

cat > tools/global-supply-chain-graph/sheikha-global-supply-chain-graph-v66-cli.js <<'JS'
#!/usr/bin/env node
'use strict';

const { status, buildSupplyChain } = require('../../runtime/global-supply-chain-graph/v1/sheikha-global-supply-chain-graph-v66');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') console.log(JSON.stringify(status(), null, 2));
else if (cmd === 'demo') console.log(JSON.stringify(buildSupplyChain(), null, 2));
else process.exit(1);
JS

chmod +x tools/global-supply-chain-graph/sheikha-global-supply-chain-graph-v66-cli.js

cat > docs/global-supply-chain-graph/SHEIKHA-GLOBAL-SUPPLY-CHAIN-GRAPH-V66.md <<'MD'
# SHEIKHA_GLOBAL_SUPPLY_CHAIN_GRAPH_V66

طبقة رسم معرفي عالمي لسلاسل الإمداد تربط الموردين، المواد، المناجم، الطاقة، المصافي، المصانع، المستودعات، النقل، التوزيع، العملاء، الإرجاع، إعادة التدوير، والمعرفة الراجعة.

ترتبط مع:
- V63 Knowledge Graph
- V64 Digital Twin
- V65 Industrial Cognitive Factory

الحوكمة:
- لا ضرر ولا ضرار
- الإنسان هو الأصل
- الذكاء الصناعي أداة حساب وتحليل
- منع العصبية
- اعتماد الموافقة البشرية في القرارات الحرجة
MD

python3 - <<'PY'
from pathlib import Path

p = Path("server.js")
s = p.read_text()

mount = """
try {
  app.use(require('./routes/global-supply-chain-graph/sheikha-global-supply-chain-graph-routes'));
} catch (error) {
  console.warn('[sheikha-global-supply-chain-graph-v66] route mount skipped:', error.message);
}
"""

if "sheikha-global-supply-chain-graph-v66" not in s:
    idx = s.find("app.use(express.json")
    if idx == -1:
        idx = s.find("app.use(")
    if idx == -1:
        raise SystemExit("Cannot find insertion point")
    s = s[:idx] + mount + "\n" + s[idx:]

p.write_text(s)
PY

node --check server.js
node --check runtime/global-supply-chain-graph/v1/sheikha-global-supply-chain-graph-v66.js
node --check routes/global-supply-chain-graph/sheikha-global-supply-chain-graph-routes.js
node --check tools/global-supply-chain-graph/sheikha-global-supply-chain-graph-v66-cli.js

node tools/global-supply-chain-graph/sheikha-global-supply-chain-graph-v66-cli.js status | jq '.system,.status,.apexLevel'
node tools/global-supply-chain-graph/sheikha-global-supply-chain-graph-v66-cli.js demo | jq '.status,.name,.linkedKnowledgeGraph,.linkedDigitalTwin,.linkedFactoryFabric'

pm2 restart sheikha-main-portal --update-env
sleep 2

curl -s http://127.0.0.1:8080/api/sheikha/global-supply-chain-graph/v66/status | jq '.system,.status,.apexLevel'
curl -s http://127.0.0.1:8080/api/sheikha/global-supply-chain-graph/v66/demo | jq '.status,.name'

npm test
npm run lint
node --check server.js

git add \
  server.js \
  activate-sheikha-global-supply-chain-graph-v66.sh \
  runtime/global-supply-chain-graph \
  routes/global-supply-chain-graph \
  tools/global-supply-chain-graph \
  docs/global-supply-chain-graph

git commit -m "Activate Sheikha global supply chain graph V66"
git push origin feature/v66-global-supply-chain-graph

echo "== Done =="
