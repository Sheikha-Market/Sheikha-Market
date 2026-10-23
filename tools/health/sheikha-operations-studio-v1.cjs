#!/usr/bin/env node
'use strict';

// Loopback, GET-only local view. Requiring this file starts no server or worker.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const HOST = '127.0.0.1';
const DEFAULT_PORT = 8137;
const MAX_RESPONSE_BYTES = 1024 * 1024;
const CACHE_MS = 5000;
const DASHBOARD = path.resolve(__dirname, '../../public/workspace/operations-studio.html');
const CSP = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; base-uri 'none'; frame-ancestors 'none'; form-action 'none'";

function buildWorkforceScenarios() {
  const { planWorkforce } = require('../../core/organization/sheikha-digital-workforce-v1.cjs');
  return { system: 'SHEIKHA_WORKFORCE_SCENARIOS_V1', productionReady: false, production: 'HOLD',
    scope: 'FINITE_CAPACITY_PLANS_NOT_RUNNING_AGENTS',
    scenarios: ['1', '100', '1000000', '100000000'].map(requestedAgents =>
      planWorkforce({ requestedAgents, requestedConcurrency: 4 })) };
}
function dependencies() {
  const manager = require('./sheikha-operations-manager-v1.cjs');
  const organization = require('../../core/organization/sheikha-digital-organization-v1.cjs');
  return {
    getManagerStatus: () => manager.run([]),
    getOrganizationStatus: () => organization.getDigitalOrganizationStatus(),
    getJobDescriptionReview: () => organization.planJobDescriptionReview({ observations: [] }),
    getWorkforcePlans: buildWorkforceScenarios
  };
}
function createHandler(options = {}) {
  const port = options.port ?? DEFAULT_PORT;
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw Error('STUDIO_PORT_DENIED');
  const sources = options.sources || dependencies();
  const dashboard = options.dashboardBuffer || fs.readFileSync(DASHBOARD);
  if (!Buffer.isBuffer(dashboard) || dashboard.length > MAX_RESPONSE_BYTES) throw Error('STUDIO_DASHBOARD_DENIED');
  const clock = options.clock || Date.now;
  const cache = new Map();
  function data(key, read) {
    const current = clock(), saved = cache.get(key);
    if (saved && current >= saved.at && current - saved.at < CACHE_MS) return saved.bytes;
    const value = read();
    if (!value || typeof value !== 'object' || value.then) throw Error('STUDIO_SOURCE_DENIED');
    const bytes = Buffer.from(JSON.stringify(value));
    if (bytes.length > MAX_RESPONSE_BYTES) throw Error('STUDIO_RESPONSE_LIMIT');
    cache.set(key, { at: current, bytes });
    return bytes;
  }
  return function handler(req, res) {
    const send = (status, value, html = false) => {
      const bytes = Buffer.isBuffer(value) ? value : Buffer.from(JSON.stringify(value));
      res.writeHead(status, {
        'content-type': html ? 'text/html; charset=utf-8' : 'application/json; charset=utf-8',
        'content-length': bytes.length, 'cache-control': 'no-store',
        'x-content-type-options': 'nosniff', 'x-frame-options': 'DENY',
        'referrer-policy': 'no-referrer', 'content-security-policy': CSP,
        ...(status === 405 ? { allow: 'GET' } : {})
      });
      res.end(bytes);
    };
    try {
      const hosts = ['127.0.0.1:' + port, 'localhost:' + port];
      if (!hosts.includes(req.headers?.host)) return send(403, { error: 'STUDIO_HOST_DENIED' });
      if (req.headers.origin && !hosts.map(host => 'http://' + host).includes(req.headers.origin))
        return send(403, { error: 'STUDIO_ORIGIN_DENIED' });
      if (req.method !== 'GET') return send(405, { error: 'READ_ONLY_GET_REQUIRED' });
      if (typeof req.url !== 'string' || req.url.length > 2048 || !req.url.startsWith('/') || req.url.startsWith('//'))
        return send(400, { error: 'STUDIO_ROUTE_DENIED' });
      // Exact paths only: queries, traversals and supplied file names are never accepted.
      if (req.url === '/' || req.url === '/operations-studio.html') return send(200, dashboard, true);
      if (req.url === '/health') return send(200, {
        system: 'SHEIKHA_OPERATIONS_STUDIO_V1', status: 'LISTENING_LOCAL_ONLY',
        scope: 'HTTP_LIVENESS_ONLY_NOT_APPLICATION_OR_PROVIDER_READINESS',
        productionReady: false, production: 'HOLD', host: HOST, mutationAllowed: false
      });
      if (req.url === '/api/status') return send(200, data('status', sources.getManagerStatus));
      if (req.url === '/api/workforce') return send(200, data('workforce', sources.getWorkforcePlans));
      if (req.url === '/api/organization') return send(200, data('organization', () => ({
        organization: sources.getOrganizationStatus(),
        jobDescriptionReview: sources.getJobDescriptionReview(),
        productionReady: false, production: 'HOLD', externalExecutionAllowed: false
      })));
      return send(404, { error: 'STUDIO_ROUTE_NOT_FOUND' });
    } catch {
      // No exception text, paths, subprocess stderr or environment values leave the boundary.
      return send(503, { error: 'STUDIO_SOURCE_UNAVAILABLE', productionReady: false, production: 'HOLD' });
    }
  };
}
function createServer(options = {}) {
  const server = http.createServer(createHandler(options));
  server.requestTimeout = 10000;
  server.headersTimeout = 10000;
  server.keepAliveTimeout = 2000;
  server.maxHeadersCount = 32;
  return server;
}
if (require.main === module) {
  try {
    const raw = process.env.SHEIKHA_ADMIN_PORT || String(DEFAULT_PORT);
    if (!/^\d{4,5}$/.test(raw)) throw Error('STUDIO_PORT_DENIED');
    const port = Number(raw), server = createServer({ port });
    server.on('error', () => { process.stderr.write('SHEIKHA_OPERATIONS_STUDIO_START_FAILED\n'); process.exitCode = 1; });
    server.listen(port, HOST, () => process.stdout.write('SHEIKHA_OPERATIONS_STUDIO_URL=http://' + HOST + ':' + port + '/\n'));
  } catch { process.stderr.write('SHEIKHA_OPERATIONS_STUDIO_START_FAILED\n'); process.exitCode = 1; }
}
module.exports = { HOST, DEFAULT_PORT, CACHE_MS, MAX_RESPONSE_BYTES, buildWorkforceScenarios, createHandler, createServer };
