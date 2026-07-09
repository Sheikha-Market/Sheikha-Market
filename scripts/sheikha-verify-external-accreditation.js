#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

function buildSignaturePayload(pack) {
  return JSON.stringify({
    packId: pack.packId,
    serial: pack.serial,
    generatedAt: pack.generatedAt,
    scope: pack.scope,
    methodologyReadiness: pack.methodologyReadiness,
    submissionControlMatrix: pack.submissionControlMatrix,
    localAccreditationTargets: pack.localAccreditationTargets,
    internationalAccreditationTargets: pack.internationalAccreditationTargets,
    standardsMatrix: pack.standardsMatrix,
    scientificMethodologies: pack.scientificMethodologies,
    requiredEvidence: pack.requiredEvidence
  });
}

function parseSha256Signature(signatureValue) {
  if (typeof signatureValue !== 'string') {
    return null;
  }
  const match = /^sha256:([a-f0-9]{64})$/i.exec(signatureValue.trim());
  return match ? match[1].toLowerCase() : null;
}

function main() {
  const repoRoot = process.cwd();
  const inputPath = process.argv[2] || path.join('reports', 'SHEIKHA-EXTERNAL-ACCREDITATION-LATEST.json');
  const resolvedInputPath = path.resolve(repoRoot, inputPath);
  const verificationPath = path.join(
    repoRoot,
    'runtime',
    'master-activation',
    'sheikha-master-external-accreditation-verification-v1.json'
  );

  if (!fs.existsSync(resolvedInputPath)) {
    throw new Error(`Accreditation pack file not found: ${inputPath}`);
  }

  const pack = JSON.parse(fs.readFileSync(resolvedInputPath, 'utf8'));
  const signaturePayload = buildSignaturePayload(pack);

  const expectedHash = crypto.createHash('sha256').update(signaturePayload).digest('hex');
  const providedHash = parseSha256Signature(pack?.digitalRecord?.signature);
  const hashValid = providedHash === expectedHash;

  const attestationMode = pack?.digitalRecord?.attestation?.mode || 'hash-only';
  let asymmetricValid = null;
  let asymmetricDetails = null;

  if (attestationMode === 'asymmetric') {
    const defaultPublicKeyPath = path.join(repoRoot, 'security', 'keys', 'sheikha-accreditation-signing-public.pem');
    const publicKeyPath = process.env.SHEIKHA_ACCREDITATION_PUBLIC_KEY_PATH || defaultPublicKeyPath;
    if (!fs.existsSync(publicKeyPath)) {
      asymmetricValid = false;
      asymmetricDetails = 'public key file is missing';
    } else {
      const publicKeyPem = fs.readFileSync(publicKeyPath, 'utf8');
      const detachedSignature = pack?.digitalRecord?.attestation?.signature;
      if (typeof detachedSignature !== 'string' || detachedSignature.length === 0) {
        asymmetricValid = false;
        asymmetricDetails = 'detached signature is missing';
      } else {
        asymmetricValid = crypto.verify(
          'sha256',
          Buffer.from(signaturePayload, 'utf8'),
          publicKeyPem,
          Buffer.from(detachedSignature, 'base64')
        );
        const fingerprint = `sha256:${crypto.createHash('sha256').update(publicKeyPem).digest('hex')}`;
        asymmetricDetails = {
          publicKeyPath: path.relative(repoRoot, publicKeyPath),
          publicKeyFingerprint: fingerprint,
          expectedFingerprint: pack?.digitalRecord?.attestation?.publicKeyFingerprint || null,
          fingerprintMatch: (pack?.digitalRecord?.attestation?.publicKeyFingerprint || null) === fingerprint
        };
      }
    }
  }

  const valid = hashValid && (attestationMode !== 'asymmetric' || asymmetricValid === true);
  const result = {
    status: valid ? 'valid' : 'invalid',
    valid,
    file: path.relative(repoRoot, resolvedInputPath),
    packId: pack?.packId || null,
    serial: pack?.serial || null,
    checks: {
      hashValid,
      attestationMode,
      asymmetricValid
    },
    details: {
      expectedHash: `sha256:${expectedHash}`,
      providedHash: pack?.digitalRecord?.signature || null,
      asymmetricDetails
    },
    submission: {
      methodologyReadinessSource: pack?.scope?.masterMethodologyReadinessArtifact || pack?.submissionControlMatrix?.sourceArtifact || null,
      methodologyReadinessScore: pack?.methodologyReadiness?.readinessScore ?? null,
      localAccreditationTargets: Array.isArray(pack?.localAccreditationTargets) ? pack.localAccreditationTargets.length : 0,
      internationalAccreditationTargets: Array.isArray(pack?.internationalAccreditationTargets) ? pack.internationalAccreditationTargets.length : 0,
      externalCertificatesIssued: pack?.submissionControlMatrix?.externalCertificatesIssuedByThisPack ?? 0,
      externalAuthorityApprovalRequired: pack?.submissionControlMatrix?.externalAuthorityApprovalRequired ?? true
    }
  };

  fs.mkdirSync(path.dirname(verificationPath), { recursive: true });
  fs.writeFileSync(verificationPath, `${JSON.stringify({
    system: 'SHEIKHA_MASTER_EXTERNAL_ACCREDITATION_VERIFICATION_V1',
    generatedAt: new Date().toISOString(),
    ...result
  }, null, 2)}\n`, 'utf8');

  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);

  if (!valid) {
    process.exit(1);
  }
}

try {
  main();
} catch (error) {
  console.error(String(error.message || error));
  process.exit(1);
}
