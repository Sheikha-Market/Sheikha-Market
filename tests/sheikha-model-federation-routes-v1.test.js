'use strict';

const express = require('express');
const request = require('supertest');
const routes = require('../routes/ai-governor/sheikha-model-federation-routes-v1');

describe('Sheikha model federation routes V1', () => {
  const base = '/api/sheikha/ai-governor/federation/v1';
  const app = express().use(base, routes);

  test('exposes status and bounded searchable listings', async () => {
    const status = await request(app).get(`${base}/status`).expect(200);
    expect(status.body.data.summary.uniqueModels).toBeGreaterThan(100);

    const models = await request(app)
      .get(`${base}/models?free=true&limit=500`)
      .expect(200);
    expect(models.body.data.limit).toBe(100);
    expect(models.body.data.models.length).toBeGreaterThan(0);
    expect(models.body.data.models.every(
      (model) => model.classification.freeAtSnapshot
    )).toBe(true);
  });

  test('does not route catalogued but unapproved models', async () => {
    const response = await request(app)
      .post(`${base}/route`)
      .send({ capabilities: ['input:text'] })
      .expect(409);
    expect(response.body.data.decision).toBe('NO_GOVERNED_PRODUCTION_MODEL');
    expect(response.body.data.modelInvoked).toBe(false);
    expect(response.body.data.defaultAuthorization).toBe('DENY');
  });

  test('exposes licensing operations and blocks unevidenced training', async () => {
    const operations = await request(app)
      .get(`${base}/license/operations`)
      .expect(200);
    expect(operations.body.data).toContain('COMMERCIAL_INFERENCE');
    expect(operations.body.data).toContain('FINE_TUNING');

    const plan = await request(app)
      .post(`${base}/training/plan`)
      .send({ baseModel: 'vendor/model' })
      .expect(409);
    expect(plan.body.data.status).toBe('TRAINING_BLOCKED');
    expect(plan.body.data.trainingExecuted).toBe(false);
  });

  test('serves the trained owned request router', async () => {
    const response = await request(app)
      .post(`${base}/classify`)
      .send({ text: 'أصلح كود JavaScript واكتب اختبارًا' })
      .expect(200);
    expect(response.body.data.label).toBe('coding');
    expect(response.body.data.model).toBe('SHEIKHA_OWNED_ROUTER_MODEL_V1');
  });

  test('plans a licensed composite route without claiming weight ownership', async () => {
    const response = await request(app)
      .post(`${base}/composite/plan`)
      .send({ roles: ['coding'], commercial: true })
      .expect(202);
    expect(response.body.data.commercialRouteEligible).toBe(true);
    expect(response.body.data.productionCommercialApproved).toBe(false);
    expect(response.body.data.selectedModels[0].model)
      .toBe('qwen2.5-coder:7b');
    expect(response.body.data.ownership.thirdPartyWeightsReLicensedAsSheikha)
      .toBe(false);
  });

  test('reports current distributed large-model training blockers truthfully', async () => {
    const response = await request(app)
      .get(`${base}/training/distributed/status`)
      .expect(409);
    expect(response.body.data.status).toBe('LARGE_MODEL_FROM_SCRATCH_BLOCKED');
    expect(response.body.data.trainingExecuted).toBe(false);
    expect(response.body.data.cluster.aggregateGpuCount).toBe(0);
  });

  test('exposes the active foundry without promoting the failed-quality pilot', async () => {
    const response = await request(app)
      .get(`${base}/training/foundry/status`)
      .expect(200);
    expect(response.body.data.status).toBe('ACTIVE_WITH_GOVERNED_LIMITS');
    expect(response.body.data.pilot.commercialProductionApproved).toBe(false);
    expect(response.body.data.environments.local.status).toBe('PILOT_TRAINING_AVAILABLE');
  });

  test('defaults GPU admission and internal license issuance to deny', async () => {
    const node = await request(app)
      .post(`${base}/training/nodes/admit`)
      .send({ nodeId: 'unverified-gpu', gpuCount: 8, gpuMemoryGiBEach: 80 })
      .expect(409);
    expect(node.body.data.admitted).toBe(false);

    const license = await request(app)
      .post(`${base}/training/licenses/internal/issue`)
      .send({ assetId: 'model' })
      .expect(409);
    expect(license.body.data.legallyIssuedThirdPartyLicense).toBe(false);
  });

  test('exposes registered regional providers and denies unapproved paid routing', async () => {
    const status = await request(app)
      .get(`${base}/training/providers/status`)
      .expect(200);
    expect(status.body.data.providers.map((provider) => provider.id)).toEqual(
      expect.arrayContaining(['PROV-HOSTINGER', 'PROV-AWS', 'PROV-AZURE', 'PROV-GCP'])
    );

    const plan = await request(app)
      .post(`${base}/training/providers/plan`)
      .send({ zone: 'SAUDI_ARABIA', gpuRequired: true })
      .expect(409);
    expect(plan.body.data.status).toBe('NO_PROVIDER_ROUTE_DEFAULT_DENY');
    expect(plan.body.data.executionStarted).toBe(false);
  });

  test('plans evidence and calculation before compact model generation', async () => {
    const response = await request(app)
      .post(`${base}/intelligence/value/plan`)
      .send({ query: 'ابحث عن الدليل ثم احسب النسبة' })
      .expect(200);
    expect(response.body.data.largeModelRequiredByDefault).toBe(false);
    expect(response.body.data.stages).toContain('GOVERNED_RETRIEVAL');
    expect(response.body.data.stages).toContain('DETERMINISTIC_CALCULATION_TOOL');
  });

  test('exposes the latest governed training scheduler decision', async () => {
    const response = await request(app)
      .get(`${base}/training/scheduler/status`)
      .expect(200);
    expect(response.body.data.system).toBe('SHEIKHA_TRAINING_SCHEDULER_STATE_V1');
    expect(response.body.data.decision.trainingRunsContinuously).toBe(false);
    expect(response.body.data.decision.automaticCommercialPromotion).toBe(false);
  });

  test('classifies specialization rarity only from complete evidence', async () => {
    const levels = await request(app)
      .get(`${base}/specializations/rarity/levels`)
      .expect(200);
    expect(levels.body.data.levels).toHaveLength(7);

    const missing = await request(app)
      .post(`${base}/specializations/rarity/classify`)
      .send({ specialization: 'اللغة العربية الصناعية' })
      .expect(422);
    expect(missing.body.data.level.id).toBe('UNMEASURED');

    const measured = await request(app)
      .post(`${base}/specializations/rarity/classify`)
      .send({
        specialization: 'تحليل المعادن العربية',
        qualifiedAlternatives: 1,
        licensedCorpusCoveragePercent: 20,
        evaluationCoveragePercent: 30,
        domainExpertAvailabilityPercent: 10,
        evidenceVerified: true
      })
      .expect(200);
    expect(measured.body.data.level.id).toBe('VERY_RARE');
    expect(measured.body.data.commercialClaimAllowed).toBe(true);
  });

  test('blocks chat and LLM commercial promotion until every gate passes', async () => {
    const blocked = await request(app)
      .post(`${base}/chat-llm/integration/plan`)
      .send({ chatContractVerified: true, modelWeightsAvailable: true })
      .expect(409);
    expect(blocked.body.data.commercialProductionApproved).toBe(false);
    expect(blocked.body.data.blockers).toContain('MODEL_LICENSE_VERIFICATION_REQUIRED');
    expect(blocked.body.data.estimatedCalendar.minimumWeeks).toBe(2);

    const canary = await request(app)
      .post(`${base}/chat-llm/integration/plan`)
      .send({
        chatContractVerified: true,
        modelWeightsAvailable: true,
        modelLicenseVerified: true,
        datasetLicenseVerified: true,
        arabicEvaluationPassed: true,
        safetyEvaluationPassed: true,
        loadAndRecoveryPassed: true,
        observabilityEnabled: true,
        humanCommercialApproval: true,
        modelIsLargeVerified: true,
        modelClassClaim: '7B'
      })
      .expect(200);
    expect(canary.body.data.status).toBe('READY_FOR_CONTROLLED_COMMERCIAL_CANARY');
    expect(canary.body.data.commercialProductionApproved).toBe(false);
  });
});
