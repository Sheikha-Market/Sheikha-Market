'use strict';

const { OpportunityWatch, readPrivate, reportMarkdown, CATEGORIES } = require('../intelligence/opportunityWatch');
const { collect, SOURCES } = require('../intelligence/publicSources');
const { weightQualification } = require('../intelligence/weightQualification');
const { ReportCenter } = require('../intelligence/reportCenter');

const INTERVAL = 60 * 60 * 1000;
class OpportunityController {
  constructor({ api, output, publish, store = new OpportunityWatch(), collector = collect,
    schedule = setInterval, unschedule = clearInterval }) {
    Object.assign(this, { api, output, publish, store, collector, schedule, unschedule });
    this.reportCenter = new ReportCenter(store);
    this.timer = null; this.controller = null; this.pending = null; this.lastError = null;
  }
  trust() { if (this.api.workspace.isTrusted !== true) throw Error('WORKSPACE_TRUST_REQUIRED'); }
  snapshot() {
    try { return { ...this.store.summary(), reportCenter: this.reportCenter.summary(), running: Boolean(this.pending), scheduled: this.timer !== null,
      intervalMinutes: 60, scheduleScope: 'CURRENT_EXTENSION_SESSION', lastError: this.lastError }; }
    catch { return { enabled: false, scheduled: this.timer !== null, running: Boolean(this.pending), lastError: 'PRIVATE_STATE_REVIEW_REQUIRED', items: [] }; }
  }
  async scan() {
    this.trust();
    if (this.pending) return this.pending;
    const controller = new AbortController(); this.controller = controller;
    this.pending = (async () => {
      const batch = await this.collector({ signal: controller.signal });
      this.trust(); if (controller.signal.aborted) throw Error('CANCELLED');
      const counts = this.store.ingest(batch.records, { provenance: 'PUBLIC_SOURCE_METADATA', collection: batch });
      this.lastError = null;
      if (counts.added + counts.changed) Promise.resolve(this.api.window.showInformationMessage?.('شيخة: ' + (counts.added + counts.changed) + ' مستجد يحتاج مراجعة في صندوق الفرص.')).catch(() => {});
      return counts;
    })();
    Promise.resolve(this.publish()).catch(() => {});
    try { return await this.pending; }
    catch { this.lastError = controller.signal.aborted ? 'CANCELLED' : 'COLLECTION_FAILED'; throw Error(this.lastError); }
    finally { this.pending = null; this.controller = null; try { await this.publish(); } catch { /* A closed view does not invalidate a saved observation. */ } }
  }
  async confirmScan(start) {
    this.trust();
    const label = start ? 'بدء الرصد' : 'رصد الآن';
    const consent = await this.api.window.showWarningMessage('رصد بيانات عامة وحفظ النتائج محليًا؟', { modal: true,
      detail: SOURCES.map(source => source.id).join('\n') + '\nطلبات GET فقط إلى GitHub وHugging Face. لا ملفات أو محادثات أو تنزيل أوزان. يحفظ سجل خاص لمدة عرض 30 يومًا، مع بقاء الأرشيف حتى الحذف الإداري.' +
        (start ? '\nرصد الآن ثم كل ساعة ما دامت جلسة الإضافة قائمة. يمكن إيقافه من اللوحة.' : '') }, label);
    if (consent !== label) return false;
    this.trust();
    if (start && this.timer === null) {
      this.timer = this.schedule(() => {
        if (this.api.workspace.isTrusted !== true) { this.stop(); return; }
        this.scan().catch(() => {});
      }, INTERVAL);
      this.timer?.unref?.();
    }
    return this.scan();
  }
  stop() {
    if (this.timer !== null) this.unschedule(this.timer);
    this.timer = null; this.controller?.abort();
  }
  dispose() { this.stop(); }
  async select() {
    this.trust();
    const items = this.store.visible();
    const selection = await this.api.window.showQuickPick(items.map(item => ({ label: item.title,
      description: CATEGORIES[item.category] + ' · ' + item.contentDigest.slice(0, 12), id: item.id })), { title: 'اختر فرصة من السجل الخاص' });
    if (!selection) return null;
    this.trust(); return items.find(item => item.id === selection.id) || null;
  }
  async importRecords() {
    this.trust();
    const choice = await this.api.window.showOpenDialog({ canSelectMany: false, filters: { JSON: ['json'] },
      openLabel: 'معاينة سجل أخبار محلي' });
    if (!choice?.length) return false;
    if (choice[0].scheme !== 'file') throw Error('LOCAL_JSON_REQUIRED');
    const data = readPrivate(choice[0].fsPath, 512 * 1024);
    let records = data.records;
    if (!records && data.schema === 'SHEIKHA_NEWS_INBOX_V1' && Array.isArray(data.events)) {
      records = data.events.slice(0, 50).map(event => ({ title: event.title,
        summary: event.data?.payload?.summaryAr || 'مرشح من صندوق المستجدات المحلي؛ يحتاج مراجعة.',
        category: 'TECHNOLOGY', sourceUrl: event.source?.url, publishedAt: event.publishedAt || null,
        releaseClass: event.releaseClass, license: 'UNKNOWN' }));
    }
    if (!Array.isArray(records) || !records.length || records.length > 50) throw Error('BOUNDED_RECORDS_REQUIRED');
    const preview = records.map(record => ({ title: record.title, source: record.sourceUrl, category: record.category }));
    const doc = await this.api.workspace.openTextDocument({ content: JSON.stringify(preview, null, 2), language: 'json' });
    await this.api.window.showTextDocument(doc);
    const consent = await this.api.window.showWarningMessage('حفظ هذه المرشحات في سجل الإدارة الخاص؟',
      { modal: true, detail: 'عددها ' + records.length + '. تعامَل كمدخلات غير متحققة؛ لا تنفيذ لمحتواها أو نشر للمستخدمين أو تدريب.' }, 'حفظ خاص');
    if (consent !== 'حفظ خاص') return false;
    this.trust(); return this.store.ingest(records);
  }
  async review() {
    const item = await this.select(); if (!item) return false;
    const input = await this.api.window.showInputBox({ title: 'تقييم الفرصة: تقديرات لا نتائج مقاسة',
      prompt: 'قيم 0 إلى 5. الاقتصاد اختياري: currency, setupCost, monthlyRevenue, monthlySavings, monthlyOperatingCost.',
      value: JSON.stringify({ relevance: 0, benefit: 0, feasibility: 0, risk: 5, commercialRights: 'UNKNOWN',
        rationale: 'اكتب أساس التقييم', proposedTest: 'حدد اختبار القبول' }) });
    if (input === undefined) return false;
    if (input.length > 12000) throw Error('ASSESSMENT_LIMIT');
    this.trust(); return this.store.assess(item.id, item.contentDigest, JSON.parse(input));
  }
  async importInventory() {
    this.trust();
    const choice = await this.api.window.showOpenDialog({ canSelectMany: false, filters: { JSON: ['json'] }, openLabel: 'معاينة جرد الأصول' });
    if (!choice?.length) return false;
    if (choice[0].scheme !== 'file') throw Error('LOCAL_JSON_REQUIRED');
    const inventory = readPrivate(choice[0].fsPath, 1024 * 1024);
    const preview = { schema: inventory.schema, scope: inventory.scope, observedAt: inventory.observedAt,
      declaredComplete: inventory.declaredComplete, assetCount: Array.isArray(inventory.assets) ? inventory.assets.length : null };
    const doc = await this.api.workspace.openTextDocument({ content: JSON.stringify(preview, null, 2), language: 'json' });
    await this.api.window.showTextDocument(doc);
    const consent = await this.api.window.showWarningMessage('حفظ جرد الأصول في سجل الإدارة الخاص؟', { modal: true,
      detail: 'يُستخدم الجرد لترشيح الانطباق فقط؛ لا يثبت وجود ثغرة ولا يحدّث أي أصل. يلزم أن يكون مؤرخًا خلال سبعة أيام.' }, 'حفظ الجرد');
    if (consent !== 'حفظ الجرد') return false;
    this.trust(); return this.reportCenter.saveInventory(inventory);
  }
  async addBeneficiary() {
    const input = await this.api.window.showInputBox({ title: 'ملف مستفيد لتقارير شيخة',
      prompt: 'JSON: name, kind, objective, categories, channels. القنوات الخارجية تُسجل كاحتياج إعداد ولا ترسل.',
      value: JSON.stringify({ name: 'مستفيد', kind: 'INDIVIDUAL', objective: 'تقارير نافعة بحسب الاهتمام',
        categories: Object.keys(CATEGORIES), channels: ['CHAT'] }) });
    if (input === undefined) return false;
    if (input.length > 12000) throw Error('PROFILE_LIMIT');
    this.trust(); return this.reportCenter.addProfile(JSON.parse(input));
  }
  async reviewApplicability() {
    const advisories = this.store.visible().filter(item => item.kind === 'SECURITY_ADVISORY');
    const selected = await this.api.window.showQuickPick(advisories.map(item => ({ label: item.title,
      description: item.advisory.number + ' · ' + item.advisory.severity, id: item.id })), { title: 'مراجعة انطباق تنبيه رسمي' });
    if (!selected) return false;
    const item = advisories.find(candidate => candidate.id === selected.id);
    const input = await this.api.window.showInputBox({ title: 'قرار الانطباق الموثق', prompt: 'JSON: decision, findings[{assetId,product,installedVersion,decision,evidenceUrl}], rationale, referenceUrl, reviewer',
      value: JSON.stringify({ decision: 'INVESTIGATE', findings: [], rationale: 'يلزم مطابقة المنتج والإصدار', referenceUrl: item.sourceUrl, reviewer: 'الإدارة' }) });
    if (input === undefined) return false;
    if (input.length > 12000) throw Error('APPLICABILITY_LIMIT');
    const review = JSON.parse(input);
    const consent = await this.api.window.showWarningMessage('تسجيل قرار الانطباق لهذا التنبيه؟', { modal: true,
      detail: 'القرار مرتبط ببصمة التنبيه والجرد الحالي وينتهي عند تغيّرهما. لا ينفذ تصحيحًا أو تحديثًا.' }, 'تسجيل القرار');
    if (consent !== 'تسجيل القرار') return false;
    this.trust(); return this.reportCenter.reviewApplicability(item.id, item.contentDigest, review, true);
  }
  async beneficiaryReport() {
    const profiles = this.reportCenter.profiles();
    const selected = await this.api.window.showQuickPick(profiles.map(profile => ({ label: profile.name,
      description: profile.audience + ' · ' + profile.channels.join(', '), id: profile.id })), { title: 'تقرير موجّه حسب المستفيد' });
    if (!selected) return false;
    const profile = profiles.find(candidate => candidate.id === selected.id);
    const channel = await this.api.window.showQuickPick(profile.channels.map(id => ({ id, label: id })), { title: 'قناة المسودة' });
    if (!channel) return false;
    const draft = this.reportCenter.draft(profile.id, channel.id);
    if (draft.status !== 'LOCAL_READY' && draft.status !== 'LOCAL_DISPLAYED') {
      this.output('مركز شيخة للتقارير', JSON.stringify({ ...draft, externalDeliveryExecuted: false,
        requirement: 'PROVIDER_RECIPIENT_OPT_IN_TENANT_ISOLATION_AND_EXPLICIT_SEND_APPROVAL' }, null, 2),
      { language: 'json', kind: 'REPORT_DELIVERY_CONFIGURATION_REQUIRED' });
      return draft;
    }
    const preview = this.reportCenter.preview(draft.id);
    this.output('مركز شيخة للتقارير · ' + profile.name, preview.markdown, { kind: 'SHEIKHA_TARGETED_LOCAL_REPORT' });
    this.reportCenter.markDisplayed(draft.id);
    return draft;
  }
  async release() {
    const item = await this.select(); if (!item) return false;
    const title = await this.api.window.showInputBox({ title: 'عنوان نشرة المستخدمين', value: item.title });
    if (title === undefined) return false;
    const summary = await this.api.window.showInputBox({ title: 'ملخص مسموح للمستخدمين',
      prompt: 'اكتب ملخصًا خاليًا من أسرار الإدارة والعملاء؛ لن يُنسخ التحليل الخاص تلقائيًا.' });
    if (summary === undefined) return false;
    const consent = await this.api.window.showWarningMessage('اعتماد النص التالي لنشرة المستخدمين؟',
      { modal: true, detail: title + '\n\n' + summary + '\n\nيُعد نسخة مشاركة محلية فقط؛ لا إرسال أو بريد أو نشر تلقائي.' }, 'اعتماد للنشرة');
    if (consent !== 'اعتماد للنشرة') return false;
    this.trust(); return this.store.release(item.id, item.contentDigest, { title, summary }, true);
  }
  async handle(action) {
    this.trust();
    if (action === 'watch.scan' || action === 'watch.start') return this.confirmScan(action === 'watch.start');
    if (action === 'watch.stop') { this.stop(); return; }
    if (action === 'watch.import') return this.importRecords();
    if (action === 'watch.weights') {
      this.output('تأهيل الأوزان من الرصد', JSON.stringify(weightQualification(this.store.visible()), null, 2),
        { language: 'json', kind: 'WEIGHT_QUALIFICATION_NOT_TRAINING' }); return;
    }
    if (action === 'watch.preferences') {
      const categories = await this.api.window.showQuickPick(Object.entries(CATEGORIES).map(([id, label]) => ({ id, label, picked: true })),
        { title: 'اهتمامات الرصد', canPickMany: true });
      if (!categories?.length) return false;
      const mode = await this.api.window.showQuickPick([{ id: 'UNREAD', label: 'الجديد فقط' }, { id: 'ALL', label: 'كل الفرص' }], { title: 'عرض الفرص' });
      if (!mode) return false;
      this.trust(); return this.store.preferences({ categories: categories.map(item => item.id), mode: mode.id });
    }
    if (action === 'watch.feedback') {
      const item = await this.select(); if (!item) return false;
      const choice = await this.api.window.showQuickPick([{ id: true, label: 'مفيدة' }, { id: false, label: 'غير مفيدة حاليًا' }], { title: 'فائدة الفرصة' });
      if (!choice) return false;
      this.trust(); return this.store.feedback(item.id, item.contentDigest, choice.id);
    }
    if (action === 'watch.channels') {
      this.output('قنوات تقارير الفرص', JSON.stringify({
        chatAndAdapter: 'LOCAL_OWNER_INBOX_ACTIVE', editor: 'NATIVE_REPORT_ACTIVE', file: 'EXPLICIT_PRIVATE_EXPORT_ACTIVE',
        customerDigest: 'EXPLICITLY_APPROVED_PROJECTION_LOCAL_ONLY',
        email: 'RECIPIENTS_OPT_IN_AND_PROVIDER_REQUIRED', webhook: 'VERIFIED_ENDPOINT_AND_CREDENTIALS_REQUIRED',
        remoteDashboard: 'AUTHENTICATION_AND_TENANT_ISOLATION_REQUIRED',
        externalDeliveryExecuted: false, automaticTraining: false,
        experience: this.store.summary().experience
      }, null, 2), { language: 'json', kind: 'DELIVERY_READINESS' }); return;
    }
    if (action === 'watch.center') {
      this.output('هيكل ومعمارية Sheikha Watch', JSON.stringify({
        architecture: ['FIXED_OFFICIAL_COLLECTORS', 'PRIVATE_NORMALIZED_REGISTRY', 'EVIDENCE_AND_APPLICABILITY_GATE',
          'FEASIBILITY_AND_RIGHTS_GATE', 'BENEFICIARY_REPORT_CENTER', 'LOCAL_OR_CONFIGURED_DELIVERY', 'FEEDBACK_WITHOUT_AUTOMATIC_TRAINING'],
        governance: ['SOURCE_IS_NOT_APPLICABILITY', 'VENDOR_IS_NOT_AFFECTED_PRODUCT', 'PROPOSAL_IS_NOT_EXECUTION_AUTHORITY',
          'APPROVAL_INVALIDATED_ON_SOURCE_OR_INVENTORY_CHANGE', 'EXTERNAL_DELIVERY_REQUIRES_RECIPIENT_OPT_IN_AND_PROVIDER'],
        state: this.reportCenter.summary()
      }, null, 2), { language: 'json', kind: 'SHEIKHA_WATCH_CONTROL_PLANE' }); return;
    }
    if (action === 'watch.inventory') return this.importInventory();
    if (action === 'watch.applicability') return this.reviewApplicability();
    if (action === 'watch.profile') return this.addBeneficiary();
    if (action === 'watch.beneficiary-report') return this.beneficiaryReport();
    if (action === 'watch.review') return this.review();
    if (action === 'watch.release') return this.release();
    if (action === 'watch.revoke') { const item = await this.select(); if (!item) return false; return this.store.revoke(item.id, item.contentDigest); }
    if (action === 'watch.read') return this.store.acknowledge();
    if (action === 'watch.admin' || action === 'watch.users') {
      const audience = action === 'watch.admin' ? 'MANAGEMENT' : 'USERS';
      this.output(audience === 'MANAGEMENT' ? 'تقرير الفرص الخاص بالإدارة' : 'مسودة نشرة المستخدمين',
        reportMarkdown(this.store.report(audience)), { kind: audience === 'MANAGEMENT' ? 'PRIVATE_OPPORTUNITY_REPORT' : 'APPROVED_USER_DIGEST' }); return;
    }
    throw Error('WATCH_ACTION_DENIED');
  }
}
module.exports = { OpportunityController, INTERVAL };
