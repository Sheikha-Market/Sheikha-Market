'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const CONFIG_PATH = path.join(
  ROOT,
  'config/sheikha-reviewer-authority-registry-v1.json'
);

function readJson(relativePath) {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, relativePath), 'utf8')
  );
}

function readConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

function unique(values) {
  return [...new Set((values || []).filter(Boolean))];
}

function roleAllows(role, evidenceKind, domains, decision) {
  const kindAllowed =
    role.evidenceKinds.includes('*') ||
    role.evidenceKinds.includes(evidenceKind);

  const domainAllowed =
    role.domains.includes('*') ||
    domains.every((domain) => role.domains.includes(domain));

  const decisionAllowed =
    role.decisions.includes(decision);

  return kindAllowed && domainAllowed && decisionAllowed;
}

function buildReviewerAuthorityRegistry() {
  const config = readConfig();
  const identityRoles = readJson(config.identityRolesSource);
  const assignments = readJson(config.assignmentSource);

  const knownIdentityRoles = new Set(identityRoles.roles || []);
  const invalidRoleReferences = config.roles
    .flatMap((role) => role.baseIdentityRoles || [])
    .filter((role) => !knownIdentityRoles.has(role));

  const invalidAssignments = (assignments.assignments || []).filter(
    (assignment) =>
      !assignment.reviewerIdentity ||
      !assignment.authorityRole ||
      !config.roles.some((role) => role.id === assignment.authorityRole)
  );

  const status =
    invalidRoleReferences.length === 0 &&
    invalidAssignments.length === 0
      ? 'CLEAR'
      : 'REVIEW_REQUIRED';

  return {
    system: config.system,
    version: config.version,
    status,
    mode: config.mode,
    governance: config.governance,
    summary: {
      authorityRoles: config.roles.length,
      identityRoleVocabulary: identityRoles.roles.length,
      assignments: (assignments.assignments || []).length,
      invalidRoleReferences: invalidRoleReferences.length,
      invalidAssignments: invalidAssignments.length,
    },
    roles: config.roles,
    assignments: assignments.assignments || [],
    findings: {
      invalidRoleReferences: unique(invalidRoleReferences),
      invalidAssignments,
    },
  };
}

function evaluateReviewerAuthority(input = {}) {
  const config = readConfig();
  const registry = buildReviewerAuthorityRegistry();

  const reviewerIdentity = String(
    input.reviewerIdentity || ''
  ).trim();
  const evidenceKind = String(
    input.evidenceKind || ''
  ).trim().toUpperCase();
  const domains = Array.isArray(input.domains)
    ? unique(input.domains.map((value) => String(value || '').trim()))
    : [];
  const decision = String(
    input.decision || 'PENDING'
  ).trim().toUpperCase();
  const signerIdentity = String(
    input.signerIdentity || ''
  ).trim();
  const ownerIdentity = String(
    input.ownerIdentity || ''
  ).trim();

  if (!reviewerIdentity) {
    return {
      system: config.system,
      decision: 'DENY',
      reason: 'REVIEWER_IDENTITY_REQUIRED',
      authorizedReviewer: false,
    };
  }

  if (!config.decisions.includes(decision)) {
    return {
      system: config.system,
      reviewerIdentity,
      decision: 'DENY',
      reason: 'UNSUPPORTED_REVIEW_DECISION',
      authorizedReviewer: false,
    };
  }

  if (decision === 'PENDING') {
    return {
      system: config.system,
      reviewerIdentity,
      decision: 'REVIEW',
      reason: 'NO_APPROVAL_AUTHORITY_REQUIRED_FOR_PENDING',
      authorizedReviewer: false,
    };
  }

  if (
    reviewerIdentity === signerIdentity ||
    reviewerIdentity === ownerIdentity
  ) {
    return {
      system: config.system,
      reviewerIdentity,
      decision: 'DENY',
      reason: 'SEPARATION_OF_DUTIES_VIOLATION',
      authorizedReviewer: false,
    };
  }

  const assignments = registry.assignments.filter(
    (assignment) =>
      assignment.reviewerIdentity === reviewerIdentity &&
      assignment.status !== 'REVOKED' &&
      (!assignment.expiresAt ||
        new Date(assignment.expiresAt).getTime() > Date.now())
  );

  if (assignments.length === 0) {
    return {
      system: config.system,
      reviewerIdentity,
      decision: 'DENY',
      reason: 'REVIEWER_NOT_ASSIGNED',
      authorizedReviewer: false,
    };
  }

  const matching = assignments
    .map((assignment) => ({
      assignment,
      role: registry.roles.find(
        (role) => role.id === assignment.authorityRole
      ),
    }))
    .filter(({ role }) =>
      role &&
      roleAllows(role, evidenceKind, domains, decision)
    );

  if (matching.length === 0) {
    return {
      system: config.system,
      reviewerIdentity,
      decision: 'DENY',
      reason: 'REVIEWER_SCOPE_NOT_AUTHORIZED',
      authorizedReviewer: false,
      assignments: assignments.map((item) => item.authorityRole),
    };
  }

  return {
    system: config.system,
    reviewerIdentity,
    decision: 'ALLOW_REVIEW_DECISION',
    reason: 'EXPLICIT_ASSIGNMENT_AND_SCOPE_MATCH',
    authorizedReviewer: true,
    matchingAuthorities: matching.map(({ assignment, role }) => ({
      assignmentId: assignment.assignmentId || null,
      authorityRole: role.id,
      highImpactReview: Boolean(role.highImpactReview),
    })),
  };
}

module.exports = {
  buildReviewerAuthorityRegistry,
  evaluateReviewerAuthority,
};
