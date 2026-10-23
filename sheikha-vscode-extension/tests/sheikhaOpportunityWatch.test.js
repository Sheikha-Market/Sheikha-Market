'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { OpportunityWatch, assess, reportMarkdown, normalize } = require('../src/intelligence/opportunityWatch');
const { SOURCES, recordsFor, collect, fetchPublicJson } = require('../src/intelligence/publicSources');
const { OpportunityController, INTERVAL } = require('../src/chat/sheikhaOpportunityController');
const { weightQualification } = require('../src/intelligence/weightQualification');
const { ReportCenter, proposalDecision } = require('../src/intelligence/reportCenter');
const { evaluate, architecture } = require('../src/intelligence/watchGovernance');

const NOW = '2026-09-24T10:00:00.000Z';
const candidate = changes => ({ title: 'فرصة بحثية', summary: 'PRIVATE_ADMIN_SENTINEL', category: 'SCIENTIFIC',
  sourceUrl: 'https://example.org/research', publishedAt: '2026-09-22T00:00:00.000Z', ...changes });
const scoring = changes => ({ relevance: 5, benefit: 4, feasibility: 3, risk: 2,
  rationale: 'مراجعة داخلية خاصة', proposedTest: 'اختبار مستقل قبل الاعتماد', ...changes });
let root, store;
beforeEach(() => { root = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-opportunity-test-')); store = new OpportunityWatch({ root, now: () => NOW }); });
afterEach(() => { fs.rmSync(root, { recursive: true, force: true }); });

test('new state stays absent on read; missing observations are not fabricated', () => {
  expect(store.summary()).toMatchObject({ count: 0, unread: 0, lastRun: null, experience: { usefulnessRate: null } });
  expect(fs.readdirSync(root)).toEqual([]);
});
test('deduplicates, persists private evidence, invalidates review and release on source change', () => {
  expect(store.ingest([candidate()])).toEqual({ added: 1, changed: 0, unchanged: 0 });
  let item = store.visible()[0];
  store.assess(item.id, item.contentDigest, scoring());
  store.release(item.id, item.contentDigest, { title: 'عام', summary: 'مسموح' }, true);
  store.acknowledge();
  expect(store.ingest([candidate()]).unchanged).toBe(1);
  expect(store.summary().unread).toBe(0);
  expect(store.ingest([candidate({ evidenceDigest: 'a'.repeat(64) })]).changed).toBe(1);
  item = store.visible()[0];
  expect(item.assessment).toBeNull(); expect(item.userRelease).toBeNull();
  expect(store.summary().unread).toBe(1);
  expect(fs.statSync(root).mode & 0o777).toBe(0o700);
  expect(fs.statSync(path.join(root, 'state.json')).mode & 0o777).toBe(0o600);
  expect(new OpportunityWatch({ root, now: () => NOW }).visible()).toEqual(store.visible());
});
test('private record cannot grant itself publication, execution, ownership, or source verification', () => {
  store.ingest([candidate({ userRelease: { title: 'fake' }, trainingAllowed: true, visibility: 'PUBLIC', provenance: 'VERIFIED' })]);
  expect(store.visible()[0]).toMatchObject({ visibility: 'MANAGEMENT_PRIVATE', trainingAllowed: false, userRelease: null, provenance: 'USER_SUPPLIED_UNVERIFIED' });
  expect(store.report('USERS').items).toEqual([]);
  expect(() => store.report('TENANT-FAKE')).toThrow('AUDIENCE_DENIED');
});
test('user report is explicit minimal projection, revocable, with stale approval refusal', () => {
  store.ingest([candidate()]); const item = store.visible()[0];
  expect(() => store.release(item.id, item.contentDigest, { title: 'عام', summary: 'مسموح' }, false)).toThrow();
  expect(() => store.release(item.id, 'b'.repeat(64), { title: 'عام', summary: 'مسموح' }, true)).toThrow();
  store.release(item.id, item.contentDigest, { title: 'عام', summary: 'مسموح' }, true);
  const report = store.report('USERS');
  expect(report.items[0]).toEqual({ title: 'عام', summary: 'مسموح', approvedAt: NOW });
  expect(JSON.stringify(report)).not.toContain('PRIVATE_ADMIN_SENTINEL');
  expect(JSON.stringify(report)).not.toContain('sourceUrl');
  store.revoke(item.id, item.contentDigest); expect(store.report('USERS').items).toEqual([]);
});
test('economic formulas expose assumptions and do not turn negative net into payback', () => {
  const economics = { currency: 'SAR', setupCost: 3000, monthlyRevenue: 1500, monthlySavings: 500, monthlyOperatingCost: 1000 };
  expect(assess(scoring({ economics }))).toMatchObject({ priorityScore: 78, impactMeasured: false,
    economics: { estimatedMonthlyNet: 1000, estimatedPaybackMonths: 3 } });
  expect(assess(scoring({ economics: { ...economics, monthlyOperatingCost: 3000 } })).economics.estimatedPaybackMonths).toBeNull();
  expect(() => assess(scoring({ economics: { ...economics, setupCost: NaN } }))).toThrow();
  expect(() => assess(scoring({ relevance: 6 }))).toThrow();
});
test('retention hides expired records without asserting that archive was erased', () => {
  store.ingest([candidate()]);
  const later = new OpportunityWatch({ root, now: () => '2026-11-24T00:00:00.000Z' });
  expect(later.summary()).toMatchObject({ count: 0, stored: 1 });
  expect(later.report('MANAGEMENT').items).toEqual([]);
});
test.each([
  { sourceUrl: 'http://127.0.0.1/private' }, { sourceUrl: 'https://example.org/?secret=token' },
  { sourceUrl: 'https://user:pass@example.org/' }, { category: '__proto__' },
  { publishedAt: '2026-09-25T00:00:00.000Z' }, { publishedAt: '2026-02-30T00:00:00.000Z' },
  { summary: 'x'.repeat(4001) }, { evidenceDigest: 'not-a-hash' }
])('rejects invalid or unsafe candidate %j', change => {
  expect(() => store.ingest([candidate(change)])).toThrow(); expect(store.load().items).toEqual([]);
});
test('batch validates fully before write; storage corruption is not reset to empty', () => {
  expect(() => store.ingest([candidate(), candidate({ category: 'INVALID' })])).toThrow();
  expect(store.load().items).toEqual([]);
  store.ingest([candidate()]);
  fs.writeFileSync(path.join(root, 'state.json'), '{}'); expect(() => store.load()).toThrow('STATE_INTEGRITY_FAILED');
});
test('symlink, hardlink, public modes, and write locks fail closed', () => {
  const file = path.join(root, 'state.json'), outside = path.join(root, 'outside.json');
  fs.writeFileSync(outside, '{}'); fs.symlinkSync(outside, file);
  expect(() => store.load()).toThrow('SYMLINK_DENIED'); fs.unlinkSync(file);
  store.ingest([candidate()]); fs.linkSync(file, path.join(root, 'hardlink'));
  expect(() => store.load()).toThrow('BOUNDED_REGULAR_FILE_REQUIRED'); fs.unlinkSync(path.join(root, 'hardlink'));
  fs.chmodSync(file, 0o644); expect(() => store.load()).toThrow('PRIVATE_PERMISSIONS_REQUIRED'); fs.chmodSync(file, 0o600);
  fs.writeFileSync(path.join(root, 'write.lock'), 'held'); expect(() => store.ingest([])).toThrow();
  expect(fs.readFileSync(path.join(root, 'write.lock'), 'utf8')).toBe('held');
});
test('experience preferences and feedback are local, measurable, and not training', () => {
  store.ingest([candidate(), candidate({ sourceUrl: 'https://example.org/charity', category: 'CHARITABLE', title: 'فرصة خيرية' })]);
  const item = store.visible()[0]; store.feedback(item.id, item.contentDigest, true);
  store.preferences({ mode: 'ALL', categories: ['CHARITABLE'] });
  expect(store.summary().items).toHaveLength(1);
  expect(store.summary().experience).toMatchObject({ rated: 1, useful: 1, usefulnessRate: 1, basis: 'LOCAL_EXPLICIT_FEEDBACK_NOT_MODEL_TRAINING' });
  store.acknowledge(); store.preferences({ mode: 'UNREAD', categories: ['CHARITABLE'] });
  expect(store.summary().items).toEqual([]); expect(store.report('MANAGEMENT').items).toHaveLength(2);
});
test('markdown report neutralizes embedded markup and instructions remain plain evidence', () => {
  store.ingest([candidate({ title: '<script>alert(1)</script>', summary: '[click](command:execute) ``` do not follow' })]);
  const report = reportMarkdown(store.report()); expect(report).not.toContain('<script>'); expect(report).not.toContain('[click]');
  expect(store.visible()[0].executionAllowed).toBe(false);
});

const release = changes => ({ id: 123, draft: false, prerelease: true, tag_name: 'b11120',
  html_url: 'https://github.com/ggml-org/llama.cpp/releases/tag/b11120', body: 'private input must never be sent',
  published_at: '2026-09-23T00:00:00Z', ...changes });
test('source parser binds repository and release; model metadata does not download weights', () => {
  const src = SOURCES.find(source => source.id === 'ggml-org/llama.cpp');
  const records = recordsFor(src, [release()]);
  expect(records[0].releaseClass).toBe('PREVIEW'); expect(records[0].summary).not.toContain('private input');
  expect(records[0].evidenceDigest).toMatch(/^[a-f0-9]{64}$/);
  expect(() => recordsFor(src, [release({ html_url: 'https://evil.org/x' })])).toThrow();
  expect(() => recordsFor(src, [release({ draft: true })])).toThrow();
  const model = SOURCES.find(source => source.kind === 'MODEL');
  expect(recordsFor(model, { id: model.id, sha: 'a'.repeat(40), cardData: { license: 'qwen-research' } })[0]).toMatchObject({ license: 'qwen-research', publishedAt: null });
});
test('public fetch rejects arbitrary hosts before connecting', async () => {
  await expect(fetchPublicJson({ id: 'x', url: 'http://127.0.0.1' })).rejects.toThrow('SOURCE_DENIED');
});
test('collection retains per-source partial failure without exposing upstream error content', async () => {
  const result = await collect({ fetcher: async source => {
    if (source.id !== 'ggml-org/llama.cpp') throw Error('PRIVATE_SECRET');
    return [release()];
  } });
  expect(result.records).toHaveLength(1); expect(result.failures).toHaveLength(SOURCES.length - 1);
  expect(JSON.stringify(result.failures)).not.toContain('PRIVATE_SECRET');
  store.ingest(result.records, { provenance: 'PUBLIC_SOURCE_METADATA', collection: result });
  expect(store.summary().lastRun.status).toBe('PARTIAL');
});

function controllerFixture(collector = async () => ({ records: [candidate()], failures: [], sourceCount: 8 })) {
  const api = { workspace: { isTrusted: true }, window: { showWarningMessage: jest.fn(), showInformationMessage: jest.fn(), showQuickPick: jest.fn(), showInputBox: jest.fn() } };
  const schedule = jest.fn(() => ({ unref: jest.fn() })), unschedule = jest.fn(), publish = jest.fn(async () => {}), output = jest.fn();
  const controller = new OpportunityController({ api, store, collector: jest.fn(collector), schedule, unschedule, publish, output });
  return { api, controller, schedule, unschedule, publish, output };
}
test('native consent is mandatory; timer starts only explicitly and stops on trust loss', async () => {
  const f = controllerFixture(); await f.controller.handle('watch.start');
  expect(f.controller.collector).not.toHaveBeenCalled();
  f.api.window.showWarningMessage.mockResolvedValue('بدء الرصد');
  await f.controller.handle('watch.start'); expect(f.schedule).toHaveBeenCalledWith(expect.any(Function), INTERVAL);
  expect(f.controller.collector).toHaveBeenCalledTimes(1);
  f.api.workspace.isTrusted = false; f.schedule.mock.calls[0][0]();
  expect(f.unschedule).toHaveBeenCalled(); expect(f.controller.snapshot().scheduled).toBe(false);
});
test('cancellation and single-flight prevent late writes or repeated scans', async () => {
  let done;
  const f = controllerFixture(() => new Promise(resolve => { done = resolve; }));
  const first = f.controller.scan(), second = f.controller.scan();
  expect(f.controller.collector).toHaveBeenCalledTimes(1); f.controller.stop();
  done({ records: [candidate()], failures: [], sourceCount: 8 });
  expect((await Promise.allSettled([first, second])).every(result => result.status === 'rejected')).toBe(true);
  expect(store.summary().count).toBe(0); expect(f.controller.snapshot().running).toBe(false);
});
test('channels expose missing providers rather than claiming external delivery', async () => {
  const f = controllerFixture(); await f.controller.handle('watch.channels');
  expect(f.output.mock.calls[0][1]).toContain('RECIPIENTS_OPT_IN_AND_PROVIDER_REQUIRED');
  expect(f.output.mock.calls[0][1]).toContain('"externalDeliveryExecuted": false');
});

test('weight qualification never transfers ownership or bypasses commercial license', () => {
  store.ingest([candidate({ sourceUrl: 'https://huggingface.co/Qwen/Qwen-Image-2.1', releaseClass: 'MODEL', license: 'other', upstreamRevision: 'a'.repeat(40) }),
    candidate({ sourceUrl: 'https://huggingface.co/Hcompany/NeoMME-260M-Retriever', releaseClass: 'MODEL', license: 'apache-2.0' })]);
  const plan = weightQualification(store.visible());
  expect(plan).toMatchObject({ trainingExecuted: false, modelDownloads: false, ownershipTransferred: false });
  expect(plan.candidates[0]).toMatchObject({ commercialGate: 'SEPARATE_COMMERCIAL_LICENSE_REQUIRED', upstreamRevision: 'a'.repeat(40), deploymentAllowed: false });
  expect(plan.candidates[1].task).toBe('DOCUMENT_RETRIEVAL_NOT_GENERATIVE_LLM');
});

test('NCA collector keeps official advisory semantics without claiming affected assets', () => {
  const source = SOURCES.find(item => item.kind === 'NCA');
  const record = recordsFor(source, { content: [{ id: 7999, warningNumber: '2026-7874', warningDate: '2026-09-23T00:00:00',
    titleAr: 'تنبيه Drupal', bodyAr: '<p>وصف</p>', preventiveMeasuresAr: '<p>تحديث المنتجات المتأثرة</p>', threatsAr: null,
    severityLevel: 'HIGH', vendor: { nameEn: 'Drupal' } }] })[0];
  expect(record).toMatchObject({ category: 'SECURITY', kind: 'SECURITY_ADVISORY',
    advisory: { authority: 'NCA / Saudi CERT', number: '2026-7874', vendor: 'Drupal', severity: 'HIGH', publishedDate: '2026-09-23' } });
  expect(record.summary).toContain('لا يثبت الانطباق');
  expect(() => recordsFor(source, { content: [{ id: 1, warningNumber: 'bad' }] })).toThrow();
});

test('service status collector records provider evidence without claiming customer impact', () => {
  const source = SOURCES.find(item => item.kind === 'STATUS');
  const record = recordsFor(source, { page: { url: 'https://www.githubstatus.com' }, status: { indicator: 'minor' },
    incidents: [{ name: 'Actions delay', status: 'investigating' }], components: [{ name: 'Actions', status: 'degraded_performance' }] })[0];
  expect(record).toMatchObject({ kind: 'SERVICE_STATUS', category: 'INFRASTRUCTURE' });
  expect(record.summary).toContain('لا فحص لاتصال شيخة');
});

test('report center binds advisory review to a fresh complete inventory and current evidence', () => {
  const center = new ReportCenter(store), source = SOURCES.find(item => item.kind === 'NCA');
  const record = recordsFor(source, { content: [{ id: 7999, warningNumber: '2026-7874', warningDate: '2026-09-23T00:00:00',
    titleAr: 'تنبيه Drupal', bodyAr: '<p>وصف</p>', preventiveMeasuresAr: '<p>إجراء</p>', threatsAr: null,
    severityLevel: 'HIGH', vendor: { nameEn: 'Drupal' } }] })[0];
  store.ingest([record], { provenance: 'PUBLIC_SOURCE_METADATA' });
  center.saveInventory({ schema: 'SHEIKHA_ASSET_INVENTORY_V1', scope: 'بيئة الاختبار', observedAt: NOW,
    declaredComplete: true, assets: [{ id: 'web-1', vendor: 'Drupal', product: 'Drupal CMS', version: '11.2.0', kind: 'SOFTWARE', exposure: 'INTERNAL' }] });
  let item = store.visible()[0];
  expect(center.applicability(item)).toMatchObject({ status: 'INVESTIGATE', reason: 'PRODUCT_VERSION_REVIEW_REQUIRED', assetIds: ['web-1'] });
  center.reviewApplicability(item.id, item.contentDigest, { decision: 'AFFECTED', findings: [{ assetId: 'web-1',
    product: 'Drupal CMS', installedVersion: '11.2.0', decision: 'AFFECTED', evidenceUrl: item.sourceUrl }],
    rationale: 'طابق المراجع المنتج والإصدار المتأثر', referenceUrl: item.sourceUrl, reviewer: 'مراجع الاختبار' }, true);
  item = store.visible()[0];
  expect(center.applicability(item)).toMatchObject({ status: 'AFFECTED', reason: 'EXPLICIT_OPERATOR_REVIEW', systemMutationAuthorized: false });
  expect(center.build('management').report.items[0]).toMatchObject({ proposal: { executionAuthorized: false }, governance: { automaticMutationAllowed: false } });
});

test('affected classification rejects vendor-only assertions without product and version evidence', () => {
  const center = new ReportCenter(store), source = SOURCES.find(item => item.kind === 'NCA');
  store.ingest(recordsFor(source, { content: [{ id: 7999, warningNumber: '2026-7874', warningDate: '2026-09-23T00:00:00',
    titleAr: 'تنبيه Drupal', bodyAr: '<p>وصف</p>', preventiveMeasuresAr: '<p>إجراء</p>', threatsAr: null,
    severityLevel: 'HIGH', vendor: { nameEn: 'Drupal' } }] }), { provenance: 'PUBLIC_SOURCE_METADATA' });
  center.saveInventory({ schema: 'SHEIKHA_ASSET_INVENTORY_V1', scope: 'اختبار', observedAt: NOW, declaredComplete: true,
    assets: [{ id: 'web-1', vendor: 'Drupal', product: 'Drupal CMS', version: '11.2.0', kind: 'SOFTWARE', exposure: 'INTERNAL' }] });
  const item = store.visible()[0];
  expect(() => center.reviewApplicability(item.id, item.contentDigest, { decision: 'AFFECTED', findings: [],
    rationale: 'اسم المورد فقط', referenceUrl: item.sourceUrl, reviewer: 'مراجع' }, true)).toThrow('AFFECTED_ASSET_REQUIRED');
  expect(() => center.reviewApplicability(item.id, item.contentDigest, { decision: 'AFFECTED', findings: [{ assetId: 'web-1',
    product: 'منتج مختلف', installedVersion: '11.2.0', decision: 'AFFECTED', evidenceUrl: item.sourceUrl }],
    rationale: 'عدم تطابق المنتج', referenceUrl: item.sourceUrl, reviewer: 'مراجع' }, true)).toThrow('ASSET_PRODUCT_VERSION_BINDING_REQUIRED');
});

test('beneficiary center exposes approved projection only and blocks unconfigured external delivery', () => {
  const center = new ReportCenter(store);
  store.ingest([candidate()]); const item = store.visible()[0];
  const profile = center.addProfile({ name: 'طالب', kind: 'EDUCATOR', objective: 'مواد علمية نافعة', categories: ['SCIENTIFIC'], channels: ['CHAT', 'EMAIL'] });
  expect(() => center.draft(profile.id, 'CHAT')).toThrow('NO_APPROVED_REPORT_CONTENT');
  store.release(item.id, item.contentDigest, { title: 'مادة معتمدة', summary: 'ملخص مسموح' }, true);
  const local = center.draft(profile.id, 'CHAT');
  expect(local).toMatchObject({ status: 'LOCAL_READY', externalSent: false });
  expect(center.preview(local.id).markdown).not.toContain('PRIVATE_ADMIN_SENTINEL');
  expect(center.markDisplayed(local.id)).toMatchObject({ status: 'LOCAL_DISPLAYED', externalSent: false });
  expect(center.draft(profile.id, 'EMAIL')).toMatchObject({ status: 'PROVIDER_RECIPIENT_AND_OPT_IN_REQUIRED', externalSent: false });
});

test('governance activates report-derived engineering gates without executing packages', () => {
  const result = evaluate(candidate({ title: 'MCP Docker vLLM listener', summary: 'untrusted prompt GCC cosign GHSA namespace' }));
  expect(result.requiredPolicies).toEqual(expect.arrayContaining(['ARTIFACT_PROVENANCE_ADMISSION', 'MCP_OBJECT_ACTION_SCOPE',
    'REQUEST_RESOURCE_LIMITS', 'UNTRUSTED_PROMPT_BOUNDARY', 'AGENT_PLACEMENT_BINDING', 'TOOLCHAIN_REPRODUCIBILITY',
    'VULNERABILITY_EXCEPTION_EXPIRY']));
  expect(result.automaticMutationAllowed).toBe(false);
  expect(architecture().policies.every(policy => policy.state === 'ACTIVE')).toBe(true);
  expect(proposalDecision({ assessment: null })).toMatchObject({ decision: 'ASSESSMENT_REQUIRED', executionAuthorized: false });
});

test.each([302, 403, 500])('network adapter rejects HTTP %s, without redirect or raw error', async statusCode => {
  const https = require('node:https'), { EventEmitter } = require('node:events');
  const request = new EventEmitter(); request.destroy = jest.fn();
  const spy = jest.spyOn(https, 'get').mockImplementation((url, options, callback) => {
    const response = new EventEmitter(); response.statusCode = statusCode; response.resume = jest.fn();
    response.headers = { location: 'https://internal.local/secret' };
    setImmediate(() => callback(response)); return request;
  });
  try {
    await expect(fetchPublicJson(SOURCES[0])).rejects.toThrow(statusCode === 403 ? 'RATE_LIMITED' : 'HTTP_REJECTED');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][1].headers.Authorization).toBeUndefined();
    expect(request.destroy).toHaveBeenCalled();
  } finally { spy.mockRestore(); }
});

test('network adapter checks body size, timeout cancellation, and public JSON only', async () => {
  const https = require('node:https'), { EventEmitter } = require('node:events');
  const request = new EventEmitter(); request.destroy = jest.fn();
  const spy = jest.spyOn(https, 'get').mockImplementation((url, options, callback) => {
    const response = new EventEmitter(); response.statusCode = 200; response.headers = { 'content-type': 'application/json' };
    setImmediate(() => { callback(response); response.emit('data', Buffer.alloc(1024 * 1024 + 1)); }); return request;
  });
  try {
    await expect(fetchPublicJson(SOURCES[0])).rejects.toThrow('RESPONSE_LIMIT');
    const controller = new AbortController(); controller.abort();
    await expect(fetchPublicJson(SOURCES[0], { signal: controller.signal })).rejects.toThrow('CANCELLED');
    expect(spy).toHaveBeenCalledTimes(1);
  } finally { spy.mockRestore(); }
});

test('native publication requires explicit consent, trust, and binds original content', async () => {
  store.ingest([candidate()]); const item = store.visible()[0]; const f = controllerFixture();
  f.api.window.showQuickPick.mockResolvedValue({ id: item.id });
  f.api.window.showInputBox.mockResolvedValueOnce('عنوان عام').mockResolvedValueOnce('ملخص مسموح');
  await f.controller.release(); expect(store.report('USERS').items).toEqual([]);
  f.api.window.showInputBox.mockResolvedValueOnce('عنوان عام').mockResolvedValueOnce('ملخص مسموح');
  f.api.window.showWarningMessage.mockResolvedValue('اعتماد للنشرة');
  await f.controller.release(); expect(store.report('USERS').items[0].summary).toBe('ملخص مسموح');
  expect(JSON.stringify(store.report('USERS'))).not.toContain('PRIVATE_ADMIN_SENTINEL');
});
