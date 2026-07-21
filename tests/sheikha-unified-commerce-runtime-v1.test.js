'use strict';

const express = require('express');
const request = require('supertest');

const {
  buildUnifiedCommerceRuntime,
  listCommerceCatalog,
  buildCommerceDashboard,
  buildCommerceOperationPlan
} = require('../core/commerce/sheikha-unified-commerce-runtime-v1');
const routes = require(
  '../routes/commerce/sheikha-unified-commerce-routes-v1'
);

describe('Sheikha Unified Commerce Economy Runtime V1', () => {
  test('builds one evidence-backed catalog from existing registries', () => {
    const runtime = buildUnifiedCommerceRuntime({
      generatedAt: '2026-07-21T00:00:00.000Z'
    });

    expect(runtime.passed).toBe(true);
    expect(runtime.status).toBe('ACTIVE_WITH_GOVERNED_CATALOG');
    expect(runtime.coverage.products).toBe(13);
    expect(runtime.evidenceDecision.status).toBe('VERIFIED');
    expect(runtime.failedChecks).toEqual([]);
  });

  test('publishes Sheikha Cloud SaaS without inventing price or activation', () => {
    const runtime = buildUnifiedCommerceRuntime();
    const cloud = runtime.catalog.find((product) =>
      product.id === 'PROD-CLOUD-SAAS'
    );

    expect(cloud.kind).toBe('SAAS_PRODUCT');
    expect(cloud.services).toHaveLength(14);
    expect(cloud.targetSectors).toHaveLength(30);
    expect(cloud.pricing.mode).toBe('REQUEST_QUOTE');
    expect(cloud.pricing.amount).toBeNull();
    expect(cloud.transactionReady).toBe(false);
    expect(cloud.tenantProvisioningAutomatic).toBe(false);
  });

  test('maps every sector to a market family and measurable benefit', () => {
    const runtime = buildUnifiedCommerceRuntime();

    expect(runtime.sectors).toHaveLength(30);
    expect(runtime.marketGroups).toHaveLength(7);
    for (const sector of runtime.sectors) {
      expect(sector.groupId).toBeTruthy();
      expect(sector.benefitAr).toBeTruthy();
      expect(sector.productCount).toBeGreaterThan(0);
      expect(sector.liveConnectionClaimed).toBe(false);
    }
  });

  test('uses the same products in the market catalog and dashboard', () => {
    const catalog = listCommerceCatalog();
    const dashboard = buildCommerceDashboard({
      role: 'buyer',
      sector: 'cloud-saas',
      generatedAt: '2026-07-21T00:00:00.000Z'
    });

    const expected = catalog.products.filter((product) =>
      product.targetSectors.includes('cloud-saas')
    );
    expect(dashboard.products.map((product) => product.id)).toEqual(
      expected.map((product) => product.id)
    );
    expect(dashboard.summary.liveTransactions).toBeNull();
    expect(dashboard.dataState.prices).toBe('REQUEST_QUOTE_ONLY');
  });

  test('keeps high-impact commerce work behind a human gate', () => {
    const plan = buildCommerceOperationPlan({
      sector: 'commerce',
      workflow: 'CONTRACT_GENERATION',
      productId: 'PROD-MARKETPLACE',
      intent: 'إعداد نطاق عقد توريد للمراجعة'
    }, {
      generatedAt: '2026-07-21T00:00:00.000Z'
    });

    expect(plan.status).toBe('HUMAN_APPROVAL_REQUIRED');
    expect(plan.decision.status).toBe('HUMAN_REVIEW_REQUIRED');
    expect(plan.execution.authorized).toBe(false);
    expect(plan.execution.performed).toBe(false);
    expect(plan.boundaries.noAutomaticPayment).toBe(true);
  });

  test('creates only a bounded plan for a low-impact RFQ draft', () => {
    const plan = buildCommerceOperationPlan({
      sector: 'marketplaces',
      workflow: 'RFQ_CREATION',
      productId: 'PROD-CLOUD-SAAS',
      intent: 'طلب نطاق خدمة سحابية للقطاع الصناعي'
    });

    expect(plan.status).toBe('PLAN_READY');
    expect(plan.decision.status).toBe('VERIFIED');
    expect(plan.decision.authorization).toBe('ALLOW_BOUNDED');
    expect(plan.execution.mode).toBe('PLAN_ONLY');
    expect(plan.execution.authorized).toBe(false);
  });

  test('serves catalog, dashboard, and governed operation routes', async () => {
    const app = express();
    app.use('/api/sheikha/commerce/v1', routes);

    const status = await request(app)
      .get('/api/sheikha/commerce/v1/status');
    expect(status.status).toBe(200);
    expect(status.body.data.coverage.sectors).toBe(30);

    const cloud = await request(app)
      .get('/api/sheikha/commerce/v1/catalog?kind=SAAS_PRODUCT');
    expect(cloud.status).toBe(200);
    expect(cloud.body.data.products).toHaveLength(1);

    const dashboard = await request(app)
      .get('/api/sheikha/commerce/v1/dashboard?role=supplier&sector=metals');
    expect(dashboard.status).toBe(200);
    expect(dashboard.body.data.role.id).toBe('supplier');

    const plan = await request(app)
      .post('/api/sheikha/commerce/v1/operations/plan')
      .send({
        sector: 'marketplaces',
        workflow: 'RFQ_CREATION',
        productId: 'PROD-CLOUD-SAAS',
        intent: 'طلب خدمة'
      });
    expect(plan.status).toBe(202);
    expect(plan.body.data.execution.performed).toBe(false);

    const invalid = await request(app)
      .get('/api/sheikha/commerce/v1/dashboard?role=unknown');
    expect(invalid.status).toBe(400);
  });
});
