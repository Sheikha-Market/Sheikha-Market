#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Projects/sheikha/sheikha-main-portal"
cd "$ROOT"

echo "== Activate SHEIKHA_HUMAN_MODEL_FABRIC_V73 =="

mkdir -p runtime/human-model-fabric/v73
mkdir -p routes/human-model-fabric
mkdir -p tools/human-model-fabric
mkdir -p docs/human-model-fabric

cat > runtime/human-model-fabric/v73/sheikha-human-model-fabric-v73.js <<'JS'
'use strict';

function status() {
  return {
    success: true,
    system: 'SHEIKHA_HUMAN_MODEL_FABRIC_V73',
    status: 'ACTIVE',
    apexLevel: 73,
    role: 'HUMAN_REFERENCE_LEARNING_FABRIC_LINKED_TO_V62_TO_V72',
    purpose: 'Educational reference only; not medical diagnosis or human simulation.',
    integrations: [
      'SHEIKHA_UNIFIED_KNOWLEDGE_SCIENCE_FABRIC_V62',
      'SHEIKHA_KNOWLEDGE_GRAPH_ENGINE_V63',
      'SHEIKHA_DIGITAL_TWIN_FABRIC_V64',
      'SHEIKHA_INDUSTRIAL_COGNITIVE_FACTORY_FABRIC_V65',
      'SHEIKHA_GLOBAL_SUPPLY_CHAIN_GRAPH_V66',
      'SHEIKHA_EARTH_DIGITAL_TWIN_FABRIC_V67',
      'SHEIKHA_UNIFIED_SCIENTIFIC_KNOWLEDGE_GRAPH_V68',
      'SHEIKHA_INDUSTRIAL_CLUSTER_FABRIC_V69',
      'SHEIKHA_CIVILIZATION_OPERATING_SYSTEM_V70',
      'SHEIKHA_QUALITY_SAFETY_FABRIC_V71',
      'SHEIKHA_RESEARCH_INNOVATION_FABRIC_V72'
    ],
    domains: [
      'HUMAN_DIGNITY',
      'ANATOMY_REFERENCE',
      'PHYSIOLOGY_REFERENCE',
      'NUTRITION',
      'METABOLISM',
      'MOVEMENT',
      'SLEEP',
      'LEARNING',
      'MEMORY',
      'PSYCHOLOGY_REFERENCE',
      'IMMUNE_SYSTEM_REFERENCE',
      'HEALING_REFERENCE',
      'REHABILITATION_REFERENCE',
      'PREVENTION'
    ],
    lifecycle: [
      'OBSERVE',
      'LEARN_FROM_HUMAN_EXCELLENCE',
      'CLASSIFY',
      'CALCULATE',
      'EDUCATIONAL_REFERENCE',
      'SPECIALIST_REVIEW',
      'SAFETY_GATE',
      'DOCUMENT',
      'IMPROVE'
    ],
    governance: {
      principle: 'لا ضرر ولا ضرار',
      quranSunnahValues: true,
      humanIsHonoredAndPrimary: true,
      aiToolOnly: true,
      notHumanSimulation: true,
      noConsciousnessClaim: true,
      noFuturePredictionClaim: true,
      noMedicalDiagnosis: true,
      noMedicalReplacement: true,
      specialistReviewRequired: true,
      humanApprovalForCriticalActions: true,
      antiAsabiyyah: true
    }
  };
}

function educationPlan(input = {}) {
  return {
    success: true,
    system: 'SHEIKHA_HUMAN_MODEL_FABRIC_V73',
    status: 'HUMAN_REFERENCE_EDUCATION_PLAN_CREATED',
    name: input.name || 'Sheikha Human Model Educational Reference Plan',
    scope: input.scope || 'EDUCATIONAL_REFERENCE_ONLY',
    note: 'This is not diagnosis, treatment, or medical advice.',
    linkedLayers: status().integrations,
    domains: input.domains || status().domains,
    lifecycle: status().lifecycle,
    governance: status().governance
  };
}

module.exports = { status, educationPlan };
JS

cat > routes/human-model-fabric/sheikha-human-model-fabric-routes.js <<'JS'
'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  educationPlan
} = require('../../runtime/human-model-fabric/v73/sheikha-human-model-fabric-v73');

router.get('/api/sheikha/human-model-fabric/v73/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/human-model-fabric/v73/demo', (_req, res) => res.json(educationPlan()));
router.post('/api/sheikha/human-model-fabric/v73/plan', (req, res) => res.json(educationPlan(req.body || {})));

module.exports = router;
JS

cat > tools/human-model-fabric/sheikha-human-model-fabric-v73-cli.js <<'JS'
#!/usr/bin/env node
'use strict';

const {
  status,
  educationPlan
} = require('../../runtime/human-model-fabric/v73/sheikha-human-model-fabric-v73');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') console.log(JSON.stringify(status(), null, 2));
else if (cmd === 'demo') console.log(JSON.stringify(educationPlan(), null, 2));
else process.exit(1);
JS

chmod +x tools/human-model-fabric/sheikha-human-model-fabric-v73-cli.js

cat > docs/human-model-fabric/SHEIKHA-HUMAN-MODEL-FABRIC-V73.md <<'MD'
# SHEIKHA_HUMAN_MODEL_FABRIC_V73

طبقة مرجعية تعليمية لدراسة الإنسان والصحة والغذاء والتعلم والحركة والتعافي.

ليست محاكاة للإنسان، وليست تشخيصاً طبياً، وليست بديلاً عن الطبيب أو المختص.

## الحوكمة

- الإنسان مكرم وهو الأصل.
- الذكاء الصناعي أداة حساب وتحليل وتصنيف فقط.
- لا ادعاء وعي.
- لا ادعاء تنبؤ بالغيب.
- لا تشخيص طبي.
- لا بديل عن الطبيب أو المختص.
- لا ضرر ولا ضرار.
- مراجعة بشرية/متخصصة عند الحاجة.
MD

python3 - <<'PY'
from pathlib import Path

p = Path("server.js")
s = p.read_text()

mount = """
try {
  app.use(require('./routes/human-model-fabric/sheikha-human-model-fabric-routes'));
} catch (error) {
  console.warn('[sheikha-human-model-fabric-v73] route mount skipped:', error.message);
}
"""

if "sheikha-human-model-fabric-v73" not in s:
    idx = s.find("app.use(express.json")
    if idx == -1:
        idx = s.find("app.use(")
    if idx == -1:
        raise SystemExit("Cannot find insertion point")
    s = s[:idx] + mount + "\n" + s[idx:]

p.write_text(s)
PY

node --check server.js
node --check runtime/human-model-fabric/v73/sheikha-human-model-fabric-v73.js
node --check routes/human-model-fabric/sheikha-human-model-fabric-routes.js
node --check tools/human-model-fabric/sheikha-human-model-fabric-v73-cli.js

node tools/human-model-fabric/sheikha-human-model-fabric-v73-cli.js status | jq '.system,.status,.apexLevel'
node tools/human-model-fabric/sheikha-human-model-fabric-v73-cli.js demo | jq '.status,.name,.scope'

pm2 restart sheikha-main-portal --update-env
sleep 2

curl -s http://127.0.0.1:8080/api/sheikha/human-model-fabric/v73/status | jq '.system,.status,.apexLevel'
curl -s http://127.0.0.1:8080/api/sheikha/human-model-fabric/v73/demo | jq '.status,.name'

npm test
npm run lint
node --check server.js

git add \
  server.js \
  activate-sheikha-human-model-fabric-v73.sh \
  runtime/human-model-fabric \
  routes/human-model-fabric \
  tools/human-model-fabric \
  docs/human-model-fabric

git commit -m "Activate Sheikha human model fabric V73"
git push origin feature/v73-human-model-fabric

echo "== Done =="
