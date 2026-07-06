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

    let stat;
    try {
      stat = fs.lstatSync(full);
    } catch {
      continue;
    }

    if (stat.isSymbolicLink()) continue;

    if (stat.isDirectory()) {
      walk(full, out);
    } else if (stat.isFile() && /\.(js|json|md|txt|sh|yml|yaml|php|css|html)$/.test(item)) {
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
