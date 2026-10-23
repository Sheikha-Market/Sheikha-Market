'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const confidentiality = require(
  '../runtime/confidentiality/v1/' +
  'sheikha-confidentiality-gate-v1'
);

const NOW = new Date('2026-09-07T12:00:00.000Z');
const RESOURCE_SHA = 'a'.repeat(64);
const AUTH_SHA = 'b'.repeat(64);

function authorization(overrides = {}) {
  return {
    type: 'SHEIKHA_SCOPED_WRITTEN_AUTHORIZATION_V1',
    authorizationId: 'AUTH-2026-001',
    rightsHolderId: 'OWNER-1',
    granteeId: 'SERVICE-1',
    purpose: 'DELIVER_APPROVED_CUSTOMER_REPORT',
    allowedActions: ['DISCLOSE_EXTERNAL'],
    resourceBindings: [
      {
        resourceId: 'REPORT-1',
        sha256: RESOURCE_SHA
      }
    ],
    trainingOptIn: false,
    issuedAt: '2026-09-07T11:00:00.000Z',
    expiresAt: '2026-09-07T13:00:00.000Z',
    signed: true,
    signatureVerificationStatus: 'VERIFIED',
    authorizationSha256: AUTH_SHA,
    ...overrides
  };
}

function actionInput(overrides = {}) {
  return {
    action: 'DISCLOSE_EXTERNAL',
    resourceId: 'REPORT-1',
    resourceSha256: RESOURCE_SHA,
    granteeId: 'SERVICE-1',
    rightsHolderId: 'OWNER-1',
    purpose: 'DELIVER_APPROVED_CUSTOMER_REPORT',
    ...overrides
  };
}

test('classifies every submission as confidential by default', () => {
  const result = confidentiality.classifySubmission({
    now: NOW,
    rightsHolderId: 'OWNER-1'
  });

  assert.equal(result.classification, 'CONFIDENTIAL_RESTRICTED');
  assert.equal(result.publicDisclosureAllowed, false);
  assert.equal(result.thirdPartyTransferAllowed, false);
  assert.equal(result.modelTrainingAllowed, false);
  assert.equal(result.ownershipTransferredBySubmission, false);
});

test('denies disclosure without written authorization', () => {
  const result =
    confidentiality.evaluateConfidentialityAction(
      actionInput(),
      { now: NOW }
    );

  assert.equal(result.allowed, false);
  assert.equal(result.decision, 'DENY');
  assert.ok(
    result.failures.includes(
      'SIGNED_WRITTEN_AUTHORIZATION_REQUIRED'
    )
  );
});

test('rejects client self-asserted signature verification', () => {
  const result =
    confidentiality.evaluateConfidentialityAction(
      actionInput({ authorization: authorization() }),
      { now: NOW }
    );

  assert.equal(result.allowed, false);
  assert.ok(
    result.failures.includes(
      'TRUSTED_SIGNATURE_GATE_REQUIRED'
    )
  );
});

test('allows only an exact resource-bound trusted authorization', () => {
  const result =
    confidentiality.evaluateConfidentialityAction(
      actionInput({ authorization: authorization() }),
      {
        now: NOW,
        trustedAuthorizationVerification: true,
        verifiedAuthorizationSha256: AUTH_SHA,
        verifiedRightsHolderId: 'OWNER-1'
      }
    );

  assert.equal(result.allowed, true);
  assert.equal(
    result.decision,
    'ALLOW_EXACT_BOUNDED_ACTION'
  );
  assert.equal(result.noScopeExpansion, true);
});

test('denies scope changes and expired authorizations', () => {
  const scopeEscape =
    confidentiality.evaluateConfidentialityAction(
      actionInput({
        resourceId: 'REPORT-2',
        authorization: authorization()
      }),
      {
        now: NOW,
        trustedAuthorizationVerification: true,
        verifiedAuthorizationSha256: AUTH_SHA,
        verifiedRightsHolderId: 'OWNER-1'
      }
    );

  assert.equal(scopeEscape.allowed, false);
  assert.ok(
    scopeEscape.failures.includes(
      'RESOURCE_OUTSIDE_AUTHORIZATION_SCOPE'
    )
  );

  const expired =
    confidentiality.evaluateConfidentialityAction(
      actionInput({
        authorization: authorization({
          expiresAt: '2026-09-07T11:30:00.000Z'
        })
      }),
      {
        now: NOW,
        trustedAuthorizationVerification: true,
        verifiedAuthorizationSha256: AUTH_SHA,
        verifiedRightsHolderId: 'OWNER-1'
      }
    );

  assert.equal(expired.allowed, false);
  assert.ok(
    expired.failures.includes(
      'AUTHORIZATION_TIME_INVALID'
    )
  );
});

test('requires independent training opt-in and dataset review', () => {
  const result =
    confidentiality.evaluateConfidentialityAction(
      actionInput({
        action: 'TRAIN_AI',
        authorization: authorization({
          allowedActions: ['TRAIN_AI']
        })
      }),
      {
        now: NOW,
        trustedAuthorizationVerification: true,
        verifiedAuthorizationSha256: AUTH_SHA,
        verifiedRightsHolderId: 'OWNER-1'
      }
    );

  assert.equal(result.allowed, false);
  assert.ok(
    result.failures.includes(
      'SEPARATE_TRAINING_OPT_IN_REQUIRED'
    )
  );
  assert.ok(
    result.failures.includes(
      'TRAINING_DATASET_BINDING_REQUIRED'
    )
  );
  assert.ok(
    result.failures.includes(
      'PII_AND_SECRET_REVIEW_REQUIRED'
    )
  );
});

test('holds compelled disclosure for legal review', () => {
  const result =
    confidentiality.evaluateConfidentialityAction({
      compelledDisclosure: true
    });

  assert.equal(result.allowed, false);
  assert.equal(
    result.decision,
    'HOLD_FOR_LEGAL_REVIEW'
  );
  assert.equal(result.minimumNecessaryOnly, true);
});
