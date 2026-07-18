'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const CONTRACT_PATH = path.join(
  ROOT,
  'runtime',
  'distribution',
  'v1',
  'sheikha-native-installer-build-execution-contract-v1.json'
);
const TEMPLATE_PATH = path.join(
  ROOT,
  'runtime',
  'distribution',
  'v1',
  'sheikha-installer-evidence-template-v1.json'
);

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function loadContract() {
  return loadJson(CONTRACT_PATH);
}

function loadEvidenceTemplate() {
  return loadJson(TEMPLATE_PATH);
}

function verifyExecutionFoundation() {
  const contract = loadContract();
  const template = loadEvidenceTemplate();
  const execution = contract.executionRules || {};
  const artifacts = contract.artifactRules || {};
  const production = contract.production || {};
  const gates = template.gates || {};

  const checks = {
    system:
      contract.system ===
      'SHEIKHA_NATIVE_INSTALLER_BUILD_EXECUTION_CONTRACT_V1',
    targetCount:
      contract.targetCount === 26,
    runnerGroupCount:
      Array.isArray(contract.runnerGroups) &&
      contract.runnerGroups.length === 9 &&
      new Set(contract.runnerGroups).size === 9,
    nativeRunnerRequired:
      execution.nativeOrApprovedCompatibleRunnerRequired === true,
    sourceBindingRequired:
      execution.sourceCommitBindingRequired === true,
    cleanWorktreeRequired:
      execution.cleanSourceWorktreeRequired === true,
    dependencyLockRequired:
      execution.dependencyLockRequired === true,
    noPackageInstallDuringGovernanceBuild:
      execution.packageInstallationDuringGovernanceBuildAllowed === false,
    noRepositorySecrets:
      execution.secretsInRepositoryAllowed === false,
    noUnsupportedCompletionClaim:
      execution.crossPlatformCompletionClaimWithoutEvidenceAllowed === false,
    noPromotionBeforeEvidence:
      execution.artifactPromotionBeforeEvidenceAllowed === false,
    humanApprovalRequired:
      execution.humanReleaseApprovalRequired === true,
    artifactEvidenceComplete:
      artifacts.sha256Required === true &&
      artifacts.sbomRequired === true &&
      artifacts.provenanceRequired === true &&
      artifacts.buildLogRequired === true &&
      artifacts.installTestLogRequired === true &&
      artifacts.smokeTestLogRequired === true &&
      artifacts.uninstallTestLogRequired === true &&
      artifacts.signingStatusRequired === true,
    baseGateCount:
      [
        'SOURCE_COMMIT_BOUND',
        'NATIVE_BUILD_COMPLETED',
        'ARTIFACT_PRESENT',
        'SHA256_RECORDED',
        'SBOM_RECORDED',
        'PROVENANCE_RECORDED',
        'NATIVE_INSTALL_TEST_PASSED',
        'SMOKE_TEST_PASSED',
        'UNINSTALL_TEST_PASSED',
        'SIGNATURE_OR_UNSIGNED_STATUS_RECORDED'
      ].every((gate) => gates[gate] === false),
    noProductionAuthorization:
      production.artifactPromotionAuthorized === false &&
      production.deploymentAuthorized === false &&
      production.serviceRestartAuthorized === false &&
      production.cleanupAuthorized === false
  };

  return {
    system: 'SHEIKHA_NATIVE_INSTALLER_BUILD_EXECUTION_FOUNDATION_V1',
    verified: Object.values(checks).every(Boolean),
    checks
  };
}

module.exports = {
  ROOT,
  CONTRACT_PATH,
  TEMPLATE_PATH,
  loadContract,
  loadEvidenceTemplate,
  verifyExecutionFoundation
};

if (require.main === module) {
  const result = verifyExecutionFoundation();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  process.exitCode = result.verified ? 0 : 1;
}
