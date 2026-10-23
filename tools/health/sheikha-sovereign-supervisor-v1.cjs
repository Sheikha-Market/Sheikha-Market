#!/usr/bin/env node
'use strict';

// Reporting only: no repair, deployment, provider invocation, model loading, or training.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const research = require('../../core/research/sheikha-improvement-cycle-v1.cjs');
const SCHEMA = 'SHEIKHA_SOVEREIGN_SUPERVISOR_V1';
const EXTERNAL_SCHEMA = 'SHEIKHA_SUPERVISOR_EXTERNAL_EVIDENCE_V1';
const MAX_BYTES = 256 * 1024;
const REPOS = Object.freeze(['sheikha-main-portal', 'sheikha-portal-core', 'sheikha-ops-reports', 'sheikha_lc_governance']);
const ASSET_IDS = Object.freeze(['hostinger:vps:949321', 'hostinger:ai:949321', 'hostinger:prometheus:949321',
  'hostinger:grafana:949321', 'hostinger:firewall:949321', 'hostinger:backups:949321',
  'hostinger:hosting:sheikha.shop', 'hostinger:hosting:sheikha.top', 'domain:sheikha.top', 'domain:sheikha.shop',
  'mail:sheikha.top', 'dns:sheikha.top', 'dns:sheikha.shop', 'connector:hostinger', 'connector:notion',
  'connector:drive', 'connector:github', 'connector:google-cloud', 'connector:meta', 'connector:gpt']);
const SOURCES = Object.freeze(['HOSTINGER_SNAPSHOT', 'LOCAL_CONNECTOR_AUDIT', 'LOCAL_DNS_AUDIT',
  'LOCAL_MAIL_AUDIT', 'LOCAL_CLOUD_AUDIT', 'OWNER_SANITIZED_RECORD']);
const SUMMARIES = Object.freeze({
  OBSERVED_RUNNING: 'يسجل الدليل تشغيل الخدمة وقت الرصد.', OBSERVED_CONFIGURED: 'يسجل الدليل وجود إعداد وقت الرصد.',
  OBSERVED_ENABLED: 'يسجل الدليل تمكين المكون وقت الرصد.', OBSERVED_RECENT_BACKUP: 'يسجل الدليل نسخة احتياطية؛ لم يختبر الاسترجاع هنا.',
  OBSERVED_DOMAIN_ACTIVE: 'يسجل الدليل حالة النطاق وقت الرصد.', OBSERVED_DNS_PRESENT: 'يسجل الدليل وجود سجلات أسماء وقت الرصد.',
  OBSERVED_MAIL_CONFIGURED: 'يسجل الدليل إعداد البريد؛ لم يختبر التسليم هنا.', CONNECTOR_CONFIG_ONLY: 'إعداد موصل محفوظ؛ الاتصال والصلاحيات غير متحققين هنا.',
  UNKNOWN_NOT_CHECKED: 'الحالة مجهولة؛ لم ينفذ فحص مباشر.', UNKNOWN_NO_CONNECTOR: 'لا يوجد موصل متحقق يثبت الحالة.',
  UNKNOWN_ACCESS_DENIED: 'الدليل غير كاف بسبب حدود الوصول.', WARNING_REVIEW_REQUIRED: 'تحتاج الحالة مراجعة مفوضة.',
  WARNING_MISSING_POLICY: 'يسجل الدليل فجوة في سياسة أو ضبط.', CRITICAL_EXPOSED_SERVICE: 'يسجل الدليل تعرض خدمة يحتاج احتواءً مفوضًا.',
  CRITICAL_RESOURCE_STOPPED: 'يسجل الدليل توقف مورد.', CRITICAL_BACKUP_FAILED: 'يسجل الدليل فشل نسخة احتياطية.',
  CRITICAL_SECURITY_FINDING: 'يسجل الدليل ملاحظة أمنية حرجة.', LOCAL_HEAD_OBSERVED: 'تحقق محلي محدود من بصمة commit الحالية فقط.',
  LOCAL_HEAD_UNKNOWN: 'تعذر إثبات بصمة commit محليًا؛ قد يكون المستودع غير موجود.'
});
const IMPACTS = Object.freeze({ SERVICE_AVAILABILITY: 'قد يتأثر توفر الخدمة.', SECURITY_EXPOSURE: 'قد يتأثر أمن الأصل.',
  DATA_RECOVERY: 'قد تتأثر قابلية استعادة البيانات.', COMMUNICATION: 'قد تتأثر قنوات التواصل.',
  INTEGRATION_VISIBILITY: 'رؤية الربط محدودة.', UNKNOWN_IMPACT: 'الأثر غير مقاس.' });
const ACTIONS = Object.freeze({ OBSERVE_ONLY: 'متابعة الدليل دون تغيير.', RECHECK_WITH_AUTHORIZED_CONNECTOR: 'إعادة الفحص بموصل مفوض عند توفره.',
  REVIEW_CONFIGURATION: 'مراجعة الإعداد ضمن تفويض مستقل.', REVIEW_ACCESS_SCOPE: 'مراجعة نطاق الوصول.',
  REVIEW_BACKUP_RESTORE: 'إعداد اختبار استرجاع مفوض.', CONTAIN_WITH_SEPARATE_AUTHORIZATION: 'اقتراح احتواء محدد للمراجعة والتفويض.',
  NO_AUTOMATIC_ACTION: 'لا إجراء تلقائي.' });
const CLASSIFICATIONS = Object.freeze(['INTERNAL', 'CONFIDENTIAL', 'RESTRICTED_TRADE_SECRET']);
const EXTERNAL_KEYS = ['assetId', 'source', 'state', 'verified', 'summaryCode', 'impactCode', 'actionCode', 'commit', 'hash', 'classification'];
const check = (value, rule) => { if (!value) throw Error(rule); };
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
function exact(value, required, optional = []) {
  check(value && typeof value === 'object' && !Array.isArray(value) && required.every(key => Object.hasOwn(value, key)) &&
    Object.keys(value).every(key => required.includes(key) || optional.includes(key)), 'SNAPSHOT_SHAPE_DENIED');
}
function utc(value) {
  check(typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) &&
    Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value, 'UTC_TIMESTAMP_REQUIRED');
  return Date.parse(value);
}
function parseExternalSnapshot(value, now) {
  exact(value, ['schema', 'observedAt', 'assets'], ['importedAt']);
  check(value.schema === EXTERNAL_SCHEMA && utc(value.observedAt) <= utc(now), 'SNAPSHOT_SCHEMA_OR_TIME_DENIED');
  if (value.importedAt != null) check(utc(value.importedAt) >= utc(value.observedAt) && utc(value.importedAt) <= utc(now), 'IMPORT_TIME_DENIED');
  check(Array.isArray(value.assets) && value.assets.length <= ASSET_IDS.length, 'SNAPSHOT_ASSET_LIMIT');
  const seen = new Set();
  const assets = Array.from(value.assets).map(asset => {
    exact(asset, EXTERNAL_KEYS);
    check(ASSET_IDS.includes(asset.assetId) && !seen.has(asset.assetId), 'SNAPSHOT_ASSET_DENIED'); seen.add(asset.assetId);
    check(SOURCES.includes(asset.source) && ['سليم', 'تحذير', 'حرج'].includes(asset.state) &&
      typeof asset.verified === 'boolean' && CLASSIFICATIONS.includes(asset.classification), 'SNAPSHOT_METADATA_DENIED');
    check(Object.hasOwn(SUMMARIES, asset.summaryCode) && !asset.summaryCode.startsWith('LOCAL_') &&
      Object.hasOwn(IMPACTS, asset.impactCode) && Object.hasOwn(ACTIONS, asset.actionCode), 'SNAPSHOT_CODE_DENIED');
    check(asset.commit === null || typeof asset.commit === 'string' && /^[a-f0-9]{40}(?:[a-f0-9]{24})?$/.test(asset.commit), 'COMMIT_DENIED');
    check(asset.hash === null || typeof asset.hash === 'string' && /^[a-f0-9]{64}$/.test(asset.hash), 'HASH_DENIED');
    check(!asset.summaryCode.startsWith('CRITICAL_') || asset.state === 'حرج', 'CRITICAL_STATE_MISMATCH');
    check(!/^(UNKNOWN_|WARNING_|CONNECTOR_CONFIG_ONLY)/.test(asset.summaryCode) || asset.state !== 'سليم', 'UNKNOWN_STATE_MISMATCH');
    return Object.fromEntries(EXTERNAL_KEYS.map(key => [key, asset[key]]));
  }).sort((first, second) => first.assetId.localeCompare(second.assetId));
  return { observedAt: value.observedAt, importedAt: value.importedAt || null, assets };
}
function noLinks(target) {
  let current = path.resolve(target);
  for (;;) {
    try { check(!fs.lstatSync(current).isSymbolicLink(), 'SYMLINK_DENIED'); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    const parent = path.dirname(current); if (parent === current) break; current = parent;
  }
}
function readJson(file) {
  noLinks(file);
  const descriptor = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW | fs.constants.O_NONBLOCK);
  try {
    const before = fs.fstatSync(descriptor);
    check(before.isFile() && before.nlink === 1 && before.size > 0 && before.size <= MAX_BYTES, 'BOUNDED_REGULAR_FILE_REQUIRED');
    const buffer = Buffer.alloc(MAX_BYTES + 1); let size = 0, count;
    while (size < buffer.length && (count = fs.readSync(descriptor, buffer, size, buffer.length - size, null))) size += count;
    const after = fs.fstatSync(descriptor);
    check(size === before.size && before.size === after.size && before.mtimeMs === after.mtimeMs && before.ctimeMs === after.ctimeMs,
      'FILE_CHANGED_DURING_READ');
    return JSON.parse(buffer.subarray(0, size).toString('utf8'));
  } finally { fs.closeSync(descriptor); }
}
function gitAssets(now, git = spawnSync) {
  return REPOS.map(name => {
    let commit = null;
    try {
      const result = git('/usr/bin/git', ['--no-optional-locks', '-C', '/home/sheikha/Projects/sheikha/' + name,
        '-c', 'core.fsmonitor=false', 'rev-parse', '--verify', 'HEAD^{commit}'], {
        shell: false, encoding: 'utf8', timeout: 1500, maxBuffer: 4096, killSignal: 'SIGKILL',
        env: { PATH: '/usr/bin:/bin', GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null',
          GIT_TERMINAL_PROMPT: '0', GIT_OPTIONAL_LOCKS: '0', GIT_NO_REPLACE_OBJECTS: '1' }
      });
      const value = typeof result.stdout === 'string' ? result.stdout.trim() : '';
      if (!result.error && result.status === 0 && /^[a-f0-9]{40}(?:[a-f0-9]{24})?$/.test(value)) commit = value;
    } catch { /* No exception text, Git stderr, environment or credential values leave this boundary. */ }
    return { assetId: 'repo:' + name, source: 'LOCAL_GIT_HEAD', state: commit ? 'سليم' : 'تحذير', verified: Boolean(commit),
      reportedVerified: null, evidenceScope: 'GIT_HEAD_ONLY_NOT_RUNTIME_OR_SECURITY_READINESS', observedAt: now, stale: false,
      summaryCode: commit ? 'LOCAL_HEAD_OBSERVED' : 'LOCAL_HEAD_UNKNOWN', impactCode: 'INTEGRATION_VISIBILITY',
      actionCode: commit ? 'OBSERVE_ONLY' : 'REVIEW_CONFIGURATION', commit, hash: null, classification: 'CONFIDENTIAL' };
  });
}
function buildReport({ now = new Date().toISOString(), snapshot, snapshotStatus = 'NOT_SUPPLIED', git = spawnSync } = {}) {
  utc(now);
  let imported = null;
  if (snapshot !== undefined) {
    try { imported = parseExternalSnapshot(snapshot, now); snapshotStatus = 'IMPORTED_NOT_RECHECKED'; }
    catch { snapshotStatus = 'REJECTED_INVALID_SNAPSHOT'; }
  }
  const stale = imported ? utc(now) - utc(imported.observedAt) > 86400000 : false;
  const assets = [...gitAssets(now, git), ...ASSET_IDS.map(assetId => {
    const archived = imported?.assets.find(asset => asset.assetId === assetId);
    const state = archived?.state === 'حرج' ? 'حرج' : 'تحذير';
    return { assetId, source: archived?.source || 'NO_CURRENT_EVIDENCE', state, verified: false,
      reportedVerified: archived?.verified ?? null, reportedState: archived?.state ?? null,
      evidenceScope: archived ? 'IMPORTED_NOT_RECHECKED' : 'UNKNOWN_NOT_CHECKED',
      observedAt: archived ? imported.observedAt : null, stale: archived ? stale : false,
      summaryCode: archived?.summaryCode || 'UNKNOWN_NOT_CHECKED', impactCode: archived?.impactCode || 'UNKNOWN_IMPACT',
      actionCode: archived?.actionCode || 'RECHECK_WITH_AUTHORIZED_CONNECTOR', commit: archived?.commit || null,
      hash: archived?.hash || null, classification: archived?.classification || 'CONFIDENTIAL' };
  })];
  const report = {
    schema: SCHEMA, generatedAt: now,
    generatedAtRiyadh: new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Riyadh', dateStyle: 'short', timeStyle: 'medium', hourCycle: 'h23' }).format(new Date(now)) + ' +03:00',
    classification: assets.some(asset => asset.classification === 'RESTRICTED_TRADE_SECRET') ? 'RESTRICTED_TRADE_SECRET' : 'CONFIDENTIAL', productionReady: false,
    readinessReasons: ['REQUIRED_ASSETS_NOT_CURRENTLY_VERIFIED', 'CONNECTORS_NOT_CURRENTLY_VERIFIED', 'PRODUCTION_QUALIFICATION_NOT_PERFORMED'],
    snapshot: { status: snapshotStatus, observedAt: imported?.observedAt || null, importedAt: imported?.importedAt || null,
      currentReadAt: now, rechecked: false, stale, digest: imported ? sha(JSON.stringify(imported)) : null },
    assets,
    research: research.planCycle({ schema: research.SCHEMA, cycleId: 'supervisor_baseline_' + now.replace(/\D/g, ''), observedAt: now, observations: [] }),
    boundaries: { externalNetworkUsed: false, providerWritesExecuted: false, applicationModulesStarted: false,
      modelsLoaded: false, trainingExecuted: false, newSpendAuthorized: false, secretsModified: false,
      physicalActuation: false, universalMetaOrGptControlClaimed: false,
      appendOnlyScope: 'NEW_EXCLUSIVE_FILES_ONLY_NOT_OS_IMMUTABILITY', sourceSnapshotsModified: false }
  };
  report.changeFingerprint = sha(JSON.stringify({ schema: SCHEMA, snapshot: { status: report.snapshot.status,
    digest: report.snapshot.digest, stale: report.snapshot.stale }, assets: assets.map(({ observedAt, ...asset }) => asset),
    research: { plans: report.research.plans, governance: report.research.governance } }));
  report.reportDigest = sha(JSON.stringify(report));
  return report;
}
function markdown(report) {
  const lines = ['# تقرير المشرف المحلي لشيخة', '', 'التصنيف: ' + report.classification,
    'وقت التقرير بتوقيت الرياض: ' + report.generatedAtRiyadh, 'وقت التقرير UTC: ' + report.generatedAt,
    'الجاهزية للإنتاج: غير مثبتة (productionReady=false).',
    'النطاق: قراءة بصمات المستودعات المحلية والدليل المستورد المحدود؛ لا إصلاح أو نشر أو تشغيل نماذج أو تحكم عام في Meta أو GPT.', '',
    '## الدليل الخارجي المحفوظ', '', 'حالة الدليل: ' + report.snapshot.status,
    'وقت الرصد الأصلي UTC: ' + (report.snapshot.observedAt || 'غير متوفر'),
    'وقت الاستيراد المحفوظ UTC: ' + (report.snapshot.importedAt || 'غير مسجل'),
    'وقت القراءة الحالية UTC: ' + report.snapshot.currentReadAt,
    'إعادة فحص المصدر: لم تنفذ. ' + (report.snapshot.stale ? 'الدليل قديم: تجاوز 24 ساعة.' : 'حداثة التاريخ وحدها لا تثبت الحالة الراهنة.'), '',
    '## الأصول المطلوبة', ''];
  for (const asset of report.assets) lines.push('### ' + asset.assetId, '',
    '- asset_id: ' + asset.assetId, '- المصدر: ' + asset.source, '- الحالة الحالية: ' + asset.state,
    '- verified: ' + asset.verified + '؛ نطاق الإثبات: ' + asset.evidenceScope,
    '- الحالة المسجلة: ' + (asset.reportedState || 'غير متوفرة') + '؛ verified في المصدر: ' + (asset.reportedVerified ?? 'غير متوفر'),
    '- وقت الدليل UTC: ' + (asset.observedAt || 'غير متوفر') + '؛ قديم: ' + asset.stale,
    '- ملخص الدليل: ' + SUMMARIES[asset.summaryCode], '- الأثر: ' + IMPACTS[asset.impactCode],
    '- الإجراء المقترح: ' + ACTIONS[asset.actionCode], '- commit: ' + (asset.commit || 'غير متحقق'),
    '- hash: ' + (asset.hash || 'غير متوفر'), '- التصنيف: ' + asset.classification, '');
  lines.push('## البحث والتطوير المقترح', '', 'خطط قياس محلية فقط؛ لا عينات مصطنعة للتحسين ولا ادعاء إنجاز AGI أو ASI.');
  for (const plan of report.research.plans) lines.push('', '### ' + plan.titleAr,
    '- التطبيق: ' + plan.businessApplications.join('، '), '- السؤال: ' + plan.researchQuestion,
    '- الدليل: يلزم خط أساس وعينة مرشحة مصرح بها، بقياس ووحدة واتجاه محدد.',
    '- القبول: مقارنة وصفية ومراجعة مستقلة؛ التراجع يمنع الترقية، ولا تشغيل إنتاجي تلقائي.');
  lines.push('', 'بصمة التغير: ' + report.changeFingerprint, 'بصمة التقرير JSON: ' + report.reportDigest,
    'الملفات الجديدة تكتب حصريًا دون استبدال أو حذف السابق؛ هذا ليس قفلًا ضد مالك نظام التشغيل.', '');
  return lines.join('\n');
}
function reportDirectory(home) { return path.join(home, 'sheikha-supervisor', 'reports'); }
function previousFingerprint(directory, now) {
  noLinks(directory);
  if (!fs.existsSync(directory)) return null;
  check(fs.statSync(directory).isDirectory(), 'REPORT_DIRECTORY_REQUIRED');
  const names = fs.readdirSync(directory);
  check(names.length <= 10000, 'REPORT_HISTORY_REVIEW_REQUIRED');
  const latest = names.filter(name => /^report-\d{8}T\d{9}Z-[a-f0-9]{16}\.json$/.test(name)).sort().at(-1);
  if (!latest) return null;
  try {
    const companion = path.join(directory, latest.replace(/\.json$/, '.md'));
    noLinks(companion);
    const companionStat = fs.lstatSync(companion);
    check(companionStat.isFile() && companionStat.nlink === 1 && companionStat.size > 0 &&
      companionStat.size <= MAX_BYTES && (companionStat.mode & 0o077) === 0, 'PREVIOUS_REPORT_PAIR_INVALID');
    const record = readJson(path.join(directory, latest));
    const { reportDigest, ...body } = record;
    check(record.schema === SCHEMA && /^[a-f0-9]{64}$/.test(record.changeFingerprint) &&
      sha(JSON.stringify(body)) === reportDigest && utc(record.generatedAt) <= utc(now), 'PREVIOUS_REPORT_INVALID');
    return record.changeFingerprint;
  } catch { return 'INVALID_PREVIOUS_REPORT'; }
}
function writeReport(report, home) {
  const directory = reportDirectory(home);
  noLinks(home); noLinks(directory);
  for (const target of [path.dirname(directory), directory]) {
    try { fs.mkdirSync(target, { mode: 0o700 }); }
    catch (error) { if (error.code !== 'EEXIST') throw error; }
    const stat = fs.statSync(target);
    check(stat.isDirectory() && (stat.mode & 0o077) === 0 && stat.uid === process.getuid(), 'PRIVATE_REPORT_DIRECTORY_REQUIRED');
  }
  const stamp = report.generatedAt.replace(/[-:.]/g, '');
  const base = path.join(directory, 'report-' + stamp + '-' + crypto.randomBytes(8).toString('hex'));
  const jsonPath = base + '.json', markdownPath = base + '.md';
  // Commit the JSON last: an interrupted Markdown write cannot suppress the next hourly report.
  for (const [file, content] of [[markdownPath, markdown(report)], [jsonPath, JSON.stringify(report, null, 2) + '\n']]) {
    const descriptor = fs.openSync(file, fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_NOFOLLOW, 0o600);
    try {
      fs.fchmodSync(descriptor, 0o600);
      fs.writeFileSync(descriptor, content); fs.fsyncSync(descriptor);
    } finally { fs.closeSync(descriptor); }
  }
  return { jsonPath, markdownPath };
}
function options(args) {
  const result = { write: false, hourly: false, snapshot: null };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--write' && !result.write) result.write = true;
    else if (args[i] === '--hourly' && !result.hourly) result.hourly = true;
    else if (args[i] === '--snapshot' && result.snapshot === null && typeof args[i + 1] === 'string' && !args[i + 1].startsWith('--')) result.snapshot = args[++i];
    else throw Error('SUPERVISOR_ARGUMENT_DENIED');
  }
  return result;
}
function run(args = [], { now = new Date().toISOString(), home = os.userInfo().homedir, git = spawnSync } = {}) {
  const flags = options(args); let snapshot, snapshotStatus = 'NOT_SUPPLIED';
  if (flags.snapshot) {
    try { snapshot = readJson(flags.snapshot); } catch { snapshotStatus = 'REJECTED_UNREADABLE_SNAPSHOT'; }
  }
  const report = buildReport({ now, snapshot, snapshotStatus, git });
  if (!flags.write) return { writeExecuted: false, status: 'READ_ONLY_PREVIEW', report };
  if (flags.hourly && previousFingerprint(reportDirectory(home), now) === report.changeFingerprint)
    return { schema: SCHEMA, generatedAt: now, productionReady: false, writeExecuted: false, status: 'NO_MEANINGFUL_CHANGE', changeFingerprint: report.changeFingerprint };
  return { schema: SCHEMA, generatedAt: now, generatedAtRiyadh: report.generatedAtRiyadh, productionReady: false,
    writeExecuted: true, status: 'NEW_LOCAL_REPORT_CREATED', ...writeReport(report, home), reportDigest: report.reportDigest,
    changeFingerprint: report.changeFingerprint, assetCount: report.assets.length };
}
if (require.main === module) {
  try { process.stdout.write(JSON.stringify(run(process.argv.slice(2)), null, 2) + '\n'); }
  catch { process.stderr.write('SHEIKHA_SUPERVISOR_FAILED_NO_AUTOMATIC_CHANGE\n'); process.exitCode = 1; }
}
module.exports = { SCHEMA, EXTERNAL_SCHEMA, REPOS, ASSET_IDS, SOURCES, SUMMARIES, IMPACTS, ACTIONS,
  parseExternalSnapshot, buildReport, markdown, run };
