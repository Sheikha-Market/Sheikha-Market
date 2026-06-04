'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const {
  normalizeEnvelope,
  validateEnvelope
} = require('../../lib/api-contracts/sheikha-api-contracts');

const ROOT = process.cwd();

function sh(command) {
  try {
    return execSync(command, { cwd: ROOT, encoding: 'utf8', timeout: 20000 }).trim();
  } catch (error) {
    if (error.stdout) {
      return String(error.stdout).trim();
    }

    return `ERROR: ${error.message}`;
  }
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
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

function listPackageFilesInRiskRoots() {
  const riskRoots = [
    'dist',
    'archive',
    'infra/docker/compose/prod',
    'Sheikha-Market',
    '.venv'
  ];

  return riskRoots.flatMap((riskRoot) =>
    listFiles(riskRoot).filter((file) => file.endsWith('package.json'))
  ).sort();
}

function hasAll(values, required) {
  return required.every((item) => values.includes(item));
}

function collectJestGovernance() {
  const config = require(path.join(ROOT, 'jest.config.js'));
  const requiredTestIgnores = [
    '/node_modules/',
    '/dist/',
    '/archive/',
    '/infra/docker/compose/prod/',
    '/Sheikha-Market/',
    '/.venv/'
  ];
  const requiredModuleIgnores = [
    '<rootDir>/dist',
    '<rootDir>/archive',
    '<rootDir>/infra/docker/compose/prod',
    '<rootDir>/Sheikha-Market',
    '<rootDir>/.venv'
  ];

  return {
    requiredTestIgnores,
    requiredModuleIgnores,
    testPathIgnorePatterns: config.testPathIgnorePatterns || [],
    modulePathIgnorePatterns: config.modulePathIgnorePatterns || [],
    testIgnoresComplete: hasAll(config.testPathIgnorePatterns || [], requiredTestIgnores),
    moduleIgnoresComplete: hasAll(config.modulePathIgnorePatterns || [], requiredModuleIgnores)
  };
}

function collectDependencyGovernance() {
  const marketUnit = readText('models/MarketUnit.js');

  return {
    marketUnitUsesCryptoRandomUUID: marketUnit.includes("require('crypto')") && marketUnit.includes('randomUUID()'),
    marketUnitRequiresUuid: marketUnit.includes("require('uuid')") || marketUnit.includes('require("uuid")')
  };
}

function collectApiContracts() {
  const registry = readJson('runtime/api-contract-registry/v1/sheikha-api-contract-registry-v1.json');
  const statusContract = registry.contracts.find((contract) => contract.id === 'API-SHEIKHA-STATUS');
  const legacyStatus = {
    success: true,
    name: 'Sheikha',
    version: '1.0.0',
    status: 'active',
    shariaGuardrails: true
  };
  const normalizedStatus = normalizeEnvelope(legacyStatus, {
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
    expectedDataEnvelopeReferences,
    dataEnvelopeExpectedByExtension: expectedDataEnvelopeReferences > 0
  };
}

function collectRepositoryDuplication() {
  const riskyPackageFiles = listPackageFilesInRiskRoots();

  return {
    scannedRiskRoots: 5,
    riskyPackageFiles,
    riskyPackageFilesCount: riskyPackageFiles.length
  };
}

function buildReport() {
  const jest = collectJestGovernance();
  const dependency = collectDependencyGovernance();
  const apiContracts = collectApiContracts();
  const extension = collectExtensionCompatibility();
  const repositoryDuplication = collectRepositoryDuplication();
  const gaps = [];

  if (!jest.testIgnoresComplete) {
    gaps.push('Jest testPathIgnorePatterns does not cover all duplicate repository paths.');
  }

  if (!jest.moduleIgnoresComplete) {
    gaps.push('Jest modulePathIgnorePatterns does not cover all duplicate repository paths.');
  }

  if (!dependency.marketUnitUsesCryptoRandomUUID || dependency.marketUnitRequiresUuid) {
    gaps.push('MarketUnit UUID generation still depends on fragile CommonJS uuid import.');
  }

  if (!apiContracts.statusValidation.ok) {
    gaps.push(...apiContracts.statusValidation.errors.map((error) => `API status contract: ${error}`));
  }

  if (!extension.dataEnvelopeExpectedByExtension) {
    gaps.push('VS Code extension tests do not assert canonical data envelope.');
  }

  return {
    system: 'SHEIKHA_STABILITY_LAYER_V1_REPORT',
    status: gaps.length === 0 ? 'STABLE' : 'REVIEW_REQUIRED',
    timestamp: new Date().toISOString(),
    branch: sh('git branch --show-current'),
    head: sh('git rev-parse --short HEAD'),
    gitStatus: sh('git status -sb --untracked-files=no'),
    checks: {
      jest,
      dependency,
      apiContracts,
      extension,
      repositoryDuplication
    },
    score: gaps.length === 0 ? 100 : Math.max(0, 100 - gaps.length * 10),
    gaps,
    nextActions: [
      'Keep API response envelope locked for extension-facing endpoints.',
      'Run stability layer before adding development engines or changing extension API contracts.',
      'Promote extension integration tests to required CI only when the API server is part of the workflow.',
      'Convert each future CI failure into a contract, test, and prevention rule.'
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
    `Score: ${report.score}`,
    '',
    '## Checks',
    '',
    `- Jest test ignores complete: ${report.checks.jest.testIgnoresComplete}`,
    `- Jest module ignores complete: ${report.checks.jest.moduleIgnoresComplete}`,
    `- MarketUnit uses crypto.randomUUID: ${report.checks.dependency.marketUnitUsesCryptoRandomUUID}`,
    `- API contracts: ${report.checks.apiContracts.totalContracts}`,
    `- Extension contract references: ${report.checks.extension.expectedDataEnvelopeReferences}`,
    `- Risky duplicate package files: ${report.checks.repositoryDuplication.riskyPackageFilesCount}`,
    '',
    '## Gaps',
    '',
    report.gaps.length ? report.gaps.map((gap) => `- ${gap}`).join('\n') : '- none',
    '',
    '## Next Actions',
    '',
    report.nextActions.map((action, index) => `${index + 1}. ${action}`).join('\n'),
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
  apiContracts: report.checks.apiContracts.totalContracts,
  riskyDuplicatePackageFiles: report.checks.repositoryDuplication.riskyPackageFilesCount,
  outputs: [
    'runtime/stability-layer/v1/sheikha-stability-layer-report.json',
    'runtime/stability-layer/v1/sheikha-stability-layer-report.md'
  ]
}, null, 2));
