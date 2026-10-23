'use strict';

const express = require('express');
const request = require('supertest');

const {
  buildExpectedActualDiff,
  buildRecoveryPlan,
  inspectRecoveryReadiness,
} = require(
  '../core/engine-registry/' +
  'sheikha-reviewer-assignment-recovery-reconciliation-v1'
);
const routes = require(
  '../routes/site-registry/sheikha-engine-domain-routes-v3'
);

describe('Sheikha reviewer assignment recovery reconciliation V1', () => {
  test('is clear when current state matches audit baseline', () => {
    const plan = buildRecoveryPlan();

    expect(plan.status).toBe('CLEAR');
    expect(plan.summary.driftDetected).toBe(0);
    expect(plan.summary.proposedActions).toBe(0);
    expect(plan.summary.automaticRepairsPerformed).toBe(0);
    expect(plan.summary.automaticRollbacksPerformed).toBe(0);
    expect(plan.summary.baselineRefreshesPerformed).toBe(0);
    expect(plan.plan.executionAuthorized).toBe(false);
    expect(plan.truth.noAssignmentMutation).toBe(true);
  });

  test('exposes expected versus actual comparison', () => {
    const comparison = buildExpectedActualDiff();

    expect(comparison.expected.sha256)
      .toBe(comparison.actual.sha256);
    expect(comparison.expected.recordCount)
      .toBe(comparison.actual.recordCount);
    expect(comparison.diff.hashChanged).toBe(false);
    expect(comparison.diff.recordCountChanged).toBe(false);
    expect(comparison.diff.addedAssignmentIds).toHaveLength(0);
    expect(comparison.diff.missingAssignmentIds).toHaveLength(0);
  });

  test('inspection is read-only and never repairs or rolls back', () => {
    const inspection = inspectRecoveryReadiness();

    expect(inspection.inspection.readOnly).toBe(true);
    expect(inspection.inspection.repairPerformed).toBe(false);
    expect(inspection.inspection.rollbackPerformed).toBe(false);
    expect(inspection.inspection.baselineRefreshPerformed).toBe(false);
    expect(inspection.inspection.assignmentMutationPerformed).toBe(false);
  });

  test('serves recovery plan read-only endpoints', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/site-registry/v3', routes);

    const status = await request(app)
      .get('/api/site-registry/v3/reviewer-assignment-recovery-plan');

    expect(status.status).toBe(200);
    expect(status.body.data.status).toBe('CLEAR');
    expect(status.body.data.summary.proposedActions).toBe(0);

    const inspection = await request(app)
      .post('/api/site-registry/v3/reviewer-assignment-recovery-plan/inspect')
      .send({});

    expect(inspection.status).toBe(200);
    expect(inspection.body.data.inspection.repairPerformed).toBe(false);
    expect(inspection.body.data.inspection.rollbackPerformed).toBe(false);
  });
});
