'use strict';

const crypto = require('node:crypto');

const TPM_GENERATED_VALUE = 0xff544347;
const TPM_ST_ATTEST_QUOTE = 0x8018;
const HASH_ALGORITHMS = Object.freeze({0x0004: 'sha1', 0x000b: 'sha256', 0x000c: 'sha384', 0x000d: 'sha512'});

class Cursor {
  constructor(buffer) { this.buffer = Buffer.from(buffer); this.offset = 0; }
  need(size) { if (this.offset + size > this.buffer.length) throw new Error('TRUNCATED_TPM_STRUCTURE'); }
  u8() { this.need(1); return this.buffer[this.offset++]; }
  u16() { this.need(2); const value = this.buffer.readUInt16BE(this.offset); this.offset += 2; return value; }
  u32() { this.need(4); const value = this.buffer.readUInt32BE(this.offset); this.offset += 4; return value; }
  u64() { this.need(8); const value = this.buffer.readBigUInt64BE(this.offset); this.offset += 8; return value; }
  bytes(size) { this.need(size); const value = this.buffer.subarray(this.offset, this.offset + size); this.offset += size; return value; }
  tpm2b(max = 65535) {
    const size = this.u16();
    if (size > max) {
      throw new Error('TPM2B_SIZE_LIMIT_EXCEEDED');
    }
    return this.bytes(size);
  }
  finish() { if (this.offset !== this.buffer.length) throw new Error('TRAILING_TPM_BYTES'); }
}

function readClockInfo(cursor) {
  const clockInfo = {
    clock: cursor.u64().toString(),
    resetCount: cursor.u32(),
    restartCount: cursor.u32(),
    safe: cursor.u8()
  };
  if (![0, 1].includes(clockInfo.safe)) {
    throw new Error('INVALID_CLOCK_SAFE_FLAG');
  }
  return clockInfo;
}

function readPcrSelection(cursor) {
  const hashAlgId = cursor.u16();
  const hashAlgorithm = HASH_ALGORITHMS[hashAlgId];
  if (!hashAlgorithm) throw new Error('UNSUPPORTED_PCR_HASH_ALGORITHM');
  const sizeofSelect = cursor.u8();
  if (sizeofSelect < 1 || sizeofSelect > 4) {
    throw new Error('INVALID_PCR_SELECT_SIZE');
  }
  const select = cursor.bytes(sizeofSelect);
  const selectedPcrs = [];
  for (let byte = 0; byte < select.length; byte += 1) {
    for (let bit = 0; bit < 8; bit += 1) {
      if ((select[byte] & (1 << bit)) !== 0) {
        selectedPcrs.push(byte * 8 + bit);
      }
    }
  }
  return {
    hashAlgId,
    hashAlgorithm,
    selectionHex: select.toString('hex'),
    selectedPcrs
  };
}

function readPcrSelections(cursor, selectionCount) {
  const selections = [];
  for (let selection = 0; selection < selectionCount; selection += 1) {
    selections.push(readPcrSelection(cursor));
  }
  return selections;
}

function parseTpmsAttestQuote(attestationData) {
  const cursor = new Cursor(attestationData);
  const magic = cursor.u32();
  if (magic !== TPM_GENERATED_VALUE) throw new Error('INVALID_TPM_GENERATED_MAGIC');
  const type = cursor.u16();
  if (type !== TPM_ST_ATTEST_QUOTE) throw new Error('ATTESTATION_TYPE_IS_NOT_QUOTE');
  const qualifiedSigner = cursor.tpm2b(1024);
  const extraData = cursor.tpm2b(4096);
  const clockInfo = readClockInfo(cursor);
  const firmwareVersion = cursor.u64().toString();
  const selectionCount = cursor.u32();
  if (selectionCount > 16) throw new Error('PCR_SELECTION_COUNT_LIMIT_EXCEEDED');
  const pcrSelections = readPcrSelections(cursor, selectionCount);
  const pcrDigest = cursor.tpm2b(128);
  cursor.finish();
  return {
    magic, type, qualifiedSigner: qualifiedSigner.toString('hex'), extraData,
    clockInfo, firmwareVersion, pcrSelections, pcrDigest: pcrDigest.toString('hex'),
    signedBytes: Buffer.from(attestationData)
  };
}

function parseTpm2bAttest(buffer) {
  const cursor = new Cursor(buffer);
  const attestationData = cursor.tpm2b(65535);
  cursor.finish();
  return parseTpmsAttestQuote(attestationData);
}

function verifySignedNonce(parsed, expectedNonce) {
  const expected = Buffer.from(expectedNonce);
  return parsed.extraData.length === expected.length && crypto.timingSafeEqual(parsed.extraData, expected);
}

function spkiSha256(publicKey) {
  const key = publicKey?.type === 'public' ? publicKey : crypto.createPublicKey(publicKey);
  return crypto.createHash('sha256').update(key.export({type: 'spki', format: 'der'})).digest('hex');
}

function verifyGovernancePinnedAk({akPublicKey, expectedSpkiSha256, enrollment}) {
  const fingerprint = spkiSha256(akPublicKey);
  const trusted = fingerprint === expectedSpkiSha256 && enrollment?.spkiSha256 === fingerprint &&
    Boolean(enrollment.platformId && enrollment.governanceDecisionId && enrollment.evidenceReferences?.length);
  return {trusted, profile: 'GOVERNANCE_PINNED_AK_V1', fingerprint, tpmResidencyProven: false, physicalPlatformIdentityProvenByPinAlone: false};
}

function certificateValidAt(certificate, now) {
  const timestamp = now.getTime();
  return Number.isFinite(timestamp) && timestamp >= Date.parse(certificate.validFrom) && timestamp <= Date.parse(certificate.validTo);
}

function verifyX509AkChain({akPublicKey, leafCertificatePem, rootCertificatePem, expectedRootSha256, now = new Date()}) {
  const leaf = new crypto.X509Certificate(leafCertificatePem);
  const root = new crypto.X509Certificate(rootCertificatePem);
  const rootFingerprint = crypto.createHash('sha256').update(root.raw).digest('hex');
  const leafMatchesAk = spkiSha256(leaf.publicKey) === spkiSha256(akPublicKey);
  const rootIsCa = root.ca === true;
  const rootIsSelfIssued = root.checkIssued(root);
  const leafIssuedByRoot = leaf.checkIssued(root);
  const rootValidAtVerificationTime = certificateValidAt(root, now);
  const leafValidAtVerificationTime = certificateValidAt(leaf, now);
  const trusted = rootFingerprint === String(expectedRootSha256 || '').toLowerCase() && rootIsCa &&
    rootIsSelfIssued && leafIssuedByRoot && rootValidAtVerificationTime && leafValidAtVerificationTime &&
    root.verify(root.publicKey) && leaf.verify(root.publicKey) && leafMatchesAk;
  return {
    trusted, profile: 'X509_CHAIN_PLUS_PINNED_AK_V1', rootFingerprint, leafMatchesAk,
    rootIsCa, rootIsSelfIssued, leafIssuedByRoot, rootValidAtVerificationTime,
    leafValidAtVerificationTime, tpmResidencyProven: false,
    physicalPlatformIdentityProvenByCertificateAlone: false
  };
}

module.exports = {
  HASH_ALGORITHMS, TPM_GENERATED_VALUE, TPM_ST_ATTEST_QUOTE, parseTpm2bAttest,
  parseTpmsAttestQuote, spkiSha256, verifyGovernancePinnedAk, verifySignedNonce, verifyX509AkChain
};
