/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ☪️ بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * صندوق شيخة للاستثمارات العامة
 * SHEIKHA PUBLIC INVESTMENT FUND (SPIF)
 *
 * المالك: سلمان أحمد بن سلمان الراجح — مستشار دولي
 *
 * "مَّثَلُ الَّذِينَ يُنفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ كَمَثَلِ حَبَّةٍ
 *  أَنبَتَتْ سَبْعَ سَنَابِلَ فِي كُلِّ سُنبُلَةٍ مِّائَةُ حَبَّةٍ" — البقرة:٢٦١
 *
 * "كَيْ لَا يَكُونَ دُولَةً بَيْنَ الْأَغْنِيَاءِ مِنكُمْ" — الحشر:٧
 *
 * الهدف: تعزيز دور الصندوق كذراع استثماري ومحرك للنمو الاقتصادي
 *
 * ✅ صندوق شيخة للاستثمارات العامة — SPIF
 * ✅ ذراع استثماري ومحرك للنمو الاقتصادي
 * ✅ محافظ استثمارية متنوعة — محلية وإقليمية وعالمية
 * ✅ امتثال شرعي كامل — AAOIFI
 * ✅ مشاريع عملاقة وشراكات استراتيجية
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

class SheikhaPublicInvestmentFund {
    constructor() {
        this.nameAr    = 'صندوق شيخة للاستثمارات العامة';
        this.nameEn    = 'Sheikha Public Investment Fund';
        this.acronym   = 'SPIF';
        this.version   = '1.0.0';
        this.startedAt = new Date().toISOString();

        this.identity       = this._initIdentity();
        this.governance     = this._initGovernance();
        this.portfolios     = this._initPortfolios();
        this.megaProjects   = this._initMegaProjects();
        this.kpis           = this._initKPIs();
        this.partnerships   = this._initPartnerships();
        this.shariaBoard    = this._initShariaBoard();
        this.sheikhaRole    = this._initSheikhaRole();
    }

    // ══════════════════════════════════════════════════════════
    // هوية الصندوق
    // ══════════════════════════════════════════════════════════
    _initIdentity() {
        return {
            nameAr:   'صندوق شيخة للاستثمارات العامة',
            nameEn:   'Sheikha Public Investment Fund',
            acronym:  'SPIF',
            taglineAr: 'ذراع استثماري ومحرك للنمو الاقتصادي',
            taglineEn: 'The Investment Arm & Economic Growth Engine',
            vision: 'بناء صندوق سيادي رقمي إسلامي يحقق نمواً اقتصادياً مستداماً ويُنوّع مصادر الثروة',
            mission: 'توظيف رأس المال في فرص استثمارية مجدية حلالاً لتحقيق عوائد مجزية وتنمية الاقتصاد الوطني',
            established: '٢٠٢٦',
            regulator: 'هيئة السوق المالية (CMA) + البنك المركزي السعودي (SAMA)',
            totalAssetsTarget: { value: 2000, unit: 'مليار ريال', horizon: '٢٠٣٠' },
            quranic_refs: [
                {
                    ref: 'البقرة:٢٦١',
                    text: 'مَّثَلُ الَّذِينَ يُنفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ كَمَثَلِ حَبَّةٍ أَنبَتَتْ سَبْعَ سَنَابِلَ',
                    context: 'مضاعفة الاستثمار الحلال',
                },
                {
                    ref: 'الحشر:٧',
                    text: 'كَيْ لَا يَكُونَ دُولَةً بَيْنَ الْأَغْنِيَاءِ مِنكُمْ',
                    context: 'العدالة في توزيع ثمار الاستثمار',
                },
                {
                    ref: 'الحشر:١٨',
                    text: 'وَلْتَنظُرْ نَفْسٌ مَّا قَدَّمَتْ لِغَدٍ',
                    context: 'التخطيط الاستثماري للمستقبل',
                },
            ],
            pillars: [
                { id: 'P1', nameAr: 'التنويع الاقتصادي',    nameEn: 'Economic Diversification' },
                { id: 'P2', nameAr: 'التوظيف وخلق الوظائف', nameEn: 'Employment Creation' },
                { id: 'P3', nameAr: 'الاستدامة والمسؤولية', nameEn: 'Sustainability & ESG' },
                { id: 'P4', nameAr: 'الابتكار والتقنية',    nameEn: 'Innovation & Technology' },
            ],
        };
    }

    // ══════════════════════════════════════════════════════════
    // الحوكمة والهيكل التنظيمي
    // ══════════════════════════════════════════════════════════
    _initGovernance() {
        return {
            structure: [
                { level: 1, nameAr: 'مجلس الأمناء',            nameEn: 'Board of Trustees',       role: 'الإشراف العلى والتوجيه الاستراتيجي' },
                { level: 2, nameAr: 'الهيئة الشرعية',          nameEn: 'Sharia Supervisory Board', role: 'الرقابة الشرعية وإصدار الفتاوى' },
                { level: 3, nameAr: 'مجلس الاستثمار',          nameEn: 'Investment Committee',    role: 'القرارات الاستثمارية الكبرى' },
                { level: 4, nameAr: 'الإدارة التنفيذية',        nameEn: 'Executive Management',    role: 'التشغيل اليومي وتنفيذ الاستراتيجية' },
                { level: 5, nameAr: 'وحدة إدارة المخاطر',       nameEn: 'Risk Management Unit',    role: 'تقييم المخاطر والامتثال' },
                { level: 6, nameAr: 'وحدة التدقيق الداخلي',    nameEn: 'Internal Audit',          role: 'الرقابة الداخلية والشفافية' },
            ],
            principles: [
                'الشفافية والإفصاح الكامل',
                'الاستقلالية في القرار الاستثماري',
                'الامتثال الشرعي التام',
                'إدارة المخاطر بأسلوب علمي',
                'تعظيم العوائد ضمن الضوابط الشرعية',
            ],
            reporting: {
                frequency: 'ربع سنوي',
                channels: ['تقرير سنوي منشور', 'نشرة مستثمرين فصلية', 'لوحة بيانات رقمية مباشرة'],
            },
        };
    }

    // ══════════════════════════════════════════════════════════
    // المحافظ الاستثمارية
    // ══════════════════════════════════════════════════════════
    _initPortfolios() {
        return [
            {
                id:      'PORT-LOCAL',
                nameAr:  'محفظة الاستثمار المحلي',
                nameEn:  'Domestic Investment Portfolio',
                icon:    '🏗️',
                allocation: 40,
                unit:    '%',
                sectors: ['البنية التحتية', 'الصناعة التحويلية', 'التقنية', 'الصحة', 'التعليم'],
                strategy: 'استثمار مباشر في القطاعات الاستراتيجية لتنويع الاقتصاد الوطني',
                target: { value: 800, unit: 'مليار ريال' },
                shariaNote: 'تجنب جميع القطاعات المحرمة — فلترة شرعية كاملة',
            },
            {
                id:      'PORT-REGIONAL',
                nameAr:  'محفظة الاستثمار الإقليمي',
                nameEn:  'Regional Investment Portfolio',
                icon:    '🌍',
                allocation: 25,
                unit:    '%',
                regions: ['دول الخليج', 'المنطقة العربية', 'تركيا', 'ماليزيا', 'إندونيسيا'],
                strategy: 'تنويع جغرافي إقليمي في الأسواق الإسلامية الناشئة',
                target: { value: 500, unit: 'مليار ريال' },
                shariaNote: 'الأولوية للأسواق ذات الأغلبية الإسلامية',
            },
            {
                id:      'PORT-GLOBAL',
                nameAr:  'محفظة الاستثمار العالمي',
                nameEn:  'Global Investment Portfolio',
                icon:    '🌐',
                allocation: 20,
                unit:    '%',
                markets: ['أمريكا الشمالية', 'أوروبا', 'آسيا والمحيط الهادئ', 'الأسواق الناشئة'],
                strategy: 'استثمار في أصول عالمية لتحقيق التنويع وحماية رأس المال',
                target: { value: 400, unit: 'مليار ريال' },
                instruments: ['أسهم حلال', 'صكوك دولية', 'عقارات', 'بنية تحتية'],
            },
            {
                id:      'PORT-TECH',
                nameAr:  'محفظة الابتكار والتقنية',
                nameEn:  'Innovation & Technology Portfolio',
                icon:    '🚀',
                allocation: 10,
                unit:    '%',
                focus: ['ذكاء اصطناعي حلال', 'FinTech إسلامي', 'تقنية حيوية', 'طاقة متجددة', 'تعليم تقني'],
                strategy: 'استثمار مرحلة مبكرة في شركات تقنية ناشئة تُحدث تأثيراً إيجابياً',
                target: { value: 200, unit: 'مليار ريال' },
                stages: ['بذرة', 'سلسلة A', 'سلسلة B', 'ما قبل الطرح العام'],
            },
            {
                id:      'PORT-WAQF',
                nameAr:  'محفظة الوقف والمسؤولية الاجتماعية',
                nameEn:  'Waqf & Social Responsibility Portfolio',
                icon:    '🕌',
                allocation: 5,
                unit:    '%',
                causes: ['التعليم الوقفي', 'الصحة الوقفية', 'الإسكان الاجتماعي', 'دعم الأسر المنتجة', 'اليتامى والمستضعفين'],
                strategy: 'حبس الأصل وتسبيل المنفعة لمشاريع الخير المستدامة',
                target: { value: 100, unit: 'مليار ريال' },
                quranic_ref: { ref: 'آل عمران:٩٢', text: 'لَن تَنَالُوا الْبِرَّ حَتَّىٰ تُنفِقُوا مِمَّا تُحِبُّونَ' },
            },
        ];
    }

    // ══════════════════════════════════════════════════════════
    // المشاريع الكبرى
    // ══════════════════════════════════════════════════════════
    _initMegaProjects() {
        return [
            {
                id:     'MP-DIGITAL-CITY',
                nameAr: 'مدينة شيخة الرقمية',
                nameEn: 'Sheikha Digital City',
                icon:   '🏙️',
                sector: 'تقنية ومدن ذكية',
                investment: { value: 50, unit: 'مليار ريال' },
                jobs: 150000,
                status: 'تطوير',
                description: 'مدينة رقمية متكاملة تجمع بين الابتكار والقيم الإسلامية',
            },
            {
                id:     'MP-HALAL-HUB',
                nameAr: 'مركز شيخة للاقتصاد الحلال',
                nameEn: 'Sheikha Halal Economy Hub',
                icon:   '🌿',
                sector: 'اقتصاد إسلامي',
                investment: { value: 30, unit: 'مليار ريال' },
                jobs: 80000,
                status: 'تطوير',
                description: 'أكبر مركز متكامل للاقتصاد الحلال — من الإنتاج حتى التصدير',
            },
            {
                id:     'MP-INDUSTRIAL-ZONE',
                nameAr: 'منطقة شيخة الصناعية المتكاملة',
                nameEn: 'Sheikha Integrated Industrial Zone',
                icon:   '🏭',
                sector: 'صناعة',
                investment: { value: 80, unit: 'مليار ريال' },
                jobs: 250000,
                status: 'مخطط',
                description: 'منطقة صناعية مستدامة تركز على التصنيع المحلي وإحلال الواردات',
            },
            {
                id:     'MP-GREEN-ENERGY',
                nameAr: 'مشروع شيخة للطاقة الخضراء',
                nameEn: 'Sheikha Green Energy Project',
                icon:   '☀️',
                sector: 'طاقة متجددة',
                investment: { value: 40, unit: 'مليار ريال' },
                jobs: 50000,
                status: 'مخطط',
                description: 'مشاريع طاقة شمسية وهيدروجين أخضر لتحقيق الاستدامة',
            },
            {
                id:     'MP-LOGISTICS',
                nameAr: 'مركز شيخة اللوجستي الذكي',
                nameEn: 'Sheikha Smart Logistics Center',
                icon:   '🚢',
                sector: 'لوجستيات وسلسلة توريد',
                investment: { value: 25, unit: 'مليار ريال' },
                jobs: 60000,
                status: 'مخطط',
                description: 'مركز لوجستي ذكي يربط الأسواق الإقليمية والعالمية',
            },
        ];
    }

    // ══════════════════════════════════════════════════════════
    // مؤشرات الأداء الرئيسية
    // ══════════════════════════════════════════════════════════
    _initKPIs() {
        return [
            {
                id:     'SPIF-K1',
                nameAr: 'إجمالي الأصول المدارة',
                nameEn: 'Total Assets Under Management (AUM)',
                baseline: 0,
                target:   2000,
                unit:     'مليار ريال',
                horizon:  '٢٠٣٠',
                icon:     '💰',
            },
            {
                id:     'SPIF-K2',
                nameAr: 'الوظائف المُنشأة مباشرة وغير مباشرة',
                nameEn: 'Jobs Created (Direct & Indirect)',
                baseline: 0,
                target:   1000000,
                unit:     'وظيفة',
                horizon:  '٢٠٣٠',
                icon:     '👷',
            },
            {
                id:     'SPIF-K3',
                nameAr: 'إسهام الصندوق في الناتج المحلي الإجمالي',
                nameEn: 'Contribution to GDP',
                baseline: 0,
                target:   5,
                unit:     '%',
                horizon:  '٢٠٣٠',
                icon:     '📊',
            },
            {
                id:     'SPIF-K4',
                nameAr: 'عدد المشاريع الكبرى المنفذة',
                nameEn: 'Mega Projects Executed',
                baseline: 0,
                target:   25,
                unit:     'مشروع',
                horizon:  '٢٠٣٠',
                icon:     '🏗️',
            },
            {
                id:     'SPIF-K5',
                nameAr: 'عدد الشركات الناشئة الممولة',
                nameEn: 'Startups Funded',
                baseline: 0,
                target:   500,
                unit:     'شركة',
                horizon:  '٢٠٣٠',
                icon:     '🚀',
            },
            {
                id:     'SPIF-K6',
                nameAr: 'معدل العائد السنوي على الاستثمار',
                nameEn: 'Annual Return on Investment (ROI)',
                baseline: 0,
                target:   8,
                unit:     '%',
                horizon:  'سنوياً',
                icon:     '📈',
            },
            {
                id:     'SPIF-K7',
                nameAr: 'نسبة الاستثمارات المتوافقة شرعياً',
                nameEn: 'Sharia-Compliant Investment Ratio',
                baseline: 0,
                target:   100,
                unit:     '%',
                horizon:  'دائم',
                icon:     '☪️',
            },
            {
                id:     'SPIF-K8',
                nameAr: 'أصول الوقف الاستثماري',
                nameEn: 'Waqf Assets',
                baseline: 0,
                target:   100,
                unit:     'مليار ريال',
                horizon:  '٢٠٣٠',
                icon:     '🕌',
            },
        ];
    }

    // ══════════════════════════════════════════════════════════
    // الشراكات الاستراتيجية
    // ══════════════════════════════════════════════════════════
    _initPartnerships() {
        return {
            local: [
                { nameAr: 'صندوق الاستثمارات العامة (PIF)',   role: 'الذراع الاستثماري الوطني',     type: 'استراتيجي' },
                { nameAr: 'أرامكو السعودية',                   role: 'الطاقة والبتروكيماويات',        type: 'مشروع مشترك' },
                { nameAr: 'سابك (SABIC)',                      role: 'الصناعة التحويلية',            type: 'مشروع مشترك' },
                { nameAr: 'هيئة السوق المالية (CMA)',          role: 'الجهة التنظيمية',               type: 'تنظيمي' },
                { nameAr: 'البنك المركزي السعودي (SAMA)',      role: 'الرقابة المصرفية',              type: 'تنظيمي' },
                { nameAr: 'منصة شيخة للسوق',                  role: 'منصة التجارة الرقمية المحلية', type: 'تشغيلي' },
            ],
            regional: [
                { nameAr: 'صندوق الاستثمار القطري (QIA)',    role: 'استثمار خليجي مشترك',   type: 'صندوق سيادي' },
                { nameAr: 'جهاز أبوظبي للاستثمار (ADIA)',    role: 'استثمار عالمي مشترك',   type: 'صندوق سيادي' },
                { nameAr: 'صندوق الكويت السيادي (KIA)',      role: 'استثمار خليجي',          type: 'صندوق سيادي' },
                { nameAr: 'مصرف التنمية الإسلامي (IsDB)',    role: 'تمويل تنموي إسلامي',     type: 'تنموي' },
                { nameAr: 'بنك التنمية الإسلامي',            role: 'تمويل مشاريع كبرى',      type: 'تنموي' },
            ],
            global: [
                { nameAr: 'صندوق النقد الدولي (IMF)',        role: 'استشارات اقتصادية',      type: 'دولي' },
                { nameAr: 'البنك الدولي',                    role: 'تمويل تنموي',            type: 'دولي' },
                { nameAr: 'بلاك روك (BlackRock)',            role: 'إدارة أصول عالمية',      type: 'مالي' },
                { nameAr: 'فانغارد (Vanguard)',              role: 'استثمار مؤشرات حلال',    type: 'مالي' },
            ],
        };
    }

    // ══════════════════════════════════════════════════════════
    // الهيئة الشرعية للصندوق
    // ══════════════════════════════════════════════════════════
    _initShariaBoard() {
        return {
            nameAr: 'الهيئة الشرعية لصندوق شيخة للاستثمارات العامة',
            nameEn: 'Sharia Board — Sheikha Public Investment Fund',
            mandate: 'الرقابة الشرعية الكاملة على جميع محافظ ومعاملات الصندوق',
            standards: ['AAOIFI', 'IFSB', 'مجمع الفقه الإسلامي الدولي', 'هيئة كبار العلماء'],
            screening: {
                nameAr: 'معايير الفلترة الشرعية',
                excluded: [
                    'البنوك والمؤسسات الربوية',
                    'صناعة الكحول والمسكرات',
                    'التبغ ومنتجاته',
                    'الأسلحة وصناعة الحرب',
                    'القمار والميسر',
                    'الترفيه المحرم',
                    'لحم الخنزير ومشتقاته',
                    'الاستنساخ البشري والأبحاث المحرمة',
                ],
                financialRatios: {
                    maxDebt: '33% من إجمالي الأصول',
                    maxHaram: '5% من إجمالي الإيرادات',
                    method: 'معايير AAOIFI + MSCI Islamic',
                },
            },
            purification: {
                nameAr: 'تطهير الدخل',
                method: 'أي دخل من مصدر مشتبه يُوجَّه لحسابات الخير والوقف',
                beneficiaries: ['الفقراء والمساكين', 'اليتامى', 'المساجد', 'التعليم الديني'],
            },
        };
    }

    // ══════════════════════════════════════════════════════════
    // دور شيخة في الصندوق
    // ══════════════════════════════════════════════════════════
    _initSheikhaRole() {
        return {
            nameAr: 'دور منصة شيخة في صندوق الاستثمارات العامة',
            contributions: [
                {
                    area:  'منصة الاستثمار الرقمية',
                    desc:  'بوابة رقمية تتيح للمستثمرين الاكتتاب والمتابعة وإدارة محافظهم',
                    tech:  ['API مفتوح', 'لوحة بيانات مباشرة', 'تطبيق جوال'],
                },
                {
                    area:  'محرك تحليل الفرص',
                    desc:  'ذكاء اصطناعي يحلل الفرص الاستثمارية ويرتبها حسب العائد والمخاطر والامتثال الشرعي',
                    tech:  ['AI/ML', 'تحليل البيانات الضخمة', 'نماذج تقييم'],
                },
                {
                    area:  'ربط الموردين والمشترين',
                    desc:  'منظومة تربط فرص الاستثمار بالمستثمرين والشركاء عبر سوق شيخة',
                    tech:  ['Marketplace API', 'مطابقة ذكية', 'عقود رقمية'],
                },
                {
                    area:  'الامتثال الشرعي الآلي',
                    desc:  'نظام فلترة شرعية تلقائية لكل عملية استثمارية',
                    tech:  ['Sharia Screening Engine', 'AAOIFI Rules Engine'],
                },
                {
                    area:  'تتبع مؤشرات الأداء',
                    desc:  'لوحة تحكم مباشرة لتتبع KPIs وأداء المحافظ لحظة بلحظة',
                    tech:  ['Real-time Dashboard', 'تقارير PDF/Excel', 'تنبيهات ذكية'],
                },
                {
                    area:  'خدمات الوقف الرقمي',
                    desc:  'منصة الوقف الرقمي لإدارة المحفظة الوقفية وتوزيع عوائدها',
                    tech:  ['Waqf Digital Platform', 'Blockchain Waqf Registry'],
                },
            ],
        };
    }

    // ══════════════════════════════════════════════════════════
    // دوال مساعدة
    // ══════════════════════════════════════════════════════════

    getDashboard() {
        return {
            fund: {
                nameAr:   this.identity.nameAr,
                nameEn:   this.identity.nameEn,
                acronym:  this.acronym,
                taglineAr: this.identity.taglineAr,
                taglineEn: this.identity.taglineEn,
                vision:   this.identity.vision,
            },
            summary: {
                portfolios:    this.portfolios.length,
                megaProjects:  this.megaProjects.length,
                kpis:          this.kpis.length,
                totalAUMTarget: this.identity.totalAssetsTarget,
                totalJobsTarget: this.kpis.find(k => k.id === 'SPIF-K2')?.target,
                shariaCompliance: '١٠٠٪ — AAOIFI',
                partnerships:  {
                    local:    this.partnerships.local.length,
                    regional: this.partnerships.regional.length,
                    global:   this.partnerships.global.length,
                },
            },
            quranic_ref: this.identity.quranic_refs[0],
        };
    }

    getPortfolioById(id) {
        return this.portfolios.find(p => p.id === id) || null;
    }

    getKPIById(id) {
        return this.kpis.find(k => k.id === id) || null;
    }

    getMegaProjectById(id) {
        return this.megaProjects.find(m => m.id === id) || null;
    }

    getFullReport() {
        return {
            identity:     this.identity,
            governance:   this.governance,
            portfolios:   this.portfolios,
            megaProjects: this.megaProjects,
            kpis:         this.kpis,
            partnerships: this.partnerships,
            shariaBoard:  this.shariaBoard,
            sheikhaRole:  this.sheikhaRole,
            generatedAt:  new Date().toISOString(),
        };
    }
}

module.exports = SheikhaPublicInvestmentFund;
