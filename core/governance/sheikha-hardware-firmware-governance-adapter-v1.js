'use strict';

const READ_ONLY_CAPABILITIES = Object.freeze([
  'FIRMWARE_ENUMERATE', 'UEFI_VARIABLE_READ', 'BOOT_ENTRY_READ', 'SECURE_BOOT_STATE_READ',
  'TPM_STATE_READ', 'BMC_SENSOR_READ', 'BMC_INVENTORY_READ', 'SMBIOS_READ',
  'ACPI_TABLE_READ', 'FIRMWARE_IMAGE_HASH', 'CAPSULE_METADATA_INSPECT'
]);
const MUTATING_CAPABILITIES = Object.freeze([
  'FIRMWARE_FLASH_WRITE', 'UEFI_VARIABLE_WRITE', 'BOOT_POLICY_CHANGE', 'CAPSULE_UPDATE_STAGE',
  'CAPSULE_UPDATE_APPLY', 'SECURE_BOOT_KEY_ENROLL', 'SECURE_BOOT_KEY_DELETE', 'TPM_CLEAR',
  'BMC_CONFIGURATION_WRITE', 'BMC_FIRMWARE_UPDATE', 'ROOT_OF_TRUST_POLICY_CHANGE', 'RECOVERY_IMAGE_ACTIVATE'
]);
const FIRMWARE_ARTIFACT_MUTATIONS = new Set([
  'FIRMWARE_FLASH_WRITE', 'CAPSULE_UPDATE_STAGE', 'CAPSULE_UPDATE_APPLY',
  'BMC_FIRMWARE_UPDATE', 'RECOVERY_IMAGE_ACTIVATE'
]);
const PHYSICAL_PRESENCE_OPERATIONS = new Set([
  'FIRMWARE_FLASH_WRITE', 'SECURE_BOOT_KEY_ENROLL', 'SECURE_BOOT_KEY_DELETE', 'TPM_CLEAR',
  'ROOT_OF_TRUST_POLICY_CHANGE', 'RECOVERY_IMAGE_ACTIVATE'
]);
const LEGACY_OPERATION_MAP = Object.freeze({
  FIRMWARE_INSPECT: 'FIRMWARE_ENUMERATE', FLASH_FIRMWARE: 'FIRMWARE_FLASH_WRITE',
  CAPSULE_UPDATE: 'CAPSULE_UPDATE_APPLY', BOOT_POLICY_PERSIST: 'BOOT_POLICY_CHANGE',
  BMC_INSPECT: 'BMC_INVENTORY_READ', BMC_COMMAND: 'BMC_CONFIGURATION_WRITE',
  PRODUCTION_KEY_ENROLLMENT: 'SECURE_BOOT_KEY_ENROLL', PHYSICAL_RECOVERY: 'RECOVERY_IMAGE_ACTIVATE'
});
const OPERATIONS = Object.freeze(Object.fromEntries([
  ...READ_ONLY_CAPABILITIES.map((name) => [name, {domain: name.startsWith('BMC_') ? 'BMC' : name.startsWith('TPM_') ? 'SECURITY' : 'FIRMWARE', mode: 'READ_ONLY', mutation: false, risk: 'READ_ONLY'}]),
  ...MUTATING_CAPABILITIES.map((name) => [name, {domain: name.startsWith('BMC_') ? 'BMC' : /^(SECURE_BOOT|TPM|ROOT_OF_TRUST)/.test(name) ? 'SECURITY' : 'FIRMWARE', mode: 'BOUNDED_MUTATION', mutation: true, risk: PHYSICAL_PRESENCE_OPERATIONS.has(name) ? 'CRITICAL' : 'HIGH'}])
]));

function planHardwareOperation(input) {
  const operation = LEGACY_OPERATION_MAP[input.operation] || input.operation;
  const policy = OPERATIONS[operation];
  if (!policy) return {decision: 'DENY', blockers: ['UNREGISTERED_HARDWARE_OPERATION']};
  const blockers = [];
  if (input.aiAuthorized === true) blockers.push('AI_CANNOT_AUTHORIZE_LOW_LEVEL_MUTATION');
  if (policy.mutation && input.humanApproval !== true) blockers.push('HUMAN_APPROVAL_REQUIRED');
  if (policy.mutation && !input.recoveryPlan) blockers.push('RECOVERY_PLAN_REQUIRED');
  if (policy.mutation && !input.exactTargetIdentity) blockers.push('EXACT_TARGET_IDENTITY_REQUIRED');
  if (policy.mutation && input.productionTarget === true && input.signingKeyClass !== 'PRODUCTION') blockers.push('DEVELOPMENT_KEY_DENIED_FOR_PRODUCTION');
  if (FIRMWARE_ARTIFACT_MUTATIONS.has(operation) && !/^[a-f0-9]{64}$/.test(input.artifactSha256 || '')) blockers.push('EXACT_ARTIFACT_SHA256_REQUIRED');
  if (FIRMWARE_ARTIFACT_MUTATIONS.has(operation) && input.signedArtifact !== true) blockers.push('SIGNED_ARTIFACT_REQUIRED');
  if (operation === 'FIRMWARE_FLASH_WRITE' && input.readbackBackupVerified !== true) blockers.push('READBACK_BACKUP_REQUIRED');
  if (policy.mutation && input.rollbackSupported === true && input.rollbackPolicy !== true) blockers.push('ROLLBACK_POLICY_REQUIRED');
  if (policy.mutation && input.antiRollbackPolicy !== true) blockers.push('ANTI_ROLLBACK_POLICY_REQUIRED');
  if (PHYSICAL_PRESENCE_OPERATIONS.has(operation) && input.physicalPresenceEvidence !== true) blockers.push('PHYSICAL_PRESENCE_EVIDENCE_REQUIRED');
  return {
    operation,
    decision: blockers.length ? 'DENY' : policy.mutation ? 'REQUIRE_GOVERNED_MUTATION_ROUTE' : 'REQUIRE_GOVERNED_READ_ONLY_ROUTE',
    blockers,
    policy,
    actualOperationPerformed: false
  };
}

module.exports = {LEGACY_OPERATION_MAP, MUTATING_CAPABILITIES, OPERATIONS, READ_ONLY_CAPABILITIES, planHardwareOperation};
