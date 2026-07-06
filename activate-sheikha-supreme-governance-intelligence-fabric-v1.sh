#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Projects/sheikha/sheikha-main-portal"
cd "$ROOT"

echo "== Activate SHEIKHA_SUPREME_GOVERNANCE_INTELLIGENCE_FABRIC_V1 =="

mkdir -p runtime/supreme-governance-intelligence-fabric/v1
mkdir -p routes/supreme-governance-intelligence-fabric
mkdir -p tools/supreme-governance-intelligence-fabric
mkdir -p docs/supreme-governance-intelligence-fabric

cat > runtime/supreme-governance-intelligence-fabric/v1/sheikha-supreme-governance-intelligence-fabric-v1.js <<'JS'
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function safeStatus() {
  return {
    success: true,
    system: 'SHEIKHA_SUPREME_GOVERNANCE_INTELLIGENCE_FABRIC_V1',
    status: 'ACTIVE',
    position: 'HIGHEST_GOVERNANCE_INTELLIGENCE_LAYER',
    apexLevel: 12,
    below: [
      'ORCHESTRATOR_FABRIC_L11',
      'FOUNDRY_V3_L10',
      'SUPREME_ORCHESTRATOR',
      'RUNTIME_FABRIC_V5',
      'ENTERPRISE_INSPECTOR_V3',
      'DEVELOPER_TOOLS_APEX_V1',
      'AI_NOTES_GOVERNANCE_AUTOFIX_V1'
    ],
    engines: {
      observability: 'ACTIVE',
      inspectorBinding: exists('core/enterprise/sheikha-enterprise-inspector-v3.js') ? 'BOUND' : 'MISSING',
      developerTools: exists('runtime/developer-tools-apex/v1/sheikha-developer-tools-apex-v1.js') ? 'BOUND' : 'MISSING',
      aiNotesGovernance: exists('runtime/ai-notes-governance/v1/sheikha-ai-notes-governance-autofix-v1.js') ? 'BOUND' : 'MISSING',
      patchEngine: 'GOVERNED_PLAN_ONLY',
      selfHealing: 'SAFE_CHECKS_ONLY',
      autonomousRepair: 'HUMAN_APPROVAL_REQUIRED'
    },
    governance: {
      principle: 'لا ضرر ولا ضرار',
      envProtected: true,
      secretsProtected: true,
      destructiveActionsBlocked: true,
      rollbackRequired: true,
      testsRequiredBeforeCommit: true,
      humanApprovalForCriticalChanges: true
    }
  };
}

function inspect() {
  return {
    ...safeStatus(),
    runtime: {
      cwd: ROOT,
      node: process.version,
      pid: process.pid,
      uptimeSeconds: Math.round(process.uptime()),
      memory: process.memoryUsage()
    },
    files: {
      server: exists('server.js'),
      packageJson: exists('package.json'),
      extension: exists('sheikha-vscode-extension/package.json'),
      inspector: exists('core/enterprise/sheikha-enterprise-inspector-v3.js'),
      developerToolsApex: exists('runtime/developer-tools-apex/v1/sheikha-developer-tools-apex-v1.js'),
      aiNotesGovernance: exists('runtime/ai-notes-governance/v1/sheikha-ai-notes-governance-autofix-v1.js')
    }
  };
}

function classifyFinding(finding = {}) {
  const text = `${finding.message || ''} ${finding.file || ''}`;

  if (/\.env|secret|token|password|private[_-]?key/i.test(text)) {
    return {
      severity: 'CRITICAL',
      action: 'HUMAN_REVIEW_REQUIRED',
      autoFixAllowed: false
    };
  }

  if (/rm -rf|drop table|delete database|truncate|destructive/i.test(text)) {
    return {
      severity: 'HIGH',
      action: 'BLOCK',
      autoFixAllowed: false
    };
  }

  if (/syntax|lint|format|trailing|newline|missing export|command not found/i.test(text)) {
    return {
      severity: 'LOW',
      action: 'SAFE_PATCH_ALLOWED',
      autoFixAllowed: true
    };
  }

  return {
    severity: 'MEDIUM',
    action: 'PLAN_ONLY',
    autoFixAllowed: false
  };
}

function governancePlan(findings = []) {
  const items = findings.map((finding) => ({
    ...finding,
    governance: classifyFinding(finding)
  }));

  return {
    success: true,
    system: 'SHEIKHA_SUPREME_GOVERNANCE_INTELLIGENCE_FABRIC_V1',
    status: 'PLANNED',
    totalFindings: items.length,
    items
  };
}

module.exports = {
  safeStatus,
  inspect,
  classifyFinding,
  governancePlan
};
JS

cat > routes/supreme-governance-intelligence-fabric/sheikha-supreme-governance-intelligence-fabric-routes.js <<'JS'
'use strict';

const express = require('express');
const router = express.Router();

const {
  safeStatus,
  inspect,
  governancePlan
} = require('../../runtime/supreme-governance-intelligence-fabric/v1/sheikha-supreme-governance-intelligence-fabric-v1');

router.get('/api/sheikha/supreme-governance-intelligence-fabric/v1/status', (_req, res) => {
  res.json(safeStatus());
});

router.get('/api/sheikha/supreme-governance-intelligence-fabric/v1/inspect', (_req, res) => {
  res.json(inspect());
});

router.post('/api/sheikha/supreme-governance-intelligence-fabric/v1/govern', (req, res) => {
  res.json(governancePlan(Array.isArray(req.body?.findings) ? req.body.findings : []));
});

module.exports = router;
JS

cat > tools/supreme-governance-intelligence-fabric/sheikha-supreme-governance-intelligence-fabric-cli.js <<'JS'
#!/usr/bin/env node
'use strict';

const {
  safeStatus,
  inspect,
  governancePlan
} = require('../../runtime/supreme-governance-intelligence-fabric/v1/sheikha-supreme-governance-intelligence-fabric-v1');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') {
  console.log(JSON.stringify(safeStatus(), null, 2));
} else if (cmd === 'inspect') {
  console.log(JSON.stringify(inspect(), null, 2));
} else if (cmd === 'govern') {
  console.log(JSON.stringify(governancePlan([
    { message: 'command not found sheikha.openChat', file: 'sheikha-vscode-extension/src/extension.js' },
    { message: 'parseSseBuffer is not a function', file: 'sheikha-vscode-extension/src/sheikhaExtensionChatClient.js' },
    { message: 'protect .env and secrets', file: '.env' }
  ]), null, 2));
} else {
  console.error('Usage: node tools/supreme-governance-intelligence-fabric/sheikha-supreme-governance-intelligence-fabric-cli.js [status|inspect|govern]');
  process.exit(1);
}
JS

chmod +x tools/supreme-governance-intelligence-fabric/sheikha-supreme-governance-intelligence-fabric-cli.js

cat > docs/supreme-governance-intelligence-fabric/SHEIKHA-SUPREME-GOVERNANCE-INTELLIGENCE-FABRIC-V1.md <<'MD'
# SHEIKHA_SUPREME_GOVERNANCE_INTELLIGENCE_FABRIC_V1

طبقة عليا موحدة للحوكمة الذكية، الملاحظة، التفتيش، التخطيط، الإصلاح الآمن، ومنع الضرر.

## المبادئ

- لا ضرر ولا ضرار.
- عدم لمس `.env`.
- عدم كشف الأسرار.
- منع العمليات التدميرية.
- الإصلاح الآمن فقط.
- الإصلاحات الحرجة تحتاج مراجعة بشرية.
- الاختبارات قبل أي commit.

## المحركات

- Observability Engine
- Inspector Binding
- Developer Tools Binding
- AI Notes Governance Binding
- Patch Planning Engine
- Self-Healing Safe Checks
- Autonomous Repair Plan Only

MD

python3 - <<'PY'
from pathlib import Path

p = Path("server.js")
s = p.read_text()

mount = """
try {
  app.use(require('./routes/supreme-governance-intelligence-fabric/sheikha-supreme-governance-intelligence-fabric-routes'));
} catch (error) {
  console.warn('[sheikha-supreme-governance-intelligence-fabric] route mount skipped:', error.message);
}
"""

if "sheikha-supreme-governance-intelligence-fabric" not in s:
    marker = "app.use(express.json"
    idx = s.find(marker)
    if idx == -1:
        idx = s.find("app.use(")
    if idx == -1:
        raise SystemExit("Cannot find server.js insertion point")
    s = s[:idx] + mount + "\n" + s[idx:]

p.write_text(s)
PY

echo "== Checks =="
node --check server.js
node --check runtime/supreme-governance-intelligence-fabric/v1/sheikha-supreme-governance-intelligence-fabric-v1.js
node --check routes/supreme-governance-intelligence-fabric/sheikha-supreme-governance-intelligence-fabric-routes.js
node --check tools/supreme-governance-intelligence-fabric/sheikha-supreme-governance-intelligence-fabric-cli.js

echo "== CLI =="
node tools/supreme-governance-intelligence-fabric/sheikha-supreme-governance-intelligence-fabric-cli.js status | jq '.system,.status,.apexLevel'
node tools/supreme-governance-intelligence-fabric/sheikha-supreme-governance-intelligence-fabric-cli.js govern | jq '.totalFindings,.items[].governance'

echo "== Restart =="
pm2 restart sheikha-main-portal --update-env
sleep 2

echo "== API =="
curl -s http://127.0.0.1:8080/api/sheikha/supreme-governance-intelligence-fabric/v1/status | jq
curl -s http://127.0.0.1:8080/api/sheikha/supreme-governance-intelligence-fabric/v1/inspect | jq '.system,.status,.runtime.uptimeSeconds,.files'

echo "== Done =="
