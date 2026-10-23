'use strict';

const { buildActivateCredentialContract } = require('../core/governance/sheikha-tpm-activatecredential-contract-v2');

describe('Sheikha single-use ActivateCredential contract V2', () => {
  test('binds all artifacts and permits exactly one activation', () => {
    const binding = Object.fromEntries(['akContext', 'ekContext', 'packedCredential', 'akAuth', 'expectedCredential']
      .map((name) => [name, { path: name, sha256: 'a'.repeat(64) }]));
    const contract = buildActivateCredentialContract({
      executionManifestFileSha256: 'b'.repeat(64),
      artifactBindings: binding,
      nonce: 'c'.repeat(32),
      expiresAt: '2026-09-02T06:00:00.000Z',
    });
    expect(contract.maximumActivateCredentialCalls).toBe(1);
    expect(contract.allowedCommands).toContain('tpm2_flushcontext');
    expect(contract.forbidden).toContain('SECOND_ACTIVATION_ATTEMPT');
    expect(contract.authorization.granted).toBe(false);
  });
});
