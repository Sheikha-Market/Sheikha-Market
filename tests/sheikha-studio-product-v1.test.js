'use strict';

const express = require('express');
const request = require('supertest');
const routes = require('../routes/sheikha-studio-product-v1');
const {
  buildStudioProductStatus,
  planStudioToolRoute,
} = require('../runtime/sheikha-studio/core/sheikha-studio-product-v1');

describe('Sheikha Studio Product V1', () => {
  const base = '/api/sheikha/studio/v1';
  const app = express().use(base, routes);

  test('makes Studio the core and VS Code an optional temporary adapter', () => {
    const status = buildStudioProductStatus();
    expect(status.identity).toBe('INDEPENDENT_GOVERNED_DEVELOPMENT_PRODUCT');
    expect(status.coreDependency.vscodeExtensionIsCore).toBe(false);
    expect(status.coreDependency.studioRunsAsIndependentRuntime).toBe(true);
    expect(status.migrationPolicy.noExtensionStateAsCanonicalData).toBe(true);
    expect(status.commercialProductionApproved).toBe(false);
    expect(status.blockers).toContain('extensionIndependentLaunchVerified');
  });

  test('routes native tools before optional adapters', () => {
    const native = planStudioToolRoute({ toolId: 'AI_CHAT' });
    expect(native.status).toBe('NATIVE_OR_RUNTIME_ROUTE_SELECTED');
    expect(native.selectedAdapter).toBe('SHEIKHA_NATIVE_WEB_ADAPTER');

    const debuggerRoute = planStudioToolRoute({ toolId: 'DEBUGGER' });
    expect(debuggerRoute.status).toBe('TEMPORARY_ADAPTER_ROUTE_SELECTED');
    expect(debuggerRoute.selectedAdapter).toBe('VSCODE_EXTENSION_ADAPTER');
    expect(debuggerRoute.canonicalStateOwnedByStudio).toBe(true);
  });

  test('exposes the independent Studio catalog and bounded routes', async () => {
    const status = await request(app).get(`${base}/status`).expect(200);
    expect(status.body.data.coverage.totalTools).toBeGreaterThanOrEqual(20);

    const tools = await request(app).get(`${base}/tools`).expect(200);
    expect(tools.body.data.adapters).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'VSCODE_EXTENSION_ADAPTER', temporary: true }),
      expect.objectContaining({ id: 'CODER_REMOTE_WORKSPACE_ADAPTER', temporary: true }),
      expect.objectContaining({ id: 'VISUAL_STUDIO_COMPATIBILITY_ADAPTER', temporary: true }),
    ]));

    const route = await request(app)
      .post(`${base}/tools/route`)
      .send({ toolId: 'TERMINAL', highImpact: true })
      .expect(200);
    expect(route.body.data.executionStarted).toBe(false);
    expect(route.body.data.humanApprovalRequiredForHighImpact).toBe(true);
  });
});
