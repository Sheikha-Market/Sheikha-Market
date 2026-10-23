'use strict';

const crypto = require('node:crypto');

function buildQuoteAttestationContract({ activationResultSha256, artifactBindings, nonce, expiresAt }) {
  if (!/^[a-f0-9]{64}$/.test(String(activationResultSha256 || ''))) throw new Error('ACTIVATION_RESULT_SHA256_REQUIRED');
  if (!artifactBindings || !['akContext', 'akPublicPem', 'akName', 'akAuth']
    .every((name) => /^[a-f0-9]{64}$/.test(String(artifactBindings[name]?.sha256 || '')))) {
    throw new Error('COMPLETE_AK_BINDINGS_REQUIRED');
  }
  if (!/^[a-f0-9]{64}$/.test(String(nonce || ''))) throw new Error('QUOTE_NONCE_REQUIRED');
  if (!Number.isFinite(Date.parse(expiresAt))) throw new Error('VALID_EXPIRY_REQUIRED');
  const base = {
    system: 'SHEIKHA_SINGLE_USE_TPM_QUOTE_ATTESTATION_AUTHORIZATION_CONTRACT_V2',
    status: 'PREPARED_NOT_AUTHORIZED',
    device: '/dev/tpmrm0',
    activationResultSha256,
    artifactBindings,
    nonce,
    pcrSelection: 'sha256:0,2,4,7',
    signatureScheme: 'ecdsa',
    hashAlgorithm: 'sha256',
    expiresAt,
    allowedCommands: ['tpm2_quote'],
    maximumQuoteCalls: 1,
    verificationRequired: ['NONCE_MATCH', 'AK_SIGNATURE_VALID', 'TPMS_ATTEST_VALID', 'PCR_DIGEST_CONSISTENT'],
    forbidden: [
      'TPM_CLEAR', 'PERSISTENT_HANDLE_CREATION', 'NV_WRITE', 'PCR_EXTEND',
      'FIRMWARE_CHANGE', 'SECURE_BOOT_CHANGE', 'NETWORK_ACCESS', 'SECOND_QUOTE_ATTEMPT',
    ],
    authorization: {
      variable: 'SHEIKHA_AUTHORIZE_SINGLE_USE_TPM_QUOTE_ATTESTATION_V2',
      exactValue: 'YES',
      granted: false,
    },
  };
  return { ...base, contractSha256: crypto.createHash('sha256').update(JSON.stringify(base)).digest('hex') };
}

module.exports = { buildQuoteAttestationContract };
