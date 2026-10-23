'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const CONFIG_PATH = path.join(
  ROOT,
  'config/sheikha-connector-identity-evidence-binding-v1.json'
);

const {
  buildAuthorityCapabilityMatrix,
} = require('./sheikha-connector-authority-capability-matrix-v1');

function readJson(relativePath) {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, relativePath), 'utf8')
  );
}

function readConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

function stableIdentity(namespace, id) {
  return `${namespace}:${String(id || '').toLowerCase()}`;
}

function baseEvidenceState() {
  return {
    identity: {
      status: 'BOUND_LOCAL_IDENTITY',
      evidenceRefs: [],
    },
    dataScope: {
      status: 'DECLARED_POLICY_SCOPE',
      evidenceRefs: [],
    },
    permissionScope: {
      status: 'DECLARED_READINESS_ONLY',
      evidenceRefs: [],
    },
    termsOrContract: {
      status: 'MISSING',
      evidenceRefs: [],
    },
    authorization: {
      status: 'MISSING',
      evidenceRefs: [],
    },
    humanApproval: {
      status: 'MISSING',
      evidenceRefs: [],
    },
    credential: {
      status: 'NOT_APPLICABLE_OR_NOT_PROVIDED',
      evidenceRefs: [],
    },
    liveConnection: {
      status: 'MISSING',
      evidenceRefs: [],
    },
    healthcheck: {
      status: 'MISSING',
      evidenceRefs: [],
    },
    auditBinding: {
      status: 'LOCAL_AUDIT_POLICY_ONLY',
      evidenceRefs: [],
    },
  };
}

function evaluateAuthorization(binding, config) {
  const e = binding.evidence;
  const requirements = {
    IDENTITY_BOUND: e.identity.status === 'BOUND_LOCAL_IDENTITY',
    DATA_SCOPE_DECLARED: e.dataScope.status === 'DECLARED_POLICY_SCOPE',
    PERMISSION_SCOPE_DECLARED:
      e.permissionScope.status === 'DECLARED_READINESS_ONLY',
    TERMS_OR_CONTRACT_EVIDENCE:
      e.termsOrContract.status === 'VERIFIED',
    AUTHORIZATION_EVIDENCE:
      e.authorization.status === 'VERIFIED',
    HUMAN_APPROVAL_EVIDENCE:
      e.humanApproval.status === 'VERIFIED',
  };

  const missing = config.authorizationRequirements.filter(
    (requirement) => requirements[requirement] !== true
  );

  return {
    eligible: missing.length === 0,
    status: missing.length === 0
      ? 'ELIGIBLE_FOR_AUTHORIZATION_REVIEW'
      : 'NOT_AUTHORIZED',
    missing,
    autoPromoted: false,
  };
}

function evaluateLive(binding, config) {
  const auth = binding.authorization;
  const e = binding.evidence;
  const requirements = {
    AUTHORIZED: auth.status === 'AUTHORIZED',
    CREDENTIAL_EVIDENCE_IF_REQUIRED:
      !binding.credentialRequired || e.credential.status === 'VERIFIED',
    LIVE_CONNECTION_EVIDENCE:
      e.liveConnection.status === 'VERIFIED',
    HEALTHCHECK_EVIDENCE:
      e.healthcheck.status === 'VERIFIED',
    AUDIT_BINDING:
      e.auditBinding.status === 'VERIFIED',
  };

  const missing = config.liveRequirements.filter(
    (requirement) => requirements[requirement] !== true
  );

  return {
    eligible: missing.length === 0,
    status: missing.length === 0
      ? 'ELIGIBLE_FOR_LIVE_REVIEW'
      : 'NOT_LIVE',
    missing,
    autoPromoted: false,
  };
}

function buildProfileBinding(profile, config) {
  const policy = config.categoryPolicies[profile.category] || {
    dataScope: [],
    ownerRole: 'INTEGRATION_AUTHORITY',
    termsEvidence: 'REQUIRED',
  };
  const evidence = baseEvidenceState();

  if (profile.liveConnectionClaim === true) {
    evidence.liveConnection.status = 'DECLARED_CLAIM_REQUIRES_VERIFICATION';
  }
  if (profile.credentialRequired) {
    evidence.credential.status = 'REQUIRED_NOT_PROVIDED';
  }

  const binding = {
    connectorId: profile.id,
    connectorIdentity: stableIdentity(
      config.identityNamespace,
      profile.id
    ),
    kind: 'EXTERNAL_PROFILE',
    category: profile.category,
    domains: profile.domains || [],
    ownerRole: policy.ownerRole,
    ownerIdentity: null,
    credentialRequired: Boolean(profile.credentialRequired),
    accessGate: profile.accessGate || null,
    dataScope: policy.dataScope || [],
    permissionScope: {
      requested: ['READ'],
      mutationRequested: [],
    },
    evidence,
    authorization: {
      status: 'NOT_AUTHORIZED',
      grantedBy: null,
      grantedAt: null,
      expiresAt: null,
    },
    live: {
      status: 'NOT_LIVE',
      verifiedAt: null,
    },
  };

  const authorizationReview = evaluateAuthorization(binding, config);
  binding.authorizationReview = authorizationReview;
  binding.liveReview = evaluateLive(binding, config);

  return binding;
}

function buildDeclarationBinding(record, config) {
  const evidence = baseEvidenceState();
  evidence.dataScope.status = 'PROFILE_BINDING_REQUIRED';
  evidence.permissionScope.status = 'PROFILE_BINDING_REQUIRED';

  const binding = {
    connectorId: record.id,
    connectorIdentity: stableIdentity(
      config.identityNamespace,
      record.id
    ),
    kind: 'ENTERPRISE_DECLARATION',
    category: 'NAMED_ENTERPRISE_CONNECTOR',
    domains: [],
    ownerRole: 'INTEGRATION_AUTHORITY',
    ownerIdentity: null,
    credentialRequired: null,
    accessGate: 'PROFILE_AND_RIGHTS_BINDING_REQUIRED',
    dataScope: [],
    permissionScope: {
      requested: [],
      mutationRequested: [],
    },
    evidence,
    authorization: {
      status: 'NOT_AUTHORIZED',
      grantedBy: null,
      grantedAt: null,
      expiresAt: null,
    },
    live: {
      status: 'NOT_LIVE',
      verifiedAt: null,
    },
  };

  binding.authorizationReview = evaluateAuthorization(binding, config);
  binding.liveReview = evaluateLive(binding, config);
  return binding;
}

function buildConnectorIdentityEvidenceBinding() {
  const config = readConfig();
  const authority = buildAuthorityCapabilityMatrix();
  const profiles = authority.connectorCapabilities.filter(
    (item) => item.kind === 'EXTERNAL_PROFILE'
  );
  const declarations = authority.connectorCapabilities.filter(
    (item) => item.kind === 'ENTERPRISE_DECLARATION'
  );

  const bindings = [
    ...profiles.map((profile) => buildProfileBinding(profile, config)),
    ...declarations.map((record) => buildDeclarationBinding(record, config)),
  ];

  const authorized = bindings.filter(
    (binding) => binding.authorization.status === 'AUTHORIZED'
  );
  const live = bindings.filter(
    (binding) => binding.live.status === 'LIVE_VERIFIED'
  );
  const fullyEvidenced = bindings.filter(
    (binding) => binding.authorizationReview.eligible
  );

  const status =
    authority.status === 'CLEAR' &&
    authorized.length === 0 &&
    live.length === 0
      ? 'CLEAR'
      : 'REVIEW_REQUIRED';

  return {
    system: config.system,
    version: config.version,
    status,
    mode: config.mode,
    governance: config.governance,
    summary: {
      bindings: bindings.length,
      identitiesBound: bindings.filter(
        (binding) => Boolean(binding.connectorIdentity)
      ).length,
      ownerIdentitiesAssigned: bindings.filter(
        (binding) => Boolean(binding.ownerIdentity)
      ).length,
      authorizationEligible: fullyEvidenced.length,
      authorized: authorized.length,
      liveVerified: live.length,
      missingAuthorizationEvidence: bindings.filter(
        (binding) =>
          binding.evidence.authorization.status !== 'VERIFIED'
      ).length,
      missingHumanApprovalEvidence: bindings.filter(
        (binding) =>
          binding.evidence.humanApproval.status !== 'VERIFIED'
      ).length,
      missingTermsOrContractEvidence: bindings.filter(
        (binding) =>
          binding.evidence.termsOrContract.status !== 'VERIFIED'
      ).length,
    },
    truth: {
      localIdentityBindingIsNotExternalOwnershipProof: true,
      declaredOwnerRoleIsNotOwnerIdentity: true,
      noConnectorAuthorizedWithoutEvidence: authorized.length === 0,
      noConnectorLiveWithoutEvidence: live.length === 0,
      noAutomaticPromotion: true,
    },
    bindings,
  };
}

function getConnectorIdentityBinding(id) {
  return buildConnectorIdentityEvidenceBinding().bindings.find(
    (binding) => binding.connectorId === id
  ) || null;
}

function getDomainIdentityBindings(domain) {
  return buildConnectorIdentityEvidenceBinding().bindings.filter(
    (binding) => binding.domains.includes(domain)
  );
}

module.exports = {
  buildConnectorIdentityEvidenceBinding,
  getConnectorIdentityBinding,
  getDomainIdentityBindings,
};
