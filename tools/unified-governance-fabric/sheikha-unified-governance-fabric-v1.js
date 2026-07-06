'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

function exists(relativePath) {
  return fs.existsSync(path.join(ROOT, relativePath));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  const filePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + '\n');
}

function writeText(relativePath, value) {
  const filePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, value);
}

function readGitInfo() {
  const headPath = path.join(ROOT, '.git', 'HEAD');

  if (!fs.existsSync(headPath)) {
    return {
      branch: 'unknown',
      head: 'unknown'
    };
  }

  const headRaw = fs.readFileSync(headPath, 'utf8').trim();

  if (!headRaw.startsWith('ref: ')) {
    return {
      branch: 'detached',
      head: headRaw.slice(0, 8)
    };
  }

  const ref = headRaw.slice(5);
  const branch = ref.replace(/^refs\/heads\//, '');
  const refPath = path.join(ROOT, '.git', ref);
  const head = fs.existsSync(refPath)
    ? fs.readFileSync(refPath, 'utf8').trim().slice(0, 8)
    : 'unknown';

  return {
    branch,
    head
  };
}

function safeStatus(relativePath, selector = (value) => value.status) {
  try {
    return selector(readJson(relativePath));
  } catch {
    return null;
  }
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
  stabilityReportStable: safeStatus('runtime/stability-layer/v1/sheikha-stability-layer-report.json') === 'STABLE',
  apiContractRegistry: exists('runtime/api-contract-registry/v1/sheikha-api-contract-registry-v1.json'),
  testGovernance: exists('runtime/test-governance/v1/sheikha-test-governance-v1.json'),
  extensionCompatibility: exists('runtime/extension-compatibility/v1/sheikha-extension-compatibility-v1.json'),
  developmentPsychology: exists('runtime/development-psychology/v1/sheikha-development-psychology-v1.json'),
  excellenceScore: exists('runtime/excellence-score/v1/sheikha-excellence-score-v1.json'),
  executionFabric: exists('runtime/execution-fabric/v1/sheikha-execution-fabric-v1.json')
};

const missing = Object.entries(checks).filter(([, value]) => !value).map(([key]) => key);
const git = readGitInfo();

const report = {
  system: 'SHEIKHA_UNIFIED_GOVERNANCE_FABRIC_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  timestamp: new Date().toISOString(),
  branch: git.branch,
  head: git.head,
  checks,
  missing,
  decision: missing.length ? 'REVIEW_MISSING_LINKS' : 'READY_FOR_GOVERNED_OPERATION',
  operatingCycle: [
    'Receive request',
    'Apply Quran Sunnah governance boundary',
    'Classify chat/code/PR/deployment risk',
    'Check architecture freeze',
    'Check stability layer and API contracts',
    'Run tests and drift checks',
    'Generate governance report',
    'Allow only curated merge',
    'Capture lessons learned',
    'Update roadmap and policies'
  ],
  mergePolicy: {
    rawMergeAllowed: false,
    curatedMergeRequired: true,
    greenChecksRequired: true,
    driftCheckRequired: true,
    humanReviewForHighRisk: true
  },
  principle: 'ولا حول ولا قوة إلا بالله'
};

writeJson('runtime/unified-governance-fabric/v1/sheikha-unified-governance-fabric-report.json', report);
writeText(
  'runtime/unified-governance-fabric/v1/sheikha-unified-governance-fabric-report.md',
  [
    '# Sheikha Unified Governance Fabric V1',
    '',
    '## الحالة',
    `- النظام: ${report.system}`,
    `- الحالة: ${report.status}`,
    `- القرار: ${report.decision}`,
    `- الفرع: ${report.branch}`,
    `- HEAD: ${report.head}`,
    '',
    '## الفحوص',
    Object.entries(checks).map(([key, value]) => `- ${value ? 'OK' : 'MISSING'} ${key}`).join('\n'),
    '',
    '## دورة التشغيل',
    report.operatingCycle.map((item, index) => `${index + 1}. ${item}`).join('\n'),
    '',
    '## القاعدة',
    'لا دمج خام. لا كسر للتجميد المعماري. لا تطوير بلا اختبار. لا تشغيل مؤثر بلا حوكمة.',
    '',
    'ولا حول ولا قوة إلا بالله.'
  ].join('\n') + '\n'
);

console.log(JSON.stringify(report, null, 2));
