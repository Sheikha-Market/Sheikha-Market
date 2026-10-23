'use strict';

const { randomUUID } = require('node:crypto');

const TYPES = [
  { id: 'cluster', nameAr: 'عنقود صناعي', nameEn: 'Industrial cluster', children: ['مجمعات متخصصة', 'مزارع موارد', 'فوندري مشترك', 'خدمات وبحوث'] },
  { id: 'farm', nameAr: 'مزرعة صناعية', nameEn: 'Industrial farm', children: ['وحدات موارد متكررة', 'معالجة ومراقبة', 'صيانة مشتركة'] },
  { id: 'foundry', nameAr: 'فوندري', nameEn: 'Foundry', children: ['تصميم وتأهيل', 'خلايا تصنيع أو إنتاج رقمي', 'مختبر تحقق'] },
  { id: 'complex', nameAr: 'مجمع صناعي', nameEn: 'Industrial complex', children: ['مصانع متكاملة', 'مرافق مشتركة', 'مستودعات وخدمات'] },
  { id: 'line', nameAr: 'خط إنتاج', nameEn: 'Production line', children: ['محطات عمل', 'نقاط فحص', 'تسليم وتتبع'] }
];

// Conceptual templates, not calibrated recipes, supplier listings or operating assets.
const TEMPLATES = [
  {
    id: 'metals', nameAr: 'المعادن والمواد', nameEn: 'Metals & materials', types: ['cluster', 'foundry', 'complex', 'line'],
    output: 'دفعة مواد مطابقة لمواصفات مقترحة', resources: ['مواد ذات مصدر موثق', 'طاقة ومياه', 'معدات وفريق مؤهل'],
    stages: ['تحديد مواصفات المادة', 'استقبال وفرز المدخلات', 'تشكيل ومعالجة', 'فحص خواص وتتبع', 'تسليم واسترداد البقايا'],
    evidence: 'مواصفات المادة وتقارير المختبر ومصدر المدخلات', review: 'مخاطر الحرارة والانبعاثات والمعدات'
  },
  {
    id: 'food', nameAr: 'الغذاء والزراعة الصناعية', nameEn: 'Food & controlled agriculture', types: ['cluster', 'farm', 'complex', 'line'],
    output: 'دفعة غذائية قابلة للتتبع', resources: ['مياه ومدخلات زراعية', 'مساحة وتجهيزات', 'سلسلة حفظ ملائمة'],
    stages: ['تصميم دورة الزراعة', 'تأهيل المياه والمدخلات', 'زراعة ومتابعة', 'حصاد وفحص', 'تعبئة وتتبع'],
    evidence: 'سجل المدخلات ونتائج الفحص وظروف الحفظ', review: 'سلامة الغذاء والمياه والعاملين'
  },
  {
    id: 'energy', nameAr: 'الطاقة والتخزين', nameEn: 'Energy & storage', types: ['cluster', 'farm', 'foundry', 'complex', 'line'],
    output: 'وحدة منظومة طاقة مقترحة', resources: ['مكونات موثقة', 'موقع مدروس', 'أجهزة اختبار مؤهلة'],
    stages: ['تحديد احتياج الطاقة', 'تأهيل المكونات', 'تجميع المنظومة', 'اختبار وحماية', 'تسليم وخطة صيانة'],
    evidence: 'مخطط ومواصفات واختبارات حماية معتمدة', review: 'السلامة الكهربائية والحرارية وتقييم الموقع'
  },
  {
    id: 'water', nameAr: 'المياه والبيئة', nameEn: 'Water & environment', types: ['cluster', 'farm', 'complex', 'line'],
    output: 'وحدة معالجة مقترحة', resources: ['تحليل مصدر المياه', 'مكونات معالجة', 'مختبر قياس'],
    stages: ['تحليل الاحتياج والمصدر', 'تصميم المعالجة', 'تجميع الوحدة', 'تحقق من جودة المخرج', 'تسليم ومراقبة'],
    evidence: 'تحاليل المصدر والمخرج وخطة إدارة المخلفات', review: 'سلامة المياه والتصريف والأثر البيئي'
  },
  {
    id: 'electronics', nameAr: 'الإلكترونيات وأشباه الموصلات', nameEn: 'Electronics & semiconductors', types: ['cluster', 'foundry', 'complex', 'line'],
    output: 'نموذج إلكتروني للمراجعة', resources: ['تصميم وقائمة مكونات', 'قدرات تصنيع متحقق منها', 'أدوات اختبار'],
    stages: ['تحديد المتطلبات', 'تصميم ومراجعة', 'تأهيل مسار التصنيع', 'إنتاج نموذج واختباره', 'توثيق الإصدار'],
    evidence: 'مخطط وقائمة مكونات ونتائج تحقق هندسي', review: 'سلامة الدائرة والمواد وحقوق التصميم'
  },
  {
    id: 'robotics', nameAr: 'الروبوتات والأتمتة', nameEn: 'Robotics & automation', types: ['cluster', 'foundry', 'complex', 'line'],
    output: 'نموذج روبوت تصوري', resources: ['متطلبات المهمة', 'تصميم هيكل وتحكم', 'بيئة اختبار معزولة'],
    stages: ['تعريف المهمة', 'تصميم الهيكل والتحكم', 'محاكاة رقمية', 'مراجعة سلامة مستقلة', 'حزمة نموذج للمراجعة'],
    evidence: 'حدود الحركة والحمولة وتقييم المخاطر وخطة الاختبار', review: 'التصادم والتحكم والإيقاف المادي المستقل'
  },
  {
    id: 'digital', nameAr: 'الحوسبة والبرمجيات', nameEn: 'Computing & software', types: ['cluster', 'farm', 'foundry', 'complex', 'line'],
    output: 'حزمة برمجية مرشحة', resources: ['متطلبات وبيانات مأذونة', 'حوسبة بميزانية معتمدة', 'فريق مراجعة'],
    stages: ['تعريف المتطلبات', 'تصميم وبناء', 'اختبارات وأمن', 'مراجعة الإصدار', 'حزمة تسليم'],
    evidence: 'نتائج الاختبارات وسجل التراخيص والمراجعة', review: 'الخصوصية والأسرار والصلاحيات'
  },
  {
    id: 'visual', nameAr: 'المرئيات والإنتاج المعرفي', nameEn: 'Visual & knowledge production', types: ['cluster', 'foundry', 'complex', 'line'],
    output: 'حزمة مرئية للمراجعة', resources: ['أصول مأذونة', 'موجز إنتاج', 'أدوات إخراج'],
    stages: ['موجز وحقوق الأصول', 'تصميم المحتوى', 'إنتاج مرئي', 'فحص الجودة والمحتوى', 'نسخة مراجعة'],
    evidence: 'مصادر الأصول وسجل الإنتاج وموافقة المراجع', review: 'حقوق المحتوى والصدق ومراجعة قبل النشر'
  },
  {
    id: 'circular', nameAr: 'التدوير واسترداد الموارد', nameEn: 'Circular resource recovery', types: ['cluster', 'farm', 'foundry', 'complex', 'line'],
    output: 'دفعة موارد مستردة', resources: ['مدخلات مصنفة', 'معدات فصل', 'مسار آمن للمخلفات'],
    stages: ['استقبال وتصنيف', 'فحص المخاطر', 'فرز واسترداد', 'قياس الجودة', 'إعادة توجيه الموارد'],
    evidence: 'مصدر المدخلات وتصنيفها وميزان المواد', review: 'المواد الخطرة والتلوث وسلامة المناولة'
  },
  {
    id: 'construction', nameAr: 'البناء والوحدات الصناعية', nameEn: 'Construction & modular systems', types: ['cluster', 'foundry', 'complex', 'line'],
    output: 'وحدة بناء مقترحة', resources: ['متطلبات موقع', 'مواد وتصميم مؤهل', 'معدات وفريق مختص'],
    stages: ['تعريف المتطلبات', 'تصميم هندسي', 'تجهيز المكونات', 'فحص ومراجعة', 'حزمة تسليم للموقع'],
    evidence: 'مراجعة إنشائية ومواصفات المواد وخطة التركيب', review: 'التحمل والرفع والسلامة في الموقع'
  },
  {
    id: 'logistics', nameAr: 'اللوجستيات والتعبئة', nameEn: 'Logistics & packaging', types: ['cluster', 'complex', 'line'],
    output: 'دفعة شحن مخططة', resources: ['طلب ومواصفات حفظ', 'تعبئة ومستودع', 'ناقل متحقق منه'],
    stages: ['تخطيط الطلب', 'تجهيز وفرز', 'تعبئة وفحص', 'توثيق وتتبع', 'تسليم مخطط'],
    evidence: 'سجل الحيازة وشروط النقل والاستلام', review: 'سلامة الشحن وحقوق الأطراف والامتثال'
  },
  {
    id: 'space', nameAr: 'بحوث الصناعة الفضائية', nameEn: 'Space industry research', types: ['cluster', 'foundry', 'complex', 'line'],
    output: 'حزمة دراسة بحثية', resources: ['سؤال بحثي', 'بيانات مأذونة', 'نماذج ومراجعة مختصة'],
    stages: ['تحديد السؤال البحثي', 'دراسة القيود', 'تصميم تصوري', 'تحليل ومراجعة', 'توثيق النتائج والحدود'],
    evidence: 'فرضيات معلنة ونتائج قابلة للمراجعة', review: 'مراجعة علمية وتنظيمية مستقلة؛ دون إطلاق أو نشر فضائي'
  }
];

const HORIZONS = [
  { id: 'earth', nameAr: 'تخطيط أرضي', nameEn: 'Earth planning' },
  { id: 'space-research', nameAr: 'بحث فضائي فقط', nameEn: 'Space research only' }
];

const METRICS = [
  { id: 'benefit', nameAr: 'النفع', measure: 'المستفيدون والاحتياج الذي تمت تلبيته', observed: null },
  { id: 'generosity', nameAr: 'الكرم وإتاحة المنفعة', measure: 'حصة المنفعة المجتمعية المستهدفة والمحققة', observed: null },
  { id: 'quality', nameAr: 'الإتقان', measure: 'جودة المخرجات وإعادة العمل', observed: null },
  { id: 'resources', nameAr: 'حفظ الموارد', measure: 'الماء والطاقة والمواد لكل مخرج مقبول', observed: null },
  { id: 'safety', nameAr: 'السلامة والحقوق', measure: 'مراجعة المخاطر وحقوق العاملين وأصحاب المحتوى', observed: null },
  { id: 'scale', nameAr: 'النمو المتحقق', measure: 'القدرة الفعلية المثبتة بأدلة مستقلة', observed: null }
];

const BOUNDARIES = {
  mode: 'LOCAL_PLANNING_ONLY', productionReady: false, physicalCommandSent: false,
  externalCallsMade: false, publicationEnabled: false, paidGenerationEnabled: false,
  automaticApproval: false, realCapacityVerified: false, universalCoverageVerified: false,
  superiorityClaimVerified: false, storedOnServer: false
};

const clone = value => JSON.parse(JSON.stringify(value));

function getIndustrialCatalog() {
  return clone({
    version: '1.0.0', nameAr: 'منظومة شيخة للعناقيد والمزارع الصناعية والفوندري',
    vision: 'نحو أوسع منظومة صناعية وأكثرها نفعًا وخيرًا وكرمًا، بخدمة الإنسان وحفظ الموارد.',
    visionStatus: 'ASPIRATION_NOT_VERIFIED_RANKING',
    types: TYPES, templates: TEMPLATES, horizons: HORIZONS, metrics: METRICS,
    boundaries: BOUNDARIES,
    integrations: [
      { id: 'foundry', nameAr: 'الفوندري ومحاكاة الشبكة', href: './#/operations?op=foundry', state: 'LOCAL_SIMULATION' },
      { id: 'robotics', nameAr: 'استوديو الروبوتات', href: './robot-studio.html', state: 'CONCEPTUAL_DESIGN' },
      { id: 'market', nameAr: 'سوق شيخة', href: './#/market', state: 'LOCAL_CATALOG' },
      { id: 'motion', nameAr: 'المرئيات والإنتاج', href: './#/motion', state: 'REVIEW_DRAFTS' }
    ]
  });
}

function buildIndustrialPlan(input) {
  const keys = ['name', 'typeId', 'templateId', 'horizonId', 'quantity', 'planningDays', 'communitySharePercent'];
  if (!input || typeof input !== 'object' || Array.isArray(input)
    || Object.keys(input).sort().join(',') !== keys.sort().join(',')) throw Error('PLAN_INPUT_REJECTED');
  const type = TYPES.find(item => item.id === input.typeId);
  const template = TEMPLATES.find(item => item.id === input.templateId);
  const horizon = HORIZONS.find(item => item.id === input.horizonId);
  if (!type || !template || !horizon || !template.types.includes(type.id)
    || (template.id === 'space' && horizon.id !== 'space-research')
    || typeof input.name !== 'string' || input.name.trim().length < 3 || input.name.length > 120
    || /[\u0000-\u001f\u007f]/u.test(input.name)
    || !Number.isSafeInteger(input.quantity) || input.quantity < 1 || input.quantity > 1000000
    || !Number.isSafeInteger(input.planningDays) || input.planningDays < 1 || input.planningDays > 3650
    || !Number.isSafeInteger(input.communitySharePercent) || input.communitySharePercent < 0 || input.communitySharePercent > 100
  ) throw Error('PLAN_INPUT_REJECTED');

  const researchOnly = horizon.id === 'space-research';
  const communityUnits = Math.floor(input.quantity * input.communitySharePercent / 100);
  return clone({
    id: randomUUID(), createdAt: new Date().toISOString(), schemaVersion: '1.0.0',
    name: input.name.trim(), reviewStatus: 'DRAFT_REQUIRES_HUMAN_REVIEW',
    type, templateId: template.id, sector: { nameAr: template.nameAr, nameEn: template.nameEn }, horizon,
    output: researchOnly ? 'حزمة دراسة بحثية فقط' : template.output,
    architecture: { children: type.children, ownership: 'UNASSIGNED', assetRegistry: [], connectedDevices: 0 },
    resources: template.resources.map(nameAr => ({ nameAr, availability: 'UNVERIFIED', supplier: null })),
    stages: (researchOnly
      ? TEMPLATES.find(item => item.id === 'space').stages : template.stages
    ).map((nameAr, index) => ({
      id: `stage-${index + 1}`, nameAr, dependsOn: index ? [`stage-${index}`] : [],
      status: 'NOT_STARTED', owner: null, evidence: []
    })),
    targets: {
      quantity: input.quantity, planningDays: input.planningDays,
      dailyTargetUnits: Math.ceil(input.quantity / input.planningDays),
      communitySharePercent: input.communitySharePercent, communityUnits,
      remainingUnits: input.quantity - communityUnits,
      basis: 'USER_TARGETS_NOT_CAPACITY_FORECAST',
      rounding: 'DAILY_TARGET_CEILING_COMMUNITY_ALLOCATION_FLOOR',
      actualCapacityPerDay: null, deliveryDate: null
    },
    reviews: [
      { id: 'scope', nameAr: 'النطاق والجدوى', ownerRole: 'مسؤول المشروع', requiredEvidence: 'احتياج مثبت وميزانية ونطاق معتمد' },
      { id: 'engineering', nameAr: 'الهندسة والجودة', ownerRole: 'مراجع مختص', requiredEvidence: template.evidence },
      { id: 'safety', nameAr: 'السلامة والبيئة', ownerRole: 'مراجع سلامة مستقل', requiredEvidence: template.review },
      { id: 'rights', nameAr: 'الحقوق والحوكمة', ownerRole: 'مراجع مؤهل', requiredEvidence: 'حقوق الأطراف والتراخيص ومراجعة شرعية عند الحاجة؛ لا فتوى آلية' },
      { id: 'release', nameAr: 'الإذن بالتجربة أو التسليم', ownerRole: 'المسؤول المخول', requiredEvidence: 'أدلة مراجعة مكتملة وإذن محدد مستقل عن هذه المسودة' }
    ].map(review => ({ ...review, status: 'PENDING', approvedBy: null })),
    metrics: METRICS,
    monitoring: {
      watch: { state: 'PROPOSED_NOT_SCHEDULED', cadence: 'DAILY_REVIEW', scope: 'الجودة والموارد والتقدم والتحسين' },
      guard: { state: 'DESIGN_GATE_ONLY', physicalSafetyController: false, scope: 'اكتمال الأدلة ووضوح الصلاحيات وحدود التنفيذ' }
    },
    boundaries: BOUNDARIES
  });
}

module.exports = { getIndustrialCatalog, buildIndustrialPlan };
