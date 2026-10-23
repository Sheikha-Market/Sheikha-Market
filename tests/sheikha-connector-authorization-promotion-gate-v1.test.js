'use strict';

const express = require('express');
const request = require('supertest');

const {
  buildPromotionGateStatus,
  evaluateConnectorPromotion,
} = require(
  '../core/engine-registry/' +
  'sheikha-connector-authorization-promotion-gate-v1'
);
const routes = require(
  '../routes/site-registry/sheikha-engine-domain-routes-v3'
);

describe('Sheikha connector authorization promotion gate V1', () => {
  test('evaluates all connectors without granting authorization', () => {
    const status = buildPromotionGateStatus();

    expect(status.status).toBe('CLEAR');
    expect(status.summary.connectorsEvaluated).toBe(33);
    expect(status.summary.evidenceLedgerRecords).toBe(0);
    expect(status.summary.review).toBe(33);
    expect(status.summary.eligible).toBe(0);
    expect(status.summary.authorizationsGranted).toBe(0);
    expect(status.summary.livePromotionsGranted).toBe(0);
    expect(status.truth.evaluationOnly).toBe(true);
  });

  test('returns REVIEW for registered connector with incomplete evidence', () => {
    const result = evaluateConnectorPromotion({
      connectorId: 'CONN-005',
      operations: ['READ'],
      target: 'AUTHORIZATION_REVIEW',
    });

    expect(result.decision).toBe('REVIEW');
    expect(result.authorizationGranted).toBe(false);
    expect(result.liveGranted).toBe(false);
    expect(result.missing).toEqual(expect.arrayContaining([
      'ownerIdentityPresent',
      'termsOrContractEvidence',
      'authorizationEvidence',
      'humanApprovalEvidence',
    ]));
  });

  test('denies mutation and live promotion requests', () => {
    const mutation = evaluateConnectorPromotion({
      connectorId: 'CONN-005',
      operations: ['WRITE'],
    });
    expect(mutation.decision).toBe('DENY');
    expect(mutation.reason).toBe('MUTATION_OPERATION_BLOCKED');

    const live = evaluateConnectorPromotion({
      connectorId: 'CONN-005',
      operations: ['READ'],
      target: 'LIVE',
    });
    expect(live.decision).toBe('DENY');
    expect(live.reason).toBe('LIVE_OR_STATE_PROMOTION_NOT_SUPPORTED');
  });

  test('serves read-only promotion gate endpoints', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/site-registry/v3', routes);

    const status = await request(app)
      .get('/api/site-registry/v3/authorization-promotion-gate');
    expect(status.status).toBe(200);
    expect(status.body.data.status).toBe('CLEAR');

    const review = await request(app)
      .post('/api/site-registry/v3/authorization-promotion-gate/evaluate')
      .send({
        connectorId: 'CONN-005',
        operations: ['READ'],
      });
    expect(review.status).toBe(200);
    expect(review.body.data.decision).toBe('REVIEW');
    expect(review.body.data.authorizationGranted).toBe(false);

    const denied = await request(app)
      .post('/api/site-registry/v3/authorization-promotion-gate/evaluate')
      .send({
        connectorId: 'CONN-005',
        operations: ['WRITE'],
      });
    expect(denied.status).toBe(200);
    expect(denied.body.data.decision).toBe('DENY');
  });
});
