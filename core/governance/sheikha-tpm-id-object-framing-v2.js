'use strict';

const crypto = require('node:crypto');

function u16(value) {
  if (!Number.isInteger(value) || value < 0 || value > 0xffff) throw new Error('UINT16_RANGE');
  const buffer = Buffer.alloc(2);
  buffer.writeUInt16BE(value);
  return buffer;
}

function readTpm2b(buffer, offset, label) {
  if (!Buffer.isBuffer(buffer) || offset + 2 > buffer.length) throw new Error(`${label}_SIZE_TRUNCATED`);
  const size = buffer.readUInt16BE(offset);
  const start = offset + 2;
  const end = start + size;
  if (end > buffer.length) throw new Error(`${label}_DATA_TRUNCATED`);
  return { size, data: buffer.subarray(start, end), nextOffset: end };
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function repairLegacyTpm2bIdObjectFraming(legacyBlob) {
  const outer = readTpm2b(legacyBlob, 0, 'TPM2B_ID_OBJECT');
  if (outer.nextOffset !== legacyBlob.length) throw new Error('TPM2B_ID_OBJECT_TRAILING_BYTES');

  const integrityHmac = readTpm2b(outer.data, 0, 'INTEGRITY_HMAC');
  if (integrityHmac.size !== 32) throw new Error('SHA256_INTEGRITY_HMAC_REQUIRED');

  const legacyEncIdentity = readTpm2b(outer.data, integrityHmac.nextOffset, 'LEGACY_ENC_IDENTITY');
  if (legacyEncIdentity.nextOffset !== outer.data.length) {
    throw new Error('LEGACY_TPMS_ID_OBJECT_TRAILING_BYTES');
  }
  if (legacyEncIdentity.size === 0) throw new Error('ENC_IDENTITY_REQUIRED');

  const correctedPayload = Buffer.concat([
    u16(integrityHmac.size),
    integrityHmac.data,
    legacyEncIdentity.data,
  ]);
  const correctedBlob = Buffer.concat([u16(correctedPayload.length), correctedPayload]);

  return {
    correctedBlob,
    evidence: {
      system: 'SHEIKHA_TPM2B_ID_OBJECT_FRAMING_REPAIR_V2',
      status: 'LOCAL_FRAMING_REPAIRED_NOT_EXECUTED_ON_TPM',
      legacyBytes: legacyBlob.length,
      correctedBytes: correctedBlob.length,
      removedBytes: legacyBlob.length - correctedBlob.length,
      integrityHmacPreserved: true,
      encIdentityPreserved: true,
      legacySha256: sha256(legacyBlob),
      correctedSha256: sha256(correctedBlob),
      tpmAccessed: false,
      activationExecuted: false,
      physicalRetryAuthorized: false,
    },
  };
}

function packTpm2ToolsCredential(correctedCredentialBlob, encryptedSecret) {
  const credential = readTpm2b(correctedCredentialBlob, 0, 'CREDENTIAL_BLOB');
  const secret = readTpm2b(encryptedSecret, 0, 'ENCRYPTED_SECRET');
  if (credential.nextOffset !== correctedCredentialBlob.length) throw new Error('CREDENTIAL_BLOB_TRAILING_BYTES');
  if (secret.nextOffset !== encryptedSecret.length) throw new Error('ENCRYPTED_SECRET_TRAILING_BYTES');
  const header = Buffer.alloc(8);
  header.writeUInt32BE(0xbadcc0de, 0);
  header.writeUInt32BE(1, 4);
  return Buffer.concat([header, correctedCredentialBlob, encryptedSecret]);
}

module.exports = { repairLegacyTpm2bIdObjectFraming, packTpm2ToolsCredential };
