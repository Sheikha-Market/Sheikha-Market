#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Projects/sheikha/sheikha-main-portal"
cd "$ROOT"

echo "== Activate Sheikha AI Notes Governance AutoFix V1 =="

mkdir -p runtime/ai-notes-governance/v1
mkdir -p routes/ai-notes-governance
mkdir -p tools/ai-notes-governance
mkdir -p reports/ai-notes-governance

cat > runtime/ai-notes-governance/v1/sheikha-ai-notes-governance-autofix-v1.js <<'JS'
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, 'reports', 'ai-notes-governance');

const SAFE_FIX_PATTERNS = [
  {
    id: 'REMOVE_TRAILING_SPACES',
    description: 'Remove trailing whitespace',
    apply: (s) => s.replace(/[ \t]+$/gm, '')
  },
  {
    id: 'ENSURE_FINAL_NEWLINE',
    description: 'Ensure final newline',
    apply: (s) => s.endsWith('\n') ? s : `${s}\n`
  },
  {
    id: 'NORMALIZE_CRLF',
    description: 'Normalize CRLF to LF',
    apply: (s) => s.replace(/\r\n/g, '\n')
  }
];

const BLOCKED_PATHS = [
  '.env',
  '.env.local',
  '.env.production',
  '.env.development',
  'node_modules',
  '.git',
  'dist',
  'coverage'
];

function isBlocked(file) {
  return BLOCKED_PATHS.some((x) => file === x || file.includes(`/${x}/`) || file.endsWith(`/${x}`));
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;

  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const rel = path.relative(ROOT, full);

    if (isBlocked(rel)) continue;

    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walk(full, out);
    } else if (/\.(js|json|md|txt|sh|yml|yaml|php|css|html)$/.test(item)) {
      out.push(full);
    }
  }

  return out;
}

function classifyNote(text = '') {
  const value = String(text);

  if (/secret|password|token|api[_-]?key|private[_-]?key|\.env/i.test(value)) {
    return {
      severity: 'CRITICAL',
      governedAction: 'HUMAN_REVIEW_REQUIRED',
      autoFixAllowed: false,
      reason: 'Potential secret or environment-sensitive note'
    };
  }

  if (/delete|remove database|drop table|rm -rf|truncate/i.test(value)) {
    return {
      severity: 'HIGH',
      governedAction: 'BLOCK_DESTRUCTIVE_AUTOFIX',
      autoFixAllowed: false,
      reason: 'Destructive action detected'
    };
  }

  if (/lint|format|trailing|newline|syntax|typo|comment|spacing/i.test(value)) {
    return {
      severity: 'LOW',
      governedAction: 'SAFE_AUTOFIX_ALLOWED',
      autoFixAllowed: true,
      reason: 'Safe formatting or lint-class note'
    };
  }

  return {
    severity: 'MEDIUM',
    governedAction: 'ANALYZE_ONLY',
    autoFixAllowed: false,
    reason: 'Requires semantic review'
  };
}

function analyzeRepository() {
  const files = walk(ROOT);
  const notes = [];

  for (const file of files) {
    const rel = path.relative(ROOT, file);
    let content = '';

    try {
      content = fs.readFileSync(file, 'utf8');
    } catch {
      continue;
    }

    const lines = content.split('\n');

    lines.forEach((line, idx) => {
      if (/(TODO|FIXME|NOTE|HACK|ملاحظة|اصلح|إصلاح|تحسين)/i.test(line)) {
        const classification = classifyNote(line);
        notes.push({
          file: rel,
          line: idx + 1,
          note: line.trim(),
          ...classification
        });
      }
    });
  }

  return {
    success: true,
    system: 'SHEIKHA_AI_NOTES_GOVERNANCE_AUTOFIX_V1',
    status: 'ANALYZED',
    governance: {
      principle: 'لا ضرر ولا ضرار',
      secretsProtected: true,
      envProtected: true,
      destructiveActionsBlocked: true,
      humanReviewForSemanticChanges: true
    },
    totalNotes: notes.length,
    notes
  };
}

function applySafeAutofix() {
  const files = walk(ROOT);
  const changed = [];

  for (const file of files) {
    const rel = path.relative(ROOT, file);
    if (isBlocked(rel)) continue;

    let before = '';
    try {
      before = fs.readFileSync(file, 'utf8');
    } catch {
      continue;
    }

    let after = before;
    for (const fix of SAFE_FIX_PATTERNS) {
      after = fix.apply(after);
    }

    if (after !== before) {
      fs.writeFileSync(file, after);
      changed.push({
        file: rel,
        fixes: SAFE_FIX_PATTERNS.map((x) => x.id)
      });
    }
  }

  return {
    success: true,
    system: 'SHEIKHA_AI_NOTES_GOVERNANCE_AUTOFIX_V1',
    status: 'SAFE_AUTOFIX_APPLIED',
    changedCount: changed.length,
    changed
  };
}

function writeReport(data, name = 'ai-notes-governance-report.json') {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const target = path.join(REPORT_DIR, name);
  fs.writeFileSync(target, JSON.stringify(data, null, 2));
  return target;
}

function runGovernedAutofix() {
  const analysis = analyzeRepository();
  const autofix = applySafeAutofix();
  const finalAnalysis = analyzeRepository();

  const result = {
    success: true,
    system: 'SHEIKHA_AI_NOTES_GOVERNANCE_AUTOFIX_V1',
    status: 'ACTIVE',
    analysisBefore: analysis,
    autofix,
    analysisAfter: finalAnalysis,
    reportPath: null
  };

  result.reportPath = writeReport(result);

  return result;
}

module.exports = {
  classifyNote,
  analyzeRepository,
  applySafeAutofix,
  runGovernedAutofix
};
JS

cat > routes/ai-notes-governance/sheikha-ai-notes-governance-routes.js <<'JS'
'use strict';

const express = require('express');
const router = express.Router();

const {
  analyzeRepository,
  runGovernedAutofix
} = require('../../runtime/ai-notes-governance/v1/sheikha-ai-notes-governance-autofix-v1');

router.get('/api/sheikha/ai-notes-governance/v1/status', (_req, res) => {
  res.json({
    success: true,
    system: 'SHEIKHA_AI_NOTES_GOVERNANCE_AUTOFIX_V1',
    status: 'ACTIVE',
    capabilities: [
      'NOTE_ANALYSIS',
      'GOVERNANCE_CLASSIFICATION',
      'SAFE_AUTOFIX',
      'SECRET_PROTECTION',
      'ENV_PROTECTION',
      'DESTRUCTIVE_ACTION_BLOCKING',
      'REPORTING'
    ]
  });
});

router.post('/api/sheikha/ai-notes-governance/v1/analyze', (_req, res) => {
  res.json(analyzeRepository());
});

router.post('/api/sheikha/ai-notes-governance/v1/autofix', (_req, res) => {
  res.json(runGovernedAutofix());
});

module.exports = router;
JS

cat > tools/ai-notes-governance/sheikha-ai-notes-governance-cli.js <<'JS'
#!/usr/bin/env node
'use strict';

const {
  analyzeRepository,
  runGovernedAutofix
} = require('../../runtime/ai-notes-governance/v1/sheikha-ai-notes-governance-autofix-v1');

const cmd = process.argv[2] || 'analyze';

if (cmd === 'analyze') {
  console.log(JSON.stringify(analyzeRepository(), null, 2));
} else if (cmd === 'autofix') {
  console.log(JSON.stringify(runGovernedAutofix(), null, 2));
} else {
  console.error('Usage: node tools/ai-notes-governance/sheikha-ai-notes-governance-cli.js [analyze|autofix]');
  process.exit(1);
}
JS

chmod +x tools/ai-notes-governance/sheikha-ai-notes-governance-cli.js

python3 - <<'PY'
from pathlib import Path

p = Path("server.js")
s = p.read_text()

mount = """
try {
  app.use(require('./routes/ai-notes-governance/sheikha-ai-notes-governance-routes'));
} catch (error) {
  console.warn('[sheikha-ai-notes-governance] route mount skipped:', error.message);
}
"""

if "sheikha-ai-notes-governance" not in s:
    marker = "app.use(express.json"
    idx = s.find(marker)
    if idx == -1:
        idx = s.find("app.use(")
    if idx == -1:
        raise SystemExit("Cannot find server.js insertion point")
    s = s[:idx] + mount + "\n" + s[idx:]

p.write_text(s)
PY

echo "== Syntax checks =="
node --check server.js
node --check runtime/ai-notes-governance/v1/sheikha-ai-notes-governance-autofix-v1.js
node --check routes/ai-notes-governance/sheikha-ai-notes-governance-routes.js
node --check tools/ai-notes-governance/sheikha-ai-notes-governance-cli.js

echo "== Run analysis =="
node tools/ai-notes-governance/sheikha-ai-notes-governance-cli.js analyze \
  > reports/ai-notes-governance/latest-analysis.json

echo "== Run safe autofix =="
node tools/ai-notes-governance/sheikha-ai-notes-governance-cli.js autofix \
  > reports/ai-notes-governance/latest-autofix.json

echo "== Restart server =="
pm2 restart sheikha-main-portal --update-env
sleep 2

echo "== API tests =="
curl -s http://127.0.0.1:8080/api/sheikha/ai-notes-governance/v1/status | jq
curl -s -X POST http://127.0.0.1:8080/api/sheikha/ai-notes-governance/v1/analyze | jq '.system,.status,.totalNotes'

echo "== Git status =="
git status --short

echo "== Done =="
