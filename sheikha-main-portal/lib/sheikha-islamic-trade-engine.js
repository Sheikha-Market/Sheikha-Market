'use strict';
// ══════════════════════════════════════════════════════════════════
// محرك سوق التجارة الإسلامية العالمية — شيخة
// بسم الله الرحمن الرحيم
// ﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾ — البقرة ٢٧٥
// ══════════════════════════════════════════════════════════════════

// ──────────────────────────────────────────────────────────────────
// ١. الدول الإسلامية الـ ٥٧ — مصنفة بالمنطقة
// ──────────────────────────────────────────────────────────────────
const OIC_COUNTRIES = {
    total: 57,
    regions: {
        arabian_peninsula: {
            name: 'جزيرة العرب',
            countries: ['SA','YE','OM','AE','QA','BH','KW'],
            gdp_usd_b: 2100,
            trade_strength: 'عالية'
        },
        north_africa_levant: {
            name: 'شمال أفريقيا والشام',
            countries: ['EG','MA','DZ','TN','LY','PS','JO','SY','LB','IQ'],
            gdp_usd_b: 1200,
            trade_strength: 'متوسطة-عالية'
        },
        south_asia: {
            name: 'جنوب آسيا',
            countries: ['PK','BD','AF','MV'],
            gdp_usd_b: 900,
            trade_strength: 'متوسطة'
        },
        southeast_asia: {
            name: 'جنوب شرق آسيا',
            countries: ['ID','MY','BN'],
            gdp_usd_b: 1800,
            trade_strength: 'عالية جداً'
        },
        subsaharan_africa: {
            name: 'أفريقيا جنوب الصحراء',
            countries: ['NG','SN','ML','SO','ET','GH','CI','CM','TD','NE','BF','GM','GN','GW','SL','LR','MR','DJ','KM','MZ','TZ','UG'],
            gdp_usd_b: 750,
            trade_strength: 'متوسطة-منخفضة'
        },
        central_asia: {
            name: 'آسيا الوسطى وتركيا وإيران',
            countries: ['TR','IR','KZ','UZ','TM','KG','TJ','AZ'],
            gdp_usd_b: 1400,
            trade_strength: 'متوسطة-عالية'
        }
    }
};

// ──────────────────────────────────────────────────────────────────
// ٢. رموز HS الإسلامية — ١٢ قطاع حلال
// ──────────────────────────────────────────────────────────────────
const ISLAMIC_HS_CODES = {
    title: 'رموز HS الإسلامية — ١٢ قطاع حلال',
    sectors: [
        {
            id: 'metals_scrap',
            name: 'المعادن والسكراب',
            hs_range: '7201–8548',
            sheikha_specialty: true,
            volume_usd_b: 850,
            players: ['SA', 'TR', 'EG', 'MY', 'NG'],
            description: 'تخصص شيخة الأول — معادن خام + سكراب + فولاذ + نحاس',
            sharia_notes: 'حلال — لا ربا في تجارة المعادن الفورية'
        },
        {
            id: 'halal_food',
            name: 'الغذاء الحلال',
            hs_range: '0101–2403',
            sheikha_specialty: false,
            volume_usd_b: 2100,
            players: ['MY', 'ID', 'BR', 'AU', 'NZ'],
            description: 'سوق الغذاء الحلال العالمي — أكبر قطاع حلال',
            sharia_notes: 'شرط: ذبح شرعي + شهادة حلال معتمدة'
        },
        {
            id: 'textiles_clothing',
            name: 'المنسوجات والملابس',
            hs_range: '5001–6310',
            sheikha_specialty: false,
            volume_usd_b: 360,
            players: ['BD', 'TR', 'PK', 'ID', 'EG'],
            description: 'ملابس حلال + عباءات + حشمة إسلامية عالمية',
            sharia_notes: 'حلال — مع مراعاة الحشمة في التصميم'
        },
        {
            id: 'cosmetics_pharma',
            name: 'مستحضرات التجميل والدواء الحلال',
            hs_range: '3001–3406',
            sheikha_specialty: false,
            volume_usd_b: 120,
            players: ['MY', 'SA', 'TR', 'EG', 'ID'],
            description: 'مستحضرات خالية من الكحول والمشتقات المحرمة',
            sharia_notes: 'شرط: لا كحول + لا مشتقات خنزير + شهادة حلال'
        },
        {
            id: 'construction_materials',
            name: 'مواد البناء والإنشاء',
            hs_range: '2501–2815',
            sheikha_specialty: true,
            volume_usd_b: 220,
            players: ['SA', 'AE', 'TR', 'EG', 'MA'],
            description: 'أسمنت + حديد + مواد بناء لإعمار الدول الإسلامية',
            sharia_notes: 'حلال — لا قيود شرعية على مواد البناء'
        },
        {
            id: 'agriculture',
            name: 'الزراعة والمحاصيل',
            hs_range: '1001–1214',
            sheikha_specialty: false,
            volume_usd_b: 480,
            players: ['EG', 'MA', 'TR', 'PK', 'SD'],
            description: 'قمح + أرز + قطن + تمر + زيتون — الأمن الغذائي الإسلامي',
            sharia_notes: 'حلال — مع مراعاة الزكاة الزراعية'
        },
        {
            id: 'energy_petroleum',
            name: 'الطاقة والنفط والغاز',
            hs_range: '2701–2716',
            sheikha_specialty: false,
            volume_usd_b: 1200,
            players: ['SA', 'AE', 'IR', 'KW', 'QA'],
            description: 'النفط والغاز والطاقة المتجددة الإسلامية',
            sharia_notes: 'حلال — لكن يُنصح بالطاقة المتجددة للاستدامة'
        },
        {
            id: 'technology_equipment',
            name: 'التقنية والمعدات',
            hs_range: '8471–8543',
            sheikha_specialty: false,
            volume_usd_b: 380,
            players: ['TR', 'MY', 'SA', 'AE', 'PK'],
            description: 'أجهزة + برمجيات + تقنية إسلامية مستقلة',
            sharia_notes: 'حلال — مع تجنب تقنيات الرقابة على المسلمين'
        },
        {
            id: 'sharia_finance_products',
            name: 'المنتجات المالية الشرعية',
            hs_range: 'N/A — خدمات',
            sheikha_specialty: true,
            volume_usd_b: 2700,
            players: ['SA', 'MY', 'AE', 'KW', 'QA'],
            description: 'صكوك + مرابحة + إجارة + مشاركة — التمويل الإسلامي',
            sharia_notes: 'ضابط شرعي أساسي: لا ربا + هيئة شرعية مستقلة'
        },
        {
            id: 'medical_equipment',
            name: 'المعدات الطبية',
            hs_range: '9018–9027',
            sheikha_specialty: false,
            volume_usd_b: 95,
            players: ['TR', 'MY', 'SA', 'AE', 'EG'],
            description: 'معدات طبية حلال لمستشفيات الأمة الإسلامية',
            sharia_notes: 'حلال — ضرورة شرعية تبيح ما لا يُباح عادةً'
        },
        {
            id: 'education_media',
            name: 'التعليم والإعلام الإسلامي',
            hs_range: 'N/A — خدمات',
            sheikha_specialty: false,
            volume_usd_b: 75,
            players: ['SA', 'EG', 'TR', 'MY', 'QA'],
            description: 'كتب + محتوى رقمي + ترجمات قرآنية + تعليم إسلامي',
            sharia_notes: 'فرض كفاية — نشر العلم الشرعي واجب'
        },
        {
            id: 'tourism_hajj_umrah',
            name: 'السياحة والحج والعمرة',
            hs_range: 'N/A — خدمات',
            sheikha_specialty: false,
            volume_usd_b: 150,
            players: ['SA', 'TR', 'MY', 'MA', 'JO'],
            description: 'سياحة حلال + حج + عمرة + سياحة دينية',
            sharia_notes: 'فريضة (الحج) + مستحب (السياحة الحلال)'
        }
    ]
};

// ──────────────────────────────────────────────────────────────────
// ٣. مبادئ التجارة الإسلامية من الكتاب والسنة
// ──────────────────────────────────────────────────────────────────
const ISLAMIC_TRADE_PRINCIPLES = {
    foundation: '﴿يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تَأْكُلُوا أَمْوَالَكُم بَيْنَكُم بِالْبَاطِلِ إِلَّا أَن تَكُونَ تِجَارَةً عَن تَرَاضٍ مِّنكُمْ﴾ — النساء ٢٩',
    core_rules: [
        { id: 'tawasul', name: 'التراضي المتبادل', arabic: 'البيع عن تراضٍ', description: 'لا بيع بإكراه — الرضا التام شرط الصحة' },
        { id: 'sidq', name: 'صدق القول والوصف', arabic: 'لا تدليس — لا غش', description: 'وصف البضاعة بالحق — «المسلم أخو المسلم لا يبيعه المعيب»' },
        { id: 'daqqa_wazn', name: 'دقة الوزن والكيل', arabic: '﴿وَأَوْفُوا الْكَيْلَ وَالْمِيزَانَ بِالْقِسْطِ﴾', description: 'الوزن الدقيق فريضة — ويل للمطففين' },
        { id: 'no_riba', name: 'لا ربا في أي صورة', arabic: '﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾', description: 'التمويل حلال فقط — صكوك ومرابحة ومشاركة' },
        { id: 'no_gharar', name: 'لا غرر ولا جهالة', arabic: 'نهى النبي ﷺ عن بيع الغرر', description: 'كل تجارة مجهولة الثمن أو الجودة أو الكمية محرمة' },
        { id: 'no_ihtikar', name: 'لا احتكار', arabic: 'لا يحتكر إلا خاطئ — صحيح مسلم', description: 'حبس البضاعة لرفع السعر محرم — يُفسد السوق' },
        { id: 'zakat_on_trade', name: 'زكاة عروض التجارة', arabic: 'ربع العشر — ٢.٥٪', description: 'كل بضاعة حال عليها الحول وبلغت النصاب فيها الزكاة' },
    ],
    model_market: 'سوق المدينة المنورة — النبي ﷺ أسس سوقاً حراً عادلاً بلا ضرائب جائرة'
};

// ──────────────────────────────────────────────────────────────────
// ٤. شبكة المعاملات الإسلامية
// ──────────────────────────────────────────────────────────────────
const TRADE_NETWORK = {
    total_market_size_usd_t: 3.1, // تريليون دولار
    annual_growth_pct: 8.3,
    halal_certified_companies: 2800000,
    trade_corridors: [
        { from: 'جزيرة العرب', to: 'جنوب آسيا', volume_usd_b: 280, primary: 'طاقة→نسيج' },
        { from: 'جنوب شرق آسيا', to: 'الشرق الأوسط', volume_usd_b: 195, primary: 'غذاء حلال→نفط' },
        { from: 'أفريقيا', to: 'الخليج', volume_usd_b: 85, primary: 'مواد خام→إنشاء' },
        { from: 'تركيا', to: 'شمال أفريقيا', volume_usd_b: 120, primary: 'صناعة→زراعة' },
        { from: 'ماليزيا', to: 'الأمة كلها', volume_usd_b: 145, primary: 'صكوك→تمويل' },
    ],
    rfq_system: {
        name: 'نظام طلب العروض الإسلامي',
        description: 'RFQ إسلامي مع ضمان الشفافية والعدل',
        steps: ['نشر الطلب', 'استقبال العروض', 'المقارنة الشفافة', 'إبرام العقد الشرعي', 'تسليم وتوثيق']
    }
};

// ──────────────────────────────────────────────────────────────────
// ٥. الفئات الإسلامية للتجار
// ──────────────────────────────────────────────────────────────────
const TRADER_CATEGORIES = [
    { id: 'metals_specialist', name: 'متخصص المعادن والسكراب', icon: '⚙️', sheikha_home: true, min_volume_usd_k: 50 },
    { id: 'halal_food_trader', name: 'تاجر الغذاء الحلال', icon: '🍱', sheikha_home: false, min_volume_usd_k: 20 },
    { id: 'manufacturer', name: 'صانع ومنتج إسلامي', icon: '🏭', sheikha_home: false, min_volume_usd_k: 100 },
    { id: 'importer', name: 'مستورد إسلامي', icon: '📦', sheikha_home: false, min_volume_usd_k: 30 },
    { id: 'exporter', name: 'مصدّر إسلامي', icon: '🚢', sheikha_home: false, min_volume_usd_k: 30 },
    { id: 'broker', name: 'وسيط إسلامي حلال', icon: '🤝', sheikha_home: false, min_volume_usd_k: 0 },
    { id: 'sme_owner', name: 'صاحب مشروع صغير', icon: '💼', sheikha_home: false, min_volume_usd_k: 5 },
    { id: 'awqaf_manager', name: 'مدير وقف إنتاجي', icon: '🔌', sheikha_home: false, min_volume_usd_k: 0 },
];

// ══════════════════════════════════════════════════════════════════
// الكلاس الرئيسي
// ══════════════════════════════════════════════════════════════════
class SheikhaIslamicTradeEngine {
    constructor() {
        this.identity = {
            name: 'محرك سوق التجارة الإسلامية العالمية',
            version: '1.0.0',
            verse: '﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾',
            owner: 'سلمان أحمد بن سلمان الراجح'
        };
        this.oicCountries = OIC_COUNTRIES;
        this.hsCodeSectors = ISLAMIC_HS_CODES;
        this.tradePrinciples = ISLAMIC_TRADE_PRINCIPLES;
        this.tradeNetwork = TRADE_NETWORK;
        this.traderCategories = TRADER_CATEGORIES;
        this.active = false;
    }

    start() {
        this.active = true;
        console.log(`✅ [IslamicTrade] محرك التجارة الإسلامية العالمية يعمل`);
        console.log(`   ٥٧ دولة OIC | ١٢ قطاع حلال | ٣.١ تريليون دولار`);
        console.log(`   النية: إحياء سوق المدينة المنورة في كل بقاع الأرض`);
        return this;
    }

    getStatus() {
        return {
            active: this.active,
            name: this.identity.name,
            oicCountries: this.oicCountries.total,
            sectors: this.hsCodeSectors.sectors.length,
            totalMarketSize: `${this.tradeNetwork.total_market_size_usd_t} تريليون دولار`,
            annualGrowth: `${this.tradeNetwork.annual_growth_pct}٪`,
            tradePrinciples: this.tradePrinciples.core_rules.length,
            traderCategories: this.traderCategories.length,
        };
    }

    getMarketOverview() {
        return {
            title: 'السوق الإسلامي العالمي — نظرة شاملة',
            verse: this.tradePrinciples.foundation,
            size: this.tradeNetwork.total_market_size_usd_t,
            growth: this.tradeNetwork.annual_growth_pct,
            halalCompanies: this.tradeNetwork.halal_certified_companies,
            sectors: this.hsCodeSectors.sectors.map(s => ({
                id: s.id,
                name: s.name,
                volume: s.volume_usd_b,
                sheikhaSpecialty: s.sheikha_specialty
            })),
            corridors: this.tradeNetwork.trade_corridors,
        };
    }

    getSectorDetails(sectorId) {
        const sector = this.hsCodeSectors.sectors.find(s => s.id === sectorId);
        if (!sector) return null;
        return {
            ...sector,
            sharia_basis: this.tradePrinciples.core_rules.filter(r => ['no_riba','no_gharar','sidq','daqqa_wazn'].includes(r.id))
        };
    }

    getActiveCorridors() {
        return this.tradeNetwork.trade_corridors.map(c => ({
            ...c,
            status: 'نشط',
            next_step: 'توسيع من خلال بيت المال'
        }));
    }
}

const islamicTradeEngine = new SheikhaIslamicTradeEngine();
module.exports = islamicTradeEngine;
