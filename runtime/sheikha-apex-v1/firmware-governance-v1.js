'use strict';

const {buildPlatformReleaseCompatibility} = require('../../core/governance/sheikha-firmware-uefi-secure-boot-integration-v1');

const FIRMWARE_ACTIONS = Object.freeze({
  inspectSecureBoot: { mode: 'READ_ONLY', authorized: true },
  inspectUefiVariables: { mode: 'READ_ONLY', authorized: true },
  hashEfiArtifacts: { mode: 'READ_ONLY', authorized: true },
  inspectDbxCompatibility: { mode: 'READ_ONLY', authorized: true },
  inventoryFirmware: { mode: 'READ_ONLY', authorized: true },
  generateCompatibilityCandidate: { mode: 'PLAN_ONLY', authorized: true },
  generateRecoveryContract: { mode: 'PLAN_ONLY', authorized: true },
  stageFirmwareUpdate: {
    mode: 'HIGH_IMPACT_WRITE',
    authorized: false,
    requirement: 'HUMAN_AUTHORIZATION_AND_RECOVERY_CONTRACT_REQUIRED'
  },
  flashFirmware: {
    mode: 'HIGH_IMPACT_WRITE',
    authorized: false,
    requirement: 'EXPLICIT_DEVICE_BOUND_AUTHORIZATION_REQUIRED'
  },
  modifySecureBootKeys: {
    mode: 'HIGH_IMPACT_WRITE',
    authorized: false,
    requirement: 'EXPLICIT_DEVICE_BOUND_AUTHORIZATION_AND_RECOVERY_REQUIRED'
  }
});

function status() {
  return {
    system: 'SHEIKHA_FIRMWARE_GOVERNANCE_V1',
    state: 'READ_ONLY_GOVERNED_INSPECTION_ACTIVE_WRITES_LOCKED',
    firmwareWriteAuthorized: false,
    secureBootKeyMutationAuthorized: false,
    automaticFlashingAllowed: false,
    recoveryContractRequiredForWrites: true,
    actions: FIRMWARE_ACTIONS
  };
}

module.exports = { FIRMWARE_ACTIONS, buildPlatformReleaseCompatibility, status };
