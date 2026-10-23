'use strict';

const READ_ONLY = new Set([
  'tpm2_getcap', 'tpm2_pcrread', 'tpm2_readpublic', 'tpm2_quote', 'tpm2_nvread'
]);

const HIGH_IMPACT = new Set([
  'tpm2_createek', 'tpm2_createak', 'tpm2_createprimary', 'tpm2_activatecredential',
  'tpm2_evictcontrol', 'tpm2_clear', 'tpm2_nvwrite', 'tpm2_pcrextend',
  'tpm2_hierarchychangeauth'
]);

function classifyCommand(command) {
  const cmd = String(command || '').trim().split(/\s+/)[0];
  if (READ_ONLY.has(cmd)) return { command: cmd, class: 'READ_ONLY', defaultAuthorized: true };
  if (HIGH_IMPACT.has(cmd)) {
    return {
      command: cmd,
      class: 'HIGH_IMPACT_TPM_OPERATION',
      defaultAuthorized: false,
      requirement: 'DEVICE_BOUND_SINGLE_USE_EXPLICIT_AUTHORIZATION'
    };
  }
  return { command: cmd, class: 'UNKNOWN', defaultAuthorized: false };
}

function status() {
  return {
    system: 'SHEIKHA_TPM_GOVERNANCE_V1',
    physicalTpmPresentInTrack: true,
    trustToolsIntegrated: true,
    attestationState: 'ACTIVATECREDENTIAL_INTEROP_REPAIR_PENDING',
    previousSingleCaptureAuthorizationConsumed: true,
    previousSingleCaptureRerunAllowed: false,
    lastObservedFailure: {
      responseCode: '0x000001df',
      decoded: 'parameter(1): integrity check failed'
    },
    provenInteropDefect: 'REDUNDANT_TPM2B_LENGTH_PREFIX_AROUND_ENCIDENTITY',
    tpmClearAuthorized: false,
    persistentHandleCreationAuthorized: false,
    activateCredentialAuthorizedNow: false
  };
}

module.exports = { classifyCommand, status };
