'use strict';

const express = require('express');
const request = require('supertest');

const {
  buildAssignmentGovernanceSummary,
} = require(
  '../core/engine-registry/sheikha-assignment-governance-summary-v1'
);
const routes = require(
  '../routes/site-registry/sheikha-engine-domain-routes-v3'
);

describe('Sheikha assignment governance summary V1', () => {
  test('summarizes all governance stages without mutating state', () => {
    const summary = buildAssignmentGovernanceSummary();

    expect(summary.status).toBe('CLEAR');
    expect(summary.summary.stages).toBe(13);
    expect(summary.summary.clearSystemStages).toBe(13);
    expect(summary.summary.activeReviewerAssignments).toBe(0);
    expect(summary.summary.authorizedConnectors).toBe(0);
    expect(summary.summary.liveVerifiedConnectors).toBe(0);
    expect(summary.summary.assignmentDriftDetected).toBe(0);
    expect(summary.summary.automaticMutationsPerformed).toBe(0);
  });

  test('separates system status from workflow state', () => {
    const summary = buildAssignmentGovernanceSummary();

    expect(summary.status).toBe('CLEAR');
    expect(summary.workflowState).toBe('AWAITING_REVIEWER_ASSIGNMENT');
    expect(summary.nextAllowedAction)
      .toBe(
        'PROPOSE_REVIEWER_ASSIGNMENT_PREVIEW_AFTER_EXPLICIT_IDENTITY_AND_ROLE_INPUT'
      );
  });

  test('includes evidence, blockers, and next allowed action per stage', () => {
    const summary = buildAssignmentGovernanceSummary();

    for (const stage of summary.stages) {
      expect(stage.id).toBeTruthy();
      expect(stage.labelAr).toBeTruthy();
      expect(stage.systemStatus).toBeTruthy();
      expect(stage.workflowState).toBeTruthy();
      expect(stage.evidence).toBeTruthy();
      expect(Array.isArray(stage.blockers)).toBe(true);
      expect(stage.nextAllowedAction).toBeTruthy();
    }

    const reviewerStage = summary.stages.find(
      (stage) => stage.id === 'REVIEWER_AUTHORITY_REGISTRY'
    );
    expect(reviewerStage.blockers).toContain('NO_REVIEWER_ASSIGNMENTS');
  });

  test('serves governance summary through read-only endpoint', async () => {
    const app = express();
    app.use('/api/site-registry/v3', routes);

    const response = await request(app)
      .get('/api/site-registry/v3/assignment-governance-summary');

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe('CLEAR');
    expect(response.body.data.summary.stages).toBe(13);
    expect(response.body.data.summary.automaticMutationsPerformed).toBe(0);
  });
});
