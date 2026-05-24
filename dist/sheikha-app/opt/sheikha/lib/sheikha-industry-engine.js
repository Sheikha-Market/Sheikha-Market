/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ☪️ بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * SHEIKHA INDUSTRY & DIGITAL MANUFACTURING ENGINE
 * منظومة شيخة للصناعة والتصنيع والصناعة الرقمية
 *
 * المالك: سلمان أحمد بن سلمان الراجح
 *
 * "وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ" — الحديد ٢٥
 * "وَعَلَّمْنَاهُ صَنْعَةَ لَبُوسٍ لَّكُمْ لِتُحْصِنَكُم مِّن بَأْسِكُمْ" — الأنبياء ٨٠
 * "وَلَقَدْ آتَيْنَا دَاوُودَ مِنَّا فَضْلًا يَا جِبَالُ أَوِّبِي مَعَهُ وَالطَّيْرَ وَأَلَنَّا لَهُ الْحَدِيدَ" — سبأ ١٠
 *
 * ✅ الصناعة التقليدية — التصنيع بجميع أنواعه
 * ✅ القطاعات الصناعية — ثقيلة، خفيفة، بتروكيماوية، غذائية، دوائية
 * ✅ المدن الصناعية السعودية — مدن، جبيل، ينبع، رأس الخير
 * ✅ عمليات التصنيع — سباكة، تشكيل، تصنيع، لحام، تجميع
 * ✅ إدارة الجودة — ISO، Six Sigma، Lean، TQM
 * ✅ الثورة الصناعية الرابعة — Industry 4.0
 * ✅ المصانع الذكية — Smart Factories
 * ✅ إنترنت الأشياء الصناعي — IIoT
 * ✅ التوأم الرقمي — Digital Twin
 * ✅ الذكاء الاصطناعي في التصنيع
 * ✅ الروبوتات والأتمتة الصناعية
 * ✅ التصنيع الإضافي — 3D Printing
 * ✅ الضوابط الشرعية — بالكتاب والسنة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

class SheikhaIndustryEngine {
    constructor() {
        this.name = 'Sheikha Industry & Digital Manufacturing Engine';
        this.version = '1.0.0';
        this.owner = 'سلمان أحمد بن سلمان الراجح';
        this.activatedAt = new Date().toISOString();
        this._init();
    }

    _init() {
        // ─────────────────────────────────────────────────────────────────────
        // آيات قرآنية عن الصناعة والتصنيع
        // ─────────────────────────────────────────────────────────────────────
        this.quranReferences = [
            { ayah: 'وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ', surah: 'الحديد', num: 25, topic: 'الحديد والصناعة' },
            { ayah: 'وَعَلَّمْنَاهُ صَنْعَةَ لَبُوسٍ لَّكُمْ لِتُحْصِنَكُم مِّن بَأْسِكُمْ', surah: 'الأنبياء', num: 80, topic: 'صناعة الدروع' },
            { ayah: 'وَلَقَدْ آتَيْنَا دَاوُودَ مِنَّا فَضْلًا يَا جِبَالُ أَوِّبِي مَعَهُ وَالطَّيْرَ وَأَلَنَّا لَهُ الْحَدِيدَ', surah: 'سبأ', num: 10, topic: 'إلانة الحديد لداود' },
            { ayah: 'أَنِ اعْمَلْ سَابِغَاتٍ وَقَدِّرْ فِي السَّرْدِ', surah: 'سبأ', num: 11, topic: 'إتقان الصنعة' },
            { ayah: 'آتُونِي زُبَرَ الْحَدِيدِ حَتَّىٰ إِذَا سَاوَىٰ بَيْنَ الصَّدَفَيْنِ قَالَ انفُخُوا', surah: 'الكهف', num: 96, topic: 'بناء السد - ذو القرنين' },
            { ayah: 'قَالَ آتُونِي أُفْرِغْ عَلَيْهِ قِطْرًا', surah: 'الكهف', num: 96, topic: 'صهر النحاس' },
            { ayah: 'وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ', surah: 'الأنبياء', num: 30, topic: 'الموارد الطبيعية' },
            { ayah: 'صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ', surah: 'النمل', num: 88, topic: 'الإتقان في الصنع' },
            { ayah: 'وَالأَرْضَ مَدَدْنَاهَا وَأَلْقَيْنَا فِيهَا رَوَاسِيَ وَأَنبَتْنَا فِيهَا مِن كُلِّ شَيْءٍ مَّوْزُونٍ', surah: 'الحجر', num: 19, topic: 'التوازن في الخلق' },
            { ayah: 'هُوَ الَّذِي جَعَلَ لَكُمُ الْأَرْضَ ذَلُولًا فَامْشُوا فِي مَنَاكِبِهَا وَكُلُوا مِن رِّزْقِهِ', surah: 'الملك', num: 15, topic: 'تسخير الأرض' }
        ];

        // ─────────────────────────────────────────────────────────────────────
        // الثورات الصناعية
        // ─────────────────────────────────────────────────────────────────────
        this.industrialRevolutions = [
            { number: 1, nameAr: 'الثورة الصناعية الأولى', nameEn: 'First Industrial Revolution', period: '1760–1840', technologies: ['آلة بخارية', 'نسيج ميكانيكي', 'حديد', 'فحم'], impact: 'الانتقال من اليدوي إلى الآلي' },
            { number: 2, nameAr: 'الثورة الصناعية الثانية', nameEn: 'Second Industrial Revolution', period: '1870–1914', technologies: ['كهرباء', 'إنتاج ضخم', 'خط تجميع', 'صلب', 'بترول'], impact: 'الإنتاج الضخم والتقييس' },
            { number: 3, nameAr: 'الثورة الصناعية الثالثة', nameEn: 'Third Industrial Revolution', period: '1969–2010', technologies: ['حاسب آلي', 'إلكترونيات', 'أتمتة', 'إنترنت', 'PLC'], impact: 'الأتمتة والرقمنة' },
            { number: 4, nameAr: 'الثورة الصناعية الرابعة', nameEn: 'Fourth Industrial Revolution (Industry 4.0)', period: '2011–الآن', technologies: ['IoT', 'AI', 'Big Data', 'Cloud', 'Digital Twin', 'Robotics', 'Blockchain', '3D Printing'], impact: 'الاندماج الرقمي-الفيزيائي والمصانع الذكية' }
        ];

        // ─────────────────────────────────────────────────────────────────────
        // أنواع التصنيع
        // ─────────────────────────────────────────────────────────────────────
        this.manufacturingTypes = {
            byProcess: [
                { nameAr: 'تصنيع منفصل', nameEn: 'Discrete Manufacturing', description: 'إنتاج وحدات منفصلة قابلة للعد', examples: ['سيارات', 'إلكترونيات', 'أثاث', 'طائرات'] },
                { nameAr: 'تصنيع عملياتي', nameEn: 'Process Manufacturing', description: 'إنتاج مستمر لمواد غير قابلة للفصل', examples: ['بتروكيماويات', 'أدوية', 'أغذية', 'إسمنت'] },
                { nameAr: 'تصنيع دُفعي', nameEn: 'Batch Manufacturing', description: 'إنتاج بكميات محددة (دُفعات)', examples: ['مخابز', 'دهانات', 'مستحضرات تجميل'] },
                { nameAr: 'تصنيع مستمر', nameEn: 'Continuous Manufacturing', description: 'إنتاج متواصل ٢٤/٧', examples: ['تكرير نفط', 'صهر معادن', 'توليد كهرباء'] },
                { nameAr: 'تصنيع حسب الطلب', nameEn: 'Make-to-Order (MTO)', description: 'إنتاج بناءً على طلب العميل', examples: ['سفن', 'معدات خاصة', 'ملابس مفصّلة'] },
                { nameAr: 'تصنيع للمخزون', nameEn: 'Make-to-Stock (MTS)', description: 'إنتاج مسبق للمخزون', examples: ['مواد استهلاكية', 'أغذية معبأة'] },
                { nameAr: 'تجميع حسب الطلب', nameEn: 'Assemble-to-Order (ATO)', description: 'تجميع مكونات جاهزة حسب الطلب', examples: ['حواسيب', 'خوادم', 'أجهزة مخصصة'] },
                { nameAr: 'تصنيع إضافي', nameEn: 'Additive Manufacturing', description: 'بناء طبقة فوق طبقة (طباعة ثلاثية الأبعاد)', examples: ['نماذج أولية', 'قطع غيار', 'أطراف صناعية'] }
            ],
            byScale: [
                { nameAr: 'صناعة ثقيلة', nameEn: 'Heavy Industry', sectors: ['حديد وصلب', 'بتروكيماويات', 'إسمنت', 'ألمنيوم', 'سفن', 'آليات ثقيلة'] },
                { nameAr: 'صناعة خفيفة', nameEn: 'Light Industry', sectors: ['إلكترونيات', 'ملابس', 'أغذية', 'أدوية', 'أثاث', 'مستحضرات تجميل'] },
                { nameAr: 'صناعة متوسطة', nameEn: 'Medium Industry', sectors: ['سيارات', 'أجهزة كهربائية', 'مواد بناء', 'تغليف'] }
            ]
        };

        // ─────────────────────────────────────────────────────────────────────
        // القطاعات الصناعية التفصيلية
        // ─────────────────────────────────────────────────────────────────────
        this.industrialSectors = [
            {
                nameAr: 'صناعة الحديد والصلب',
                nameEn: 'Iron & Steel Industry',
                processes: ['صهر', 'صب', 'درفلة', 'سحب', 'طلاء'],
                products: ['حديد تسليح', 'ألواح صلب', 'أنابيب', 'مقاطع حديدية', 'سلك حديد'],
                saudiCompanies: ['سابك', 'حديد - الراجحي', 'الصلب السعودي', 'الأنابيب السعودية', 'اليمامة للحديد']
            },
            {
                nameAr: 'صناعة البتروكيماويات',
                nameEn: 'Petrochemical Industry',
                processes: ['تكسير', 'بلمرة', 'أكسدة', 'هدرجة', 'تقطير'],
                products: ['إيثيلين', 'بروبيلين', 'بولي إيثيلين', 'بولي بروبيلين', 'PVC', 'PET', 'ميثانول'],
                saudiCompanies: ['سابك', 'أرامكو', 'ينساب', 'كيان', 'سافكو', 'التصنيع', 'بترو رابغ']
            },
            {
                nameAr: 'صناعة الأغذية والمشروبات',
                nameEn: 'Food & Beverage Industry',
                processes: ['تعبئة', 'تغليف', 'تعقيم', 'تجميد', 'تجفيف', 'تخمير حلال'],
                products: ['ألبان', 'عصائر', 'مياه', 'حلويات', 'لحوم مصنعة', 'مخبوزات', 'زيوت', 'تمور'],
                saudiCompanies: ['المراعي', 'صافولا', 'نادك', 'السعودية للألبان', 'حلواني إخوان', 'شركة العثيم']
            },
            {
                nameAr: 'صناعة الأدوية والمستحضرات الطبية',
                nameEn: 'Pharmaceutical Industry',
                processes: ['تركيب', 'تعبئة', 'تقنية حيوية', 'بحث وتطوير', 'مراقبة جودة'],
                products: ['أدوية', 'لقاحات', 'مستلزمات طبية', 'معدات طبية', 'مكملات غذائية'],
                saudiCompanies: ['سبيماكو', 'تبوك الدوائية', 'الدوائية', 'جمجوم فارما', 'المتقدمة للصناعات']
            },
            {
                nameAr: 'صناعة مواد البناء',
                nameEn: 'Construction Materials Industry',
                processes: ['طحن', 'خلط', 'تشكيل', 'حرق', 'قطع', 'تلميع'],
                products: ['إسمنت', 'خرسانة', 'بلاط', 'رخام', 'جرانيت', 'زجاج', 'عوازل', 'جبس'],
                saudiCompanies: ['أسمنت السعودية', 'أسمنت ينبع', 'أسمنت القصيم', 'الزامل للصناعة', 'السعودية للزجاج']
            },
            {
                nameAr: 'صناعة السيارات والمركبات',
                nameEn: 'Automotive Industry',
                processes: ['ختم', 'لحام', 'طلاء', 'تجميع', 'فحص جودة'],
                products: ['سيارات', 'شاحنات', 'حافلات', 'مقطورات', 'قطع غيار'],
                saudiCompanies: ['لوسيد السعودية', 'هيونداي السعودية', 'إسناد الوطنية']
            },
            {
                nameAr: 'الصناعة الإلكترونية والكهربائية',
                nameEn: 'Electronics & Electrical Industry',
                processes: ['تجميع SMT', 'لحام', 'برمجة', 'فحص', 'تغليف'],
                products: ['لوحات إلكترونية', 'كابلات', 'محولات', 'مفاتيح كهربائية', 'إنارة LED'],
                saudiCompanies: ['الكابلات السعودية', 'المحولات الكهربائية', 'الزامل للتكييف']
            },
            {
                nameAr: 'صناعة النسيج والملابس',
                nameEn: 'Textile & Garment Industry',
                processes: ['غزل', 'نسج', 'صباغة', 'قص', 'خياطة', 'تطريز'],
                products: ['أقمشة', 'ملابس', 'سجاد', 'مفروشات', 'إحرام', 'ثياب'],
                saudiCompanies: ['فيلا', 'ثوب الجزيرة', 'الشماسي']
            },
            {
                nameAr: 'الصناعة العسكرية والدفاعية',
                nameEn: 'Military & Defense Industry',
                processes: ['تصميم', 'تصنيع دقيق', 'تجميع', 'اختبار', 'صيانة'],
                products: ['أسلحة', 'ذخيرة', 'مركبات عسكرية', 'طائرات مسيّرة', 'أنظمة رادار', 'اتصالات عسكرية'],
                saudiCompanies: ['SAMI (سامي)', 'الشركة السعودية للصناعات العسكرية', 'EDGE']
            },
            {
                nameAr: 'صناعة التعدين والمعادن',
                nameEn: 'Mining & Metals Industry',
                processes: ['استخراج', 'تكسير', 'طحن', 'صهر', 'تنقية', 'تشكيل'],
                products: ['ذهب', 'فضة', 'نحاس', 'فوسفات', 'بوكسايت', 'ألمنيوم'],
                saudiCompanies: ['معادن', 'التعدين العربية السعودية', 'مصنع ألمنيوم البحرين (ألبا)']
            },
            {
                nameAr: 'صناعة التغليف والتعبئة',
                nameEn: 'Packaging Industry',
                processes: ['طباعة', 'قص', 'تشكيل', 'لصق', 'تغليف'],
                products: ['كرتون', 'بلاستيك', 'علب معدنية', 'زجاجات', 'أكياس', 'أغلفة'],
                saudiCompanies: ['الورق السعودية', 'التغليف العربية', 'المتقدمة للبتروكيماويات']
            },
            {
                nameAr: 'صناعة المياه والتحلية',
                nameEn: 'Water & Desalination Industry',
                processes: ['تحلية', 'تنقية', 'تعبئة', 'معالجة', 'ترشيح'],
                products: ['مياه محلاة', 'مياه معبأة', 'فلاتر', 'محطات معالجة'],
                saudiCompanies: ['المؤسسة العامة لتحلية المياه', 'أكوا باور', 'المياه الوطنية']
            }
        ];

        // ─────────────────────────────────────────────────────────────────────
        // عمليات التصنيع الأساسية
        // ─────────────────────────────────────────────────────────────────────
        this.manufacturingProcesses = {
            forming: {
                nameAr: 'عمليات التشكيل',
                nameEn: 'Forming Processes',
                types: [
                    { nameAr: 'سباكة / صب', nameEn: 'Casting', method: 'صب المعدن المنصهر في قوالب', types: ['صب بالرمل', 'صب بالقالب', 'صب بالطرد المركزي', 'صب الاستثمار'] },
                    { nameAr: 'تشكيل بالطرق', nameEn: 'Forging', method: 'ضغط وطرق المعدن الساخن أو البارد' },
                    { nameAr: 'درفلة', nameEn: 'Rolling', method: 'تمرير المعدن بين أسطوانات' },
                    { nameAr: 'سحب', nameEn: 'Drawing', method: 'سحب المعدن عبر قالب لتقليل المقطع' },
                    { nameAr: 'بثق / قذف', nameEn: 'Extrusion', method: 'دفع المعدن عبر فتحة بشكل محدد' },
                    { nameAr: 'ختم / كبس', nameEn: 'Stamping/Pressing', method: 'تشكيل الألواح بالضغط في قوالب' },
                    { nameAr: 'ثني', nameEn: 'Bending', method: 'ثني الألواح والأنابيب' },
                    { nameAr: 'حقن', nameEn: 'Injection Molding', method: 'حقن البلاستيك المنصهر في قوالب' },
                    { nameAr: 'نفخ', nameEn: 'Blow Molding', method: 'تشكيل الأوعية البلاستيكية بالنفخ' }
                ]
            },
            machining: {
                nameAr: 'عمليات التشغيل / القطع',
                nameEn: 'Machining Processes',
                types: [
                    { nameAr: 'خراطة', nameEn: 'Turning (Lathe)', tool: 'مخرطة' },
                    { nameAr: 'تفريز', nameEn: 'Milling', tool: 'فريزة' },
                    { nameAr: 'ثقب / حفر', nameEn: 'Drilling', tool: 'مثقاب' },
                    { nameAr: 'جلخ / صقل', nameEn: 'Grinding', tool: 'جلاخة' },
                    { nameAr: 'بَرد', nameEn: 'Filing', tool: 'مبرد' },
                    { nameAr: 'نشر', nameEn: 'Sawing', tool: 'منشار' },
                    { nameAr: 'تشغيل CNC', nameEn: 'CNC Machining', tool: 'آلة التحكم العددي بالحاسوب' },
                    { nameAr: 'قطع بالليزر', nameEn: 'Laser Cutting', tool: 'آلة ليزر' },
                    { nameAr: 'قطع بالبلازما', nameEn: 'Plasma Cutting', tool: 'آلة بلازما' },
                    { nameAr: 'قطع بالماء', nameEn: 'Waterjet Cutting', tool: 'آلة القطع المائي' },
                    { nameAr: 'تفريغ كهربائي', nameEn: 'EDM', tool: 'آلة التفريغ الكهربائي' }
                ]
            },
            joining: {
                nameAr: 'عمليات الربط والوصل',
                nameEn: 'Joining Processes',
                types: [
                    { nameAr: 'لحام بالقوس', nameEn: 'Arc Welding', types: ['MIG', 'TIG', 'SMAW', 'SAW'] },
                    { nameAr: 'لحام بالمقاومة', nameEn: 'Resistance Welding', types: ['نقطي', 'درزي'] },
                    { nameAr: 'لحام بالليزر', nameEn: 'Laser Welding' },
                    { nameAr: 'لحام ناعم', nameEn: 'Soldering' },
                    { nameAr: 'لحام صلب', nameEn: 'Brazing' },
                    { nameAr: 'ربط ميكانيكي', nameEn: 'Mechanical Fastening', types: ['برشام', 'مسامير', 'براغي'] },
                    { nameAr: 'لصق', nameEn: 'Adhesive Bonding' }
                ]
            },
            surfaceTreatment: {
                nameAr: 'المعالجة السطحية',
                nameEn: 'Surface Treatment',
                types: [
                    { nameAr: 'طلاء كهربائي', nameEn: 'Electroplating' },
                    { nameAr: 'طلاء بالغمس الساخن', nameEn: 'Hot-Dip Galvanizing' },
                    { nameAr: 'أنودة', nameEn: 'Anodizing' },
                    { nameAr: 'طلاء بالمسحوق', nameEn: 'Powder Coating' },
                    { nameAr: 'طلاء بالرش', nameEn: 'Spray Painting' },
                    { nameAr: 'معالجة حرارية', nameEn: 'Heat Treatment', types: ['تصليد', 'تلدين', 'تقسية', 'تطبيع'] },
                    { nameAr: 'بلزمة / تعقيم', nameEn: 'Plasma Treatment' }
                ]
            },
            additiveManufacturing: {
                nameAr: 'التصنيع الإضافي (الطباعة ثلاثية الأبعاد)',
                nameEn: 'Additive Manufacturing (3D Printing)',
                technologies: [
                    { nameAr: 'ترسيب المواد المنصهرة', nameEn: 'FDM (Fused Deposition Modeling)', material: 'بلاستيك' },
                    { nameAr: 'الطباعة الحجرية المجسمة', nameEn: 'SLA (Stereolithography)', material: 'راتينج' },
                    { nameAr: 'الحرق الانتقائي بالليزر', nameEn: 'SLS (Selective Laser Sintering)', material: 'بوليمرات / معادن' },
                    { nameAr: 'الصهر الانتقائي بالليزر', nameEn: 'SLM / DMLS', material: 'معادن (تيتانيوم، فولاذ، ألمنيوم)' },
                    { nameAr: 'الحبر النفاث', nameEn: 'Material Jetting', material: 'بوليمرات متعددة' },
                    { nameAr: 'الحبر الرابط', nameEn: 'Binder Jetting', material: 'رمل، معادن، سيراميك' },
                    { nameAr: 'ترسيب الطاقة الموجهة', nameEn: 'DED (Directed Energy Deposition)', material: 'معادن' }
                ],
                applications: ['نماذج أولية سريعة', 'قطع غيار حسب الطلب', 'أطراف صناعية طبية', 'قطع طيران', 'أدوات وقوالب', 'هياكل معمارية', 'إلكترونيات مطبوعة']
            }
        };

        // ─────────────────────────────────────────────────────────────────────
        // إدارة الجودة في التصنيع
        // ─────────────────────────────────────────────────────────────────────
        this.qualityManagement = {
            standards: [
                { nameEn: 'ISO 9001', nameAr: 'نظام إدارة الجودة', description: 'المعيار الدولي لأنظمة إدارة الجودة' },
                { nameEn: 'ISO 14001', nameAr: 'نظام الإدارة البيئية', description: 'إدارة الأثر البيئي' },
                { nameEn: 'ISO 45001', nameAr: 'نظام إدارة السلامة المهنية', description: 'الصحة والسلامة في بيئة العمل' },
                { nameEn: 'ISO 22000', nameAr: 'نظام سلامة الغذاء', description: 'سلامة الغذاء في سلسلة الإمداد' },
                { nameEn: 'IATF 16949', nameAr: 'جودة صناعة السيارات', description: 'معيار جودة قطاع السيارات' },
                { nameEn: 'AS9100', nameAr: 'جودة صناعة الطيران', description: 'معيار جودة قطاع الطيران والفضاء' },
                { nameEn: 'GMP', nameAr: 'ممارسات التصنيع الجيد', description: 'معايير تصنيع الأدوية والغذاء' },
                { nameEn: 'SASO', nameAr: 'هيئة المواصفات والمقاييس السعودية', description: 'المواصفات القياسية السعودية' }
            ],
            methodologies: [
                { nameEn: 'Six Sigma', nameAr: 'ستة سيجما', description: 'تقليل العيوب إلى ٣.٤ لكل مليون فرصة', levels: ['White Belt', 'Yellow Belt', 'Green Belt', 'Black Belt', 'Master Black Belt'] },
                { nameEn: 'Lean Manufacturing', nameAr: 'التصنيع الرشيق', description: 'التخلص من الهدر وزيادة القيمة', wastes: ['إنتاج زائد', 'انتظار', 'نقل', 'تصنيع زائد', 'مخزون', 'حركة', 'عيوب', 'مهارات غير مستثمرة'] },
                { nameEn: 'TQM', nameAr: 'إدارة الجودة الشاملة', description: 'نهج شامل لتحسين الجودة في كل جانب' },
                { nameEn: 'Kaizen', nameAr: 'كايزن (التحسين المستمر)', description: 'تحسينات صغيرة ومستمرة' },
                { nameEn: '5S', nameAr: 'الخمسة إس', steps: ['Sort / ترتيب', 'Set in Order / تنظيم', 'Shine / تنظيف', 'Standardize / توحيد', 'Sustain / استدامة'] },
                { nameEn: 'TPM', nameAr: 'الصيانة الإنتاجية الشاملة', description: 'صيانة استباقية لزيادة وقت التشغيل' },
                { nameEn: 'Poka-Yoke', nameAr: 'منع الأخطاء', description: 'آليات لمنع حدوث العيوب' },
                { nameEn: 'DMAIC', nameAr: 'تعريف-قياس-تحليل-تحسين-تحكم', description: 'منهجية حل المشاكل في Six Sigma' },
                { nameEn: 'FMEA', nameAr: 'تحليل أنماط وآثار الإخفاق', description: 'تحليل المخاطر المحتملة في العمليات' },
                { nameEn: 'SPC', nameAr: 'التحكم الإحصائي بالعملية', description: 'مراقبة العملية باستخدام أدوات إحصائية' }
            ],
            tools: ['مخطط باريتو', 'مخطط إيشيكاوا (عظمة السمكة)', 'مخطط التحكم', 'الرسم البياني', 'مخطط التشتت', 'أوراق الفحص', 'مخطط التدفق']
        };

        // ─────────────────────────────────────────────────────────────────────
        // الصناعة الرقمية — Industry 4.0 / Digital Manufacturing
        // ─────────────────────────────────────────────────────────────────────
        this.digitalIndustry = {
            smartFactory: {
                nameAr: 'المصنع الذكي',
                nameEn: 'Smart Factory',
                pillars: [
                    { nameAr: 'الاتصال الشامل', nameEn: 'Full Connectivity', description: 'ربط كل الآلات والأنظمة والعمال' },
                    { nameAr: 'الأتمتة المتقدمة', nameEn: 'Advanced Automation', description: 'روبوتات وأنظمة ذاتية التشغيل' },
                    { nameAr: 'القرار المبني على البيانات', nameEn: 'Data-Driven Decisions', description: 'تحليل بيانات فوري لاتخاذ القرارات' },
                    { nameAr: 'المرونة والتكيف', nameEn: 'Flexibility & Adaptability', description: 'تغيير خطوط الإنتاج بسرعة' },
                    { nameAr: 'الاستدامة', nameEn: 'Sustainability', description: 'تقليل النفايات واستهلاك الطاقة' }
                ],
                technologies: ['IoT Sensors', 'Edge Computing', 'Cloud Platform', 'AI/ML', 'Digital Twin', 'AR/VR', 'Robotics', 'Blockchain', '5G', 'Cybersecurity']
            },
            iiot: {
                nameAr: 'إنترنت الأشياء الصناعي',
                nameEn: 'Industrial Internet of Things (IIoT)',
                components: [
                    { nameAr: 'حساسات', nameEn: 'Sensors', types: ['حرارة', 'ضغط', 'اهتزاز', 'رطوبة', 'تدفق', 'قرب', 'كاميرات'] },
                    { nameAr: 'بوابات', nameEn: 'Gateways', role: 'جمع البيانات من الحساسات وإرسالها للسحابة' },
                    { nameAr: 'حوسبة الحافة', nameEn: 'Edge Computing', role: 'معالجة البيانات محلياً للسرعة' },
                    { nameAr: 'منصة سحابية', nameEn: 'Cloud Platform', role: 'تخزين وتحليل وعرض البيانات' },
                    { nameAr: 'بروتوكولات', nameEn: 'Protocols', types: ['MQTT', 'OPC-UA', 'Modbus', 'AMQP', 'CoAP'] }
                ],
                applications: ['مراقبة خطوط الإنتاج', 'صيانة تنبؤية', 'تحسين استهلاك الطاقة', 'تتبع الأصول', 'مراقبة الجودة آنياً', 'سلامة العمال']
            },
            digitalTwin: {
                nameAr: 'التوأم الرقمي',
                nameEn: 'Digital Twin',
                types: [
                    { nameAr: 'توأم المنتج', nameEn: 'Product Twin', use: 'محاكاة تصميم المنتج وأدائه' },
                    { nameAr: 'توأم العملية', nameEn: 'Process Twin', use: 'محاكاة عمليات التصنيع وتحسينها' },
                    { nameAr: 'توأم المصنع', nameEn: 'Factory Twin', use: 'نسخة رقمية كاملة من المصنع' },
                    { nameAr: 'توأم سلسلة الإمداد', nameEn: 'Supply Chain Twin', use: 'محاكاة سلسلة التوريد الكاملة' }
                ],
                benefits: ['تقليل وقت التطوير', 'تحسين الإنتاجية', 'اكتشاف المشاكل مبكراً', 'خفض التكاليف', 'اختبار السيناريوهات']
            },
            aiInManufacturing: {
                nameAr: 'الذكاء الاصطناعي في التصنيع',
                nameEn: 'AI in Manufacturing',
                applications: [
                    { nameAr: 'الصيانة التنبؤية', nameEn: 'Predictive Maintenance', description: 'التنبؤ بأعطال الآلات قبل حدوثها' },
                    { nameAr: 'فحص الجودة البصري', nameEn: 'Visual Quality Inspection', description: 'اكتشاف العيوب بالرؤية الحاسوبية' },
                    { nameAr: 'تحسين الإنتاج', nameEn: 'Production Optimization', description: 'تعظيم الإنتاجية وتقليل الهدر' },
                    { nameAr: 'التنبؤ بالطلب', nameEn: 'Demand Forecasting', description: 'تقدير الطلب المستقبلي بدقة' },
                    { nameAr: 'التصميم التوليدي', nameEn: 'Generative Design', description: 'إنشاء تصاميم مثلى بواسطة AI' },
                    { nameAr: 'تخطيط سلسلة الإمداد', nameEn: 'Supply Chain Planning', description: 'تحسين المخزون والتوزيع' },
                    { nameAr: 'السلامة الذكية', nameEn: 'Smart Safety', description: 'مراقبة سلامة العمال بالكاميرات الذكية' },
                    { nameAr: 'التحسين الذاتي', nameEn: 'Self-Optimization', description: 'آلات تتعلم وتحسّن نفسها' }
                ],
                technologies: ['Machine Learning', 'Deep Learning', 'Computer Vision', 'NLP', 'Reinforcement Learning', 'Federated Learning']
            },
            robotics: {
                nameAr: 'الروبوتات والأتمتة الصناعية',
                nameEn: 'Industrial Robotics & Automation',
                types: [
                    { nameAr: 'روبوت مفصلي', nameEn: 'Articulated Robot', axes: '4-7', use: 'لحام، طلاء، تجميع' },
                    { nameAr: 'روبوت ديكارتي', nameEn: 'Cartesian Robot', axes: '3', use: 'تحميل، فرز، طباعة ثلاثية' },
                    { nameAr: 'روبوت SCARA', nameEn: 'SCARA Robot', axes: '4', use: 'تجميع إلكترونيات، تعبئة' },
                    { nameAr: 'روبوت دلتا', nameEn: 'Delta Robot', axes: '3-4', use: 'فرز سريع، تغليف أغذية' },
                    { nameAr: 'روبوت تعاوني (كوبوت)', nameEn: 'Collaborative Robot (Cobot)', axes: '6-7', use: 'العمل بجانب البشر بأمان' },
                    { nameAr: 'مركبة موجهة ذاتياً', nameEn: 'AGV / AMR', axes: 'N/A', use: 'نقل المواد داخل المصنع' }
                ],
                brands: ['ABB', 'FANUC', 'KUKA', 'Yaskawa', 'Universal Robots', 'EPSON', 'Kawasaki', 'Mitsubishi', 'Doosan'],
                applications: ['لحام', 'طلاء', 'تجميع', 'فرز وتغليف', 'نقل مواد', 'فحص جودة', 'قطع وتشغيل', 'ثقب وبرشمة']
            },
            cyberPhysical: {
                nameAr: 'الأنظمة الفيزيائية السيبرانية',
                nameEn: 'Cyber-Physical Systems (CPS)',
                layers: [
                    { nameAr: 'الطبقة الفيزيائية', nameEn: 'Physical Layer', components: 'آلات، حساسات، مشغلات' },
                    { nameAr: 'طبقة الشبكة', nameEn: 'Network Layer', components: 'اتصالات سلكية ولاسلكية' },
                    { nameAr: 'طبقة البيانات', nameEn: 'Data Layer', components: 'جمع وتخزين وتحليل بيانات' },
                    { nameAr: 'طبقة التطبيقات', nameEn: 'Application Layer', components: 'واجهات المستخدم والقرارات' },
                    { nameAr: 'طبقة الذكاء', nameEn: 'Intelligence Layer', components: 'AI/ML والتعلم الذاتي' }
                ]
            },
            mes: {
                nameAr: 'نظام تنفيذ التصنيع',
                nameEn: 'Manufacturing Execution System (MES)',
                functions: [
                    'تتبع الإنتاج الفوري',
                    'جدولة العمليات',
                    'إدارة الجودة',
                    'تتبع المواد',
                    'إدارة العمالة',
                    'تحليل الأداء (OEE)',
                    'إدارة المستندات',
                    'صيانة المعدات',
                    'تتبع الطاقة'
                ],
                vendors: ['Siemens (Opcenter)', 'Rockwell (Plex)', 'SAP (ME/MII)', 'Dassault (DELMIA)', 'GE (Proficy)', 'Honeywell']
            },
            plm: {
                nameAr: 'إدارة دورة حياة المنتج',
                nameEn: 'Product Lifecycle Management (PLM)',
                stages: ['تصور', 'تصميم', 'هندسة', 'تصنيع', 'خدمة', 'تقاعد / إعادة تدوير'],
                vendors: ['Siemens (Teamcenter)', 'Dassault (ENOVIA/3DEXPERIENCE)', 'PTC (Windchill)', 'Oracle (Agile)', 'SAP PLM'],
                cadCam: ['AutoCAD', 'SolidWorks', 'CATIA', 'Siemens NX', 'Inventor', 'Fusion 360', 'Creo']
            },
            scada: {
                nameAr: 'نظام التحكم الإشرافي وجمع البيانات',
                nameEn: 'SCADA (Supervisory Control and Data Acquisition)',
                components: ['RTU (وحدات طرفية)', 'PLC (متحكمات منطقية)', 'HMI (واجهات بشرية)', 'اتصالات', 'خوادم بيانات'],
                vendors: ['Siemens (WinCC)', 'Schneider (ClearSCADA)', 'GE (iFIX)', 'Honeywell', 'ABB', 'Yokogawa']
            },
            erp: {
                nameAr: 'تخطيط موارد المؤسسة',
                nameEn: 'Enterprise Resource Planning (ERP)',
                modules: ['إنتاج', 'مشتريات', 'مخزون', 'مبيعات', 'مالية', 'موارد بشرية', 'صيانة', 'جودة'],
                vendors: ['SAP S/4HANA', 'Oracle Cloud', 'Microsoft Dynamics 365', 'Infor', 'Epicor', 'IFS']
            },
            blockchain: {
                nameAr: 'البلوكتشين في الصناعة',
                nameEn: 'Blockchain in Manufacturing',
                applications: ['تتبع سلسلة الإمداد', 'شهادات المنشأ', 'ملكية فكرية', 'عقود ذكية مع الموردين', 'التحقق من الجودة', 'تمويل التجارة']
            },
            arVr: {
                nameAr: 'الواقع المعزز والافتراضي',
                nameEn: 'AR/VR in Manufacturing',
                applications: [
                    { nameAr: 'تدريب العمال', nameEn: 'Worker Training', technology: 'VR' },
                    { nameAr: 'صيانة موجهة', nameEn: 'Guided Maintenance', technology: 'AR' },
                    { nameAr: 'مراجعة التصميم', nameEn: 'Design Review', technology: 'VR' },
                    { nameAr: 'مراقبة الجودة', nameEn: 'Quality Control', technology: 'AR' },
                    { nameAr: 'محاكاة خط الإنتاج', nameEn: 'Production Line Simulation', technology: 'VR' },
                    { nameAr: 'مساعدة عن بُعد', nameEn: 'Remote Assistance', technology: 'AR' }
                ]
            },
            cloudManufacturing: {
                nameAr: 'التصنيع السحابي',
                nameEn: 'Cloud Manufacturing',
                services: [
                    { nameAr: 'التصنيع كخدمة', nameEn: 'Manufacturing as a Service (MaaS)', description: 'استئجار قدرات تصنيعية عبر السحابة' },
                    { nameAr: 'التصميم كخدمة', nameEn: 'Design as a Service (DaaS)', description: 'أدوات تصميم CAD/CAE سحابية' },
                    { nameAr: 'الاختبار كخدمة', nameEn: 'Testing as a Service (TaaS)', description: 'اختبارات افتراضية وفيزيائية' },
                    { nameAr: 'المحاكاة كخدمة', nameEn: 'Simulation as a Service (SimaaS)', description: 'محاكاة هندسية سحابية' }
                ]
            }
        };

        // ─────────────────────────────────────────────────────────────────────
        // السلامة الصناعية
        // ─────────────────────────────────────────────────────────────────────
        this.industrialSafety = {
            standards: ['OSHA', 'ISO 45001', 'NEBOSH', 'IOSH', 'SASO-Safety'],
            domains: [
                { nameAr: 'السلامة المهنية', nameEn: 'Occupational Safety', items: ['معدات الحماية الشخصية (PPE)', 'تقييم المخاطر', 'تصاريح العمل', 'إجراءات الإخلاء'] },
                { nameAr: 'السلامة من الحريق', nameEn: 'Fire Safety', items: ['أنظمة إطفاء', 'كاشفات دخان', 'مخارج طوارئ', 'تدريب'] },
                { nameAr: 'السلامة الكهربائية', nameEn: 'Electrical Safety', items: ['قفل/تعليق (LOTO)', 'تأريض', 'عزل', 'فحص دوري'] },
                { nameAr: 'السلامة الكيميائية', nameEn: 'Chemical Safety', items: ['صحائف بيانات السلامة (SDS)', 'تخزين آمن', 'تهوية', 'معالجة انسكابات'] },
                { nameAr: 'سلامة الآلات', nameEn: 'Machine Safety', items: ['حراسات', 'حساسات إيقاف طوارئ', 'أنظمة قفل', 'صيانة وقائية'] },
                { nameAr: 'بيئة العمل (إرجونوميكس)', nameEn: 'Ergonomics', items: ['تصميم محطات العمل', 'تقليل الإجهاد', 'رفع آمن', 'فترات راحة'] }
            ],
            kpis: ['معدل تكرار الإصابات (LTIFR)', 'معدل شدة الإصابات', 'أيام بدون إصابات', 'الحوادث الوشيكة (Near Miss)', 'نسبة الامتثال للسلامة']
        };

        // ─────────────────────────────────────────────────────────────────────
        // المدن والمناطق الصناعية في السعودية
        // ─────────────────────────────────────────────────────────────────────
        this.saudiIndustrialZones = {
            modon: {
                nameAr: 'هيئة المدن الصناعية ومناطق التقنية (مدن)',
                nameEn: 'MODON - Saudi Authority for Industrial Cities',
                cities: ['الرياض', 'جدة', 'الدمام', 'القصيم', 'المدينة', 'مكة', 'عسير', 'تبوك', 'الجوف', 'حائل', 'الأحساء', 'نجران', 'الباحة', 'جازان'],
                totalCities: 36,
                services: ['أراضي صناعية', 'بنية تحتية', 'خدمات لوجستية', 'مراكز تدريب', 'خدمات إلكترونية']
            },
            royalCommission: {
                nameAr: 'الهيئة الملكية للجبيل وينبع',
                nameEn: 'Royal Commission for Jubail and Yanbu',
                cities: [
                    { nameAr: 'مدينة الجبيل الصناعية', nameEn: 'Jubail Industrial City', specialty: 'بتروكيماويات، حديد، أسمدة', area: '1016 كم²' },
                    { nameAr: 'مدينة ينبع الصناعية', nameEn: 'Yanbu Industrial City', specialty: 'تكرير، بتروكيماويات، أسمنت', area: '185 كم²' },
                    { nameAr: 'مدينة رأس الخير الصناعية', nameEn: 'Ras Al-Khair Industrial City', specialty: 'تعدين، ألمنيوم، فوسفات', area: '204 كم²' },
                    { nameAr: 'مدينة جازان للصناعات الأساسية والتحويلية', nameEn: 'Jazan City for Primary and Downstream Industries', specialty: 'نحاس، زنك، تحلية' }
                ]
            },
            specialEconomicZones: {
                nameAr: 'المناطق الاقتصادية الخاصة',
                nameEn: 'Special Economic Zones (SEZs)',
                zones: [
                    { name: 'نيوم', specialty: 'تقنية متقدمة، طاقة متجددة، سياحة' },
                    { name: 'المنطقة الاقتصادية الخاصة بالملك عبدالله (كايك)', specialty: 'لوجستيات، صناعة، تجارة' },
                    { name: 'المنطقة الاقتصادية في جازان', specialty: 'صناعات تحويلية' },
                    { name: 'المنطقة الاقتصادية في رأس الخير', specialty: 'تعدين ومعادن' },
                    { name: 'سبارك (مدينة الملك سلمان للطاقة)', specialty: 'طاقة وصناعات مرتبطة' }
                ]
            },
            vision2030Industry: {
                nameAr: 'رؤية 2030 — القطاع الصناعي',
                nameEn: 'Vision 2030 — Industrial Sector',
                programs: [
                    { nameAr: 'برنامج تطوير الصناعة الوطنية والخدمات اللوجستية (ندلب)', nameEn: 'NIDLP', goals: ['رفع المحتوى المحلي', 'زيادة الصادرات غير النفطية', 'خلق وظائف صناعية'] },
                    { nameAr: 'صنع في السعودية', nameEn: 'Made in Saudi', goals: ['تعزيز المنتج الوطني', 'دعم المصنعين المحليين', 'فتح أسواق عالمية'] },
                    { nameAr: 'برنامج تعزيز المحتوى المحلي', nameEn: 'Local Content Enhancement Program', goals: ['رفع نسبة المحتوى المحلي', 'توطين الصناعات'] }
                ],
                entities: [
                    { nameAr: 'وزارة الصناعة والثروة المعدنية', nameEn: 'Ministry of Industry and Mineral Resources' },
                    { nameAr: 'هيئة تنمية الصادرات السعودية', nameEn: 'Saudi Export Development Authority' },
                    { nameAr: 'صندوق التنمية الصناعية السعودي (SIDF)', nameEn: 'Saudi Industrial Development Fund' },
                    { nameAr: 'المعهد الوطني للتطوير الصناعي', nameEn: 'National Institute for Industrial Development' }
                ],
                targets: {
                    industrialGDP: 'رفع مساهمة الصناعة في الناتج المحلي إلى 20%',
                    nonOilExports: 'زيادة الصادرات غير النفطية بنسبة 50%',
                    localContent: 'رفع المحتوى المحلي إلى 60%',
                    jobs: 'خلق مئات الآلاف من الوظائف الصناعية'
                }
            }
        };

        // ─────────────────────────────────────────────────────────────────────
        // الاستدامة والصناعة الخضراء
        // ─────────────────────────────────────────────────────────────────────
        this.greenManufacturing = {
            principles: [
                { nameAr: 'الاقتصاد الدائري', nameEn: 'Circular Economy', description: 'تقليل النفايات وإعادة استخدام الموارد' },
                { nameAr: 'الإنتاج الأنظف', nameEn: 'Cleaner Production', description: 'تقليل التلوث من المصدر' },
                { nameAr: 'كفاءة الطاقة', nameEn: 'Energy Efficiency', description: 'خفض استهلاك الطاقة في التصنيع' },
                { nameAr: 'المواد المستدامة', nameEn: 'Sustainable Materials', description: 'استخدام مواد صديقة للبيئة' },
                { nameAr: 'إدارة النفايات', nameEn: 'Waste Management', description: 'تقليل، إعادة استخدام، إعادة تدوير' },
                { nameAr: 'البصمة الكربونية', nameEn: 'Carbon Footprint', description: 'قياس وتقليل انبعاثات CO₂' }
            ],
            certifications: ['ISO 14001', 'LEED', 'Green Star', 'Cradle to Cradle', 'Energy Star', 'Carbon Trust'],
            saudiInitiatives: ['مبادرة السعودية الخضراء', 'الاقتصاد الدائري للكربون', 'مشروع نيوم الصفري الانبعاثات']
        };

        // ─────────────────────────────────────────────────────────────────────
        // الموارد البشرية والتأهيل الصناعي
        // ─────────────────────────────────────────────────────────────────────
        this.industrialHR = {
            skills: [
                { nameAr: 'مهارات تقنية', nameEn: 'Technical Skills', examples: ['CNC', 'لحام', 'كهرباء صناعية', 'ميكاترونكس', 'برمجة PLC'] },
                { nameAr: 'مهارات رقمية', nameEn: 'Digital Skills', examples: ['تحليل بيانات', 'IoT', 'AI/ML', 'CAD/CAM', 'أتمتة'] },
                { nameAr: 'مهارات إدارية', nameEn: 'Management Skills', examples: ['إدارة مشاريع', 'Lean/Six Sigma', 'إدارة جودة', 'سلسلة إمداد'] }
            ],
            saudiTraining: [
                { nameAr: 'المؤسسة العامة للتدريب التقني والمهني', nameEn: 'TVTC' },
                { nameAr: 'المعهد التقني السعودي لخدمات البترول (سبتمبر)', nameEn: 'Saudi Petroleum Services Polytechnic' },
                { nameAr: 'كليات التميز التقنية', nameEn: 'Colleges of Excellence' },
                { nameAr: 'أكاديمية سابك', nameEn: 'SABIC Academy' },
                { nameAr: 'أكاديمية أرامكو', nameEn: 'Aramco Academy' }
            ],
            certifications: ['AWS (لحام)', 'ASNT (فحص غير إتلافي)', 'PMP (إدارة مشاريع)', 'Lean Six Sigma', 'APICS (سلسلة إمداد)', 'ISA (أتمتة)']
        };

        // ─────────────────────────────────────────────────────────────────────
        // مؤشرات الأداء الصناعية
        // ─────────────────────────────────────────────────────────────────────
        this.industrialKPIs = {
            production: [
                { nameAr: 'فعالية المعدات الشاملة', nameEn: 'OEE (Overall Equipment Effectiveness)', formula: 'التوفر × الأداء × الجودة', target: '≥ 85%' },
                { nameAr: 'زمن الدورة', nameEn: 'Cycle Time', description: 'الوقت اللازم لإنتاج وحدة واحدة' },
                { nameAr: 'وقت التشغيل', nameEn: 'Uptime', description: 'نسبة وقت عمل الآلة الفعلي' },
                { nameAr: 'الإنتاجية', nameEn: 'Throughput', description: 'عدد الوحدات المنتجة في وحدة الزمن' },
                { nameAr: 'معدل العيوب', nameEn: 'Defect Rate', description: 'نسبة الوحدات المعيبة' },
                { nameAr: 'نسبة الهدر', nameEn: 'Scrap Rate', description: 'نسبة المواد المهدرة' }
            ],
            financial: [
                { nameAr: 'تكلفة الوحدة', nameEn: 'Cost Per Unit', description: 'إجمالي تكلفة إنتاج وحدة واحدة' },
                { nameAr: 'العائد على الأصول', nameEn: 'ROA', description: 'كفاءة استخدام الأصول الصناعية' },
                { nameAr: 'هامش الربح الصناعي', nameEn: 'Manufacturing Margin', description: 'الفرق بين سعر البيع وتكلفة التصنيع' },
                { nameAr: 'دوران المخزون', nameEn: 'Inventory Turnover', description: 'سرعة تحويل المخزون إلى مبيعات' }
            ],
            digital: [
                { nameAr: 'نضج رقمي', nameEn: 'Digital Maturity Level', levels: ['مبتدئ', 'متوسط', 'متقدم', 'رائد'] },
                { nameAr: 'نسبة الأتمتة', nameEn: 'Automation Rate', description: 'نسبة العمليات المؤتمتة' },
                { nameAr: 'تغطية IoT', nameEn: 'IoT Coverage', description: 'نسبة الآلات المتصلة' },
                { nameAr: 'وقت الاستجابة', nameEn: 'Response Time', description: 'سرعة الاستجابة للبيانات' }
            ]
        };

        // ─────────────────────────────────────────────────────────────────────
        // التصنيع والتقنيات الناشئة
        // ─────────────────────────────────────────────────────────────────────
        this.emergingTech = {
            industry5_0: {
                nameAr: 'الصناعة ٥.٠',
                nameEn: 'Industry 5.0',
                pillars: ['محورية الإنسان', 'الاستدامة', 'المرونة'],
                focus: 'التعاون بين الإنسان والآلة مع التركيز على الرفاهية والاستدامة'
            },
            quantumManufacturing: {
                nameAr: 'التصنيع الكمي',
                nameEn: 'Quantum Manufacturing',
                applications: ['تحسين سلاسل الإمداد', 'محاكاة المواد', 'التشفير الكمي للأمان']
            },
            nanoManufacturing: {
                nameAr: 'التصنيع النانوي',
                nameEn: 'Nano Manufacturing',
                applications: ['مواد نانوية', 'طلاءات ذكية', 'إلكترونيات نانوية', 'أدوية موجهة']
            },
            bioManufacturing: {
                nameAr: 'التصنيع الحيوي',
                nameEn: 'Bio Manufacturing',
                applications: ['أدوية حيوية', 'مواد حيوية', 'وقود حيوي', 'بلاستيك حيوي']
            },
            spaceManufacturing: {
                nameAr: 'التصنيع الفضائي',
                nameEn: 'Space Manufacturing',
                applications: ['طباعة ثلاثية في الفضاء', 'تعدين الكويكبات', 'تصنيع في بيئة الجاذبية المنخفضة']
            }
        };

        // ─────────────────────────────────────────────────────────────────────
        // الضوابط الشرعية في الصناعة والتصنيع
        // ─────────────────────────────────────────────────────────────────────
        this.shariaGuidance = {
            principles: [
                { principle: 'الإتقان في الصنعة', evidence: 'إن الله يحب إذا عمل أحدكم عملاً أن يتقنه — حديث', application: 'تطبيق أعلى معايير الجودة في التصنيع' },
                { principle: 'حسن الخلافة في الأرض', evidence: 'هُوَ أَنشَأَكُم مِّنَ الْأَرْضِ وَاسْتَعْمَرَكُمْ فِيهَا — هود ٦١', application: 'إعمار الأرض بالصناعة النافعة' },
                { principle: 'تحريم الإسراف والتبذير', evidence: 'وَلَا تُسْرِفُوا إِنَّهُ لَا يُحِبُّ الْمُسْرِفِينَ — الأنعام ١٤١', application: 'تقليل الهدر في التصنيع (Lean)' },
                { principle: 'حفظ البيئة', evidence: 'وَلَا تُفْسِدُوا فِي الْأَرْضِ بَعْدَ إِصْلَاحِهَا — الأعراف ٥٦', application: 'الصناعة الخضراء والاستدامة البيئية' },
                { principle: 'تحريم الغش', evidence: 'من غشنا فليس منا — حديث', application: 'صدق المواصفات وجودة المنتج' },
                { principle: 'سلامة العمال', evidence: 'لا ضرر ولا ضرار — حديث', application: 'توفير بيئة عمل آمنة' },
                { principle: 'حق العامل', evidence: 'أعطوا الأجير أجره قبل أن يجف عرقه — حديث', application: 'حقوق العمال وأجورهم العادلة' },
                { principle: 'تحريم الصناعات الضارة', evidence: 'وَلَا تُلْقُوا بِأَيْدِيكُمْ إِلَى التَّهْلُكَةِ — البقرة ١٩٥', application: 'عدم تصنيع المحرمات والمضرات' },
                { principle: 'النفع العام', evidence: 'خير الناس أنفعهم للناس — حديث', application: 'الصناعة التي تنفع المجتمع والأمة' },
                { principle: 'الأمانة في الوزن والقياس', evidence: 'وَأَوْفُوا الْكَيْلَ وَالْمِيزَانَ بِالْقِسْطِ — الأنعام ١٥٢', application: 'دقة القياس والمواصفات في التصنيع' },
                { principle: 'تسخير الأرض', evidence: 'وَسَخَّرَ لَكُم مَّا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ جَمِيعًا مِّنْهُ — الجاثية ١٣', application: 'استخدام موارد الأرض بحكمة في الصناعة' },
                { principle: 'التعاون على البر', evidence: 'وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ — المائدة ٢', application: 'التعاون الصناعي لخدمة الأمة' }
            ],
            prohibited: [
                'تصنيع الخمور والمسكرات',
                'تصنيع لحوم الخنزير ومشتقاتها',
                'تصنيع الأصنام والتماثيل المعبودة',
                'تصنيع أدوات القمار',
                'تصنيع المواد المخدرة',
                'تصنيع المواد الإباحية',
                'الغش في المنتجات والمواصفات',
                'تلويث البيئة بالنفايات السامة',
                'استغلال العمال وظلمهم',
                'الاحتكار الضار'
            ]
        };

        // ─────────────────────────────────────────────────────────────────────
        // التصنيع السعودي المحلي الشامل
        // ─────────────────────────────────────────────────────────────────────
        this.saudiManufacturing = {
            overview: {
                nameAr: 'التصنيع السعودي المحلي',
                nameEn: 'Saudi Local Manufacturing',
                contribution: 'مساهمة الصناعة في الناتج المحلي ≈ 13% — الهدف 20%',
                factories: 'أكثر من 10,000 مصنع مرخص',
                workforce: 'أكثر من 1.2 مليون عامل في القطاع الصناعي'
            },
            regulators: [
                { nameAr: 'وزارة الصناعة والثروة المعدنية', nameEn: 'Ministry of Industry & Mineral Resources', role: 'الجهة المنظمة الرئيسية' },
                { nameAr: 'صندوق التنمية الصناعية السعودي (SIDF)', nameEn: 'Saudi Industrial Development Fund', role: 'تمويل المشاريع الصناعية' },
                { nameAr: 'هيئة المحتوى المحلي والمشتريات الحكومية (LCGPA)', nameEn: 'Local Content & Govt Procurement Authority', role: 'تعزيز المحتوى المحلي' },
                { nameAr: 'هيئة المدن الصناعية ومناطق التقنية (مدن)', nameEn: 'MODON', role: 'إدارة المدن الصناعية' },
                { nameAr: 'الهيئة الملكية للجبيل وينبع', nameEn: 'Royal Commission for Jubail & Yanbu', role: 'المدن الصناعية الكبرى' },
                { nameAr: 'هيئة المواصفات والمقاييس والجودة (SASO)', nameEn: 'SASO', role: 'المواصفات القياسية' },
                { nameAr: 'الهيئة العامة للغذاء والدواء (SFDA)', nameEn: 'SFDA', role: 'تنظيم صناعة الغذاء والدواء' }
            ],
            licenses: [
                { nameAr: 'رخصة صناعية', nameEn: 'Industrial License', issuer: 'وزارة الصناعة' },
                { nameAr: 'سجل تجاري', nameEn: 'Commercial Registration', issuer: 'وزارة التجارة' },
                { nameAr: 'رخصة بيئية', nameEn: 'Environmental License', issuer: 'وزارة البيئة' },
                { nameAr: 'رخصة بلدية', nameEn: 'Municipal License', issuer: 'وزارة الشؤون البلدية' },
                { nameAr: 'شهادة الدفاع المدني', nameEn: 'Civil Defense Certificate', issuer: 'الدفاع المدني' },
                { nameAr: 'شهادة سابر', nameEn: 'SABER Certificate', issuer: 'هيئة المواصفات' }
            ],
            incentives: [
                'إعفاءات ضريبية في المناطق الاقتصادية الخاصة',
                'تمويل ميسر من صندوق التنمية الصناعية (حتى 75%)',
                'أراضي صناعية بأسعار رمزية في مدن',
                'دعم التدريب والتوظيف',
                'دعم تكاليف الطاقة للمصانع',
                'برنامج صنع في السعودية — تسويق ودعم',
                'إعفاء من الرسوم الجمركية على المواد الخام والمعدات'
            ],
            topSectors: [
                { sector: 'بتروكيماويات', share: '≈ 35%', leaders: ['سابك', 'أرامكو للكيماويات'] },
                { sector: 'مواد بناء', share: '≈ 15%', leaders: ['أسمنت السعودية', 'الزامل'] },
                { sector: 'أغذية ومشروبات', share: '≈ 12%', leaders: ['المراعي', 'صافولا'] },
                { sector: 'معادن وتعدين', share: '≈ 10%', leaders: ['معادن', 'حديد الراجحي'] },
                { sector: 'أدوية', share: '≈ 5%', leaders: ['سبيماكو', 'تبوك الدوائية'] },
                { sector: 'عسكري ودفاعي', share: '≈ 5%', leaders: ['SAMI', 'EDGE'] },
                { sector: 'إلكترونيات وكهربائيات', share: '≈ 4%', leaders: ['الكابلات السعودية'] },
                { sector: 'بلاستيك ومطاط', share: '≈ 4%', leaders: ['المتقدمة'] },
                { sector: 'نسيج وملابس', share: '≈ 3%', leaders: ['فيلا'] },
                { sector: 'أثاث ومفروشات', share: '≈ 2%', leaders: ['أيكيا المحلي'] }
            ],
            saudization: {
                nameAr: 'توطين الصناعة (المحتوى المحلي)',
                nameEn: 'Industrial Saudization / Localization',
                currentRate: '≈ 40%',
                targetRate: '≈ 60% بحلول 2030',
                strategies: [
                    'نقل التقنية من الشركاء الدوليين',
                    'بناء مراكز بحث وتطوير محلية',
                    'تدريب الكوادر السعودية في التخصصات الصناعية',
                    'تفضيل المنتج المحلي في المشتريات الحكومية',
                    'تطوير صناعات الأمن الغذائي والدوائي والعسكري محلياً'
                ]
            }
        };

        // ─────────────────────────────────────────────────────────────────────
        // التصنيع الإسلامي — التراث والحاضر
        // ─────────────────────────────────────────────────────────────────────
        this.islamicManufacturing = {
            heritage: {
                nameAr: 'التراث الصناعي الإسلامي',
                nameEn: 'Islamic Industrial Heritage',
                goldenAge: {
                    period: 'القرن 8 - 15 ميلادي',
                    innovations: [
                        { nameAr: 'صناعة الورق', pioneers: 'سمرقند - بغداد - الأندلس', impact: 'نقل التقنية من الصين وتطويرها وانتشارها عالمياً' },
                        { nameAr: 'صناعة الزجاج والبصريات', pioneers: 'ابن الهيثم - مصر - العراق', impact: 'اختراع العدسات وتطوير المجاهر' },
                        { nameAr: 'صناعة الأسلحة والدروع', pioneers: 'دمشق - بغداد - الأندلس', impact: 'سيف دمشق الشهير (فولاذ ووتز)' },
                        { nameAr: 'صناعة النسيج والحرير', pioneers: 'بلاد فارس - الأندلس - مصر', impact: 'تطوير صناعة الأقمشة والتطريز' },
                        { nameAr: 'صناعة الخزف والفخار', pioneers: 'إيران - تركيا - المغرب', impact: 'ابتكار التقنيات الخزفية المتقدمة' },
                        { nameAr: 'صناعة السفن', pioneers: 'عمان - اليمن - البصرة', impact: 'بناء سفن قادرة على عبور المحيطات' },
                        { nameAr: 'صناعة الآلات (علم الحيل)', pioneers: 'الجزري - بنو موسى', impact: 'أول روبوتات وآلات ذاتية الحركة' },
                        { nameAr: 'صناعة الأدوية والعطور', pioneers: 'ابن سينا - الرازي - جابر بن حيان', impact: 'التقطير والمركبات الكيميائية' },
                        { nameAr: 'صناعة الساعات والأرصاد', pioneers: 'الجزري - تقي الدين', impact: 'ساعات مائية وفلكية متقدمة' },
                        { nameAr: 'صناعة الري والزراعة', pioneers: 'الأندلس - العراق', impact: 'نواعير وقنوات ري متطورة' }
                    ]
                },
                islamicGuilds: {
                    nameAr: 'نظام الطوائف الحرفية (الأصناف)',
                    nameEn: 'Islamic Craft Guilds',
                    features: ['تدريب مهني منظم', 'رقابة جودة', 'أخلاقيات مهنية إسلامية', 'تسعير عادل', 'فتوة وشهامة']
                }
            },
            halalManufacturing: {
                nameAr: 'التصنيع الحلال',
                nameEn: 'Halal Manufacturing',
                sectors: [
                    { nameAr: 'غذاء حلال', nameEn: 'Halal Food', marketSize: '≈ 2.3 تريليون دولار عالمياً', standards: ['GSO (الخليج)', 'MS 1500 (ماليزيا)', 'JAKIM', 'ESMA'] },
                    { nameAr: 'مستحضرات تجميل حلال', nameEn: 'Halal Cosmetics', marketSize: '≈ 80 مليار دولار', standards: ['OIC/SMIIC', 'ISWA'] },
                    { nameAr: 'أدوية حلال', nameEn: 'Halal Pharma', marketSize: '≈ 200 مليار دولار', standards: ['WHO-GMP + Halal'] },
                    { nameAr: 'أزياء محتشمة', nameEn: 'Modest Fashion', marketSize: '≈ 300 مليار دولار' },
                    { nameAr: 'سياحة حلال', nameEn: 'Halal Tourism', marketSize: '≈ 220 مليار دولار' },
                    { nameAr: 'تمويل إسلامي', nameEn: 'Islamic Finance', marketSize: '≈ 4 تريليون دولار' }
                ],
                certifications: ['هيئة المواصفات الخليجية GSO', 'JAKIM (ماليزيا)', 'MUI (إندونيسيا)', 'SFDA (السعودية)', 'SMIIC (منظمة التعاون الإسلامي)', 'IFANCA (أمريكا)'],
                principles: [
                    'خلو المنتج من المواد المحرمة (خنزير، خمر، ميتة)',
                    'ذبح حلال للحيوانات وفق الشريعة',
                    'عدم التلوث المتبادل مع المحرمات',
                    'تتبع سلسلة الإمداد من المصدر للمستهلك',
                    'نظافة وطهارة خطوط الإنتاج',
                    'رقابة شرعية مستمرة'
                ]
            },
            islamicCountriesIndustry: [
                { country: 'تركيا', strengths: ['سيارات', 'نسيج', 'إلكترونيات', 'صناعات دفاعية', 'أغذية'], gdpIndustry: '≈ 25%' },
                { country: 'ماليزيا', strengths: ['إلكترونيات', 'بتروكيماويات', 'مطاط', 'زيت نخيل'], gdpIndustry: '≈ 23%' },
                { country: 'إندونيسيا', strengths: ['نسيج', 'أغذية', 'سيارات', 'إلكترونيات'], gdpIndustry: '≈ 20%' },
                { country: 'مصر', strengths: ['أغذية', 'نسيج', 'إسمنت', 'حديد', 'أدوية'], gdpIndustry: '≈ 16%' },
                { country: 'باكستان', strengths: ['نسيج', 'أغذية', 'إسمنت', 'أسلحة'], gdpIndustry: '≈ 19%' },
                { country: 'الإمارات', strengths: ['ألمنيوم', 'بتروكيماويات', 'طيران', 'دفاع'], gdpIndustry: '≈ 14%' },
                { country: 'إيران', strengths: ['بتروكيماويات', 'سيارات', 'صلب', 'أدوية'], gdpIndustry: '≈ 23%' },
                { country: 'بنغلاديش', strengths: ['ملابس جاهزة', 'نسيج', 'أدوية'], gdpIndustry: '≈ 30%' },
                { country: 'المغرب', strengths: ['سيارات', 'طيران', 'أغذية', 'فوسفات'], gdpIndustry: '≈ 17%' },
                { country: 'السعودية', strengths: ['بتروكيماويات', 'تعدين', 'أغذية', 'إسمنت', 'عسكري'], gdpIndustry: '≈ 13%' }
            ],
            oicIndustrialCooperation: {
                nameAr: 'التعاون الصناعي لمنظمة التعاون الإسلامي',
                nameEn: 'OIC Industrial Cooperation',
                entities: ['COMCEC (لجنة التعاون الاقتصادي)', 'SESRIC (مركز الأبحاث)', 'ICDT (مركز التجارة)', 'IDB (البنك الإسلامي للتنمية)'],
                programs: ['تبادل تقني بين الدول الإسلامية', 'مشاريع صناعية مشتركة', 'تمويل صناعي إسلامي', 'توحيد المواصفات الحلال']
            }
        };

        // ─────────────────────────────────────────────────────────────────────
        // التصنيع العالمي
        // ─────────────────────────────────────────────────────────────────────
        this.globalManufacturing = {
            topCountries: [
                { country: 'الصين', share: '≈ 30%', strengths: ['إلكترونيات', 'ملابس', 'آلات', 'حديد', 'سيارات'] },
                { country: 'الولايات المتحدة', share: '≈ 16%', strengths: ['طيران', 'أدوية', 'تقنية', 'سيارات', 'أغذية'] },
                { country: 'اليابان', share: '≈ 7%', strengths: ['سيارات', 'إلكترونيات', 'روبوتات', 'آلات دقيقة'] },
                { country: 'ألمانيا', share: '≈ 5%', strengths: ['سيارات', 'آلات', 'كيماويات', 'معدات طبية'] },
                { country: 'كوريا الجنوبية', share: '≈ 4%', strengths: ['إلكترونيات', 'سفن', 'سيارات', 'بتروكيماويات'] },
                { country: 'الهند', share: '≈ 3%', strengths: ['أدوية', 'نسيج', 'IT', 'فولاذ', 'سيارات'] },
                { country: 'إيطاليا', share: '≈ 3%', strengths: ['أزياء', 'آلات', 'أغذية', 'سيارات فاخرة'] },
                { country: 'فرنسا', share: '≈ 2.5%', strengths: ['طيران', 'أدوية', 'أزياء', 'أغذية'] },
                { country: 'المملكة المتحدة', share: '≈ 2%', strengths: ['طيران', 'أدوية', 'سيارات', 'تقنية'] },
                { country: 'تايوان', share: '≈ 2%', strengths: ['أشباه موصلات', 'إلكترونيات'] }
            ],
            globalOrganizations: [
                { nameEn: 'UNIDO', nameAr: 'منظمة الأمم المتحدة للتنمية الصناعية', role: 'تطوير الصناعة في الدول النامية' },
                { nameEn: 'ISO', nameAr: 'المنظمة الدولية للمواصفات القياسية', role: 'وضع المعايير العالمية' },
                { nameEn: 'WTO', nameAr: 'منظمة التجارة العالمية', role: 'تنظيم التجارة والتعريفات الجمركية' },
                { nameEn: 'WIPO', nameAr: 'المنظمة العالمية للملكية الفكرية', role: 'حماية براءات الاختراع الصناعية' },
                { nameEn: 'ILO', nameAr: 'منظمة العمل الدولية', role: 'معايير العمل والسلامة المهنية' }
            ],
            globalTrends: [
                { nameAr: 'إعادة التوطين', nameEn: 'Reshoring', description: 'عودة المصانع من الخارج للدول الأم' },
                { nameAr: 'القرب من السوق', nameEn: 'Nearshoring', description: 'نقل الإنتاج لدول قريبة من السوق المستهدف' },
                { nameAr: 'سلاسل إمداد مرنة', nameEn: 'Resilient Supply Chains', description: 'تنويع المصادر وتقليل الاعتماد' },
                { nameAr: 'التصنيع المستدام', nameEn: 'Sustainable Manufacturing', description: 'الاقتصاد الدائري وصفر انبعاثات' },
                { nameAr: 'التخصيص الشامل', nameEn: 'Mass Customization', description: 'منتجات مخصصة بتكلفة إنتاج ضخم' },
                { nameAr: 'الأمن الصناعي', nameEn: 'Industrial Sovereignty', description: 'تأمين الصناعات الاستراتيجية محلياً' }
            ],
            tradeAgreements: [
                'اتفاقية التجارة الحرة الخليجية',
                'منطقة التجارة الحرة العربية الكبرى (GAFTA)',
                'اتفاقية التجارة مع سنغافورة',
                'مفاوضات GCC-EU',
                'اتفاقية GCC-EFTA',
                'اتفاقيات ثنائية متعددة'
            ]
        };

        // ─────────────────────────────────────────────────────────────────────
        // سلسلة الإمداد التصنيعية الشاملة
        // ─────────────────────────────────────────────────────────────────────
        this.manufacturingSupplyChain = {
            stages: [
                { nameAr: 'تخطيط الطلب', nameEn: 'Demand Planning', activities: ['تنبؤ بالطلب', 'تخطيط المبيعات والعمليات (S&OP)', 'إدارة الموسمية'] },
                { nameAr: 'المشتريات والتوريد', nameEn: 'Procurement & Sourcing', activities: ['اختيار الموردين', 'التفاوض', 'عقود التوريد', 'تأهيل الموردين', 'المشتريات الخضراء'] },
                { nameAr: 'إدارة المواد الخام', nameEn: 'Raw Material Management', activities: ['استلام', 'فحص جودة', 'تخزين', 'تتبع', 'FIFO/LIFO'] },
                { nameAr: 'الإنتاج والتصنيع', nameEn: 'Production & Manufacturing', activities: ['جدولة الإنتاج', 'تشغيل الآلات', 'تجميع', 'فحص أثناء الإنتاج', 'تغيير خطوط'] },
                { nameAr: 'مراقبة الجودة', nameEn: 'Quality Control', activities: ['فحص المدخلات', 'فحص أثناء التصنيع', 'فحص المنتج النهائي', 'اختبارات مخبرية', 'شهادات مطابقة'] },
                { nameAr: 'التغليف والتعبئة', nameEn: 'Packaging', activities: ['تغليف أولي', 'تغليف ثانوي', 'تغليف شحن', 'بطاقة بيانات', 'باركود/QR'] },
                { nameAr: 'التخزين', nameEn: 'Warehousing', activities: ['مستودعات مواد خام', 'مستودعات تحت التصنيع', 'مستودعات منتجات تامة', 'مراكز توزيع'] },
                { nameAr: 'النقل والتوزيع', nameEn: 'Transport & Distribution', activities: ['نقل بري', 'نقل بحري', 'نقل جوي', 'نقل سكة حديد', 'التوصيل للعميل'] },
                { nameAr: 'خدمة العملاء', nameEn: 'Customer Service', activities: ['معالجة الطلبات', 'الشكاوى', 'الإرجاع', 'الضمان', 'الدعم الفني'] },
                { nameAr: 'اللوجستيات العكسية', nameEn: 'Reverse Logistics', activities: ['إرجاع منتجات', 'إعادة تدوير', 'إصلاح وتجديد', 'التخلص الآمن'] }
            ],
            models: [
                { nameEn: 'MTS', nameAr: 'تصنيع للمخزون', description: 'إنتاج بناءً على تنبؤات الطلب' },
                { nameEn: 'MTO', nameAr: 'تصنيع حسب الطلب', description: 'إنتاج عند استلام طلب العميل' },
                { nameEn: 'ATO', nameAr: 'تجميع حسب الطلب', description: 'تجميع مكونات مسبقة التصنيع' },
                { nameEn: 'ETO', nameAr: 'هندسة حسب الطلب', description: 'تصميم وتصنيع حسب مواصفات العميل' },
                { nameEn: 'JIT', nameAr: 'في الوقت المحدد', description: 'توريد المواد عند الحاجة فقط' },
                { nameEn: 'VMI', nameAr: 'إدارة المخزون بواسطة المورد', description: 'المورد يدير مخزون العميل' }
            ],
            kpis: [
                { nameAr: 'معدل تلبية الطلبات', nameEn: 'Order Fulfillment Rate', target: '≥ 98%' },
                { nameAr: 'وقت دورة الطلب', nameEn: 'Order Cycle Time', description: 'من الطلب للتسليم' },
                { nameAr: 'دقة المخزون', nameEn: 'Inventory Accuracy', target: '≥ 99%' },
                { nameAr: 'دوران المخزون', nameEn: 'Inventory Turnover', description: 'مرات البيع وإعادة التعبئة سنوياً' },
                { nameAr: 'تكلفة سلسلة الإمداد', nameEn: 'Total Supply Chain Cost', description: 'كنسبة من الإيرادات' },
                { nameAr: 'أداء الموردين', nameEn: 'Supplier Performance', metrics: ['التسليم في الوقت', 'جودة المدخلات', 'المرونة'] },
                { nameAr: 'نسبة التالف', nameEn: 'Damage Rate', target: '≤ 0.5%' },
                { nameAr: 'تكلفة النقل لكل وحدة', nameEn: 'Transport Cost Per Unit' }
            ],
            saudiSupplyChainInfra: {
                ports: ['ميناء جدة الإسلامي', 'ميناء الملك عبدالعزيز بالدمام', 'ميناء ينبع', 'ميناء جازان', 'ميناء الجبيل'],
                airports: ['مطار الملك خالد (الرياض)', 'مطار الملك عبدالعزيز (جدة)', 'مطار الملك فهد (الدمام)'],
                railways: ['سار (الشمال-الجنوب)', 'الحرمين السريع', 'الجسر البري (شرق-غرب)'],
                logisticsZones: ['المنطقة اللوجستية المتكاملة (الرياض)', 'مدينة الملك عبدالله الاقتصادية', 'ميناء نيوم'],
                digitalPlatforms: ['فسح (الجمارك)', 'سابر (المواصفات)', 'تبادل (البيانات التجارية)', 'نافذة (التجارة الدولية)']
            }
        };

        // ─────────────────────────────────────────────────────────────────────
        // سلسلة الإمداد الرقمية للتصنيع
        // ─────────────────────────────────────────────────────────────────────
        this.digitalSupplyChain = {
            nameAr: 'سلسلة الإمداد الرقمية',
            nameEn: 'Digital Supply Chain',
            pillars: [
                {
                    nameAr: 'الرؤية الشاملة',
                    nameEn: 'End-to-End Visibility',
                    technologies: ['IoT Tracking', 'GPS', 'RFID', 'Blockchain', 'Control Tower'],
                    description: 'رؤية كاملة لحركة المواد من المورد للعميل النهائي'
                },
                {
                    nameAr: 'التحليلات التنبؤية',
                    nameEn: 'Predictive Analytics',
                    technologies: ['AI/ML', 'Big Data', 'Statistical Models'],
                    description: 'التنبؤ بالطلب والمخاطر والأعطال'
                },
                {
                    nameAr: 'الأتمتة الذكية',
                    nameEn: 'Intelligent Automation',
                    technologies: ['RPA', 'AI Agents', 'Autonomous Vehicles', 'Drones'],
                    description: 'أتمتة العمليات المتكررة والنقل'
                },
                {
                    nameAr: 'التكامل السحابي',
                    nameEn: 'Cloud Integration',
                    technologies: ['Cloud ERP', 'API Integration', 'EDI', 'iPaaS'],
                    description: 'ربط جميع الأطراف عبر منصة سحابية موحدة'
                },
                {
                    nameAr: 'الأمان والثقة',
                    nameEn: 'Security & Trust',
                    technologies: ['Blockchain', 'Zero Trust', 'Encryption', 'Smart Contracts'],
                    description: 'تأمين البيانات والمعاملات وبناء الثقة'
                }
            ],
            technologies: {
                scmSystems: [
                    { nameEn: 'SAP IBP', nameAr: 'تخطيط الأعمال المتكامل', use: 'تخطيط الطلب والإمداد' },
                    { nameEn: 'Oracle SCM Cloud', nameAr: 'سحابة إدارة سلسلة الإمداد', use: 'إدارة شاملة' },
                    { nameEn: 'Kinaxis RapidResponse', nameAr: 'استجابة سريعة', use: 'تخطيط متقدم' },
                    { nameEn: 'Blue Yonder', nameAr: 'بلو يوندر', use: 'تخطيط ذكي بالذكاء الاصطناعي' },
                    { nameEn: 'Coupa', nameAr: 'كوبا', use: 'إدارة المشتريات والإنفاق' }
                ],
                wms: [
                    { nameEn: 'Manhattan WMS', use: 'إدارة المستودعات الكبيرة' },
                    { nameEn: 'Blue Yonder WMS', use: 'مستودعات ذكية' },
                    { nameEn: 'SAP EWM', use: 'إدارة مستودعات متقدمة' },
                    { nameEn: 'Oracle WMS', use: 'إدارة متكاملة مع ERP' }
                ],
                tms: [
                    { nameEn: 'SAP TM', use: 'إدارة النقل' },
                    { nameEn: 'Oracle TMS', use: 'تحسين مسارات الشحن' },
                    { nameEn: 'MercuryGate', use: 'إدارة نقل متعدد الوسائط' },
                    { nameEn: 'project44', use: 'رؤية الشحنات الفورية' }
                ],
                trackingTech: [
                    { nameAr: 'RFID', nameEn: 'Radio Frequency Identification', use: 'تتبع المنتجات والمواد' },
                    { nameAr: 'GPS', nameEn: 'Global Positioning System', use: 'تتبع المركبات والشحنات' },
                    { nameAr: 'BLE Beacons', nameEn: 'Bluetooth Low Energy', use: 'تتبع داخل المستودعات' },
                    { nameAr: 'باركود / QR', nameEn: 'Barcode / QR Code', use: 'تعريف المنتجات' },
                    { nameAr: 'NFC', nameEn: 'Near Field Communication', use: 'تأكيد الاستلام والتسليم' }
                ],
                blockchainSC: {
                    nameAr: 'البلوكتشين في سلسلة الإمداد',
                    nameEn: 'Blockchain in Supply Chain',
                    useCases: [
                        'تتبع المنشأ (حلال، عضوي، Fair Trade)',
                        'شهادات الجودة الرقمية',
                        'عقود ذكية مع الموردين',
                        'تمويل سلسلة الإمداد',
                        'مكافحة التزوير والغش',
                        'الامتثال الجمركي الآلي'
                    ],
                    platforms: ['IBM Food Trust', 'VeChain', 'TradeLens', 'Hyperledger Fabric']
                },
                aiInSC: {
                    nameAr: 'الذكاء الاصطناعي في سلسلة الإمداد',
                    nameEn: 'AI in Supply Chain',
                    applications: [
                        { nameAr: 'تنبؤ الطلب', nameEn: 'Demand Sensing', accuracy: 'تحسين الدقة بنسبة 20-50%' },
                        { nameAr: 'تحسين المسارات', nameEn: 'Route Optimization', saving: 'توفير 10-30% من تكاليف النقل' },
                        { nameAr: 'إدارة المخزون الذكية', nameEn: 'Smart Inventory', benefit: 'تقليل المخزون 20-30% مع تحسين التوفر' },
                        { nameAr: 'تقييم مخاطر الموردين', nameEn: 'Supplier Risk Assessment', benefit: 'اكتشاف مبكر للمخاطر' },
                        { nameAr: 'روبوتات المستودعات', nameEn: 'Warehouse Robotics', benefit: 'زيادة السرعة 2-5 أضعاف' },
                        { nameAr: 'التسعير الديناميكي', nameEn: 'Dynamic Pricing', benefit: 'تعظيم الإيرادات' },
                        { nameAr: 'كشف الاحتيال', nameEn: 'Fraud Detection', benefit: 'حماية من الغش في التوريد' }
                    ]
                },
                drones: {
                    nameAr: 'الطائرات المسيّرة في سلسلة الإمداد',
                    nameEn: 'Drones in Supply Chain',
                    uses: ['جرد المستودعات', 'توصيل الميل الأخير', 'مراقبة المخزون الخارجي', 'فحص البنية التحتية']
                },
                autonomousVehicles: {
                    nameAr: 'المركبات ذاتية القيادة',
                    nameEn: 'Autonomous Vehicles',
                    types: ['شاحنات ذاتية القيادة', 'AGV (مركبات مستودعات)', 'سفن ذاتية القيادة', 'روبوتات التوصيل']
                }
            },
            digitalMaturity: {
                levels: [
                    { level: 1, nameAr: 'يدوي', nameEn: 'Manual', description: 'عمليات ورقية بالكامل' },
                    { level: 2, nameAr: 'أساسي', nameEn: 'Basic Digital', description: 'Excel وأنظمة بسيطة' },
                    { level: 3, nameAr: 'متصل', nameEn: 'Connected', description: 'ERP مع تكامل جزئي' },
                    { level: 4, nameAr: 'ذكي', nameEn: 'Intelligent', description: 'AI/IoT مع تحليلات متقدمة' },
                    { level: 5, nameAr: 'ذاتي التشغيل', nameEn: 'Autonomous', description: 'سلسلة إمداد ذاتية التحسين' }
                ]
            },
            saudiDigitalSCInitiatives: [
                { nameAr: 'منصة فسح الرقمية', nameEn: 'Fasah Platform', use: 'رقمنة الإجراءات الجمركية' },
                { nameAr: 'منصة سابر', nameEn: 'SABER Platform', use: 'شهادات المطابقة الإلكترونية' },
                { nameAr: 'منصة نافذة', nameEn: 'Nafeza Platform', use: 'النافذة الواحدة للتجارة الدولية' },
                { nameAr: 'منصة تبادل', nameEn: 'Tabadol Platform', use: 'تبادل البيانات التجارية' },
                { nameAr: 'مشروع نيوم اللوجستي', nameEn: 'NEOM Logistics', use: 'سلسلة إمداد مؤتمتة بالكامل' },
                { nameAr: 'ميناء البحر الأحمر الذكي', nameEn: 'Red Sea Gateway Terminal', use: 'ميناء ذكي بالكامل' },
                { nameAr: 'سبارك (مدينة الملك سلمان للطاقة)', nameEn: 'SPARK', use: 'منطقة صناعية لوجستية ذكية' }
            ]
        };

        // ─────────────────────────────────────────────────────────────────────
        // التصنيع الرقمي المتكامل (Saudi + Islamic + Global)
        // ─────────────────────────────────────────────────────────────────────
        this.digitalManufacturingFull = {
            saudi: {
                nameAr: 'التصنيع الرقمي السعودي',
                nameEn: 'Saudi Digital Manufacturing',
                initiatives: [
                    { nameAr: 'مصانع المستقبل', nameEn: 'Factories of the Future', description: 'تحويل المصانع السعودية لمصانع ذكية بحلول 2030' },
                    { nameAr: 'منصة صناعي', nameEn: 'Sinai Platform', description: 'منصة رقمية للخدمات الصناعية' },
                    { nameAr: 'مركز الثورة الصناعية الرابعة (C4IR)', nameEn: 'C4IR Saudi', description: 'مركز بالشراكة مع المنتدى الاقتصادي العالمي' },
                    { nameAr: 'برنامج المحتوى المحلي الرقمي', nameEn: 'Digital Local Content', description: 'رقمنة سلاسل الإمداد المحلية' },
                    { nameAr: 'أكاديمية التصنيع الرقمي', nameEn: 'Digital Manufacturing Academy', description: 'تأهيل الكوادر في التصنيع الرقمي' }
                ],
                technologies: ['5G Industrial', 'Edge Computing', 'Digital Twin', 'AR/VR Training', 'AI Quality', 'Blockchain Traceability'],
                targetFactories: '> 1000 مصنع ذكي بحلول 2030'
            },
            islamic: {
                nameAr: 'التصنيع الرقمي الإسلامي',
                nameEn: 'Islamic Digital Manufacturing',
                principles: [
                    'رقمنة التتبع الحلال من المزرعة للمائدة',
                    'شهادات حلال رقمية بالبلوكتشين',
                    'ذكاء اصطناعي لمراقبة خطوط الإنتاج الحلال',
                    'منصات تجارة إلكترونية حلال عالمية',
                    'تمويل إسلامي رقمي للمصانع',
                    'مواصفات SMIIC الرقمية'
                ],
                platforms: [
                    { nameAr: 'سوق حلال رقمي عالمي', nameEn: 'Global Digital Halal Marketplace', status: 'تحت التطوير' },
                    { nameAr: 'منصة تتبع الحلال بالبلوكتشين', nameEn: 'Halal Blockchain Tracker', status: 'مشاريع تجريبية' },
                    { nameAr: 'نظام شهادة حلال رقمي', nameEn: 'Digital Halal Certification', status: 'SMIIC + JAKIM' }
                ]
            },
            global: {
                nameAr: 'التصنيع الرقمي العالمي',
                nameEn: 'Global Digital Manufacturing',
                leaders: [
                    { country: 'ألمانيا', program: 'Industrie 4.0', focus: 'الأنظمة الفيزيائية السيبرانية' },
                    { country: 'الصين', program: 'Made in China 2025', focus: 'التصنيع الذكي والروبوتات' },
                    { country: 'أمريكا', program: 'Manufacturing USA', focus: 'الابتكار والتقنيات المتقدمة' },
                    { country: 'اليابان', program: 'Society 5.0', focus: 'المجتمع الذكي والصناعة' },
                    { country: 'كوريا', program: 'Smart Factory Korea', focus: '30,000 مصنع ذكي' },
                    { country: 'الهند', program: 'Make in India + SAMARTH', focus: 'التصنيع الرقمي والتدريب' },
                    { country: 'السعودية', program: 'رؤية 2030 + NIDLP', focus: 'تنويع اقتصادي وتصنيع ذكي' }
                ],
                standards: [
                    { nameEn: 'IEC 62264', nameAr: 'تكامل أنظمة المؤسسة والتحكم', scope: 'ISA-95 الدولي' },
                    { nameEn: 'IEC 62443', nameAr: 'الأمن السيبراني الصناعي', scope: 'حماية أنظمة التصنيع' },
                    { nameEn: 'ISO 23247', nameAr: 'إطار التوأم الرقمي', scope: 'معيار التوأم الرقمي في التصنيع' },
                    { nameEn: 'OPC-UA', nameAr: 'بروتوكول الاتصال الصناعي الموحد', scope: 'ربط الآلات والأنظمة' },
                    { nameEn: 'RAMI 4.0', nameAr: 'النموذج المرجعي للصناعة 4.0', scope: 'هيكل مرجعي ألماني' },
                    { nameEn: 'MTConnect', nameAr: 'بروتوكول بيانات الآلات', scope: 'جمع بيانات آلات التصنيع' }
                ]
            }
        };
        // ─────────────────────────────────────────────────────────────────────
        // مصانع شيخة لإنتاج الذكاء الاصطناعي — Sheikha AI Factories
        // ─────────────────────────────────────────────────────────────────────
        this.sheikhaAIFactories = {
            vision: {
                nameAr: 'رؤية مصانع شيخة للذكاء الاصطناعي',
                nameEn: 'Sheikha AI Factories Vision',
                mission: 'بناء منظومة تصنيع متكاملة لإنتاج مكونات الذكاء الاصطناعي — من الرمل إلى الذكاء',
                motto: 'صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ — النمل ٨٨',
                goals: [
                    'تصنيع رقائق ذكاء اصطناعي سعودية محلية',
                    'بناء مصانع خوادم AI متكاملة',
                    'إنشاء مراكز بيانات ذكية',
                    'تصنيع روبوتات صناعية وخدمية',
                    'إنتاج حساسات ذكية وأجهزة IoT',
                    'تطوير أنظمة حوسبة الحافة',
                    'تحقيق السيادة التقنية بالكتاب والسنة'
                ]
            },

            // ══════════════════════════════════════════════════════
            // المصنع ١: تصنيع أشباه الموصلات والرقائق
            // ══════════════════════════════════════════════════════
            semiconductorFactory: {
                nameAr: 'مصنع شيخة لأشباه الموصلات',
                nameEn: 'Sheikha Semiconductor Fab',
                description: 'مصنع متكامل لتصنيع رقائق الذكاء الاصطناعي',
                stages: [
                    {
                        nameAr: 'تصميم الرقائق (Fabless)',
                        nameEn: 'Chip Design',
                        tools: ['EDA Tools (Synopsys, Cadence, Mentor)', 'RTL Design (Verilog, VHDL)', 'Physical Design (Place & Route)', 'Verification & Simulation', 'DFT (Design for Test)'],
                        outputs: ['GDSII Layout Files', 'Netlist', 'Timing Reports']
                    },
                    {
                        nameAr: 'تصنيع الرقاقات (Wafer Fab)',
                        nameEn: 'Wafer Fabrication',
                        processes: [
                            { nameAr: 'تنقية السيليكون', nameEn: 'Silicon Purification', purity: '99.9999999% (9N)' },
                            { nameAr: 'سحب البلورة', nameEn: 'Crystal Growth (Czochralski)', output: 'سبيكة سيليكون أحادية البلورة' },
                            { nameAr: 'تقطيع الرقاقات', nameEn: 'Wafer Slicing', sizes: ['200mm (8")', '300mm (12")', '450mm (18")'] },
                            { nameAr: 'تلميع', nameEn: 'CMP (Chemical Mechanical Polishing)' },
                            { nameAr: 'أكسدة', nameEn: 'Oxidation', description: 'طبقة عازلة SiO₂' },
                            { nameAr: 'ترسيب', nameEn: 'Deposition (CVD/PVD/ALD)', description: 'ترسيب طبقات رقيقة' },
                            { nameAr: 'طباعة ضوئية', nameEn: 'Photolithography', types: ['DUV (193nm)', 'EUV (13.5nm)', 'Immersion'] },
                            { nameAr: 'حفر', nameEn: 'Etching (Dry/Wet)', description: 'إزالة المواد غير المرغوبة' },
                            { nameAr: 'زرع أيونات', nameEn: 'Ion Implantation', description: 'تعديل خصائص السيليكون' },
                            { nameAr: 'ترابط معدني', nameEn: 'Metallization', materials: ['نحاس (Cu)', 'تنجستن (W)', 'كوبالت (Co)'] },
                            { nameAr: 'فحص', nameEn: 'Inspection & Metrology', tools: ['SEM', 'AFM', 'Ellipsometer'] }
                        ],
                        cleanroom: { class: 'ISO 1-3', temperature: '20±0.1°C', humidity: '45±2%', particles: '< 10 جسيم/م³ عند 0.1μm' },
                        technologyNodes: ['7nm', '5nm', '3nm', '2nm (GAA)', '1.4nm (مستقبلي)'],
                        equipment: [
                            { nameEn: 'ASML EUV', nameAr: 'آلة الطباعة الضوئية بالأشعة فوق البنفسجية القصوى', cost: '≈ $350M', supplier: 'ASML (هولندا)' },
                            { nameEn: 'Applied Materials CVD', nameAr: 'آلة الترسيب الكيميائي', supplier: 'Applied Materials (أمريكا)' },
                            { nameEn: 'Lam Research Etch', nameAr: 'آلة الحفر البلازمي', supplier: 'Lam Research (أمريكا)' },
                            { nameEn: 'Tokyo Electron Coater', nameAr: 'آلة الطلاء والتظهير', supplier: 'TEL (اليابان)' },
                            { nameEn: 'KLA Inspection', nameAr: 'آلة الفحص والقياس', supplier: 'KLA (أمريكا)' }
                        ]
                    },
                    {
                        nameAr: 'التغليف والتجميع والاختبار (ATP)',
                        nameEn: 'Assembly, Test & Packaging',
                        processes: ['تقطيع الرقاقة (Dicing)', 'لصق القالب (Die Attach)', 'توصيل الأسلاك (Wire Bonding)', 'قولبة (Molding)', 'وضع الكرات (Ball Placement)', 'قطع وتشكيل (Singulation)', 'فحص نهائي'],
                        advancedPackaging: [
                            { nameEn: '2.5D Interposer', description: 'ربط رقائق متعددة عبر وسيط سيليكوني' },
                            { nameEn: '3D Stacking (HBM)', description: 'تكديس ذاكرات عالية النطاق' },
                            { nameEn: 'Chiplet Architecture', description: 'تجميع رقائق صغيرة متخصصة' },
                            { nameEn: 'Fan-Out Wafer Level (FOWLP)', description: 'تغليف متقدم على مستوى الرقاقة' },
                            { nameEn: 'CoWoS (TSMC)', description: 'Chip on Wafer on Substrate' },
                            { nameEn: 'SoIC', description: 'System on Integrated Chips' }
                        ]
                    }
                ],
                chipTypes: [
                    { nameAr: 'وحدة معالجة رسومات (GPU)', nameEn: 'Graphics Processing Unit', use: 'تدريب نماذج الذكاء الاصطناعي', leaders: ['NVIDIA', 'AMD', 'Intel'] },
                    { nameAr: 'وحدة معالجة الموتر (TPU)', nameEn: 'Tensor Processing Unit', use: 'حسابات AI المتوازية', leaders: ['Google'] },
                    { nameAr: 'معالج شبكات عصبية (NPU)', nameEn: 'Neural Processing Unit', use: 'استدلال AI على الأجهزة', leaders: ['Qualcomm', 'Apple', 'Huawei'] },
                    { nameAr: 'مسرّع AI مخصص (ASIC)', nameEn: 'AI Accelerator ASIC', use: 'مسرعات مخصصة لأحمال عمل محددة', leaders: ['Cerebras', 'Graphcore', 'SambaNova'] },
                    { nameAr: 'شريحة قابلة للبرمجة (FPGA)', nameEn: 'Field Programmable Gate Array', use: 'تسريع مرن قابل لإعادة البرمجة', leaders: ['Xilinx/AMD', 'Intel/Altera'] },
                    { nameAr: 'معالج حافة ذكي', nameEn: 'Edge AI Processor', use: 'ذكاء اصطناعي على الأجهزة الطرفية', leaders: ['NVIDIA Jetson', 'Google Coral', 'Intel Movidius'] },
                    { nameAr: 'شريحة شيخة AI', nameEn: 'Sheikha AI Chip', use: 'رقاقة ذكاء اصطناعي سعودية — هدف استراتيجي', status: 'تحت التطوير والتصميم' }
                ],
                rawMaterials: [
                    { nameAr: 'سيليكون عالي النقاء', nameEn: 'Ultra-Pure Silicon', source: 'رمل كوارتز (SiO₂)', purity: '11N (99.999999999%)' },
                    { nameAr: 'عناصر أرضية نادرة', nameEn: 'Rare Earth Elements', types: ['نيوديميوم', 'ديسبروسيوم', 'لانثانوم', 'سيريوم'], source: 'الصين (70% عالمياً)' },
                    { nameAr: 'نحاس عالي النقاء', nameEn: 'High-Purity Copper', use: 'توصيلات كهربائية داخل الرقاقة' },
                    { nameAr: 'ذهب', nameEn: 'Gold', use: 'أسلاك الربط (Wire Bonding)' },
                    { nameAr: 'تنجستن', nameEn: 'Tungsten', use: 'طبقات اتصال معدنية' },
                    { nameAr: 'غاليوم أرسينايد', nameEn: 'Gallium Arsenide (GaAs)', use: 'رقائق اتصالات عالية التردد' },
                    { nameAr: 'نيتريد الغاليوم', nameEn: 'Gallium Nitride (GaN)', use: 'رقائق طاقة عالية الكفاءة' },
                    { nameAr: 'كربيد السيليكون', nameEn: 'Silicon Carbide (SiC)', use: 'إلكترونيات الطاقة' },
                    { nameAr: 'غازات عالية النقاء', nameEn: 'Ultra-Pure Gases', types: ['نيتروجين', 'أرغون', 'هيليوم', 'هيدروجين'], use: 'بيئة التصنيع' },
                    { nameAr: 'كيماويات فوتوريزيست', nameEn: 'Photoresist Chemicals', source: 'JSR، Tokyo Ohka (اليابان)', use: 'الطباعة الضوئية' }
                ]
            },

            // ══════════════════════════════════════════════════════
            // المصنع ٢: تصنيع خوادم وبنية تحتية AI
            // ══════════════════════════════════════════════════════
            aiServerFactory: {
                nameAr: 'مصنع شيخة لخوادم الذكاء الاصطناعي',
                nameEn: 'Sheikha AI Server Factory',
                description: 'تصنيع خوادم وبنية تحتية لمراكز البيانات',
                serverComponents: [
                    { nameAr: 'لوحات دوائر مطبوعة (PCB)', nameEn: 'Printed Circuit Boards', layers: '12-30 طبقة', material: 'FR-4 / Rogers' },
                    { nameAr: 'وحدات GPU/TPU', nameEn: 'AI Accelerator Modules', examples: ['NVIDIA H100/H200/B200', 'AMD MI300', 'Intel Gaudi'] },
                    { nameAr: 'ذاكرة عالية النطاق (HBM)', nameEn: 'High Bandwidth Memory', types: ['HBM2e', 'HBM3', 'HBM3e'], suppliers: ['SK Hynix', 'Samsung', 'Micron'] },
                    { nameAr: 'ذاكرة DDR5', nameEn: 'DDR5 RAM', capacity: '256GB - 2TB لكل خادم' },
                    { nameAr: 'تخزين NVMe SSD', nameEn: 'NVMe SSD Storage', types: ['PCIe Gen5', 'CXL Memory'] },
                    { nameAr: 'شبكات عالية السرعة', nameEn: 'High-Speed Networking', types: ['InfiniBand 400Gbps', 'Ethernet 800GbE', 'NVLink', 'NVSwitch'] },
                    { nameAr: 'وحدات طاقة', nameEn: 'Power Supply Units', efficiency: '80+ Titanium', power: '3000-6000W لكل خادم AI' },
                    { nameAr: 'نظام تبريد', nameEn: 'Cooling System', types: ['تبريد سائل مباشر (DLC)', 'تبريد غمري (Immersion)', 'تبريد خلفي (Rear-Door)'] },
                    { nameAr: 'هيكل وحاوية', nameEn: 'Chassis & Enclosure', material: 'ألمنيوم/صلب', standards: 'Open Compute Project (OCP)' }
                ],
                serverTypes: [
                    { nameAr: 'خادم تدريب AI', nameEn: 'AI Training Server', gpus: '8x GPU', use: 'تدريب النماذج الكبيرة (LLM)', example: 'NVIDIA DGX H100' },
                    { nameAr: 'خادم استدلال AI', nameEn: 'AI Inference Server', gpus: '2-4x GPU', use: 'تشغيل النماذج للمستخدمين', example: 'NVIDIA HGX Inference' },
                    { nameAr: 'خادم حوسبة حافة', nameEn: 'Edge AI Server', gpus: '1-2x GPU', use: 'AI قريب من المصدر', example: 'NVIDIA EGX' },
                    { nameAr: 'عقدة حوسبة فائقة', nameEn: 'HPC Compute Node', gpus: '8x GPU + NVLink', use: 'محاكاة علمية + AI', example: 'Supermicro GPU Server' },
                    { nameAr: 'خادم تخزين AI', nameEn: 'AI Storage Server', capacity: 'PB-scale', use: 'تخزين بيانات التدريب', example: 'VAST Data / WekaIO' }
                ],
                assemblyProcess: [
                    'استلام وفحص المكونات (IQC)',
                    'تجميع PCB (SMT Soldering)',
                    'تركيب المعالجات والذاكرة',
                    'تركيب وحدات GPU/Accelerator',
                    'تركيب وحدات الشبكة (NIC)',
                    'تركيب التخزين (SSD/NVMe)',
                    'تركيب نظام التبريد',
                    'توصيل الكابلات الداخلية',
                    'اختبار التشغيل الأولي (POST)',
                    'تحميل البرمجيات الثابتة (Firmware/BIOS)',
                    'اختبار الحمل (Stress Test) — 72 ساعة',
                    'فحص الجودة النهائي',
                    'التغليف والشحن'
                ]
            },

            // ══════════════════════════════════════════════════════
            // المصنع ٣: تصنيع مراكز البيانات
            // ══════════════════════════════════════════════════════
            dataCenterFactory: {
                nameAr: 'مصنع شيخة لمراكز البيانات',
                nameEn: 'Sheikha Data Center Factory',
                description: 'تصنيع وتجهيز مراكز بيانات ذكية لأحمال عمل AI',
                components: [
                    { nameAr: 'خزائن الخوادم (Racks)', nameEn: 'Server Racks', standard: '42U/48U/52U', power: '30-100kW لكل خزانة AI' },
                    { nameAr: 'نظام توزيع الطاقة', nameEn: 'Power Distribution (PDU)', types: ['UPS', 'ATS', 'Busway', 'Battery Backup'] },
                    { nameAr: 'نظام تبريد مركزي', nameEn: 'Data Center Cooling', types: ['CRAC/CRAH', 'تبريد سائل مباشر', 'غمري', 'Free Cooling'] },
                    { nameAr: 'شبكة مركز البيانات', nameEn: 'DC Network Fabric', types: ['Spine-Leaf', 'Fat-Tree', 'Clos Network'], speeds: ['400GbE', '800GbE'] },
                    { nameAr: 'نظام إطفاء', nameEn: 'Fire Suppression', types: ['FM-200', 'Novec 1230', 'Inert Gas'] },
                    { nameAr: 'نظام أمن فيزيائي', nameEn: 'Physical Security', types: ['بيومتري', 'CCTV', 'تحكم وصول', 'حراسة'] },
                    { nameAr: 'نظام مراقبة (DCIM)', nameEn: 'DC Infrastructure Management', use: 'مراقبة الطاقة والحرارة والأداء' }
                ],
                tiers: [
                    { tier: 'Tier I', availability: '99.671%', downtime: '28.8 ساعة/سنة', redundancy: 'لا توجد' },
                    { tier: 'Tier II', availability: '99.741%', downtime: '22 ساعة/سنة', redundancy: 'جزئية' },
                    { tier: 'Tier III', availability: '99.982%', downtime: '1.6 ساعة/سنة', redundancy: 'كاملة (N+1)' },
                    { tier: 'Tier IV', availability: '99.995%', downtime: '0.4 ساعة/سنة', redundancy: 'كاملة (2N+1)' }
                ],
                aiSpecific: {
                    powerPerRack: '30-100 kW (مقابل 5-10 kW تقليدي)',
                    coolingChallenge: 'يتطلب تبريد سائل بسبب الحرارة العالية لوحدات GPU',
                    networkBandwidth: '> 400Gbps لكل خادم لتدريب النماذج الموزعة',
                    storage: 'PB-scale عالي السرعة لبيانات التدريب',
                    pue: 'كفاءة استخدام الطاقة (PUE) هدف ≤ 1.1'
                }
            },

            // ══════════════════════════════════════════════════════
            // المصنع ٤: تصنيع الروبوتات
            // ══════════════════════════════════════════════════════
            roboticsFactory: {
                nameAr: 'مصنع شيخة للروبوتات',
                nameEn: 'Sheikha Robotics Factory',
                categories: [
                    {
                        nameAr: 'روبوتات صناعية',
                        nameEn: 'Industrial Robots',
                        types: ['مفصلي 6-7 محاور', 'SCARA', 'دلتا', 'ديكارتي', 'تعاوني (Cobot)'],
                        applications: ['لحام', 'طلاء', 'تجميع', 'فرز', 'قطع', 'فحص'],
                        components: ['محركات سيرفو', 'مخفضات سرعة (Harmonic/Cycloidal)', 'حساسات قوة/عزم', 'وحدة تحكم', 'أداة نهاية (End Effector)']
                    },
                    {
                        nameAr: 'روبوتات خدمية',
                        nameEn: 'Service Robots',
                        types: ['روبوت استقبال', 'روبوت توصيل', 'روبوت تنظيف', 'روبوت مرافق صحي'],
                        components: ['LiDAR', 'كاميرات عمق', 'مكبرات صوت/مايكروفون', 'شاشة تفاعلية', 'بطارية']
                    },
                    {
                        nameAr: 'طائرات مسيّرة (درونز)',
                        nameEn: 'Drones / UAVs',
                        types: ['توصيل', 'مراقبة', 'زراعية', 'صناعية', 'بحث وإنقاذ'],
                        components: ['محركات BLDC', 'مراوح', 'وحدة طيران (FC)', 'GPS/RTK', 'كاميرا', 'بطارية LiPo']
                    },
                    {
                        nameAr: 'مركبات ذاتية القيادة (AGV/AMR)',
                        nameEn: 'Autonomous Guided Vehicles',
                        types: ['AGV (مسار ثابت)', 'AMR (تنقل حر)', 'فوركليفت ذاتي'],
                        use: 'نقل المواد في المصانع والمستودعات'
                    },
                    {
                        nameAr: 'روبوتات بشرية الشكل (Humanoid)',
                        nameEn: 'Humanoid Robots',
                        examples: ['Tesla Optimus', 'Figure 01', 'Boston Dynamics Atlas'],
                        use: 'عمل متعدد المهام يحاكي الإنسان'
                    }
                ],
                aiIntegration: [
                    { nameAr: 'رؤية حاسوبية', nameEn: 'Computer Vision', use: 'فحص جودة بصري، تعرف على الأجسام' },
                    { nameAr: 'تعلم معزز', nameEn: 'Reinforcement Learning', use: 'تدريب الروبوت على مهام جديدة' },
                    { nameAr: 'معالجة لغة طبيعية', nameEn: 'NLP', use: 'أوامر صوتية وتفاعل بشري' },
                    { nameAr: 'تخطيط مسار', nameEn: 'Path Planning (SLAM)', use: 'تنقل ذاتي وتجنب عقبات' },
                    { nameAr: 'التحكم التكيفي', nameEn: 'Adaptive Control', use: 'ضبط الحركة حسب البيئة' }
                ]
            },

            // ══════════════════════════════════════════════════════
            // المصنع ٥: تصنيع الحساسات وأجهزة IoT
            // ══════════════════════════════════════════════════════
            sensorIoTFactory: {
                nameAr: 'مصنع شيخة للحساسات وأجهزة إنترنت الأشياء',
                nameEn: 'Sheikha Sensor & IoT Device Factory',
                sensorTypes: [
                    { nameAr: 'حساس حرارة', nameEn: 'Temperature Sensor', types: ['Thermocouple', 'RTD', 'Thermistor', 'IR'] },
                    { nameAr: 'حساس ضغط', nameEn: 'Pressure Sensor', types: ['Piezoelectric', 'Capacitive', 'Strain Gauge'] },
                    { nameAr: 'مقياس تسارع', nameEn: 'Accelerometer', types: ['MEMS', 'Piezoelectric'] },
                    { nameAr: 'جيروسكوب', nameEn: 'Gyroscope', types: ['MEMS', 'Fiber Optic', 'Ring Laser'] },
                    { nameAr: 'حساس قرب', nameEn: 'Proximity Sensor', types: ['Inductive', 'Capacitive', 'Ultrasonic', 'Photoelectric'] },
                    { nameAr: 'حساس رطوبة', nameEn: 'Humidity Sensor', types: ['Capacitive', 'Resistive'] },
                    { nameAr: 'حساس غاز', nameEn: 'Gas Sensor', types: ['Electrochemical', 'Catalytic', 'Semiconductor', 'IR'] },
                    { nameAr: 'كاميرا ذكية', nameEn: 'Smart Camera', types: ['RGB', 'Depth', 'Thermal', 'Multispectral'] },
                    { nameAr: 'LiDAR', nameEn: 'Light Detection and Ranging', types: ['Mechanical', 'Solid-State', 'MEMS'] },
                    { nameAr: 'رادار', nameEn: 'Radar Sensor', types: ['mmWave', 'FMCW'] }
                ],
                iotDevices: [
                    { nameAr: 'بوابة IoT', nameEn: 'IoT Gateway', function: 'جمع وإرسال بيانات الحساسات' },
                    { nameAr: 'وحدة حوسبة حافة', nameEn: 'Edge Compute Module', function: 'معالجة AI محلية' },
                    { nameAr: 'وحدة اتصال لاسلكي', nameEn: 'Wireless Module', types: ['WiFi 6/7', 'BLE 5', 'LoRa', 'NB-IoT', '5G', 'Zigbee'] },
                    { nameAr: 'وحدة طاقة ذاتية', nameEn: 'Energy Harvesting Module', types: ['شمسي', 'حراري', 'اهتزازي', 'RF'] }
                ]
            },

            // ══════════════════════════════════════════════════════
            // المصنع ٦: تصنيع البرمجيات والنماذج
            // ══════════════════════════════════════════════════════
            aiSoftwareFactory: {
                nameAr: 'مصنع شيخة لبرمجيات الذكاء الاصطناعي',
                nameEn: 'Sheikha AI Software Factory',
                products: [
                    { nameAr: 'نماذج لغوية كبيرة (LLM)', nameEn: 'Large Language Models', examples: ['نموذج شيخة العربي', 'نموذج متعدد اللغات'] },
                    { nameAr: 'نماذج رؤية حاسوبية', nameEn: 'Computer Vision Models', examples: ['فحص جودة', 'أمن ومراقبة', 'طبي'] },
                    { nameAr: 'نماذج معالجة صوت', nameEn: 'Speech/Audio Models', examples: ['تعرف صوتي عربي', 'تحويل نص لكلام', 'تجويد قرآن'] },
                    { nameAr: 'نماذج تنبؤية', nameEn: 'Predictive Models', examples: ['صيانة تنبؤية', 'تنبؤ طلب', 'تسعير'] },
                    { nameAr: 'أنظمة تشغيل AI', nameEn: 'AI Operating Systems', examples: ['نظام تشغيل مصنع ذكي', 'نظام تشغيل روبوت'] },
                    { nameAr: 'منصة MLOps', nameEn: 'MLOps Platform', examples: ['تدريب', 'نشر', 'مراقبة', 'تحديث النماذج'] }
                ],
                frameworks: ['PyTorch', 'TensorFlow', 'JAX', 'ONNX', 'TensorRT', 'OpenVINO', 'CUDA', 'ROCm'],
                datasets: {
                    nameAr: 'بيانات التدريب',
                    types: ['نصوص عربية (ملايين الوثائق)', 'صور صناعية (ملايين الصور)', 'بيانات حساسات (تيرابايت)', 'بيانات صوت عربي', 'بيانات القرآن والسنة'],
                    governance: ['تصنيف البيانات', 'حماية الخصوصية', 'تنظيف وتحقق', 'حقوق الملكية', 'امتثال شرعي']
                }
            }
        };

        // ─────────────────────────────────────────────────────────────────────
        // سلسلة الإمداد واللوجستيات لتصنيع الذكاء الاصطناعي
        // ─────────────────────────────────────────────────────────────────────
        this.aiManufacturingSupplyChain = {
            nameAr: 'سلسلة إمداد تصنيع الذكاء الاصطناعي',
            nameEn: 'AI Manufacturing Supply Chain',
            tiers: [
                {
                    tier: 'المستوى ١ — المواد الخام',
                    nameEn: 'Tier 1 — Raw Materials',
                    items: [
                        { material: 'سيليكون (رمل كوارتز)', sources: ['الصين', 'روسيا', 'البرازيل', 'النرويج'], criticality: 'عالية جداً' },
                        { material: 'عناصر أرضية نادرة', sources: ['الصين (70%)', 'أستراليا', 'ميانمار'], criticality: 'حرجة' },
                        { material: 'غاليوم', sources: ['الصين (80%)', 'ألمانيا', 'اليابان'], criticality: 'حرجة' },
                        { material: 'جرمانيوم', sources: ['الصين (60%)', 'كندا'], criticality: 'حرجة' },
                        { material: 'نحاس', sources: ['تشيلي', 'بيرو', 'الصين', 'الكونغو'], criticality: 'عالية' },
                        { material: 'كوبالت', sources: ['الكونغو (70%)', 'أستراليا', 'الفلبين'], criticality: 'عالية' },
                        { material: 'ليثيوم (بطاريات)', sources: ['أستراليا', 'تشيلي', 'الصين'], criticality: 'عالية' },
                        { material: 'نيون (ليثوغرافيا)', sources: ['أوكرانيا', 'الصين'], criticality: 'حرجة' },
                        { material: 'بلاديوم', sources: ['روسيا', 'جنوب أفريقيا'], criticality: 'متوسطة' }
                    ]
                },
                {
                    tier: 'المستوى ٢ — المكونات المصنعة',
                    nameEn: 'Tier 2 — Manufactured Components',
                    items: [
                        { component: 'رقاقات سيليكون', suppliers: ['SUMCO (اليابان)', 'Shin-Etsu (اليابان)', 'Siltronic (ألمانيا)'] },
                        { component: 'كيماويات إلكترونية', suppliers: ['JSR (اليابان)', 'Shin-Etsu', 'DuPont', 'Merck'] },
                        { component: 'لوحات PCB', suppliers: ['Unimicron (تايوان)', 'TTM (أمريكا)', 'Ibiden (اليابان)'] },
                        { component: 'ذاكرة HBM/DDR', suppliers: ['SK Hynix (كوريا)', 'Samsung (كوريا)', 'Micron (أمريكا)'] },
                        { component: 'مكثفات MLCC', suppliers: ['Murata (اليابان)', 'Samsung Electro-Mechanics', 'TDK'] },
                        { component: 'موصلات', suppliers: ['TE Connectivity', 'Amphenol', 'Molex'] }
                    ]
                },
                {
                    tier: 'المستوى ٣ — التصنيع والتجميع',
                    nameEn: 'Tier 3 — Fabrication & Assembly',
                    items: [
                        { process: 'تصنيع الرقائق (Foundry)', suppliers: ['TSMC (تايوان)', 'Samsung (كوريا)', 'Intel (أمريكا)', 'GlobalFoundries'] },
                        { process: 'تغليف واختبار (OSAT)', suppliers: ['ASE (تايوان)', 'Amkor (أمريكا)', 'JCET (الصين)'] },
                        { process: 'تجميع خوادم', suppliers: ['Foxconn', 'Wistron', 'Quanta', 'Supermicro'] },
                        { process: 'تصنيع معدات شبكة', suppliers: ['Mellanox/NVIDIA', 'Arista', 'Cisco'] }
                    ]
                },
                {
                    tier: 'المستوى ٤ — التكامل والتسليم',
                    nameEn: 'Tier 4 — Integration & Delivery',
                    items: [
                        { process: 'تكامل أنظمة AI', providers: ['NVIDIA', 'Dell', 'HPE', 'Lenovo', 'IBM'] },
                        { process: 'بناء مراكز بيانات', providers: ['Equinix', 'Digital Realty', 'AWS', 'Google', 'Microsoft'] },
                        { process: 'نشر وتشغيل', providers: ['فرق DevOps/MLOps', 'مزودو سحابة', 'فرق محلية'] }
                    ]
                }
            ],
            logistics: {
                nameAr: 'لوجستيات تصنيع AI',
                nameEn: 'AI Manufacturing Logistics',
                specialRequirements: [
                    { nameAr: 'غرف نظيفة', nameEn: 'Cleanroom Logistics', description: 'نقل رقاقات في بيئة خالية من الجسيمات' },
                    { nameAr: 'مكافحة الكهرباء الساكنة', nameEn: 'ESD Protection', description: 'تغليف ونقل بحماية كهروستاتيكية (ESD bags, wrist straps)' },
                    { nameAr: 'تحكم بالحرارة', nameEn: 'Temperature Control', description: 'نقل مكونات حساسة (5-35°C)' },
                    { nameAr: 'التتبع الفوري', nameEn: 'Real-Time Tracking', description: 'GPS + IoT لكل شحنة' },
                    { nameAr: 'تأمين عالي', nameEn: 'High Security', description: 'حراسة وتأمين شحنات عالية القيمة' },
                    { nameAr: 'نقل جوي سريع', nameEn: 'Air Freight Priority', description: 'الشحن الجوي هو المفضل للرقائق المتقدمة' },
                    { nameAr: 'جمارك مسرّعة', nameEn: 'Expedited Customs', description: 'معالجة جمركية سريعة للمكونات الحرجة' }
                ],
                routes: [
                    { from: 'تايوان (TSMC)', to: 'مصانع شيخة (السعودية)', mode: 'جوي', content: 'رقائق AI' },
                    { from: 'كوريا (SK Hynix)', to: 'مصانع شيخة', mode: 'جوي', content: 'ذاكرة HBM' },
                    { from: 'أمريكا (NVIDIA)', to: 'مصانع شيخة', mode: 'جوي', content: 'وحدات GPU' },
                    { from: 'اليابان (Shin-Etsu)', to: 'مصانع شيخة', mode: 'بحري+بري', content: 'رقاقات سيليكون' },
                    { from: 'ألمانيا (ASML)', to: 'مصانع شيخة', mode: 'جوي خاص', content: 'معدات ليثوغرافيا' },
                    { from: 'مصانع شيخة', to: 'مراكز بيانات شيخة', mode: 'بري', content: 'خوادم AI جاهزة' },
                    { from: 'مصانع شيخة', to: 'العالم', mode: 'بحري+جوي', content: 'منتجات AI للتصدير' }
                ],
                warehousing: [
                    { nameAr: 'مستودع مكونات إلكترونية', nameEn: 'Electronic Components Warehouse', conditions: 'تحكم حرارة + مكافحة ESD' },
                    { nameAr: 'مستودع رقائق', nameEn: 'Wafer/Die Storage', conditions: 'غرفة نظيفة ISO 6' },
                    { nameAr: 'مستودع خوادم جاهزة', nameEn: 'Finished Server Storage', conditions: 'تحكم حرارة + حماية فيزيائية' },
                    { nameAr: 'مستودع مواد كيميائية', nameEn: 'Chemical Storage', conditions: 'تهوية + مكافحة حريق + فصل المواد' },
                    { nameAr: 'مستودع قطع غيار', nameEn: 'Spare Parts Warehouse', conditions: 'JIT + كانبان' }
                ]
            },
            risks: {
                nameAr: 'مخاطر سلسلة إمداد AI',
                nameEn: 'AI Supply Chain Risks',
                categories: [
                    { nameAr: 'مخاطر جيوسياسية', nameEn: 'Geopolitical', examples: ['حصار تصدير رقائق', 'عقوبات', 'حرب تجارية'] },
                    { nameAr: 'تركز الموردين', nameEn: 'Supplier Concentration', examples: ['TSMC (90% رقائق متقدمة)', 'ASML (100% EUV)', 'الصين (70% أرض نادرة)'] },
                    { nameAr: 'كوارث طبيعية', nameEn: 'Natural Disasters', examples: ['زلازل تايوان', 'فيضانات', 'جفاف يؤثر على Fabs'] },
                    { nameAr: 'أمن سيبراني', nameEn: 'Cybersecurity', examples: ['هجمات على أنظمة التصنيع', 'سرقة تصاميم الرقائق'] },
                    { nameAr: 'نقص مواد', nameEn: 'Material Shortage', examples: ['نقص نيون 2022', 'نقص رقائق 2020-2023'] }
                ],
                mitigation: [
                    'تنويع مصادر التوريد',
                    'بناء مخزون استراتيجي للمواد الحرجة',
                    'الاستثمار في تصنيع محلي سعودي',
                    'شراكات استراتيجية مع دول صديقة',
                    'بحث وتطوير بدائل للمواد الحرجة',
                    'تأمين شامل على سلسلة الإمداد'
                ]
            }
        };

        // ─────────────────────────────────────────────────────────────────────
        // الضوابط الشرعية لتصنيع الذكاء الاصطناعي
        // ─────────────────────────────────────────────────────────────────────
        // ─────────────────────────────────────────────────────────────────────
        // منظومة إنتاج أنظمة وتقنيات وبرمجيات الذكاء الاصطناعي
        // ─────────────────────────────────────────────────────────────────────
        this.aiSystemsProduction = {
            nameAr: 'منظومة شيخة لإنتاج أنظمة وتقنيات وبرمجيات الذكاء الاصطناعي',
            nameEn: 'Sheikha AI Systems, Technologies & Software Production',
            motto: 'وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ وَرَسُولُهُ وَالْمُؤْمِنُونَ — التوبة ١٠٥',

            // ═══ أنظمة الذكاء الاصطناعي ═══
            aiSystems: [
                {
                    nameAr: 'نظام الذكاء الاصطناعي التوليدي',
                    nameEn: 'Generative AI System',
                    components: ['نماذج لغوية كبيرة (LLM)', 'نماذج توليد صور (Diffusion)', 'نماذج توليد فيديو', 'نماذج توليد صوت', 'نماذج توليد كود برمجي'],
                    sheikhaProducts: ['شيخة LLM العربي', 'شيخة Vision', 'شيخة Code', 'شيخة Voice'],
                    infrastructure: ['GPU Clusters (H100/B200)', 'تخزين PB-scale', 'شبكة InfiniBand', 'MLOps Pipeline']
                },
                {
                    nameAr: 'نظام الرؤية الحاسوبية',
                    nameEn: 'Computer Vision System',
                    capabilities: ['تصنيف صور', 'كشف أجسام', 'تجزئة دلالية', 'تتبع فيديو', 'التعرف على الوجوه', 'OCR عربي', 'فحص جودة صناعي'],
                    models: ['YOLO', 'Vision Transformer (ViT)', 'SAM', 'CLIP', 'Stable Diffusion'],
                    sheikhaProducts: ['شيخة للفحص الصناعي البصري', 'شيخة لقراءة المستندات العربية', 'شيخة للمراقبة الذكية']
                },
                {
                    nameAr: 'نظام معالجة اللغة الطبيعية',
                    nameEn: 'NLP System',
                    capabilities: ['فهم النص العربي', 'تلخيص', 'ترجمة', 'تحليل مشاعر', 'استخلاص معلومات', 'إجابة أسئلة', 'توليد نص'],
                    specialArabic: ['معالجة الصرف العربي', 'تشكيل النصوص', 'فهم اللهجات', 'تحليل النصوص الشرعية', 'تجويد القرآن'],
                    sheikhaProducts: ['شيخة للعربية الفصحى', 'شيخة لتفسير القرآن الذكي', 'شيخة لتحليل الأحاديث']
                },
                {
                    nameAr: 'نظام التعلم المعزز',
                    nameEn: 'Reinforcement Learning System',
                    applications: ['تحسين سلاسل الإمداد', 'تحكم بالروبوتات', 'تحسين الطاقة', 'ألعاب استراتيجية', 'قيادة ذاتية', 'تداول ذكي'],
                    algorithms: ['PPO', 'SAC', 'DQN', 'A3C', 'RLHF (تعلم من التغذية البشرية)'],
                    sheikhaProducts: ['شيخة لتحسين المصانع الذكية', 'شيخة للتداول الحلال']
                },
                {
                    nameAr: 'نظام التعلم الآلي التنبؤي',
                    nameEn: 'Predictive ML System',
                    capabilities: ['تنبؤ مبيعات', 'تنبؤ أعطال', 'تنبؤ طلب', 'تنبؤ أسعار', 'تصنيف عملاء', 'كشف احتيال', 'تقييم مخاطر'],
                    algorithms: ['Random Forest', 'XGBoost', 'LightGBM', 'Neural Networks', 'Time Series (Prophet, ARIMA)'],
                    sheikhaProducts: ['شيخة للتنبؤ التجاري', 'شيخة لإدارة المخاطر الشرعية']
                },
                {
                    nameAr: 'نظام الذكاء الاصطناعي للحافة',
                    nameEn: 'Edge AI System',
                    capabilities: ['استدلال فوري على الجهاز', 'خصوصية بيانات كاملة', 'عمل بدون إنترنت', 'زمن استجابة < 10ms'],
                    hardware: ['NVIDIA Jetson', 'Google Coral', 'Intel Movidius', 'Qualcomm AI Engine', 'Apple Neural Engine'],
                    sheikhaProducts: ['شيخة Edge للمصانع', 'شيخة Edge للمركبات', 'شيخة Edge للأجهزة المنزلية']
                },
                {
                    nameAr: 'نظام الذكاء الجماعي (Multi-Agent)',
                    nameEn: 'Multi-Agent AI System',
                    capabilities: ['تنسيق بين وكلاء AI متعددين', 'حل مشاكل معقدة تعاونياً', 'محاكاة أنظمة معقدة'],
                    sheikhaProducts: ['شيخة للمصنع الذاتي التشغيل', 'شيخة لسلسلة الإمداد الذكية']
                },
                {
                    nameAr: 'نظام الروبوتات الذكية',
                    nameEn: 'Intelligent Robotics System',
                    capabilities: ['تنقل ذاتي', 'مسك وتلاعب', 'تعاون بشر-آلة', 'تعلم من العرض', 'تخطيط مهام'],
                    sheikhaProducts: ['شيخة روبوت الصناعي', 'شيخة روبوت الخدمي', 'شيخة درون']
                }
            ],

            // ═══ تقنيات الذكاء الاصطناعي الأساسية ═══
            aiCoreTechnologies: {
                machineLearning: {
                    nameAr: 'التعلم الآلي',
                    nameEn: 'Machine Learning',
                    types: [
                        { nameAr: 'تعلم خاضع للإشراف', nameEn: 'Supervised Learning', algorithms: ['Linear/Logistic Regression', 'SVM', 'Decision Trees', 'Random Forest', 'Neural Networks'] },
                        { nameAr: 'تعلم غير خاضع للإشراف', nameEn: 'Unsupervised Learning', algorithms: ['K-Means', 'DBSCAN', 'PCA', 'Autoencoders', 'GAN'] },
                        { nameAr: 'تعلم شبه خاضع', nameEn: 'Semi-Supervised Learning', algorithms: ['Self-Training', 'Co-Training', 'Label Propagation'] },
                        { nameAr: 'تعلم معزز', nameEn: 'Reinforcement Learning', algorithms: ['Q-Learning', 'DQN', 'PPO', 'SAC', 'A3C'] },
                        { nameAr: 'تعلم انتقالي', nameEn: 'Transfer Learning', description: 'نقل المعرفة من نموذج لآخر' },
                        { nameAr: 'تعلم موحد', nameEn: 'Federated Learning', description: 'تدريب موزع بدون مشاركة البيانات' }
                    ]
                },
                deepLearning: {
                    nameAr: 'التعلم العميق',
                    nameEn: 'Deep Learning',
                    architectures: [
                        { nameEn: 'CNN', nameAr: 'شبكة التفافية', use: 'صور وفيديو' },
                        { nameEn: 'RNN/LSTM/GRU', nameAr: 'شبكة تكرارية', use: 'تسلسلات زمنية ونصوص' },
                        { nameEn: 'Transformer', nameAr: 'المحول', use: 'لغة وصور ومتعدد الوسائط' },
                        { nameEn: 'GAN', nameAr: 'شبكة توليدية تنافسية', use: 'توليد صور وبيانات' },
                        { nameEn: 'Diffusion Model', nameAr: 'نموذج انتشاري', use: 'توليد صور عالية الجودة' },
                        { nameEn: 'Graph Neural Network', nameAr: 'شبكة رسم بياني', use: 'بيانات علائقية وجزيئات' },
                        { nameEn: 'State Space Model (Mamba)', nameAr: 'نموذج فضاء الحالة', use: 'تسلسلات طويلة بكفاءة' },
                        { nameEn: 'Mixture of Experts (MoE)', nameAr: 'خليط الخبراء', use: 'نماذج كبيرة بكفاءة حسابية' }
                    ]
                },
                foundationModels: {
                    nameAr: 'النماذج الأساسية',
                    nameEn: 'Foundation Models',
                    types: [
                        { nameAr: 'نماذج لغوية', nameEn: 'Language Models', examples: ['GPT-4/5', 'Claude', 'Gemini', 'Llama', 'Mistral', 'Jais (عربي)'] },
                        { nameAr: 'نماذج رؤية', nameEn: 'Vision Models', examples: ['CLIP', 'DINO', 'SAM', 'Florence'] },
                        { nameAr: 'نماذج متعددة الوسائط', nameEn: 'Multimodal Models', examples: ['GPT-4V', 'Gemini Ultra', 'Claude Vision'] },
                        { nameAr: 'نماذج كود', nameEn: 'Code Models', examples: ['Codex', 'StarCoder', 'CodeLlama', 'DeepSeek Coder'] },
                        { nameAr: 'نماذج علمية', nameEn: 'Scientific Models', examples: ['AlphaFold', 'GNoME', 'MedPaLM'] }
                    ]
                },
                aiInfrastructure: {
                    nameAr: 'البنية التحتية للذكاء الاصطناعي',
                    nameEn: 'AI Infrastructure',
                    layers: [
                        { nameAr: 'طبقة الحوسبة', nameEn: 'Compute Layer', components: ['GPU Clusters', 'TPU Pods', 'CPU Farms', 'FPGA Arrays'] },
                        { nameAr: 'طبقة التخزين', nameEn: 'Storage Layer', components: ['Object Storage (S3)', 'File Systems (Lustre/GPFS)', 'Vector DB', 'Data Lake'] },
                        { nameAr: 'طبقة الشبكة', nameEn: 'Network Layer', components: ['InfiniBand 400Gbps', 'RoCE', 'NVLink/NVSwitch'] },
                        { nameAr: 'طبقة البرمجيات', nameEn: 'Software Layer', components: ['CUDA/ROCm', 'PyTorch/TensorFlow', 'Ray/Horovod', 'Kubernetes'] },
                        { nameAr: 'طبقة MLOps', nameEn: 'MLOps Layer', components: ['MLflow', 'Weights & Biases', 'DVC', 'Seldon', 'BentoML'] },
                        { nameAr: 'طبقة الخدمة', nameEn: 'Serving Layer', components: ['TensorRT', 'vLLM', 'Triton', 'TorchServe'] }
                    ]
                }
            },

            // ═══ برمجيات الذكاء الاصطناعي ═══
            aiSoftwareProducts: {
                platforms: [
                    {
                        nameAr: 'منصة شيخة AI السحابية',
                        nameEn: 'Sheikha AI Cloud Platform',
                        services: [
                            { nameAr: 'AI كخدمة', nameEn: 'AI as a Service (AIaaS)', description: 'واجهات API لنماذج AI جاهزة' },
                            { nameAr: 'ML كخدمة', nameEn: 'ML as a Service (MLaaS)', description: 'تدريب ونشر نماذج مخصصة' },
                            { nameAr: 'بيانات كخدمة', nameEn: 'Data as a Service (DaaS)', description: 'بيانات تدريب منسقة وحلال' },
                            { nameAr: 'حوسبة كخدمة', nameEn: 'Compute as a Service', description: 'استئجار GPU/TPU لتدريب النماذج' }
                        ]
                    },
                    {
                        nameAr: 'منصة شيخة للتصنيع الذكي',
                        nameEn: 'Sheikha Smart Manufacturing Platform',
                        modules: ['رؤية حاسوبية للجودة', 'صيانة تنبؤية', 'تحسين إنتاج', 'سلامة ذكية', 'توأم رقمي', 'إدارة طاقة AI']
                    },
                    {
                        nameAr: 'منصة شيخة للتجارة الذكية',
                        nameEn: 'Sheikha Smart Commerce Platform',
                        modules: ['توصيات منتجات حلال', 'تسعير ذكي', 'إدارة مخزون AI', 'خدمة عملاء AI', 'تحليل سوق']
                    },
                    {
                        nameAr: 'منصة شيخة للعلوم الإسلامية AI',
                        nameEn: 'Sheikha Islamic Sciences AI Platform',
                        modules: ['مساعد فقهي ذكي', 'تحليل أحاديث', 'تفسير قرآني', 'بحث شرعي ذكي', 'تجويد آلي', 'تعليم إسلامي تفاعلي']
                    }
                ],
                tools: [
                    { nameAr: 'محرك بحث شيخة الذكي', nameEn: 'Sheikha AI Search Engine', description: 'بحث دلالي متقدم بالعربية' },
                    { nameAr: 'مساعد شيخة الشخصي', nameEn: 'Sheikha Personal AI Assistant', description: 'مساعد AI متعدد المهام' },
                    { nameAr: 'مترجم شيخة AI', nameEn: 'Sheikha AI Translator', description: 'ترجمة فورية عربي ↔ عالمي' },
                    { nameAr: 'محلل بيانات شيخة', nameEn: 'Sheikha Data Analyst', description: 'تحليل بيانات بالأوامر الصوتية' },
                    { nameAr: 'مصمم شيخة AI', nameEn: 'Sheikha AI Designer', description: 'تصميم بالأوامر النصية والصوتية' },
                    { nameAr: 'مبرمج شيخة AI', nameEn: 'Sheikha AI Coder', description: 'توليد كود ومراجعته وتحسينه' }
                ],
                sdks: [
                    { nameEn: 'Sheikha AI SDK — Python', use: 'تطوير تطبيقات AI بالبايثون' },
                    { nameEn: 'Sheikha AI SDK — JavaScript', use: 'تطبيقات ويب ذكية' },
                    { nameEn: 'Sheikha AI SDK — Mobile (iOS/Android)', use: 'تطبيقات جوال ذكية' },
                    { nameEn: 'Sheikha AI SDK — Edge', use: 'تطبيقات AI على الأجهزة الطرفية' },
                    { nameEn: 'Sheikha AI SDK — Robotics (ROS2)', use: 'برمجة روبوتات ذكية' }
                ]
            },

            // ═══ العلوم الأساسية للذكاء الاصطناعي ═══
            aiSciences: {
                mathematics: {
                    nameAr: 'الرياضيات الأساسية للذكاء الاصطناعي',
                    nameEn: 'AI Core Mathematics',
                    branches: [
                        { nameAr: 'الجبر الخطي', nameEn: 'Linear Algebra', topics: ['مصفوفات', 'متجهات', 'تحويلات', 'قيم ذاتية', 'SVD', 'فضاءات متجهة'] },
                        { nameAr: 'التفاضل والتكامل', nameEn: 'Calculus', topics: ['اشتقاق', 'تكامل', 'سلاسل تايلور', 'حساب متعدد المتغيرات', 'Gradient'] },
                        { nameAr: 'الاحتمالات والإحصاء', nameEn: 'Probability & Statistics', topics: ['بايز', 'توزيعات', 'اختبار فرضيات', 'انحدار', 'ارتباط', 'تقدير'] },
                        { nameAr: 'التحسين', nameEn: 'Optimization', topics: ['Gradient Descent', 'Adam', 'SGD', 'برمجة خطية', 'تحسين محدب'] },
                        { nameAr: 'نظرية المعلومات', nameEn: 'Information Theory', topics: ['إنتروبي', 'تشتت KL', 'معلومات متبادلة', 'ضغط بيانات'] },
                        { nameAr: 'الرياضيات المنفصلة', nameEn: 'Discrete Mathematics', topics: ['نظرية الرسم البياني', 'تركيبات', 'منطق', 'خوارزميات'] },
                        { nameAr: 'التحليل العددي', nameEn: 'Numerical Analysis', topics: ['دقة عددية', 'FP16/BF16', 'تكميم (Quantization)'] }
                    ]
                },
                computerScience: {
                    nameAr: 'علوم الحاسب الأساسية',
                    nameEn: 'Computer Science Fundamentals',
                    branches: [
                        { nameAr: 'خوارزميات وهياكل بيانات', nameEn: 'Algorithms & Data Structures' },
                        { nameAr: 'نظم التشغيل', nameEn: 'Operating Systems', relevance: 'إدارة موارد GPU ومعالجة متوازية' },
                        { nameAr: 'معمارية الحاسب', nameEn: 'Computer Architecture', relevance: 'فهم GPU/TPU/NPU' },
                        { nameAr: 'الحوسبة المتوازية والموزعة', nameEn: 'Parallel & Distributed Computing', relevance: 'تدريب نماذج على آلاف GPU' },
                        { nameAr: 'قواعد بيانات', nameEn: 'Databases', relevance: 'تخزين البيانات + Vector DB' },
                        { nameAr: 'شبكات حاسب', nameEn: 'Computer Networks', relevance: 'اتصال بين عقد التدريب' },
                        { nameAr: 'أمن المعلومات', nameEn: 'Information Security', relevance: 'حماية النماذج والبيانات' }
                    ]
                },
                cognitiveSci: {
                    nameAr: 'العلوم المعرفية والإدراكية',
                    nameEn: 'Cognitive Sciences',
                    branches: [
                        { nameAr: 'علم الأعصاب الحسابي', nameEn: 'Computational Neuroscience', relevance: 'إلهام بنى الشبكات العصبية' },
                        { nameAr: 'علم النفس المعرفي', nameEn: 'Cognitive Psychology', relevance: 'فهم التعلم البشري والإدراك' },
                        { nameAr: 'فلسفة العقل', nameEn: 'Philosophy of Mind', relevance: 'أسئلة الوعي والذكاء' },
                        { nameAr: 'اللسانيات الحاسوبية', nameEn: 'Computational Linguistics', relevance: 'معالجة اللغة العربية' }
                    ]
                },
                domainSciences: {
                    nameAr: 'العلوم التطبيقية في خدمة AI',
                    nameEn: 'Domain Sciences for AI',
                    fields: [
                        { nameAr: 'الفيزياء', nameEn: 'Physics', aiApp: 'محاكاة فيزيائية (Physics-Informed Neural Networks)' },
                        { nameAr: 'الكيمياء', nameEn: 'Chemistry', aiApp: 'اكتشاف مواد جديدة ودوائية' },
                        { nameAr: 'الأحياء', nameEn: 'Biology', aiApp: 'AlphaFold للبروتينات، جينوميات' },
                        { nameAr: 'الطب', nameEn: 'Medicine', aiApp: 'تشخيص طبي، اكتشاف أدوية' },
                        { nameAr: 'الاقتصاد', nameEn: 'Economics', aiApp: 'تنبؤ اقتصادي، تحسين أسواق' },
                        { nameAr: 'علوم الأرض', nameEn: 'Earth Sciences', aiApp: 'تنبؤ مناخي، استكشاف موارد' },
                        { nameAr: 'علوم المواد', nameEn: 'Materials Science', aiApp: 'تصميم مواد جديدة للرقائق والبطاريات' }
                    ]
                }
            },

            // ═══ المنهجيات والأطر ═══
            aiMethodologies: {
                development: [
                    { nameEn: 'CRISP-DM', nameAr: 'عملية معيارية لتعدين البيانات', stages: ['فهم الأعمال', 'فهم البيانات', 'إعداد البيانات', 'النمذجة', 'التقييم', 'النشر'] },
                    { nameEn: 'TDSP', nameAr: 'عملية علوم البيانات الجماعية (مايكروسوفت)', stages: ['فهم الأعمال', 'استحواذ بيانات', 'نمذجة', 'نشر', 'قبول عميل'] },
                    { nameEn: 'MLOps', nameAr: 'عمليات التعلم الآلي', stages: ['تطوير', 'تدريب', 'اختبار', 'نشر', 'مراقبة', 'إعادة تدريب'] },
                    { nameEn: 'DataOps', nameAr: 'عمليات البيانات', focus: 'أتمتة خطوط بيانات التدريب' },
                    { nameEn: 'AIOps', nameAr: 'عمليات IT بالذكاء الاصطناعي', focus: 'إدارة البنية التحتية بالذكاء' },
                    { nameEn: 'Responsible AI', nameAr: 'ذكاء اصطناعي مسؤول', pillars: ['العدالة', 'الشفافية', 'المساءلة', 'الخصوصية', 'الأمان', 'الشمولية'] }
                ],
                evaluation: [
                    { nameAr: 'مقاييس التصنيف', nameEn: 'Classification Metrics', metrics: ['Accuracy', 'Precision', 'Recall', 'F1-Score', 'AUC-ROC'] },
                    { nameAr: 'مقاييس الانحدار', nameEn: 'Regression Metrics', metrics: ['MSE', 'RMSE', 'MAE', 'R²'] },
                    { nameAr: 'مقاييس اللغة', nameEn: 'NLP Metrics', metrics: ['BLEU', 'ROUGE', 'Perplexity', 'MMLU', 'HumanEval'] },
                    { nameAr: 'مقاييس الرؤية', nameEn: 'Vision Metrics', metrics: ['mAP', 'IoU', 'FID', 'SSIM'] },
                    { nameAr: 'مقاييس النشر', nameEn: 'Deployment Metrics', metrics: ['Latency', 'Throughput', 'Cost/Token', 'Uptime'] }
                ],
                researchMethodology: {
                    nameAr: 'منهجية البحث العلمي في AI',
                    nameEn: 'AI Research Methodology',
                    steps: [
                        'تحديد المشكلة البحثية',
                        'مراجعة الأدبيات (Literature Review)',
                        'صياغة الفرضية',
                        'تصميم التجربة (Experimental Design)',
                        'جمع وإعداد البيانات',
                        'تطوير النموذج/الخوارزمية',
                        'التدريب والتجريب',
                        'التقييم والمقارنة (Benchmarking)',
                        'تحليل النتائج والاستنتاجات',
                        'كتابة ونشر الورقة العلمية',
                        'مشاركة الكود والبيانات (Open Source)'
                    ],
                    conferences: ['NeurIPS', 'ICML', 'ICLR', 'CVPR', 'ACL', 'EMNLP', 'AAAI', 'IJCAI'],
                    journals: ['Nature Machine Intelligence', 'JMLR', 'IEEE TPAMI', 'AI Journal']
                },
                islamicAIMethodology: {
                    nameAr: 'المنهجية الإسلامية في الذكاء الاصطناعي',
                    nameEn: 'Islamic AI Methodology',
                    principles: [
                        { nameAr: 'التأصيل الشرعي', description: 'كل نظام AI يبدأ بمراجعة شرعية لمقاصده وآلياته' },
                        { nameAr: 'المقاصد الخمس', description: 'حفظ الدين والنفس والعقل والنسل والمال كمعايير تقييم' },
                        { nameAr: 'الإتقان (Quality First)', description: 'إن الله يحب إذا عمل أحدكم عملاً أن يتقنه' },
                        { nameAr: 'الشورى في التطوير', description: 'وَأَمْرُهُمْ شُورَىٰ بَيْنَهُمْ — اتخاذ القرارات بالتشاور' },
                        { nameAr: 'العدل في الخوارزميات', description: 'اختبار التحيز وضمان عدالة النتائج' },
                        { nameAr: 'الأمانة في البيانات', description: 'حماية الخصوصية وعدم الغش في البيانات' },
                        { nameAr: 'النفع لا الضرر', description: 'لا ضرر ولا ضرار — AI لنفع البشرية' },
                        { nameAr: 'الشفافية', description: 'وضوح آليات عمل النماذج (Explainable AI)' },
                        { nameAr: 'التوازن', description: 'وَكَذَٰلِكَ جَعَلْنَاكُمْ أُمَّةً وَسَطًا — توازن بين الابتكار والحذر' },
                        { nameAr: 'السيادة الإسلامية', description: 'بناء قدرات AI محلية لا تعتمد على الغير' }
                    ]
                }
            },

            // ═══ سلسلة إمداد إنتاج البرمجيات والأنظمة ═══
            softwareSupplyChain: {
                nameAr: 'سلسلة إمداد إنتاج برمجيات AI',
                nameEn: 'AI Software Production Supply Chain',
                stages: [
                    { nameAr: 'جمع البيانات', nameEn: 'Data Collection', sources: ['ويب عربي', 'كتب إسلامية', 'وثائق حكومية', 'بيانات صناعية', 'بيانات حساسات'], tools: ['Scrapy', 'Apache NiFi', 'Custom Crawlers'] },
                    { nameAr: 'تنظيف وإعداد البيانات', nameEn: 'Data Cleaning & Preparation', processes: ['تنظيف', 'تطبيع', 'تسمية', 'تقسيم', 'توزيع'], tools: ['Pandas', 'Spark', 'dbt', 'Great Expectations'] },
                    { nameAr: 'تخزين البيانات', nameEn: 'Data Storage', systems: ['Data Lake (S3/HDFS)', 'Data Warehouse', 'Vector DB (Milvus/Pinecone)', 'Feature Store'], tools: ['Delta Lake', 'Iceberg', 'Hudi'] },
                    { nameAr: 'تطوير النماذج', nameEn: 'Model Development', activities: ['بحث وتجريب', 'اختيار معمارية', 'هندسة خصائص', 'تدريب', 'ضبط دقيق'], tools: ['PyTorch', 'Hugging Face', 'LangChain', 'Jupyter'] },
                    { nameAr: 'تدريب على نطاق واسع', nameEn: 'Large-Scale Training', infrastructure: ['GPU Cluster', 'Distributed Training (DeepSpeed/FSDP)', 'Mixed Precision (FP16/BF16)'], cost: '$ ملايين لنماذج LLM كبيرة' },
                    { nameAr: 'تقييم واختبار', nameEn: 'Evaluation & Testing', types: ['اختبار دقة', 'اختبار عدالة', 'اختبار أمان (Red Teaming)', 'اختبار أداء', 'اختبار شرعي'], tools: ['Pytest', 'LM-Eval', 'HumanEval'] },
                    { nameAr: 'تحسين وضغط', nameEn: 'Optimization & Compression', techniques: ['Quantization (INT8/INT4)', 'Pruning', 'Distillation', 'ONNX Export', 'TensorRT'], goal: 'تقليل الحجم وزيادة السرعة' },
                    { nameAr: 'نشر وخدمة', nameEn: 'Deployment & Serving', platforms: ['Kubernetes', 'Docker', 'Triton Inference Server', 'vLLM', 'BentoML'], modes: ['سحابي', 'حافة', 'هجين', 'On-Premise'] },
                    { nameAr: 'مراقبة ومتابعة', nameEn: 'Monitoring & Observability', metrics: ['دقة النموذج', 'زمن الاستجابة', 'تكلفة', 'انحراف بيانات (Data Drift)'], tools: ['Prometheus', 'Grafana', 'Evidently AI', 'WhyLabs'] },
                    { nameAr: 'تحديث وإعادة تدريب', nameEn: 'Update & Retraining', triggers: ['انحراف أداء', 'بيانات جديدة', 'متطلبات جديدة'], pipeline: 'CI/CD for ML — Continuous Training' }
                ],
                humanCapital: {
                    nameAr: 'الكوادر البشرية لإنتاج AI',
                    nameEn: 'AI Production Human Capital',
                    roles: [
                        { nameAr: 'عالم بيانات', nameEn: 'Data Scientist', skills: ['Python', 'ML', 'Statistics', 'Domain Knowledge'] },
                        { nameAr: 'مهندس تعلم آلي', nameEn: 'ML Engineer', skills: ['PyTorch', 'Distributed Training', 'MLOps', 'Cloud'] },
                        { nameAr: 'مهندس بيانات', nameEn: 'Data Engineer', skills: ['Spark', 'Kafka', 'SQL', 'ETL', 'Data Lake'] },
                        { nameAr: 'باحث AI', nameEn: 'AI Researcher', skills: ['Deep Learning', 'Mathematics', 'Paper Writing', 'Innovation'] },
                        { nameAr: 'مهندس MLOps', nameEn: 'MLOps Engineer', skills: ['Docker', 'Kubernetes', 'CI/CD', 'Monitoring'] },
                        { nameAr: 'مهندس بنية تحتية AI', nameEn: 'AI Infrastructure Engineer', skills: ['GPU Management', 'Networking', 'Storage', 'CUDA'] },
                        { nameAr: 'مراجع شرعي AI', nameEn: 'AI Sharia Reviewer', skills: ['فقه', 'أصول', 'مقاصد', 'فهم تقني لـ AI'] },
                        { nameAr: 'مصنف بيانات', nameEn: 'Data Annotator', skills: ['تسمية بيانات', 'RLHF', 'دقة وتركيز'] },
                        { nameAr: 'مختبر AI', nameEn: 'AI QA Tester', skills: ['Red Teaming', 'Bias Testing', 'Performance Testing'] },
                        { nameAr: 'مدير منتج AI', nameEn: 'AI Product Manager', skills: ['استراتيجية', 'تجربة مستخدم', 'أعمال', 'فهم تقني'] }
                    ]
                }
            }
        };

        this.aiManufacturingShariaGuidance = {
            principles: [
                { principle: 'النية الحسنة في التصنيع', evidence: 'إنما الأعمال بالنيات — حديث', application: 'تصنيع AI لنفع البشرية وخدمة الإسلام' },
                { principle: 'الإتقان الواجب', evidence: 'إن الله يحب إذا عمل أحدكم عملاً أن يتقنه — حديث', application: 'أعلى معايير الجودة في كل مرحلة تصنيع' },
                { principle: 'حفظ النفس والعقل', evidence: 'من المقاصد الخمس — حفظ النفس والعقل', application: 'عدم تصنيع AI يضر بالبشر أو يستبدل عقولهم' },
                { principle: 'الأمانة في البيانات', evidence: 'إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا — النساء ٥٨', application: 'حماية بيانات المستخدمين وخصوصيتهم' },
                { principle: 'العدل في الخوارزميات', evidence: 'إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ — النحل ٩٠', application: 'عدم التحيز في نماذج AI' },
                { principle: 'حماية البيئة', evidence: 'وَلَا تُفْسِدُوا فِي الْأَرْضِ — الأعراف ٥٦', application: 'تصنيع مستدام وصديق للبيئة' },
                { principle: 'نفع الأمة', evidence: 'خير الناس أنفعهم للناس — حديث', application: 'توجيه AI لخدمة المجتمع المسلم والبشرية' },
                { principle: 'حقوق العمال', evidence: 'أعطوا الأجير أجره قبل أن يجف عرقه — حديث', application: 'حقوق العاملين في مصانع التقنية' }
            ],
            prohibited: [
                'تصنيع AI لمراقبة المسلمين واضطهادهم',
                'تصنيع أسلحة ذاتية القتل بدون رقابة بشرية',
                'تصنيع AI لتزوير أو غش أو خداع',
                'تصنيع AI لنشر الفحشاء والمنكر',
                'استغلال العمال في ظروف غير إنسانية',
                'تلويث البيئة بنفايات إلكترونية',
                'سرقة ملكية فكرية'
            ]
        };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // getDashboard — لوحة المعلومات الشاملة
    // ═══════════════════════════════════════════════════════════════════════
    getDashboard() {
        return {
            engine: this.name,
            version: this.version,
            owner: this.owner,
            activatedAt: this.activatedAt,
            summary: {
                industrialRevolutions: this.industrialRevolutions.length,
                manufacturingTypes: this.manufacturingTypes.byProcess.length,
                industrialSectors: this.industrialSectors.length,
                formingProcesses: this.manufacturingProcesses.forming.types.length,
                machiningProcesses: this.manufacturingProcesses.machining.types.length,
                joiningProcesses: this.manufacturingProcesses.joining.types.length,
                additiveManufacturingTech: this.manufacturingProcesses.additiveManufacturing.technologies.length,
                qualityStandards: this.qualityManagement.standards.length,
                qualityMethodologies: this.qualityManagement.methodologies.length,
                digitalIndustryDomains: Object.keys(this.digitalIndustry).length,
                robotTypes: this.digitalIndustry.robotics.types.length,
                aiApplications: this.digitalIndustry.aiInManufacturing.applications.length,
                saudiIndustrialCities: this.saudiIndustrialZones.modon.totalCities,
                saudiSEZs: this.saudiIndustrialZones.specialEconomicZones.zones.length,
                safetyDomains: this.industrialSafety.domains.length,
                greenPrinciples: this.greenManufacturing.principles.length,
                emergingTechnologies: Object.keys(this.emergingTech).length,
                saudiRegulators: this.saudiManufacturing.regulators.length,
                saudiTopSectors: this.saudiManufacturing.topSectors.length,
                islamicHeritageInnovations: this.islamicManufacturing.heritage.goldenAge.innovations.length,
                halalSectors: this.islamicManufacturing.halalManufacturing.sectors.length,
                islamicCountries: this.islamicManufacturing.islamicCountriesIndustry.length,
                globalTopCountries: this.globalManufacturing.topCountries.length,
                globalOrganizations: this.globalManufacturing.globalOrganizations.length,
                supplyChainStages: this.manufacturingSupplyChain.stages.length,
                supplyChainModels: this.manufacturingSupplyChain.models.length,
                digitalSCPillars: this.digitalSupplyChain.pillars.length,
                digitalSCTechCategories: Object.keys(this.digitalSupplyChain.technologies).length,
                digitalManufacturingSaudiInitiatives: this.digitalManufacturingFull.saudi.initiatives.length,
                digitalManufacturingGlobalLeaders: this.digitalManufacturingFull.global.leaders.length,
                sheikhaAIFactories: Object.keys(this.sheikhaAIFactories).length - 1,
                aiChipTypes: this.sheikhaAIFactories.semiconductorFactory.chipTypes.length,
                aiServerTypes: this.sheikhaAIFactories.aiServerFactory.serverTypes.length,
                dataCenterTiers: this.sheikhaAIFactories.dataCenterFactory.tiers.length,
                robotCategories: this.sheikhaAIFactories.roboticsFactory.categories.length,
                sensorTypes: this.sheikhaAIFactories.sensorIoTFactory.sensorTypes.length,
                aiSCTiers: this.aiManufacturingSupplyChain.tiers.length,
                aiSCLogisticsRoutes: this.aiManufacturingSupplyChain.logistics.routes.length,
                aiSCRiskCategories: this.aiManufacturingSupplyChain.risks.categories.length,
                aiSystems: this.aiSystemsProduction.aiSystems.length,
                aiCoreTechBranches: Object.keys(this.aiSystemsProduction.aiCoreTechnologies).length,
                aiSoftwarePlatforms: this.aiSystemsProduction.aiSoftwareProducts.platforms.length,
                aiSoftwareTools: this.aiSystemsProduction.aiSoftwareProducts.tools.length,
                aiSDKs: this.aiSystemsProduction.aiSoftwareProducts.sdks.length,
                aiMathBranches: this.aiSystemsProduction.aiSciences.mathematics.branches.length,
                aiCSBranches: this.aiSystemsProduction.aiSciences.computerScience.branches.length,
                aiDomainSciences: this.aiSystemsProduction.aiSciences.domainSciences.fields.length,
                aiMethodologies: this.aiSystemsProduction.aiMethodologies.development.length,
                aiIslamicPrinciples: this.aiSystemsProduction.aiMethodologies.islamicAIMethodology.principles.length,
                aiSoftwareSCStages: this.aiSystemsProduction.softwareSupplyChain.stages.length,
                aiHRRoles: this.aiSystemsProduction.softwareSupplyChain.humanCapital.roles.length,
                aiManufacturingShariaRules: this.aiManufacturingShariaGuidance.principles.length,
                quranReferences: this.quranReferences.length,
                shariaRules: this.shariaGuidance.principles.length
            },
            quranReferences: this.quranReferences,
            industrialRevolutions: this.industrialRevolutions,
            manufacturingTypes: this.manufacturingTypes,
            industrialSectors: this.industrialSectors,
            manufacturingProcesses: this.manufacturingProcesses,
            qualityManagement: this.qualityManagement,
            digitalIndustry: this.digitalIndustry,
            industrialSafety: this.industrialSafety,
            saudiIndustrialZones: this.saudiIndustrialZones,
            greenManufacturing: this.greenManufacturing,
            industrialHR: this.industrialHR,
            industrialKPIs: this.industrialKPIs,
            emergingTech: this.emergingTech,
            saudiManufacturing: this.saudiManufacturing,
            islamicManufacturing: this.islamicManufacturing,
            globalManufacturing: this.globalManufacturing,
            manufacturingSupplyChain: this.manufacturingSupplyChain,
            digitalSupplyChain: this.digitalSupplyChain,
            digitalManufacturingFull: this.digitalManufacturingFull,
            sheikhaAIFactories: this.sheikhaAIFactories,
            aiManufacturingSupplyChain: this.aiManufacturingSupplyChain,
            aiSystemsProduction: this.aiSystemsProduction,
            aiManufacturingShariaGuidance: this.aiManufacturingShariaGuidance,
            shariaGuidance: this.shariaGuidance
        };
    }
}

module.exports = SheikhaIndustryEngine;
