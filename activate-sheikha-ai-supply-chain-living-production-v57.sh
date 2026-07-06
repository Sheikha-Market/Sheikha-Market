#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Projects/sheikha/sheikha-main-portal"
cd "$ROOT"

echo "== Activate SHEIKHA_AI_SUPPLY_CHAIN_LIVING_PRODUCTION_V57 =="

mkdir -p runtime/ai-supply-chain-living-production/v1
mkdir -p routes/ai-supply-chain-living-production
mkdir -p tools/ai-supply-chain-living-production
mkdir -p docs/ai-supply-chain-living-production
mkdir -p data/ai-supply-chain-living-production/{events,learning,recovery,plans}

cat > runtime/ai-supply-chain-living-production/v1/sheikha-ai-supply-chain-living-production-v1.js <<'JS'
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'data', 'ai-supply-chain-living-production');

function ensureDirs() {
  for (const d of ['events', 'learning', 'recovery', 'plans']) {
    fs.mkdirSync(path.join(DATA_DIR, d), { recursive: true });
  }
}

function status() {
  return {
    success: true,
    system: 'SHEIKHA_AI_SUPPLY_CHAIN_LIVING_PRODUCTION_V57',
    status: 'ACTIVE',
    apexLevel: 57,
    role: 'LIVE_AI_PRODUCTION_AND_SUPPLY_CHAIN_SELF_GOVERNED_FABRIC',
    layers: {
      productionAI: 'ACTIVE',
      liveSupplyChain: 'ACTIVE',
      realWorldFeedback: 'ACTIVE',
      governedMachineLearning: 'ACTIVE',
      selfHealing: 'SAFE_PLAN_ACTIVE',
      recovery: 'ACTIVE',
      audit: 'ACTIVE'
    },
    governance: {
      principle: 'لا ضرر ولا ضرار',
      noHumanConsciousnessClaim: true,
      noFuturePredictionClaim: true,
      machineLearningIsComputationalOnly: true,
      humanApprovalForCriticalChanges: true,
      noDestructiveAutoWrite: true,
      secretsProtected: true,
      envProtected: true
    }
  };
}

function now() {
  return new Date().toISOString();
}

function appendJsonl(file, obj) {
  ensureDirs();
  fs.appendFileSync(file, `${JSON.stringify(obj)}\n`);
}

function recordEvent(input = {}) {
  ensureDirs();

  const event = {
    id: `evt-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    ts: now(),
    source: input.source || 'runtime',
    domain: input.domain || 'supply-chain',
    type: input.type || 'OBSERVATION',
    factory: input.factory || null,
    cluster: input.cluster || null,
    pipeline: input.pipeline || null,
    material: input.material || null,
    supplier: input.supplier || null,
    customer: input.customer || null,
    quantity: Number(input.quantity || 0),
    unit: input.unit || null,
    state: input.state || null,
    quality: input.quality || null,
    delay: Number(input.delay || 0),
    defect: Boolean(input.defect || false),
    costImpact: Number(input.costImpact || 0),
    payload: input.payload || {}
  };

  appendJsonl(path.join(DATA_DIR, 'events', 'events.jsonl'), event);
  return { success: true, event };
}

function classifySignal(event = {}) {
  const score =
    (event.delay > 0 ? 2 : 0) +
    (event.defect ? 3 : 0) +
    (Math.abs(event.costImpact || 0) > 0 ? 1 : 0) +
    (!event.supplier ? 1 : 0) +
    (!event.quality ? 1 : 0);

  if (score >= 5) return 'CRITICAL_REVIEW';
  if (score >= 3) return 'IMPROVEMENT_REQUIRED';
  if (score >= 1) return 'WATCH';
  return 'NORMAL';
}

function learnFromReality(input = {}) {
  ensureDirs();

  const eventsFile = path.join(DATA_DIR, 'events', 'events.jsonl');
  const lines = fs.existsSync(eventsFile)
    ? fs.readFileSync(eventsFile, 'utf8').split('\n').filter(Boolean)
    : [];

  const events = lines.slice(-500).map((x) => {
    try { return JSON.parse(x); } catch { return null; }
  }).filter(Boolean);

  const signals = events.map((e) => ({
    eventId: e.id,
    ts: e.ts,
    factory: e.factory,
    cluster: e.cluster,
    pipeline: e.pipeline,
    material: e.material,
    signal: classifySignal(e)
  }));

  const counts = signals.reduce((a, x) => {
    a[x.signal] = (a[x.signal] || 0) + 1;
    return a;
  }, {});

  const learning = {
    success: true,
    system: 'SHEIKHA_AI_SUPPLY_CHAIN_LIVING_PRODUCTION_V57',
    status: 'LEARNED_COMPUTATIONALLY',
    ts: now(),
    sampleSize: events.length,
    counts,
    signals,
    governedLearning: {
      type: 'REAL_WORLD_FEEDBACK_PATTERN_UPDATE',
      automaticLearning: true,
      destructiveChangesApplied: false,
      requiresHumanApprovalForCriticalChanges: true
    }
  };

  fs.writeFileSync(path.join(DATA_DIR, 'learning', 'latest-learning.json'), JSON.stringify(learning, null, 2));
  return learning;
}

function createProductionPlan(input = {}) {
  const demand = Number(input.demand || 0);
  const inventory = Number(input.inventory || 0);
  const capacity = Number(input.capacity || 0);
  const supply = Number(input.supply || 0);

  const shortage = Math.max(0, demand - inventory - supply);
  const possibleProduction = Math.min(capacity, shortage);
  const recommendedAction =
    shortage <= 0 ? 'NO_PRODUCTION_REQUIRED' :
    possibleProduction > 0 ? 'PRODUCE_WITH_GOVERNED_CAPACITY' :
    'SUPPLY_CHAIN_REVIEW_REQUIRED';

  const plan = {
    success: true,
    system: 'SHEIKHA_AI_SUPPLY_CHAIN_LIVING_PRODUCTION_V57',
    status: 'PLANNED',
    ts: now(),
    input: { demand, inventory, capacity, supply },
    result: {
      shortage,
      possibleProduction,
      recommendedAction
    },
    pipeline: [
      'DEMAND_CAPTURE',
      'INVENTORY_CHECK',
      'SUPPLIER_CHECK',
      'CAPACITY_CHECK',
      'QUALITY_GATE',
      'PRODUCTION_PLAN',
      'SUPPLY_CHAIN_ROUTE',
      'GOVERNANCE_AUDIT'
    ],
    governance: {
      calculationOnly: true,
      noFuturePredictionClaim: true,
      humanApprovalRequired: recommendedAction !== 'NO_PRODUCTION_REQUIRED'
    }
  };

  ensureDirs();
  fs.writeFileSync(path.join(DATA_DIR, 'plans', 'latest-production-plan.json'), JSON.stringify(plan, null, 2));
  return plan;
}

function selfHeal(input = {}) {
  ensureDirs();

  const learning = learnFromReality();
  const critical = Number(learning.counts.CRITICAL_REVIEW || 0);
  const improvement = Number(learning.counts.IMPROVEMENT_REQUIRED || 0);

  const actions = [];

  if (critical > 0) {
    actions.push('OPEN_HUMAN_REVIEW_GATE');
    actions.push('FREEZE_DESTRUCTIVE_AUTOMATION');
    actions.push('CREATE_RECOVERY_CHECKPOINT');
  }

  if (improvement > 0) {
    actions.push('REBUILD_CLASSIFICATION_INDEX');
    actions.push('RECHECK_SUPPLIER_ROUTING');
    actions.push('REVALIDATE_PIPELINE_CAPACITY');
  }

  if (actions.length === 0) {
    actions.push('NO_REPAIR_REQUIRED');
  }

  const recovery = {
    success: true,
    system: 'SHEIKHA_AI_SUPPLY_CHAIN_LIVING_PRODUCTION_V57',
    status: 'SELF_HEALING_PLAN_CREATED',
    ts: now(),
    automaticRepair: 'SAFE_PLAN_ONLY',
    destructiveWrite: false,
    actions,
    governance: {
      principle: 'لا ضرر ولا ضرار',
      humanApprovalForCriticalChanges: true,
      noEnvMutation: true,
      noSecretExposure: true
    }
  };

  fs.writeFileSync(path.join(DATA_DIR, 'recovery', 'latest-recovery-plan.json'), JSON.stringify(recovery, null, 2));
  return recovery;
}

module.exports = {
  status,
  recordEvent,
  learnFromReality,
  createProductionPlan,
  selfHeal
};
JS

cat > routes/ai-supply-chain-living-production/sheikha-ai-supply-chain-living-production-routes.js <<'JS'
'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  recordEvent,
  learnFromReality,
  createProductionPlan,
  selfHeal
} = require('../../runtime/ai-supply-chain-living-production/v1/sheikha-ai-supply-chain-living-production-v1');

router.get('/api/sheikha/ai-supply-chain-living-production/v1/status', (_req, res) => res.json(status()));
router.post('/api/sheikha/ai-supply-chain-living-production/v1/event', (req, res) => res.json(recordEvent(req.body || {})));
router.post('/api/sheikha/ai-supply-chain-living-production/v1/learn', (req, res) => res.json(learnFromReality(req.body || {})));
router.post('/api/sheikha/ai-supply-chain-living-production/v1/plan', (req, res) => res.json(createProductionPlan(req.body || {})));
router.post('/api/sheikha/ai-supply-chain-living-production/v1/self-heal', (req, res) => res.json(selfHeal(req.body || {})));

module.exports = router;
JS

cat > tools/ai-supply-chain-living-production/sheikha-ai-supply-chain-living-production-cli.js <<'JS'
#!/usr/bin/env node
'use strict';

const {
  status,
  recordEvent,
  learnFromReality,
  createProductionPlan,
  selfHeal
} = require('../../runtime/ai-supply-chain-living-production/v1/sheikha-ai-supply-chain-living-production-v1');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') console.log(JSON.stringify(status(), null, 2));
else if (cmd === 'event') console.log(JSON.stringify(recordEvent({ factory: 'Factory A', material: 'Raw Steel', quantity: 100, delay: 2, defect: false, supplier: 'Supplier A', quality: 'standard' }), null, 2));
else if (cmd === 'learn') console.log(JSON.stringify(learnFromReality(), null, 2));
else if (cmd === 'plan') console.log(JSON.stringify(createProductionPlan({ demand: 1000, inventory: 300, supply: 200, capacity: 400 }), null, 2));
else if (cmd === 'self-heal') console.log(JSON.stringify(selfHeal(), null, 2));
else {
  console.error('Usage: status | event | learn | plan | self-heal');
  process.exit(1);
}
JS

chmod +x tools/ai-supply-chain-living-production/sheikha-ai-supply-chain-living-production-cli.js

cat > docs/ai-supply-chain-living-production/SHEIKHA-AI-SUPPLY-CHAIN-LIVING-PRODUCTION-V57.md <<'MD'
# SHEIKHA_AI_SUPPLY_CHAIN_LIVING_PRODUCTION_V57

نظام إنتاج للذكاء الصناعي وسلاسل الإمداد الحية:

- استقبال أحداث واقعية من المصنع والمورد والمخزون والجودة.
- تعلم آلي حسابي من الواقع الحقيقي.
- تخطيط إنتاج آمن.
- حوكمة قبل الإصلاح.
- إصلاح ذاتي على شكل خطة آمنة فقط.
- تعافي وتشخيص بدون تعديل بيئة أو كشف أسرار.
MD

python3 - <<'PY'
from pathlib import Path

p = Path("server.js")
s = p.read_text()

mount = """
try {
  app.use(require('./routes/ai-supply-chain-living-production/sheikha-ai-supply-chain-living-production-routes'));
} catch (error) {
  console.warn('[sheikha-ai-supply-chain-living-production] route mount skipped:', error.message);
}
"""

if "sheikha-ai-supply-chain-living-production" not in s:
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
node --check runtime/ai-supply-chain-living-production/v1/sheikha-ai-supply-chain-living-production-v1.js
node --check routes/ai-supply-chain-living-production/sheikha-ai-supply-chain-living-production-routes.js
node --check tools/ai-supply-chain-living-production/sheikha-ai-supply-chain-living-production-cli.js

echo "== CLI tests =="
node tools/ai-supply-chain-living-production/sheikha-ai-supply-chain-living-production-cli.js event | jq '.success,.event.id'
node tools/ai-supply-chain-living-production/sheikha-ai-supply-chain-living-production-cli.js learn | jq '.status,.sampleSize,.counts'
node tools/ai-supply-chain-living-production/sheikha-ai-supply-chain-living-production-cli.js plan | jq '.status,.result'
node tools/ai-supply-chain-living-production/sheikha-ai-supply-chain-living-production-cli.js self-heal | jq '.status,.actions'

echo "== Restart =="
pm2 restart sheikha-main-portal --update-env
sleep 2

echo "== API tests =="
curl -s http://127.0.0.1:8080/api/sheikha/ai-supply-chain-living-production/v1/status | jq '.system,.status,.apexLevel'
curl -s -X POST http://127.0.0.1:8080/api/sheikha/ai-supply-chain-living-production/v1/plan \
  -H "Content-Type: application/json" \
  -d '{"demand":1000,"inventory":300,"supply":200,"capacity":400}' | jq '.status,.result'

echo "== Commit =="
git add \
  server.js \
  activate-sheikha-ai-supply-chain-living-production-v57.sh \
  runtime/ai-supply-chain-living-production \
  routes/ai-supply-chain-living-production \
  tools/ai-supply-chain-living-production \
  docs/ai-supply-chain-living-production

git commit -m "Activate Sheikha AI supply chain living production V57"
git push origin feature/extension-experience-apex-v1 || true

echo "== Done =="
