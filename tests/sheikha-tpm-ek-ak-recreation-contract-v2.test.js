'use strict';

const { buildEkAkRecreationContract } = require('../core/governance/sheikha-tpm-ek-ak-recreation-contract-v2');

describe('Sheikha TPM EK/AK recreation contract V2', () => {
  test('separates recreation from activation and denies persistence', () => {
    const contract = buildEkAkRecreationContract({ inventoryReportSha256: 'a'.repeat(64) });
    expect(contract.status).toBe('PREPARED_AWAITING_EXPLICIT_MUTATION_AUTHORIZATION');
    expect(contract.allowedCommands).not.toContain('tpm2_activatecredential');
    expect(contract.forbiddenCommands).toContain('tpm2_clear');
    expect(contract.controls).toMatchObject({
      persistentHandleCreationAllowed: false,
      networkAllowed: false,
      previousContextsReusable: false,
      activateCredentialIncludedInThisAuthorization: false,
    });
    expect(contract.requiredAuthorization.granted).toBe(false);
  });

  test('rejects unbound inventory evidence and another device', () => {
    expect(() => buildEkAkRecreationContract({ inventoryReportSha256: 'bad' })).toThrow();
    expect(() => buildEkAkRecreationContract({
      inventoryReportSha256: 'a'.repeat(64),
      device: '/dev/tpm0',
    })).toThrow('ONLY_TPMRM0_SUPPORTED');
  });
});
