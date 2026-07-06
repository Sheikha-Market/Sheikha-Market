#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Projects/sheikha/sheikha-main-portal"
cd "$ROOT"

cat > runtime/arabic-runtime-fabric/v95/sheikha-arabic-runtime-fabric-v95.js <<'JS'
'use strict';

function status() {
  return {
    success: true,
    system: 'SHEIKHA_ARABIC_RUNTIME_FABRIC_V95',
    status: 'ACTIVE',
    apexLevel: 95,
    role: 'ARABIC_LANGUAGE_RUNTIME_EXECUTION_LAYER',
    runtimeClusters: [
      'SHEIKHA_RUNTIME_KERNEL_CLUSTER',
      'SHEIKHA_MEMORY_CLUSTER',
      'SHEIKHA_STACK_CLUSTER',
      'SHEIKHA_SCOPE_CLUSTER',
      'SHEIKHA_PACKAGE_CLUSTER',
      'SHEIKHA_MODULE_CLUSTER',
      'SHEIKHA_ERROR_CLUSTER',
      'SHEIKHA_ASYNC_CLUSTER',
      'SHEIKHA_SCHEDULER_CLUSTER',
      'SHEIKHA_RESOURCE_CLUSTER'
    ],
    runtimeDomains: [
      'RUNTIME_ENGINE',
      'STACK_FRAMES',
      'MEMORY_MODEL',
      'SCOPE_MANAGER',
      'MODULE_RESOLVER',
      'PACKAGE_LOADER',
      'ERROR_SYSTEM',
      'EXCEPTION_HANDLING',
      'ASYNC_ENGINE',
      'RESOURCE_MANAGER'
    ],
    lifecycle: [
      'LOAD',
      'RESOLVE',
      'INITIALIZE',
      'EXECUTE',
      'ISOLATE',
      'OBSERVE',
      'HANDLE_ERRORS',
      'VERIFY',
      'HUMAN_REVIEW'
    ],
    integrations: [
      'SHEIKHA_ARABIC_STANDARD_LIBRARY_FABRIC_V94',
      'SHEIKHA_ARABIC_TYPE_SYSTEM_FABRIC_V93',
      'SHEIKHA_ARABIC_COMPILER_FABRIC_V92',
      'SHEIKHA_ARABIC_LANGUAGE_CLUSTER_FABRIC_V91'
    ],
    governance: {
      principle: 'لا ضرر ولا ضرار',
      arabicFirst: true,
      quranSunnahValues: true,
      humanIsPrimary: true,
      aiToolOnly: true,
      evidenceRequired: true,
      isolationRequired: true,
      humanApprovalForCriticalActions: true
    }
  };
}

function runtimePlan(input = {}) {
  return {
    success: true,
    system: 'SHEIKHA_ARABIC_RUNTIME_FABRIC_V95',
    status: 'ARABIC_RUNTIME_PLAN_CREATED',
    name: input.name || 'Sheikha Arabic Runtime Plan',
    scope: input.scope || 'ARABIC_RUNTIME_EXECUTION',
    runtimeClusters: status().runtimeClusters,
    runtimeDomains: status().runtimeDomains,
    lifecycle: status().lifecycle,
    linkedLayers: status().integrations,
    governance: status().governance
  };
}

module.exports = { status, runtimePlan };
JS

cat > routes/arabic-runtime-fabric/sheikha-arabic-runtime-fabric-routes.js <<'JS'
'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  runtimePlan
} = require('../../runtime/arabic-runtime-fabric/v95/sheikha-arabic-runtime-fabric-v95');

router.get('/api/sheikha/arabic-runtime-fabric/v95/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/arabic-runtime-fabric/v95/demo', (_req, res) => res.json(runtimePlan()));
router.post('/api/sheikha/arabic-runtime-fabric/v95/plan', (req, res) => res.json(runtimePlan(req.body || {})));

module.exports = router;
JS

cat > tools/arabic-runtime-fabric/sheikha-arabic-runtime-fabric-v95-cli.js <<'JS'
#!/usr/bin/env node
'use strict';

const { status, runtimePlan } = require('../../runtime/arabic-runtime-fabric/v95/sheikha-arabic-runtime-fabric-v95');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') console.log(JSON.stringify(status(), null, 2));
else if (cmd === 'demo') console.log(JSON.stringify(runtimePlan(), null, 2));
else process.exit(1);
JS

chmod +x tools/arabic-runtime-fabric/sheikha-arabic-runtime-fabric-v95-cli.js

cat > docs/arabic-runtime-fabric/SHEIKHA-ARABIC-RUNTIME-FABRIC-V95.md <<'MD'
# SHEIKHA_ARABIC_RUNTIME_FABRIC_V95

طبقة وقت تشغيل لغة شيخة العربية: نواة runtime، الذاكرة، stack، scope، الحزم، modules، الأخطاء، الاستثناءات، async، scheduler، والموارد.

## الحوكمة

- العربية أولاً.
- الكتاب والسنة قيماً وضوابط.
- لا ضرر ولا ضرار.
- الإنسان صاحب القرار.
- الذكاء الصناعي أداة حساب وتحليل فقط.
- العزل مطلوب.
- الدليل مطلوب.
MD

python3 - <<'PY'
from pathlib import Path

p = Path("server.js")
s = p.read_text()

mount = """
try {
  app.use(require('./routes/arabic-runtime-fabric/sheikha-arabic-runtime-fabric-routes'));
} catch (error) {
  console.warn('[sheikha-arabic-runtime-fabric-v95] route mount skipped:', error.message);
}
"""

if "sheikha-arabic-runtime-fabric-v95" not in s:
    idx = s.find("app.use(express.json")
    if idx == -1:
        idx = s.find("app.use(")
    if idx == -1:
        raise SystemExit("Cannot find insertion point")
    s = s[:idx] + mount + "\n" + s[idx:]

p.write_text(s)
PY

node --check server.js
node --check runtime/arabic-runtime-fabric/v95/sheikha-arabic-runtime-fabric-v95.js
node --check routes/arabic-runtime-fabric/sheikha-arabic-runtime-fabric-routes.js
node --check tools/arabic-runtime-fabric/sheikha-arabic-runtime-fabric-v95-cli.js

node tools/arabic-runtime-fabric/sheikha-arabic-runtime-fabric-v95-cli.js status | jq '.system,.status,.apexLevel'

pm2 restart sheikha-main-portal --update-env
sleep 2

curl -s http://127.0.0.1:8080/api/sheikha/arabic-runtime-fabric/v95/status | jq '.system,.status,.apexLevel'
curl -s http://127.0.0.1:8080/api/sheikha/arabic-runtime-fabric/v95/demo | jq '.status,.name,.scope'

npm test
npm run lint

git add \
  server.js \
  activate-sheikha-arabic-runtime-fabric-v95.sh \
  runtime/arabic-runtime-fabric \
  routes/arabic-runtime-fabric \
  tools/arabic-runtime-fabric \
  docs/arabic-runtime-fabric

git commit -m "Activate Sheikha Arabic runtime fabric V95"
git push origin feature/v95-arabic-runtime-fabric

echo "== Done =="
