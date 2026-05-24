/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║   SHEIKHA INDICATORS ENGINE — المؤشرات الحكومية وغير الحكومية الموحّدة     ║
 * ║   GII · HDI · WGI · WEF · ESG · Islamic KPIs — مرقّمة بالكتاب والسنة      ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "وَأَقِيمُوا الْوَزْنَ بِالْقِسْطِ وَلَا تُخْسِرُوا الْمِيزَانَ" — الرحمن:٩
 * "إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ" — النحل:٩٠
 */

'use strict';

// ═══════════════════════════════════════════════════════════════
// ① المؤشرات الحكومية الدولية
// ═══════════════════════════════════════════════════════════════
const GOVERNMENT_INDICATORS = [
    // ─ الابتكار والتنافسية ─────────────────────────────────────
    {
        id: 'GII',
        nameAr: 'مؤشر الابتكار العالمي',
        nameEn: 'Global Innovation Index',
        body: 'WIPO / Cornell / INSEAD',
        frequency: 'سنوي',
        domain: 'الابتكار',
        maqsad: 'AQL',
        dimensions: ['المؤسسات', 'الموارد البشرية والبحث', 'البنية التحتية', 'تطور السوق', 'تطور الأعمال', 'مخرجات المعرفة والتكنولوجيا', 'المخرجات الإبداعية'],
        quranic_ref: { ref: 'العلق:١', text: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ' },
        sheikha_target: { rank: 1, strategy: 'قيادة الابتكار الإسلامي عالمياً' },
    },
    {
        id: 'GCI',
        nameAr: 'مؤشر التنافسية العالمية',
        nameEn: 'Global Competitiveness Index',
        body: 'WEF — World Economic Forum',
        frequency: 'سنوي',
        domain: 'التنافسية الاقتصادية',
        maqsad: 'MAL',
        dimensions: ['البيئة التمكينية', 'رأس المال البشري', 'الأسواق', 'نظام الابتكار'],
        quranic_ref: { ref: 'النحل:٩٠', text: 'إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ' },
        sheikha_target: { rank: 1, strategy: 'تنافسية إسلامية شاملة تجمع الأخلاق والكفاءة' },
    },
    // ─ التنمية البشرية ─────────────────────────────────────────
    {
        id: 'HDI',
        nameAr: 'مؤشر التنمية البشرية',
        nameEn: 'Human Development Index',
        body: 'UNDP',
        frequency: 'سنوي',
        domain: 'التنمية البشرية',
        maqsad: 'NAFS',
        dimensions: ['متوسط عمر الحياة', 'سنوات التعليم', 'الدخل القومي الإجمالي'],
        quranic_ref: { ref: 'الإسراء:٧٠', text: 'وَلَقَدْ كَرَّمْنَا بَنِي آدَمَ' },
        sheikha_target: { rank: 1, strategy: 'التنمية البشرية الإسلامية الشاملة روحاً وعقلاً وجسداً' },
    },
    {
        id: 'HCI',
        nameAr: 'مؤشر رأس المال البشري',
        nameEn: 'Human Capital Index',
        body: 'World Bank',
        frequency: 'سنوي',
        domain: 'رأس المال البشري',
        maqsad: 'NAFS',
        dimensions: ['البقاء', 'المدرسة', 'التعلم', 'الصحة', 'التوظيف'],
    },
    // ─ الحوكمة والحكومة الرقمية ────────────────────────────────
    {
        id: 'WGI',
        nameAr: 'مؤشرات الحوكمة العالمية',
        nameEn: 'Worldwide Governance Indicators',
        body: 'World Bank',
        frequency: 'سنوي',
        domain: 'الحوكمة',
        maqsad: 'ARD',
        dimensions: ['حرية التعبير والمساءلة', 'الاستقرار السياسي', 'فعالية الحكومة', 'جودة التشريعات', 'سيادة القانون', 'مكافحة الفساد'],
        quranic_ref: { ref: 'النساء:٥٨', text: 'إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا' },
        sheikha_target: { rank: 1, strategy: 'الحوكمة الإسلامية الرشيدة نموذج لكل الحضارات' },
    },
    {
        id: 'EGDI',
        nameAr: 'مؤشر تطوير الحكومة الإلكترونية',
        nameEn: 'E-Government Development Index',
        body: 'UN DESA',
        frequency: 'سنتين',
        domain: 'الحكومة الرقمية',
        maqsad: 'ARD',
        dimensions: ['مؤشر الخدمات الإلكترونية', 'مؤشر البنية التحتية للاتصالات', 'مؤشر رأس المال البشري'],
        sheikha_target: { rank: 1, strategy: 'الحكومة الرقمية الأسرع والأكثر شمولاً' },
    },
    {
        id: 'CPI',
        nameAr: 'مؤشر مدركات الفساد',
        nameEn: 'Corruption Perceptions Index',
        body: 'Transparency International',
        frequency: 'سنوي',
        domain: 'مكافحة الفساد',
        maqsad: 'DEEN',
        note: 'الأعلى درجةً = الأنظف من الفساد (١٠٠ = نظيف تماماً)',
        hadith_ref: { ref: 'البخاري:٦٩٤٨', text: 'لعن الله الراشي والمرتشي' },
        sheikha_target: { score: 100, strategy: 'النزاهة والشفافية أصل إسلامي لا تسامح فيه' },
    },
    // ─ الأمن والسلام ───────────────────────────────────────────
    {
        id: 'GPI',
        nameAr: 'مؤشر السلام العالمي',
        nameEn: 'Global Peace Index',
        body: 'Institute for Economics and Peace',
        frequency: 'سنوي',
        domain: 'السلام والأمن',
        maqsad: 'NAFS',
        dimensions: ['الصراعات الداخلية', 'الأمن والسلامة', 'العسكرة'],
        quranic_ref: { ref: 'البقرة:٢٠٨', text: 'يَا أَيُّهَا الَّذِينَ آمَنُوا ادْخُلُوا فِي السِّلْمِ كَافَّةً' },
    },
    // ─ البيئة والاستدامة ───────────────────────────────────────
    {
        id: 'EPI',
        nameAr: 'مؤشر الأداء البيئي',
        nameEn: 'Environmental Performance Index',
        body: 'Yale / Columbia',
        frequency: 'سنتين',
        domain: 'البيئة',
        maqsad: 'ARD',
        dimensions: ['صحة البيئة', 'أداء النظام البيئي'],
        quranic_ref: { ref: 'الأعراف:٥٦', text: 'وَلَا تُفْسِدُوا فِي الْأَرْضِ بَعْدَ إِصْلَاحِهَا' },
        sheikha_target: { rank: 1, strategy: 'الاستخلاف في الأرض يقتضي الصون لا الفساد' },
    },
    {
        id: 'SDG-INDEX',
        nameAr: 'مؤشر أهداف التنمية المستدامة',
        nameEn: 'SDG Index',
        body: 'Sustainable Development Solutions Network',
        frequency: 'سنوي',
        domain: 'التنمية المستدامة',
        maqsad: 'ARD',
        goals_covered: 17,
    },
    // ─ الاقتصاد والمال ─────────────────────────────────────────
    {
        id: 'EDB',
        nameAr: 'مؤشر سهولة ممارسة أعمال التجارة',
        nameEn: 'Ease of Doing Business Index',
        body: 'World Bank',
        frequency: 'سنوي',
        domain: 'بيئة الأعمال',
        maqsad: 'MAL',
        quranic_ref: { ref: 'البقرة:١٨٠', text: 'وَيُيَسِّرُ لَكُم مِّنْ أَمْرِكُمْ يُسْرًا' },
        sheikha_target: { rank: 1, strategy: 'التيسير في العمل أصل إسلامي — البيع الحلال السهل' },
    },
    {
        id: 'GFI',
        nameAr: 'مؤشر تطور التمويل الإسلامي العالمي',
        nameEn: 'Global Islamic Finance Index',
        body: 'CIMB Islamic / DinarStandard',
        frequency: 'سنوي',
        domain: 'التمويل الإسلامي',
        maqsad: 'MAL',
        quranic_ref: { ref: 'البقرة:٢٧٥', text: 'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا' },
        sheikha_target: { rank: 1, strategy: 'قيادة التمويل الإسلامي عالمياً عبر منظومة شيخة' },
    },
    // ─ التقنية والرقمنة ────────────────────────────────────────
    {
        id: 'NRI',
        nameAr: 'مؤشر الاستعداد الشبكي',
        nameEn: 'Network Readiness Index',
        body: 'Portulans Institute',
        frequency: 'سنوي',
        domain: 'التقنية الرقمية',
        maqsad: 'AQL',
        dimensions: ['التقنية', 'الناس', 'الحوكمة', 'الأثر'],
    },
    {
        id: 'AI-READINESS',
        nameAr: 'مؤشر الاستعداد للذكاء الاصطناعي',
        nameEn: 'AI Readiness Index',
        body: 'Oxford Insights / IDRC',
        frequency: 'سنوي',
        domain: 'الذكاء الاصطناعي',
        maqsad: 'AQL',
        sheikha_target: { rank: 1, strategy: 'قيادة الذكاء الاصطناعي الإسلامي الأخلاقي' },
    },
    // ─ الصحة ───────────────────────────────────────────────────
    {
        id: 'UHC-INDEX',
        nameAr: 'مؤشر التغطية الصحية الشاملة',
        nameEn: 'Universal Health Coverage Service Coverage Index',
        body: 'WHO / World Bank',
        frequency: 'سنوي',
        domain: 'الصحة',
        maqsad: 'NAFS',
        quranic_ref: { ref: 'المائدة:٣٢', text: 'مَنْ أَحْيَاهَا فَكَأَنَّمَا أَحْيَا النَّاسَ جَمِيعًا' },
        sheikha_target: { score: 100, strategy: 'الصحة الشاملة حق إسلامي لكل إنسان' },
    },
    // ─ التعليم ─────────────────────────────────────────────────
    {
        id: 'PISA',
        nameAr: 'مؤشر بيزا — تقييم الطلاب الدولي',
        nameEn: 'PISA — Programme for International Student Assessment',
        body: 'OECD',
        frequency: '٣ سنوات',
        domain: 'التعليم',
        maqsad: 'AQL',
        dimensions: ['القراءة', 'الرياضيات', 'العلوم'],
        quranic_ref: { ref: 'المجادلة:١١', text: 'يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ' },
    },
];

// ═══════════════════════════════════════════════════════════════
// ② المؤشرات غير الحكومية (شركات + مجتمع مدني + إعلام)
// ═══════════════════════════════════════════════════════════════
const NON_GOVERNMENT_INDICATORS = [
    {
        id: 'ESG',
        nameAr: 'مؤشرات البيئة والمجتمع والحوكمة',
        nameEn: 'Environmental, Social & Governance (ESG)',
        body: 'MSCI / S&P / Bloomberg',
        domain: 'الاستدامة المؤسسية',
        maqsad: 'ARD',
        dimensions: ['البيئة (E)', 'المجتمع (S)', 'الحوكمة (G)'],
        quranic_ref: { ref: 'الأعراف:٥٦', text: 'وَلَا تُفْسِدُوا فِي الْأَرْضِ بَعْدَ إِصْلَاحِهَا' },
        sheikha_alignment: 'ESG مندرج كلياً في أصول الشريعة الإسلامية',
        sheikha_target: { score: 'AAA', strategy: 'شيخة نموذج ESG إسلامي للعالم' },
    },
    {
        id: 'FORTUNE500-RANK',
        nameAr: 'قائمة فورتشن ٥٠٠',
        nameEn: 'Fortune 500',
        body: 'Fortune Media',
        domain: 'الشركات',
        maqsad: 'MAL',
        note: 'ترتيب أكبر الشركات عالمياً بالإيرادات',
        sheikha_target: { position: 'ضمن القائمة', strategy: 'شيخة شركة عالمية ضمن أكبر الشركات' },
    },
    {
        id: 'BRAND-FINANCE',
        nameAr: 'مؤشر قيمة العلامات التجارية',
        nameEn: 'Brand Finance Global 500',
        body: 'Brand Finance',
        domain: 'قيمة العلامة التجارية',
        maqsad: 'MAL',
    },
    {
        id: 'CUSTOMER-EXPERIENCE',
        nameAr: 'مؤشر تجربة العملاء',
        nameEn: 'Customer Experience Index (CX)',
        body: 'Forrester / Gartner',
        domain: 'تجربة العميل',
        maqsad: 'MAL',
        hadith_ref: { ref: 'مسلم:٢٦٩٩', text: 'الله في عون العبد ما كان العبد في عون أخيه' },
        sheikha_target: { score: 100, strategy: 'خدمة العميل بالإحسان — شعار شيخة' },
    },
    {
        id: 'NPS',
        nameAr: 'مؤشر صافي الترويج (ولاء العملاء)',
        nameEn: 'Net Promoter Score (NPS)',
        body: 'Bain & Company',
        domain: 'رضا العملاء',
        maqsad: 'MAL',
        note: 'يقيس رغبة العملاء في التوصية بالخدمة (٠-١٠٠)',
        sheikha_target: { score: 100, strategy: 'الرضا التام — الإتقان في الخدمة' },
    },
    {
        id: 'TRUST-INDEX',
        nameAr: 'مؤشر الثقة المؤسسية',
        nameEn: 'Edelman Trust Barometer',
        body: 'Edelman',
        domain: 'الثقة',
        maqsad: 'DEEN',
        quranic_ref: { ref: 'النساء:٥٨', text: 'إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا' },
        sheikha_target: { score: 100, strategy: 'الأمانة والصدق — أساس الثقة الإسلامية' },
    },
    {
        id: 'GREAT-PLACE-TO-WORK',
        nameAr: 'مؤشر بيئة العمل المثالية',
        nameEn: 'Great Place to Work',
        body: 'GPTW Institute',
        domain: 'بيئة العمل',
        maqsad: 'NAFS',
        hadith_ref: { ref: 'ابن ماجه:٢٤٤٣', text: 'أعطوا الأجير أجره قبل أن يجف عرقه' },
        sheikha_target: { rank: 1, strategy: 'بيئة عمل إسلامية — احترام الكرامة وحقوق العامل' },
    },
    {
        id: 'DIGITAL-MATURITY',
        nameAr: 'مؤشر النضج الرقمي',
        nameEn: 'Digital Maturity Index',
        body: 'Deloitte / McKinsey',
        domain: 'التحول الرقمي',
        maqsad: 'AQL',
        levels: ['مبتدئ', 'ناشئ', 'ملتزم', 'متقدم', 'رقمي بالكامل'],
        sheikha_target: { level: 'رقمي بالكامل', strategy: 'التحول الرقمي الكامل بمعيار شيخة' },
    },
];

// ═══════════════════════════════════════════════════════════════
// ③ مؤشرات شيخة الإسلامية الحصرية — الأفضل بأمر الله
// ═══════════════════════════════════════════════════════════════
const SHEIKHA_ISLAMIC_INDICATORS = [
    {
        id: 'SHK-IHSAN',
        nameAr: 'مؤشر الإحسان والتميز',
        nameEn: 'Sheikha Ihsan Excellence Index',
        description: 'قياس مستوى الإتقان في كل عملية — الإحسان هو أن تعبد الله كأنك تراه',
        dimensions: [
            { id: 'D1', nameAr: 'إتقان المنتج أو الخدمة', weight: 25 },
            { id: 'D2', nameAr: 'الصدق والشفافية مع العميل', weight: 25 },
            { id: 'D3', nameAr: 'الوفاء بالعهود والمواعيد', weight: 25 },
            { id: 'D4', nameAr: 'الاستمرار في التحسين', weight: 25 },
        ],
        scale: '٠-١٠٠',
        target: 100,
        quranic_ref: { ref: 'النحل:٩٠', text: 'إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ' },
        hadith_ref: { ref: 'مسلم:٨', text: 'الإحسان أن تعبد الله كأنك تراه' },
        maqsad: 'DEEN',
    },
    {
        id: 'SHK-TAWHEED-ALIGN',
        nameAr: 'مؤشر التوافق مع التوحيد',
        nameEn: 'Sheikha Tawheed Alignment Score',
        description: 'قياس مدى توافق كل قرار وخدمة ومنتج مع مبادئ التوحيد لله',
        dimensions: [
            { id: 'D1', nameAr: 'خلو من الربا والغرر والميسر', weight: 30 },
            { id: 'D2', nameAr: 'التراضي التام في كل معاملة', weight: 25 },
            { id: 'D3', nameAr: 'العدل في التسعير والوزن', weight: 25 },
            { id: 'D4', nameAr: 'صون حقوق جميع الأطراف', weight: 20 },
        ],
        scale: '٠-١٠٠',
        target: 100,
        quranic_ref: { ref: 'الإخلاص:١', text: 'قُلْ هُوَ اللَّهُ أَحَدٌ' },
        maqsad: 'DEEN',
    },
    {
        id: 'SHK-NO-HARM',
        nameAr: 'مؤشر لا ضرر ولا ضرار',
        nameEn: 'Sheikha No-Harm Index',
        description: 'قياس غياب أي ضرر على أي طرف من الأطراف في كل معاملة',
        dimensions: [
            { id: 'D1', nameAr: 'لا ضرر على العميل', weight: 30 },
            { id: 'D2', nameAr: 'لا ضرر على المجتمع', weight: 25 },
            { id: 'D3', nameAr: 'لا ضرر على البيئة', weight: 25 },
            { id: 'D4', nameAr: 'لا ضرر على الاقتصاد', weight: 20 },
        ],
        scale: '٠-١٠٠',
        target: 100,
        hadith_ref: { ref: 'ابن ماجه:٢٣٤٠', text: 'لا ضرر ولا ضرار' },
        maqsad: 'NAFS',
    },
    {
        id: 'SHK-MAQASID-SCORE',
        nameAr: 'مؤشر المقاصد الشرعية',
        nameEn: 'Sheikha Maqasid Al-Sharia Score',
        description: 'قياس مدى تحقيق كل نشاط للمقاصد الشرعية الستة',
        dimensions: [
            { id: 'DEEN',  nameAr: 'حفظ الدين',         weight: 20 },
            { id: 'NAFS',  nameAr: 'حفظ النفس',         weight: 20 },
            { id: 'AQL',   nameAr: 'حفظ العقل',          weight: 15 },
            { id: 'NASL',  nameAr: 'حفظ النسل',          weight: 15 },
            { id: 'MAL',   nameAr: 'حفظ المال',           weight: 15 },
            { id: 'ARD',   nameAr: 'تطوير الأرض',         weight: 15 },
        ],
        scale: '٠-١٠٠',
        target: 100,
        quranic_ref: { ref: 'المائدة:٣', text: 'الْيَوْمَ أَكْمَلْتُ لَكُمْ دِينَكُمْ' },
        maqsad: 'DEEN',
    },
    {
        id: 'SHK-ZAKAT-IMPACT',
        nameAr: 'مؤشر أثر الزكاة والصدقات',
        nameEn: 'Sheikha Zakat & Sadaqah Impact Index',
        description: 'قياس الأثر الحقيقي لمدفوعات الزكاة والصدقات في المجتمع',
        dimensions: [
            { id: 'D1', nameAr: 'نسبة المستفيدين من الزكاة', weight: 40 },
            { id: 'D2', nameAr: 'نسبة انخفاض الفقر', weight: 35 },
            { id: 'D3', nameAr: 'أثر الوقف في المجتمع', weight: 25 },
        ],
        scale: '٠-١٠٠',
        target: 100,
        quranic_ref: { ref: 'التوبة:٦٠', text: 'إِنَّمَا الصَّدَقَاتُ لِلْفُقَرَاءِ وَالْمَسَاكِينِ' },
        maqsad: 'MAL',
    },
    {
        id: 'SHK-KNOWLEDGE-EXCELLENCE',
        nameAr: 'مؤشر التميز المعرفي الإسلامي',
        nameEn: 'Sheikha Islamic Knowledge Excellence Index',
        description: 'قياس مستوى المعرفة الإسلامية والعلمية في المنظومة',
        dimensions: [
            { id: 'D1', nameAr: 'دقة المرجع الشرعي', weight: 30 },
            { id: 'D2', nameAr: 'اتساع المعرفة العلمية', weight: 25 },
            { id: 'D3', nameAr: 'الترابط بين العلوم والشريعة', weight: 25 },
            { id: 'D4', nameAr: 'جودة الاستنباط والاجتهاد', weight: 20 },
        ],
        scale: '٠-١٠٠',
        target: 100,
        quranic_ref: { ref: 'المجادلة:١١', text: 'يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ' },
        maqsad: 'AQL',
    },
    {
        id: 'SHK-SUPREMACY',
        nameAr: 'مؤشر الأفضلية الكونية — الأفضل بأمر الله',
        nameEn: 'Sheikha Universal Supremacy Index',
        description: 'المؤشر الجامع الذي يقيس تحقق شيخة للمركز الأول والأفضل في كل الأبعاد',
        dimensions: [
            { id: 'D1', nameAr: 'التوافق مع الكتاب والسنة', weight: 30 },
            { id: 'D2', nameAr: 'التفوق التقني والابتكار', weight: 20 },
            { id: 'D3', nameAr: 'الأثر الإيجابي على الإنسانية', weight: 20 },
            { id: 'D4', nameAr: 'الأمانة والشفافية والنزاهة', weight: 15 },
            { id: 'D5', nameAr: 'صون البيئة والموارد', weight: 15 },
        ],
        scale: '٠-١٠٠',
        target: 100,
        quranic_ref: { ref: 'آل عمران:١١٠', text: 'كُنتُمْ خَيْرَ أُمَّةٍ أُخْرِجَتْ لِلنَّاسِ' },
        hadith_ref: { ref: 'مسلم:٨', text: 'الإحسان أن تعبد الله كأنك تراه' },
        maqsad: 'DEEN',
    },
];

// ═══════════════════════════════════════════════════════════════
// ④ دالة حساب مؤشر الهيمنة الأخلاقية
// ═══════════════════════════════════════════════════════════════
function calcEthicalDominanceScore(entity = {}) {
    const weights = {
        tawheed_align:    0.30,
        no_harm:          0.20,
        maqasid_score:    0.20,
        ihsan_excellence: 0.15,
        zakat_impact:     0.10,
        knowledge:        0.05,
    };

    const scores = {
        tawheed_align:    entity.tawheedScore    || 0,
        no_harm:          entity.noHarmScore      || 0,
        maqasid_score:    entity.maqasidScore     || 0,
        ihsan_excellence: entity.ihsanScore       || 0,
        zakat_impact:     entity.zakatScore       || 0,
        knowledge:        entity.knowledgeScore   || 0,
    };

    const total = Object.entries(weights).reduce((sum, [key, weight]) => {
        return sum + (scores[key] * weight);
    }, 0);

    return {
        score:  Math.round(total * 10) / 10,
        max:    100,
        grade:  total >= 95 ? 'الأفضل بأمر الله' : total >= 80 ? 'ممتاز' : total >= 60 ? 'جيد جداً' : 'يحتاج تطوير',
        breakdown: scores,
        quranic_ref: { ref: 'آل عمران:١١٠', text: 'كُنتُمْ خَيْرَ أُمَّةٍ أُخْرِجَتْ لِلنَّاسِ' },
        no_harm_confirmed: scores.no_harm >= 95,
    };
}

// ═══════════════════════════════════════════════════════════════
// Export
// ═══════════════════════════════════════════════════════════════
module.exports = {
    GOVERNMENT_INDICATORS,
    NON_GOVERNMENT_INDICATORS,
    SHEIKHA_ISLAMIC_INDICATORS,
    calcEthicalDominanceScore,

    ALL_INDICATORS: [
        ...GOVERNMENT_INDICATORS,
        ...NON_GOVERNMENT_INDICATORS,
        ...SHEIKHA_ISLAMIC_INDICATORS,
    ],
};
