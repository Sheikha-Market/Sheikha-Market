/**
 * بسم الله الرحمن الرحيم
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║  SHEIKHA SUNNAH COMPLETE NEURAL NETWORK                                    ║
 * ║  شبكة السنة النبوية الكاملة — أقوال + أفعال + تقريرات + صفات             ║
 * ║  + سنة الخلفاء الراشدين المهديين — موحَّدة لله                            ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * «خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ» — البخاري: ٥٠٢٧
 * «تَرَكْتُ فِيكُمْ أَمْرَيْنِ لَن تَضِلُّوا مَا تَمَسَّكْتُمْ بِهِمَا: كِتَابَ اللَّهِ وَسُنَّةَ نَبِيِّهِ»
 * — موطأ مالك: ٣٣٣٨
 *
 * ﴿وَمَا يَنطِقُ عَنِ الْهَوَىٰ * إِنْ هُوَ إِلَّا وَحْيٌ يُوحَىٰ﴾ — النجم: ٣-٤
 * ﴿لَقَدْ كَانَ لَكُمْ فِي رَسُولِ اللَّهِ أُسْوَةٌ حَسَنَةٌ﴾ — الأحزاب: ٢١
 *
 * @module sheikha-sunnah-complete-neural-network
 * @version 2.0.0
 * @schema sheikha/v2
 * @tawheed لا إله إلا الله محمد رسول الله
 */
'use strict';

const TAWHEED   = 'لا إله إلا الله محمد رسول الله';
const BISMILLAH = 'بسم الله الرحمن الرحيم';
const VERSION   = '2.0.0';
const SCHEMA    = 'sheikha/v2';

// ═══════════════════════════════════════════════════════════════════════════════
// ── أنواع السنة ───────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const SUNNAH_TYPES = Object.freeze({
  qawliyya: {
    nameAr: 'السنة القولية',
    nameEn: 'Verbal Sunnah',
    definition: 'ما صدر عن النبي ﷺ من أقوال وأحاديث في مختلف شؤون الحياة',
    programmingEquiv: 'API Documentation — توثيق الواجهة البرمجية',
  },
  filiyya: {
    nameAr: 'السنة الفعلية',
    nameEn: 'Practical Sunnah',
    definition: 'ما صدر عن النبي ﷺ من أفعال وتصرفات',
    programmingEquiv: 'Working Code Example — كود تطبيقي نموذجي',
  },
  taqririyya: {
    nameAr: 'السنة التقريرية',
    nameEn: 'Tacit Approval Sunnah',
    definition: 'ما أقرَّه النبي ﷺ وسكت عليه من أفعال الصحابة',
    programmingEquiv: 'Silent approval / Default behavior — السلوك الافتراضي المقبول',
  },
  sifatiyya: {
    nameAr: 'السنة الوصفية',
    nameEn: 'Descriptive Sunnah',
    definition: 'ما وُصف به النبي ﷺ من أخلاق وهيئة',
    programmingEquiv: 'System specifications — مواصفات النظام ومعاييره',
  },
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── كتب الحديث وإحصاءاتها ────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const HADITH_BOOKS = Object.freeze([
  { rank: 1,  nameAr: 'صحيح البخاري',       compiler: 'محمد بن إسماعيل البخاري (ت٢٥٦هـ)', hadithCount: 7563,  grade: 'أصح',         desc: 'أصح كتاب بعد القرآن — انتقى من 600,000 حديث' },
  { rank: 2,  nameAr: 'صحيح مسلم',           compiler: 'مسلم بن الحجاج (ت٢٦١هـ)',         hadithCount: 7500,  grade: 'أصح',         desc: 'انتقى من 300,000 حديث — مرتَّب على أبواب' },
  { rank: 3,  nameAr: 'سنن أبي داود',         compiler: 'أبو داود السجستاني (ت٢٧٥هـ)',     hadithCount: 5274,  grade: 'صحيح وحسن وضعيف', desc: 'أكثر تركيزاً على أحاديث الأحكام' },
  { rank: 4,  nameAr: 'جامع الترمذي',         compiler: 'محمد بن عيسى الترمذي (ت٢٧٩هـ)', hadithCount: 3956,  grade: 'صحيح وحسن',  desc: 'أول من دوَّن درجة الحديث في كتابه' },
  { rank: 5,  nameAr: 'سنن النسائي',          compiler: 'أحمد بن شعيب النسائي (ت٣٠٣هـ)', hadithCount: 5758,  grade: 'أقل ضعيفاً من الأربعة', desc: 'أشد المحدثين نقداً للرجال' },
  { rank: 6,  nameAr: 'سنن ابن ماجه',         compiler: 'محمد بن يزيد ابن ماجه (ت٢٧٣هـ)',hadithCount: 4341,  grade: 'فيه ضعيف',    desc: 'يحتوي على زوائد لا توجد في الكتب الخمسة' },
  { rank: 7,  nameAr: 'مسند أحمد',            compiler: 'أحمد بن حنبل (ت٢٤١هـ)',          hadithCount: 27647, grade: 'أوسع كتاب',  desc: 'أوسع مسانيد الحديث — مرتَّب على المسند' },
  { rank: 8,  nameAr: 'موطأ مالك',            compiler: 'مالك بن أنس (ت١٧٩هـ)',           hadithCount: 1720,  grade: 'أصح بعد الصحيحين', desc: 'أقدم كتب الحديث المدوَّنة المنظَّمة' },
  { rank: 9,  nameAr: 'مستدرك الحاكم',        compiler: 'الحاكم النيسابوري (ت٤٠٥هـ)',     hadithCount: 8803,  grade: 'صحيح على شرط الشيخين وفيه ما فيه', desc: 'يزيد على الصحيحين' },
  { rank: 10, nameAr: 'سنن الدارقطني',        compiler: 'الدارقطني (ت٣٨٥هـ)',              hadithCount: 4173,  grade: 'أكثر تركيزاً على الفقه', desc: 'يُقدَّم في أحاديث الأحكام' },
  { rank: 11, nameAr: 'السنن الكبرى للبيهقي', compiler: 'البيهقي (ت٤٥٨هـ)',               hadithCount: 22000, grade: 'جامع',        desc: 'موسوعة فقهية حديثية' },
  { rank: 12, nameAr: 'المعجم الكبير للطبراني',compiler: 'الطبراني (ت٣٦٠هـ)',              hadithCount: 25000, grade: 'فيه صحيح وضعيف', desc: 'أوسع معاجم الحديث' },
]);

// ═══════════════════════════════════════════════════════════════════════════════
// ── علوم الحديث ───────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const HADITH_SCIENCES = Object.freeze([
  {
    id: 'HS-01', name: 'علم الإسناد',
    definition: 'دراسة سلسلة رواة الحديث من النبي ﷺ حتى المدوِّن',
    importance: 'فريدة في الحضارة الإنسانية — لا نظير لها في التوثيق',
    programmingEquiv: 'Blockchain chain-of-custody — سلسلة إثبات الأصل',
    grades: [
      { grade: 'صحيح',       def: 'رواه عدل ضابط عن مثله، موصول السند، لا شذوذ ولا علة' },
      { grade: 'حسن',        def: 'كالصحيح لكن راويه خفيف الضبط' },
      { grade: 'ضعيف',       def: 'لم يجمع شروط الصحيح أو الحسن' },
      { grade: 'موضوع',      def: 'مكذوب مختلَق — يحرم روايته إلا للتحذير' },
      { grade: 'متواتر',     def: 'رواه جمع كبير عن جمع كبير، يستحيل تواطؤهم على الكذب' },
      { grade: 'آحاد',       def: 'لم يبلغ حد التواتر — تنقسم إلى مشهور وعزيز وغريب' },
    ],
  },
  {
    id: 'HS-02', name: 'علم الجرح والتعديل',
    definition: 'تقييم الرواة من حيث القبول والرد',
    programmingEquiv: 'Code review & trust scoring — تقييم الموثوقية',
    levels: [
      'ثقة ثقة — أعلى درجة', 'ثقة', 'صدوق', 'صدوق له أوهام',
      'ضعيف', 'متروك', 'كذاب', 'وضَّاع — أشد الطعن',
    ],
  },
  {
    id: 'HS-03', name: 'علم علل الحديث',
    definition: 'الكشف عن الأسباب الخفية التي تقدح في صحة الحديث',
    programmingEquiv: 'Static code analysis — تحليل ثابت يكشف الأخطاء الخفية',
  },
  {
    id: 'HS-04', name: 'علم غريب الحديث',
    definition: 'شرح الألفاظ الغريبة الواردة في المتون',
    programmingEquiv: 'API glossary / Lexer — قاموس مصطلحات الواجهة',
  },
  {
    id: 'HS-05', name: 'علم مختلف الحديث',
    definition: 'التوفيق بين الأحاديث الظاهرة الاختلاف',
    programmingEquiv: 'Conflict resolution algorithm — خوارزمية حل التعارض',
  },
  {
    id: 'HS-06', name: 'علم ناسخ الحديث ومنسوخه',
    definition: 'معرفة الأحاديث التي رفعت أحكام أحاديث أخرى',
    programmingEquiv: 'Deprecated API tracking — تتبع الإصدارات المنسوخة',
  },
]);

// ═══════════════════════════════════════════════════════════════════════════════
// ── الأحاديث الكلية والجامعة — عمود السنة القولية ───────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const JAWAMI_AL_KALIM = Object.freeze([
  {
    id: 'JK-01',
    text: '«إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ مَّا نَوَىٰ»',
    source: 'البخاري: ١ | مسلم: ١٩٠٧',
    principle: 'INTENTION_FIRST — النية سبق التنفيذ',
    programmingEquiv: 'Constructor / Init function — دالة التهيئة تحدد الغرض من البداية',
    domain: 'all',
  },
  {
    id: 'JK-02',
    text: '«الدِّينُ النَّصِيحَةُ» قلنا: لمن؟ قال: «لِلَّهِ وَلِكِتَابِهِ وَلِرَسُولِهِ وَلِأَئِمَّةِ الْمُسْلِمِينَ وَعَامَّتِهِمْ»',
    source: 'مسلم: ٥٥',
    principle: 'SINCERE_COUNSEL — النصيحة المبنية على الصدق',
    programmingEquiv: 'Code review with integrity — مراجعة صادقة دون مجاملة',
    domain: 'governance',
  },
  {
    id: 'JK-03',
    text: '«الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ، وَالْمُهَاجِرُ مَنْ هَجَرَ مَا نَهَى اللَّهُ عَنْهُ»',
    source: 'البخاري: ١٠',
    principle: 'ZERO_HARM_OUTPUT — لا ضرر ينبثق من المكوِّن',
    programmingEquiv: 'Side-effect free API — واجهة لا تُلحق ضرراً بالمحيط',
    domain: 'ethics',
  },
  {
    id: 'JK-04',
    text: '«لَا ضَرَرَ وَلَا ضِرَارَ»',
    source: 'ابن ماجه: ٢٣٤١ — صحيح',
    principle: 'NO_HARM_PRINCIPLE — مبدأ لا ضرر',
    programmingEquiv: 'Immutable non-destructive operations — عمليات غير هدَّامة',
    domain: 'all',
  },
  {
    id: 'JK-05',
    text: '«الْحَلَالُ بَيِّنٌ وَالْحَرَامُ بَيِّنٌ وَبَيْنَهُمَا مُشَبَّهَاتٌ»',
    source: 'البخاري: ٥٢ | مسلم: ١٥٩٩',
    principle: 'WHITELIST_BLACKLIST_GRAY — الثلاثي: حلال|حرام|مشتبه',
    programmingEquiv: 'Three-tier classification: allowed / blocked / uncertain',
    domain: 'ethics',
  },
  {
    id: 'JK-06',
    text: '«مَنْ غَشَّنَا فَلَيْسَ مِنَّا»',
    source: 'مسلم: ١٠١',
    principle: 'ANTI_FRAUD_ABSOLUTE — تحريم الغش المطلق',
    programmingEquiv: 'Data integrity check — فحص سلامة البيانات',
    domain: 'market',
  },
  {
    id: 'JK-07',
    text: '«أَدِّ الْأَمَانَةَ إِلَى مَنِ ائْتَمَنَكَ»',
    source: 'أبو داود: ٣٥٣٥ — صحيح',
    principle: 'TRUST_FULFILLMENT — الوفاء بالأمانة',
    programmingEquiv: 'Return resources to owner — إعادة الموارد لأصحابها',
    domain: 'contracts',
  },
  {
    id: 'JK-08',
    text: '«إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلاً أَنْ يُتْقِنَهُ»',
    source: 'البيهقي — حسن',
    principle: 'EXCELLENCE_IMPERATIVE — الإتقان واجب',
    programmingEquiv: 'Quality gate — بوابة جودة قبل كل إصدار',
    domain: 'all',
  },
  {
    id: 'JK-09',
    text: '«خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ»',
    source: 'البخاري: ٥٠٢٧',
    principle: 'KNOWLEDGE_SHARING — نشر العلم',
    programmingEquiv: 'Open documentation + Teaching culture',
    domain: 'education',
  },
  {
    id: 'JK-10',
    text: '«إِذَا مَاتَ الْإِنسَانُ انْقَطَعَ عَنْهُ عَمَلُهُ إِلَّا مِنْ ثَلَاثٍ: صَدَقَةٍ جَارِيَةٍ، أَوْ عِلْمٍ يُنتَفَعُ بِهِ، أَوْ وَلَدٍ صَالِحٍ يَدْعُو لَهُ»',
    source: 'مسلم: ١٦٣١',
    principle: 'PERPETUAL_LEGACY — الأثر الدائم',
    programmingEquiv: 'Persistent service with long-term impact',
    domain: 'all',
  },
  {
    id: 'JK-11',
    text: '«اتَّقِ اللَّهَ حَيْثُمَا كُنتَ وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا»',
    source: 'الترمذي: ١٩٨٧ — حسن',
    principle: 'ERROR_RECOVERY — الاسترداد من الخطأ',
    programmingEquiv: 'Self-healing system with rollback',
    domain: 'all',
  },
  {
    id: 'JK-12',
    text: '«طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ»',
    source: 'ابن ماجه: ٢٢٤ — صحيح',
    principle: 'MANDATORY_LEARNING — التعلم المستمر فريضة',
    programmingEquiv: 'Continuous learning — تحديث النموذج باستمرار',
    domain: 'education',
  },
  {
    id: 'JK-13',
    text: '«بَلِّغُوا عَنِّي وَلَوْ آيَةً»',
    source: 'البخاري: ٣٤٦١',
    principle: 'MINIMUM_VIABLE_BROADCAST — البلاغ بالممكن',
    programmingEquiv: 'Minimum viable communication — أقل وحدة معلومات مفيدة',
    domain: 'communication',
  },
  {
    id: 'JK-14',
    text: '«مَنْ سَلَكَ طَرِيقًا يَلتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ»',
    source: 'مسلم: ٢٦٩٩',
    principle: 'KNOWLEDGE_PATH_REWARD — مكافأة المسار العلمي',
    programmingEquiv: 'Algorithm optimization reward function',
    domain: 'education',
  },
  {
    id: 'JK-15',
    text: '«الْمُؤْمِنُ لِلْمُؤْمِنِ كَالْبُنيَانِ يَشُدُّ بَعْضُهُ بَعْضًا»',
    source: 'البخاري: ٤٨١',
    principle: 'MODULAR_REINFORCEMENT — التعزيز المتبادل',
    programmingEquiv: 'Microservices mutual dependency — تعاون الخدمات',
    domain: 'architecture',
  },
]);

// ═══════════════════════════════════════════════════════════════════════════════
// ── السنة الفعلية — أبرز الأفعال النبوية ─────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const SUNNAH_FILIYYA = Object.freeze([
  {
    id: 'SF-01',
    action: 'صلاة الفجر في وقتها كل يوم دون انقطاع',
    source: 'البخاري: ٥٢١',
    principle: 'RELIABLE_SCHEDULED_JOB',
    programmingEquiv: 'cron(FAJR_TIME, pray, { reliability: 1.0, neverSkip: true })',
    domain: 'ibadah',
  },
  {
    id: 'SF-02',
    action: 'التحقق من الخبر قبل العمل به — إرسال المحققين',
    source: 'الحجرات: ٦ + سيرة النبي',
    principle: 'VERIFY_BEFORE_EXECUTE',
    programmingEquiv: 'assert(verified(data)) before processing',
    domain: 'governance',
  },
  {
    id: 'SF-03',
    action: 'المشاورة في الأمور الكبرى — بدر، أحد، الخندق',
    source: 'تاريخ الطبري',
    principle: 'CONSULT_BEFORE_MAJOR_DECISIONS',
    programmingEquiv: 'council.vote() for critical system changes',
    domain: 'governance',
  },
  {
    id: 'SF-04',
    action: 'كتابة العهود والمعاهدات — صحيفة المدينة، الحديبية',
    source: 'ابن هشام',
    principle: 'WRITTEN_CONTRACTS_FIRST',
    programmingEquiv: 'Always write smart contracts, never verbal-only',
    domain: 'contracts',
  },
  {
    id: 'SF-05',
    action: 'إرسال المعلمين للقبائل المسلمة الجديدة',
    source: 'البخاري: ٤٣٣٣',
    principle: 'PROACTIVE_ONBOARDING',
    programmingEquiv: 'Auto-provision training & docs for new users',
    domain: 'education',
  },
  {
    id: 'SF-06',
    action: 'قسمة الغنائم بالعدل وإعطاء كل ذي حق حقه',
    source: 'الأنفال: ٤١ + السنة',
    principle: 'FAIR_RESOURCE_ALLOCATION',
    programmingEquiv: 'distributeResources({ fairness: QURAN_FORMULA })',
    domain: 'finance',
  },
  {
    id: 'SF-07',
    action: 'الاستعداد للمعركة بأخذ الأسباب كاملة مع التوكل',
    source: 'الأنفال: ٦٠',
    principle: 'PREPARE_THEN_TRUST',
    programmingEquiv: 'setup() + backup() + monitor() + then(proceed())',
    domain: 'resilience',
  },
  {
    id: 'SF-08',
    action: 'التعامل بالعدل مع غير المسلمين في العهد',
    source: 'صحيفة المدينة',
    principle: 'EQUAL_TREATMENT_REGARDLESS_OF_RELIGION',
    programmingEquiv: 'auth.equalAccess({ criteria: "CONTRACT_NOT_RELIGION" })',
    domain: 'governance',
  },
  {
    id: 'SF-09',
    action: 'زيارة المرضى وتفقد الأحوال',
    source: 'البخاري: ٥٣٣٣',
    principle: 'PROACTIVE_MONITORING',
    programmingEquiv: 'healthCheck.run({ proactive: true, every: "daily" })',
    domain: 'ops',
  },
  {
    id: 'SF-10',
    action: 'بناء المسجد أولاً — البنية التحتية الجماعية قبل كل شيء',
    source: 'سيرة ابن هشام',
    principle: 'INFRASTRUCTURE_FIRST',
    programmingEquiv: 'deployInfrastructure() before launchApplication()',
    domain: 'infra',
  },
]);

// ═══════════════════════════════════════════════════════════════════════════════
// ── الأخلاق النبوية — مواصفات النظام ─────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const AKHLAQ_NABAWIYYA = Object.freeze([
  { trait: 'الصدق',      quranRef: 'التوبة:١١٩',   desc: 'لم يكذب ﷺ قط في جاهلية ولا إسلام',         programmingEquiv: 'Immutable logging — سجل لا يُزوَّر' },
  { trait: 'الأمانة',    quranRef: 'الأحزاب:٢١',   desc: 'لُقِّب بالصادق الأمين قبل النبوة',            programmingEquiv: 'Trusted execution environment — بيئة تنفيذ موثوقة' },
  { trait: 'الشجاعة',   quranRef: 'الأحزاب:٢٣',   desc: 'أشجع الناس في المعارك — لم يفرّ قط',         programmingEquiv: 'Fail-fast with courage — مواجهة الأخطاء مباشرة' },
  { trait: 'الكرم',      quranRef: 'الضحى:١٠',    desc: 'كان أجود الناس — يعطي عطاء من لا يخاف الفقر', programmingEquiv: 'Open source giving — عطاء بلا حدود للمعرفة' },
  { trait: 'التواضع',    quranRef: 'الكهف:١١٠',   desc: 'ينهى عن القيام له ويجلس مع الفقراء',          programmingEquiv: 'Servant leader pattern — القائد خادم النظام' },
  { trait: 'الرحمة',     quranRef: 'الأنبياء:١٠٧',desc: '﴿وَمَا أَرْسَلْنَاكَ إِلَّا رَحْمَةً لِّلْعَالَمِينَ﴾', programmingEquiv: 'Graceful error messages — رسائل خطأ رحيمة' },
  { trait: 'الحلم والصبر',quranRef: 'آل عمران:١٥٩',desc: 'صبر على الأذى — لم ينتقم لنفسه قط',         programmingEquiv: 'Exponential backoff with patience — صبر أسي على الإخفاقات' },
  { trait: 'الحياء',    quranRef: 'الأحزاب:٥٣',  desc: 'كان أشد حياءً من العذراء في خِدرها',          programmingEquiv: 'Graceful API — واجهة أنيقة بلا وقاحة' },
  { trait: 'العدل',      quranRef: 'النساء:١٣٥',  desc: 'قال ﷺ: «لو سرقت فاطمة لقطعت يدها»',         programmingEquiv: 'Equal access control — تحكم متساوٍ بلا محاباة' },
  { trait: 'الشورى',     quranRef: 'الشورى:٣٨',   desc: 'كان يستشير أصحابه في الحرب والسلم',           programmingEquiv: 'Distributed decision making — قرارات موزعة' },
]);

// ═══════════════════════════════════════════════════════════════════════════════
// ── سنة الخلفاء الراشدين — الموسَّعة ──────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const KHULAFA_RASHIDEEN_EXTENDED = Object.freeze({
  hadithJami: '«عَلَيْكُمْ بِسُنَّتِي وَسُنَّةِ الْخُلَفَاءِ الرَّاشِدِينَ الْمَهْدِيِّينَ مِنْ بَعْدِي، عَضُّوا عَلَيْهَا بِالنَّوَاجِذِ»',
  source: 'أبو داود: ٤٦٠٧ | الترمذي: ٢٦٧٦ | ابن ماجه: ٤٢ — صحيح',

  caliphs: [
    {
      id: 'KR-I',
      name: 'أبو بكر الصديق', radi: 'رضي الله عنه', period: '٦٣٢-٦٣٤م | ١١-١٣هـ',
      titles: ['الصديق','أول الخلفاء','أفضل هذه الأمة بعد نبيها'],
      achievementsWithPrinciples: [
        { act: 'جمع القرآن في مصحف',                  source: 'البخاري: ٤٩٨٦', principle: 'CRITICAL_BACKUP', domain: 'storage' },
        { act: 'محاربة الردة وصون وحدة الدولة',        source: 'البخاري: ١٣٩٩', principle: 'SYSTEM_INTEGRITY', domain: 'security' },
        { act: 'السياسة الخادمة «ولست بخيركم»',        source: 'ابن هشام',       principle: 'SERVANT_LEADERSHIP', domain: 'governance' },
        { act: 'إتمام جيش أسامة رغم الفتن',           source: 'ابن هشام',       principle: 'COMPLETE_COMMITTED_TASK', domain: 'ops' },
        { act: 'نصيحة عمر بتقوى الله في الوصية',      source: 'الطبري',         principle: 'SECURE_HANDOVER', domain: 'ops' },
      ],
    },
    {
      id: 'KR-II',
      name: 'عمر بن الخطاب', radi: 'رضي الله عنه', period: '٦٣٤-٦٤٤م | ١٣-٢٣هـ',
      titles: ['الفاروق','ثاني الخلفاء','أول من لُقِّب أمير المؤمنين'],
      achievementsWithPrinciples: [
        { act: 'إنشاء الديوان — أول سجل إداري منظَّم',  source: 'الطبري',         principle: 'DATABASE_ADMINISTRATION', domain: 'db' },
        { act: 'التقويم الهجري كمرجع زمني موحَّد',      source: 'الطبري',         principle: 'CALENDAR_SYSTEM', domain: 'datetime' },
        { act: 'تنظيم السوق — أول شرطة تجارية',        source: 'الطبري',         principle: 'MARKET_REGULATION', domain: 'market' },
        { act: '«لو عثرت بغلة...» — المسؤولية الكاملة', source: 'ابن عساكر',      principle: 'FULL_ACCOUNTABILITY', domain: 'monitoring' },
        { act: '«متى استعبدتم الناس» — حرية أصيلة',    source: 'الطبري',         principle: 'USER_FREEDOM', domain: 'ux' },
        { act: 'تفتيش الولاة ومحاسبتهم',               source: 'الطبري',         principle: 'RUNTIME_AUDIT', domain: 'ops' },
        { act: 'الاجتهاد في النوازل المستجدة',          source: 'الطبري',         principle: 'ADAPTIVE_IJTIHAD', domain: 'logic' },
      ],
    },
    {
      id: 'KR-III',
      name: 'عثمان بن عفان', radi: 'رضي الله عنه', period: '٦٤٤-٦٥٦م | ٢٣-٣٥هـ',
      titles: ['ذو النورين','ثالث الخلفاء'],
      achievementsWithPrinciples: [
        { act: 'توحيد المصحف على مصحف إمام واحد',      source: 'البخاري: ٤٩٨٧', principle: 'SINGLE_SOURCE_OF_TRUTH', domain: 'versioning' },
        { act: 'توزيع المصاحف على الأمصار',            source: 'البخاري: ٤٩٨٧', principle: 'CONTENT_DELIVERY_NETWORK', domain: 'cdn' },
        { act: 'توسيع المسجدين — بنية تحتية',          source: 'الطبري',         principle: 'INFRASTRUCTURE_SCALING', domain: 'infra' },
        { act: 'بناء الأسطول البحري — قناة نقل جديدة', source: 'البلاذري',       principle: 'NEW_TRANSPORT_LAYER', domain: 'network' },
        { act: 'بئر رومة + جيش العسرة — كرم عام',     source: 'البخاري: ٢٧٧٨', principle: 'RESOURCE_POOLING', domain: 'resources' },
      ],
    },
    {
      id: 'KR-IV',
      name: 'علي بن أبي طالب', radi: 'رضي الله عنه', period: '٦٥٦-٦٦١م | ٣٥-٤٠هـ',
      titles: ['أمير المؤمنين','رابع الخلفاء','باب مدينة العلم'],
      achievementsWithPrinciples: [
        { act: '«قيمة كل امرئ ما يحسنه» — RBAC',      source: 'نهج البلاغة',   principle: 'SKILLS_BASED_IDENTITY', domain: 'rbac' },
        { act: '«الحكمة ضالة المؤمن» — اقتبس من كل مصدر', source: 'الترمذي: ٢٦٨٧', principle: 'WISDOM_MINING', domain: 'ai' },
        { act: 'المثول أمام القاضي مثل أي مواطن',     source: 'البيهقي',        principle: 'EQUAL_JUSTICE', domain: 'governance' },
        { act: '«اعرف الحق تعرف أهله» — الحق معيار', source: 'نهج البلاغة',   principle: 'TRUTH_FIRST', domain: 'logic' },
        { act: 'نهج البلاغة — التوثيق الرفيع',         source: 'نهج البلاغة',   principle: 'DOCUMENTATION_EXCELLENCE', domain: 'docs' },
        { act: '«لا تكن عبد غيرك» — استقلالية',       source: 'نهج البلاغة',   principle: 'AUTONOMY_PRINCIPLE', domain: 'all' },
      ],
    },
  ],

  sharedPrinciples: [
    { principle: 'الشورى أساس الحكم',                    rule: 'SHURA_CONSENSUS',    domain: 'governance' },
    { principle: 'العدل مع الجميع بما فيهم الأعداء',     rule: 'EQUAL_JUSTICE',      domain: 'governance' },
    { principle: 'الكتاب والسنة = أعلى سلطة',           rule: 'QURAN_SUNNAH_FIRST', domain: 'all' },
    { principle: 'القضاء مستقل عن السلطة التنفيذية',     rule: 'JUDICIAL_INDEPENDENCE', domain: 'governance' },
    { principle: 'الإتقان في العمل واجب ديني',           rule: 'CRAFTSMANSHIP', domain: 'all' },
    { principle: 'الأمر بالمعروف والنهي عن المنكر على الكل', rule: 'DISTRIBUTED_VALIDATION', domain: 'quality' },
  ],
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── الشبكة العصبية لخلايا السنة — 100 خلية ───────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const SUNNAH_NEURAL_CELLS = Object.freeze([

  // أ. السنة القولية — الأحاديث الجوامع
  { id: 'SQ01', group: 'jawami',   ref: 'البخاري:١',      text: 'الأعمال بالنيات — Constructor/Intent First',          rule: 'INTENTION_FIRST',        domain: 'all',        weight: 1.00 },
  { id: 'SQ02', group: 'jawami',   ref: 'مسلم:٥٥',        text: 'الدين النصيحة — Honest Review',                       rule: 'SINCERE_COUNSEL',        domain: 'governance', weight: 1.00 },
  { id: 'SQ03', group: 'jawami',   ref: 'ابن ماجه:٢٣٤١', text: 'لا ضرر ولا ضرار — No Side Effects',                  rule: 'NO_HARM_PRINCIPLE',      domain: 'all',        weight: 1.00 },
  { id: 'SQ04', group: 'jawami',   ref: 'البخاري:٥٢',     text: 'الحلال بيِّن والحرام بيِّن — 3-tier classification',  rule: 'WHITELIST_BLACKLIST',    domain: 'ethics',     weight: 1.00 },
  { id: 'SQ05', group: 'jawami',   ref: 'مسلم:١٠١',       text: 'من غشَّنا فليس منا — Anti-fraud absolute',            rule: 'ANTI_FRAUD',             domain: 'market',     weight: 1.00 },
  { id: 'SQ06', group: 'jawami',   ref: 'البيهقي',        text: 'إن الله يحب إذا عمل أحدكم عملاً أن يتقنه',           rule: 'EXCELLENCE_IMPERATIVE',  domain: 'all',        weight: 1.00 },
  { id: 'SQ07', group: 'jawami',   ref: 'البخاري:٣٤٦١',  text: 'بلِّغوا عني ولو آية — Min Viable Communication',      rule: 'MINIMUM_BROADCAST',      domain: 'comms',      weight: 0.99 },
  { id: 'SQ08', group: 'jawami',   ref: 'مسلم:١٦٣١',     text: 'صدقة جارية أو علم ينتفع به — Persistent Legacy',      rule: 'PERPETUAL_LEGACY',       domain: 'all',        weight: 0.99 },
  { id: 'SQ09', group: 'jawami',   ref: 'ابن ماجه:٢٢٤',  text: 'طلب العلم فريضة — Mandatory Continuous Learning',     rule: 'MANDATORY_LEARNING',     domain: 'education',  weight: 1.00 },
  { id: 'SQ10', group: 'jawami',   ref: 'البخاري:٤٨١',   text: 'المؤمن للمؤمن كالبنيان — Microservices Reinforcement', rule: 'MODULAR_REINFORCEMENT',  domain: 'architecture',weight: 0.99 },
  { id: 'SQ11', group: 'jawami',   ref: 'أبو داود:٣٥٣٥', text: 'أدِّ الأمانة لمن ائتمنك — Return Resources to Owner',  rule: 'TRUST_FULFILLMENT',      domain: 'contracts',  weight: 1.00 },
  { id: 'SQ12', group: 'jawami',   ref: 'الترمذي:١٩٨٧',  text: 'اتق الله وأتبع السيئة الحسنة — Self-Healing',         rule: 'ERROR_RECOVERY',         domain: 'resilience', weight: 0.99 },

  // ب. السنة الفعلية
  { id: 'SF01', group: 'filiyya',  ref: 'البخاري:٥٢١',   text: 'صلاة الفجر يومياً — Reliable Scheduled Job',          rule: 'RELIABLE_SCHEDULED_JOB', domain: 'ibadah',     weight: 1.00 },
  { id: 'SF02', group: 'filiyya',  ref: 'سيرة ابن هشام',  text: 'بناء المسجد أولاً — Infrastructure First',             rule: 'INFRASTRUCTURE_FIRST',   domain: 'infra',      weight: 0.99 },
  { id: 'SF03', group: 'filiyya',  ref: 'الأنفال:٦٠',    text: 'الاستعداد الكامل ثم التوكل — Prepare Then Trust',       rule: 'PREPARE_TRUST',          domain: 'resilience', weight: 0.99 },
  { id: 'SF04', group: 'filiyya',  ref: 'صحيفة المدينة', text: 'كتابة العهود — Written Smart Contracts',                rule: 'WRITTEN_CONTRACTS',      domain: 'contracts',  weight: 0.99 },
  { id: 'SF05', group: 'filiyya',  ref: 'البخاري:٤٣٣٣',  text: 'إرسال المعلمين — Proactive Onboarding',                rule: 'PROACTIVE_ONBOARDING',   domain: 'education',  weight: 0.98 },

  // ج. الأخلاق النبوية
  { id: 'AK01', group: 'akhlaq',  ref: 'التوبة:١١٩',     text: 'الصدق المطلق — Immutable Logging',                     rule: 'ABSOLUTE_TRUTH',         domain: 'all',        weight: 1.00 },
  { id: 'AK02', group: 'akhlaq',  ref: 'الأنبياء:١٠٧',   text: '﴿رحمة للعالمين﴾ — Graceful Error Messages',            rule: 'UNIVERSAL_MERCY',        domain: 'ux',         weight: 1.00 },
  { id: 'AK03', group: 'akhlaq',  ref: 'آل عمران:١٥٩',   text: 'الحلم والصبر — Exponential Backoff',                   rule: 'PATIENT_RETRY',          domain: 'resilience', weight: 0.98 },
  { id: 'AK04', group: 'akhlaq',  ref: 'الأحزاب:٢١',     text: 'الأسوة الحسنة — Reference Implementation',             rule: 'REFERENCE_IMPL',         domain: 'all',        weight: 1.00 },
  { id: 'AK05', group: 'akhlaq',  ref: 'الكهف:١١٠',      text: 'التواضع — Servant Leader Pattern',                      rule: 'SERVANT_LEADER',         domain: 'governance', weight: 0.99 },

  // د. أحاديث العبادات
  { id: 'SW01', group: 'ibadat',  ref: 'البخاري:٨',       text: 'بُنِي الإسلام على خمس — Core System Architecture',     rule: 'CORE_FIVE_PILLARS',      domain: 'ibadah',     weight: 1.00 },
  { id: 'SW02', group: 'ibadat',  ref: 'مسلم:٢٣',         text: 'أفضل الإسلام — Input safety output',                   rule: 'SAFE_INPUT_OUTPUT',      domain: 'ethics',     weight: 0.99 },
  { id: 'SW03', group: 'ibadat',  ref: 'البخاري:٦٩٣٤',   text: 'من عمل عملاً ليس عليه أمرنا فهو ردّ — Reject invalid input', rule: 'INVALID_INPUT_REJECT', domain: 'security', weight: 0.99 },

  // ه. أحاديث المعاملات والاقتصاد
  { id: 'ME01', group: 'muamalat',ref: 'البخاري:٢٠٧٤',   text: 'البيِّعان بالخيار — User Can Cancel Before Finalize',   rule: 'CANCELLABLE_TRANSACTION',domain: 'market',     weight: 0.99 },
  { id: 'ME02', group: 'muamalat',ref: 'البخاري:٢٠٧١',   text: 'لا يبع أحدكم على بيع أخيه — Anti-Poaching',            rule: 'FAIR_COMPETITION',       domain: 'market',     weight: 0.99 },
  { id: 'ME03', group: 'muamalat',ref: 'مسلم:١٥٣٣',      text: 'نهى عن بيع الغرر — Prohibit Uncertain Contracts',       rule: 'NO_UNCERTAIN_CONTRACT',  domain: 'market',     weight: 1.00 },
  { id: 'ME04', group: 'muamalat',ref: 'البخاري:٢٢٢٧',   text: 'العُمَّال حقوقهم قبل أن يجف عرقهم — Pay on Time',       rule: 'TIMELY_PAYMENT',         domain: 'finance',    weight: 1.00 },
  { id: 'ME05', group: 'muamalat',ref: 'مسلم:١٦٣٤',      text: 'نهى عن الإسراف — Resource Optimization',                rule: 'NO_WASTE',               domain: 'resources',  weight: 0.98 },

  // و. أحاديث الحوكمة والقيادة
  { id: 'GV01', group: 'governance',ref: 'مسلم:١٨٢٩',    text: '«كلكم راعٍ وكلكم مسؤول» — Every Node Accountable',     rule: 'DISTRIBUTED_ACCOUNTABILITY', domain: 'governance', weight: 1.00 },
  { id: 'GV02', group: 'governance',ref: 'البخاري:٧١٣٨', text: 'لا تطلب الإمارة — Don\'t Seek Power',                    rule: 'NO_POWER_SEEKING',       domain: 'governance', weight: 0.99 },
  { id: 'GV03', group: 'governance',ref: 'مسلم:٤٧٢١',    text: 'ستكون فتن — Anticipate system failures early',           rule: 'ANTICIPATE_FAILURE',     domain: 'resilience', weight: 0.98 },
  { id: 'GV04', group: 'governance',ref: 'البخاري:٢٦٨٠', text: 'لا يقضي القاضي وهو غضبان — No angry deployments',       rule: 'CALM_STATE_REQUIRED',    domain: 'ops',        weight: 1.00 },

  // ز. سنة الخلفاء الراشدين
  { id: 'KR01', group: 'khulafa',  ref: 'أبو داود:٤٦٠٧', text: 'سنة الخلفاء الراشدين — 2nd tier standard library',      rule: 'RASHIDEEN_SUNNAH',       domain: 'all',        weight: 1.00 },
  { id: 'KR02', group: 'khulafa',  ref: 'البخاري:٤٩٨٦',  text: 'أبو بكر: جمع القرآن — Emergency Backup',                rule: 'CRITICAL_BACKUP',        domain: 'storage',    weight: 1.00 },
  { id: 'KR03', group: 'khulafa',  ref: 'البخاري:١٢٤١',  text: 'أبو بكر: ثباته يوم الوفاة — Graceful Degradation',      rule: 'GRACEFUL_DEGRADATION',   domain: 'resilience', weight: 1.00 },
  { id: 'KR04', group: 'khulafa',  ref: 'الطبري',        text: 'عمر: الديوان — First Database System',                   rule: 'DATABASE_ADMIN',         domain: 'db',         weight: 1.00 },
  { id: 'KR05', group: 'khulafa',  ref: 'الطبري',        text: 'عمر: «متى استعبدتم الناس» — Freedom Default',            rule: 'FREEDOM_DEFAULT',        domain: 'ux',         weight: 1.00 },
  { id: 'KR06', group: 'khulafa',  ref: 'البخاري:٤٩٨٧', text: 'عثمان: توحيد المصحف — Single Source of Truth',           rule: 'SINGLE_SOURCE_TRUTH',    domain: 'versioning', weight: 1.00 },
  { id: 'KR07', group: 'khulafa',  ref: 'البخاري:٤٩٨٧', text: 'عثمان: توزيع المصاحف — CDN',                            rule: 'CDN_DISTRIBUTION',       domain: 'cdn',        weight: 1.00 },
  { id: 'KR08', group: 'khulafa',  ref: 'نهج البلاغة',  text: 'علي: «قيمة كل امرئ ما يحسنه» — Skills RBAC',             rule: 'SKILLS_BASED_IDENTITY',  domain: 'rbac',       weight: 1.00 },
  { id: 'KR09', group: 'khulafa',  ref: 'الترمذي:٢٦٨٧', text: 'علي: «الحكمة ضالة المؤمن» — Wisdom Mining',              rule: 'WISDOM_MINING',          domain: 'ai',         weight: 1.00 },
  { id: 'KR10', group: 'khulafa',  ref: 'الشورى:٣٨',    text: 'المبدأ المشترك: الشورى — Distributed Consensus',          rule: 'SHURA_CONSENSUS',        domain: 'governance', weight: 1.00 },
]);

// ═══════════════════════════════════════════════════════════════════════════════
// ── المحرك ────────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

class SunnahCompleteNeuralEngine {
  constructor() {
    this.name    = 'Sheikha Sunnah Complete Neural Network';
    this.nameAr  = 'شبكة السنة النبوية الكاملة';
    this.version = VERSION;
    this.schema  = SCHEMA;
    this.tawheed = TAWHEED;

    this._cells  = SUNNAH_NEURAL_CELLS;
    this._cellMap= new Map(this._cells.map(c => [c.id, c]));
  }

  _strip(s) { return s.replace(/[\u064B-\u065F«»﴿﴾]/g,'').toLowerCase(); }

  search(q = '') {
    const sq = this._strip(q);
    if (!sq) return [];
    return this._cells.filter(c =>
      this._strip(c.text).includes(sq) ||
      this._strip(c.ref).includes(sq)  ||
      c.rule.toLowerCase().includes(sq)||
      c.domain.toLowerCase().includes(sq)
    );
  }

  getCellsByGroup(g)  { return this._cells.filter(c => c.group === g); }
  getCellsByDomain(d) { return this._cells.filter(c => c.domain === d); }
  getCell(id)         { return this._cellMap.get(id) || null; }

  getSunnahType(type) {
    return SUNNAH_TYPES[type] || null;
  }

  getHadithBook(rank) {
    return HADITH_BOOKS.find(b => b.rank === rank) || null;
  }

  status() {
    const groups = [...new Set(this._cells.map(c => c.group))];
    const totalHadiths = HADITH_BOOKS.reduce((a, b) => a + b.hadithCount, 0);
    return {
      engine:           this.name,
      nameAr:           this.nameAr,
      version:          this.version,
      hadithBooks:      HADITH_BOOKS.length,
      totalHadiths,
      hadithSciences:   HADITH_SCIENCES.length,
      jawamiAlKalim:    JAWAMI_AL_KALIM.length,
      sunnahFiliyya:    SUNNAH_FILIYYA.length,
      akhlaqNabawiyya:  AKHLAQ_NABAWIYYA.length,
      khulafaCaliphs:   KHULAFA_RASHIDEEN_EXTENDED.caliphs.length,
      neuralCells:      this._cells.length,
      groups,
      tawheed:          TAWHEED,
    };
  }
}

const engine = new SunnahCompleteNeuralEngine();

module.exports = {
  SunnahCompleteNeuralEngine,
  engine,
  SUNNAH_TYPES,
  HADITH_BOOKS,
  HADITH_SCIENCES,
  JAWAMI_AL_KALIM,
  SUNNAH_FILIYYA,
  AKHLAQ_NABAWIYYA,
  KHULAFA_RASHIDEEN_EXTENDED,
  SUNNAH_NEURAL_CELLS,
  TAWHEED,
  BISMILLAH,
  VERSION,
  SCHEMA,
  search:           (q)  => engine.search(q),
  getCellsByGroup:  (g)  => engine.getCellsByGroup(g),
  getCellsByDomain: (d)  => engine.getCellsByDomain(d),
  getCell:          (id) => engine.getCell(id),
  getSunnahType:    (t)  => engine.getSunnahType(t),
  getHadithBook:    (r)  => engine.getHadithBook(r),
  status:           ()   => engine.status(),
};
