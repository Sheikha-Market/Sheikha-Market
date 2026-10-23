'use strict';

const { createHash } = require('node:crypto');
const DAY = 86400000;
const ID = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/;
const SHA = /^[a-f0-9]{64}$/;
const METHODS = ['value', 'ratio_percent', 'difference'];
const CATEGORIES = ['benefit', 'quality', 'economic', 'environment', 'knowledge', 'trust'];

function check(condition, code) {
  if (!condition) throw new Error(code);
}
function record(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function text(value) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= 1000;
}
function finite(value) {
  return typeof value === 'number' && Number.isFinite(value);
}
function validId(value) {
  return typeof value === 'string' && ID.test(value);
}
function date(value) {
  check(typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value), 'UTC_TIMESTAMP_REQUIRED');
  const time = Date.parse(value);
  check(Number.isFinite(time) && new Date(time).toISOString() === value, 'INVALID_TIMESTAMP');
  return time;
}
function unique(items, code) {
  check(Array.isArray(items) && items.length <= 1000, code);
  const ids = new Set();
  items.forEach(item => {
    check(record(item) && typeof item.id === 'string' && ID.test(item.id) && !ids.has(item.id), code);
    ids.add(item.id);
  });
  return ids;
}
function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}
function rounded(value) {
  return Math.round(value * 100) / 100;
}

function validatePortfolio(portfolio) {
  check(record(portfolio) && portfolio.schemaVersion === '1.0.0', 'INVALID_PORTFOLIO_VERSION');
  check(['SYNTHETIC', 'OPERATOR_SUPPLIED_UNVERIFIED'].includes(portfolio.dataMode), 'DATA_MODE_REQUIRED');
  unique(portfolio.relationships, 'INVALID_RELATIONSHIPS');
  let metricCount = 0;
  portfolio.relationships.forEach(rel => {
    check(validId(rel.tenantId) && validId(rel.ownerId), 'INVALID_RELATIONSHIP_SCOPE');
    check(['partner', 'customer'].includes(rel.type), 'INVALID_RELATIONSHIP_TYPE');
    check(text(rel.displayName) && text(rel.vision), 'RELATIONSHIP_VISION_REQUIRED');
    check(['CANDIDATE', 'DRAFT', 'CONTRACTED_DECLARED', 'SUSPENDED', 'CLOSED'].includes(rel.stage), 'INVALID_RELATIONSHIP_STAGE');
    const goalIds = unique(rel.goals, 'INVALID_GOALS');
    unique(rel.kpis, 'INVALID_KPIS');
    metricCount += rel.kpis.length;
    check(metricCount <= 1000, 'METRIC_LIMIT_EXCEEDED');
    check(rel.goals.length > 0 && rel.kpis.length > 0, 'GOALS_AND_KPIS_REQUIRED');
    rel.goals.forEach(goal => {
      check(text(goal.description) && validId(goal.ownerId), 'GOAL_OWNER_AND_DESCRIPTION_REQUIRED');
      check(date(goal.startsAt) < date(goal.dueAt), 'INVALID_GOAL_WINDOW');
      check(rel.kpis.some(kpi => kpi.goalId === goal.id), 'GOAL_WITHOUT_KPI');
    });
    rel.kpis.forEach(kpi => {
      check(goalIds.has(kpi.goalId), 'UNKNOWN_KPI_GOAL');
      check(text(kpi.label) && text(kpi.unit), 'KPI_LABEL_AND_UNIT_REQUIRED');
      check(validId(kpi.ownerId) && validId(kpi.sourceId) && validId(kpi.reviewerId), 'KPI_RESPONSIBILITY_REQUIRED');
      check(METHODS.includes(kpi.method) && CATEGORIES.includes(kpi.category), 'INVALID_KPI_METHOD_OR_CATEGORY');
      check(['increase', 'decrease'].includes(kpi.direction), 'INVALID_KPI_DIRECTION');
      check(finite(kpi.target) && (kpi.baseline === null || finite(kpi.baseline)), 'INVALID_KPI_BASELINE_OR_TARGET');
      check(finite(kpi.weight) && kpi.weight > 0 && kpi.weight <= 100, 'INVALID_KPI_WEIGHT');
      check(Number.isSafeInteger(kpi.minSampleSize) && kpi.minSampleSize > 0, 'INVALID_MIN_SAMPLE');
      check(finite(kpi.maxAgeDays) && kpi.maxAgeDays > 0 && kpi.maxAgeDays <= 366, 'INVALID_MAX_AGE');
      check(typeof kpi.critical === 'boolean', 'CRITICAL_FLAG_REQUIRED');
      if (kpi.method === 'ratio_percent') {
        check(kpi.target >= 0 && kpi.target <= 100 && (kpi.baseline === null || (kpi.baseline >= 0 && kpi.baseline <= 100)), 'INVALID_PERCENT_TARGET');
      }
      if (kpi.baseline !== null) {
        check(kpi.direction === 'increase' ? kpi.target >= kpi.baseline : kpi.target <= kpi.baseline, 'TARGET_CONTRADICTS_DIRECTION');
      }
    });
  });
  return portfolio;
}

function evaluateMetric(rel, kpi, observations, evidenceBlobs, window) {
  const goal = rel.goals.find(item => item.id === kpi.goalId);
  const base = {
    id: kpi.id, goalId: kpi.goalId, label: kpi.label, category: kpi.category,
    unit: kpi.unit, direction: kpi.direction, baseline: kpi.baseline,
    target: kpi.target, weight: kpi.weight, critical: kpi.critical,
    ownerId: kpi.ownerId, dueAt: goal.dueAt, actual: null, sampleSize: null,
    progressPercent: null, targetMet: null, evidenceSha256: null,
    identityAndTruthIndependentlyVerified: false
  };
  const result = (status, extra = {}) => ({ ...base, status, ...extra });
  if (window.now < date(goal.startsAt)) return result('NOT_STARTED');
  const matches = observations.filter(obs => obs.relationshipId === rel.id && obs.tenantId === rel.tenantId && obs.kpiId === kpi.id);
  if (!matches.length) return result('NO_DATA');
  // Never silently select a favorable submission when evidence conflicts.
  if (matches.length > 1) return result('CONFLICTING_SUBMISSIONS');
  const obs = matches[0];
  const bytes = evidenceBlobs.get(obs.evidenceSha256);
  if (!Buffer.isBuffer(bytes) || bytes.length > 1024 * 1024) return result('EVIDENCE_MISSING');
  if (sha256(bytes) !== obs.evidenceSha256) return result('EVIDENCE_HASH_MISMATCH');
  let payload;
  try { payload = JSON.parse(bytes.toString('utf8')); } catch { return result('INVALID_EVIDENCE'); }
  if (!record(payload)) return result('INVALID_EVIDENCE');
  if (payload.relationshipId !== rel.id || payload.tenantId !== rel.tenantId || payload.kpiId !== kpi.id || payload.sourceId !== kpi.sourceId) return result('EVIDENCE_SCOPE_MISMATCH');
  if (payload.periodStart !== window.periodStart || payload.periodEnd !== window.periodEnd) return result('PERIOD_MISMATCH');
  let captured, reviewed;
  try {
    captured = date(payload.recordedAt);
    reviewed = date(obs.review && obs.review.reviewedAt);
  } catch { return result('INVALID_EVIDENCE_TIME'); }
  if (captured < window.end || captured > window.now || reviewed < captured || reviewed > window.now) return result('INVALID_EVIDENCE_TIME');
  if (window.now - window.end > kpi.maxAgeDays * DAY) return result('STALE');
  if (!validId(payload.collectorId) || !record(obs.review) || obs.review.decision !== 'ACCEPT' || obs.review.evidenceSha256 !== obs.evidenceSha256 || obs.review.reviewerId !== kpi.reviewerId || obs.review.reviewerId === payload.collectorId) return result('REVIEW_REQUIRED');
  if (!Number.isSafeInteger(payload.sampleSize) || payload.sampleSize < 0) return result('INVALID_MEASUREMENT');
  if (payload.sampleSize < kpi.minSampleSize) return result('INSUFFICIENT_SAMPLE');
  let actual;
  if (kpi.method === 'value') {
    actual = payload.value;
  } else if (kpi.method === 'difference') {
    if (!finite(payload.before) || !finite(payload.after)) return result('INVALID_MEASUREMENT');
    actual = payload.before - payload.after;
  } else {
    if (!Number.isSafeInteger(payload.numerator) || !Number.isSafeInteger(payload.denominator) || payload.numerator < 0 || payload.denominator < 0 || payload.numerator > payload.denominator) return result('INVALID_MEASUREMENT');
    if (payload.denominator === 0) return result('NO_DENOMINATOR');
    if (payload.sampleSize !== payload.denominator) return result('SAMPLE_DENOMINATOR_MISMATCH');
    actual = 100 * (payload.numerator / payload.denominator);
  }
  if (!finite(actual)) return result('INVALID_MEASUREMENT');
  const targetMet = kpi.direction === 'increase' ? actual >= kpi.target : actual <= kpi.target;
  let progressPercent = null;
  if (kpi.baseline !== null) {
    const distance = kpi.target - kpi.baseline;
    if (!finite(distance)) return result('INVALID_MEASUREMENT');
    if (distance === 0) progressPercent = targetMet ? 100 : 0;
    else {
      const progress = (actual - kpi.baseline) / distance;
      if (!finite(progress)) return result('INVALID_MEASUREMENT');
      progressPercent = rounded(100 * Math.min(1, Math.max(0, progress)));
    }
  }
  return result(targetMet ? 'TARGET_MET' : (window.now > date(goal.dueAt) ? 'OVERDUE' : 'BELOW_TARGET'), {
    actual, sampleSize: payload.sampleSize, progressPercent, targetMet,
    evidenceSha256: obs.evidenceSha256,
    evidenceAssurance: 'LOCAL_FILE_HASH_BOUND_REVIEW_DECLARED_NOT_AUTHENTICATED'
  });
}

function evaluatePortfolio(portfolio, context) {
  validatePortfolio(portfolio);
  check(record(context), 'CONTEXT_REQUIRED');
  const window = {
    periodStart: context.periodStart, periodEnd: context.periodEnd,
    now: date(context.asOf), start: date(context.periodStart), end: date(context.periodEnd)
  };
  check(window.start < window.end && window.end <= window.now, 'INVALID_REPORT_WINDOW');
  unique(context.observations, 'INVALID_OBSERVATIONS');
  check(context.evidenceBlobs instanceof Map, 'EVIDENCE_MAP_REQUIRED');
  context.observations.forEach(obs => {
    const rel = portfolio.relationships.find(item => item.id === obs.relationshipId && item.tenantId === obs.tenantId);
    check(rel && rel.kpis.some(kpi => kpi.id === obs.kpiId), 'OBSERVATION_SCOPE_UNKNOWN');
    check(typeof obs.evidenceSha256 === 'string' && SHA.test(obs.evidenceSha256), 'INVALID_EVIDENCE_SHA256');
  });
  const relationships = portfolio.relationships.map(rel => {
    const metrics = rel.kpis.map(kpi => evaluateMetric(rel, kpi, context.observations, context.evidenceBlobs, window));
    const measured = metrics.filter(metric => metric.actual !== null);
    const allMeasured = measured.length === metrics.length;
    const allBaselined = metrics.every(metric => metric.progressPercent !== null);
    const weight = metrics.reduce((sum, metric) => sum + metric.weight, 0);
    const criticalHolds = metrics.filter(metric => metric.critical && metric.targetMet !== true).map(metric => metric.id);
    const actions = metrics.filter(metric => metric.targetMet !== true).map(metric => ({
      kpiId: metric.id, ownerId: metric.ownerId, dueAt: metric.dueAt,
      priority: metric.critical ? 'HIGH' : 'NORMAL',
      recommendation: metric.actual === null ? 'COLLECT_OR_REVIEW_EVIDENCE' : 'REVIEW_CAUSE_AND_AGREE_CORRECTIVE_ACTION',
      reason: metric.status, execution: 'DRAFT_REQUIRES_HUMAN_REVIEW'
    }));
    return {
      id: rel.id, tenantId: rel.tenantId, type: rel.type, displayName: rel.displayName,
      vision: rel.vision, ownerId: rel.ownerId, declaredStage: rel.stage,
      relationshipExistenceVerified: false,
      goals: rel.goals.map(goal => ({ id: goal.id, description: goal.description, ownerId: goal.ownerId, startsAt: goal.startsAt, dueAt: goal.dueAt })),
      metrics, actions, criticalHolds,
      strategyAndOperations: evaluateStrategy(rel, metrics, context.asOf),
      measuredCoveragePercent: rounded(100 * measured.length / metrics.length),
      targetAchievementPercent: allMeasured ? rounded(100 * measured.filter(metric => metric.targetMet).length / metrics.length) : null,
      weightedProgressPercent: allMeasured && allBaselined ? rounded(metrics.reduce((sum, metric) => sum + metric.progressPercent * metric.weight, 0) / weight) : null,
      recommendation: ['SUSPENDED', 'CLOSED'].includes(rel.stage) ? 'DO_NOT_RESUME_WITHOUT_REVIEW' : (criticalHolds.length || !allMeasured ? 'HOLD_FOR_EVIDENCE_OR_REMEDIATION' : 'REVIEW_RESULTS_WITH_RELATIONSHIP_OWNER'),
      publicationAllowed: false, brandUseAuthorized: false, deliveryAllowed: false
    };
  });
  const report = {
    system: 'SHEIKHA_SHARED_GOALS_EVALUATION_V1', schemaVersion: '1.0.0',
    classification: 'CONFIDENTIAL_INTERNAL_ANALYTICAL_DRAFT',
    dataMode: portfolio.dataMode,
    asOf: context.asOf, periodStart: context.periodStart, periodEnd: context.periodEnd,
    relationships,
    boundaries: {
      automaticDispatchEnabled: false, externalMessagesSent: 0,
      contractApprovalGranted: false, productionReadinessCertified: false,
      partnerIdentityAuthenticated: false, trainingConsentGranted: false,
      crossRelationshipAggregationEnabled: false, religiousMeritScoringEnabled: false
    }
  };
  return { ...report, reportSha256: sha256(JSON.stringify(report)) };
}

function evaluateStrategy(rel, metrics, asOf) {
  if (rel.strategy === undefined) return null;
  const strategy = rel.strategy;
  check(record(strategy) && text(strategy.mission), 'MISSION_REQUIRED');
  const valueIds = unique(strategy.values, 'INVALID_VALUES');
  const objectiveIds = unique(strategy.objectives, 'INVALID_OBJECTIVES');
  unique(strategy.projects, 'INVALID_PROJECTS');
  unique(strategy.operations, 'INVALID_OPERATIONS');
  check(valueIds.size > 0 && objectiveIds.size > 0, 'VALUES_AND_OBJECTIVES_REQUIRED');
  const kpiIds = new Set(metrics.map(metric => metric.id));
  const linkedIds = (ids, allowed, code) => {
    check(Array.isArray(ids) && ids.length > 0 && ids.length <= 1000 && new Set(ids).size === ids.length && ids.every(id => allowed.has(id)), code);
  };
  const values = strategy.values.map(value => {
    check(text(value.description), 'VALUE_DESCRIPTION_REQUIRED');
    linkedIds(value.kpiIds, kpiIds, 'VALUE_KPI_BINDING_REQUIRED');
    return { id: value.id, description: value.description, kpiIds: [...value.kpiIds], scope: 'OBSERVABLE_WORK_PRACTICES_NOT_RELIGIOUS_MERIT' };
  });
  const objectives = strategy.objectives.map(objective => {
    check(text(objective.description) && validId(objective.ownerId) && ['SHORT', 'MEDIUM', 'LONG'].includes(objective.horizon), 'INVALID_OBJECTIVE');
    linkedIds(objective.goalIds, new Set(rel.goals.map(goal => goal.id)), 'OBJECTIVE_GOAL_BINDING_REQUIRED');
    const linked = metrics.filter(metric => objective.goalIds.includes(metric.goalId));
    return {
      id: objective.id, description: objective.description, horizon: objective.horizon,
      ownerId: objective.ownerId, goalIds: [...objective.goalIds],
      allTargetsMet: linked.every(metric => metric.targetMet === true),
      incompleteKpiIds: linked.filter(metric => metric.targetMet !== true).map(metric => metric.id)
    };
  });
  check(rel.goals.every(goal => objectives.some(objective => objective.goalIds.includes(goal.id))), 'STRATEGY_ORPHAN_GOAL');
  const capacities = new Map();
  check(Array.isArray(strategy.capacity) && strategy.capacity.length <= 1000, 'INVALID_CAPACITY');
  strategy.capacity.forEach(entry => {
    check(record(entry) && validId(entry.ownerId) && !capacities.has(entry.ownerId) && finite(entry.availableHours) && entry.availableHours >= 0, 'INVALID_CAPACITY');
    capacities.set(entry.ownerId, entry.availableHours);
  });
  const loads = new Map();
  let totalTasks = 0;
  const projects = strategy.projects.map(project => {
    check(text(project.title) && validId(project.ownerId) && objectiveIds.has(project.objectiveId), 'PROJECT_OBJECTIVE_BINDING_REQUIRED');
    check(date(project.startsAt) < date(project.dueAt), 'INVALID_PROJECT_WINDOW');
    const money = value => finite(value) && value >= 0 && value <= Number.MAX_SAFE_INTEGER / 100;
    check(money(project.budgetSar) && (project.actualCostSar === null || money(project.actualCostSar)), 'INVALID_PROJECT_BUDGET');
    const taskIds = unique(project.tasks, 'INVALID_TASKS');
    totalTasks += taskIds.size;
    check(taskIds.size > 0 && totalTasks <= 1000, 'INVALID_TASK_COUNT');
    const allowedKpis = new Set(metrics.filter(metric => strategy.objectives.find(objective => objective.id === project.objectiveId).goalIds.includes(metric.goalId)).map(metric => metric.id));
    project.tasks.forEach(task => {
      check(text(task.title) && validId(task.ownerId) && finite(task.remainingHours) && task.remainingHours >= 0 && task.remainingHours <= 1000000, 'INVALID_TASK');
      check(['TODO', 'IN_PROGRESS', 'DONE_DECLARED', 'BLOCKED'].includes(task.declaredStatus), 'INVALID_TASK_STATUS');
      check(Array.isArray(task.dependencies) && new Set(task.dependencies).size === task.dependencies.length && task.dependencies.every(id => taskIds.has(id) && id !== task.id), 'INVALID_TASK_DEPENDENCY');
      linkedIds(task.acceptanceKpiIds, allowedKpis, 'TASK_ACCEPTANCE_BINDING_REQUIRED');
      if (task.declaredStatus !== 'DONE_DECLARED') check(task.remainingHours > 0, 'REMAINING_EFFORT_REQUIRED');
    });
    const visiting = new Set();
    const ordered = [];
    const visited = new Set();
    function visit(id) {
      check(!visiting.has(id), 'TASK_DEPENDENCY_CYCLE');
      if (visited.has(id)) return;
      visiting.add(id);
      project.tasks.find(task => task.id === id).dependencies.forEach(visit);
      visiting.delete(id); visited.add(id); ordered.push(id);
    }
    project.tasks.forEach(task => visit(task.id));
    const evaluated = new Map();
    ordered.forEach(id => {
      const task = project.tasks.find(item => item.id === id);
      const depsComplete = task.dependencies.every(dep => evaluated.get(dep).status === 'DECLARED_DONE_WITH_LOCAL_EVIDENCE');
      const supported = date(asOf) >= date(project.startsAt) && task.declaredStatus === 'DONE_DECLARED' && depsComplete && task.acceptanceKpiIds.every(kpiId => metrics.find(metric => metric.id === kpiId).targetMet === true);
      check(!supported || task.remainingHours === 0, 'COMPLETED_TASK_HAS_REMAINING_EFFORT');
      const status = supported ? 'DECLARED_DONE_WITH_LOCAL_EVIDENCE' : (task.declaredStatus === 'DONE_DECLARED' ? 'COMPLETION_REVIEW_REQUIRED' : (!depsComplete ? 'WAITING_FOR_DEPENDENCIES' : (task.declaredStatus === 'BLOCKED' ? 'BLOCKED' : (date(asOf) < date(project.startsAt) ? 'NOT_STARTED' : 'READY_FOR_OWNER_REVIEW'))));
      if (!supported) {
        const prior = loads.get(task.ownerId) || { hours: 0, unknown: false };
        loads.set(task.ownerId, { hours: prior.hours + task.remainingHours, unknown: prior.unknown || task.remainingHours === 0 });
      }
      evaluated.set(id, { id, title: task.title, ownerId: task.ownerId, dependencies: [...task.dependencies], acceptanceKpiIds: [...task.acceptanceKpiIds], remainingHours: supported ? 0 : (task.remainingHours || null), status, executeAllowed: false });
    });
    const tasks = [...evaluated.values()];
    const complete = tasks.filter(task => task.status === 'DECLARED_DONE_WITH_LOCAL_EVIDENCE').length;
    return {
      id: project.id, title: project.title, objectiveId: project.objectiveId, ownerId: project.ownerId,
      startsAt: project.startsAt, dueAt: project.dueAt,
      budgetSar: project.budgetSar, actualCostSar: project.actualCostSar,
      costOverBudgetSar: project.actualCostSar === null ? null : rounded(project.actualCostSar - project.budgetSar),
      budgetExceeded: project.actualCostSar === null ? null : project.actualCostSar > project.budgetSar,
      overdue: date(asOf) > date(project.dueAt) && complete < tasks.length,
      taskCompletionPercent: rounded(100 * complete / tasks.length),
      completionMeaning: 'DECLARED_TASKS_WITH_LOCAL_KPI_EVIDENCE_NOT_SIGNED_DELIVERY_ACCEPTANCE',
      tasks, spendingAuthorized: false, productionReleaseAllowed: false
    };
  });
  const operations = strategy.operations.map(operation => {
    check(text(operation.title) && validId(operation.ownerId) && text(operation.runbookReference), 'INVALID_OPERATION');
    linkedIds(operation.kpiIds, kpiIds, 'OPERATION_KPI_BINDING_REQUIRED');
    date(operation.nextReviewAt);
    const affected = metrics.filter(metric => operation.kpiIds.includes(metric.id) && metric.targetMet !== true);
    return { id: operation.id, title: operation.title, ownerId: operation.ownerId, runbookReference: operation.runbookReference,
      nextReviewAt: operation.nextReviewAt, reviewDue: date(asOf) >= date(operation.nextReviewAt),
      affectedKpiIds: affected.map(metric => metric.id), recommendation: affected.length ? 'REVIEW_RUNBOOK_AND_EVIDENCE' : 'CONTINUE_MEASUREMENT',
      runbookExecuted: false };
  });
  return { mission: strategy.mission, vision: rel.vision, values, objectives, projects, operations,
    capacityWindowMeaning: 'ALL_REMAINING_PROJECT_EFFORT_FOR_THIS_RELATIONSHIP_NOT_GLOBAL_STAFF_CAPACITY',
    capacity: [...loads].map(([ownerId, load]) => ({ ownerId, knownRemainingHours: load.hours, remainingHours: load.unknown ? null : load.hours,
      availableHours: capacities.get(ownerId) ?? null,
      overloaded: capacities.has(ownerId) ? (load.hours > capacities.get(ownerId) ? true : (load.unknown ? null : false)) : null })),
    autonomousExecutionEnabled: false };
}

function recipientDraft(report, relationshipId, tenantId) {
  check(record(report) && Array.isArray(report.relationships), 'REPORT_REQUIRED');
  const { reportSha256, ...body } = report;
  check(sha256(JSON.stringify(body)) === reportSha256, 'REPORT_HASH_MISMATCH');
  const relationship = report.relationships.find(item => item.id === relationshipId && item.tenantId === tenantId);
  check(relationship, 'RECIPIENT_SCOPE_DENIED');
  // This is local projection, not authentication or permission to disclose.
  const draft = {
    classification: 'CONFIDENTIAL_RECIPIENT_REVIEW_DRAFT',
    dataMode: report.dataMode,
    relationshipId, tenantId, periodStart: report.periodStart, periodEnd: report.periodEnd,
    asOf: report.asOf, relationship: JSON.parse(JSON.stringify(relationship)),
    delivery: { status: 'NOT_SENT', recipientsVerified: false, writtenDisclosureApprovalRequired: true, automaticDispatchEnabled: false }
  };
  return { ...draft, draftSha256: sha256(JSON.stringify(draft)) };
}

function renderRecipientMarkdown(draft) {
  const { draftSha256, ...body } = draft;
  check(sha256(JSON.stringify(body)) === draftSha256, 'DRAFT_HASH_MISMATCH');
  const escape = value => String(value ?? 'غير مقاس').replace(/[&<>]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch])).replace(/[\\`*_[\]{}()!|#]/g, '\\$&').replace(/[\r\n]+/g, ' ');
  const rel = draft.relationship;
  const lines = [
    '# تقرير علاقة شيخة', '',
    'سري: مسودة مراجعة، لم ترسل ولم تعتمد تعاقديا.',
    `نوع البيانات: ${escape(draft.dataMode)}. لا تمثل بيانات SYNTHETIC نتائج فعلية.`,
    `العلاقة: ${escape(rel.displayName)}. المعرف: ${escape(rel.id)}.`,
    `الفترة: ${escape(draft.periodStart)} إلى ${escape(draft.periodEnd)}.`,
    `الرؤية: ${escape(rel.vision)}`, '',
    `تغطية القياس: ${rel.measuredCoveragePercent}%. التقدم الموزون: ${escape(rel.weightedProgressPercent)}.`,
    'البصمة تربط ملف الدليل، ولا تصادق على هوية المراجع أو صدق المصدر. لا توجد شهادة امتثال أو ترخيص نشر.', '',
    '| المؤشر | الفعلي | الهدف | الوحدة | التقدم % | حالة الدليل والنتيجة |',
    '|---|---:|---:|---|---:|---|',
    ...rel.metrics.map(metric => `| ${escape(metric.label)} | ${escape(metric.actual)} | ${metric.target} | ${escape(metric.unit)} | ${escape(metric.progressPercent)} | ${escape(metric.status)} |`),
    '', '## الإجراءات المقترحة',
    ...rel.actions.map(action => `- ${escape(action.kpiId)}: ${escape(action.recommendation)}؛ السبب ${escape(action.reason)}؛ المسؤول ${escape(action.ownerId)}؛ موعد الهدف ${escape(action.dueAt)}. التنفيذ يحتاج مراجعة.`)
  ];
  if (rel.strategyAndOperations) {
    const strategy = rel.strategyAndOperations;
    lines.push('', '## الرسالة والمشاريع والتشغيل', escape(strategy.mission));
    strategy.objectives.forEach(obj => lines.push(`- الهدف ${escape(obj.description)}؛ الأفق ${obj.horizon}؛ تحقق جميع مستهدفاته محليا: ${obj.allTargetsMet ? 'نعم، مع بقاء مراجعة الدليل والهوية' : 'لم يثبت'}.`));
    strategy.projects.forEach(project => {
      lines.push('', `### ${escape(project.title)}`, `الميزانية ${project.budgetSar} SAR؛ التكلفة الفعلية ${escape(project.actualCostSar)}؛ تقدم مهام بتصريح ودليل محلي ${project.taskCompletionPercent}%. ليس قبول تسليم موقعا.`);
      project.tasks.forEach(task => lines.push(`- ${escape(task.title)}؛ ${escape(task.status)}؛ المسؤول ${escape(task.ownerId)}؛ الجهد المتبقي ${escape(task.remainingHours)} ساعة.`));
    });
    strategy.capacity.forEach(load => lines.push(`- عبء ${escape(load.ownerId)} لهذه العلاقة: ${escape(load.remainingHours)} ساعة متبقية، المتاح ${escape(load.availableHours)}؛ تجاوز القدرة ${load.overloaded === null ? 'غير معلوم' : (load.overloaded ? 'نعم' : 'لا')}. لا يغطي الالتزامات لدى عملاء آخرين.`));
    strategy.operations.forEach(operation => lines.push(`- تشغيل ${escape(operation.title)}؛ موعد المراجعة ${escape(operation.nextReviewAt)}؛ مستحقة ${operation.reviewDue ? 'نعم' : 'لا'}؛ لم ينفذ دليل العمل آليا.`));
  }
  lines.push('', '## موافقات مطلوبة', '- تحقق المصدر وهوية المراجع.', '- مراجعة الخصوصية والغرض والمستلمين والمحتوى.', '- موافقة كتابية قبل الإفصاح أو استعمال العلامة أو تنفيذ إجراء عالي الأثر.', '', `بصمة مسودة JSON: ${draftSha256}`, '');
  return lines.join('\n');
}

module.exports = { validatePortfolio, evaluatePortfolio, recipientDraft, renderRecipientMarkdown, sha256 };
