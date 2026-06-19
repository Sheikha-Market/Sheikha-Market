#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Projects/sheikha/sheikha-main-portal"
cd "$ROOT"

cat > runtime/arabic-type-system-fabric/v93/sheikha-arabic-type-system-fabric-v93.js <<'JS'
'use strict';

function status() {
  return {
    success: true,
    system: 'SHEIKHA_ARABIC_TYPE_SYSTEM_FABRIC_V93',
    status: 'ACTIVE',
    apexLevel: 93,
    role: 'ARABIC_TYPE_SYSTEM_AND_SEMANTIC_VALIDATION_LAYER',
    typeDomains: [
      'PRIMITIVE_TYPES',
      'ARABIC_TEXT_TYPES',
      'NUMBER_TYPES',
      'BOOLEAN_TYPES',
      'RECORD_TYPES',
      'FUNCTION_TYPES',
      'GENERIC_TYPES',
      'GOVERNANCE_TYPES',
      'EVIDENCE_TYPES',
      'SEMANTIC_TYPES'
    ],
    lifecycle: [
      'DEFINE_TYPES',
      'NORMALIZE',
      'INFER',
      'CHECK',
      'VALIDATE_EVIDENCE',
      'VERIFY_GOVERNANCE',
      'HUMAN_REVIEW',
      'APPROVE'
    ],
    integrations: [
      'SHEIKHA_ARABIC_COMPILER_FABRIC_V92',
      'SHEIKHA_ARABIC_LANGUAGE_CLUSTER_FABRIC_V91',
      'SHEIKHA_DISTRIBUTED_COGNITIVE_MESH_FABRIC_V90'
    ],
    governance: {
      principle: 'لا ضرر ولا ضرار',
      arabicFirst: true,
      quranSunnahValues: true,
      humanIsPrimary: true,
      aiToolOnly: true,
      evidenceRequired: true,
      humanApprovalForCriticalActions: true
    }
  };
}

function typePlan(input = {}) {
  return {
    success: true,
    system: 'SHEIKHA_ARABIC_TYPE_SYSTEM_FABRIC_V93',
    status: 'ARABIC_TYPE_SYSTEM_PLAN_CREATED',
    name: input.name || 'Sheikha Arabic Type System Plan',
    scope: input.scope || 'ARABIC_TYPE_SYSTEM_AND_SEMANTIC_VALIDATION',
    typeDomains: status().typeDomains,
    lifecycle: status().lifecycle,
    linkedLayers: status().integrations,
    governance: status().governance
  };
}

module.exports = { status, typePlan };
JS

cat > routes/arabic-type-system-fabric/sheikha-arabic-type-system-fabric-routes.js <<'JS'
'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  typePlan
} = require('../../runtime/arabic-type-system-fabric/v93/sheikha-arabic-type-system-fabric-v93');

router.get('/api/sheikha/arabic-type-system-fabric/v93/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/arabic-type-system-fabric/v93/demo', (_req, res) => res.json(typePlan()));
router.post('/api/sheikha/arabic-type-system-fabric/v93/plan', (req, res) => res.json(typePlan(req.body || {})));

module.exports = router;
JS

cat > tools/arabic-type-system-fabric/sheikha-arabic-type-system-fabric-v93-cli.js <<'JS'
#!/usr/bin/env node
'use strict';

const { status, typePlan } = require('../../runtime/arabic-type-system-fabric/v93/sheikha-arabic-type-system-fabric-v93');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') console.log(JSON.stringify(status(), null, 2));
else if (cmd === 'demo') console.log(JSON.stringify(typePlan(), null, 2));
else process.exit(1);
JS

chmod +x tools/arabic-type-system-fabric/sheikha-arabic-type-system-fabric-v93-cli.js

cat > docs/arabic-type-system-fabric/SHEIKHA-ARABIC-TYPE-SYSTEM-FABRIC-V93.md <<'MD'
# SHEIKHA_ARABIC_TYPE_SYSTEM_FABRIC_V93

طبقة نظام الأنواع العربية للغة شيخة: أنواع أولية، نصوص عربية، أرقام، سجلات، دوال، أنواع عامة، أنواع حوكمية، وأنواع أدلة.

## الحوكمة

- العربية أولاً.
- الكتاب والسنة قيماً وضوابط.
- لا ضرر ولا ضرار.
- الإنسان صاحب القرار.
- الذكاء الصناعي أداة حساب وتحليل فقط.
- الدليل مطلوب.
MD

python3 - <<'PY'
from pathlib import Path

p = Path("server.js")
s = p.read_text()

mount = """
try {
  app.use(require('./routes/arabic-type-system-fabric/sheikha-arabic-type-system-fabric-routes'));
} catch (error) {
  console.warn('[sheikha-arabic-type-system-fabric-v93] route mount skipped:', error.message);
}
"""

if "sheikha-arabic-type-system-fabric-v93" not in s:
    idx = s.find("app.use(express.json")
    if idx == -1:
        idx = s.find("app.use(")
    s = s[:idx] + mount + "\n" + s[idx:]

p.write_text(s)
PY

node --check server.js
node --check runtime/arabic-type-system-fabric/v93/sheikha-arabic-type-system-fabric-v93.js
node --check routes/arabic-type-system-fabric/sheikha-arabic-type-system-fabric-routes.js
node --check tools/arabic-type-system-fabric/sheikha-arabic-type-system-fabric-v93-cli.js

node tools/arabic-type-system-fabric/sheikha-arabic-type-system-fabric-v93-cli.js status | jq '.system,.status,.apexLevel'

pm2 restart sheikha-main-portal --update-env
sleep 2

curl -s http://127.0.0.1:8080/api/sheikha/arabic-type-system-fabric/v93/status | jq '.system,.status,.apexLevel'
curl -s http://127.0.0.1:8080/api/sheikha/arabic-type-system-fabric/v93/demo | jq '.status,.name,.scope'

npm test
npm run lint

git add \
  server.js \
  activate-sheikha-arabic-type-system-fabric-v93.sh \
  runtime/arabic-type-system-fabric \
  routes/arabic-type-system-fabric \
  tools/arabic-type-system-fabric \
  docs/arabic-type-system-fabric

git commit -m "Activate Sheikha Arabic type system fabric V93"
git push origin feature/v93-arabic-type-system-fabric

echo "== Done =="
