'use strict';

const http = require('node:http');
const { createServer, sanitizedModel } = require('../tools/training/foundry-preview/server');
const benchmarks = require('../tools/training/foundry-preview/benchmarks');

describe('private foundry preview', () => {
  let server; let port;
  beforeAll(async () => {
    server = createServer({ models: [], testOnly: true }, 'test-only-not-a-production-secret');
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    port = server.address().port;
  });
  afterAll(async () => { await new Promise((resolve) => server.close(resolve)); });
  function request(url, headers = {}, method = 'GET') {
    return new Promise((resolve, reject) => {
      const req = http.request({ hostname: '127.0.0.1', port, path: url, headers, method }, (response) => {
        let body = ''; response.on('data', (chunk) => { body += chunk; });
        response.on('end', () => resolve({ code: response.statusCode, headers: response.headers, body }));
      });
      req.on('error', reject); req.end();
    });
  }
  test('owner authorization is required for all evidence', async () => {
    expect((await request('/api/overview')).code).toBe(401);
    expect((await request('/api/overview', { Authorization: 'Bearer wrong' })).code).toBe(401);
    const result = await request('/api/overview', { Authorization: 'Bearer test-only-not-a-production-secret' });
    expect(result.code).toBe(200);
    expect(JSON.parse(result.body).testOnly).toBe(true);
    expect(result.headers['cache-control']).toBe('no-store');
  });
  test('blocks foreign origins, DNS rebinding and writes', async () => {
    expect((await request('/', { Host: 'evil.invalid' })).code).toBe(403);
    expect((await request('/', { Origin: 'https://evil.invalid' })).code).toBe(403);
    expect((await request('/api/overview', {}, 'POST')).code).toBe(405);
  });
  test.each(['/run-report.json', '/model.safetensors', '/../../.env', '/api/train', '/api/buy', '/trainer-source.py'])(
    'does not expose private files or execution route %s', async (url) => {
      expect((await request(url)).code).toBe(404);
    });
  test('serves only the UI with privacy headers and no embedded token', async () => {
    const result = await request('/');
    expect(result.code).toBe(200);
    expect(result.headers['content-security-policy']).toContain("frame-ancestors 'none'");
    expect(result.body).not.toContain('test-only-not-a-production-secret');
  });
});

test('benchmark ledger preserves missing results and separate units without inventing rank', () => {
  expect(benchmarks.rows).toHaveLength(13);
  expect(benchmarks.rows.every((row) => row.sheikha === null && row.sheikhaStatus === 'NOT_RUN')).toBe(true);
  expect(benchmarks.rows.find((row) => row.name === 'GDPval-AA v2').unit).toBe('points');
  expect(benchmarks.rows.find((row) => row.name === 'NL2Repo').values[4]).toBeNull();
  expect(benchmarks.aggregateRanking).toBeNull();
});

test('API projection omits raw corpus, paths, optimizer, ownership grants and arbitrary metadata', () => {
  const result = sanitizedModel({ provenance: { modelConfig: {} }, validationBefore: {}, validationAfter: {},
    testExactAnswers: {}, dataset: 'PRIVATE', secret: 'SECRET', checkpoint: '/private/path', optimizer: 'PRIVATE' }, {});
  expect(JSON.stringify(result)).not.toMatch(/PRIVATE|SECRET|\/private\/path/);
  expect(result.release).toBe('RELEASE_DENY');
});
