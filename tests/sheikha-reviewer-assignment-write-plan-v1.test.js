'use strict';

const express = require('express');
const request = require('supertest');

const {
  buildAssignmentRecord,
  buildWritePlanStatus,
  canonicalJson,
  previewAssignmentWritePlan,
} = require(
  '../core/engine-registry/' +
  'sheikha-reviewer-assignment-write-plan-v1'
);
const {
  currentAssignmentRegistryState,
  stableScopeChecksum,
} = require(
  '../core/engine-registry/' +
  'sheikha-reviewer-assignment-manual-commit-gate-v1'
);
const routes = require(
  '../routes/site-registry/sheikha-engine-domain-routes-v3'
);

describe('Sheikha reviewer assignment write plan V1', () => {
  test('is deterministic preview-only with no write activity', () => {
    const status = buildWritePlanStatus();

    expect(status.status).toBe('CLEAR');
    expect(status.summary.assignmentRecords).toBe(0);
    expect(status.summary.persistedPlans).toBe(0);
    expect(status.summary.writesPerformedByPlanner).toBe(0);
    expect(status.truth.deterministicPreviewOnly).toBe(true);
    expect(status.truth.noAssignmentWrite).toBe(true);
  });

  test('builds stable canonical assignment scope', () => {
    const input = {
      assignmentId: 'assignment-test-1',
      reviewerIdentity: 'urn:test:reviewer',
      authorityRole: 'AUTHORIZATION_REVIEWER',
      baseIdentityRole: 'AUDITOR',
      domains: ['integration', 'commerce'],
      evidenceKinds: ['AUTHORIZATION', 'HUMAN_APPROVAL'],
      proposalId: 'rap-test',
      ratificationEvidenceRef: 'ev-ratification-test',
    };

    const first = buildAssignmentRecord(input);
    const second = buildAssignmentRecord({
      ...input,
      domains: ['commerce', 'integration'],
      evidenceKinds: ['HUMAN_APPROVAL', 'AUTHORIZATION'],
    });

    expect(first.scopeChecksum).toBe(second.scopeChecksum);
    expect(canonicalJson(first)).toBe(canonicalJson(second));
  });

  test('refuses to plan write when manual gate is not eligible', () => {
    const state = currentAssignmentRegistryState();
    const scopeChecksum = stableScopeChecksum({
      reviewerIdentity: 'urn:test:reviewer',
      authorityRole: 'AUTHORIZATION_REVIEWER',
      baseIdentityRole: 'AUDITOR',
      domains: ['integration'],
      evidenceKinds: ['AUTHORIZATION'],
    });

    const result = previewAssignmentWritePlan({
      commit: {
        proposalId: 'rap-not-persisted',
        expectedRegistrySha256: state.sha256,
        expectedRecordCount: state.recordCount,
        scopeChecksum,
        confirmationPhrase: 'AUTHORIZE_REVIEWER_ASSIGNMENT_WRITE',
      },
      assignment: {
        assignmentId: 'assignment-test-1',
        reviewerIdentity: 'urn:test:reviewer',
        authorityRole: 'AUTHORIZATION_REVIEWER',
        baseIdentityRole: 'AUDITOR',
        domains: ['integration'],
        evidenceKinds: ['AUTHORIZATION'],
        ratificationEvidenceRef: 'ev-ratification-test',
      },
    });

    expect(result.decision).toBe('DENY');
    expect(result.reason).toBe('MANUAL_COMMIT_GATE_NOT_ELIGIBLE');
    expect(result.writePerformed).toBe(false);
    expect(result.assignmentCreated).toBe(false);
  });

  test('serves status and write-plan preview endpoints only', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/site-registry/v3', routes);

    const status = await request(app)
      .get('/api/site-registry/v3/reviewer-assignment-write-plan');

    expect(status.status).toBe(200);
    expect(status.body.data.summary.writesPerformedByPlanner).toBe(0);

    const state = currentAssignmentRegistryState();
    const preview = await request(app)
      .post('/api/site-registry/v3/reviewer-assignment-write-plan/preview')
      .send({
        commit: {
          proposalId: 'rap-not-persisted',
          expectedRegistrySha256: state.sha256,
          expectedRecordCount: state.recordCount,
          scopeChecksum: '1'.repeat(64),
          confirmationPhrase: 'AUTHORIZE_REVIEWER_ASSIGNMENT_WRITE',
        },
        assignment: {
          assignmentId: 'assignment-test-2',
          reviewerIdentity: 'urn:test:reviewer',
          authorityRole: 'AUTHORIZATION_REVIEWER',
          baseIdentityRole: 'AUDITOR',
          domains: ['integration'],
          evidenceKinds: ['AUTHORIZATION'],
          ratificationEvidenceRef: 'ev-ratification-test',
        },
      });

    expect(preview.status).toBe(200);
    expect(preview.body.data.decision).toBe('DENY');
    expect(preview.body.data.writePerformed).toBe(false);
  });
});
