/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ☪️ بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * SHEIKHA LEGAL ENGINE — منظومة شيخة للقوانين والأنظمة والمعاهدات
 * المالك: سلمان أحمد بن سلمان الراجح
 *
 * "إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا وَإِذَا حَكَمْتُم بَيْنَ النَّاسِ
 *  أَن تَحْكُمُوا بِالْعَدْلِ" — النساء ٥٨
 *
 * ✅ الأنظمة السعودية — ١٢ فئة
 * ✅ القانون الدولي — ٧ فروع
 * ✅ المنظمات والهيئات الدولية
 * ✅ المعاهدات والاتفاقيات التجارية والسياسية والاجتماعية
 * ✅ الضوابط الشرعية — بالكتاب والسنة
 * ═══════════════════════════════════════════════════════════════════════════════
 */
'use strict';

class SheikhaLegalEngine {
    constructor() {
        this.name = 'Sheikha Legal Engine';
        this.version = '1.0.0';
        this.owner = 'سلمان أحمد بن سلمان الراجح';
        this.activatedAt = new Date().toISOString();
        this._init();
    }

    _init() {
        // ══════════════════════════════════════════════
        // آيات وأحاديث العدل والقانون
        // ══════════════════════════════════════════════
        this.quranReferences = [
            { ayah: 'إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا وَإِذَا حَكَمْتُم بَيْنَ النَّاسِ أَن تَحْكُمُوا بِالْعَدْلِ', surah: 'النساء', num: 58, topic: 'العدل في الحكم' },
            { ayah: 'يَا أَيُّهَا الَّذِينَ آمَنُوا أَوْفُوا بِالْعُقُودِ', surah: 'المائدة', num: 1, topic: 'الوفاء بالعقود' },
            { ayah: 'وَأَوْفُوا بِالْعَهْدِ إِنَّ الْعَهْدَ كَانَ مَسْئُولًا', surah: 'الإسراء', num: 34, topic: 'المسؤولية عن العهود' },
            { ayah: 'يَا أَيُّهَا الَّذِينَ آمَنُوا كُونُوا قَوَّامِينَ بِالْقِسْطِ شُهَدَاءَ لِلَّهِ', surah: 'النساء', num: 135, topic: 'العدل والقسط' },
            { ayah: 'وَلَا تَبْخَسُوا النَّاسَ أَشْيَاءَهُمْ وَلَا تُفْسِدُوا فِي الْأَرْضِ بَعْدَ إِصْلَاحِهَا', surah: 'الأعراف', num: 85, topic: 'حفظ الحقوق وعدم الإفساد' },
            { ayah: 'وَإِن تَنَازَعْتُمْ فِي شَيْءٍ فَرُدُّوهُ إِلَى اللَّهِ وَالرَّسُولِ', surah: 'النساء', num: 59, topic: 'مرجعية الشريعة في النزاعات' }
        ];

        // ══════════════════════════════════════════════════════════════════
        // ١. الأنظمة السعودية — Saudi Laws & Regulations
        // ══════════════════════════════════════════════════════════════════
        this.saudiLaws = {
            nameAr: 'الأنظمة واللوائح السعودية',
            nameEn: 'Saudi Laws & Regulations',
            source: 'النظام الأساسي للحكم مبني على الكتاب والسنة',
            categories: [
                {
                    nameAr: 'الأنظمة التجارية', nameEn: 'Commercial Laws',
                    laws: [
                        { nameAr: 'نظام الشركات', year: 2022, regulator: 'وزارة التجارة' },
                        { nameAr: 'نظام التجارة الإلكترونية', year: 2019, regulator: 'وزارة التجارة' },
                        { nameAr: 'نظام الأوراق التجارية', year: 1964, regulator: 'وزارة التجارة' },
                        { nameAr: 'نظام الوكالات التجارية', year: 1962, regulator: 'وزارة التجارة' },
                        { nameAr: 'نظام المنافسة', year: 2019, regulator: 'الهيئة العامة للمنافسة' },
                        { nameAr: 'نظام مكافحة الغش التجاري', year: 2008, regulator: 'وزارة التجارة' },
                        { nameAr: 'نظام الامتياز التجاري', year: 2019, regulator: 'وزارة التجارة' },
                        { nameAr: 'نظام العلامات التجارية', year: 2002, regulator: 'SAIP' }
                    ]
                },
                {
                    nameAr: 'الأنظمة المالية والمصرفية', nameEn: 'Financial & Banking Laws',
                    laws: [
                        { nameAr: 'نظام مراقبة البنوك', regulator: 'البنك المركزي السعودي SAMA' },
                        { nameAr: 'نظام السوق المالية', year: 2003, regulator: 'هيئة السوق المالية CMA' },
                        { nameAr: 'نظام مكافحة غسل الأموال', year: 2017, regulator: 'SAMA' },
                        { nameAr: 'نظام التمويل', year: 2012, regulator: 'SAMA' },
                        { nameAr: 'نظام الإيجار التمويلي', year: 2012, regulator: 'SAMA' },
                        { nameAr: 'نظام المدفوعات', year: 2023, regulator: 'SAMA' }
                    ]
                },
                {
                    nameAr: 'أنظمة الملكية الفكرية', nameEn: 'IP Laws',
                    laws: [
                        { nameAr: 'نظام براءات الاختراع', regulator: 'SAIP' },
                        { nameAr: 'نظام حماية حقوق المؤلف', regulator: 'SAIP' },
                        { nameAr: 'نظام العلامات التجارية', regulator: 'SAIP' },
                        { nameAr: 'نظام الأسماء التجارية', regulator: 'وزارة التجارة' },
                        { nameAr: 'نظام حماية الأصناف النباتية', regulator: 'SAIP' }
                    ]
                },
                {
                    nameAr: 'أنظمة تقنية المعلومات', nameEn: 'IT & Cyber Laws',
                    laws: [
                        { nameAr: 'نظام مكافحة جرائم المعلوماتية', year: 2007, regulator: 'النيابة العامة' },
                        { nameAr: 'نظام حماية البيانات الشخصية', year: 2021, regulator: 'SDAIA' },
                        { nameAr: 'نظام التعاملات الإلكترونية', year: 2007, regulator: 'هيئة الحكومة الرقمية' },
                        { nameAr: 'نظام الاتصالات وتقنية المعلومات', regulator: 'هيئة الاتصالات CITC' }
                    ]
                },
                {
                    nameAr: 'أنظمة العمل والتوظيف', nameEn: 'Labor Laws',
                    laws: [
                        { nameAr: 'نظام العمل', year: 2005, regulator: 'وزارة الموارد البشرية' },
                        { nameAr: 'نظام التأمينات الاجتماعية', regulator: 'مؤسسة التأمينات' },
                        { nameAr: 'نظام العمل المرن', year: 2021, regulator: 'وزارة الموارد البشرية' },
                        { nameAr: 'نظام وثيقة العمل الحر', year: 2020, regulator: 'وزارة الموارد البشرية' }
                    ]
                },
                {
                    nameAr: 'الأنظمة الضريبية والزكوية', nameEn: 'Tax & Zakat Laws',
                    laws: [
                        { nameAr: 'نظام جباية الزكاة', regulator: 'هيئة الزكاة والضريبة والجمارك ZATCA' },
                        { nameAr: 'نظام ضريبة القيمة المضافة', year: 2018, regulator: 'ZATCA' },
                        { nameAr: 'نظام ضريبة الدخل', regulator: 'ZATCA' },
                        { nameAr: 'نظام الضريبة الانتقائية', year: 2017, regulator: 'ZATCA' },
                        { nameAr: 'النظام الجمركي الموحد', regulator: 'ZATCA' }
                    ]
                },
                {
                    nameAr: 'أنظمة الاستثمار', nameEn: 'Investment Laws',
                    laws: [
                        { nameAr: 'نظام الاستثمار الأجنبي', year: 2000, regulator: 'وزارة الاستثمار MISA' },
                        { nameAr: 'نظام المناطق الاقتصادية الخاصة', year: 2023, regulator: 'هيئة المناطق الاقتصادية' },
                        { nameAr: 'نظام الإفلاس', year: 2018, regulator: 'لجنة الإفلاس' },
                        { nameAr: 'نظام التسجيل العيني للعقار', regulator: 'الهيئة العامة للعقار' }
                    ]
                },
                {
                    nameAr: 'أنظمة الصناعة والتعدين', nameEn: 'Industry & Mining Laws',
                    laws: [
                        { nameAr: 'نظام الاستثمار التعديني', year: 2020, regulator: 'وزارة الصناعة' },
                        { nameAr: 'قانون الصناعة الخليجي الموحد', regulator: 'وزارة الصناعة' },
                        { nameAr: 'نظام المقاييس والمعايير والجودة', regulator: 'هيئة المواصفات SASO' }
                    ]
                },
                {
                    nameAr: 'أنظمة الطاقة والبيئة', nameEn: 'Energy & Environment Laws',
                    laws: [
                        { nameAr: 'النظام العام للبيئة', regulator: 'المركز الوطني لإدارة النفايات' },
                        { nameAr: 'نظام كفاءة الطاقة', regulator: 'المركز السعودي لكفاءة الطاقة' },
                        { nameAr: 'نظام المياه', regulator: 'وزارة البيئة والمياه والزراعة' }
                    ]
                },
                {
                    nameAr: 'أنظمة القضاء والتحكيم', nameEn: 'Judiciary & Arbitration',
                    laws: [
                        { nameAr: 'نظام المرافعات الشرعية', regulator: 'وزارة العدل' },
                        { nameAr: 'نظام المرافعات أمام ديوان المظالم', regulator: 'ديوان المظالم' },
                        { nameAr: 'نظام التحكيم', year: 2012, regulator: 'وزارة العدل' },
                        { nameAr: 'نظام التنفيذ', regulator: 'وزارة العدل' },
                        { nameAr: 'نظام التوثيق', regulator: 'وزارة العدل' }
                    ]
                },
                {
                    nameAr: 'أنظمة الإعلام والنشر', nameEn: 'Media & Publishing Laws',
                    laws: [
                        { nameAr: 'نظام المطبوعات والنشر', regulator: 'وزارة الإعلام' },
                        { nameAr: 'نظام المرئي والمسموع', regulator: 'هيئة الإعلام المرئي والمسموع' },
                        { nameAr: 'ضوابط المحتوى الرقمي', regulator: 'CITC' }
                    ]
                },
                {
                    nameAr: 'أنظمة النقل واللوجستيات', nameEn: 'Transport & Logistics Laws',
                    laws: [
                        { nameAr: 'نظام النقل العام', regulator: 'هيئة النقل العام TGA' },
                        { nameAr: 'نظام الموانئ', regulator: 'هيئة الموانئ Mawani' },
                        { nameAr: 'نظام الطيران المدني', regulator: 'هيئة الطيران المدني GACA' },
                        { nameAr: 'نظام النقل البحري', regulator: 'هيئة النقل' }
                    ]
                }
            ]
        };

        // ══════════════════════════════════════════════════════════════════
        // ٢. القانون الدولي — International Law
        // ══════════════════════════════════════════════════════════════════
        this.internationalLaw = {
            nameAr: 'القانون الدولي',
            nameEn: 'International Law',
            branches: [
                {
                    nameAr: 'القانون الدولي العام', nameEn: 'Public International Law',
                    topics: ['ميثاق الأمم المتحدة', 'قانون المعاهدات (فيينا 1969)', 'القانون الدبلوماسي', 'قانون البحار (UNCLOS)', 'قانون الفضاء الخارجي', 'حقوق الإنسان الدولية']
                },
                {
                    nameAr: 'القانون التجاري الدولي', nameEn: 'International Trade Law',
                    topics: ['اتفاقيات WTO', 'UNCITRAL', 'Incoterms', 'اتفاقية البيع الدولي (CISG)', 'قوانين مكافحة الإغراق', 'قوانين الجمارك']
                },
                {
                    nameAr: 'قانون الاستثمار الدولي', nameEn: 'International Investment Law',
                    topics: ['اتفاقيات حماية الاستثمار BITs', 'ICSID', 'تحكيم استثماري', 'معايير المعاملة العادلة']
                },
                {
                    nameAr: 'قانون الملكية الفكرية الدولي', nameEn: 'International IP Law',
                    topics: ['اتفاقية TRIPS', 'اتفاقية باريس', 'اتفاقية بيرن', 'معاهدة PCT', 'اتفاقية مدريد']
                },
                {
                    nameAr: 'القانون البحري الدولي', nameEn: 'International Maritime Law',
                    topics: ['اتفاقية هامبورغ', 'قواعد لاهاي-فيسبي', 'اتفاقية روتردام', 'قانون التأمين البحري']
                },
                {
                    nameAr: 'قانون التحكيم الدولي', nameEn: 'International Arbitration',
                    topics: ['اتفاقية نيويورك 1958', 'ICC', 'LCIA', 'SIAC', 'SCCA (مركز التحكيم السعودي)']
                },
                {
                    nameAr: 'القانون الدولي الإنساني', nameEn: 'International Humanitarian Law',
                    topics: ['اتفاقيات جنيف', 'الصليب الأحمر', 'حماية المدنيين', 'قوانين النزاعات المسلحة']
                }
            ]
        };

        // ══════════════════════════════════════════════════════════════════
        // ٣. المنظمات والهيئات الدولية
        // ══════════════════════════════════════════════════════════════════
        this.internationalOrganizations = {
            global: [
                { nameAr: 'الأمم المتحدة', nameEn: 'United Nations', type: 'دولية', role: 'سلام وأمن دولي', saudiMember: true },
                { nameAr: 'منظمة التجارة العالمية', nameEn: 'WTO', type: 'تجارية', role: 'تنظيم التجارة الدولية', saudiMember: true, joined: 2005 },
                { nameAr: 'البنك الدولي', nameEn: 'World Bank', type: 'مالية', role: 'تمويل التنمية', saudiMember: true },
                { nameAr: 'صندوق النقد الدولي', nameEn: 'IMF', type: 'مالية', role: 'استقرار مالي دولي', saudiMember: true },
                { nameAr: 'المنظمة العالمية للملكية الفكرية', nameEn: 'WIPO', type: 'ملكية فكرية', role: 'حماية IP', saudiMember: true },
                { nameAr: 'منظمة العمل الدولية', nameEn: 'ILO', type: 'عمالية', role: 'حقوق العمال', saudiMember: true },
                { nameAr: 'الإنتربول', nameEn: 'INTERPOL', type: 'أمنية', role: 'تعاون شرطي دولي', saudiMember: true },
                { nameAr: 'مجموعة العشرين', nameEn: 'G20', type: 'اقتصادية', role: 'تنسيق اقتصادي', saudiMember: true },
                { nameAr: 'أوبك', nameEn: 'OPEC', type: 'نفطية', role: 'تنسيق إنتاج النفط', saudiMember: true, founder: true },
                { nameAr: 'أوبك+', nameEn: 'OPEC+', type: 'نفطية', role: 'إدارة سوق النفط العالمي', saudiMember: true }
            ],
            islamic: [
                { nameAr: 'منظمة التعاون الإسلامي', nameEn: 'OIC', type: 'إسلامية', role: 'تعاون بين الدول الإسلامية', saudiRole: 'مقر في جدة' },
                { nameAr: 'البنك الإسلامي للتنمية', nameEn: 'IsDB', type: 'مالية إسلامية', role: 'تمويل تنموي إسلامي', saudiRole: 'مقر في جدة' },
                { nameAr: 'مجمع الفقه الإسلامي الدولي', nameEn: 'IIFA', type: 'فقهية', role: 'اجتهاد فقهي جماعي', saudiRole: 'مقر في جدة' },
                { nameAr: 'هيئة المحاسبة والمراجعة للمؤسسات المالية الإسلامية', nameEn: 'AAOIFI', type: 'معايير مالية', role: 'معايير المالية الإسلامية' },
                { nameAr: 'مجلس الخدمات المالية الإسلامية', nameEn: 'IFSB', type: 'رقابية', role: 'معايير رقابية للمالية الإسلامية' },
                { nameAr: 'الاتحاد العالمي للعلماء المسلمين', nameEn: 'IUMS', type: 'علمية', role: 'تنسيق بين العلماء' }
            ],
            regional: [
                { nameAr: 'مجلس التعاون الخليجي', nameEn: 'GCC', type: 'إقليمية', role: 'تكامل خليجي', saudiRole: 'عضو مؤسس' },
                { nameAr: 'جامعة الدول العربية', nameEn: 'Arab League', type: 'عربية', role: 'تعاون عربي', saudiMember: true },
                { nameAr: 'صندوق النقد العربي', nameEn: 'AMF', type: 'مالية عربية', role: 'تعاون نقدي عربي' },
                { nameAr: 'المنظمة العربية للتنمية الصناعية', nameEn: 'AIDO', type: 'صناعية', role: 'تنمية صناعية عربية' }
            ]
        };

        // ══════════════════════════════════════════════════════════════════
        // ٤. المعاهدات والاتفاقيات
        // ══════════════════════════════════════════════════════════════════
        this.treaties = {
            commercial: [
                { nameAr: 'اتفاقية التجارة الحرة الكبرى العربية (GAFTA)', type: 'تجارة حرة', members: 'الدول العربية' },
                { nameAr: 'الاتحاد الجمركي الخليجي', type: 'جمركية', members: 'دول الخليج' },
                { nameAr: 'اتفاقيات التجارة الحرة السعودية الثنائية', type: 'ثنائية', examples: ['EFTA', 'مفاوضات مع UK', 'مفاوضات مع EU'] },
                { nameAr: 'اتفاقية TFA (تسهيل التجارة)', type: 'WTO', members: 'أعضاء WTO' },
                { nameAr: 'اتفاقية RCEP', type: 'تجارة آسيوية', note: 'أكبر اتفاقية تجارية عالمياً' },
                { nameAr: 'اتفاقيات منطقة التجارة الحرة القارية الأفريقية (AfCFTA)', type: 'أفريقية', members: 'الدول الأفريقية' }
            ],
            investment: [
                { nameAr: 'اتفاقيات حماية وتشجيع الاستثمار الثنائية (BITs)', count: '> 30 اتفاقية سعودية', type: 'ثنائية' },
                { nameAr: 'اتفاقية تسوية منازعات الاستثمار (ICSID)', type: 'تحكيم' },
                { nameAr: 'الاتفاقية الموحدة لاستثمار رؤوس الأموال العربية', type: 'عربية' }
            ],
            taxAndCustoms: [
                { nameAr: 'اتفاقيات تجنب الازدواج الضريبي', count: '> 50 اتفاقية سعودية', type: 'ضريبية' },
                { nameAr: 'اتفاقية تبادل المعلومات الضريبية (CRS/FATCA)', type: 'شفافية' },
                { nameAr: 'النظام الجمركي الموحد لدول الخليج', type: 'جمركية خليجية' }
            ],
            political: [
                { nameAr: 'ميثاق الأمم المتحدة', year: 1945, type: 'سياسية دولية' },
                { nameAr: 'ميثاق منظمة التعاون الإسلامي', type: 'إسلامية' },
                { nameAr: 'ميثاق جامعة الدول العربية', type: 'عربية' },
                { nameAr: 'النظام الأساسي لمجلس التعاون الخليجي', type: 'خليجية' },
                { nameAr: 'إعلان القاهرة لحقوق الإنسان في الإسلام', year: 1990, type: 'إسلامية' },
                { nameAr: 'اتفاقية مكافحة الإرهاب (OIC)', type: 'أمنية' },
                { nameAr: 'اتفاقية فيينا للعلاقات الدبلوماسية', year: 1961, type: 'دبلوماسية' }
            ],
            social: [
                { nameAr: 'اتفاقية حقوق الطفل', type: 'حقوقية', saudiSignatory: true },
                { nameAr: 'اتفاقية القضاء على التمييز ضد المرأة (CEDAW)', type: 'حقوقية', saudiSignatory: true, note: 'مع تحفظات شرعية' },
                { nameAr: 'اتفاقيات منظمة العمل الدولية', type: 'عمالية' },
                { nameAr: 'اتفاقية مكافحة الاتجار بالبشر', type: 'حقوقية', saudiSignatory: true },
                { nameAr: 'الاتفاقية العربية لمكافحة الفساد', type: 'نزاهة' },
                { nameAr: 'اتفاقية الأمم المتحدة لمكافحة الفساد', type: 'نزاهة', saudiSignatory: true }
            ],
            environmental: [
                { nameAr: 'اتفاقية باريس للمناخ', year: 2015, type: 'بيئية', saudiSignatory: true },
                { nameAr: 'بروتوكول مونتريال (طبقة الأوزون)', type: 'بيئية' },
                { nameAr: 'اتفاقية التنوع البيولوجي', type: 'بيئية', saudiSignatory: true },
                { nameAr: 'اتفاقية مكافحة التصحر', type: 'بيئية', saudiSignatory: true }
            ]
        };

        // ══════════════════════════════════════════════════════════════════
        // ٥. قوانين الدول الأخرى ذات العلاقة
        // ══════════════════════════════════════════════════════════════════
        this.foreignLaws = {
            nameAr: 'أنظمة الدول الأخرى ذات العلاقة بالتجارة',
            nameEn: 'Foreign Laws Relevant to Trade',
            countries: [
                { country: 'الإمارات', laws: ['قانون الشركات التجارية', 'قانون التجارة الإلكترونية', 'DIFC', 'ADGM', 'قانون حماية البيانات'] },
                { country: 'الولايات المتحدة', laws: ['UCC', 'قانون مكافحة الرشوة FCPA', 'قانون الامتثال الضريبي FATCA', 'CCPA/CPRA حماية بيانات', 'قانون العقوبات OFAC'] },
                { country: 'الاتحاد الأوروبي', laws: ['GDPR حماية بيانات', 'Digital Markets Act', 'AI Act', 'قوانين مكافحة الإغراق', 'توجيهات التجارة الإلكترونية'] },
                { country: 'المملكة المتحدة', laws: ['UK GDPR', 'Companies Act', 'Bribery Act', 'قانون الإفلاس'] },
                { country: 'الصين', laws: ['قانون التجارة الإلكترونية', 'قانون الأمن السيبراني', 'قانون حماية البيانات الشخصية PIPL', 'قانون الاستثمار الأجنبي'] },
                { country: 'ماليزيا', laws: ['قانون المالية الإسلامية', 'قانون الشركات', 'حلال ماليزيا'] },
                { country: 'تركيا', laws: ['قانون التجارة', 'قانون حماية البيانات KVKK', 'قانون الاستثمار'] }
            ]
        };

        // ══════════════════════════════════════════════════════════════════
        // ٦. الضوابط الشرعية للقانون
        // ══════════════════════════════════════════════════════════════════
        this.shariaGuidelines = {
            principles: [
                'الأصل في المعاملات الحل ما لم يرد دليل التحريم',
                'لا ضرر ولا ضرار',
                'درء المفاسد مقدم على جلب المصالح',
                'العقد شريعة المتعاقدين ما لم يخالف الشرع',
                'البينة على المدعي واليمين على من أنكر',
                'الشبهة تُدرأ بها الحدود لكن لا تُدرأ بها الحقوق',
                'المشقة تجلب التيسير',
                'العادة محكّمة ما لم تخالف النص',
                'لا اجتهاد مع النص',
                'تتغير الأحكام بتغير الأزمان (في الاجتهادية لا القطعية)'
            ],
            note: 'النظام الأساسي للحكم في المملكة العربية السعودية ينص على أن الكتاب والسنة هما دستور الدولة'
        };
    }

    getDashboard() {
        const countLaws = this.saudiLaws.categories.reduce((s, c) => s + c.laws.length, 0);
        const countTreaties = Object.values(this.treaties).reduce((s, arr) => s + arr.length, 0);
        const countOrgs = this.internationalOrganizations.global.length + this.internationalOrganizations.islamic.length + this.internationalOrganizations.regional.length;

        return {
            engine: this.name, version: this.version, owner: this.owner, activatedAt: this.activatedAt,
            summary: {
                saudiLawCategories: this.saudiLaws.categories.length,
                saudiLawsTotal: countLaws,
                internationalLawBranches: this.internationalLaw.branches.length,
                internationalOrgs: countOrgs,
                treatiesTotal: countTreaties,
                foreignCountries: this.foreignLaws.countries.length,
                shariaLegalPrinciples: this.shariaGuidelines.principles.length,
                quranReferences: this.quranReferences.length
            },
            quranReferences: this.quranReferences,
            saudiLaws: this.saudiLaws,
            internationalLaw: this.internationalLaw,
            internationalOrganizations: this.internationalOrganizations,
            treaties: this.treaties,
            foreignLaws: this.foreignLaws,
            shariaGuidelines: this.shariaGuidelines
        };
    }
}

module.exports = SheikhaLegalEngine;
