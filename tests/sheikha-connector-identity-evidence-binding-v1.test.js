'use strict';

const express = require('express');
const request = require('supertest');

const {
  buildConnectorIdentityEvidenceBinding,
  getConnectorIdentityBinding,
  getDomainIdentityBindings,
} = require(
  '../core/engine-registry/' +
  'sheikha-connector-identity-evidence-binding-v1'
);
const routes = require(
  '../routes/site-registry/sheikha-engine-domain-routes-v3'
);

describe('Sheikha connector identity evidence binding V1', () => {
  test('binds stable local identities without granting authorization', () => {
    const registry = buildConnectorIdentityEvidenceBinding();

    expect(registry.status).toBe('CLEAR');
    expect(registry.summary.bindings).toBe(33);
    expect(registry.summary.identitiesBound).toBe(33);
    expect(registry.summary.ownerIdentitiesAssigned).toBe(0);
    expect(registry.summary.authorizationEligible).toBe(0);
    expect(registry.summary.authorized).toBe(0);
    expect(registry.summary.liveVerified).toBe(0);
    expect(registry.truth.noConnectorAuthorizedWithoutEvidence).toBe(true);
    expect(registry.truth.noConnectorLiveWithoutEvidence).toBe(true);
  });

  test('requires terms, authorization, and human approval evidence', () => {
    const erp = getConnectorIdentityBinding('CONN-005');

    expect(erp.connectorIdentity)
      .toBe('urn:sheikha:connector:conn-005');
    expect(erp.ownerIdentity).toBeNull();
    expect(erp.authorization.status).toBe('NOT_AUTHORIZED');
    expect(erp.live.status).toBe('NOT_LIVE');
    expect(erp.authorizationReview.eligible).toBe(false);
    expect(erp.authorizationReview.missing)
      .toEqual(expect.arrayContaining([
        'TERMS_OR_CONTRACT_EVIDENCE',
        'AUTHORIZATION_EVIDENCE',
        'HUMAN_APPROVAL_EVIDENCE',
      ]));
    expect(erp.liveReview.eligible).toBe(false);
  });

  test('maps identity bindings to domains without inventing owners', () => {
    const logistics = getDomainIdentityBindings('logistics');

    expect(logistics.length).toBeGreaterThan(0);
    expect(logistics.every((binding) => binding.ownerIdentity === null))
      .toBe(true);
    expect(logistics.every(
      (binding) => binding.authorization.status === 'NOT_AUTHORIZED'
    )).toBe(true);
  });

  test('serves identity evidence bindings read-only endpoints', async () => {
    const app = express();
    app.use('/api/site-registry/v3', routes);

    const registry = await request(app)
      .get('/api/site-registry/v3/identity-evidence-bindings');
    expect(registry.status).toBe(200);
    expect(registry.body.data.status).toBe('CLEAR');

    const connector = await request(app)
      .get('/api/site-registry/v3/identity-evidence-bindings/connector/CONN-005');
    expect(connector.status).toBe(200);
    expect(connector.body.data.authorization.status)
      .toBe('NOT_AUTHORIZED');

    const domain = await request(app)
      .get('/api/site-registry/v3/identity-evidence-bindings/domain/logistics');
    expect(domain.status).toBe(200);
    expect(domain.body.data.length).toBeGreaterThan(0);
  });
});
