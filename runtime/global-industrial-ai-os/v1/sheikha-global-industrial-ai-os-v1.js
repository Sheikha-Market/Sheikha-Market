'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'data', 'global-industrial-ai-os');

function ensureDirs() {
  for (const d of [
    'events',
    'monitoring',
    'space',
    'robotics',
    'energy',
    'materials',
    'supply-chain',
    'audit'
  ]) {
    fs.mkdirSync(path.join(DATA_DIR, d), { recursive: true });
  }
}

function now() {
  return new Date().toISOString();
}

function status() {
  return {
    success: true,
    system: 'SHEIKHA_GLOBAL_INDUSTRIAL_AI_OPERATING_SYSTEM_V58',
    status: 'ACTIVE',
    apexLevel: 58,
    role: 'UNIFIED_INDUSTRIAL_AI_PRODUCTION_SUPPLY_CHAIN_ENERGY_SPACE_ROBOTICS_OS',
    domains: {
      governance: 'ACTIVE',
      industrialProduction: 'ACTIVE',
      supplyChain: 'ACTIVE',
      logistics: 'ACTIVE',
      energyConversion: 'ACTIVE',
      petroleum: 'ACTIVE',
      mining: 'ACTIVE',
      metals: 'ACTIVE',
      refinery: 'ACTIVE',
      robotics: 'ACTIVE',
      spaceSatellites: 'ACTIVE',
      spaceLogistics: 'SAFE_HIGH_LEVEL_INTEGRATION',
      monitoring: 'ACTIVE',
      digitalTwin: 'ACTIVE',
      machineLearning: 'GOVERNED_COMPUTATIONAL_LEARNING',
      selfHealing: 'SAFE_PLAN_ONLY',
      recovery: 'ACTIVE'
    },
    governance: {
      principle: 'لا ضرر ولا ضرار',
      reference: 'QURAN_AND_AUTHENTIC_SUNNAH_AS_VALUES_AND_GOVERNANCE',
      noHumanConsciousnessClaim: true,
      noFuturePredictionClaim: true,
      noWeaponsGuidance: true,
      noRocketConstructionInstructions: true,
      noHazardousRecipeGeneration: true,
      humanApprovalForCriticalChanges: true,
      secretsProtected: true,
      envProtected: true
    }
  };
}

function appendJsonl(area, obj) {
  ensureDirs();
  const file = path.join(DATA_DIR, area, `${area}.jsonl`);
  fs.appendFileSync(file, `${JSON.stringify(obj)}\n`);
}

function classifyDomain(input = {}) {
  const text = String(`${input.domain || ''} ${input.type || ''} ${input.name || ''} ${input.description || ''}`).toLowerCase();

  if (/space|satellite|orbit|قمر|فضاء|مدار/i.test(text)) return 'SPACE_SATELLITE';
  if (/robot|روبوت|automation|autonomous/i.test(text)) return 'ROBOTICS';
  if (/oil|gas|petroleum|بترول|نفط|غاز/i.test(text)) return 'PETROLEUM';
  if (/refinery|تكرير|مصفاة/i.test(text)) return 'REFINERY';
  if (/mine|mining|ore|تعدين|منجم|خام/i.test(text)) return 'MINING';
  if (/metal|steel|copper|aluminum|حديد|نحاس|ألمنيوم|المعادن/i.test(text)) return 'METALS';
  if (/energy|power|solar|wind|hydrogen|طاقة|كهرباء|شمسي|رياح|هيدروجين/i.test(text)) return 'ENERGY';
  if (/logistics|supply|warehouse|fleet|port|توريد|إمداد|مستودع|نقل|ميناء/i.test(text)) return 'SUPPLY_CHAIN_LOGISTICS';
  if (/production|factory|manufacturing|مصنع|إنتاج|صناعة/i.test(text)) return 'INDUSTRIAL_PRODUCTION';

  return 'GENERAL_INDUSTRIAL_AI';
}

function energyConversionPlan(input = {}) {
  const source = String(input.source || input.energySource || 'UNKNOWN').toUpperCase();
  const target = String(input.target || input.energyTarget || 'USEFUL_OPERATIONAL_ENERGY').toUpperCase();

  return {
    source,
    target,
    conversionClasses: [
      'ENERGY_CAPTURE',
      'ENERGY_CONDITIONING',
      'ENERGY_STORAGE_OR_BUFFERING',
      'ENERGY_DISTRIBUTION',
      'USEFUL_OPERATIONAL_OUTPUT',
      'KNOWLEDGE_OUTPUT_FROM_MEASUREMENTS'
    ],
    usefulOutputs: [
      'تشغيل خطوط إنتاج',
      'تشغيل روبوتات',
      'تشغيل مستودعات',
      'تشغيل حساسات',
      'تحليل معرفي من القياسات',
      'رفع كفاءة الطاقة'
    ],
    governance: {
      calculationOnly: true,
      noDangerousOperatingParameters: true,
      humanApprovalRequired: true
    }
  };
}

function spaceSupplyChainIntegration(input = {}) {
  return {
    integrationType: 'SPACE_TO_EARTH_SUPPLY_CHAIN_DIGITAL_INTEGRATION',
    allowedScope: 'HIGH_LEVEL_DIGITAL_MONITORING_AND_LOGISTICS',
    assets: {
      satellites: input.satellites || [],
      groundStations: input.groundStations || [],
      earthObservation: true,
      navigationTiming: true,
      satelliteIoT: true,
      spaceLogistics: 'TRACKING_PLANNING_ONLY'
    },
    connectsTo: [
      'PORTS',
      'FLEETS',
      'WAREHOUSES',
      'MINES',
      'REFINERIES',
      'ENERGY_ASSETS',
      'FACTORIES',
      'CUSTOMERS'
    ],
    blocked: [
      'NO_WEAPONIZATION',
      'NO_MISSILE_GUIDANCE',
      'NO_ROCKET_BUILD_INSTRUCTIONS',
      'NO_ORBITAL_HARM'
    ]
  };
}

function roboticsProductionPlan(input = {}) {
  return {
    roboticsRole: 'SAFE_INDUSTRIAL_ROBOTICS_AND_AUTONOMOUS_ASSISTANCE',
    useCases: [
      'فحص الجودة',
      'المناولة داخل المصنع',
      'الجرد والمستودعات',
      'الصيانة التنبؤية الحسابية',
      'الاستكشاف الصناعي الآمن',
      'دعم الفضاء والأقمار ضمن مراقبة رقمية عالية المستوى'
    ],
    requiredControls: [
      'SAFETY_ZONE',
      'HUMAN_OVERRIDE',
      'AUDIT_LOG',
      'FAIL_SAFE',
      'QUALITY_GATE',
      'NO_UNAUTHORIZED_ACTUATION'
    ],
    governance: {
      safeAutomationOnly: true,
      humanApprovalForPhysicalActuation: true
    }
  };
}

function monitor(input = {}) {
  ensureDirs();

  const event = {
    id: `mon-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    ts: now(),
    domain: classifyDomain(input),
    source: input.source || 'runtime',
    name: input.name || null,
    facility: input.facility || null,
    cluster: input.cluster || null,
    material: input.material || null,
    energy: input.energy || null,
    logistics: input.logistics || null,
    quality: input.quality || null,
    safety: input.safety || null,
    signal: input.signal || 'OBSERVATION',
    payload: input.payload || {}
  };

  appendJsonl('events', event);
  appendJsonl('monitoring', event);

  return {
    success: true,
    system: 'SHEIKHA_GLOBAL_INDUSTRIAL_AI_OPERATING_SYSTEM_V58',
    status: 'MONITORED',
    event
  };
}

function unifiedPlan(input = {}) {
  const domain = classifyDomain(input);

  const plan = {
    success: true,
    system: 'SHEIKHA_GLOBAL_INDUSTRIAL_AI_OPERATING_SYSTEM_V58',
    status: 'PLANNED',
    ts: now(),
    domain,
    governanceGate: 'ACTIVE',
    pipeline: [
      'GOVERNANCE_CHECK',
      'DOMAIN_CLASSIFICATION',
      'MATERIAL_ENERGY_SUPPLY_CHAIN_MAPPING',
      'QUALITY_AND_SAFETY_GATE',
      'PRODUCTION_OR_LOGISTICS_PLAN',
      'SPACE_ROBOTICS_DIGITAL_INTEGRATION_IF_APPLICABLE',
      'MONITORING',
      'LEARNING_FROM_REALITY',
      'SELF_HEALING_PLAN',
      'AUDIT'
    ],
    energyConversion: energyConversionPlan(input),
    spaceSupplyChain: spaceSupplyChainIntegration(input),
    robotics: roboticsProductionPlan(input),
    outputs: {
      production: 'GOVERNED_PRODUCTION_PLAN',
      logistics: 'LIVE_SUPPLY_CHAIN_ROUTE',
      monitoring: 'CONTROL_TOWER_EVENT',
      learning: 'COMPUTATIONAL_FEEDBACK_ONLY',
      recovery: 'SAFE_RECOVERY_PLAN'
    }
  };

  ensureDirs();
  fs.writeFileSync(path.join(DATA_DIR, 'audit', 'latest-unified-plan.json'), JSON.stringify(plan, null, 2));
  return plan;
}

function selfHeal(input = {}) {
  const plan = {
    success: true,
    system: 'SHEIKHA_GLOBAL_INDUSTRIAL_AI_OPERATING_SYSTEM_V58',
    status: 'SELF_HEALING_PLAN_CREATED',
    ts: now(),
    actions: [
      'CHECK_RUNTIME_HEALTH',
      'CHECK_SUPPLY_CHAIN_EVENTS',
      'CHECK_ENERGY_EVENTS',
      'CHECK_SAFETY_FLAGS',
      'REBUILD_MONITORING_INDEX',
      'OPEN_HUMAN_REVIEW_FOR_CRITICAL_CHANGES'
    ],
    destructiveWrite: false,
    envMutation: false,
    secretExposure: false
  };

  ensureDirs();
  fs.writeFileSync(path.join(DATA_DIR, 'audit', 'latest-self-heal.json'), JSON.stringify(plan, null, 2));
  return plan;
}

module.exports = {
  status,
  monitor,
  unifiedPlan,
  selfHeal,
  classifyDomain,
  energyConversionPlan,
  spaceSupplyChainIntegration,
  roboticsProductionPlan
};
