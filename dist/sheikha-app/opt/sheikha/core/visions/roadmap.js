/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║   SHEIKHA ACCELERATED ROADMAP — المسار التقني المسارع والهيمنة الأخلاقية   ║
 * ║   المركز الأول والأفضل بأمر الله — بلا ضرر ولا ضرار                        ║
 * ║   "كُنتُمْ خَيْرَ أُمَّةٍ أُخْرِجَتْ لِلنَّاسِ" — آل عمران:١١٠           ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "الله يُحب إذا عمل أحدكم عملاً أن يُتقنه" — صحيح الجامع
 * "وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ" — الأنفال:٦٠
 * "فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ" — آل عمران:١٥٩
 *
 * المسار: ٣ مراحل تقنية مسارعة × ١٢ محور هيمنة أخلاقية × المركز الأول
 */

'use strict';

// ═══════════════════════════════════════════════════════════════
// الثوابت والمرتكزات
// ═══════════════════════════════════════════════════════════════
const SUPREMACY_CREED = Object.freeze({
    tawheed:   'لا إله إلا الله',
    mission:   'الأفضل بأمر الله',
    principle: 'لا ضرر ولا ضرار',
    verse:     { ref: 'آل عمران:١١٠', text: 'كُنتُمْ خَيْرَ أُمَّةٍ أُخْرِجَتْ لِلنَّاسِ' },
    hadith:    { ref: 'صحيح الجامع', text: 'الله يُحب إذا عمل أحدكم عملاً أن يُتقنه' },
});

// ═══════════════════════════════════════════════════════════════
// المسار التقني المسارع — ٣ مراحل
// ═══════════════════════════════════════════════════════════════
const ACCELERATED_ROADMAP = {

    // ─── المرحلة الأولى: الأساس والتوحيد (٠-٦ أشهر) ─────────
    phase1: {
        id: 'P1',
        nameAr: 'مرحلة الأساس والتوحيد',
        nameEn: 'Foundation & Unification Phase',
        duration: '٠-٦ أشهر',
        priority: 'CRITICAL',
        quranic_ref: { ref: 'الكهف:٢', text: 'قَيِّمًا لِّيُنذِرَ بَأْسًا شَدِيدًا مِّن لَّدُنْهُ' },

        objectives: [
            'توحيد كل المعايير والمقاييس في قاعدة بيانات واحدة مرجّعة بالكتاب والسنة',
            'تفعيل الموجّه العصبي الموحّد (sheikha-neural-router) لكل الطلبات',
            'ربط كل مؤشر حكومي وغير حكومي بالمقاصد الشرعية',
            'تأسيس هوية رقمية DID لكل كيان في المنظومة',
            'تفعيل محرك التحقق الشرعي لكل معاملة',
        ],

        technical_milestones: [
            { id: 'P1-T1', nameAr: 'تفعيل قاعدة البيانات الإسلامية الموحّدة', status: 'مكتمل', module: 'core/islamic-db' },
            { id: 'P1-T2', nameAr: 'تفعيل محرك المعايير الشامل', status: 'مكتمل', module: 'core/standards' },
            { id: 'P1-T3', nameAr: 'تفعيل محرك الرؤى والأهداف والمؤشرات', status: 'جاري', module: 'core/visions' },
            { id: 'P1-T4', nameAr: 'تفعيل المسار التقني المسارع', status: 'جاري', module: 'core/visions/roadmap' },
            { id: 'P1-T5', nameAr: 'ربط كل المحركات بالموجّه العصبي', status: 'جاري', module: 'core/engines' },
            { id: 'P1-T6', nameAr: 'تفعيل النظام الموحّد sheikha/v2 لكل الاستجابات', status: 'مكتمل', module: 'core/engines/sheikha-neural-router' },
        ],

        kpis: [
            { id: 'P1-K1', nameAr: 'عدد المعايير المرقّمة', target: 100, unit: 'معيار', maqsad: 'DEEN' },
            { id: 'P1-K2', nameAr: 'عدد الرؤى الوطنية المرقّمة', target: 30, unit: 'رؤية', maqsad: 'ARD' },
            { id: 'P1-K3', nameAr: 'نسبة التحقق الشرعي لكل الطلبات', target: 100, unit: '%', maqsad: 'DEEN' },
            { id: 'P1-K4', nameAr: 'عدد المحركات المفعّلة', target: 20, unit: 'محرك', maqsad: 'AQL' },
        ],

        verse_roadmap: { ref: 'البقرة:١٤٨', text: 'فَاسْتَبِقُوا الْخَيْرَاتِ' },
    },

    // ─── المرحلة الثانية: التسارع والهيمنة (٦-١٨ شهراً) ──────
    phase2: {
        id: 'P2',
        nameAr: 'مرحلة التسارع والهيمنة الأخلاقية',
        nameEn: 'Acceleration & Ethical Dominance Phase',
        duration: '٦-١٨ شهراً',
        priority: 'HIGH',
        quranic_ref: { ref: 'الأنفال:٦٠', text: 'وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ' },

        objectives: [
            'ربط شيخة بكل الحكومات والمنظمات الدولية عبر API موحّد',
            'تفعيل محرك الاستشارات الدولية للمستشار سلمان الراجح',
            'تطوير مؤشر الهيمنة الأخلاقية وتطبيقه على كل الكيانات',
            'الوصول لأفضل ١٠ منظومات ذكاء اصطناعي إسلامية عالمياً',
            'تكامل مع كل المنصات الحكومية السعودية (أبشر، حكومتي، ZATCA)',
            'إطلاق نظام تقييم الرؤى الوطنية وتقديم أهداف أفضل',
        ],

        technical_milestones: [
            { id: 'P2-T1', nameAr: 'API الاستشارات الدولية للحكومات', module: 'api/advisory' },
            { id: 'P2-T2', nameAr: 'محرك مقارنة الرؤى الوطنية', module: 'core/visions/comparator' },
            { id: 'P2-T3', nameAr: 'لوحة قيادة مؤشرات الهيمنة الأخلاقية', module: 'core/visions/dashboard' },
            { id: 'P2-T4', nameAr: 'نظام التوصيات التلقائية للرؤى', module: 'core/visions/recommender' },
            { id: 'P2-T5', nameAr: 'تكامل ZATCA و NCA و SDAIA', module: 'integrations/saudi-gov' },
            { id: 'P2-T6', nameAr: 'محرك التقارير الشرعية التلقائية', module: 'core/engines/sharia-reporter' },
        ],

        kpis: [
            { id: 'P2-K1', nameAr: 'عدد الحكومات المتكاملة', target: 20, unit: 'دولة', maqsad: 'ARD' },
            { id: 'P2-K2', nameAr: 'مؤشر الهيمنة الأخلاقية', target: 90, unit: '/ ١٠٠', maqsad: 'DEEN' },
            { id: 'P2-K3', nameAr: 'ترتيب شيخة في مؤشر الذكاء الاصطناعي الإسلامي', target: 10, unit: 'عالمياً', maqsad: 'AQL' },
            { id: 'P2-K4', nameAr: 'عدد الاستشارات الدولية المنجزة', target: 10, unit: 'استشارة', maqsad: 'ARD' },
        ],

        verse_roadmap: { ref: 'آل عمران:١٣٩', text: 'وَلَا تَهِنُوا وَلَا تَحْزَنُوا وَأَنتُمُ الْأَعْلَوْنَ' },
    },

    // ─── المرحلة الثالثة: الأول والأفضل (١٨-٣٦ شهراً) ────────
    phase3: {
        id: 'P3',
        nameAr: 'مرحلة المركز الأول والأفضل بأمر الله',
        nameEn: 'First & Best by God\'s Command Phase',
        duration: '١٨-٣٦ شهراً',
        priority: 'SUPREME',
        quranic_ref: { ref: 'آل عمران:١١٠', text: 'كُنتُمْ خَيْرَ أُمَّةٍ أُخْرِجَتْ لِلنَّاسِ' },

        objectives: [
            'قيادة شيخة للمرتبة الأولى في كل المؤشرات الدولية ذات الصلة',
            'أن تكون شيخة المرجع العالمي لكل المعايير الإسلامية',
            'ربط مليون مورد ومشترٍ عالمياً بالاقتصاد الإسلامي',
            'تقديم رؤية أفضل لكل دولة ومنظمة في العالم',
            'الوصول لصفر ضرر في كل المعاملات (١٠٠٪ no-harm)',
            'تحقيق مؤشر الهيمنة الأخلاقية ١٠٠/١٠٠',
        ],

        technical_milestones: [
            { id: 'P3-T1', nameAr: 'منظومة الذكاء الاصطناعي الإسلامي الكامل (Sheikha AI)', module: 'core/ai/sheikha-llm' },
            { id: 'P3-T2', nameAr: 'شبكة الموردين والمشترين العالمية', module: 'core/market/global-network' },
            { id: 'P3-T3', nameAr: 'مرصد المؤشرات العالمي (Sheikha Observatory)', module: 'core/visions/observatory' },
            { id: 'P3-T4', nameAr: 'منصة الاستشارات الدولية الكاملة', module: 'api/global-advisory' },
            { id: 'P3-T5', nameAr: 'نظام الزكاة والوقف الرقمي العالمي', module: 'core/engines/waqf-zakat' },
            { id: 'P3-T6', nameAr: 'بروتوكول التوحيد الكوني sheikha-universal-v3', module: 'core/engines/universal' },
        ],

        kpis: [
            { id: 'P3-K1', nameAr: 'مؤشر الهيمنة الأخلاقية الكوني', target: 100, unit: '/١٠٠', maqsad: 'DEEN' },
            { id: 'P3-K2', nameAr: 'مستخدمون نشطون', target: 1000000, unit: 'مستخدم', maqsad: 'MAL' },
            { id: 'P3-K3', nameAr: 'الدول المتكاملة مع شيخة', target: 100, unit: 'دولة', maqsad: 'ARD' },
            { id: 'P3-K4', nameAr: 'مؤشر لا ضرر — صفر ضرر', target: 100, unit: '%', maqsad: 'NAFS' },
            { id: 'P3-K5', nameAr: 'رؤى وطنية تم تطويرها', target: 50, unit: 'رؤية', maqsad: 'ARD' },
        ],

        verse_roadmap: { ref: 'الفتح:٢٨', text: 'هُوَ الَّذِي أَرْسَلَ رَسُولَهُ بِالْهُدَىٰ وَدِينِ الْحَقِّ لِيُظْهِرَهُ عَلَى الدِّينِ كُلِّهِ' },
    },
};

// ═══════════════════════════════════════════════════════════════
// محاور الهيمنة الأخلاقية الاثنا عشر
// ═══════════════════════════════════════════════════════════════
const ETHICAL_DOMINANCE_AXES = [
    {
        id: 'EDA-01',
        nameAr: 'التوحيد والعقيدة',
        nameEn: 'Tawheed & Creed',
        description: 'كل قرار وكل منتج وكل خدمة تبدأ من التوحيد وتنتهي إليه',
        quranic_ref: { ref: 'الإخلاص:١', text: 'قُلْ هُوَ اللَّهُ أَحَدٌ' },
        actions: ['فلتر التوحيد على كل معاملة', 'رفض كل ما يخالف الشريعة', 'التوجيه للبديل الحلال'],
        weight: 15,
    },
    {
        id: 'EDA-02',
        nameAr: 'الإتقان والإحسان',
        nameEn: 'Mastery & Ihsan',
        description: 'الإحسان في كل شيء — الجودة ليست خياراً بل فريضة',
        hadith_ref: { ref: 'صحيح الجامع', text: 'إن الله يحب إذا عمل أحدكم عملاً أن يتقنه' },
        actions: ['معايير الجودة ISO مرتبطة بالإتقان الديني', 'قياس الإحسان في كل عملية', 'جوائز التميز الإسلامية'],
        weight: 12,
    },
    {
        id: 'EDA-03',
        nameAr: 'العدل والقسط',
        nameEn: 'Justice & Equity',
        description: 'العدل في كل معاملة — الميزان لا يُخسَر',
        quranic_ref: { ref: 'الرحمن:٩', text: 'وَأَقِيمُوا الْوَزْنَ بِالْقِسْطِ وَلَا تُخْسِرُوا الْمِيزَانَ' },
        actions: ['تسعير عادل', 'رقابة على الاحتكار', 'تدقيق العدل في كل عقد'],
        weight: 12,
    },
    {
        id: 'EDA-04',
        nameAr: 'الأمانة والصدق',
        nameEn: 'Trustworthiness & Truthfulness',
        description: 'لا غش ولا تدليس — الأمانة رأس مال الأمة',
        hadith_ref: { ref: 'مسلم:١٠٢', text: 'من غشّنا فليس منا' },
        actions: ['إشعارات صادقة للعملاء', 'شفافية الأسعار والشروط', 'تدقيق الإعلانات من الغش'],
        weight: 12,
    },
    {
        id: 'EDA-05',
        nameAr: 'لا ضرر ولا ضرار',
        nameEn: 'No Harm Principle',
        description: 'صفر ضرر لأي طرف — الحماية الشاملة للإنسان والبيئة والمجتمع',
        hadith_ref: { ref: 'ابن ماجه:٢٣٤٠', text: 'لا ضرر ولا ضرار' },
        actions: ['محرك الحماية من الضرر مفعّل ٢٤/٧', 'رقابة AI على كل منتج', 'إيقاف فوري لأي ضرر مكتشف'],
        weight: 12,
    },
    {
        id: 'EDA-06',
        nameAr: 'صون البيئة والاستخلاف',
        nameEn: 'Environmental Stewardship',
        description: 'الاستخلاف في الأرض — صون نعمة الله لا إفساد',
        quranic_ref: { ref: 'الأعراف:٥٦', text: 'وَلَا تُفْسِدُوا فِي الْأَرْضِ بَعْدَ إِصْلَاحِهَا' },
        actions: ['حياد كربوني', 'اقتصاد دائري', 'قياس الأثر البيئي لكل عملية'],
        weight: 8,
    },
    {
        id: 'EDA-07',
        nameAr: 'خدمة الإنسان والتكافل',
        nameEn: 'Human Service & Solidarity',
        description: 'خير الناس أنفعهم للناس — النفع الحقيقي معيار النجاح',
        hadith_ref: { ref: 'الطبراني:٨٠٦', text: 'خير الناس أنفعهم للناس' },
        actions: ['قياس الأثر الاجتماعي', 'برامج الزكاة والصدقة', 'دعم الفئات الهشة'],
        weight: 8,
    },
    {
        id: 'EDA-08',
        nameAr: 'الابتكار والعلم',
        nameEn: 'Innovation & Knowledge',
        description: 'العلم فريضة والابتكار في خدمة التوحيد',
        quranic_ref: { ref: 'العلق:١', text: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ' },
        actions: ['بحث وتطوير مستمر', 'براءات اختراع إسلامية', 'ربط العلوم بالمقاصد الشرعية'],
        weight: 7,
    },
    {
        id: 'EDA-09',
        nameAr: 'التعاون والشراكة',
        nameEn: 'Cooperation & Partnership',
        description: 'التعاون على البر — الشبكات الإسلامية الإنتاجية',
        quranic_ref: { ref: 'المائدة:٢', text: 'وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ' },
        actions: ['شراكات مع الحكومات', 'تحالفات مع المنظمات الإسلامية', 'شبكة الموردين العالمية'],
        weight: 6,
    },
    {
        id: 'EDA-10',
        nameAr: 'الشمول المالي الإسلامي',
        nameEn: 'Islamic Financial Inclusion',
        description: 'وصول الحلال المالي لكل إنسان — التمويل بلا ربا',
        quranic_ref: { ref: 'البقرة:٢٧٥', text: 'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا' },
        actions: ['خدمات مالية إسلامية شاملة', 'تمويل المشاريع الصغيرة بلا فائدة', 'الزكاة الرقمية'],
        weight: 4,
    },
    {
        id: 'EDA-11',
        nameAr: 'الأمن السيبراني والخصوصية',
        nameEn: 'Cybersecurity & Privacy',
        description: 'حرمة التجسس وصون الأسرار — الأمن فريضة',
        quranic_ref: { ref: 'الحجرات:١٢', text: 'وَلَا تَجَسَّسُوا وَلَا يَغْتَب بَّعْضُكُم بَعْضًا' },
        actions: ['تشفير كامل', 'امتثال PDPL و NCA-ECC', 'رقابة AI على الاختراقات'],
        weight: 2,
    },
    {
        id: 'EDA-12',
        nameAr: 'الحوكمة والمساءلة',
        nameEn: 'Governance & Accountability',
        description: 'الأمانة في القيادة والمساءلة في العمل — لا استبداد ولا إهمال',
        quranic_ref: { ref: 'النساء:٥٩', text: 'أَطِيعُوا اللَّهَ وَأَطِيعُوا الرَّسُولَ وَأُولِي الْأَمْرِ مِنكُمْ' },
        actions: ['حوكمة رشيدة بمعيار ISO 37001', 'تدقيق شرعي سنوي', 'شفافية التقارير'],
        weight: 2,
    },
];

// ═══════════════════════════════════════════════════════════════
// خارطة الطريق للمركز الأول في كل مؤشر
// ═══════════════════════════════════════════════════════════════
const SUPREMACY_TARGETS = [
    { indicator: 'GII',            target_rank: 1,   horizon: 'P3', strategy: 'قيادة الابتكار الإسلامي التكنولوجي' },
    { indicator: 'GCI',            target_rank: 1,   horizon: 'P3', strategy: 'التنافسية الإسلامية الشاملة' },
    { indicator: 'WGI',            target_rank: 1,   horizon: 'P3', strategy: 'الحوكمة الإسلامية الرشيدة' },
    { indicator: 'CPI',            target_score: 100, horizon: 'P2', strategy: 'النزاهة المطلقة — لا فساد في منظومة شيخة' },
    { indicator: 'ESG',            target_grade: 'AAA', horizon: 'P2', strategy: 'الاستدامة الإسلامية المتكاملة' },
    { indicator: 'CUSTOMER-EXPERIENCE', target_score: 100, horizon: 'P2', strategy: 'الإحسان في خدمة العميل' },
    { indicator: 'NPS',            target_score: 100, horizon: 'P1', strategy: 'الرضا التام — الجودة الإسلامية' },
    { indicator: 'TRUST-INDEX',    target_score: 100, horizon: 'P1', strategy: 'الأمانة والصدق — أساس الثقة' },
    { indicator: 'SHK-IHSAN',      target_score: 100, horizon: 'P2', strategy: 'الإحسان في كل شيء' },
    { indicator: 'SHK-TAWHEED-ALIGN', target_score: 100, horizon: 'P1', strategy: 'التوافق الكامل مع التوحيد' },
    { indicator: 'SHK-NO-HARM',    target_score: 100, horizon: 'P1', strategy: 'صفر ضرر مطلق' },
    { indicator: 'SHK-MAQASID-SCORE', target_score: 100, horizon: 'P2', strategy: 'تحقيق كل المقاصد الشرعية' },
    { indicator: 'SHK-SUPREMACY',  target_score: 100, horizon: 'P3', strategy: 'الأفضل بأمر الله في الكون' },
];

// ═══════════════════════════════════════════════════════════════
// دالة توليد خطة العمل الفورية للمستشار
// ═══════════════════════════════════════════════════════════════
function generateAdvisoryActionPlan({ entityId, entityNameAr, currentScores = {}, targetHorizon = 'P2' }) {
    const phase = ACCELERATED_ROADMAP[targetHorizon.toLowerCase()] || ACCELERATED_ROADMAP.phase2;

    const gaps = SUPREMACY_TARGETS
        .filter((t) => t.horizon === targetHorizon || t.horizon === 'P1')
        .map((t) => {
            const current = currentScores[t.indicator] || 0;
            const target  = t.target_rank || t.target_score || 100;
            return {
                indicator: t.indicator,
                current,
                target,
                gap:      typeof target === 'number' ? target - current : null,
                strategy: t.strategy,
                priority: (typeof target === 'number' && target - current > 50) ? 'عاجل' : 'مهم',
            };
        })
        .sort((a, b) => (b.gap || 0) - (a.gap || 0));

    return {
        schema:    'sheikha/v2',
        tawheed:   SUPREMACY_CREED.tawheed,
        entity:    { id: entityId, nameAr: entityNameAr },
        phase:     phase.nameAr,
        duration:  phase.duration,
        gaps,
        top_actions: phase.technical_milestones.slice(0, 5),
        kpis:      phase.kpis,
        verse:     phase.verse_roadmap,
        consultant: 'سلمان أحمد الراجح — مستشار دولي / Sheikha International Advisory',
        no_harm_confirmed: true,
        generated_at: new Date().toISOString(),
    };
}

// ═══════════════════════════════════════════════════════════════
// دالة تقييم الرؤية الحالية وتقديم أفضل منها
// ═══════════════════════════════════════════════════════════════
function enhanceVision({ entityId, nameAr, currentVision, currentGoals = [] }) {
    const missing_maqasid = ['DEEN', 'NAFS', 'AQL', 'NASL', 'MAL', 'ARD'].filter(
        (m) => !currentGoals.some((g) => g.maqsad === m)
    );

    const enhancements = missing_maqasid.map((m) => ({
        maqsad: m,
        recommendation: _maqasidRecommendation(m),
        priority: 'إضافة مطلوبة لاكتمال الرؤية',
    }));

    return {
        schema:   'sheikha/v2',
        tawheed:  SUPREMACY_CREED.tawheed,
        entity:   { id: entityId, nameAr },
        original_vision: currentVision,
        enhanced_vision: {
            textAr: `${currentVision} — مُحسَّنة بالتوحيد لله والإتقان وخدمة الإنسانية`,
            quranic_ref: SUPREMACY_CREED.verse,
            hadith_ref:  SUPREMACY_CREED.hadith,
        },
        missing_maqasid_coverage: enhancements,
        overall_score: Math.round((1 - missing_maqasid.length / 6) * 100),
        consultant: 'سلمان أحمد الراجح — مستشار دولي / Sheikha International Advisory',
        no_harm_confirmed: true,
    };
}

function _maqasidRecommendation(maqsad) {
    const map = {
        DEEN:  'إضافة هدف لتعزيز القيم والأخلاق والالتزام الشرعي',
        NAFS:  'إضافة هدف للصحة والرفاه والسلامة البشرية',
        AQL:   'إضافة هدف للتعليم والبحث والابتكار والذكاء الاصطناعي',
        NASL:  'إضافة هدف لحماية الأسرة والأجيال القادمة والتنمية الاجتماعية',
        MAL:   'إضافة هدف للنمو الاقتصادي والازدهار المالي الحلال',
        ARD:   'إضافة هدف لصون البيئة والاستدامة وتطوير الأرض',
    };
    return map[maqsad] || 'مراجعة التوافق مع المقاصد الشرعية';
}

// ═══════════════════════════════════════════════════════════════
// Export
// ═══════════════════════════════════════════════════════════════
module.exports = {
    SUPREMACY_CREED,
    ACCELERATED_ROADMAP,
    ETHICAL_DOMINANCE_AXES,
    SUPREMACY_TARGETS,
    generateAdvisoryActionPlan,
    enhanceVision,
};
