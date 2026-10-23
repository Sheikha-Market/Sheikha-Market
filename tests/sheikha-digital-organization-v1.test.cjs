'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const api = require('../core/organization/sheikha-digital-organization-v1.cjs');
const source = require('../config/organization/sheikha-digital-organization-v1.json');
const clone = () => JSON.parse(JSON.stringify(source));
const AS_OF = '2026-10-22T12:00:00.000Z';
const observation = overrides => ({ roleId: 'software-engineer', metricCode: 'regression_count', baseline: 5, current: 2, sampleSize: 20, sourceRef: 'evidence:local-comparison-001', observedAt: '2026-10-22T10:00:00.000Z', ...overrides });
const roleReview = (result, id = 'software-engineer') => result.reviews.find(item => item.roleId === id);

test('validated catalog covers operational departments and a distinct owner, executive and independent audit branch', () => {
  const catalog = api.getDigitalOrganizationStatus();
  assert.equal(catalog.departments.length, 13);
  assert.equal(catalog.roles.length, 36);
  for (const id of ['projects', 'operations', 'engineering', 'quality-followup', 'assets-procurement', 'finance-accounting', 'people-learning', 'sales-customers', 'research-production', 'security-data', 'integrations-platform', 'governance-audit']) assert.ok(catalog.departments.some(item => item.id === id), id);
  assert.equal(catalog.roles.find(item => item.id === 'executive-director').reportingTo, 'owner');
  assert.equal(catalog.roles.find(item => item.id === 'governance-director').reportingTo, 'owner');
  assert.equal(catalog.roles.find(item => item.id === 'internal-auditor').reportingTo, 'governance-director');
  assert.match(catalog.catalogSha256, /^[a-f0-9]{64}$/);
  assert.equal(api.status().catalogSha256, catalog.catalogSha256);
});

test('every designed role has Arabic description, deliverables, accountability and unmeasured KPIs', () => {
  const catalog = api.status(), ids = new Set(catalog.roles.map(role => role.id));
  for (const role of catalog.roles) {
    assert.match(role.jobDescriptionAr, /[\u0600-\u06ff]/);
    assert.ok(role.responsibilities.length && role.deliverables.length && role.limits.length && role.kpis.length);
    assert.ok(role.reportingTo === null || ids.has(role.reportingTo));
    assert.equal(role.kind, 'DIGITAL_ROLE_DESIGN');
    assert.equal(role.assignedHuman, null);
    assert.equal(role.workerStarted, false);
    assert.equal(role.executionAllowed, false);
    for (const metric of role.kpis) { assert.equal(metric.actual, null); assert.equal(metric.target, null); }
  }
  assert.equal(catalog.boundaries.humanStaffVerified, 0);
  assert.equal(catalog.boundaries.productionHold, true);
});

test('catalog is immutable and inspecting a supplied design never mutates it', () => {
  const input = clone(), before = JSON.stringify(input), result = api.inspectDigitalOrganization(input);
  assert.equal(JSON.stringify(input), before);
  assert.throws(() => { result.roles[0].responsibilities.push('تعديل'); }, TypeError);
  assert.throws(() => { result.roles[0].executionAllowed = true; }, TypeError);
  assert.equal(api.status().roles[0].executionAllowed, false);
});

test('invalid references, cycles, missing descriptions and false staffing are refused', () => {
  const changes = [
    [catalog => { catalog.roles.find(role => role.id === 'software-engineer').reportingTo = 'absent'; }, 'UNKNOWN_REPORTING_ROLE'],
    [catalog => { catalog.roles.find(role => role.id === 'software-engineer').departmentId = 'absent'; }, 'UNKNOWN_ROLE_DEPARTMENT'],
    [catalog => { catalog.roles.find(role => role.id === 'engineering-manager').reportingTo = 'software-engineer'; }, 'ROLE_HIERARCHY_CYCLE'],
    [catalog => { delete catalog.roles[3].jobDescriptionAr; }, 'JOB_DESCRIPTION_REQUIRED'],
    [catalog => { catalog.roles[3].assignedHuman = 'invented-person'; }, 'HUMAN_STAFF_CLAIM_REFUSED'],
    [catalog => { catalog.roles[3].kpis[0].actual = 100; }, 'INVALID_KPI_OR_FABRICATED_MEASUREMENT'],
    [catalog => { catalog.roles.find(role => role.id === 'governance-director').reportingTo = 'executive-director'; }, 'INDEPENDENT_GOVERNANCE_REQUIRED'],
    [catalog => { catalog.departments[2].independentReviewRoleId = catalog.departments[2].managerRoleId; }, 'INDEPENDENT_DEPARTMENT_REVIEW_REQUIRED'],
    [catalog => { catalog.reviewPolicy.minimumSampleSize = 1; }, 'REVIEW_POLICY_CANNOT_BE_RELAXED']
  ];
  for (const [change, code] of changes) { const catalog = clone(); change(catalog); assert.throws(() => api.inspectDigitalOrganization(catalog), new RegExp(code)); }
});

test('every role including owner and executive denies consequential actions regardless of approval claims', () => {
  for (const role of api.status().roles) {
    for (const action of [...api.FORBIDDEN_ACTIONS, 'UNKNOWN_ACTION', 'docker restart service']) {
      const decision = api.evaluateRoleAction(role.id, action, { humanApproved: true, owner: true, trusted: true, executionAllowed: true });
      assert.equal(decision.executionAllowed, false);
      assert.equal(decision.planningAllowed, false);
      assert.equal(decision.approvalVerified, false);
      assert.equal(decision.decision, 'DENY_EXECUTION');
    }
  }
  assert.equal(api.evaluateRoleAction('executive-director', 'PREPARE_REPORT').planningAllowed, true);
  assert.equal(api.evaluateRoleAction('invented-person', 'PREPARE_REPORT').planningAllowed, false);
});

test('review without measurements requests evidence for every role and does not claim improvement', () => {
  const result = api.planJobDescriptionReview({ observations: [], asOf: AS_OF });
  assert.equal(result.status, 'EVIDENCE_REQUIRED');
  assert.equal(result.reviews.length, 36);
  assert.ok(result.reviews.every(item => item.metrics.length === 0 && item.status === 'EVIDENCE_REQUIRED' && item.descriptionChanged === false && item.improvementVerified === false));
  assert.equal(result.nextReviewAt, '2026-11-21T12:00:00.000Z');
  assert.equal(result.authoritiesChanged, false);
  assert.equal(result.automaticPromotionAllowed, false);
});

test('sufficient input yields a directional comparison proposal, not an authenticated improvement or altered description', () => {
  const before = api.status().catalogSha256;
  const result = api.planJobDescriptionReview({ observations: [observation()], asOf: AS_OF });
  const review = roleReview(result), metric = review.metrics[0];
  assert.equal(review.status, 'PROPOSED_REVIEW');
  assert.equal(metric.comparison, 'IMPROVED');
  assert.equal(metric.delta, -3);
  assert.equal(metric.sourceAuthenticated, false);
  assert.equal(metric.improvementVerified, false);
  assert.equal(review.proposedDescription, null);
  assert.equal(review.descriptionChanged, false);
  assert.equal(api.status().catalogSha256, before);
  assert.equal(roleReview(result, 'owner').status, 'EVIDENCE_REQUIRED');
});

test('regressions and unchanged measurements remain visible for human review', () => {
  const regression = roleReview(api.planJobDescriptionReview({ observations: [observation({ current: 9 })], asOf: AS_OF }));
  assert.equal(regression.metrics[0].comparison, 'REGRESSED');
  assert.equal(regression.reviewReason, 'REGRESSION_REQUIRES_REVIEW');
  const unchanged = roleReview(api.planJobDescriptionReview({ observations: [observation({ current: 5 })], asOf: AS_OF }));
  assert.equal(unchanged.metrics[0].comparison, 'UNCHANGED');
});

test('maximize indicators use their own direction and have bounded percentage inputs', () => {
  const item = observation({ roleId: 'quality-manager', metricCode: 'first_pass_acceptance', baseline: 40, current: 75 });
  assert.equal(roleReview(api.planJobDescriptionReview({ observations: [item], asOf: AS_OF }), 'quality-manager').metrics[0].comparison, 'IMPROVED');
  assert.throws(() => api.planJobDescriptionReview({ observations: [{ ...item, current: 101 }], asOf: AS_OF }), /PERCENT_OUT_OF_BOUNDS/);
});

test('small samples, absent sources and stale or future observations cannot support a review proposal', () => {
  for (const overrides of [{ sampleSize: 1 }, { sourceRef: undefined }, { observedAt: undefined }, { observedAt: '2026-08-01T10:00:00.000Z' }, { observedAt: '2026-10-23T10:00:00.000Z' }, { sourceRef: 'https://provider.example/private?token=not-allowed' }]) {
    const result = api.planJobDescriptionReview({ observations: [observation(overrides)], asOf: AS_OF });
    assert.equal(roleReview(result).status, 'EVIDENCE_REQUIRED');
    assert.equal(result.automaticPromotionAllowed, false);
    assert.equal(result.authoritiesChanged, false);
  }
});

test('unknown metrics, duplicate observations and malformed measurements fail closed', () => {
  for (const overrides of [{ roleId: 'missing' }, { metricCode: 'not_a_role_metric' }, { baseline: NaN }, { current: Infinity }, { sampleSize: -1 }, { sampleSize: '20' }, { observedAt: 'yesterday' }]) assert.throws(() => api.planJobDescriptionReview({ observations: [observation(overrides)], asOf: AS_OF }));
  assert.throws(() => api.planJobDescriptionReview({ observations: [observation(), observation()], asOf: AS_OF }), /DUPLICATE_ROLE_KPI_OBSERVATION/);
  assert.throws(() => api.planJobDescriptionReview({ observations: Array(501).fill(observation()), asOf: AS_OF }), /INVALID_REVIEW_OBSERVATIONS/);
});
