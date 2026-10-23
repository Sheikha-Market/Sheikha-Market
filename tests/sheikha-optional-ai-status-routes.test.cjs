const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const express = require('express');
const request = require('supertest');
const {
  OPTIONAL_AI_STATUS_MOUNTS,
  mountOptionalAiStatusRoutes
} = require('../lib/fabric-bootstrap/optional-ai-status-routes');

const root = path.resolve(__dirname, '..');
const enabled = { SHEIKHA_ENABLE_ALL_ENGINES: 'true' };
const quiet = { log() {}, warn() {} };

for (const value of [undefined, '', 'false', 'TRUE', '1']) {
  test(`does not import or mount optional reports for flag ${String(value)}`, () => {
    const result = mountOptionalAiStatusRoutes({ use() { assert.fail('unexpected mount'); } }, {
      env: { SHEIKHA_ENABLE_ALL_ENGINES: value },
      loadRouter() { assert.fail('unexpected import'); },
      logger: quiet
    });
    assert.deepEqual(result, { enabled: false, mounted: [], failed: [] });
  });
}

test('enabled mode mounts each expected router once', () => {
  const imports = [];
  const mounts = [];
  const result = mountOptionalAiStatusRoutes({ use(mount, router) { mounts.push([mount, router]); } }, {
    env: enabled,
    loadRouter(module) { imports.push(module); return module; },
    logger: quiet
  });
  assert.deepEqual(mounts.map(([mount]) => mount), OPTIONAL_AI_STATUS_MOUNTS);
  assert.equal(new Set(imports).size, 3);
  assert.deepEqual(result, { enabled: true, mounted: [...OPTIONAL_AI_STATUS_MOUNTS], failed: [] });
});

test('a failed import is reported and does not stop other mounts', () => {
  const warnings = [];
  const logs = [];
  const result = mountOptionalAiStatusRoutes({ use() {} }, {
    env: enabled,
    loadRouter(module) {
      if (module.includes('agi-asi-research')) throw new Error('test unavailable');
      return module;
    },
    logger: { log(...args) { logs.push(args); }, warn(...args) { warnings.push(args); } }
  });
  assert.deepEqual(result.failed, [OPTIONAL_AI_STATUS_MOUNTS[0]]);
  assert.deepEqual(result.mounted, OPTIONAL_AI_STATUS_MOUNTS.slice(1));
  assert.equal(warnings.length, 1);
  assert.equal(logs.length, 2);
  assert.match(warnings[0].join(' '), /test unavailable/);
});

function loaderFixture() {
  const imports = [];
  const mounts = [];
  const registry = { routes: [
    ...OPTIONAL_AI_STATUS_MOUNTS.map((mount, i) => ({ name: `optional-${i}`, mount, module: `fixture-${i}`, priority: i })),
    { name: 'unrelated', mount: '/api/unrelated', module: 'unrelated', priority: 10 }
  ] };
  const context = {
    module: { exports: {} },
    process: { cwd: () => root },
    console: { ...quiet, error() {} },
    require(name) {
      if (name === 'fs') return { readFileSync: () => JSON.stringify(registry) };
      if (name === 'path') return path;
      imports.push(name);
      return name;
    }
  };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'lib/fabric-bootstrap/fabric-bootstrap-loader.js'), 'utf8'), context);
  return { imports, mounts, load: (options) => context.module.exports.loadFabricRoutes({ use(mount) { mounts.push(mount); } }, options) };
}

test('dynamic loader excludes optional paths before importing and preserves other paths', () => {
  const fixture = loaderFixture();
  fixture.load({ excludedMounts: OPTIONAL_AI_STATUS_MOUNTS });
  assert.deepEqual(fixture.mounts, ['/api/unrelated']);
  assert.equal(fixture.imports.length, 1);
});

test('dynamic loader retains its original default behavior for other callers', () => {
  const fixture = loaderFixture();
  fixture.load();
  assert.equal(fixture.mounts.length, 4);
  assert.equal(fixture.mounts[0], '/api/unrelated');
  assert.equal(fixture.imports.length, 4);
});

test('server mounts optional reports after the AI-Core catch and excludes duplicate dynamic mounts', () => {
  const source = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
  const aiMount = source.indexOf("app.use('/api/ai-core', aiCoreRouter)");
  const optionalMount = source.indexOf('mountOptionalAiStatusRoutes(app);');
  const dynamicMount = source.indexOf('loadFabricRoutes(app, { excludedMounts: OPTIONAL_AI_STATUS_MOUNTS })');
  assert.ok(aiMount > 0 && optionalMount > aiMount && dynamicMount > optionalMount);
  const block = source.slice(source.lastIndexOf('try {', aiMount), optionalMount + 'mountOptionalAiStatusRoutes(app);'.length);
  const mounts = [];
  vm.runInNewContext(block, {
    console: quiet,
    app: {},
    require(name) {
      if (name === './routes/ai') throw new Error('AI-Core unavailable');
      assert.equal(name, './lib/fabric-bootstrap/optional-ai-status-routes');
      return { OPTIONAL_AI_STATUS_MOUNTS, mountOptionalAiStatusRoutes(app) { mounts.push(app); } };
    }
  });
  assert.equal(mounts.length, 1);
});

test('real routers return saved status data and reject mutation requests', async () => {
  const app = express();
  mountOptionalAiStatusRoutes(app, { env: enabled, logger: quiet });
  for (const mount of OPTIONAL_AI_STATUS_MOUNTS) {
    const response = await request(app).get(`${mount}/status`).expect(200).expect('Content-Type', /json/);
    assert.equal(response.body.success, true);
    assert.ok(response.body.registry);
    assert.ok(response.body.report);
    await request(app).post(`${mount}/status`).send({ activate: true }).expect(404);
  }
  const response = await request(app).get(`${OPTIONAL_AI_STATUS_MOUNTS[0]}/status`);
  assert.equal(response.body.report.researchStatus.actualAgiReached, false);
  assert.equal(response.body.report.researchStatus.actualAsiReached, false);
});

test('disabled mode leaves optional status URLs unavailable', async () => {
  const app = express();
  mountOptionalAiStatusRoutes(app, { env: {}, logger: quiet });
  for (const mount of OPTIONAL_AI_STATUS_MOUNTS) {
    await request(app).get(`${mount}/status`).expect(404);
  }
});
