/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║         صانعة شيخة — الجيل الجديد | تكنولوجيا الصناعة                       ║
 * ║   SHEIKHA NEXT-GENERATION MANUFACTURER — Manufacturing Technology Platform  ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "وَعَلَّمْنَاهُ صَنْعَةَ لَبُوسٍ لَّكُمْ لِتُحْصِنَكُم مِّن بَأْسِكُمْ" — الأنبياء:٨٠
 * "صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ"                             — النمل:٨٨
 * "وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ"      — الحديد:٢٥
 * "هُوَ أَنشَأَكُم مِّنَ الْأَرْضِ وَاسْتَعْمَرَكُمْ فِيهَا"                — هود:٦١
 * "إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ" — البيهقي
 *
 * ════════════════════════════════════════════════════════════════════════════════
 *  الهدف:
 *    منصة صانعة شيخة للجيل الجديد — تُمثّل قفزة نوعية في تكنولوجيا الصناعة
 *    تجمع بين: الذكاء الاصطناعي + الصناعة 5.0 + التصنيع الكمي + النانو
 *    + التصنيع الحيوي + التصنيع الفضائي + سوق المصنّعين + الضوابط الشرعية
 *
 *  المكوّنات الجديدة في الجيل الجديد:
 *    1. NextGenTechStack     — مكدّس تقنيات الجيل الجديد (I5.0, Quantum, Nano, Bio, Space)
 *    2. AIManufacturingCore  — نواة الذكاء الاصطناعي الصناعية (توقع، تحسين، تصميم توليدي)
 *    3. ManufacturerMarket   — سوق المصنّعين (ربط الموردين بالمصنّعين بالمشترين)
 *    4. ProductionIntelligence — ذكاء الإنتاج (تحليل OEE، اكتشاف الاختناقات، التنبؤ)
 *    5. MaterialsIntelligence — ذكاء المواد (مواد الجيل الجديد، خصائص، توافر)
 *    6. ShariaManufacturing  — الضوابط الشرعية الصناعية الشاملة
 *
 * المالك: سلمان أحمد بن سلمان الراجح — منظومة شيخة
 * ════════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const EventEmitter = require('events');
const crypto       = require('crypto');

const VERSION = '1.0.0';

// ─── دمج الشبكة العصبية الصناعية ─────────────────────────────────────────────
let industrialNN = null;
try {
    const nnMod = require('./sheikha-industrial-neural-network');
    industrialNN = nnMod.engine;
} catch (_) { /* اختياري */ }

// ─── دمج محرك الصناعة ────────────────────────────────────────────────────────
let industryEngine = null;
try {
    const ie = require('./sheikha-industry-engine');
    industryEngine = typeof ie === 'object' ? ie : null;
} catch (_) { /* اختياري */ }

// ═══════════════════════════════════════════════════════════════════════════════
// 1. مكدّس تقنيات الجيل الجديد — NEXT-GENERATION TECHNOLOGY STACK
// ═══════════════════════════════════════════════════════════════════════════════

const NEXTGEN_TECH_STACK = {

    // ──────────────────────────────────────────────────────────────────────────
    // الصناعة 5.0 — Industry 5.0
    // ──────────────────────────────────────────────────────────────────────────
    industry5_0: {
        nameAr:  'الصناعة ٥.٠',
        nameEn:  'Industry 5.0',
        version: '5.0',
        quranRef: '﴿ وَلَقَدْ كَرَّمْنَا بَنِي آدَمَ ﴾ — الإسراء:٧٠',
        pillars: [
            {
                nameAr: 'محورية الإنسان',
                nameEn: 'Human-Centricity',
                description: 'الإنسان في قلب التصنيع — الآلة تخدم الإنسان لا العكس',
                islamicValue: 'تكريم الإنسان وحفظ كرامته في بيئة العمل',
                technologies: ['Cobot (روبوت تعاوني)', 'AR-Guided Work', 'Adaptive Interfaces', 'Cognitive Ergonomics'],
            },
            {
                nameAr: 'الاستدامة',
                nameEn: 'Sustainability',
                description: 'التصنيع الأخضر وصفر انبعاثات',
                islamicValue: '﴿ وَلَا تُفْسِدُوا فِي الْأَرْضِ بَعْدَ إِصْلَاحِهَا ﴾ — حفظ البيئة فريضة',
                technologies: ['Circular Economy', 'Green H₂ Energy', 'Carbon Capture', 'Biodegradable Materials', 'Solar Manufacturing'],
            },
            {
                nameAr: 'المرونة والصمود',
                nameEn: 'Resilience & Flexibility',
                description: 'مصانع تتكيف مع الأزمات والتغيرات',
                islamicValue: 'التوكل مع الأخذ بالأسباب وإعداد العُدّة',
                technologies: ['Distributed Manufacturing', 'Micro-Factories', 'Adaptive Production', 'Supply Chain Resilience'],
            },
        ],
        enablers: [
            'Collaborative Robotics (Cobot)', 'Edge AI', 'Digital Thread',
            'Circular Economy Platforms', 'Hyper-Automation', 'Sustainable Energy',
            'Human Digital Twin', 'Bionic Manufacturing', 'Zero-Waste Processes',
        ],
        vision: 'الصناعة ٥.٠ = الصناعة ٤.٠ + الإنسان المركزي + الاستدامة + المرونة — بمنهج الكتاب والسنة',
    },

    // ──────────────────────────────────────────────────────────────────────────
    // التصنيع الكمي — Quantum Manufacturing
    // ──────────────────────────────────────────────────────────────────────────
    quantumManufacturing: {
        nameAr:  'التصنيع الكمي',
        nameEn:  'Quantum Manufacturing',
        quranRef: '﴿ وَمِن كُلِّ شَيْءٍ خَلَقْنَا زَوْجَيْنِ ﴾ — الذاريات:٤٩',
        maturity: 'ناشئة — أفق 2030-2040',
        applications: [
            { nameAr: 'تحسين سلسلة الإمداد كمياً', nameEn: 'Quantum Supply Chain Optimization',    benefit: 'حل مشاكل التحسين NP-Hard في ثوانٍ' },
            { nameAr: 'محاكاة المواد كمياً',          nameEn: 'Quantum Materials Simulation',        benefit: 'تصميم مواد جديدة بدقة ذرية' },
            { nameAr: 'الجدولة الكمية للإنتاج',       nameEn: 'Quantum Production Scheduling',       benefit: 'جدولة مثلى لآلاف القيود' },
            { nameAr: 'مراقبة الجودة الكمية',          nameEn: 'Quantum Quality Control',             benefit: 'كشف عيوب على المستوى الذري' },
            { nameAr: 'التشفير الكمي للمصانع',         nameEn: 'Quantum Cryptography for Factories',  benefit: 'أمان لا يُخترق لبيانات الإنتاج' },
            { nameAr: 'التعلم الكمي',                  nameEn: 'Quantum Machine Learning',            benefit: 'تسريع خوارزميات AI الصناعية' },
        ],
        players: ['IBM Quantum', 'Google Quantum AI', 'D-Wave', 'IonQ', 'Honeywell Quantum', 'AWS Braket'],
        readinessLevel: 'TRL 4-6 — مرحلة البحث والتطوير الصناعي',
    },

    // ──────────────────────────────────────────────────────────────────────────
    // التصنيع النانوي — Nano Manufacturing
    // ──────────────────────────────────────────────────────────────────────────
    nanoManufacturing: {
        nameAr:  'التصنيع النانوي',
        nameEn:  'Nano Manufacturing',
        quranRef: '﴿ وَمَا يَعْزُبُ عَن رَّبِّكَ مِن مِّثْقَالِ ذَرَّةٍ ﴾ — يونس:٦١',
        scale:   '1 – 100 نانومتر (١ نانومتر = ١٠⁻⁹ متر)',
        technologies: [
            { nameAr: 'الأنابيب النانوية الكربونية', nameEn: 'Carbon Nanotubes (CNT)',       uses: 'إلكترونيات، هياكل خفيفة، توصيل حراري' },
            { nameAr: 'نانو جرافين',                  nameEn: 'Graphene',                    uses: 'بطاريات، فلاتر، مستشعرات، مواد بناء' },
            { nameAr: 'الجسيمات النانوية',            nameEn: 'Nanoparticles',               uses: 'أدوية موجهة، طلاءات، كتالysts' },
            { nameAr: 'الطباعة النانوية',             nameEn: 'Nano-Printing',               uses: 'دوائر إلكترونية، رقائق متقدمة' },
            { nameAr: 'الروبوتات النانوية',           nameEn: 'Nano-Robots',                 uses: 'طب دقيق، تصنيع داخل المواد' },
            { nameAr: 'التجميع الجزيئي',             nameEn: 'Molecular Assembly',           uses: 'تصنيع مادة ذرة بذرة' },
        ],
        sectors: ['طب ودواء', 'إلكترونيات', 'مواد هندسية', 'طاقة', 'فضاء', 'دفاع'],
        saudiRelevance: 'برنامج نانو السعودية — KACST | جامعة الملك عبدالله (KAUST)',
    },

    // ──────────────────────────────────────────────────────────────────────────
    // التصنيع الحيوي — Bio Manufacturing
    // ──────────────────────────────────────────────────────────────────────────
    bioManufacturing: {
        nameAr:  'التصنيع الحيوي',
        nameEn:  'Bio Manufacturing',
        quranRef: '﴿ وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ ﴾ — الأنبياء:٣٠',
        categories: [
            { nameAr: 'تصنيع الأدوية الحيوية',    nameEn: 'Biopharmaceutical Manufacturing', examples: ['لقاحات', 'أجسام مضادة وحيدة النسيلة', 'بروتينات علاجية'] },
            { nameAr: 'المواد الحيوية',           nameEn: 'Biomaterials',                    examples: ['غرسات طبية', 'هندسة الأنسجة', 'جلد اصطناعي'] },
            { nameAr: 'الوقود الحيوي',            nameEn: 'Biofuels',                        examples: ['إيثانول', 'ديزل حيوي', 'هيدروجين حيوي'] },
            { nameAr: 'البلاستيك الحيوي',         nameEn: 'Bioplastics',                     examples: ['PLA', 'PHA', 'Bio-PET'] },
            { nameAr: 'الطباعة الحيوية',          nameEn: '3D Bio-Printing',                 examples: ['طباعة أعضاء', 'طباعة غضاريف', 'طباعة أوعية دموية'] },
            { nameAr: 'التخمير الصناعي',          nameEn: 'Industrial Fermentation',         examples: ['مضادات حيوية حلال', 'إنزيمات صناعية', 'إضافات غذائية'] },
        ],
        islamicNote: 'يُراعى في التصنيع الحيوي الضوابط الشرعية — الحلال والمنافع والمضار',
    },

    // ──────────────────────────────────────────────────────────────────────────
    // التصنيع الفضائي — Space Manufacturing
    // ──────────────────────────────────────────────────────────────────────────
    spaceManufacturing: {
        nameAr:  'التصنيع الفضائي',
        nameEn:  'Space Manufacturing',
        quranRef: '﴿ وَسَخَّرَ لَكُم مَّا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ جَمِيعًا مِّنْهُ ﴾ — الجاثية:١٣',
        horizon: 'أفق 2035-2050',
        concepts: [
            { nameAr: 'الطباعة ثلاثية في الفضاء', nameEn: 'In-Space 3D Printing',      benefit: 'تصنيع قطع الغيار على المحطات الفضائية' },
            { nameAr: 'تعدين الكويكبات',           nameEn: 'Asteroid Mining',           benefit: 'موارد معدنية لا حدود لها (بلاتين، نيكل، حديد)' },
            { nameAr: 'التصنيع في الجاذبية الصغرى',nameEn: 'Microgravity Manufacturing', benefit: 'مواد مستحيلة على الأرض (بلورات، معادن نقية، رغوات)' },
            { nameAr: 'تصنيع الأقمار الصناعية',    nameEn: 'On-Orbit Satellite Assembly',benefit: 'بناء منصات فضائية ضخمة بالفضاء' },
            { nameAr: 'طاقة الفضاء الشمسية',       nameEn: 'Space Solar Power',         benefit: 'ألواح شمسية فضائية تُرسل الطاقة للأرض' },
        ],
        players: ['SpaceX', 'Blue Origin', 'NASA', 'ESA', 'ISRO', 'برنامج الفضاء السعودي'],
        saudiSpace: 'مركز الملك عبدالعزيز للفضاء — رؤية 2030 الفضائية',
    },

    // ──────────────────────────────────────────────────────────────────────────
    // التصنيع بالذكاء الاصطناعي التوليدي — Generative AI Manufacturing
    // ──────────────────────────────────────────────────────────────────────────
    generativeAIManufacturing: {
        nameAr:  'التصنيع بالذكاء الاصطناعي التوليدي',
        nameEn:  'Generative AI Manufacturing',
        quranRef: '﴿ وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا ﴾ — البقرة:٣١',
        capabilities: [
            { nameAr: 'التصميم التوليدي',          nameEn: 'Generative Design',          description: 'AI يُنشئ آلاف التصاميم المثلى في دقائق' },
            { nameAr: 'توليد مسار الأداة',         nameEn: 'Toolpath Generation',        description: 'AI يُولّد مسارات قطع CNC مُحسَّنة' },
            { nameAr: 'توليد وصفة المواد',         nameEn: 'Material Recipe Generation', description: 'AI يُصمّم تركيبات مواد جديدة' },
            { nameAr: 'توليد كود التحكم',           nameEn: 'PLC/Robot Code Generation',  description: 'AI يكتب كود التحكم الصناعي' },
            { nameAr: 'توليد تقارير الجودة',        nameEn: 'Quality Report Generation',  description: 'AI يُولّد تقارير جودة ذكية' },
            { nameAr: 'توليد خطط الصيانة',         nameEn: 'Maintenance Plan Generation', description: 'AI يُصمّم خطط صيانة مثلى' },
        ],
        platforms: ['Autodesk Fusion 360', 'Siemens NX GenAI', 'NVIDIA Omniverse', 'PTC Creo', 'شيخة Codex الصناعي'],
    },

    // ──────────────────────────────────────────────────────────────────────────
    // التصنيع الموزّع — Distributed Manufacturing
    // ──────────────────────────────────────────────────────────────────────────
    distributedManufacturing: {
        nameAr:  'التصنيع الموزّع',
        nameEn:  'Distributed Manufacturing',
        quranRef: '﴿ وَفِي الْأَرْضِ قِطَعٌ مُّتَجَاوِرَاتٌ ﴾ — الرعد:٤',
        description: 'شبكة من المصانع الصغيرة الذكية الموزّعة جغرافياً تعمل كمصنع واحد',
        components: [
            { nameAr: 'المصانع الصغيرة',  nameEn: 'Micro-Factories',   description: 'مصانع صغيرة مرنة قريبة من العميل' },
            { nameAr: 'التصنيع السحابي',  nameEn: 'Cloud Manufacturing',description: 'قدرات تصنيعية كخدمة عبر الإنترنت (MaaS)' },
            { nameAr: 'التصنيع الشبكي',   nameEn: 'Network Manufacturing',description: 'شبكة موردين ومصنّعين متكاملة' },
            { nameAr: 'التصنيع المحلي',   nameEn: 'Local Manufacturing', description: 'إنتاج قريب من المستهلك لتقليل سلاسل الإمداد' },
        ],
        benefits: ['تقليل وقت التسليم', 'خفض تكاليف الشحن', 'المرونة والاستجابة السريعة', 'تعزيز المحتوى المحلي'],
        saudiRelevance: 'رؤية 2030 — رفع المحتوى المحلي وتنويع الاقتصاد',
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 2. نواة الذكاء الاصطناعي الصناعية — AI MANUFACTURING CORE
// ═══════════════════════════════════════════════════════════════════════════════

const AI_MANUFACTURING_CORE = {

    // التصميم التوليدي — Generative Design
    generativeDesign: {
        nameAr:  'التصميم التوليدي الذكي',
        nameEn:  'AI Generative Design',
        inputs:  ['قيود الحمل والإجهاد', 'خصائص المواد', 'تكلفة التصنيع', 'قيود الجاذبية والوزن', 'الطاقة الإنتاجية'],
        outputs: ['هياكل مُحسَّنة توبولوجياً', 'تقليل الوزن (٢٠-٩٠%)', 'رفع المتانة', 'ملفات CAD جاهزة للطباعة'],
        algorithms: ['Topology Optimization', 'SIMP Method', 'ESO/BESO', 'Level-Set', 'Genetic Algorithm'],
        tools: ['Autodesk Generative Design', 'Altair Inspire', 'nTopology', 'Ansys Discovery'],
    },

    // الصيانة التنبؤية المتقدمة — Advanced Predictive Maintenance
    predictiveMaintenance: {
        nameAr:  'الصيانة التنبؤية المتقدمة',
        nameEn:  'Advanced Predictive Maintenance',
        sensors: ['اهتزاز', 'حرارة', 'ضغط', 'تيار كهربائي', 'بصري (كاميرا)', 'صوتي (ultrasound)', 'تشحيم'],
        models: [
            { nameEn: 'LSTM Networks',            use: 'تحليل بيانات سلاسل زمنية' },
            { nameEn: 'Transformer Models',       use: 'توقع الأعطال متعددة المتغيرات' },
            { nameEn: 'Physics-Informed ML',      use: 'دمج فيزياء الآلة مع التعلم الآلي' },
            { nameEn: 'Federated Learning',       use: 'تدريب موزّع بدون مشاركة بيانات خاصة' },
            { nameEn: 'Digital Twin Simulation',  use: 'محاكاة تفصيلية لحالة الآلة' },
        ],
        kpis: ['MTBF (متوسط الوقت بين الأعطال)', 'MTTR (متوسط وقت الإصلاح)', 'تقليل التوقف غير المخطط ≥ 40%'],
    },

    // تحسين الإنتاج بالذكاء الاصطناعي — AI Production Optimization
    productionOptimization: {
        nameAr:  'تحسين الإنتاج بالذكاء الاصطناعي',
        nameEn:  'AI Production Optimization',
        capabilities: [
            { nameAr: 'تحسين الجدولة',         nameEn: 'Scheduling Optimization',    algorithm: 'Reinforcement Learning + Genetic Algorithm' },
            { nameAr: 'تقليل أوقات الانتظار',  nameEn: 'Queue Time Reduction',       algorithm: 'Discrete Event Simulation + ML' },
            { nameAr: 'تحسين استهلاك الطاقة',  nameEn: 'Energy Consumption Optimization', algorithm: 'Multi-Objective Optimization' },
            { nameAr: 'تحسين مسار خط الإنتاج', nameEn: 'Production Flow Optimization', algorithm: 'Value Stream Mapping + AI' },
            { nameAr: 'تحسين تخصيص العمالة',   nameEn: 'Workforce Allocation',       algorithm: 'Integer Programming + ML' },
        ],
        metrics: ['OEE ≥ 85%', 'تقليل الهدر ≥ 30%', 'رفع الإنتاجية ≥ 25%', 'توفير الطاقة ≥ 20%'],
    },

    // فحص الجودة البصري — Visual Quality Inspection
    visualQualityInspection: {
        nameAr:  'فحص الجودة البصري الذكي',
        nameEn:  'AI Visual Quality Inspection',
        technologies: [
            { nameEn: 'Convolutional Neural Networks (CNN)', use: 'كشف العيوب السطحية' },
            { nameEn: 'Object Detection (YOLO, Faster R-CNN)', use: 'تحديد موقع العيوب' },
            { nameEn: 'Anomaly Detection (Autoencoder)', use: 'كشف الشذوذ بدون بيانات معيبة' },
            { nameEn: 'Hyperspectral Imaging', use: 'فحص التركيب الداخلي والكيميائي' },
            { nameEn: 'Laser Profilometry', use: 'قياس دقيق للأبعاد والشكل (ميكرومتر)' },
        ],
        accuracy: '≥ 99.5% كشف عيوب في الخط الإنتاجي السريع',
        speed:    'فحص ≥ 1000 قطعة/دقيقة في التصنيع الضخم',
    },

    // ذكاء التنبؤ بالطلب — Demand Intelligence
    demandIntelligence: {
        nameAr:  'ذكاء التنبؤ بالطلب الصناعي',
        nameEn:  'Industrial Demand Intelligence',
        dataSources: ['بيانات المبيعات التاريخية', 'مؤشرات السوق', 'أسعار المواد', 'الأحداث الاقتصادية', 'البيانات الجغرافية'],
        models: ['Prophet (Meta)', 'ARIMA/SARIMA', 'XGBoost', 'LSTM', 'Transformer (TimeGPT)'],
        horizon: ['قصير: 1-4 أسابيع', 'متوسط: 1-6 أشهر', 'طويل: 1-3 سنوات'],
        benefit: 'تقليل مخزون الإنتاج الزائد (Overproduction) وتحسين توقيت الإنتاج',
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 3. سوق المصنّعين — MANUFACTURER MARKETPLACE
// ═══════════════════════════════════════════════════════════════════════════════

const MANUFACTURER_MARKETPLACE = {

    nameAr: 'سوق المصنّعين في شيخة',
    nameEn: 'Sheikha Manufacturer Marketplace',
    description: 'منصة تربط المصنّعين بالموردين والمشترين والشركاء في بيئة إسلامية حلال شفافة',

    // أنواع المشاركين
    participants: {
        manufacturers: {
            nameAr: 'المصنّعون',
            types: ['مصانع ثقيلة', 'مصانع خفيفة', 'مصانع SME', 'مصانع ذكية', 'مصانع موزّعة'],
            services: ['عرض الطاقة الإنتاجية', 'نشر الكتالوج', 'استقبال طلبات التصنيع', 'تتبع الطلبات'],
        },
        suppliers: {
            nameAr: 'الموردون',
            types: ['موردو مواد خام', 'موردو قطع غيار', 'موردو مستلزمات إنتاج', 'مزودو خدمات صناعية'],
            services: ['نشر عروض المواد', 'أسعار لحظية', 'توثيق جودة المواد', 'شهادات الحلال'],
        },
        buyers: {
            nameAr: 'المشترون والعملاء',
            types: ['مصانع تشتري مواد أو خدمات', 'شركات توزيع', 'حكومات ومؤسسات', 'مستوردون'],
            services: ['RFQ (طلب عرض سعر)', 'مناقصات إلكترونية', 'عقود دورية', 'دفع حلال'],
        },
        serviceProviders: {
            nameAr: 'مزودو الخدمات',
            types: ['مختبرات اختبار', 'شركات شهادات', 'شركات لوجستيات', 'مستشارون صناعيون'],
        },
    },

    // نماذج التداول
    tradingModels: [
        { nameAr: 'تصنيع حسب الطلب',         nameEn: 'Contract Manufacturing',          description: 'تصنيع منتجات العميل في مصانع شيخة الموزّعة' },
        { nameAr: 'بيع الطاقة الإنتاجية',     nameEn: 'Capacity Marketplace',            description: 'بيع وشراء طاقة إنتاجية فائضة' },
        { nameAr: 'سوق المواد الخام',          nameEn: 'Raw Materials Market',            description: 'بيع شراء مواد خام بأسعار لحظية عادلة' },
        { nameAr: 'سوق قطع الغيار الصناعية',  nameEn: 'Industrial Spare Parts Market',   description: 'قطع غيار أصلية وبديلة بسعر عادل' },
        { nameAr: 'مزادات المعدات المستعملة',  nameEn: 'Used Equipment Auction',          description: 'مزادات آلات ومعدات صناعية مستعملة' },
        { nameAr: 'المناقصات الصناعية',        nameEn: 'Industrial Tenders',              description: 'مناقصات إلكترونية شفافة ومعتمدة شرعاً' },
    ],

    // ضمانات الجودة والشريعة
    qualityAssurance: {
        shariaCompliance: [
            'كل المعاملات خالية من الربا (عقود بيع وسلم ومضاربة)',
            'لا غرر — الكميات والأسعار والمواصفات واضحة',
            'لا غش — مواصفات المنتج مُوثَّقة ومُعتمَدة',
            'التراضي — لا إكراه في أي صفقة',
            'شهادات الحلال للمنتجات الغذائية والدوائية',
        ],
        qualityCertifications: ['ISO 9001', 'SASO', 'CE Mark', 'Made in Saudi', 'Halal Certification'],
        disputeResolution: 'التحكيم الإسلامي — لجان حل النزاعات الشرعية',
    },

    // مؤشرات السوق
    marketIntelligence: {
        priceIndices: ['مؤشر أسعار المواد الخام', 'مؤشر تكلفة التصنيع', 'مؤشر الطاقة الإنتاجية المتاحة'],
        analytics: ['تحليل العرض والطلب', 'اتجاهات القطاعات', 'تقارير الأداء الصناعي', 'مؤشر الثقة الصناعي'],
        reports: ['تقرير شهري لسوق المصنّعين', 'تقرير القطاعات الناشئة', 'تقرير الفرص الاستثمارية الصناعية'],
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 4. ذكاء المواد للجيل الجديد — NEXT-GEN MATERIALS INTELLIGENCE
// ═══════════════════════════════════════════════════════════════════════════════

const NEXTGEN_MATERIALS = [
    {
        id: 'graphene',
        nameAr: 'الجرافين',
        nameEn: 'Graphene',
        category: 'نانو مواد',
        properties: { strength: 'أقوى مادة معروفة (200× الصلب)', conductivity: 'موصلية حرارية وكهربائية فائقة', weight: 'خفيف جداً', flexibility: 'مرن وشفاف' },
        applications: ['بطاريات فائقة الشحن', 'مرشّحات المياه', 'إلكترونيات مرنة', 'طلاءات مضادة للتآكل', 'مكونات فضائية'],
        saudiPotential: 'صناعة الإلكترونيات + صناعة السيارات + تقنية المياه',
    },
    {
        id: 'metallic_glass',
        nameAr: 'المعدن الزجاجي',
        nameEn: 'Metallic Glass (Amorphous Metal)',
        category: 'معادن متقدمة',
        properties: { strength: 'مقاومة شد فائقة', elasticity: 'مرونة معدنية', corrosion: 'مقاومة تآكل عالية' },
        applications: ['معدات طبية دقيقة', 'دروع حماية', 'رياضة وتجهيزات', 'ساعات فاخرة', 'روبوتات'],
        saudiPotential: 'صناعة طبية + دفاع',
    },
    {
        id: 'shape_memory_alloy',
        nameAr: 'سبائك الذاكرة الشكلية',
        nameEn: 'Shape Memory Alloys (SMA)',
        category: 'مواد ذكية',
        properties: { memory: 'تتذكر شكلها الأصلي عند التسخين', superelasticity: 'مرونة خارقة' },
        applications: ['دعامات طبية', 'محركات أكواتر', 'هياكل فضائية قابلة للطي', 'كابلات زلازل ذكية'],
        saudiPotential: 'صناعة طبية + نفط وغاز + بنية تحتية',
    },
    {
        id: 'aerogel',
        nameAr: 'الإيروجيل',
        nameEn: 'Aerogel',
        category: 'مواد متقدمة',
        properties: { insulation: 'أفضل عازل حراري للمواد الصلبة', density: 'أخف مادة صلبة (99.8% هواء)', transparency: 'شبه شفاف' },
        applications: ['عزل خطوط الأنابيب', 'ملابس حماية', 'مركبات فضائية', 'مباني موفرة للطاقة'],
        saudiPotential: 'صناعة النفط + بناء + طاقة',
    },
    {
        id: 'self_healing_polymer',
        nameAr: 'البوليمرات ذاتية الالتئام',
        nameEn: 'Self-Healing Polymers',
        category: 'مواد ذكية',
        properties: { healing: 'تُصلح نفسها تلقائياً عند التلف', lifespan: 'عمر افتراضي أطول بكثير' },
        applications: ['طلاءات السيارات', 'كابلات تحت البحر', 'هياكل طيران', 'إلكترونيات مرنة'],
        saudiPotential: 'صناعة بتروكيماوية + سيارات + طاقة',
    },
    {
        id: 'perovskite',
        nameAr: 'البيروفسكيت الشمسي',
        nameEn: 'Perovskite Solar Cells',
        category: 'طاقة',
        properties: { efficiency: 'كفاءة > 33% (أعلى من السيليكون التقليدي)', cost: 'تكلفة تصنيع منخفضة', flexibility: 'قابل للطباعة والتشكيل' },
        applications: ['ألواح شمسية مرنة', 'نوافذ ذكية', 'أجهزة طبية تعمل بالضوء'],
        saudiPotential: 'مشروع نيوم + محطات طاقة شمسية + رؤية 2030',
    },
    {
        id: 'high_entropy_alloy',
        nameAr: 'سبائك الانتروبيا العالية',
        nameEn: 'High-Entropy Alloys (HEA)',
        category: 'معادن متقدمة',
        properties: { temperature: 'مقاومة درجات حرارة فائقة (> 1000°C)', strength: 'قوة عالية جداً', radiation: 'مقاومة الإشعاع' },
        applications: ['توربينات غازية', 'مفاعلات نووية', 'محركات صواريخ', 'أدوات قطع متقدمة'],
        saudiPotential: 'صناعة طاقة + دفاع + بتروكيماويات',
    },
    {
        id: 'mxene',
        nameAr: 'مكسين (نانو مواد ثنائية الأبعاد)',
        nameEn: 'MXene (2D Nanomaterials)',
        category: 'نانو مواد',
        properties: { conductivity: 'موصلية كهربائية فائقة', surface: 'مساحة سطح هائلة', hydrophilic: 'قابل للذوبان في الماء' },
        applications: ['بطاريات فائقة', 'مرشّحات مياه', 'دروع EM', 'حساسات', 'طلاءات مضادة للجراثيم'],
        saudiPotential: 'تكنولوجيا المياه + طاقة + دفاع',
    },
];

// ═══════════════════════════════════════════════════════════════════════════════
// 5. الضوابط الشرعية الصناعية الشاملة — SHARIA MANUFACTURING FRAMEWORK
// ═══════════════════════════════════════════════════════════════════════════════

const SHARIA_MANUFACTURING_FRAMEWORK = {

    quranReferences: [
        { ref: 'الأنبياء:٨٠',  text: 'وَعَلَّمْنَاهُ صَنْعَةَ لَبُوسٍ لَّكُمْ لِتُحْصِنَكُم مِّن بَأْسِكُمْ', topic: 'الصنعة النافعة' },
        { ref: 'الحديد:٢٥',   text: 'وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ', topic: 'تسخير الحديد' },
        { ref: 'النمل:٨٨',    text: 'صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ', topic: 'الإتقان' },
        { ref: 'هود:٦١',      text: 'هُوَ أَنشَأَكُم مِّنَ الْأَرْضِ وَاسْتَعْمَرَكُمْ فِيهَا', topic: 'إعمار الأرض' },
        { ref: 'الجاثية:١٣',  text: 'وَسَخَّرَ لَكُم مَّا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ جَمِيعًا مِّنْهُ', topic: 'تسخير الكون للصناعة' },
        { ref: 'الأنعام:١٥٢', text: 'وَأَوْفُوا الْكَيْلَ وَالْمِيزَانَ بِالْقِسْطِ', topic: 'دقة المواصفات' },
        { ref: 'الأعراف:٥٦',  text: 'وَلَا تُفْسِدُوا فِي الْأَرْضِ بَعْدَ إِصْلَاحِهَا', topic: 'حفظ البيئة' },
        { ref: 'الأنعام:١٤١', text: 'وَلَا تُسْرِفُوا إِنَّهُ لَا يُحِبُّ الْمُسْرِفِينَ', topic: 'تقليل الهدر' },
    ],

    hadithReferences: [
        { text: 'إن الله يحب إذا عمل أحدكم عملاً أن يتقنه',        source: 'البيهقي',   grade: 'صحيح',   application: 'الإتقان في التصنيع — ISO, Six Sigma' },
        { text: 'لا ضرر ولا ضرار',                                   source: 'ابن ماجه',  grade: 'صحيح',   application: 'سلامة المنتج والعمال والبيئة' },
        { text: 'من غشنا فليس منا',                                   source: 'مسلم',      grade: 'صحيح',   application: 'صدق المواصفات وعدم التدليس' },
        { text: 'أعطوا الأجير أجره قبل أن يجف عرقه',                 source: 'ابن ماجه',  grade: 'صحيح',   application: 'حقوق العمال في المصانع' },
        { text: 'خير الناس أنفعهم للناس',                             source: 'الطبراني',  grade: 'حسن',    application: 'صناعة منتجات تنفع المجتمع' },
        { text: 'إن الله يحب المحترف إذا أتقن حرفته',                source: 'الطبراني',  grade: 'حسن',    application: 'التفوق الصناعي مطلوب شرعاً' },
        { text: 'تعاونوا على البر والتقوى ولا تعاونوا على الإثم والعدوان', source: 'القرآن: المائدة:٢', grade: 'قطعي', application: 'التعاون الصناعي المشروع' },
    ],

    prohibitedManufacturing: [
        'تصنيع المسكرات والخمور وكل مخدر',
        'تصنيع لحم الخنزير ومشتقاته',
        'تصنيع أدوات القمار والميسر',
        'تصنيع المواد الإباحية بكل أنواعها',
        'الغش والتدليس في المواصفات والكميات',
        'تصنيع أسلحة الدمار الشامل',
        'تصنيع يُلحق ضرراً بالبيئة أو الإنسان دون حاجة',
        'استغلال العمال وانتهاك حقوقهم',
    ],

    permittedWithConditions: [
        { item: 'الصناعة الدوائية والطبية',       condition: 'أن تكون المكونات حلالاً وأن النفع أكبر من الضرر' },
        { item: 'صناعة الأسلحة',                  condition: 'لأغراض الدفاع المشروع عن النفس والأمة — لا عدوان' },
        { item: 'التصنيع الحيوي',                  condition: 'أن تكون المواد الحيوية من مصادر حلال أو ضرورة طبية' },
        { item: 'صناعة التكنولوجيا المزدوجة',     condition: 'أن يغلب استخدامها في النفع العام لا في الضرر' },
    ],

    islamicQualityStandards: {
        nameAr: 'معيار الجودة الإسلامي لشيخة',
        nameEn: 'Sheikha Islamic Quality Standard (SIQS)',
        pillars: [
            { nameAr: 'الإتقان',    evidence: 'إن الله يحب الإتقان',      level: 'Zero Defects — Six Sigma Level 6σ' },
            { nameAr: 'الأمانة',    evidence: 'أدّوا الأمانات إلى أهلها',   level: 'Full Transparency in Specs & Data' },
            { nameAr: 'النفع',      evidence: 'خير الناس أنفعهم للناس',     level: 'Product must benefit society' },
            { nameAr: 'العدل',      evidence: 'وأوفوا الكيل والميزان بالقسط', level: 'Exact measurements & honest claims' },
            { nameAr: 'الاستدامة',  evidence: 'لا تفسدوا في الأرض',          level: 'Green Manufacturing, Zero Waste' },
        ],
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 6. ذكاء الإنتاج اللحظي — REAL-TIME PRODUCTION INTELLIGENCE
// ═══════════════════════════════════════════════════════════════════════════════

const PRODUCTION_INTELLIGENCE = {

    oeeCalculator: {
        nameAr: 'حاسبة OEE الذكية',
        nameEn: 'Smart OEE Calculator',
        formula: 'OEE = Availability × Performance × Quality',
        components: {
            availability: {
                nameAr: 'التوفر',
                formula: '(وقت التشغيل الفعلي / وقت التشغيل المخطط) × 100',
                losses: ['عطل الآلة', 'تبديل القوالب', 'إيقاف طوارئ', 'انتظار مواد'],
            },
            performance: {
                nameAr: 'الأداء',
                formula: '(الإنتاج الفعلي / الإنتاج المثالي) × 100',
                losses: ['تراجع السرعة', 'توقفات صغيرة', 'بدء التشغيل البطيء'],
            },
            quality: {
                nameAr: 'الجودة',
                formula: '(الوحدات الجيدة / إجمالي الوحدات) × 100',
                losses: ['عيوب الإنتاج', 'إعادة التشغيل', 'هدر بدء التشغيل'],
            },
        },
        worldClass: { oee: '≥ 85%', availability: '≥ 90%', performance: '≥ 95%', quality: '≥ 99.9%' },
        calculate(avail, perf, qual) {
            const a = Math.min(100, Math.max(0, avail));
            const p = Math.min(100, Math.max(0, perf));
            const q = Math.min(100, Math.max(0, qual));
            const oee = (a / 100) * (p / 100) * (q / 100) * 100;
            return {
                availability: a,
                performance:  p,
                quality:      q,
                oee:          Math.round(oee * 100) / 100,
                grade:        oee >= 85 ? 'عالمي المستوى' : oee >= 65 ? 'جيد — قابل للتحسين' : 'يحتاج تحسين عاجل',
                islamicNote:  '«إن الله يحب إذا عمل أحدكم عملاً أن يتقنه» — الإتقان هدف OEE ١٠٠%',
            };
        },
    },

    bottleneckDetector: {
        nameAr: 'كاشف الاختناقات الصناعية',
        nameEn: 'Industrial Bottleneck Detector',
        methods: ['Theory of Constraints (TOC)', 'Value Stream Mapping', 'Process Mining', 'Simulation'],
        indicators: ['أعلى معدل انتظار', 'أطول وقت دورة', 'أعلى معدل إعادة تشغيل', 'أقل كفاءة في المحطة'],
        solution: 'خوارزمية توجيه شيخة الذكية تكتشف الاختناق وتُقترح حلولاً فورية',
    },

    qualityGate: {
        nameAr: 'بوابة الجودة الذكية',
        nameEn: 'Smart Quality Gate',
        stages: [
            { stage: 'QG0', nameAr: 'مراجعة المفهوم',    nameEn: 'Concept Review' },
            { stage: 'QG1', nameAr: 'مراجعة المواصفات', nameEn: 'Specification Review' },
            { stage: 'QG2', nameAr: 'نموذج أولي',         nameEn: 'Prototype Review' },
            { stage: 'QG3', nameAr: 'تجريبي الإنتاج',    nameEn: 'Pilot Production' },
            { stage: 'QG4', nameAr: 'إنتاج كامل',         nameEn: 'Full Production' },
            { stage: 'QG5', nameAr: 'إطلاق السوق',        nameEn: 'Market Launch' },
        ],
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 7. محرك صانعة شيخة الجيل الجديد — NEXTGEN MANUFACTURER ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhaNextGenManufacturer extends EventEmitter {

    constructor() {
        super();
        this.name      = 'صانعة شيخة — الجيل الجديد | تكنولوجيا الصناعة';
        this.nameEn    = 'Sheikha Next-Generation Manufacturer — Manufacturing Technology';
        this.version   = VERSION;
        this.owner     = 'سلمان أحمد بن سلمان الراجح';
        this.activatedAt = new Date().toISOString();
        this.tawheed   = 'لا إله إلا الله — الصناعة لخدمة الإنسان والأمة والكون';

        // ─── البيانات الأساسية ─────────────────────────────────────────────
        this.techStack   = NEXTGEN_TECH_STACK;
        this.aiCore      = AI_MANUFACTURING_CORE;
        this.marketplace = MANUFACTURER_MARKETPLACE;
        this.materials   = NEXTGEN_MATERIALS;
        this.sharia      = SHARIA_MANUFACTURING_FRAMEWORK;
        this.intelligence= PRODUCTION_INTELLIGENCE;

        // ─── إحصائيات ─────────────────────────────────────────────────────
        this._stats = {
            totalRequests: 0,
            topicCounts:   {},
            uptime:        Date.now(),
        };

        console.log(`[NEXTGEN-MFG] 🏭 صانعة شيخة الجيل الجديد مُفعَّلة — v${VERSION}`);
        console.log(`[NEXTGEN-MFG] 🔬 التقنيات: ${Object.keys(NEXTGEN_TECH_STACK).length} | المواد: ${NEXTGEN_MATERIALS.length} | النماذج: ${Object.keys(AI_MANUFACTURING_CORE).length}`);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // الواجهة الرئيسية — handle(req)
    // ─────────────────────────────────────────────────────────────────────────

    async handle(req = {}) {
        const traceId = req.traceId
            || `NGM-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
        const text = req.data?.text || req.data?.query || req.data?.message || req.intent || '';

        this._stats.totalRequests++;
        this.emit('request', { traceId, text });

        try {
            const topic    = this._classifyTopic(text);
            const response = await this._buildResponse(topic, text, req.data || {});
            const refs     = this._getIslamicRefs(topic);

            this._stats.topicCounts[topic] = (this._stats.topicCounts[topic] || 0) + 1;
            this.emit('processed', { traceId, topic });

            return {
                success:    true,
                engine:     this.name,
                version:    this.version,
                traceId,
                topic,
                response,
                islamicRefs: refs,
                ...response.meta,
            };

        } catch (err) {
            this.emit('error', { traceId, error: err.message });
            return {
                success: false,
                engine:  this.name,
                traceId,
                error:   err.message,
                message: 'خطأ في صانعة شيخة الجيل الجديد — يُعالج بأمان (لا ضرر ولا ضرار)',
            };
        }
    }

    async execute(req) { return this.handle(req); }
    async process(req) { return this.handle(req); }

    // ─────────────────────────────────────────────────────────────────────────
    // تصنيف الموضوع
    // ─────────────────────────────────────────────────────────────────────────

    _classifyTopic(text) {
        const t = (text || '').toLowerCase();

        if (/صناعة ٥|industry 5|محورية الإنسان|human.?centr/i.test(t))                       return 'industry5';
        if (/كمي|quantum/i.test(t))                                                            return 'quantum';
        if (/نانو|nano/i.test(t))                                                              return 'nano';
        if (/حيوي|bio.?manufactur|تصنيع حيوي/i.test(t))                                       return 'bio';
        if (/فضاء|space.?manufactur|تصنيع فضائي|كويكب/i.test(t))                              return 'space';
        if (/توليدي|generative.?design|تصميم توليدي/i.test(t))                                return 'generative_design';
        if (/صيانة تنبؤية|predictive.?maint|lstm|digital.?twin/i.test(t))                     return 'predictive_maint';
        if (/تحسين إنتاج|production.?optim|oee|كفاءة الإنتاج/i.test(t))                       return 'production_optim';
        if (/فحص بصري|visual.?inspect|cnn|computer.?vision|defect/i.test(t))                  return 'visual_inspect';
        if (/تنبؤ الطلب|demand.?forecast|demand.?intel/i.test(t))                             return 'demand_intel';
        if (/سوق مصنّعين|manufacturer.?market|capacity.?market|مناقصة صناعية/i.test(t))       return 'market';
        if (/مادة|materials?|جرافين|graphene|نانو مادة|aerogel|مكسين|mxene/i.test(t))         return 'materials';
        if (/شريعة|حلال|إتقان|ضوابط|شرعي|islamic.?manufactur/i.test(t))                       return 'sharia';
        if (/تصنيع موزّع|distributed.?manufactur|micro.?factor|maas/i.test(t))                 return 'distributed';
        if (/جيل جديد|next.?gen|nextgen|تكنولوجيا صناعة|manufacturing.?tech/i.test(t))        return 'nextgen_overview';
        return 'nextgen_overview';
    }

    // ─────────────────────────────────────────────────────────────────────────
    // بناء الاستجابة
    // ─────────────────────────────────────────────────────────────────────────

    async _buildResponse(topic, text, data) {
        switch (topic) {

            case 'industry5':
                return {
                    summary: '🏭 الصناعة ٥.٠ — المستقبل القريب للتصنيع الإنساني المستدام',
                    details: this.techStack.industry5_0,
                    message: `الصناعة ٥.٠ تُعيد الإنسان إلى قلب الإنتاج — محورية بشرية + استدامة + مرونة.\n﴿ وَلَقَدْ كَرَّمْنَا بَنِي آدَمَ ﴾`,
                    meta:    { category: 'industry5_0', techReadiness: 'TRL 7-9 — جاهز للتطبيق' },
                };

            case 'quantum':
                return {
                    summary: '⚛️ التصنيع الكمي — أفق 2030-2040 لأقوى تقنية إنتاجية',
                    details: this.techStack.quantumManufacturing,
                    message: 'التصنيع الكمي يحل مشاكل التحسين المستعصية ويُصمّم مواد جديدة على المستوى الذري.',
                    meta:    { category: 'quantum', techReadiness: 'TRL 4-6 — بحث وتطوير' },
                };

            case 'nano':
                return {
                    summary: '🔬 التصنيع النانوي — دقة على المستوى الذري ١-١٠٠ نانومتر',
                    details: this.techStack.nanoManufacturing,
                    materials: this.materials.filter(m => m.category === 'نانو مواد'),
                    message: '﴿ وَمَا يَعْزُبُ عَن رَّبِّكَ مِن مِّثْقَالِ ذَرَّةٍ ﴾ — التصنيع على المستوى الذري',
                    meta:    { category: 'nano', techReadiness: 'TRL 5-8 — تطبيقات متاحة' },
                };

            case 'bio':
                return {
                    summary: '🧬 التصنيع الحيوي — مستقبل الصناعة الدوائية والمواد',
                    details: this.techStack.bioManufacturing,
                    message: '﴿ وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ ﴾ — التصنيع الحيوي الحلال',
                    meta:    { category: 'bio', techReadiness: 'TRL 6-9 — جزئياً متاح تجارياً' },
                };

            case 'space':
                return {
                    summary: '🚀 التصنيع الفضائي — المرحلة القادمة لاستغلال خيرات الكون',
                    details: this.techStack.spaceManufacturing,
                    message: '﴿ وَسَخَّرَ لَكُم مَّا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ جَمِيعًا مِّنْهُ ﴾',
                    meta:    { category: 'space', techReadiness: 'TRL 3-6 — بحث ونماذج مبكرة' },
                };

            case 'generative_design':
                return {
                    summary: '🤖 التصميم التوليدي — الذكاء الاصطناعي يُصمّم ما يعجز عنه الإنسان',
                    details: this.aiCore.generativeDesign,
                    message: 'AI يُنشئ آلاف التصاميم المثلى في دقائق — يُقلّل الوزن حتى ٩٠% مع رفع المتانة.',
                    meta:    { category: 'ai_manufacturing', subCategory: 'generative_design' },
                };

            case 'predictive_maint':
                return {
                    summary: '🔧 الصيانة التنبؤية المتقدمة — صفر توقف غير مخطط',
                    details: this.aiCore.predictiveMaintenance,
                    message: 'الصيانة التنبؤية بالذكاء الاصطناعي تُقلّل التوقف ≥ 40% وترفع MTBF.',
                    meta:    { category: 'ai_manufacturing', subCategory: 'predictive_maintenance' },
                };

            case 'production_optim': {
                const oeeResult = data.availability
                    ? this.intelligence.oeeCalculator.calculate(
                        data.availability, data.performance, data.quality
                      )
                    : this.intelligence.oeeCalculator.worldClass;
                return {
                    summary: '📊 تحسين الإنتاج الذكي — OEE ≥ 85% هو المعيار الإسلامي للإتقان',
                    details: this.aiCore.productionOptimization,
                    oeeAnalysis: oeeResult,
                    bottleneck: this.intelligence.bottleneckDetector,
                    message: '«إن الله يحب إذا عمل أحدكم عملاً أن يتقنه» — OEE هو مقياس الإتقان الصناعي.',
                    meta:    { category: 'production_intelligence' },
                };
            }

            case 'visual_inspect':
                return {
                    summary: '👁️ فحص الجودة البصري الذكي — دقة ≥ 99.5% بالشبكات العصبية',
                    details: this.aiCore.visualQualityInspection,
                    message: 'رؤية الآلة تُبدّل الفحص البشري وتضمن جودة فائقة على خط الإنتاج السريع.',
                    meta:    { category: 'ai_manufacturing', subCategory: 'quality_vision' },
                };

            case 'demand_intel':
                return {
                    summary: '📈 ذكاء التنبؤ بالطلب الصناعي — تخطيط مسبق قبل الطلب',
                    details: this.aiCore.demandIntelligence,
                    message: 'التنبؤ الدقيق بالطلب يُقلّل فائض المخزون ويُحسّن توقيت الإنتاج.',
                    meta:    { category: 'demand_intelligence' },
                };

            case 'market':
                return {
                    summary: '🏪 سوق المصنّعين في شيخة — ربط المصنّعين بالموردين والمشترين',
                    details: this.marketplace,
                    message: 'سوق شيخة للمصنّعين: عدل، شفافية، حلال — ﴿ وَأَحَلَّ اللَّهُ الْبَيْعَ ﴾',
                    meta:    { category: 'manufacturer_marketplace' },
                };

            case 'materials':
                return {
                    summary: '🧱 مواد الجيل الجديد — الأقوى والأخف والأذكى',
                    materials: this.materials,
                    highlight: this.materials.find(m =>
                        text.toLowerCase().includes(m.nameEn.toLowerCase().split(' ')[0])
                        || text.includes(m.nameAr.split(' ')[0])
                    ) || this.materials[0],
                    message: 'مواد الجيل الجديد تُعيد تعريف حدود التصنيع — من النانو إلى الفضاء.',
                    meta:    { category: 'nextgen_materials', count: this.materials.length },
                };

            case 'sharia':
                return {
                    summary: '⚖️ الضوابط الشرعية للصناعة — منهج الكتاب والسنة في التصنيع',
                    details: this.sharia,
                    message: '﴿ صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ ﴾ — الإتقان والأمانة والنفع قيم الصناعة الإسلامية.',
                    meta:    { category: 'sharia_manufacturing' },
                };

            case 'distributed':
                return {
                    summary: '🌐 التصنيع الموزّع — شبكة مصانع ذكية تعمل كمصنع واحد',
                    details: this.techStack.distributedManufacturing,
                    message: 'التصنيع الموزّع يُحقق رؤية 2030 في تعزيز المحتوى المحلي.',
                    meta:    { category: 'distributed_manufacturing' },
                };

            default: // nextgen_overview
                return {
                    summary: '🚀 صانعة شيخة الجيل الجديد — تكنولوجيا الصناعة الأقوى والأتقن',
                    overview: {
                        name:       this.name,
                        technologies: Object.keys(this.techStack).map(k => ({
                            key:    k,
                            nameAr: this.techStack[k].nameAr,
                            nameEn: this.techStack[k].nameEn,
                        })),
                        aiCapabilities: Object.keys(this.aiCore),
                        materialsCount: this.materials.length,
                        marketplaceName: this.marketplace.nameAr,
                    },
                    message: '﴿ وَعَلَّمْنَاهُ صَنْعَةَ لَبُوسٍ لَّكُمْ ﴾ — صانعة شيخة تُوظّف علم الله في خدمة الأمة.',
                    meta:    { category: 'nextgen_overview' },
                };
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // المراجع الإسلامية
    // ─────────────────────────────────────────────────────────────────────────

    _getIslamicRefs(topic) {
        const base = [
            this.sharia.quranReferences[0],  // الأنبياء:٨٠ — الصنعة
            this.sharia.hadithReferences[0],  // الإتقان
        ];
        const topicMap = {
            industry5:         [this.sharia.quranReferences[3]],   // هود:٦١
            quantum:           [this.sharia.quranReferences[4]],   // الجاثية:١٣
            nano:              [{ ref: 'يونس:٦١', text: 'وَمَا يَعْزُبُ عَن رَّبِّكَ مِن مِّثْقَالِ ذَرَّةٍ', topic: 'النانو' }],
            bio:               [this.sharia.quranReferences[4]],
            space:             [this.sharia.quranReferences[4]],   // الجاثية:١٣
            sharia:            this.sharia.quranReferences.slice(0, 3),
            market:            [this.sharia.hadithReferences[2]], // لا غش
            production_optim:  [this.sharia.hadithReferences[0]], // الإتقان
            workforce_safety:  [this.sharia.hadithReferences[1]], // لا ضرر
            distributed:       [this.sharia.quranReferences[3]],  // هود:٦١
        };
        return [...base, ...(topicMap[topic] || [])];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // حسابات مساعدة
    // ─────────────────────────────────────────────────────────────────────────

    /** حساب OEE مباشرة */
    calculateOEE(availability, performance, quality) {
        return this.intelligence.oeeCalculator.calculate(availability, performance, quality);
    }

    /** معلومات مادة بعينها */
    getMaterialInfo(nameOrId) {
        const q = (nameOrId || '').toLowerCase();
        return this.materials.find(m =>
            m.id.includes(q) || m.nameEn.toLowerCase().includes(q) || m.nameAr.includes(nameOrId)
        ) || null;
    }

    /** قائمة تقنيات الجيل الجديد */
    listTechStack() {
        return Object.keys(this.techStack).map(k => ({
            key:    k,
            nameAr: this.techStack[k].nameAr,
            nameEn: this.techStack[k].nameEn,
        }));
    }

    /** قائمة مواد الجيل الجديد */
    listMaterials() {
        return this.materials.map(m => ({
            id: m.id, nameAr: m.nameAr, nameEn: m.nameEn, category: m.category,
        }));
    }

    /** الضوابط الشرعية */
    getShariaFramework() {
        return this.sharia;
    }

    /** سوق المصنّعين */
    getMarketplace() {
        return this.marketplace;
    }

    /** حالة المحرك */
    status() {
        return {
            name:          this.name,
            nameEn:        this.nameEn,
            version:       this.version,
            owner:         this.owner,
            activatedAt:   this.activatedAt,
            uptime_ms:     Date.now() - this._stats.uptime,
            totalRequests: this._stats.totalRequests,
            topicCounts:   this._stats.topicCounts,
            techStackKeys: Object.keys(this.techStack),
            aiCoreModules: Object.keys(this.aiCore),
            materialsCount: this.materials.length,
            tawheed:       this.tawheed,
            industrialNNAvailable: !!industrialNN,
            industryEngineAvailable: !!industryEngine,
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. Singleton + Engine Interface
// ═══════════════════════════════════════════════════════════════════════════════

const _manufacturer = new SheikhaNextGenManufacturer();

const engine = {
    handle:              (...a) => _manufacturer.handle(...a),
    execute:             (...a) => _manufacturer.execute(...a),
    process:             (...a) => _manufacturer.process(...a),
    status:              ()     => _manufacturer.status(),
    calculateOEE:        (...a) => _manufacturer.calculateOEE(...a),
    getMaterialInfo:     (...a) => _manufacturer.getMaterialInfo(...a),
    listTechStack:       ()     => _manufacturer.listTechStack(),
    listMaterials:       ()     => _manufacturer.listMaterials(),
    getShariaFramework:  ()     => _manufacturer.getShariaFramework(),
    getMarketplace:      ()     => _manufacturer.getMarketplace(),
};

// ═══════════════════════════════════════════════════════════════════════════════
// 9. Export
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
    engine,
    SheikhaNextGenManufacturer,
    NEXTGEN_TECH_STACK,
    NEXTGEN_MATERIALS,
    AI_MANUFACTURING_CORE,
    MANUFACTURER_MARKETPLACE,
    SHARIA_MANUFACTURING_FRAMEWORK,
    PRODUCTION_INTELLIGENCE,
    VERSION,
};
