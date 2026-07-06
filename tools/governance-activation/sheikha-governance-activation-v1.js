'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = process.cwd();

function sh(cmd) {
  try {
    return execSync(cmd, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch (err) {
    return {
      error: true,
      command: cmd,
      message: String(err.stderr || err.message || err)
    };
  }
}

function exists(p) {
  return fs.existsSync(path.join(ROOT, p));
}

function readJsonSafe(p) {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
  } catch {
    return null;
  }
}

function listFiles(dir) {
  const base = path.join(ROOT, dir);
  if (!fs.existsSync(base)) return [];
  const out = [];
  function walk(d) {
    for (const item of fs.readdirSync(d)) {
      const full = path.join(d, item);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) walk(full);
      else out.push(path.relative(ROOT, full));
    }
  }
  walk(base);
  return out;
}

const branch = sh('git branch --show-current');
const head = sh('git rev-parse --short HEAD');
const statusShort = sh('git status --short');
const changedFiles = typeof statusShort === 'string' && statusShort
  ? statusShort.split('\n').filter(Boolean)
  : [];

const protectedChecks = {
  architectureFreezeV13: exists('runtime/architecture-freeze/v1.3/sheikha-architecture-freeze-v1.3.json'),
  federalOrganizationV12: exists('runtime/federal-organization/v1.2/sheikha-federal-organization-v1.2.json'),
  prGovernance: exists('runtime/pr-governance/system/sheikha-merge-pr-governance-system-v1.json'),
  patchEngine: exists('runtime/patch-engine/v1/sheikha-patch-engine-v1.json'),
  curatedMergeEngine: exists('runtime/curated-merge-engine/v1/sheikha-curated-merge-engine-v1.json'),
  excellenceScore: exists('runtime/excellence-score/v1/sheikha-excellence-score-v1.json'),
  decisionRegistry: exists('runtime/decision-registry/v1/decision-registry.json'),
  capabilityRegistry: exists('runtime/capability-registry/v1/capability-registry.json'),
  roadmapEngine: exists('runtime/roadmap-engine/v1/roadmap-engine.json'),
  executionFabricV1: exists('runtime/execution-fabric/v1/sheikha-execution-fabric-v1.json'),
  executionFabricV2: exists('runtime/execution-fabric/v2'),
  reportingEngine: exists('runtime/reporting-engine/v1')
};

const runtimeJsonFiles = listFiles('runtime').filter(f => f.endsWith('.json'));
const docsFiles = listFiles('docs');
const toolFiles = listFiles('tools').filter(f => f.endsWith('.js'));

const missingProtected = Object.entries(protectedChecks)
  .filter(([, ok]) => !ok)
  .map(([name]) => name);

const highRiskChanged = changedFiles.filter(line =>
  /server\.js|package-lock\.json|package\.json|routes\/|core\/ai-gateway|\.githooks|runtime\/architecture-freeze|runtime\/pr-governance/.test(line)
);

const decision =
  missingProtected.length > 0 ? 'HOLD_MISSING_PROTECTED_FOUNDATION'
  : highRiskChanged.length > 0 ? 'REVIEW_HIGH_RISK_CHANGES'
  : changedFiles.length > 0 ? 'ALLOW_CURATED_PR_PREPARATION'
  : 'NO_CHANGES_READY_FOR_REPORT_ONLY';

const report = {
  system: 'SHEIKHA_GOVERNANCE_ACTIVATION_FABRIC_V1',
  status: 'ACTIVE',
  branch,
  head,
  timestamp: new Date().toISOString(),
  gitClean: changedFiles.length === 0,
  changedFiles,
  highRiskChanged,
  protectedChecks,
  missingProtected,
  inventory: {
    runtimeJsonFiles: runtimeJsonFiles.length,
    docsFiles: docsFiles.length,
    toolJsFiles: toolFiles.length
  },
  decision,
  prReadiness: {
    rawMergeAllowed: false,
    curatedMergeRequired: true,
    humanReviewRequired: highRiskChanged.length > 0,
    canOpenPr: missingProtected.length === 0,
    requiredBeforeMerge: [
      'governance verification',
      'runtime drift detector',
      'lint',
      'json validation',
      'report generated',
      'curated merge decision'
    ]
  },
  activationMap: [
    {
      id: 'GA-001',
      layer: 'Governance',
      action: 'Protect foundations and reject raw merge',
      status: missingProtected.length === 0 ? 'PASS' : 'HOLD'
    },
    {
      id: 'GA-002',
      layer: 'Roadmap',
      action: 'Convert current state into execution order',
      status: 'ACTIVE'
    },
    {
      id: 'GA-003',
      layer: 'Reporting',
      action: 'Generate PR and activation report',
      status: 'ACTIVE'
    },
    {
      id: 'GA-004',
      layer: 'PR',
      action: 'Prepare curated PR package',
      status: missingProtected.length === 0 ? 'READY' : 'HOLD'
    }
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

const outDir = path.join(ROOT, 'runtime/governance-activation/v1');
fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(
  path.join(outDir, 'sheikha-governance-activation-report.json'),
  JSON.stringify(report, null, 2)
);

const md = `# تقرير حوكمة وتفعيل شيخة V1

## الحالة
- النظام: ${report.system}
- الفرع: ${branch}
- HEAD: ${head}
- القرار: ${decision}
- Git Clean: ${report.gitClean}

## الأساسات المحمية
${Object.entries(protectedChecks).map(([k, v]) => `- ${v ? '✅' : '❌'} ${k}`).join('\n')}

## الملفات المتغيرة
${changedFiles.length ? changedFiles.map(f => `- ${f}`).join('\n') : '- لا توجد تغييرات غير ملتزمة'}

## الملفات عالية المخاطر
${highRiskChanged.length ? highRiskChanged.map(f => `- ${f}`).join('\n') : '- لا توجد تغييرات عالية المخاطر'}

## جاهزية PR
- الدمج الخام: ممنوع
- الدمج المنسق Curated Merge: مطلوب
- المراجعة البشرية: ${highRiskChanged.length > 0 ? 'مطلوبة' : 'حسب الحاجة'}
- فتح PR: ${missingProtected.length === 0 ? 'جاهز' : 'معلق'}

## الخريطة التفعيلية
${report.activationMap.map(x => `- ${x.id}: ${x.layer} — ${x.action} — ${x.status}`).join('\n')}

## القاعدة
ولا حول ولا قوة إلا بالله.
`;

fs.writeFileSync(
  path.join(outDir, 'sheikha-governance-activation-report.md'),
  md
);

console.log(JSON.stringify(report, null, 2));
