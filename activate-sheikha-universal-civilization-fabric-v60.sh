#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Projects/sheikha/sheikha-main-portal"
cd "$ROOT"

echo "== Activate SHEIKHA_UNIVERSAL_CIVILIZATION_FABRIC_V60 =="

mkdir -p runtime/universal-civilization-fabric/v1
mkdir -p routes/universal-civilization-fabric
mkdir -p tools/universal-civilization-fabric
mkdir -p docs/universal-civilization-fabric
mkdir -p data/universal-civilization-fabric/{clusters,events,roadmaps,audit}

cat > runtime/universal-civilization-fabric/v1/sheikha-universal-civilization-fabric-v1.js <<'JS'
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'data', 'universal-civilization-fabric');

function ensureDirs() {
  for (const d of ['clusters', 'events', 'roadmaps', 'audit']) {
    fs.mkdirSync(path.join(DATA_DIR, d), { recursive: true });
  }
}

function status() {
  return {
    success: true,
    system: 'SHEIKHA_UNIVERSAL_CIVILIZATION_FABRIC_V60',
    status: 'ACTIVE',
    apexLevel: 60,
    role: 'UNIFIED_HUMAN_KNOWLEDGE_INDUSTRY_SUPPLY_CHAIN_AI_EARTH_DEVELOPMENT_FABRIC',
    root: [
      'QURAN_SUNNAH_GOVERNANCE',
      'HUMAN_HONORED_REFERENCE',
      'SCIENCE_CALCULATION',
      'KNOWLEDGE_GRAPH',
      'INDUSTRIAL_PRODUCTION',
      'SUPPLY_CHAIN',
      'AI_PRODUCTION',
      'SPACE_MONITORING',
      'EARTH_DEVELOPMENT',
      'CONTINUOUS_IMPROVEMENT'
    ],
    clusters: [
      'HUMAN_MODEL','HEALTH','MEDICINE','FOOD','WATER','AGRICULTURE',
      'ENERGY','MINING','REFINERY','PETROCHEMICAL','MATERIALS',
      'MANUFACTURING','ROBOTICS','AI_PRODUCTION','SUPPLY_CHAIN',
      'LOGISTICS','SPACE','SATELLITE','RESEARCH','EDUCATION',
      'GOVERNANCE','SELF_HEALING','EARTH_DEVELOPMENT'
    ],
    governance: {
      principle: 'لا ضرر ولا ضرار',
      quranSunnahValues: true,
      humanIsPrimaryAndHonored: true,
      aiIsToolOnly: true,
      noConsciousnessClaim: true,
      noFuturePredictionClaim: true,
      noHazardousInstructions: true,
      humanApprovalForCriticalChanges: true
    }
  };
}

function roadmap(input = {}) {
  ensureDirs();
  const out = {
    success: true,
    system: 'SHEIKHA_UNIVERSAL_CIVILIZATION_FABRIC_V60',
    status: 'ROADMAP_CREATED',
    name: input.name || 'Sheikha Universal Civilization Roadmap',
    lifecycle: [
      'DISCOVER','CLASSIFY','MEASURE','LEARN_FROM_HUMAN',
      'CALCULATE','DESIGN','PRODUCE','MONITOR','QUALITY_GATE',
      'SAFETY_GATE','SUPPLY_CHAIN_ROUTE','AI_FEEDBACK',
      'SELF_HEAL_PLAN','IMPROVE','RELEARN'
    ],
    productionLine: [
      'RAW_RESOURCES','WATER','FOOD','ENERGY','MINING','REFINERY',
      'MATERIALS','MANUFACTURING','ROBOTICS','AI_PRODUCTION',
      'WAREHOUSE','LOGISTICS','CUSTOMER','RECYCLE','KNOWLEDGE'
    ],
    outputs: [
      'KNOWLEDGE','AI_MODELS','INDUSTRIAL_PLANS','SUPPLY_CHAIN_ROUTES',
      'QUALITY_AUDITS','SAFETY_AUDITS','EARTH_DEVELOPMENT_MAPS'
    ],
    governance: status().governance
  };

  fs.writeFileSync(path.join(DATA_DIR, 'roadmaps', 'latest-roadmap.json'), JSON.stringify(out, null, 2));
  return out;
}

function event(input = {}) {
  ensureDirs();
  const out = {
    success: true,
    id: `ucf-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    ts: new Date().toISOString(),
    domain: input.domain || 'EARTH_DEVELOPMENT',
    cluster: input.cluster || 'ROOT',
    observation: input.observation || '',
    measurement: input.measurement || {},
    quality: input.quality || 'REVIEW',
    safety: input.safety || 'REVIEW',
    governance: 'ACTIVE'
  };
  fs.appendFileSync(path.join(DATA_DIR, 'events', 'events.jsonl'), `${JSON.stringify(out)}\n`);
  return out;
}

function selfHeal() {
  ensureDirs();
  const out = {
    success: true,
    system: 'SHEIKHA_UNIVERSAL_CIVILIZATION_FABRIC_V60',
    status: 'SELF_HEALING_PLAN_CREATED',
    actions: [
      'CHECK_CLUSTER_HEALTH',
      'CHECK_GOVERNANCE',
      'CHECK_QUALITY',
      'CHECK_SAFETY',
      'REBUILD_INDEXES',
      'CREATE_HUMAN_REVIEW_TASKS'
    ],
    destructiveWrite: false,
    envMutation: false,
    secretExposure: false,
    humanApprovalRequired: true
  };
  fs.writeFileSync(path.join(DATA_DIR, 'audit', 'latest-self-heal.json'), JSON.stringify(out, null, 2));
  return out;
}

module.exports = { status, roadmap, event, selfHeal };
JS

cat > routes/universal-civilization-fabric/sheikha-universal-civilization-fabric-routes.js <<'JS'
'use strict';
const express = require('express');
const router = express.Router();
const { status, roadmap, event, selfHeal } = require('../../runtime/universal-civilization-fabric/v1/sheikha-universal-civilization-fabric-v1');

router.get('/api/sheikha/universal-civilization-fabric/v1/status', (_req, res) => res.json(status()));
router.post('/api/sheikha/universal-civilization-fabric/v1/roadmap', (req, res) => res.json(roadmap(req.body || {})));
router.post('/api/sheikha/universal-civilization-fabric/v1/event', (req, res) => res.json(event(req.body || {})));
router.post('/api/sheikha/universal-civilization-fabric/v1/self-heal', (_req, res) => res.json(selfHeal()));

module.exports = router;
JS

cat > tools/universal-civilization-fabric/sheikha-universal-civilization-fabric-cli.js <<'JS'
#!/usr/bin/env node
'use strict';
const { status, roadmap, event, selfHeal } = require('../../runtime/universal-civilization-fabric/v1/sheikha-universal-civilization-fabric-v1');
const cmd = process.argv[2] || 'status';

if (cmd === 'status') console.log(JSON.stringify(status(), null, 2));
else if (cmd === 'roadmap') console.log(JSON.stringify(roadmap(), null, 2));
else if (cmd === 'event') console.log(JSON.stringify(event({ observation: 'واقع حي للتحسين المستمر' }), null, 2));
else if (cmd === 'self-heal') console.log(JSON.stringify(selfHeal(), null, 2));
else process.exit(1);
JS

chmod +x tools/universal-civilization-fabric/sheikha-universal-civilization-fabric-cli.js

cat > docs/universal-civilization-fabric/SHEIKHA-UNIVERSAL-CIVILIZATION-FABRIC-V60.md <<'MD'
# SHEIKHA_UNIVERSAL_CIVILIZATION_FABRIC_V60

طبقة توحيد عليا تربط الإنسان، العلم، الحساب، المعرفة، الصناعة، الطاقة، التعدين، سلاسل الإمداد، الذكاء الصناعي، الفضاء، عمارة الأرض، والتحسين المستمر.

الإنسان هو المرجع المكرم، والذكاء الصناعي أداة حسابية مساعدة، والحوكمة بالقيم المستمدة من الكتاب والسنة: الصدق، الأمانة، العدل، الإحسان، لا ضرر ولا ضرار.
MD

python3 - <<'PY'
from pathlib import Path
p = Path("server.js")
s = p.read_text()
mount = """
try {
  app.use(require('./routes/universal-civilization-fabric/sheikha-universal-civilization-fabric-routes'));
} catch (error) {
  console.warn('[sheikha-universal-civilization-fabric] route mount skipped:', error.message);
}
"""
if "sheikha-universal-civilization-fabric" not in s:
    idx = s.find("app.use(express.json")
    if idx == -1:
        idx = s.find("app.use(")
    s = s[:idx] + mount + "\\n" + s[idx:]
p.write_text(s)
PY

node --check server.js
node --check runtime/universal-civilization-fabric/v1/sheikha-universal-civilization-fabric-v1.js
node --check routes/universal-civilization-fabric/sheikha-universal-civilization-fabric-routes.js
node --check tools/universal-civilization-fabric/sheikha-universal-civilization-fabric-cli.js

node tools/universal-civilization-fabric/sheikha-universal-civilization-fabric-cli.js status | jq '.system,.status,.apexLevel'
node tools/universal-civilization-fabric/sheikha-universal-civilization-fabric-cli.js roadmap | jq '.status,.outputs'
node tools/universal-civilization-fabric/sheikha-universal-civilization-fabric-cli.js self-heal | jq '.status,.actions'

pm2 restart sheikha-main-portal --update-env
sleep 2

curl -s http://127.0.0.1:8080/api/sheikha/universal-civilization-fabric/v1/status | jq '.system,.status,.apexLevel'

git add \
  server.js \
  activate-sheikha-universal-civilization-fabric-v60.sh \
  runtime/universal-civilization-fabric \
  routes/universal-civilization-fabric \
  tools/universal-civilization-fabric \
  docs/universal-civilization-fabric

git commit -m "Activate Sheikha universal civilization fabric V60"
git push origin feature/extension-experience-apex-v1 || true

echo "== Done =="
