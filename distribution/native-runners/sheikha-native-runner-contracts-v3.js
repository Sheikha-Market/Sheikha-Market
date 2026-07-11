'use strict';

const path = require('node:path');

const { DISTRIBUTION_ROOT, writeJson } = require('../common/distribution-utils');

const RUNNER_DEFINITIONS = Object.freeze([
  Object.freeze({ platform: 'windows', architecture: 'x64', file: 'x64-runner-contract.json' }),
  Object.freeze({ platform: 'windows', architecture: 'arm64', file: 'arm64-runner-contract.json' }),
  Object.freeze({ platform: 'macos', architecture: 'x86_64', file: 'intel-runner-contract.json' }),
  Object.freeze({ platform: 'macos', architecture: 'arm64', file: 'apple-silicon-runner-contract.json' }),
  Object.freeze({ platform: 'linux', architecture: 'x86_64', file: 'x86_64-runner-contract.json' }),
  Object.freeze({ platform: 'linux', architecture: 'aarch64', file: 'arm64-runner-contract.json' }),
  Object.freeze({ platform: 'linux', architecture: 'armv7', file: 'armv7-runner-contract.json' })
]);

const STAGE_DEFINITIONS = Object.freeze({
  build: Object.freeze({
    impact: 'write-build-workspace',
    approval: 'PIPELINE_APPROVAL',
    success: ['EXIT_ZERO', 'ARTIFACT_EXISTS', 'ARTIFACT_ARCHITECTURE_MATCHES_RUNNER']
  }),
  install: Object.freeze({
    impact: 'host-modification',
    approval: 'HUMAN_APPROVAL',
    success: ['INSTALLER_EXIT_ZERO', 'INSTALL_ROOT_WITHIN_APPROVED_SCOPE']
  }),
  launch: Object.freeze({
    impact: 'process-execution',
    approval: 'HUMAN_APPROVAL',
    success: ['PROCESS_STARTED', 'EXPECTED_APPLICATION_IDENTITY']
  }),
  health: Object.freeze({
    impact: 'read-only',
    approval: 'CAPABILITY_GRANT',
    success: ['HEALTH_CHECK_PASSED', 'NO_UNEXPECTED_PRIVILEGE']
  }),
  version: Object.freeze({
    impact: 'read-only',
    approval: 'CAPABILITY_GRANT',
    success: ['VERSION_MATCHES_RELEASE_INDEX']
  }),
  upgrade: Object.freeze({
    impact: 'host-modification',
    approval: 'HUMAN_APPROVAL',
    success: ['PREVIOUS_VERSION_CAPTURED', 'NEW_VERSION_HEALTHY', 'USER_DATA_PRESERVED']
  }),
  uninstall: Object.freeze({
    impact: 'host-modification',
    approval: 'HUMAN_APPROVAL',
    success: ['PRODUCT_FILES_REMOVED', 'UNRELATED_FILES_PRESERVED']
  }),
  rollback: Object.freeze({
    impact: 'host-modification',
    approval: 'HUMAN_APPROVAL',
    success: ['PREVIOUS_VERSION_RESTORED', 'HEALTH_CHECK_PASSED']
  }),
  logs: Object.freeze({
    impact: 'read-only',
    approval: 'CAPABILITY_GRANT',
    success: ['LOGS_REDACTED', 'LOG_SCOPE_RESTRICTED']
  }),
  evidence: Object.freeze({
    impact: 'write-evidence-root',
    approval: 'PIPELINE_APPROVAL',
    success: ['JSON_VALID', 'SHA256_RECORDED', 'TIMESTAMPS_RECORDED']
  }),
  cleanup: Object.freeze({
    impact: 'delete-runner-temporary-files',
    approval: 'PIPELINE_APPROVAL',
    success: ['ONLY_RUN_SCOPED_TEMP_REMOVED', 'RELEASE_ARTIFACTS_PRESERVED']
  })
});

function platformRequirements(platform, architecture) {
  if (platform === 'windows') {
    return {
      operatingSystem: 'Windows 11 or supported Windows Server native runner',
      architectureInspector: ['GetBinaryType', 'dumpbin or equivalent PE inspector'],
      installerProfiles: ['user', 'system'],
      signingBoundary: 'AUTHENTICODE_SIGNING_REQUIRED_FOR_PUBLIC_RELEASE',
      administratorBoundary: 'Only the system profile may request Administrator approval.'
    };
  }
  if (platform === 'macos') {
    return {
      operatingSystem: 'Supported macOS native runner',
      architectureInspector: ['file', 'lipo', 'otool'],
      installerProfiles: ['user'],
      signingBoundary: 'CODESIGN_AND_NOTARIZATION_REQUIRED_FOR_PUBLIC_RELEASE',
      universal2Boundary: architecture === 'arm64'
        ? 'Universal 2 requires separate x86_64 and arm64 Mach-O slices.'
        : 'An x86_64 slice alone is not Universal 2.'
    };
  }
  return {
    operatingSystem: 'Supported GNU/Linux native runner',
    architectureInspector: ['file', 'readelf', 'objdump', 'ldd'],
    installerProfiles: ['user', 'system-when-explicitly-approved'],
    signingBoundary: 'Repository or package signing is separate and was not requested.',
    libcBoundary: architecture === 'x86_64'
      ? 'Record ELF interpreter and libc requirements.'
      : 'Architecture-correct dynamic loader and libc must exist on the runner.'
  };
}

function lifecycleContract(platform, architecture) {
  return Object.fromEntries(Object.entries(STAGE_DEFINITIONS).map(([stage, definition]) => [stage, {
    operationId: `sheikha.native.${platform}.${architecture}.${stage}.v3`,
    executionAdapterRequired: true,
    structuredArgvOnly: true,
    shellStringInterpolationAllowed: false,
    impact: definition.impact,
    approval: definition.approval,
    requiredInputs: ['runId', 'releaseIndexSha256', 'artifactSha256', 'evidenceRoot'],
    successCriteria: definition.success,
    evidenceFile: `${stage}-evidence.json`
  }]));
}

function createRunnerContract(definition) {
  const id = `SHEIKHA_NATIVE_RUNNER_${definition.platform.toUpperCase()}_${definition.architecture.toUpperCase()}_V3`;
  return {
    schemaVersion: '3.0.0',
    system: id,
    status: 'DECLARED',
    platform: definition.platform,
    architecture: definition.architecture,
    contractDefined: true,
    runnerImplementedByThisContract: false,
    externalPublishingAllowed: false,
    githubRequired: false,
    immutableInputsRequired: true,
    crossArchitectureRenameAcceptedAsBuild: false,
    executionFlow: [
      'HUMAN_APPROVAL',
      'GOVERNANCE_GATE',
      'CAPABILITY_CHECK',
      'EXECUTION_ADAPTER',
      'AUDIT_EVIDENCE'
    ],
    platformRequirements: platformRequirements(definition.platform, definition.architecture),
    lifecycle: lifecycleContract(definition.platform, definition.architecture),
    evidencePolicy: {
      retainBuildLogs: true,
      redactSecrets: true,
      sha256EveryArtifact: true,
      recordNativeArchitecture: true,
      recordInstallAndUninstall: true,
      recordUpgradeAndRollback: true,
      fabricatedEvidenceAllowed: false
    }
  };
}

function writeRunnerContracts() {
  return RUNNER_DEFINITIONS.map((definition) => {
    const filePath = path.join(DISTRIBUTION_ROOT, 'native-runners', definition.platform, definition.file);
    const contract = createRunnerContract(definition);
    writeJson(filePath, contract);
    return { ...definition, filePath, contract };
  });
}

module.exports = {
  RUNNER_DEFINITIONS,
  createRunnerContract,
  writeRunnerContracts
};
