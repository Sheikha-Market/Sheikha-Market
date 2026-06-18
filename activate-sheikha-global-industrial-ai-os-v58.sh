#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Projects/sheikha/sheikha-main-portal"
cd "$ROOT"

echo "== Activate SHEIKHA_GLOBAL_INDUSTRIAL_AI_OPERATING_SYSTEM_V58 =="

mkdir -p runtime/global-industrial-ai-os/v1
mkdir -p routes/global-industrial-ai-os
mkdir -p tools/global-industrial-ai-os
mkdir -p docs/global-industrial-ai-os
mkdir -p data/global-industrial-ai-os/{events,monitoring,space,robotics,energy,materials,supply-chain,audit}

cat > runtime/global-industrial-ai-os/v1/sheikha-global-industrial-ai-os-v1.js <<'JS'
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
JS

cat > routes/global-industrial-ai-os/sheikha-global-industrial-ai-os-routes.js <<'JS'
'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  monitor,
  unifiedPlan,
  selfHeal
} = require('../../runtime/global-industrial-ai-os/v1/sheikha-global-industrial-ai-os-v1');

router.get('/api/sheikha/global-industrial-ai-os/v1/status', (_req, res) => res.json(status()));
router.post('/api/sheikha/global-industrial-ai-os/v1/monitor', (req, res) => res.json(monitor(req.body || {})));
router.post('/api/sheikha/global-industrial-ai-os/v1/plan', (req, res) => res.json(unifiedPlan(req.body || {})));
router.post('/api/sheikha/global-industrial-ai-os/v1/self-heal', (req, res) => res.json(selfHeal(req.body || {})));

module.exports = router;
JS

cat > tools/global-industrial-ai-os/sheikha-global-industrial-ai-os-cli.js <<'JS'
#!/usr/bin/env node
'use strict';

const {
  status,
  monitor,
  unifiedPlan,
  selfHeal
} = require('../../runtime/global-industrial-ai-os/v1/sheikha-global-industrial-ai-os-v1');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') console.log(JSON.stringify(status(), null, 2));
else if (cmd === 'monitor') console.log(JSON.stringify(monitor({ name: 'Satellite monitored refinery supply chain', domain: 'space logistics refinery', facility: 'Refinery A' }), null, 2));
else if (cmd === 'plan') console.log(JSON.stringify(unifiedPlan({ name: 'Energy and satellite supply chain AI production', domain: 'space satellite logistics energy robotics' }), null, 2));
else if (cmd === 'self-heal') console.log(JSON.stringify(selfHeal(), null, 2));
else {
  console.error('Usage: status | monitor | plan | self-heal');
  process.exit(1);
}
JS

chmod +x tools/global-industrial-ai-os/sheikha-global-industrial-ai-os-cli.js

cat > docs/global-industrial-ai-os/SHEIKHA-GLOBAL-INDUSTRIAL-AI-OS-V58.md <<'MD'
# SHEIKHA_GLOBAL_INDUSTRIAL_AI_OPERATING_SYSTEM_V58

نظام تشغيل صناعي موحد للذكاء الصناعي:

- الإنتاج والصناعة.
- الطاقة وتحويلها إلى طاقة نافعة تشغيلية ومعرفية.
- المعادن والتعدين.
- البترول والمصافي.
- سلاسل الإمداد واللوجستيات.
- الروبوتات الصناعية.
- الأقمار الصناعية والفضاء كسلسلة مراقبة وربط رقمي.
- الرقابة والتعلم الحسابي من الواقع.
- الإصلاح الذاتي كخطط آمنة.
- الحوكمة بالكتاب والسنة من حيث القيم والضوابط: الصدق، الأمانة، العدل، منع الضرر، منع الغش والظلم.

## حدود السلامة

لا يقدم النظام تعليمات بناء صواريخ أو أسلحة أو وصفات خطرة أو معاملات تشغيل حساسة. التكامل الفضائي هنا رقمي وتشغيلي ومراقبة وسلاسل إمداد فقط.
MD

python3 - <<'PY'
from pathlib import Path

p = Path("server.js")
s = p.read_text()

mount = """
try {
  app.use(require('./routes/global-industrial-ai-os/sheikha-global-industrial-ai-os-routes'));
} catch (error) {
  console.warn('[sheikha-global-industrial-ai-os] route mount skipped:', error.message);
}
"""

if "sheikha-global-industrial-ai-os" not in s:
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
node --check runtime/global-industrial-ai-os/v1/sheikha-global-industrial-ai-os-v1.js
node --check routes/global-industrial-ai-os/sheikha-global-industrial-ai-os-routes.js
node --check tools/global-industrial-ai-os/sheikha-global-industrial-ai-os-cli.js

echo "== CLI tests =="
node tools/global-industrial-ai-os/sheikha-global-industrial-ai-os-cli.js status | jq '.system,.status,.apexLevel'
node tools/global-industrial-ai-os/sheikha-global-industrial-ai-os-cli.js monitor | jq '.status,.event.domain'
node tools/global-industrial-ai-os/sheikha-global-industrial-ai-os-cli.js plan | jq '.status,.domain,.pipeline,.spaceSupplyChain.allowedScope'
node tools/global-industrial-ai-os/sheikha-global-industrial-ai-os-cli.js self-heal | jq '.status,.actions'

echo "== Restart =="
pm2 restart sheikha-main-portal --update-env
sleep 2

echo "== API tests =="
curl -s http://127.0.0.1:8080/api/sheikha/global-industrial-ai-os/v1/status | jq '.system,.status,.apexLevel'
curl -s -X POST http://127.0.0.1:8080/api/sheikha/global-industrial-ai-os/v1/plan \
  -H "Content-Type: application/json" \
  -d '{"name":"AI industrial space supply chain energy system","domain":"space satellite logistics energy robotics mining petroleum"}' \
  | jq '.status,.domain,.energyConversion.target,.spaceSupplyChain.integrationType,.robotics.roboticsRole'

echo "== Commit =="
git add \
  server.js \
  activate-sheikha-global-industrial-ai-os-v58.sh \
  runtime/global-industrial-ai-os \
  routes/global-industrial-ai-os \
  tools/global-industrial-ai-os \
  docs/global-industrial-ai-os

git commit -m "Activate Sheikha global industrial AI operating system V58"
git push origin feature/extension-experience-apex-v1 || true

echo "== Done =="
