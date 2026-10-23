'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const https = require('node:https');
const childProcess = require('node:child_process');
const cycle = require('../core/research/sheikha-improvement-cycle-v1.cjs');
const NOW = '2026-10-22T10:00:00.000Z';
function observation(changes = {}) {
  const value = { domain: 'cloud', metric: 'latency_ms', unit: 'ms', direction: 'MINIMIZE',
    baseline: [10, 20, 30], candidate: [8, 16, 24], evidenceId: 'local_fixture_1',
    evidenceDigest: '', measuredAt: NOW, sourceKind: 'SYNTHETIC_SAMPLE', ...changes };
  value.evidenceDigest = cycle.observationDigest(value);
  return value;
}
function input(observations = []) { return { schema: cycle.SCHEMA, cycleId: 'cycle_fixture_1', observedAt: NOW, observations }; }

test('all requested technologies and AI branches receive actionable plans without invented measurements', () => {
  const result = cycle.planCycle(input());
  assert.deepEqual(result.plans.map(value => value.id), ['cloud', 'edge', 'quantum', 'iot', 'blockchain', 'vr-ar',
    'autonomous-systems', 'machine-learning', 'deep-learning', 'nlp', 'computer-vision', 'generative-ai', 'agentic-ai', 'expert-systems']);
  assert.equal(result.coverage.requestedDomains, 14);
  assert.equal(result.coverage.measuredDomains, 0);
  assert.equal(result.coverage.evidenceGaps.length, 14);
  for (const plan of result.plans) {
    assert.equal(plan.evidenceState, 'MISSING_MEASURED_EVIDENCE');
    assert.equal(plan.researchPlan.method, 'comparative');
    assert.ok(plan.businessApplications.length);
    assert.ok(plan.researchQuestion.length);
    assert.equal(plan.researchPlan.conclusion, 'UNKNOWN');
    assert.equal(plan.capabilityState, 'NOT_ESTABLISHED_BY_THIS_CYCLE');
  }
});
test('measured sample improvements remain descriptive with explicit provenance and no authority', () => {
  const result = cycle.planCycle(input([observation()]));
  const comparison = result.comparisons[0];
  assert.equal(comparison.baseline.mean, 20);
  assert.equal(comparison.candidate.mean, 16);
  assert.equal(comparison.meanDifference, -4);
  assert.equal(comparison.worstDifference, -6);
  assert.equal(comparison.evidence.sourceKind, 'SYNTHETIC_SAMPLE');
  assert.equal(comparison.improvementEstablished, false);
  assert.equal(comparison.causalEffectEstablished, false);
  assert.equal(comparison.productionAuthorized, false);
  assert.equal(result.coverage.measuredDomains, 1);
  assert.equal(result.governance.agiAsiAchieved, false);
  assert.equal(result.governance.authorityGranted, false);
  assert.equal(result.governance.automaticMutationAllowed, false);
});
test('mean regression and isolated worst-sample regression both block any promotion', () => {
  for (const candidate of [[40, 40, 40], [1, 1, 40]]) {
    const result = cycle.planCycle(input([observation({ candidate })]));
    assert.equal(result.status, 'LOCAL_RD_REVIEW_REGRESSION_BLOCKED');
    assert.equal(result.comparisons[0].comparisonStatus, 'BLOCKED_REGRESSION');
    assert.equal(result.plans[0].nextAction, 'INVESTIGATE_REGRESSION_WITHOUT_PROMOTION');
    assert.equal(result.governance.productionAuthorized, false);
  }
});
test('maximize metrics reverse regression direction while preserving units and unequal sample sizes', () => {
  const good = observation({ metric: 'throughput_per_second', unit: '1/s', direction: 'MAXIMIZE',
    baseline: [10, 20], candidate: [20, 30, 40] });
  assert.equal(cycle.compareObservation(good, NOW).adverseChangeObserved, false);
  assert.equal(cycle.compareObservation(good, NOW).sampleSizesEqual, false);
  const bad = observation({ ...good, candidate: [5, 100] });
  assert.equal(cycle.compareObservation(bad, NOW).comparisonStatus, 'BLOCKED_REGRESSION');
});
test('finite ranges, dense nonempty bounded samples and fraction metrics fail closed', () => {
  for (const baseline of [[], [NaN], [Infinity], [-1], [1e12 + 1], [null], ['10'], new Array(2), new Array(129).fill(1)]) {
    assert.throws(() => cycle.planCycle(input([observation({ baseline })])), /BOUNDED_FINITE_SAMPLE_REQUIRED/);
  }
  assert.throws(() => cycle.planCycle(input([observation({ metric: 'error_rate', unit: 'fraction', baseline: [2] })])),
    /BOUNDED_FINITE_SAMPLE_REQUIRED/);
});
test('stale, future and malformed evidence cannot enter the current cycle', () => {
  for (const measuredAt of ['2026-10-21T09:59:59.999Z', '2026-10-22T10:00:00.001Z',
    '2026-10-22', '2026-10-22T10:00:00+00:00', '2026-02-30T10:00:00.000Z']) {
    assert.throws(() => cycle.planCycle(input([observation({ measuredAt })])), /EVIDENCE_REQUIRED|TIMESTAMP_REQUIRED/);
  }
  assert.doesNotThrow(() => cycle.planCycle(input([observation({ measuredAt: '2026-10-21T10:00:00.000Z' })])));
});
test('digest binds exact measurements, domain, metric, identity, time and provenance', () => {
  for (const [field, value] of Object.entries({ candidate: [1], domain: 'edge', metric: 'memory_mb',
    evidenceId: 'different', measuredAt: '2026-10-22T09:59:59.000Z', sourceKind: 'LOCAL_MONITOR_SAMPLE' })) {
    const item = observation(); item[field] = value;
    assert.throws(() => cycle.planCycle(input([item])), /DIGEST_MISMATCH|CONTRACT_MISMATCH/);
  }
});
test('unknown fields, user approval assertions, contract swaps and duplicates are rejected', () => {
  assert.throws(() => cycle.planCycle({ ...input(), humanApproved: true }), /CYCLE_FIELDS_DENIED/);
  for (const changes of [{ approved: true }, { domain: 'agi' }, { metric: 'made_up' },
    { direction: 'MAXIMIZE' }, { unit: 'seconds' }, { sourceKind: 'AUTHENTICATED_APPROVAL' },
    { evidenceId: '../private' }]) {
    assert.throws(() => cycle.planCycle(input([observation(changes)])));
  }
  assert.throws(() => cycle.planCycle(input([observation(), observation()])), /DUPLICATE_DOMAIN_METRIC_DENIED/);
  assert.throws(() => cycle.planCycle(input(new Array(65).fill(observation()))), /OBSERVATION_LIMIT/);
});
test('same inputs yield the same bounded report and never mutate caller evidence', () => {
  const value = input([observation()]), before = JSON.stringify(value);
  const first = cycle.planCycle(value), second = cycle.planCycle(value);
  assert.deepEqual(first, second);
  assert.equal(JSON.stringify(value), before);
  assert.throws(() => { first.plans[0].businessApplications[0] = 'attempted rewrite'; }, TypeError);
  assert.deepEqual(first.plans[0].businessApplications, second.plans[0].businessApplications);
});
test('planning performs no filesystem writes, network calls, subprocesses or timers', t => {
  const deny = () => { throw Error('SIDE_EFFECT_DENIED'); };
  for (const [target, names] of [[fs, ['writeFileSync', 'appendFileSync', 'mkdirSync', 'renameSync']],
    [http, ['request', 'get']], [https, ['request', 'get']], [childProcess, ['spawn', 'spawnSync', 'exec', 'execSync']],
    [globalThis, ['setInterval', 'setTimeout']]]) {
    for (const name of names) t.mock.method(target, name, deny);
  }
  assert.equal(cycle.planCycle(input([observation()])).governance.recurringExecution, 'CALLER_MANAGED_NOT_STARTED_BY_MODULE');
});
