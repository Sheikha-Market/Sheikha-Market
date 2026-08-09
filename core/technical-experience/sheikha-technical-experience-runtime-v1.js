'use strict';

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

const {
  buildUnifiedCommerceRuntime
} = require('../commerce/sheikha-unified-commerce-runtime-v1');

const ROOT = path.resolve(__dirname, '..', '..');

const FILES = Object.freeze({
  contract: 'runtime/technical-experience/v1/contracts/' +
    'sheikha-technical-experience-v1-contract.json',
  entitlements: 'runtime/technical-experience/v1/registries/' +
    'product-documentation-entitlements.json',
  productSheets: 'runtime/commercial-product-layer/v1/registries/' +
    'product-sheets-registry.json',
  productRuntime: 'runtime/product-runtime/v1/' +
    'sheikha-unified-product-runtime-v1-report.json',
  siteRegistry: 'runtime/site/v2/' +
    'sheikha-site-route-domain-registry-v2.json',
  liveRuntime: 'runtime/live-realtime-fabric/v1/' +
    'sheikha-live-realtime-fabric-v1.js'
});

const LEVELS = Object.freeze({
  guided: {
    id: 'guided',
    nameAr: 'مسار واضح',
    audienceAr: 'لمن يعرف أساسيات التقنية ويريد تشغيل المنتج بطريقة مباشرة.',
    outcomeAr: 'فهم الغرض والمدخلات والمخرجات وخطوة البدء الأولى.',
    toolsAr: ['واجهة المنتج', 'حالة التشغيل', 'أمثلة الإدخال والإخراج']
  },
  practitioner: {
    id: 'practitioner',
    nameAr: 'مسار تطبيقي',
    audienceAr: 'للمهندس أو المحلل أو مسؤول التشغيل الذي يدمج المنتج مع نظام قائم.',
    outcomeAr: 'فهم المعمارية والواجهات والمراقبة وحالات الفشل والتكامل.',
    toolsAr: ['واجهات API', 'مخطط التدفق', 'مؤشرات التشغيل', 'اختبارات التكامل']
  },
  expert: {
    id: 'expert',
    nameAr: 'مسار متقدم',
    audienceAr: 'للمعماري والباحث ومهندس الأداء أو الذكاء الصناعي.',
    outcomeAr: 'تحليل النماذج والقياسات والحدود والأدلة وخيارات التوسع.',
    toolsAr: ['نماذج القياس', 'رسم الاعتماديات', 'أدلة الاختبار', 'خطط الاستعادة']
  }
});

const SHARED_FORMULAS = Object.freeze([
  {
    id: 'latency',
    nameAr: 'زمن الاستجابة',
    expression: 'L = t_done - t_start',
    explanationAr: 'الزمن المرصود من بداية الطلب حتى اكتمال النتيجة، ويُعرض بالمللي ثانية.'
  },
  {
    id: 'throughput',
    nameAr: 'معدل نقل البيانات',
    expression: 'T = B_transferred / delta_t',
    explanationAr: 'حجم البيانات المنقولة مقسومًا على زمن النقل المرصود، دون ادعاء سرعة الشبكة الكلية.'
  },
  {
    id: 'evidence-coverage',
    nameAr: 'تغطية الأدلة',
    expression: 'C_e = N_verified / N_required x 100',
    explanationAr: 'نسبة الأدلة المتحققة إلى الأدلة المطلوبة لاتخاذ قرار محكوم.'
  }
]);

const TECHNICAL_PROFILES = Object.freeze({
  'PROD-GOV-001': {
    disciplineAr: 'هندسة السياسات والقرار',
    mechanismAr: 'يحوّل الطلب إلى قرار قابل للتتبع عبر تحقق المخطط والسياسة والأدلة والموافقة.',
    patternAr: 'بوابة سياسة مركزية مع سجل أدلة غير قابل للتجاوز من العميل.',
    inputsAr: ['طلب محكوم', 'هوية الفاعل', 'السياسات', 'الأدلة'],
    outputsAr: ['قرار مسموح أو مرفوض', 'أسباب القرار', 'سجل تدقيق'],
    metric: ['policy-coverage', 'C_p = N_enforced / N_applicable x 100', 'نسبة السياسات المطبقة إلى السياسات الواجبة.']
  },
  'PROD-STAB-001': {
    disciplineAr: 'هندسة الاعتمادية والأداء',
    mechanismAr: 'يراقب الانحراف والاختبارات وحالة التشغيل ليمنع التغيير غير المستقر.',
    patternAr: 'حلقة قياس ومقارنة وبوابة قبول قبل الترقية.',
    inputsAr: ['قياسات التشغيل', 'نتائج الاختبارات', 'خط الأساس'],
    outputsAr: ['حالة الاستقرار', 'الانحرافات', 'قرار القبول'],
    metric: ['failure-rate', 'R_f = N_failed / N_total x 100', 'نسبة الفحوص الفاشلة إلى مجموع الفحوص.']
  },
  'PROD-DEC-001': {
    disciplineAr: 'هندسة المعرفة والقرار',
    mechanismAr: 'يربط القرار بسبب قابل للفحص ودليل وقياس ومالك مسؤول.',
    patternAr: 'رسم معرفي للقرار مع روابط مصدر وقياس.',
    inputsAr: ['مسألة', 'خيارات', 'أدلة', 'قياسات'],
    outputsAr: ['قرار مفسر', 'سلسلة استدلال', 'روابط الأدلة'],
    metric: ['traceability', 'C_t = N_traceable / N_decisions x 100', 'نسبة القرارات التي تملك سببًا ودليلًا وقياسًا.']
  },
  'PROD-CAP-001': {
    disciplineAr: 'هندسة القدرات والاعتماديات',
    mechanismAr: 'يسجل القدرة وعقدها ومدخلاتها ومخرجاتها وحدود تشغيلها قبل إتاحتها.',
    patternAr: 'سجل قدرات مع رسم اعتماديات وبوابة تفعيل.',
    inputsAr: ['تعريف القدرة', 'العقد', 'الاعتماديات', 'الاختبارات'],
    outputsAr: ['قدرة مسجلة', 'حالة نضج', 'قرار تفعيل'],
    metric: ['verified-capabilities', 'C_v = N_verified / N_registered x 100', 'نسبة القدرات المتحققة إلى المسجلة.']
  },
  'PROD-ENG-001': {
    disciplineAr: 'هندسة البرمجيات والجودة',
    mechanismAr: 'ينفذ فحوص الصياغة والعقود والاختبارات ويجمعها في قرار مراجعة واحد.',
    patternAr: 'خط تحقق متعدد المراحل مع إيقاف مبكر عند الخطأ.',
    inputsAr: ['تغيير برمجي', 'عقود الواجهة', 'حزمة الاختبارات'],
    outputsAr: ['نتيجة مراجعة', 'أخطاء محددة', 'أدلة نجاح'],
    metric: ['escaped-defects', 'R_e = N_post_release / N_total_defects x 100', 'نسبة العيوب المكتشفة بعد الإصدار.']
  },
  'PROD-AICL-001': {
    disciplineAr: 'هندسة بيانات ونماذج الذكاء الصناعي',
    mechanismAr: 'ينظم البيانات والنماذج والأدوات والوكلاء ضمن مسار مراقب وقابل للاستعادة.',
    patternAr: 'خطوط بيانات ونماذج موزعة تحت مستوى تحكم محكوم.',
    inputsAr: ['بيانات موثقة', 'نموذج', 'سياسة توجيه', 'موارد حوسبة'],
    outputsAr: ['نتيجة نموذج', 'قياسات جودة', 'أثر تشغيل'],
    metric: ['pipeline-utilization', 'U_p = t_busy / t_observed x 100', 'نسبة زمن انشغال المسار إلى زمن المراقبة.']
  },
  'PROD-UGITAI-001': {
    disciplineAr: 'هندسة مستويات التحكم الموزعة',
    mechanismAr: 'يوحد توجيه البيانات والنماذج والوكلاء مع سياسة مركزية وتنفيذ موزع.',
    patternAr: 'مستوى تحكم مركزي وعقد تنفيذ لامركزية محدودة الصلاحية.',
    inputsAr: ['طلب مجال', 'قدرات مسجلة', 'سياسة', 'حالة الموارد'],
    outputsAr: ['خطة توجيه', 'نتيجة محكومة', 'أثر وأدلة'],
    metric: ['control-coverage', 'C_c = N_governed / N_active_paths x 100', 'نسبة المسارات النشطة الواقعة تحت بوابة التحكم.']
  },
  'PROD-SUPPLY-CHAIN': {
    disciplineAr: 'بحوث العمليات وهندسة سلاسل الإمداد',
    mechanismAr: 'يربط الطلب والمورد والمخزون والنقل والتسليم في سجل أحداث واحد.',
    patternAr: 'سلسلة أحداث قطاعية مع مراقبة مركزية للمخاطر.',
    inputsAr: ['طلب', 'عرض مورد', 'مخزون', 'مسار نقل'],
    outputsAr: ['خطة إمداد', 'حالة شحنة', 'تنبيه مخاطر'],
    metric: ['fill-rate', 'F = Q_fulfilled / Q_requested x 100', 'نسبة الكمية الملباة إلى الكمية المطلوبة.']
  },
  'PROD-ENERGY': {
    disciplineAr: 'هندسة الطاقة والتحسين',
    mechanismAr: 'يقارن تدفق الطاقة والطلب والإمداد والمخاطر قبل التوصية التشغيلية.',
    patternAr: 'تحليل تدفقات وقيود مع قرار بشري عند الأثر العالي.',
    inputsAr: ['طلب طاقة', 'مصادر', 'قيود تشغيل', 'قياسات'],
    outputsAr: ['مؤشر كفاءة', 'سيناريو إمداد', 'حدود القرار'],
    metric: ['energy-efficiency', 'eta = E_useful / E_input x 100', 'نسبة الطاقة المفيدة إلى الطاقة الداخلة.']
  },
  'PROD-MARKETPLACE': {
    disciplineAr: 'هندسة الأسواق ونظم المعلومات',
    mechanismAr: 'ينظم الكتالوج وطلبات الأسعار والعروض والعقود دون اختلاق سعر أو بيع حي.',
    patternAr: 'سوق مركزي للعرض والاكتشاف مع أطراف مورد ومشترٍ مستقلة.',
    inputsAr: ['منتج موثق', 'طلب عرض', 'بيانات طرف'],
    outputsAr: ['نتيجة بحث', 'خطة طلب عرض', 'أثر مراجعة'],
    metric: ['quote-cycle', 'L_q = t_quote - t_rfq', 'المدة بين إنشاء طلب العرض واستلام العرض، عند توفر بيانات حية.']
  },
  'PROD-RIYADH-ALJANNAH': {
    disciplineAr: 'هندسة المعرفة والتعليم',
    mechanismAr: 'ينظم المفاهيم والمسارات والمصادر والتجارب في رسم معرفي قابل للتدرج.',
    patternAr: 'رسم معرفة ومسارات تعلم مع مراجعة بشرية للمحتوى المتخصص.',
    inputsAr: ['مفهوم', 'مصدر', 'مستوى متعلم', 'هدف تعلم'],
    outputsAr: ['مسار تعلم', 'روابط معرفة', 'اختبار فهم'],
    metric: ['knowledge-coverage', 'C_k = N_linked / N_required x 100', 'نسبة المفاهيم المرتبطة بمصادرها إلى المفاهيم المطلوبة.']
  },
  'PROD-INNOVATION-LAB': {
    disciplineAr: 'هندسة النظم والابتكار',
    mechanismAr: 'يفكك المسألة إلى فرضيات وتجارب وقدرات ثم يربط النتيجة بمنتج قابل للقياس.',
    patternAr: 'مسار فرضية وتجربة وقرار وتحويل إلى منتج.',
    inputsAr: ['مسألة', 'فرضية', 'قيود', 'دليل تجربة'],
    outputsAr: ['نتيجة تجربة', 'قرار استمرار', 'مواصفات منتج'],
    metric: ['conversion-rate', 'C_i = N_productized / N_validated x 100', 'نسبة التجارب المحققة التي تحولت إلى منتج.']
  },
  'PROD-CLOUD-SAAS': {
    disciplineAr: 'هندسة البرمجيات السحابية متعددة المستأجرين',
    mechanismAr: 'يعزل المستأجر والهوية والبيانات ويقدم خدمات السوق والإمداد عبر واجهات محكومة.',
    patternAr: 'خدمات مركزية محكومة مع عزل منطقي ومسارات قطاعية.',
    inputsAr: ['هوية مستأجر', 'طلب خدمة', 'سياسة وصول'],
    outputsAr: ['استجابة خدمة', 'قياس استخدام', 'سجل تدقيق'],
    metric: ['availability', 'A = N_success / N_checks x 100', 'نسبة فحوص الخدمة الناجحة إلى مجموع الفحوص المرصودة.']
  }
});

const SHARED_GLOSSARY = Object.freeze([
  { termAr: 'زمن الاستجابة', termEn: 'Latency', synonymsAr: ['التأخر', 'مدة الطلب'], definitionAr: 'الوقت بين بدء الطلب ووصول النتيجة.' },
  { termAr: 'معدل النقل', termEn: 'Throughput', synonymsAr: ['الإنتاجية', 'سرعة نقل الحمولة'], definitionAr: 'كمية البيانات أو الأعمال المنجزة في وحدة زمن.' },
  { termAr: 'العقد البرمجي', termEn: 'Software Contract', synonymsAr: ['عقد الواجهة', 'مخطط البيانات'], definitionAr: 'تعريف قابل للفحص للمدخلات والمخرجات والقيود.' },
  { termAr: 'مستوى التحكم', termEn: 'Control Plane', synonymsAr: ['طبقة الإدارة', 'طبقة التوجيه'], definitionAr: 'المستوى الذي يحدد السياسات والمسارات دون تنفيذ كل العمل بنفسه.' },
  { termAr: 'مستوى البيانات', termEn: 'Data Plane', synonymsAr: ['طبقة التنفيذ', 'مسار البيانات'], definitionAr: 'المستوى الذي ينقل البيانات أو ينفذ العملية المصرح بها.' },
  { termAr: 'الاستحقاق', termEn: 'Entitlement', synonymsAr: ['صلاحية المنتج', 'حق الوصول'], definitionAr: 'منح موثق يربط مستخدمًا بمنتج ومدة ونطاق وصول.' }
]);

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

function fileExists(relativePath) {
  return fs.existsSync(path.join(ROOT, relativePath));
}

function normalizeLevel(level) {
  const value = String(level || 'guided').trim().toLowerCase();
  if (!LEVELS[value]) throw new Error(`Unsupported knowledge level: ${value}`);
  return value;
}

function getProduct(productId) {
  const id = String(productId || '').trim().toUpperCase();
  if (!/^[A-Z0-9-]{3,80}$/.test(id)) return null;
  const runtime = buildUnifiedCommerceRuntime();
  return runtime.catalog.find((product) => product.id === id) || null;
}

function buildArchitectureModel() {
  return {
    model: 'GOVERNED_HYBRID_CENTRAL_AND_DECENTRALIZED',
    central: [
      { id: 'governance', nameAr: 'الحوكمة والسياسات', status: 'ACTIVE_LOCAL' },
      { id: 'catalog', nameAr: 'كتالوج المنتجات', status: 'ACTIVE_LOCAL' },
      { id: 'identity', nameAr: 'الهوية والاستحقاق', status: 'DEFAULT_DENY' },
      { id: 'audit', nameAr: 'الأدلة والتدقيق', status: 'ACTIVE_LOCAL' }
    ],
    decentralized: [
      { id: 'browser', nameAr: 'قياس المتصفح', status: 'ACTIVE_WHEN_PAGE_OPEN' },
      { id: 'sector-adapters', nameAr: 'موصلات القطاعات', status: 'REGISTERED_CONTRACTS' },
      { id: 'local-analysis', nameAr: 'التحليل المحلي', status: 'ACTIVE_LOCAL' },
      { id: 'event-consumers', nameAr: 'مستهلكو الأحداث', status: 'REGISTERED_CONTRACTS' }
    ],
    sharedFlow: [
      'collect', 'schema-validate', 'govern', 'analyze', 'explain', 'audit', 'deliver'
    ],
    boundaries: {
      externalFederationVerified: false,
      decentralizedExecutionUniversallyActive: false,
      blockchainClaimed: false,
      centralPolicyBypassAllowed: false
    }
  };
}

function buildTechnologyStatus(options = {}) {
  const contract = readJson(FILES.contract);
  const commerce = buildUnifiedCommerceRuntime({ generatedAt: options.generatedAt });
  const productRuntime = readJson(FILES.productRuntime);
  const siteRegistry = readJson(FILES.siteRegistry);
  const entitlements = readJson(FILES.entitlements);
  const productsWithProfiles = commerce.catalog.filter((product) =>
    Boolean(TECHNICAL_PROFILES[product.id])
  );

  const layers = [
    { id: 'commerce', nameAr: 'التجارة والاقتصاد', status: commerce.status, verified: commerce.passed },
    { id: 'products', nameAr: 'المنتجات', status: productRuntime.status, verified: productRuntime.passed === true },
    { id: 'technical-docs', nameAr: 'الشرح التقني', status: 'ACTIVE_WITH_PUBLIC_PREVIEW', verified: productsWithProfiles.length === commerce.catalog.length },
    { id: 'live-measurement', nameAr: 'القياس الحي', status: 'ACTIVE_LOCAL_OBSERVATION', verified: true },
    { id: 'ai-live', nameAr: 'مسار الذكاء الحي', status: fileExists(FILES.liveRuntime) ? 'ROUTE_CONFIGURED_NOT_PROBED' : 'NOT_FOUND', verified: fileExists(FILES.liveRuntime) },
    { id: 'entitlement', nameAr: 'استحقاق ما بعد الشراء', status: entitlements.status, verified: entitlements.status === 'ACTIVE_DEFAULT_DENY' }
  ];

  return {
    schemaVersion: '1.0.0',
    system: contract.system,
    generatedAt: options.generatedAt || new Date().toISOString(),
    status: layers.every((layer) => layer.verified)
      ? 'ACTIVE_WITH_MEASURED_LOCAL_FOUNDATIONS'
      : 'PARTIAL_WITH_EXPLICIT_GAPS',
    routes: contract.routes,
    coverage: {
      products: commerce.coverage.products,
      technicalProfiles: productsWithProfiles.length,
      sectors: commerce.coverage.sectors,
      marketGroups: commerce.coverage.marketGroups,
      workflows: commerce.coverage.workflows,
      activeDocumentationEntitlements: entitlements.grants.filter((grant) =>
        grant.status === 'ACTIVE'
      ).length,
      publicCanonicalPages: siteRegistry.canonicalRoutes.filter((route) =>
        route.visibility === 'PUBLIC'
      ).length
    },
    layers,
    architecture: buildArchitectureModel(),
    ai: {
      liveEndpoint: '/api/sheikha/live/chat/v1',
      statusEndpoint: '/api/sheikha/live-realtime-fabric/v1/status',
      configuredModel: process.env.SHEIKHA_CORE_MODEL || 'Sheikha-Core',
      deepModelMode: 'background',
      modelReachability: 'NOT_PROBED_BY_STATUS_BUILD'
    },
    measurement: contract.measurementPolicy,
    governance: contract.governance,
    claimBoundary: 'Local routes, contracts, and process metrics are reported. External federation, universal deployment, model reachability, purchase, and certification require separate evidence.'
  };
}

async function buildRuntimeTelemetry(options = {}) {
  const started = performance.now();
  await new Promise((resolve) => setTimeout(resolve, 0));
  const observedLagMs = performance.now() - started;
  const memory = process.memoryUsage();
  const cpu = process.cpuUsage();
  const loop = performance.eventLoopUtilization();
  const mib = (bytes) => Number((bytes / 1024 / 1024).toFixed(2));

  return {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_TECHNICAL_LIVE_TELEMETRY_V1',
    generatedAt: options.generatedAt || new Date().toISOString(),
    process: {
      pid: process.pid,
      uptimeSeconds: Number(process.uptime().toFixed(2)),
      memoryMiB: {
        rss: mib(memory.rss),
        heapUsed: mib(memory.heapUsed),
        heapTotal: mib(memory.heapTotal),
        external: mib(memory.external)
      },
      cpuCumulativeMs: {
        user: Number((cpu.user / 1000).toFixed(2)),
        system: Number((cpu.system / 1000).toFixed(2))
      },
      eventLoop: {
        observedTurnDelayMs: Number(observedLagMs.toFixed(3)),
        utilizationPercent: Number((loop.utilization * 100).toFixed(2)),
        measurementScope: 'CURRENT_NODE_PROCESS'
      }
    },
    clientMeasurementContract: {
      roundTripFormula: 'RTT = t_response_received - t_request_sent',
      transferFormula: 'T = response_bytes / RTT',
      browserMustMeasure: true
    },
    ai: {
      routeConfigured: fileExists(FILES.liveRuntime),
      endpoint: '/api/sheikha/live/chat/v1',
      reachabilityProbed: false
    },
    secretsIncluded: false,
    syntheticBenchmarkClaimed: false
  };
}

function buildProductPreview(productId, options = {}) {
  const product = getProduct(productId);
  if (!product) return null;
  const level = normalizeLevel(options.level);
  const profile = TECHNICAL_PROFILES[product.id];
  const metric = {
    id: profile.metric[0],
    expression: profile.metric[1],
    explanationAr: profile.metric[2]
  };

  return {
    system: 'SHEIKHA_PRODUCT_TECHNICAL_PREVIEW_V1',
    product: {
      id: product.id,
      nameAr: product.nameAr,
      nameEn: product.nameEn,
      summaryAr: product.summaryAr,
      kind: product.kind,
      availability: product.availability,
      pricingMode: product.pricing.mode
    },
    knowledgeLevel: LEVELS[level],
    disciplineAr: profile.disciplineAr,
    mechanismAr: profile.mechanismAr,
    architecturePatternAr: profile.patternAr,
    inputsAr: profile.inputsAr,
    outputsAr: profile.outputsAr,
    sampleMeasurement: metric,
    sharedMeasurements: SHARED_FORMULAS,
    glossary: SHARED_GLOSSARY,
    availablePaths: Object.values(LEVELS),
    evidence: [product.source, FILES.productSheets, FILES.contract],
    fullDossier: {
      access: 'VERIFIED_ENTITLEMENT_REQUIRED',
      modules: [
        'interface-contracts',
        'deployment-runbook',
        'failure-and-recovery',
        'complete-test-evidence',
        'advanced-measurement-models'
      ]
    },
    boundaries: {
      purchaseCompleted: false,
      operationalDeploymentClaimed: false,
      externalCertificationClaimed: false,
      automatedReligiousRuling: false
    }
  };
}

function listProductPreviews(options = {}) {
  const level = normalizeLevel(options.level);
  return buildUnifiedCommerceRuntime().catalog.map((product) =>
    buildProductPreview(product.id, { level })
  );
}

function resolveDocumentationEntitlement(input = {}, options = {}) {
  const subjectId = String(input.subjectId || '').trim();
  const productId = String(input.productId || '').trim().toUpperCase();
  const source = options.registry || readJson(FILES.entitlements);
  const grants = Array.isArray(source.grants) ? source.grants : [];
  if (!subjectId) {
    return { authorized: false, status: 'AUTHENTICATED_SUBJECT_REQUIRED' };
  }

  const grant = grants.find((candidate) => {
    const evidence = candidate.evidence || {};
    const hasCommercialEvidence = Boolean(
      evidence.purchaseOrderId || evidence.signedContractId
    );
    return candidate.status === 'ACTIVE' &&
      String(candidate.subjectId) === subjectId &&
      Array.isArray(candidate.productIds) &&
      (candidate.productIds.includes(productId) || candidate.productIds.includes('*')) &&
      evidence.verificationStatus === 'VERIFIED' &&
      hasCommercialEvidence;
  });

  if (!grant) {
    return {
      authorized: false,
      status: 'DOCUMENTATION_ENTITLEMENT_REQUIRED',
      registryStatus: source.status || 'UNKNOWN'
    };
  }

  return {
    authorized: true,
    status: 'DOCUMENTATION_ENTITLEMENT_VERIFIED',
    grantId: grant.id,
    productId,
    accessLevel: grant.accessLevel || 'FULL_TECHNICAL_DOSSIER'
  };
}

function buildProductDossier(productId, input = {}, options = {}) {
  const preview = buildProductPreview(productId, { level: input.level || 'expert' });
  if (!preview) return null;
  const entitlement = resolveDocumentationEntitlement({
    subjectId: input.subjectId,
    productId: preview.product.id
  }, options);

  if (!entitlement.authorized) {
    return { authorized: false, entitlement, preview };
  }

  return {
    authorized: true,
    entitlement,
    dossier: {
      system: 'SHEIKHA_PRODUCT_TECHNICAL_DOSSIER_V1',
      product: preview.product,
      engineering: {
        disciplineAr: preview.disciplineAr,
        mechanismAr: preview.mechanismAr,
        architecturePatternAr: preview.architecturePatternAr,
        inputsAr: preview.inputsAr,
        outputsAr: preview.outputsAr,
        interfaces: [
          '/api/sheikha/technical-experience/v1/status',
          `/api/sheikha/technical-experience/v1/products/${preview.product.id}/preview`,
          '/api/sheikha/commerce/v1/operations/plan'
        ]
      },
      scienceAndMathematics: {
        methodsAr: ['هندسة النظم', 'نظرية الرسوم', 'القياس التجريبي', 'تحليل المخاطر', 'التحقق القابل للتكرار'],
        formulas: [...SHARED_FORMULAS, preview.sampleMeasurement],
        uncertaintyPolicyAr: 'كل قياس يذكر نطاقه ومصدره وزمنه، ولا يعمم نتيجة محلية على بيئة أخرى.'
      },
      operations: {
        deploymentPathAr: ['تحقق المتطلبات', 'تهيئة الهوية', 'ربط الواجهة', 'اختبار محلي', 'مراجعة بشرية', 'ترقية محكومة'],
        failureAndRecoveryAr: ['إيقاف العملية المتأثرة', 'حفظ الأثر', 'العودة لآخر حالة متحققة', 'إعادة الاختبار قبل الفتح'],
        testCommands: ['node --check', 'targeted Jest', 'npm run lint', 'JSON validation', 'secret scan']
      },
      evidence: preview.evidence,
      glossary: preview.glossary,
      boundaries: {
        automaticSystemChange: false,
        unrestrictedShell: false,
        unrestrictedFilesystem: false,
        humanApprovalForHighImpact: true,
        automatedReligiousRuling: false
      }
    }
  };
}

module.exports = {
  FILES,
  LEVELS,
  SHARED_FORMULAS,
  TECHNICAL_PROFILES,
  buildArchitectureModel,
  buildTechnologyStatus,
  buildRuntimeTelemetry,
  buildProductPreview,
  listProductPreviews,
  resolveDocumentationEntitlement,
  buildProductDossier
};
