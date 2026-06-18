#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Projects/sheikha/sheikha-main-portal"
cd "$ROOT"

echo "== Activate SHEIKHA_KNOWLEDGE_GRAPH_ENGINE_V63 =="

mkdir -p runtime/knowledge-graph-engine/v3
mkdir -p routes/knowledge-graph-engine
mkdir -p tools/knowledge-graph-engine
mkdir -p docs/knowledge-graph-engine
mkdir -p data/knowledge-graph-engine

cat > runtime/knowledge-graph-engine/v3/sheikha-knowledge-graph-engine-v63.js <<'JS'
'use strict';

function status() {
  return {
    success: true,
    system: 'SHEIKHA_KNOWLEDGE_GRAPH_ENGINE_V63',
    status: 'ACTIVE',
    apexLevel: 63,
    role: 'UNIFIED_ENTITY_RELATION_KNOWLEDGE_GRAPH_ENGINE',
    domains: [
      'HUMAN',
      'SCIENCE',
      'MATHEMATICS',
      'MEDICINE',
      'FOOD',
      'WATER',
      'ENERGY',
      'MINING',
      'MATERIALS',
      'REFINERY',
      'PETROCHEMICAL',
      'MANUFACTURING',
      'ROBOTICS',
      'AI_PRODUCTION',
      'SUPPLY_CHAIN',
      'LOGISTICS',
      'SPACE',
      'SATELLITES',
      'RECYCLING',
      'CONTINUOUS_IMPROVEMENT'
    ],
    relationTypes: [
      'USES',
      'PRODUCES',
      'CONVERTS',
      'STORES',
      'TRANSPORTS',
      'SUPPLIES',
      'RECYCLES',
      'MEASURES',
      'CONTROLS',
      'IMPROVES'
    ],
    governance: {
      principle: 'لا ضرر ولا ضرار',
      humanIsPrimary: true,
      aiToolOnly: true,
      noConsciousnessClaim: true,
      noFuturePredictionClaim: true,
      calculationAndClassificationOnly: true
    }
  };
}

function normalizeEntity(entity = {}) {
  return {
    id: entity.id || `ent-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: entity.name || 'Unnamed Entity',
    type: entity.type || 'GENERAL',
    domain: entity.domain || 'KNOWLEDGE',
    properties: entity.properties || {}
  };
}

function buildGraph(input = {}) {
  const entities = (input.entities || []).map(normalizeEntity);
  const relations = (input.relations || []).map((r, i) => ({
    id: r.id || `rel-${i + 1}`,
    from: r.from,
    to: r.to,
    type: r.type || 'RELATED_TO',
    weight: Number(r.weight || 1),
    properties: r.properties || {}
  }));

  const byDomain = entities.reduce((a, e) => {
    a[e.domain] = (a[e.domain] || 0) + 1;
    return a;
  }, {});

  return {
    success: true,
    system: 'SHEIKHA_KNOWLEDGE_GRAPH_ENGINE_V63',
    status: 'GRAPH_BUILT',
    entityCount: entities.length,
    relationCount: relations.length,
    byDomain,
    entities,
    relations,
    governance: status().governance
  };
}

function demoGraph() {
  return buildGraph({
    entities: [
      { id: 'human', name: 'الإنسان', type: 'REFERENCE_MODEL', domain: 'HUMAN' },
      { id: 'knowledge', name: 'المعرفة', type: 'KNOWLEDGE', domain: 'SCIENCE' },
      { id: 'energy', name: 'الطاقة', type: 'RESOURCE', domain: 'ENERGY' },
      { id: 'material', name: 'المواد', type: 'RESOURCE', domain: 'MATERIALS' },
      { id: 'factory', name: 'المصنع', type: 'PRODUCTION_NODE', domain: 'MANUFACTURING' },
      { id: 'supply', name: 'سلسلة الإمداد', type: 'NETWORK', domain: 'SUPPLY_CHAIN' },
      { id: 'ai', name: 'إنتاج الذكاء الصناعي', type: 'AI_PRODUCTION', domain: 'AI_PRODUCTION' }
    ],
    relations: [
      { from: 'human', to: 'knowledge', type: 'LEARNS_AND_TEACHES' },
      { from: 'knowledge', to: 'ai', type: 'GOVERNS_AND_GUIDES' },
      { from: 'energy', to: 'factory', type: 'POWERS' },
      { from: 'material', to: 'factory', type: 'SUPPLIES' },
      { from: 'factory', to: 'supply', type: 'PRODUCES_TO' },
      { from: 'supply', to: 'ai', type: 'FEEDS_REALITY_SIGNALS' }
    ]
  });
}

module.exports = { status, buildGraph, demoGraph };
JS

cat > routes/knowledge-graph-engine/sheikha-knowledge-graph-engine-routes.js <<'JS'
'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  buildGraph,
  demoGraph
} = require('../../runtime/knowledge-graph-engine/v3/sheikha-knowledge-graph-engine-v63');

router.get('/api/sheikha/knowledge-graph-engine/v63/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/knowledge-graph-engine/v63/demo', (_req, res) => res.json(demoGraph()));
router.post('/api/sheikha/knowledge-graph-engine/v63/build', (req, res) => res.json(buildGraph(req.body || {})));

module.exports = router;
JS

cat > tools/knowledge-graph-engine/sheikha-knowledge-graph-engine-v63-cli.js <<'JS'
#!/usr/bin/env node
'use strict';

const { status, demoGraph, buildGraph } = require('../../runtime/knowledge-graph-engine/v3/sheikha-knowledge-graph-engine-v63');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') console.log(JSON.stringify(status(), null, 2));
else if (cmd === 'demo') console.log(JSON.stringify(demoGraph(), null, 2));
else if (cmd === 'build') console.log(JSON.stringify(buildGraph({ entities: [], relations: [] }), null, 2));
else process.exit(1);
JS

chmod +x tools/knowledge-graph-engine/sheikha-knowledge-graph-engine-v63-cli.js

cat > docs/knowledge-graph-engine/SHEIKHA-KNOWLEDGE-GRAPH-ENGINE-V63.md <<'MD'
# SHEIKHA_KNOWLEDGE_GRAPH_ENGINE_V63

محرك رسم معرفي موحد يربط الإنسان، العلم، الحساب، الطاقة، المواد، التعدين، التكرير، التصنيع، الروبوتات، الذكاء الصناعي، سلاسل الإمداد، اللوجستيات، الفضاء، وإعادة التدوير.

الإنسان هو المرجع المكرم، والذكاء الصناعي أداة حساب وتصنيف وتحليل فقط.

## العلاقات الأساسية

- USES
- PRODUCES
- CONVERTS
- STORES
- TRANSPORTS
- SUPPLIES
- RECYCLES
- MEASURES
- CONTROLS
- IMPROVES
MD

python3 - <<'PY'
from pathlib import Path

p = Path("server.js")
s = p.read_text()

mount = """
try {
  app.use(require('./routes/knowledge-graph-engine/sheikha-knowledge-graph-engine-routes'));
} catch (error) {
  console.warn('[sheikha-knowledge-graph-engine-v63] route mount skipped:', error.message);
}
"""

if "sheikha-knowledge-graph-engine-v63" not in s:
    idx = s.find("app.use(express.json")
    if idx == -1:
        idx = s.find("app.use(")
    if idx == -1:
        raise SystemExit("Cannot find insertion point")
    s = s[:idx] + mount + "\n" + s[idx:]

p.write_text(s)
PY

echo "== Checks =="
node --check server.js
node --check runtime/knowledge-graph-engine/v3/sheikha-knowledge-graph-engine-v63.js
node --check routes/knowledge-graph-engine/sheikha-knowledge-graph-engine-routes.js
node --check tools/knowledge-graph-engine/sheikha-knowledge-graph-engine-v63-cli.js

echo "== CLI tests =="
node tools/knowledge-graph-engine/sheikha-knowledge-graph-engine-v63-cli.js status | jq '.system,.status,.apexLevel'
node tools/knowledge-graph-engine/sheikha-knowledge-graph-engine-v63-cli.js demo | jq '.status,.entityCount,.relationCount,.byDomain'

echo "== Restart =="
pm2 restart sheikha-main-portal --update-env
sleep 2

echo "== API tests =="
curl -s http://127.0.0.1:8080/api/sheikha/knowledge-graph-engine/v63/status | jq '.system,.status,.apexLevel'
curl -s http://127.0.0.1:8080/api/sheikha/knowledge-graph-engine/v63/demo | jq '.status,.entityCount,.relationCount'

echo "== Full validation =="
npm test
npm run lint
node --check server.js

echo "== Commit =="
git add \
  server.js \
  activate-sheikha-knowledge-graph-engine-v63.sh \
  runtime/knowledge-graph-engine/v3 \
  routes/knowledge-graph-engine \
  tools/knowledge-graph-engine \
  docs/knowledge-graph-engine

git commit -m "Activate Sheikha knowledge graph engine V63"
git push origin feature/v63-knowledge-graph-engine

echo "== Done =="
