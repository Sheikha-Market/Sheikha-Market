'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = process.cwd();

function sh(cmd) {
  try {
    return execSync(cmd, { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch (err) {
    return String(err.stderr || err.message || err).trim();
  }
}

function exists(p) {
  return fs.existsSync(path.join(ROOT, p));
}

const branch = sh('git branch --show-current');
const head = sh('git rev-parse --short HEAD');
const status = sh('git status --short');
const checks = sh('gh pr checks 22 2>/dev/null || true');
const prView = sh('gh pr view 22 --json number,title,state,mergeStateStatus,reviewDecision,isDraft,url 2>/dev/null || true');

const failedChecks = checks
  .split('\n')
  .filter(line => line.trim().startsWith('X') || line.includes('fail') || line.includes('failing'));

const foundations = {
  governanceActivation: exists('runtime/governance-activation/v1/sheikha-governance-activation-v1.json'),
  continuousImprovement: exists('runtime/continuous-improvement/v1/sheikha-continuous-improvement-v1.json'),
  architectureFreeze: exists('runtime/architecture-freeze/v1.3/sheikha-architecture-freeze-v1.3.json'),
  prGovernance: exists('runtime/pr-governance/system/sheikha-merge-pr-governance-system-v1.json'),
  executionFabric: exists('runtime/execution-fabric/v1/sheikha-execution-fabric-v1.json'),
  decisionRegistry: exists('runtime/decision-registry/v1/decision-registry.json'),
  roadmapEngine: exists('runtime/roadmap-engine/v1/roadmap-engine.json')
};

const missing = Object.entries(foundations).filter(([, v]) => !v).map(([k]) => k);

const decision =
  missing.length > 0 ? 'HOLD_MISSING_FOUNDATION'
  : failedChecks.length > 0 ? 'HOLD_FIX_FAILED_CHECKS'
  : status ? 'REVIEW_UNCOMMITTED_CHANGES'
  : 'READY_FOR_CURATED_REVIEW';

const report = {
  system: 'SHEIKHA_CONTINUOUS_IMPROVEMENT_V1',
  status: 'ACTIVE',
  timestamp: new Date().toISOString(),
  branch,
  head,
  gitClean: !status,
  pr: prView,
  failedChecks,
  foundations,
  missing,
  decision,
  policiesGenerated: [
    {
      id: 'POL-CI-001',
      name: 'No merge while PR is unstable',
      rule: 'If mergeStateStatus is UNSTABLE or any check is failing, merge is blocked.'
    },
    {
      id: 'POL-CI-002',
      name: 'Learn from failed checks',
      rule: 'Every failed check must produce a lesson, fix action, and prevention rule.'
    },
    {
      id: 'POL-CI-003',
      name: 'Curated merge only',
      rule: 'Raw merge is forbidden. Merge requires governance report and clean checks.'
    },
    {
      id: 'POL-CI-004',
      name: 'Human authority',
      rule: 'High-risk changes require human review before merge or deployment.'
    }
  ],
  nextActions: failedChecks.length > 0
    ? [
        'Inspect failed GitHub check logs.',
        'Patch only the failing cause.',
        'Run local validation.',
        'Push fix to PR #22.',
        'Re-run checks.',
        'Merge only after stable status.'
      ]
    : [
        'Update PR body with governance report.',
        'Request review or perform curated merge review.',
        'Merge only if checks stay green.'
      ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

const outDir = path.join(ROOT, 'runtime/continuous-improvement/v1');
fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(
  path.join(outDir, 'sheikha-continuous-improvement-report.json'),
  JSON.stringify(report, null, 2)
);

const md = `# تقرير التعلم من التجربة والتحسين المستمر — شيخة V1

## الحالة
- النظام: ${report.system}
- الفرع: ${branch}
- HEAD: ${head}
- القرار: ${decision}
- Git Clean: ${report.gitClean}

## نتيجة PR
\`\`\`json
${prView || '{}'}
\`\`\`

## الفحوص الفاشلة
${failedChecks.length ? failedChecks.map(x => `- ${x}`).join('\n') : '- لا توجد فحوص فاشلة ظاهرة من gh pr checks'}

## السياسات المولدة
${report.policiesGenerated.map(p => `### ${p.id} — ${p.name}\n${p.rule}`).join('\n\n')}

## الإجراءات التالية
${report.nextActions.map((a, i) => `${i + 1}. ${a}`).join('\n')}

## القاعدة
لا دمج مع فشل الفحوص. لا دمج خام. لا نشر دون تقرير وحوكمة.

ولا حول ولا قوة إلا بالله.
`;

fs.writeFileSync(
  path.join(outDir, 'sheikha-continuous-improvement-report.md'),
  md
);

console.log(JSON.stringify(report, null, 2));
