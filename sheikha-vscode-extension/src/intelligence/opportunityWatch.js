'use strict';

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');

const SCHEMA = 'SHEIKHA_OPPORTUNITY_WATCH_V1';
const CATEGORIES = Object.freeze({ TECHNOLOGY: 'تقنية', COMMERCIAL: 'تجارية', CHARITABLE: 'خيرية', SCIENTIFIC: 'علمية', NONCOMMERCIAL: 'غير تجارية',
  SECURITY: 'تنبيهات أمنية', EDUCATION: 'تعليم', INVESTMENT: 'استثمار', PROJECTS: 'مشاريع', INFRASTRUCTURE: 'خدمات وبنية تحتية', REGULATORY: 'إشعارات تنظيمية' });
const ROOT = path.join(os.homedir(), '.local/share/sheikha-opportunity-watch/v1');
const MAX_ITEMS = 500;
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const clone = value => JSON.parse(JSON.stringify(value));
const check = (value, code) => { if (!value) throw Error(code); };
function text(value, limit = 4000) {
  check(typeof value === 'string' && value.trim() && value.length <= limit, 'BOUNDED_TEXT_REQUIRED');
  const clean = Array.from(value).filter(char => { const n = char.codePointAt(0);
    return !(n < 32 && n !== 9 && n !== 10 || n === 127 || n >= 0x202a && n <= 0x202e || n >= 0x2066 && n <= 0x2069);
  }).join('').trim();
  check(clean.length > 0, 'BOUNDED_TEXT_REQUIRED'); return clean;
}
function date(value) {
  check(typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) &&
    Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value, 'UTC_DATE_REQUIRED');
  return value;
}
function sourceUrl(value) {
  const url = new URL(text(value, 1000));
  check(url.protocol === 'https:' && !url.username && !url.password && !url.port && !url.search && !url.hash &&
    /\.[a-z]{2,}$/i.test(url.hostname) && !/\.(local|internal|localhost)$/i.test(url.hostname), 'PUBLIC_REFERENCE_REQUIRED');
  return url.href;
}
function noLinks(target) {
  let current = path.resolve(target);
  for (;;) {
    try { check(!fs.lstatSync(current).isSymbolicLink(), 'SYMLINK_DENIED'); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    const parent = path.dirname(current); if (parent === current) break; current = parent;
  }
}
function readPrivate(file, limit = 4 * 1024 * 1024) {
  noLinks(file);
  const fd = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
  try {
    const stat = fs.fstatSync(fd);
    check(stat.isFile() && stat.nlink === 1 && stat.size <= limit, 'BOUNDED_REGULAR_FILE_REQUIRED');
    return JSON.parse(fs.readFileSync(fd, 'utf8'));
  } finally { fs.closeSync(fd); }
}
function normalize(record, now, provenance) {
  check(record && typeof record === 'object' && !Array.isArray(record), 'RECORD_REQUIRED');
  const core = { title: text(record.title, 240), summary: text(record.summary), category: record.category,
    sourceUrl: sourceUrl(record.sourceUrl), publishedAt: record.publishedAt == null ? null : date(record.publishedAt),
    releaseClass: record.releaseClass || 'UNKNOWN', license: record.license ? text(record.license, 120) : 'UNKNOWN',
    evidenceDigest: record.evidenceDigest || null, upstreamRevision: record.upstreamRevision || null };
  check(core.evidenceDigest === null || /^[a-f0-9]{64}$/.test(core.evidenceDigest), 'EVIDENCE_DIGEST_INVALID');
  check(core.upstreamRevision === null || /^[a-f0-9]{40,64}$/.test(core.upstreamRevision), 'UPSTREAM_REVISION_INVALID');
  check(Object.hasOwn(CATEGORIES, core.category), 'CATEGORY_DENIED');
  check(['STABLE', 'PREVIEW', 'MODEL', 'UNKNOWN'].includes(core.releaseClass), 'RELEASE_CLASS_DENIED');
  check(!core.publishedAt || Date.parse(core.publishedAt) <= Date.parse(now), 'FUTURE_PUBLICATION_DENIED');
  // Optional fields preserve existing record digests and approvals during upgrade.
  if (record.kind != null) {
    check(['SECURITY_ADVISORY', 'SERVICE_STATUS', 'OPPORTUNITY', 'REGULATORY_NOTICE', 'RESEARCH'].includes(record.kind), 'KIND_DENIED');
    core.kind = record.kind;
  }
  if (core.kind === 'SECURITY_ADVISORY') {
    const a = record.advisory;
    check(a && ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'MULTI', 'UNKNOWN'].includes(a.severity), 'ADVISORY_REQUIRED');
    const publishedDate = text(a.publishedDate, 10);
    date(publishedDate + 'T00:00:00.000Z');
    check(publishedDate <= now.slice(0, 10), 'FUTURE_PUBLICATION_DENIED');
    core.advisory = { authority: text(a.authority, 120), number: text(a.number, 80), vendor: text(a.vendor, 160),
      severity: a.severity, publishedDate };
  }
  return { ...core, id: sha(core.sourceUrl), contentDigest: sha(JSON.stringify(core)), provenance,
    observedAt: now, firstSeenAt: now, expiresAt: new Date(Date.parse(now) + 30 * 86400000).toISOString(),
    visibility: 'MANAGEMENT_PRIVATE', read: false, assessment: null, userRelease: null,
    executionAllowed: false, modelDownloadAllowed: false, trainingAllowed: false };
}
function assess(input) {
  check(input && typeof input === 'object' && !Array.isArray(input), 'ASSESSMENT_REQUIRED');
  const factors = {};
  for (const name of ['relevance', 'benefit', 'feasibility', 'risk']) {
    check(Number.isInteger(input[name]) && input[name] >= 0 && input[name] <= 5, 'SCORE_0_TO_5_REQUIRED');
    factors[name] = input[name];
  }
  const rights = input.commercialRights || 'UNKNOWN';
  check(['UNKNOWN', 'RESTRICTED', 'REVIEWED'].includes(rights), 'RIGHTS_REVIEW_REQUIRED');
  const result = { ...factors, commercialRights: rights, rationale: text(input.rationale, 2000),
    proposedTest: text(input.proposedTest, 2000),
    priorityScore: Math.round(20 * (0.3 * factors.relevance + 0.3 * factors.benefit + 0.25 * factors.feasibility + 0.15 * (5 - factors.risk))),
    scoreBasis: 'HUMAN_ESTIMATE_NOT_MEASURED_SUCCESS', impactMeasured: false, economics: null };
  if (input.economics != null) {
    const economic = input.economics;
    check(economic && typeof economic === 'object' && /^[A-Z]{3}$/.test(economic.currency), 'CURRENCY_REQUIRED');
    for (const name of ['setupCost', 'monthlyRevenue', 'monthlySavings', 'monthlyOperatingCost']) {
      check(typeof economic[name] === 'number' && Number.isFinite(economic[name]) && economic[name] >= 0 && economic[name] <= 1e12, 'NONNEGATIVE_FINITE_COST_REQUIRED');
    }
    const net = economic.monthlyRevenue + economic.monthlySavings - economic.monthlyOperatingCost;
    result.economics = { currency: economic.currency, setupCost: economic.setupCost, monthlyRevenue: economic.monthlyRevenue,
      monthlySavings: economic.monthlySavings, monthlyOperatingCost: economic.monthlyOperatingCost,
      estimatedMonthlyNet: net, estimatedPaybackMonths: net > 0 ? economic.setupCost / net : null,
      basis: 'USER_ASSUMPTIONS_NOT_REALIZED_PROFIT_EXCLUDES_TAX_FINANCING_AND_UNLISTED_COSTS' };
  }
  return result;
}

class OpportunityWatch {
  constructor({ root = ROOT, now = () => new Date().toISOString() } = {}) { this.root = root; this.now = now; }
  load() {
    noLinks(this.root);
    const file = path.join(this.root, 'state.json');
    noLinks(file);
    if (!fs.existsSync(file)) return { schema: SCHEMA, revision: 0, items: [], lastRun: null };
    check((fs.statSync(this.root).mode & 0o077) === 0 && (fs.statSync(file).mode & 0o077) === 0, 'PRIVATE_PERMISSIONS_REQUIRED');
    const { digest, ...state } = readPrivate(file);
    check(state.schema === SCHEMA && Number.isSafeInteger(state.revision) && state.revision >= 0 &&
      Array.isArray(state.items) && state.items.length <= MAX_ITEMS && sha(JSON.stringify(state)) === digest, 'STATE_INTEGRITY_FAILED');
    check(state.items.every(item => /^[a-f0-9]{64}$/.test(item.id) && /^[a-f0-9]{64}$/.test(item.contentDigest) &&
      item.visibility === 'MANAGEMENT_PRIVATE' && Object.hasOwn(CATEGORIES, item.category)) &&
      new Set(state.items.map(item => item.id)).size === state.items.length, 'STATE_ITEMS_INVALID');
    check(state.reportProfiles == null || Array.isArray(state.reportProfiles) && state.reportProfiles.length <= 50 &&
      state.reportProfiles.every(profile => typeof profile.id === 'string' && typeof profile.name === 'string' && profile.audience === 'USERS' &&
        Array.isArray(profile.categories) && profile.categories.every(category => Object.hasOwn(CATEGORIES, category)) &&
        Array.isArray(profile.channels)), 'REPORT_PROFILES_INVALID');
    check(state.reportOutbox == null || Array.isArray(state.reportOutbox) && state.reportOutbox.length <= 100 &&
      state.reportOutbox.every(item => typeof item.id === 'string' && typeof item.profileId === 'string' &&
        typeof item.fingerprint === 'string' && item.externalSent === false), 'REPORT_OUTBOX_INVALID');
    check(state.assetInventory == null || state.assetInventory && Array.isArray(state.assetInventory.assets) &&
      state.assetInventory.assets.length <= 2000 && /^[a-f0-9]{64}$/.test(state.assetInventory.digest), 'ASSET_INVENTORY_INVALID');
    return state;
  }
  transaction(update) {
    noLinks(this.root); fs.mkdirSync(this.root, { recursive: true, mode: 0o700 });
    check((fs.statSync(this.root).mode & 0o077) === 0, 'PRIVATE_DIRECTORY_REQUIRED');
    const lock = path.join(this.root, 'write.lock');
    const fd = fs.openSync(lock, fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_WRONLY | fs.constants.O_NOFOLLOW, 0o600);
    let temporary;
    try {
      const state = this.load(), result = update(state);
      check(state.items.length <= MAX_ITEMS, 'CAPACITY_REVIEW_REQUIRED');
      state.revision++;
      const serialized = JSON.stringify({ ...state, digest: sha(JSON.stringify(state)) }, null, 2) + '\n';
      check(Buffer.byteLength(serialized) <= 4 * 1024 * 1024, 'STATE_SIZE_LIMIT');
      temporary = path.join(this.root, '.' + crypto.randomUUID() + '.tmp');
      const out = fs.openSync(temporary, 'wx', 0o600);
      try { fs.writeFileSync(out, serialized); fs.fsyncSync(out); } finally { fs.closeSync(out); }
      noLinks(path.join(this.root, 'state.json'));
      fs.renameSync(temporary, path.join(this.root, 'state.json')); temporary = null;
      const dir = fs.openSync(this.root, fs.constants.O_RDONLY);
      try { fs.fsyncSync(dir); } finally { fs.closeSync(dir); }
      return result;
    } finally { if (temporary && fs.existsSync(temporary)) fs.unlinkSync(temporary); fs.closeSync(fd); fs.unlinkSync(lock); }
  }
  ingest(records, { provenance = 'USER_SUPPLIED_UNVERIFIED', collection = null } = {}) {
    const now = date(this.now());
    check(Array.isArray(records) && records.length <= 50, 'BATCH_LIMIT');
    check(['USER_SUPPLIED_UNVERIFIED', 'PUBLIC_SOURCE_METADATA', 'LEGACY_LOCAL_EVIDENCE'].includes(provenance), 'PROVENANCE_DENIED');
    const normalized = records.map(record => normalize(record, now, provenance));
    return this.transaction(state => {
      const counts = { added: 0, changed: 0, unchanged: 0 };
      for (const item of normalized) {
        const index = state.items.findIndex(old => old.id === item.id), old = state.items[index];
        if (!old) { state.items.push(item); counts.added++; }
        else if (old.contentDigest === item.contentDigest) {
          old.observedAt = now; old.expiresAt = item.expiresAt; counts.unchanged++;
        } else { state.items[index] = { ...item, firstSeenAt: old.firstSeenAt }; counts.changed++; }
      }
      if (collection) state.lastRun = { checkedAt: now, status: collection.failures.length ? (records.length ? 'PARTIAL' : 'FAILED') : 'COMPLETE',
        sourceCount: collection.sourceCount, received: records.length, failures: clone(collection.failures), ...counts };
      return counts;
    });
  }
  visible() { return this.load().items.filter(item => Date.parse(item.expiresAt) > Date.parse(this.now())); }
  preferences(input) {
    check(input && ['ALL', 'UNREAD'].includes(input.mode) && Array.isArray(input.categories) && input.categories.length > 0 &&
      input.categories.every(category => Object.hasOwn(CATEGORIES, category)), 'PREFERENCES_INVALID');
    return this.transaction(state => { state.preferences = { mode: input.mode, categories: [...new Set(input.categories)] }; });
  }
  feedback(id, digest, useful) {
    check(typeof useful === 'boolean', 'FEEDBACK_REQUIRED');
    return this.update(id, digest, item => { item.feedback = { useful, recordedAt: date(this.now()) }; });
  }
  summary() {
    const state = this.load(), items = this.visible();
    const preferences = state.preferences || { mode: 'ALL', categories: Object.keys(CATEGORIES) };
    const rated = items.filter(item => item.feedback), useful = rated.filter(item => item.feedback.useful).length;
    const display = items.filter(item => preferences.categories.includes(item.category) && (preferences.mode !== 'UNREAD' || !item.read))
      .sort((a, b) => (b.assessment?.priorityScore || 0) - (a.assessment?.priorityScore || 0) ||
        Date.parse(b.publishedAt || b.firstSeenAt) - Date.parse(a.publishedAt || a.firstSeenAt) || a.id.localeCompare(b.id));
    return { enabled: true, scope: 'SINGLE_LOCAL_OWNER_NOT_MULTI_TENANT_AUTH', stored: state.items.length,
      count: items.length, unread: items.filter(item => !item.read).length, lastRun: state.lastRun,
      preferences, experience: { rated: rated.length, useful, usefulnessRate: rated.length ? useful / rated.length : null,
        basis: 'LOCAL_EXPLICIT_FEEDBACK_NOT_MODEL_TRAINING', unseenItemsNotAutomaticallyDismissed: true },
      items: display.slice(0, 8).map(item => ({ id: item.id, title: item.title, category: CATEGORIES[item.category], read: item.read,
        score: item.assessment?.priorityScore ?? null, publishedAt: item.publishedAt, observedAt: item.observedAt })),
      modelDownloads: false, trainingExecuted: false, externalDelivery: false };
  }
  update(id, digest, operation) {
    return this.transaction(state => {
      const item = state.items.find(value => value.id === id);
      check(item && item.contentDigest === digest && Date.parse(item.expiresAt) > Date.parse(this.now()), 'ITEM_CHANGED_OR_EXPIRED');
      return operation(item);
    });
  }
  assess(id, digest, input) {
    const value = assess(input);
    return this.update(id, digest, item => { item.assessment = { ...value, reviewedAt: date(this.now()) }; item.userRelease = null; return clone(item.assessment); });
  }
  release(id, digest, { title, summary }, confirmed) {
    check(confirmed === true, 'EXPLICIT_NATIVE_APPROVAL_REQUIRED');
    const approved = { title: text(title, 240), summary: text(summary, 1200), approvedAt: date(this.now()), contentDigest: digest };
    return this.update(id, digest, item => { item.userRelease = approved; return clone(approved); });
  }
  revoke(id, digest) { return this.update(id, digest, item => { item.userRelease = null; }); }
  acknowledge() { return this.transaction(state => { state.items.forEach(item => { item.read = true; }); }); }
  report(audience = 'MANAGEMENT') {
    check(['MANAGEMENT', 'USERS'].includes(audience), 'AUDIENCE_DENIED');
    const items = this.visible();
    // User projection is a whitelist, never a redacted copy of the private object.
    return { schema: 'SHEIKHA_OPPORTUNITY_REPORT_V1', audience, generatedAt: date(this.now()),
      delivery: 'LOCAL_DRAFT_NOT_SENT', sourceEvidence: 'NOT_INDEPENDENT_CERTIFICATION',
      items: audience === 'MANAGEMENT' ? clone(items) : items.filter(item => item.userRelease?.contentDigest === item.contentDigest)
        .map(item => ({ title: item.userRelease.title, summary: item.userRelease.summary, approvedAt: item.userRelease.approvedAt })) };
  }
}
function reportMarkdown(report) {
  const safe = value => String(value).replace(/[<>`\[\]!*_#|\\]/g, ' ').replace(/\r/g, '').replace(/\n/g, ' ');
  return ['# ' + (report.audience === 'MANAGEMENT' ? 'تقرير الإدارة الخاص: الرصد والفرص' : 'نشرة المستخدمين: محتوى معتمد للمشاركة'),
    '', 'وقت التقرير: ' + report.generatedAt, 'الحالة: مسودة محلية، لم تُرسل. المصدر لا يثبت صحة الخبر أو جدواه تلقائيًا.',
    ...(!report.items.length ? ['', 'لا مواد مؤهلة لهذا التقرير حاليًا.'] : []),
    ...report.items.flatMap(item => ['', '## ' + safe(item.title), safe(item.summary),
      ...(report.audience === 'MANAGEMENT' ? [
        '- المجال: ' + CATEGORIES[item.category], '- المصدر: ' + item.sourceUrl,
        '- نشر: ' + (item.publishedAt || 'غير محدد') + '؛ رصد: ' + item.observedAt,
        '- الترخيص المعلن: ' + safe(item.license) + '؛ حالة الإصدار: ' + item.releaseClass,
        ...(item.advisory ? ['- تنبيه أمني، وليس تشريعًا أو إثبات إصابة: ' + safe(item.advisory.number) + '؛ الخطورة المعلنة: ' + item.advisory.severity,
          '- الجهة: ' + safe(item.advisory.authority) + '؛ تاريخ التحذير: ' + item.advisory.publishedDate,
          '- الانطباق على الأصول: يحتاج جردًا ومراجعة المنتج والإصدار.'] : []),
        '- أولوية المراجعة: ' + (item.assessment ? item.assessment.priorityScore + '/100، تقدير بشري لا قياس أداء' : 'لم تُقيّم'),
        '- التقييم: ' + (item.assessment ? safe(item.assessment.rationale) : 'مطلوب'),
        '- اختبار القبول المقترح: ' + (item.assessment ? safe(item.assessment.proposedTest) : 'مطلوب'),
        ...(item.assessment?.economics ? ['- تقدير اقتصادي من افتراضات المراجع: ' + JSON.stringify(item.assessment.economics)] : ['- الجدوى المالية: لا مدخلات تكلفة وعائد كافية.']),
        '- التنفيذ والتنزيل والتدريب: غير مصرح بها من محرك الرصد.', '- بصمة المحتوى: ' + item.contentDigest
      ] : [])])].join('\n');
}
module.exports = { OpportunityWatch, ROOT, CATEGORIES, SCHEMA, assess, normalize, sourceUrl, date, sha, readPrivate, noLinks, reportMarkdown };
