'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { getIndustrialCatalog, buildIndustrialPlan } = require('../core/industrial/sheikha-industrial-planner-v1.cjs');
const { createWorkspaceServer } = require('../tools/preview/sheikha-workspace-preview.cjs');
const API = '/api/sheikha/workspace/v1';
const input = () => ({ name: 'عنقود مواد نافعة', typeId: 'cluster', templateId: 'metals',
  horizonId: 'earth', quantity: 101, planningDays: 30, communitySharePercent: 10 });

test('catalog covers five structures and twelve distinct conceptual sectors with explicit evidence limits', () => {
  const c = getIndustrialCatalog();
  assert.equal(c.types.length, 5); assert.equal(c.templates.length, 12);
  assert.equal(new Set(c.templates.map(item => item.id)).size, 12);
  assert.equal(c.visionStatus, 'ASPIRATION_NOT_VERIFIED_RANKING');
  assert.equal(c.boundaries.superiorityClaimVerified, false);
  assert.equal(c.boundaries.universalCoverageVerified, false);
  for (const metric of c.metrics) assert.equal(metric.observed, null);
  for (const item of c.templates) {
    assert.ok(item.nameAr && item.nameEn && item.evidence && item.review);
    assert.ok(item.resources.length && item.stages.length);
    assert.ok(item.types.every(id => c.types.some(type => type.id === id)));
  }
});

test('every compatible structure and sector produces an unapproved plan with ordered dependencies', () => {
  const c = getIndustrialCatalog();
  for (const template of c.templates) for (const typeId of template.types) {
    const plan = buildIndustrialPlan({ ...input(), typeId, templateId: template.id,
      horizonId: template.id === 'space' ? 'space-research' : 'earth' });
    assert.equal(plan.reviewStatus, 'DRAFT_REQUIRES_HUMAN_REVIEW');
    assert.equal(plan.boundaries.productionReady, false);
    assert.equal(plan.boundaries.physicalCommandSent, false);
    assert.equal(plan.boundaries.externalCallsMade, false);
    assert.equal(plan.boundaries.storedOnServer, false);
    assert.equal(plan.architecture.connectedDevices, 0);
    assert.deepEqual(plan.architecture.assetRegistry, []);
    for (let i = 0; i < plan.stages.length; i++) {
      assert.deepEqual(plan.stages[i].dependsOn, i ? [`stage-${i}`] : []);
      assert.equal(plan.stages[i].status, 'NOT_STARTED');
      assert.equal(plan.stages[i].owner, null);
    }
    assert.ok(plan.reviews.every(review => review.status === 'PENDING' && review.approvedBy === null));
  }
});

test('targets are bounded arithmetic goals, never a delivery forecast or measured capacity', () => {
  const p = buildIndustrialPlan(input());
  assert.deepEqual(p.targets, {
    quantity: 101, planningDays: 30, dailyTargetUnits: 4,
    communitySharePercent: 10, communityUnits: 10, remainingUnits: 91,
    basis: 'USER_TARGETS_NOT_CAPACITY_FORECAST',
    rounding: 'DAILY_TARGET_CEILING_COMMUNITY_ALLOCATION_FLOOR',
    actualCapacityPerDay: null, deliveryDate: null
  });
  for (const quantity of [1, 1000000]) for (const communitySharePercent of [0, 100]) {
    const p = buildIndustrialPlan({ ...input(), quantity, communitySharePercent, planningDays: 3650 });
    assert.equal(p.targets.communityUnits + p.targets.remainingUnits, quantity);
    assert.equal(p.targets.communityUnits, communitySharePercent === 100 ? quantity : 0);
  }
  assert.equal(p.monitoring.watch.state, 'PROPOSED_NOT_SCHEDULED');
  assert.equal(p.monitoring.guard.physicalSafetyController, false);
});

test('research horizon overrides any sector workflow with research-only stages and output', () => {
  const c = getIndustrialCatalog(), space = c.templates.find(item => item.id === 'space');
  for (const template of c.templates) {
    const plan = buildIndustrialPlan({ ...input(), templateId: template.id, horizonId: 'space-research' });
    assert.deepEqual(plan.stages.map(stage => stage.nameAr), space.stages);
    assert.equal(plan.output, 'حزمة دراسة بحثية فقط');
    assert.equal(plan.boundaries.productionReady, false);
  }
  assert.throws(() => buildIndustrialPlan({ ...input(), templateId: 'space' }), /PLAN_INPUT_REJECTED/);
});

test('unknown fields, incompatible types, approval flags and executable endpoints cannot enter plans', () => {
  for (const patch of [{ typeId: '__proto__' }, { typeId: 'farm' }, { templateId: 'unknown' },
    { horizonId: 'moon-live' }, { approved: true }, { owner: 'admin' },
    { endpoint: 'http://example.invalid' }, { command: 'run' }, { physicalCommandSent: true },
    { name: ' ' }, { name: 'xx' }, { name: 'x'.repeat(121) }, { name: 'bad\nname' }, { name: {} }]) {
    assert.throws(() => buildIndustrialPlan({ ...input(), ...patch }), /^Error: PLAN_INPUT_REJECTED$/);
  }
  for (const value of [null, [], {}, '', 1]) assert.throws(() => buildIndustrialPlan(value), /PLAN_INPUT_REJECTED/);
});

test('numeric inputs reject nonfinite, coercible, fractional and oversized values', () => {
  for (const key of ['quantity', 'planningDays', 'communitySharePercent']) {
    for (const value of [-1, 0.5, NaN, Infinity, '10', null, {}, true, Number.MAX_SAFE_INTEGER]) {
      assert.throws(() => buildIndustrialPlan({ ...input(), [key]: value }), /PLAN_INPUT_REJECTED/);
    }
  }
  for (const patch of [{ quantity: 0 }, { quantity: 1000001 }, { planningDays: 0 },
    { planningDays: 3651 }, { communitySharePercent: 101 }]) {
    assert.throws(() => buildIndustrialPlan({ ...input(), ...patch }), /PLAN_INPUT_REJECTED/);
  }
});

test('returned plans and catalogs do not mutate shared registry or other plans', () => {
  const c = getIndustrialCatalog(); c.templates[0].stages.pop(); c.metrics[0].observed = 100;
  c.boundaries.productionReady = true; c.types[0].children.push('unexpected');
  const p = buildIndustrialPlan(input()); p.type.children.push('mutated'); p.reviews[0].status = 'APPROVED';
  p.metrics[0].observed = 999; p.boundaries.productionReady = true;
  const next = buildIndustrialPlan(input());
  assert.equal(next.stages.length, 5);
  assert.equal(next.type.children.length, 4); assert.equal(next.architecture.children.length, 4);
  assert.equal(next.metrics[0].observed, null); assert.equal(next.boundaries.productionReady, false);
  assert.equal(next.reviews[0].status, 'PENDING'); assert.notEqual(p.id, next.id);
});

test('local HTTP routes use existing host, origin, session and bounded-input gates', async t => {
  const server = createWorkspaceServer();
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); }));
  const base = `http://127.0.0.1:${server.address().port}`;
  const token = (await (await fetch(base + API + '/session')).json()).token;
  const post = (body, headers = {}) => fetch(base + API + '/industry/plan', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Sheikha-Session': token, ...headers },
    body: JSON.stringify(body)
  });
  for (const path of ['/workspace/industry.html', '/workspace/industry.css', '/workspace/industry.js']) {
    const response = await fetch(base + path); assert.equal(response.status, 200);
    assert.match(response.headers.get('content-security-policy'), /connect-src 'self'/);
    await response.arrayBuffer();
  }
  const catalog = await (await fetch(base + API + '/industry/catalog')).json();
  assert.equal(catalog.templates.length, 12);
  assert.equal((await post(input(), { 'X-Sheikha-Session': '' })).status, 403);
  assert.equal((await post(input(), { Origin: 'https://example.invalid' })).status, 403);
  assert.equal((await post(input(), { 'Content-Type': 'text/plain' })).status, 415);
  for (const body of [{ ...input(), secret: 'SECRET_SENTINEL' }, { ...input(), typeId: '__proto__' }]) {
    const response = await post(body); assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: 'PLAN_INPUT_REJECTED' });
  }
  const response = await post(input()); assert.equal(response.status, 200);
  assert.equal((await response.json()).boundaries.storedOnServer, false);
  assert.equal((await post({ ...input(), name: 'x'.repeat(524289) })).status, 413);
  for (let i = 0; i < 16; i++) assert.equal((await post({})).status, 400);
  assert.equal((await post(input())).status, 429);
});
