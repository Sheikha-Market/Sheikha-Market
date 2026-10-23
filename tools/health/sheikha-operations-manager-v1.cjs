#!/usr/bin/env node
'use strict';

// Local metadata pipeline only. The worker delegates exclusively to the bounded supervisor.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const supervisor = require('./sheikha-sovereign-supervisor-v1.cjs');
const SCHEMA = 'SHEIKHA_OPERATIONS_MANAGER_V1';
const HEX = /^[a-f0-9]{64}$/;
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const check = (condition, code) => { if (!condition) throw Error(code); };
const ROOT_KEYS = ['schema', 'generatedAt', 'generatedAtRiyadh', 'classification', 'productionReady',
  'readinessReasons', 'snapshot', 'assets', 'research', 'boundaries', 'changeFingerprint', 'reportDigest'];
const ASSET_KEYS = ['assetId', 'source', 'state', 'verified', 'reportedVerified', 'reportedState',
  'evidenceScope', 'observedAt', 'stale', 'summaryCode', 'impactCode', 'actionCode', 'commit', 'hash', 'classification'];
const CLASSIFICATIONS = ['INTERNAL', 'CONFIDENTIAL', 'RESTRICTED_TRADE_SECRET'];
function utc(value) {
  check(typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) &&
    Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value, 'OPERATIONS_TIME_DENIED');
}
function raha(report) {
  check(report && typeof report === 'object' && !Array.isArray(report) &&
    Object.keys(report).length === ROOT_KEYS.length && ROOT_KEYS.every(key => Object.hasOwn(report, key)), 'RAHA_REPORT_SHAPE_DENIED');
  utc(report.generatedAt);
  check(report.schema === supervisor.SCHEMA && report.productionReady === false &&
    CLASSIFICATIONS.includes(report.classification), 'RAHA_SOURCE_DENIED');
  const { reportDigest, ...body } = report;
  check(HEX.test(reportDigest) && sha(JSON.stringify(body)) === reportDigest, 'RAHA_DIGEST_DENIED');
  check(HEX.test(report.changeFingerprint), 'RAHA_FINGERPRINT_DENIED');
  const expectedIds = [...supervisor.REPOS.map(name => 'repo:' + name), ...supervisor.ASSET_IDS];
  check(Array.isArray(report.assets) && report.assets.length === expectedIds.length, 'RAHA_ASSET_COUNT_DENIED');
  const seen = new Set();
  for (const asset of report.assets) {
    check(asset && typeof asset === 'object' && !Array.isArray(asset) && ASSET_KEYS.every(key =>
      key === 'reportedState' || Object.hasOwn(asset, key)) && Object.keys(asset).every(key => ASSET_KEYS.includes(key)), 'RAHA_ASSET_SHAPE_DENIED');
    check(expectedIds.includes(asset.assetId) && !seen.has(asset.assetId), 'RAHA_DUPLICATE_OR_UNKNOWN_ASSET');
    seen.add(asset.assetId);
    check(['سليم', 'تحذير', 'حرج'].includes(asset.state) && typeof asset.verified === 'boolean' &&
      typeof asset.stale === 'boolean' && CLASSIFICATIONS.includes(asset.classification), 'RAHA_METADATA_DENIED');
    check(Object.hasOwn(supervisor.SUMMARIES, asset.summaryCode) && Object.hasOwn(supervisor.IMPACTS, asset.impactCode) &&
      Object.hasOwn(supervisor.ACTIONS, asset.actionCode), 'RAHA_ENUM_DENIED');
    check(asset.commit === null || typeof asset.commit === 'string' && /^[a-f0-9]{40}(?:[a-f0-9]{24})?$/.test(asset.commit), 'RAHA_COMMIT_DENIED');
    check(asset.hash === null || typeof asset.hash === 'string' && HEX.test(asset.hash), 'RAHA_HASH_DENIED');
    if (asset.observedAt !== null) utc(asset.observedAt);
    const local = asset.assetId.startsWith('repo:');
    check(local ? asset.source === 'LOCAL_GIT_HEAD' && asset.evidenceScope === 'GIT_HEAD_ONLY_NOT_RUNTIME_OR_SECURITY_READINESS' :
      (supervisor.SOURCES.includes(asset.source) || asset.source === 'NO_CURRENT_EVIDENCE') && asset.verified === false &&
      ['IMPORTED_NOT_RECHECKED', 'UNKNOWN_NOT_CHECKED'].includes(asset.evidenceScope), 'RAHA_SCOPE_DENIED');
    check(!local || asset.verified === Boolean(asset.commit) && asset.state === (asset.commit ? 'سليم' : 'تحذير') &&
      asset.observedAt === report.generatedAt && asset.summaryCode === (asset.commit ? 'LOCAL_HEAD_OBSERVED' : 'LOCAL_HEAD_UNKNOWN'), 'RAHA_LOCAL_FACT_MISMATCH');
    check(local || asset.state === (asset.reportedState === 'حرج' ? 'حرج' : 'تحذير'), 'RAHA_IMPORTED_STATE_MISMATCH');
    check(asset.reportedVerified === null || typeof asset.reportedVerified === 'boolean', 'RAHA_REPORTED_METADATA_DENIED');
    check(asset.reportedState === undefined || asset.reportedState === null || ['سليم', 'تحذير', 'حرج'].includes(asset.reportedState), 'RAHA_REPORTED_STATE_DENIED');
  }
  const boundaries = report.boundaries;
  const forbidden = ['externalNetworkUsed', 'providerWritesExecuted', 'applicationModulesStarted', 'modelsLoaded',
    'trainingExecuted', 'newSpendAuthorized', 'secretsModified', 'physicalActuation', 'universalMetaOrGptControlClaimed', 'sourceSnapshotsModified'];
  check(boundaries && forbidden.every(key => boundaries[key] === false), 'RAHA_BOUNDARY_DENIED');
  const fingerprint = sha(JSON.stringify({ schema: supervisor.SCHEMA,
    snapshot: { status: report.snapshot.status, digest: report.snapshot.digest, stale: report.snapshot.stale },
    assets: report.assets.map(({ observedAt, ...asset }) => asset),
    research: { plans: report.research.plans, governance: report.research.governance } }));
  check(fingerprint === report.changeFingerprint, 'RAHA_FINGERPRINT_MISMATCH');
  return { status: 'METADATA_VERIFIED', assetCount: seen.size, sourceDigest: reportDigest,
    sourceChangeFingerprint: fingerprint, duplicateCount: 0, certification: 'NO_SHARIA_OR_HARDWARE_CERTIFICATION' };
}
function buildOperations(report) {
  const validation = raha(report);
  const organization = require('../../core/organization/sheikha-digital-organization-v1.cjs');
  const catalog = organization.getDigitalOrganizationStatus();
  const jobReview = organization.planJobDescriptionReview({ observations: [], asOf: report.generatedAt });
  const workforce = require('../../core/organization/sheikha-digital-workforce-v1.cjs').planWorkforce();
  const departmentFor = id => id.startsWith('repo:') ? 'projects' :
    /:firewall:/.test(id) ? 'security-data' : /:(prometheus|grafana):/.test(id) ? 'quality-followup' :
    /:ai:/.test(id) ? 'engineering' : id.startsWith('domain:') || /:hosting:/.test(id) ? 'assets-procurement' :
    /^(connector:|mail:|dns:)/.test(id) ? 'integrations-platform' : 'operations';
  const counts = { critical: 0, warning: 0, healthy: 0, unknown: 0 };
  for (const asset of report.assets) {
    counts[asset.state === 'حرج' ? 'critical' : asset.state === 'تحذير' ? 'warning' : 'healthy']++;
    if (!asset.verified) counts.unknown++;
  }
  const priorities = report.assets.map(asset => ({ assetId: asset.assetId, state: asset.state,
    verified: asset.verified, rank: asset.state === 'حرج' ? 1 : !asset.verified ? 2 : 3,
    departmentId: departmentFor(asset.assetId) }))
    .sort((a, b) => a.rank - b.rank || a.assetId.localeCompare(b.assetId));
  for (const task of priorities) {
    const department = catalog.departments.find(item => item.id === task.departmentId);
    check(department && catalog.roles.some(role => role.id === department.managerRoleId), 'OPERATIONS_DEPARTMENT_DENIED');
    task.assignedDigitalRoleId = department.managerRoleId;
    task.assignmentScope = 'LOCAL_METADATA_REVIEW_ONLY';
  }
  const proposals = priorities.map(({ assetId }) => {
    const asset = report.assets.find(item => item.assetId === assetId);
    return { assetId, actionCode: asset.actionCode, action: supervisor.ACTIONS[asset.actionCode],
      execution: 'PROPOSED_ONLY', separateAuthorizationRequired: asset.actionCode !== 'OBSERVE_ONLY' };
  });
  const result = { schema: SCHEMA, generatedAt: report.generatedAt, classification: report.classification,
    productionReady: false, production: 'HOLD', counts, priorities, proposals, raha: validation, workforce,
    organization: { system: catalog.system, status: catalog.status, mode: catalog.mode,
      catalogVersion: catalog.catalogVersion, catalogSha256: catalog.catalogSha256,
      departments: catalog.departments.map(department => ({ ...department,
        localTaskCount: priorities.filter(task => task.departmentId === department.id).length,
        status: priorities.some(task => task.departmentId === department.id) ? 'LOCAL_REVIEW_TASKS_ASSIGNED' : 'PLANNED' })),
      digitalRoles: catalog.roles.map(role => ({ id: role.id, nameAr: role.nameAr, departmentId: role.departmentId,
        kind: 'DIGITAL_ROLE_DESIGN', assignedHuman: null, executionAllowed: false })),
      jobDescriptionReview: jobReview },
    roles: {
      executive: { roleAr: 'مدير تنفيذي', execution: 'EVIDENCE_QUEUE_RANKED', independentAgentsStarted: 0 },
      manager: { roleAr: 'مدير', execution: 'LOCAL_REVIEW_TASKS_ASSIGNED', criticalCount: counts.critical, unknownCount: counts.unknown },
      supervisor: { roleAr: 'مشرف', execution: 'BOUNDARIES_VALIDATED', readiness: 'HOLD' },
      monitor: { roleAr: 'مراقب', execution: 'CHANGE_FINGERPRINT_RECORDED', changeFingerprint: report.changeFingerprint, comparisonPerformed: false },
      engineer: { roleAr: 'مهندس', execution: 'ENUM_PROPOSALS_COMPOSED', repairExecuted: false },
      coordinator: { roleAr: 'منسق', execution: 'DEPENDENCY_PIPELINE_ORDERED', steps: ['worker', 'raha', 'executive', 'manager', 'supervisor', 'monitor', 'engineer', 'coordinator', 'producer'] },
      worker: { roleAr: 'عامل', execution: 'BOUNDED_SUPERVISOR_REPORT_COLLECTED', directLiveServiceProbes: false },
      producer: { roleAr: 'منتج', execution: 'LOCAL_REPORT_RENDERED', archiveWriteClaimed: false }
    },
    boundaries: { networkUsed: false, commandsOutsideSupervisor: false, serviceChangesExecuted: false,
      deploymentExecuted: false, modelExecution: false, paymentExecuted: false, physicalActuation: false,
      reportWriteScope: 'NEW_EXCLUSIVE_LOCAL_REPORT_FILES_ONLY' } };
  result.reportDigest = sha(JSON.stringify(result));
  return result;
}
function markdown(report) {
  const lines = ['# تقرير إدارة عمليات شيخة المحلي', '', 'وقت UTC: ' + report.generatedAt,
    'التصنيف: ' + report.classification, 'الإنتاج: HOLD؛ الجاهزية غير مثبتة.',
    'النطاق: قراءة Git محلية ومراجعة metadata؛ لا فحص خدمات مباشر ولا إصلاح أو نشر.', '',
    'حرج: ' + report.counts.critical + '؛ تحذير: ' + report.counts.warning + '؛ مجهول: ' + report.counts.unknown, ''];
  for (const role of Object.values(report.roles)) lines.push('- ' + role.roleAr + ': ' + role.execution);
  lines.push('', 'الرَّحاة: تحقق من البنية والبصمات والتكرار فقط؛ ليست شهادة شرعية أو تشغيل عتاد.', '', '## الإجراءات المقترحة', '');
  for (const item of report.proposals) lines.push('- ' + item.assetId + ': ' + item.action + ' (لم ينفذ إصلاح).');
  lines.push('', 'بصمة المصدر: ' + report.raha.sourceDigest, 'بصمة التغير: ' + report.raha.sourceChangeFingerprint,
    'بصمة التقرير: ' + report.reportDigest, '');
  return lines.join('\n');
}
function noLinks(target) {
  for (let current = path.resolve(target); ;) {
    try { check(!fs.lstatSync(current).isSymbolicLink(), 'OPERATIONS_SYMLINK_DENIED'); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    const parent = path.dirname(current); if (parent === current) break; current = parent;
  }
}
function writeReport(report, home) {
  check(path.isAbsolute(home), 'OPERATIONS_HOME_DENIED');
  const directory = path.join(home, 'sheikha-supervisor', 'operations');
  noLinks(directory);
  for (const target of [path.dirname(directory), directory]) {
    try { fs.mkdirSync(target, { mode: 0o700 }); } catch (error) { if (error.code !== 'EEXIST') throw error; }
    const stat = fs.lstatSync(target);
    check(stat.isDirectory() && (stat.mode & 0o777) === 0o700 && stat.uid === process.getuid(), 'OPERATIONS_PRIVATE_DIRECTORY_REQUIRED');
  }
  const base = path.join(directory, 'operations-' + report.generatedAt.replace(/[-:.]/g, '') + '-' + crypto.randomBytes(8).toString('hex'));
  const jsonPath = base + '.json', markdownPath = base + '.md';
  // JSON is committed last; interrupted writes never replace or delete earlier reports.
  for (const [file, content] of [[markdownPath, markdown(report)], [jsonPath, JSON.stringify(report, null, 2) + '\n']]) {
    const descriptor = fs.openSync(file, fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_NOFOLLOW, 0o600);
    try { fs.fchmodSync(descriptor, 0o600); fs.writeFileSync(descriptor, content); fs.fsyncSync(descriptor); }
    finally { fs.closeSync(descriptor); }
  }
  return { jsonPath, markdownPath };
}
function run(args = [], { now = new Date().toISOString(), home = os.userInfo().homedir, git } = {}) {
  check(Array.isArray(args) && (args.length === 0 || args.length === 1 && args[0] === '--write'), 'OPERATIONS_ARGUMENT_DENIED');
  const source = supervisor.run([], { now, git });
  check(source.status === 'READ_ONLY_PREVIEW' && source.writeExecuted === false, 'OPERATIONS_WORKER_WRITE_DENIED');
  const report = buildOperations(source.report);
  if (!args.length) return { status: 'READ_ONLY_PREVIEW', productionReady: false, writeExecuted: false, report };
  const paths = writeReport(report, home);
  return { schema: SCHEMA, status: 'NEW_LOCAL_OPERATIONS_PAIR_CREATED', generatedAt: now, productionReady: false,
    writeExecuted: true, ...paths, reportDigest: report.reportDigest, changeFingerprint: report.raha.sourceChangeFingerprint };
}
if (require.main === module) {
  try { process.stdout.write(JSON.stringify(run(process.argv.slice(2)), null, 2) + '\n'); }
  catch { process.stderr.write('SHEIKHA_OPERATIONS_FAILED_NO_AUTOMATIC_CHANGE\n'); process.exitCode = 1; }
}
module.exports = { SCHEMA, raha, buildOperations, markdown, run };
