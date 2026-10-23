'use strict';

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

jest.mock('../config/config', () => ({
  security: {jwt: {secret: 'commercial-auth-test-only-secret', expiresIn: '5m'}}
}));
jest.mock('../config/database', () => ({read: () => []}));

const {mountCommercialSales} = require('../routes/commercial-sales/sheikha-commercial-sales-mount-v1');
const {exampleInputs} = require('../tools/training/sheikha-foundry-workbench-v1');
const {sourcingInput, exitInput, storageInput, capacityInput, platformInput} = require('./fixtures/sheikha-foundry-sourcing-v1');
const {BootEvidenceCollector} = require('../core/governance/sheikha-boot-evidence-collector-v1');

function token(role) {
  return jwt.sign({id: 'test-operator', role}, 'commercial-auth-test-only-secret', {expiresIn: '5m'});
}

describe('Commercial HTTP approval boundaries', () => {
  let app;
  let dataDir;
  beforeEach(async () => {
    dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-http-test-'));
    const application = express();
    mountCommercialSales(application, { dataDir });
    await new Promise((resolve, reject) => {
      app = application.listen(0, '127.0.0.1', resolve);
      app.once('error', reject);
    });
  });
  afterEach(async () => {
    if (app?.listening) await new Promise(resolve => app.close(resolve));
    if (dataDir) fs.rmSync(dataDir, { recursive: true, force: true });
  });

  test.each(['/orders', '/proforma'])('rejects self-asserted approval at %s', async (route) => {
    const response = await request(app).post(`/api/commercial/v1${route}`)
      .set('X-Role', 'admin')
      .send({ownerApproved: true, signedAgreement: true, user: {role: 'admin'}});
    expect(response.status).toBe(401);
    expect(response.body.code).toBe('AUTH_TOKEN_MISSING');
  });

  test.each(['/orders', '/proforma'])('rejects a customer token at %s', async (route) => {
    const response = await request(app).post(`/api/commercial/v1${route}`)
      .set('Authorization', `Bearer ${token('customer')}`)
      .send({ownerApproved: true, signedAgreement: true});
    expect(response.status).toBe(403);
  });

  test('allows an authenticated operator through the documented workflow', async () => {
    const quoteResponse = await request(app).post('/api/commercial/v1/quotes')
      .send({offerId: 'SHEIKHA_CHAT_PRO_PILOT_V1'});
    expect(quoteResponse.status).toBe(201);
    const orderResponse = await request(app).post('/api/commercial/v1/orders')
      .set('Authorization', `Bearer ${token('admin')}`)
      .send({quote: quoteResponse.body.quote, customerAcceptedScope: true, ownerApproved: true});
    expect(orderResponse.status).toBe(201);
    expect(orderResponse.body.order.status).toBe('PENDING_SIGNATURE');
    const paymentResponse = await request(app).post('/api/commercial/v1/proforma')
      .set('Authorization', `Bearer ${token('admin')}`)
      .send({order: orderResponse.body.order, signedAgreement: true, invoiceRecipient: 'Test customer'});
    expect(paymentResponse.status).toBe(201);
    expect(paymentResponse.body.document.revenueRecognized).toBe(false);
    expect(paymentResponse.body.document.officialTaxInvoiceIssued).toBe(false);
  });

  test('keeps the catalog public', async () => {
    const response = await request(app).get('/api/commercial/v1/offers');
    expect(response.status).toBe(200);
    expect(response.body.offers.some((offer) => offer.id === 'SHEIKHA_CHAT_PRO_PILOT_V1')).toBe(true);
  });

  test('persists a request once and serves a private receipt without claiming payment', async () => {
    const snapshot = await request(app).get('/api/commercial/v1/self-service-offers');
    const offer = snapshot.body.offers.find(item => item.offerId === 'SHEIKHA_SUPPLY_CHAIN_DIAGNOSTIC_V1');
    const payload = {
      name: 'Self service customer', email: 'self-service@example.com',
      offerId: offer.offerId, offerDigest: offer.offerDigest,
      need: 'A scoped supply chain diagnostic request.', scopeAccepted: true,
      termsAccepted: true, privacyConsent: true, paymentObligationAccepted: true
    };
    const response = await request(app)
      .post('/api/commercial/v1/self-service-checkouts')
      .set('Idempotency-Key', 'a'.repeat(64)).send(payload);
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.paymentCaptured).toBe(false);
    expect(response.body.subtotalSar).toBe(2500);
    expect(response.body.totalSar).toBeNull();
    expect(response.body.fulfillmentAuthorized).toBe(false);
    const replay = await request(app).post('/api/commercial/v1/self-service-checkouts')
      .set('Idempotency-Key', 'a'.repeat(64)).send(payload);
    expect(replay.status).toBe(200);
    expect(replay.body.orderId).toBe(response.body.orderId);
    expect(replay.body.receiptToken).toBe(response.body.receiptToken);
    expect(fs.readdirSync(path.join(dataDir, 'checkout-records')).length).toBe(1);
    const receiptPath = `/api/commercial/v1/receipts/${response.body.receiptId}`;
    expect((await request(app).get(receiptPath)).status).toBe(404);
    expect((await request(app).get(receiptPath).set('Authorization', `Bearer ${'0'.repeat(64)}`)).status).toBe(404);
    const receipt = await request(app).get(receiptPath).set('Authorization', `Bearer ${response.body.receiptToken}`);
    expect(receipt.status).toBe(200);
    expect(receipt.headers['cache-control']).toContain('no-store');
    expect(JSON.stringify(receipt.body)).not.toContain(payload.email);
    expect(receipt.body.receiptToken).toBeUndefined();
    const conflict = await request(app).post('/api/commercial/v1/self-service-checkouts')
      .set('Idempotency-Key', 'a'.repeat(64)).send({ ...payload, name: 'Different customer' });
    expect(conflict.status).toBe(409);
  });

  test('rejects stale offer and browser tax or payment declarations', async () => {
    const response = await request(app).post('/api/commercial/v1/self-service-checkouts')
      .set('Idempotency-Key', 'b'.repeat(64)).send({
        name: 'Test customer', email: 'test@example.com', need: 'Test request description',
        offerId: 'SHEIKHA_SUPPLY_CHAIN_DIAGNOSTIC_V1', offerDigest: 'c'.repeat(64),
        privacyConsent: true, termsAccepted: true, scopeAccepted: true,
        paymentObligationAccepted: true, vatApplicable: false, paymentCaptured: true
      });
    expect(response.status).toBe(400);
    expect(response.body.errors).toContain('CURRENT_OFFER_AND_POLICIES_REQUIRED');
    expect(response.body.errors).toContain('SERVER_CONTROLLED_FIELD_NOT_ALLOWED');
    expect(fs.readdirSync(path.join(dataDir, 'checkout-records'))).toEqual([]);
  });

  test('requires a retry key and reports request admission, not active payment', async () => {
    expect((await request(app).post('/api/commercial/v1/self-service-checkouts').send({})).status).toBe(400);
    const response = await request(app).get('/api/commercial/v1/status');
    expect(response.body.commercialProductionReady).toBe(false);
    expect(response.body.firstRevenuePathActive).toBe(false);
  });

  test('previews unit economics without accepting forged payment claims', async () => {
    const response = await request(app)
      .post('/api/commercial/v1/economics/preview')
      .send({
        channel: 'HYBRID',
        monthlyUnits: 20,
        pricePerUnitSar: 299,
        variableCostPerUnitSar: 45,
        monthlyFixedCostSar: 2000,
        setupRevenueSar: 3000,
        setupCostSar: 1000,
        taxAndStatutoryReserveRate: 0.15,
        commercialUseRights: true,
        serviceResaleRights: true,
        paymentVerified: true
      });
    expect(response.status).toBe(200);
    expect(response.body.assessment.status).toBe('COMMERCIAL_CASE_BLOCKED');
    expect(response.body.assessment.paymentCaptured).toBe(false);
    expect(response.body.assessment.blockers)
      .toContain('HTTP_INPUT_CANNOT_SELF_ASSERT_VERIFIED_PAYMENT');
  });

  const foundryRoutes = ['/foundry/quotes/preview', '/foundry/composition/plan', '/foundry/training-results/index-preview', '/foundry/improvement/preview', '/foundry/byoc/plan', '/foundry/reinvestment/preview', '/foundry/sourcing/preview', '/foundry/exit/preview', '/foundry/storage/preview', '/foundry/capacity/preview', '/foundry/platform-release/preview'];
  test.each(foundryRoutes)('requires authenticated admin for %s', async route => {
    const unauthenticated = await request(app).post(`/api/commercial/v1${route}`).send({approved: true});
    expect(unauthenticated.status).toBe(401);
    const customer = await request(app).post(`/api/commercial/v1${route}`).set('Authorization', `Bearer ${token('customer')}`).send({approved: true});
    expect(customer.status).toBe(403);
  });
  test('protects Foundry policy and never caches private previews', async () => {
    expect((await request(app).get('/api/commercial/v1/foundry/policy')).status).toBe(401);
    const policy = await request(app).get('/api/commercial/v1/foundry/policy').set('Authorization', `Bearer ${token('admin')}`);
    expect(policy.body.executionEnabled).toBe(false);
    const examples = exampleInputs();
    for (const [route, input] of [['quotes/preview', examples.quote], ['composition/plan', examples.composition]]) {
      const response = await request(app).post(`/api/commercial/v1/foundry/${route}`).set('Authorization', `Bearer ${token('admin')}`).send(input);
      expect(response.status).toBe(200);
      expect(response.headers['cache-control']).toBe('no-store');
      expect(response.body.data.trainingExecuted).toBe(false);
    }
  });
  test('rejects forged approval even from admin without echoing input', async () => {
    const response = await request(app).post('/api/commercial/v1/foundry/composition/plan')
      .set('Authorization', `Bearer ${token('admin')}`)
      .send({...exampleInputs().composition, productionGatesPassed: true, customerText: 'DO_NOT_ECHO_CUSTOMER_TEXT'});
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('FOUNDRY_PREVIEW_INPUT_INVALID');
    expect(JSON.stringify(response.body)).not.toContain('DO_NOT_ECHO');
  });
  test('indexes declarations without promoting or proving ownership', async () => {
    const input = {runId: 'test', tenantRef: 'tenant-a', modelRef: 'model', objective: 'sft', contractRef: 'unsigned-test', licenseRef: 'test'};
    for (const key of ['artifactSha256', 'baseSha256', 'tokenizerSha256', 'recipeSha256', 'datasetManifestSha256', 'evaluationSha256']) input[key] = 'a'.repeat(64);
    const response = await request(app).post('/api/commercial/v1/foundry/training-results/index-preview')
      .set('Authorization', `Bearer ${token('admin')}`).send(input);
    expect(response.status).toBe(200);
    expect(response.body.data.contentVerified).toBe(false);
    expect(response.body.data.rightsVerified).toBe(false);
    expect(response.body.data.reusableAcrossTenants).toBe(false);
  });
  test('returns a review candidate, not an automatic deployment', async () => {
    const baseline = {artifactSha256: 'a'.repeat(64), holdoutSha256: 'b'.repeat(64), recipeSha256: 'c'.repeat(64), sampleCount: 100, taskScore: 0.7, safetyFailureRate: 0, p95LatencyMs: 50, costHalalaPer1000Requests: 100};
    const response = await request(app).post('/api/commercial/v1/foundry/improvement/preview')
      .set('Authorization', `Bearer ${token('admin')}`)
      .send({baseline, candidate: {...baseline, artifactSha256: 'd'.repeat(64), taskScore: 0.8}});
    expect(response.status).toBe(200);
    expect(response.body.data.eligibleForHumanReview).toBe(true);
    expect(response.body.data.automaticPromotion).toBe(false);
  });
  test('investment preview preserves liabilities and never spends', async () => {
    const response = await request(app).post('/api/commercial/v1/foundry/reinvestment/preview')
      .set('Authorization', `Bearer ${token('admin')}`)
      .send({cashHalala: 10000, customerObligationsHalala: 10000, taxAndStatutoryLiabilitiesHalala: 0, otherPayablesHalala: 0, restrictedCashHalala: 0, monthlyOperatingCashHalala: 0, runwayMonths: 3, unallocatedRealizedProfitAfterTaxHalala: 10000});
    expect(response.status).toBe(200);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.body.data.distributableHalala).toBe(0);
    expect(response.body.data.spendingAuthorized).toBe(false);
  });
  test('BYOC preview binds a tenant and requires independent custody approval', async () => {
    const index = {runId: 'test', tenantRef: 'customer-a', modelRef: 'model', objective: 'sft', contractRef: 'draft', licenseRef: 'review'};
    for (const key of ['artifactSha256', 'baseSha256', 'tokenizerSha256', 'recipeSha256', 'datasetManifestSha256', 'evaluationSha256']) index[key] = 'a'.repeat(64);
    const input = {index, venue: 'CUSTOMER_DEVICE', hardware: 'CUDA', deviceRef: 'customer-pc', maxMinutes: 60, checkpointEverySteps: 10, maxArtifactGiB: 32, retentionDays: 30, custodyProposal: 'SHEIKHA_BACKUP_ONLY', custodyContractRef: 'unsigned'};
    const response = await request(app).post('/api/commercial/v1/foundry/byoc/plan').set('Authorization', `Bearer ${token('admin')}`).send(input);
    expect(response.status).toBe(200);
    expect(response.body.data.custody.sheikhaCopyAuthorized).toBe(false);
    expect(response.body.data.index.tenantRef).toBe('customer-a');
    const forged = await request(app).post('/api/commercial/v1/foundry/byoc/plan').set('Authorization', `Bearer ${token('admin')}`).send({...input, contractSigned: true});
    expect(forged.status).toBe(400);
  });
  test.each([['sourcing', sourcingInput], ['exit', exitInput], ['storage', storageInput], ['capacity', capacityInput], ['platform-release', platformInput]])('%s is an admin study only and rejects activation flags', async (route, factory) => {
    const url = `/api/commercial/v1/foundry/${route}/preview`;
    const response = await request(app).post(url).set('Authorization', `Bearer ${token('admin')}`).send(factory());
    expect(response.status).toBe(200);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.body.data.classification).toContain('CONFIDENTIAL');
    const forged = await request(app).post(url).set('Authorization', `Bearer ${token('admin')}`).send({...factory(), activateNow: true});
    expect(forged.status).toBe(400);
  });
  test('rejects server file paths even from an admin without invoking the local collector', async () => {
    const ingest = jest.spyOn(BootEvidenceCollector.prototype, 'ingest');
    try {
      const response = await request(app).post('/api/commercial/v1/foundry/platform-release/preview')
        .set('Authorization', `Bearer ${token('admin')}`)
        .send({...platformInput(), artifacts: [{relativePath: 'PRIVATE_PATH_MUST_NOT_ECHO'}]});
      expect(response.status).toBe(400);
      expect(response.headers['cache-control']).toBe('no-store');
      expect(JSON.stringify(response.body)).not.toContain('PRIVATE_PATH');
      expect(ingest).not.toHaveBeenCalled();
    } finally { ingest.mockRestore(); }
  });
  test('does not expose the CLI file-verification command as an HTTP endpoint', async () => {
    const response = await request(app).post('/api/commercial/v1/foundry/platform-evidence/verify')
      .set('Authorization', `Bearer ${token('admin')}`).send({relativePath: '/dev/tpmrm0'});
    expect(response.status).toBe(404);
  });
});
