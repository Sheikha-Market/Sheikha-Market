'use strict';

const request = require('supertest');
const app = require('./helpers/product-knowledge-test-app');

describe('Sheikha Product Knowledge HTTP V1', () => {
  test('evaluates product governance over HTTP', async () => {
    const response = await request(app)
      .post('/api/product-knowledge/governance/evaluate')
      .send({
        quality: { score: 80 },
        risk: { level: 'LOW' },
        standards: ['internal-inspection-required'],
        price: { amount: 25 }
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.passed).toBe(true);
  });

  test('evaluates lifecycle transition over HTTP', async () => {
    const response = await request(app)
      .post('/api/product-knowledge/lifecycle/evaluate')
      .send({
        currentState: 'DRAFT',
        nextState: 'PENDING_REVIEW'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.allowed).toBe(true);
  });

  test('detects duplicates over HTTP', async () => {
    const response = await request(app)
      .post('/api/product-knowledge/duplicates/detect')
      .send({
        name: 'Copper Cable Scrap',
        category: 'metals',
        description: 'Industrial copper cable scrap'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.system).toBe('SHEIKHA_PRODUCT_DUPLICATE_DETECTION_ENGINE_V1');
  });
});
