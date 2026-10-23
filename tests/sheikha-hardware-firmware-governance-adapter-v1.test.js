'use strict';

const {MUTATING_CAPABILITIES, OPERATIONS, READ_ONLY_CAPABILITIES, planHardwareOperation} = require('../core/governance/sheikha-hardware-firmware-governance-adapter-v1');

describe('Sheikha hardware and firmware governance adapter V1', () => {
  test('registers 11 read-only and 12 mutating capabilities', () => {
    expect(READ_ONLY_CAPABILITIES).toHaveLength(11);
    expect(MUTATING_CAPABILITIES).toHaveLength(12);
    expect(Object.keys(OPERATIONS)).toHaveLength(23);
    expect(OPERATIONS.FIRMWARE_ENUMERATE.mode).toBe('READ_ONLY');
    expect(OPERATIONS.FIRMWARE_FLASH_WRITE.risk).toBe('CRITICAL');
  });

  test('allows planning read-only inspection without activating execution', () => {
    expect(planHardwareOperation({operation: 'FIRMWARE_INSPECT'})).toMatchObject({decision: 'REQUIRE_GOVERNED_READ_ONLY_ROUTE', blockers: []});
  });

  test('denies unsafe flash and reports every missing protection', () => {
    const result = planHardwareOperation({operation: 'FLASH_FIRMWARE'});
    expect(result.decision).toBe('DENY');
    expect(result.blockers).toEqual(expect.arrayContaining(['HUMAN_APPROVAL_REQUIRED', 'RECOVERY_PLAN_REQUIRED', 'EXACT_TARGET_IDENTITY_REQUIRED', 'EXACT_ARTIFACT_SHA256_REQUIRED', 'SIGNED_ARTIFACT_REQUIRED', 'READBACK_BACKUP_REQUIRED', 'ANTI_ROLLBACK_POLICY_REQUIRED', 'PHYSICAL_PRESENCE_EVIDENCE_REQUIRED']));
  });

  test('requires anti-rollback and physical presence for sensitive changes', () => {
    expect(planHardwareOperation({operation: 'BMC_CONFIGURATION_WRITE', humanApproval: true, recoveryPlan: 'r', exactTargetIdentity: 'b'}).blockers).toContain('ANTI_ROLLBACK_POLICY_REQUIRED');
    expect(planHardwareOperation({operation: 'SECURE_BOOT_KEY_ENROLL', humanApproval: true, recoveryPlan: 'r', exactTargetIdentity: 'b', antiRollbackPolicy: true}).blockers).toContain('PHYSICAL_PRESENCE_EVIDENCE_REQUIRED');
  });

  test('never treats a complete plan as physical execution', () => {
    const result = planHardwareOperation({operation: 'FIRMWARE_FLASH_WRITE', humanApproval: true, recoveryPlan: 'r', exactTargetIdentity: 'b', artifactSha256: 'a'.repeat(64), signedArtifact: true, readbackBackupVerified: true, antiRollbackPolicy: true, physicalPresenceEvidence: true});
    expect(result).toMatchObject({decision: 'REQUIRE_GOVERNED_MUTATION_ROUTE', blockers: []});
    expect(result.actualOperationPerformed).toBe(false);
  });
});
