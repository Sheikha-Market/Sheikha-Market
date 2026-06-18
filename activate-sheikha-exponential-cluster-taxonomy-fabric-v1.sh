#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Projects/sheikha/sheikha-main-portal"
cd "$ROOT"

echo "== Activate SHEIKHA_EXPONENTIAL_CLUSTER_TAXONOMY_FABRIC_V1 =="

mkdir -p runtime/exponential-cluster-taxonomy-fabric/v1
mkdir -p routes/exponential-cluster-taxonomy-fabric
mkdir -p tools/exponential-cluster-taxonomy-fabric
mkdir -p docs/exponential-cluster-taxonomy-fabric
mkdir -p data/exponential-cluster-taxonomy-fabric

cat > runtime/exponential-cluster-taxonomy-fabric/v1/sheikha-exponential-cluster-taxonomy-fabric-v1.js <<'JS'
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'data', 'exponential-cluster-taxonomy-fabric');

function ensureData() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function status() {
  return {
    success: true,
    system: 'SHEIKHA_EXPONENTIAL_CLUSTER_TAXONOMY_FABRIC_V1',
    status: 'ACTIVE',
    apexLevel: 52,
    role: 'ROOT_CLUSTER_PIPELINE_BRANCH_FACTORY_TAXONOMY_EXPONENTIAL_ENGINE',
    taxonomy: {
      dataTypes: ['STRUCTURED', 'SEMI_STRUCTURED', 'UNSTRUCTURED'],
      scopes: ['ROOT', 'CLUSTER', 'PIPELINE', 'BRANCH', 'FACTORY', 'CATEGORY', 'TAB'],
      growthMode: 'CALCULATION_ONLY_NOT_PREDICTION'
    },
    governance: {
      principle: 'لا ضرر ولا ضرار',
      noFuturePredictionClaim: true,
      calculationOnly: true,
      noRibaAutomation: true,
      secretsProtected: true,
      envProtected: true
    }
  };
}

function classifyNode(node = {}) {
  const rawType = String(node.type || node.dataType || '').toLowerCase();
  const content = node.content ?? node.schema ?? node.fields ?? null;

  if (rawType.includes('structured') && !rawType.includes('semi')) return 'STRUCTURED';
  if (rawType.includes('semi')) return 'SEMI_STRUCTURED';
  if (rawType.includes('unstructured')) return 'UNSTRUCTURED';

  if (Array.isArray(node.fields) || node.schema || (content && typeof content === 'object' && !Array.isArray(content))) {
    return 'STRUCTURED';
  }

  if (typeof content === 'string') {
    if (/^\s*[{[]/.test(content) || /[:=]/.test(content)) return 'SEMI_STRUCTURED';
    return 'UNSTRUCTURED';
  }

  return 'UNSTRUCTURED';
}

function compoundScore(base, factor, depth) {
  const b = Math.max(0, Number(base || 1));
  const f = Math.max(0, Number(factor || 1));
  const d = Math.max(0, Number(depth || 0));
  return Number((b * Math.pow(f, d)).toFixed(6));
}

function buildTree(input = {}) {
  const roots = Array.isArray(input.roots) ? input.roots : [];
  const growthFactor = Number(input.growthFactor || 1.618);
  const maxDepth = Number(input.maxDepth || 5);

  function visit(node, depth = 0, pathParts = []) {
    const name = String(node.name || node.id || `node-${depth}`);
    const scope = String(node.scope || (depth === 0 ? 'ROOT' : 'CATEGORY')).toUpperCase();
    const dataType = classifyNode(node);
    const children = Array.isArray(node.children) ? node.children : [];
    const nodePath = [...pathParts, name];

    const tab = {
      id: node.id || nodePath.join('/'),
      name,
      scope,
      dataType,
      depth,
      path: nodePath.join('/'),
      baseWeight: Number(node.weight || 1),
      exponentialScore: compoundScore(node.weight || 1, growthFactor, depth),
      integrationKeys: children.map((x) => String(x.name || x.id || 'child')),
      children: depth < maxDepth ? children.map((child) => visit(child, depth + 1, nodePath)) : []
    };

    tab.integrationScore = Number((
      tab.children.reduce((sum, x) => sum + x.exponentialScore, 0) + tab.exponentialScore
    ).toFixed(6));

    return tab;
  }

  return roots.map((root) => visit(root));
}

function flatten(nodes = [], out = []) {
  for (const node of nodes) {
    out.push({
      id: node.id,
      name: node.name,
      scope: node.scope,
      dataType: node.dataType,
      depth: node.depth,
      path: node.path,
      exponentialScore: node.exponentialScore,
      integrationScore: node.integrationScore
    });
    flatten(node.children || [], out);
  }
  return out;
}

function analyze(input = {}) {
  ensureData();

  const tree = buildTree(input);
  const flat = flatten(tree);
  const byType = flat.reduce((acc, x) => {
    acc[x.dataType] = (acc[x.dataType] || 0) + 1;
    return acc;
  }, {});

  const byScope = flat.reduce((acc, x) => {
    acc[x.scope] = (acc[x.scope] || 0) + 1;
    return acc;
  }, {});

  const result = {
    success: true,
    system: 'SHEIKHA_EXPONENTIAL_CLUSTER_TAXONOMY_FABRIC_V1',
    status: 'ANALYZED',
    growthFactor: Number(input.growthFactor || 1.618),
    maxDepth: Number(input.maxDepth || 5),
    totalNodes: flat.length,
    byType,
    byScope,
    totalExponentialScore: Number(flat.reduce((s, x) => s + x.exponentialScore, 0).toFixed(6)),
    totalIntegrationScore: Number(flat.reduce((s, x) => s + x.integrationScore, 0).toFixed(6)),
    tabs: flat,
    tree,
    governance: {
      calculationOnly: true,
      noFuturePredictionClaim: true,
      note: 'هذا اختبار تكاثر أسي وتصنيف وتبويب وتكامل حسابي، وليس تنبؤاً بالغيب ولا توصية مالية.'
    }
  };

  fs.writeFileSync(
    path.join(DATA_DIR, 'latest-analysis.json'),
    JSON.stringify(result, null, 2)
  );

  return result;
}

module.exports = { status, analyze, classifyNode };
JS

cat > routes/exponential-cluster-taxonomy-fabric/sheikha-exponential-cluster-taxonomy-fabric-routes.js <<'JS'
'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  analyze
} = require('../../runtime/exponential-cluster-taxonomy-fabric/v1/sheikha-exponential-cluster-taxonomy-fabric-v1');

router.get('/api/sheikha/exponential-cluster-taxonomy-fabric/v1/status', (_req, res) => {
  res.json(status());
});

router.post('/api/sheikha/exponential-cluster-taxonomy-fabric/v1/analyze', (req, res) => {
  res.json(analyze(req.body || {}));
});

module.exports = router;
JS

cat > tools/exponential-cluster-taxonomy-fabric/sheikha-exponential-cluster-taxonomy-fabric-cli.js <<'JS'
#!/usr/bin/env node
'use strict';

const {
  status,
  analyze
} = require('../../runtime/exponential-cluster-taxonomy-fabric/v1/sheikha-exponential-cluster-taxonomy-fabric-v1');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') {
  console.log(JSON.stringify(status(), null, 2));
} else if (cmd === 'demo') {
  console.log(JSON.stringify(analyze({
    growthFactor: 1.618,
    maxDepth: 6,
    roots: [
      {
        name: 'Sheikha Root',
        scope: 'ROOT',
        type: 'structured',
        weight: 10,
        children: [
          {
            name: 'AI Cluster',
            scope: 'CLUSTER',
            type: 'semi_structured',
            weight: 8,
            children: [
              { name: 'Live Pipeline', scope: 'PIPELINE', type: 'structured', weight: 5 },
              { name: 'Model Pipeline', scope: 'PIPELINE', type: 'semi_structured', weight: 5 }
            ]
          },
          {
            name: 'Factory Network',
            scope: 'FACTORY',
            type: 'unstructured',
            weight: 7,
            children: [
              { name: 'Factory A', scope: 'FACTORY', type: 'structured', weight: 4 },
              { name: 'Factory B', scope: 'FACTORY', type: 'semi_structured', weight: 4 }
            ]
          }
        ]
      }
    ]
  }), null, 2));
} else {
  console.error('Usage: status | demo');
  process.exit(1);
}
JS

chmod +x tools/exponential-cluster-taxonomy-fabric/sheikha-exponential-cluster-taxonomy-fabric-cli.js

cat > docs/exponential-cluster-taxonomy-fabric/SHEIKHA-EXPONENTIAL-CLUSTER-TAXONOMY-FABRIC-V1.md <<'MD'
# SHEIKHA_EXPONENTIAL_CLUSTER_TAXONOMY_FABRIC_V1

محرك جذور وتكاثر أسي للكلاستر والبايبلاين والفروع والمصانع والتصنيفات.

## التصنيفات

- Structured
- Semi-Structured
- Unstructured

## النطاقات

- Root
- Cluster
- Pipeline
- Branch
- Factory
- Category
- Tab

## الضوابط

- قياس حسابي فقط.
- لا تنبؤ بالغيب.
- لا توصية مالية.
- لا ربا.
- لا ضرر ولا ضرار.
MD

python3 - <<'PY'
from pathlib import Path

p = Path("server.js")
s = p.read_text()

mount = """
try {
  app.use(require('./routes/exponential-cluster-taxonomy-fabric/sheikha-exponential-cluster-taxonomy-fabric-routes'));
} catch (error) {
  console.warn('[sheikha-exponential-cluster-taxonomy-fabric] route mount skipped:', error.message);
}
"""

if "sheikha-exponential-cluster-taxonomy-fabric" not in s:
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
node --check runtime/exponential-cluster-taxonomy-fabric/v1/sheikha-exponential-cluster-taxonomy-fabric-v1.js
node --check routes/exponential-cluster-taxonomy-fabric/sheikha-exponential-cluster-taxonomy-fabric-routes.js
node --check tools/exponential-cluster-taxonomy-fabric/sheikha-exponential-cluster-taxonomy-fabric-cli.js

echo "== CLI demo =="
node tools/exponential-cluster-taxonomy-fabric/sheikha-exponential-cluster-taxonomy-fabric-cli.js demo \
  | jq '.system,.status,.totalNodes,.byType,.byScope,.totalExponentialScore,.totalIntegrationScore'

echo "== Restart =="
pm2 restart sheikha-main-portal --update-env
sleep 2

echo "== API test =="
curl -s -X POST http://127.0.0.1:8080/api/sheikha/exponential-cluster-taxonomy-fabric/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "growthFactor": 1.618,
    "maxDepth": 6,
    "roots": [
      {
        "name": "Sheikha Root",
        "scope": "ROOT",
        "type": "structured",
        "weight": 10,
        "children": [
          {
            "name": "AI Cluster",
            "scope": "CLUSTER",
            "type": "semi_structured",
            "weight": 8,
            "children": [
              {"name":"Live Pipeline","scope":"PIPELINE","type":"structured","weight":5},
              {"name":"Model Pipeline","scope":"PIPELINE","type":"semi_structured","weight":5}
            ]
          },
          {
            "name": "Factory Network",
            "scope": "FACTORY",
            "type": "unstructured",
            "weight": 7,
            "children": [
              {"name":"Factory A","scope":"FACTORY","type":"structured","weight":4},
              {"name":"Factory B","scope":"FACTORY","type":"semi_structured","weight":4}
            ]
          }
        ]
      }
    ]
  }' | jq '.system,.status,.totalNodes,.byType,.byScope,.tabs[0:10]'

echo "== Commit =="
git add \
  server.js \
  activate-sheikha-exponential-cluster-taxonomy-fabric-v1.sh \
  runtime/exponential-cluster-taxonomy-fabric \
  routes/exponential-cluster-taxonomy-fabric \
  tools/exponential-cluster-taxonomy-fabric \
  docs/exponential-cluster-taxonomy-fabric

git commit -m "Activate Sheikha exponential cluster taxonomy fabric"
git push origin feature/extension-experience-apex-v1

echo "== Done =="
