'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { inspect } = require('../scripts/sheikha-strategic-partnerships-core-status');
const { evaluatePortfolio, recipientDraft, renderRecipientMarkdown, sha256 } = require('../core/partnerships/shared-goals-v1');
const { main, privatePath } = require('../tools/partnerships/evaluate-shared-goals-v1');
const ROOT = path.resolve(__dirname, '..');

function fixture() {
  const metric = { id: 'quality', goalId: 'benefit', label: 'Accepted deliveries', category: 'quality', unit: '%', method: 'ratio_percent', direction: 'increase', baseline: 50, target: 90, weight: 1, critical: true, minSampleSize: 5, maxAgeDays: 30, ownerId: 'owner', reviewerId: 'reviewer', sourceId: 'acceptance' };
  const relationship = { id: 'partner-a', tenantId: 'tenant-a', type: 'partner', displayName: 'SYNTHETIC A', vision: 'Reduce rework', ownerId: 'owner', stage: 'DRAFT', goals: [{ id: 'benefit', description: 'Improve accepted deliveries', ownerId: 'owner', startsAt: '2026-09-01T00:00:00.000Z', dueAt: '2026-09-30T00:00:00.000Z' }], kpis: [metric] };
  const payload = { relationshipId: relationship.id, tenantId: relationship.tenantId, kpiId: metric.id, sourceId: metric.sourceId, collectorId: 'collector', periodStart: '2026-09-01T00:00:00.000Z', periodEnd: '2026-09-12T00:00:00.000Z', recordedAt: '2026-09-12T01:00:00.000Z', sampleSize: 10, numerator: 8, denominator: 10 };
  const context = { periodStart: payload.periodStart, periodEnd: payload.periodEnd, asOf: '2026-09-13T00:00:00.000Z', observations: [], evidenceBlobs: new Map() };
  return { portfolio: { schemaVersion: '1.0.0', dataMode: 'SYNTHETIC', relationships: [relationship] }, context, payload, metric, relationship };
}
function bind(f) {
  const bytes = Buffer.from(JSON.stringify(f.payload));
  const digest = sha256(bytes);
  f.context.evidenceBlobs = new Map([[digest, bytes]]);
  f.context.observations = [{ id: 'obs-a', relationshipId: f.relationship.id, tenantId: f.relationship.tenantId, kpiId: f.metric.id, evidenceSha256: digest, review: { decision: 'ACCEPT', evidenceSha256: digest, reviewerId: f.metric.reviewerId, reviewedAt: '2026-09-12T02:00:00.000Z' } }];
  return f;
}
const evaluate = f => evaluatePortfolio(f.portfolio, f.context);
const metricResult = f => evaluate(f).relationships[0].metrics[0];

function withStrategy(f) {
  f.relationship.strategy = {
    mission: 'Deliver measurable benefit',
    values: [{ id: 'trust', description: 'Evidence before claims', kpiIds: ['quality'] }],
    objectives: [{ id: 'obj', description: 'Reduce rework', horizon: 'SHORT', ownerId: 'owner', goalIds: ['benefit'] }],
    capacity: [{ ownerId: 'owner', availableHours: 6 }],
    projects: [{ id: 'pilot', title: 'Bounded pilot', objectiveId: 'obj', ownerId: 'owner', startsAt: '2026-09-01T00:00:00.000Z', dueAt: '2026-09-30T00:00:00.000Z', budgetSar: 1000, actualCostSar: null,
      tasks: [
        { id: 'measure', title: 'Measure baseline', ownerId: 'owner', dependencies: [], acceptanceKpiIds: ['quality'], remainingHours: 4, declaredStatus: 'TODO' },
        { id: 'deliver', title: 'Deliver pilot', ownerId: 'owner', dependencies: ['measure'], acceptanceKpiIds: ['quality'], remainingHours: 4, declaredStatus: 'TODO' }
      ] }],
    operations: [{ id: 'quality-ops', title: 'Weekly quality review', ownerId: 'owner', kpiIds: ['quality'], runbookReference: 'quality-runbook-v1', nextReviewAt: '2026-09-12T00:00:00.000Z' }]
  };
  return f;
}
const strategyResult = f => evaluate(f).relationships[0].strategyAndOperations;

describe('vision, mission, project and operational integration', () => {
  test('links strategy to evidence and checks capacity and operational cadence', () => {
    const f = withStrategy(bind(fixture()));
    const result = strategyResult(f);
    expect(result.mission).toBe('Deliver measurable benefit');
    expect(result.capacity[0]).toMatchObject({ remainingHours: 8, availableHours: 6, overloaded: true });
    expect(result.projects[0].tasks.map(task => task.status)).toEqual(['READY_FOR_OWNER_REVIEW', 'WAITING_FOR_DEPENDENCIES']);
    expect(result.projects[0].budgetExceeded).toBeNull();
    expect(result.operations[0]).toMatchObject({ reviewDue: true, affectedKpiIds: ['quality'], runbookExecuted: false });
  });
  test('declared completion alone cannot close a project', () => {
    const f = withStrategy(bind(fixture())); const task = f.relationship.strategy.projects[0].tasks[0];
    task.declaredStatus = 'DONE_DECLARED'; task.remainingHours = 0;
    const result = strategyResult(f);
    expect(result.projects[0].taskCompletionPercent).toBe(0);
    expect(result.projects[0].tasks[0].status).toBe('COMPLETION_REVIEW_REQUIRED');
    expect(result.capacity[0].remainingHours).toBeNull();
  });
  test('local evidence can support completion, never authorization', () => {
    const f = withStrategy(fixture()); f.payload.numerator = 10; bind(f);
    f.relationship.strategy.projects[0].tasks.forEach(task => Object.assign(task, { declaredStatus: 'DONE_DECLARED', remainingHours: 0 }));
    const result = strategyResult(f);
    expect(result.projects[0]).toMatchObject({ taskCompletionPercent: 100, productionReleaseAllowed: false, spendingAuthorized: false });
    expect(result.autonomousExecutionEnabled).toBe(false);
  });
  test('cycles fail closed', () => {
    const f = withStrategy(bind(fixture())); f.relationship.strategy.projects[0].tasks[0].dependencies = ['deliver'];
    expect(() => evaluate(f)).toThrow('TASK_DEPENDENCY_CYCLE');
  });
  test('refuses unknown dependencies or a wrong objective', () => {
    const f = withStrategy(bind(fixture())); f.relationship.strategy.projects[0].tasks[1].dependencies = ['absent'];
    expect(() => evaluate(f)).toThrow('INVALID_TASK_DEPENDENCY');
    f.relationship.strategy.projects[0].objectiveId = 'absent';
    expect(() => evaluate(f)).toThrow('PROJECT_OBJECTIVE_BINDING_REQUIRED');
  });
  test('requires KPI linkage for values and operational reviews', () => {
    for (const target of ['values', 'operations']) {
      const f = withStrategy(bind(fixture())); f.relationship.strategy[target][0].kpiIds = ['absent'];
      expect(() => evaluate(f)).toThrow();
    }
  });
  test('supports short, medium and long objectives without inventing achievement', () => {
    for (const horizon of ['SHORT', 'MEDIUM', 'LONG']) {
      const f = withStrategy(fixture()); f.relationship.strategy.objectives[0].horizon = horizon;
      expect(strategyResult(f).objectives[0]).toMatchObject({ horizon, allTargetsMet: false });
    }
  });
  test('reports costs and overdue delivery separately', () => {
    const f = withStrategy(bind(fixture())); f.context.asOf = '2026-10-01T00:00:00.000Z';
    f.relationship.strategy.projects[0].actualCostSar = 1200;
    expect(strategyResult(f).projects[0]).toMatchObject({ budgetExceeded: true, costOverBudgetSar: 200, overdue: true });
  });
  test('rejects nonsensical effort and budgets', () => {
    const f = withStrategy(bind(fixture())); f.relationship.strategy.projects[0].tasks[0].remainingHours = -1;
    expect(() => evaluate(f)).toThrow('INVALID_TASK');
    f.relationship.strategy.projects[0].budgetSar = '1000';
    expect(() => evaluate(f)).toThrow('INVALID_PROJECT_BUDGET');
  });
  test('unlisted staff capacity remains unknown', () => {
    const f = withStrategy(bind(fixture())); f.relationship.strategy.capacity = [];
    expect(strategyResult(f).capacity[0]).toMatchObject({ availableHours: null, overloaded: null });
  });
});

describe('shared-goal evidence and relationship reporting', () => {
  test('calculates progress from exact evidence without granting authority', () => {
    const f = bind(fixture());
    const before = JSON.stringify(f.portfolio);
    const result = evaluate(f);
    expect(result.relationships[0]).toMatchObject({ measuredCoveragePercent: 100, weightedProgressPercent: 75, targetAchievementPercent: 0, criticalHolds: ['quality'], deliveryAllowed: false });
    expect(result.relationships[0].metrics[0]).toMatchObject({ actual: 80, status: 'BELOW_TARGET', identityAndTruthIndependentlyVerified: false });
    expect(result.boundaries.externalMessagesSent).toBe(0);
    expect(JSON.stringify(f.portfolio)).toBe(before);
    expect(evaluate(f)).toEqual(result);
  });
  test('missing data stays unknown and blocks a complete score', () => {
    const result = evaluate(fixture()).relationships[0];
    expect(result).toMatchObject({ measuredCoveragePercent: 0, weightedProgressPercent: null, targetAchievementPercent: null });
    expect(result.metrics[0]).toMatchObject({ status: 'NO_DATA', actual: null });
  });
  test('counts a genuine zero observation, not missing data', () => {
    const f = fixture(); f.payload.numerator = 0;
    expect(metricResult(bind(f))).toMatchObject({ actual: 0, progressPercent: 0 });
  });
  test('zero denominator never becomes success', () => {
    const f = fixture(); f.payload.numerator = 0; f.payload.denominator = 0;
    expect(metricResult(bind(f)).status).toBe('NO_DENOMINATOR');
  });
  test('matches sample size to denominator', () => {
    const f = fixture(); f.payload.sampleSize = 20;
    expect(metricResult(bind(f)).status).toBe('SAMPLE_DENOMINATOR_MISMATCH');
  });
  test('small samples do not support a success claim', () => {
    const f = fixture(); f.payload.sampleSize = 2;
    expect(metricResult(bind(f)).status).toBe('INSUFFICIENT_SAMPLE');
  });
  test('no coercion of numeric strings or null values', () => {
    for (const value of [null, '80', true]) {
      const f = fixture(); f.metric.method = 'value'; f.payload.value = value;
      expect(metricResult(bind(f)).status).toBe('INVALID_MEASUREMENT');
    }
  });
  test('lower-is-better and null baseline are supported', () => {
    const f = fixture(); Object.assign(f.metric, { method: 'value', baseline: 100, target: 20, direction: 'decrease' });
    f.payload.value = 40;
    expect(metricResult(bind(f)).progressPercent).toBe(75);
    f.metric.baseline = null;
    expect(evaluate(f).relationships[0].weightedProgressPercent).toBeNull();
  });
  test('difference retains negative environmental savings', () => {
    const f = fixture(); Object.assign(f.metric, { method: 'difference', baseline: 0, target: 20 });
    Object.assign(f.payload, { before: 100, after: 110 });
    expect(metricResult(bind(f))).toMatchObject({ actual: -10, targetMet: false });
  });
  test('maintenance target is not divided by zero', () => {
    const f = fixture(); f.metric.baseline = f.metric.target = 80;
    expect(metricResult(bind(f))).toMatchObject({ targetMet: true, progressPercent: 100 });
  });
  test('bounds progress but preserves above-target raw values', () => {
    const f = fixture(); f.payload.numerator = 10;
    expect(metricResult(bind(f))).toMatchObject({ actual: 100, progressPercent: 100, targetMet: true });
  });
  test('overdue targets propose corrective action, not execution', () => {
    const f = bind(fixture()); f.context.asOf = '2026-10-01T00:00:00.000Z';
    const result = evaluate(f).relationships[0];
    expect(result.metrics[0].status).toBe('OVERDUE');
    expect(result.actions[0].execution).toBe('DRAFT_REQUIRES_HUMAN_REVIEW');
  });
  test('staleness follows the measurement period, not a fresh wrapper timestamp', () => {
    const f = bind(fixture()); f.context.asOf = '2026-11-01T00:00:00.000Z';
    expect(metricResult(f).status).toBe('STALE');
  });
  test('does not evaluate a future goal as a completed one', () => {
    const f = bind(fixture()); f.relationship.goals[0].startsAt = '2026-09-15T00:00:00.000Z';
    expect(metricResult(f).status).toBe('NOT_STARTED');
  });
  test('rejects a future or different period and invalid dates', () => {
    const f = fixture(); f.context.periodEnd = '2026-10-01T00:00:00.000Z';
    expect(() => evaluate(f)).toThrow('INVALID_REPORT_WINDOW');
    f.context.periodEnd = '2026-02-30T00:00:00.000Z';
    expect(() => evaluate(f)).toThrow('INVALID_TIMESTAMP');
    const other = fixture(); other.payload.periodEnd = '2026-09-11T00:00:00.000Z';
    expect(metricResult(bind(other)).status).toBe('PERIOD_MISMATCH');
  });
  test('detects tampered bytes', () => {
    const f = bind(fixture()); f.context.evidenceBlobs.set(f.context.observations[0].evidenceSha256, Buffer.from('{}'));
    expect(metricResult(f).status).toBe('EVIDENCE_HASH_MISMATCH');
  });
  test('requires actual evidence bytes, not just a supplied digest', () => {
    const f = bind(fixture()); f.context.evidenceBlobs.clear();
    expect(metricResult(f).status).toBe('EVIDENCE_MISSING');
  });
  test('binds evidence to tenant, relationship, KPI and source', () => {
    for (const key of ['tenantId', 'relationshipId', 'kpiId', 'sourceId']) {
      const f = fixture(); f.payload[key] = 'other';
      expect(metricResult(bind(f)).status).toBe('EVIDENCE_SCOPE_MISMATCH');
    }
  });
  test('requires independent declared review bound to this evidence', () => {
    for (const edit of [r => { r.reviewerId = 'collector'; }, r => { r.decision = 'PENDING'; }, r => { r.evidenceSha256 = '0'.repeat(64); }]) {
      const f = bind(fixture()); edit(f.context.observations[0].review);
      expect(metricResult(f).status).toBe('REVIEW_REQUIRED');
    }
  });
  test('rejects review before capture or in the future', () => {
    for (const value of ['2026-09-11T00:00:00.000Z', '2026-09-14T00:00:00.000Z']) {
      const f = bind(fixture()); f.context.observations[0].review.reviewedAt = value;
      expect(metricResult(f).status).toBe('INVALID_EVIDENCE_TIME');
    }
  });
  test('conflicting observations need review even if both report success', () => {
    const f = bind(fixture()); f.context.observations.push({ ...f.context.observations[0], id: 'obs-b' });
    expect(metricResult(f).status).toBe('CONFLICTING_SUBMISSIONS');
  });
  test('rejects unknown observation scope rather than silently dropping it', () => {
    const f = bind(fixture()); f.context.observations[0].tenantId = 'other';
    expect(() => evaluate(f)).toThrow('OBSERVATION_SCOPE_UNKNOWN');
  });
  test('keeps reports isolated for partners and customers', () => {
    const f = bind(fixture()); const customer = JSON.parse(JSON.stringify(f.relationship));
    Object.assign(customer, { id: 'customer-b', tenantId: 'tenant-b', type: 'customer', vision: 'PRIVATE_B_ONLY' });
    f.portfolio.relationships.push(customer);
    const report = evaluate(f);
    const draft = recipientDraft(report, 'partner-a', 'tenant-a');
    expect(JSON.stringify(draft)).not.toContain('PRIVATE_B_ONLY');
    expect(draft.delivery).toMatchObject({ status: 'NOT_SENT', automaticDispatchEnabled: false });
    expect(draft.dataMode).toBe('SYNTHETIC');
    expect(() => recipientDraft(report, 'partner-a', 'tenant-b')).toThrow('RECIPIENT_SCOPE_DENIED');
    report.relationships[0].actual = 999;
    expect(() => recipientDraft(report, 'partner-a', 'tenant-a')).toThrow('REPORT_HASH_MISMATCH');
  });
  test('missing critical KPI is not masked by noncritical success', () => {
    const f = bind(fixture()); f.payload.numerator = 10; f.metric.critical = false; bind(f);
    f.relationship.kpis.push({ ...f.metric, id: 'safety', critical: true });
    const result = evaluate(f).relationships[0];
    expect(result.criticalHolds).toEqual(['safety']);
    expect(result.weightedProgressPercent).toBeNull();
  });
  test('closed relationships are not automatically resumed', () => {
    const f = bind(fixture()); f.relationship.stage = 'CLOSED';
    expect(evaluate(f).relationships[0].recommendation).toBe('DO_NOT_RESUME_WITHOUT_REVIEW');
  });
  test('rejects malformed definitions, duplicate IDs and impossible targets', () => {
    const mutations = [
      f => { f.metric.target = '90'; }, f => { f.metric.weight = -1; },
      f => { f.metric.method = 'eval'; }, f => { f.metric.goalId = 'missing'; },
      f => { f.metric.target = 101; }, f => { f.metric.target = 10; },
      f => { f.metric.ownerId = 123; }, f => { f.metric.minSampleSize = 0; },
      f => { f.relationship.kpis.push(f.metric); }, f => { delete f.portfolio.dataMode; }
    ];
    mutations.forEach(mutate => { const f = fixture(); mutate(f); expect(() => evaluate(f)).toThrow(); });
  });
  test('empty registry is not operational readiness', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-partner-status-'));
    try {
      const output = inspect(dir);
      expect(output.data).toMatchObject({ operationalReadinessVerified: false, registryReadable: false, verifiedPartnerCount: null });
      expect(output.message).not.toContain('مفعلة بالكامل');
    } finally { fs.rmSync(dir, { recursive: true, force: true }); }
  });
  test('human-readable reports escape injected markup and reject modified drafts', () => {
    const f = withStrategy(bind(fixture())); f.relationship.displayName = '<img src=x> [link](https://invalid.test)';
    const draft = recipientDraft(evaluate(f), 'partner-a', 'tenant-a');
    const output = renderRecipientMarkdown(draft);
    expect(output).toContain('&lt;img');
    expect(output).not.toContain('<img');
    expect(output).not.toContain('[link](https://invalid.test)');
    expect(output).toContain('SYNTHETIC');
    draft.relationship.vision = 'tampered';
    expect(() => renderRecipientMarkdown(draft)).toThrow('DRAFT_HASH_MISMATCH');
  });
  test('finite but unrepresentable monetary values cannot overflow into null', () => {
    const f = withStrategy(bind(fixture())); f.relationship.strategy.projects[0].budgetSar = 1e308;
    expect(() => evaluate(f)).toThrow('INVALID_PROJECT_BUDGET');
  });
  test('full file presence still does not prove contracts or operations', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-partner-status-'));
    try {
      const base = path.join(dir, 'infrastructure/sheikha-strategic-partnerships-core');
      const paths = ['strategic-partnerships-core-spec.json', 'bands/partner-bands.json', 'ecosystem/ecosystem-domains.json', 'metrics/evaluation-metrics.json', 'governance/partnership-governance.json', 'academia/target-universities.json', 'research/target-research-centers.json', 'training/training-development-framework.json'];
      paths.forEach(name => { const file = path.join(base, name); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, '{}'); });
      expect(inspect(dir).data).toMatchObject({ readinessScore: 100, readinessScoreMeaning: 'CONFIGURATION_FILE_PRESENCE_ONLY', operationalReadinessVerified: false });
    } finally { fs.rmSync(dir, { recursive: true, force: true }); }
  });
});

describe('private CLI evaluation', () => {
  let dir;
  beforeEach(() => { dir = fs.mkdtempSync(path.join(ROOT, 'reports/private/partnership-test-')); fs.chmodSync(dir, 0o700); });
  afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));
  function input(f) {
    const file = path.join(dir, 'input.json');
    const digest = f.context.observations[0].evidenceSha256;
    fs.writeFileSync(path.join(dir, 'evidence.json'), f.context.evidenceBlobs.get(digest), { mode: 0o600 });
    const { evidenceBlobs, observations, ...window } = f.context;
    fs.writeFileSync(file, JSON.stringify({ schemaVersion: '1.0.0', portfolio: f.portfolio, window, observations, evidenceFiles: [{ sha256: digest, file: 'evidence.json' }] }), { mode: 0o600 });
    return file;
  }
  test('writes private per-recipient drafts without dispatch or overwrite', () => {
    const file = input(bind(fixture())); const out = path.join(dir, 'out');
    expect(main(['--input', file, '--out', out])).toMatchObject({ evaluationComplete: true, relationshipDrafts: 1, externalMessagesSent: 0 });
    expect(fs.statSync(out).mode & 0o777).toBe(0o700);
    fs.readdirSync(out).forEach(name => expect(fs.statSync(path.join(out, name)).mode & 0o777).toBe(0o600));
    expect(JSON.parse(fs.readFileSync(path.join(out, 'completion.json'))).complete).toBe(true);
    expect(() => main(['--input', file, '--out', out])).toThrow('OUTPUT_ALREADY_EXISTS_NO_OVERWRITE');
  });
  test('rejects public paths, symlinks and broad permissions', () => {
    expect(() => privatePath(path.join(ROOT, 'public/private.json'))).toThrow('PRIVATE_REPORTS_PATH_REQUIRED');
    const file = input(bind(fixture())); const link = path.join(dir, 'link.json');
    fs.symlinkSync(file, link);
    expect(() => main(['--input', link, '--out', path.join(dir, 'out')])).toThrow('SYMLINK_PATH_DENIED');
    fs.chmodSync(file, 0o644);
    expect(() => main(['--input', file, '--out', path.join(dir, 'out')])).toThrow('PRIVATE_FILE_MODE_AND_OWNER_REQUIRED');
  });
  test('rejects evidence path traversal and hard links', () => {
    const file = input(bind(fixture())); const data = JSON.parse(fs.readFileSync(file));
    data.evidenceFiles[0].file = '../escape.json'; fs.writeFileSync(file, JSON.stringify(data));
    expect(() => main(['--input', file, '--out', path.join(dir, 'out')])).toThrow('EVIDENCE_PATH_ESCAPE_DENIED');
    const hard = path.join(dir, 'hard.json'); fs.linkSync(file, hard);
    expect(() => main(['--input', hard, '--out', path.join(dir, 'out')])).toThrow('UNSAFE_INPUT_FILE');
  });
});
