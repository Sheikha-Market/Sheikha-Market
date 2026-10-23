'use strict';

const crypto = require('node:crypto');

function buildActivateCredentialContract({ executionManifestFileSha256, artifactBindings, nonce, expiresAt }) {
  if (!/^[a-f0-9]{64}$/.test(String(executionManifestFileSha256 || ''))) throw new Error('EXECUTION_MANIFEST_SHA256_REQUIRED');
  if (!artifactBindings || !['akContext', 'ekContext', 'packedCredential', 'akAuth', 'expectedCredential']
    .every((name) => /^[a-f0-9]{64}$/.test(String(artifactBindings[name]?.sha256 || '')))) {
    throw new Error('COMPLETE_ARTIFACT_BINDINGS_REQUIRED');
  }
  if (!/^[a-f0-9]{32}$/.test(String(nonce || ''))) throw new Error('NONCE_REQUIRED');
  const base = {
    system: 'SHEIKHA_SINGLE_USE_ACTIVATECREDENTIAL_AUTHORIZATION_CONTRACT_V2',
    status: 'PREPARED_NOT_AUTHORIZED',
    device: '/dev/tpmrm0',
    executionManifestFileSha256,
    artifactBindings,
    nonce,
    expiresAt,
    allowedCommands: ['tpm2_startauthsession', 'tpm2_policysecret', 'tpm2_activatecredential', 'tpm2_flushcontext'],
    maximumActivateCredentialCalls: 1,
    successCondition: 'RECOVERED_CREDENTIAL_SHA256_EQUALS_EXPECTED_CREDENTIAL_SHA256',
    forbidden: [
      'TPM_CLEAR', 'PERSISTENT_HANDLE_CREATION', 'NV_WRITE', 'PCR_EXTEND',
      'FIRMWARE_CHANGE', 'SECURE_BOOT_CHANGE', 'NETWORK_ACCESS', 'SECOND_ACTIVATION_ATTEMPT',
    ],
    authorization: {
      variable: 'SHEIKHA_AUTHORIZE_SINGLE_USE_ACTIVATECREDENTIAL_V2',
      exactValue: 'YES',
      granted: false,
    },
  };
  return { ...base, contractSha256: crypto.createHash('sha256').update(JSON.stringify(base)).digest('hex') };
}

module.exports = { buildActivateCredentialContract };
