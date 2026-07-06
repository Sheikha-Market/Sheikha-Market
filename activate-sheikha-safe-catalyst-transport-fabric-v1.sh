#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Projects/sheikha/sheikha-main-portal"
cd "$ROOT"

echo "== Activate SHEIKHA_SAFE_EXPONENTIAL_CATALYST_TRANSPORT_FABRIC_V1 =="

mkdir -p runtime/safe-catalyst-transport-fabric/v1
mkdir -p routes/safe-catalyst-transport-fabric
mkdir -p tools/safe-catalyst-transport-fabric
mkdir -p docs/safe-catalyst-transport-fabric
mkdir -p data/safe-catalyst-transport-fabric

cat > runtime/safe-catalyst-transport-fabric/v1/sheikha-safe-catalyst-transport-fabric-v1.js <<'JS'
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'data', 'safe-catalyst-transport-fabric');

function ensureData() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function status() {
  return {
    success: true,
    system: 'SHEIKHA_SAFE_EXPONENTIAL_CATALYST_TRANSPORT_FABRIC_V1',
    status: 'ACTIVE',
    apexLevel: 53,
    role: 'SAFE_NON_HARMFUL_EXPONENTIAL_CATALYST_AND_INFORMATION_TRANSPORT_OPTIMIZER',
    safeCatalysts: [
      'MODULAR_REPLICATION',
      'CLASSIFICATION_ROUTING',
      'SCHEMA_VALIDATION',
      'IDEMPOTENCY_KEYS',
      'CHECKSUM_VERIFICATION',
      'BATCHING',
      'STREAMING',
      'CACHE_ACCELERATION',
      'QUEUE_BACKPRESSURE',
      'AFFINITY_ROUTING',
      'VECTOR_SIMILARITY_ROUTING',
      'OBSERVABILITY_FEEDBACK'
    ],
    transportStates: [
      'PACKET_CONTAINER',
      'LIQUID_STREAM',
      'AIR_EVENT_BROADCAST',
      'MAGNETIC_AFFINITY_ROUTING',
      'VECTOR_ATTRACTION_FIELD'
    ],
    governance: {
      principle: 'لا ضرر ولا ضرار',
      safeOnly: true,
      noChemicalBiologicalCatalyst: true,
      noDestructiveReplication: true,
      noSecretExposure: true,
      noEnvMutation: true,
      calculationOnly: true,
      noFuturePredictionClaim: true
    }
  };
}

function classifyData(node = {}) {
  const t = String(node.type || node.dataType || '').toLowerCase();
  const content = node.content ?? node.schema ?? node.fields ?? node.payload ?? null;

  if (t.includes('semi')) return 'SEMI_STRUCTURED';
  if (t.includes('unstructured')) return 'UNSTRUCTURED';
  if (t.includes('structured')) return 'STRUCTURED';

  if (node.schema || Array.isArray(node.fields)) return 'STRUCTURED';
  if (content && typeof content === 'object' && !Array.isArray(content)) return 'STRUCTURED';
  if (typeof content === 'string' && (/^\s*[{[]/.test(content) || /[:=]/.test(content))) return 'SEMI_STRUCTURED';
  return 'UNSTRUCTURED';
}

function selectTransport(node = {}) {
  const dataType = classifyData(node);
  const size = Number(node.size || node.bytes || 0);
  const realtime = Boolean(node.realtime || node.live);
  const fanout = Number(node.fanout || 1);
  const similarity = Boolean(node.semantic || node.vector || node.embedding);
  const affinity = Boolean(node.affinity || node.owner || node.factory || node.cluster);

  if (similarity) return 'VECTOR_ATTRACTION_FIELD';
  if (affinity) return 'MAGNETIC_AFFINITY_ROUTING';
  if (realtime) return 'LIQUID_STREAM';
  if (fanout > 3) return 'AIR_EVENT_BROADCAST';
  if (size > 1024 * 1024) return 'PACKET_CONTAINER';
  if (dataType === 'STRUCTURED') return 'PACKET_CONTAINER';
  if (dataType === 'SEMI_STRUCTURED') return 'LIQUID_STREAM';
  return 'AIR_EVENT_BROADCAST';
}

function catalystScore(node = {}, depth = 0) {
  const base = Number(node.weight || 1);
  const safety = node.safe === false ? 0 : 1;
  const integration = Number(node.integration || 1);
  const classificationBoost = {
    STRUCTURED: 1.2,
    SEMI_STRUCTURED: 1.35,
    UNSTRUCTURED: 1.1
  }[classifyData(node)] || 1;

  return Number((base * safety * integration * classificationBoost * Math.pow(1.618, depth)).toFixed(6));
}

function analyze(input = {}) {
  ensureData();

  const roots = Array.isArray(input.roots) ? input.roots : [];
  const tabs = [];

  function walk(node, depth = 0, parent = '') {
    const name = String(node.name || node.id || `node-${tabs.length + 1}`);
    const pathName = parent ? `${parent}/${name}` : name;
    const dataType = classifyData(node);
    const transport = selectTransport(node);
    const score = catalystScore(node, depth);

    const record = {
      id: node.id || pathName,
      name,
      path: pathName,
      scope: String(node.scope || (depth === 0 ? 'ROOT' : 'TAB')).toUpperCase(),
      dataType,
      transport,
      depth,
      catalystScore: score,
      safeCatalysts: [
        'SCHEMA_VALIDATION',
        'IDEMPOTENCY_KEYS',
        'CHECKSUM_VERIFICATION',
        transport === 'LIQUID_STREAM' ? 'STREAMING' : 'BATCHING',
        transport === 'MAGNETIC_AFFINITY_ROUTING' ? 'AFFINITY_ROUTING' : 'CLASSIFICATION_ROUTING',
        transport === 'VECTOR_ATTRACTION_FIELD' ? 'VECTOR_SIMILARITY_ROUTING' : 'OBSERVABILITY_FEEDBACK'
      ]
    };

    tabs.push(record);

    for (const child of (Array.isArray(node.children) ? node.children : [])) {
      walk(child, depth + 1, pathName);
    }
  }

  roots.forEach((r) => walk(r));

  const byTransport = tabs.reduce((a, x) => {
    a[x.transport] = (a[x.transport] || 0) + 1;
    return a;
  }, {});

  const byType = tabs.reduce((a, x) => {
    a[x.dataType] = (a[x.dataType] || 0) + 1;
    return a;
  }, {});

  const result = {
    success: true,
    system: 'SHEIKHA_SAFE_EXPONENTIAL_CATALYST_TRANSPORT_FABRIC_V1',
    status: 'ANALYZED',
    totalTabs: tabs.length,
    totalCatalystScore: Number(tabs.reduce((s, x) => s + x.catalystScore, 0).toFixed(6)),
    byType,
    byTransport,
    tabs,
    strongestSafeCatalysts: [
      'SCHEMA_VALIDATION',
      'IDEMPOTENCY_KEYS',
      'CHECKSUM_VERIFICATION',
      'STREAMING',
      'AFFINITY_ROUTING',
      'VECTOR_SIMILARITY_ROUTING',
      'OBSERVABILITY_FEEDBACK'
    ],
    governance: status().governance
  };

  fs.writeFileSync(path.join(DATA_DIR, 'latest-analysis.json'), JSON.stringify(result, null, 2));
  return result;
}

module.exports = { status, analyze, classifyData, selectTransport };
JS

cat > routes/safe-catalyst-transport-fabric/sheikha-safe-catalyst-transport-fabric-routes.js <<'JS'
'use strict';

const express = require('express');
const router = express.Router();
const { status, analyze } = require('../../runtime/safe-catalyst-transport-fabric/v1/sheikha-safe-catalyst-transport-fabric-v1');

router.get('/api/sheikha/safe-catalyst-transport-fabric/v1/status', (_req, res) => res.json(status()));
router.post('/api/sheikha/safe-catalyst-transport-fabric/v1/analyze', (req, res) => res.json(analyze(req.body || {})));

module.exports = router;
JS

cat > tools/safe-catalyst-transport-fabric/sheikha-safe-catalyst-transport-fabric-cli.js <<'JS'
#!/usr/bin/env node
'use strict';

const { status, analyze } = require('../../runtime/safe-catalyst-transport-fabric/v1/sheikha-safe-catalyst-transport-fabric-v1');

if ((process.argv[2] || 'status') === 'status') {
  console.log(JSON.stringify(status(), null, 2));
} else {
  console.log(JSON.stringify(analyze({
    roots: [{
      name: 'Sheikha Root',
      scope: 'ROOT',
      type: 'structured',
      weight: 10,
      children: [
        { name: 'AI Cluster', scope: 'CLUSTER', type: 'semi_structured', realtime: true, weight: 8 },
        { name: 'Factory Branch', scope: 'FACTORY', type: 'structured', affinity: true, weight: 7 },
        { name: 'Knowledge Graph', scope: 'CATEGORY', type: 'unstructured', semantic: true, weight: 6 }
      ]
    }]
  }), null, 2));
}
JS

chmod +x tools/safe-catalyst-transport-fabric/sheikha-safe-catalyst-transport-fabric-cli.js

cat > docs/safe-catalyst-transport-fabric/SHEIKHA-SAFE-CATALYST-TRANSPORT-FABRIC-V1.md <<'MD'
# SHEIKHA_SAFE_EXPONENTIAL_CATALYST_TRANSPORT_FABRIC_V1

محفزات تكاثرية آمنة غير ضارة، ونظام اختيار حالة نقل المعلومات الأفضل:

- Packet Container: للرزم والحاويات والبيانات المهيكلة.
- Liquid Stream: للبث الحي والتدفق المستمر.
- Air Event Broadcast: للنشر الواسع غير الحساس.
- Magnetic Affinity Routing: للجذب حسب المصنع/المالك/الكلاستر.
- Vector Attraction Field: للجذب الدلالي والمعرفة غير المهيكلة.

كل ذلك قياس حسابي وتشغيلي فقط، لا تنبؤ ولا ضرر ولا ربا.
MD

python3 - <<'PY'
from pathlib import Path
p = Path("server.js")
s = p.read_text()
mount = """
try {
  app.use(require('./routes/safe-catalyst-transport-fabric/sheikha-safe-catalyst-transport-fabric-routes'));
} catch (error) {
  console.warn('[sheikha-safe-catalyst-transport-fabric] route mount skipped:', error.message);
}
"""
if "sheikha-safe-catalyst-transport-fabric" not in s:
    idx = s.find("app.use(express.json")
    if idx == -1:
        idx = s.find("app.use(")
    s = s[:idx] + mount + "\n" + s[idx:]
p.write_text(s)
PY

echo "== Checks =="
node --check server.js
node --check runtime/safe-catalyst-transport-fabric/v1/sheikha-safe-catalyst-transport-fabric-v1.js
node --check routes/safe-catalyst-transport-fabric/sheikha-safe-catalyst-transport-fabric-routes.js
node --check tools/safe-catalyst-transport-fabric/sheikha-safe-catalyst-transport-fabric-cli.js

echo "== CLI demo =="
node tools/safe-catalyst-transport-fabric/sheikha-safe-catalyst-transport-fabric-cli.js demo \
  | jq '.system,.status,.totalTabs,.byType,.byTransport,.strongestSafeCatalysts'

echo "== Restart =="
pm2 restart sheikha-main-portal --update-env
sleep 2

echo "== API test =="
curl -s -X POST http://127.0.0.1:8080/api/sheikha/safe-catalyst-transport-fabric/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{"roots":[{"name":"Root","scope":"ROOT","type":"structured","weight":10,"children":[{"name":"Cluster","scope":"CLUSTER","type":"semi_structured","realtime":true,"weight":8},{"name":"Factory","scope":"FACTORY","type":"structured","affinity":true,"weight":7},{"name":"Knowledge","scope":"CATEGORY","type":"unstructured","semantic":true,"weight":6}]}]}' \
  | jq '.system,.status,.totalTabs,.byTransport,.tabs'

echo "== Commit =="
git add \
  server.js \
  activate-sheikha-safe-catalyst-transport-fabric-v1.sh \
  runtime/safe-catalyst-transport-fabric \
  routes/safe-catalyst-transport-fabric \
  tools/safe-catalyst-transport-fabric \
  docs/safe-catalyst-transport-fabric

git commit -m "Activate Sheikha safe catalyst transport fabric"
git push origin feature/extension-experience-apex-v1

echo "== Done =="
