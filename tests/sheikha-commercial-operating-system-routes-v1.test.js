'use strict';

const express = require('express');
const request = require('supertest');
const router = require('../routes/sheikha-commercial-operating-system-v1.routes');

const app = express();
app.use(router);

describe('Sheikha commercial operating system routes', () => {
  test('serves the live operating status and feasibility calculation', async () => {
    const status = await request(app).get('/api/sheikha/commercial-os/v1/status');
    expect(status.status).toBe(200);
    expect(status.body.data.offerCount).toBeGreaterThanOrEqual(9);
    const feasibility = await request(app).get('/api/sheikha/commercial-os/v1/feasibility')
      .query({ offerId: 'SHEIKHA_360_MEASURED_TWIN_PILOT_V1', customers: 2, variableCostPerCustomerSar: 4000, monthlyFixedCostSar: 7000 });
    expect(feasibility.status).toBe(200);
    expect(feasibility.body.data.scenario.operatingResultSar).toBe(15000);
  });

  test('enforces guardian supervision for the child profile before model invocation', async () => {
    const response = await request(app).post('/api/sheikha/commercial-os/v1/public-chat').send({
      prompt: 'اشرح الجمع', audienceProfile: 'child', domain: 'education', guardianConsent: false,
    });
    expect(response.status).toBe(403);
    expect(response.body.status).toBe('GUARDIAN_SUPERVISION_CONFIRMATION_REQUIRED');
  });

  test('answers core unit economics from a verified deterministic path', async () => {
    const response = await request(app).post('/api/sheikha/commercial-os/v1/public-chat').send({
      prompt: 'ما هي نقطة التعادل؟', audienceProfile: 'adult', domain: 'business', guardianConsent: false,
    });
    expect(response.status).toBe(200);
    expect(response.body.data.modelInvoked).toBe(false);
    expect(response.body.data.answer).toContain('التكاليف الثابتة');
  });

  test('evaluates a consented 5D experience and rejects missing consent', async () => {
    const body = {
      baseline: { value: 70, usability: 72, trust: 80, context: 65, time: 68 },
      candidate: { value: 78, usability: 76, trust: 82, context: 73, time: 75 },
      environments: ['WEB', 'MOBILE'], consentGranted: true,
    };
    const accepted = await request(app).post('/api/sheikha/commercial-os/v1/experience-5d/evaluate').send(body);
    expect(accepted.status).toBe(200);
    expect(accepted.body.data.controlledTrialAllowed).toBe(true);
    const denied = await request(app).post('/api/sheikha/commercial-os/v1/experience-5d/evaluate').send({ ...body, consentGranted: false });
    expect(denied.status).toBe(422);
    expect(denied.body.data.blockers).toContain('CUSTOMER_CONSENT_REQUIRED');
  });

  test('serves the 28-component runtime and plans continuation from source', async () => {
    const status = await request(app).get('/api/sheikha/runtime/v1/status');
    expect(status.status).toBe(200);
    expect(status.body.data.componentCount).toBe(28);
    expect(status.body.data.evidencePresentCount).toBe(28);

    const sequence = await request(app).post('/api/sheikha/runtime/v1/sequence/plan').send({
      goal: 'تشغيل تجربة تجارية مقاسة',
      beneficiary: 'عميل تجريبي',
      measurableOutcome: 'تسليم مقبول دون حادث أمني',
      constraints: 'مراجعة بشرية قبل أي إطلاق',
    });
    expect(sequence.status).toBe(200);
    expect(sequence.body.data.temporaryDownloadScriptRequired).toBe(false);
    expect(sequence.body.data.execution.tpmAccessPerformed).toBe(false);
  });
});
