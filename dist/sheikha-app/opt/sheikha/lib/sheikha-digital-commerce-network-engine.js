/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════╗
 * ║  بسم الله الرحمن الرحيم                                                           ║
 * ║  شبكة شيخة الرقمية الذكية المتكاملة                                                ║
 * ║  Sheikha Digital Commerce & Industry Network Engine                               ║
 * ║  «التَّاجِرُ الصَّدُوقُ الأَمِينُ مَعَ النَّبِيِّينَ وَالصِّدِّيقِينَ وَالشُّهَدَاءِ»         ║
 * ║  الملكية الفكرية: سلمان أحمد بن سلمان الراجح — 2026                              ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════╝
 *
 * 12 نظام رقمي ذكي متكامل:
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  1. نظام المعادن الرقمية الذكية
 *  2. نظام السكراب الرقمي (كل المراحل والقنوات والمصادر)
 *  3. التشليح الرقمي (كل المراحل والعمليات)
 *  4. المكابس الذكية (رقمنة وأتمتة)
 *  5. المختبرات الرقمية (المطابقة والتحليل)
 *  6. النقل الذكي المتكامل
 *  7. التجارة الإلكترونية
 *  8. التجارة الرقمية
 *  9. التجارة الدولية الرقمية
 * 10. التسويق الرقمي
 * 11. التسويق الإلكتروني
 * 12. الأساس الشرعي والملكية الفكرية
 */

'use strict';

// ═══════════════════════════════════════════════════════════════════════════════
// الأساس الشرعي — كل نظام مرجعيته من الكتاب والسنة
// ═══════════════════════════════════════════════════════════════════════════════
const SHARIA = {
    tawheed: 'لا إله إلا الله محمد رسول الله',
    quran: {
        trade:      { text: '﴿ وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا ﴾', ref: 'البقرة: 275' },
        justice:    { text: '﴿ وَأَوْفُوا الْكَيْلَ وَالْمِيزَانَ بِالْقِسْطِ ﴾', ref: 'الأنعام: 152' },
        honesty:    { text: '﴿ يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَكُونُوا مَعَ الصَّادِقِينَ ﴾', ref: 'التوبة: 119' },
        iron:       { text: '﴿ وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ ﴾', ref: 'الحديد: 25' },
        earth:      { text: '﴿ هُوَ أَنشَأَكُم مِّنَ الْأَرْضِ وَاسْتَعْمَرَكُمْ فِيهَا ﴾', ref: 'هود: 61' },
        noWaste:    { text: '﴿ وَلَا تُسْرِفُوا إِنَّهُ لَا يُحِبُّ الْمُسْرِفِينَ ﴾', ref: 'الأنعام: 141' },
        noFraud:    { text: '﴿ وَلَا تَبْخَسُوا النَّاسَ أَشْيَاءَهُمْ ﴾', ref: 'الأعراف: 85' },
        witness:    { text: '﴿ وَأَشْهِدُوا إِذَا تَبَايَعْتُمْ ﴾', ref: 'البقرة: 282' },
        contracts:  { text: '﴿ يَا أَيُّهَا الَّذِينَ آمَنُوا أَوْفُوا بِالْعُقُودِ ﴾', ref: 'المائدة: 1' },
        goodWord:   { text: '﴿ وَقُولُوا لِلنَّاسِ حُسْنًا ﴾', ref: 'البقرة: 83' },
        quraysh:    { text: '﴿ لِإِيلَافِ قُرَيْشٍ ● إِيلَافِهِمْ رِحْلَةَ الشِّتَاءِ وَالصَّيْفِ ﴾', ref: 'قريش: 1-2' },
        writing:    { text: '﴿ يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا تَدَايَنتُم بِدَيْنٍ إِلَىٰ أَجَلٍ مُّسَمًّى فَاكْتُبُوهُ ﴾', ref: 'البقرة: 282' },
        strength:   { text: '﴿ وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ ﴾', ref: 'الأنفال: 60' }
    },
    hadith: {
        merchant:   { text: '«التَّاجِرُ الصَّدُوقُ الأَمِينُ مَعَ النَّبِيِّينَ وَالصِّدِّيقِينَ وَالشُّهَدَاءِ»', ref: 'الترمذي' },
        blessing:   { text: '«البيّعان بالخيار ما لم يتفرقا فإن صدقا وبيّنا بُورك لهما في بيعهما»', ref: 'البخاري ومسلم' },
        noFraud:    { text: '«من غشنا فليس منا»', ref: 'مسلم' },
        noMonopoly: { text: '«لا يحتكر إلا خاطئ»', ref: 'مسلم' },
        excellence: { text: '«إن الله يحب إذا عمل أحدكم عملاً أن يتقنه»', ref: 'البيهقي' },
        provision:  { text: '«الجالب مرزوق والمحتكر ملعون»', ref: 'ابن ماجه' },
        pricing:    { text: '«إن الله هو المسعّر القابض الباسط الرازق»', ref: 'أبو داود والترمذي' },
        trust:      { text: '«أدِّ الأمانة إلى من ائتمنك ولا تخن من خانك»', ref: 'أبو داود والترمذي' },
        cleanEarn:  { text: '«ما أكل أحد طعاماً قط خيراً من أن يأكل من عمل يده»', ref: 'البخاري' },
        marketing:  { text: '«رحم الله رجلاً سمحاً إذا باع وإذا اشترى وإذا اقتضى»', ref: 'البخاري' },
        noOath:     { text: '«إياكم وكثرة الحلف في البيع فإنه يُنفِق ثم يَمحق»', ref: 'مسلم' }
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 1. نظام المعادن الرقمية الذكية
// ═══════════════════════════════════════════════════════════════════════════════
const DIGITAL_METALS = {
    name: 'نظام المعادن الرقمية الذكية',
    nameEn: 'Smart Digital Metals System',
    quran: SHARIA.quran.iron,

    // تصنيف شامل للمعادن
    categories: {
        ferrous: {
            nameAr: 'معادن حديدية', nameEn: 'Ferrous Metals', icon: '🏗️',
            types: [
                { id: 'steel', name: 'صلب', nameEn: 'Steel', hs: '7206-7229', lme: true, density: '7.85 g/cm³' },
                { id: 'iron', name: 'حديد', nameEn: 'Iron', hs: '7201-7205', lme: true, density: '7.87 g/cm³' },
                { id: 'stainless', name: 'ستانلس ستيل', nameEn: 'Stainless Steel', hs: '7218-7223', lme: false, density: '8.0 g/cm³' },
                { id: 'cast_iron', name: 'حديد زهر', nameEn: 'Cast Iron', hs: '7201', lme: false, density: '7.15 g/cm³' }
            ]
        },
        nonFerrous: {
            nameAr: 'معادن غير حديدية', nameEn: 'Non-Ferrous Metals', icon: '🔶',
            types: [
                { id: 'copper', name: 'نحاس', nameEn: 'Copper', hs: '7401-7411', lme: true, density: '8.96 g/cm³' },
                { id: 'aluminum', name: 'ألمنيوم', nameEn: 'Aluminum', hs: '7601-7616', lme: true, density: '2.70 g/cm³' },
                { id: 'zinc', name: 'زنك', nameEn: 'Zinc', hs: '7901-7907', lme: true, density: '7.13 g/cm³' },
                { id: 'lead', name: 'رصاص', nameEn: 'Lead', hs: '7801-7806', lme: true, density: '11.34 g/cm³' },
                { id: 'nickel', name: 'نيكل', nameEn: 'Nickel', hs: '7501-7508', lme: true, density: '8.91 g/cm³' },
                { id: 'tin', name: 'قصدير', nameEn: 'Tin', hs: '8001-8007', lme: true, density: '7.31 g/cm³' },
                { id: 'brass', name: 'نحاس أصفر', nameEn: 'Brass', hs: '7403-7408', lme: false, density: '8.5 g/cm³' }
            ]
        },
        precious: {
            nameAr: 'معادن ثمينة', nameEn: 'Precious Metals', icon: '💎',
            types: [
                { id: 'gold', name: 'ذهب', nameEn: 'Gold', hs: '7108', comex: true, density: '19.3 g/cm³' },
                { id: 'silver', name: 'فضة', nameEn: 'Silver', hs: '7106', comex: true, density: '10.5 g/cm³' },
                { id: 'platinum', name: 'بلاتين', nameEn: 'Platinum', hs: '7110', comex: true, density: '21.5 g/cm³' },
                { id: 'palladium', name: 'بلاديوم', nameEn: 'Palladium', hs: '7110', comex: true, density: '12.0 g/cm³' }
            ]
        },
        rareEarth: {
            nameAr: 'عناصر أرضية نادرة', nameEn: 'Rare Earth Elements', icon: '⚗️',
            types: [
                { id: 'lithium', name: 'ليثيوم', nameEn: 'Lithium', use: 'بطاريات' },
                { id: 'cobalt', name: 'كوبالت', nameEn: 'Cobalt', use: 'بطاريات + سبائك' },
                { id: 'titanium', name: 'تيتانيوم', nameEn: 'Titanium', use: 'طيران + طب' },
                { id: 'tungsten', name: 'تنجستن', nameEn: 'Tungsten', use: 'أدوات قطع' },
                { id: 'manganese', name: 'منجنيز', nameEn: 'Manganese', use: 'سبائك صلب' }
            ]
        }
    },

    // معايير الجودة الدولية
    qualityStandards: {
        ASTM: { name: 'الجمعية الأمريكية', tests: ['تحليل كيميائي', 'اختبار شد', 'صلادة', 'تأثير'] },
        ISO: { name: 'المنظمة الدولية', tests: ['9001 إدارة جودة', '14001 بيئة', '45001 سلامة'] },
        BS: { name: 'المعيار البريطاني', tests: ['BS EN 10204', 'شهادة مطابقة'] },
        SASO: { name: 'المواصفات السعودية', tests: ['مطابقة SASO', 'علامة الجودة السعودية'] },
        LME: { name: 'بورصة لندن للمعادن', tests: ['نقاوة LME', 'شكل معتمد', 'علامة معتمدة'] }
    },

    // حساب قيمة المعدن
    calculateValue(metalId, weight, purity, marketPrice) {
        const w = parseFloat(weight) || 0;
        const p = parseFloat(purity) || 100;
        const mp = parseFloat(marketPrice) || 0;
        return { grossValue: Math.round(w * mp), netValue: Math.round(w * mp * (p / 100)), weight: w, purity: p };
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 2. نظام السكراب الرقمي — كل المراحل والقنوات والمصادر
// ═══════════════════════════════════════════════════════════════════════════════
const DIGITAL_SCRAP = {
    name: 'نظام السكراب الرقمي الشامل',
    nameEn: 'Comprehensive Digital Scrap System',
    quran: SHARIA.quran.noWaste,
    hadith: SHARIA.hadith.cleanEarn,

    // ─── مصادر السكراب ───
    sources: {
        industrial: {
            nameAr: 'سكراب صناعي', nameEn: 'Industrial Scrap', icon: '🏭',
            channels: [
                { id: 'factory_waste', name: 'مخلفات مصانع', desc: 'قصاصات وبقايا التصنيع', quality: 'عالي', consistency: 'ثابت' },
                { id: 'production_reject', name: 'مرفوضات إنتاج', desc: 'منتجات لم تجتز الفحص', quality: 'متوسط-عالي', consistency: 'متفاوت' },
                { id: 'maintenance', name: 'صيانة معدات', desc: 'قطع غيار مستبدلة', quality: 'متفاوت', consistency: 'غير منتظم' },
                { id: 'decommission', name: 'إيقاف خطوط', desc: 'معدات وآلات متقاعدة', quality: 'متوسط', consistency: 'دفعات' }
            ]
        },
        commercial: {
            nameAr: 'سكراب تجاري', nameEn: 'Commercial Scrap', icon: '🏢',
            channels: [
                { id: 'construction', name: 'مخلفات بناء', desc: 'حديد تسليح وهياكل', quality: 'متوسط', consistency: 'موسمي' },
                { id: 'demolition', name: 'هدم مباني', desc: 'معادن من هدم المنشآت', quality: 'متفاوت', consistency: 'مشاريع' },
                { id: 'renovation', name: 'تجديد مباني', desc: 'تمديدات ومعادن قديمة', quality: 'متوسط', consistency: 'مستمر' },
                { id: 'packaging', name: 'تعبئة وتغليف', desc: 'علب ألمنيوم وصفيح', quality: 'منخفض-متوسط', consistency: 'ثابت' }
            ]
        },
        municipal: {
            nameAr: 'سكراب بلدي', nameEn: 'Municipal Scrap', icon: '🏘️',
            channels: [
                { id: 'household', name: 'نفايات منزلية', desc: 'علب وأجهزة منزلية', quality: 'منخفض', consistency: 'ثابت' },
                { id: 'ewaste', name: 'نفايات إلكترونية', desc: 'أجهزة ولوحات إلكترونية', quality: 'عالي (معادن ثمينة)', consistency: 'متزايد' },
                { id: 'appliances', name: 'أجهزة كهربائية', desc: 'غسالات وثلاجات ومكيفات', quality: 'متوسط', consistency: 'مستمر' },
                { id: 'collection_points', name: 'نقاط تجميع', desc: 'حاويات فرز بلدية', quality: 'متفاوت', consistency: 'مستمر' }
            ]
        },
        automotive: {
            nameAr: 'سكراب سيارات', nameEn: 'Automotive Scrap', icon: '🚗',
            channels: [
                { id: 'endoflife', name: 'سيارات نهاية العمر', desc: 'مركبات تالفة أو قديمة', quality: 'متنوع', consistency: 'مستمر' },
                { id: 'accident', name: 'حوادث', desc: 'مركبات محطمة', quality: 'متفاوت', consistency: 'غير منتظم' },
                { id: 'parts', name: 'قطع غيار مستعملة', desc: 'محركات ونواقل وأبواب', quality: 'متوسط-عالي', consistency: 'مستمر' },
                { id: 'batteries', name: 'بطاريات', desc: 'بطاريات رصاص وليثيوم', quality: 'عالي', consistency: 'ثابت' }
            ]
        },
        maritime: {
            nameAr: 'سكراب بحري', nameEn: 'Maritime Scrap', icon: '🚢',
            channels: [
                { id: 'ship_breaking', name: 'تكسير سفن', desc: 'سفن نهاية العمر', quality: 'كبير الكمية', consistency: 'دفعات' },
                { id: 'offshore', name: 'منشآت بحرية', desc: 'منصات نفط متقاعدة', quality: 'عالي', consistency: 'نادر' },
                { id: 'containers', name: 'حاويات شحن', desc: 'حاويات تالفة أو قديمة', quality: 'متوسط', consistency: 'مستمر' }
            ]
        },
        government: {
            nameAr: 'سكراب حكومي', nameEn: 'Government Scrap', icon: '🏛️',
            channels: [
                { id: 'military', name: 'عسكري', desc: 'معدات عسكرية متقاعدة', quality: 'عالي', consistency: 'مزادات' },
                { id: 'infrastructure', name: 'بنية تحتية', desc: 'أنابيب وكابلات وأعمدة', quality: 'متوسط-عالي', consistency: 'مشاريع' },
                { id: 'utilities', name: 'مرافق', desc: 'محولات ومولدات قديمة', quality: 'عالي (نحاس)', consistency: 'دوري' }
            ]
        }
    },

    // ─── مراحل معالجة السكراب ───
    processingStages: [
        { order: 1, id: 'collection', name: 'التجميع', icon: '📥', desc: 'جمع السكراب من المصادر المختلفة',
          operations: ['استلام', 'وزن أولي', 'تصنيف مبدئي', 'تسجيل رقمي', 'تصوير'],
          digital: { app: 'تطبيق جوال للجامعين', sensor: 'ميزان رقمي', ai: 'تصنيف بالصور' } },
        { order: 2, id: 'sorting', name: 'الفرز', icon: '🔍', desc: 'فصل المعادن حسب النوع والجودة',
          operations: ['فرز مغناطيسي', 'فرز بالألوان', 'فرز يدوي', 'فرز بالكثافة', 'فرز بالتيار الدوامي'],
          digital: { sensor: 'XRF محمول', camera: 'رؤية حاسوبية', ai: 'تصنيف تلقائي' } },
        { order: 3, id: 'cleaning', name: 'التنظيف', icon: '🧹', desc: 'إزالة الشوائب والملوثات',
          operations: ['إزالة طلاء', 'إزالة بلاستيك', 'غسيل', 'تجفيف', 'إزالة زيوت'],
          digital: { sensor: 'تحليل نقاوة', monitor: 'مراقبة جودة' } },
        { order: 4, id: 'processing', name: 'المعالجة', icon: '⚙️', desc: 'قص وكبس وتجهيز حسب المواصفات',
          operations: ['قص بالليزر', 'قص بالمقصات', 'كبس', 'فرم', 'تقطيع'],
          digital: { plc: 'تحكم آلي', sensor: 'أبعاد ووزن', ai: 'تحسين القص' } },
        { order: 5, id: 'grading', name: 'التصنيف النهائي', icon: '📊', desc: 'تصنيف حسب معايير ISRI والسوق',
          operations: ['فحص XRF', 'وزن دقيق', 'تسمية ISRI', 'شهادة تحليل', 'تسعير'],
          digital: { lab: 'تحليل طيفي', system: 'ERP', report: 'شهادة رقمية' } },
        { order: 6, id: 'packaging', name: 'التعبئة والتجهيز', icon: '📦', desc: 'تعبئة وتجهيز للشحن',
          operations: ['وزن نهائي', 'ربط', 'لف بالبلاستيك', 'تحميل', 'وسم'],
          digital: { rfid: 'وسم RFID', barcode: 'باركود', photo: 'توثيق بالصور' } },
        { order: 7, id: 'storage', name: 'التخزين', icon: '🏪', desc: 'تخزين آمن ومنظم',
          operations: ['تخصيص موقع', 'تسجيل مخزون', 'مراقبة بيئية', 'جرد دوري'],
          digital: { wms: 'نظام إدارة مخازن', iot: 'حساسات بيئية', ai: 'تحسين مساحة' } },
        { order: 8, id: 'shipping', name: 'الشحن والتسليم', icon: '🚛', desc: 'شحن للمشتري أو المصهر',
          operations: ['إنشاء شحنة', 'اختيار ناقل', 'تحميل', 'وثائق', 'تتبع', 'تسليم'],
          digital: { tms: 'نظام نقل', gps: 'تتبع مباشر', sign: 'توقيع رقمي' } }
    ],

    // تصنيفات ISRI
    isriGrades: {
        ferrous: [
            { code: '200', name: 'HMS 1', desc: 'حديد ثقيل ≥6mm', minThickness: '6mm', maxSize: '1.5m×0.5m' },
            { code: '201', name: 'HMS 1 مقصوص', desc: 'حديد ثقيل مقصوص', maxSize: '1.5m×0.5m×0.5m' },
            { code: '207', name: 'HMS 2', desc: 'حديد مختلط ≥3mm', minThickness: '3mm' },
            { code: '210', name: 'HMS 2 مقصوص', desc: 'حديد مختلط مقصوص', maxSize: '1.5m×0.5m' },
            { code: '211', name: 'Shredded', desc: 'حديد مفروم', purity: '95%+', density: 'عالي' },
            { code: '214', name: 'Plate & Structural', desc: 'ألواح وهياكل ≥6mm' },
            { code: '220', name: 'Turnings', desc: 'رايش حديد', form: 'شظايا' },
            { code: '235', name: 'Cast Iron', desc: 'حديد زهر نظيف' }
        ],
        copper: [
            { code: '240', name: 'BERRY / Bare Bright', desc: 'نحاس أحمر لامع 99%+', purity: '99%+' },
            { code: '241', name: 'BIRCH / #1 Copper', desc: 'نحاس أحمر نظيف 96%+', purity: '96%+' },
            { code: '242', name: '#2 Copper', desc: 'نحاس مختلط', purity: '94%+' },
            { code: '243', name: 'Light Copper', desc: 'نحاس خفيف', purity: '88%+' },
            { code: '251', name: 'CANDY / Insulated Wire', desc: 'كابلات نحاس مغلفة', recovery: '85%+' },
            { code: '260', name: 'CLIFF / Yellow Brass', desc: 'نحاس أصفر نظيف', purity: '65% Cu' },
            { code: '270', name: 'DREAM / Radiators', desc: 'رديترات نحاس/نحاس أصفر' }
        ],
        aluminum: [
            { code: '315', name: 'TABLET / Old Sheet', desc: 'ألمنيوم قديم نظيف', purity: '99%+' },
            { code: '320', name: 'TAINT / Mixed Low Cu', desc: 'ألمنيوم مختلط قليل النحاس' },
            { code: '325', name: 'TALC / Old Cast', desc: 'ألمنيوم مسبوك قديم' },
            { code: '327', name: 'TENSE / Mixed Cast', desc: 'ألمنيوم مسبوك مختلط' },
            { code: '330', name: 'UBC', desc: 'علب ألمنيوم مستعملة', form: 'مكبوس' },
            { code: '365', name: 'ZORBA', desc: 'ألمنيوم مفروم مختلط', recovery: '90-95%' },
            { code: '380', name: 'TWITCH / Wheels', desc: 'جنوط ألمنيوم سيارات' }
        ],
        stainless: [
            { code: '301', name: '304 SS Solids', desc: 'ستانلس 304 صلب', grade: '304', nickel: '8-10%' },
            { code: '302', name: '316 SS Solids', desc: 'ستانلس 316 صلب', grade: '316', nickel: '10-14%' },
            { code: '305', name: '430 SS', desc: 'ستانلس 430 (بدون نيكل)', grade: '430', nickel: '0%' }
        ]
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 3. التشليح الرقمي — كل المراحل والعمليات
// ═══════════════════════════════════════════════════════════════════════════════
const DIGITAL_SALVAGE = {
    name: 'نظام التشليح الرقمي الذكي',
    nameEn: 'Smart Digital Auto Salvage System',
    hadith: SHARIA.hadith.cleanEarn,
    quran: SHARIA.quran.noWaste,

    // مراحل التشليح
    stages: [
        { order: 1, id: 'acquisition', name: 'الاستقبال والشراء', icon: '🚗',
          steps: ['تقييم المركبة رقمياً', 'فحص الهيكل بالذكاء الاصطناعي', 'تسعير عادل', 'نقل الملكية إلكتروني', 'تصوير 360°'],
          digital: { scan: '3D scan', ai: 'تقييم تلقائي', blockchain: 'عقد ذكي' } },
        { order: 2, id: 'inventory', name: 'الجرد والتسجيل', icon: '📋',
          steps: ['تسجيل بيانات المركبة', 'رقم الهيكل VIN', 'تاريخ المركبة', 'حالة القطع', 'تصنيف القطع'],
          digital: { vin: 'قراءة VIN آلية', db: 'قاعدة بيانات القطع', app: 'تطبيق جرد' } },
        { order: 3, id: 'dismantling', name: 'التفكيك', icon: '🔧',
          steps: ['سحب السوائل (زيت، وقود، مبرد)', 'إزالة البطارية', 'فك المحرك', 'فك ناقل الحركة', 'فك الأبواب والزجاج', 'فك التمديدات الكهربائية', 'فك العجلات والإطارات'],
          digital: { guide: 'دليل تفكيك رقمي', robot: 'روبوت مساعد', safety: 'نظام سلامة' },
          environmental: ['تصريف سوائل آمن', 'فصل مواد خطرة', 'تدوير فريون', 'معالجة زيوت'] },
        { order: 4, id: 'testing', name: 'الفحص والاختبار', icon: '🔬',
          steps: ['فحص المحرك', 'فحص إلكتروني', 'فحص كهربائي', 'اختبار ضغط', 'فحص بصري'],
          digital: { obd: 'فحص OBD-II', multimeter: 'قياسات كهربائية', camera: 'فحص بصري AI' } },
        { order: 5, id: 'cataloging', name: 'الفهرسة والتسعير', icon: '🏷️',
          steps: ['تصوير كل قطعة', 'تسجيل الحالة', 'تسعير حسب السوق', 'رفع على المنصة', 'وسم RFID'],
          digital: { photo: 'تصوير آلي', price: 'تسعير AI', listing: 'نشر تلقائي' } },
        { order: 6, id: 'storage_parts', name: 'تخزين القطع', icon: '🏪',
          steps: ['تخصيص رف', 'وسم موقع', 'تغليف حماية', 'مراقبة بيئية'],
          digital: { wms: 'نظام مخازن ذكي', rfid: 'تتبع RFID', ai: 'تحسين مساحة' } },
        { order: 7, id: 'sales', name: 'البيع والتوصيل', icon: '💰',
          steps: ['عرض القطعة', 'طلب الشراء', 'التحقق من المطابقة', 'التعبئة', 'الشحن', 'الضمان'],
          digital: { ecom: 'متجر إلكتروني', match: 'مطابقة VIN', ship: 'شحن ذكي' } },
        { order: 8, id: 'crush_recycle', name: 'الكبس وإعادة التدوير', icon: '♻️',
          steps: ['ما تبقى من الهيكل', 'كبس الحديد', 'فرز المعادن', 'شحن للمصاهر'],
          digital: { press: 'مكبس ذكي', sort: 'فرز آلي', ship: 'شحن للمصهر' } }
    ],

    // تصنيف القطع
    partsCategories: [
        { id: 'engine', name: 'محركات', icon: '🔩', demand: 'عالي' },
        { id: 'transmission', name: 'نواقل حركة', icon: '⚙️', demand: 'عالي' },
        { id: 'body', name: 'هيكل وبودي', icon: '🚗', demand: 'متوسط' },
        { id: 'electrical', name: 'كهربائيات', icon: '⚡', demand: 'عالي' },
        { id: 'interior', name: 'داخلية', icon: '💺', demand: 'متوسط' },
        { id: 'wheels', name: 'عجلات وجنوط', icon: '🛞', demand: 'عالي' },
        { id: 'cooling', name: 'تبريد', icon: '❄️', demand: 'متوسط' },
        { id: 'suspension', name: 'ميزانية وتعليق', icon: '🔧', demand: 'متوسط' },
        { id: 'glass', name: 'زجاج', icon: '🪟', demand: 'منخفض' },
        { id: 'metal_scrap', name: 'سكراب معدني', icon: '♻️', demand: 'ثابت' }
    ],

    // حساب قيمة المركبة للتشليح
    calculateVehicleValue(vehicle) {
        const baseValue = vehicle.weight || 1200; // كجم
        const metalValue = baseValue * 0.75 * (vehicle.ironPrice || 1.5); // 75% حديد
        const partsValue = (vehicle.usableParts || 20) * (vehicle.avgPartPrice || 150);
        const hazardousCost = vehicle.hazardousDisposal || 200;
        return {
            metalValue: Math.round(metalValue),
            partsValue: Math.round(partsValue),
            totalValue: Math.round(metalValue + partsValue - hazardousCost),
            hazardousCost,
            estimatedWeight: baseValue
        };
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 4. المكابس الذكية — رقمنة وأتمتة
// ═══════════════════════════════════════════════════════════════════════════════
const SMART_PRESSES = {
    name: 'نظام المكابس الذكية',
    nameEn: 'Smart Baler & Press System',
    hadith: SHARIA.hadith.excellence,

    // أنواع المكابس
    types: [
        { id: 'baler_horizontal', name: 'مكبس أفقي', nameEn: 'Horizontal Baler',
          use: 'علب ألمنيوم، صفيح، كرتون', force: '50-200 طن', output: '0.5-5 طن/ساعة',
          baleSize: '40×30×50 cm - 110×80×120 cm', baleWeight: '50-500 كجم' },
        { id: 'baler_vertical', name: 'مكبس عمودي', nameEn: 'Vertical Baler',
          use: 'كرتون، بلاستيك، نسيج', force: '10-60 طن', output: '0.2-1 طن/ساعة',
          baleSize: '60×40×50 cm - 80×60×80 cm', baleWeight: '20-200 كجم' },
        { id: 'shear_baler', name: 'مقص مكبس', nameEn: 'Shear Baler',
          use: 'حديد سكراب، هياكل', force: '200-1000 طن', output: '2-15 طن/ساعة',
          baleSize: 'حسب الضبط', baleWeight: '500-2000 كجم' },
        { id: 'briquetter', name: 'مكبس بريكت', nameEn: 'Briquetting Press',
          use: 'رايش معادن، برادة', force: '50-500 طن', output: '0.5-5 طن/ساعة',
          briquetteSize: '100-200mm قطر', density: '85-95% من الصلب' },
        { id: 'car_crusher', name: 'كابسة سيارات', nameEn: 'Car Crusher/Flattener',
          use: 'هياكل سيارات كاملة', force: '200-400 طن', output: '15-30 سيارة/يوم',
          outputSize: '30cm ارتفاع مسطح' },
        { id: 'shredder', name: 'فرّامة', nameEn: 'Shredder',
          use: 'سيارات، أجهزة، مختلط', power: '500-4000 حصان', output: '5-100 طن/ساعة',
          outputSize: '50-150mm شظايا' },
        { id: 'granulator', name: 'مطحنة حبيبات', nameEn: 'Granulator',
          use: 'كابلات، إلكترونيات', power: '50-200 حصان', output: '0.5-5 طن/ساعة',
          outputSize: '2-10mm حبيبات' }
    ],

    // حساسات المكبس الذكي
    smartSensors: {
        force: { name: 'حساس ضغط', unit: 'طن', purpose: 'قياس قوة الكبس' },
        weight: { name: 'ميزان مدمج', unit: 'كجم', purpose: 'وزن المادة والبالة' },
        dimension: { name: 'حساس أبعاد', unit: 'سم', purpose: 'قياس حجم البالة' },
        density: { name: 'حساس كثافة', unit: 'كجم/م³', purpose: 'حساب كثافة الكبس' },
        temperature: { name: 'حرارة هيدروليك', unit: '°C', purpose: 'مراقبة نظام الهيدروليك' },
        vibration: { name: 'اهتزاز', unit: 'mm/s', purpose: 'صيانة تنبؤية' },
        cycle: { name: 'عداد دورات', unit: 'دورة', purpose: 'جدولة صيانة' },
        camera: { name: 'كاميرا AI', unit: 'صورة', purpose: 'تصنيف المادة المدخلة' }
    },

    // مؤشرات أداء المكبس
    kpis: ['طن/ساعة', 'طن/يوم', 'استهلاك طاقة/طن', 'كثافة البالة', 'وقت التوقف', 'تكلفة/طن']
};

// ═══════════════════════════════════════════════════════════════════════════════
// 5. المختبرات الرقمية — المطابقة والتحليل
// ═══════════════════════════════════════════════════════════════════════════════
const DIGITAL_LABS = {
    name: 'نظام المختبرات الرقمية للمطابقة',
    nameEn: 'Digital Labs & Quality Matching System',
    quran: SHARIA.quran.justice,

    // أنواع الفحوصات
    testTypes: {
        chemical: {
            nameAr: 'تحليل كيميائي', nameEn: 'Chemical Analysis', icon: '🧪',
            methods: [
                { id: 'xrf', name: 'XRF - أشعة سينية فلورية', speed: '30 ثانية', accuracy: '±0.01%', portable: true,
                  desc: 'تحليل غير متلف لتحديد التركيب الكيميائي' },
                { id: 'oes', name: 'OES - طيف الانبعاث', speed: '60 ثانية', accuracy: '±0.001%', portable: false,
                  desc: 'تحليل دقيق جداً للسبائك' },
                { id: 'icp', name: 'ICP - بلازما مقترنة', speed: '5-15 دقيقة', accuracy: '±0.0001%', portable: false,
                  desc: 'أدق تحليل كيميائي ممكن' },
                { id: 'wet', name: 'تحليل رطب تقليدي', speed: '2-24 ساعة', accuracy: 'متفاوت', portable: false,
                  desc: 'تحليل كيميائي يدوي' }
            ]
        },
        mechanical: {
            nameAr: 'اختبارات ميكانيكية', nameEn: 'Mechanical Tests', icon: '⚙️',
            methods: [
                { id: 'tensile', name: 'اختبار شد', desc: 'قوة الشد والاستطالة', standard: 'ASTM E8' },
                { id: 'hardness', name: 'اختبار صلادة', desc: 'Brinell / Rockwell / Vickers', standard: 'ASTM E10/E18/E92' },
                { id: 'impact', name: 'اختبار صدم', desc: 'Charpy / Izod', standard: 'ASTM E23' },
                { id: 'fatigue', name: 'اختبار كلال', desc: 'مقاومة التحميل المتكرر', standard: 'ASTM E466' },
                { id: 'bend', name: 'اختبار ثني', desc: 'مقاومة الانحناء', standard: 'ASTM E290' }
            ]
        },
        physical: {
            nameAr: 'فحوصات فيزيائية', nameEn: 'Physical Tests', icon: '📐',
            methods: [
                { id: 'density', name: 'كثافة', desc: 'طريقة أرخميدس', unit: 'g/cm³' },
                { id: 'conductivity', name: 'توصيل كهربائي', desc: 'مقاومية', unit: '%IACS' },
                { id: 'magnetic', name: 'فحص مغناطيسي', desc: 'حديدي أو لا', result: 'نعم/لا' },
                { id: 'dimension', name: 'قياس أبعاد', desc: 'أبعاد ووزن دقيق', tools: 'ميكرومتر + ميزان' }
            ]
        },
        nonDestructive: {
            nameAr: 'فحوصات غير متلفة', nameEn: 'Non-Destructive Tests (NDT)', icon: '🔬',
            methods: [
                { id: 'ultrasonic', name: 'فحص بالموجات فوق الصوتية', desc: 'كشف عيوب داخلية' },
                { id: 'radiographic', name: 'فحص شعاعي', desc: 'أشعة X أو جاما' },
                { id: 'magnetic_particle', name: 'فحص بالجسيمات المغناطيسية', desc: 'عيوب سطحية' },
                { id: 'dye_penetrant', name: 'فحص بالسائل المتغلغل', desc: 'شقوق سطحية' },
                { id: 'eddy_current', name: 'فحص بالتيار الدوامي', desc: 'فرز معادن + كشف عيوب' }
            ]
        },
        environmental: {
            nameAr: 'فحوصات بيئية', nameEn: 'Environmental Tests', icon: '🌿',
            methods: [
                { id: 'radiation', name: 'إشعاع', desc: 'كشف مواد مشعة', critical: true },
                { id: 'hazmat', name: 'مواد خطرة', desc: 'PCB، أسبست، زئبق', critical: true },
                { id: 'rohs', name: 'RoHS compliance', desc: 'رصاص، كادميوم، زئبق، كروم', standard: 'EU RoHS' }
            ]
        }
    },

    // شهادات الجودة الرقمية
    certificates: {
        coa: { name: 'شهادة تحليل', nameEn: 'Certificate of Analysis (CoA)', contains: ['تركيب كيميائي', 'رقم العينة', 'طريقة الفحص', 'تاريخ'] },
        mtc: { name: 'شهادة فحص معدن', nameEn: 'Mill Test Certificate (MTC)', standard: 'EN 10204 3.1', contains: ['تركيب كيميائي', 'خواص ميكانيكية', 'أبعاد', 'معالجة حرارية'] },
        conformity: { name: 'شهادة مطابقة', nameEn: 'Certificate of Conformity', contains: ['مطابقة للمواصفات', 'المعيار المطبق', 'نتائج الفحوص'] }
    },

    // إنشاء شهادة رقمية
    generateCertificate(type, sampleData) {
        return {
            certId: 'CERT-' + Date.now().toString(36).toUpperCase(),
            type,
            ...this.certificates[type],
            sample: sampleData,
            issuedAt: new Date().toISOString(),
            issuer: 'مختبرات شيخة الرقمية',
            valid: true,
            quran: SHARIA.quran.justice
        };
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 6. النقل الذكي المتكامل
// ═══════════════════════════════════════════════════════════════════════════════
const SMART_TRANSPORT = {
    name: 'نظام النقل الذكي المتكامل',
    nameEn: 'Integrated Smart Transport System',
    quran: SHARIA.quran.quraysh,

    modes: {
        road: {
            nameAr: 'نقل بري', nameEn: 'Road Transport', icon: '🚛',
            vehicles: [
                { type: 'flatbed', name: 'مسطح', capacity: '25-40 طن', use: 'سكراب كبس، حديد' },
                { type: 'tipper', name: 'قلاب', capacity: '15-30 طن', use: 'سكراب سائب، خام' },
                { type: 'container', name: 'حاوية', capacity: '20-28 طن', use: 'تصدير، معادن معبأة' },
                { type: 'lowbed', name: 'لوبد', capacity: '40-60 طن', use: 'معدات ثقيلة' },
                { type: 'tanker', name: 'صهريج', capacity: '15-30 طن', use: 'سوائل، زيوت مستعملة' }
            ],
            digital: { gps: 'تتبع مباشر', weight: 'وزن محاور', camera: 'كاميرات', eta: 'وصول تقديري AI' }
        },
        rail: {
            nameAr: 'نقل بالسكك', nameEn: 'Rail Transport', icon: '🚂',
            types: [
                { type: 'open_wagon', name: 'عربة مكشوفة', capacity: '50-65 طن', use: 'سكراب وخام' },
                { type: 'flat_wagon', name: 'عربة مسطحة', capacity: '60 طن', use: 'بالات وحاويات' },
                { type: 'gondola', name: 'جندول', capacity: '100 طن', use: 'سكراب سائب كبير' }
            ],
            routes: ['الرياض-جدة', 'الرياض-الدمام', 'شبكة سار الشمال', 'الحرمين'],
            digital: { scheduling: 'جدولة ذكية', tracking: 'تتبع عبر السكة', manifest: 'بوليصة رقمية' }
        },
        sea: {
            nameAr: 'شحن بحري', nameEn: 'Sea Freight', icon: '🚢',
            types: [
                { type: 'bulk', name: 'سائب', capacity: '10,000-100,000+ طن', use: 'خام ومعادن' },
                { type: 'container', name: 'حاويات', capacity: '20ft=21t / 40ft=26t', use: 'سكراب معبأ' },
                { type: 'breakbulk', name: 'بضائع عامة', capacity: '5,000-30,000 طن', use: 'سبائك كبيرة' }
            ],
            saudiPorts: ['جدة الإسلامي', 'الملك عبدالعزيز (الدمام)', 'ينبع', 'جيزان', 'الجبيل'],
            docs: ['بوليصة شحن B/L', 'فاتورة تجارية', 'قائمة تعبئة', 'شهادة منشأ', 'شهادة تحليل', 'LC اعتماد مستندي'],
            digital: { booking: 'حجز رقمي', tracking: 'AIS تتبع بحري', docs: 'مستندات إلكترونية', customs: 'تخليص رقمي' }
        },
        air: {
            nameAr: 'شحن جوي', nameEn: 'Air Freight', icon: '✈️',
            use: 'معادن ثمينة، عينات، قطع عاجلة',
            capacity: '5-100 طن',
            digital: { booking: 'حجز فوري', tracking: 'تتبع مباشر', customs: 'تخليص مسبق' }
        }
    },

    // حساب أفضل وسيلة نقل
    calculateOptimal(weight, distance, urgency, value) {
        const w = parseFloat(weight) || 1;
        const results = [];
        if (w <= 40) results.push({ mode: 'road', cost: w * distance * 0.12, time: Math.ceil(distance / 800) + ' يوم', score: urgency === 'عاجل' ? 90 : 70 });
        if (w >= 50 && distance > 300) results.push({ mode: 'rail', cost: w * distance * 0.06, time: Math.ceil(distance / 400) + ' يوم', score: 80 });
        if (distance > 500 || w > 100) results.push({ mode: 'sea', cost: w * 25 + 5000, time: '15-45 يوم', score: w > 500 ? 95 : 60 });
        if (urgency === 'عاجل' && w < 10) results.push({ mode: 'air', cost: w * 15000, time: '1-3 يوم', score: 95 });
        return results.sort((a, b) => b.score - a.score);
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 7. التجارة الإلكترونية
// ═══════════════════════════════════════════════════════════════════════════════
const ECOMMERCE = {
    name: 'نظام التجارة الإلكترونية',
    nameEn: 'E-Commerce System',
    quran: SHARIA.quran.trade,
    hadith: SHARIA.hadith.blessing,

    // أنواع المتاجر
    storeTypes: [
        { id: 'b2b', name: 'تاجر لتاجر', nameEn: 'B2B', desc: 'سكراب وجملة معادن', minOrder: '1 طن' },
        { id: 'b2c', name: 'تاجر لمستهلك', nameEn: 'B2C', desc: 'قطع غيار وأجزاء', minOrder: '1 قطعة' },
        { id: 'b2g', name: 'تاجر لحكومة', nameEn: 'B2G', desc: 'مناقصات حكومية', minOrder: 'حسب المناقصة' },
        { id: 'c2b', name: 'مستهلك لتاجر', nameEn: 'C2B', desc: 'بيع سكراب منزلي', minOrder: 'أي كمية' },
        { id: 'auction', name: 'مزادات', nameEn: 'Auction', desc: 'مزادات سكراب ومعادن', format: 'إنجليزي/هولندي' }
    ],

    // وحدات النظام
    modules: {
        catalog: { name: 'كتالوج المنتجات', features: ['بحث ذكي', 'تصفية متقدمة', 'مقارنة', 'تصنيف HS', 'صور 360°'] },
        cart: { name: 'سلة المشتريات', features: ['حساب تلقائي', 'خصم كميات', 'حساب شحن', 'حساب ضريبة', 'عملات متعددة'] },
        checkout: {
            name: 'إتمام الشراء',
            paymentMethods: [
                { id: 'lc', name: 'اعتماد مستندي', nameEn: 'Letter of Credit', use: 'تجارة دولية', sharia: 'حلال' },
                { id: 'tt', name: 'تحويل بنكي', nameEn: 'Telegraphic Transfer', use: 'جميع الأحجام', sharia: 'حلال' },
                { id: 'mada', name: 'مدى', nameEn: 'Mada', use: 'محلي', sharia: 'حلال' },
                { id: 'stc_pay', name: 'STC Pay', nameEn: 'STC Pay', use: 'محلي', sharia: 'حلال' },
                { id: 'apple_pay', name: 'Apple Pay', nameEn: 'Apple Pay', use: 'محلي ودولي', sharia: 'حلال' },
                { id: 'escrow', name: 'ضمان وسيط', nameEn: 'Escrow', use: 'صفقات كبيرة', sharia: 'حلال — أمانة' },
                { id: 'murabaha', name: 'مرابحة', nameEn: 'Murabaha', use: 'تمويل شراء', sharia: 'حلال شرعاً' }
            ],
            shariaRules: ['لا ربا', 'لا غرر', 'لا غش', 'خيار المجلس', 'توثيق كامل']
        },
        orders: { name: 'إدارة الطلبات', statuses: ['جديد', 'مؤكد', 'قيد التجهيز', 'شُحن', 'في الطريق', 'مُسلّم', 'مكتمل', 'مرتجع'] },
        reviews: { name: 'تقييمات', axes: ['صدق الوصف', 'جودة المنتج', 'سرعة التسليم', 'التواصل', 'القيمة مقابل السعر'] }
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 8. التجارة الرقمية
// ═══════════════════════════════════════════════════════════════════════════════
const DIGITAL_COMMERCE = {
    name: 'نظام التجارة الرقمية',
    nameEn: 'Digital Commerce System',
    quran: SHARIA.quran.writing,

    platforms: {
        marketplace: { name: 'سوق شيخة', desc: 'السوق الرقمي المركزي للمعادن والسكراب', url: '/سوق-شيخة.html' },
        rfq: { name: 'طلب عرض سعر', desc: 'نظام RFQ ذكي مع مطابقة تلقائية', url: '/api/rfq' },
        auction: { name: 'مزادات رقمية', desc: 'مزادات شفافة بالكتاب والسنة', types: ['إنجليزي تصاعدي', 'هولندي تنازلي', 'مظاريف مختومة'] },
        tender: { name: 'مناقصات', desc: 'نظام مناقصات رقمي شفاف', features: ['نشر تلقائي', 'تقييم عروض', 'ترسية ذكية'] }
    },

    // العقود الذكية
    smartContracts: {
        types: [
            { id: 'purchase', name: 'عقد شراء', desc: 'شراء كمية محددة', auto: true },
            { id: 'supply', name: 'عقد توريد', desc: 'توريد مستمر بأسعار متفق عليها', auto: true },
            { id: 'forward', name: 'عقد آجل', desc: 'شراء مستقبلي بسعر اليوم', auto: true },
            { id: 'consignment', name: 'عقد أمانة', desc: 'بضاعة بالأمانة — الدفع عند البيع', auto: false },
            { id: 'tolling', name: 'عقد تصنيع للغير', desc: 'صهر أو معالجة مقابل أجر', auto: true }
        ],
        shariaCompliance: {
            mandatory: ['بيان الثمن والمثمن', 'تحديد الأجل', 'عدم الغرر', 'خيار المجلس', 'التوثيق الكتابي'],
            forbidden: ['ربا', 'غرر فاحش', 'جهالة', 'بيع ما لا يملك', 'بيعتان في بيعة'],
            recommended: ['شرط التحكيم الشرعي', 'شرط الجودة', 'ضمان العيوب', 'حق الإرجاع']
        }
    },

    // نظام الدفع الرقمي
    digitalPayments: {
        domestic: ['مدى', 'STC Pay', 'Apple Pay', 'تحويل بنكي محلي'],
        international: ['اعتماد مستندي L/C', 'تحويل SWIFT', 'ضمان وسيط Escrow'],
        islamicFinance: ['مرابحة', 'مشاركة', 'سلم', 'استصناع'],
        crypto: { supported: false, reason: 'قيد الدراسة الشرعية' }
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 9. التجارة الدولية الرقمية
// ═══════════════════════════════════════════════════════════════════════════════
const INTL_TRADE = {
    name: 'نظام التجارة الدولية الرقمية',
    nameEn: 'Digital International Trade System',
    quran: SHARIA.quran.quraysh,

    // شروط التسليم الدولية (Incoterms 2020)
    incoterms: [
        { code: 'EXW', name: 'تسليم المصنع', nameEn: 'Ex Works', risk: 'المشتري من المصنع', cost: 'أقل سعر' },
        { code: 'FCA', name: 'تسليم الناقل', nameEn: 'Free Carrier', risk: 'المشتري من الناقل', cost: 'منخفض' },
        { code: 'FOB', name: 'تسليم ظهر السفينة', nameEn: 'Free On Board', risk: 'المشتري من السفينة', cost: 'متوسط', popular: true },
        { code: 'CFR', name: 'تكلفة + شحن', nameEn: 'Cost & Freight', risk: 'المشتري من الميناء', cost: 'فوق متوسط' },
        { code: 'CIF', name: 'تكلفة + تأمين + شحن', nameEn: 'Cost, Insurance & Freight', risk: 'مؤمّن', cost: 'متوسط-عالي', popular: true },
        { code: 'DAP', name: 'تسليم المكان', nameEn: 'Delivered At Place', risk: 'البائع حتى الوصول', cost: 'عالي' },
        { code: 'DPU', name: 'تسليم بعد التفريغ', nameEn: 'Delivered at Place Unloaded', risk: 'البائع حتى التفريغ', cost: 'أعلى' },
        { code: 'DDP', name: 'تسليم مع الرسوم', nameEn: 'Delivered Duty Paid', risk: 'البائع كامل', cost: 'أعلى سعر' }
    ],

    // المستندات التجارية الدولية
    documents: [
        { id: 'ci', name: 'فاتورة تجارية', nameEn: 'Commercial Invoice', required: true },
        { id: 'pl', name: 'قائمة تعبئة', nameEn: 'Packing List', required: true },
        { id: 'bl', name: 'بوليصة شحن', nameEn: 'Bill of Lading', required: true },
        { id: 'co', name: 'شهادة منشأ', nameEn: 'Certificate of Origin', required: true },
        { id: 'coa', name: 'شهادة تحليل', nameEn: 'Certificate of Analysis', required: true },
        { id: 'ic', name: 'شهادة تأمين', nameEn: 'Insurance Certificate', required: 'CIF/CIP' },
        { id: 'phyto', name: 'شهادة صحية', nameEn: 'Phytosanitary Certificate', required: false },
        { id: 'fumigation', name: 'شهادة تبخير', nameEn: 'Fumigation Certificate', required: 'خشب' },
        { id: 'sgs', name: 'فحص مستقل', nameEn: 'SGS/Bureau Veritas Report', required: 'اختياري' },
        { id: 'lc', name: 'اعتماد مستندي', nameEn: 'Letter of Credit', required: 'حسب الاتفاق' }
    ],

    // التخليص الجمركي الرقمي
    customs: {
        saudiPlatforms: ['فسح (FASAH)', 'نافذة واحدة', 'تبادل'],
        procedures: ['تصنيف HS', 'تقييم جمركي', 'فحص مستندات', 'فحص بضاعة', 'دفع رسوم', 'إفراج'],
        tariffs: {
            metals_raw: '5%', metals_processed: '5-12%', scrap: '0-5%', precious: 'معفى أو 5%'
        }
    },

    // أسواق التصدير المستهدفة
    targetMarkets: {
        gcc: { countries: ['الإمارات', 'البحرين', 'الكويت', 'عُمان', 'قطر'], tariff: 'معفى (اتفاقية GCC)', proximity: 'قريب' },
        asia: { countries: ['الصين', 'الهند', 'كوريا', 'اليابان', 'تايوان'], demand: 'عالي جداً', desc: 'أكبر مستوردي سكراب' },
        europe: { countries: ['تركيا', 'إيطاليا', 'إسبانيا', 'ألمانيا'], demand: 'عالي', desc: 'معايير جودة صارمة' },
        mena: { countries: ['مصر', 'الأردن', 'العراق', 'السودان'], demand: 'متوسط', desc: 'أسواق نامية' }
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 10. التسويق الرقمي
// ═══════════════════════════════════════════════════════════════════════════════
const DIGITAL_MARKETING = {
    name: 'نظام التسويق الرقمي',
    nameEn: 'Digital Marketing System',
    hadith: SHARIA.hadith.marketing,

    channels: {
        seo: {
            nameAr: 'تحسين محركات البحث', nameEn: 'SEO', icon: '🔍',
            strategies: ['كلمات مفتاحية عربية وإنجليزية', 'محتوى تقني متخصص', 'روابط خلفية', 'سرعة الموقع', 'Schema markup'],
            keywords: ['سكراب معادن', 'حديد سكراب', 'نحاس سكراب', 'ألمنيوم سكراب', 'metal scrap Saudi', 'copper scrap KSA']
        },
        sem: {
            nameAr: 'إعلانات البحث', nameEn: 'SEM / PPC', icon: '📢',
            platforms: ['Google Ads', 'Bing Ads'],
            targeting: ['كلمات مفتاحية صناعية', 'جغرافي (السعودية + خليج)', 'B2B decision makers']
        },
        social: {
            nameAr: 'تسويق اجتماعي', nameEn: 'Social Media Marketing', icon: '📱',
            platforms: [
                { name: 'LinkedIn', use: 'B2B معادن وصناعة', priority: 'عالي' },
                { name: 'X (Twitter)', use: 'أخبار السوق والأسعار', priority: 'عالي' },
                { name: 'Instagram', use: 'صور منتجات ومصانع', priority: 'متوسط' },
                { name: 'YouTube', use: 'فيديو عمليات ومقالات', priority: 'متوسط' },
                { name: 'TikTok', use: 'محتوى تعليمي قصير', priority: 'ناشئ' }
            ],
            shariaGuidelines: ['لا كذب أو مبالغة', 'لا حلف في البيع', 'صورة صادقة للمنتج', 'لا استغلال مشاعر']
        },
        email: {
            nameAr: 'التسويق بالبريد', nameEn: 'Email Marketing', icon: '📧',
            types: ['نشرة أسعار يومية', 'عروض جديدة', 'تقارير السوق', 'تنبيهات مخصصة'],
            automation: ['ترحيب تاجر جديد', 'متابعة RFQ', 'تذكير عربة مهجورة', 'تقرير شهري']
        },
        content: {
            nameAr: 'تسويق بالمحتوى', nameEn: 'Content Marketing', icon: '📝',
            types: ['تقارير السوق', 'أسعار المعادن', 'دليل ISRI', 'مقالات تعليمية', 'دراسات حالة', 'فيديو عمليات']
        },
        b2bPlatforms: {
            nameAr: 'منصات B2B', nameEn: 'B2B Platforms', icon: '🌐',
            platforms: ['Alibaba.com', 'Made-in-China', 'IndiaMART', 'TradeKey', 'سوق شيخة (sheikha.top)']
        }
    },

    // مؤشرات الأداء التسويقية
    kpis: [
        { id: 'cac', name: 'تكلفة اكتساب عميل', nameEn: 'Customer Acquisition Cost' },
        { id: 'ltv', name: 'قيمة العميل مدى الحياة', nameEn: 'Lifetime Value' },
        { id: 'conversion', name: 'معدل التحويل', nameEn: 'Conversion Rate' },
        { id: 'rfq_rate', name: 'معدل طلبات الأسعار', nameEn: 'RFQ Rate' },
        { id: 'repeat', name: 'معدل تكرار الشراء', nameEn: 'Repeat Purchase Rate' },
        { id: 'nps', name: 'صافي نقاط الترويج', nameEn: 'Net Promoter Score' },
        { id: 'roi', name: 'عائد الاستثمار التسويقي', nameEn: 'Marketing ROI' }
    ]
};

// ═══════════════════════════════════════════════════════════════════════════════
// 11. التسويق الإلكتروني
// ═══════════════════════════════════════════════════════════════════════════════
const EMARKETING = {
    name: 'نظام التسويق الإلكتروني',
    nameEn: 'Electronic Marketing System',
    hadith: SHARIA.hadith.noOath,

    // أتمتة التسويق
    automation: {
        leadScoring: {
            name: 'تقييم العملاء المحتملين', nameEn: 'Lead Scoring',
            criteria: [
                { factor: 'حجم الشركة', weight: 20 },
                { factor: 'الصناعة', weight: 15 },
                { factor: 'تفاعل مع الموقع', weight: 25 },
                { factor: 'طلب عرض سعر', weight: 30 },
                { factor: 'المنطقة الجغرافية', weight: 10 }
            ]
        },
        nurturing: {
            name: 'رعاية العملاء', nameEn: 'Lead Nurturing',
            flows: [
                { trigger: 'تسجيل جديد', actions: ['ترحيب', 'دليل البدء', 'عرض خاص', 'متابعة'] },
                { trigger: 'طلب عرض سعر', actions: ['تأكيد', 'عرض مخصص', 'متابعة', 'إغلاق'] },
                { trigger: 'عربة مهجورة', actions: ['تذكير 1 ساعة', 'تذكير 24 ساعة', 'عرض خصم'] },
                { trigger: 'عدم نشاط', actions: ['إعادة تفاعل', 'محتوى مخصص', 'عرض حصري'] }
            ]
        },
        crm: {
            name: 'إدارة علاقات العملاء', nameEn: 'CRM',
            features: ['سجل تفاعلات', 'تاريخ طلبات', 'تفضيلات', 'تنبيهات ذكية', 'تقارير']
        }
    },

    // تحليلات التسويق
    analytics: {
        webAnalytics: { tool: 'Google Analytics 4', metrics: ['زوار', 'مشاهدات', 'معدل ارتداد', 'مسار تحويل'] },
        socialAnalytics: { metrics: ['متابعين', 'تفاعل', 'وصول', 'مشاركات', 'نقرات'] },
        campaignTracking: { method: 'UTM parameters', metrics: ['تكلفة النقرة', 'تكلفة التحويل', 'ROAS'] }
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 12. الملكية الفكرية
// ═══════════════════════════════════════════════════════════════════════════════
const IP = {
    owner: 'سلمان أحمد بن سلمان الراجح',
    entity: 'مؤسسة سلمان احمد بن سلمان الراجح التجارية',
    cr: '2051263653',
    brand: 'شيخة — Sheikha',
    year: 2026,
    systems: [
        'نظام المعادن الرقمية الذكية', 'نظام السكراب الرقمي الشامل',
        'نظام التشليح الرقمي الذكي', 'نظام المكابس الذكية',
        'نظام المختبرات الرقمية', 'نظام النقل الذكي المتكامل',
        'نظام التجارة الإلكترونية', 'نظام التجارة الرقمية',
        'نظام التجارة الدولية الرقمية', 'نظام التسويق الرقمي',
        'نظام التسويق الإلكتروني'
    ],
    notice: 'جميع الحقوق محفوظة © 2026 — لا يجوز النسخ أو الاستخدام بدون إذن خطي',
    license: 'PROPRIETARY — All rights reserved'
};

// ═══════════════════════════════════════════════════════════════════════════════
// تسجيل APIs في الخادم
// ═══════════════════════════════════════════════════════════════════════════════
function registerAPIs(app, { LISTINGS, TRADERS, USERS, ORDERS, saveJSON }) {

    // ─── لوحة تحكم الشبكة الرقمية ───
    app.get('/api/digital-network/dashboard', (req, res) => {
        res.json({
            success: true,
            bismillah: 'بسم الله الرحمن الرحيم',
            network: {
                totalSystems: 12,
                systems: [
                    { id: 'metals', name: DIGITAL_METALS.name, categories: Object.keys(DIGITAL_METALS.categories).length },
                    { id: 'scrap', name: DIGITAL_SCRAP.name, sources: Object.keys(DIGITAL_SCRAP.sources).length, stages: DIGITAL_SCRAP.processingStages.length },
                    { id: 'salvage', name: DIGITAL_SALVAGE.name, stages: DIGITAL_SALVAGE.stages.length },
                    { id: 'presses', name: SMART_PRESSES.name, types: SMART_PRESSES.types.length },
                    { id: 'labs', name: DIGITAL_LABS.name, testTypes: Object.keys(DIGITAL_LABS.testTypes).length },
                    { id: 'transport', name: SMART_TRANSPORT.name, modes: Object.keys(SMART_TRANSPORT.modes).length },
                    { id: 'ecommerce', name: ECOMMERCE.name, storeTypes: ECOMMERCE.storeTypes.length },
                    { id: 'digital_commerce', name: DIGITAL_COMMERCE.name, platforms: Object.keys(DIGITAL_COMMERCE.platforms).length },
                    { id: 'intl_trade', name: INTL_TRADE.name, incoterms: INTL_TRADE.incoterms.length },
                    { id: 'digital_marketing', name: DIGITAL_MARKETING.name, channels: Object.keys(DIGITAL_MARKETING.channels).length },
                    { id: 'emarketing', name: EMARKETING.name },
                    { id: 'sharia', name: 'الأساس الشرعي', quranVerses: Object.keys(SHARIA.quran).length, hadiths: Object.keys(SHARIA.hadith).length }
                ]
            },
            ip: IP,
            timestamp: new Date().toISOString()
        });
    });

    // ─── نظام المعادن ───
    app.get('/api/digital-network/metals', (req, res) => {
        res.json({ success: true, ...DIGITAL_METALS, sharia: SHARIA.quran.iron });
    });

    // ─── نظام السكراب ───
    app.get('/api/digital-network/scrap', (req, res) => {
        res.json({ success: true, name: DIGITAL_SCRAP.name, sources: DIGITAL_SCRAP.sources, stages: DIGITAL_SCRAP.processingStages, isriGrades: DIGITAL_SCRAP.isriGrades, sharia: { quran: DIGITAL_SCRAP.quran, hadith: DIGITAL_SCRAP.hadith } });
    });

    // ─── مصادر السكراب حسب القناة ───
    app.get('/api/digital-network/scrap/sources/:sourceType', (req, res) => {
        const src = DIGITAL_SCRAP.sources[req.params.sourceType];
        if (!src) return res.status(404).json({ success: false, message: 'مصدر غير موجود' });
        res.json({ success: true, source: src });
    });

    // ─── التشليح الرقمي ───
    app.get('/api/digital-network/salvage', (req, res) => {
        res.json({ success: true, ...DIGITAL_SALVAGE });
    });

    // ─── تقييم مركبة للتشليح ───
    app.post('/api/digital-network/salvage/evaluate', (req, res) => {
        const val = DIGITAL_SALVAGE.calculateVehicleValue(req.body);
        res.json({ success: true, valuation: val, hadith: SHARIA.hadith.cleanEarn });
    });

    // ─── المكابس الذكية ───
    app.get('/api/digital-network/presses', (req, res) => {
        res.json({ success: true, ...SMART_PRESSES, sharia: SHARIA.hadith.excellence });
    });

    // ─── المختبرات الرقمية ───
    app.get('/api/digital-network/labs', (req, res) => {
        res.json({ success: true, name: DIGITAL_LABS.name, testTypes: DIGITAL_LABS.testTypes, certificates: DIGITAL_LABS.certificates, sharia: SHARIA.quran.justice });
    });

    // ─── إنشاء شهادة تحليل ───
    app.post('/api/digital-network/labs/certificate', (req, res) => {
        const { type, sampleData } = req.body;
        if (!type) return res.status(400).json({ success: false, message: 'حدد نوع الشهادة' });
        const cert = DIGITAL_LABS.generateCertificate(type, sampleData || {});
        res.json({ success: true, certificate: cert });
    });

    // ─── النقل الذكي ───
    app.get('/api/digital-network/transport', (req, res) => {
        res.json({ success: true, ...SMART_TRANSPORT, sharia: SHARIA.quran.quraysh });
    });

    // ─── حساب أفضل وسيلة نقل ───
    app.post('/api/digital-network/transport/optimal', (req, res) => {
        const { weight, distance, urgency, value } = req.body;
        const routes = SMART_TRANSPORT.calculateOptimal(weight, distance, urgency, value);
        res.json({ success: true, routes, recommended: routes[0] || null });
    });

    // ─── التجارة الإلكترونية ───
    app.get('/api/digital-network/ecommerce', (req, res) => {
        res.json({ success: true, ...ECOMMERCE });
    });

    // ─── التجارة الرقمية ───
    app.get('/api/digital-network/digital-commerce', (req, res) => {
        res.json({ success: true, ...DIGITAL_COMMERCE });
    });

    // ─── التجارة الدولية ───
    app.get('/api/digital-network/intl-trade', (req, res) => {
        res.json({ success: true, ...INTL_TRADE });
    });

    // ─── التسويق الرقمي ───
    app.get('/api/digital-network/marketing', (req, res) => {
        res.json({ success: true, digital: DIGITAL_MARKETING, electronic: EMARKETING });
    });

    // ─── تصنيفات ISRI ───
    app.get('/api/digital-network/isri', (req, res) => {
        res.json({ success: true, grades: DIGITAL_SCRAP.isriGrades });
    });

    // ─── الأساس الشرعي ───
    app.get('/api/digital-network/sharia', (req, res) => {
        res.json({ success: true, sharia: SHARIA });
    });

    // ─── الملكية الفكرية ───
    app.get('/api/digital-network/ip', (req, res) => {
        res.json({ success: true, ip: IP });
    });

    console.log('✅ [DigitalNetwork] شبكة شيخة الرقمية — 12 نظام متكامل');
    console.log('   ⛏️ معادن | ♻️ سكراب | 🚗 تشليح | ⚙️ مكابس | 🔬 مختبرات | 🚛 نقل');
    console.log('   🛒 تجارة إلكترونية | 💻 تجارة رقمية | 🌍 تجارة دولية | 📢 تسويق رقمي');
    console.log('   ☪ «' + SHARIA.hadith.merchant.text + '»');
}

module.exports = {
    SHARIA, DIGITAL_METALS, DIGITAL_SCRAP, DIGITAL_SALVAGE, SMART_PRESSES,
    DIGITAL_LABS, SMART_TRANSPORT, ECOMMERCE, DIGITAL_COMMERCE, INTL_TRADE,
    DIGITAL_MARKETING, EMARKETING, IP, registerAPIs
};
