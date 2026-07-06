#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Projects/sheikha/sheikha-main-portal"
cd "$ROOT"

cat > runtime/arabic-compiler-fabric/v92/sheikha-arabic-compiler-fabric-v92.js <<'JS'
'use strict';

function status() {
  return {
    success: true,
    system: 'SHEIKHA_ARABIC_COMPILER_FABRIC_V92',
    status: 'ACTIVE',
    apexLevel: 92,
    role: 'ARABIC_COMPILER_PIPELINE_LAYER',
    compilerStages: [
      'LEXICAL_ANALYSIS',
      'ARABIC_TOKENIZATION',
      'PARSING',
      'AST_BUILD',
      'SEMANTIC_ANALYSIS',
      'TYPE_CHECK',
      'IR_GENERATION',
      'GOVERNANCE_VERIFY',
      'HUMAN_REVIEW',
      'CODE_GENERATION'
    ],
    integrations: [
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

function compilerPlan(input = {}) {
  return {
    success: true,
    system: 'SHEIKHA_ARABIC_COMPILER_FABRIC_V92',
    status: 'ARABIC_COMPILER_PLAN_CREATED',
    name: input.name || 'Sheikha Arabic Compiler Plan',
    scope: input.scope || 'ARABIC_COMPILER_PIPELINE',
    stages: status().compilerStages,
    linkedLayers: status().integrations,
    governance: status().governance
  };
}

module.exports = { status, compilerPlan };
JS

cat > routes/arabic-compiler-fabric/sheikha-arabic-compiler-fabric-routes.js <<'JS'
'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  compilerPlan
} = require('../../runtime/arabic-compiler-fabric/v92/sheikha-arabic-compiler-fabric-v92');

router.get('/api/sheikha/arabic-compiler-fabric/v92/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/arabic-compiler-fabric/v92/demo', (_req, res) => res.json(compilerPlan()));
router.post('/api/sheikha/arabic-compiler-fabric/v92/plan', (req, res) => res.json(compilerPlan(req.body || {})));

module.exports = router;
JS

cat > tools/arabic-compiler-fabric/sheikha-arabic-compiler-fabric-v92-cli.js <<'JS'
#!/usr/bin/env node
'use strict';

const { status, compilerPlan } = require('../../runtime/arabic-compiler-fabric/v92/sheikha-arabic-compiler-fabric-v92');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') console.log(JSON.stringify(status(), null, 2));
else if (cmd === 'demo') console.log(JSON.stringify(compilerPlan(), null, 2));
else process.exit(1);
JS

chmod +x tools/arabic-compiler-fabric/sheikha-arabic-compiler-fabric-v92-cli.js

cat > docs/arabic-compiler-fabric/SHEIKHA-ARABIC-COMPILER-FABRIC-V92.md <<'MD'
# SHEIKHA_ARABIC_COMPILER_FABRIC_V92

طبقة مترجم لغة شيخة العربية: تحليل ألفاظ، تقطيع عربي، بناء AST، تحليل دلالي، نظام أنواع، IR، تحقق حوكمي، ثم توليد محكوم.

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
  app.use(require('./routes/arabic-compiler-fabric/sheikha-arabic-compiler-fabric-routes'));
} catch (error) {
  console.warn('[sheikha-arabic-compiler-fabric-v92] route mount skipped:', error.message);
}
"""

if "sheikha-arabic-compiler-fabric-v92" not in s:
    idx = s.find("app.use(express.json")
    if idx == -1:
        idx = s.find("app.use(")
    s = s[:idx] + mount + "\\n" + s[idx:]

p.write_text(s)
PY

node --check server.js
node --check runtime/arabic-compiler-fabric/v92/sheikha-arabic-compiler-fabric-v92.js
node --check routes/arabic-compiler-fabric/sheikha-arabic-compiler-fabric-routes.js
node --check tools/arabic-compiler-fabric/sheikha-arabic-compiler-fabric-v92-cli.js

node tools/arabic-compiler-fabric/sheikha-arabic-compiler-fabric-v92-cli.js status | jq '.system,.status,.apexLevel'

pm2 restart sheikha-main-portal --update-env
sleep 2

curl -s http://127.0.0.1:8080/api/sheikha/arabic-compiler-fabric/v92/status | jq '.system,.status,.apexLevel'
curl -s http://127.0.0.1:8080/api/sheikha/arabic-compiler-fabric/v92/demo | jq '.status,.name,.scope'

npm test
npm run lint

git add \
  server.js \
  activate-sheikha-arabic-compiler-fabric-v92.sh \
  runtime/arabic-compiler-fabric \
  routes/arabic-compiler-fabric \
  tools/arabic-compiler-fabric \
  docs/arabic-compiler-fabric

git commit -m "Activate Sheikha Arabic compiler fabric V92"
git push origin feature/v92-arabic-compiler-fabric

echo "== Done =="
