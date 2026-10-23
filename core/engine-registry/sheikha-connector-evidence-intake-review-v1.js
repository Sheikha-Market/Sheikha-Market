'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const CONFIG_PATH = path.join(
  ROOT,
  'config/sheikha-connector-evidence-intake-review-v1.json'
);

const {
  buildConnectorIdentityEvidenceBinding,
  getConnectorIdentityBinding,
} = require('./sheikha-connector-identity-evidence-binding-v1');
const {
  evaluateReviewerAuthority,
} = require('./sheikha-reviewer-authority-registry-v1');

function readJson(relativePath) {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, relativePath), 'utf8')
  );
}

function readConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

function clean(value, max = 500) {
  return String(value || '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

function cleanList(value, maxItems = 50, maxLength = 160) {
  if (!Array.isArray(value)) return [];
  return [...new Set(
    value
      .filter(Boolean)
      .slice(0, maxItems)
      .map((item) => clean(item, maxLength))
      .filter(Boolean)
  )];
}

function containsForbiddenSecretMaterial(input) {
  if (!input || typeof input !== 'object') return false;
  const forbidden = /(?:password|passwd|token|api[_-]?key|secret|private[_-]?key|credential[_-]?value|access[_-]?key)/i;

  const walk = (value) => {
    if (!value || typeof value !== 'object') return false;
    for (const [key, nested] of Object.entries(value)) {
      if (forbidden.test(key)) return true;
      if (nested && typeof nested === 'object' && walk(nested)) return true;
    }
    return false;
  };

  return walk(input);
}

function isSha256Digest(value) {
  return /^[a-f0-9]{64}$/i.test(String(value || ''));
}

function isFutureOrOpen(expiresAt) {
  if (!expiresAt) return true;
  const timestamp = new Date(expiresAt).getTime();
  return Number.isFinite(timestamp) && timestamp > Date.now();
}

function stableEvidenceId(input) {
  const source = JSON.stringify({
    connectorId: clean(input.connectorId, 160),
    kind: clean(input.kind, 80),
    sourceRef: clean(input.sourceRef, 500),
    signerIdentity: clean(input.signerIdentity, 240),
    ownerIdentity: clean(input.ownerIdentity, 240),
    issuedAt: clean(input.issuedAt, 80),
  });
  return 'evc-' + crypto.createHash('sha256')
    .update(source)
    .digest('hex')
    .slice(0, 16);
}

function prepareEvidenceIntake(input = {}) {
  const config = readConfig();

  if (containsForbiddenSecretMaterial(input)) {
    return {
      system: config.system,
      status: 'INTAKE_DENIED',
      decision: 'DENY',
      reason: 'SECRET_OR_CREDENTIAL_MATERIAL_FORBIDDEN',
      persisted: false,
      verified: false,
      approved: false,
    };
  }

  const connectorId = clean(input.connectorId, 160);
  const kind = clean(input.kind, 80).toUpperCase();
  const binding = getConnectorIdentityBinding(connectorId);

  if (!connectorId || !binding) {
    return {
      system: config.system,
      status: 'INTAKE_DENIED',
      decision: 'DENY',
      reason: !connectorId
        ? 'CONNECTOR_ID_REQUIRED'
        : 'CONNECTOR_NOT_REGISTERED',
      connectorId: connectorId || null,
      persisted: false,
      verified: false,
      approved: false,
    };
  }

  if (!config.evidenceKinds.includes(kind)) {
    return {
      system: config.system,
      status: 'INTAKE_DENIED',
      decision: 'DENY',
      reason: 'UNSUPPORTED_EVIDENCE_KIND',
      connectorId,
      kind,
      persisted: false,
      verified: false,
      approved: false,
    };
  }

  const operations = cleanList(input.operations)
    .map((item) => item.toUpperCase());
  const domains = cleanList(input.domains);
  const issuedAt = clean(input.issuedAt, 80) || null;
  const expiresAt = clean(input.expiresAt, 80) || null;
  const signerIdentity = clean(input.signerIdentity, 240) || null;
  const ownerIdentity = clean(input.ownerIdentity, 240) || null;
  const evidenceRegistryRef =
    clean(input.evidenceRegistryRef, 240) || null;
  const sourceRef = clean(input.sourceRef, 500) || null;
  const digest = clean(input.integrity?.digest, 128);
  const algorithm =
    clean(input.integrity?.algorithm, 32).toUpperCase();
  const signatureStatus =
    clean(input.signature?.status, 80).toUpperCase() || 'PENDING';
  const signatureSigner =
    clean(input.signature?.signerIdentity, 240) || null;

  const candidate = {
    evidenceId:
      clean(input.evidenceId, 180) || stableEvidenceId(input),
    connectorId,
    connectorIdentity: binding.connectorIdentity,
    kind,
    ownerRole: binding.ownerRole,
    ownerIdentity,
    signerIdentity,
    sourceRef,
    evidenceRegistryRef,
    domains,
    operations,
    issuedAt,
    expiresAt,
    integrity: {
      algorithm: algorithm || null,
      digest: digest || null,
    },
    signature: {
      status: signatureStatus,
      signerIdentity: signatureSigner,
    },
    review: {
      decision: 'PENDING',
      reviewerIdentity: null,
      reviewedAt: null,
      reviewEvidenceRef: null,
    },
    status: 'REVIEW_PENDING',
    persisted: false,
    verified: false,
    approved: false,
  };

  const intakeChecks = {
    sourceRefPresent: Boolean(sourceRef),
    signerIdentityPresent: Boolean(signerIdentity),
    ownerIdentityPresent: Boolean(ownerIdentity),
    scopePresent:
      domains.length > 0 && operations.length > 0,
    evidenceRegistryRefPresent: Boolean(evidenceRegistryRef),
    integrityShapeValid:
      algorithm === 'SHA-256' && isSha256Digest(digest),
    signatureMetadataPresent: Boolean(signatureSigner),
    expiryValid: isFutureOrOpen(expiresAt),
  };

  const missing = Object.entries(intakeChecks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name);

  candidate.intakeChecks = intakeChecks;
  candidate.intakeMissing = missing;
  candidate.status = missing.length === 0
    ? 'REVIEW_PENDING'
    : 'INTAKE_REVIEW_REQUIRED';

  return {
    system: config.system,
    status: candidate.status,
    decision: 'REVIEW',
    candidate,
    persisted: false,
    verified: false,
    approved: false,
    nextAction: 'HUMAN_REVIEW_REQUIRED',
  };
}

function evaluateReviewCandidate(candidate = {}, reviewInput = {}) {
  const config = readConfig();
  const connectorId = clean(candidate.connectorId, 160);
  const binding = getConnectorIdentityBinding(connectorId);

  if (!binding) {
    return {
      system: config.system,
      decision: 'REJECTED',
      status: 'REVIEW_REJECTED',
      reason: 'CONNECTOR_NOT_REGISTERED',
      persisted: false,
      promoted: false,
    };
  }

  const requestedDecision = clean(
    reviewInput.decision || 'PENDING',
    40
  ).toUpperCase();

  if (!config.reviewDecisions.includes(requestedDecision)) {
    return {
      system: config.system,
      connectorId,
      decision: 'REJECTED',
      status: 'REVIEW_REJECTED',
      reason: 'UNSUPPORTED_REVIEW_DECISION',
      persisted: false,
      promoted: false,
    };
  }

  const reviewerIdentity =
    clean(reviewInput.reviewerIdentity, 240) || null;
  const reviewEvidenceRef =
    clean(reviewInput.reviewEvidenceRef, 240) || null;
  const reviewedAt =
    clean(reviewInput.reviewedAt, 80) || null;

  const scopeMatch =
    Array.isArray(candidate.domains) &&
    binding.domains.every(
      (domain) => candidate.domains.includes(domain)
    ) &&
    Array.isArray(candidate.operations) &&
    candidate.operations.includes('READ');

  const reviewerAuthority = evaluateReviewerAuthority({
    reviewerIdentity,
    evidenceKind: candidate.kind,
    domains: candidate.domains || [],
    decision: requestedDecision,
    signerIdentity: candidate.signerIdentity,
    ownerIdentity: candidate.ownerIdentity,
  });

  const approvalChecks = {
    reviewerIdentityPresent: Boolean(reviewerIdentity),
    reviewerAuthority:
      requestedDecision === 'PENDING' ||
      reviewerAuthority.authorizedReviewer === true,
    reviewerEvidencePresent: Boolean(reviewEvidenceRef),
    ownerIdentityPresent: Boolean(candidate.ownerIdentity),
    signerIdentityPresent: Boolean(candidate.signerIdentity),
    evidenceRegistryRefPresent:
      Boolean(candidate.evidenceRegistryRef),
    sha256Integrity:
      candidate.integrity?.algorithm === 'SHA-256' &&
      isSha256Digest(candidate.integrity?.digest),
    signatureVerified:
      candidate.signature?.status === 'VERIFIED' &&
      Boolean(candidate.signature?.signerIdentity),
    scopeMatch,
    expiryValid: isFutureOrOpen(candidate.expiresAt),
  };

  const missing = Object.entries(approvalChecks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name);

  let effectiveDecision = requestedDecision;
  let status = 'REVIEW_PENDING';
  let reason = 'HUMAN_REVIEW_PENDING';

  if (requestedDecision === 'APPROVED') {
    if (missing.length > 0) {
      effectiveDecision = 'PENDING';
      status = 'APPROVAL_BLOCKED';
      reason = 'APPROVAL_EVIDENCE_INCOMPLETE';
    } else {
      status = 'REVIEW_APPROVED';
      reason = 'APPROVED_FOR_LEDGER_PROJECTION_ONLY';
    }
  } else if (requestedDecision === 'REJECTED') {
    status = 'REVIEW_REJECTED';
    reason = 'HUMAN_REVIEW_REJECTED';
  }

  const record = {
    ...candidate,
    review: {
      decision: effectiveDecision,
      reviewerIdentity,
      reviewedAt,
      reviewEvidenceRef,
    },
    verification: {
      status:
        effectiveDecision === 'APPROVED' &&
        missing.length === 0
          ? 'VERIFIED'
          : 'NOT_VERIFIED',
      checks: approvalChecks,
      reviewerAuthority,
      missing,
    },
    status,
    persisted: false,
    approved:
      effectiveDecision === 'APPROVED' &&
      missing.length === 0,
  };

  return {
    system: config.system,
    connectorId,
    decision: effectiveDecision,
    status,
    reason,
    record,
    persisted: false,
    promoted: false,
    authorizationGranted: false,
    liveGranted: false,
  };
}

function queueStatus() {
  const config = readConfig();
  const queue = readJson(config.queueSource);
  const records = Array.isArray(queue.records)
    ? queue.records
    : [];

  return {
    system: config.system,
    status: 'CLEAR',
    queue: queue.registry,
    mode: config.mode,
    summary: {
      records: records.length,
      pending: records.filter(
        (item) => item.review?.decision === 'PENDING'
      ).length,
      approved: records.filter(
        (item) => item.review?.decision === 'APPROVED'
      ).length,
      rejected: records.filter(
        (item) => item.review?.decision === 'REJECTED'
      ).length,
      verifiedApproved: records.filter(
        (item) =>
          item.review?.decision === 'APPROVED' &&
          item.verification?.status === 'VERIFIED'
      ).length,
    },
    governance: config.governance,
    records,
  };
}

function projectApprovedEvidenceLedger() {
  const config = readConfig();
  const queue = readJson(config.queueSource);
  const records = (queue.records || []).filter(
    (item) =>
      item.review?.decision === 'APPROVED' &&
      item.verification?.status === 'VERIFIED' &&
      item.evidenceRegistryRef &&
      item.integrity?.algorithm === 'SHA-256' &&
      isSha256Digest(item.integrity?.digest) &&
      item.signature?.status === 'VERIFIED' &&
      item.signature?.signerIdentity &&
      item.ownerIdentity &&
      isFutureOrOpen(item.expiresAt)
  );

  return {
    registry: config.approvedLedgerProjection,
    status: records.length > 0
      ? 'ACTIVE_APPROVED_PROJECTION'
      : 'ACTIVE_EMPTY_LEDGER',
    sourceQueue: config.queueSource,
    records: records.map((item) => ({
      evidenceId: item.evidenceId,
      connectorId: item.connectorId,
      kind: item.kind,
      status: 'VERIFIED',
      ownerIdentity: item.ownerIdentity,
      signerIdentity: item.signerIdentity,
      evidenceRegistryRef: item.evidenceRegistryRef,
      domains: item.domains,
      operations: item.operations,
      issuedAt: item.issuedAt,
      expiresAt: item.expiresAt,
      integrity: item.integrity,
      signature: item.signature,
      review: item.review,
    })),
    governance: {
      projectionOnly: true,
      sourceMustBeHumanReviewed: true,
      noAutomaticAuthorization: true,
      noAutomaticLivePromotion: true,
      principle: config.governance.principle,
    },
  };
}

module.exports = {
  evaluateReviewCandidate,
  prepareEvidenceIntake,
  projectApprovedEvidenceLedger,
  queueStatus,
};
