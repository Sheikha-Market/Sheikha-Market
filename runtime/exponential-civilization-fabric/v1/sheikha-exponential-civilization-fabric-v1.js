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
