'use strict';

const REQUIRED_TOOLS = Object.freeze([
  'tpm2_getcap', 'tpm2_pcrread', 'tpm2_createak', 'tpm2_readpublic', 'tpm2_quote'
]);

function resolveQuoteReadinessStatus(checks, readyForProductionAttestation) {
  if (readyForProductionAttestation) {
    return 'READY_FOR_SEPARATELY_AUTHORIZED_QUOTE_COLLECTION';
  }
  if (checks.tpm2SysfsPresent) return 'LOCAL_TPM_PREPARATION_REQUIRED';
  return 'TPM_NOT_EXPOSED_TO_CURRENT_OS';
}

function evaluateTpmQuoteReadiness(probes) {
  const toolAvailability = Object.fromEntries(REQUIRED_TOOLS.map((tool) => [
    tool, Boolean(probes.tools?.[tool])
  ]));
  const checks = {
    tpm2SysfsPresent: probes.tpm2SysfsPresent === true,
    tpmResourceManagerPresent: probes.tpmResourceManagerPresent === true,
    eventLogPresent: probes.eventLogPresent === true,
    eventLogReadable: probes.eventLogReadable === true,
    allRequiredToolsPresent: Object.values(toolAvailability).every(Boolean),
    secureBootEnabled: probes.secureBootEnabled === true,
    akEnrollmentRecordConfigured: probes.akEnrollmentRecordConfigured === true
  };
  const collectionChecks = [
    'tpm2SysfsPresent', 'tpmResourceManagerPresent', 'eventLogPresent',
    'eventLogReadable', 'allRequiredToolsPresent'
  ];
  const readyForReadOnlyCollection = collectionChecks.every((name) => checks[name]);
  const readyForGovernedQuote = readyForReadOnlyCollection &&
    checks.akEnrollmentRecordConfigured;
  const readyForProductionAttestation = readyForGovernedQuote &&
    checks.secureBootEnabled;
  const blockers = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name);

  return {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_TPM_QUOTE_READINESS_PREFLIGHT_V1',
    status: resolveQuoteReadinessStatus(
      checks,
      readyForProductionAttestation
    ),
    checks,
    toolAvailability,
    readiness: {
      readyForReadOnlyCollection,
      readyForGovernedQuote,
      readyForProductionAttestation
    },
    blockers,
    nextActions: blockers.map((blocker) => ({
      blocker,
      action: {
        tpm2SysfsPresent: 'VERIFY_FIRMWARE_TPM_ENABLEMENT_AND_OS_DRIVER',
        tpmResourceManagerPresent: 'EXPOSE_DEV_TPMRM0_WITH_LEAST_PRIVILEGE',
        eventLogPresent: 'ENABLE_AND_MOUNT_SECURITYFS_MEASURED_BOOT_LOG',
        eventLogReadable: 'GRANT_NARROW_READ_ACCESS_OR_EXPORT_WITH_PRIVILEGED_HELPER',
        allRequiredToolsPresent: 'INSTALL_PINNED_TPM2_TOOLS_AFTER_PACKAGE_REVIEW',
        secureBootEnabled: 'PLAN_SEPARATE_RECOVERABLE_SECURE_BOOT_ENROLLMENT',
        akEnrollmentRecordConfigured: 'CREATE_GOVERNED_AK_ENROLLMENT_RECORD_AFTER_AK_GENERATION'
      }[blocker]
    })),
    executionBoundary: {
      tpmCommandExecuted: false,
      akCreated: false,
      quoteCollected: false,
      secureBootChanged: false,
      firmwareMutationPerformed: false,
      networkUsed: false
    }
  };
}

module.exports = {REQUIRED_TOOLS, evaluateTpmQuoteReadiness};
