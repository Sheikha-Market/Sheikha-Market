'use strict';

const express = require('express');
const request = require('supertest');

const {
  buildArchitectureModel,
  buildTechnologyStatus,
  buildRuntimeTelemetry,
  buildProductPreview,
  listProductPreviews,
  resolveDocumentationEntitlement,
  buildProductDossier
} = require(
  '../core/technical-experience/' +
  'sheikha-technical-experience-runtime-v1'
);
const routes = require(
  '../routes/technical-experience/' +
  'sheikha-technical-experience-routes-v1'
);

describe('Sheikha Technical Experience Runtime V1', () => {
  test('reports evidence-backed technical progress for the full commerce catalog', () => {
    const status = buildTechnologyStatus({
      generatedAt: '2026-07-21T00:00:00.000Z'
    });

    expect(status.status).toBe('ACTIVE_WITH_MEASURED_LOCAL_FOUNDATIONS');
    expect(status.coverage.products).toBe(13);
    expect(status.coverage.technicalProfiles).toBe(13);
    expect(status.coverage.sectors).toBe(30);
    expect(status.coverage.activeDocumentationEntitlements).toBe(0);
    expect(status.layers.every((layer) => layer.verified)).toBe(true);
  });

  test('returns real process telemetry without environment values or secrets', async () => {
    const telemetry = await buildRuntimeTelemetry({
      generatedAt: '2026-07-21T00:00:00.000Z'
    });

    expect(telemetry.process.pid).toBe(process.pid);
    expect(telemetry.process.memoryMiB.rss).toBeGreaterThan(0);
    expect(telemetry.process.eventLoop.observedTurnDelayMs).toBeGreaterThanOrEqual(0);
    expect(telemetry.secretsIncluded).toBe(false);
    expect(JSON.stringify(telemetry)).not.toMatch(/JWT_SECRET|DATA_ENCRYPTION_KEY/);
  });

  test('publishes Arabic previews and measurable models for every product', () => {
    const previews = listProductPreviews({ level: 'practitioner' });

    expect(previews).toHaveLength(13);
    for (const preview of previews) {
      expect(preview.product.nameAr).toMatch(/[\u0600-\u06ff]/);
      expect(preview.disciplineAr).toMatch(/[\u0600-\u06ff]/);
      expect(preview.inputsAr.length).toBeGreaterThan(0);
      expect(preview.outputsAr.length).toBeGreaterThan(0);
      expect(preview.sampleMeasurement.expression).toContain('=');
      expect(preview.fullDossier.access).toBe('VERIFIED_ENTITLEMENT_REQUIRED');
    }
  });

  test('adapts the explanation path to the selected knowledge level', () => {
    const preview = buildProductPreview('PROD-CLOUD-SAAS', { level: 'expert' });

    expect(preview.knowledgeLevel.id).toBe('expert');
    expect(preview.knowledgeLevel.toolsAr).toContain('نماذج القياس');
    expect(preview.sharedMeasurements).toHaveLength(3);
  });

  test('keeps centralized policy and decentralized execution claims bounded', () => {
    const architecture = buildArchitectureModel();

    expect(architecture.central).toHaveLength(4);
    expect(architecture.decentralized).toHaveLength(4);
    expect(architecture.boundaries.externalFederationVerified).toBe(false);
    expect(architecture.boundaries.centralPolicyBypassAllowed).toBe(false);
  });

  test('denies the full dossier when no verified server-side entitlement exists', () => {
    const entitlement = resolveDocumentationEntitlement({
      subjectId: 'buyer-1',
      productId: 'PROD-CLOUD-SAAS'
    }, {
      registry: { status: 'ACTIVE_DEFAULT_DENY', grants: [] }
    });

    expect(entitlement.authorized).toBe(false);
    expect(entitlement.status).toBe('DOCUMENTATION_ENTITLEMENT_REQUIRED');
  });

  test('unlocks a dossier only with verified purchase evidence', () => {
    const registry = {
      status: 'ACTIVE_DEFAULT_DENY',
      grants: [{
        id: 'grant-1',
        subjectId: 'buyer-1',
        productIds: ['PROD-CLOUD-SAAS'],
        status: 'ACTIVE',
        evidence: {
          verificationStatus: 'VERIFIED',
          purchaseOrderId: 'ORDER-VERIFIED-1'
        }
      }]
    };
    const result = buildProductDossier('PROD-CLOUD-SAAS', {
      subjectId: 'buyer-1',
      level: 'expert'
    }, { registry });

    expect(result.authorized).toBe(true);
    expect(result.entitlement.status).toBe('DOCUMENTATION_ENTITLEMENT_VERIFIED');
    expect(result.dossier.scienceAndMathematics.formulas.length).toBeGreaterThan(3);
    expect(result.dossier.boundaries.unrestrictedShell).toBe(false);
  });

  test('serves status and preview while protecting dossier routes', async () => {
    const app = express();
    app.use((req, _res, next) => {
      if (req.get('x-test-subject')) req.user = { id: req.get('x-test-subject') };
      next();
    });
    app.use('/api/sheikha/technical-experience/v1', routes);

    const status = await request(app)
      .get('/api/sheikha/technical-experience/v1/status');
    expect(status.status).toBe(200);
    expect(status.body.data.coverage.products).toBe(13);

    const preview = await request(app)
      .get('/api/sheikha/technical-experience/v1/products/PROD-CLOUD-SAAS/preview?level=guided');
    expect(preview.status).toBe(200);
    expect(preview.body.data.knowledgeLevel.id).toBe('guided');

    const anonymousDossier = await request(app)
      .get('/api/sheikha/technical-experience/v1/products/PROD-CLOUD-SAAS/dossier');
    expect(anonymousDossier.status).toBe(401);

    const buyerDossier = await request(app)
      .get('/api/sheikha/technical-experience/v1/products/PROD-CLOUD-SAAS/dossier')
      .set('x-test-subject', 'buyer-1');
    expect(buyerDossier.status).toBe(403);
    expect(buyerDossier.body.error).toBe('DOCUMENTATION_ENTITLEMENT_REQUIRED');
  });
});
