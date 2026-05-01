/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ☪️ بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * SHEIKHA ECONOMICS ENGINE — منظومة التجارة والاقتصاد السعودي والعالمي
 * الاقتصاد الجزئي والكلي الشامل والتام
 *
 * المالك: سلمان أحمد بن سلمان الراجح
 *
 * "وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا" — البقرة ٢٧٥
 * "يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تَأْكُلُوا أَمْوَالَكُم بَيْنَكُم بِالْبَاطِلِ إِلَّا أَن تَكُونَ تِجَارَةً عَن تَرَاضٍ مِّنكُمْ" — النساء ٢٩
 *
 * ✅ الاقتصاد الجزئي — Microeconomics
 * ✅ الاقتصاد الكلي — Macroeconomics
 * ✅ الاقتصاد الإسلامي — Islamic Economics
 * ✅ الاقتصاد السعودي — Saudi Economy & Vision 2030
 * ✅ الاقتصاد العالمي — Global Economy
 * ✅ التجارة — Commerce & Trade
 * ✅ المالية والاستثمار — Finance & Investment
 * ✅ المحاسبة — Accounting
 * ✅ الإدارة — Management
 * ✅ دراسة الجدوى — Feasibility Study
 * ✅ الأسواق المالية — Financial Markets
 * ✅ البنوك والصناديق — Banks & Investment Funds
 * ═══════════════════════════════════════════════════════════════════════════════
 */

class SheikhaEconomicsEngine {
    constructor() {
        this.name = 'منظومة التجارة والاقتصاد — شيخة';
        this.version = '1.0.0';
        this.startedAt = new Date().toISOString();

        this.quranReferences = this._initQuranReferences();
        this.microeconomics = this._initMicroeconomics();
        this.macroeconomics = this._initMacroeconomics();
        this.islamicEconomics = this._initIslamicEconomics();
        this.saudiEconomy = this._initSaudiEconomy();
        this.globalEconomy = this._initGlobalEconomy();
        this.commerce = this._initCommerce();
        this.finance = this._initFinance();
        this.accounting = this._initAccounting();
        this.management = this._initManagement();
        this.feasibility = this._initFeasibility();
        this.markets = this._initMarkets();
        this.banking = this._initBanking();
    }

    _initQuranReferences() {
        return [
            { id: 'bay', surah: 'البقرة', ayah: 275, text: 'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا', context: 'إباحة البيع وتحريم الربا — أساس الاقتصاد الإسلامي' },
            { id: 'taradi', surah: 'النساء', ayah: 29, text: 'لَا تَأْكُلُوا أَمْوَالَكُم بَيْنَكُم بِالْبَاطِلِ إِلَّا أَن تَكُونَ تِجَارَةً عَن تَرَاضٍ', context: 'التراضي أساس المعاملات' },
            { id: 'wazn', surah: 'المطففين', ayah: '1-3', text: 'وَيْلٌ لِّلْمُطَفِّفِينَ الَّذِينَ إِذَا اكْتَالُوا عَلَى النَّاسِ يَسْتَوْفُونَ وَإِذَا كَالُوهُمْ أَو وَّزَنُوهُمْ يُخْسِرُونَ', context: 'العدل في الميزان والتجارة' },
            { id: 'tadayin', surah: 'البقرة', ayah: 282, text: 'يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا تَدَايَنتُم بِدَيْنٍ إِلَىٰ أَجَلٍ مُّسَمًّى فَاكْتُبُوهُ', context: 'توثيق الديون والعقود — أساس المحاسبة' },
            { id: 'infaq', surah: 'البقرة', ayah: 261, text: 'مَّثَلُ الَّذِينَ يُنفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ كَمَثَلِ حَبَّةٍ أَنبَتَتْ سَبْعَ سَنَابِلَ', context: 'الإنفاق والاستثمار في سبيل الله' },
            { id: 'zakat', surah: 'التوبة', ayah: 103, text: 'خُذْ مِنْ أَمْوَالِهِمْ صَدَقَةً تُطَهِّرُهُمْ وَتُزَكِّيهِم بِهَا', context: 'الزكاة — ركيزة التوزيع العادل' },
            { id: 'kanz', surah: 'التوبة', ayah: 34, text: 'وَالَّذِينَ يَكْنِزُونَ الذَّهَبَ وَالْفِضَّةَ وَلَا يُنفِقُونَهَا فِي سَبِيلِ اللَّهِ فَبَشِّرْهُم بِعَذَابٍ أَلِيمٍ', context: 'تحريم الاكتناز — تدوير المال في الاقتصاد' },
            { id: 'tijarah', surah: 'فاطر', ayah: 29, text: 'يَرْجُونَ تِجَارَةً لَّن تَبُورَ', context: 'التجارة الرابحة مع الله' },
        ];
    }

    // ══════════════════════════════════════════════════════════
    // الاقتصاد الجزئي — Microeconomics
    // ══════════════════════════════════════════════════════════
    _initMicroeconomics() {
        return {
            nameAr: 'الاقتصاد الجزئي', nameEn: 'Microeconomics',
            description: 'دراسة سلوك الأفراد والمنشآت في اتخاذ القرارات الاقتصادية وتخصيص الموارد',
            topics: [
                { nameAr: 'العرض والطلب', nameEn: 'Supply & Demand', concepts: ['منحنى الطلب', 'منحنى العرض', 'نقطة التوازن', 'فائض المستهلك/المنتج', 'مرونة الطلب السعرية'] },
                { nameAr: 'نظرية المستهلك', nameEn: 'Consumer Theory', concepts: ['المنفعة الحدية', 'منحنيات السواء', 'قيد الميزانية', 'تأثير الدخل والإحلال'] },
                { nameAr: 'نظرية المنتج', nameEn: 'Producer Theory', concepts: ['دالة الإنتاج', 'الناتج الحدي', 'وفورات الحجم', 'التكلفة الحدية', 'نقطة التعادل'] },
                { nameAr: 'هياكل السوق', nameEn: 'Market Structures', types: [
                    { name: 'منافسة تامة', nameEn: 'Perfect Competition', features: 'منتجات متجانسة، بائعون كثر' },
                    { name: 'احتكار تام', nameEn: 'Monopoly', features: 'بائع واحد، حواجز دخول' },
                    { name: 'منافسة احتكارية', nameEn: 'Monopolistic Competition', features: 'تمايز منتجات' },
                    { name: 'احتكار قلة', nameEn: 'Oligopoly', features: 'عدد قليل من البائعين' },
                ]},
                { nameAr: 'نظرية الأسعار', nameEn: 'Price Theory', concepts: ['تسعير التكلفة+', 'تسعير القيمة', 'التمييز السعري', 'السعر المرجعي'] },
                { nameAr: 'نظرية اللعب', nameEn: 'Game Theory', concepts: ['توازن ناش', 'معضلة السجين', 'ألعاب تتابعية', 'استراتيجية مسيطرة'] },
                { nameAr: 'إخفاقات السوق', nameEn: 'Market Failures', concepts: ['عدم تماثل المعلومات', 'العوامل الخارجية', 'السلع العامة', 'الاحتكار'] },
            ],
        };
    }

    // ══════════════════════════════════════════════════════════
    // الاقتصاد الكلي — Macroeconomics
    // ══════════════════════════════════════════════════════════
    _initMacroeconomics() {
        return {
            nameAr: 'الاقتصاد الكلي', nameEn: 'Macroeconomics',
            description: 'دراسة الاقتصاد ككل — الناتج المحلي، التضخم، البطالة، السياسات النقدية والمالية',
            indicators: [
                { nameAr: 'الناتج المحلي الإجمالي', nameEn: 'GDP', description: 'إجمالي قيمة السلع والخدمات المنتجة', formula: 'C + I + G + (X - M)' },
                { nameAr: 'معدل التضخم', nameEn: 'Inflation Rate', description: 'نسبة ارتفاع الأسعار', index: 'CPI — مؤشر أسعار المستهلك' },
                { nameAr: 'معدل البطالة', nameEn: 'Unemployment Rate', description: 'نسبة القادرين على العمل بدون وظيفة' },
                { nameAr: 'سعر الفائدة', nameEn: 'Interest Rate', description: 'تكلفة الاقتراض — في الاقتصاد الإسلامي يُستبدل بهامش الربح' },
                { nameAr: 'الميزان التجاري', nameEn: 'Trade Balance', description: 'الصادرات — الواردات' },
                { nameAr: 'ميزان المدفوعات', nameEn: 'Balance of Payments', description: 'كل المعاملات المالية مع الخارج' },
                { nameAr: 'الدين العام', nameEn: 'Public Debt', description: 'إجمالي ديون الحكومة' },
                { nameAr: 'عرض النقود', nameEn: 'Money Supply', types: ['M0 (القاعدة)', 'M1 (النقد المتداول)', 'M2 (شامل)', 'M3 (الأوسع)'] },
                { nameAr: 'سعر الصرف', nameEn: 'Exchange Rate', description: 'قيمة العملة مقابل العملات الأخرى' },
                { nameAr: 'مؤشر مديري المشتريات', nameEn: 'PMI', description: 'مؤشر نشاط القطاع الخاص' },
            ],
            policies: [
                { nameAr: 'السياسة النقدية', nameEn: 'Monetary Policy', tools: ['سعر الفائدة/الريبو', 'الاحتياطي الإلزامي', 'عمليات السوق المفتوحة', 'التيسير الكمي'], entity: 'البنك المركزي' },
                { nameAr: 'السياسة المالية', nameEn: 'Fiscal Policy', tools: ['الإنفاق الحكومي', 'الضرائب', 'الدعم', 'الميزانية العامة'], entity: 'وزارة المالية' },
                { nameAr: 'السياسة التجارية', nameEn: 'Trade Policy', tools: ['تعريفات جمركية', 'اتفاقيات تجارة حرة', 'حصص', 'إعانات تصدير'] },
            ],
            theories: [
                { name: 'الكينزية', nameEn: 'Keynesian', focus: 'التدخل الحكومي لتنشيط الطلب' },
                { name: 'النقدية', nameEn: 'Monetarism', focus: 'التحكم في عرض النقود' },
                { name: 'الكلاسيكية', nameEn: 'Classical', focus: 'اليد الخفية — تنظيم ذاتي' },
                { name: 'النمساوية', nameEn: 'Austrian', focus: 'حرية السوق الكاملة' },
                { name: 'الاقتصاد الإسلامي', nameEn: 'Islamic Economics', focus: 'العدل والتوزيع — لا ربا ولا غرر' },
            ],
            cycles: [
                { nameAr: 'توسع/انتعاش', nameEn: 'Expansion', description: 'نمو الناتج والتوظيف' },
                { nameAr: 'قمة', nameEn: 'Peak', description: 'أعلى نقطة قبل الركود' },
                { nameAr: 'ركود/انكماش', nameEn: 'Recession', description: 'تراجع الناتج لفصلين متتاليين' },
                { nameAr: 'قاع', nameEn: 'Trough', description: 'أدنى نقطة قبل التعافي' },
            ],
        };
    }

    // ══════════════════════════════════════════════════════════
    // الاقتصاد الإسلامي
    // ══════════════════════════════════════════════════════════
    _initIslamicEconomics() {
        return {
            nameAr: 'الاقتصاد الإسلامي', nameEn: 'Islamic Economics',
            principles: [
                { nameAr: 'الملكية المزدوجة', description: 'المال مال الله — الإنسان مستخلف فيه', icon: '🌍' },
                { nameAr: 'الحرية الاقتصادية المقيّدة', description: 'حرية التملك والتجارة ضمن الشريعة', icon: '⚖️' },
                { nameAr: 'العدالة الاجتماعية', description: 'كَيْ لَا يَكُونَ دُولَةً بَيْنَ الْأَغْنِيَاءِ مِنكُمْ — توزيع عادل', icon: '🤝' },
                { nameAr: 'تحريم الربا', description: 'يَمْحَقُ اللَّهُ الرِّبَا وَيُرْبِي الصَّدَقَاتِ', icon: '🚫' },
                { nameAr: 'تحريم الغرر', description: 'نهى عن بيع الغرر — منع الجهالة والمخاطرة المفرطة', icon: '🚫' },
                { nameAr: 'الزكاة', description: 'ركن مالي — 2.5% سنوياً على الأموال فوق النصاب', icon: '💰' },
                { nameAr: 'الوقف', description: 'حبس الأصل وتسبيل المنفعة — استثمار مستدام', icon: '🏛️' },
                { nameAr: 'تحريم الاحتكار', description: 'لا يحتكر إلا خاطئ — منع استغلال حاجة الناس', icon: '🚫' },
            ],
            financingModes: [
                { nameAr: 'مرابحة', nameEn: 'Murabaha', description: 'بيع بالتكلفة + هامش ربح معلوم' },
                { nameAr: 'مضاربة', nameEn: 'Mudarabah', description: 'رأس مال من طرف وعمل من آخر' },
                { nameAr: 'مشاركة', nameEn: 'Musharakah', description: 'شراكة في رأس المال والربح والخسارة' },
                { nameAr: 'إجارة', nameEn: 'Ijarah', description: 'تأجير أصل مع خيار التملك' },
                { nameAr: 'استصناع', nameEn: 'Istisna', description: 'عقد تصنيع حسب مواصفات' },
                { nameAr: 'سلم', nameEn: 'Salam', description: 'بيع آجل بسعر نقدي مقدم' },
                { nameAr: 'صكوك', nameEn: 'Sukuk', description: 'سندات إسلامية — حصة في أصل' },
                { nameAr: 'تورّق', nameEn: 'Tawarruq', description: 'شراء سلعة وبيعها لطرف ثالث' },
            ],
        };
    }

    // ══════════════════════════════════════════════════════════
    // الاقتصاد السعودي — Saudi Economy
    // ══════════════════════════════════════════════════════════
    _initSaudiEconomy() {
        return {
            nameAr: 'الاقتصاد السعودي', nameEn: 'Saudi Economy',
            overview: {
                gdp: '~$1.1 تريليون (2025)', ranking: 'أكبر اقتصاد عربي', currency: 'ريال سعودي (SAR)',
                exchangeRate: '3.75 SAR/USD (ثابت)', population: '~36 مليون', laborForce: '~16 مليون',
            },
            vision2030: {
                nameAr: 'رؤية المملكة 2030', nameEn: 'Saudi Vision 2030',
                pillars: [
                    { nameAr: 'مجتمع حيوي', nameEn: 'Vibrant Society', goals: ['جودة حياة', 'ثقافة', 'ترفيه', 'رياضة', 'حج وعمرة'] },
                    { nameAr: 'اقتصاد مزدهر', nameEn: 'Thriving Economy', goals: ['تنويع دخل', 'خصخصة', 'سياحة', 'صناعة', 'تعدين', 'تقنية'] },
                    { nameAr: 'وطن طموح', nameEn: 'Ambitious Nation', goals: ['حوكمة', 'كفاءة إنفاق', 'إيرادات غير نفطية', 'خدمة مدنية'] },
                ],
                megaProjects: ['نيوم (NEOM)', 'ذا لاين (THE LINE)', 'القدية', 'البحر الأحمر', 'أمالا', 'مشروع تروجينا', 'جدة الجديدة'],
                programs: ['صندوق الاستثمارات العامة (PIF)', 'برنامج جودة الحياة', 'برنامج التحول الوطني', 'برنامج تطوير الصناعة'],
            },
            sectors: [
                { nameAr: 'نفط وغاز', contribution: '~40% من GDP', entity: 'أرامكو' },
                { nameAr: 'صناعة وتعدين', contribution: '~13%', entity: 'سابك، معادن' },
                { nameAr: 'خدمات مالية', contribution: '~10%', entity: 'ساما، بنوك' },
                { nameAr: 'بناء وعقار', contribution: '~8%', entity: 'شركات تطوير' },
                { nameAr: 'تجارة', contribution: '~10%', entity: 'وزارة التجارة' },
                { nameAr: 'سياحة وترفيه', contribution: 'متنامي', entity: 'هيئة السياحة والترفيه' },
                { nameAr: 'تقنية معلومات', contribution: 'متنامي', entity: 'هيئة الاتصالات' },
            ],
            entities: [
                { name: 'وزارة المالية', role: 'الميزانية والسياسة المالية' },
                { name: 'البنك المركزي السعودي (ساما)', role: 'السياسة النقدية والإشراف المصرفي' },
                { name: 'وزارة الاقتصاد والتخطيط', role: 'التخطيط الاقتصادي' },
                { name: 'وزارة التجارة', role: 'تنظيم التجارة' },
                { name: 'هيئة السوق المالية (CMA)', role: 'تنظيم سوق الأوراق المالية' },
                { name: 'صندوق الاستثمارات العامة (PIF)', role: 'الصندوق السيادي' },
                { name: 'الهيئة العامة للاستثمار (MISA)', role: 'جذب الاستثمار الأجنبي' },
                { name: 'هيئة الزكاة والضريبة والجمارك (ZATCA)', role: 'ضرائب وجمارك' },
                { name: 'المركز الوطني للتنافسية (Tayseer)', role: 'بيئة أعمال' },
            ],
        };
    }

    // ══════════════════════════════════════════════════════════
    // الاقتصاد العالمي — Global Economy
    // ══════════════════════════════════════════════════════════
    _initGlobalEconomy() {
        return {
            nameAr: 'الاقتصاد العالمي', nameEn: 'Global Economy',
            topEconomies: [
                { rank: 1, country: 'الولايات المتحدة', gdp: '$28T', currency: 'USD' },
                { rank: 2, country: 'الصين', gdp: '$18T', currency: 'CNY' },
                { rank: 3, country: 'ألمانيا', gdp: '$4.5T', currency: 'EUR' },
                { rank: 4, country: 'اليابان', gdp: '$4.2T', currency: 'JPY' },
                { rank: 5, country: 'الهند', gdp: '$3.9T', currency: 'INR' },
                { rank: 6, country: 'المملكة المتحدة', gdp: '$3.3T', currency: 'GBP' },
                { rank: 7, country: 'فرنسا', gdp: '$3.0T', currency: 'EUR' },
                { rank: 18, country: 'السعودية', gdp: '$1.1T', currency: 'SAR', note: 'أكبر اقتصاد عربي' },
            ],
            organizations: [
                { name: 'IMF', nameAr: 'صندوق النقد الدولي', role: 'استقرار مالي عالمي', members: 190 },
                { name: 'World Bank', nameAr: 'البنك الدولي', role: 'تمويل تنمية', members: 189 },
                { name: 'WTO', nameAr: 'منظمة التجارة العالمية', role: 'تنظيم التجارة الدولية', members: 164 },
                { name: 'G20', nameAr: 'مجموعة العشرين', role: 'تنسيق سياسات اقتصادية', note: 'السعودية عضو — استضافت قمة 2020' },
                { name: 'OECD', nameAr: 'منظمة التعاون الاقتصادي', role: 'سياسات تنمية', members: 38 },
                { name: 'BIS', nameAr: 'بنك التسويات الدولية', role: 'تنسيق بين البنوك المركزية' },
                { name: 'UNCTAD', nameAr: 'الأونكتاد', role: 'تجارة وتنمية' },
            ],
            tradeBlocs: [
                { name: 'GCC', nameAr: 'مجلس التعاون الخليجي', members: 6 },
                { name: 'EU', nameAr: 'الاتحاد الأوروبي', members: 27 },
                { name: 'USMCA', nameAr: 'اتفاقية أمريكا الشمالية', members: 3 },
                { name: 'ASEAN', nameAr: 'آسيان', members: 10 },
                { name: 'BRICS', nameAr: 'بريكس', members: '10+', note: 'السعودية انضمت 2024' },
                { name: 'AfCFTA', nameAr: 'منطقة التجارة الحرة الأفريقية', members: 54 },
                { name: 'RCEP', nameAr: 'شراكة آسيا والمحيط الهادئ', members: 15 },
            ],
            currencies: [
                { code: 'USD', nameAr: 'دولار أمريكي', status: 'عملة احتياطي عالمية رئيسية' },
                { code: 'EUR', nameAr: 'يورو', status: 'ثاني أكبر عملة احتياطي' },
                { code: 'SAR', nameAr: 'ريال سعودي', status: 'مربوط بالدولار 3.75' },
                { code: 'CNY', nameAr: 'يوان صيني', status: 'صاعدة' },
                { code: 'GBP', nameAr: 'جنيه إسترليني' },
                { code: 'JPY', nameAr: 'ين ياباني' },
                { code: 'XAU', nameAr: 'ذهب', status: 'ملاذ آمن' },
            ],
        };
    }

    // ══════════════════════════════════════════════════════════
    // التجارة — Commerce
    // ══════════════════════════════════════════════════════════
    _initCommerce() {
        return {
            nameAr: 'التجارة', nameEn: 'Commerce & Trade',
            types: [
                { nameAr: 'تجارة داخلية', nameEn: 'Domestic Trade', subtypes: ['جملة', 'تجزئة', 'إلكترونية'] },
                { nameAr: 'تجارة خارجية', nameEn: 'International Trade', subtypes: ['تصدير', 'استيراد', 'عبور (ترانزيت)', 'إعادة تصدير'] },
                { nameAr: 'تجارة إلكترونية', nameEn: 'E-Commerce', models: ['B2B', 'B2C', 'C2C', 'B2G', 'D2C', 'Marketplace'] },
                { nameAr: 'تجارة حدودية', nameEn: 'Border Trade' },
                { nameAr: 'مقايضة', nameEn: 'Barter Trade' },
            ],
            saudiRegulations: [
                { name: 'نظام التجارة', entity: 'وزارة التجارة' },
                { name: 'نظام الشركات', entity: 'وزارة التجارة' },
                { name: 'نظام المنافسة', entity: 'الهيئة العامة للمنافسة' },
                { name: 'نظام التجارة الإلكترونية', entity: 'وزارة التجارة' },
                { name: 'نظام حماية المستهلك', entity: 'وزارة التجارة' },
                { name: 'نظام الوكالات التجارية', entity: 'وزارة التجارة' },
                { name: 'نظام العلامات التجارية', entity: 'SAIP' },
            ],
        };
    }

    // ══════════════════════════════════════════════════════════
    // المالية والاستثمار — Finance & Investment
    // ══════════════════════════════════════════════════════════
    _initFinance() {
        return {
            nameAr: 'المالية والاستثمار', nameEn: 'Finance & Investment',
            investmentTypes: [
                { nameAr: 'أسهم', nameEn: 'Equities/Stocks', risk: 'عالي', return: 'عالي' },
                { nameAr: 'صكوك', nameEn: 'Sukuk (Islamic Bonds)', risk: 'منخفض-متوسط', return: 'متوسط' },
                { nameAr: 'عقار', nameEn: 'Real Estate', risk: 'متوسط', return: 'متوسط-عالي' },
                { nameAr: 'صناديق استثمارية', nameEn: 'Investment Funds', risk: 'متنوع', return: 'متنوع' },
                { nameAr: 'رأس مال مخاطر', nameEn: 'Venture Capital', risk: 'عالي جداً', return: 'عالي جداً' },
                { nameAr: 'ملكية خاصة', nameEn: 'Private Equity', risk: 'عالي', return: 'عالي' },
                { nameAr: 'سلع (ذهب، نفط)', nameEn: 'Commodities', risk: 'متوسط-عالي', return: 'متنوع' },
                { nameAr: 'صناديق REITs', nameEn: 'Real Estate Investment Trusts', risk: 'متوسط', return: 'متوسط' },
            ],
            fundTypes: [
                { nameAr: 'صندوق سيادي', nameEn: 'Sovereign Wealth Fund', example: 'PIF — صندوق الاستثمارات العامة' },
                { nameAr: 'صندوق مشترك', nameEn: 'Mutual Fund', description: 'صندوق مفتوح للجمهور' },
                { nameAr: 'صندوق مؤشر', nameEn: 'Index Fund / ETF', description: 'يتتبع مؤشراً' },
                { nameAr: 'صندوق تحوّط', nameEn: 'Hedge Fund', description: 'استثمار متقدم للمؤهلين' },
                { nameAr: 'صندوق وقفي', nameEn: 'Endowment Fund', description: 'استثمار أوقاف' },
                { nameAr: 'صندوق تقاعد', nameEn: 'Pension Fund', description: 'مدخرات تقاعدية' },
            ],
            investmentBanks: [
                { nameAr: 'الأهلي كابيتال', type: 'سعودي', services: ['وساطة', 'إدارة أصول', 'استشارات'] },
                { nameAr: 'الرياض المالية', type: 'سعودي' },
                { nameAr: 'الراجحي المالية', type: 'سعودي' },
                { nameAr: 'جدوى للاستثمار', type: 'سعودي' },
                { nameAr: 'السعودي الفرنسي كابيتال', type: 'سعودي' },
                { nameAr: 'Goldman Sachs', type: 'دولي' },
                { nameAr: 'JP Morgan', type: 'دولي' },
                { nameAr: 'Morgan Stanley', type: 'دولي' },
                { nameAr: 'HSBC', type: 'دولي' },
            ],
            analysis: [
                { nameAr: 'تحليل أساسي', nameEn: 'Fundamental Analysis', focus: 'القوائم المالية والقيمة الجوهرية' },
                { nameAr: 'تحليل فني', nameEn: 'Technical Analysis', focus: 'أنماط الأسعار والرسوم البيانية' },
                { nameAr: 'تحليل كمّي', nameEn: 'Quantitative Analysis', focus: 'نماذج رياضية وإحصائية' },
            ],
        };
    }

    // ══════════════════════════════════════════════════════════
    // المحاسبة — Accounting
    // ══════════════════════════════════════════════════════════
    _initAccounting() {
        return {
            nameAr: 'المحاسبة', nameEn: 'Accounting',
            quranRef: 'إِذَا تَدَايَنتُم بِدَيْنٍ إِلَىٰ أَجَلٍ مُّسَمًّى فَاكْتُبُوهُ — البقرة ٢٨٢',
            branches: [
                { nameAr: 'محاسبة مالية', nameEn: 'Financial Accounting', output: 'قوائم مالية للخارج' },
                { nameAr: 'محاسبة إدارية', nameEn: 'Managerial Accounting', output: 'تقارير داخلية لاتخاذ القرار' },
                { nameAr: 'محاسبة تكاليف', nameEn: 'Cost Accounting', output: 'تكلفة المنتج/الخدمة' },
                { nameAr: 'محاسبة ضريبية', nameEn: 'Tax Accounting', output: 'إقرارات ضريبية' },
                { nameAr: 'محاسبة زكاة', nameEn: 'Zakat Accounting', output: 'حساب الزكاة الشرعية' },
                { nameAr: 'مراجعة وتدقيق', nameEn: 'Auditing', output: 'تقرير مراجع مستقل' },
                { nameAr: 'محاسبة حكومية', nameEn: 'Government Accounting', output: 'ميزانيات حكومية' },
                { nameAr: 'محاسبة دولية', nameEn: 'International (IFRS)', output: 'معايير دولية موحدة' },
            ],
            financialStatements: [
                { nameAr: 'قائمة المركز المالي (الميزانية)', nameEn: 'Balance Sheet', equation: 'الأصول = الالتزامات + حقوق الملكية' },
                { nameAr: 'قائمة الدخل', nameEn: 'Income Statement', shows: 'الإيرادات — المصروفات = صافي الربح' },
                { nameAr: 'قائمة التدفقات النقدية', nameEn: 'Cash Flow Statement', sections: ['تشغيلية', 'استثمارية', 'تمويلية'] },
                { nameAr: 'قائمة التغيرات في حقوق الملكية', nameEn: 'Statement of Changes in Equity' },
                { nameAr: 'الإيضاحات المتممة', nameEn: 'Notes to Financial Statements' },
            ],
            standards: [
                { name: 'IFRS', nameAr: 'المعايير الدولية للتقارير المالية', scope: 'عالمي' },
                { name: 'SOCPA', nameAr: 'الهيئة السعودية للمراجعين والمحاسبين', scope: 'سعودي' },
                { name: 'AAOIFI', nameAr: 'هيئة المحاسبة للمؤسسات المالية الإسلامية', scope: 'إسلامي' },
            ],
            ratios: [
                { nameAr: 'نسب سيولة', nameEn: 'Liquidity', examples: ['النسبة الجارية', 'النسبة السريعة'] },
                { nameAr: 'نسب ربحية', nameEn: 'Profitability', examples: ['هامش الربح', 'ROA', 'ROE', 'EPS'] },
                { nameAr: 'نسب رفع مالي', nameEn: 'Leverage', examples: ['نسبة الدين', 'تغطية الفوائد'] },
                { nameAr: 'نسب نشاط', nameEn: 'Activity', examples: ['دوران المخزون', 'دوران الذمم المدينة'] },
                { nameAr: 'نسب تقييم', nameEn: 'Valuation', examples: ['P/E', 'P/B', 'EV/EBITDA'] },
            ],
        };
    }

    // ══════════════════════════════════════════════════════════
    // الإدارة — Management
    // ══════════════════════════════════════════════════════════
    _initManagement() {
        return {
            nameAr: 'الإدارة', nameEn: 'Management',
            functions: [
                { nameAr: 'تخطيط', nameEn: 'Planning', activities: ['رؤية', 'رسالة', 'أهداف استراتيجية', 'خطط تشغيلية'] },
                { nameAr: 'تنظيم', nameEn: 'Organizing', activities: ['هيكل تنظيمي', 'توزيع مهام', 'تفويض صلاحيات'] },
                { nameAr: 'توجيه', nameEn: 'Leading', activities: ['قيادة', 'تحفيز', 'تواصل', 'اتخاذ قرار'] },
                { nameAr: 'رقابة', nameEn: 'Controlling', activities: ['قياس أداء', 'تصحيح انحرافات', 'تقييم'] },
            ],
            specializations: [
                { nameAr: 'إدارة استراتيجية', nameEn: 'Strategic Management', tools: ['SWOT', 'PESTEL', 'Porter 5 Forces', 'BCG Matrix', 'Balanced Scorecard'] },
                { nameAr: 'إدارة مشاريع', nameEn: 'Project Management', frameworks: ['PMP/PMBOK', 'PRINCE2', 'Agile/Scrum', 'Kanban', 'Waterfall'] },
                { nameAr: 'إدارة عمليات', nameEn: 'Operations Management', tools: ['Six Sigma', 'Lean', 'TQM', 'Kaizen', 'Theory of Constraints'] },
                { nameAr: 'إدارة موارد بشرية', nameEn: 'HR Management', areas: ['توظيف', 'تدريب', 'تعويضات', 'أداء', 'ثقافة'] },
                { nameAr: 'إدارة تسويق', nameEn: 'Marketing Management', tools: ['4Ps', 'STP', 'Customer Journey', 'Branding'] },
                { nameAr: 'إدارة مالية', nameEn: 'Financial Management', areas: ['ميزانية', 'تمويل', 'استثمار', 'مخاطر'] },
                { nameAr: 'إدارة الجودة', nameEn: 'Quality Management', standards: ['ISO 9001', 'ISO 14001', 'ISO 45001', 'ISO 27001'] },
                { nameAr: 'إدارة المخاطر', nameEn: 'Risk Management', framework: 'ISO 31000' },
                { nameAr: 'حوكمة', nameEn: 'Corporate Governance', principles: ['شفافية', 'مساءلة', 'عدالة', 'مسؤولية'] },
            ],
            islamicManagement: {
                nameAr: 'الإدارة في الإسلام', principles: [
                    'الشورى — وَشَاوِرْهُمْ فِي الْأَمْرِ',
                    'الإتقان — إن الله يحب إذا عمل أحدكم عملاً أن يتقنه',
                    'العدل — إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ',
                    'الأمانة — إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ',
                    'المسؤولية — كلكم راعٍ وكلكم مسؤول عن رعيته',
                    'الرقابة الذاتية — إِنَّ اللَّهَ كَانَ عَلَيْكُمْ رَقِيبًا',
                ],
            },
        };
    }

    // ══════════════════════════════════════════════════════════
    // دراسة الجدوى — Feasibility Study
    // ══════════════════════════════════════════════════════════
    _initFeasibility() {
        return {
            nameAr: 'دراسة الجدوى الاقتصادية', nameEn: 'Feasibility Study',
            stages: [
                { order: 1, nameAr: 'دراسة السوق', nameEn: 'Market Study', elements: ['حجم السوق', 'الطلب المتوقع', 'المنافسين', 'الحصة السوقية', 'اتجاهات'] },
                { order: 2, nameAr: 'دراسة فنية', nameEn: 'Technical Study', elements: ['الموقع', 'التقنية', 'الطاقة الإنتاجية', 'المعدات', 'المواد الخام'] },
                { order: 3, nameAr: 'دراسة مالية', nameEn: 'Financial Study', elements: ['التكاليف الاستثمارية', 'التكاليف التشغيلية', 'الإيرادات المتوقعة', 'التمويل'] },
                { order: 4, nameAr: 'دراسة قانونية', nameEn: 'Legal Study', elements: ['التراخيص', 'الأنظمة', 'العقود', 'الملكية الفكرية'] },
                { order: 5, nameAr: 'دراسة بيئية', nameEn: 'Environmental Study', elements: ['أثر بيئي', 'اشتراطات', 'استدامة'] },
                { order: 6, nameAr: 'دراسة اجتماعية', nameEn: 'Social Study', elements: ['وظائف', 'أثر مجتمعي', 'مسؤولية اجتماعية'] },
                { order: 7, nameAr: 'تحليل المخاطر', nameEn: 'Risk Analysis', elements: ['تحديد مخاطر', 'احتمالية', 'أثر', 'خطط تخفيف'] },
                { order: 8, nameAr: 'تقييم الجدوى', nameEn: 'Evaluation', elements: ['NPV', 'IRR', 'فترة الاسترداد', 'نقطة التعادل', 'تحليل حساسية'] },
            ],
            financialMetrics: [
                { name: 'NPV', nameAr: 'صافي القيمة الحالية', rule: 'إذا > 0 → المشروع مجدي' },
                { name: 'IRR', nameAr: 'معدل العائد الداخلي', rule: 'إذا > تكلفة رأس المال → مجدي' },
                { name: 'Payback', nameAr: 'فترة الاسترداد', rule: 'كلما كانت أقصر كان أفضل' },
                { name: 'ROI', nameAr: 'العائد على الاستثمار', formula: '(الربح / الاستثمار) × 100%' },
                { name: 'BEP', nameAr: 'نقطة التعادل', formula: 'التكاليف الثابتة / (سعر الوحدة — التكلفة المتغيرة)' },
            ],
        };
    }

    // ══════════════════════════════════════════════════════════
    // الأسواق المالية — Financial Markets
    // ══════════════════════════════════════════════════════════
    _initMarkets() {
        return {
            nameAr: 'الأسواق المالية', nameEn: 'Financial Markets',
            saudiMarket: {
                name: 'تداول (Tadawul)', fullName: 'السوق المالية السعودية',
                indices: ['تاسي (TASI)', 'نمو — السوق الموازية', 'MT30'],
                sectors: ['بنوك', 'بتروكيماويات', 'اتصالات', 'تأمين', 'عقار', 'تجزئة', 'طاقة', 'مواد أساسية', 'صناديق REITs'],
                regulator: 'هيئة السوق المالية (CMA)',
                depository: 'مركز إيداع الأوراق المالية (إيداع)',
                clearing: 'مقاصة',
            },
            globalExchanges: [
                { name: 'NYSE', nameAr: 'بورصة نيويورك', location: '🇺🇸', marketCap: 'الأكبر عالمياً' },
                { name: 'NASDAQ', nameAr: 'ناسداك', location: '🇺🇸', focus: 'تقنية' },
                { name: 'LSE', nameAr: 'بورصة لندن', location: '🇬🇧' },
                { name: 'TSE', nameAr: 'بورصة طوكيو', location: '🇯🇵' },
                { name: 'SSE', nameAr: 'بورصة شنغهاي', location: '🇨🇳' },
                { name: 'HKEX', nameAr: 'بورصة هونغ كونغ', location: '🇭🇰' },
                { name: 'Tadawul', nameAr: 'تداول', location: '🇸🇦', note: 'أكبر سوق عربي' },
                { name: 'DFM', nameAr: 'سوق دبي المالي', location: '🇦🇪' },
            ],
            commodityExchanges: [
                { name: 'COMEX', product: 'ذهب، فضة' },
                { name: 'NYMEX', product: 'نفط، غاز' },
                { name: 'LME', product: 'معادن أساسية' },
                { name: 'CBOT', product: 'حبوب، زراعة' },
                { name: 'DME', product: 'نفط (دبي)' },
            ],
        };
    }

    // ══════════════════════════════════════════════════════════
    // البنوك — Banking
    // ══════════════════════════════════════════════════════════
    _initBanking() {
        return {
            nameAr: 'البنوك والمصارف', nameEn: 'Banking',
            saudiBanks: [
                { name: 'البنك الأهلي السعودي (SNB)', type: 'تجاري — أكبر بنك عربي', islamicWindow: true },
                { name: 'مصرف الراجحي', type: 'إسلامي — أكبر بنك إسلامي', islamicWindow: true },
                { name: 'بنك الرياض', type: 'تجاري', islamicWindow: true },
                { name: 'البنك السعودي الفرنسي', type: 'تجاري' },
                { name: 'البنك العربي الوطني', type: 'تجاري' },
                { name: 'بنك ساب', type: 'تجاري' },
                { name: 'بنك البلاد', type: 'إسلامي' },
                { name: 'بنك الإنماء', type: 'إسلامي' },
                { name: 'البنك السعودي للاستثمار', type: 'تجاري' },
                { name: 'مصرف الجزيرة', type: 'إسلامي' },
                { name: 'بنك الخليج الدولي', type: 'جملة' },
            ],
            centralBank: {
                name: 'البنك المركزي السعودي (ساما — SAMA)',
                role: 'السياسة النقدية، الإشراف المصرفي، استقرار مالي',
                tools: ['معدل الريبو/الريبو العكسي', 'الاحتياطي الإلزامي', 'إدارة الاحتياطيات الأجنبية'],
            },
            bankingTypes: [
                { nameAr: 'بنوك تجارية', nameEn: 'Commercial Banks' },
                { nameAr: 'بنوك إسلامية', nameEn: 'Islamic Banks' },
                { nameAr: 'بنوك استثمارية', nameEn: 'Investment Banks' },
                { nameAr: 'بنوك تنمية', nameEn: 'Development Banks', examples: ['صندوق التنمية الصناعي', 'البنك السعودي للتصدير والاستيراد'] },
                { nameAr: 'بنوك مركزية', nameEn: 'Central Banks' },
                { nameAr: 'بنوك رقمية', nameEn: 'Digital Banks / Neobanks', examples: ['STC Pay', 'D360', 'Lendo'] },
                { nameAr: 'تقنية مالية (FinTech)', nameEn: 'FinTech', examples: ['مدفوعات رقمية', 'تمويل جماعي', 'محافظ إلكترونية'] },
            ],
        };
    }

    getDashboard() {
        return {
            name: this.name, version: this.version, startedAt: this.startedAt,
            summary: {
                microTopics: this.microeconomics.topics.length,
                macroIndicators: this.macroeconomics.indicators.length,
                macroTheories: this.macroeconomics.theories.length,
                islamicPrinciples: this.islamicEconomics.principles.length,
                islamicFinancingModes: this.islamicEconomics.financingModes.length,
                saudiSectors: this.saudiEconomy.sectors.length,
                saudiEntities: this.saudiEconomy.entities.length,
                vision2030Projects: this.saudiEconomy.vision2030.megaProjects.length,
                globalOrganizations: this.globalEconomy.organizations.length,
                tradeBlocs: this.globalEconomy.tradeBlocs.length,
                commerceTypes: this.commerce.types.length,
                investmentTypes: this.finance.investmentTypes.length,
                fundTypes: this.finance.fundTypes.length,
                accountingBranches: this.accounting.branches.length,
                managementFunctions: this.management.functions.length,
                managementSpecializations: this.management.specializations.length,
                feasibilityStages: this.feasibility.stages.length,
                saudiBanks: this.banking.saudiBanks.length,
                globalExchanges: this.markets.globalExchanges.length,
                quranVerses: this.quranReferences.length,
            },
            quranReferences: this.quranReferences,
            microeconomics: this.microeconomics,
            macroeconomics: this.macroeconomics,
            islamicEconomics: this.islamicEconomics,
            saudiEconomy: this.saudiEconomy,
            globalEconomy: this.globalEconomy,
            commerce: this.commerce,
            finance: this.finance,
            accounting: this.accounting,
            management: this.management,
            feasibility: this.feasibility,
            markets: this.markets,
            banking: this.banking,
        };
    }
}

module.exports = SheikhaEconomicsEngine;
