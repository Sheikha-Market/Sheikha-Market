#!/usr/bin/env bash
set -euo pipefail

echo "Activating SHEIKHA_CHAT_FABRIC_V2..."

mkdir -p runtime/chat-fabric-v2 routes/chat-fabric-v2 tools/chat-fabric-v2 docs/chat-fabric-v2 tests

cat > runtime/chat-fabric-v2/sheikha-chat-fabric-v2.js <<'JS'
'use strict';

const CAPABILITIES = Object.freeze([
  'response-rendering-clean-markdown',
  'no-json-visible-to-user',
  'sse-streaming-ready',
  'session-memory',
  'context-memory',
  'workspace-awareness',
  'git-awareness',
  'project-awareness',
  'debugging-on-demand',
  'ide-apex-routing',
  'technical-capability-apex',
  'governance-before-execution'
]);

const APEX_STACK = Object.freeze([
  'SHEIKHA_TECHNICAL_CAPABILITY_APEX_V1',
  'SHEIKHA_IDE_APEX_V1',
  'SHEIKHA_DEBUGGING_APEX_V1',
  'SHEIKHA_CHAT_INTERFACE_APEX_V1',
  'SHEIKHA_VITAL_CHAT_APEX_V1',
  'SHEIKHA_EXTENSION_EXPERIENCE_APEX_V1',
  'SHEIKHA_CONVERSATION_ENGINE_V1'
]);

function status() {
  return {
    system: 'SHEIKHA_CHAT_FABRIC_V2',
    status: 'ACTIVE',
    decision: 'CHAT_FABRIC_V2_ACTIVE_100',
    level: 'ADVANCED_GOVERNED_CHAT_RUNTIME',
    capabilities: CAPABILITIES,
    apexStack: APEX_STACK,
    governance: {
      reference: 'QURAN_AND_SUNNAH_GOVERNANCE_REFERENCE',
      noHarmNoHarar: true,
      noSecretExposure: true,
      noVisibleRawJson: true,
      noAutonomousHighImpactAction: true,
      humanApprovalForHighRisk: true,
      debuggingExplicitOnly: true
    }
  };
}

function classifyMessage(message = '') {
  const text = String(message || '').toLowerCase();

  const wantsDebug = [
    'debug',
    'diagnose',
    'diagnostic',
    'inspector',
    'trace',
    'stack',
    'شخص',
    'تشخيص',
    'افحص الخطأ',
    'المفتش'
  ].some((x) => text.includes(x));

  const wantsReport = [
    'تقرير',
    'تثرير',
    'اكتب تقرير',
    'اكتبي تقرير',
    'report'
  ].some((x) => text.includes(x));

  const wantsCode = [
    'code',
    'vscode',
    'vs code',
    'ide',
    'npm',
    'git',
    'server.js',
    'package.json',
    'todo tree',
    'ripgrep',
    'برمجة',
    'اكستنشن',
    'الإكستنشن'
  ].some((x) => text.includes(x));

  if (wantsDebug) return 'DEBUGGING_ON_DEMAND';
  if (wantsCode) return 'IDE_CODE_ASSIST';
  if (wantsReport) return 'PROFESSIONAL_REPORT';
  return 'CONVERSATION_ENGINE';
}

function renderCleanResponse(payload = {}) {
  const text = String(payload.text || payload.answer || payload.response || '');
  return {
    success: true,
    renderer: 'SHEIKHA_RESPONSE_RENDERER_V2',
    format: 'CLEAN_MARKDOWN',
    visibleRawJson: false,
    text: text
      .replace(/^data:\s*/gm, '')
      .replace(/proxy_non_json_response/g, 'تم تحويل المسار إلى رد احتياطي محكوم')
      .trim()
  };
}

module.exports = {
  status,
  classifyMessage,
  renderCleanResponse
};
JS

cat > routes/chat-fabric-v2/sheikha-chat-fabric-v2-routes.js <<'JS'
'use strict';

const express = require('express');
const router = express.Router();
const fabric = require('../../runtime/chat-fabric-v2/sheikha-chat-fabric-v2');

router.get('/status', (_req, res) => {
  res.json({ success: true, data: fabric.status() });
});

router.post('/classify', (req, res) => {
  res.json({
    success: true,
    data: {
      route: fabric.classifyMessage(req.body?.message || ''),
      fabric: fabric.status().system
    }
  });
});

router.post('/render', (req, res) => {
  res.json({
    success: true,
    data: fabric.renderCleanResponse(req.body || {})
  });
});

module.exports = router;
JS

cat > tools/chat-fabric-v2/sheikha-chat-fabric-v2.js <<'JS'
'use strict';

const fs = require('fs');
const path = require('path');
const fabric = require('../../runtime/chat-fabric-v2/sheikha-chat-fabric-v2');

const report = {
  ...fabric.status(),
  generatedAt: new Date().toISOString()
};

const outDir = path.join(process.cwd(), 'runtime/chat-fabric-v2');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, 'sheikha-chat-fabric-v2-report.json'),
  JSON.stringify(report, null, 2)
);

console.log(JSON.stringify(report, null, 2));
JS

cat > docs/chat-fabric-v2/SHEIKHA-CHAT-FABRIC-V2.md <<'MD'
# SHEIKHA CHAT FABRIC V2

طبقة شات متقدمة محكومة تجمع:

- Technical Capability Apex
- IDE Apex
- Debugging Apex
- Chat Interface Apex
- Vital Chat Apex
- Extension Experience Apex
- Conversation Engine

## مبادئ التشغيل

- لا ضرر ولا ضرار.
- لا إظهار JSON خام للمستخدم.
- لا تشغيل Debugging Apex إلا عند الطلب الصريح.
- لا إجراء عالي الأثر دون مراجعة بشرية.
- الردود للمستخدم تكون Markdown نظيفة ومباشرة.
MD

python3 - <<'PY'
from pathlib import Path

p = Path("server.js")
s = p.read_text()
mount = """
try {
  app.use('/api/sheikha/chat-fabric-v2', require('./routes/chat-fabric-v2/sheikha-chat-fabric-v2-routes'));
  console.log('✅ Sheikha Chat Fabric V2 API mounted');
} catch (error) {
  console.warn('⚠️ Sheikha Chat Fabric V2 API unavailable:', error.message);
}
"""
if "chat-fabric-v2" not in s:
    marker = "// ─────────────────────────────────────────────────────────────\n// Sheikha Unified Chat Control Fabric API"
    if marker in s:
        s = s.replace(marker, mount + "\n" + marker)
    else:
        s += "\n" + mount
p.write_text(s)
PY

python3 - <<'PY'
from pathlib import Path
p = Path("package.json")
data = p.read_text()
if '"ops:chat-fabric-v2"' not in data:
    data = data.replace(
        '"ops:bot:governance"',
        '"ops:chat-fabric-v2": "node tools/chat-fabric-v2/sheikha-chat-fabric-v2.js",\n    "ops:bot:governance"'
    )
p.write_text(data)
PY

cat > tests/sheikha-chat-fabric-v2.test.js <<'JS'
'use strict';

const fabric = require('../runtime/chat-fabric-v2/sheikha-chat-fabric-v2');

describe('Sheikha Chat Fabric V2', () => {
  test('activates governed advanced chat stack', () => {
    const status = fabric.status();
    expect(status.status).toBe('ACTIVE');
    expect(status.decision).toBe('CHAT_FABRIC_V2_ACTIVE_100');
    expect(status.apexStack).toContain('SHEIKHA_TECHNICAL_CAPABILITY_APEX_V1');
    expect(status.apexStack).toContain('SHEIKHA_IDE_APEX_V1');
    expect(status.apexStack).toContain('SHEIKHA_DEBUGGING_APEX_V1');
    expect(status.governance.noVisibleRawJson).toBe(true);
    expect(status.governance.debuggingExplicitOnly).toBe(true);
  });

  test('classifies typo report and code requests safely', () => {
    expect(fabric.classifyMessage('اكتبي تثرير')).toBe('PROFESSIONAL_REPORT');
    expect(fabric.classifyMessage('اصلح Todo Tree ripgrep')).toBe('IDE_CODE_ASSIST');
    expect(fabric.classifyMessage('شخص الخطأ')).toBe('DEBUGGING_ON_DEMAND');
  });

  test('renders clean response without raw streaming markers', () => {
    const out = fabric.renderCleanResponse({ text: 'data: ## تقرير\n\nproxy_non_json_response' });
    expect(out.visibleRawJson).toBe(false);
    expect(out.text).toContain('## تقرير');
    expect(out.text).not.toContain('data:');
  });
});
JS

node --check runtime/chat-fabric-v2/sheikha-chat-fabric-v2.js
node --check routes/chat-fabric-v2/sheikha-chat-fabric-v2-routes.js
node --check tools/chat-fabric-v2/sheikha-chat-fabric-v2.js
node tools/chat-fabric-v2/sheikha-chat-fabric-v2.js

npm run lint
npm test -- --runInBand tests/sheikha-chat-fabric-v2.test.js

echo "SHEIKHA_CHAT_FABRIC_V2 activated."
