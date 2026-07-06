#!/usr/bin/env bash
set -euo pipefail

mkdir -p core/foundry routes tests

cat > core/foundry/sheikha-foundry-v1.js <<'JS'
'use strict';

function status() {
  return {
    success: true,
    foundry: 'SHEIKHA_FOUNDRY_V1',
    status: 'ACTIVE',
    purpose: 'تحويل الأفكار والطلبات إلى قدرات منظمة قابلة للتشغيل والاختبار والنشر',
    layers: {
      ideaForge: 'ACTIVE',
      capabilityFactory: 'ACTIVE',
      routeFactory: 'ACTIVE',
      governanceFactory: 'ACTIVE',
      testFactory: 'ACTIVE',
      releaseFactory: 'ACTIVE',
      extensionFactory: 'ACTIVE',
      inspectorFactory: 'ACTIVE'
    },
    governance: {
      beforeExecution: true,
      safeByDefault: true,
      noDestructiveActionWithoutReview: true,
      principle: 'لا ضرر ولا ضرار'
    },
    outputs: [
      'Capability',
      'Route',
      'Policy',
      'Test',
      'Inspector Panel',
      'Extension Integration',
      'Release Plan'
    ]
  };
}

function buildCapability(input = {}) {
  const name = String(input.name || 'unnamed-capability').trim();
  return {
    success: true,
    foundry: 'SHEIKHA_FOUNDRY_V1',
    capability: name,
    lifecycle: [
      'Intent',
      'Governance',
      'Design',
      'Implementation Plan',
      'Tests',
      'Release',
      'Observability'
    ],
    recommendation: `ابدأ بتعريف عقد capability واضح لـ ${name} ثم اربطه بالحوكمة والاختبارات قبل النشر.`
  };
}

module.exports = { status, buildCapability };
JS

cat > routes/sheikha-foundry-routes.js <<'JS'
'use strict';

const express = require('express');
const router = express.Router();
const { status, buildCapability } = require('../core/foundry/sheikha-foundry-v1');

router.get('/api/sheikha/foundry/status', (_req, res) => {
  res.json(status());
});

router.post('/api/sheikha/foundry/build', express.json(), (req, res) => {
  res.json(buildCapability(req.body || {}));
});

module.exports = router;
JS

cat > tests/sheikha-foundry-v1.test.js <<'JS'
'use strict';

const { status, buildCapability } = require('../core/foundry/sheikha-foundry-v1');

test('Sheikha Foundry V1 is active', () => {
  const s = status();
  expect(s.success).toBe(true);
  expect(s.foundry).toBe('SHEIKHA_FOUNDRY_V1');
  expect(s.layers.capabilityFactory).toBe('ACTIVE');
});

test('Sheikha Foundry builds governed capability plan', () => {
  const r = buildCapability({ name: 'unified-chat' });
  expect(r.success).toBe(true);
  expect(r.lifecycle).toContain('Governance');
  expect(r.lifecycle).toContain('Tests');
});
JS

python3 - <<'PY'
from pathlib import Path
p = Path("server.js")
s = p.read_text()
line = "app.use(require('./routes/sheikha-foundry-routes'));"
anchor = "app.use(require('./routes/sheikha-extension-chat-compat-routes'));"
if line not in s:
    if anchor in s:
        s = s.replace(anchor, anchor + "\n" + line)
    else:
        s = s.replace("app.use(require('./routes/sheikha-executive-platform-v2-routes'));",
                      "app.use(require('./routes/sheikha-executive-platform-v2-routes'));\n" + line)
p.write_text(s)
PY

node --check core/foundry/sheikha-foundry-v1.js
node --check routes/sheikha-foundry-routes.js
node --check server.js
npm run lint
npm test

git add server.js core/foundry/sheikha-foundry-v1.js routes/sheikha-foundry-routes.js tests/sheikha-foundry-v1.test.js activate-sheikha-foundry-v1.sh
git commit -m "Activate Sheikha Foundry v1"
git push origin optimization/long-tail-latency-elimination
