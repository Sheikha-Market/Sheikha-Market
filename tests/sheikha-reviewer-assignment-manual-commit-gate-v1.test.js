'use strict';

const express = require('express');
const request = require('supertest');

const {
  buildManualCommitGateStatus,
  currentAssignmentRegistryState,
  evaluateManualAssignmentCommit,
  stableScopeChecksum,
} = require(
  '../core/engine-registry/' +
  'sheikha-reviewer-assignment-manual-commit-gate-v1'
);
const routes = require(
  '../routes/site-registry/sheikha-engine-domain-routes-v3'
);

describe('Sheikha reviewer assignment manual commit gate V1', () => {
  test('is preview-only with no assignments written', () => {
    const status = buildManualCommitGateStatus();

    expect(status.status).toBe('CLEAR');
    expect(status.summary.assignmentRecords).toBe(0);
    expect(status.summary.commitIntentsPersisted).toBe(0);
    expect(status.summary.assignmentsWrittenByGate).toBe(0);
    expect(status.truth.previewOnly).toBe(true);
    expect(status.truth.noWriteEndpoint).toBe(true);
  });

  test('exposes current registry checksum for compare-and-swap', () => {
    const state = currentAssignmentRegistryState();

    expect(state.recordCount).toBe(0);
    expect(state.sha256).toMatch(/^[a-f0-9]{64}$/);
  });

  test('denies when proposal and ratification are not persisted', () => {
    const state = currentAssignmentRegistryState();
    const scopeChecksum = stableScopeChecksum({
      reviewerIdentity: 'urn:test:reviewer',
      authorityRole: 'AUTHORIZATION_REVIEWER',
      baseIdentityRole: 'AUDITOR',
      domains: ['integration'],
      evidenceKinds: ['AUTHORIZATION'],
    });

    const result = evaluateManualAssignmentCommit({
      proposalId: 'rap-not-persisted',
      expectedRegistrySha256: state.sha256,
      expectedRecordCount: state.recordCount,
      scopeChecksum,
      confirmationPhrase: 'AUTHORIZE_REVIEWER_ASSIGNMENT_WRITE',
    });

    expect(result.decision).toBe('DENY');
    expect(result.writePerformed).toBe(false);
    expect(result.assignmentCreated).toBe(false);
    expect(result.missing).toEqual(expect.arrayContaining([
      'proposalPersisted',
      'approvedRatificationPersisted',
      'scopeChecksumMatches',
      'ratificationEvidencePresent',
      'ratificationIntegrityPresent',
      'ratificationSignatureVerified',
    ]));
  });

  test('denies stale registry checksum', () => {
    const result = evaluateManualAssignmentCommit({
      proposalId: 'rap-any',
      expectedRegistrySha256: '0'.repeat(64),
      expectedRecordCount: 0,
      scopeChecksum: '1'.repeat(64),
      confirmationPhrase: 'AUTHORIZE_REVIEWER_ASSIGNMENT_WRITE',
    });

    expect(result.decision).toBe('DENY');
    expect(result.checks.registrySha256Matches).toBe(false);
    expect(result.writePerformed).toBe(false);
  });

  test('serves status and evaluation only', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/site-registry/v3', routes);

    const status = await request(app)
      .get('/api/site-registry/v3/reviewer-assignment-manual-commit-gate');

    expect(status.status).toBe(200);
    expect(status.body.data.summary.assignmentsWrittenByGate).toBe(0);

    const state = currentAssignmentRegistryState();
    const evaluation = await request(app)
      .post('/api/site-registry/v3/reviewer-assignment-manual-commit-gate/evaluate')
      .send({
        proposalId: 'rap-not-persisted',
        expectedRegistrySha256: state.sha256,
        expectedRecordCount: 0,
        scopeChecksum: '1'.repeat(64),
        confirmationPhrase: 'AUTHORIZE_REVIEWER_ASSIGNMENT_WRITE',
      });

    expect(evaluation.status).toBe(200);
    expect(evaluation.body.data.decision).toBe('DENY');
    expect(evaluation.body.data.writePerformed).toBe(false);
  });
});
