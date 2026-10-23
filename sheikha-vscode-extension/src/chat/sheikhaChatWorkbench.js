'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { REVIEW_AREAS, inspectWorkspace, IntegrationJournal, integrationMarkdown } = require('./sheikhaWorkspaceIntegration');
const { inspectDelivery, deliveryMarkdown } = require('./sheikhaDeliveryInspection');
const { ObservationBridge, ORIGIN, TOOLS } = require('./sheikhaObservationBridge');
const { reportMarkdown } = require('./sheikhaContextReport');
const { TaskEngine, workflowMarkdown } = require('./sheikhaTaskEngine');
const { LocalModelAdapter } = require('./sheikhaLocalModelAdapter');
const { workflowTasks } = require('./sheikhaWorkflowAdapters');
const { VSCodeAdapter } = require('./sheikhaVSCodeAdapter');
const { OpportunityController } = require('./sheikhaOpportunityController');
const { CognitiveController } = require('./sheikhaCognitiveController');

const DOMAINS = Object.freeze([
  { id: 'ai', name: 'إدارة الذكاء الصناعي', owner: 'مسؤول النماذج والتقييم',
    components: ['بوابة النماذج', 'Foundry', 'التقييم وسجل الأوزان'],
    commands: ['sheikha.neuralNetwork', 'sheikha.validateRootNeuralIntegration'],
    inputs: 'طلب محدد وبيانات مرخصة', outputs: 'نتيجة وتقييم وإسناد',
    gate: 'لا تدريب أو إرسال بيانات أو شراء موارد تلقائيًا', kpi: 'نجاح التقييم على مجموعة مستقلة؛ التكلفة لكل مهمة ناجحة' },
  { id: 'compute', name: 'إدارة الحاسب', owner: 'مسؤول التشغيل والبنية',
    components: ['Runtime', 'Node وDocker', 'الرصد والمستودعات'],
    commands: ['sheikha.cli.health', 'sheikha.showStatus'],
    inputs: 'حمل العمل وحدود الموارد', outputs: 'قياسات وصحة الخدمة',
    gate: 'تغيير الخدمات وTPM وFirmware يحتاج تفويضًا مستقلًا', kpi: 'التوافر وزمن الاستجابة ونسبة فشل الاسترداد' },
  { id: 'chat', name: 'إدارة شات شيخة', owner: 'مسؤول تجربة المحادثة',
    components: ['قناة المحادثة', 'ذاكرة الجلسة', 'الأدوات والمخرجات'],
    commands: ['sheikha.openChat', 'sheikha.ask'],
    inputs: 'طلب المستخدم والسياق المختار', outputs: 'رد وسجل أداة ومصدر',
    gate: 'فصل نص النموذج عن تفويض الأداة؛ لا إرسال للسياق تلقائيًا', kpi: 'زمن أول استجابة؛ فشل الأدوات؛ اكتمال المسح' },
  { id: 'development', name: 'إدارة التطوير', owner: 'مسؤول الإصدار والمراجعة',
    components: ['Studio', 'Git', 'الاختبارات وبوابة الإصدار'],
    commands: ['sheikha.gitStatus', 'sheikha.reviewCode', 'sheikha.generateTests'],
    inputs: 'متطلبات قابلة للتحقق', outputs: 'تغيير مراجع وأدلة اختبار',
    gate: 'لا commit أو push أو نشر من هذه اللوحة', kpi: 'نجاح الاختبارات؛ زمن إصلاح الخلل؛ انحدارات الإصدار' },
  { id: 'programming', name: 'إدارة البرمجة', owner: 'مسؤول اللغة وSDK',
    components: ['لغة شيخة', 'SDK وCLI وMCP', 'تحليل الكود'],
    commands: ['sheikha.explainCode', 'sheikha.refactorCode', 'sheikha.optimizePerformance'],
    inputs: 'مواصفات وعقود واجهات', outputs: 'كود واختبارات وتوثيق',
    gate: 'المقترح البرمجي لا يثبت تشغيل الكود أو سلامته', kpi: 'توافق العقود؛ دقة التشخيص؛ تغطية السلوك المهم' }
]);

const ACTIONS = Object.freeze([
  { id: 'cognition.start', label: 'ابدأ دورة معرفية', group: 'cognition' },
  { id: 'cognition.save', label: 'حفظ ملاحظة', group: 'cognition' },
  { id: 'cognition.recall', label: 'استرجاع ذاكرة', group: 'cognition' },
  { id: 'cognition.forget', label: 'حذف ملاحظة', group: 'cognition' },
  { id: 'cognition.stack', label: 'فحص موصلات النماذج', group: 'cognition' },
  { id: 'watch.scan', label: 'رصد الآن', group: 'watch' },
  { id: 'watch.start', label: 'رصد كل ساعة', group: 'watch' },
  { id: 'watch.stop', label: 'إيقاف الرصد', group: 'watch' },
  { id: 'watch.admin', label: 'تقرير الإدارة', group: 'watch' },
  { id: 'watch.users', label: 'نشرة المستخدمين', group: 'watch' },
  { id: 'watch.review', label: 'تقييم فرصة', group: 'watch' },
  { id: 'watch.import', label: 'استيراد مرشحات', group: 'watch' },
  { id: 'watch.release', label: 'اعتماد للنشرة', group: 'watch' },
  { id: 'watch.revoke', label: 'سحب من النشرة', group: 'watch' },
  { id: 'watch.read', label: 'تعليم كمقروء', group: 'watch' },
  { id: 'watch.preferences', label: 'اهتماماتي', group: 'watch' },
  { id: 'watch.feedback', label: 'تقييم الفائدة', group: 'watch' },
  { id: 'watch.channels', label: 'قنوات التقارير', group: 'watch' },
  { id: 'watch.weights', label: 'تأهيل الأوزان', group: 'watch' },
  { id: 'watch.center', label: 'مركز Watch', group: 'watch' },
  { id: 'watch.inventory', label: 'جرد الأصول', group: 'watch' },
  { id: 'watch.applicability', label: 'انطباق التحذير', group: 'watch' },
  { id: 'watch.profile', label: 'ملف مستفيد', group: 'watch' },
  { id: 'watch.beneficiary-report', label: 'تقرير موجّه', group: 'watch' },
  { id: 'workflow.start', label: 'ابدأ مهمة منظمة', group: 'workflow' },
  { id: 'workflow.cancel', label: 'إيقاف المهام', group: 'workflow' },
  { id: 'workflow.detail', label: 'تفاصيل المهمة', group: 'internal' },
  { id: 'report.source', label: 'اختيار مصدر التقرير', group: 'management' },
  { id: 'vscode.catalog', label: 'فهرس أوامر VS Code', group: 'vscode' },
  { id: 'vscode.execute', label: 'استخدام أدوات VS Code', group: 'vscode' },
  { id: 'architecture', label: 'الهيكل والمعمارية', group: 'management' },
  { id: 'review', label: 'تشغيل المراجعة المحلية', group: 'management' },
  { id: 'integration', label: 'فحص التكامل والمستجدات', group: 'management' },
  { id: 'delivery', label: 'فحص حزم التوزيع V2', group: 'management' },
  { id: 'observation.report', label: 'حالة البيانات والمستجدات', group: 'observation' },
  { id: 'observation.tool', label: 'أدوات البيانات والحساب', group: 'observation' },
  { id: 'observation.open', label: 'فتح مساحة البيانات', group: 'observation' },
  { id: 'web', label: 'بحث الويب', group: 'sources', approval: true },
  { id: 'search', label: 'البحث في المشروع', group: 'sources' },
  { id: 'github', label: 'Git / GitHub', group: 'sources' },
  { id: 'library', label: 'المكتبة الهندسية', group: 'sources' },
  { id: 'files', label: 'الملفات', group: 'sources' },
  { id: 'memory', label: 'ذاكرة الجلسة', group: 'sources' }
]);

function localRequestAction(text) {
  const value = String(text || '').trim().replace(/[.!؟?]+$/u, '').trim();
  if (['هيكل شيخة', 'معمارية شيخة', 'إدارة شيخة'].includes(value)) return 'architecture';
  if (['راجع أدوات شيخة', 'مراجعة شيخة المحلية'].includes(value)) return 'review';
  if (['تكامل شيخة', 'افحص تكامل شيخة', 'مستجدات شيخة'].includes(value)) return 'integration';
  if (['افحص حالة Universal Delivery V2 والحزم والأدلة المحلية دون نشر خارجي', 'افحص حزم التوزيع', 'فحص التوزيع V2'].includes(value)) return 'delivery';
  if (['تقرير البيانات والمستجدات', 'حالة البيانات والمستجدات'].includes(value)) return 'observation.report';
  if (['أدوات البيانات والحساب'].includes(value)) return 'observation.tool';
  if (value === 'ارصد فرص شيخة') return 'watch.scan';
  if (value === 'تقرير فرص الإدارة') return 'watch.admin';
  if (value === 'نشرة فرص المستخدمين') return 'watch.users';
  if (value === 'مركز شيخة للرصد') return 'watch.center';
  if (value === 'اكتب تقريرا موجها') return 'watch.beneficiary-report';
  if (value === 'أدوات VS Code') return 'vscode.execute';
  if (value === 'فهرس أدوات VS Code') return 'vscode.catalog';
  if (value === 'ابدأ دورة معرفية') return 'cognition.start';
  if (value === 'افحص موصلات النماذج') return 'cognition.stack';
  if (['ابدأ مهمة منظمة', 'شغل وكلاء شيخة', 'شغّل وكلاء شيخة'].includes(value)) return 'workflow.start';
  return null;
}

function architectureMarkdown() {
  return ['# هيكل شيخة للذكاء والحاسب والشات والتطوير والبرمجة',
    '', 'حالة المستند: تصميم تشغيلي مرتبط بالأدوات، وليس شهادة تشغيل جميع الخدمات.',
    'المرجعية القيمية: الكتاب والسنة، مع إحالة الأحكام الشرعية إلى أهل الاختصاص. التفويض هنا تقني فقط.',
    '', '## مخطط التدفق', '```text',
    'طلب المستخدم -> صلاحيات وسرية -> خطة محدودة -> أداة مسموحة',
    '-> مصدر موثق -> نتيجة قابلة للفحص -> تقييم -> قرار بشري عند الأثر المرتفع', '```',
    '', '## الهيكل الإداري',
    'مالك المنظومة يعتمد النطاق؛ الحوكمة تراجع الصلاحيات؛ مسؤول كل مجال يتابع التنفيذ؛ مراجع مستقل يعتمد الإصدار.',
    ...DOMAINS.flatMap(domain => ['', '## ' + domain.name,
      '- المسؤول: ' + domain.owner, '- المكونات: ' + domain.components.join('، '),
      '- المدخلات: ' + domain.inputs, '- المخرجات: ' + domain.outputs,
      '- الضابط: ' + domain.gate, '- مؤشرات مقترحة، غير مقاسة بعد: ' + domain.kpi,
      '- روابط الأوامر: ' + domain.commands.map(id => '`' + id + '`').join('، ')]),
    '', '## مجالات مرتبطة للمراجعة والتصميم',
    'المجالات التالية عقود مسؤوليات ومراجعة؛ ليست خدمات مفعّلة بمجرد تعريفها.',
    ...REVIEW_AREAS.flatMap(area => ['', '### ' + area.label, area.chain, 'الحد: ' + area.boundary]),
    '', '## سلاسل التكامل',
    'الشات -> فحص محلي مقيد -> سجل بصمات -> مقارنة -> مستجد يحتاج مراجعة -> تقرير خاص',
    'يشمل فهرس الفحص Git وVisual وNode وDocker وStudio وModel Hub وFoundry واللغة وSDK وCLI وMCP والتجارة وRuntime وLLM وCloud والثقة والجنات والأمن.',
    'وجود مصدر لا يثبت تشغيله. المصادر لا تُحمّل كبرامج ولا تتصل بخدماتها من هذا المسار.',
    '', '## التشغيل والمراجعة',
    'الخطوات: تحديد الطلب، تصنيف البيانات، فحص الصلاحيات، تنفيذ محدود، تحقق من النتيجة، ثم حفظ اختياري محلي.',
    'سجل تقدم اللوحة ناتج عن أحداث فعلية؛ تسجيل أمر VS Code لا يثبت تشغيل خدمة خلفية.',
    'فحوص الإدارات أدوات محلية. دورة المهام المنظمة تضيف فحص المحرر والموصلات والمصادر والتوزيع، ووكيلين اختياريين لتصميم المتطلبات ومراجعتها عبر نموذج Ollama محلي تختاره وتوافق عليه. مسوداتهما ليست تنفيذًا أو تدريبًا أو مراجعة كود لم يُرسل.',
    'بحث الويب يفتح المتصفح بعد موافقة محددة على الاستعلام؛ لا تُرسل المحادثة أو الملفات معه.',
    'Git يفتح لوحة المصدر المحلية؛ مزامنة GitHub تحتاج مزودًا موثقًا وتفويضًا منفصلًا.',
    'المكتبة وثائق هندسية مضمّنة؛ ليست مكتبة خارجية مرخصة تلقائيًا.',
    'المحادثة مؤقتة في الجلسة. الذاكرة الدائمة ملاحظات تحفظ بموافقة صريحة في سجل خاص معزول لكل مشروع، دون تدريب أو مزامنة. صلاحيات 700/600 وليست تشفيرًا؛ صلاحية الاسترجاع 7 أو 30 أو 90 يومًا.',
    'دورة العقل والمنطق: هدف محدد، مرجعان مختاران كحد أقصى، مسودة Ollama ومراجعة تقرأ المسودة، ثم فهرس دليل. النبض مؤشر تقدم تقني وليس حياة أو وعيًا ذاتيًا. لا ترقية ذاتية أو صلاحية تنفيذ للنموذج.',
    'vLLM وLiteLLM موصلات فحص فهارس محلية اختيارية؛ LangGraph يُفحص توفر حزمته فقط. محرك الدورة الحالي Sheikha TaskEngine، ولا يُنسب تشغيله إلى مكتبة غير مستخدمة.',
    'التصدير والنسخ إجراء صريح؛ لا نشر خارجي ولا منح ملكية نماذج أو تراخيص بمجرد أسماء المكونات.',
    '', '## إدارة الرصد والفرص',
    'مصادر عامة محددة أو مرشحات مختارة -> سجل خاص -> كشف التغير -> تقييم الملاءمة والمنفعة والمخاطر والجدوى -> تقرير إدارة -> ملخص مستقل معتمد للمستخدمين.',
    'الرصد كل ساعة اختياري داخل جلسة الإضافة؛ لا ترقية أو تنزيل أوزان أو تدريب. درجة الأولوية تقدير مراجع لا إثبات نجاح. البريد واللوحة البعيدة يحتاجان موصلًا وهوية ومستلمين وعزلًا مستقلًا.',
    'تحسين التجربة من الاهتمامات وتقييم الفائدة المحلي؛ لا استخدام تلقائي لبيانات العملاء في التدريب. تقارير الفرص محفوظة خارج سجل المحادثة، ومسح المحادثة لا يمسح أرشيف الفرص.'
  ].join('\n');
}

class SheikhaChatWorkbench {
  constructor({ vscode, publish, getHistory, clearHistory, observation = new ObservationBridge(), modelAdapter = new LocalModelAdapter(), opportunityOptions = {}, cognitionOptions = {} }) {
    this.api = vscode; this.publish = publish; this.getHistory = getHistory; this.clearHistory = clearHistory;
    this.events = []; this.outputs = []; this.sources = []; this.tasks = [];
    this.busy = false; this.commands = new Set(); this.checkedAt = null;
    this.integration = new IntegrationJournal();
    this.observation = observation; this.reportSource = null; this.conversationSource = null; this.selectedReportSource = null;
    this.modelAdapter = modelAdapter;
    this.vscodeAdapter = new VSCodeAdapter(vscode);
    this.opportunities = new OpportunityController({ ...opportunityOptions, api: vscode,
      output: (...args) => this.output(...args), publish: () => this.emit() });
    this.workflow = new TaskEngine({ publish: () => this.emit() });
    this.cognition = new CognitiveController({ ...cognitionOptions, api: vscode, engine: this.workflow, modelAdapter,
      output: (...args) => this.output(...args), publish: () => this.emit() });
  }

  async refresh() {
    try { this.commands = new Set(await this.api.commands.getCommands(true)); }
    catch { this.commands = new Set(); }
    this.checkedAt = new Date().toISOString();
    return this.emit();
  }

  snapshot() {
    return { checkedAt: this.checkedAt, busy: this.busy,
      domains: DOMAINS.map(domain => ({ ...domain, registered: domain.commands.filter(id => this.commands.has(id)).length,
        total: domain.commands.length, backendVerified: false })),
      actions: ACTIONS.map(action => ({ ...action, available: action.id === 'search'
        ? this.commands.has('workbench.action.findInFiles') : action.id === 'github'
          ? this.commands.has('workbench.view.scm') : true })),
      events: this.events.map(item => ({ ...item })),
      outputs: this.outputs.map(({ id, title, createdAt, sha256 }) => ({ id, title, createdAt, sha256 })),
      sources: this.sources.map(item => ({ ...item })),
      tasks: this.tasks.map(item => ({ ...item, evidence: item.evidence ? { ...item.evidence } : null })),
      integration: this.integration.snapshot(),
      workflow: this.workflow.snapshot(),
      cognition: this.api.workspace?.isTrusted === true ? this.cognition.snapshot() : { status: 'WORKSPACE_TRUST_REQUIRED' },
      opportunities: this.api.workspace?.isTrusted === true ? this.opportunities.snapshot() : { enabled: false, items: [], lastError: 'WORKSPACE_TRUST_REQUIRED' },
      reportContext: this.currentReportSource() ? { title: this.currentReportSource().title,
        createdAt: this.currentReportSource().createdAt,
        selection: this.conversationSource ? 'LAST_CHAT_REPLY' : 'LAST_LOCAL_RESULT' } : null,
      reviewAreas: REVIEW_AREAS,
      memoryMessages: this.getHistory().length };
  }

  emit() { return this.publish({ command: 'workbenchState', data: this.snapshot() }); }

  output(title, content, { derived = false, kind = 'LOCAL_RESULT', language = 'markdown' } = {}) {
    if (!['markdown', 'json'].includes(language)) throw Error('OUTPUT_LANGUAGE_DENIED');
    if (language === 'json') { JSON.parse(content); if (String(content).length > 65536) throw Error('JSON_OUTPUT_LIMIT'); }
    const text = String(content).slice(0, 65536);
    const output = { id: crypto.randomUUID(), title, createdAt: new Date().toISOString(), content: text, kind, language, derived,
      sha256: crypto.createHash('sha256').update(text).digest('hex') };
    this.outputs.push(output);
    if (!derived) this.reportSource = output;
    this.outputs = this.outputs.slice(-12);
    return output;
  }

  currentReportSource() { return this.conversationSource || this.reportSource; }
  recordConversation(title, content, options) {
    this.conversationSource = this.output(title, content, options);
    this.selectedReportSource = null;
    return this.conversationSource;
  }
  acceptConversationOutput(output) {
    if (!output || output.derived) return;
    this.conversationSource = output; this.selectedReportSource = null;
  }

  contextReply(text, quickActions) {
    const normal = value => String(value || '').trim().replace(/[.!؟?]+$/u, '').trim();
    const quick = icon => normal(text) === normal(quickActions.find(item => item.icon === icon)?.prompt);
    const report = /^(?:اكتب(?:ي)?|أنشئ|حرر)\s+(?:لي\s+)?تقرير(?:ًا|ا)?(?:\s+(?:كامل(?:ًا|ا)?|مفصل(?:ًا|ا)?|متكامل(?:ًا|ا)?))?$/iu.test(normal(text));
    const selectedReport = normal(text) === 'اكتب تقرير عن المصدر المختار';
    if (report || quick('DOC') || selectedReport) {
      const answer = reportMarkdown(selectedReport ? this.selectedReportSource : this.currentReportSource(), quick('DOC'));
      this.output('تقرير عن آخر نتيجة', answer, { derived: true });
      return answer;
    }
    if (quick('SUM')) {
      const answer = 'ما المسألة التي تريد حسابها؟ أرسل السؤال والقيم والوحدات وما تريد إيجاده. لم يُنفذ حساب لأن الطلب لا يتضمن مسألة محددة. يمكنك اختيار «أدوات البيانات والحساب» لحساب الأثر أو اتزان الكميات.';
      this.recordConversation('تحديد المسألة', answer); return answer;
    }
    if (quick('RUN')) {
      const answer = 'ما المهمة البرمجية التي تريد إنجازها؟ أرسل وصف التغيير أو الخطأ والملف المعني والنتيجة المتوقعة. الطلب الحالي يحدد منهج العمل فقط، ولا يحدد مهمة. لم أعدّل ملفات أو أشغّل اختبارات، ولن أعتبر هذا القالب تفويضًا لإجراء عالي الأثر.';
      this.output('تحديد المهمة البرمجية', answer, { derived: true }); return answer;
    }
    if (this.outputs.some(item => item.content.trim() === String(text).trim())) {
      const answer = 'وصلت نسخة من نتيجة سابقة. ما المطلوب بشأنها: تقرير، مراجعة، أم تعديل محدد؟ لم يُفسر النص المقتبس كأمر تشغيل أو طلب جاهزية تجارية.';
      this.output('تحديد المطلوب من المادة', answer, { derived: true }); return answer;
    }
    return null;
  }

  source(label, type) {
    this.sources.push({ id: crypto.randomUUID(), label, type, observedAt: new Date().toISOString() });
    this.sources = this.sources.slice(-16);
  }

  async handle(message) {
    if (!message || typeof message !== 'object' || Array.isArray(message)) return false;
    if (Object.keys(message).some(key => !['command', 'action', 'id'].includes(key))) return false;
    if (message.action === 'watch.stop') { this.opportunities.stop(); await this.emit(); return true; }
    if (message.action === 'workflow.cancel') return this.workflow.cancel();
    if (message.action === 'workflow.detail') {
      const detail = this.workflow.detail(message.id);
      if (!detail) return false;
      const document = await this.api.workspace.openTextDocument({ content: JSON.stringify(detail, null, 2), language: 'json' });
      await this.api.window.showTextDocument(document); return true;
    }
    const action = ACTIONS.find(item => item.id === message.action);
    const outputAction = ['output.open', 'output.copy', 'output.export', 'output.attach'].includes(message.action);
    if ((!action && !outputAction) || this.busy) return false;
    if (Object.keys(message).some(key => !['command', 'action', 'id'].includes(key))) return false;
    this.busy = true;
    const event = { id: crypto.randomUUID(), label: action?.label || 'مخرج محلي', status: 'RUNNING',
      startedAt: new Date().toISOString() };
    this.events.push(event); this.events = this.events.slice(-24);
    try {
      await this.emit();
      const outcome = outputAction ? await this.useOutput(message.action, message.id) : await this.execute(action.id);
      event.status = outcome === false ? 'CANCELLED' : 'COMPLETED';
    } catch {
      event.status = 'FAILED';
      if (message.action.startsWith('cognition.')) this.output('تعذر إكمال العملية المعرفية', 'توقفت العملية عند أحد حدود الثقة أو السياق أو التخزين أو الخدمة. راجع تفاصيل المهام؛ لم تُنشأ نتيجة بديلة أو يُنفذ تدريب.');
      for (const task of this.tasks) {
        if (task.status === 'RUNNING') task.status = 'FAILED';
        else if (task.status === 'QUEUED') task.status = 'CANCELLED';
      }
    } finally {
      event.finishedAt = new Date().toISOString(); this.busy = false;
      try { await this.emit(); } catch { /* A disposed view must not hold the action lock. */ }
    }
    return event.status === 'COMPLETED';
  }

  async execute(action) {
    if (action.startsWith('cognition.')) return this.cognition.handle(action);
    if (action.startsWith('watch.')) return this.opportunities.handle(action);
    if (action === 'vscode.catalog' || action === 'vscode.execute') {
      const result = action === 'vscode.catalog' ? await this.vscodeAdapter.openCatalog() : await this.vscodeAdapter.chooseAndExecute();
      if (!result) return false;
      this.output('موصل شيخة لأدوات VS Code', JSON.stringify(result, null, 2), { language: 'json', kind: 'VSCODE_ADAPTER_RECEIPT' });
      return;
    }
    if (action === 'report.source') {
      const choices = [{ id: 'auto', label: 'آخر جواب في المحادثة', description: this.conversationSource?.title || 'لا جواب مسجل في هذه الجلسة' },
        ...this.outputs.filter(item => !item.derived).map(item => ({ id: item.id, label: item.title, description: item.createdAt }))];
      const selected = await this.api.window.showQuickPick(choices, { title: 'مصدر التقرير' });
      if (!selected) return false;
      if (selected.id === 'auto') { this.selectedReportSource = null; return; }
      const source = this.outputs.find(item => item.id === selected.id && !item.derived);
      if (!source) throw Error('REPORT_SOURCE_NOT_FOUND');
      this.selectedReportSource = source;
      this.output('تقرير عن المصدر المختار', reportMarkdown(source), { derived: true }); return;
    }
    if (action === 'workflow.start') return this.startWorkflow();
    if (action === 'integration' || action === 'delivery') {
      if (this.api.workspace.isTrusted !== true) throw new Error('WORKSPACE_TRUST_REQUIRED');
      const folders = (this.api.workspace.workspaceFolders || []).filter(folder => folder.uri.scheme === 'file');
      if (!folders.length) throw new Error('LOCAL_WORKSPACE_REQUIRED');
      let folder = folders[0];
      if (folders.length > 1) {
        const selected = await this.api.window.showQuickPick(folders.map((item, index) => ({ label: item.name, index })),
          { title: 'اختر مساحة العمل للفحص المحلي' });
        if (!selected) return false;
        folder = folders[selected.index];
        if (!folder) throw new Error('LOCAL_WORKSPACE_REQUIRED');
      }
      // Trust can change while the native picker is open.
      if (this.api.workspace.isTrusted !== true) throw new Error('WORKSPACE_TRUST_REQUIRED');
      const root = folder.uri.fsPath;
      if (action === 'delivery') {
        const report = await inspectDelivery(root);
        if (this.api.workspace.isTrusted !== true) throw new Error('WORKSPACE_TRUST_REQUIRED');
        this.output('تقرير حزم التوزيع V2', deliveryMarkdown(report));
        this.source('تقرير الحزم المحفوظ وبصمات الملفات الآن', 'LOCAL_PACKAGE_EVIDENCE'); return;
      }
      const report = await inspectWorkspace(root);
      if (this.api.workspace.isTrusted !== true) throw new Error('WORKSPACE_TRUST_REQUIRED');
      this.integration.accept(root, report);
      this.output('تقرير التكامل والمستجدات المحلية', integrationMarkdown(this.integration.snapshot()));
      this.source('بصمات مصادر مساحة العمل المختارة؛ دون تشغيلها', 'LOCAL_SOURCE_EVIDENCE');
      return;
    }
    if (action.startsWith('observation.')) return this.observe(action);
    if (action === 'architecture' || action === 'library') {
      this.output('هيكل شيخة والمعمارية والإدارة', architectureMarkdown(), { kind: 'PACKAGED_DESIGN_NOT_RUNTIME_EVIDENCE' });
      this.source('دليل المجالات الهندسية المضمّن', 'LOCAL_LIBRARY'); return;
    }
    if (action === 'memory') {
      this.output('حالة ذاكرة الجلسة', JSON.stringify({ messages: this.getHistory().length,
        persistence: 'SESSION_ONLY', contentsExported: false, automaticTraining: false }, null, 2)); return;
    }
    if (action === 'search' || action === 'github') {
      const id = action === 'search' ? 'workbench.action.findInFiles' : 'workbench.view.scm';
      if (!this.commands.has(id)) throw new Error('ADAPTER_UNAVAILABLE');
      await this.api.commands.executeCommand(id);
      this.source(action === 'search' ? 'فتح بحث المشروع المحلي' : 'فتح لوحة Git المحلية؛ لم يُتصل بـGitHub', 'LOCAL_VIEW'); return;
    }
    if (action === 'files') {
      if (this.api.workspace.isTrusted !== true) throw new Error('WORKSPACE_TRUST_REQUIRED');
      const selected = await this.api.window.showOpenDialog({ canSelectMany: false, canSelectFolders: false,
        openLabel: 'فتح محلي فقط' });
      if (!selected?.length) return false;
      const uri = selected[0];
      if (uri.scheme !== 'file') throw new Error('LOCAL_FILE_REQUIRED');
      const stat = await this.api.workspace.fs.stat(uri);
      if (stat.size > 256 * 1024 || stat.type !== 1) throw new Error('BOUNDED_TEXT_FILE_REQUIRED');
      const document = await this.api.workspace.openTextDocument(uri);
      await this.api.window.showTextDocument(document);
      this.source(path.basename(uri.fsPath), 'USER_SELECTED_LOCAL_FILE_NOT_SENT'); return;
    }
    if (action === 'web') {
      const query = await this.api.window.showInputBox({ title: 'بحث خارجي اختياري',
        prompt: 'سيُرسل الاستعلام وحده إلى DuckDuckGo بعد موافقتك، دون المحادثة أو الملفات.',
        validateInput: value => !value.trim() || value.length > 300 ? 'أدخل استعلامًا من 1 إلى 300 حرف' : null });
      if (!query) return false;
      if (!query.trim() || query.length > 300) throw new Error('INVALID_QUERY');
      const consent = await this.api.window.showWarningMessage('إرسال هذا الاستعلام إلى DuckDuckGo؟',
        { modal: true, detail: query }, 'إرسال الاستعلام');
      if (consent !== 'إرسال الاستعلام') return false;
      const opened = await this.api.env.openExternal(this.api.Uri.parse('https://duckduckgo.com/?q=' + encodeURIComponent(query)));
      if (!opened) throw new Error('BROWSER_NOT_OPENED');
      this.source('فتح بحث خارجي بتفويض؛ النتائج لم تُستورد أو تُتحقق', 'EXTERNAL_BROWSER_OPENED'); return;
    }
    if (action === 'review') return this.review();
    throw new Error('ACTION_NOT_ALLOWED');
  }

  async startWorkflow() {
    const trust = () => { if (this.api.workspace.isTrusted !== true) throw Error('WORKSPACE_TRUST_REQUIRED'); };
    trust();
    const folders = (this.api.workspace.workspaceFolders || []).filter(folder => folder.uri.scheme === 'file');
    if (!folders.length) throw Error('LOCAL_WORKSPACE_REQUIRED');
    let folder = folders[0];
    if (folders.length > 1) {
      const choice = await this.api.window.showQuickPick(folders.map((item, index) => ({ label: item.name, index })), { title: 'مساحة عمل خطة المهام' });
      if (!choice) return false;
      folder = folders[choice.index]; if (!folder) throw Error('LOCAL_WORKSPACE_REQUIRED');
    }
    const goal = await this.api.window.showInputBox({ title: 'مهمة شيخة المنظمة',
      prompt: 'صف هدف الفحص أو التصميم. هذه الدورة لا تعدل المشروع أو تنشره.',
      validateInput: value => value.trim() && value.length <= 2000 ? null : 'حدد مهمة من 1 إلى 2000 حرف' });
    if (goal === undefined) return false;
    if (!goal.trim() || goal.length > 2000) throw Error('BOUNDED_GOAL_REQUIRED');
    const mode = await this.api.window.showQuickPick([
      { label: 'فحص محلي بالأدوات', id: 'tools' }, { label: 'فحص + وكيلا تصميم ومراجعة محليان', id: 'model' }
    ], { title: 'نوع المنفذين' });
    if (!mode) return false;
    if (!['tools', 'model'].includes(mode.id)) throw Error('WORKFLOW_MODE_DENIED');
    trust(); let selection = null;
    if (mode.id === 'model') {
      const catalog = await this.modelAdapter.inspect();
      if (!catalog.models.length) throw Error('NO_LOCAL_MODELS');
      const choice = await this.api.window.showQuickPick(catalog.models.map(model => ({ label: model.name,
        description: model.parameters + ' · مثبت محليًا؛ الجودة والملكية غير مثبتتين هنا', name: model.name, digest: model.digest })), { title: 'النموذج المحلي المثبت' });
      if (!choice) return false;
      if (!catalog.models.some(model => model.name === choice.name && model.digest === choice.digest)) throw Error('MODEL_SELECTION_INVALID');
      const consent = await this.api.window.showWarningMessage('تشغيل وكيلي تصميم ومراجعة على Ollama المحلي؟',
        { modal: true, detail: 'النموذج: ' + choice.name + '\nالمهمة: ' + goal + '\nيرسل وصف المهمة فقط إلى 127.0.0.1:11434. طلبان بحد 512 رمزًا مولدًا لكل طلب. يستهلك موارد الجهاز؛ لا ملفات أو محادثات أو تنزيل أو تدريب أو تنفيذ للكود.' }, 'تشغيل محلي');
      if (consent !== 'تشغيل محلي') return false;
      selection = { model: choice.name, digest: choice.digest, consent: true };
    }
    trust();
    const definitions = workflowTasks({ api: this.api, root: folder.uri.fsPath, observation: this.observation,
      modelAdapter: this.modelAdapter, selection, goal });
    this.output('SHEIKHA_CHAT_PLAN.json', JSON.stringify({ schema: 'SHEIKHA_CHAT_TASK_PLAN_V1', goal,
      generatedAt: new Date().toISOString(), scope: 'LOCAL_READ_ONLY_AND_OPTIONAL_DRAFTS',
      tasks: definitions.map(({ execute, ...definition }) => definition), maxConcurrentTasks: 2, maxConcurrentModels: 1,
      model: selection?.model || null, taskDeadlineMilliseconds: 90000,
      modelMaxOutputTokensPerRequest: selection ? 512 : 0, sourceMutationAllowed: false, trainingAllowed: false,
      publicationAllowed: false, shellExecutionAllowed: false }, null, 2), { language: 'json', kind: 'TASK_PLAN' });
    const run = await this.workflow.start(goal, definitions);
    for (const task of run.tasks) {
      const detail = this.workflow.detail(task.id);
      // Small artifacts are exportable in full; large evidence remains available in the detail editor.
      const data = JSON.stringify(detail, null, 2);
      if (data.length <= 65536) this.output(task.label + '.json', data, { language: 'json', kind: 'TASK_RESULT', derived: true });
    }
    this.output('تقرير إغلاق دورة المهام', workflowMarkdown(run), { kind: 'WORKFLOW_CLOSURE' });
    this.source('أحداث المهام ونتائج الموصلات المحلية؛ لا شهادة إنتاج', 'LOCAL_WORKFLOW_EVIDENCE');
    return run.status !== 'CANCELLED';
  }

  async observe(action) {
    if (this.api.workspace.isTrusted !== true) throw new Error('WORKSPACE_TRUST_REQUIRED');
    try {
      if (action === 'observation.report') {
        const result = await this.observation.report();
        this.output('حالة البيانات والمستجدات', '# تقرير الخدمة المحلية\n\nلقطة من خدمة محلية لمستخدم نظام التشغيل، لا مصادقة متعددة العملاء ولا شهادة جاهزية إنتاج. لم تُجلب أخبار خارجية أو تُحفظ بيانات.\n\n```json\n' + JSON.stringify(result, null, 2) + '\n```');
        this.source('خدمة البيانات المحلية 8142؛ لقطة وقت الطلب فقط', 'LOCAL_SERVICE_RESPONSE'); return;
      }
      if (action === 'observation.open') {
        const pages = [{ label: 'البيانات', path: '/data' }, { label: 'المستجدات', path: '/news' }, { label: 'شات الأدوات', path: '/chat' }];
        const selected = await this.api.window.showQuickPick(pages, { title: 'مساحات الخدمة المحلية' });
        if (!selected) return false;
        if (!pages.some(page => page.path === selected.path)) throw new Error('LOCAL_PAGE_DENIED');
        if (this.api.workspace.isTrusted !== true) throw new Error('WORKSPACE_TRUST_REQUIRED');
        return this.api.env.openExternal(this.api.Uri.parse(ORIGIN + selected.path));
      }
      const state = await this.observation.inspect();
      const selected = await this.api.window.showQuickPick(state.tools, { title: 'أداة محلية؛ لا حفظ ولا إرسال إلى نموذج' });
      if (!selected) return false;
      const tool = TOOLS.find(item => item.id === selected.id);
      if (!tool) throw new Error('LOCAL_TOOL_DENIED');
      let input = {};
      if (Object.keys(tool.example).length) {
        const value = await this.api.window.showInputBox({ title: tool.label, value: JSON.stringify(tool.example),
          prompt: 'أدخل قيمك بصيغة JSON. القيم المعروضة أمثلة وليست قياسات. تُرسل للخدمة المحلية 8142 فقط.',
          validateInput: text => { try { const data = JSON.parse(text); return data && typeof data === 'object' && !Array.isArray(data) && text.length <= 65536 ? null : 'يلزم كائن JSON محدود'; } catch { return 'JSON غير صالح'; } } });
        if (value === undefined) return false;
        if (value.length > 65536) throw new Error('INPUT_LIMIT');
        input = JSON.parse(value);
      }
      if (this.api.workspace.isTrusted !== true) throw new Error('WORKSPACE_TRUST_REQUIRED');
      const result = await this.observation.execute(tool.id, input);
      this.output(tool.label, '# ' + tool.label + '\n\nالنتيجة من أداة محلية حتمية؛ ليست استدلال LLM أو تصديقًا مستقلًا للمراجع.\n\n```json\n' + JSON.stringify(result, null, 2) + '\n```');
      this.source(tool.label + '؛ وقت الطلب فقط', 'LOCAL_DETERMINISTIC_TOOL');
    } catch {
      this.output('تعذر طلب الخدمة المحلية', 'لم تكتمل قراءة الخدمة أو تنفيذ الأداة المحلية على 8142. تحقق من تشغيل الخدمة وصحة المدخلات وحدود الصلاحية. لم يُستخدم نموذج بديل ولم تُعرض لقطة قديمة على أنها حديثة.');
      throw new Error('LOCAL_OBSERVATION_REQUEST_FAILED');
    }
  }

  async review() {
    await this.refresh();
    this.tasks = DOMAINS.map(domain => ({ id: domain.id, label: domain.name, status: 'QUEUED', evidence: null }));
    for (const task of this.tasks) {
      task.status = 'RUNNING'; await this.emit();
      const domain = DOMAINS.find(item => item.id === task.id);
      const registered = domain.commands.filter(id => this.commands.has(id));
      task.evidence = { registeredCommands: registered, total: domain.commands.length, backendVerified: false };
      if (task.id === 'compute') Object.assign(task.evidence, { cpuThreads: os.cpus().length,
        totalMemoryBytes: os.totalmem(), freeMemoryBytes: os.freemem(), measuredAt: new Date().toISOString() });
      if (task.id === 'chat') task.evidence.sessionMessages = this.getHistory().length;
      if (task.id === 'programming') {
        const diagnostics = this.api.languages.getDiagnostics();
        task.evidence.diagnostics = { errors: 0, warnings: 0 };
        for (const [, values] of diagnostics) for (const diagnostic of values) {
          if (diagnostic.severity === 0) task.evidence.diagnostics.errors++;
          if (diagnostic.severity === 1) task.evidence.diagnostics.warnings++;
        }
      }
      task.status = registered.length === domain.commands.length ? 'CHECKED' : 'NEEDS_CONFIGURATION';
      await this.emit();
    }
    this.source('VS Code وقياسات النظام المحلية', 'LOCAL_MEASUREMENT');
    this.output('تقرير المراجعة المحلية', JSON.stringify({ checkedAt: new Date().toISOString(),
      tasks: this.tasks, llmAgentsExecuted: false, productionReady: false, externalRequests: 0 }, null, 2));
  }

  async useOutput(action, id) {
    const output = this.outputs.find(item => item.id === id);
    if (!output) throw new Error('OUTPUT_NOT_FOUND');
    if (action === 'output.open') {
      const doc = await this.api.workspace.openTextDocument({ content: output.content, language: output.language || 'markdown' });
      await this.api.window.showTextDocument(doc);
    } else if (action === 'output.copy') {
      await this.api.env.clipboard.writeText(output.content);
    } else if (action === 'output.attach') {
      await this.publish({ command: 'prefill', text: output.content, autoSend: false });
    } else {
      const extension = output.language === 'json' ? 'json' : 'md';
      const destination = await this.api.window.showSaveDialog({ title: 'تصدير محلي اختياري', filters: { [output.language === 'json' ? 'JSON' : 'Markdown']: [extension] } });
      if (!destination) return false;
      if (destination.scheme !== 'file' || path.extname(destination.fsPath).toLowerCase() !== '.' + extension) {
        throw new Error('LOCAL_MARKDOWN_DESTINATION_REQUIRED');
      }
      // Export is explicit and private; never overwrite a file or follow a final symlink.
      const fd = await fs.promises.open(destination.fsPath,
        fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_NOFOLLOW, 0o600);
      try { await fd.writeFile(output.content, 'utf8'); }
      finally { await fd.close(); }
    }
  }

  async reset() {
    if (this.busy) return false;
    this.opportunities.stop();
    this.clearHistory(); this.events = []; this.outputs = []; this.sources = []; this.tasks = [];
    this.integration.reset();
    this.reportSource = null;
    this.conversationSource = null; this.selectedReportSource = null;
    this.workflow.reset();
    await this.emit(); return true;
  }

  async recordTool(message) {
    if (message.command === 'toolStart') {
      this.events.push({ id: crypto.randomUUID(), toolId: message.toolId, label: 'طلب: ' + message.label,
        status: 'RUNNING', startedAt: new Date().toISOString() });
      this.events = this.events.slice(-24);
    } else if (message.command === 'toolResult') {
      const event = [...this.events].reverse().find(item => item.toolId === message.toolId && item.status === 'RUNNING');
      if (event) { event.status = message.success ? 'COMPLETED' : 'FAILED'; event.finishedAt = new Date().toISOString(); }
    }
    await this.emit();
  }
}

module.exports = { DOMAINS, ACTIONS, architectureMarkdown, localRequestAction, SheikhaChatWorkbench };
