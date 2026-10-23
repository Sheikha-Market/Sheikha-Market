'use strict';

const express = require('express');
const request = require('supertest');

const {
  buildReviewerAuthorityRegistry,
  evaluateReviewerAuthority,
} = require(
  '../core/engine-registry/sheikha-reviewer-authority-registry-v1'
);
const routes = require(
  '../routes/site-registry/sheikha-engine-domain-routes-v3'
);

describe('Sheikha reviewer authority registry V1', () => {
  test('defines reviewer roles without assigning identities automatically', () => {
    const registry = buildReviewerAuthorityRegistry();

    expect(registry.status).toBe('CLEAR');
    expect(registry.summary.authorityRoles).toBe(4);
    expect(registry.summary.identityRoleVocabulary).toBe(11);
    expect(registry.summary.assignments).toBe(0);
    expect(registry.summary.invalidRoleReferences).toBe(0);
    expect(registry.summary.invalidAssignments).toBe(0);
  });

  test('denies reviewer identities without explicit assignment', () => {
    const result = evaluateReviewerAuthority({
      reviewerIdentity: 'urn:test:reviewer',
      evidenceKind: 'AUTHORIZATION',
      domains: ['integration'],
      decision: 'APPROVED',
      signerIdentity: 'urn:test:signer',
      ownerIdentity: 'urn:test:owner',
    });

    expect(result.authorizedReviewer).toBe(false);
    expect(result.decision).toBe('DENY');
    expect(result.reason).toBe('REVIEWER_NOT_ASSIGNED');
  });

  test('denies self-approval even before role scope evaluation', () => {
    const result = evaluateReviewerAuthority({
      reviewerIdentity: 'urn:test:same',
      evidenceKind: 'AUTHORIZATION',
      domains: ['integration'],
      decision: 'APPROVED',
      signerIdentity: 'urn:test:same',
      ownerIdentity: 'urn:test:owner',
    });

    expect(result.authorizedReviewer).toBe(false);
    expect(result.reason).toBe('SEPARATION_OF_DUTIES_VIOLATION');
  });

  test('serves reviewer authority registry read-only endpoints', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/site-registry/v3', routes);

    const registry = await request(app)
      .get('/api/site-registry/v3/reviewer-authority-registry');
    expect(registry.status).toBe(200);
    expect(registry.body.data.status).toBe('CLEAR');
    expect(registry.body.data.summary.assignments).toBe(0);

    const evaluation = await request(app)
      .post('/api/site-registry/v3/reviewer-authority-registry/evaluate')
      .send({
        reviewerIdentity: 'urn:test:reviewer',
        evidenceKind: 'AUTHORIZATION',
        domains: ['integration'],
        decision: 'APPROVED',
        signerIdentity: 'urn:test:signer',
        ownerIdentity: 'urn:test:owner',
      });

    expect(evaluation.status).toBe(200);
    expect(evaluation.body.data.reason).toBe('REVIEWER_NOT_ASSIGNED');
    expect(evaluation.body.data.authorizedReviewer).toBe(false);
  });
});
