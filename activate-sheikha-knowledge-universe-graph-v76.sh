#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Projects/sheikha/sheikha-main-portal"
cd "$ROOT"

echo "== Activate SHEIKHA_KNOWLEDGE_UNIVERSE_GRAPH_V76 =="

mkdir -p runtime/knowledge-universe-graph/v76
mkdir -p routes/knowledge-universe-graph
mkdir -p tools/knowledge-universe-graph
mkdir -p docs/knowledge-universe-graph

cat > runtime/knowledge-universe-graph/v76/sheikha-knowledge-universe-graph-v76.js <<'JS'
'use strict';

function status() {
  return {
    success: true,
    system: 'SHEIKHA_KNOWLEDGE_UNIVERSE_GRAPH_V76',
    status: 'ACTIVE',
    apexLevel: 76,
    role: 'UNIFIED_KNOWLEDGE_UNIVERSE_GRAPH_FOR_V62_TO_V75',
    domains: [
      'KNOWLEDGE_GRAPH',
      'SEMANTIC_LINKS',
      'ENTITIES',
      'RELATIONS',
      'DISCOVERIES',
      'EVIDENCE',
      'SCIENCE',
      'INDUSTRY',
      'HEALTH',
      'SUPPLY_CHAIN',
      'EARTH',
      'RESOURCES',
      'RESEARCH',
      'QUALITY',
      'GOVERNANCE'
    ],
    lifecycle: [
      'COLLECT',
      'CLASSIFY',
      'LINK',
      'GRAPH',
      'REASON_CALCULATION_ONLY',
      'DISCOVER',
      'VALIDATE',
      'EVIDENCE_LINK',
      'HUMAN_REVIEW',
      'IMPROVE'
    ],
    integrations: [
      'SHEIKHA_UNIFIED_KNOWLEDGE_SCIENCE_FABRIC_V62',
      'SHEIKHA_KNOWLEDGE_GRAPH_ENGINE_V63',
      'SHEIKHA_DIGITAL_TWIN_FABRIC_V64',
      'SHEIKHA_INDUSTRIAL_COGNITIVE_FACTORY_FABRIC_V65',
      'SHEIKHA_GLOBAL_SUPPLY_CHAIN_GRAPH_V66',
      'SHEIKHA_EARTH_DIGITAL_TWIN_FABRIC_V67',
      'SHEIKHA_UNIFIED_SCIENTIFIC_KNOWLEDGE_GRAPH_V68',
      'SHEIKHA_INDUSTRIAL_CLUSTER_FABRIC_V69',
      'SHEIKHA_CIVILIZATION_OPERATING_SYSTEM_V70',
      'SHEIKHA_QUALITY_SAFETY_FABRIC_V71',
      'SHEIKHA_RESEARCH_INNOVATION_FABRIC_V72',
      'SHEIKHA_HUMAN_MODEL_FABRIC_V73',
      'SHEIKHA_SELF_HEALING_FABRIC_V74',
      'SHEIKHA_GLOBAL_ORCHESTRATOR_FABRIC_V75'
    ],
    governance: {
      principle: 'لا ضرر ولا ضرار',
      humanIsPrimary: true,
      aiToolOnly: true,
      calculationOnly: true,
      noConsciousnessClaim: true,
      noFuturePredictionClaim: true,
      humanApprovalForCriticalChanges: true,
      evidenceRequired: true,
      continuousImprovement: true
    }
  };
}

function universeGraph(input = {}) {
  return {
    success: true,
    system: 'SHEIKHA_KNOWLEDGE_UNIVERSE_GRAPH_V76',
    status: 'KNOWLEDGE_UNIVERSE_GRAPH_BUILT',
    name: input.name || 'Sheikha Knowledge Universe Graph',
    scope: input.scope || 'V62_TO_V75_UNIFIED_KNOWLEDGE_GRAPH',
    nodes: input.nodes || status().domains,
    edges: input.edges || [
      ['KNOWLEDGE_GRAPH', 'SEMANTIC_LINKS'],
      ['SEMANTIC_LINKS', 'ENTITIES'],
      ['ENTITIES', 'RELATIONS'],
      ['RELATIONS', 'EVIDENCE'],
      ['SCIENCE', 'INDUSTRY'],
      ['HEALTH', 'EVIDENCE'],
      ['SUPPLY_CHAIN', 'RESOURCES'],
      ['EARTH', 'RESOURCES'],
      ['RESEARCH', 'DISCOVERIES'],
      ['QUALITY', 'GOVERNANCE']
    ],
    linkedLayers: status().integrations,
    lifecycle: status().lifecycle,
    governance: status().governance
  };
}

module.exports = { status, universeGraph };
JS

cat > routes/knowledge-universe-graph/sheikha-knowledge-universe-graph-routes.js <<'JS'
'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  universeGraph
} = require('../../runtime/knowledge-universe-graph/v76/sheikha-knowledge-universe-graph-v76');

router.get('/api/sheikha/knowledge-universe-graph/v76/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/knowledge-universe-graph/v76/demo', (_req, res) => res.json(universeGraph()));
router.post('/api/sheikha/knowledge-universe-graph/v76/build', (req, res) => res.json(universeGraph(req.body || {})));

module.exports = router;
JS

cat > tools/knowledge-universe-graph/sheikha-knowledge-universe-graph-v76-cli.js <<'JS'
#!/usr/bin/env node
'use strict';

const {
  status,
  universeGraph
} = require('../../runtime/knowledge-universe-graph/v76/sheikha-knowledge-universe-graph-v76');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') console.log(JSON.stringify(status(), null, 2));
else if (cmd === 'demo') console.log(JSON.stringify(universeGraph(), null, 2));
else process.exit(1);
JS

chmod +x tools/knowledge-universe-graph/sheikha-knowledge-universe-graph-v76-cli.js

cat > docs/knowledge-universe-graph/SHEIKHA-KNOWLEDGE-UNIVERSE-GRAPH-V76.md <<'MD'
# SHEIKHA_KNOWLEDGE_UNIVERSE_GRAPH_V76

طبقة الرسم البياني المعرفي الموحد التي تربط V62 إلى V75.

## الحوكمة

- لا ضرر ولا ضرار.
- الإنسان هو الأصل المكرم.
- الذكاء الصناعي أداة حساب وتحليل وتصنيف فقط.
- لا ادعاء وعي.
- لا ادعاء تنبؤ بالغيب.
- ربط الأدلة مطلوب.
- موافقة بشرية للتغييرات الحرجة.
- تحسين مستمر.
MD

python3 - <<'PY'
from pathlib import Path

p = Path("server.js")
s = p.read_text()

mount = """
try {
  app.use(require('./routes/knowledge-universe-graph/sheikha-knowledge-universe-graph-routes'));
} catch (error) {
  console.warn('[sheikha-knowledge-universe-graph-v76] route mount skipped:', error.message);
}
"""

if "sheikha-knowledge-universe-graph-v76" not in s:
    idx = s.find("app.use(express.json")
    if idx == -1:
        idx = s.find("app.use(")
    if idx == -1:
        raise SystemExit("Cannot find insertion point")
    s = s[:idx] + mount + "\n" + s[idx:]

p.write_text(s)
PY

node --check server.js
node --check runtime/knowledge-universe-graph/v76/sheikha-knowledge-universe-graph-v76.js
node --check routes/knowledge-universe-graph/sheikha-knowledge-universe-graph-routes.js
node --check tools/knowledge-universe-graph/sheikha-knowledge-universe-graph-v76-cli.js

node tools/knowledge-universe-graph/sheikha-knowledge-universe-graph-v76-cli.js status | jq '.system,.status,.apexLevel'
node tools/knowledge-universe-graph/sheikha-knowledge-universe-graph-v76-cli.js demo | jq '.status,.name,.scope'

pm2 restart sheikha-main-portal --update-env
sleep 2

curl -s http://127.0.0.1:8080/api/sheikha/knowledge-universe-graph/v76/status | jq '.system,.status,.apexLevel'
curl -s http://127.0.0.1:8080/api/sheikha/knowledge-universe-graph/v76/demo | jq '.status,.name'

npm test
npm run lint
node --check server.js

git add \
  server.js \
  activate-sheikha-knowledge-universe-graph-v76.sh \
  runtime/knowledge-universe-graph \
  routes/knowledge-universe-graph \
  tools/knowledge-universe-graph \
  docs/knowledge-universe-graph

git commit -m "Activate Sheikha knowledge universe graph V76"
git push origin feature/v76-knowledge-universe-graph

echo "== Done =="
