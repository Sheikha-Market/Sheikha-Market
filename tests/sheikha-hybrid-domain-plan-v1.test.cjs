'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const source = require('../config/cloud/sheikha-hybrid-domain-plan-v1.json');
const { validatePlan, evaluatePlan } = require('../core/cloud-fabric/sheikha-hybrid-domain-plan-v1.cjs');
const clone = () => structuredClone(source);
const verified = () => ({ verification: 'VERIFIED', region: 'me-central2', runnableSourceVerified: true, dependenciesReady: true,
  healthVerified: true, tlsVerified: true, httpVerified: true, evidenceId: 'synthetic-test-only' });
const observations = () => ({ canary: verified(), services: { 'sheikha-main-portal': verified(),
  'sheikha-portal-core': verified(), 'sheikha-ops-reports': verified(), 'sheikha-lc-governance': verified() },
  domains: { 'sheikha.capital': verified(), 'sheikha.top': verified(), 'sheikha.shop': verified() } });

test('desired map has twelve domains with explicit inactive portal fallback', () => {
  validatePlan(source);
  const plan = evaluatePlan(source);
  assert.equal(plan.domains.length, 12);
  for (const domain of ['sheikha.dev', 'sheikha.market', 'sheikha.capital']) {
    const row = plan.domains.find(item => item.domain === domain);
    assert.equal(row.service, 'sheikha-portal-core'); assert.equal(row.fallbackCandidate, 'sheikha-main-portal');
    assert.equal(row.fallbackActivated, false);
  }
  assert.equal(plan.domains.find(row => row.domain === 'sheikha.digital').repository, 'sheikha_lc_governance');
  assert.equal(plan.domains.find(row => row.domain === 'sheikha.cloud').repository, 'sheikha-ops-reports');
  assert.equal(plan.domains.find(row => row.domain === 'sheikha.me').target, 'https://sheikha.top/profile');
  assert.equal(plan.canary.domain, 'dev.sheikha.top'); assert.equal(plan.canary.reportedRegion, 'us-central1');
  assert.equal(plan.canary.reportedService, 'sheikha-dev-service');
});
test('missing observations block dependencies, region, canary and redirects', () => {
  const result = evaluatePlan(source);
  for (const reason of ['SERVICE_UNVERIFIED', 'RUNNABLE_SOURCE_UNVERIFIED', 'SERVICE_REGION_UNVERIFIED_OR_MISMATCH',
    'SERVICE_DEPENDENCIES_OR_HEALTH_UNVERIFIED', 'CANARY_REQUIRED_FIRST', 'REDIRECT_TARGET_UNVERIFIED']) {
    assert.ok(result.blockedReasons.includes(reason));
  }
  assert.ok(result.domains.every(row => !row.prerequisitesSatisfied && !row.eligibleForDeployment));
});
test('supplied positive observations never grant deployment or remove hold', () => {
  const evidence = observations(), original = JSON.stringify(source), before = JSON.stringify(evidence);
  const result = evaluatePlan(source, evidence);
  assert.ok(result.domains.every(row => row.prerequisitesSatisfied && !row.eligibleForDeployment));
  assert.deepEqual(result.blockedReasons, ['PRODUCTION_HOLD']);
  assert.equal(result.productionHold, true); assert.equal(result.eligibleForDeployment, false);
  assert.equal(result.verification, 'UNVERIFIED');
  assert.ok(Object.values(result.effects).every(value => value === 0));
  assert.equal(JSON.stringify(source), original); assert.equal(JSON.stringify(evidence), before);
});
test('reported existing canary region cannot silently satisfy Dammam readiness', () => {
  const evidence = observations(); evidence.canary.region = 'us-central1';
  const result = evaluatePlan(source, evidence);
  assert.ok(result.domains.every(row => row.blockedReasons.includes('CANARY_REQUIRED_FIRST')));
  assert.equal(result.canary.reportedRegion, 'us-central1');
});
test('service region and dependency checks each prevent prerequisites', () => {
  for (const [key, value, reason] of [['region', 'us-central1', 'SERVICE_REGION_UNVERIFIED_OR_MISMATCH'],
    ['runnableSourceVerified', false, 'RUNNABLE_SOURCE_UNVERIFIED'],
    ['dependenciesReady', false, 'SERVICE_DEPENDENCIES_OR_HEALTH_UNVERIFIED'],
    ['healthVerified', false, 'SERVICE_DEPENDENCIES_OR_HEALTH_UNVERIFIED']]) {
    const evidence = observations(); evidence.services['sheikha-main-portal'][key] = value;
    const row = evaluatePlan(source, evidence).domains.find(item => item.domain === 'sheikha.top');
    assert.equal(row.prerequisitesSatisfied, false); assert.ok(row.blockedReasons.includes(reason));
  }
});
test('redirect needs its own verified target HTTPS and region', () => {
  for (const [key, value] of [['verification', 'UNVERIFIED'], ['tlsVerified', false],
    ['httpVerified', false], ['region', 'us-central1'], ['evidenceId', undefined]]) {
    const evidence = observations(); evidence.domains['sheikha.capital'][key] = value;
    const money = evaluatePlan(source, evidence).domains.find(row => row.domain === 'sheikha.money');
    assert.equal(money.prerequisitesSatisfied, false); assert.ok(money.blockedReasons.includes('REDIRECT_TARGET_UNVERIFIED'));
  }
});
test('missing, duplicate and unrecognized domains fail validation', () => {
  const missing = clone(); missing.domains.pop(); assert.throws(() => validatePlan(missing), /TWELVE_DOMAINS/);
  for (const domain of ['sheikha.top', 'evil.example', 'dev.sheikha.top']) {
    const plan = clone(); plan.domains[1].domain = domain; assert.throws(() => validatePlan(plan));
  }
});
test('HTTP, external redirects, loops and extra URL components fail closed', () => {
  for (const target of ['http://sheikha.capital', 'https://evil.example', 'https://sheikha.money',
    'https://user@sheikha.capital', 'https://sheikha.capital?next=evil', 'https://sheikha.capital#fragment', 'https://sheikha.capital:444']) {
    const plan = clone(); plan.domains.find(row => row.domain === 'sheikha.money').target = target;
    assert.throws(() => validatePlan(plan), /REDIRECT/);
  }
});
test('production hold, constraints, mappings and unverified state are immutable requirements', () => {
  for (const mutate of [p => { p.productionHold = false; }, p => { p.targetRegion = 'us-central1'; },
    p => { p.verification = 'VERIFIED'; }, p => { p.constraints.noModelLoads = false; },
    p => { p.domains[3].service = 'sheikha-main-portal'; }, p => { p.canary.domain = 'sheikha.dev'; }]) {
    const plan = clone(); mutate(plan); assert.throws(() => validatePlan(plan));
  }
});
test('client approval or malformed evidence cannot create authority', () => {
  assert.throws(() => evaluatePlan(source, { approved: true }), /UNKNOWN_OR_INVALID_FIELDS/);
  const plan = clone(); plan.humanApproved = true; assert.throws(() => validatePlan(plan));
  const evidence = observations(); evidence.services['sheikha-main-portal'].dependenciesReady = 'true';
  assert.throws(() => evaluatePlan(source, evidence), /INVALID_OBSERVATION_CHECK/);
});
