/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ☪️ بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * SHEIKHA TRADE ENGINE — منظومة التجارة المحلية السعودية والتجارة الدولية
 *
 * المالك: سلمان أحمد بن سلمان الراجح
 *
 * "لِإِيلَافِ قُرَيْشٍ إِيلَافِهِمْ رِحْلَةَ الشِّتَاءِ وَالصَّيْفِ" — قريش ١-٢
 * "وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا" — البقرة ٢٧٥
 *
 * ✅ التجارة المحلية السعودية — أنظمة، تراخيص، أسواق، مناطق
 * ✅ التجارة الدولية — تصدير، استيراد، اتفاقيات، ممرات
 * ✅ التجارة الإلكترونية — المنصات والأنظمة السعودية والعالمية
 * ✅ الضوابط الشرعية — بالكتاب والسنة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

class SheikhaTradeEngine {
    constructor() {
        this.name = 'منظومة التجارة المحلية والدولية — شيخة';
        this.version = '1.0.0';
        this.startedAt = new Date().toISOString();

        this.quranReferences = this._initQuranReferences();
        this.saudiDomestic = this._initSaudiDomestic();
        this.internationalTrade = this._initInternationalTrade();
        this.ecommerce = this._initEcommerce();
        this.tradeRoutes = this._initTradeRoutes();
        this.shariaGuidance = this._initShariaGuidance();
    }

    _initQuranReferences() {
        return [
            { surah: 'قريش', ayah: '1-4', text: 'لِإِيلَافِ قُرَيْشٍ إِيلَافِهِمْ رِحْلَةَ الشِّتَاءِ وَالصَّيْفِ فَلْيَعْبُدُوا رَبَّ هَٰذَا الْبَيْتِ', context: 'رحلة الشتاء (اليمن) والصيف (الشام) — أصل التجارة الدولية العربية' },
            { surah: 'البقرة', ayah: 275, text: 'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا', context: 'إباحة البيع' },
            { surah: 'النساء', ayah: 29, text: 'إِلَّا أَن تَكُونَ تِجَارَةً عَن تَرَاضٍ مِّنكُمْ', context: 'التراضي أساس كل صفقة' },
            { surah: 'الجمعة', ayah: 10, text: 'فَإِذَا قُضِيَتِ الصَّلَاةُ فَانتَشِرُوا فِي الْأَرْضِ وَابْتَغُوا مِن فَضْلِ اللَّهِ', context: 'السعي في طلب الرزق بعد العبادة' },
            { surah: 'المطففين', ayah: '1-3', text: 'وَيْلٌ لِّلْمُطَفِّفِينَ', context: 'تحريم الغش في الميزان' },
            { surah: 'البقرة', ayah: 282, text: 'إِذَا تَدَايَنتُم بِدَيْنٍ إِلَىٰ أَجَلٍ مُّسَمًّى فَاكْتُبُوهُ', context: 'توثيق العقود التجارية' },
        ];
    }

    // ══════════════════════════════════════════════════════════
    // التجارة المحلية السعودية
    // ══════════════════════════════════════════════════════════
    _initSaudiDomestic() {
        return {
            nameAr: 'التجارة المحلية السعودية', nameEn: 'Saudi Domestic Trade',
            regulators: [
                { name: 'وزارة التجارة', role: 'تنظيم وترخيص النشاط التجاري', platform: 'mc.gov.sa' },
                { name: 'هيئة المنشآت الصغيرة والمتوسطة (منشآت)', role: 'دعم SMEs', platform: 'monshaat.gov.sa' },
                { name: 'وزارة الاستثمار (MISA)', role: 'الاستثمار الأجنبي والمحلي' },
                { name: 'هيئة الزكاة والضريبة والجمارك (ZATCA)', role: 'ضريبة القيمة المضافة والجمارك' },
                { name: 'الهيئة العامة للمنافسة', role: 'منع الاحتكار' },
                { name: 'المركز الوطني للتنافسية (تيسير)', role: 'تحسين بيئة الأعمال' },
            ],
            licenses: [
                { nameAr: 'سجل تجاري', nameEn: 'Commercial Registration (CR)', entity: 'وزارة التجارة', platform: 'mc.gov.sa' },
                { nameAr: 'رخصة بلدية', nameEn: 'Municipal License', entity: 'الأمانة/البلدية', platform: 'balady.gov.sa' },
                { nameAr: 'تسجيل ضريبي', nameEn: 'Tax Registration', entity: 'ZATCA' },
                { nameAr: 'رخصة صناعية', nameEn: 'Industrial License', entity: 'وزارة الصناعة' },
                { nameAr: 'وثيقة عمل حر', nameEn: 'Freelance Document', entity: 'وزارة الموارد البشرية' },
                { nameAr: 'رخصة منشأة سياحية', nameEn: 'Tourism License', entity: 'هيئة السياحة' },
            ],
            companyTypes: [
                { nameAr: 'مؤسسة فردية', nameEn: 'Sole Proprietorship', minCapital: 'لا يوجد حد أدنى' },
                { nameAr: 'شركة ذات مسؤولية محدودة', nameEn: 'LLC', minCapital: 'لا حد أدنى (الجديد)' },
                { nameAr: 'شركة مساهمة مقفلة', nameEn: 'Closed Joint Stock', minCapital: '500,000 ريال' },
                { nameAr: 'شركة مساهمة عامة', nameEn: 'Public Joint Stock', minCapital: 'حسب CMA' },
                { nameAr: 'شركة تضامنية', nameEn: 'General Partnership' },
                { nameAr: 'شركة توصية بسيطة', nameEn: 'Limited Partnership' },
                { nameAr: 'شركة مهنية', nameEn: 'Professional Company' },
                { nameAr: 'شركة غير ربحية', nameEn: 'Non-Profit Company' },
            ],
            taxes: [
                { nameAr: 'ضريبة القيمة المضافة', nameEn: 'VAT', rate: '15%', since: '2018 (5%) → 2020 (15%)' },
                { nameAr: 'زكاة', nameEn: 'Zakat', rate: '2.5%', applies: 'المنشآت السعودية' },
                { nameAr: 'ضريبة دخل الشركات', nameEn: 'Corporate Income Tax', rate: '20%', applies: 'الشركات الأجنبية' },
                { nameAr: 'ضريبة استقطاع', nameEn: 'Withholding Tax', rate: '5-20%', applies: 'مدفوعات لغير مقيمين' },
                { nameAr: 'ضريبة التصرفات العقارية', nameEn: 'RETT', rate: '5%' },
            ],
            sectors: [
                { nameAr: 'تجزئة', nameEn: 'Retail', examples: ['سوبرماركت', 'مولات', 'متاجر تخصصية'] },
                { nameAr: 'جملة', nameEn: 'Wholesale', examples: ['أسواق جملة', 'موزعون', 'وكلاء'] },
                { nameAr: 'مطاعم وأغذية', nameEn: 'F&B', examples: ['مطاعم', 'مقاهي', 'تموين'] },
                { nameAr: 'عقار', nameEn: 'Real Estate', examples: ['بيع', 'إيجار', 'تطوير'] },
                { nameAr: 'مقاولات', nameEn: 'Contracting', examples: ['بناء', 'صيانة', 'تشطيب'] },
                { nameAr: 'نقل', nameEn: 'Transportation', examples: ['شحن', 'توصيل', 'ركاب'] },
                { nameAr: 'صحة', nameEn: 'Healthcare', examples: ['مستشفيات', 'صيدليات', 'مختبرات'] },
                { nameAr: 'تعليم', nameEn: 'Education', examples: ['مدارس', 'معاهد', 'تدريب'] },
                { nameAr: 'تقنية', nameEn: 'Technology', examples: ['برمجيات', 'SaaS', 'استشارات'] },
                { nameAr: 'معادن وسكراب', nameEn: 'Metals & Scrap', examples: ['ذهب', 'حديد', 'ألومنيوم', 'تشليح'], note: '★ سوق شيخة — التخصص الأساسي' },
            ],
            digitalPlatforms: [
                { name: 'منصة قوائم', purpose: 'إيداع القوائم المالية', url: 'qawaem.business.gov.sa' },
                { name: 'نظام بلدي', purpose: 'رخص بلدية إلكترونية' },
                { name: 'فاتورة (ZATCA)', purpose: 'الفوترة الإلكترونية الإلزامية' },
                { name: 'منصة أعمال', purpose: 'سجلات تجارية وخدمات إلكترونية' },
                { name: 'منصة مراس', purpose: 'إصدار سجل تجاري فوري' },
                { name: 'منصة ثمين', purpose: 'مزادات حكومية' },
            ],
        };
    }

    // ══════════════════════════════════════════════════════════
    // التجارة الدولية
    // ══════════════════════════════════════════════════════════
    _initInternationalTrade() {
        return {
            nameAr: 'التجارة الدولية', nameEn: 'International Trade',
            saudiExports: {
                total: '~$350 مليار سنوياً',
                top: [
                    { product: 'نفط خام ومنتجات بترولية', share: '~75%' },
                    { product: 'بتروكيماويات وبلاستيك', share: '~12%' },
                    { product: 'معادن (ألمنيوم، فوسفات)', share: '~3%' },
                    { product: 'تمور ومنتجات غذائية', share: '~1%' },
                ],
                destinations: ['الصين', 'اليابان', 'كوريا الجنوبية', 'الهند', 'الولايات المتحدة', 'مصر', 'الإمارات'],
            },
            saudiImports: {
                total: '~$180 مليار سنوياً',
                top: [
                    { product: 'آلات ومعدات', share: '~20%' },
                    { product: 'سيارات ومركبات', share: '~12%' },
                    { product: 'إلكترونيات', share: '~10%' },
                    { product: 'أغذية', share: '~15%' },
                    { product: 'أدوية ومستحضرات', share: '~5%' },
                    { product: 'حديد وصلب', share: '~5%' },
                ],
                sources: ['الصين', 'الولايات المتحدة', 'الإمارات', 'ألمانيا', 'اليابان', 'الهند', 'كوريا'],
            },
            agreements: [
                { name: 'الاتحاد الجمركي الخليجي', partners: 'GCC', type: 'اتحاد جمركي' },
                { name: 'منطقة التجارة الحرة العربية (GAFTA)', partners: 'الدول العربية', type: 'منطقة تجارة حرة' },
                { name: 'WTO', since: 2005, type: 'عضوية' },
                { name: 'اتفاقية EFTA', partners: 'سويسرا، النرويج، أيسلندا، ليختنشتاين' },
                { name: 'اتفاقية سنغافورة', partners: 'سنغافورة' },
                { name: 'مفاوضات جارية', partners: ['الاتحاد الأوروبي', 'المملكة المتحدة', 'اليابان', 'الصين', 'الهند'] },
            ],
            saudiAuthority: {
                customs: 'هيئة الزكاة والضريبة والجمارك (ZATCA)',
                exportDev: 'البنك السعودي للتصدير والاستيراد (Saudi EXIM)',
                investment: 'وزارة الاستثمار (MISA)',
                qualityStandards: 'الهيئة السعودية للمواصفات والمقاييس (SASO)',
                singleWindow: 'النافذة الواحدة (فسح — FASAH)',
            },
            incoterms2020: [
                { code: 'EXW', nameAr: 'تسليم المصنع', seller: 'أدنى مسؤولية' },
                { code: 'FCA', nameAr: 'تسليم الناقل' },
                { code: 'FAS', nameAr: 'تسليم جانب السفينة' },
                { code: 'FOB', nameAr: 'تسليم على ظهر السفينة', note: 'الأكثر شيوعاً في تجارة السكراب' },
                { code: 'CFR', nameAr: 'تكلفة وشحن' },
                { code: 'CIF', nameAr: 'تكلفة وتأمين وشحن', note: 'شائع جداً' },
                { code: 'CPT', nameAr: 'النقل مدفوع إلى' },
                { code: 'CIP', nameAr: 'النقل والتأمين مدفوعان إلى' },
                { code: 'DAP', nameAr: 'تسليم عند مكان' },
                { code: 'DPU', nameAr: 'تسليم عند مكان التفريغ' },
                { code: 'DDP', nameAr: 'تسليم مدفوع الرسوم', seller: 'أقصى مسؤولية' },
            ],
            documents: [
                { nameAr: 'بوليصة شحن', nameEn: 'Bill of Lading (B/L)' },
                { nameAr: 'فاتورة تجارية', nameEn: 'Commercial Invoice' },
                { nameAr: 'قائمة تعبئة', nameEn: 'Packing List' },
                { nameAr: 'شهادة منشأ', nameEn: 'Certificate of Origin' },
                { nameAr: 'شهادة فحص', nameEn: 'Inspection Certificate (SGS/Bureau Veritas)' },
                { nameAr: 'اعتماد مستندي', nameEn: 'Letter of Credit (L/C)' },
                { nameAr: 'شهادة مطابقة SASO', nameEn: 'SASO SABER Certificate' },
                { nameAr: 'بيان جمركي', nameEn: 'Customs Declaration' },
                { nameAr: 'شهادة صحية/حجر', nameEn: 'Health/Phytosanitary Certificate' },
            ],
        };
    }

    // ══════════════════════════════════════════════════════════
    // التجارة الإلكترونية
    // ══════════════════════════════════════════════════════════
    _initEcommerce() {
        return {
            nameAr: 'التجارة الإلكترونية', nameEn: 'E-Commerce',
            saudiMarket: {
                size: '~$13 مليار (2025)', growth: '+20% سنوياً', penetration: '~70% من السكان',
                regulator: 'وزارة التجارة — نظام التجارة الإلكترونية',
                register: 'معروف (Ma\'rouf) — سجل المتاجر الإلكترونية',
            },
            models: [
                { code: 'B2C', nameAr: 'تاجر → مستهلك', examples: ['أمازون السعودية', 'نون', 'جرير'] },
                { code: 'B2B', nameAr: 'تاجر → تاجر', examples: ['سوق شيخة', 'Alibaba', 'منصات جملة'] },
                { code: 'C2C', nameAr: 'مستهلك → مستهلك', examples: ['حراج', 'مستعمل'] },
                { code: 'D2C', nameAr: 'مصنع → مستهلك مباشرة' },
                { code: 'Marketplace', nameAr: 'سوق إلكتروني (وسيط)', examples: ['نون', 'أمازون', 'سلة'] },
                { code: 'Social Commerce', nameAr: 'تجارة اجتماعية', examples: ['انستغرام شوب', 'واتساب بزنس'] },
            ],
            saudiPlatforms: [
                { name: 'سلة (Salla)', type: 'بناء متاجر', note: 'أكبر منصة سعودية' },
                { name: 'زد (Zid)', type: 'بناء متاجر' },
                { name: 'معروف', type: 'توثيق متاجر إلكترونية' },
                { name: 'مدى', type: 'مدفوعات' },
                { name: 'STC Pay', type: 'محفظة رقمية' },
                { name: 'تمارا (Tamara)', type: 'اشتر الآن ادفع لاحقاً (BNPL)' },
                { name: 'تابي (Tabby)', type: 'BNPL' },
                { name: 'HyperPay', type: 'بوابة دفع' },
                { name: 'PayTabs', type: 'بوابة دفع' },
            ],
            payments: [
                { nameAr: 'مدى (بطاقة خصم)', shareAr: 'الأعلى في السعودية' },
                { nameAr: 'بطاقات ائتمان (Visa/Mastercard)' },
                { nameAr: 'Apple Pay / mada Pay' },
                { nameAr: 'تحويل بنكي' },
                { nameAr: 'الدفع عند الاستلام (COD)' },
                { nameAr: 'BNPL (تمارا / تابي)' },
                { nameAr: 'محافظ رقمية (STC Pay / urpay)' },
            ],
            logistics: [
                { name: 'سمسا (SMSA)', type: 'شحن محلي ودولي' },
                { name: 'أرامكس (Aramex)', type: 'شحن' },
                { name: 'ناقل (Naqel)', type: 'شحن' },
                { name: 'DHL', type: 'دولي' },
                { name: 'FedEx', type: 'دولي' },
                { name: 'SPL (البريد السعودي)', type: 'محلي' },
                { name: 'بريدكس (Bredex)', type: 'آخر ميل' },
            ],
        };
    }

    _initTradeRoutes() {
        return {
            nameAr: 'الممرات التجارية الكبرى', nameEn: 'Major Trade Routes',
            historicIslamic: [
                { name: 'طريق البخور', from: 'اليمن', to: 'الشام/مصر', goods: 'بخور، لبان، توابل' },
                { name: 'رحلة الشتاء والصيف', from: 'مكة', to: 'اليمن (شتاء) / الشام (صيف)', goods: 'تجارة شاملة' },
                { name: 'طريق الحرير', from: 'الصين', to: 'البحر المتوسط', goods: 'حرير، توابل، ذهب' },
            ],
            modernRoutes: [
                { name: 'مضيق هرمز', traffic: '~20% من نفط العالم', location: 'الخليج العربي' },
                { name: 'باب المندب', traffic: '~10% من التجارة العالمية', location: 'البحر الأحمر/عدن' },
                { name: 'قناة السويس', traffic: '~12% من التجارة العالمية', location: 'مصر' },
                { name: 'مضيق ملقا', traffic: '~25% من التجارة البحرية', location: 'جنوب شرق آسيا' },
                { name: 'الجسر البري السعودي', from: 'الخليج العربي', to: 'البحر الأحمر', note: 'بديل قناة السويس' },
                { name: 'IMEC', from: 'الهند', to: 'أوروبا عبر الشرق الأوسط', note: 'ممر اقتصادي جديد يمر عبر السعودية' },
            ],
        };
    }

    _initShariaGuidance() {
        return {
            nameAr: 'الضوابط الشرعية للتجارة', nameEn: 'Sharia Trade Guidance',
            contracts: [
                { nameAr: 'بيع', type: 'أساسي', conditions: ['عاقدان', 'محل (سلعة)', 'ثمن', 'إيجاب وقبول', 'تراضي'] },
                { nameAr: 'سلم', type: 'آجل', description: 'دفع الثمن مقدماً والسلعة مؤجلة — مناسب للسكراب والمعادن' },
                { nameAr: 'استصناع', type: 'تصنيع', description: 'طلب تصنيع سلعة بمواصفات محددة' },
                { nameAr: 'مرابحة', type: 'تمويل', description: 'شراء وبيع بربح معلوم — تمويل إسلامي' },
                { nameAr: 'وكالة', type: 'تمثيل', description: 'توكيل في البيع والشراء' },
                { nameAr: 'سمسرة', type: 'وساطة', description: 'جائزة بأجر معلوم' },
            ],
            prohibitions: [
                { nameAr: 'الربا', description: 'تحريم الفائدة' },
                { nameAr: 'الغرر', description: 'جهالة فاحشة في المبيع' },
                { nameAr: 'الغش والتدليس', description: 'إخفاء عيب أو تزييف' },
                { nameAr: 'التطفيف', description: 'نقص الكيل والميزان' },
                { nameAr: 'الاحتكار', description: 'حبس السلع لرفع السعر' },
                { nameAr: 'بيع ما لا يملك', description: 'لا تبع ما ليس عندك' },
                { nameAr: 'بيعتان في بيعة', description: 'جهالة في الثمن أو الأجل' },
                { nameAr: 'النجش', description: 'رفع السعر بدون نية شراء' },
            ],
        };
    }

    getDashboard() {
        return {
            name: this.name, version: this.version, startedAt: this.startedAt,
            summary: {
                saudiRegulators: this.saudiDomestic.regulators.length,
                licenseTypes: this.saudiDomestic.licenses.length,
                companyTypes: this.saudiDomestic.companyTypes.length,
                saudiSectors: this.saudiDomestic.sectors.length,
                tradeAgreements: this.internationalTrade.agreements.length,
                incoterms: this.internationalTrade.incoterms2020.length,
                tradeDocuments: this.internationalTrade.documents.length,
                ecomModels: this.ecommerce.models.length,
                saudiPlatforms: this.ecommerce.saudiPlatforms.length,
                tradeRoutes: this.tradeRoutes.modernRoutes.length,
                shariaContracts: this.shariaGuidance.contracts.length,
                shariaProhibitions: this.shariaGuidance.prohibitions.length,
                quranVerses: this.quranReferences.length,
            },
            quranReferences: this.quranReferences,
            saudiDomestic: this.saudiDomestic,
            internationalTrade: this.internationalTrade,
            ecommerce: this.ecommerce,
            tradeRoutes: this.tradeRoutes,
            shariaGuidance: this.shariaGuidance,
        };
    }
}

module.exports = SheikhaTradeEngine;
