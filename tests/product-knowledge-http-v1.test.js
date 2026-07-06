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


  test('runs unified product decision pipeline over HTTP', async () => {
    const response = await request(app)
      .post('/api/product-knowledge/decision')
      .send({
        name: 'Copper Cable',
        category: 'metals',
        description: 'Industrial copper cable scrap',
        specifications: { unit: 'kg' },
        standards: ['internal-inspection-required'],
        price: { amount: 25, currency: 'SAR' },
        quality: { score: 80 },
        risk: { level: 'LOW' },
        force: true
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.system).toBe('SHEIKHA_ENTERPRISE_PRODUCT_GOVERNANCE_PIPELINE_V1');
    expect(response.body.data.finalDecision).toBe('APPROVED');
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
