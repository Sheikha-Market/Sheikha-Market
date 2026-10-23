'use strict';

const express = require('express');
const request = require('supertest');

const {
  evaluateAssignmentRatification,
  prepareAssignmentProposal,
  proposalGateStatus,
} = require(
  '../core/engine-registry/' +
  'sheikha-reviewer-assignment-proposal-gate-v1'
);
const routes = require(
  '../routes/site-registry/sheikha-engine-domain-routes-v3'
);

const SHA256 = 'b'.repeat(64);

describe('Sheikha reviewer assignment proposal gate V1', () => {
  test('starts empty and creates no assignment automatically', () => {
    const status = proposalGateStatus();

    expect(status.status).toBe('CLEAR');
    expect(status.summary.proposals).toBe(0);
    expect(status.summary.ratifications).toBe(0);
    expect(status.summary.activeReviewerAssignments).toBe(0);
    expect(status.summary.assignmentsCreatedByGate).toBe(0);
    expect(status.truth.noAutomaticAssignment).toBe(true);
  });

  test('prepares a valid proposal without persisting or assigning', () => {
    const result = prepareAssignmentProposal({
      reviewerIdentity: 'urn:test:reviewer',
      authorityRole: 'AUTHORIZATION_REVIEWER',
      baseIdentityRole: 'AUDITOR',
      proposedBy: 'urn:test:proposer',
      proposalEvidenceRef: 'ev-proposal-1',
      domains: ['integration'],
      evidenceKinds: ['AUTHORIZATION'],
    });

    expect(result.decision).toBe('REVIEW');
    expect(result.state).toBe('PROPOSED');
    expect(result.persisted).toBe(false);
    expect(result.assignmentCreated).toBe(false);
    expect(result.proposal.review.state).toBe('REVIEW_REQUIRED');
    expect(result.proposal.review.missing).toHaveLength(0);
  });

  test('denies self proposal', () => {
    const result = prepareAssignmentProposal({
      reviewerIdentity: 'urn:test:same',
      authorityRole: 'AUTHORIZATION_REVIEWER',
      baseIdentityRole: 'AUDITOR',
      proposedBy: 'urn:test:same',
      proposalEvidenceRef: 'ev-proposal-2',
      domains: ['integration'],
      evidenceKinds: ['AUTHORIZATION'],
    });

    expect(result.decision).toBe('DENY');
    expect(result.assignmentCreated).toBe(false);
    expect(result.proposal.review.missing)
      .toContain('selfProposalSeparated');
  });

  test('ratification preview stays non-persistent and non-assigning', () => {
    const proposal = prepareAssignmentProposal({
      reviewerIdentity: 'urn:test:reviewer',
      authorityRole: 'AUTHORIZATION_REVIEWER',
      baseIdentityRole: 'AUDITOR',
      proposedBy: 'urn:test:proposer',
      proposalEvidenceRef: 'ev-proposal-3',
      domains: ['integration'],
      evidenceKinds: ['AUTHORIZATION'],
    }).proposal;

    const result = evaluateAssignmentRatification(proposal, {
      ratifierIdentity: 'urn:test:ratifier',
      ratificationEvidenceRef: 'ev-ratification-1',
      integrity: {
        algorithm: 'SHA-256',
        digest: SHA256,
      },
      signature: {
        status: 'VERIFIED',
        signerIdentity: 'urn:test:ratifier-signer',
      },
    });

    expect(result.state).toBe('APPROVED_ASSIGNMENT');
    expect(result.decision).toBe('ELIGIBLE_FOR_MANUAL_ASSIGNMENT');
    expect(result.persisted).toBe(false);
    expect(result.assignmentCreated).toBe(false);
  });

  test('serves proposal gate preview endpoints', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/site-registry/v3', routes);

    const status = await request(app)
      .get('/api/site-registry/v3/reviewer-assignment-proposal-gate');
    expect(status.status).toBe(200);
    expect(status.body.data.summary.assignmentsCreatedByGate).toBe(0);

    const proposal = await request(app)
      .post('/api/site-registry/v3/reviewer-assignment-proposal-gate/propose-preview')
      .send({
        reviewerIdentity: 'urn:test:reviewer',
        authorityRole: 'AUTHORIZATION_REVIEWER',
        baseIdentityRole: 'AUDITOR',
        proposedBy: 'urn:test:proposer',
        proposalEvidenceRef: 'ev-proposal-4',
        domains: ['integration'],
        evidenceKinds: ['AUTHORIZATION'],
      });

    expect(proposal.status).toBe(200);
    expect(proposal.body.data.assignmentCreated).toBe(false);
  });
});
