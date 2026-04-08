'use strict';
// ══════════════════════════════════════════════════════════════
// محرك الشراكات الاستراتيجية — شيخة المرحلة ٤٦
// صندوق الاستثمارات العامة + شراكات الخير + مراحل الاستثمار
// بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
// وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَى — المائدة:2
// ══════════════════════════════════════════════════════════════

// ─── الشركاء الاستراتيجيون المستهدفون ───────────────────────
const STRATEGIC_PARTNERS = [
    {
        id: 'pif',
        nameAr: 'صندوق الاستثمارات العامة',
        nameEn: 'Public Investment Fund (PIF)',
        type: 'sovereign_wealth',
        country: 'السعودية',
        focus: ['رؤية 2030', 'التحول الرقمي', 'الاقتصاد غير النفطي', 'التعدين'],
        partnership_model: 'حقوق الملكية تبقى لسلمان الراجح — الصندوق شريك استراتيجي غير متحكم',
        what_sheikha_offers: 'منصة رقمية جاهزة + سوق معادن + امتثال شرعي + رؤية 2030',
        what_partner_brings: 'تمويل توسعي + شبكة علاقات + ختم ثقة حكومي',
        sharia_model: 'مضاربة أو مشاركة — بنود واضحة ولا ربا',
        target_investment: '$5M – $50M',
        quran_ref: 'وَإِن تَعَاوَنُوا عَلَيْهِ فَإِنَّ اللَّهَ مَوْلَاهُ — التحريم:4',
        sovereignty: 'الملكية والسيادة تبقى لسلمان الراجح — لا تنازل عن التحكم'
    },
    {
        id: 'sdaia',
        nameAr: 'الهيئة السعودية للبيانات والذكاء الاصطناعي',
        nameEn: 'SDAIA',
        type: 'government_tech',
        country: 'السعودية',
        focus: ['ذكاء اصطناعي', 'بيانات ضخمة', 'تحول رقمي'],
        partnership_model: 'شراكة تقنية + إطار VibeCoding + أفضل ممارسات SDAIA',
        what_sheikha_offers: 'نموذج تطبيقي ناجح لـ VibeCoding في الاقتصاد الإسلامي',
        what_partner_brings: 'اعتراف رسمي + إطار AI حكومي + دعم تقني',
        sharia_model: 'شراكة خدمية — لا ربا لا ضرر',
        quran_ref: 'عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ — العلق:5',
        vibecoching_alignment: [
            'الكود كأداة لا غاية — الغاية النفع العام',
            'الذكاء الاصطناعي خادم للإنسان لا سيد عليه',
            'البناء الأخلاقي: لا ضرر في كل سطر كود',
            'الشفافية: الكود واضح وقابل للمراجعة والتدقيق'
        ]
    },
    {
        id: 'monshaat',
        nameAr: 'منشآت — هيئة المنشآت الصغيرة والمتوسطة',
        nameEn: 'Monsha\'at',
        type: 'sme_support',
        country: 'السعودية',
        focus: ['ريادة الأعمال', 'المنشآت الصغيرة', 'تمويل الشركات الناشئة'],
        partnership_model: 'إدراج شيخة كمنصة معتمدة لخدمة المنشآت الصغيرة في قطاع المعادن',
        what_sheikha_offers: 'تسعير عادل + وصول موردين + خدمات رقمية مجانية للمنشآت',
        what_partner_brings: 'قاعدة المليون منشأة + شرعية + تمويل',
        quran_ref: 'وَعَلَى اللَّهِ فَلْيَتَوَكَّلِ الْمُتَوَكِّلُونَ — إبراهيم:12'
    },
    {
        id: 'zatca',
        nameAr: 'هيئة الزكاة والضريبة والجمارك',
        nameEn: 'ZATCA',
        type: 'regulatory',
        country: 'السعودية',
        focus: ['زكاة', 'ضريبة', 'جمارك', 'HS Codes'],
        partnership_model: 'ربط حساب الزكاة الآلي في شيخة مع أنظمة الهيئة',
        what_sheikha_offers: 'حساب الزكاة المدمج + HS Codes + توثيق الصفقات الجمركية',
        what_partner_brings: 'ربط رسمي مع أنظمة الدولة + ختم امتثال',
        quran_ref: 'وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ — البقرة:43'
    },
    {
        id: 'google_cloud',
        nameAr: 'Google Cloud — الشريق التقني',
        nameEn: 'Google Cloud',
        type: 'tech_partner',
        country: 'عالمي',
        focus: ['AI', 'Cloud', 'Gemini', 'BigQuery', 'Analytics'],
        partnership_model: 'Google for Startups + credits + Gemini API integration',
        what_sheikha_offers: 'use case إسلامي فريد + تسلط على سوق الخليج',
        what_partner_brings: '$200K credits + تقنية Gemini + Google Business + SEO',
        quran_ref: 'وَسَخَّرَ لَكُم مَّا فِي السَّمَاوَاتِ — الجاثية:13'
    },
    {
        id: 'microsoft',
        nameAr: 'Microsoft — شريك M365',
        nameEn: 'Microsoft',
        type: 'tech_partner',
        country: 'عالمي',
        focus: ['M365', 'Azure', 'Teams', 'Power Platform', 'Copilot'],
        partnership_model: 'Microsoft for Startups + Azure credits + Teams integration',
        what_sheikha_offers: 'نشر شيخة عبر Teams للشركات + Azure marketplace listing',
        what_partner_brings: 'Azure credits + Copilot AI + شبكة شركاء Microsoft',
        quran_ref: 'وَيُؤْثِرُونَ عَلَى أَنفُسِهِمْ — الحشر:9'
    }
];

// ─── مراحل الاستثمار ─────────────────────────────────────────
const INVESTMENT_PHASES = [
    {
        phase: 'Pre-Seed',
        label: 'ما قبل البذرة',
        current: true,
        description: 'بناء المنصة وإثبات المفهوم — المؤسس ممول المرحلة',
        status: '✅ منجز — ٤٤ مرحلة تقنية، ٢٠٠+ API',
        focus: 'التقنية والامتثال الشرعي والملكية الكاملة',
        quran: 'وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم — الأنفال:60'
    },
    {
        phase: 'Seed',
        label: 'البذرة',
        current: false,
        description: 'إطلاق Pilot مع ١٠ شركات + إثبات إيرادات',
        target: '$500K – $2M',
        from: ['Angel investors', 'صندوق Monsha\'at', 'محفظة ريادة'],
        conditions: 'حقوق المؤسس لا تنزل عن ٦٠٪',
        quran: 'وَاللَّهُ يُضَاعِفُ لِمَن يَشَاءُ — البقرة:261'
    },
    {
        phase: 'Series A',
        label: 'الجولة الأولى',
        current: false,
        description: 'التوسع الخليجي + ١٠٠٠ شركة مسجَّلة + فريق متكامل',
        target: '$5M – $20M',
        from: ['صندوق الاستثمارات العامة PIF', 'STV', 'Venture Capital خليجي'],
        conditions: 'حقوق المؤسس لا تنزل عن ٥١٪ — الملكية والسيادة محفوظة',
        model: 'مضاربة إسلامية — الربح مُتفَّق عليه مسبقاً',
        quran: 'وَاللَّهُ يَرْزُقُ مَن يَشَاءُ بِغَيْرِ حِسَابٍ — البقرة:212'
    },
    {
        phase: 'Series B',
        label: 'الجولة الثانية',
        current: false,
        description: 'الانتشار العالمي + بورصة معادن إسلامية + مليون مستخدم',
        target: '$50M – $200M',
        from: ['Strategic partners', 'Global Islamic funds', 'IPO إسلامي'],
        conditions: 'الحوكمة تبقى إسلامية ولا مساس بالقيم',
        quran: 'وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ — هود:88'
    }
];

// ─── أحاديث الشراكة والجماعة ─────────────────────────────────
const SHARIA_PARTNERSHIP_PRINCIPLES = [
    {
        type: 'مضاربة',
        definition: 'رب المال يقدم المال والعامل يعمل — الربح بالاتفاق والخسارة على رب المال',
        apply: 'المستثمر يقدم المال وشيخة تعمل وتدير — الربح نسبة مُتفَّقة',
        ref: 'صحيح البخاري — باب المضاربة'
    },
    {
        type: 'مشاركة',
        definition: 'شراكة في رأس المال والربح والخسارة بنسب متفق عليها',
        apply: 'شراكة مع PIF أو صندوق استثمار — كل طرف حصة واضحة',
        ref: 'المغني لابن قدامة — باب الشركة'
    },
    {
        type: 'لا ضرر ولا ضرار',
        definition: 'حديث النبي ﷺ — لا يُضار أحد الشريكين الآخر',
        apply: 'لا بنود تُلزم المؤسس بالتنازل قسراً — لا شروط جائرة',
        ref: 'صحيح ابن ماجه — ٢٣٤٠'
    },
    {
        type: 'الشورى في القرارات',
        definition: 'وَأَمْرُهُمْ شُورَى بَيْنَهُمْ — الشورى:38',
        apply: 'مجلس إدارة مُشكَّل + لجنة شرعية مستقلة + قرارات مشتركة',
        ref: 'القرآن الكريم — سورة الشورى'
    },
    {
        type: 'الوفاء بالعهد',
        definition: 'يَا أَيُّهَا الَّذِينَ آمَنُوا أَوْفُوا بِالْعُقُودِ — المائدة:1',
        apply: 'كل بند في عقد الشراكة مُلزِم ومُوثَّق رقمياً',
        ref: 'القرآن الكريم — سورة المائدة'
    }
];

// ─── استراتيجية دخول السوق ───────────────────────────────────
const GO_TO_MARKET = {
    phase1_pilot: {
        label: 'الإطلاق التجريبي',
        duration: 'أبريل – يونيو ٢٠٢٦',
        target: '١٠ شركات + ١٠٠ تاجر',
        channels: ['معادن المباشر', 'الغرف التجارية', 'منشآت', 'WhatsApp'],
        cost_model: 'مجاني ١٠٠٪',
        metric: 'إثبات النموذج + صفقات أولى'
    },
    phase2_growth: {
        label: 'النمو المحلي',
        duration: 'يوليو – ديسمبر ٢٠٢٦',
        target: '١٠٠ شركة + ١٠٠٠ تاجر',
        channels: ['Paid لـ Google/Snapchat', 'التسويق بالمحتوى', 'شراكات الغرف'],
        cost_model: 'اشتراك شهري + عمولة صفقات',
        metric: 'ARR أول + NPScore'
    },
    phase3_expand: {
        label: 'التوسع الخليجي',
        duration: '٢٠٢٧',
        target: 'UAE + Kuwait + Bahrain + Egypt',
        channels: ['إعلام دولي', 'شبكة شركاء خليجيين', 'PIF network'],
        cost_model: 'Enterprise plans + B2B SaaS',
        metric: 'جولة استثمار A'
    },
    phase4_world: {
        label: 'الانتشار العالمي',
        duration: '٢٠٢٨+',
        target: 'كل الدول الإسلامية + أسواق الطوارئ',
        channels: ['OIC network', 'Islamic Development Bank', 'AAOIFI'],
        cost_model: 'Licensing + Partnership revenue',
        metric: 'IPO إسلامي'
    }
};

module.exports = {
    getStrategicPartners: () => STRATEGIC_PARTNERS,
    getPartner: (id) => STRATEGIC_PARTNERS.find(p => p.id === id),
    getInvestmentPhases: () => INVESTMENT_PHASES,
    getCurrentPhase: () => INVESTMENT_PHASES.find(p => p.current),
    getShariaPrinciples: () => SHARIA_PARTNERSHIP_PRINCIPLES,
    getGoToMarket: () => GO_TO_MARKET,
    getEngineStats: () => ({
        strategic_partners: STRATEGIC_PARTNERS.length,
        investment_phases: INVESTMENT_PHASES.length,
        sharia_principles: SHARIA_PARTNERSHIP_PRINCIPLES.length,
        gtm_phases: Object.keys(GO_TO_MARKET).length,
        phase: 46,
        quran: 'وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَى — المائدة:2',
        sovereignty_note: 'الملكية والسيادة تبقى لسلمان الراجح في جميع مراحل الشراكة'
    })
};
