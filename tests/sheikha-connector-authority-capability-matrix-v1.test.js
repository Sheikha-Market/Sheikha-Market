'use strict';

const express = require('express');
const request = require('supertest');

const {
  buildAuthorityCapabilityMatrix,
  getConnectorCapability,
  getDomainConnectorCapabilities,
} = require(
  '../core/engine-registry/' +
  'sheikha-connector-authority-capability-matrix-v1'
);
const routes = require(
  '../routes/site-registry/sheikha-engine-domain-routes-v3'
);

describe('Sheikha connector authority capability matrix V1', () => {
  test('separates available, authorized, and live capability states', () => {
    const matrix = buildAuthorityCapabilityMatrix();

    expect(matrix.status).toBe('CLEAR');
    expect(matrix.truth.availableDoesNotMeanAuthorized).toBe(true);
    expect(matrix.truth.authorizedDoesNotMeanLive).toBe(true);
    expect(matrix.summary.externalMutationsAuthorized).toBe(0);
    expect(matrix.summary.externalMutationsLive).toBe(0);
    expect(matrix.summary.liveExternalReads).toBe(0);
  });

  test('keeps readiness profiles non-live and mutation-blocked', () => {
    const erp = getConnectorCapability('CONN-005');

    expect(erp.kind).toBe('EXTERNAL_PROFILE');
    expect(erp.available.READ).toBe(true);
    expect(erp.authorized.READ).toBe(false);
    expect(erp.live.READ).toBe(false);
    expect(erp.authorized.WRITE).toBe(false);
    expect(erp.live.WRITE).toBe(false);
  });

  test('maps domain capability records without granting authority', () => {
    const logistics = getDomainConnectorCapabilities('logistics');

    expect(logistics.length).toBeGreaterThan(0);
    expect(
      logistics.every((item) =>
        ['WRITE', 'CREATE', 'UPDATE', 'DELETE']
          .every((op) => item.authorized[op] === false)
      )
    ).toBe(true);
  });

  test('serves authority matrix read-only endpoints', async () => {
    const app = express();
    app.use('/api/site-registry/v3', routes);

    const matrix = await request(app)
      .get('/api/site-registry/v3/authority-matrix');
    expect(matrix.status).toBe(200);
    expect(matrix.body.data.status).toBe('CLEAR');

    const connector = await request(app)
      .get('/api/site-registry/v3/authority-matrix/connector/CONN-005');
    expect(connector.status).toBe(200);
    expect(connector.body.data.authorized.READ).toBe(false);

    const domain = await request(app)
      .get('/api/site-registry/v3/authority-matrix/domain/logistics');
    expect(domain.status).toBe(200);
    expect(domain.body.data.length).toBeGreaterThan(0);
  });
});
