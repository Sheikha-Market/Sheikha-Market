'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = process.cwd();

function sh(cmd) {
  try {
    return execSync(cmd, { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch (e) {
    return String(e.stderr || e.message || e).trim();
  }
}

function exists(p) {
  return fs.existsSync(path.join(ROOT, p));
}

const report = {
  system: 'SHEIKHA_STABILITY_LAYER_V1',
  status: 'ACTIVE',
  timestamp: new Date().toISOString(),
  branch: sh('git branch --show-current'),
  head: sh('git rev-parse --short HEAD'),
  gitStatus: sh('git status --short'),
  checks: {
    jestConfig: exists('jest.config.js'),
    gitleaksConfig: exists('.gitleaks.toml'),
    continuousImprovement: exists('runtime/continuous-improvement/v1/sheikha-continuous-improvement-v1.json'),
    governanceActivation: exists('runtime/governance-activation/v1/sheikha-governance-activation-v1.json'),
    developmentPsychology: exists('runtime/development-psychology/v1/sheikha-development-psychology-v1.json')
  },
  decision: 'STABILITY_PATCH_READY_FOR_LOCAL_TEST',
  requiredBeforeMerge: [
    'npm test --if-present',
    'governed gitleaks',
    'runtime drift detector',
    'pre-commit governance',
    'PR checks green'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

const outDir = path.join(ROOT, 'runtime/stability-layer/v1');
fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(
  path.join(outDir, 'sheikha-stability-layer-report.json'),
  JSON.stringify(report, null, 2)
);

fs.writeFileSync(
  path.join(outDir, 'sheikha-stability-layer-report.md'),
  `# Sheikha Stability Layer V1

## الحالة
- النظام: ${report.system}
- الفرع: ${report.branch}
- HEAD: ${report.head}
- القرار: ${report.decision}

## الفحوص
${Object.entries(report.checks).map(([k, v]) => `- ${v ? '✅' : '❌'} ${k}`).join('\n')}

## قبل الدمج
${report.requiredBeforeMerge.map((x, i) => `${i + 1}. ${x}`).join('\n')}

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
