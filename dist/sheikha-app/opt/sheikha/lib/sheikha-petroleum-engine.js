/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ☪️ بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * SHEIKHA PETROLEUM ENGINE — منظومة شيخة للبترول والنفط والغاز
 *
 * المالك: سلمان أحمد بن سلمان الراجح
 *
 * "وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ" — الحديد ٢٥
 * "هُوَ الَّذِي جَعَلَ لَكُمُ الْأَرْضَ ذَلُولًا فَامْشُوا فِي مَنَاكِبِهَا وَكُلُوا مِن رِّزْقِهِ" — الملك ١٥
 * "وَسَخَّرَ لَكُم مَّا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ جَمِيعًا مِّنْهُ" — الجاثية ١٣
 *
 * ✅ سلسلة قيمة البترول كاملة — من الاستكشاف إلى التسويق
 * ✅ النفط الخام — أنواعه ومعاييره وتصنيفاته
 * ✅ الغاز الطبيعي — المسال والمضغوط والمعالجة
 * ✅ التكرير والبتروكيماويات — المصافي والمنتجات
 * ✅ النقل والتخزين — الأنابيب والناقلات والخزانات
 * ✅ التسويق والتجارة — الأسواق العالمية والعقود
 * ✅ الكيانات السعودية والعالمية — أرامكو، سابك، أوبك
 * ✅ الاستدامة والتحول — الاقتصاد الدائري والطاقة النظيفة
 * ✅ الضوابط الشرعية — بالكتاب والسنة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

class SheikhaP_etroleumEngine {
    constructor() {
        this.name = 'منظومة شيخة للبترول والنفط والغاز';
        this.version = '1.0.0';
        this.startedAt = new Date().toISOString();

        this.quranReferences = this._initQuranReferences();
        this.valueChain = this._initValueChain();
        this.crudeOil = this._initCrudeOil();
        this.naturalGas = this._initNaturalGas();
        this.refining = this._initRefining();
        this.petrochemicals = this._initPetrochemicals();
        this.transport = this._initTransport();
        this.trading = this._initTrading();
        this.entities = this._initEntities();
        this.sustainability = this._initSustainability();
        this.shariaGuidance = this._initShariaGuidance();
    }

    _initQuranReferences() {
        return [
            { id: 'taskheer', surah: 'الجاثية', ayah: 13, text: 'وَسَخَّرَ لَكُم مَّا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ جَمِيعًا مِّنْهُ', context: 'تسخير ثروات الأرض من نفط وغاز ومعادن لمنفعة البشر' },
            { id: 'manakib', surah: 'الملك', ayah: 15, text: 'هُوَ الَّذِي جَعَلَ لَكُمُ الْأَرْضَ ذَلُولًا فَامْشُوا فِي مَنَاكِبِهَا وَكُلُوا مِن رِّزْقِهِ', context: 'استخراج الرزق من باطن الأرض' },
            { id: 'hadeed', surah: 'الحديد', ayah: 25, text: 'وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ', context: 'المعادن والثروات الأرضية لمنافع الناس' },
            { id: 'israf', surah: 'الأعراف', ayah: 31, text: 'وَكُلُوا وَاشْرَبُوا وَلَا تُسْرِفُوا إِنَّهُ لَا يُحِبُّ الْمُسْرِفِينَ', context: 'ترشيد استهلاك الطاقة وعدم الإسراف' },
            { id: 'fasad', surah: 'الروم', ayah: 41, text: 'ظَهَرَ الْفَسَادُ فِي الْبَرِّ وَالْبَحْرِ بِمَا كَسَبَتْ أَيْدِي النَّاسِ', context: 'الحفاظ على البيئة ومنع التلوث' },
            { id: 'mizan', surah: 'الرحمن', ayah: 9, text: 'وَأَقِيمُوا الْوَزْنَ بِالْقِسْطِ وَلَا تُخْسِرُوا الْمِيزَانَ', context: 'العدل في التسعير والتجارة' },
            { id: 'amana', surah: 'النساء', ayah: 58, text: 'إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا', context: 'أمانة الثروات الوطنية' },
        ];
    }

    _initValueChain() {
        return {
            nameAr: 'سلسلة قيمة البترول', nameEn: 'Petroleum Value Chain',
            stages: [
                { id: 'exploration', order: 1, nameAr: 'الاستكشاف', nameEn: 'Exploration', icon: '🔍',
                  activities: ['مسح سيزمي (زلزالي)', 'تحليل جيولوجي', 'صور أقمار صناعية', 'نمذجة رقمية 3D', 'تقييم المخزون'],
                  technologies: ['Seismic 3D/4D', 'AI Well Log Analysis', 'Digital Twin', 'Drone Survey'] },
                { id: 'drilling', order: 2, nameAr: 'الحفر', nameEn: 'Drilling', icon: '⛏️',
                  types: ['حفر عمودي', 'حفر أفقي', 'حفر موجّه', 'حفر بحري عميق'],
                  technologies: ['حفر آلي', 'روبوتات بئرية', 'تبريد ذكي', 'حفر ليزري (R&D)'] },
                { id: 'production', order: 3, nameAr: 'الإنتاج', nameEn: 'Production', icon: '🛢️',
                  methods: ['إنتاج طبيعي (ضغط المكمن)', 'حقن مائي', 'حقن غازي', 'استخلاص معزز EOR', 'رفع صناعي'],
                  metrics: ['معدل الإنتاج (برميل/يوم)', 'نسبة الاستخلاص', 'نسبة الماء', 'ضغط المكمن'] },
                { id: 'processing', order: 4, nameAr: 'المعالجة', nameEn: 'Processing', icon: '🏭',
                  operations: ['فصل الغاز عن النفط', 'إزالة الماء والأملاح', 'تثبيت النفط الخام', 'معالجة الغاز المصاحب'] },
                { id: 'refining', order: 5, nameAr: 'التكرير', nameEn: 'Refining', icon: '🔥',
                  products: ['بنزين', 'ديزل', 'وقود طيران', 'نافثا', 'أسفلت', 'زيوت تشحيم', 'غاز مسال LPG'] },
                { id: 'petrochemicals', order: 6, nameAr: 'البتروكيماويات', nameEn: 'Petrochemicals', icon: '🧪',
                  products: ['إيثيلين', 'بروبيلين', 'بولي إيثيلين', 'بولي بروبيلين', 'ميثانول', 'يوريا', 'PET'] },
                { id: 'transport', order: 7, nameAr: 'النقل والتخزين', nameEn: 'Transport & Storage', icon: '🚢',
                  methods: ['أنابيب', 'ناقلات بحرية', 'قطارات', 'شاحنات', 'خزانات استراتيجية'] },
                { id: 'marketing', order: 8, nameAr: 'التسويق والتوزيع', nameEn: 'Marketing & Distribution', icon: '📊',
                  channels: ['عقود طويلة الأجل', 'سوق فورية', 'عقود آجلة', 'مزادات', 'تجارة رقمية'] },
            ],
        };
    }

    _initCrudeOil() {
        return {
            nameAr: 'النفط الخام', nameEn: 'Crude Oil',
            classifications: [
                { nameAr: 'حسب الكثافة (API)', types: [
                    { name: 'خفيف', api: '> 31°', description: 'سهل التكرير — أغلى' },
                    { name: 'متوسط', api: '22-31°', description: 'متوسط الجودة' },
                    { name: 'ثقيل', api: '< 22°', description: 'صعب التكرير — أرخص' },
                    { name: 'فائق الثقل', api: '< 10°', description: 'رمال نفطية' },
                ]},
                { nameAr: 'حسب الحموضة', types: [
                    { name: 'حلو (Sweet)', sulfur: '< 0.5%', description: 'منخفض الكبريت — مرغوب' },
                    { name: 'حامض (Sour)', sulfur: '> 0.5%', description: 'عالي الكبريت — يحتاج معالجة' },
                ]},
            ],
            benchmarks: [
                { name: 'Brent', origin: 'بحر الشمال', use: 'مرجع أوروبا/أفريقيا/الشرق الأوسط', icon: '🇬🇧' },
                { name: 'WTI', origin: 'تكساس', use: 'مرجع أمريكا الشمالية', icon: '🇺🇸' },
                { name: 'Dubai/Oman', origin: 'الخليج العربي', use: 'مرجع آسيا', icon: '🇦🇪' },
                { name: 'Arab Light', origin: 'السعودية', use: 'النفط السعودي الخفيف — أهم خام عالمي', icon: '🇸🇦' },
                { name: 'Murban', origin: 'أبوظبي', use: 'مرجع إقليمي', icon: '🇦🇪' },
                { name: 'Basrah Medium', origin: 'العراق', use: 'مرجع إقليمي', icon: '🇮🇶' },
            ],
            saudiGrades: [
                { name: 'Arab Extra Light', api: '38.5°', sulfur: '1.16%' },
                { name: 'Arab Light', api: '32.8°', sulfur: '1.77%' },
                { name: 'Arab Medium', api: '30.2°', sulfur: '2.54%' },
                { name: 'Arab Heavy', api: '27.4°', sulfur: '2.80%' },
                { name: 'Arab Super Light', api: '50.6°', sulfur: '0.04%' },
            ],
        };
    }

    _initNaturalGas() {
        return {
            nameAr: 'الغاز الطبيعي', nameEn: 'Natural Gas',
            types: [
                { id: 'associated', nameAr: 'غاز مصاحب', description: 'يُنتج مع النفط الخام' },
                { id: 'non-associated', nameAr: 'غاز حر', description: 'يُنتج من حقول غاز مستقلة' },
                { id: 'lng', nameAr: 'غاز مسال (LNG)', description: 'مبرّد إلى -162°C للنقل البحري' },
                { id: 'cng', nameAr: 'غاز مضغوط (CNG)', description: 'مضغوط لوقود السيارات' },
                { id: 'lpg', nameAr: 'غاز مسال بترولي (LPG)', description: 'بروبان وبيوتان — للطبخ والتدفئة' },
                { id: 'ngl', nameAr: 'سوائل غاز طبيعي (NGL)', description: 'إيثان، بروبان، بيوتان — مواد أولية بتروكيماوية' },
                { id: 'shale', nameAr: 'غاز صخري', description: 'من التكسير الهيدروليكي' },
                { id: 'cbm', nameAr: 'غاز طبقات الفحم', description: 'محبوس في طبقات الفحم' },
            ],
            components: [
                { name: 'ميثان (CH₄)', percentage: '70-90%', use: 'وقود وتوليد كهرباء' },
                { name: 'إيثان (C₂H₆)', percentage: '0-20%', use: 'مادة أولية بتروكيماوية' },
                { name: 'بروبان (C₃H₈)', percentage: '0-8%', use: 'LPG ووقود' },
                { name: 'بيوتان (C₄H₁₀)', percentage: '0-4%', use: 'LPG ومزج بنزين' },
            ],
            lngProcess: ['استخلاص', 'معالجة', 'تسييل (-162°C)', 'تخزين', 'نقل بحري', 'إعادة تغويز', 'توزيع'],
        };
    }

    _initRefining() {
        return {
            nameAr: 'التكرير', nameEn: 'Refining',
            processes: [
                { nameAr: 'التقطير الجوي', nameEn: 'Atmospheric Distillation', description: 'فصل مكونات النفط بالحرارة' },
                { nameAr: 'التقطير الفراغي', nameEn: 'Vacuum Distillation', description: 'فصل المكونات الثقيلة' },
                { nameAr: 'التكسير الحفزي', nameEn: 'FCC — Fluid Catalytic Cracking', description: 'تكسير الجزيئات الكبيرة لبنزين' },
                { nameAr: 'التكسير الهيدروجيني', nameEn: 'Hydrocracking', description: 'تكسير بالهيدروجين للديزل' },
                { nameAr: 'الإصلاح الحفزي', nameEn: 'Catalytic Reforming', description: 'تحسين أوكتان البنزين' },
                { nameAr: 'إزالة الكبريت', nameEn: 'Desulfurization (HDS)', description: 'تنقية المنتجات من الكبريت' },
                { nameAr: 'الألكلة', nameEn: 'Alkylation', description: 'إنتاج بنزين عالي الجودة' },
                { nameAr: 'الأزمرة', nameEn: 'Isomerization', description: 'تحسين خصائص الوقود' },
            ],
            products: [
                { nameAr: 'بنزين', nameEn: 'Gasoline', use: 'وقود سيارات', icon: '⛽' },
                { nameAr: 'ديزل', nameEn: 'Diesel', use: 'شاحنات ومعدات', icon: '🚛' },
                { nameAr: 'وقود طيران', nameEn: 'Jet Fuel (Kerosene)', use: 'طائرات', icon: '✈️' },
                { nameAr: 'نافثا', nameEn: 'Naphtha', use: 'مادة أولية بتروكيماوية', icon: '🧪' },
                { nameAr: 'زيت وقود', nameEn: 'Fuel Oil', use: 'محطات كهرباء وسفن', icon: '🚢' },
                { nameAr: 'أسفلت', nameEn: 'Asphalt/Bitumen', use: 'رصف طرق', icon: '🛣️' },
                { nameAr: 'زيوت تشحيم', nameEn: 'Lubricants', use: 'محركات وآلات', icon: '🔧' },
                { nameAr: 'شمع بترولي', nameEn: 'Wax', use: 'صناعات متنوعة', icon: '🕯️' },
                { nameAr: 'كوك بترولي', nameEn: 'Petroleum Coke', use: 'صناعة ألمنيوم وصلب', icon: '⚫' },
            ],
            saudiRefineries: [
                { name: 'رأس تنورة', capacity: '550,000 b/d', owner: 'أرامكو' },
                { name: 'ينبع (ياسرف)', capacity: '400,000 b/d', owner: 'أرامكو/سينوبك' },
                { name: 'الجبيل (ساتورب)', capacity: '400,000 b/d', owner: 'أرامكو/توتال' },
                { name: 'الرياض', capacity: '120,000 b/d', owner: 'أرامكو' },
                { name: 'جدة', capacity: '80,000 b/d', owner: 'أرامكو' },
                { name: 'جازان', capacity: '400,000 b/d', owner: 'أرامكو' },
            ],
        };
    }

    _initPetrochemicals() {
        return {
            nameAr: 'البتروكيماويات', nameEn: 'Petrochemicals',
            basicProducts: [
                { nameAr: 'إيثيلين', nameEn: 'Ethylene', source: 'إيثان/نافثا', use: 'أهم مادة أولية بتروكيماوية' },
                { nameAr: 'بروبيلين', nameEn: 'Propylene', source: 'بروبان/FCC', use: 'بلاستيك وألياف' },
                { nameAr: 'بيوتادين', nameEn: 'Butadiene', source: 'C4', use: 'مطاط صناعي' },
                { nameAr: 'بنزين (أروماتي)', nameEn: 'Benzene', source: 'نافثا', use: 'كيماويات متنوعة' },
                { nameAr: 'ميثانول', nameEn: 'Methanol', source: 'غاز طبيعي', use: 'وقود ومذيب' },
            ],
            finalProducts: [
                { nameAr: 'بولي إيثيلين', nameEn: 'Polyethylene (PE)', use: 'أكياس، أنابيب، تغليف' },
                { nameAr: 'بولي بروبيلين', nameEn: 'Polypropylene (PP)', use: 'سيارات، أثاث، تغليف' },
                { nameAr: 'PET', nameEn: 'Polyethylene Terephthalate', use: 'زجاجات، ألياف بوليستر' },
                { nameAr: 'يوريا', nameEn: 'Urea', use: 'أسمدة زراعية' },
                { nameAr: 'أمونيا', nameEn: 'Ammonia', use: 'أسمدة وصناعة' },
                { nameAr: 'إيثيلين جلايكول', nameEn: 'MEG/DEG', use: 'ألياف بوليستر ومضاد تجمد' },
            ],
            saudiEntities: [
                { name: 'سابك (SABIC)', role: 'أكبر شركة بتروكيماويات في الشرق الأوسط', production: '61 مليون طن/سنة' },
                { name: 'المتقدمة (ADVANCED)', role: 'بتروكيماويات متخصصة' },
                { name: 'التصنيع الوطنية (Tasnee)', role: 'تيتانيوم وبتروكيماويات' },
                { name: 'ينساب (YANSAB)', role: 'بتروكيماويات ينبع' },
                { name: 'كيان السعودية', role: 'بتروكيماويات' },
                { name: 'بترو رابغ', role: 'تكرير وبتروكيماويات' },
            ],
        };
    }

    _initTransport() {
        return {
            nameAr: 'النقل والتخزين', nameEn: 'Transport & Storage',
            pipelines: [
                { name: 'خط شرق-غرب', nameEn: 'East-West Pipeline', length: '1,200 km', capacity: '5M b/d', route: 'بقيق → ينبع' },
                { name: 'خط أبقيق-الجعيمة', nameEn: 'Abqaiq-Juaymah', purpose: 'نقل خام للتصدير' },
                { name: 'شبكة أنابيب الغاز الرئيسية', nameEn: 'Master Gas System', length: '17,000+ km', purpose: 'نقل الغاز في المملكة' },
            ],
            tankers: [
                { type: 'VLCC', nameAr: 'ناقلة عملاقة', capacity: '2M برميل', deadweight: '200,000-320,000 DWT' },
                { type: 'Suezmax', nameAr: 'سويزماكس', capacity: '1M برميل', deadweight: '120,000-200,000 DWT' },
                { type: 'Aframax', nameAr: 'أفراماكس', capacity: '750K برميل', deadweight: '80,000-120,000 DWT' },
                { type: 'LNG Carrier', nameAr: 'ناقلة غاز مسال', capacity: '125,000-266,000 m³' },
            ],
            strategicStorage: [
                { nameAr: 'احتياطي استراتيجي', description: 'مخزون أمان لمواجهة الطوارئ' },
                { nameAr: 'كهوف ملحية', description: 'تخزين في تجاويف ملحية تحت الأرض' },
                { nameAr: 'خزانات عائمة', description: 'سفن تخزين عائمة (FPSO/FSO)' },
            ],
            terminals: [
                { name: 'رأس تنورة', type: 'أكبر ميناء نفطي في العالم', capacity: '6.5M b/d' },
                { name: 'الجعيمة', type: 'تصدير', capacity: 'نفط وغاز مسال' },
                { name: 'ينبع', type: 'ساحل غربي', capacity: '5M b/d' },
            ],
        };
    }

    _initTrading() {
        return {
            nameAr: 'تجارة البترول', nameEn: 'Petroleum Trading',
            markets: [
                { name: 'NYMEX', nameAr: 'بورصة نيويورك', location: 'نيويورك', benchmark: 'WTI' },
                { name: 'ICE', nameAr: 'بورصة إنتركونتيننتال', location: 'لندن', benchmark: 'Brent' },
                { name: 'DME', nameAr: 'بورصة دبي', location: 'دبي', benchmark: 'Oman Crude' },
                { name: 'TOCOM', nameAr: 'بورصة طوكيو', location: 'طوكيو', benchmark: 'Dubai' },
                { name: 'SGX', nameAr: 'بورصة سنغافورة', location: 'سنغافورة', benchmark: 'آسيا' },
            ],
            contracts: [
                { nameAr: 'فوري (Spot)', description: 'تسليم خلال أيام — سعر السوق الحالي' },
                { nameAr: 'آجل (Futures)', description: 'عقد مستقبلي بسعر محدد — تحوّط' },
                { nameAr: 'خيارات (Options)', description: 'حق شراء/بيع بسعر محدد' },
                { nameAr: 'مقايضة (Swap)', description: 'تبادل تدفقات نقدية — تحوّط' },
                { nameAr: 'عقود طويلة الأجل', description: 'اتفاقيات توريد سنوية بصيغة رسمية' },
            ],
            pricingFactors: ['العرض والطلب', 'جيوسياسة', 'قرارات أوبك+', 'مخزونات', 'سعر الدولار', 'موسمية', 'كوارث طبيعية', 'تقنية'],
            organizations: [
                { name: 'OPEC', nameAr: 'أوبك', members: 13, role: 'تنسيق سياسات الإنتاج' },
                { name: 'OPEC+', nameAr: 'أوبك+', members: 23, role: 'تحالف موسّع يشمل روسيا' },
                { name: 'IEA', nameAr: 'وكالة الطاقة الدولية', members: 31, role: 'أمن طاقة الدول المستهلكة' },
                { name: 'OAPEC', nameAr: 'أوابك', members: 11, role: 'منظمة الأقطار العربية المصدرة للبترول' },
            ],
            units: [
                { nameAr: 'برميل', nameEn: 'Barrel (bbl)', liters: 159, description: 'وحدة قياس النفط الخام' },
                { nameAr: 'BTU', nameEn: 'British Thermal Unit', description: 'وحدة طاقة حرارية' },
                { nameAr: 'طن متري', nameEn: 'Metric Ton', barrels: '~7.33', description: 'للنفط الخام المتوسط' },
                { nameAr: 'قدم مكعب', nameEn: 'Cubic Feet (cf)', description: 'وحدة قياس الغاز' },
            ],
        };
    }

    _initEntities() {
        return {
            nameAr: 'الكيانات والشركات', nameEn: 'Entities',
            saudi: [
                { name: 'أرامكو السعودية', nameEn: 'Saudi Aramco', role: 'أكبر شركة نفط في العالم', production: '~12M b/d capacity', icon: '🇸🇦' },
                { name: 'وزارة الطاقة', nameEn: 'Ministry of Energy', role: 'السياسة والتنظيم' },
                { name: 'سابك', nameEn: 'SABIC', role: 'بتروكيماويات عالمية' },
                { name: 'معادن', nameEn: 'Ma\'aden', role: 'تعدين وفوسفات وألمنيوم' },
                { name: 'الهيئة الملكية للجبيل وينبع', role: 'مدن صناعية' },
            ],
            international: [
                { name: 'ExxonMobil', country: '🇺🇸', type: 'IOC' },
                { name: 'Shell', country: '🇬🇧🇳🇱', type: 'IOC' },
                { name: 'Chevron', country: '🇺🇸', type: 'IOC' },
                { name: 'BP', country: '🇬🇧', type: 'IOC' },
                { name: 'TotalEnergies', country: '🇫🇷', type: 'IOC' },
                { name: 'ADNOC', country: '🇦🇪', type: 'NOC' },
                { name: 'QatarEnergy', country: '🇶🇦', type: 'NOC' },
                { name: 'KPC', country: '🇰🇼', type: 'NOC' },
                { name: 'Petronas', country: '🇲🇾', type: 'NOC' },
                { name: 'Gazprom', country: '🇷🇺', type: 'NOC' },
            ],
        };
    }

    _initSustainability() {
        return {
            nameAr: 'الاستدامة والتحول', nameEn: 'Sustainability & Transition',
            initiatives: [
                { nameAr: 'الاقتصاد الدائري للكربون', nameEn: 'Circular Carbon Economy', pillars: ['تقليل', 'إعادة استخدام', 'تدوير', 'إزالة'] },
                { nameAr: 'احتجاز الكربون (CCUS)', nameEn: 'Carbon Capture', description: 'التقاط CO₂ وتخزينه أو استخدامه' },
                { nameAr: 'الهيدروجين الأزرق', nameEn: 'Blue Hydrogen', description: 'هيدروجين من غاز + احتجاز كربون' },
                { nameAr: 'وقود اصطناعي', nameEn: 'E-Fuels / SAF', description: 'وقود صناعي ووقود طيران مستدام' },
                { nameAr: 'مبادرة السعودية الخضراء', nameEn: 'Saudi Green Initiative', targets: ['زراعة 10 مليار شجرة', 'حماية 30% من المناطق البرية والبحرية'] },
                { nameAr: 'صفر انبعاثات 2060', nameEn: 'Net Zero 2060', description: 'هدف المملكة للحياد الكربوني' },
            ],
        };
    }

    _initShariaGuidance() {
        return {
            nameAr: 'الضوابط الشرعية للبترول', nameEn: 'Sharia Guidance',
            principles: [
                { id: 'amana', nameAr: 'أمانة الثروات', description: 'النفط ثروة وطنية — أمانة تُستخلف فيها الأمة لصالح الأجيال', icon: '🤝' },
                { id: 'la-israf', nameAr: 'عدم الإسراف', description: 'وَلَا تُسْرِفُوا — ترشيد إنتاج واستهلاك الطاقة', icon: '♻️' },
                { id: 'la-fasad', nameAr: 'منع الفساد البيئي', description: 'وَلَا تُفْسِدُوا فِي الْأَرْضِ — حماية البيئة من التلوث', icon: '🌿' },
                { id: 'adl', nameAr: 'العدل في التسعير', description: 'أَقِيمُوا الْوَزْنَ بِالْقِسْطِ — عدالة الأسعار', icon: '⚖️' },
                { id: 'ihsan', nameAr: 'الإحسان في الصناعة', description: 'إن الله يحب إذا عمل أحدكم عملاً أن يتقنه — إتقان العمليات', icon: '⭐' },
                { id: 'muwazana', nameAr: 'التوازن بين الأجيال', description: 'حفظ حقوق الأجيال القادمة في الثروات الطبيعية', icon: '👶' },
                { id: 'taawun', nameAr: 'التعاون الدولي', description: 'وَتَعَاوَنُوا عَلَى الْبِرِّ — تعاون في أمن الطاقة العالمي', icon: '🌍' },
            ],
        };
    }

    getDashboard() {
        return {
            name: this.name, version: this.version, startedAt: this.startedAt,
            summary: {
                valueChainStages: this.valueChain.stages.length,
                crudeBenchmarks: this.crudeOil.benchmarks.length,
                gasTypes: this.naturalGas.types.length,
                refiningProcesses: this.refining.processes.length,
                refiningProducts: this.refining.products.length,
                petrochemProducts: this.petrochemicals.basicProducts.length + this.petrochemicals.finalProducts.length,
                tradingMarkets: this.trading.markets.length,
                organizations: this.trading.organizations.length,
                saudiEntities: this.entities.saudi.length,
                intlCompanies: this.entities.international.length,
                sustainabilityInitiatives: this.sustainability.initiatives.length,
                quranVerses: this.quranReferences.length,
                shariaRules: this.shariaGuidance.principles.length,
            },
            quranReferences: this.quranReferences,
            valueChain: this.valueChain,
            crudeOil: this.crudeOil,
            naturalGas: this.naturalGas,
            refining: this.refining,
            petrochemicals: this.petrochemicals,
            transport: this.transport,
            trading: this.trading,
            entities: this.entities,
            sustainability: this.sustainability,
            shariaGuidance: this.shariaGuidance,
        };
    }
}

module.exports = SheikhaP_etroleumEngine;
