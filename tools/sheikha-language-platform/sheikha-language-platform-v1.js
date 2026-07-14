'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');

const CONTRACT_FILE = path.join(
  ROOT,
  'runtime/sheikha-language-platform/v1/' +
    'sheikha-language-platform-v1.json'
);

const REQUIRED_FILES = Object.freeze({
  lexer:
    'sheikha-language/compiler/lexer.js',
  parser:
    'sheikha-language/compiler/parser.js',
  compiler:
    'sheikha-language/compiler/sheikha-compiler.js',
  runner:
    'sheikha-language/compiler/sheikha-runner.js',
  ir:
    'sheikha-language/compiler/ir.js',
  vm:
    'sheikha-language/compiler/vm.js',
  governance:
    'sheikha-language/compiler/governance.js',
  grammar:
    'sheikha-language/grammar/sheikha-grammar.ebnf',
  astDocumentation:
    'sheikha-language/docs/ast-spec.md',
  example:
    'sheikha-language/examples/market.shk'
});

const REQUIRED_SCRIPTS = Object.freeze([
  'ops:sheikha:lang:sprint2:compile',
  'ops:sheikha:lang:sprint2:run',
  'ops:sheikha:lang:sprint2:test'
]);

function readJson(filePath) {
  return JSON.parse(
    fs.readFileSync(filePath, 'utf8')
  );
}

function getLanguagePlatformStatus() {
  const contract = readJson(CONTRACT_FILE);
  const packageJson = readJson(
    path.join(ROOT, 'package.json')
  );

  const fileChecks = Object.fromEntries(
    Object.entries(REQUIRED_FILES).map(
      ([name, relativePath]) => [
        name,
        fs.existsSync(path.join(ROOT, relativePath))
      ]
    )
  );

  const scriptChecks = Object.fromEntries(
    REQUIRED_SCRIPTS.map((name) => [
      name,
      typeof packageJson.scripts?.[name] === 'string'
    ])
  );

  const checks = {
    active:
      contract.status === 'ACTIVE',

    firstPartyRole:
      contract.position.role ===
        'FIRST_PARTY_PROGRAMMING_LANGUAGE_FOR_SYSTEM_BUILDER_PLATFORM',

    arabicFirst:
      contract.identity.languagePriority[0] === 'Arabic',

    shkExtension:
      contract.identity.sourceExtension === '.shk',

    pipelineComplete:
      Array.isArray(contract.pipeline) &&
      contract.pipeline.includes('lexer') &&
      contract.pipeline.includes('parser') &&
      contract.pipeline.includes('ast') &&
      contract.pipeline.includes('ir') &&
      contract.pipeline.includes('bytecode') &&
      contract.pipeline.includes('governance-hooks'),

    allFilesPresent:
      Object.values(fileChecks).every(Boolean),

    allScriptsPresent:
      Object.values(scriptChecks).every(Boolean),

    defaultDeny:
      contract.governance
        .defaultExecutionAuthorization === 'DENY',

    noReligiousRulingAuthority:
      contract.governance.issuesReligiousRulings === false,

    noDivineSoftwareModel:
      contract.governance
        .modelsDivineEntitiesAsSoftwareNodes === false,

    vscodeOptional:
      contract.position.vscodeIsOptionalAdapter === true
  };

  const failedChecks = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name);

  return {
    system: contract.system,
    status: contract.status,
    identity: contract.identity,
    position: contract.position,
    pipeline: contract.pipeline,
    targets: contract.targets,
    governance: contract.governance,
    fileChecks,
    scriptChecks,
    checks,
    failedChecks,
    passed: failedChecks.length === 0
  };
}

if (require.main === module) {
  const status = getLanguagePlatformStatus();

  process.stdout.write(
    JSON.stringify(status, null, 2) + '\n'
  );

  if (!status.passed) {
    process.exitCode = 1;
  }
}

module.exports = {
  CONTRACT_FILE,
  REQUIRED_FILES,
  REQUIRED_SCRIPTS,
  getLanguagePlatformStatus
};
