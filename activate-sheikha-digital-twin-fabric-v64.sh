#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Projects/sheikha/sheikha-main-portal"
cd "$ROOT"

echo "== Activate SHEIKHA_DIGITAL_TWIN_FABRIC_V64 =="

mkdir -p runtime/digital-twin-fabric/v1
mkdir -p routes/digital-twin-fabric
mkdir -p tools/digital-twin-fabric
mkdir -p docs/digital-twin-fabric
mkdir -p data/digital-twin-fabric

cat > runtime/digital-twin-fabric/v1/sheikha-digital-twin-fabric-v64.js <<'JS'
'use strict';

function status() {
  return {
    success: true,
    system: 'SHEIKHA_DIGITAL_TWIN_FABRIC_V64',
    status: 'ACTIVE',
    apexLevel: 64,
    role: 'UNIFIED_DIGITAL_TWIN_FOR_MATERIALS_FACTORIES_SUPPLY_CHAINS_ENERGY_AI',
    twinTypes: [
      'HUMAN_REFERENCE_LEARNING_MODEL',
      'MATERIAL',
      'PRODUCT',
      'FACTORY',
      'MACHINE',
      'WAREHOUSE',
      'SUPPLY_CHAIN',
      'LOGISTICS_NODE',
      'ENERGY_SYSTEM',
      'MINING_SITE',
      'REFINERY',
      'ROBOT',
      'SATELLITE',
      'AI_PRODUCTION_NODE'
    ],
    lifecycle: [
      'IDENTIFY',
      'CLASSIFY',
      'MODEL',
      'LINK_TO_KNOWLEDGE_GRAPH',
      'MEASURE',
      'MONITOR',
      'SIMULATE_CALCULATION_ONLY',
      'QUALITY_GATE',
      'SAFETY_GATE',
      'IMPROVE'
    ],
    governance: {
      principle: 'لا ضرر ولا ضرار',
      humanIsPrimary: true,
      aiToolOnly: true,
      noConsciousnessClaim: true,
      noFuturePredictionClaim: true,
      calculationOnly: true,
      humanApprovalForCriticalActions: true
    }
  };
}

function createTwin(input = {}) {
  const twin = {
    success: true,
    system: 'SHEIKHA_DIGITAL_TWIN_FABRIC_V64',
    status: 'TWIN_CREATED',
    id: input.id || `twin-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: input.name || 'Unnamed Twin',
    type: input.type || 'GENERAL',
    domain: input.domain || 'KNOWLEDGE',
    state: input.state || {},
    metrics: input.metrics || {},
    links: input.links || [],
    lifecycle: status().lifecycle,
    governance: status().governance
  };
  return twin;
}

function demoTwin() {
  return createTwin({
    id: 'factory-supply-ai-demo',
    name: 'Factory Supply AI Digital Twin',
    type: 'FACTORY',
    domain: 'MANUFACTURING_SUPPLY_CHAIN_AI',
    state: {
      materialFlow: 'ACTIVE',
      energyFlow: 'MONITORED',
      supplyChain: 'LINKED',
      knowledgeGraph: 'V63_LINKED'
    },
    metrics: {
      quality: 1,
      safety: 1,
      observability: 1
    },
    links: [
      { to: 'SHEIKHA_KNOWLEDGE_GRAPH_ENGINE_V63', type: 'LINKS_TO' },
      { to: 'SUPPLY_CHAIN', type: 'OBSERVES' },
      { to: 'AI_PRODUCTION', type: 'FEEDS' }
    ]
  });
}

module.exports = { status, createTwin, demoTwin };
JS

cat > routes/digital-twin-fabric/sheikha-digital-twin-fabric-routes.js <<'JS'
'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  createTwin,
  demoTwin
} = require('../../runtime/digital-twin-fabric/v1/sheikha-digital-twin-fabric-v64');

router.get('/api/sheikha/digital-twin-fabric/v64/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/digital-twin-fabric/v64/demo', (_req, res) => res.json(demoTwin()));
router.post('/api/sheikha/digital-twin-fabric/v64/twin', (req, res) => res.json(createTwin(req.body || {})));

module.exports = router;
JS

cat > tools/digital-twin-fabric/sheikha-digital-twin-fabric-v64-cli.js <<'JS'
#!/usr/bin/env node
'use strict';

const {
  status,
  createTwin,
  demoTwin
} = require('../../runtime/digital-twin-fabric/v1/sheikha-digital-twin-fabric-v64');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') console.log(JSON.stringify(status(), null, 2));
else if (cmd === 'demo') console.log(JSON.stringify(demoTwin(), null, 2));
else if (cmd === 'twin') console.log(JSON.stringify(createTwin({ name: 'Manual Twin', type: 'GENERAL' }), null, 2));
else process.exit(1);
JS

chmod +x tools/digital-twin-fabric/sheikha-digital-twin-fabric-v64-cli.js

cat > docs/digital-twin-fabric/SHEIKHA-DIGITAL-TWIN-FABRIC-V64.md <<'MD'
# SHEIKHA_DIGITAL_TWIN_FABRIC_V64

طبقة التوأم الرقمي الموحد لمنظومة شيخة.

تربط المواد، المصانع، الطاقة، المناجم، المصافي، الآلات، المستودعات، سلاسل الإمداد، الروبوتات، الأقمار الصناعية، وإنتاج الذكاء الصناعي بمحرك الرسم المعرفي V63.

الإنسان هو المرجع المكرم، والذكاء الصناعي أداة حساب وتصنيف وتحليل فقط.
MD

python3 - <<'PY'
from pathlib import Path

p = Path("server.js")
s = p.read_text()

mount = """
try {
  app.use(require('./routes/digital-twin-fabric/sheikha-digital-twin-fabric-routes'));
} catch (error) {
  console.warn('[sheikha-digital-twin-fabric-v64] route mount skipped:', error.message);
}
"""

if "sheikha-digital-twin-fabric-v64" not in s:
    idx = s.find("app.use(express.json")
    if idx == -1:
        idx = s.find("app.use(")
    if idx == -1:
        raise SystemExit("Cannot find insertion point")
    s = s[:idx] + mount + "\n" + s[idx:]

p.write_text(s)
PY

node --check server.js
node --check runtime/digital-twin-fabric/v1/sheikha-digital-twin-fabric-v64.js
node --check routes/digital-twin-fabric/sheikha-digital-twin-fabric-routes.js
node --check tools/digital-twin-fabric/sheikha-digital-twin-fabric-v64-cli.js

node tools/digital-twin-fabric/sheikha-digital-twin-fabric-v64-cli.js status | jq '.system,.status,.apexLevel'
node tools/digital-twin-fabric/sheikha-digital-twin-fabric-v64-cli.js demo | jq '.status,.name,.type,.links'

pm2 restart sheikha-main-portal --update-env
sleep 2

curl -s http://127.0.0.1:8080/api/sheikha/digital-twin-fabric/v64/status | jq '.system,.status,.apexLevel'
curl -s http://127.0.0.1:8080/api/sheikha/digital-twin-fabric/v64/demo | jq '.status,.name,.type'

npm test
npm run lint
node --check server.js

git add \
  server.js \
  activate-sheikha-digital-twin-fabric-v64.sh \
  runtime/digital-twin-fabric \
  routes/digital-twin-fabric \
  tools/digital-twin-fabric \
  docs/digital-twin-fabric

git commit -m "Activate Sheikha digital twin fabric V64"
git push origin feature/v64-digital-twin-fabric

echo "== Done =="
