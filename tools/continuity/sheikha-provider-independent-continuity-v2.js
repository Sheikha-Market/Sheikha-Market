'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');

const CONTRACT_FILE = path.join(
  ROOT,
  'runtime/continuity/v2/' +
    'sheikha-provider-independent-continuity-v2.json'
);

function readContract() {
  return JSON.parse(
    fs.readFileSync(CONTRACT_FILE, 'utf8')
  );
}

function expandHome(value) {
  if (value.startsWith('~/')) {
    return path.join(
      os.homedir(),
      value.slice(2)
    );
  }

  return value;
}

function isBareRepository(repository) {
  return (
    fs.existsSync(path.join(repository, 'HEAD')) &&
    fs.existsSync(path.join(repository, 'objects')) &&
    fs.existsSync(path.join(repository, 'refs'))
  );
}

function getContinuityStatus() {
  const contract = readContract();

  const primary = expandHome(
    contract.sourceControl.primaryRegistry
  );

  const disasterRecovery = expandHome(
    contract.sourceControl
      .disasterRecoveryRegistry
  );

  const checks = {
    active:
      contract.status === 'ACTIVE',

    localSourceOfTruth:
      contract.sourceControl.sourceOfTruth ===
        'LOCAL_BARE_GIT_REGISTRY',

    primaryRegistry:
      isBareRepository(primary),

    disasterRecoveryRegistry:
      isBareRepository(disasterRecovery),

    offlineOperation:
      contract.sourceControl
        .offlineOperationSupported === true,

    githubNotRequired:
      contract.externalProviders.github.required ===
        false,

    githubAuthenticationNotRequired:
      contract.runtimeDependencies
        .githubAuthenticationRequired === false,

    providerNotRequired:
      contract.runtimeDependencies
        .externalGitProviderRequired === false,

    compilerOffline:
      contract.runtimeDependencies
        .networkRequiredForCompiler === false,

    systemBuilderOffline:
      contract.runtimeDependencies
        .networkRequiredForSystemBuilder === false,

    recoveryOffline:
      contract.runtimeDependencies
        .networkRequiredForLocalRecovery === false,

    directArtifactDeployment:
      contract.deployment.transport ===
        'SSH_OR_SFTP',

    githubActionsNotRequired:
      contract.deployment
        .githubActionsRequired === false,

    automaticDeploymentDenied:
      contract.deployment
        .automaticProductionDeployment === false,

    defaultExecutionDeny:
      contract.governance
        .defaultExecutionAuthorization === 'DENY',

    defaultDeploymentDeny:
      contract.governance
        .defaultDeploymentAuthorization === 'DENY',

    noSingleProviderDependency:
      contract.governance
        .singleExternalProviderDependencyAllowed ===
          false
  };

  const failedChecks = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name);

  return {
    system: contract.system,
    status: contract.status,
    sourceControl: contract.sourceControl,
    externalProviders: contract.externalProviders,
    runtimeDependencies:
      contract.runtimeDependencies,
    backupModel: contract.backupModel,
    deployment: contract.deployment,
    governance: contract.governance,
    checks,
    failedChecks,
    passed: failedChecks.length === 0
  };
}

if (require.main === module) {
  const result = getContinuityStatus();

  process.stdout.write(
    JSON.stringify(result, null, 2) + '\n'
  );

  if (!result.passed) {
    process.exitCode = 1;
  }
}

module.exports = {
  CONTRACT_FILE,
  getContinuityStatus
};
