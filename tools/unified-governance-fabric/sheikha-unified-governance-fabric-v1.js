'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = process.cwd();

function sh(cmd) {
  try { return execSync(cmd, { cwd: ROOT, encoding: 'utf8' }).trim(); }
  catch (e) { return String(e.stderr || e.message || e).trim(); }
}

function exists(p) {
  return fs.existsSync(path.join(ROOT, p));
}

const checks = {
  quranSunnahGovernance: exists('runtime/quran-sunnah-governance'),
  chatCodeGovernance: exists('runtime/chat-code-governance'),
  architectureFreezeV13: exists('runtime/architecture-freeze/v1.3/sheikha-architecture-freeze-v1.3.json'),
  federalOrganizationV12: exists('runtime/federal-organization/v1.2/sheikha-federal-organization-v1.2.json'),
  prGovernance: exists('runtime/pr-governance/system/sheikha-merge-pr-governance-system-v1.json'),
  governanceActivation: exists('runtime/governance-activation/v1/sheikha-governance-activation-v1.json'),
  continuousImprovement: exists('runtime/continuous-improvement/v1/sheikha-continuous-improvement-v1.json'),
  stabilityLayer: exists('runtime/stability-layer/v1/sheikha-stability-layer-v1.json'),
  developmentPsychology: exists('runtime/development-psychology/v1/sheikha-development-psychology-v1.json')
};

const missing = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);

const report = {
  system: 'SHEIKHA_UNIFIED_GOVERNANCE_FABRIC_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  timestamp: new Date().toISOString(),
  branch: sh('git branch --show-current'),
  head: sh('git rev-parse --short HEAD'),
  gitStatus: sh('git status --short'),
  checks,
  missing,
  decision: missing.length ? 'REVIEW_MISSING_LINKS' : 'READY_FOR_GOVERNED_OPERATION',
  operatingCycle: [
    'Receive request',
    'Apply Quran Sunnah governance boundary',
    'Classify chat/code/PR/deployment risk',
    'Check architecture freeze',
    'Check capability registry',
    'Run tests and drift checks',
    'Generate governance report',
    'Allow only curated merge',
    'Capture lessons learned',
    'Update roadmap and policies'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

const outDir = path.join(ROOT, 'runtime/unified-governance-fabric/v1');
fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(path.join(outDir, 'sheikha-unified-governance-fabric-report.json'), JSON.stringify(report, null, 2));

fs.writeFileSync(path.join(outDir, 'sheikha-unified-governance-fabric-report.md'), `# Sheikha Unified Governance Fabric V1

## الحالة
- النظام: ${report.system}
- الحالة: ${report.status}
- القرار: ${report.decision}
- الفرع: ${report.branch}
- HEAD: ${report.head}

## الفحوص
${Object.entries(checks).map(([k,v]) => `- ${v ? '✅' : '❌'} ${k}`).join('\n')}

## دورة التشغيل
${report.operatingCycle.map((x,i)=>`${i+1}. ${x}`).join('\n')}

## القاعدة
لا دمج خام. لا كسر للتجميد المعماري. لا تطوير بلا اختبار. لا تشغيل مؤثر بلا حوكمة.

ولا حول ولا قوة إلا بالله.
`);

console.log(JSON.stringify(report, null, 2));
