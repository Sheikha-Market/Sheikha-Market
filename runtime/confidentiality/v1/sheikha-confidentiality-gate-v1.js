'use strict';

const fs = require('node:fs');
const path = require('node:path');

const POLICY_PATH = path.join(
  __dirname,
  'sheikha-confidentiality-policy-v1.json'
);

const GOVERNED_ACTIONS = Object.freeze([
  'DISCLOSE_EXTERNAL',
  'PUBLISH',
  'TRANSFER_TO_THIRD_PARTY',
  'TRANSFER_CROSS_BORDER',
  'LICENSE',
  'SUBLICENSE',
  'USE_FOR_MARKETING',
  'USE_FOR_PUBLICITY',
  'TRAIN_AI',
  'FINE_TUNE_MODEL',
  'CREATE_DERIVATIVE_PRODUCT',
  'COMMERCIALIZE_DERIVATIVE'
]);

function loadPolicy() {
  return JSON.parse(
    fs.readFileSync(POLICY_PATH, 'utf8')
  );
}

function normalizeText(value, maxLength = 300) {
  return Array.from(String(value || ''))
    .map((character) => {
      const code = character.charCodeAt(0);

      return code <= 0x1f || code === 0x7f
        ? ' '
        : character;
    })
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function isSha256(value) {
  return /^[a-f0-9]{64}$/i.test(String(value || ''));
}

function classifySubmission(options = {}) {
  const now = options.now instanceof Date
    ? options.now
    : new Date();

  return {
    policyId: 'SHEIKHA-CONFIDENTIALITY-DEFAULT-DENY-V1',
    classification: 'CONFIDENTIAL_RESTRICTED',
    classifiedAt: now.toISOString(),
    rightsHolderId: normalizeText(
      options.rightsHolderId || 'SUBMITTING_RIGHTS_HOLDER',
      160
    ),
    rightsRetainedByHolder: true,
    ownershipTransferredBySubmission: false,
    publicDisclosureAllowed: false,
    externalDisclosureAllowed: false,
    thirdPartyTransferAllowed: false,
    crossBorderTransferAllowed: false,
    marketingUseAllowed: false,
    modelTrainingAllowed: false,
    derivativeCommercializationAllowed: false,
    separateVerifiedWrittenAuthorizationRequired: true
  };
}

function deny(reason, failures = []) {
  return {
    allowed: false,
    decision: 'DENY',
    reason,
    failures,
    defaultClassification: 'CONFIDENTIAL_RESTRICTED',
    executionAuthorized: false
  };
}

function evaluateConfidentialityAction(
  input = {},
  options = {}
) {
  const action = normalizeText(input.action, 80)
    .toUpperCase();
  const resourceId = normalizeText(
    input.resourceId,
    500
  );
  const resourceSha256 = normalizeText(
    input.resourceSha256,
    64
  ).toLowerCase();
  const granteeId = normalizeText(
    input.granteeId,
    200
  );
  const rightsHolderId = normalizeText(
    input.rightsHolderId,
    200
  );
  const purpose = normalizeText(input.purpose, 500);

  if (input.compelledDisclosure === true) {
    return {
      allowed: false,
      decision: 'HOLD_FOR_LEGAL_REVIEW',
      reason: 'COMPELLED_DISCLOSURE_REQUIRES_VERIFIED_LEGAL_BASIS',
      executionAuthorized: false,
      notifyRightsHolderWhenLegallyPermitted: true,
      minimumNecessaryOnly: true,
      auditRequired: true
    };
  }

  const failures = [];

  if (!GOVERNED_ACTIONS.includes(action)) {
    failures.push('KNOWN_GOVERNED_ACTION_REQUIRED');
  }

  if (!resourceId) {
    failures.push('RESOURCE_ID_REQUIRED');
  }

  if (!isSha256(resourceSha256)) {
    failures.push('RESOURCE_SHA256_REQUIRED');
  }

  if (!granteeId) {
    failures.push('GRANTEE_ID_REQUIRED');
  }

  if (!rightsHolderId) {
    failures.push('RIGHTS_HOLDER_ID_REQUIRED');
  }

  if (!purpose) {
    failures.push('PURPOSE_REQUIRED');
  }

  const authorization = input.authorization;

  if (!authorization || typeof authorization !== 'object') {
    failures.push('SIGNED_WRITTEN_AUTHORIZATION_REQUIRED');
    return deny(
      'CONFIDENTIALITY_DEFAULT_DENY',
      failures
    );
  }

  if (
    authorization.type !==
      'SHEIKHA_SCOPED_WRITTEN_AUTHORIZATION_V1'
  ) {
    failures.push('AUTHORIZATION_TYPE_INVALID');
  }

  for (const field of [
    'authorizationId',
    'rightsHolderId',
    'granteeId',
    'purpose',
    'issuedAt',
    'expiresAt',
    'authorizationSha256'
  ]) {
    if (!normalizeText(authorization[field], 500)) {
      failures.push(`AUTHORIZATION_${field.toUpperCase()}_REQUIRED`);
    }
  }

  if (authorization.signed !== true) {
    failures.push('AUTHORIZATION_SIGNATURE_REQUIRED');
  }

  if (
    authorization.signatureVerificationStatus !==
      'VERIFIED'
  ) {
    failures.push('AUTHORIZATION_SIGNATURE_NOT_VERIFIED');
  }

  if (options.trustedAuthorizationVerification !== true) {
    failures.push('TRUSTED_SIGNATURE_GATE_REQUIRED');
  }

  if (
    !isSha256(authorization.authorizationSha256) ||
    normalizeText(
      options.verifiedAuthorizationSha256,
      64
    ).toLowerCase() !==
      String(authorization.authorizationSha256 || '')
        .toLowerCase()
  ) {
    failures.push('AUTHORIZATION_DIGEST_NOT_TRUSTED');
  }

  if (authorization.granteeId !== granteeId) {
    failures.push('AUTHORIZATION_GRANTEE_MISMATCH');
  }

  if (authorization.rightsHolderId !== rightsHolderId) {
    failures.push('AUTHORIZATION_RIGHTS_HOLDER_MISMATCH');
  }

  if (
    normalizeText(authorization.purpose, 500) !== purpose
  ) {
    failures.push('AUTHORIZATION_PURPOSE_MISMATCH');
  }

  if (
    normalizeText(options.verifiedRightsHolderId, 200) !==
      rightsHolderId
  ) {
    failures.push('RIGHTS_HOLDER_AUTHORITY_NOT_VERIFIED');
  }

  if (
    !Array.isArray(authorization.allowedActions) ||
    !authorization.allowedActions.includes(action)
  ) {
    failures.push('ACTION_OUTSIDE_AUTHORIZATION_SCOPE');
  }

  const binding = Array.isArray(
    authorization.resourceBindings
  )
    ? authorization.resourceBindings.find(
      (entry) =>
        entry &&
        entry.resourceId === resourceId &&
        String(entry.sha256 || '').toLowerCase() ===
          resourceSha256
    )
    : null;

  if (!binding) {
    failures.push('RESOURCE_OUTSIDE_AUTHORIZATION_SCOPE');
  }

  const now = options.now instanceof Date
    ? options.now
    : new Date();
  const issuedAt = new Date(authorization.issuedAt);
  const expiresAt = new Date(authorization.expiresAt);

  if (
    Number.isNaN(issuedAt.getTime()) ||
    Number.isNaN(expiresAt.getTime()) ||
    now < issuedAt ||
    now >= expiresAt
  ) {
    failures.push('AUTHORIZATION_TIME_INVALID');
  }

  if (
    action === 'TRAIN_AI' ||
    action === 'FINE_TUNE_MODEL'
  ) {
    if (authorization.trainingOptIn !== true) {
      failures.push('SEPARATE_TRAINING_OPT_IN_REQUIRED');
    }

    if (
      !normalizeText(authorization.datasetId, 200) ||
      !isSha256(authorization.datasetSha256)
    ) {
      failures.push('TRAINING_DATASET_BINDING_REQUIRED');
    }

    if (
      authorization.piiAndSecretReviewStatus !==
        'PASSED'
    ) {
      failures.push('PII_AND_SECRET_REVIEW_REQUIRED');
    }
  }

  if (failures.length) {
    return deny(
      'AUTHORIZATION_VALIDATION_FAILED',
      [...new Set(failures)]
    );
  }

  return {
    allowed: true,
    decision: 'ALLOW_EXACT_BOUNDED_ACTION',
    reason: 'VERIFIED_SIGNED_WRITTEN_AUTHORIZATION',
    executionAuthorized: true,
    authorizationId: authorization.authorizationId,
    action,
    resourceId,
    resourceSha256,
    granteeId,
    rightsHolderId,
    purpose,
    expiresAt: authorization.expiresAt,
    noScopeExpansion: true
  };
}

function status() {
  const policy = loadPolicy();

  return {
    success: true,
    system: policy.system,
    policyId: policy.policyId,
    status: policy.status,
    defaultClassification: policy.defaultClassification,
    governedActions: GOVERNED_ACTIONS,
    noTrainingOnConfidentialDataByDefault: true,
    noPublicationByDefault: true,
    noExternalDisclosureByDefault: true,
    signedWrittenAuthorizationRequired: true,
    trustedSignatureVerifierRequired: true,
    automaticLegalOrGovernmentRegistration: false,
    claimBoundary: policy.claimBoundary
  };
}

module.exports = {
  GOVERNED_ACTIONS,
  POLICY_PATH,
  classifySubmission,
  evaluateConfidentialityAction,
  loadPolicy,
  status
};
