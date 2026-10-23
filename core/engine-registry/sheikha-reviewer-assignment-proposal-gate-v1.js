'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const CONFIG_PATH = path.join(
  ROOT,
  'config/sheikha-reviewer-assignment-proposal-gate-v1.json'
);

const {
  buildReviewerAuthorityRegistry,
} = require('./sheikha-reviewer-authority-registry-v1');

function readJson(relativePath) {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, relativePath), 'utf8')
  );
}

function readConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

function clean(value, max = 300) {
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

function isSha256(value) {
  return /^[a-f0-9]{64}$/i.test(String(value || ''));
}

function proposalId(input) {
  const payload = JSON.stringify({
    reviewerIdentity: clean(input.reviewerIdentity, 240),
    authorityRole: clean(input.authorityRole, 120),
    proposedBy: clean(input.proposedBy, 240),
    evidenceRef: clean(input.proposalEvidenceRef, 240),
  });

  return 'rap-' + crypto
    .createHash('sha256')
    .update(payload)
    .digest('hex')
    .slice(0, 16);
}

function prepareAssignmentProposal(input = {}) {
  const config = readConfig();
  const reviewerRegistry = buildReviewerAuthorityRegistry();

  const reviewerIdentity = clean(input.reviewerIdentity, 240);
  const authorityRole = clean(input.authorityRole, 120);
  const baseIdentityRole = clean(input.baseIdentityRole, 120);
  const proposedBy = clean(input.proposedBy, 240);
  const proposalEvidenceRef = clean(input.proposalEvidenceRef, 240);
  const domains = cleanList(input.domains);
  const evidenceKinds = cleanList(input.evidenceKinds)
    .map((item) => item.toUpperCase());
  const expiresAt = clean(input.expiresAt, 80) || null;

  const role = reviewerRegistry.roles.find(
    (item) => item.id === authorityRole
  );

  if (!reviewerIdentity || !authorityRole || !proposedBy) {
    return {
      system: config.system,
      state: 'REVIEW_REQUIRED',
      decision: 'DENY',
      reason: 'PROPOSAL_IDENTITY_ROLE_AND_PROPOSER_REQUIRED',
      persisted: false,
      assignmentCreated: false,
    };
  }

  if (!role) {
    return {
      system: config.system,
      reviewerIdentity,
      authorityRole,
      state: 'REVIEW_REQUIRED',
      decision: 'DENY',
      reason: 'UNKNOWN_AUTHORITY_ROLE',
      persisted: false,
      assignmentCreated: false,
    };
  }

  const checks = {
    proposalEvidencePresent: Boolean(proposalEvidenceRef),
    baseIdentityRoleAllowed:
      role.baseIdentityRoles.includes(baseIdentityRole),
    domainsWithinRole:
      role.domains.includes('*') ||
      domains.every((domain) => role.domains.includes(domain)),
    evidenceKindsWithinRole:
      role.evidenceKinds.includes('*') ||
      evidenceKinds.every((kind) => role.evidenceKinds.includes(kind)),
    selfProposalSeparated:
      proposedBy !== reviewerIdentity,
  };

  const missing = Object.entries(checks)
    .filter(([, ok]) => !ok)
    .map(([name]) => name);

  return {
    system: config.system,
    version: config.version,
    proposal: {
      proposalId: clean(input.proposalId, 180) || proposalId(input),
      reviewerIdentity,
      authorityRole,
      baseIdentityRole,
      proposedBy,
      proposalEvidenceRef,
      domains,
      evidenceKinds,
      expiresAt,
      state: 'PROPOSED',
      review: {
        state: missing.length === 0
          ? 'REVIEW_REQUIRED'
          : 'PROPOSAL_INCOMPLETE',
        checks,
        missing,
      },
    },
    state: missing.length === 0
      ? 'PROPOSED'
      : 'REVIEW_REQUIRED',
    decision: missing.length === 0 ? 'REVIEW' : 'DENY',
    reason: missing.length === 0
      ? 'HUMAN_RATIFICATION_REQUIRED'
      : 'PROPOSAL_SCOPE_OR_EVIDENCE_INCOMPLETE',
    persisted: false,
    assignmentCreated: false,
  };
}

function evaluateAssignmentRatification(proposal = {}, input = {}) {
  const config = readConfig();
  const registry = buildReviewerAuthorityRegistry();

  const ratifierIdentity = clean(input.ratifierIdentity, 240);
  const ratificationEvidenceRef = clean(
    input.ratificationEvidenceRef,
    240
  );
  const integrityAlgorithm = clean(
    input.integrity?.algorithm,
    32
  ).toUpperCase();
  const integrityDigest = clean(
    input.integrity?.digest,
    128
  );
  const signatureStatus = clean(
    input.signature?.status,
    80
  ).toUpperCase();
  const signerIdentity = clean(
    input.signature?.signerIdentity,
    240
  );

  const role = registry.roles.find(
    (item) => item.id === proposal.authorityRole
  );

  if (!role) {
    return {
      system: config.system,
      state: 'REVIEW_REQUIRED',
      decision: 'DENY',
      reason: 'UNKNOWN_AUTHORITY_ROLE',
      persisted: false,
      assignmentCreated: false,
    };
  }

  const checks = {
    proposalReviewReady:
      proposal.review?.state === 'REVIEW_REQUIRED' &&
      Array.isArray(proposal.review?.missing) &&
      proposal.review.missing.length === 0,
    ratifierIdentityPresent: Boolean(ratifierIdentity),
    ratificationEvidencePresent: Boolean(ratificationEvidenceRef),
    integrityValid:
      integrityAlgorithm === 'SHA-256' &&
      isSha256(integrityDigest),
    signatureVerified:
      signatureStatus === 'VERIFIED' &&
      Boolean(signerIdentity),
    ratifierSeparatedFromReviewer:
      ratifierIdentity !== proposal.reviewerIdentity,
    ratifierSeparatedFromProposer:
      ratifierIdentity !== proposal.proposedBy,
    signerSeparatedFromReviewer:
      signerIdentity !== proposal.reviewerIdentity,
  };

  const missing = Object.entries(checks)
    .filter(([, ok]) => !ok)
    .map(([name]) => name);

  const approved = missing.length === 0;

  return {
    system: config.system,
    version: config.version,
    proposalId: proposal.proposalId || null,
    reviewerIdentity: proposal.reviewerIdentity || null,
    authorityRole: proposal.authorityRole || null,
    state: approved ? 'APPROVED_ASSIGNMENT' : 'REVIEW_REQUIRED',
    decision: approved ? 'ELIGIBLE_FOR_MANUAL_ASSIGNMENT' : 'REVIEW',
    reason: approved
      ? 'HUMAN_RATIFICATION_EVIDENCE_COMPLETE'
      : 'RATIFICATION_EVIDENCE_INCOMPLETE',
    checks,
    missing,
    ratification: {
      ratifierIdentity: ratifierIdentity || null,
      ratificationEvidenceRef: ratificationEvidenceRef || null,
      integrity: {
        algorithm: integrityAlgorithm || null,
        digest: integrityDigest || null,
      },
      signature: {
        status: signatureStatus || null,
        signerIdentity: signerIdentity || null,
      },
    },
    persisted: false,
    assignmentCreated: false,
    nextAction: approved
      ? 'MANUAL_ASSIGNMENT_WRITE_REQUIRES_EXPLICIT_USER_ACTION'
      : 'COMPLETE_RATIFICATION_REVIEW',
  };
}

function proposalGateStatus() {
  const config = readConfig();
  const proposalQueue = readJson(config.proposalQueueSource);
  const ratifications = readJson(config.ratificationLedgerSource);
  const reviewerRegistry = buildReviewerAuthorityRegistry();

  const proposals = Array.isArray(proposalQueue.records)
    ? proposalQueue.records
    : [];
  const ratificationRecords = Array.isArray(ratifications.records)
    ? ratifications.records
    : [];

  return {
    system: config.system,
    version: config.version,
    status: 'CLEAR',
    mode: config.mode,
    governance: config.governance,
    summary: {
      proposals: proposals.length,
      ratifications: ratificationRecords.length,
      approvedAssignmentPreviews: ratificationRecords.filter(
        (item) => item.state === 'APPROVED_ASSIGNMENT'
      ).length,
      activeReviewerAssignments:
        reviewerRegistry.summary.assignments,
      assignmentsCreatedByGate: 0,
    },
    truth: {
      proposalDoesNotAssign: true,
      ratificationPreviewDoesNotAssign: true,
      noAutomaticAssignment: true,
      explicitUserActionRequiredForAnyFutureAssignmentWrite: true,
    },
    proposals,
    ratifications: ratificationRecords,
  };
}

module.exports = {
  evaluateAssignmentRatification,
  prepareAssignmentProposal,
  proposalGateStatus,
};
