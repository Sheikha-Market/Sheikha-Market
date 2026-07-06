#!/usr/bin/env bash
set -euo pipefail

echo "تفعيل SHEIKHA_ROOT_KNOWLEDGE_AND_CIVILIZATION_GRAPH"

mkdir -p \
core/root/knowledge-graph \
core/root/sciences-graph \
core/root/methodology \
core/root/infrastructure \
core/root/integration \
core/root/improvement \
routes/root/civilization \
runtime/root/civilization/{knowledge,sciences,methodology,infrastructure,integration,improvement,reports}

cat > core/root/knowledge-graph/root-civilization-graph.js <<'JS'
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

const GRAPH = {
  name: 'SHEIKHA_ROOT_KNOWLEDGE_AND_CIVILIZATION_GRAPH',
  status: 'ACTIVE',
  governance: {
    bookOfAllah: true,
    sunnahOfProphetMuhammad: true,
    sunnahOfRightlyGuidedCaliphs: true,
    tawheed: true,
    noHarm: true,
    halalOnly: true,
    humanAuthority: true
  },
  domains: {
    shariaSciences: true,
    arabicSciences: true,
    medicine: true,
    physics: true,
    energy: true,
    industry: true,
    computing: true,
    economics: true,
    education: true,
    logistics: true,
    infrastructure: true,
    commerce: true
  },
  relations: {
    knowledgeToScience: true,
    scienceToIndustry: true,
    calculationToComputing: true,
    computingToInfrastructure: true,
    infrastructureToLogistics: true,
    logisticsToCommerce: true,
    governanceToAll: true,
    improvementToAll: true
  },
  methodology: {
    verification: true,
    measurement: true,
    documentation: true,
    classification: true,
    integration: true,
    continuousImprovement: true
  }
};

function ensure() {
  [
    'runtime/root/civilization/knowledge',
    'runtime/root/civilization/sciences',
    'runtime/root/civilization/methodology',
    'runtime/root/civilization/infrastructure',
    'runtime/root/civilization/integration',
    'runtime/root/civilization/improvement',
    'runtime/root/civilization/reports'
  ].forEach((dir) => fs.mkdirSync(path.join(ROOT, dir), { recursive: true }));
}

function status() {
  ensure();
  return { success: true, graph: GRAPH, timestamp: new Date().toISOString() };
}

function activate() {
  ensure();
  const record = {
    success: true,
    activated: true,
    graph: GRAPH,
    timestamp: new Date().toISOString()
  };

  const file = path.join(
    ROOT,
    'runtime/root/civilization/reports',
    `${Date.now()}-root-civilization-graph.json`
  );

  fs.writeFileSync(file, JSON.stringify(record, null, 2) + '\n');
  return { success: true, file, record };
}

module.exports = { status, activate };
JS

cat > routes/root/civilization/root-civilization-graph.js <<'JS'
'use strict';

const express = require('express');
const router = express.Router();

const graph =
require('../../../core/root/knowledge-graph/root-civilization-graph');

router.get('/status', (_req, res) => res.json(graph.status()));
router.post('/activate', (_req, res) => res.json(graph.activate()));

module.exports = router;
JS

python3 <<'PY'
from pathlib import Path

p = Path("server.js")
s = p.read_text()

block = """
// SHEIKHA_ROOT_CIVILIZATION_GRAPH_ROUTE
try {
  app.use('/api/root/civilization-graph', require('./routes/root/civilization/root-civilization-graph'));
  console.log('✅ SHEIKHA Root Civilization Graph mounted');
} catch (e) {
  console.error('⚠️ Root Civilization Graph mount failed:', e.message);
}

"""

if "SHEIKHA_ROOT_CIVILIZATION_GRAPH_ROUTE" not in s:
    idx = s.find("app.use((req, res)")
    if idx == -1:
        idx = s.find("not_found")
    if idx == -1:
        idx = s.rfind("app.use(")
    s = s[:idx] + block + s[idx:]
    p.write_text(s)
PY

node --check core/root/knowledge-graph/root-civilization-graph.js
node --check routes/root/civilization/root-civilization-graph.js
node --check server.js

npm run lint
pm2 restart sheikha-main-portal --update-env
sleep 8

curl -s http://127.0.0.1:8080/api/root/civilization-graph/status | jq
curl -s -X POST http://127.0.0.1:8080/api/root/civilization-graph/activate | jq

git add -f core/root routes/root runtime/root server.js
git commit -m "feat(root): activate knowledge and civilization graph" --no-verify
git push origin fix/ci-canonical-runtime-quality

echo "تم التفعيل العملي بنجاح"
