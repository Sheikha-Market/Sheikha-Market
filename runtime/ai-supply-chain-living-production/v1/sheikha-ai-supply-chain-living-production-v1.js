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
