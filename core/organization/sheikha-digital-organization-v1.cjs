'use strict';

// A read-only design catalog. Importing this module starts no worker or provider.
const { createHash } = require('node:crypto');
const DEFAULT_CATALOG = require('../../config/organization/sheikha-digital-organization-v1.json');
const DAY_MS = 86400000;
const ID = /^[a-z][a-z0-9-]{0,79}$/;
const METRIC = /^[a-z][a-z0-9_]{0,79}$/;
const LOCAL_ACTIONS = Object.freeze(['INSPECT_CATALOG', 'PREPARE_REPORT', 'PRIORITIZE_WORK', 'PROPOSE_JOB_REVIEW']);
const FORBIDDEN_ACTIONS = Object.freeze(['DNS', 'IAM', 'DEPLOY', 'RESTART', 'PAYMENT', 'CONTRACT', 'MODEL', 'DEVICE', 'CHANGE_DNS', 'CHANGE_IAM', 'CHANGE_PRODUCTION', 'PAY_FUNDS', 'SIGN_CONTRACT', 'HIRE_PERSON', 'MODEL_TRAINING', 'MODEL_DOWNLOAD', 'PHYSICAL_CONTROL']);
const BOUNDARIES = Object.freeze({ externalExecutionAllowed: false, productionActivated: false, productionHold: true, employeesHired: 0, humanStaffVerified: 0, persistentWorkersStarted: 0, providerCalls: 0, commandsExecuted: 0, filesWritten: 0, paymentsExecuted: 0, contractsSigned: 0, devicesControlled: 0, authoritiesChanged: false });
function check(value, code) { if (!value) throw new Error(code); }
function isText(value) { return typeof value === 'string' && value.trim().length >= 3 && value.length <= 2000; }
function textList(values, code) { check(Array.isArray(values) && values.length >= 1 && values.length <= 20 && values.every(isText), code); }
function freeze(value) { if (value && typeof value === 'object' && !Object.isFrozen(value)) { Object.values(value).forEach(freeze); Object.freeze(value); } return value; }
function timestamp(value) {
  check(typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value), 'UTC_TIMESTAMP_REQUIRED');
  const result = Date.parse(value);
  check(Number.isFinite(result) && new Date(result).toISOString() === value, 'INVALID_TIMESTAMP');
  return result;
}
function validate(catalog) {
  check(catalog && catalog.schema === 'SHEIKHA_DIGITAL_ORGANIZATION_V1' && catalog.catalogVersion === '1.0.0' && catalog.mode === 'DIGITAL_ROLE_DESIGN', 'INVALID_ORGANIZATION_CATALOG');
  timestamp(catalog.effectiveAt);
  check(isText(catalog.organizationNameAr), 'ORGANIZATION_NAME_REQUIRED');
  check(catalog.governance && catalog.governance.noAutomatedFatwa === true && catalog.governance.noCertificationClaim === true && catalog.governance.separationOfDuties === true, 'GOVERNANCE_BOUNDARIES_REQUIRED');
  textList(catalog.governance.values, 'GOVERNANCE_VALUES_REQUIRED');
  check(catalog.reviewPolicy && catalog.reviewPolicy.cadenceDays === 30 && catalog.reviewPolicy.minimumSampleSize === 10 && catalog.reviewPolicy.maxObservationAgeDays === 30, 'REVIEW_POLICY_CANNOT_BE_RELAXED');
  check(Array.isArray(catalog.departments) && catalog.departments.length >= 1 && catalog.departments.length <= 30, 'INVALID_DEPARTMENTS');
  check(Array.isArray(catalog.roles) && catalog.roles.length >= 2 && catalog.roles.length <= 100, 'INVALID_ROLES');
  const departments = new Map(), roles = new Map();
  for (const department of catalog.departments) {
    check(department && ID.test(department.id) && !departments.has(department.id), 'DUPLICATE_OR_INVALID_DEPARTMENT');
    check(isText(department.nameAr) && isText(department.purposeAr), 'DEPARTMENT_DESCRIPTION_REQUIRED');
    departments.set(department.id, department);
  }
  for (const role of catalog.roles) {
    check(role && ID.test(role.id) && !roles.has(role.id), 'DUPLICATE_OR_INVALID_ROLE');
    check(isText(role.nameAr) && isText(role.jobDescriptionAr), 'JOB_DESCRIPTION_REQUIRED');
    check(departments.has(role.departmentId), 'UNKNOWN_ROLE_DEPARTMENT');
    check(role.kind === 'DIGITAL_ROLE_DESIGN' && role.assignedHuman === null, 'HUMAN_STAFF_CLAIM_REFUSED');
    check(['OWNER', 'EXECUTIVE', 'MANAGER', 'SPECIALIST', 'PRODUCTION_AGENT'].includes(role.roleType), 'INVALID_ROLE_TYPE');
    check(role.descriptionVersion === '1.0.0' && role.reviewCadenceDays === 30, 'INVALID_DESCRIPTION_VERSION_OR_CADENCE');
    textList(role.responsibilities, 'ROLE_RESPONSIBILITIES_REQUIRED');
    textList(role.deliverables, 'ROLE_DELIVERABLES_REQUIRED');
    textList(role.limits, 'ROLE_LIMITS_REQUIRED');
    check(Array.isArray(role.kpis) && role.kpis.length >= 1 && role.kpis.length <= 10, 'ROLE_KPIS_REQUIRED');
    const metrics = new Set();
    for (const kpi of role.kpis) {
      check(kpi && METRIC.test(kpi.code) && !metrics.has(kpi.code) && isText(kpi.labelAr) && ['count', 'percent', 'hours', 'days'].includes(kpi.unit) && ['MINIMIZE', 'MAXIMIZE'].includes(kpi.direction) && kpi.actual === null && kpi.target === null, 'INVALID_KPI_OR_FABRICATED_MEASUREMENT');
      metrics.add(kpi.code);
    }
    roles.set(role.id, role);
  }
  const owner = roles.get('owner'), executive = roles.get('executive-director'), governance = roles.get('governance-director');
  check(owner && owner.roleType === 'OWNER' && owner.reportingTo === null, 'OWNER_ACCOUNTABILITY_ROOT_REQUIRED');
  check(executive && executive.roleType === 'EXECUTIVE' && executive.reportingTo === owner.id, 'EXECUTIVE_ACCOUNTABILITY_REQUIRED');
  check(governance && governance.roleType === 'MANAGER' && governance.reportingTo === owner.id && governance.departmentId !== executive.departmentId, 'INDEPENDENT_GOVERNANCE_REQUIRED');
  const completed = new Set(), visiting = new Set();
  function visit(role) {
    check(!visiting.has(role.id), 'ROLE_HIERARCHY_CYCLE');
    if (completed.has(role.id)) return;
    visiting.add(role.id);
    if (role.id !== owner.id) {
      check(typeof role.reportingTo === 'string' && roles.has(role.reportingTo), 'UNKNOWN_REPORTING_ROLE');
      visit(roles.get(role.reportingTo));
    }
    visiting.delete(role.id); completed.add(role.id);
  }
  for (const role of roles.values()) visit(role);
  for (const department of departments.values()) {
    const manager = roles.get(department.managerRoleId), reviewer = roles.get(department.independentReviewRoleId);
    check(manager && manager.departmentId === department.id && ['MANAGER', 'EXECUTIVE'].includes(manager.roleType), 'INVALID_DEPARTMENT_MANAGER');
    check(reviewer && reviewer.id !== manager.id && reviewer.departmentId !== department.id, 'INDEPENDENT_DEPARTMENT_REVIEW_REQUIRED');
    for (const role of roles.values()) {
      if (role.departmentId === department.id && !['OWNER', 'EXECUTIVE', 'MANAGER'].includes(role.roleType)) check(role.reportingTo === manager.id, 'ROLE_MANAGER_REPORTING_REQUIRED');
    }
  }
  return catalog;
}
function inspectDigitalOrganization(catalog = DEFAULT_CATALOG) {
  validate(catalog);
  const departments = catalog.departments.map(({ id, nameAr, purposeAr, managerRoleId, independentReviewRoleId }) => ({ id, nameAr, purposeAr, managerRoleId, independentReviewRoleId }));
  const roles = catalog.roles.map(role => ({ id: role.id, nameAr: role.nameAr, departmentId: role.departmentId, reportingTo: role.reportingTo, roleType: role.roleType, kind: 'DIGITAL_ROLE_DESIGN', assignedHuman: null, jobDescriptionAr: role.jobDescriptionAr, responsibilities: [...role.responsibilities], deliverables: [...role.deliverables], kpis: role.kpis.map(kpi => ({ code: kpi.code, labelAr: kpi.labelAr, unit: kpi.unit, direction: kpi.direction, target: null, actual: null })), limits: [...role.limits], descriptionVersion: role.descriptionVersion, reviewCadenceDays: 30, executionAllowed: false, workerStarted: false, operationalReadinessVerified: false }));
  const content = { catalogVersion: catalog.catalogVersion, effectiveAt: catalog.effectiveAt, departments, roles };
  return freeze({ system: 'SHEIKHA_DIGITAL_ORGANIZATION_V1', status: 'LOCAL_DESIGN_VALIDATED', mode: 'DIGITAL_ROLE_DESIGN', organizationNameAr: catalog.organizationNameAr, ...content, departmentCount: departments.length, roleCount: roles.length, hierarchy: roles.map(role => ({ roleId: role.id, reportingTo: role.reportingTo, directReportIds: roles.filter(child => child.reportingTo === role.id).map(child => child.id) })), governance: { referenceModel: 'QURAN_AND_SUNNAH_VALUES_WITH_QUALIFIED_HUMAN_REVIEW', values: [...catalog.governance.values], noAutomatedFatwa: true, noCertificationClaim: true, separationOfDuties: true }, reviewPolicy: { cadenceDays: 30, minimumSampleSize: 10, maxObservationAgeDays: 30 }, catalogSha256: createHash('sha256').update(JSON.stringify(content)).digest('hex'), boundaries: { ...BOUNDARIES } });
}
function getDigitalOrganizationStatus() { return inspectDigitalOrganization(); }
function evaluateRoleAction(roleId, action, claims = {}) {
  const catalog = getDigitalOrganizationStatus();
  const known = typeof roleId === 'string' && catalog.roles.some(role => role.id === roleId);
  const planningAllowed = known && LOCAL_ACTIONS.includes(action);
  // Claimed approvals and authority fields never grant runtime capabilities.
  void claims;
  return freeze({ roleId: known ? roleId : null, action: typeof action === 'string' && /^[A-Z_]{1,80}$/.test(action) ? action : null, planningAllowed, executionAllowed: false, externalExecutionAllowed: false, decision: planningAllowed ? 'LOCAL_PLANNING_ONLY' : 'DENY_EXECUTION', reason: known ? (planningAllowed ? 'DESIGN_CATALOG_ONLY' : 'ACTION_NOT_EXECUTABLE_BY_ORGANIZATION_CATALOG') : 'UNKNOWN_ROLE', approvalVerified: false, authoritiesChanged: false });
}
function planJobDescriptionReview({ observations = [], asOf = DEFAULT_CATALOG.effectiveAt } = {}) {
  const catalog = getDigitalOrganizationStatus(), now = timestamp(asOf);
  check(Array.isArray(observations) && observations.length <= 500, 'INVALID_REVIEW_OBSERVATIONS');
  const byRole = new Map(catalog.roles.map(role => [role.id, []])), unique = new Set();
  for (const observation of observations) {
    check(observation && typeof observation === 'object' && !Array.isArray(observation), 'INVALID_REVIEW_OBSERVATION');
    const role = catalog.roles.find(item => item.id === observation.roleId);
    check(role, 'UNKNOWN_REVIEW_ROLE');
    const kpi = role.kpis.find(item => item.code === observation.metricCode);
    check(kpi, 'UNKNOWN_ROLE_KPI');
    const key = `${role.id}:${kpi.code}`;
    check(!unique.has(key), 'DUPLICATE_ROLE_KPI_OBSERVATION'); unique.add(key);
    check(typeof observation.baseline === 'number' && Number.isFinite(observation.baseline) && observation.baseline >= 0 && typeof observation.current === 'number' && Number.isFinite(observation.current) && observation.current >= 0 && Number.isSafeInteger(observation.sampleSize) && observation.sampleSize >= 0 && observation.sampleSize <= 10000000, 'INVALID_PERFORMANCE_VALUES');
    check(kpi.unit !== 'percent' || (observation.baseline <= 100 && observation.current <= 100), 'PERCENT_OUT_OF_BOUNDS');
    const reasons = [];
    if (observation.sampleSize < catalog.reviewPolicy.minimumSampleSize) reasons.push('INSUFFICIENT_SAMPLE');
    const sourceValid = typeof observation.sourceRef === 'string' && /^(?:evidence|report|sha256):[A-Za-z0-9][A-Za-z0-9_.:/-]{0,179}$/.test(observation.sourceRef);
    if (!sourceValid) reasons.push('SOURCE_REFERENCE_REQUIRED');
    let observedTime = null;
    if (observation.observedAt === undefined) reasons.push('OBSERVATION_TIME_REQUIRED');
    else { observedTime = timestamp(observation.observedAt); if (observedTime > now) reasons.push('FUTURE_OBSERVATION'); else if (now - observedTime > 30 * DAY_MS) reasons.push('STALE_OBSERVATION'); }
    const delta = observation.current - observation.baseline;
    check(Number.isFinite(delta), 'PERFORMANCE_DELTA_OVERFLOW');
    const comparison = delta === 0 ? 'UNCHANGED' : ((kpi.direction === 'MAXIMIZE' && delta > 0) || (kpi.direction === 'MINIMIZE' && delta < 0)) ? 'IMPROVED' : 'REGRESSED';
    byRole.get(role.id).push({ metricCode: kpi.code, unit: kpi.unit, direction: kpi.direction, baseline: observation.baseline, current: observation.current, sampleSize: observation.sampleSize, delta, comparison, status: reasons.length ? 'EVIDENCE_REQUIRED' : 'PROPOSED_REVIEW', reasons, sourceRef: sourceValid ? observation.sourceRef : null, observedAt: observedTime === null ? null : observation.observedAt, sourceAuthenticated: false, improvementVerified: false });
  }
  const nextReviewAt = new Date(now + 30 * DAY_MS).toISOString();
  const reviews = catalog.roles.map(role => {
    const metrics = byRole.get(role.id), eligible = metrics.some(metric => metric.status === 'PROPOSED_REVIEW');
    const regression = metrics.some(metric => metric.status === 'PROPOSED_REVIEW' && metric.comparison === 'REGRESSED');
    return { roleId: role.id, roleNameAr: role.nameAr, currentDescriptionVersion: role.descriptionVersion, reviewStatus: eligible ? 'PROPOSED_REVIEW' : 'EVIDENCE_REQUIRED', status: eligible ? 'PROPOSED_REVIEW' : 'EVIDENCE_REQUIRED', reviewReason: regression ? 'REGRESSION_REQUIRES_REVIEW' : eligible ? 'OBSERVED_METRIC_COMPARISON_REQUIRES_REVIEW' : 'MEASUREMENT_EVIDENCE_REQUIRED', recommendationAr: regression ? 'راجع عبء الدور ومدخلاته وتسليماته ومعيار القبول قبل اقتراح تعديل الوصف.' : eligible ? 'قارن المسؤوليات والتسليمات بالملاحظة واقترح تعديلًا محدودًا للمراجعة دون توسيع الصلاحيات.' : 'اجمع خط أساس وقياسًا حاليًا وعينة ومرجع دليل قبل اقتراح تعديل الوصف.', metrics, descriptionChanged: false, authoritiesChanged: false, proposedDescription: null, improvementVerified: false, nextReviewAt };
  });
  return freeze({ system: 'SHEIKHA_JOB_DESCRIPTION_CONTINUOUS_REVIEW_V1', status: reviews.some(item => item.status === 'PROPOSED_REVIEW') ? 'PROPOSED_REVIEW' : 'EVIDENCE_REQUIRED', asOf, nextReviewAt, reviewCadenceDays: 30, catalogVersion: catalog.catalogVersion, catalogSha256: catalog.catalogSha256, observationCount: observations.length, reviews, descriptionsChanged: 0, authoritiesChanged: false, automaticPromotionAllowed: false, evidenceLimitations: 'CALLER_SUPPLIED_OBSERVATIONS_NOT_AUTHENTICATED_NO_CAUSAL_OR_STATISTICAL_CLAIM', boundaries: { ...BOUNDARIES } });
}
module.exports = Object.freeze({ inspectDigitalOrganization, getDigitalOrganizationStatus, status: getDigitalOrganizationStatus, evaluateRoleAction, planJobDescriptionReview, FORBIDDEN_ACTIONS, LOCAL_ACTIONS });
