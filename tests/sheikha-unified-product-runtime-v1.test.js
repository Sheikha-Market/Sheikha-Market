'use strict';

const express = require('express');
const request = require('supertest');

const {
  buildUnifiedProductRuntime
} = require(
  '../core/product-runtime/sheikha-unified-product-runtime-v1'
);
const routes = require(
  '../routes/product-runtime/sheikha-unified-product-runtime-routes-v1'
);

describe('Sheikha Unified Product Runtime V1', () => {
  test('integrates four products without expanding their claims', () => {
    const status = buildUnifiedProductRuntime({
      generatedAt: '2026-07-20T00:00:00.000Z'
    });

    expect(status.passed).toBe(true);
    expect(status.products).toHaveLength(4);
    expect(status.status).toBe(
      'ACTIVE_WITH_BOUNDED_VERIFIED_FOUNDATIONS'
    );
    expect(status.claimBoundary.jannatIsWorldlyMetaphorOnly).toBe(true);
    expect(status.claimBoundary.physicalHardwareVerified).toBe(false);
    expect(status.claimBoundary.generalPurposeOsComplete).toBe(false);
    expect(status.claimBoundary.runnableEverywhereToday).toBe(false);
  });

  test('derives product decisions from named evidence', () => {
    const status = buildUnifiedProductRuntime();

    for (const decision of Object.values(status.decisions)) {
      expect(decision.status).toBe('VERIFIED');
      expect(decision.evidence.verified).toBeGreaterThanOrEqual(2);
      expect(decision.evidence.sha256).toMatch(/^[a-f0-9]{64}$/);
    }
  });

  test('serves product status and denies incomplete logic input', async () => {
    const app = express();
    app.use('/api/sheikha/product-runtime/v1', routes);

    const status = await request(app)
      .get('/api/sheikha/product-runtime/v1/status');
    expect(status.status).toBe(200);
    expect(status.body.data.products).toHaveLength(4);

    const incomplete = await request(app)
      .post('/api/sheikha/product-runtime/v1/logic/evaluate')
      .send({ proposition: 'Unsupported claim' });
    expect(incomplete.status).toBe(422);
    expect(incomplete.body.data.authorization).toBe('DENY');

    const religious = await request(app)
      .post('/api/sheikha/product-runtime/v1/logic/evaluate')
      .send({
        proposition: 'Issue a religious ruling.',
        domain: 'RELIGIOUS_RULING',
        qualifiedHumanReview: true,
        evidence: [{
          id: 'reference',
          source: 'client-asserted-reference',
          verified: true,
          supports: true
        }]
      });
    expect(religious.status).toBe(422);
    expect(religious.body.data.authorization).toBe('DENY');
  });
});
