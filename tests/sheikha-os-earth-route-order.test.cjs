'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const vm = require('node:vm');
const express = require('express');

const serverSource = fs.readFileSync(require.resolve('../server.js'), 'utf8');
const earthModule = './routes/sheikha-os-earth';
const factoryModule = './routes/factory-and-v157-routes';

function loadRoutes({ failEarth = false, placeholderFactory = false } = {}) {
  const app = express();
  const imports = [];
  const startupFailure = new Error('EARTH_ROUTE_LOAD_FAILED');
  // Exercise server.js registration without starting other engines or a listener.
  app.listen = () => {};
  const isolatedExpress = Object.assign(() => app, express);
  const load = () => vm.runInNewContext(serverSource, {
    require(id) {
      imports.push(id);
      if (id === 'express') return isolatedExpress;
      if (id === earthModule) {
        if (failEarth) throw startupFailure;
        return require('../routes/sheikha-os-earth');
      }
      if (id === factoryModule) {
        if (!placeholderFactory) return require('../routes/factory-and-v157-routes');
        // Preserve the reported catch-all behavior as a regression fixture.
        return express.Router().use((_req, res) => res.json({ factory: 'BOUND V157 - Factory placeholder' }));
      }
      if (id === './routes/sheikha-v79') return () => {};
      assert.ok(id.startsWith('./routes/'), `Unexpected startup import: ${id}`);
      return express.Router();
    },
    process: { env: { PORT: '0' } },
    console: { log() {}, error() {} }
  }, { timeout: 1000, filename: 'server.js' });
  return { app, imports, load, startupFailure };
}

test('server registers Earth once, ahead of the factory catch-all', () => {
  const fixture = loadRoutes();
  fixture.load();
  assert.equal(fixture.imports.filter(id => id === earthModule).length, 1);
  assert.ok(fixture.imports.indexOf(earthModule) < fixture.imports.indexOf(factoryModule));
  const routes = fixture.app._router.stack.filter(layer => layer.route).map(layer => layer.route.path);
  assert.equal(routes.filter(route => route === '/api/sheikha-unified/assets/needs').length, 1);
});

test('Earth loading errors stop startup instead of silently serving the placeholder', () => {
  const fixture = loadRoutes({ failEarth: true });
  assert.throws(fixture.load, error => error === fixture.startupFailure);
  assert.equal(fixture.imports.includes(factoryModule), false);
});

test('read-only Earth endpoints win even when the factory router is a catch-all', async t => {
  const fixture = loadRoutes({ placeholderFactory: true });
  fixture.load();
  const server = http.createServer(fixture.app);
  t.after(() => new Promise((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve());
    server.closeAllConnections();
  }));
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  for (const [route, key] of [
    ['/assets/mines', 'mines'],
    ['/pasture/live', 'live'],
    ['/core/dual', 'muslim'],
    ['/global/trade', 'trade_balance'],
    ['/matter/all', 'physics']
  ]) {
    const response = await fetch(`${base}/api/sheikha-unified${route}`, { signal: AbortSignal.timeout(3000) });
    assert.equal(response.status, 200, route);
    const data = await response.json();
    assert.ok(Object.hasOwn(data, key), route);
    assert.notEqual(data.factory, 'BOUND V157 - Factory placeholder', route);
  }
  const fallback = await fetch(`${base}/api/unknown-route-order-test`, { signal: AbortSignal.timeout(3000) });
  assert.equal((await fallback.json()).factory, 'BOUND V157 - Factory placeholder');
});
