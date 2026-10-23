'use strict';

const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../config/config', () => ({ security: { jwt: { secret: 'repository-integration-test-only' } } }));
jest.mock('../config/database', () => ({ read: () => [] }));
const { buildRepositoryIntegrationRouter } = require('../routes/sheikha-repository-integration-v1');
const token = role => jwt.sign({ id: 'test-operator', role }, 'repository-integration-test-only', { expiresIn: '1m' });

describe('Private repository integration HTTP', () => {
  let server;
  beforeAll(async () => {
    const app = express();
    app.use('/integrations', buildRepositoryIntegrationRouter());
    await new Promise((resolve, reject) => {
      server = app.listen(0, '127.0.0.1', resolve); server.once('error', reject);
    });
  });
  afterAll(async () => { if (server?.listening) await new Promise(resolve => server.close(resolve)); });

  test.each(['/status', '/visual-health'])('requires real admin authentication: %s', async route => {
    expect((await request(server).get('/integrations' + route).set('x-role', 'admin')).status).toBe(401);
    const customer = await request(server).get('/integrations' + route).set('Authorization', `Bearer ${token('customer')}`);
    expect(customer.status).toBe(403);
    expect(customer.headers['cache-control']).toBe('no-store');
  });

  test.each(['/status?root=/etc', '/status?registryFile=/etc/passwd', '/visual-health?url=https://example.com'])(
    'rejects filesystem and URL overrides: %s', async route => {
    const response = await request(server).get('/integrations' + route).set('Authorization', `Bearer ${token('admin')}`);
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('QUERY_OVERRIDES_NOT_ALLOWED');
  });

  test('does not expose a mutation endpoint', async () => {
    const response = await request(server).post('/integrations/status').set('Authorization', `Bearer ${token('admin')}`);
    expect(response.status).toBe(404);
  });

  test('admin receives a redacted read-only snapshot from the registered repository', async () => {
    const response = await request(server).get('/integrations/status').set('Authorization', `Bearer ${token('admin')}`);
    expect(response.status).toBe(200);
    expect(response.body.data.registeredCount).toBe(1);
    expect(response.body.data.actions.gitMutation).toBe(false);
    expect(response.body.data.commercialProductionReady).toBe(false);
    expect(JSON.stringify(response.body)).not.toContain('/home/');
    expect(response.headers['cache-control']).toBe('no-store');
  });
});
