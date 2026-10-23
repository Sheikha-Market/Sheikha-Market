'use strict';

const express = require('express');
const request = require('supertest');
const routes = require(
  '../routes/gardens-dialogue/' +
    'sheikha-pastures-orchards-cultivation-routes-v4'
);
const fs = require('node:fs');
const path = require('node:path');

function buildApp() {
  const app = express();
  app.use('/api/sheikha/pastures-orchards-cultivation/v4', routes);
  return app;
}

describe('Sheikha pastures and orchards cultivation routes V4', () => {
  test('serves the evidence-backed cultivation status', async () => {
    const response = await request(buildApp()).get(
      '/api/sheikha/pastures-orchards-cultivation/v4/status'
    );

    expect(response.status).toBe(200);
    expect(response.body.data.system).toBe(
      'SHEIKHA_PASTURES_ORCHARDS_CULTIVATION_RUNTIME_V1'
    );
    expect(response.body.data.metrics.totalPlots).toBe(4);
  });

  test('calculates a read-only resource balance', async () => {
    const response = await request(buildApp())
      .post(
        '/api/sheikha/pastures-orchards-cultivation/v4/' +
          'habitat/resource-balance'
      )
      .send({
        populationTarget: 500,
        siteAreaM2: 100000,
        livestockHeads: 50
      });

    expect(response.status).toBe(200);
    expect(response.body.data.planningScenarioOnly).toBe(true);
    expect(response.body.data.engineeringApproved).toBe(false);
  });

  test('rejects invalid planning input without side effects', async () => {
    const response = await request(buildApp())
      .post(
        '/api/sheikha/pastures-orchards-cultivation/v4/' +
          'habitat/resource-balance'
      )
      .send({ populationTarget: 0, siteAreaM2: 0 });

    expect(response.status).toBe(422);
    expect(response.body.ok).toBe(false);
    expect(response.body.data.engineeringApproved).toBe(false);
  });

  test('serves sacred references with the unseen boundary', async () => {
    const response = await request(buildApp()).get(
      '/api/sheikha/pastures-orchards-cultivation/v4/sacred-references'
    );

    expect(response.status).toBe(200);
    expect(response.body.data.actualJannahSimulationAllowed).toBe(false);
    expect(response.body.data.automatedTafsirOrFatwa).toBe(false);
    expect(response.body.data.qualifiedScholarReviewRequired).toBe(true);
  });

  test('serves a worldly engineering plan without construction authority', async () => {
    const response = await request(buildApp())
      .post(
        '/api/sheikha/pastures-orchards-cultivation/v4/engineering/plan'
      )
      .send({
        siteAreaM2: 100000,
        location: 'DECLARED_SITE',
        populationTarget: 500,
        livestockHeads: 50
      });

    expect(response.status).toBe(200);
    expect(response.body.data.disciplines).toHaveLength(8);
    expect(response.body.data.physicalExecutionAuthorized).toBe(false);
    expect(response.body.data.sacredLanguageIsolation
      .afterlifeTextMayGenerateGeometry).toBe(false);
  });

  test('compiles Sheikha cultivation source without executing it', async () => {
    const source = fs.readFileSync(path.resolve(
      __dirname,
      '../sheikha-language/examples/worldly-gardens.shk'
    ), 'utf8');
    const response = await request(buildApp())
      .post(
        '/api/sheikha/pastures-orchards-cultivation/v4/language/compile'
      )
      .send({ source });

    expect(response.status).toBe(200);
    expect(response.body.data.sourceLanguage).toBe('sheikha');
    expect(response.body.data.cultivationGraph.nodes).toHaveLength(15);
    expect(response.body.data.admissionReview.decision).toBe('BLOCKED');
    expect(response.body.data.admissionReview.reviewable).toBe(true);
    expect(response.body.data.admissionReview.executable).toBe(false);
    expect(response.body.data.admissionReview.rule).toBe(
      'COMPILATION_NEVER_AUTHORIZES_PHYSICAL_EXECUTION'
    );
    expect(response.body.data.execution).toEqual({
      requested: false,
      authorized: false,
      performed: false
    });
  });

  test('rejects unseen engineering source through the API', async () => {
    const response = await request(buildApp())
      .post(
        '/api/sheikha/pastures-orchards-cultivation/v4/language/compile'
      )
      .send({
        source: [
          'مغرس مرفوض:',
          '  المساحة: 1000',
          '  السكان: 10',
          '  أبعاد_الجنة: 100',
          ''
        ].join('\n')
      });

    expect(response.status).toBe(422);
    expect(response.body.error).toBe('SHK-CULT-UNSEEN-001');
  });
});
