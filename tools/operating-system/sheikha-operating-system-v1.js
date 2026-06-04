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
  const refPath = path.join(ROOT, '.git', ref);
  const branch = ref.replace(/^refs\/heads\//, '');
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

const definition = readJson('runtime/operating-system/v1/sheikha-operating-system-v1.json');
const git = readGitInfo();

const checks = {
  operatingSystemDefinition: definition.system === 'SHEIKHA_OPERATING_SYSTEM_V1',
  operatingSystemActive: definition.status === 'ACTIVE',
  aboveRootOperatingCore: definition.position === 'ABOVE_ROOT_OPERATING_CORE',
  rootOperatingCore: exists('runtime/root-operating-core/v1/sheikha-root-operating-core-v1.json'),
  rootOperatingCoreReportActive:
    safeStatus('runtime/root-operating-core/v1/sheikha-root-operating-core-report.json') === 'ACTIVE',
  unifiedGovernanceFabric: exists('runtime/unified-governance-fabric/v1/sheikha-unified-governance-fabric-v1.json'),
  unifiedGovernanceReportActive:
    safeStatus('runtime/unified-governance-fabric/v1/sheikha-unified-governance-fabric-report.json') === 'ACTIVE',
  architectureFreezeV13: exists('runtime/architecture-freeze/v1.3/sheikha-architecture-freeze-v1.3.json'),
  stabilityLayer: exists('runtime/stability-layer/v1/sheikha-stability-layer-v1.json'),
  stabilityReportStable:
    safeStatus('runtime/stability-layer/v1/sheikha-stability-layer-report.json') === 'STABLE',
  continuousImprovement: exists('runtime/continuous-improvement/v1/sheikha-continuous-improvement-v1.json'),
  developmentPsychology: exists('runtime/development-psychology/v1/sheikha-development-psychology-v1.json'),
  executionFabric: exists('runtime/execution-fabric/v1/sheikha-execution-fabric-v1.json'),
  apiContractRegistry: exists('runtime/api-contract-registry/v1/sheikha-api-contract-registry-v1.json'),
  testGovernance: exists('runtime/test-governance/v1/sheikha-test-governance-v1.json'),
  portalCompatibility:
    definition.naming_policy.portal_is_compatibility_layer === true &&
    definition.naming_policy.do_not_break_existing_paths === true
};

const missing = Object.entries(checks).filter(([, value]) => !value).map(([key]) => key);

const report = {
  system: definition.system,
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  officialName: definition.official_name,
  arabicName: definition.arabic_name,
  timestamp: new Date().toISOString(),
  branch: git.branch,
  head: git.head,
  position: definition.position,
  checks,
  missing,
  operatingOrder: definition.operating_order,
  namingPolicy: definition.naming_policy,
  governancePolicy: definition.governance_policy,
  decision: missing.length ? 'OPERATING_SYSTEM_REVIEW_REQUIRED' : 'SHEIKHA_OPERATING_SYSTEM_V1_READY',
  principle: definition.principle
};

writeJson('runtime/operating-system/v1/sheikha-operating-system-report.json', report);
writeText(
  'runtime/operating-system/v1/sheikha-operating-system-report.md',
  [
    '# Sheikha Operating System V1',
    '# نظام تشغيل شيخة',
    '',
    '## الحالة',
    `- النظام: ${report.system}`,
    `- الاسم الرسمي: ${report.officialName}`,
    `- الاسم العربي: ${report.arabicName}`,
    `- الحالة: ${report.status}`,
    `- القرار: ${report.decision}`,
    `- الموضع: ${report.position}`,
    `- الفرع: ${report.branch}`,
    `- HEAD: ${report.head}`,
    '',
    '## الترتيب المنهجي الأعلى',
    report.operatingOrder.map((item, index) => `${index + 1}. ${item}`).join('\n'),
    '',
    '## الفحوص',
    Object.entries(report.checks).map(([key, value]) => `- ${value ? 'OK' : 'MISSING'} ${key}`).join('\n'),
    '',
    '## سياسة الاسم',
    `- الاسم المنهجي الأعلى: ${report.namingPolicy.highest_methodological_name}`,
    `- الجذر التشغيلي الأعلى: ${report.namingPolicy.highest_runtime_core_name}`,
    `- اسم المستودع القديم: ${report.namingPolicy.legacy_repository_name}`,
    '- portal يبقى طبقة توافق ولا يكسر المسارات الحالية.',
    '',
    '## سياسة الحوكمة',
    '- لا دمج خام.',
    '- لا دمج مع فحوص فاشلة.',
    '- لا تغيير لعقود API دون registry واختبارات.',
    '- لا تغيير كاسر للأسماء والمسارات إلا بخطة انتقال محكومة.',
    '',
    'ولا حول ولا قوة إلا بالله.'
  ].join('\n') + '\n'
);

console.log(JSON.stringify({
  system: report.system,
  status: report.status,
  decision: report.decision,
  missing: report.missing,
  outputs: [
    'runtime/operating-system/v1/sheikha-operating-system-report.json',
    'runtime/operating-system/v1/sheikha-operating-system-report.md'
  ]
}, null, 2));
