'use strict';

const fs = require('fs');
const path = require('path');
const {
  normalizeEnvelope,
  validateEnvelope
} = require('../../lib/api-contracts/sheikha-api-contracts');

const ROOT = process.cwd();

function exists(relativePath) {
  return fs.existsSync(path.join(ROOT, relativePath));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
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

function listFiles(relativePath) {
  const base = path.join(ROOT, relativePath);
  const files = [];

  function scan(dir) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
      const full = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        scan(full);
        return;
      }

      if (entry.isFile()) {
        files.push(path.relative(ROOT, full).replace(/\\/g, '/'));
      }
    });
  }

  if (fs.existsSync(base)) {
    scan(base);
  }

  return files.sort();
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

function hasAll(values, required) {
  return required.every((item) => values.includes(item));
}

function listPackageFilesInRiskRoots() {
  const riskRoots = [
    'dist',
    'archive',
    'infra/docker/compose/prod',
    'Sheikha-Market',
    '.venv',
    'exports',
    'reports'
  ];

  return {
    riskRoots,
    packageFiles: riskRoots.flatMap((riskRoot) =>
      listFiles(riskRoot).filter((file) => file.endsWith('package.json'))
    ).sort()
  };
}

function collectJestGovernance() {
  const config = require(path.join(ROOT, 'jest.config.js'));
  const requiredTestIgnores = [
    '/node_modules/',
    '/dist/',
    '/archive/',
    '/infra/docker/compose/prod/',
    '/Sheikha-Market/',
    '/.venv/',
    '/core/integration/tests/',
    '/tests/pixel-system.test.js',
    '/tests/pixel-ecosystem-integration.test.js'
  ];
  const requiredModuleIgnores = [
    '<rootDir>/dist',
    '<rootDir>/archive',
    '<rootDir>/infra/docker/compose/prod',
    '<rootDir>/Sheikha-Market',
    '<rootDir>/.venv'
  ];

  return {
    testEnvironment: config.testEnvironment,
    testMatch: config.testMatch || [],
    testPathIgnorePatterns: config.testPathIgnorePatterns || [],
    modulePathIgnorePatterns: config.modulePathIgnorePatterns || [],
    testIgnoresComplete: hasAll(config.testPathIgnorePatterns || [], requiredTestIgnores),
    moduleIgnoresComplete: hasAll(config.modulePathIgnorePatterns || [], requiredModuleIgnores),
    nodeTestSuitesSeparated: (config.testPathIgnorePatterns || []).includes('/core/integration/tests/'),
    legacyPixelRunnersSeparated:
      (config.testPathIgnorePatterns || []).includes('/tests/pixel-system.test.js') &&
      (config.testPathIgnorePatterns || []).includes('/tests/pixel-ecosystem-integration.test.js'),
    extensionTestsVisible: (config.testMatch || []).some((pattern) => pattern.includes('sheikha-vscode-extension'))
  };
}

function collectDependencyGovernance() {
  const packageJson = readJson('package.json');
  const marketUnit = readText('models/MarketUnit.js');

  return {
    uuidDependency: packageJson.dependencies?.uuid || null,
    uuidPinnedToCommonJsSafeMajor: String(packageJson.dependencies?.uuid || '').includes('8.3.2'),
    marketUnitUsesCryptoRandomUUID: marketUnit.includes("require('crypto')") && marketUnit.includes('randomUUID()'),
    marketUnitRequiresUuid: marketUnit.includes("require('uuid')") || marketUnit.includes('require("uuid")')
  };
}

function collectApiContracts() {
  const registry = readJson('runtime/api-contract-registry/v1/sheikha-api-contract-registry-v1.json');
  const statusContract = registry.contracts.find((contract) => contract.id === 'API-SHEIKHA-STATUS');
  const normalizedStatus = normalizeEnvelope({
    success: true,
    name: 'Sheikha',
    version: '1.0.0',
    status: 'active',
    shariaGuardrails: true
  }, {
    contract: registry.envelope.version,
    timestamp: '2026-06-04T00:00:00.000Z'
  });
  const statusValidation = validateEnvelope(normalizedStatus, {
    requiredDataKeys: statusContract.requiredDataKeys
  });

  return {
    registry: registry.registry,
    status: registry.status,
    envelope: registry.envelope.version,
    requiredTopLevel: registry.envelope.requiredTopLevel,
    totalContracts: registry.contracts.length,
    lockedContracts: registry.contracts.filter((contract) => contract.stability === 'LOCKED').length,
    extensionContracts: registry.contracts.filter((contract) => contract.owner === 'extension-compatibility').length,
    statusValidation
  };
}

function collectExtensionCompatibility() {
  const compatibility = readJson('runtime/extension-compatibility/v1/sheikha-extension-compatibility-v1.json');
  const integrationTest = readText('sheikha-vscode-extension/tests/integration.test.js');
  const expectedDataEnvelopeReferences = (integrationTest.match(/data\.data/g) || []).length;

  return {
    system: compatibility.system,
    status: compatibility.status,
    coveredEndpoints: compatibility.coveredEndpoints.length,
    expectedEnvelope: compatibility.expectedEnvelope,
    expectedDataEnvelopeReferences,
    dataEnvelopeExpectedByExtension: expectedDataEnvelopeReferences > 0
  };
}

function collectFoundationChecks() {
  return {
    gitleaksConfig: exists('.gitleaks.toml'),
    continuousImprovement: exists('runtime/continuous-improvement/v1/sheikha-continuous-improvement-v1.json'),
    governanceActivation: exists('runtime/governance-activation/v1/sheikha-governance-activation-v1.json'),
    developmentPsychology: exists('runtime/development-psychology/v1/sheikha-development-psychology-v1.json'),
    excellenceScore: exists('runtime/excellence-score/v1/sheikha-excellence-score-v1.json'),
    executionFabric: exists('runtime/execution-fabric/v1/sheikha-execution-fabric-v1.json')
  };
}

function collectRepositoryDuplication() {
  const { riskRoots, packageFiles } = listPackageFilesInRiskRoots();

  return {
    scannedRiskRoots: riskRoots,
    riskyPackageFiles: packageFiles,
    riskyPackageFilesCount: packageFiles.length
  };
}

function buildReport() {
  const git = readGitInfo();
  const checks = {
    foundations: collectFoundationChecks(),
    jest: collectJestGovernance(),
    dependency: collectDependencyGovernance(),
    apiContracts: collectApiContracts(),
    extension: collectExtensionCompatibility(),
    repositoryDuplication: collectRepositoryDuplication()
  };
  const gaps = [];

  if (!Object.values(checks.foundations).every(Boolean)) {
    gaps.push('One or more stability foundations are missing.');
  }

  if (!checks.jest.testIgnoresComplete || !checks.jest.moduleIgnoresComplete) {
    gaps.push('Jest duplicate repository guards are incomplete.');
  }

  if (!checks.jest.nodeTestSuitesSeparated) {
    gaps.push('Node test suites are not separated from Jest.');
  }

  if (!checks.jest.legacyPixelRunnersSeparated) {
    gaps.push('Legacy Pixel runners are not separated from Jest.');
  }

  if (!checks.dependency.uuidPinnedToCommonJsSafeMajor && !checks.dependency.marketUnitUsesCryptoRandomUUID) {
    gaps.push('UUID compatibility is not stabilized for Jest CommonJS execution.');
  }

  if (checks.dependency.marketUnitRequiresUuid && !checks.dependency.uuidPinnedToCommonJsSafeMajor) {
    gaps.push('A runtime model requires uuid without a CommonJS-safe pinned version.');
  }

  if (!checks.apiContracts.statusValidation.ok) {
    gaps.push(...checks.apiContracts.statusValidation.errors.map((error) => `API status contract: ${error}`));
  }

  if (!checks.extension.dataEnvelopeExpectedByExtension) {
    gaps.push('VS Code extension tests do not assert the canonical data envelope.');
  }

  return {
    system: 'SHEIKHA_STABILITY_LAYER_V1_REPORT',
    status: gaps.length === 0 ? 'STABLE' : 'REVIEW_REQUIRED',
    timestamp: new Date().toISOString(),
    branch: git.branch,
    head: git.head,
    checks,
    score: gaps.length === 0 ? 100 : Math.max(0, 100 - gaps.length * 10),
    gaps,
    decision: gaps.length === 0 ? 'STABILITY_BASELINE_READY' : 'STABILITY_REVIEW_REQUIRED',
    requiredBeforeMerge: [
      'npm test -- --config jest.config.js',
      'node --test core/integration/tests/*.test.js',
      'npm run lint',
      'npm run ops:stability-layer:v1',
      'runtime drift detector',
      'PR checks green',
      'curated human review'
    ],
    nextActions: [
      'Keep extension-facing APIs locked to SHEIKHA_API_ENVELOPE_V1.',
      'Update the API contract registry before changing extension tests.',
      'Promote extension integration tests to required CI only when the API server is started in workflow.',
      'Convert every future CI failure into a contract, test, and prevention rule.'
    ],
    principle: 'la darar wa la dirar'
  };
}

function renderMarkdown(report) {
  return [
    '# SHEIKHA Stability Layer V1 Report',
    '',
    `Generated at: ${report.timestamp}`,
    '',
    `Branch: ${report.branch}`,
    '',
    `HEAD: ${report.head}`,
    '',
    `Status: ${report.status}`,
    '',
    `Decision: ${report.decision}`,
    '',
    `Score: ${report.score}`,
    '',
    '## Checks',
    '',
    `- Foundations complete: ${Object.values(report.checks.foundations).every(Boolean)}`,
    `- Jest test ignores complete: ${report.checks.jest.testIgnoresComplete}`,
    `- Jest module ignores complete: ${report.checks.jest.moduleIgnoresComplete}`,
    `- Node test suites separated: ${report.checks.jest.nodeTestSuitesSeparated}`,
    `- Legacy Pixel runners separated: ${report.checks.jest.legacyPixelRunnersSeparated}`,
    `- Extension tests visible: ${report.checks.jest.extensionTestsVisible}`,
    `- UUID dependency: ${report.checks.dependency.uuidDependency}`,
    `- MarketUnit uses crypto.randomUUID: ${report.checks.dependency.marketUnitUsesCryptoRandomUUID}`,
    `- API contracts: ${report.checks.apiContracts.totalContracts}`,
    `- Extension contract references: ${report.checks.extension.expectedDataEnvelopeReferences}`,
    `- Risky duplicate package files: ${report.checks.repositoryDuplication.riskyPackageFilesCount}`,
    '',
    '## Gaps',
    '',
    report.gaps.length ? report.gaps.map((gap) => `- ${gap}`).join('\n') : '- none',
    '',
    '## Required Before Merge',
    '',
    report.requiredBeforeMerge.map((item, index) => `${index + 1}. ${item}`).join('\n'),
    '',
    '## Rule',
    '',
    'No raw merge. No merge with failing checks. API contracts before extension test changes.'
  ].join('\n') + '\n';
}

const report = buildReport();

writeJson('runtime/stability-layer/v1/sheikha-stability-layer-report.json', report);
writeText('runtime/stability-layer/v1/sheikha-stability-layer-report.md', renderMarkdown(report));

console.log(JSON.stringify({
  system: report.system,
  status: report.status,
  score: report.score,
  gaps: report.gaps,
  decision: report.decision,
  apiContracts: report.checks.apiContracts.totalContracts,
  riskyDuplicatePackageFiles: report.checks.repositoryDuplication.riskyPackageFilesCount,
  outputs: [
    'runtime/stability-layer/v1/sheikha-stability-layer-report.json',
    'runtime/stability-layer/v1/sheikha-stability-layer-report.md'
  ]
}, null, 2));
