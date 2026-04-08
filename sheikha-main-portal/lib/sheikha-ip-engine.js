'use strict';

// ════════════════════════════════════════════════════════════════════════
// محرك الملكية الفكرية وحماية حقوق شيخة — المرحلة ٤٤
// وَقُل رَّبِّ زِدْنِي عِلْمًا — طه:114
// لَا تَأْكُلُوا أَمْوَالَكُم بَيْنَكُم بِالْبَاطِلِ — البقرة:188
// ════════════════════════════════════════════════════════════════════════

// ─── إعلان الملكية والريادة ────────────────────────────────────────────
const IP_DECLARATION = {
    platform: 'SHEIKHA — شيخة',
    full_name: 'شيخة للتجارة الإسلامية الرقمية في المعادن والسكراب',
    tagline: 'أول منظومة اقتصادية إسلامية رقمية للمعادن والسكراب في العالم',
    domain: 'sheikha.top',
    email: 'market@sheikha.top',
    ms_account: 'market@sheikhatop.onmicrosoft.com',
    owner: {
        name: 'سلمان أحمد بن سلمان الراجح',
        title: 'المؤسس والمالك الوحيد',
        legal_entity: 'مؤسسة شيخة للتجارة الرقمية',
        country: 'المملكة العربية السعودية',
        sole_authority: 'لا تعديل ولا تفويض ولا شراكة إلا بإذن صريح من المالك'
    },
    registration: {
        trademark_status: 'قيد التسجيل — SHEIKHA® — شيخة®',
        patent_status: 'حقوق مؤلف مسجلة — الكود المصدري محمي',
        copyright_year: '2023-2026 م / 1444-1447 هـ',
        reserved: 'جميع الحقوق محفوظة — All Rights Reserved'
    },
    // ريادة الأولية التجارية
    first_mover: {
        concept_date: '١٤٤٤ هـ / ٢٠٢٣ م — بداية تطوير المنظومة',
        launch_date: '١٤٤٦ هـ / ٢٠٢٤ م — الإطلاق الأول',
        current_date: new Date().toISOString().split('T')[0],
        pioneering_claims: [
            'أول سوق إسلامي رقمي متكامل للمعادن والسكراب عالمياً',
            'أول منصة تطبق مؤشر شيخة للأسعار بمعايير شرعية آلية',
            'أول ربط بين رموز HS Codes وأحكام الشريعة الإسلامية رقمياً',
            'أول نظام حساب زكاة مرتبط بسوق المعادن الرقمي المباشر',
            'أول تسعير شرعي ذكي يرفض الربا والغرر والغش آلياً',
            'أول منظومة تكامل رقمي بين الأقمار الصناعية وسوق المعادن الإسلامي',
            'أول تكامل بين 11 شركة تقنية كونية ومنصة تجارة إسلامية'
        ],
        quran_ref: 'فَاسْتَبِقُوا الْخَيْرَاتِ — البقرة:148'
    }
};

// ─── حظر الهندسة العكسية والعقوبات ────────────────────────────────────
const ANTI_REVERSE_ENGINEERING = {
    policy: 'محظور تماماً وبإطلاق — Total Prohibition',
    effective_date: '١ محرم ١٤٤٤ هـ',
    arabic_statement: `
يُحظر حظراً قاطعاً على أي شخص طبيعي أو معنوي:

١. إجراء هندسة عكسية (Reverse Engineering) لأي جزء من منظومة شيخة
٢. نسخ أو استنساخ أو محاكاة الخوارزميات أو قواعد البيانات أو النماذج
٣. الوصول غير المصرح به إلى الكود المصدري أو البنية التقنية
٤. إنشاء منتجات مشتقة أو منافسة باستخدام أي مكوّن مسروق
٥. مشاركة أو نشر أسرار تقنية شيخة أو ملفاتها الداخلية
٦. استخدام أي أداة لاستخراج أو فك تشفير أو تحليل النظام
٧. إعادة توزيع أو إعادة بيع أي مكوّن من المنظومة دون حق
`,
    legal_basis: [
        'نظام الملكية الفكرية السعودي — مرسوم ملكي م/41 لعام 1424هـ',
        'نظام براءات الاختراع — مرسوم ملكي م/27 لعام 1404هـ',
        'نظام مكافحة الجرائم المعلوماتية السعودي — 1428هـ',
        'اتفاقية تريبس (TRIPS) — منظمة التجارة العالمية',
        'اتفاقية برن لحماية المصنفات الأدبية والفنية 1886م',
        'معاهدة WIPO بشأن حقوق النشر (WCT) 1996م',
        'نظام التجارة الإلكترونية السعودي 1428هـ'
    ],
    penalties: {
        civil: {
            compensation: 'تعويض لا يقل عن 5 أضعاف الضرر المادي والمعنوي',
            injunction: 'وقف فوري قضائي وإتلاف كامل للنسخ غير المرخصة',
            profit_seizure: 'مصادرة كامل الأرباح الناتجة عن الاستخدام غير المشروع',
            legal_costs: 'تحمّل كامل تكاليف التقاضي والمحاماة'
        },
        criminal: {
            imprisonment: 'سجن من 6 أشهر إلى 5 سنوات',
            fine: 'غرامة من 50,000 إلى 5,000,000 ريال سعودي',
            repeat_offender: 'مضاعفة العقوبة عند التكرار'
        },
        international: 'رفع دعاوى في المحاكم الدولية المختصة بحسب الولاية القضائية',
        sharia_warning: 'التحذير الشرعي: لا يحل مال امرئ مسلم إلا بطيب نفس منه — النبي ﷺ'
    },
    technical_protection: [
        'Water-marking رقمي في كل ملف JavaScript',
        'License key محمي في كل نسخة تجارية',
        'API Rate Limiting مع Fingerprinting',
        'Hash verification للملفات الحساسة',
        'Audit logs لكل وصول للنظام'
    ]
};

// ─── نموذج الشراكة والترخيص والتعليم ──────────────────────────────────
const PARTNERSHIP_MODEL = {
    principle: 'الريادة أولاً — ثم التعليم والشراكة بشروط',
    commercial: {
        title: 'الترخيص التجاري (Commercial License)',
        model: 'امتياز تجاري (Franchise) + White-label',
        target: 'تجار المعادن والسكراب المرخصون — شركات التجارة الإسلامية',
        requirements: [
            'عقد ترخيص رسمي موثق بالشريعة الإسلامية',
            'رسوم ترخيص سنوية تحدد حسب النطاق الجغرافي',
            'الالتزام الكامل بمبادئ شيخة الشرعية (لا ربا لا غرر)',
            'حق الرقابة والتدقيق الدوري من المالك الأصلي',
            'حظر إعادة ترخيص أو منح حقوق للغير تحت أي مسمى',
            'الإفصاح الكامل عن هوية شيخة كمصدر التقنية'
        ],
        revenue_share: 'يُحدد بعقد ثنائي — لا يقل عن 10% للمالك الأصلي',
        priority: 'يفضّل الشركاء من دول الخليج والعالم الإسلامي'
    },
    educational: {
        title: 'الترخيص التعليمي والخيري',
        target: 'الجامعات والمعاهد والجمعيات الخيرية وطلاب العلم',
        requirements: [
            'إذن كتابي صريح من المالك الأصلي',
            'الاستخدام للتعليم فقط — غير ربحي بالمطلق',
            'ذكر اسم شيخة وصاحبها في كل إنتاج أكاديمي',
            'إرسال نسخة من كل دراسة أو بحث مرتبط للمالك',
            'مدة ترخيص محددة قابلة للتجديد — لا تمتد تلقائياً',
            'إبلاغ المالك فور نشر أي ورقة بحثية تتعلق بالمنظومة'
        ],
        free_cases: 'يُمنح مجاناً للباحثين في التجارة الإسلامية — بشروط تقديرية'
    },
    inquiry: {
        email: 'legal@sheikha.top',
        primary: 'market@sheikha.top',
        response_time: 'الرد خلال 5 أيام عمل',
        required_info: ['الاسم الكامل', 'الجهة', 'الغرض من الاستخدام', 'النطاق الجغرافي']
    }
};

// ─── التحكم الكامل بالأجهزة بدون شريحة ────────────────────────────────
const DEVICE_CONTROL = {
    title: 'التحكم الكامل بالأجهزة والأنظمة — بدون زرع شريحة',
    principle: 'حفظ النفس من الضروريات الخمس — التعديل الجراحي محل بحث فقهي',
    non_invasive_technologies: [
        { id: 1, name: 'التحكم الصوتي الذكي', tech: 'Whisper AI + Wake Word + NLP', status: 'مُفعَّل', sharia: 'حلال', coverage: '100%' },
        { id: 2, name: 'تتبع العين (Eye Tracking)', tech: 'Tobii / Pupil Labs / MediaPipe', status: 'متاح', sharia: 'حلال', coverage: '90%' },
        { id: 3, name: 'التعرف على الإيماءات', tech: 'MediaPipe Hands / Google ML Kit', status: 'متاح', sharia: 'حلال', coverage: '95%' },
        { id: 4, name: 'EEG غير الغازي (الموجات الدماغية)', tech: 'Muse Headset / OpenBCI (خوذة فقط)', status: 'بحث وتطوير', sharia: 'حلال — لا جراحة', coverage: '60%' },
        { id: 5, name: 'التحكم العضلي (EMG سطحي)', tech: 'CTRL-kit / Myo Armband', status: 'بحث وتطوير', sharia: 'حلال — إسورة خارجية', coverage: '70%' },
        { id: 6, name: 'إنترنت الأشياء (Matter Protocol)', tech: 'Matter v1.3 — Thread/Wi-Fi/BLE', status: 'قيد التفعيل', sharia: 'حلال', coverage: '85%' },
        { id: 7, name: 'الواقع المعزز (AR)', tech: 'ARKit / ARCore / HoloLens', status: 'متاح', sharia: 'حلال بالضوابط', coverage: '80%' },
        { id: 8, name: 'التحكم الدماغي المباشر (BCI غازي)', tech: 'Neuralink N1 — شريحة مزروعة', status: 'بانتظار فتوى شرعية', sharia: 'محل بحث — لا تُروَّج', coverage: '0% بانتظار الفتوى' }
    ],
    sheikha_voice_control: {
        wake_word: 'شيخة',
        commands: ['افتح السوق', 'أسعار اليوم', 'حساب الزكاة', 'طلب عرض سعر', 'تقرير الأرباح'],
        languages: ['العربية (أساسي)', 'الإنجليزية', 'الأردية', 'الفارسية'],
        engine: 'OpenAI Whisper + Gemini + GPT-4o'
    },
    sharia_position: {
        non_invasive: 'كل تقنية لا تمس سلامة الجسد بجراحة — حلال',
        invasive: 'الزرع الجراحي — مسألة خلافية — انتظر الفتوى قبل الترويج',
        rule: 'لا ضرر ولا ضرار — النبي ﷺ'
    }
};

// ─── حراسة الـ APIs المجانية ومنع الاستنزاف ───────────────────────────
const FREE_TIER_GUARDS = {
    anthropic: {
        status: 'ملغى الاشتراك — محظور الاستخدام نهائياً',
        blocked: true,
        action: 'لا تستخدم Claude API بأي شكل — الاشتراك ملغى',
        alternative: 'Gemini 2.0 Flash (مجاني 1M token/يوم) + GPT-4o-mini (اقتصادي)'
    },
    openai: {
        latest_confirmed_models: ['gpt-4o', 'gpt-4o-mini', 'o3', 'o4-mini', 'gpt-4.1'],
        note: 'GPT-5+ — تحقق من platform.openai.com/models للإصدار المتاح لحسابك',
        model_priority: ['gpt-4o-mini', 'gpt-4.1', 'gpt-4o', 'o4-mini'],
        cost_guard: 'ابدأ دائماً بـ gpt-4o-mini — أرخص 15x من gpt-4o',
        monthly_limit_env: 'OPENAI_MONTHLY_LIMIT',
        monitor_url: 'platform.openai.com/usage'
    },
    gemini: {
        model_priority: ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.0-pro'],
        free_quota: 'Flash: 15 طلب/دقيقة + 1,000,000 token/يوم — مجاناً',
        paid_guard: 'Pro: استخدمه فقط عند الحاجة القصوى'
    },
    xai_grok: {
        models: ['grok-3', 'grok-2', 'grok-2-vision'],
        free_access: 'X Premium+ يشمل Grok — تحقق من app.x.ai للحصص'
    },
    nvidia_nim: {
        free_tier: '1000 طلب مجاني عند التسجيل في build.nvidia.com',
        models: ['llama-3.1-70b', 'mixtral-8x7b', 'mistral-7b']
    }
};

// ─── الشريعة والملكية الفكرية ─────────────────────────────────────────
const SHARIA_IP = {
    title: 'الملكية الفكرية في الشريعة الإسلامية',
    scholarly_position: 'الملكية الفكرية حق معتبر شرعاً — مجمع الفقه الإسلامي الدولي قراره رقم (43) لعام 1409هـ',
    quran_refs: [
        { ar: 'وَقُل رَّبِّ زِدْنِي عِلْمًا', ref: 'طه:114', context: 'العلم والإبداع قيمة عليا يجب حمايتها' },
        { ar: 'لَا تَأْكُلُوا أَمْوَالَكُم بَيْنَكُم بِالْبَاطِلِ', ref: 'البقرة:188', context: 'حرمة سرقة حقوق الملكية' },
        { ar: 'وَالَّذِينَ هُمْ لِأَمَانَاتِهِمْ وَعَهْدِهِمْ رَاعُونَ', ref: 'المؤمنون:8', context: 'الوفاء بحقوق المؤلف والعقود' },
        { ar: 'فَاسْتَبِقُوا الْخَيْرَاتِ', ref: 'البقرة:148', context: 'الريادة في الخير مطلوبة شرعاً' }
    ],
    hadith: [
        'لا يحل مال امرئ مسلم إلا بطيب نفس منه — متفق عليه',
        'من غشّ فليس منا — رواه مسلم',
        'المسلمون على شروطهم — رواه الترمذي',
        'إن الله يحب إذا عمل أحدكم عملاً أن يُتقنه — رواه البيهقي'
    ]
};

// ─── Exports ──────────────────────────────────────────────────────────
module.exports = {
    getIPDeclaration: () => IP_DECLARATION,
    getAntiReverseEngineering: () => ANTI_REVERSE_ENGINEERING,
    getPartnershipModel: () => PARTNERSHIP_MODEL,
    getDeviceControl: () => DEVICE_CONTROL,
    getFreeTierGuards: () => FREE_TIER_GUARDS,
    getShariaIP: () => SHARIA_IP,
    getEngineStats: () => ({
        engine: 'sheikha-ip-engine',
        version: '1.0.0',
        phase: 44,
        owner: IP_DECLARATION.owner.name,
        pioneering_claims: IP_DECLARATION.first_mover.pioneering_claims.length,
        legal_bases: ANTI_REVERSE_ENGINEERING.legal_basis.length,
        non_invasive_technologies: DEVICE_CONTROL.non_invasive_technologies.length,
        quran_ref: 'وَقُل رَّبِّ زِدْنِي عِلْمًا — طه:114'
    }),
    getFullDocument: () => ({
        declaration: IP_DECLARATION,
        anti_reverse_engineering: ANTI_REVERSE_ENGINEERING,
        partnership: PARTNERSHIP_MODEL,
        device_control: DEVICE_CONTROL,
        free_tier_guards: FREE_TIER_GUARDS,
        sharia: SHARIA_IP,
        generated_at: new Date().toISOString()
    })
};
