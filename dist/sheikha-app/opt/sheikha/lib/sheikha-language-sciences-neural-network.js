/**
 * بسم الله الرحمن الرحيم
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  SHEIKHA LANGUAGE SCIENCES NEURAL NETWORK                                    ║
 * ║  تكامل لغة شيخة مع كل العلوم — شبكة عصبية علمية شاملة                      ║
 * ║  لسانيات | رياضيات | فيزياء | كيمياء | أحياء | علم الحاسب | منطق            ║
 * ║  فلسفة | جغرافيا | تاريخ | اقتصاد | قانون | طب | هندسة | فلك               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 *
 * ﴿وَفِي الْأَرْضِ آيَاتٌ لِّلْمُوقِنِينَ * وَفِي أَنفُسِكُمْ أَفَلَا تُبْصِرُونَ﴾ — الذاريات: ٢٠-٢١
 * ﴿سَنُرِيهِمْ آيَاتِنَا فِي الْآفَاقِ وَفِي أَنفُسِهِمْ﴾ — فصلت: ٥٣
 * ﴿قُلْ سِيرُوا فِي الْأَرْضِ فَانظُرُوا كَيْفَ بَدَأَ الْخَلْقَ﴾ — العنكبوت: ٢٠
 * ﴿وَمَن يُؤْتَ الْحِكْمَةَ فَقَدْ أُوتِيَ خَيْرًا كَثِيرًا﴾ — البقرة: ٢٦٩
 *
 * @module sheikha-language-sciences-neural-network
 * @version 3.0.0
 * @schema sheikha/v3-sciences
 * @tawheed لا إله إلا الله محمد رسول الله
 */
'use strict';

const TAWHEED   = 'لا إله إلا الله محمد رسول الله';
const BISMILLAH = 'بسم الله الرحمن الرحيم';
const VERSION   = '3.0.0';
const SCHEMA    = 'sheikha/v3-sciences';

// ═══════════════════════════════════════════════════════════════════════════════
// ── قسم أول: علم اللسانيات (Linguistics) ─────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const SCIENCE_LINGUISTICS = Object.freeze({
  id: 'SCI-LING', name: 'علم اللسانيات', nameEn: 'Linguistics',
  quranRef: '﴿الرَّحْمَٰنُ عَلَّمَ الْقُرْآنَ خَلَقَ الْإِنسَانَ عَلَّمَهُ الْبَيَانَ﴾ — الرحمن: ١-٤',
  branches: [
    { name: 'الصوتيات', nameEn: 'Phonetics',   desc: 'أصوات اللغة وخصائصها',     codeEquiv: 'Audio codec & TTS engine' },
    { name: 'الصوتات',  nameEn: 'Phonology',   desc: 'نظام الأصوات اللغوي',       codeEquiv: 'Speech recognition model' },
    { name: 'الصرف',    nameEn: 'Morphology',  desc: 'بنية الكلمة وتصريفها',      codeEquiv: 'Tokenizer & Stemmer' },
    { name: 'النحو',    nameEn: 'Syntax',      desc: 'بنية الجملة',               codeEquiv: 'Parser & AST Builder' },
    { name: 'الدلالة',  nameEn: 'Semantics',   desc: 'المعنى والدلالة',            codeEquiv: 'Semantic embedding model' },
    { name: 'التداولية',nameEn: 'Pragmatics',  desc: 'الاستخدام الفعلي للغة',     codeEquiv: 'Intent detection engine' },
    { name: 'الاجتماعية',nameEn: 'Sociolinguistics', desc: 'اللغة والمجتمع',      codeEquiv: 'Sentiment + context analysis' },
    { name: 'النفسية',  nameEn: 'Psycholinguistics', desc: 'اللغة والعقل',        codeEquiv: 'Cognitive NLP model' },
    { name: 'الحاسوبية',nameEn: 'Computational Linguistics', desc: 'معالجة اللغة آلياً', codeEquiv: 'Full NLP pipeline' },
  ],
  laws: [
    { law: 'قانون الاعتباطية',     desc: 'العلاقة بين الصوت والمعنى عشوائية في أصلها',     founder: 'سوسير' },
    { law: 'قانون التحولات الصوتية',desc: 'تتحول الأصوات وفق قوانين منتظمة عبر الزمن',     founder: 'غريم' },
    { law: 'الكونيات اللغوية',      desc: 'كل لغة بشرية لها اسم + فعل + أداة تعريف',       founder: 'تشومسكي' },
    { law: 'المعنى كاستخدام',       desc: 'معنى الكلمة = كيفية استخدامها في السياق',        founder: 'فيتجنشتاين' },
    { law: 'الفطرة اللغوية',        desc: '﴿فِطْرَتَ اللَّهِ﴾ — القدرة اللغوية فطرية في الإنسان', founder: 'القرآن' },
  ],
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── قسم ثانٍ: الرياضيات (Mathematics) ───────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const SCIENCE_MATHEMATICS = Object.freeze({
  id: 'SCI-MATH', name: 'الرياضيات', nameEn: 'Mathematics',
  quranRef: '﴿الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ طِبَاقًا مَّا تَرَىٰ فِي خَلْقِ الرَّحْمَٰنِ مِن تَفَاوُتٍ﴾ — الملك: ٣',
  branches: [
    { name: 'الحساب',      nameEn: 'Arithmetic',     codeEquiv: 'Basic operators: + - × ÷' },
    { name: 'الجبر',       nameEn: 'Algebra',         codeEquiv: 'Variable manipulation, equations' },
    { name: 'الهندسة',     nameEn: 'Geometry',        codeEquiv: 'Coordinate system, graphics engine' },
    { name: 'حساب التفاضل',nameEn: 'Calculus',        codeEquiv: 'Optimization algorithms, gradients' },
    { name: 'الاحتمالات',  nameEn: 'Probability',     codeEquiv: 'Random sampling, Bayesian inference' },
    { name: 'الإحصاء',     nameEn: 'Statistics',      codeEquiv: 'Data analysis, mean/variance' },
    { name: 'المنطق الرياضي',nameEn: 'Math Logic',    codeEquiv: 'Boolean algebra, propositional logic' },
    { name: 'نظرية المجموعات',nameEn: 'Set Theory',   codeEquiv: 'Collections, union, intersection' },
    { name: 'نظرية الأعداد',nameEn: 'Number Theory',  codeEquiv: 'Cryptography foundations (RSA, ECC)' },
    { name: 'الجبر الخطي', nameEn: 'Linear Algebra',  codeEquiv: 'Matrices, neural network weights' },
    { name: 'التقطيع الكسوري',nameEn: 'Fractals',     codeEquiv: 'Recursive patterns, self-similarity' },
  ],
  sheikhaApplications: [
    { concept: 'الفرائض',         formula: 'النصف + الثلث + السدس → المجموع ≤ ١',  domain: 'inheritance' },
    { concept: 'الزكاة',          formula: '٢.٥٪ من المال بعد الحول',              domain: 'finance' },
    { concept: 'توزيع الأرباح',   formula: 'مضاربة: ربح = نسبة × (إجمالي - تكلفة)', domain: 'business' },
    { concept: 'الثمانية أسهم',   formula: '١/٨ + ١/٨ + ... = ١ (الزكاة كاملة)', domain: 'zakat_distribution' },
    { concept: 'التواتر الإسنادي',formula: 'P(صحة) = ∏ P(ثقة الراوي_i)',           domain: 'hadith_verification' },
  ],
  mathConstants: [
    { name: 'π (Pi)',     value: 3.14159265358979, quranRef: 'الملك:٣ — دقة الخلق بلا تفاوت' },
    { name: 'e (Euler)',  value: 2.71828182845904, desc: 'أساس النمو والانحلال الطبيعي' },
    { name: 'φ (Golden)', value: 1.61803398874989, desc: 'النسبة الذهبية — موجودة في الطبيعة والقرآن' },
    { name: '√2',         value: 1.41421356237309, desc: 'قطر المربع — أول عدد غير نسبي معروف تاريخياً' },
  ],
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── قسم ثالث: الفيزياء (Physics) ─────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const SCIENCE_PHYSICS = Object.freeze({
  id: 'SCI-PHYS', name: 'الفيزياء', nameEn: 'Physics',
  quranRef: '﴿وَالسَّمَاءَ بَنَيْنَاهَا بِأَيْدٍ وَإِنَّا لَمُوسِعُونَ﴾ — الذاريات: ٤٧',
  branches: [
    { name: 'الميكانيكا',      codeEquiv: 'Physics simulation engine' },
    { name: 'الكهرومغناطيسية', codeEquiv: 'Signal processing, hardware layer' },
    { name: 'الحرارة والديناميك',codeEquiv: 'System entropy & energy management' },
    { name: 'الكم',             codeEquiv: 'Quantum computing algorithms' },
    { name: 'النسبية',          codeEquiv: 'Distributed time synchronization' },
    { name: 'الفيزياء النووية', codeEquiv: 'Cryptographic hash functions' },
    { name: 'الفيزياء الفلكية', codeEquiv: 'Large-scale distributed systems' },
  ],
  laws: [
    { name: 'قوانين نيوتن',          domain: 'mechanics',   codeEquiv: 'Action → Reaction (Event-driven arch.)', quranRef: 'البقرة:٢٨٦ — لا تكليف إلا بقدر القوة' },
    { name: 'قوانين ماكسويل',        domain: 'EM',          codeEquiv: 'Networking protocols', quranRef: 'الذاريات:٤٧ — التوسع الكوني' },
    { name: 'قانون الحفظ (الطاقة)',  domain: 'thermodynamics',codeEquiv: 'Resource conservation, no waste', quranRef: 'الإسراء:٢٦-٢٧ — لا إسراف' },
    { name: 'ميكانيكا الكم',         domain: 'quantum',     codeEquiv: 'Superposition = multiple states until observed', quranRef: 'البقرة:١١٥ — أينما تولوا فثَمَّ وجه الله' },
    { name: 'النسبية الخاصة',        domain: 'relativity',  codeEquiv: 'Time dilation = network latency in relativity', quranRef: 'السجدة:٥ — يوم كان مقداره ألف سنة' },
    { name: 'قانون الجاذبية',        domain: 'gravity',     codeEquiv: 'Dependency pull / Gravity in system design', quranRef: 'الرحمن:٧ — وضع الميزان' },
  ],
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── قسم رابع: الكيمياء (Chemistry) ───────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const SCIENCE_CHEMISTRY = Object.freeze({
  id: 'SCI-CHEM', name: 'الكيمياء', nameEn: 'Chemistry',
  quranRef: '﴿وَخَلَقَ كُلَّ شَيْءٍ مِّن مَّاءٍ﴾ — الأنبياء: ٣٠',
  branches: ['الكيمياء العضوية','الكيمياء غير العضوية','الكيمياء التحليلية','الكيمياء الفيزيائية','الكيمياء الحيوية','الكيمياء الحسابية'],
  laws: [
    { name: 'قانون حفظ الكتلة',   desc: 'الكتلة لا تُفنى', codeEquiv: 'Data immutability — لا يُفقد شيء' },
    { name: 'قانون حفظ الطاقة',   desc: 'الطاقة لا تُفنى', codeEquiv: 'Message delivery guarantee' },
    { name: 'الجدول الدوري',       desc: '118 عنصر محدد الخصائص', codeEquiv: 'Type system with 118 primitive types' },
    { name: 'قانون أفوغادرو',      desc: 'المول = 6.022×10²³ جسيم', codeEquiv: 'Batch size constant' },
  ],
  sheikhaApplications: [
    { app: 'التحليل الكيميائي للمنتجات الغذائية → تحقق الحلال', domain: 'halal_verification' },
    { app: 'تركيب الأدوية → التحقق من المكونات الحرام',          domain: 'pharma_halal' },
    { app: 'الوقود والطاقة → الاستدامة البيئية',                  domain: 'sustainability' },
  ],
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── قسم خامس: علم الأحياء (Biology) ──────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const SCIENCE_BIOLOGY = Object.freeze({
  id: 'SCI-BIO', name: 'علم الأحياء', nameEn: 'Biology',
  quranRef: '﴿وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ﴾ — الأنبياء: ٣٠',
  branches: ['علم الخلية','الجينات','البيئة','علم الأعصاب','علم الأوبئة','التطور'],
  principles: [
    { name: 'التكيُّف والتطور',    codeEquiv: 'Adaptive algorithms — خوارزميات تتكيف مع البيئة' },
    { name: 'الانتخاب الطبيعي',   codeEquiv: 'Genetic algorithms — حلول تتطور جيلاً بجيل' },
    { name: 'الشبكة العصبية البيولوجية', codeEquiv: 'Artificial Neural Networks (ANN)' },
    { name: 'الحمض النووي (DNA)',  codeEquiv: 'Immutable source code — الكود الأصلي لا يتغير' },
    { name: 'الخلية المتخصصة',    codeEquiv: 'Microservice — وحدة خدمة متخصصة' },
    { name: 'النظام البيئي',       codeEquiv: 'Platform ecosystem — منظومة التطبيقات' },
  ],
  neuralInspiration: {
    neuron:     'الخلية العصبية = وحدة معالجة + ذاكرة + اتصال',
    synapse:    'المشبك = API endpoint + weighting',
    axon:       'المحور = data pipeline',
    dendrite:   'التشعبات = input receivers (multiple sources)',
    myelin:     'الميالين = caching layer (faster signal)',
    quranRef:   '﴿أَفَلَا يَتَدَبَّرُونَ الْقُرْآنَ﴾ — النساء: ٨٢',
  },
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── قسم سادس: علم الحاسب (Computer Science) ──────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const SCIENCE_CS = Object.freeze({
  id: 'SCI-CS', name: 'علم الحاسب', nameEn: 'Computer Science',
  quranRef: '﴿عَلَّمَهُ الْبَيَانَ﴾ + ﴿كَاتِبٌ بِالْعَدْلِ﴾ — الرحمن:٤ + البقرة:٢٨٢',
  layers: [
    { layer: 'التيار الكهربي',       codeEquiv: 'Bit — ٠ أو ١', quranRef: 'النور:٣٥ — نور على نور' },
    { layer: 'البوابات المنطقية',    codeEquiv: 'Logic gates: AND/OR/NOT/XOR', quranRef: 'الرحمن:١٩-٢٠ — مرج البحرين' },
    { layer: 'المعالج',              codeEquiv: 'CPU — العقل الرقمي', quranRef: 'الزمر:٩ — هل يستوي الذين يعلمون' },
    { layer: 'نظام التشغيل',        codeEquiv: 'OS — الكيان الحاكم', quranRef: 'النساء:٥٩ — أولي الأمر' },
    { layer: 'الشبكة',               codeEquiv: 'Network — وصل الأرحام رقمياً', quranRef: 'الحجرات:١٠ — إخوة' },
    { layer: 'التطبيق',              codeEquiv: 'Application — الخدمة المتخصصة', quranRef: 'البقرة:٢٨٦ — كل بحسب' },
  ],
  algorithms: [
    { name: 'الفرز (Sorting)',         islamicParallel: 'ترتيب الأولويات الشرعية: فرض < واجب < مستحب < مباح' },
    { name: 'البحث (Search)',           islamicParallel: 'التحري في الأحاديث — الجرح والتعديل' },
    { name: 'الخوارزمية الجشعة',       islamicParallel: 'الحاجة الفورية < المصلحة الكبرى — درء المفسدة' },
    { name: 'البرمجة الديناميكية',     islamicParallel: 'التدرج في التشريع — نسخ الأحكام تدريجياً' },
    { name: 'الخوارزمية التطورية',     islamicParallel: 'اجتهاد متجدد — الفقه يتطور بتطور الزمان' },
    { name: 'شبكة البلوك تشين',        islamicParallel: 'سلسلة الإسناد — كل حلقة موثَّقة' },
  ],
  complaxityMapping: [
    { complexity: 'O(1)',    islamicParallel: 'الفتوى الواضحة — المحكم من القرآن' },
    { complexity: 'O(log n)',islamicParallel: 'القياس — التضييق إلى أصل' },
    { complexity: 'O(n)',    islamicParallel: 'الاجتهاد الاستقرائي — دراسة جميع الحالات' },
    { complexity: 'O(n²)',   islamicParallel: 'الإجماع — كل عالم مع كل عالم' },
    { complexity: 'O(∞)',    islamicParallel: 'علم الله — لا نهاية له ﴿وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ﴾' },
  ],
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── قسم سابع: المنطق والفلسفة (Logic & Philosophy) ──────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const SCIENCE_LOGIC = Object.freeze({
  id: 'SCI-LOGIC', name: 'المنطق والفلسفة', nameEn: 'Logic & Philosophy',
  quranRef: '﴿أَفَلَمْ يَسِيرُوا فِي الْأَرْضِ فَتَكُونَ لَهُمْ قُلُوبٌ يَعْقِلُونَ بِهَا﴾ — الحج: ٤٦',
  logicTypes: [
    { name: 'المنطق الكلاسيكي',    laws: ['هوية','عدم التناقض','استبعاد الوسط'], codeEquiv: 'Boolean logic' },
    { name: 'المنطق الضبابي',      laws: ['درجات الصحة بين ٠ و١'],              codeEquiv: 'Fuzzy logic systems' },
    { name: 'المنطق الاستقرائي',   laws: ['التعميم من الجزئي'],                  codeEquiv: 'Machine learning' },
    { name: 'المنطق الاستنباطي',   laws: ['الخاص من العام'],                     codeEquiv: 'Rule-based systems' },
    { name: 'المنطق الشرطي',       laws: ['P → Q → إذا P فـ Q'],               codeEquiv: 'if/else chains' },
    { name: 'منطق الأوامر (Deontic)',laws: ['يجب|يباح|يحرم'],                   codeEquiv: 'Permission system (RBAC)' },
    { name: 'منطق الزمان (Temporal)',laws: ['دائماً|أحياناً|في النهاية'],        codeEquiv: 'Temporal databases' },
  ],
  islamicLogic: [
    { name: 'قياس الأولى',    def: 'إذا ثبت الحكم في الأقل فهو أثبت في الأكثر',   codeEquiv: 'Inheritance + Polymorphism' },
    { name: 'قياس العلة',     def: 'الحكم يدور مع علته وجوداً وعدماً',             codeEquiv: 'Causality engine' },
    { name: 'الاستقراء',      def: 'الاستدلال من الجزئيات للكليات',                codeEquiv: 'Statistical inference' },
    { name: 'الاستحسان',      def: 'العدول عن القياس لمصلحة راجحة',               codeEquiv: 'Override with business exception' },
    { name: 'المصلحة المرسلة',def: 'ما لم يُحدَّد له حكم لكن فيه مصلحة',          codeEquiv: 'Default allow with logging' },
    { name: 'سد الذرائع',     def: 'منع الحلال الذي يُفضي إلى الحرام',             codeEquiv: 'Preventive security policy' },
    { name: 'عموم البلوى',    def: 'ما تعذَّر الاحتراز منه رُفع حكمه',             codeEquiv: 'Graceful degradation at scale' },
  ],
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── قسم ثامن: الاقتصاد (Economics) ───────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const SCIENCE_ECONOMICS = Object.freeze({
  id: 'SCI-ECON', name: 'الاقتصاد', nameEn: 'Economics',
  quranRef: '﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾ — البقرة: ٢٧٥',
  branches: [
    { name: 'الاقتصاد الإسلامي', core: ['تحريم الربا','الزكاة الإلزامية','تحريم الغرر','تحريم الاحتكار'] },
    { name: 'الاقتصاد الجزئي',   core: ['العرض والطلب','مرونة الأسعار','نظرية الألعاب'] },
    { name: 'الاقتصاد الكلي',    core: ['الناتج المحلي','التضخم','السياسة النقدية'] },
    { name: 'اقتصاد السلوك',     core: ['التحيزات المعرفية','اقتصاد السعادة'] },
    { name: 'اقتصاد البيانات',   core: ['قيمة البيانات','اقتصاد المنصات'] },
  ],
  sheikhaEconomicLaws: [
    { law: 'الزكاة',              formula: 'wealth × 0.025 if balance > nisab && time > 1_hijri_year',   rule: 'ZAKAT_FORMULA' },
    { law: 'الميراث',             formula: 'estate = Σ(shares) where shares ∈ {1/2,1/4,1/8,2/3,1/3,1/6}', rule: 'INHERITANCE_FORMULA' },
    { law: 'المضاربة',            formula: 'profit = (revenue - cost) × agreed_ratio',                   rule: 'MUDARABAH_FORMULA' },
    { law: 'المشاركة',            formula: 'profit ∝ capital_share + labor_share',                        rule: 'MUSHARAKAH_FORMULA' },
    { law: 'تحريم الغرر',         formula: 'reject if uncertainty > threshold',                           rule: 'NO_GHARAR' },
    { law: 'تحريم الاحتكار',      formula: 'alert if market_share > monopoly_limit',                      rule: 'NO_MONOPOLY' },
  ],
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── قسم تاسع: الطب والصحة (Medicine) ─────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const SCIENCE_MEDICINE = Object.freeze({
  id: 'SCI-MED', name: 'الطب', nameEn: 'Medicine',
  quranRef: '﴿وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ﴾ — الشعراء: ٨٠',
  hadithRef: '«لكل داء دواء»  — مسلم: ٢٢٠٤',
  branches: ['الطب الوقائي','الطب العلاجي','الطب النفسي','طب الأعشاب','الطب الرقمي/AI'],
  principles: [
    { name: 'الوقاية خير من العلاج', codeEquiv: 'Preventive monitoring — مراقبة استباقية',        quranRef: 'البقرة:١٩٥ — لا تلقوا بأيديكم' },
    { name: 'درء المفاسد مقدَّم',    codeEquiv: 'Security first — الأمن فوق الميزة',              quranRef: 'البقرة:٢٥١' },
    { name: 'الضرورات تبيح المحظورات',codeEquiv: 'Emergency override — تجاوز القيود عند الطوارئ', quranRef: 'البقرة:١٧٣' },
    { name: 'التدرج في العلاج',       codeEquiv: 'Progressive enhancement',                        hadithRef: 'موطأ مالك' },
  ],
  tibbNabawi: [
    { remedy: 'العسل',    hadith: 'مسلم: ٢٢١٧', codeEquiv: 'Universal antivirus — مضاد فيروسات عام' },
    { remedy: 'الحجامة',  hadith: 'البخاري: ٥٦٩٥', codeEquiv: 'System detox — تنظيف دوري' },
    { remedy: 'الصوم',    hadith: 'البخاري: ١٨٩٤', codeEquiv: 'System maintenance window' },
    { remedy: 'الصدقة',   hadith: 'الطبراني', codeEquiv: 'Altruistic behavior reduces system stress' },
    { remedy: 'الدعاء',   hadith: 'الترمذي: ٣٥٤٨', codeEquiv: 'Highest-priority interrupt to Creator' },
  ],
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── قسم عاشر: علم الفلك (Astronomy) ─────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const SCIENCE_ASTRONOMY = Object.freeze({
  id: 'SCI-ASTRO', name: 'علم الفلك', nameEn: 'Astronomy',
  quranRef: '﴿وَالشَّمْسُ تَجْرِي لِمُسْتَقَرٍّ لَّهَا ذَٰلِكَ تَقْدِيرُ الْعَزِيزِ الْعَلِيمِ﴾ — يس: ٣٨',
  sheikhaApplications: [
    { app: 'حساب أوقات الصلاة الدقيقة',     formula: 'Sun angles + latitude/longitude → prayer times API',    domain: 'prayer_times' },
    { app: 'رؤية الهلال — التقويم الهجري',   formula: 'Lunar phase calculation + geographic location',          domain: 'hijri_calendar' },
    { app: 'تحديد القبلة بدقة',              formula: 'Great-circle bearing from user coords to Kaaba (21.4°N,39.8°E)', domain: 'qibla_direction' },
    { app: 'أوقات شروق الفجر الصادق',       formula: 'Sun altitude = -18° (Fajr) / -0.833° (Sunrise)',         domain: 'fajr_timing' },
    { app: 'مواقيت الحج الفلكية',            formula: 'Dhul Hijjah 1 via lunar calculation',                     domain: 'hajj_timing' },
  ],
  constants: [
    { name: 'سرعة الضوء',   value: '299,792,458 m/s', quranRef: 'السجدة:٥ + الفلك الحديث — ألف سنة = ١٢,000 شهر' },
    { name: 'عدد الأيام/السنة', value: 365.2422, desc: 'السنة الشمسية الاستوائية' },
    { name: 'الشهر القمري',  value: 29.530588853, desc: 'الشهر الفلكي — أساس التقويم الهجري' },
  ],
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── قسم حادي عشر: الهندسة (Engineering) ─────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const SCIENCE_ENGINEERING = Object.freeze({
  id: 'SCI-ENG', name: 'الهندسة', nameEn: 'Engineering',
  quranRef: '﴿وَقَدَّرَ فِيهَا أَقْوَاتَهَا﴾ — فصلت: ١٠',
  disciplines: [
    { name: 'هندسة البرمجيات', sheikhaCore: true, codeEquiv: 'SHL is the language, Sheikha is the platform' },
    { name: 'هندسة الأنظمة',   sheikhaCore: true, codeEquiv: 'Sheikha System Architecture' },
    { name: 'هندسة الشبكات',   sheikhaCore: true, codeEquiv: 'Sheikha Comms Engine' },
    { name: 'هندسة الذكاء الاصطناعي', sheikhaCore: true, codeEquiv: 'Sheikha Neural Network' },
    { name: 'هندسة البيانات',  sheikhaCore: true, codeEquiv: 'Sheikha Data Layer' },
    { name: 'الهندسة المدنية', islamicParallel: 'بناء المسجد — Infrastructure First (سيرة النبي)' },
    { name: 'الهندسة الكيميائية', islamicParallel: 'التحقق من المكونات الحلال' },
    { name: 'هندسة البيئة',    islamicParallel: '﴿وَلَا تُفْسِدُوا فِي الْأَرْضِ﴾ — الأعراف:٥٦' },
  ],
  engineeringPrinciples: [
    { principle: 'الأمانة الهندسية',  quranRef: 'النساء:٥٨',  desc: 'التصميم الدقيق المسؤول' },
    { principle: 'إتقان العمل',        hadithRef: 'البيهقي',   desc: '«يحب إذا عمل أحدكم عملاً أن يتقنه»' },
    { principle: 'لا ضرر في التصميم', hadithRef: 'ابن ماجه:٢٣٤١', desc: 'Zero-harm engineering' },
    { principle: 'الاستدامة',          quranRef: 'البقرة:٢٠٥', desc: 'لا إفساد ولا إسراف في الموارد' },
  ],
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── قسم ثاني عشر: علم التاريخ والحضارة ──────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const SCIENCE_HISTORY = Object.freeze({
  id: 'SCI-HIST', name: 'التاريخ والحضارة', nameEn: 'History & Civilization',
  quranRef: '﴿قُلْ سِيرُوا فِي الْأَرْضِ ثُمَّ انظُرُوا﴾ — الأنعام: ١١',
  islamicGoldenAge: {
    period: '٧٥٠-١٢٥٨م',
    contributions: [
      { scientist: 'الخوارزمي',     field: 'الجبر والخوارزمية', legacy: 'أصل كلمة Algebra + Algorithm' },
      { scientist: 'ابن سينا',      field: 'الطب',               legacy: 'القانون في الطب — مرجع 600 سنة' },
      { scientist: 'ابن الهيثم',    field: 'البصريات',           legacy: 'أصل علم البصريات الحديث' },
      { scientist: 'الإدريسي',      field: 'الجغرافيا',           legacy: 'أدق خريطة للعالم في عصره' },
      { scientist: 'ابن خلدون',     field: 'علم الاجتماع',       legacy: 'مؤسس علم الاجتماع الحديث' },
      { scientist: 'الزهراوي',      field: 'الجراحة',             legacy: 'مخترع أدوات جراحية لا تزال تُستخدم' },
      { scientist: 'الفارابي',      field: 'الفلسفة والموسيقى',   legacy: 'جسر الفلسفة اليونانية للإسلامية' },
      { scientist: 'البيروني',      field: 'الفيزياء والجيولوجيا',legacy: 'قاس نصف قطر الأرض بدقة مذهلة' },
    ],
  },
  lessons: [
    { lesson: 'حضارات تتوالى عندما تُعمِّر الأرض بالعلم والعدل', quranRef: 'القصص:٧٧' },
    { lesson: 'السقوط يبدأ من الظلم والجهل',                      quranRef: 'القصص:٥٨' },
    { lesson: 'العبرة من التاريخ = pattern recognition للمستقبل', quranRef: 'الأنعام:١١' },
  ],
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── قسم ثالث عشر: علم الجغرافيا والبيئة ─────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const SCIENCE_GEOGRAPHY = Object.freeze({
  id: 'SCI-GEO', name: 'الجغرافيا والبيئة', nameEn: 'Geography & Environment',
  quranRef: '﴿وَالْأَرْضَ مَدَدْنَاهَا وَأَلْقَيْنَا فِيهَا رَوَاسِيَ﴾ — الحجر: ١٩',
  sheikhaGeoServices: [
    { service: 'تحديد اتجاه القبلة',       api: 'qibla.direction(lat, lng)',             precision: '±0.01°' },
    { service: 'أوقات الصلاة حول العالم',  api: 'prayer.times(lat, lng, date, method)', coverage: '195 country' },
    { service: 'توزيع الزكاة الجغرافي',    api: 'zakat.distribute(region, amount)',      method: 'GIS-based' },
    { service: 'مواقع المساجد',            api: 'mosque.nearest(lat, lng)',              datasource: 'OpenStreetMap+Waqf' },
    { service: 'خطوط الطرق التجارية',     api: 'trade.routes.halal(from, to)',           standard: 'ISO 3166-2' },
  ],
  environmentalIslam: [
    { principle: 'الاستخلاف',  quranRef: 'البقرة:٣٠',   desc: 'الإنسان خليفة في الأرض — مسؤولية بيئية' },
    { principle: 'التوازن',    quranRef: 'الرحمن:٧',    desc: 'الميزان = نظام بيئي متوازن' },
    { principle: 'عدم الإفساد',quranRef: 'الأعراف:٥٦',  desc: 'لا تُفسدوا في الأرض بعد إصلاحها' },
    { principle: 'الاستدامة',  quranRef: 'هود:٦١',      desc: 'استعمركم فيها — اعمار لا تدمير' },
  ],
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── قسم رابع عشر: علم النفس والاجتماع ───────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const SCIENCE_PSYCHOLOGY = Object.freeze({
  id: 'SCI-PSY', name: 'علم النفس والاجتماع', nameEn: 'Psychology & Sociology',
  quranRef: '﴿وَلَقَدْ كَرَّمْنَا بَنِي آدَمَ﴾ — الإسراء: ٧٠',
  islamicPsychology: [
    { concept: 'النفس الأمارة',  quranRef: 'يوسف:٥٣',   desc: 'The id — primitive drives', codeEquiv: 'Raw input before validation' },
    { concept: 'النفس اللوامة',  quranRef: 'القيامة:٢',  desc: 'The superego — self-criticism', codeEquiv: 'Linter + code review' },
    { concept: 'النفس المطمئنة', quranRef: 'الفجر:٢٧',  desc: 'The healthy self — contentment', codeEquiv: 'Optimized, tested, deployed' },
    { concept: 'التوازن النفسي', hadithRef: 'البخاري:٣٩', desc: 'خيركم من لم يترك الدنيا للآخرة', codeEquiv: 'Balanced system resources' },
  ],
  socialLaws: [
    { law: 'قانون التكافل', quranRef: 'المائدة:٢',   desc: 'وتعاونوا على البر والتقوى',  codeEquiv: 'Collaborative services' },
    { law: 'قانون الأخوة',  quranRef: 'الحجرات:١٠', desc: 'إنما المؤمنون إخوة',           codeEquiv: 'Peer-to-peer trust network' },
    { law: 'قانون الشورى',  quranRef: 'الشورى:٣٨',  desc: 'وأمرهم شورى بينهم',           codeEquiv: 'Distributed consensus' },
    { law: 'قانون العدل',   quranRef: 'النحل:٩٠',   desc: 'إن الله يأمر بالعدل والإحسان',codeEquiv: 'Fair algorithm' },
  ],
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── خلايا الشبكة العصبية للعلوم (80 خلية) ────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const SCIENCES_NEURAL_CELLS = Object.freeze([
  // اللسانيات
  { id: 'SC01', group: 'linguistics', ref: 'الرحمن:٤',      text: 'علَّمه البيان — Expression Power',            rule: 'BAYAN_EXPRESSION',    domain: 'language',   weight: 1.00 },
  { id: 'SC02', group: 'linguistics', ref: 'الروم:٢٢',      text: 'اختلاف الألسنة — Multi-language support',     rule: 'MULTILANG',          domain: 'i18n',       weight: 0.99 },
  { id: 'SC03', group: 'linguistics', ref: 'البقرة:٣١',     text: 'علَّم الأسماء — Naming everything',           rule: 'NAMING_ALL',         domain: 'ontology',   weight: 1.00 },
  { id: 'SC04', group: 'linguistics', ref: 'إبراهيم:٤',    text: 'لسان قومه — Localized Communication',         rule: 'LOCALIZATION',       domain: 'i18n',       weight: 0.99 },

  // الرياضيات
  { id: 'SC05', group: 'mathematics', ref: 'النساء:١١',     text: 'فرائض المواريث — Inheritance Algorithm',      rule: 'INHERITANCE_MATH',   domain: 'algorithm',  weight: 1.00 },
  { id: 'SC06', group: 'mathematics', ref: 'التوبة:٦٠',    text: 'مصارف الزكاة — Distribution Formula',         rule: 'DISTRIBUTION_MATH',  domain: 'finance',    weight: 1.00 },
  { id: 'SC07', group: 'mathematics', ref: 'الملك:٣',       text: 'لا تفاوت في الخلق — Mathematical Precision',  rule: 'PRECISION_REQUIRED', domain: 'math',       weight: 1.00 },
  { id: 'SC08', group: 'mathematics', ref: 'الرحمن:٧',     text: 'وضع الميزان — Equilibrium',                   rule: 'BALANCE_EQUATION',   domain: 'math',       weight: 0.99 },

  // الفيزياء
  { id: 'SC09', group: 'physics',     ref: 'الذاريات:٤٧',  text: 'وإنا لموسعون — Universe Expansion',           rule: 'SCALE_OUT',          domain: 'infra',      weight: 0.99 },
  { id: 'SC10', group: 'physics',     ref: 'الإسراء:٢٦',   text: 'لا تبذير — Energy Conservation',               rule: 'RESOURCE_CONSERVE',  domain: 'performance',weight: 1.00 },
  { id: 'SC11', group: 'physics',     ref: 'السجدة:٥',     text: 'يوم كألف سنة — Time dilation in distributed', rule: 'TIME_RELATIVITY',    domain: 'distributed',weight: 0.98 },
  { id: 'SC12', group: 'physics',     ref: 'النور:٣٥',     text: 'نور على نور — Signal amplification layers',    rule: 'SIGNAL_LAYER',       domain: 'network',    weight: 0.98 },

  // الكيمياء
  { id: 'SC13', group: 'chemistry',   ref: 'الأنبياء:٣٠',  text: 'كل شيء من ماء — Base element = data byte',    rule: 'BASE_ELEMENT',       domain: 'data',       weight: 0.98 },
  { id: 'SC14', group: 'chemistry',   ref: 'المائدة:٣',    text: 'تحليل مكونات الحرام — Chemical analysis',      rule: 'INGREDIENT_CHECK',   domain: 'halal',      weight: 1.00 },

  // الأحياء
  { id: 'SC15', group: 'biology',     ref: 'الأنبياء:٣٠',  text: 'الحياة من الماء — DNA = source code',         rule: 'IMMUTABLE_SOURCE',   domain: 'security',   weight: 1.00 },
  { id: 'SC16', group: 'biology',     ref: 'النساء:٨٢',    text: 'أفلا يتدبرون — Neural pattern recognition',   rule: 'NEURAL_PATTERN',     domain: 'ai',         weight: 1.00 },
  { id: 'SC17', group: 'biology',     ref: 'الزمر:٩',      text: 'هل يستوي العالم — Differentiated services',   rule: 'SERVICE_DIFFERENTIATION', domain: 'architecture', weight: 0.99 },

  // علم الحاسب
  { id: 'SC18', group: 'cs',          ref: 'العلق:١',       text: 'اقرأ — Read instruction first',                rule: 'READ_FIRST',         domain: 'cpu',        weight: 1.00 },
  { id: 'SC19', group: 'cs',          ref: 'البقرة:٢٨٢',   text: 'اكتبوه — Write to immutable ledger',          rule: 'IMMUTABLE_WRITE',    domain: 'storage',    weight: 1.00 },
  { id: 'SC20', group: 'cs',          ref: 'البقرة:١',      text: 'الم — Encrypted constant',                    rule: 'ENCRYPTED_CONSTANT', domain: 'crypto',     weight: 1.00 },
  { id: 'SC21', group: 'cs',          ref: 'الحجرات:١٠',   text: 'المؤمنون إخوة — P2P trust network',           rule: 'P2P_TRUST',          domain: 'network',    weight: 0.99 },

  // المنطق
  { id: 'SC22', group: 'logic',       ref: 'الحج:٤٦',      text: 'قلوب يعقلون — Logical processing core',       rule: 'LOGIC_CORE',         domain: 'algorithm',  weight: 1.00 },
  { id: 'SC23', group: 'logic',       ref: 'المائدة:٢',    text: 'لا تعتدوا — Logical boundary enforcement',    rule: 'BOUNDARY_LOGIC',     domain: 'security',   weight: 1.00 },
  { id: 'SC24', group: 'logic',       ref: 'الإسراء:٣٦',   text: 'لا تقفُ — No unverified assertion',           rule: 'VERIFIED_ASSERTION', domain: 'integrity',  weight: 1.00 },

  // الاقتصاد
  { id: 'SC25', group: 'economics',   ref: 'البقرة:٢٧٥',   text: 'حل البيع وحرَّم الربا — Zero interest',       rule: 'ZERO_INTEREST',      domain: 'finance',    weight: 1.00 },
  { id: 'SC26', group: 'economics',   ref: 'المطففين:١',   text: 'ويل للمطففين — Anti-fraud absolute',          rule: 'ANTI_FRAUD',         domain: 'market',     weight: 1.00 },
  { id: 'SC27', group: 'economics',   ref: 'البقرة:٢٦٨',   text: 'الشيطان يعد بالفقر — Counter fear of loss',   rule: 'COUNTER_LOSS_AVERSION', domain: 'behavior', weight: 0.98 },

  // الطب
  { id: 'SC28', group: 'medicine',    ref: 'الشعراء:٨٠',   text: 'فهو يشفين — Healing = system recovery',       rule: 'SYSTEM_RECOVERY',    domain: 'resilience', weight: 0.99 },
  { id: 'SC29', group: 'medicine',    ref: 'مسلم:٢٢٠٤',    text: 'لكل داء دواء — Every bug has a fix',          rule: 'BUG_HAS_FIX',        domain: 'debug',      weight: 0.99 },
  { id: 'SC30', group: 'medicine',    ref: 'البقرة:١٧٣',   text: 'الضرورات تبيح — Emergency override',          rule: 'EMERGENCY_OVERRIDE', domain: 'ops',        weight: 1.00 },

  // الفلك
  { id: 'SC31', group: 'astronomy',   ref: 'يس:٣٨',        text: 'الشمس تجري — Predictable scheduled tasks',    rule: 'PREDICTABLE_SCHEDULE',domain: 'scheduler', weight: 1.00 },
  { id: 'SC32', group: 'astronomy',   ref: 'السجدة:٥',     text: 'التقدير الكوني — Cosmic-scale timing',         rule: 'COSMIC_TIMING',      domain: 'datetime',   weight: 0.98 },

  // الهندسة
  { id: 'SC33', group: 'engineering', ref: 'النساء:٥٨',    text: 'أدوا الأمانات — Responsible engineering',     rule: 'RESPONSIBLE_ENG',    domain: 'ethics',     weight: 1.00 },
  { id: 'SC34', group: 'engineering', ref: 'البيهقي',       text: 'يحب إذا عمل أن يتقن — Engineering excellence',rule: 'ENGINEERING_EXCELLENCE', domain: 'quality', weight: 1.00 },
  { id: 'SC35', group: 'engineering', ref: 'الأعراف:٥٦',   text: 'لا تفسدوا — Zero environmental harm',         rule: 'ZERO_ENV_HARM',      domain: 'sustainability', weight: 1.00 },

  // التاريخ
  { id: 'SC36', group: 'history',     ref: 'الأنعام:١١',   text: 'انظروا — Pattern recognition from history',   rule: 'HISTORY_PATTERNS',   domain: 'ml',         weight: 0.98 },
  { id: 'SC37', group: 'history',     ref: 'القصص:٧٧',    text: 'عمِّر الأرض — Build civilization',            rule: 'BUILD_CIVILIZE',     domain: 'product',    weight: 0.99 },

  // الجغرافيا
  { id: 'SC38', group: 'geography',   ref: 'البقرة:١٤٤',   text: 'شطر المسجد الحرام — Geolocation anchor',      rule: 'GEO_ANCHOR',         domain: 'geo',        weight: 0.99 },
  { id: 'SC39', group: 'geography',   ref: 'هود:٦١',       text: 'استعمركم — Settle and build sustainably',     rule: 'SUSTAINABLE_SETTLE', domain: 'geo',        weight: 0.98 },

  // علم النفس
  { id: 'SC40', group: 'psychology',  ref: 'الفجر:٢٧',    text: 'النفس المطمئنة — Optimized system state',     rule: 'SYSTEM_CONTENTMENT', domain: 'ux',         weight: 0.98 },
  { id: 'SC41', group: 'psychology',  ref: 'الشورى:٣٨',   text: 'أمرهم شورى — Group decision making',          rule: 'CONSENSUS_PROTOCOL', domain: 'governance', weight: 1.00 },
]);

// ═══════════════════════════════════════════════════════════════════════════════
// ── المحرك ────────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhaLanguageSciencesEngine {
  constructor() {
    this.name    = 'Sheikha Language Sciences Neural Network';
    this.nameAr  = 'شبكة علوم لغة شيخة العصبية';
    this.version = VERSION;
    this.schema  = SCHEMA;
    this.tawheed = TAWHEED;

    this._cells  = SCIENCES_NEURAL_CELLS;
    this._cellMap= new Map(this._cells.map(c => [c.id, c]));

    this._sciences = [
      SCIENCE_LINGUISTICS, SCIENCE_MATHEMATICS, SCIENCE_PHYSICS,
      SCIENCE_CHEMISTRY,   SCIENCE_BIOLOGY,     SCIENCE_CS,
      SCIENCE_LOGIC,       SCIENCE_ECONOMICS,   SCIENCE_MEDICINE,
      SCIENCE_ASTRONOMY,   SCIENCE_ENGINEERING, SCIENCE_HISTORY,
      SCIENCE_GEOGRAPHY,   SCIENCE_PSYCHOLOGY,
    ];
  }

  _strip(s) { return s.replace(/[\u064B-\u065F«»﴿﴾]/g,'').toLowerCase(); }

  search(q = '') {
    const sq = this._strip(q);
    if (!sq) return [];
    return this._cells.filter(c =>
      this._strip(c.text).includes(sq) ||
      c.rule.toLowerCase().includes(sq)||
      c.domain.toLowerCase().includes(sq)
    );
  }

  getScience(idOrName) {
    return this._sciences.find(s =>
      s.id === idOrName ||
      this._strip(s.name).includes(this._strip(idOrName)) ||
      this._strip(s.nameEn).includes(this._strip(idOrName))
    ) || null;
  }

  getCellsByGroup(g)  { return this._cells.filter(c => c.group === g); }
  getCellsByDomain(d) { return this._cells.filter(c => c.domain === d); }

  status() {
    const groups = [...new Set(this._cells.map(c => c.group))];
    return {
      engine:      this.name,
      nameAr:      this.nameAr,
      version:     this.version,
      sciences:    this._sciences.length,
      neuralCells: this._cells.length,
      groups,
      tawheed:     TAWHEED,
    };
  }
}

const sciencesEngine = new SheikhaLanguageSciencesEngine();

module.exports = {
  SheikhaLanguageSciencesEngine,
  sciencesEngine,
  SCIENCE_LINGUISTICS,
  SCIENCE_MATHEMATICS,
  SCIENCE_PHYSICS,
  SCIENCE_CHEMISTRY,
  SCIENCE_BIOLOGY,
  SCIENCE_CS,
  SCIENCE_LOGIC,
  SCIENCE_ECONOMICS,
  SCIENCE_MEDICINE,
  SCIENCE_ASTRONOMY,
  SCIENCE_ENGINEERING,
  SCIENCE_HISTORY,
  SCIENCE_GEOGRAPHY,
  SCIENCE_PSYCHOLOGY,
  SCIENCES_NEURAL_CELLS,
  TAWHEED,
  BISMILLAH,
  VERSION,
  SCHEMA,
  search:           (q)  => sciencesEngine.search(q),
  getScience:       (id) => sciencesEngine.getScience(id),
  getCellsByGroup:  (g)  => sciencesEngine.getCellsByGroup(g),
  getCellsByDomain: (d)  => sciencesEngine.getCellsByDomain(d),
  status:           ()   => sciencesEngine.status(),
};
