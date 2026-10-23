'use strict';

const express = require('express');
const request = require('supertest');

const {
  buildIntegrationPlan,
  buildRouterAnywhereStatus,
  listGuides,
} = require('../core/ai-router/sheikha-ai-router-anywhere-v1');
const {
  buildRegistry,
} = require('../core/site-registry/sheikha-engine-domain-registry-v3');
const {
  resolvePublicRoute,
} = require('../core/site-registry/sheikha-site-registry-v2');

describe('Sheikha AI Router Anywhere V1', () => {
  test('exposes governed readiness without external connection claims', () => {
    const status = buildRouterAnywhereStatus();

    expect(status.status).toBe('CLEAR');
    expect(status.summary.surfaces).toBe(5);
    expect(status.summary.providers).toBe(3);
    expect(status.summary.externalProviders).toBe(2);
    expect(status.summary.liveExternalConnections).toBe(0);
    expect(status.summary.executionAuthoritiesGranted).toBe(0);
    expect(status.truth.readinessDoesNotMeanConnection).toBe(true);
    expect(status.truth.noExternalExecutionAuthority).toBe(true);
  });

  test('registers official setup guides across apps agents IDEs SDKs and MCP', () => {
    const guides = listGuides({});

    expect(guides.total).toBeGreaterThanOrEqual(8);
    expect(guides.guides.map((guide) => guide.surface))
      .toEqual(expect.arrayContaining([
        'applications',
        'coding-agents',
        'ides',
        'sdks',
        'mcp-clients',
      ]));
    expect(guides.guides.every((guide) => guide.official === true))
      .toBe(true);
  });

  test('builds plan-only external integration with no fetch or secret mutation', () => {
    const plan = buildIntegrationPlan({
      surface: 'ides',
      provider: 'openrouter',
    });

    expect(plan.ok).toBe(true);
    expect(plan.decision).toBe('PLAN_ONLY');
    expect(plan.executionPerformed).toBe(false);
    expect(plan.networkFetchPerformed).toBe(false);
    expect(plan.secretMutationPerformed).toBe(false);
    expect(plan.provider.liveExternalConnectionClaim).toBe(false);
  });

  test('registers public AI Router route and V3 engine binding', () => {
    const route = resolvePublicRoute('/ai-router/');
    const v3 = buildRegistry();
    const page = v3.pages.find((item) => item.route === '/ai-router/');

    expect(route.found).toBe(true);
    expect(route.canonicalRoute).toBe('/ai-router/');
    expect(page).toBeTruthy();
    expect(page.logicalDomain).toBe('integration');
    expect(page.primaryEngine).toBe('ai');
    expect(page.supportingEngines)
      .toEqual(expect.arrayContaining([
        'universal_networks',
        'cloud',
        'security',
        'standards',
      ]));
  });

  test('serves AI Router Anywhere read-only API endpoints', async () => {
    const aiRoutes = require('../routes/ai');
    const app = express();
    app.use(express.json());
    app.use('/api/ai-core', aiRoutes);

    const status = await request(app)
      .get('/api/ai-core/router-anywhere/status');
    expect(status.status).toBe(200);
    expect(status.body.data.status).toBe('CLEAR');

    const guides = await request(app)
      .get('/api/ai-core/router-anywhere/guides')
      .query({ surface: 'coding-agents' });
    expect(guides.status).toBe(200);
    expect(guides.body.data.total).toBeGreaterThan(0);

    const plan = await request(app)
      .post('/api/ai-core/router-anywhere/plan')
      .send({ surface: 'applications', provider: 'ramp-router' });
    expect(plan.status).toBe(200);
    expect(plan.body.data.decision).toBe('PLAN_ONLY');
    expect(plan.body.executionPerformed).toBe(false);
  });
});
