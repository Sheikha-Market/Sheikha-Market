'use strict';

const express = require('express');
const request = require('supertest');

const {
  buildMasterRegistry,
  getDomainEngines,
  getEngine,
  resolveIntentOwner,
} = require(
  '../core/engine-registry/sheikha-master-engine-registry-v1'
);
const {
  buildRegistry,
} = require(
  '../core/site-registry/sheikha-engine-domain-registry-v3'
);
const {
  inspectEngineRuntime,
} = require(
  '../core/site-registry/sheikha-engine-domain-health-v3'
);
const routes = require(
  '../routes/site-registry/sheikha-engine-domain-routes-v3'
);

describe('Sheikha master engine registry V1', () => {
  test('is a clear master registry with no missing core sources', () => {
    const registry = buildMasterRegistry();

    expect(registry.system).toBe('SHEIKHA_MASTER_ENGINE_REGISTRY_V1');
    expect(registry.status).toBe('CLEAR');
    expect(registry.summary.coreEngines).toBeGreaterThanOrEqual(28);
    expect(registry.summary.optionalEngines).toBeGreaterThanOrEqual(25);
    expect(registry.summary.missingSources).toBe(0);
    expect(registry.summary.duplicateIds).toBe(0);
    expect(registry.summary.runtimeMissingFromMaster).toBe(0);
    expect(registry.summary.masterMissingFromRuntime).toBe(0);
    expect(registry.summary.criticalMissingFiles).toBe(0);
  });

  test('resolves canonical intent ownership without ambiguity', () => {
    expect(resolveIntentOwner('compliance')).toBe('standards');
    expect(resolveIntentOwner('sharia.compliance')).toBe('sharia');
    expect(resolveIntentOwner('production.status')).toBe('production_neural');
  });

  test('binds site domains only to engines present in master registry', () => {
    const site = buildRegistry();
    const health = inspectEngineRuntime(site);

    expect(health.status).toBe('CLEAR');
    expect(health.summary.routeIntentConflicts).toBe(0);
    expect(health.summary.unresolvedReferencedEngines).toBe(0);
    expect(health.summary.missingFromMasterRegistry).toBe(0);
  });

  test('exposes domain and engine lookups', () => {
    expect(getEngine('market')).toMatchObject({
      id: 'market',
      status: 'SOURCE_READY',
    });
    expect(getDomainEngines('integration').map((item) => item.id))
      .toEqual(expect.arrayContaining(['security', 'cloud', 'universal_networks']));
  });

  test('serves V3 master registry read-only endpoints', async () => {
    const app = express();
    app.use('/api/site-registry/v3', routes);

    const master = await request(app)
      .get('/api/site-registry/v3/master-engines');
    expect(master.status).toBe(200);
    expect(master.body.data.status).toBe('CLEAR');

    const engine = await request(app)
      .get('/api/site-registry/v3/master-engines/market');
    expect(engine.status).toBe(200);
    expect(engine.body.data.id).toBe('market');

    const intent = await request(app)
      .get('/api/site-registry/v3/intent-owner')
      .query({ intent: 'sharia.compliance' });
    expect(intent.status).toBe(200);
    expect(intent.body.data.engine).toBe('sharia');
  });
});
