'use strict';

const express = require('express');
const request = require('supertest');

const {
  buildEngineIntegrations,
  getDomainIntegration,
  getEngineIntegration,
} = require(
  '../core/engine-registry/sheikha-engine-integration-fabric-v1'
);
const routes = require(
  '../routes/site-registry/sheikha-engine-domain-routes-v3'
);

describe('Sheikha engine integration fabric V1', () => {
  test('keeps external connectors readiness-only without false live claims', () => {
    const fabric = buildEngineIntegrations();

    expect(fabric.status).toBe('CLEAR');
    expect(fabric.summary.connectorProfiles).toBe(13);
    expect(fabric.summary.liveExternalConnections).toBe(0);
    expect(fabric.summary.externalWritesBlocked).toBe(13);
    expect(fabric.truth.noLiveExternalConnectionClaim).toBe(true);
    expect(
      fabric.connectorProfiles.every(
        (profile) => profile.access.write === 'BLOCKED'
      )
    ).toBe(true);
  });

  test('reports MCP and SDK as local contract readiness', () => {
    const fabric = buildEngineIntegrations();

    expect(fabric.summary.mcpContractReady).toBe(true);
    expect(fabric.summary.sdkContractReady).toBe(true);
    expect(fabric.summary.mcpTools).toBe(46);
    expect(fabric.truth.mcpAndSdkAreLocalContractReadiness).toBe(true);
  });

  test('maps engine domains into governed connector profiles', () => {
    const market = getEngineIntegration('market');
    const logistics = getDomainIntegration('logistics');

    expect(market.gateway).toBe('sheikha.integration');
    expect(market.channels.externalConnector.write).toBe('BLOCKED');
    expect(market.externalConnectors.length).toBeGreaterThan(0);

    expect(logistics.connectorProfiles.length).toBeGreaterThan(0);
    expect(
      logistics.connectorProfiles.some(
        (profile) => profile.category === 'WMS'
      )
    ).toBe(true);
  });

  test('serves integration registry endpoints read-only', async () => {
    const app = express();
    app.use('/api/site-registry/v3', routes);

    const status = await request(app)
      .get('/api/site-registry/v3/integrations');
    expect(status.status).toBe(200);
    expect(status.body.data.status).toBe('CLEAR');

    const engine = await request(app)
      .get('/api/site-registry/v3/integrations/engine/market');
    expect(engine.status).toBe(200);
    expect(engine.body.data.engine).toBe('market');

    const domain = await request(app)
      .get('/api/site-registry/v3/integrations/domain/integration');
    expect(domain.status).toBe(200);
    expect(domain.body.data.connectorProfiles).toHaveLength(13);
  });
});
