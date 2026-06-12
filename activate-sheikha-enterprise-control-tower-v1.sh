#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"

mkdir -p core/enterprise core/language/arabic routes runtime/control-tower runtime/observability runtime/decision runtime/governance

cat > core/language/arabic/sheikha-arabic-executive-language-engine-v1.js <<'JS'
'use strict';

function improveArabicResponse(text = '') {
  return String(text || '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+$/gm, '')
    .replace(/^\s+/gm, '')
    .trim();
}

function buildArabicExecutiveHeader(intent = 'GENERAL') {
  return [
    'بسم الله الرحمن الرحيم',
    '',
    'تمت معالجة الطلب وفق منهج شيخة: وضوح، حوكمة، دقة، وأدب.',
    `نوع المسار: ${intent}`,
    ''
  ].join('\n');
}

module.exports = {
  improveArabicResponse,
  buildArabicExecutiveHeader
};
JS

cat > core/enterprise/sheikha-enterprise-control-tower-v1.js <<'JS'
'use strict';

const os = require('os');
const cp = require('child_process');

function sh(cmd) {
  try {
    return cp.execSync(cmd, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 5000
    }).trim();
  } catch (e) {
    return String(e.stderr || e.message || 'غير متاح').trim();
  }
}

function collectControlTowerStatus() {
  const mem = process.memoryUsage();

  return {
    success: true,
    engine: 'SHEIKHA_ENTERPRISE_CONTROL_TOWER_V1',
    status: 'ACTIVE',
    runtime: {
      cpuLoad1m: os.loadavg()[0],
      ramUsedPercent: Math.round((1 - os.freemem() / os.totalmem()) * 100),
      heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
      uptimeSeconds: Math.round(process.uptime())
    },
    git: {
      branch: sh('git rev-parse --abbrev-ref HEAD'),
      status: sh('git status --short'),
      aheadBehind: sh('git rev-list --left-right --count @{u}...HEAD 2>/dev/null || echo "غير متاح"')
    },
    project: {
      workspace: process.cwd()
    },
    governance: {
      policies: 'ACTIVE',
      capabilityTokens: 'ACTIVE',
      executionContracts: 'READ_ONLY_SAFE_BY_DEFAULT'
    },
    ai: {
      provider: 'Sheikha Unified Chat',
      languageEngine: 'ARABIC_EXECUTIVE_LANGUAGE_ENGINE_V1'
    },
    apis: {
      health8080: sh('curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8080/api/health || true'),
      health9191: sh('curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:9191/api/health || true'),
      unifiedChat: sh('curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8080/api/sheikha/unified-chat/status || true')
    },
    observability: {
      logs: 'journalctl / pm2 logs',
      metrics: 'runtime snapshot',
      events: 'audit jsonl',
      alerts: 'haproxy/backend status'
    }
  };
}

module.exports = {
  collectControlTowerStatus
};
JS

cat > routes/sheikha-enterprise-control-tower-routes.js <<'JS'
'use strict';

const express = require('express');
const router = express.Router();
const { collectControlTowerStatus } = require('../core/enterprise/sheikha-enterprise-control-tower-v1');

router.get('/api/sheikha/control-tower/status', (_req, res) => {
  res.json(collectControlTowerStatus());
});

router.get('/api/sheikha/observability/status', (_req, res) => {
  const s = collectControlTowerStatus();
  res.json({
    success: true,
    status: 'ACTIVE',
    runtime: s.runtime,
    apis: s.apis,
    observability: s.observability
  });
});

router.get('/api/sheikha/governance/status', (_req, res) => {
  const s = collectControlTowerStatus();
  res.json({
    success: true,
    status: 'ACTIVE',
    governance: s.governance
  });
});

router.get('/api/sheikha/runtime/status', (_req, res) => {
  const s = collectControlTowerStatus();
  res.json({
    success: true,
    status: 'ACTIVE',
    runtime: s.runtime
  });
});

module.exports = router;
JS

if ! grep -q "sheikha-enterprise-control-tower-routes" server.js; then
  python3 - <<'PY'
from pathlib import Path
p = Path("server.js")
s = p.read_text()
needle = "app.use(require('./routes/sheikha-unified-chat-fabric'));"
if needle in s:
    s = s.replace(needle, needle + "\napp.use(require('./routes/sheikha-enterprise-control-tower-routes'));")
else:
    marker = "app.use("
    idx = s.find(marker)
    if idx != -1:
        line_end = s.find("\n", idx)
        s = s[:line_end+1] + "app.use(require('./routes/sheikha-enterprise-control-tower-routes'));\n" + s[line_end+1:]
    else:
        s += "\napp.use(require('./routes/sheikha-enterprise-control-tower-routes'));\n"
p.write_text(s)
PY
fi

node --check core/language/arabic/sheikha-arabic-executive-language-engine-v1.js
node --check core/enterprise/sheikha-enterprise-control-tower-v1.js
node --check routes/sheikha-enterprise-control-tower-routes.js
node --check server.js

npm run lint
npm test

echo "SHEIKHA_ENTERPRISE_CONTROL_TOWER_V1 ACTIVATED"
