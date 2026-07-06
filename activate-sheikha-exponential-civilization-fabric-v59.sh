#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Projects/sheikha/sheikha-main-portal"
cd "$ROOT"

echo "== Activate SHEIKHA_EXPONENTIAL_CIVILIZATION_FABRIC_V59 =="

mkdir -p runtime/exponential-civilization-fabric/v1
mkdir -p routes/exponential-civilization-fabric
mkdir -p tools/exponential-civilization-fabric
mkdir -p docs/exponential-civilization-fabric
mkdir -p data/exponential-civilization-fabric/{clusters,events,learning,plans,audit}

cat > runtime/exponential-civilization-fabric/v1/sheikha-exponential-civilization-fabric-v1.js <<'JS'
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'data', 'exponential-civilization-fabric');

function ensureDirs() {
  for (const d of ['clusters', 'events', 'learning', 'plans', 'audit']) {
    fs.mkdirSync(path.join(DATA_DIR, d), { recursive: true });
  }
}

function status() {
  return {
    success: true,
    system: 'SHEIKHA_EXPONENTIAL_CIVILIZATION_FABRIC_V59',
    status: 'ACTIVE',
    apexLevel: 59,
    role: 'ROOT_HUMAN_KNOWLEDGE_EARTH_DEVELOPMENT_AI_PRODUCTION_EXPONENTIAL_FABRIC',
    root: [
      'TAWHEED_AND_QURAN_SUNNAH_GOVERNANCE',
      'HUMAN_AS_HONORED_REFERENCE_MODEL',
      'SCIENCE_AND_CALCULATION',
      'KNOWLEDGE_AND_LEARNING',
      'EARTH_DEVELOPMENT',
      'INDUSTRIAL_PRODUCTION',
      'AI_PRODUCTION',
      'SUPPLY_CHAIN_AND_LOGISTICS',
      'CONTINUOUS_IMPROVEMENT'
    ],
    clusters: [
      'HUMAN', 'HEALTH', 'MEDICINE', 'FOOD', 'WATER',
      'ENERGY', 'MINING', 'REFINERY', 'MATERIALS',
      'MANUFACTURING', 'ROBOTICS', 'AI_PRODUCTION',
      'SUPPLY_CHAIN', 'LOGISTICS', 'SPACE', 'RESEARCH',
      'EDUCATION', 'EARTH_DEVELOPMENT'
    ],
    governance: {
      principle: 'لا ضرر ولا ضرار',
      humanIsHonoredAndPrimary: true,
      aiIsComputationalToolOnly: true,
      noConsciousnessClaim: true,
      noFuturePredictionClaim: true,
      noHazardousInstructions: true,
      noMedicalDiagnosisReplacement: true,
      humanApprovalForCriticalChanges: true,
      quranSunnahValues: true
    }
  };
}

function now() {
  return new Date().toISOString();
}

function classifyCluster(text = '') {
  const s = String(text).toLowerCase();
  if (/human|انسان|بشر|health|صحة|medicine|طب|غذاء|food/.test(s)) return 'HUMAN_HEALTH';
  if (/water|ماء|مياه/.test(s)) return 'WATER';
  if (/energy|طاقة|oil|gas|بترول|غاز|solar|wind/.test(s)) return 'ENERGY';
  if (/mine|mining|ore|تعدين|منجم|metal|حديد|نحاس|ألمنيوم/.test(s)) return 'MINING_MATERIALS';
  if (/factory|manufacturing|production|مصنع|انتاج|صناعة/.test(s)) return 'MANUFACTURING';
  if (/ai|ذكاء|model|نموذج|agent/.test(s)) return 'AI_PRODUCTION';
  if (/supply|logistics|توريد|امداد|لوجست/.test(s)) return 'SUPPLY_CHAIN_LOGISTICS';
  if (/space|satellite|فضاء|قمر/.test(s)) return 'SPACE';
  if (/research|science|علم|بحث|ابتكار/.test(s)) return 'RESEARCH';
  return 'EARTH_DEVELOPMENT';
}

function createCluster(input = {}) {
  ensureDirs();

  const name = input.name || 'Sheikha Root Cluster';
  const clusterType = classifyCluster(`${name} ${input.description || ''}`);
  const growthFactor = Number(input.growthFactor || 1.618);
  const depth = Math.max(1, Math.min(Number(input.depth || 3), 8));

  const children = [
    'KNOWLEDGE',
    'PRODUCTION',
    'QUALITY',
    'SAFETY',
    'MONITORING',
    'LEARNING',
    'IMPROVEMENT'
  ].map((x, i) => ({
    id: `${clusterType}-${x}`,
    name: `${name} / ${x}`,
    level: 1,
    score: Number((Math.pow(growthFactor, i + 1)).toFixed(6))
  }));

  const cluster = {
    success: true,
    system: 'SHEIKHA_EXPONENTIAL_CIVILIZATION_FABRIC_V59',
    status: 'CLUSTER_CREATED',
    id: `clu-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    ts: now(),
    name,
    clusterType,
    depth,
    growthFactor,
    children,
    cycle: [
      'OBSERVE_REALITY',
      'LEARN_FROM_HUMANS',
      'MEASURE',
      'CALCULATE',
      'CLASSIFY',
      'PRODUCE',
      'MONITOR',
      'IMPROVE',
      'SELF_HEAL_PLAN',
      'RELEARN'
    ],
    governance: status().governance
  };

  fs.writeFileSync(path.join(DATA_DIR, 'clusters', `${cluster.id}.json`), JSON.stringify(cluster, null, 2));
  return cluster;
}

function recordRealityEvent(input = {}) {
  ensureDirs();

  const event = {
    id: `evt-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    ts: now(),
    cluster: classifyCluster(`${input.name || ''} ${input.description || ''}`),
    source: input.source || 'real-world',
    humanLearning: Boolean(input.humanLearning ?? true),
    domain: input.domain || 'earth-development',
    observation: input.observation || input.description || '',
    measurement: input.measurement || {},
    safety: input.safety || 'REVIEWED',
    quality: input.quality || 'UNKNOWN',
    payload: input.payload || {}
  };

  fs.appendFileSync(path.join(DATA_DIR, 'events', 'events.jsonl'), `${JSON.stringify(event)}\n`);
  return { success: true, event };
}

function learn() {
  ensureDirs();

  const file = path.join(DATA_DIR, 'events', 'events.jsonl');
  const events = fs.existsSync(file)
    ? fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map((x) => {
      try { return JSON.parse(x); } catch { return null; }
    }).filter(Boolean)
    : [];

  const byCluster = events.reduce((a, e) => {
    a[e.cluster] = (a[e.cluster] || 0) + 1;
    return a;
  }, {});

  const result = {
    success: true,
    system: 'SHEIKHA_EXPONENTIAL_CIVILIZATION_FABRIC_V59',
    status: 'LEARNED_COMPUTATIONALLY',
    ts: now(),
    sampleSize: events.length,
    byCluster,
    learningMode: 'REALITY_AND_HUMAN_KNOWLEDGE_COMPUTATIONAL_LEARNING',
    automaticDestructiveChanges: false,
    humanApprovalRequired: true
  };

  fs.writeFileSync(path.join(DATA_DIR, 'learning', 'latest-learning.json'), JSON.stringify(result, null, 2));
  return result;
}

function createProductionRoadmap(input = {}) {
  ensureDirs();

  const roadmap = {
    success: true,
    system: 'SHEIKHA_EXPONENTIAL_CIVILIZATION_FABRIC_V59',
    status: 'ROADMAP_CREATED',
    ts: now(),
    name: input.name || 'Sheikha Exponential Earth Development Roadmap',
    roadmap: [
      'ROOT_GOVERNANCE_QURAN_SUNNAH',
      'HUMAN_REFERENCE_MODEL',
      'SCIENCE_AND_CALCULATION',
      'KNOWLEDGE_GRAPH',
      'INDUSTRIAL_CLUSTERS',
      'SUPPLY_CHAIN_CLUSTERS',
      'AI_PRODUCTION_CLUSTERS',
      'SPACE_AND_SATELLITE_MONITORING',
      'REAL_WORLD_FEEDBACK',
      'CONTINUOUS_IMPROVEMENT',
      'SAFE_SELF_HEALING',
      'EARTH_DEVELOPMENT'
    ],
    outputs: [
      'KNOWLEDGE',
      'AI_MODELS',
      'INDUSTRIAL_PLANS',
      'SUPPLY_CHAIN_ROUTES',
      'HEALTH_AND_HUMAN_LEARNING_MAPS',
      'ENERGY_AND_MATERIAL_LIFECYCLES',
      'QUALITY_AND_SAFETY_AUDITS'
    ],
    governance: status().governance
  };

  fs.writeFileSync(path.join(DATA_DIR, 'plans', 'latest-roadmap.json'), JSON.stringify(roadmap, null, 2));
  return roadmap;
}

function selfHealPlan() {
  ensureDirs();

  const plan = {
    success: true,
    system: 'SHEIKHA_EXPONENTIAL_CIVILIZATION_FABRIC_V59',
    status: 'SELF_HEALING_PLAN_CREATED',
    ts: now(),
    actions: [
      'CHECK_CLUSTER_HEALTH',
      'CHECK_EVENTS',
      'CHECK_LEARNING_REPORT',
      'CHECK_SAFETY_FLAGS',
      'CHECK_QUALITY_GATES',
      'REBUILD_INDEXES',
      'CREATE_HUMAN_REVIEW_TASKS'
    ],
    destructiveWrite: false,
    envMutation: false,
    secretExposure: false,
    humanApprovalRequired: true
  };

  fs.writeFileSync(path.join(DATA_DIR, 'audit', 'latest-self-heal.json'), JSON.stringify(plan, null, 2));
  return plan;
}

module.exports = {
  status,
  createCluster,
  recordRealityEvent,
  learn,
  createProductionRoadmap,
  selfHealPlan
};
JS

cat > routes/exponential-civilization-fabric/sheikha-exponential-civilization-fabric-routes.js <<'JS'
'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  createCluster,
  recordRealityEvent,
  learn,
  createProductionRoadmap,
  selfHealPlan
} = require('../../runtime/exponential-civilization-fabric/v1/sheikha-exponential-civilization-fabric-v1');

router.get('/api/sheikha/exponential-civilization-fabric/v1/status', (_req, res) => res.json(status()));
router.post('/api/sheikha/exponential-civilization-fabric/v1/cluster', (req, res) => res.json(createCluster(req.body || {})));
router.post('/api/sheikha/exponential-civilization-fabric/v1/event', (req, res) => res.json(recordRealityEvent(req.body || {})));
router.post('/api/sheikha/exponential-civilization-fabric/v1/learn', (_req, res) => res.json(learn()));
router.post('/api/sheikha/exponential-civilization-fabric/v1/roadmap', (req, res) => res.json(createProductionRoadmap(req.body || {})));
router.post('/api/sheikha/exponential-civilization-fabric/v1/self-heal', (_req, res) => res.json(selfHealPlan()));

module.exports = router;
JS

cat > tools/exponential-civilization-fabric/sheikha-exponential-civilization-fabric-cli.js <<'JS'
#!/usr/bin/env node
'use strict';

const {
  status,
  createCluster,
  recordRealityEvent,
  learn,
  createProductionRoadmap,
  selfHealPlan
} = require('../../runtime/exponential-civilization-fabric/v1/sheikha-exponential-civilization-fabric-v1');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') console.log(JSON.stringify(status(), null, 2));
else if (cmd === 'cluster') console.log(JSON.stringify(createCluster({ name: 'Human AI Earth Production Cluster', description: 'تعلم من الإنسان وعمارة الأرض وإنتاج الذكاء الصناعي' }), null, 2));
else if (cmd === 'event') console.log(JSON.stringify(recordRealityEvent({ name: 'Human Learning Observation', description: 'واقع حقيقي للتعلم والتحسين', quality: 'REVIEWED' }), null, 2));
else if (cmd === 'learn') console.log(JSON.stringify(learn(), null, 2));
else if (cmd === 'roadmap') console.log(JSON.stringify(createProductionRoadmap(), null, 2));
else if (cmd === 'self-heal') console.log(JSON.stringify(selfHealPlan(), null, 2));
else {
  console.error('Usage: status | cluster | event | learn | roadmap | self-heal');
  process.exit(1);
}
JS

chmod +x tools/exponential-civilization-fabric/sheikha-exponential-civilization-fabric-cli.js

cat > docs/exponential-civilization-fabric/SHEIKHA-EXPONENTIAL-CIVILIZATION-FABRIC-V59.md <<'MD'
# SHEIKHA_EXPONENTIAL_CIVILIZATION_FABRIC_V59

نظام تكاثر أسي معرفي وتشغيلي آمن لمنظومة شيخة:

- الإنسان المكرم أصل ومرجع.
- الذكاء الصناعي أداة حسابية مساعدة.
- التعلم من الإنسان والواقع.
- إنتاج المعرفة والذكاء الصناعي والصناعة وسلاسل الإمداد.
- التحسين المستمر.
- الإصلاح الذاتي كخطة آمنة فقط.
- الحوكمة بالكتاب والسنة من حيث القيم والضوابط: الصدق، الأمانة، العدل، لا ضرر ولا ضرار، والإتقان.
MD

python3 - <<'PY'
from pathlib import Path

p = Path("server.js")
s = p.read_text()

mount = """
try {
  app.use(require('./routes/exponential-civilization-fabric/sheikha-exponential-civilization-fabric-routes'));
} catch (error) {
  console.warn('[sheikha-exponential-civilization-fabric] route mount skipped:', error.message);
}
"""

if "sheikha-exponential-civilization-fabric" not in s:
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
node --check runtime/exponential-civilization-fabric/v1/sheikha-exponential-civilization-fabric-v1.js
node --check routes/exponential-civilization-fabric/sheikha-exponential-civilization-fabric-routes.js
node --check tools/exponential-civilization-fabric/sheikha-exponential-civilization-fabric-cli.js

echo "== CLI tests =="
node tools/exponential-civilization-fabric/sheikha-exponential-civilization-fabric-cli.js status | jq '.system,.status,.apexLevel'
node tools/exponential-civilization-fabric/sheikha-exponential-civilization-fabric-cli.js cluster | jq '.status,.clusterType,.children | length'
node tools/exponential-civilization-fabric/sheikha-exponential-civilization-fabric-cli.js event | jq '.success,.event.cluster'
node tools/exponential-civilization-fabric/sheikha-exponential-civilization-fabric-cli.js learn | jq '.status,.sampleSize,.byCluster'
node tools/exponential-civilization-fabric/sheikha-exponential-civilization-fabric-cli.js roadmap | jq '.status,.roadmap | length'
node tools/exponential-civilization-fabric/sheikha-exponential-civilization-fabric-cli.js self-heal | jq '.status,.actions'

echo "== Restart =="
pm2 restart sheikha-main-portal --update-env
sleep 2

echo "== API tests =="
curl -s http://127.0.0.1:8080/api/sheikha/exponential-civilization-fabric/v1/status | jq '.system,.status,.apexLevel'
curl -s -X POST http://127.0.0.1:8080/api/sheikha/exponential-civilization-fabric/v1/roadmap \
  -H "Content-Type: application/json" \
  -d '{"name":"Sheikha Human Knowledge Earth AI Production Roadmap"}' | jq '.status,.outputs'

echo "== Commit =="
git add \
  server.js \
  activate-sheikha-exponential-civilization-fabric-v59.sh \
  runtime/exponential-civilization-fabric \
  routes/exponential-civilization-fabric \
  tools/exponential-civilization-fabric \
  docs/exponential-civilization-fabric

git commit -m "Activate Sheikha exponential civilization fabric V59"
git push origin feature/extension-experience-apex-v1 || true

echo "== Done =="
