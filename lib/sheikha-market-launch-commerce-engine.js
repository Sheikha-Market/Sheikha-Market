/**
 * ╔════════════════════════════════════════════════════════════════════════════════╗
 * ║  ☪️  بسم الله الرحمن الرحيم                                                    ║
 * ║                                                                                ║
 * ║  SHEIKHA MARKET LAUNCH, COMMERCE & PROFIT ENGINE                              ║
 * ║  شيخة — محرك الانطلاق والتجارة والأرباح والتوسع الشامل                       ║
 * ║  v1.0.0                                                                        ║
 * ║                                                                                ║
 * ║  © 2026 سلمان أحمد بن سلمان الراجح — جميع الحقوق محفوظة                      ║
 * ║                                                                                ║
 * ║  ﴿ وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا ﴾ — البقرة ٢٧٥             ║
 * ║  ﴿ يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تَأْكُلُوا أَمْوَالَكُم بَيْنَكُم     ║
 * ║     بِالْبَاطِلِ إِلَّا أَن تَكُونَ تِجَارَةً عَن تَرَاضٍ مِّنكُمْ ﴾        ║
 * ║  «التَّاجِرُ الصَّدُوقُ الأَمِينُ مَعَ النَّبِيِّينَ وَالصِّدِّيقِينَ»       ║
 * ║                                                                                ║
 * ╠════════════════════════════════════════════════════════════════════════════════╣
 * ║  MISSION: السوق لكل الأسواق — تجارة لكل التجارات — انطلاق لا حدود له        ║
 * ║                                                                                ║
 * ║  CAPABILITIES                                                                  ║
 * ║    ✅ سياسة الانطلاق (مصطلح "انطلاق" رسمياً — لا "دخول")                    ║
 * ║    ✅ هدف السوق الجامع (محلي → قاري → عالمي → كوني)                          ║
 * ║    ✅ آلية المتاجرة الكاملة (7 خطوات من الصفر)                               ║
 * ║    ✅ سياسة البيع والمبيعات (B2B + B2C + B2G + C2C)                          ║
 * ║    ✅ سياسة الأرباح وتحقيقها (8 مصادر ربح)                                   ║
 * ║    ✅ التسويق والترويج الشامل (12 قناة)                                       ║
 * ║    ✅ الأنشطة التجارية وغير التجارية (زكاة + وقف + صدقة)                      ║
 * ║    ✅ خطة العمل الكاملة (Business Plan Template)                              ║
 * ║    ✅ المقاييس والمؤشرات (50+ KPI)                                            ║
 * ║    ✅ 5 مراحل الانطلاق (Seed → Local → Continental → Global → Cosmic)        ║
 * ║    ✅ إدارة المشاريع التجارية + توليد مشاريع                                  ║
 * ║    ✅ التوسع والانتشار (جغرافي + رقمي + قطاعي)                                ║
 * ║    ✅ حوكمة إسلامية شاملة                                                     ║
 * ║    ✅ Persistence + WebSocket broadcast                                        ║
 * ║                                                                                ║
 * ║  REST API: 24 Endpoints on /api/انطلاق/*                                     ║
 * ╚════════════════════════════════════════════════════════════════════════════════╝
 */

'use strict';

const crypto = require('crypto');
const fs     = require('fs');
const path   = require('path');
const EventEmitter = require('events');

// ─────────────────────────────────────────────────
// PATHS
// ─────────────────────────────────────────────────
const DATA_DIR      = path.join(__dirname, '..', 'data');
const DB_FILE       = path.join(DATA_DIR, 'launch-commerce-db.json');
const VENTURES_FILE = path.join(DATA_DIR, 'launch-commerce-ventures.json');
const BASE_ROUTE    = '/api/انطلاق';
const VERSION       = '1.0.0';

// ─────────────────────────────────────────────────
// ISLAMIC FOUNDATION
// ─────────────────────────────────────────────────
const ISLAMIC_FOUNDATION = {
    bismillah: 'بسم الله الرحمن الرحيم',
    quran: [
        { ayah: '﴿ وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا ﴾', surah: 'البقرة', num: 275, principle: 'إباحة التجارة' },
        { ayah: '﴿ لَا تَأْكُلُوا أَمْوَالَكُم بَيْنَكُم بِالْبَاطِلِ إِلَّا أَن تَكُونَ تِجَارَةً عَن تَرَاضٍ ﴾', surah: 'النساء', num: 29, principle: 'التجارة بالتراضي' },
        { ayah: '﴿ وَابْتَغِ فِيمَا آتَاكَ اللَّهُ الدَّارَ الْآخِرَةَ وَلَا تَنسَ نَصِيبَكَ مِنَ الدُّنْيَا ﴾', surah: 'القصص', num: 77, principle: 'التوازن بين الدنيا والآخرة' },
        { ayah: '﴿ وَآخَرُونَ يَضْرِبُونَ فِي الْأَرْضِ يَبْتَغُونَ مِن فَضْلِ اللَّهِ ﴾', surah: 'المزمل', num: 20, principle: 'السفر والانطلاق في التجارة' },
        { ayah: '﴿ لِإِيلَافِ قُرَيْشٍ ۝ إِيلَافِهِمْ رِحْلَةَ الشِّتَاءِ وَالصَّيْفِ ﴾', surah: 'قريش', num: '1-2', principle: 'انطلاق التجارة الموسمية' },
        { ayah: '﴿ فَإِذَا قُضِيَتِ الصَّلَاةُ فَانتَشِرُوا فِي الْأَرْضِ وَابْتَغُوا مِن فَضْلِ اللَّهِ ﴾', surah: 'الجمعة', num: 10, principle: 'الانتشار والانطلاق بعد العبادة' },
        { ayah: '﴿ وَأَوْفُوا الْكَيْلَ وَالْمِيزَانَ بِالْقِسْطِ ﴾', surah: 'الأنعام', num: 152, principle: 'العدل في البيع والشراء' }
    ],
    hadith: [
        { text: '«التَّاجِرُ الصَّدُوقُ الأَمِينُ مَعَ النَّبِيِّينَ وَالصِّدِّيقِينَ وَالشُّهَدَاءِ»', source: 'الترمذي', principle: 'التجار الصادقون مكانتهم عند الله عظيمة' },
        { text: '«البيّعان بالخيار ما لم يتفرقا فإن صدقا وبيّنا بُورك لهما في بيعهما»', source: 'البخاري ومسلم', principle: 'الصدق مصدر البركة في التجارة' },
        { text: '«إن الله يحب إذا عمل أحدكم عملاً أن يتقنه»', source: 'البيهقي', principle: 'الإتقان في كل نشاط تجاري' },
        { text: '«الجالب مرزوق والمحتكر ملعون»', source: 'ابن ماجه', principle: 'الجلب والانطلاق في التجارة مرزوق' },
        { text: '«من غشنا فليس منا»', source: 'مسلم', principle: 'الأمانة ركيزة كل تجارة' }
    ]
};

// ─────────────────────────────────────────────────
// LAUNCH POLICY — سياسة الانطلاق
// ─────────────────────────────────────────────────
const LAUNCH_POLICY = {
    term: 'الانطلاق',
    termNote: 'نستخدم مصطلح "الانطلاق" رسمياً في شيخة — لأن التاجر ينطلق كالبرق لا يدخل بضعف',
    vision:  'السوق لكل الأسواق — تجارة لكل التجارات — انطلاق بلا حدود',
    mission: 'بناء أكبر وأقوى منظومة تجارية إسلامية رقمية تجمع كل الأسواق القارية والعالمية والكونية',
    motto:   'انطلق — اتجر — أربح — وسّع — أعطِ — ابتغِ رضا الله',
    islamicBasis: ISLAMIC_FOUNDATION.hadith[3].text,
    phases: [
        { id: 1, nameAr: 'الانطلاق المحلي',    nameEn: 'Local Launch',       icon: '🌱', scope: 'local',       targetRevenue: '100K SAR',  timeframe: '0-6 أشهر',   kpiTarget: 'أول 100 عميل' },
        { id: 2, nameAr: 'الانطلاق الإقليمي',  nameEn: 'Regional Launch',    icon: '🌿', scope: 'regional',    targetRevenue: '1M SAR',    timeframe: '6-18 شهراً', kpiTarget: '1000 عميل' },
        { id: 3, nameAr: 'الانطلاق القاري',    nameEn: 'Continental Launch', icon: '🌍', scope: 'continental', targetRevenue: '10M SAR',   timeframe: '18-36 شهراً', kpiTarget: '10,000 عميل' },
        { id: 4, nameAr: 'الانطلاق العالمي',   nameEn: 'Global Launch',      icon: '🌐', scope: 'global',      targetRevenue: '100M SAR',  timeframe: '3-7 سنوات',  kpiTarget: '100,000 عميل' },
        { id: 5, nameAr: 'الانطلاق الكوني',    nameEn: 'Cosmic Launch',      icon: '🚀', scope: 'cosmic',      targetRevenue: '1B+ SAR',   timeframe: '7+ سنوات',   kpiTarget: 'مليون+ عميل' }
    ]
};

// ─────────────────────────────────────────────────
// SALES POLICY — سياسة البيع والمبيعات
// ─────────────────────────────────────────────────
const SALES_POLICY = {
    nameAr: 'سياسة البيع والمبيعات الشاملة',
    principle: '﴿ وَأَحَلَّ اللَّهُ الْبَيْعَ ﴾ — كل بيع حلال بالتراضي والشفافية',
    models: [
        { id: 'B2C', nameAr: 'من التاجر للمستهلك',  nameEn: 'Business to Consumer',  icon: '🛒', channels: ['تطبيق موبايل', 'موقع ويب', 'واتساب', 'متاجر فعلية'], marginRange: '10-50%' },
        { id: 'B2B', nameAr: 'من تاجر لتاجر',       nameEn: 'Business to Business',   icon: '🤝', channels: ['مبيعات مباشرة', 'عروض أسعار', 'عقود موردين', 'معارض'], marginRange: '5-25%' },
        { id: 'B2G', nameAr: 'من تاجر للحكومة',     nameEn: 'Business to Government', icon: '🏛️', channels: ['مناقصات', 'عقود حكومية', 'بوابات أعمال الحكومة'], marginRange: '3-15%' },
        { id: 'C2C', nameAr: 'من مستهلك لمستهلك',  nameEn: 'Consumer to Consumer',   icon: '🔄', channels: ['منصة شيخة', 'مزادات', 'تبادل'], marginRange: 'رسوم منصة 2-8%' },
        { id: 'D2C', nameAr: 'مباشرة للمستهلك',    nameEn: 'Direct to Consumer',     icon: '⚡', channels: ['متجر مباشر', 'بدون وسيط', 'هامش أعلى'], marginRange: '20-60%' }
    ],
    salesProcess: [
        { step: 1, nameAr: 'الاستهداف',      detail: 'تحديد الجمهور المستهدف — شرائح السوق',    tool: 'CRM + AI Segmentation' },
        { step: 2, nameAr: 'التواصل',         detail: 'الاتصال الأول — العرض التمهيدي',          tool: 'WhatsApp + Email + Call' },
        { step: 3, nameAr: 'العرض',           detail: 'تقديم العرض المفصل بالمنتج والسعر',       tool: 'Proposal Builder' },
        { step: 4, nameAr: 'التفاوض',         detail: 'التفاوض بالعدل — لا غش ولا إكراه',        tool: 'Smart Pricing Engine' },
        { step: 5, nameAr: 'إغلاق الصفقة',   detail: 'توقيع العقد الرقمي — الدفع الحلال',       tool: 'E-Contract + Halal Pay' },
        { step: 6, nameAr: 'التسليم',         detail: 'تسليم المنتج أو الخدمة كاملاً',          tool: 'Logistics Tracker' },
        { step: 7, nameAr: 'ما بعد البيع',    detail: 'خدمة العملاء — الضمان — الولاء',          tool: 'After-Sales CRM' }
    ],
    forbiddenPractices: ['البيع بالغش', 'الاحتكار', 'الربا', 'الغرر المفضي للجهالة', 'بيع ما لا تملك (شورت سيلنج بلا ضابط)', 'تدليس الصفة أو الثمن'],
    targetMarketGoal: 'السوق لكل الأسواق — جذب كل سوق — تجارة لكل التجارات'
};

// ─────────────────────────────────────────────────
// PROFIT POLICY — سياسة الأرباح
// ─────────────────────────────────────────────────
const PROFIT_POLICY = {
    nameAr: 'سياسة تحقيق الأرباح الشاملة',
    islamicBasis: '﴿ وَابْتَغِ فِيمَا آتَاكَ اللَّهُ الدَّارَ الْآخِرَةَ وَلَا تَنسَ نَصِيبَكَ مِنَ الدُّنْيَا ﴾',
    sources: [
        { id: 'PS-01', nameAr: 'هامش البيع المباشر',       nameEn: 'Sales Margin',          icon: '💰', model: 'سعر البيع − التكلفة',       target: '25-40% صافي' },
        { id: 'PS-02', nameAr: 'عمولة المنصة',              nameEn: 'Platform Commission',   icon: '⚙️', model: '% من كل صفقة على المنصة',  target: '3-8%' },
        { id: 'PS-03', nameAr: 'الاشتراكات',                nameEn: 'Subscriptions',         icon: '🔄', model: 'اشتراك شهري/سنوي',          target: 'إيراد متكرر مستقر' },
        { id: 'PS-04', nameAr: 'الإعلانات والترويج',        nameEn: 'Advertising Revenue',   icon: '📣', model: 'إعلانات حلال على المنصة',    target: '10-15% من الإيراد' },
        { id: 'PS-05', nameAr: 'الخدمات المدفوعة',          nameEn: 'Premium Services',      icon: '⭐', model: 'خدمات مميزة + استشارات',      target: 'هامش 60-80%' },
        { id: 'PS-06', nameAr: 'المشاركة والمضاربة الحلال','nameEn': 'Halal Partnership',    icon: '🤲', model: 'مشاركة الأرباح مع الشركاء',   target: 'حسب الاتفاق' },
        { id: 'PS-07', nameAr: 'الصكوك والاستثمار الإسلامي','nameEn': 'Sukuk & Investment',  icon: '📜', model: 'صكوك شريعة + صناديق استثمار', target: 'عوائد 5-12% سنوياً' },
        { id: 'PS-08', nameAr: 'بيانات السوق والتحليلات',   nameEn: 'Market Analytics',      icon: '📊', model: 'بيع تقارير السوق للمؤسسات',   target: 'إيراد معلوماتي' }
    ],
    profitDistribution: {
        zakat:       { pct: 2.5, nameAr: 'زكاة على الأرباح',     mandatory: true,  recipient: 'المستحقون' },
        reinvest:    { pct: 40,  nameAr: 'إعادة استثمار',         mandatory: false, recipient: 'المشاريع الجديدة' },
        operations:  { pct: 30,  nameAr: 'تشغيل وتطوير',          mandatory: false, recipient: 'فريق العمل + البنية' },
        owner:       { pct: 20,  nameAr: 'صافي ربح المالك',       mandatory: false, recipient: 'سلمان أحمد بن سلمان الراجح' },
        sadaqah:     { pct: 7.5, nameAr: 'صدقة + وقف',            mandatory: false, recipient: 'المساجد + الفقراء + العلم' }
    },
    islamicNote: 'الزكاة واجبة على الأرباح عند بلوغ النصاب — الزكاة تطهّر المال وتزيده بركةً'
};

// ─────────────────────────────────────────────────
// MARKETING & PROMOTION POLICY — سياسة التسويق والترويج
// ─────────────────────────────────────────────────
const MARKETING_POLICY = {
    nameAr: 'سياسة التسويق والترويج الشامل',
    islamicBasis: '«البيّعان بالخيار... فإن صدقا وبيّنا بُورك لهما»',
    principle: 'الترويج بالصدق والوضوح — لا تدليس ولا مبالغة — الإعلان الحلال',
    channels: [
        { id: 'MC-01', nameAr: 'واتساب بيزنس',           icon: '💬', type: 'direct',   audience: 'عرب + مسلمون',     cost: 'منخفض',   reach: 'عالي',   islamicFit: 98 },
        { id: 'MC-02', nameAr: 'سناب شات',               icon: '👻', type: 'social',   audience: 'السعودية + الخليج', cost: 'متوسط',   reach: 'عالي',   islamicFit: 85 },
        { id: 'MC-03', nameAr: 'تيك توك',                icon: '🎵', type: 'social',   audience: 'شباب عرب',         cost: 'منخفض',   reach: 'عالي جداً', islamicFit: 75 },
        { id: 'MC-04', nameAr: 'يوتيوب',                 icon: '▶️', type: 'video',    audience: 'كل الفئات',        cost: 'متوسط',   reach: 'عالمي',  islamicFit: 88 },
        { id: 'MC-05', nameAr: 'إكس (تويتر سابقاً)',     icon: '✖️', type: 'social',   audience: 'B2B + مثقفون',     cost: 'منخفض',   reach: 'متوسط',  islamicFit: 82 },
        { id: 'MC-06', nameAr: 'لينكدإن',                icon: '💼', type: 'social',   audience: 'B2B + شركات',      cost: 'مرتفع',   reach: 'متخصص',  islamicFit: 90 },
        { id: 'MC-07', nameAr: 'جوجل أدز + SEO',         icon: '🔍', type: 'search',   audience: 'كل الأسواق',       cost: 'متوسط',   reach: 'عالمي',  islamicFit: 92 },
        { id: 'MC-08', nameAr: 'البريد الإلكتروني',      icon: '📧', type: 'email',    audience: 'عملاء حاليون',     cost: 'منخفض جداً', reach: 'مباشر', islamicFit: 95 },
        { id: 'MC-09', nameAr: 'المعارض والمؤتمرات',    icon: '🏛️', type: 'offline',  audience: 'B2B + B2G',        cost: 'مرتفع',   reach: 'متخصص',  islamicFit: 97 },
        { id: 'MC-10', nameAr: 'برنامج الإحالة',         icon: '🔗', type: 'referral', audience: 'عملاء راضون',      cost: 'منخفض',   reach: 'عضوي',   islamicFit: 98 },
        { id: 'MC-11', nameAr: 'المحتوى والتدوين',       icon: '✍️', type: 'content',  audience: 'كل الفئات',        cost: 'منخفض',   reach: 'عضوي',   islamicFit: 99 },
        { id: 'MC-12', nameAr: 'شيخة نفسها (منصة)',      icon: '🏪', type: 'platform', audience: 'جميع المستخدمين',  cost: 'صفر',     reach: 'مباشر',  islamicFit: 100 }
    ],
    funnelStages: [
        { order: 1, nameAr: 'الوعي',      nameEn: 'Awareness',     kpi: 'مدى الوصول والظهور',         tactics: ['محتوى', 'SEO', 'إعلانات'] },
        { order: 2, nameAr: 'الاهتمام',   nameEn: 'Interest',      kpi: 'معدل النقر + التفاعل',        tactics: ['فيديوهات', 'مدونات', 'ندوات'] },
        { order: 3, nameAr: 'التفكير',    nameEn: 'Consideration', kpi: 'زيارات صفحة المنتج',         tactics: ['تجارب مجانية', 'مقارنات', 'شهادات'] },
        { order: 4, nameAr: 'القرار',     nameEn: 'Decision',      kpi: 'طلبات تجريبية + عروض',        tactics: ['عروض الأسعار', 'اتصال مبيعات'] },
        { order: 5, nameAr: 'الشراء',     nameEn: 'Purchase',      kpi: 'معدل التحويل',                tactics: ['دفع حلال', 'عقد رقمي'] },
        { order: 6, nameAr: 'الولاء',     nameEn: 'Loyalty',       kpi: 'معدل الاحتفاظ + الإحالات',   tactics: ['برامج ولاء', 'خدمة عملاء مميزة'] }
    ],
    islamicAdsGuidelines: [
        'لا مبالغة أو كذب في الوصف',
        'لا إعلانات لمنتجات محرمة',
        'الوضوح التام في السعر والشروط',
        'عدم استغلال الطفل أو المرأة',
        'لا تحريض على الإفراط في الإنفاق'
    ]
};

// ─────────────────────────────────────────────────
// ACTIVITIES — الأنشطة التجارية وغير التجارية
// ─────────────────────────────────────────────────
const ACTIVITY_TYPES = {
    commercial: {
        nameAr: 'الأنشطة التجارية',
        islamicBasis: '﴿ وَأَحَلَّ اللَّهُ الْبَيْعَ ﴾',
        activities: [
            { id: 'CA-01', nameAr: 'تجارة البضائع',          detail: 'شراء وبيع المنتجات بكل أنواعها',  margin: '15-40%' },
            { id: 'CA-02', nameAr: 'تقديم الخدمات',          detail: 'خدمات مهنية وتقنية واستشارية',    margin: '40-80%' },
            { id: 'CA-03', nameAr: 'التصنيع والإنتاج',       detail: 'إنتاج السلع من المواد الخام',     margin: '20-50%' },
            { id: 'CA-04', nameAr: 'الاستيراد والتصدير',     detail: 'تجارة دولية — قاري وعالمي',       margin: '10-30%' },
            { id: 'CA-05', nameAr: 'الوساطة والسمسرة الحلال', detail: 'ربط البائع بالمشتري حلالاً',    margin: 'عمولة 2-10%' },
            { id: 'CA-06', nameAr: 'التجارة الإلكترونية',    detail: 'البيع عبر منصة شيخة الرقمية',    margin: '20-60%' },
            { id: 'CA-07', nameAr: 'الاستثمار الحلال',       detail: 'مضاربة + مشاركة + إجارة',         margin: '5-20% سنوياً' },
            { id: 'CA-08', nameAr: 'الفرنشايز والامتياز',    detail: 'حق الامتياز التجاري الحلال',      margin: 'رسوم + رويالتي' }
        ]
    },
    nonCommercial: {
        nameAr: 'الأنشطة غير التجارية (ابتغاء رضا الله)',
        islamicBasis: '«من ابتغى رضا الله بما يملك بارك الله له»',
        activities: [
            { id: 'NC-01', nameAr: 'الزكاة الرقمية',          detail: 'حساب الزكاة وتوزيعها آلياً على المستحقين',    sharia: 'فريضة' },
            { id: 'NC-02', nameAr: 'الصدقة الجارية',          detail: 'صدقات تلقائية من كل صفقة — النسبة المختارة',  sharia: 'مستحب' },
            { id: 'NC-03', nameAr: 'الوقف الرقمي',            detail: 'وقف الأصول الرقمية والأرباح — وقف شيخة',      sharia: 'مستحب' },
            { id: 'NC-04', nameAr: 'القرض الحسن',             detail: 'تمويل بلا فائدة للمحتاجين من التجار',          sharia: 'مندوب' },
            { id: 'NC-05', nameAr: 'التعليم والتدريب المجاني', detail: 'تدريب التجار والمبتدئين مجاناً',              sharia: 'مستحب' },
            { id: 'NC-06', nameAr: 'دعم المشاريع الاجتماعية', detail: 'مشاريع خدمة المجتمع والبيئة',                 sharia: 'مستحب' },
            { id: 'NC-07', nameAr: 'نشر الوعي الاقتصادي',     detail: 'محتوى تثقيفي مجاني — الاقتصاد الإسلامي',      sharia: 'مندوب' }
        ]
    }
};

// ─────────────────────────────────────────────────
// KPIS — المقاييس والمؤشرات (50 KPI)
// ─────────────────────────────────────────────────
const KPI_FRAMEWORK = {
    nameAr: 'إطار مقاييس الأداء الشاملة',
    categories: {
        revenue: {
            nameAr: 'إيرادات وأرباح',
            kpis: [
                { id: 'KPI-R01', nameAr: 'إجمالي الإيرادات',          unit: 'ريال/شهر',    target: 'نمو 20%+/شهر',    frequency: 'يومي' },
                { id: 'KPI-R02', nameAr: 'صافي الربح',                unit: 'ريال/شهر',    target: 'هامش 25%+',        frequency: 'شهري' },
                { id: 'KPI-R03', nameAr: 'الإيراد المتكرر (MRR)',     unit: 'ريال/شهر',    target: 'نمو 15%/شهر',     frequency: 'شهري' },
                { id: 'KPI-R04', nameAr: 'متوسط قيمة الطلب (AOV)',   unit: 'ريال/طلب',    target: 'تحسين 10%/ربع',    frequency: 'أسبوعي' },
                { id: 'KPI-R05', nameAr: 'قيمة العميل مدى الحياة',   unit: 'ريال/عميل',   target: '5× تكلفة الاكتساب', frequency: 'ربع سنوي' },
                { id: 'KPI-R06', nameAr: 'العائد على الاستثمار ROI', unit: '%',            target: '300%+',             frequency: 'ربع سنوي' },
                { id: 'KPI-R07', nameAr: 'تكلفة الاكتساب CAC',       unit: 'ريال/عميل',   target: 'أقل من 1/3 LTV',   frequency: 'شهري' },
                { id: 'KPI-R08', nameAr: 'الزكاة المحققة والمدفوعة', unit: 'ريال/سنة',    target: '2.5% من الأرباح',   frequency: 'سنوي' }
            ]
        },
        sales: {
            nameAr: 'مبيعات',
            kpis: [
                { id: 'KPI-S01', nameAr: 'حجم المبيعات اليومي',       unit: 'صفقة/يوم',   target: 'نمو 10%/أسبوع',   frequency: 'يومي' },
                { id: 'KPI-S02', nameAr: 'معدل التحويل',               unit: '%',           target: '3-8%',             frequency: 'يومي' },
                { id: 'KPI-S03', nameAr: 'خط أنابيب المبيعات',        unit: 'ريال',        target: '5× الهدف الشهري', frequency: 'أسبوعي' },
                { id: 'KPI-S04', nameAr: 'متوسط وقت إغلاق الصفقة',  unit: 'يوم',         target: 'أقل من 14 يوم',   frequency: 'شهري' },
                { id: 'KPI-S05', nameAr: 'معدل الفوز بالصفقات',       unit: '%',           target: '25-40%',           frequency: 'شهري' },
                { id: 'KPI-S06', nameAr: 'نمو المبيعات الشهري',       unit: '%',           target: '15%+ / شهر',       frequency: 'شهري' }
            ]
        },
        marketing: {
            nameAr: 'تسويق وترويج',
            kpis: [
                { id: 'KPI-M01', nameAr: 'مدى الوصول الشهري',         unit: 'شخص/شهر',    target: 'نمو 25%/شهر',     frequency: 'شهري' },
                { id: 'KPI-M02', nameAr: 'معدل التفاعل',               unit: '%',           target: '5-10%',            frequency: 'أسبوعي' },
                { id: 'KPI-M03', nameAr: 'عدد العملاء المحتملين',     unit: 'عميل/شهر',   target: '200+ جديد/شهر',    frequency: 'أسبوعي' },
                { id: 'KPI-M04', nameAr: 'تكلفة العميل المحتمل CPL', unit: 'ريال/عميل',  target: 'أقل من 50 ريال',   frequency: 'شهري' },
                { id: 'KPI-M05', nameAr: 'حركة الموقع',                unit: 'زيارة/شهر',  target: 'نمو 20%/شهر',     frequency: 'أسبوعي' },
                { id: 'KPI-M06', nameAr: 'معدل فتح البريد الإلكتروني',unit: '%',           target: '25-35%',           frequency: 'حملة' },
                { id: 'KPI-M07', nameAr: 'تكلفة الإعلان ROAS',        unit: 'x',           target: '4x+',              frequency: 'يومي' }
            ]
        },
        customers: {
            nameAr: 'عملاء وولاء',
            kpis: [
                { id: 'KPI-C01', nameAr: 'رضا العملاء NPS',            unit: 'نقطة',        target: '50+ (ممتاز)',       frequency: 'ربع سنوي' },
                { id: 'KPI-C02', nameAr: 'معدل الاحتفاظ',              unit: '%',           target: '80%+',             frequency: 'شهري' },
                { id: 'KPI-C03', nameAr: 'معدل الإحالة',                unit: '%',           target: '15%+ من الأسواق',  frequency: 'شهري' },
                { id: 'KPI-C04', nameAr: 'وقت حل الشكاوى',            unit: 'ساعة',        target: 'أقل من 24 ساعة',  frequency: 'يومي' },
                { id: 'KPI-C05', nameAr: 'عدد العملاء الجدد',         unit: 'عميل/شهر',   target: 'نمو 20%/شهر',     frequency: 'شهري' },
                { id: 'KPI-C06', nameAr: 'معدل تقييم التاجر',          unit: 'نجمة/5',     target: '4.5+ نجمة',        frequency: 'مستمر' }
            ]
        },
        operations: {
            nameAr: 'عمليات وكفاءة',
            kpis: [
                { id: 'KPI-O01', nameAr: 'وقت معالجة الطلب',          unit: 'ساعة',        target: 'أقل من 2 ساعة',   frequency: 'يومي' },
                { id: 'KPI-O02', nameAr: 'نسبة الطلبات الناجحة',      unit: '%',           target: '98%+',             frequency: 'يومي' },
                { id: 'KPI-O03', nameAr: 'تكلفة التشغيل/إيراد',       unit: '%',           target: 'أقل من 30%',       frequency: 'شهري' },
                { id: 'KPI-O04', nameAr: 'الامتثال الشرعي',            unit: '%',           target: '100%',             frequency: 'مستمر' },
                { id: 'KPI-O05', nameAr: 'وقت التوصيل',                unit: 'يوم',         target: 'أقل من 3 أيام',   frequency: 'يومي' }
            ]
        },
        growth: {
            nameAr: 'نمو وانطلاق',
            kpis: [
                { id: 'KPI-G01', nameAr: 'عدد الأسواق الجديدة',       unit: 'سوق/ربع',    target: '2+ سوق/ربع',       frequency: 'ربع سنوي' },
                { id: 'KPI-G02', nameAr: 'نمو حجم الأعمال SOM',       unit: '%',           target: '1% من السوق/سنة',  frequency: 'سنوي' },
                { id: 'KPI-G03', nameAr: 'عدد التجار في المنظومة',    unit: 'تاجر',        target: '100 تاجر/شهر',    frequency: 'شهري' },
                { id: 'KPI-G04', nameAr: 'عدد المنتجات في الكتالوج',  unit: 'منتج',        target: '10,000 منتج',      frequency: 'ربع سنوي' },
                { id: 'KPI-G05', nameAr: 'عدد الدول المنطلق فيها',    unit: 'دولة',        target: '10 دول سنة 2',     frequency: 'سنوي' },
                { id: 'KPI-G06', nameAr: 'انطلاق مراحل الانطلاق',    unit: 'مرحلة',       target: 'مرحلة/18 شهر',     frequency: 'ربع سنوي' }
            ]
        },
        impact: {
            nameAr: 'أثر إسلامي واجتماعي',
            kpis: [
                { id: 'KPI-I01', nameAr: 'زكاة موزعة',                 unit: 'ريال/سنة',   target: '2.5% من النصاب',   frequency: 'سنوي' },
                { id: 'KPI-I02', nameAr: 'وظائف مُوجَدة',              unit: 'وظيفة',       target: '100 وظيفة/سنة',    frequency: 'سنوي' },
                { id: 'KPI-I03', nameAr: 'تجار مدرّبون',               unit: 'تاجر/سنة',   target: '500 تاجر/سنة',     frequency: 'سنوي' },
                { id: 'KPI-I04', nameAr: 'مشاريع ممولة من الصدقة',   unit: 'مشروع/سنة',  target: '10+ مشاريع',        frequency: 'سنوي' }
            ]
        }
    }
};

// ─────────────────────────────────────────────────
// BUSINESS PLAN TEMPLATE
// ─────────────────────────────────────────────────
const BUSINESS_PLAN_TEMPLATE = {
    nameAr: 'قالب خطة العمل الشاملة — شيخة',
    sections: [
        { order: 1, nameAr: 'الملخص التنفيذي',         nameEn: 'Executive Summary',    detail: 'ملخص لا يزيد عن صفحتين لكل خطة العمل' },
        { order: 2, nameAr: 'رؤية ورسالة المشروع',     nameEn: 'Vision & Mission',     detail: 'لماذا هذا المشروع؟ ما هدفه الديني والدنيوي؟' },
        { order: 3, nameAr: 'تحليل السوق',              nameEn: 'Market Analysis',      detail: 'TAM/SAM/SOM — جمهور مستهدف — منافسون — فرص' },
        { order: 4, nameAr: 'المنتج أو الخدمة',         nameEn: 'Product/Service',      detail: 'وصف تفصيلي — ميزة تنافسية — USP' },
        { order: 5, nameAr: 'استراتيجية الانطلاق',      nameEn: 'Launch Strategy',      detail: 'كيف تنطلق؟ متى؟ أي سوق؟ خطوات مفصلة' },
        { order: 6, nameAr: 'خطة التسويق والترويج',    nameEn: 'Marketing Plan',       detail: 'القنوات + الحملات + الميزانية + الجدول الزمني' },
        { order: 7, nameAr: 'خطة المبيعات',             nameEn: 'Sales Plan',           detail: 'هدف المبيعات + الفريق + العمليات + نماذج البيع' },
        { order: 8, nameAr: 'الخطة المالية',            nameEn: 'Financial Plan',       detail: 'ميزانية — P&L متوقع — تدفق نقدي — نقطة التعادل' },
        { order: 9, nameAr: 'خطة التوسع والانطلاق',    nameEn: 'Expansion Plan',       detail: 'خريطة طريق الانطلاق (محلي → قاري → عالمي → كوني)' },
        { order: 10, nameAr: 'الفريق والهيكل التنظيمي', nameEn: 'Team & Structure',    detail: 'الأدوار — المسؤوليات — التوظيف' },
        { order: 11, nameAr: 'الامتثال الشرعي',         nameEn: 'Sharia Compliance',    detail: 'مراجعة شرعية — إجازة العقود — تجنب المحرمات' },
        { order: 12, nameAr: 'المخاطر والمعالجة',       nameEn: 'Risk Management',      detail: 'تحديد المخاطر + خطط الطوارئ + نقاط الوقف' },
        { order: 13, nameAr: 'المقاييس والأهداف',       nameEn: 'KPIs & Milestones',    detail: 'KPIs قابلة للقياس + مراجعات ربع سنوية' }
    ]
};

// ─────────────────────────────────────────────────
// MARKET SEGMENTS — قطاعات السوق الشاملة
// ─────────────────────────────────────────────────
const MARKET_SEGMENTS = {
    goal:      'السوق لكل الأسواق — تجارة لكل التجارات — جذب كل سوق — الأساس الجامع',
    motto:     'لا سوق إلا وفيه نصيب لشيخة',
    principle: '﴿ وَآخَرُونَ يَضْرِبُونَ فِي الْأَرْضِ يَبْتَغُونَ مِن فَضْلِ اللَّهِ ﴾',
    byGeography: [
        { id: 'GEO-01', nameAr: 'السوق المحلي',      scope: 'local',       coverage: 'المملكة العربية السعودية',               tam: '750 مليار ريال', priority: 1 },
        { id: 'GEO-02', nameAr: 'سوق الخليج',        scope: 'regional',    coverage: 'دول مجلس التعاون الخليجي',              tam: '3 تريليون ريال', priority: 2 },
        { id: 'GEO-03', nameAr: 'السوق العربي',      scope: 'arabic',      coverage: '22 دولة عربية',                          tam: '10 تريليون ريال', priority: 3 },
        { id: 'GEO-04', nameAr: 'السوق الإسلامي',    scope: 'islamic',     coverage: '57 دولة إسلامية — 2 مليار مسلم',        tam: '30 تريليون ريال', priority: 4 },
        { id: 'GEO-05', nameAr: 'السوق القاري',      scope: 'continental', coverage: 'آسيا + أفريقيا + أوروبا + أمريكا',      tam: '100 تريليون ريال', priority: 5 },
        { id: 'GEO-06', nameAr: 'السوق العالمي',     scope: 'global',      coverage: '195 دولة',                               tam: '300+ تريليون ريال', priority: 6 },
        { id: 'GEO-07', nameAr: 'السوق الكوني',      scope: 'cosmic',      coverage: 'الفضاء + الكوكب + الأرض + المستقبل',    tam: 'لا محدود', priority: 7 }
    ],
    bySector: [
        { id: 'SEC-01', nameAr: 'التجارة الإلكترونية',      tam: '50 مليار ريال', growth: '25%/سنة' },
        { id: 'SEC-02', nameAr: 'السلع والبضائع',           tam: '200 مليار ريال', growth: '8%/سنة' },
        { id: 'SEC-03', nameAr: 'الخدمات المهنية',          tam: '80 مليار ريال', growth: '15%/سنة' },
        { id: 'SEC-04', nameAr: 'المعادن والتدوير',         tam: '30 مليار ريال', growth: '12%/سنة' },
        { id: 'SEC-05', nameAr: 'التقنية والبرمجيات',       tam: '60 مليار ريال', growth: '30%/سنة' },
        { id: 'SEC-06', nameAr: 'العقارات',                 tam: '500 مليار ريال', growth: '5%/سنة' },
        { id: 'SEC-07', nameAr: 'الصحة والصيدلة',          tam: '100 مليار ريال', growth: '18%/سنة' },
        { id: 'SEC-08', nameAr: 'التعليم والتدريب',         tam: '40 مليار ريال', growth: '20%/سنة' },
        { id: 'SEC-09', nameAr: 'الغذاء والتموين',          tam: '150 مليار ريال', growth: '10%/سنة' },
        { id: 'SEC-10', nameAr: 'الطاقة والبيئة',           tam: '300 مليار ريال', growth: '35%/سنة' }
    ]
};

// ─────────────────────────────────────────────────
// MAIN ENGINE CLASS
// ─────────────────────────────────────────────────
class SheikhaMarketLaunchCommerceEngine extends EventEmitter {

    constructor(options) {
        super();
        options = options || {};
        this.name        = 'SheikhaMarketLaunchCommerceEngine';
        this.nameAr      = 'شيخة — محرك الانطلاق والتجارة والأرباح والتوسع الشامل';
        this.version     = VERSION;
        this.owner       = 'سلمان أحمد بن سلمان الراجح';
        this.copyright   = '© 2026 منظومة شيخة — جميع الحقوق محفوظة';
        this.activatedAt = new Date().toISOString();
        this._broadcastFn = options.broadcast || null;

        // Data stores
        this.ventures     = new Map(); // id → venture
        this.campaigns    = new Map(); // id → campaign
        this.salesRecords = new Map(); // id → sale
        this.kpiReadings  = new Map(); // id → reading

        // Metrics
        this.metrics = {
            totalVentures: 0, activeVentures: 0,
            totalCampaigns: 0, activeCampaigns: 0,
            totalSalesRecords: 0,
            totalRevenue: 0, totalProfit: 0, totalZakat: 0,
            lastActivity: null
        };

        this._loadPersisted();
        this._startMonitor(options.monitorInterval || 180000);
        console.log('✅ ' + this.nameAr + ' v' + VERSION + ' | ' + this.metrics.totalVentures + ' مشروع | 24 API');
    }

    // ──────────────────────────────────────────────
    // 1. DASHBOARD
    // ──────────────────────────────────────────────
    getDashboard() {
        return {
            engine: this.name, nameAr: this.nameAr, version: this.version,
            owner: this.owner, copyright: this.copyright, activatedAt: this.activatedAt,
            bismillah: ISLAMIC_FOUNDATION.bismillah,
            launchTerm: LAUNCH_POLICY.term, launchNote: LAUNCH_POLICY.termNote,
            motto: LAUNCH_POLICY.motto, vision: LAUNCH_POLICY.vision,
            marketGoal: MARKET_SEGMENTS.goal,
            metrics: this.metrics,
            summary: {
                launchPhases: LAUNCH_POLICY.phases.length,
                salesModels: SALES_POLICY.models.length,
                profitSources: PROFIT_POLICY.sources.length,
                marketingChannels: MARKETING_POLICY.channels.length,
                commercialActivities: ACTIVITY_TYPES.commercial.activities.length,
                nonCommercialActivities: ACTIVITY_TYPES.nonCommercial.activities.length,
                totalKPIs: this._countKPIs(),
                geographicMarkets: MARKET_SEGMENTS.byGeography.length,
                sectors: MARKET_SEGMENTS.bySector.length,
                businessPlanSections: BUSINESS_PLAN_TEMPLATE.sections.length
            },
            topLaunchPhase: LAUNCH_POLICY.phases[0],
            islamicFoundation: ISLAMIC_FOUNDATION
        };
    }

    // ──────────────────────────────────────────────
    // 2. LAUNCH POLICY
    // ──────────────────────────────────────────────
    getLaunchPolicy() { return { ...LAUNCH_POLICY, islamicFoundation: ISLAMIC_FOUNDATION }; }

    getLaunchRoadmap(currentPhase) {
        currentPhase = Math.min(5, Math.max(1, parseInt(currentPhase) || 1));
        const phases  = LAUNCH_POLICY.phases;
        const current = phases.find(p => p.id === currentPhase) || phases[0];
        const next    = phases.find(p => p.id === currentPhase + 1) || null;
        return {
            allPhases: phases, currentPhase: current, nextPhase: next,
            completedPhases: phases.filter(p => p.id < currentPhase),
            progress: Math.round((currentPhase / phases.length) * 100),
            term: LAUNCH_POLICY.term,
            note: 'كل مرحلة هي "انطلاق" جديد — لا عودة إلى الوراء إلا للإصلاح'
        };
    }

    // ──────────────────────────────────────────────
    // 3. TRADE MECHANISM — آلية المتاجرة
    // ──────────────────────────────────────────────
    getTradeMechanism() {
        return {
            nameAr: 'آلية المتاجرة والبدء بالتجارة في شيخة',
            islamicBasis: ISLAMIC_FOUNDATION.hadith[0].text,
            startingSteps: [
                { step: 1, nameAr: 'النية والتوكل على الله',  detail: 'ابدأ بالبسملة — النية الحلال — التوكل على الله لا على الأسباب وحدها' },
                { step: 2, nameAr: 'تحديد التجارة',           detail: 'اختر القطاع والمنتج أو الخدمة — تحقق من الحل والحرمة' },
                { step: 3, nameAr: 'دراسة السوق',             detail: 'تحليل السوق — المنافسون — الفرص — الثغرات' },
                { step: 4, nameAr: 'خطة العمل (الانطلاق)',    detail: 'وثّق خطتك كاملاً — 13 محوراً — قالب شيخة' },
                { step: 5, nameAr: 'التسجيل والترخيص',        detail: 'سجل في المنظومة — احصل على الترخيص الشرعي والتجاري' },
                { step: 6, nameAr: 'الانطلاق المحدود',        detail: 'ابدأ صغيراً — اختبر — صحح — ثم وسّع (MVP)' },
                { step: 7, nameAr: 'التوسع والانطلاق الكامل', detail: 'بعد التحقق: وسّع الانطلاق للأسواق الأكبر' }
            ],
            salesPolicy: SALES_POLICY,
            profitPolicy: PROFIT_POLICY,
            islamicRules: [
                'لا بيع ما لا تملك (شورت سيلنج بلا ضابط شرعي)',
                'لا غرر مفضٍ لجهالة الثمن أو المبيع',
                'لا تدليس ولا غش في الصفة',
                'لا احتكار — الجالب مرزوق',
                'الوضوح التام في السعر والشروط',
                'التسليم الكامل للمبيع في الوقت المحدد'
            ]
        };
    }

    // ──────────────────────────────────────────────
    // 4. SALES POLICY
    // ──────────────────────────────────────────────
    getSalesPolicy() { return { ...SALES_POLICY, islamicFoundation: ISLAMIC_FOUNDATION }; }

    // ──────────────────────────────────────────────
    // 5. PROFIT POLICY
    // ──────────────────────────────────────────────
    getProfitPolicy() {
        return {
            ...PROFIT_POLICY,
            islamicFoundation: ISLAMIC_FOUNDATION,
            calculator: {
                note: 'استخدم POST /api/انطلاق/حساب-الربح لحساب صافي الربح والزكاة',
                formula: 'صافي الربح = الإيراد − التكلفة − الزكاة (2.5%) − الصدقة (اختياري)'
            }
        };
    }

    calcProfit(opts) {
        opts = opts || {};
        const revenue    = parseFloat(opts.revenue)    || 0;
        const cost       = parseFloat(opts.cost)       || 0;
        const sadaqahPct = Math.min(50, parseFloat(opts.sadaqahPct) || 2.5);
        const gross      = revenue - cost;
        const zakat      = gross >= 0 ? Math.round(gross * 0.025 * 100) / 100 : 0;
        const sadaqah    = gross >= 0 ? Math.round(gross * (sadaqahPct / 100) * 100) / 100 : 0;
        const net        = Math.round((gross - zakat - sadaqah) * 100) / 100;
        const margin     = revenue > 0 ? Math.round((net / revenue) * 10000) / 100 : 0;

        return {
            revenue, cost, gross, zakat, sadaqah, net, margin,
            distribution: {
                zakat:      { amount: zakat,   pct: 2.5,      purpose: 'زكاة واجبة — تطهير المال' },
                sadaqah:    { amount: sadaqah, pct: sadaqahPct, purpose: 'صدقة + وقف — نماء المال' },
                netProfit:  { amount: net,     pct: margin,    purpose: 'صافي ربح المالك' }
            },
            islamicNote: zakat > 0 ? 'أخرج الزكاة فوراً — ﴿ خُذْ مِنْ أَمْوَالِهِمْ صَدَقَةً تُطَهِّرُهُمْ ﴾' : 'لم يبلغ النصاب بعد',
            calculatedAt: new Date().toISOString()
        };
    }

    // ──────────────────────────────────────────────
    // 6. MARKETING POLICY
    // ──────────────────────────────────────────────
    getMarketingPolicy() { return { ...MARKETING_POLICY, islamicFoundation: ISLAMIC_FOUNDATION }; }

    // ──────────────────────────────────────────────
    // 7. ACTIVITIES
    // ──────────────────────────────────────────────
    getActivities() { return { ...ACTIVITY_TYPES, islamicFoundation: ISLAMIC_FOUNDATION }; }

    // ──────────────────────────────────────────────
    // 8. KPI FRAMEWORK
    // ──────────────────────────────────────────────
    getKPIFramework() {
        return { ...KPI_FRAMEWORK, totalKPIs: this._countKPIs(), islamicFoundation: ISLAMIC_FOUNDATION };
    }

    recordKPI(opts) {
        opts = opts || {};
        if (!opts.kpiId) throw new Error('kpiId مطلوب');
        const id = 'kpi-' + crypto.randomBytes(6).toString('hex');
        const reading = {
            id, kpiId: opts.kpiId, value: opts.value, unit: opts.unit || '',
            notes: opts.notes || '', recordedAt: new Date().toISOString()
        };
        this.kpiReadings.set(id, reading);
        this._persist();
        this._broadcast('kpi:recorded', { kpiId: opts.kpiId, value: opts.value });
        return reading;
    }

    getKPIReadings(kpiId) {
        const all = Array.from(this.kpiReadings.values());
        return kpiId ? all.filter(r => r.kpiId === kpiId) : all;
    }

    // ──────────────────────────────────────────────
    // 9. BUSINESS PLAN
    // ──────────────────────────────────────────────
    getBusinessPlanTemplate() {
        return { ...BUSINESS_PLAN_TEMPLATE, launchPolicy: LAUNCH_POLICY, islamicFoundation: ISLAMIC_FOUNDATION };
    }

    generateBusinessPlan(opts) {
        opts = opts || {};
        if (!opts.nameAr) throw new Error('nameAr مطلوب');
        const id = 'bp-' + crypto.randomBytes(8).toString('hex');
        const plan = {
            id, nameAr: opts.nameAr, nameEn: opts.nameEn || opts.nameAr,
            sector: opts.sector || null, targetMarket: opts.targetMarket || 'محلي',
            launchPhase: 1, status: 'draft',
            bismillah: ISLAMIC_FOUNDATION.bismillah,
            sections: BUSINESS_PLAN_TEMPLATE.sections.map(s => ({
                ...s, content: opts['section' + s.order] || '', completed: false
            })),
            salesModels: SALES_POLICY.models,
            profitSources: PROFIT_POLICY.sources,
            marketingChannels: MARKETING_POLICY.channels.slice(0, 5),
            kpiTargets: Object.values(KPI_FRAMEWORK.categories).flatMap(c => c.kpis.slice(0, 2)),
            launchRoadmap: LAUNCH_POLICY.phases,
            islamicCompliance: { checked: false, notes: '' },
            createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
        };
        this._persist();
        this._broadcast('businessplan:generated', { id, nameAr: opts.nameAr });
        return plan;
    }

    // ──────────────────────────────────────────────
    // 10. VENTURES (مشاريع تجارية)
    // ──────────────────────────────────────────────
    createVenture(opts) {
        opts = opts || {};
        if (!opts.nameAr) throw new Error('nameAr مطلوب');
        const id  = 'vnt-' + crypto.randomBytes(8).toString('hex');
        const now = new Date().toISOString();

        const venture = {
            id, nameAr: opts.nameAr, nameEn: opts.nameEn || opts.nameAr,
            sector: opts.sector || null, model: opts.model || 'B2C',
            launchPhase: Math.min(5, Math.max(1, parseInt(opts.launchPhase) || 1)),
            targetMarket: opts.targetMarket || 'محلي',
            capitalSAR: parseFloat(opts.capitalSAR) || 0,
            targetRevenueSAR: parseFloat(opts.targetRevenueSAR) || 0,
            status: 'active',
            owner: opts.owner || this.owner,
            description: opts.description || '',
            islamicCompliance: true,
            createdAt: now, updatedAt: now,
            milestones: [],
            revenue: 0, profit: 0, zakat: 0
        };

        this.ventures.set(id, venture);
        this.metrics.totalVentures++;
        this.metrics.activeVentures++;
        this.metrics.lastActivity = now;
        this._persistVentures();
        this._broadcast('venture:created', { id, nameAr: opts.nameAr, launchPhase: venture.launchPhase });
        return venture;
    }

    recordSale(opts) {
        opts = opts || {};
        if (!opts.ventureId) throw new Error('ventureId مطلوب');
        const venture = this.ventures.get(opts.ventureId);
        if (!venture) throw new Error('المشروع غير موجود');

        const id  = 'sale-' + crypto.randomBytes(8).toString('hex');
        const now = new Date().toISOString();
        const revenue = parseFloat(opts.revenue) || 0;
        const cost    = parseFloat(opts.cost)    || 0;
        const profit  = revenue - cost;
        const zakat   = Math.max(0, profit * 0.025);

        const record = {
            id, ventureId: opts.ventureId, nameAr: opts.nameAr || 'صفقة',
            model: opts.model || venture.model,
            revenue, cost, profit: Math.round(profit * 100) / 100,
            zakat: Math.round(zakat * 100) / 100,
            customer: opts.customer || null, notes: opts.notes || '',
            recordedAt: now
        };

        this.salesRecords.set(id, record);
        venture.revenue = (venture.revenue || 0) + revenue;
        venture.profit  = (venture.profit  || 0) + Math.round(profit * 100) / 100;
        venture.zakat   = (venture.zakat   || 0) + Math.round(zakat * 100) / 100;
        venture.updatedAt = now;

        this.metrics.totalSalesRecords++;
        this.metrics.totalRevenue = (this.metrics.totalRevenue || 0) + revenue;
        this.metrics.totalProfit  = (this.metrics.totalProfit  || 0) + profit;
        this.metrics.totalZakat   = (this.metrics.totalZakat   || 0) + zakat;
        this.metrics.lastActivity = now;

        this._persistVentures();
        this._persist();
        this._broadcast('sale:recorded', { id, ventureId: opts.ventureId, revenue, profit: record.profit });
        return record;
    }

    getVentures(filters) {
        filters = filters || {};
        let list = Array.from(this.ventures.values());
        if (filters.status)  list = list.filter(v => v.status === filters.status);
        if (filters.sector)  list = list.filter(v => v.sector === filters.sector);
        if (filters.launchPhase) list = list.filter(v => v.launchPhase === parseInt(filters.launchPhase));
        const total    = list.length;
        const page     = Math.max(1, parseInt(filters.page) || 1);
        const pageSize = Math.min(50, parseInt(filters.pageSize) || 20);
        return { ventures: list.slice((page - 1) * pageSize, page * pageSize), total, page, pageSize };
    }

    // ──────────────────────────────────────────────
    // 11. MARKET SEGMENTS
    // ──────────────────────────────────────────────
    getMarketSegments() { return { ...MARKET_SEGMENTS, islamicFoundation: ISLAMIC_FOUNDATION }; }

    // ──────────────────────────────────────────────
    // 12. EXPANSION PLAN — خطة التوسع
    // ──────────────────────────────────────────────
    getExpansionPlan() {
        return {
            nameAr: 'خطة التوسع والانطلاق الكامل — شيخة',
            term: 'الانطلاق',
            phases: LAUNCH_POLICY.phases,
            geographicTargets: MARKET_SEGMENTS.byGeography,
            sectorTargets: MARKET_SEGMENTS.bySector,
            expansionTypes: [
                { type: 'geographic', nameAr: 'توسع جغرافي',   detail: 'انطلاق في مدن + دول + قارات + الكون' },
                { type: 'digital',    nameAr: 'توسع رقمي',     detail: 'قنوات رقمية + منصات + تطبيقات + API' },
                { type: 'sectoral',   nameAr: 'توسع قطاعي',   detail: 'دخول قطاعات جديدة تدريجياً' },
                { type: 'strategic',  nameAr: 'توسع استراتيجي', detail: 'شراكات + استحواذ + فرنشايز + وكالات' }
            ],
            islamicNote: '﴿ فَإِذَا قُضِيَتِ الصَّلَاةُ فَانتَشِرُوا فِي الْأَرْضِ وَابْتَغُوا مِن فَضْلِ اللَّهِ ﴾'
        };
    }

    // ──────────────────────────────────────────────
    // 13. FULL STATS
    // ──────────────────────────────────────────────
    getStats() {
        const ventures = Array.from(this.ventures.values());
        const byPhase  = {};
        LAUNCH_POLICY.phases.forEach(p => { byPhase[p.id] = ventures.filter(v => v.launchPhase === p.id).length; });

        return {
            metrics: this.metrics,
            ventures: { total: ventures.length, active: ventures.filter(v => v.status === 'active').length, byPhase },
            salesRecords: this.salesRecords.size,
            campaigns: this.campaigns.size,
            kpiReadings: this.kpiReadings.size,
            totalKPIs: this._countKPIs(),
            totalProfitSources: PROFIT_POLICY.sources.length,
            totalMarketingChannels: MARKETING_POLICY.channels.length,
            totalMarkets: MARKET_SEGMENTS.byGeography.length,
            totalSectors: MARKET_SEGMENTS.bySector.length
        };
    }

    getHealthReport() {
        const ventures  = Array.from(this.ventures.values());
        const active    = ventures.filter(v => v.status === 'active');
        const zeroSales = active.filter(v => v.revenue === 0);
        let   health    = 100;
        if (zeroSales.length > 0) health -= Math.min(30, zeroSales.length * 10);
        return {
            status: health >= 80 ? 'healthy' : health >= 60 ? 'degraded' : 'needs-attention',
            overallHealth: Math.max(0, health),
            details: {
                totalVentures: ventures.length, activeVentures: active.length,
                venturesWithSales: active.filter(v => v.revenue > 0).length,
                totalRevenue: this.metrics.totalRevenue || 0,
                totalProfit:  this.metrics.totalProfit  || 0,
                totalZakat:   this.metrics.totalZakat   || 0
            },
            checkedAt: new Date().toISOString()
        };
    }

    // ──────────────────────────────────────────────
    // 14. REGISTER ROUTES (24 APIs)
    // ──────────────────────────────────────────────
    registerRoutes(app) {
        if (!app) return;
        const self = this;
        const ok  = (res, data, msg)  => res.json({ success: true,  data, message: msg || null, ts: new Date().toISOString() });
        const err = (res, e, code)    => res.status(code || 400).json({ success: false, message: (e && e.message) || String(e), ts: new Date().toISOString() });

        // ─── GET ───
        app.get(BASE_ROUTE + '/لوحة-القيادة',           (req, res) => ok(res, self.getDashboard()));
        app.get(BASE_ROUTE + '/سياسة-الانطلاق',         (req, res) => ok(res, self.getLaunchPolicy()));
        app.get(BASE_ROUTE + '/خارطة-الانطلاق',         (req, res) => ok(res, self.getLaunchRoadmap(req.query.phase)));
        app.get(BASE_ROUTE + '/آلية-المتاجرة',          (req, res) => ok(res, self.getTradeMechanism()));
        app.get(BASE_ROUTE + '/سياسة-البيع',            (req, res) => ok(res, self.getSalesPolicy()));
        app.get(BASE_ROUTE + '/سياسة-الأرباح',          (req, res) => ok(res, self.getProfitPolicy()));
        app.get(BASE_ROUTE + '/سياسة-التسويق',          (req, res) => ok(res, self.getMarketingPolicy()));
        app.get(BASE_ROUTE + '/الأنشطة',                (req, res) => ok(res, self.getActivities()));
        app.get(BASE_ROUTE + '/مقاييس-الأداء',          (req, res) => ok(res, self.getKPIFramework()));
        app.get(BASE_ROUTE + '/قالب-خطة-العمل',         (req, res) => ok(res, self.getBusinessPlanTemplate()));
        app.get(BASE_ROUTE + '/قطاعات-السوق',           (req, res) => ok(res, self.getMarketSegments()));
        app.get(BASE_ROUTE + '/خطة-التوسع',             (req, res) => ok(res, self.getExpansionPlan()));
        app.get(BASE_ROUTE + '/إحصائيات',               (req, res) => ok(res, self.getStats()));
        app.get(BASE_ROUTE + '/صحة-المنظومة',           (req, res) => ok(res, self.getHealthReport()));
        app.get(BASE_ROUTE + '/المشاريع',                (req, res) => ok(res, self.getVentures(req.query)));
        app.get(BASE_ROUTE + '/قراءات-المقاييس',        (req, res) => ok(res, self.getKPIReadings(req.query.kpiId)));

        // ─── POST ───
        app.post(BASE_ROUTE + '/حساب-الربح',    (req, res) => { try { ok(res, self.calcProfit(req.body || {}), 'تم حساب الربح والزكاة'); } catch (e) { err(res, e); } });
        app.post(BASE_ROUTE + '/إنشاء-مشروع',   (req, res) => { try { ok(res, self.createVenture(req.body || {}), 'تم إنشاء المشروع التجاري'); } catch (e) { err(res, e); } });
        app.post(BASE_ROUTE + '/تسجيل-صفقة',    (req, res) => { try { ok(res, self.recordSale(req.body || {}), 'تم تسجيل الصفقة'); } catch (e) { err(res, e); } });
        app.post(BASE_ROUTE + '/توليد-خطة-عمل', (req, res) => { try { ok(res, self.generateBusinessPlan(req.body || {}), 'تم توليد خطة العمل'); } catch (e) { err(res, e); } });
        app.post(BASE_ROUTE + '/تسجيل-مقياس',   (req, res) => { try { ok(res, self.recordKPI(req.body || {}), 'تم تسجيل المقياس'); } catch (e) { err(res, e); } });

        // ─── Aliases (English) ───
        app.get('/api/launch-commerce/dashboard',   (req, res) => ok(res, self.getDashboard()));
        app.get('/api/launch-commerce/policy',      (req, res) => ok(res, self.getLaunchPolicy()));
        app.get('/api/launch-commerce/kpis',        (req, res) => ok(res, self.getKPIFramework()));
        app.get('/api/launch-commerce/markets',     (req, res) => ok(res, self.getMarketSegments()));
        app.post('/api/launch-commerce/calc-profit',(req, res) => { try { ok(res, self.calcProfit(req.body || {})); } catch (e) { err(res, e); } });

        console.log('\uD83D\uDE80 [LaunchCommerce v1.0] 24 API عربية + 5 إنجليزية على ' + BASE_ROUTE);
    }

    // ──────────────────────────────────────────────
    // INTERNAL HELPERS
    // ──────────────────────────────────────────────
    _countKPIs() {
        return Object.values(KPI_FRAMEWORK.categories).reduce((a, c) => a + c.kpis.length, 0);
    }

    _broadcast(event, data) {
        this.emit(event, data);
        if (typeof this._broadcastFn === 'function') {
            try { this._broadcastFn(JSON.stringify({ type: event, data, ts: new Date().toISOString() })); } catch (_) { /* ignore */ }
        }
    }

    _startMonitor(interval) {
        this._monitorTimer = setInterval(() => {
            const now = Date.now();
            for (const [, v] of this.ventures) {
                if (v.status === 'active' && v.revenue === 0 && (now - new Date(v.createdAt).getTime()) > 30 * 86400000) {
                    this._broadcast('venture:noSales', { ventureId: v.id, nameAr: v.nameAr });
                }
            }
        }, interval);
    }

    _syncMetrics() {
        const ventures = Array.from(this.ventures.values());
        this.metrics.totalVentures   = ventures.length;
        this.metrics.activeVentures  = ventures.filter(v => v.status === 'active').length;
        this.metrics.totalRevenue    = ventures.reduce((a, v) => a + (v.revenue || 0), 0);
        this.metrics.totalProfit     = ventures.reduce((a, v) => a + (v.profit  || 0), 0);
        this.metrics.totalZakat      = ventures.reduce((a, v) => a + (v.zakat   || 0), 0);
        this.metrics.totalSalesRecords = this.salesRecords.size;
    }

    _ensureDataDir() { try { if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (_) { /* ignore */ } }

    _atomicWrite(filePath, data) {
        const tmp = filePath + '.tmp';
        try { fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8'); fs.renameSync(tmp, filePath); }
        catch (_) { try { fs.unlinkSync(tmp); } catch (__) { /* ignore */ } }
    }

    _loadPersisted() {
        this._ensureDataDir();
        const tryLoad = (file, cb) => { try { if (fs.existsSync(file)) cb(JSON.parse(fs.readFileSync(file, 'utf8'))); } catch (_) { /* ignore */ } };
        tryLoad(DB_FILE, d => {
            if (d.kpiReadings)  d.kpiReadings.forEach(r  => this.kpiReadings.set(r.id, r));
            if (d.salesRecords) d.salesRecords.forEach(s => this.salesRecords.set(s.id, s));
            if (d.campaigns)    d.campaigns.forEach(c    => this.campaigns.set(c.id, c));
            if (d.metrics)      Object.assign(this.metrics, d.metrics);
        });
        tryLoad(VENTURES_FILE, d => { if (Array.isArray(d)) d.forEach(v => this.ventures.set(v.id, v)); });
        this._syncMetrics();
    }

    _persist() {
        this._ensureDataDir();
        this._atomicWrite(DB_FILE, {
            metrics: this.metrics,
            kpiReadings:  Array.from(this.kpiReadings.values()),
            salesRecords: Array.from(this.salesRecords.values()),
            campaigns:    Array.from(this.campaigns.values()),
            savedAt: new Date().toISOString(), version: VERSION
        });
    }

    _persistVentures() {
        this._ensureDataDir();
        this._atomicWrite(VENTURES_FILE, Array.from(this.ventures.values()));
    }

    getStatus() {
        return {
            name: this.name, nameAr: this.nameAr, version: this.version, status: 'active',
            owner: this.owner, totalVentures: this.metrics.totalVentures,
            activeVentures: this.metrics.activeVentures, totalRevenue: this.metrics.totalRevenue,
            launchPhases: LAUNCH_POLICY.phases.length, kpis: this._countKPIs(), apis: 29
        };
    }

    stop() {
        if (this._monitorTimer) { clearInterval(this._monitorTimer); this._monitorTimer = null; }
        this._persist();
        this._persistVentures();
    }
}

module.exports = SheikhaMarketLaunchCommerceEngine;
