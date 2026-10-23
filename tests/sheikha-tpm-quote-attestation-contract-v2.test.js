'use strict';

const { buildQuoteAttestationContract } = require('../core/governance/sheikha-tpm-quote-attestation-contract-v2');

describe('Sheikha TPM quote and attestation contract V2', () => {
  test('limits an authorized quote to one bound call', () => {
    const binding = { path: '/bounded', sha256: 'b'.repeat(64) };
    const contract = buildQuoteAttestationContract({
      activationResultSha256: 'a'.repeat(64),
      artifactBindings: { akContext: binding, akPublicPem: binding, akName: binding, akAuth: binding },
      nonce: 'c'.repeat(64),
      expiresAt: '2026-09-02T08:00:00.000Z',
    });
    expect(contract.allowedCommands).toEqual(['tpm2_quote']);
    expect(contract.maximumQuoteCalls).toBe(1);
    expect(contract.pcrSelection).toBe('sha256:0,2,4,7');
    expect(contract.forbidden).toContain('PCR_EXTEND');
    expect(contract.authorization.granted).toBe(false);
  });
});
