'use strict';

const { buildTrustToolsStatus, planTrustOperation } = require('../runtime/sheikha-studio/core/sheikha-trust-tools-v1');

describe('Sheikha Trust Tools V1', () => {
  test('keeps upstream attribution while exposing original Sheikha trust tools', () => {
    const status = buildTrustToolsStatus();
    expect(status.nativeTools.map((tool) => tool.id)).toEqual(expect.arrayContaining([
      'SHEIKHA_TPM_STRUCTURE_PARSER',
      'SHEIKHA_ATTESTATION_VERIFIER',
      'SHEIKHA_TRUST_POLICY_GATE',
    ]));
    expect(status.licenseContract.upstreamComponentsRetainOriginalLicenses).toBe(true);
    expect(status.licenseContract.noRelicensingOrOwnershipClaimOverUpstreamCode).toBe(true);
    expect(status.productionReady).toBe(false);
  });

  test('builds a non-executing read-only TPM inspection plan', () => {
    const plan = planTrustOperation({ operation: 'INSPECT_TPM' });
    expect(plan.status).toBe('READ_ONLY_PLAN_READY');
    expect(plan.executionStarted).toBe(false);
    expect(plan.mutationAllowed).toBe(false);
    expect(plan.networkAllowed).toBe(false);
  });

  test('keeps high-impact disk encryption behind approval and recovery', () => {
    const plan = planTrustOperation({ operation: 'PLAN_DISK_ENCRYPTION' });
    expect(plan.status).toBe('HUMAN_AUTHORIZATION_REQUIRED');
    expect(plan.recoveryPlanRequired).toBe(true);
    expect(plan.explicitScopedApprovalRequired).toBe(true);
    expect(plan.executionStarted).toBe(false);
  });

  test('catalogs measured boot and supply-chain tools without claiming ownership', () => {
    const status = buildTrustToolsStatus();
    expect(status.nativeTools.map((tool) => tool.id)).toContain('SHEIKHA_SUPPLY_CHAIN_EVIDENCE_GATE');
    expect(status.upstreamInventory.map((tool) => tool.command)).toEqual(expect.arrayContaining([
      'tpm2_certify', 'systemd_measure', 'fwupdmgr', 'syft', 'cosign',
    ]));
    expect(status.licenseContract.upstreamComponentsRetainOriginalLicenses).toBe(true);
  });

  test('denies TPM clear through the normal planning path', () => {
    const plan = planTrustOperation({ operation: 'CLEAR_TPM' });
    expect(plan.status).toBe('DENIED_BY_DEFAULT_SEPARATE_BREAK_GLASS_PROCESS_REQUIRED');
    expect(plan.destructiveOperation).toBe(true);
    expect(plan.executionStarted).toBe(false);
    expect(plan.mutationAllowed).toBe(false);
  });
});
