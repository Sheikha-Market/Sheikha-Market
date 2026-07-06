#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Projects/sheikha/sheikha-main-portal"
cd "$ROOT"

echo "== Activate SHEIKHA_EARTH_DIGITAL_TWIN_FABRIC_V67 =="

mkdir -p runtime/earth-digital-twin-fabric/v1
mkdir -p routes/earth-digital-twin-fabric
mkdir -p tools/earth-digital-twin-fabric
mkdir -p docs/earth-digital-twin-fabric

cat > runtime/earth-digital-twin-fabric/v1/sheikha-earth-digital-twin-fabric-v67.js <<'JS'
'use strict';

function status() {
  return {
    success: true,
    system: 'SHEIKHA_EARTH_DIGITAL_TWIN_FABRIC_V67',
    status: 'ACTIVE',
    apexLevel: 67,
    integrations: [
      'SHEIKHA_UNIFIED_KNOWLEDGE_SCIENCE_FABRIC_V62',
      'SHEIKHA_KNOWLEDGE_GRAPH_ENGINE_V63',
      'SHEIKHA_DIGITAL_TWIN_FABRIC_V64',
      'SHEIKHA_INDUSTRIAL_COGNITIVE_FACTORY_FABRIC_V65',
      'SHEIKHA_GLOBAL_SUPPLY_CHAIN_GRAPH_V66'
    ],
    domains: [
      'HUMAN','HEALTH','FOOD','WATER','AGRICULTURE','ENERGY','MINING',
      'REFINERY','PETROCHEMICAL','MANUFACTURING','LOGISTICS','SUPPLY_CHAIN',
      'CITIES','PORTS','AIRPORTS','SPACE','SATELLITES','RESEARCH','EDUCATION'
    ],
    lifecycle: [
      'OBSERVE','CLASSIFY','MODEL','LINK_TO_GRAPH','MONITOR',
      'QUALITY_GATE','SAFETY_GATE','IMPROVE'
    ],
    governance: {
      principle: 'لا ضرر ولا ضرار',
      quranSunnahValues: true,
      humanIsPrimary: true,
      aiToolOnly: true,
      calculationOnly: true,
      noConsciousnessClaim: true,
      noFuturePredictionClaim: true,
      humanApprovalForCriticalActions: true,
      antiAsabiyyah: true
    }
  };
}

function createEarthTwin(input = {}) {
  return {
    success: true,
    system: 'SHEIKHA_EARTH_DIGITAL_TWIN_FABRIC_V67',
    status: 'EARTH_TWIN_CREATED',
    name: input.name || 'Sheikha Earth Digital Twin',
    scope: input.scope || 'EARTH_DEVELOPMENT',
    domains: input.domains || status().domains,
    linkedLayers: status().integrations,
    lifecycle: status().lifecycle,
    governance: status().governance
  };
}

module.exports = { status, createEarthTwin };
JS

cat > routes/earth-digital-twin-fabric/sheikha-earth-digital-twin-fabric-routes.js <<'JS'
'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  createEarthTwin
} = require('../../runtime/earth-digital-twin-fabric/v1/sheikha-earth-digital-twin-fabric-v67');

router.get('/api/sheikha/earth-digital-twin-fabric/v67/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/earth-digital-twin-fabric/v67/demo', (_req, res) => res.json(createEarthTwin()));
router.post('/api/sheikha/earth-digital-twin-fabric/v67/twin', (req, res) => res.json(createEarthTwin(req.body || {})));

module.exports = router;
JS

cat > tools/earth-digital-twin-fabric/sheikha-earth-digital-twin-fabric-v67-cli.js <<'JS'
#!/usr/bin/env node
'use strict';

const {
  status,
  createEarthTwin
} = require('../../runtime/earth-digital-twin-fabric/v1/sheikha-earth-digital-twin-fabric-v67');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') console.log(JSON.stringify(status(), null, 2));
else if (cmd === 'demo') console.log(JSON.stringify(createEarthTwin(), null, 2));
else process.exit(1);
JS

chmod +x tools/earth-digital-twin-fabric/sheikha-earth-digital-twin-fabric-v67-cli.js

cat > docs/earth-digital-twin-fabric/SHEIKHA-EARTH-DIGITAL-TWIN-FABRIC-V67.md <<'MD'
# SHEIKHA_EARTH_DIGITAL_TWIN_FABRIC_V67

طبقة توأم رقمي للأرض وقطاعاتها: الإنسان، الصحة، الغذاء، الماء، الزراعة، الطاقة، التعدين، الصناعة، اللوجستيات، المدن، الفضاء، الأقمار، البحث والتعليم.

ترتبط مع V62 وV63 وV64 وV65 وV66 ضمن حوكمة: لا ضرر ولا ضرار، الإنسان مكرم، الذكاء الصناعي أداة فقط، ومنع العصبية.
MD

python3 - <<'PY'
from pathlib import Path

p = Path("server.js")
s = p.read_text()

mount = """
try {
  app.use(require('./routes/earth-digital-twin-fabric/sheikha-earth-digital-twin-fabric-routes'));
} catch (error) {
  console.warn('[sheikha-earth-digital-twin-fabric-v67] route mount skipped:', error.message);
}
"""

if "sheikha-earth-digital-twin-fabric-v67" not in s:
    idx = s.find("app.use(express.json")
    if idx == -1:
        idx = s.find("app.use(")
    if idx == -1:
        raise SystemExit("Cannot find insertion point")
    s = s[:idx] + mount + "\n" + s[idx:]

p.write_text(s)
PY

node --check server.js
node --check runtime/earth-digital-twin-fabric/v1/sheikha-earth-digital-twin-fabric-v67.js
node --check routes/earth-digital-twin-fabric/sheikha-earth-digital-twin-fabric-routes.js
node --check tools/earth-digital-twin-fabric/sheikha-earth-digital-twin-fabric-v67-cli.js

node tools/earth-digital-twin-fabric/sheikha-earth-digital-twin-fabric-v67-cli.js status | jq '.system,.status,.apexLevel'
node tools/earth-digital-twin-fabric/sheikha-earth-digital-twin-fabric-v67-cli.js demo | jq '.status,.name,.scope'

pm2 restart sheikha-main-portal --update-env
sleep 2

curl -s http://127.0.0.1:8080/api/sheikha/earth-digital-twin-fabric/v67/status | jq '.system,.status,.apexLevel'
curl -s http://127.0.0.1:8080/api/sheikha/earth-digital-twin-fabric/v67/demo | jq '.status,.name'

npm test
npm run lint
node --check server.js

git add \
  server.js \
  activate-sheikha-earth-digital-twin-fabric-v67.sh \
  runtime/earth-digital-twin-fabric \
  routes/earth-digital-twin-fabric \
  tools/earth-digital-twin-fabric \
  docs/earth-digital-twin-fabric

git commit -m "Activate Sheikha earth digital twin fabric V67"
git push origin feature/v67-earth-digital-twin-fabric

echo "== Done =="
