'use strict';

const express = require('express');
const request = require('supertest');

const {
  evaluateReviewCandidate,
  prepareEvidenceIntake,
  projectApprovedEvidenceLedger,
  queueStatus,
} = require(
  '../core/engine-registry/' +
  'sheikha-connector-evidence-intake-review-v1'
);
const routes = require(
  '../routes/site-registry/sheikha-engine-domain-routes-v3'
);

const SHA256 = 'a'.repeat(64);

function completeCandidateInput() {
  return {
    connectorId: 'CONN-005',
    kind: 'AUTHORIZATION',
    sourceRef: 'evidence://authorization/conn-005',
    signerIdentity: 'urn:test:signer',
    ownerIdentity: 'urn:test:owner',
    evidenceRegistryRef: 'ev-registry-ref-1',
    domains: [
      'marketplace',
      'commerce',
      'logistics',
      'enterprise',
      'integration',
    ],
    operations: ['READ'],
    issuedAt: '2026-10-07T00:00:00+03:00',
    integrity: {
      algorithm: 'SHA-256',
      digest: SHA256,
    },
    signature: {
      status: 'VERIFIED',
      signerIdentity: 'urn:test:signer',
    },
  };
}

describe('Sheikha connector evidence intake review V1', () => {
  test('starts with an empty governed review queue', () => {
    const status = queueStatus();
    const ledger = projectApprovedEvidenceLedger();

    expect(status.status).toBe('CLEAR');
    expect(status.summary.records).toBe(0);
    expect(status.summary.verifiedApproved).toBe(0);
    expect(ledger.status).toBe('ACTIVE_EMPTY_LEDGER');
    expect(ledger.records).toHaveLength(0);
  });

  test('prepares review candidate without persisting or authorizing', () => {
    const result = prepareEvidenceIntake(completeCandidateInput());

    expect(result.decision).toBe('REVIEW');
    expect(result.status).toBe('REVIEW_PENDING');
    expect(result.persisted).toBe(false);
    expect(result.verified).toBe(false);
    expect(result.approved).toBe(false);
    expect(result.candidate.connectorId).toBe('CONN-005');
  });

  test('blocks approval when reviewer evidence is incomplete', () => {
    const intake = prepareEvidenceIntake(completeCandidateInput());
    const review = evaluateReviewCandidate(
      intake.candidate,
      { decision: 'APPROVED' }
    );

    expect(review.status).toBe('APPROVAL_BLOCKED');
    expect(review.decision).toBe('PENDING');
    expect(review.persisted).toBe(false);
    expect(review.authorizationGranted).toBe(false);
  });

  test('unassigned reviewer cannot approve evidence', () => {
    const intake = prepareEvidenceIntake(completeCandidateInput());
    const review = evaluateReviewCandidate(
      intake.candidate,
      {
        decision: 'APPROVED',
        reviewerIdentity: 'urn:test:reviewer',
        reviewEvidenceRef: 'ev-review-1',
        reviewedAt: '2026-10-07T00:01:00+03:00',
      }
    );

    expect(review.status).toBe('APPROVAL_BLOCKED');
    expect(review.decision).toBe('PENDING');
    expect(review.record.verification.status).toBe('NOT_VERIFIED');
    expect(review.record.verification.reviewerAuthority.reason)
      .toBe('REVIEWER_NOT_ASSIGNED');
    expect(review.persisted).toBe(false);
    expect(review.authorizationGranted).toBe(false);
    expect(review.liveGranted).toBe(false);

    const ledger = projectApprovedEvidenceLedger();
    expect(ledger.records).toHaveLength(0);
  });

  test('rejects raw credential or secret material at intake', () => {
    const input = completeCandidateInput();
    input.apiKey = 'must-not-be-accepted';

    const result = prepareEvidenceIntake(input);

    expect(result.decision).toBe('DENY');
    expect(result.reason)
      .toBe('SECRET_OR_CREDENTIAL_MATERIAL_FORBIDDEN');
  });

  test('serves preview-only queue endpoints', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/site-registry/v3', routes);

    const status = await request(app)
      .get('/api/site-registry/v3/evidence-review-queue');
    expect(status.status).toBe(200);
    expect(status.body.data.summary.records).toBe(0);

    const intake = await request(app)
      .post('/api/site-registry/v3/evidence-review-queue/intake-preview')
      .send(completeCandidateInput());
    expect(intake.status).toBe(200);
    expect(intake.body.data.persisted).toBe(false);

    const ledger = await request(app)
      .get('/api/site-registry/v3/evidence-review-queue/approved-ledger-preview');
    expect(ledger.status).toBe(200);
    expect(ledger.body.data.records).toHaveLength(0);
  });
});
