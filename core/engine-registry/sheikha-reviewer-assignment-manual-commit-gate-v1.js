'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const CONFIG_PATH = path.join(
  ROOT,
  'config/sheikha-reviewer-assignment-manual-commit-gate-v1.json'
);

function readJson(relativePath) {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, relativePath), 'utf8')
  );
}

function readBytes(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath));
}

function readConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function stableScopeChecksum(input = {}) {
  const payload = {
    reviewerIdentity: String(input.reviewerIdentity || '').trim(),
    authorityRole: String(input.authorityRole || '').trim(),
    baseIdentityRole: String(input.baseIdentityRole || '').trim(),
    domains: Array.isArray(input.domains)
      ? [...new Set(input.domains.map(String))].sort()
      : [],
    evidenceKinds: Array.isArray(input.evidenceKinds)
      ? [...new Set(input.evidenceKinds.map(String))].sort()
      : [],
    expiresAt: input.expiresAt || null,
  };

  return sha256(JSON.stringify(payload));
}

function currentAssignmentRegistryState() {
  const config = readConfig();
  const registry = readJson(config.assignmentRegistrySource);
  const bytes = readBytes(config.assignmentRegistrySource);

  return {
    source: config.assignmentRegistrySource,
    registry: registry.registry,
    status: registry.status,
    recordCount: Array.isArray(registry.assignments)
      ? registry.assignments.length
      : 0,
    sha256: sha256(bytes),
  };
}

function buildManualCommitGateStatus() {
  const config = readConfig();
  const assignments = readJson(config.assignmentRegistrySource);
  const proposals = readJson(config.proposalQueueSource);
  const ratifications = readJson(config.ratificationLedgerSource);
  const current = currentAssignmentRegistryState();

  return {
    system: config.system,
    version: config.version,
    status: 'CLEAR',
    mode: config.mode,
    governance: config.governance,
    summary: {
      assignmentRecords: Array.isArray(assignments.assignments)
        ? assignments.assignments.length
        : 0,
      proposalRecords: Array.isArray(proposals.records)
        ? proposals.records.length
        : 0,
      ratificationRecords: Array.isArray(ratifications.records)
        ? ratifications.records.length
        : 0,
      commitIntentsPersisted: 0,
      assignmentsWrittenByGate: 0,
    },
    currentRegistry: current,
    requiredConfirmationPhrase: config.confirmationPhrase,
    truth: {
      previewOnly: true,
      noWriteEndpoint: true,
      noAutomaticAssignment: true,
      explicitUserActionStillRequiredAfterEligibility: true,
    },
  };
}

function evaluateManualAssignmentCommit(input = {}) {
  const config = readConfig();
  const current = currentAssignmentRegistryState();
  const proposals = readJson(config.proposalQueueSource);
  const ratifications = readJson(config.ratificationLedgerSource);

  const proposalId = String(input.proposalId || '').trim();
  const expectedRegistrySha256 = String(
    input.expectedRegistrySha256 || ''
  ).trim().toLowerCase();
  const expectedRecordCount = Number.isInteger(input.expectedRecordCount)
    ? input.expectedRecordCount
    : null;
  const suppliedScopeChecksum = String(
    input.scopeChecksum || ''
  ).trim().toLowerCase();
  const confirmationPhrase = String(
    input.confirmationPhrase || ''
  ).trim();

  if (!proposalId) {
    return {
      system: config.system,
      decision: 'DENY',
      reason: 'PROPOSAL_ID_REQUIRED',
      writePerformed: false,
      assignmentCreated: false,
    };
  }

  const proposal = (proposals.records || []).find(
    (item) => item.proposalId === proposalId
  );
  const ratification = (ratifications.records || []).find(
    (item) =>
      item.proposalId === proposalId &&
      item.state === 'APPROVED_ASSIGNMENT'
  );

  const proposalScopeChecksum = proposal
    ? stableScopeChecksum(proposal)
    : null;

  const checks = {
    proposalPersisted: Boolean(proposal),
    approvedRatificationPersisted: Boolean(ratification),
    expectedRegistrySha256Present:
      /^[a-f0-9]{64}$/.test(expectedRegistrySha256),
    registrySha256Matches:
      expectedRegistrySha256 === current.sha256,
    expectedRecordCountMatches:
      expectedRecordCount === null ||
      expectedRecordCount === current.recordCount,
    scopeChecksumPresent:
      /^[a-f0-9]{64}$/.test(suppliedScopeChecksum),
    scopeChecksumMatches:
      Boolean(proposalScopeChecksum) &&
      suppliedScopeChecksum === proposalScopeChecksum,
    explicitConfirmationMatches:
      confirmationPhrase === config.confirmationPhrase,
    ratificationEvidencePresent:
      Boolean(ratification?.ratification?.ratificationEvidenceRef),
    ratificationIntegrityPresent:
      ratification?.ratification?.integrity?.algorithm === 'SHA-256' &&
      /^[a-f0-9]{64}$/i.test(
        String(ratification?.ratification?.integrity?.digest || '')
      ),
    ratificationSignatureVerified:
      ratification?.ratification?.signature?.status === 'VERIFIED' &&
      Boolean(
        ratification?.ratification?.signature?.signerIdentity
      ),
    separationOfDuties:
      Boolean(ratification) &&
      ratification.ratification?.ratifierIdentity !==
        proposal?.reviewerIdentity &&
      ratification.ratification?.ratifierIdentity !==
        proposal?.proposedBy,
  };

  const missing = Object.entries(checks)
    .filter(([, ok]) => !ok)
    .map(([name]) => name);

  const eligible = missing.length === 0;

  return {
    system: config.system,
    version: config.version,
    proposalId,
    decision: eligible
      ? 'ELIGIBLE_FOR_EXPLICIT_MANUAL_WRITE'
      : 'DENY',
    reason: eligible
      ? 'ALL_COMMIT_PRECONDITIONS_SATISFIED'
      : 'COMMIT_PRECONDITIONS_INCOMPLETE_OR_STALE',
    checks,
    missing,
    currentRegistry: current,
    expectedRegistrySha256:
      expectedRegistrySha256 || null,
    proposalScopeChecksum,
    suppliedScopeChecksum:
      suppliedScopeChecksum || null,
    writePerformed: false,
    assignmentCreated: false,
    persisted: false,
    nextAction: eligible
      ? 'EXPLICIT_USER_WRITE_ACTION_REQUIRED'
      : 'REFRESH_EVIDENCE_AND_REGISTRY_STATE',
  };
}

module.exports = {
  buildManualCommitGateStatus,
  currentAssignmentRegistryState,
  evaluateManualAssignmentCommit,
  stableScopeChecksum,
};
