'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const CONFIG_PATH = path.join(
  ROOT,
  'config/sheikha-reviewer-assignment-write-plan-v1.json'
);

const {
  evaluateManualAssignmentCommit,
  stableScopeChecksum,
} = require('./sheikha-reviewer-assignment-manual-commit-gate-v1');

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

function canonicalJson(value) {
  if (Array.isArray(value)) {
    return '[' + value.map(canonicalJson).join(',') + ']';
  }
  if (value && typeof value === 'object') {
    const keys = Object.keys(value).sort();
    return '{' + keys
      .map((key) => JSON.stringify(key) + ':' + canonicalJson(value[key]))
      .join(',') + '}';
  }
  return JSON.stringify(value);
}

function buildAssignmentRecord(input = {}) {
  return {
    assignmentId: String(input.assignmentId || '').trim(),
    reviewerIdentity: String(input.reviewerIdentity || '').trim(),
    authorityRole: String(input.authorityRole || '').trim(),
    baseIdentityRole: String(input.baseIdentityRole || '').trim(),
    domains: Array.isArray(input.domains)
      ? [...new Set(input.domains.map(String))].sort()
      : [],
    evidenceKinds: Array.isArray(input.evidenceKinds)
      ? [...new Set(input.evidenceKinds.map(String))].sort()
      : [],
    status: 'ACTIVE',
    sourceProposalId: String(input.proposalId || '').trim(),
    sourceRatificationEvidenceRef:
      String(input.ratificationEvidenceRef || '').trim(),
    scopeChecksum: stableScopeChecksum(input),
    expiresAt: input.expiresAt || null,
  };
}

function previewAssignmentWritePlan(input = {}) {
  const config = readConfig();
  const registry = readJson(config.assignmentRegistrySource);
  const preBytes = readBytes(config.assignmentRegistrySource);
  const preChecksum = sha256(preBytes);

  const manualGate = evaluateManualAssignmentCommit(input.commit || {});

  if (manualGate.decision !== 'ELIGIBLE_FOR_EXPLICIT_MANUAL_WRITE') {
    return {
      system: config.system,
      decision: 'DENY',
      reason: 'MANUAL_COMMIT_GATE_NOT_ELIGIBLE',
      manualGate,
      writePerformed: false,
      persisted: false,
      assignmentCreated: false,
    };
  }

  const assignment = buildAssignmentRecord({
    ...(input.assignment || {}),
    proposalId: input.commit?.proposalId,
    ratificationEvidenceRef:
      input.assignment?.ratificationEvidenceRef ||
      input.commit?.ratificationEvidenceRef,
  });

  const requiredFields = [
    'assignmentId',
    'reviewerIdentity',
    'authorityRole',
    'baseIdentityRole',
    'sourceProposalId',
    'sourceRatificationEvidenceRef',
  ];
  const missingFields = requiredFields.filter(
    (field) => !assignment[field]
  );

  const duplicate = (registry.assignments || []).some(
    (item) =>
      item.assignmentId === assignment.assignmentId ||
      (
        item.reviewerIdentity === assignment.reviewerIdentity &&
        item.authorityRole === assignment.authorityRole
      )
  );

  if (missingFields.length > 0 || duplicate) {
    return {
      system: config.system,
      decision: 'DENY',
      reason: duplicate
        ? 'DUPLICATE_ASSIGNMENT'
        : 'ASSIGNMENT_FIELDS_INCOMPLETE',
      missingFields,
      duplicate,
      writePerformed: false,
      persisted: false,
      assignmentCreated: false,
    };
  }

  const expectedScopeChecksum =
    String(input.commit?.scopeChecksum || '').trim().toLowerCase();

  if (assignment.scopeChecksum !== expectedScopeChecksum) {
    return {
      system: config.system,
      decision: 'DENY',
      reason: 'SCOPE_CHECKSUM_MISMATCH',
      expectedScopeChecksum,
      calculatedScopeChecksum: assignment.scopeChecksum,
      writePerformed: false,
      persisted: false,
      assignmentCreated: false,
    };
  }

  const nextRegistry = {
    ...registry,
    status: 'ACTIVE',
    assignments: [
      ...(registry.assignments || []),
      assignment,
    ],
  };

  const postBytes = Buffer.from(
    JSON.stringify(nextRegistry, null, 2) + '\n',
    'utf8'
  );
  const postChecksum = sha256(postBytes);

  const patch = {
    operation: 'APPEND_ASSIGNMENT_RECORD',
    target: config.assignmentRegistrySource,
    precondition: {
      sha256: preChecksum,
      recordCount: (registry.assignments || []).length,
    },
    append: assignment,
    postcondition: {
      sha256: postChecksum,
      recordCount: (nextRegistry.assignments || []).length,
    },
  };

  const auditEnvelope = {
    system: config.system,
    proposalId: assignment.sourceProposalId,
    assignmentId: assignment.assignmentId,
    reviewerIdentity: assignment.reviewerIdentity,
    authorityRole: assignment.authorityRole,
    scopeChecksum: assignment.scopeChecksum,
    preStateSha256: preChecksum,
    postStateSha256: postChecksum,
    patchChecksum: sha256(canonicalJson(patch)),
    writePerformed: false,
    persisted: false,
  };

  return {
    system: config.system,
    version: config.version,
    decision: 'WRITE_PLAN_READY',
    reason: 'DETERMINISTIC_PATCH_PREVIEW_READY',
    patch,
    auditEnvelope,
    renderedRegistryPreview: nextRegistry,
    writePerformed: false,
    persisted: false,
    assignmentCreated: false,
    nextAction: 'EXPLICIT_USER_WRITE_ACTION_REQUIRED',
  };
}

function buildWritePlanStatus() {
  const config = readConfig();
  const registry = readJson(config.assignmentRegistrySource);
  const plans = readJson(config.planRegistrySource);

  return {
    system: config.system,
    version: config.version,
    status: 'CLEAR',
    mode: config.mode,
    governance: config.governance,
    summary: {
      assignmentRecords:
        Array.isArray(registry.assignments)
          ? registry.assignments.length
          : 0,
      persistedPlans:
        Array.isArray(plans.records)
          ? plans.records.length
          : 0,
      writesPerformedByPlanner: 0,
    },
    truth: {
      deterministicPreviewOnly: true,
      noAutomaticPersistence: true,
      noAssignmentWrite: true,
      explicitUserActionRequiredAfterPlan: true,
    },
  };
}

module.exports = {
  buildAssignmentRecord,
  buildWritePlanStatus,
  canonicalJson,
  previewAssignmentWritePlan,
};
