/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🌍 محرك رؤية الدول — Sheikha National Visions Engine
 *
 * تتبع وتحليل رؤى الدول الاستراتيجية ومواءمة الأعمال معها
 * يشمل: رؤية 2030 السعودية، رؤية 2071 الإماراتية، رؤية 2030 القطرية،
 *        رؤية 2035 الكويتية، رؤية 2030 البحرينية، رؤية 2040 العُمانية،
 *        ورؤى دول إسلامية وعالمية أخرى
 *
 * "وَشَاوِرْهُمْ فِي الْأَمْرِ" — آل عمران: ١٥٩
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

// ─── بيانات رؤى الدول ──────────────────────────────────────────────────────────

const NATIONAL_VISIONS_DB = {
    // ═══════════ الخليج العربي ═══════════
    'SA': {
        countryCode: 'SA',
        country: 'المملكة العربية السعودية',
        countryEn: 'Saudi Arabia',
        visionName: 'رؤية المملكة 2030',
        visionNameEn: 'Saudi Vision 2030',
        year: 2030,
        launchYear: 2016,
        leader: 'صاحب السمو الملكي الأمير محمد بن سلمان',
        logo: '🇸🇦',
        pillars: [
            {
                id: 'vibrant-society',
                nameAr: 'مجتمع حيوي',
                nameEn: 'Vibrant Society',
                goals: [
                    'تعزيز الهوية الإسلامية والوطنية',
                    'رفع متوسط العمر المتوقع من 74 إلى 80 عاماً',
                    'رفع نسبة ممارسة الرياضة من 13% إلى 40%',
                    'رفع نسبة العمل التطوعي من 11,000 إلى مليون متطوع'
                ]
            },
            {
                id: 'thriving-economy',
                nameAr: 'اقتصاد مزدهر',
                nameEn: 'Thriving Economy',
                goals: [
                    'رفع مساهمة القطاع الخاص من 40% إلى 65% من الناتج المحلي',
                    'خفض معدل البطالة من 11.6% إلى 7%',
                    'رفع مساهمة المرأة في سوق العمل من 17% إلى 30%',
                    'رفع الناتج المحلي الإجمالي غير النفطي',
                    'الوصول إلى مراتب أولى في مؤشر التنافسية العالمي'
                ]
            },
            {
                id: 'ambitious-nation',
                nameAr: 'وطن طموح',
                nameEn: 'Ambitious Nation',
                goals: [
                    'رفع إيرادات الدولة غير النفطية من 163 مليار إلى تريليون ريال',
                    'رفع مساهمة الصناعة العسكرية المحلية إلى 50%',
                    'الوصول إلى مستوى متقدم في مؤشرات الحوكمة',
                    'تحقيق التوازن المالي في الميزانية'
                ]
            }
        ],
        sectors: [
            'التعدين والصناعة', 'السياحة', 'الترفيه', 'الرياضة',
            'الصحة', 'التعليم', 'التقنية', 'الطاقة المتجددة',
            'الاستثمار', 'اللوجستيات', 'الزراعة', 'الإسكان'
        ],
        kpis: {
            gdpTarget: '1 trillion USD by 2030',
            nonOilRevenue: '1 trillion SAR',
            privateSectorShare: '65%',
            unemploymentTarget: '7%',
            foreignDirectInvestment: '5.7% of GDP',
            renewableEnergy: '50% by 2030'
        },
        programs: [
            'نيوم', 'رؤية ريف', 'البحر الأحمر', 'قدية',
            'مشروع الأفق', 'صندوق التنمية الوطني', 'برنامج التحول الوطني',
            'برنامج جودة الحياة', 'برنامج تنمية القدرات البشرية'
        ],
        officialSite: 'https://www.vision2030.gov.sa',
        status: 'active',
        progress: 75
    },

    'AE': {
        countryCode: 'AE',
        country: 'الإمارات العربية المتحدة',
        countryEn: 'United Arab Emirates',
        visionName: 'رؤية الإمارات 2071 / مئوية الإمارات',
        visionNameEn: 'UAE Centennial 2071',
        year: 2071,
        launchYear: 2017,
        leader: 'صاحب السمو الشيخ محمد بن راشد آل مكتوم',
        logo: '🇦🇪',
        pillars: [
            {
                id: 'education',
                nameAr: 'التعليم',
                nameEn: 'Education',
                goals: [
                    'إعداد جيل الإمارات الرقمي',
                    'الوصول إلى أفضل التعليم في العالم',
                    'غرس القيم والهوية الوطنية'
                ]
            },
            {
                id: 'government',
                nameAr: 'حكومة متميزة',
                nameEn: 'Distinguished Government',
                goals: [
                    'أفضل حكومة في العالم',
                    'التميز والابتكار الحكومي',
                    'الحياة الجيدة للمواطنين'
                ]
            },
            {
                id: 'cohesive-society',
                nameAr: 'مجتمع متماسك',
                nameEn: 'Cohesive Society',
                goals: [
                    'مجتمع متماسك ومتحد',
                    'الشعور بالانتماء والمواطنة',
                    'التسامح والتعايش'
                ]
            },
            {
                id: 'competitive-economy',
                nameAr: 'اقتصاد تنافسي',
                nameEn: 'Competitive Economy',
                goals: [
                    'اقتصاد متنوع وتنافسي',
                    'بيئة أعمال مثالية',
                    'مركز للتجارة والاستثمار'
                ]
            }
        ],
        sectors: [
            'التقنية المتقدمة', 'الذكاء الاصطناعي', 'الفضاء',
            'السياحة والترفيه', 'اللوجستيات', 'المالية',
            'الصحة', 'التعليم', 'الطاقة النظيفة'
        ],
        kpis: {
            aiTarget: 'أول دولة في العالم تعتمد الذكاء الاصطناعي حكومياً',
            spaceProgram: 'استكشاف المريخ والفضاء',
            happiness: 'ضمن أسعد دول العالم',
            economy: 'اقتصاد من أكبر 10 في العالم'
        },
        programs: [
            'استراتيجية الذكاء الاصطناعي 2031',
            'مشروع الإمارات للمريخ',
            'استراتيجية الطاقة 2050',
            'برنامج مئة مدير تنفيذي إماراتي'
        ],
        officialSite: 'https://u.ae/en/about-the-uae/uae-centennial-2071',
        status: 'active',
        progress: 60
    },

    'QA': {
        countryCode: 'QA',
        country: 'قطر',
        countryEn: 'Qatar',
        visionName: 'رؤية قطر الوطنية 2030',
        visionNameEn: 'Qatar National Vision 2030',
        year: 2030,
        launchYear: 2008,
        leader: 'صاحب السمو الأمير تميم بن حمد آل ثاني',
        logo: '🇶🇦',
        pillars: [
            {
                id: 'human-development',
                nameAr: 'التنمية البشرية',
                nameEn: 'Human Development',
                goals: ['تعليم عالي الجودة', 'تطوير رأس المال البشري', 'الصحة والرفاه']
            },
            {
                id: 'social-development',
                nameAr: 'التنمية الاجتماعية',
                nameEn: 'Social Development',
                goals: ['نسيج اجتماعي متماسك', 'حفاظ على الهوية', 'أمان اجتماعي']
            },
            {
                id: 'economic-development',
                nameAr: 'التنمية الاقتصادية',
                nameEn: 'Economic Development',
                goals: ['تنويع الاقتصاد', 'بيئة أعمال منافسة', 'استقطاب الاستثمار']
            },
            {
                id: 'environmental-development',
                nameAr: 'التنمية البيئية',
                nameEn: 'Environmental Development',
                goals: ['التوازن البيئي', 'الطاقة النظيفة', 'الاستدامة']
            }
        ],
        sectors: ['الطاقة', 'البتروكيماويات', 'المالية', 'التعليم', 'الصحة', 'السياحة', 'التقنية'],
        kpis: {
            diversification: 'تقليل الاعتماد على النفط إلى 50%',
            education: 'التميز التعليمي عالمياً',
            sustainability: 'نمو مستدام بيئياً'
        },
        programs: ['قطر للطاقة', 'صندوق قطر السيادي', 'قطر فاونديشن', 'المدينة التعليمية'],
        officialSite: 'https://www.gco.gov.qa',
        status: 'active',
        progress: 72
    },

    'KW': {
        countryCode: 'KW',
        country: 'الكويت',
        countryEn: 'Kuwait',
        visionName: 'رؤية الكويت 2035 — كويت جديدة',
        visionNameEn: 'Kuwait Vision 2035 — New Kuwait',
        year: 2035,
        launchYear: 2017,
        leader: 'صاحب السمو الأمير مشعل الأحمد الجابر الصباح',
        logo: '🇰🇼',
        pillars: [
            { id: 'human-capital', nameAr: 'الإنسان الكويتي', nameEn: 'Kuwaiti Human Capital', goals: ['تطوير رأس المال البشري', 'التعليم والتدريب'] },
            { id: 'infrastructure', nameAr: 'البنية التحتية', nameEn: 'Infrastructure', goals: ['مشاريع البنية التحتية', 'التحديث العمراني'] },
            { id: 'government', nameAr: 'الحوكمة', nameEn: 'Governance', goals: ['حوكمة رشيدة', 'مكافحة الفساد'] },
            { id: 'economy', nameAr: 'الاقتصاد', nameEn: 'Economy', goals: ['تنويع الاقتصاد', 'تحفيز القطاع الخاص'] }
        ],
        sectors: ['النفط والطاقة', 'المالية', 'التجارة', 'التعليم', 'الصحة', 'البناء'],
        kpis: { gdpDiversification: 'تنويع الناتج المحلي', privateEmployment: 'رفع توظيف المواطنين في القطاع الخاص' },
        programs: ['مشروع الشمال', 'ميناء مبارك الكبير', 'مدينة الحرير'],
        officialSite: 'https://www.newkuwait.gov.kw',
        status: 'active',
        progress: 45
    },

    'BH': {
        countryCode: 'BH',
        country: 'مملكة البحرين',
        countryEn: 'Bahrain',
        visionName: 'رؤية البحرين الاقتصادية 2030',
        visionNameEn: 'Bahrain Economic Vision 2030',
        year: 2030,
        launchYear: 2008,
        leader: 'صاحب الجلالة الملك حمد بن عيسى آل خليفة',
        logo: '🇧🇭',
        pillars: [
            { id: 'sustainability', nameAr: 'الاستدامة', nameEn: 'Sustainability', goals: ['اقتصاد متنوع مستدام'] },
            { id: 'competitiveness', nameAr: 'التنافسية', nameEn: 'Competitiveness', goals: ['بيئة تنافسية عالمية'] },
            { id: 'fairness', nameAr: 'العدالة', nameEn: 'Fairness', goals: ['توزيع عادل للثروة'] }
        ],
        sectors: ['المالية والمصرفية', 'السياحة', 'الصناعة', 'الاتصالات', 'اللوجستيات'],
        kpis: { financialHub: 'مركز مالي إقليمي رائد', logistics: 'مركز لوجستي متقدم' },
        programs: ['Bahrain Economic Development Board', 'Tamkeen'],
        officialSite: 'https://www.bahrain.bh/en/vision',
        status: 'active',
        progress: 65
    },

    'OM': {
        countryCode: 'OM',
        country: 'سلطنة عُمان',
        countryEn: 'Oman',
        visionName: 'رؤية عُمان 2040',
        visionNameEn: 'Oman Vision 2040',
        year: 2040,
        launchYear: 2019,
        leader: 'جلالة السلطان هيثم بن طارق',
        logo: '🇴🇲',
        pillars: [
            { id: 'human-development', nameAr: 'الإنسان والمجتمع', nameEn: 'Human & Society', goals: ['تنمية بشرية متكاملة', 'مجتمع متماسك'] },
            { id: 'economy', nameAr: 'الاقتصاد والتنمية', nameEn: 'Economy & Development', goals: ['تنويع الاقتصاد', 'بيئة أعمال ديناميكية'] },
            { id: 'governance', nameAr: 'الحوكمة والمؤسسية', nameEn: 'Governance & Institutions', goals: ['حوكمة فعّالة', 'مؤسسات وطنية قوية'] },
            { id: 'environment', nameAr: 'البيئة والاستدامة', nameEn: 'Environment & Sustainability', goals: ['البيئة المستدامة', 'الطاقة النظيفة'] }
        ],
        sectors: ['السياحة', 'التعدين', 'الصيد والزراعة', 'اللوجستيات', 'التصنيع', 'التقنية'],
        kpis: { tourism: 'رفع مساهمة السياحة 6%', manufacturing: 'تطوير قطاع التصنيع' },
        programs: ['تنفيذ', 'صلالة للصناعات', 'مركز عُمان للخدمات اللوجستية'],
        officialSite: 'https://vision2040.om',
        status: 'active',
        progress: 40
    },

    // ═══════════ الدول العربية ═══════════
    'EG': {
        countryCode: 'EG',
        country: 'جمهورية مصر العربية',
        countryEn: 'Egypt',
        visionName: 'رؤية مصر 2030',
        visionNameEn: 'Egypt Vision 2030',
        year: 2030,
        launchYear: 2016,
        leader: 'الرئيس عبد الفتاح السيسي',
        logo: '🇪🇬',
        pillars: [
            { id: 'economic', nameAr: 'المحور الاقتصادي', nameEn: 'Economic Axis', goals: ['اقتصاد تنافسي متنوع', 'بيئة أعمال جاذبة'] },
            { id: 'social', nameAr: 'المحور الاجتماعي', nameEn: 'Social Axis', goals: ['تنمية بشرية', 'عدالة اجتماعية'] },
            { id: 'environmental', nameAr: 'المحور البيئي', nameEn: 'Environmental Axis', goals: ['بيئة مستدامة', 'تغيير مناخي'] }
        ],
        sectors: ['السياحة', 'الزراعة', 'الصناعة', 'الغاز الطبيعي', 'قناة السويس', 'التقنية'],
        kpis: { gdpGrowth: '6% سنوياً', unemployment: 'تخفيض البطالة', poverty: 'مكافحة الفقر' },
        programs: ['مشروع تطوير الريف المصري', 'العاصمة الإدارية الجديدة', 'مشروع مستقبل مصر'],
        officialSite: 'https://www.mped.gov.eg',
        status: 'active',
        progress: 55
    },

    'JO': {
        countryCode: 'JO',
        country: 'المملكة الأردنية الهاشمية',
        countryEn: 'Jordan',
        visionName: 'رؤية التحديث الاقتصادي 2033',
        visionNameEn: 'Jordan Economic Modernisation Vision 2033',
        year: 2033,
        launchYear: 2022,
        leader: 'جلالة الملك عبدالله الثاني',
        logo: '🇯🇴',
        pillars: [
            { id: 'economic', nameAr: 'التحديث الاقتصادي', nameEn: 'Economic Modernisation', goals: ['رفع النمو الاقتصادي', 'تحديث بيئة الأعمال'] },
            { id: 'social', nameAr: 'التنمية الاجتماعية', nameEn: 'Social Development', goals: ['خلق فرص العمل', 'تحسين جودة الحياة'] }
        ],
        sectors: ['السياحة', 'التقنية والاتصالات', 'الصناعة', 'الطاقة', 'الخدمات'],
        kpis: { gdpGrowth: '5-6% سنوياً', jobs: 'توفير مليون فرصة عمل', exports: 'مضاعفة الصادرات' },
        programs: ['برنامج تحفيز الاقتصاد الأردني', 'قرار تطوير قطاع التقنية'],
        officialSite: 'https://www.emv2033.gov.jo',
        status: 'active',
        progress: 30
    },

    'MA': {
        countryCode: 'MA',
        country: 'المملكة المغربية',
        countryEn: 'Morocco',
        visionName: 'النموذج التنموي المغربي الجديد 2035',
        visionNameEn: 'New Morocco Development Model 2035',
        year: 2035,
        launchYear: 2021,
        leader: 'صاحب الجلالة الملك محمد السادس',
        logo: '🇲🇦',
        pillars: [
            { id: 'human-capital', nameAr: 'رأس المال البشري', nameEn: 'Human Capital', goals: ['التعليم والتكوين المهني', 'الصحة والرعاية الاجتماعية'] },
            { id: 'inclusive-economy', nameAr: 'اقتصاد شامل', nameEn: 'Inclusive Economy', goals: ['توفير فرص العمل', 'تنمية الاقتصاد غير الرسمي'] },
            { id: 'territories', nameAr: 'تنمية الأقاليم', nameEn: 'Territorial Development', goals: ['تنمية متوازنة', 'الجهوية المتقدمة'] }
        ],
        sectors: ['الفلاحة', 'السياحة', 'الصناعة', 'الخدمات', 'الطاقة المتجددة', 'التقنية'],
        kpis: { gdpGrowth: '6% سنوياً', employment: 'رفع نسبة التشغيل', poverty: 'القضاء على الفقر المدقع' },
        programs: ['مخطط المغرب الأخضر', 'برنامج أوراش', 'المبادرة الوطنية للتنمية البشرية'],
        officialSite: 'https://www.csmd.ma',
        status: 'active',
        progress: 35
    },

    // ═══════════ الدول الإسلامية ═══════════
    'MY': {
        countryCode: 'MY',
        country: 'ماليزيا',
        countryEn: 'Malaysia',
        visionName: 'رؤية ماليزيا المستدامة 2030',
        visionNameEn: 'Shared Prosperity Vision 2030',
        year: 2030,
        launchYear: 2019,
        leader: 'رئيس الوزراء داتو سري أنور إبراهيم',
        logo: '🇲🇾',
        pillars: [
            { id: 'economic-growth', nameAr: 'النمو الاقتصادي', nameEn: 'Economic Growth', goals: ['اقتصاد متنوع', 'مجتمع متوسط الدخل'] },
            { id: 'social-equity', nameAr: 'العدالة الاجتماعية', nameEn: 'Social Equity', goals: ['مجتمع عادل', 'تقليل التفاوت'] }
        ],
        sectors: ['التقنية', 'التصنيع', 'الخدمات المالية', 'السياحة الإسلامية', 'الزراعة'],
        kpis: { gdpPerCapita: '15,000 USD', giniCoefficient: 'تقليل التفاوت', poverty: 'القضاء على الفقر المتطرف' },
        programs: ['Malaysia Digital Economy Blueprint', 'MyDigital'],
        officialSite: 'https://www.epu.gov.my',
        status: 'active',
        progress: 50
    },

    'TR': {
        countryCode: 'TR',
        country: 'تركيا',
        countryEn: 'Turkey',
        visionName: 'رؤية تركيا 2053',
        visionNameEn: 'Turkey Vision 2053',
        year: 2053,
        launchYear: 2021,
        leader: 'الرئيس رجب طيب أردوغان',
        logo: '🇹🇷',
        pillars: [
            { id: 'economy', nameAr: 'الاقتصاد', nameEn: 'Economy', goals: ['ضمن أكبر 10 اقتصادات', 'صناعة متقدمة'] },
            { id: 'technology', nameAr: 'التقنية', nameEn: 'Technology', goals: ['التطوير التقني المحلي', 'الصناعة الدفاعية'] },
            { id: 'regional-leadership', nameAr: 'الريادة الإقليمية', nameEn: 'Regional Leadership', goals: ['نفوذ إقليمي وعالمي'] }
        ],
        sectors: ['الدفاع', 'الفضاء', 'السيارات', 'التقنية', 'السياحة', 'الطاقة'],
        kpis: { gdpTarget: 'ضمن G10', defense: 'صناعة دفاعية مكتفية ذاتياً بنسبة 75%' },
        programs: ['TOGG (السيارة التركية)', 'برنامج الفضاء التركي', 'HAVELSAN'],
        officialSite: 'https://www.sbb.gov.tr',
        status: 'active',
        progress: 45
    },

    'PK': {
        countryCode: 'PK',
        country: 'باكستان',
        countryEn: 'Pakistan',
        visionName: 'رؤية باكستان 2025',
        visionNameEn: 'Pakistan Vision 2025',
        year: 2025,
        launchYear: 2014,
        leader: 'رئيس الوزراء شهباز شريف',
        logo: '🇵🇰',
        pillars: [
            { id: 'human-capital', nameAr: 'التنمية البشرية', nameEn: 'Human Capital', goals: ['التعليم الشامل', 'الصحة العامة'] },
            { id: 'water-food', nameAr: 'الأمن الغذائي والمائي', nameEn: 'Water & Food Security', goals: ['الزراعة المستدامة', 'الأمن المائي'] },
            { id: 'energy', nameAr: 'الطاقة', nameEn: 'Energy', goals: ['توفير الطاقة الكافية', 'الطاقة المتجددة'] },
            { id: 'economy', nameAr: 'الاقتصاد', nameEn: 'Economy', goals: ['نمو اقتصادي مستدام', 'تنويع الصادرات'] }
        ],
        sectors: ['الزراعة', 'النسيج', 'التقنية', 'السياحة', 'التعدين', 'الطاقة'],
        kpis: { gdpGrowth: '7-8%', literacy: 'رفع معدل التعليم إلى 90%' },
        programs: ['CPEC - الممر الاقتصادي الصيني الباكستاني', 'برنامج احساس'],
        officialSite: 'https://www.pc.gov.pk',
        status: 'active',
        progress: 35
    },

    // ═══════════ دول عالمية ═══════════
    'CN': {
        countryCode: 'CN',
        country: 'الصين',
        countryEn: 'China',
        visionName: 'رؤية الصين 2049 — الحلم الصيني',
        visionNameEn: 'China Dream 2049',
        year: 2049,
        launchYear: 2012,
        leader: 'الرئيس شي جين بينغ',
        logo: '🇨🇳',
        pillars: [
            { id: 'economy', nameAr: 'القوة الاقتصادية', nameEn: 'Economic Power', goals: ['أكبر اقتصاد في العالم', 'تكنولوجيا متقدمة'] },
            { id: 'military', nameAr: 'القوة العسكرية', nameEn: 'Military Power', goals: ['قوة عسكرية عالمية'] },
            { id: 'innovation', nameAr: 'الابتكار', nameEn: 'Innovation', goals: ['قيادة الذكاء الاصطناعي والتقنية'] }
        ],
        sectors: ['التقنية', 'التصنيع', 'الطاقة', 'البنية التحتية', 'الفضاء'],
        kpis: { gdpTarget: 'أكبر اقتصاد عالمي بحلول 2049', aiLeadership: 'قيادة عالمية في الذكاء الاصطناعي' },
        programs: ['مبادرة الحزام والطريق', 'صنع في الصين 2025', 'برنامج الفضاء الصيني'],
        officialSite: 'https://www.gov.cn',
        status: 'active',
        progress: 65
    },

    'IN': {
        countryCode: 'IN',
        country: 'الهند',
        countryEn: 'India',
        visionName: 'رؤية الهند 2047 — هند متطورة',
        visionNameEn: 'Viksit Bharat 2047',
        year: 2047,
        launchYear: 2023,
        leader: 'رئيس الوزراء ناريندرا مودي',
        logo: '🇮🇳',
        pillars: [
            { id: 'economy', nameAr: 'الاقتصاد', nameEn: 'Economy', goals: ['5 تريليون دولار بحلول 2025', 'ثالث اقتصاد بحلول 2047'] },
            { id: 'technology', nameAr: 'التقنية الرقمية', nameEn: 'Digital Technology', goals: ['اقتصاد رقمي رائد', 'ذكاء اصطناعي وتقنية'] },
            { id: 'infrastructure', nameAr: 'البنية التحتية', nameEn: 'Infrastructure', goals: ['بنية تحتية عالمية المستوى'] }
        ],
        sectors: ['تقنية المعلومات', 'الصيدلة', 'الفضاء', 'الطاقة المتجددة', 'الزراعة', 'التصنيع'],
        kpis: { gdpTarget: '35 تريليون دولار بحلول 2047', digital: 'مليار مستخدم رقمي' },
        programs: ['Make in India', 'Digital India', 'Smart Cities Mission'],
        officialSite: 'https://www.india.gov.in',
        status: 'active',
        progress: 50
    }
};

// ─── محرك رؤية الدول ──────────────────────────────────────────────────────────

class SheikhaNationalVisionsEngine {
    constructor() {
        this.version = '1.0.0';
        this.visionsDB = NATIONAL_VISIONS_DB;
        this.alignmentCache = new Map();
        console.log('🌍 [NATIONAL-VISIONS] محرك رؤية الدول مُفعّل — ' + Object.keys(this.visionsDB).length + ' رؤية وطنية');
    }

    // ─── الحصول على كل رؤى الدول ─────────────────────────────────────────────
    getAllVisions() {
        return Object.values(this.visionsDB).map(v => ({
            countryCode: v.countryCode,
            country: v.country,
            countryEn: v.countryEn,
            visionName: v.visionName,
            visionNameEn: v.visionNameEn,
            year: v.year,
            launchYear: v.launchYear,
            leader: v.leader,
            logo: v.logo,
            status: v.status,
            progress: v.progress,
            pillarsCount: v.pillars.length,
            sectorsCount: v.sectors.length,
            officialSite: v.officialSite
        }));
    }

    // ─── الحصول على رؤية دولة بعينها ─────────────────────────────────────────
    getVisionByCountry(countryCode) {
        const vision = this.visionsDB[countryCode.toUpperCase()];
        if (!vision) {
            return null;
        }
        return vision;
    }

    // ─── البحث في رؤى الدول ──────────────────────────────────────────────────
    searchVisions(query) {
        const q = (query || '').toLowerCase();
        return Object.values(this.visionsDB).filter(v =>
            v.country.includes(q) ||
            v.countryEn.toLowerCase().includes(q) ||
            v.visionName.includes(q) ||
            v.visionNameEn.toLowerCase().includes(q) ||
            v.sectors.some(s => s.toLowerCase().includes(q)) ||
            v.pillars.some(p => p.nameAr.includes(q) || p.nameEn.toLowerCase().includes(q))
        );
    }

    // ─── مواءمة نشاط تجاري مع رؤى الدول ────────────────────────────────────
    alignBusinessWithVisions(businessProfile) {
        const {
            sector = '',
            services = [],
            targetCountries = [],
            keywords = []
        } = businessProfile;

        const cacheKey = JSON.stringify(businessProfile);
        if (this.alignmentCache.has(cacheKey)) {
            return this.alignmentCache.get(cacheKey);
        }

        const alignments = [];

        const visionsList = targetCountries.length > 0
            ? targetCountries.map(c => this.visionsDB[c.toUpperCase()]).filter(Boolean)
            : Object.values(this.visionsDB);

        for (const vision of visionsList) {
            const alignmentScore = this._calculateAlignmentScore(
                { sector, services, keywords },
                vision
            );

            if (alignmentScore.score > 0) {
                alignments.push({
                    countryCode: vision.countryCode,
                    country: vision.country,
                    visionName: vision.visionName,
                    logo: vision.logo,
                    score: alignmentScore.score,
                    matchedPillars: alignmentScore.matchedPillars,
                    matchedSectors: alignmentScore.matchedSectors,
                    opportunities: alignmentScore.opportunities,
                    recommendation: alignmentScore.recommendation
                });
            }
        }

        // ترتيب حسب درجة المواءمة
        alignments.sort((a, b) => b.score - a.score);

        const result = {
            businessProfile,
            totalVisions: Object.keys(this.visionsDB).length,
            alignedVisions: alignments.length,
            topAlignments: alignments.slice(0, 5),
            allAlignments: alignments,
            generatedAt: new Date().toISOString()
        };

        this.alignmentCache.set(cacheKey, result);
        return result;
    }

    _calculateAlignmentScore(business, vision) {
        let score = 0;
        const matchedPillars = [];
        const matchedSectors = [];
        const opportunities = [];

        const businessText = [
            business.sector,
            ...business.services,
            ...business.keywords
        ].join(' ').toLowerCase();

        // فحص تطابق القطاعات
        for (const sector of vision.sectors) {
            const sectorLower = sector.toLowerCase();
            if (businessText.includes(sectorLower) ||
                sectorLower.split(/\s+/).some(w => w.length > 2 && businessText.includes(w))) {
                matchedSectors.push(sector);
                score += 20;
            }
        }

        // فحص تطابق المحاور
        for (const pillar of vision.pillars) {
            const pillarText = (pillar.nameAr + ' ' + pillar.nameEn + ' ' + pillar.goals.join(' ')).toLowerCase();
            if (pillarText.split(' ').some(word => word.length > 3 && businessText.includes(word))) {
                matchedPillars.push(pillar.nameAr);
                score += 15;
                opportunities.push(...pillar.goals.slice(0, 2));
            }
        }

        // فرصة مقترحة
        const recommendation = score > 50
            ? `مواءمة ممتازة — نشاطك يدعم ${vision.visionName} مباشرة`
            : score > 25
            ? `مواءمة جيدة — فرص واعدة ضمن ${vision.visionName}`
            : score > 0
            ? `مواءمة جزئية — يمكن تطوير جوانب لدعم ${vision.visionName}`
            : 'لا توافق مباشر';

        return { score, matchedPillars, matchedSectors, opportunities: [...new Set(opportunities)], recommendation };
    }

    // ─── الحصول على رؤى منطقة بعينها ────────────────────────────────────────
    getVisionsByRegion(region) {
        const regions = {
            'gcc': ['SA', 'AE', 'QA', 'KW', 'BH', 'OM'],
            'arab': ['SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'EG', 'JO', 'MA'],
            'islamic': ['SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'EG', 'JO', 'MA', 'MY', 'TR', 'PK'],
            'global': Object.keys(NATIONAL_VISIONS_DB),
            'asia': ['SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'MY', 'TR', 'PK', 'CN', 'IN']
        };

        const countryCodes = regions[region.toLowerCase()] || regions['global'];
        return countryCodes
            .map(code => this.visionsDB[code])
            .filter(Boolean);
    }

    // ─── تقرير تقدم رؤى الدول ────────────────────────────────────────────────
    getProgressReport() {
        const visions = Object.values(this.visionsDB);
        const avgProgress = Math.round(visions.reduce((s, v) => s + v.progress, 0) / visions.length);

        return {
            totalVisions: visions.length,
            averageProgress: avgProgress,
            topPerformers: visions
                .sort((a, b) => b.progress - a.progress)
                .slice(0, 3)
                .map(v => ({ country: v.country, visionName: v.visionName, progress: v.progress, logo: v.logo })),
            byRegion: {
                gcc: this.getVisionsByRegion('gcc').map(v => ({ country: v.country, progress: v.progress })),
                arab: this.getVisionsByRegion('arab').map(v => ({ country: v.country, progress: v.progress })),
                islamic: this.getVisionsByRegion('islamic').map(v => ({ country: v.country, progress: v.progress }))
            },
            generatedAt: new Date().toISOString()
        };
    }

    // ─── فرص الاستثمار عبر الرؤى ─────────────────────────────────────────────
    getInvestmentOpportunities(sector) {
        const opportunities = [];

        for (const vision of Object.values(this.visionsDB)) {
            const sectorMatch = vision.sectors.some(s =>
                s.toLowerCase().includes((sector || '').toLowerCase())
            );

            if (!sector || sectorMatch) {
                for (const pillar of vision.pillars) {
                    opportunities.push({
                        country: vision.country,
                        countryCode: vision.countryCode,
                        logo: vision.logo,
                        visionName: vision.visionName,
                        pillar: pillar.nameAr,
                        goals: pillar.goals,
                        relevantSectors: vision.sectors,
                        programs: vision.programs,
                        progress: vision.progress
                    });
                }
            }
        }

        return {
            sector: sector || 'الكل',
            count: opportunities.length,
            opportunities: opportunities.slice(0, 20),
            generatedAt: new Date().toISOString()
        };
    }

    // ─── الحالة العامة للمحرك ─────────────────────────────────────────────────
    getStatus() {
        return {
            engine: 'SheikhaNationalVisionsEngine',
            version: this.version,
            status: 'active',
            totalVisions: Object.keys(this.visionsDB).length,
            regions: ['gcc', 'arab', 'islamic', 'global'],
            features: [
                'getAllVisions',
                'getVisionByCountry',
                'searchVisions',
                'alignBusinessWithVisions',
                'getVisionsByRegion',
                'getProgressReport',
                'getInvestmentOpportunities'
            ],
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = SheikhaNationalVisionsEngine;
