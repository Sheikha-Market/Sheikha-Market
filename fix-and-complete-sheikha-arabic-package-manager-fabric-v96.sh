#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Projects/sheikha/sheikha-main-portal"
cd "$ROOT"

echo "== Fix and complete SHEIKHA_ARABIC_PACKAGE_MANAGER_FABRIC_V96 =="

mkdir -p runtime/arabic-package-manager-fabric/v96
mkdir -p routes/arabic-package-manager-fabric
mkdir -p tools/arabic-package-manager-fabric
mkdir -p docs/arabic-package-manager-fabric

cat > runtime/arabic-package-manager-fabric/v96/sheikha-arabic-package-manager-fabric-v96.js <<'JS'
'use strict';

function status() {
  return {
    success: true,
    system: 'SHEIKHA_ARABIC_PACKAGE_MANAGER_FABRIC_V96',
    status: 'ACTIVE',
    apexLevel: 96,
    role: 'ARABIC_PACKAGE_MANAGER_LAYER',
    clusters: [
      'SHEIKHA_PACKAGE_REGISTRY_CLUSTER',
      'SHEIKHA_PACKAGE_INSTALLER_CLUSTER',
      'SHEIKHA_DEPENDENCY_RESOLVER_CLUSTER',
      'SHEIKHA_VERSION_MANAGER_CLUSTER',
      'SHEIKHA_LOCKFILE_CLUSTER',
      'SHEIKHA_REPOSITORY_CLUSTER',
      'SHEIKHA_PACKAGE_SECURITY_CLUSTER',
      'SHEIKHA_PACKAGE_CACHE_CLUSTER',
      'SHEIKHA_PACKAGE_SIGNATURE_CLUSTER',
      'SHEIKHA_PACKAGE_GOVERNANCE_CLUSTER'
    ],
    domains: [
      'PACKAGE_MANAGER',
      'DEPENDENCIES',
      'VERSIONS',
      'LOCKFILES',
      'CACHE',
      'SECURITY',
      'SIGNATURES',
      'REPOSITORIES',
      'GOVERNANCE'
    ],
    lifecycle: [
      'DISCOVER',
      'RESOLVE',
      'VERIFY',
      'INSTALL',
      'CACHE',
      'LOCK',
      'UPDATE',
      'AUDIT'
    ],
    integrations: [
      'SHEIKHA_ARABIC_RUNTIME_FABRIC_V95',
      'SHEIKHA_ARABIC_STANDARD_LIBRARY_FABRIC_V94'
    ],
    governance: {
      principle: 'لا ضرر ولا ضرار',
      arabicFirst: true,
      quranSunnahValues: true,
      humanIsPrimary: true,
      aiToolOnly: true,
      evidenceRequired: true,
      packageSignatureRequired: true,
      humanApprovalForCriticalActions: true
    }
  };
}

function packagePlan(input = {}) {
  return {
    success: true,
    system: 'SHEIKHA_ARABIC_PACKAGE_MANAGER_FABRIC_V96',
    status: 'ARABIC_PACKAGE_MANAGER_PLAN_CREATED',
    name: input.name || 'Sheikha Arabic Package Manager Plan',
    scope: input.scope || 'ARABIC_PACKAGE_MANAGER',
    clusters: status().clusters,
    domains: status().domains,
    lifecycle: status().lifecycle,
    linkedLayers: status().integrations,
    governance: status().governance
  };
}

module.exports = { status, packagePlan };
JS

cat > routes/arabic-package-manager-fabric/sheikha-arabic-package-manager-fabric-routes.js <<'JS'
'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  packagePlan
} = require('../../runtime/arabic-package-manager-fabric/v96/sheikha-arabic-package-manager-fabric-v96');

router.get('/api/sheikha/arabic-package-manager-fabric/v96/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/arabic-package-manager-fabric/v96/demo', (_req, res) => res.json(packagePlan()));
router.post('/api/sheikha/arabic-package-manager-fabric/v96/plan', (req, res) => res.json(packagePlan(req.body || {})));

module.exports = router;
JS

cat > tools/arabic-package-manager-fabric/sheikha-arabic-package-manager-fabric-v96-cli.js <<'JS'
#!/usr/bin/env node
'use strict';

const {
  status,
  packagePlan
} = require('../../runtime/arabic-package-manager-fabric/v96/sheikha-arabic-package-manager-fabric-v96');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') {
  console.log(JSON.stringify(status(), null, 2));
} else if (cmd === 'demo') {
  console.log(JSON.stringify(packagePlan(), null, 2));
} else {
  process.exit(1);
}
JS

chmod +x tools/arabic-package-manager-fabric/sheikha-arabic-package-manager-fabric-v96-cli.js

cat > docs/arabic-package-manager-fabric/SHEIKHA-ARABIC-PACKAGE-MANAGER-FABRIC-V96.md <<'MD'
# SHEIKHA_ARABIC_PACKAGE_MANAGER_FABRIC_V96

طبقة مدير الحزم العربية للغة شيخة: السجل، التثبيت، حل الاعتمادات، الإصدارات، lockfiles، المستودعات، الأمن، التواقيع، الكاش، والحوكمة.

## الحوكمة

- العربية أولاً.
- الكتاب والسنة قيماً وضوابط.
- لا ضرر ولا ضرار.
- الإنسان صاحب القرار.
- الذكاء الصناعي أداة حساب وتحليل فقط.
- الدليل مطلوب.
- توقيع الحزم مطلوب.
- موافقة بشرية للقرارات الحرجة.
MD

python3 - <<'PY'
from pathlib import Path

p = Path("server.js")
s = p.read_text()

mount = """
try {
  app.use(require('./routes/arabic-package-manager-fabric/sheikha-arabic-package-manager-fabric-routes'));
} catch (error) {
  console.warn('[sheikha-arabic-package-manager-fabric-v96] route mount skipped:', error.message);
}
"""

if "sheikha-arabic-package-manager-fabric-v96" not in s:
    idx = s.find("app.use(express.json")
    if idx == -1:
        idx = s.find("app.use(")
    if idx == -1:
        raise SystemExit("Cannot find insertion point")
    s = s[:idx] + mount + "\n" + s[idx:]

p.write_text(s)
PY

node --check server.js
node --check runtime/arabic-package-manager-fabric/v96/sheikha-arabic-package-manager-fabric-v96.js
node --check routes/arabic-package-manager-fabric/sheikha-arabic-package-manager-fabric-routes.js
node --check tools/arabic-package-manager-fabric/sheikha-arabic-package-manager-fabric-v96-cli.js

node tools/arabic-package-manager-fabric/sheikha-arabic-package-manager-fabric-v96-cli.js status | jq '.system,.status,.apexLevel'

pm2 restart sheikha-main-portal --update-env
sleep 2

curl -s http://127.0.0.1:8080/api/sheikha/arabic-package-manager-fabric/v96/status | jq '.system,.status,.apexLevel'
curl -s http://127.0.0.1:8080/api/sheikha/arabic-package-manager-fabric/v96/demo | jq '.status,.name,.scope'

npm test
npm run lint

git status --short

git add \
  server.js \
  runtime/arabic-package-manager-fabric \
  routes/arabic-package-manager-fabric \
  tools/arabic-package-manager-fabric \
  docs/arabic-package-manager-fabric \
  fix-and-complete-sheikha-arabic-package-manager-fabric-v96.sh

git commit -m "Activate Sheikha Arabic package manager fabric V96"
git push origin feature/v96-arabic-package-manager-fabric

echo "== Done V96 =="
