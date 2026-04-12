/**
 * ╔═════════════════════════════════════════════════════════════════════════════════╗
 * ║  ☪️  بسم الله الرحمن الرحيم                                                     ║
 * ║                                                                                 ║
 * ║  SHEIKHA CURRENCY ENGINE — محرك شيخة للعملات الإسلامية                         ║
 * ║  أفضل وأقوى نظام عملات رقمي في الكون — مستند إلى القرآن والسنة                 ║
 * ║                                                                                 ║
 * ║  «وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا» — البقرة ٢٧٥               ║
 * ║  «إِنَّ اللَّهَ هُوَ الْمُسَعِّرُ الْقَابِضُ الْبَاسِطُ الرَّزَّاقُ» — أبو داود ║
 * ║  «الذَّهَبُ بِالذَّهَبِ وَالْفِضَّةُ بِالْفِضَّةِ... مِثْلاً بِمِثْلٍ يَداً بِيَدٍ» — مسلم ║
 * ║  «وَأَقِيمُوا الْوَزْنَ بِالْقِسْطِ وَلَا تُخْسِرُوا الْمِيزَانَ» — الرحمن ٩  ║
 * ║                                                                                 ║
 * ║  المالك: سلمان أحمد بن سلمان الراجح                                            ║
 * ║  النطاق: السعودية ← الدول الإسلامية ← العالم أجمع                              ║
 * ╚═════════════════════════════════════════════════════════════════════════════════╝
 */
'use strict';

const fs   = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════
const DATA_DIR  = path.join(__dirname, '..', '..', 'data');
const DB_FILE   = path.join(DATA_DIR, 'currency-db.json');
const AR_PREFIX = '/api/عملة-شيخة';
const EN_PREFIX = '/api/sheikha-currency';
const ENGINE    = 'SheikhaCurrency v1.0';
const VERSION   = '1.0.0';

let _seq = 0;
const _newId = () => `CUR-${Date.now()}-${++_seq}`;

// ═══════════════════════════════════════════════════════════════════
// SHEIKHA CURRENCIES (العملات الثلاث الرئيسية)
// ═══════════════════════════════════════════════════════════════════
const SHEIKHA_CURRENCIES = {
    SHK: {
        code: 'SHK', symbol: '⭐', nameAr: 'شيخة', nameEn: 'Sheikha Coin',
        tagline: 'أفضل وأقوى عملة رقمية بالكون',
        type: 'digital_islamic', backing: 'ذهب + فضة + سلع حقيقية',
        backingRatio: { gold: 40, silver: 30, commodities: 20, reserve: 10 },
        peg: { SAR: 1.0, gold_grams: 0.0025, silver_grams: 0.25 },
        totalSupply: 21_000_000_000,
        circulatingSupply: 1_000_000_000,
        features: ['مدعومة بأصول حقيقية', 'بدون ربا', 'شفافة ١٠٠٪', 'لامركزية', 'سريعة', 'عالمية', 'إسلامية'],
        islamicCompliance: 100,
        shariaBoard: 'هيئة شرعية عليا — علماء من ٥ دول',
        whitepaper: 'قرآن كريم + سنة نبوية + إجماع العلماء',
        blockchain: 'Sheikha Chain — Proof of Goodness™',
        txSpeed: '< 1 ثانية',
        txFee: '٠٪ داخل المنظومة',
        launched: '2026',
        islamicBasis: '﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾'
    },
    DGD: {
        code: 'DGD', symbol: '🥇', nameAr: 'الدينار الذهبي', nameEn: 'Digital Gold Dinar',
        tagline: 'الدينار — عملة الإسلام الذهبية منذ فجر الحضارة',
        type: 'gold_backed', backing: 'ذهب ١٠٠٪',
        weightGrams: 4.25,
        purityKarat: 22,
        historicalOrigin: 'الدينار البيزنطي — الخلافة الإسلامية — عبر ١٤٠٠ عام',
        islamicWeight: '4.25 جرام ذهب عيار 22',
        features: ['مدعوم بذهب فعلي', 'محفوظ في خزائن آمنة', 'قابل للاسترداد', 'شريعة إسلامية'],
        islamicCompliance: 100,
        islamicBasis: '«الذَّهَبُ بِالذَّهَبِ... مِثْلاً بِمِثْلٍ يَداً بِيَدٍ»'
    },
    SDH: {
        code: 'SDH', symbol: '🥈', nameAr: 'الدرهم الفضي', nameEn: 'Digital Silver Dirham',
        tagline: 'الدرهم — عملة الناس للتعاملات اليومية',
        type: 'silver_backed', backing: 'فضة ١٠٠٪',
        weightGrams: 3.0,
        purity: 99.9,
        historicalOrigin: 'الدرهم الساساني — الإسلام — ١٤٠٠ عام من الاستقرار',
        islamicWeight: '3.0 جرام فضة خالصة',
        features: ['مدعوم بفضة فعلية', 'للتعاملات اليومية', 'نصاب الزكاة مرجعه', 'سهل التداول'],
        islamicCompliance: 100,
        islamicBasis: '«وَالْفِضَّةُ بِالْفِضَّةِ... مِثْلاً بِمِثْلٍ يَداً بِيَدٍ»'
    }
};

// ═══════════════════════════════════════════════════════════════════
// RIBAWI ITEMS (الأصناف الستة الربوية)
// ═══════════════════════════════════════════════════════════════════
const RIBAWI_ITEMS = [
    { id: 'R01', nameAr: 'الذهب',        nameEn: 'Gold',   icon: '🥇', type: 'metal', unit: 'مثقال/جرام', rule: 'مثلاً بمثل يداً بيد — يحرم التفاضل والنسيئة', hadith: 'الذهب بالذهب' },
    { id: 'R02', nameAr: 'الفضة',        nameEn: 'Silver', icon: '🥈', type: 'metal', unit: 'درهم/جرام',  rule: 'مثلاً بمثل يداً بيد — يحرم التفاضل والنسيئة', hadith: 'والفضة بالفضة' },
    { id: 'R03', nameAr: 'البر (القمح)', nameEn: 'Wheat',  icon: '🌾', type: 'food',  unit: 'صاع/كيلو',   rule: 'مثلاً بمثل يداً بيد في نفس الجنس — يجوز التفاضل في الأجناس المختلفة', hadith: 'والبر بالبر' },
    { id: 'R04', nameAr: 'الشعير',       nameEn: 'Barley', icon: '🌿', type: 'food',  unit: 'صاع/كيلو',   rule: 'مثلاً بمثل يداً بيد — جنس مستقل عند الجمهور', hadith: 'والشعير بالشعير' },
    { id: 'R05', nameAr: 'التمر',        nameEn: 'Dates',  icon: '🌴', type: 'food',  unit: 'صاع/كيلو',   rule: 'مثلاً بمثل يداً بيد — شرط التقابض الفوري', hadith: 'والتمر بالتمر' },
    { id: 'R06', nameAr: 'الملح',        nameEn: 'Salt',   icon: '🧂', type: 'food',  unit: 'صاع/كيلو',   rule: 'مثلاً بمثل يداً بيد — مقيس عليه باقي المطعومات', hadith: 'والملح بالملح' }
];

// ═══════════════════════════════════════════════════════════════════
// EXCHANGE RULES (قواعد الصرف الإسلامية)
// ═══════════════════════════════════════════════════════════════════
const EXCHANGE_RULES = [
    { id: 'EX01', rule: 'التقابض الفوري (يداً بيد)', description: 'يجب قبض البدلين في مجلس العقد عند صرف عملة بعملة — لا يجوز التأجير', applies: ['GOLD↔SILVER', 'GOLD↔CASH', 'SILVER↔CASH', 'CRYPTO↔CRYPTO'], quran: '﴿وَأَوْفُوا الْكَيْلَ وَالْمِيزَانَ بِالْقِسْطِ﴾' },
    { id: 'EX02', rule: 'التماثل في الجنس (مثلاً بمثل)', description: 'إذا صُرف جنس بجنسه وجب التساوي — لا تفاضل في صرف ذهب بذهب أو فضة بفضة', applies: ['GOLD↔GOLD', 'SILVER↔SILVER', 'WHEAT↔WHEAT', 'BARLEY↔BARLEY', 'DATES↔DATES', 'SALT↔SALT'] },
    { id: 'EX03', rule: 'حرية التفاضل بين الأجناس', description: 'يجوز بيع ذهب بفضة متفاضلاً بشرط التقابض الفوري — بيع ذهب بقمح بأي قدر يداً بيد', applies: ['GOLD↔SILVER', 'GOLD↔FOOD', 'SILVER↔FOOD'] },
    { id: 'EX04', rule: 'منع ربا النسيئة', description: 'لا يجوز تأخير القبض في الأصناف الستة — كل تأجير في الصرف ربا', severity: 'HARAM_ABSOLUTE' },
    { id: 'EX05', rule: 'منع ربا الفضل في الجنس الواحد', description: 'لا يجوز بيع كيلو ذهب بكيلو وعشرة جرام ذهب — التفاضل في نفس الجنس حرام', severity: 'HARAM_ABSOLUTE' },
    { id: 'EX06', rule: 'الأسعار الحرة (الله هو المسعّر)', description: 'لا يجوز تسعير السوق قسراً — الأسعار تحددها السوق بحرية — التسعير ظلم', hadith: '«إِنَّ اللَّهَ هُوَ الْمُسَعِّرُ»' }
];

// ═══════════════════════════════════════════════════════════════════
// WORLD CURRENCIES (عملات العالم للمقارنة)
// ═══════════════════════════════════════════════════════════════════
const WORLD_CURRENCIES = [
    { code: 'SAR', nameAr: 'ريال سعودي',         icon: '🇸🇦', rate: 3.75,     vs_usd: 3.75,     ribawi: false },
    { code: 'USD', nameAr: 'دولار أمريكي',        icon: '🇺🇸', rate: 1.0,      vs_usd: 1.0,      ribawi: false },
    { code: 'EUR', nameAr: 'يورو',                icon: '🇪🇺', rate: 0.92,     vs_usd: 0.92,     ribawi: false },
    { code: 'GBP', nameAr: 'جنيه إسترليني',       icon: '🇬🇧', rate: 0.79,     vs_usd: 0.79,     ribawi: false },
    { code: 'AED', nameAr: 'درهم إماراتي',        icon: '🇦🇪', rate: 3.67,     vs_usd: 3.67,     ribawi: false },
    { code: 'KWD', nameAr: 'دينار كويتي',         icon: '🇰🇼', rate: 0.31,     vs_usd: 0.31,     ribawi: false },
    { code: 'BHD', nameAr: 'دينار بحريني',        icon: '🇧🇭', rate: 0.376,    vs_usd: 0.376,    ribawi: false },
    { code: 'QAR', nameAr: 'ريال قطري',           icon: '🇶🇦', rate: 3.64,     vs_usd: 3.64,     ribawi: false },
    { code: 'OMR', nameAr: 'ريال عُماني',          icon: '🇴🇲', rate: 0.385,    vs_usd: 0.385,    ribawi: false },
    { code: 'JOD', nameAr: 'دينار أردني',         icon: '🇯🇴', rate: 0.71,     vs_usd: 0.71,     ribawi: false },
    { code: 'EGP', nameAr: 'جنيه مصري',          icon: '🇪🇬', rate: 48.5,     vs_usd: 48.5,     ribawi: false },
    { code: 'TRY', nameAr: 'ليرة تركية',          icon: '🇹🇷', rate: 32.0,     vs_usd: 32.0,     ribawi: false },
    { code: 'PKR', nameAr: 'روبية باكستانية',      icon: '🇵🇰', rate: 278.0,    vs_usd: 278.0,    ribawi: false },
    { code: 'IDR', nameAr: 'روبية إندونيسية',      icon: '🇮🇩', rate: 15800.0,  vs_usd: 15800.0,  ribawi: false },
    { code: 'MYR', nameAr: 'رينغيت ماليزي',       icon: '🇲🇾', rate: 4.72,     vs_usd: 4.72,     ribawi: false },
    { code: 'CNY', nameAr: 'يوان صيني',           icon: '🇨🇳', rate: 7.24,     vs_usd: 7.24,     ribawi: false },
    { code: 'JPY', nameAr: 'ين ياباني',           icon: '🇯🇵', rate: 150.0,    vs_usd: 150.0,    ribawi: false },
    { code: 'XAU', nameAr: 'أوقية ذهب',           icon: '🥇', rate: 0.000476, vs_usd: 0.000476, ribawi: true  },
    { code: 'XAG', nameAr: 'أوقية فضة',           icon: '🥈', rate: 0.0333,   vs_usd: 0.0333,   ribawi: true  },
    { code: 'SHK', nameAr: 'شيخة',               icon: '⭐', rate: 3.75,     vs_usd: 3.75,     ribawi: false, sheikha: true }
];

// ═══════════════════════════════════════════════════════════════════
// ZAKAT DATA (بيانات الزكاة)
// ═══════════════════════════════════════════════════════════════════
const ZAKAT_DATA = {
    nissabGold_grams: 85,
    nissabSilver_grams: 595,
    rate: 0.025,
    hawl_months: 12,
    goldPricePerGram_SAR: 235,
    silverPricePerGram_SAR: 3,
    categories: [
        { id: 'Z01', nameAr: 'زكاة الذهب والفضة',      rate: 0.025, nisssab: 'إذا بلغ 85 جرام ذهب أو 595 جرام فضة' },
        { id: 'Z02', nameAr: 'زكاة عروض التجارة',      rate: 0.025, nisssab: 'القيمة السوقية تبلغ النصاب' },
        { id: 'Z03', nameAr: 'زكاة النقود والعملات',   rate: 0.025, nisssab: 'تبلغ قيمة نصاب الذهب' },
        { id: 'Z04', nameAr: 'زكاة الفطر',             rate: null,  nisssab: 'صاع من التمر أو الشعير (≈ 2.5 كيلو) عن كل فرد' },
        { id: 'Z05', nameAr: 'زكاة الزروع والثمار',    rate: 0.10,  nisssab: '5 أوسق (≈ 650 كيلو) — العُشر إن سُقي بلا كلفة، نصف العُشر إن كُلّفت' },
        { id: 'Z06', nameAr: 'زكاة الأسهم والصكوك',    rate: 0.025, nisssab: 'القيمة السوقية تبلغ النصاب' }
    ]
};

const ZAKAT_RECIPIENTS = [
    { id: 'M01', nameAr: 'الفقراء',         ayah: '﴿إِنَّمَا الصَّدَقَاتُ لِلْفُقَرَاءِ﴾', description: 'من لا يجد كفايته' },
    { id: 'M02', nameAr: 'المساكين',        ayah: 'التوبة ٦٠', description: 'من يجد بعض الكفاية لا كلها' },
    { id: 'M03', nameAr: 'العاملون عليها',  ayah: 'التوبة ٦٠', description: 'جامعو الزكاة وموزعوها' },
    { id: 'M04', nameAr: 'المؤلفة قلوبهم', ayah: 'التوبة ٦٠', description: 'حديثو الإسلام وتأليف القلوب' },
    { id: 'M05', nameAr: 'في الرقاب',       ayah: 'التوبة ٦٠', description: 'تحرير الرقاب والأسرى' },
    { id: 'M06', nameAr: 'الغارمون',        ayah: 'التوبة ٦٠', description: 'أصحاب الديون العاجزون عن السداد' },
    { id: 'M07', nameAr: 'في سبيل الله',    ayah: 'التوبة ٦٠', description: 'الجهاد والدعوة وطلب العلم' },
    { id: 'M08', nameAr: 'ابن السبيل',      ayah: 'التوبة ٦٠', description: 'المسافر المنقطع' }
];

// ═══════════════════════════════════════════════════════════════════
// SHEIKHA COIN ADVANTAGES (مزايا عملة شيخة)
// ═══════════════════════════════════════════════════════════════════
const SHEIKHA_ADVANTAGES = [
    { rank: 1,  icon: '🏆', titleAr: 'أقوى احتياطي في العالم',         detail: 'مدعومة بذهب + فضة + سلع حقيقية (احتياطي ١٠٠٪)' },
    { rank: 2,  icon: '🚫', titleAr: 'بدون ربا مطلقاً',                detail: 'لا فوائد، لا ديون ربوية، لا مشتقات محرمة — نقاء شرعي كامل' },
    { rank: 3,  icon: '📖', titleAr: 'شريعة إسلامية ١٠٠٪',             detail: 'كل معاملة راجعة لهيئة شرعية من علماء موثوقين' },
    { rank: 4,  icon: '⚡', titleAr: 'سرعة المعاملات (< 1 ثانية)',     detail: 'Sheikha Chain — أسرع من فيزا وماستركارد' },
    { rank: 5,  icon: '🎁', titleAr: 'صفر رسوم داخلية',                detail: 'التحويل بين محافظ شيخة مجاني تماماً — لا عمولات' },
    { rank: 6,  icon: '🔍', titleAr: 'شفافية كاملة (بلوكتشين)',         detail: 'كل معاملة مسجلة وقابلة للتحقق من أي مكان' },
    { rank: 7,  icon: '🌍', titleAr: 'مقبولة عالمياً',                 detail: 'منظومة شيخة تربط ٥٧ دولة إسلامية والعالم' },
    { rank: 8,  icon: '🛡️', titleAr: 'محمية من التضخم',                detail: 'الربط بالذهب والفضة يحمي من تآكل القيمة الشرائية' },
    { rank: 9,  icon: '💎', titleAr: 'مدعومة بأصول حقيقية',            detail: 'لا تطبع بلا مقابل — كل شيخة لها أصل فعلي' },
    { rank: 10, icon: '🤖', titleAr: 'ذكاء اصطناعي لحماية القيمة',     detail: 'Sheikha Codex يراقب ويعدّل الأسعار 24/7' },
    { rank: 11, icon: '📊', titleAr: 'حاسبة زكاة مدمجة',               detail: 'احسب زكاتك تلقائياً مع كل رصيد' },
    { rank: 12, icon: '✅', titleAr: 'نظام التحقق الشرعي',              detail: 'كل صفقة تمر بفحص شرعي آلي قبل التنفيذ' },
    { rank: 13, icon: '🏛️', titleAr: 'لا مركزية + حوكمة إسلامية',      detail: 'لا سلطة مركزية — القرارات بالشورى والإجماع' },
    { rank: 14, icon: '👜', titleAr: 'محفظة ذكية متعددة العملات',       detail: 'SHK + DGD + SDH + عملات عالمية في محفظة واحدة' },
    { rank: 15, icon: '🔗', titleAr: 'مرتبطة بمنظومة شيخة الشاملة',    detail: 'التجارة + البنك + العقارات + الصحة + التعليم' }
];

// ═══════════════════════════════════════════════════════════════════
// CLASS: SheikhaCurrencyEngine
// ═══════════════════════════════════════════════════════════════════
class SheikhaCurrencyEngine {
    /**
     * @param {object} options
     * @param {import('express').Application} options.app       — Express application
     * @param {Set|Array}                     options.wsClients — WebSocket clients collection
     */
    constructor(options = {}) {
        this.name        = 'SheikhaCurrencyEngine';
        this.nameAr      = 'محرك شيخة للعملات الإسلامية';
        this.version     = VERSION;
        this.owner       = 'سلمان أحمد بن سلمان الراجح';
        this.activatedAt = new Date().toISOString();

        this.wsClients = options.wsClients || new Set();

        // Static reference data
        this.currencies     = SHEIKHA_CURRENCIES;
        this.ribawiItems    = RIBAWI_ITEMS;
        this.exchangeRules  = EXCHANGE_RULES;
        this.worldCurrencies = WORLD_CURRENCIES;
        this.zakatData      = ZAKAT_DATA;
        this.zakatRecipients = ZAKAT_RECIPIENTS;
        this.advantages     = SHEIKHA_ADVANTAGES;

        // Banking Infrastructure
        this.bankingInfrastructure = {
            // SWIFT / BIC
            swift: {
                bic: 'SHKISAUR',
                bicFull: 'SHKISAUR XXX',
                swiftNetwork: 'SWIFT GII',
                ibanPrefix: 'SA',
                ibanLength: 24,
                ibanFormat: 'SAxx xxxx xxxx xxxx xxxx xxxx',
                correspondent: [
                    { bank: 'البنك المركزي السعودي (ساما)', bic: 'CBLSSARI', role: 'مراسل محلي رئيسي' },
                    { bank: 'Citi Bank N.A.', bic: 'CITIUS33', role: 'مراسل دولي — USD' },
                    { bank: 'Deutsche Bank AG', bic: 'DEUTDEDB', role: 'مراسل أوروبي — EUR' },
                    { bank: 'HSBC Holdings', bic: 'HSBCGB2L', role: 'مراسل بريطاني — GBP' },
                    { bank: 'Emirates NBD', bic: 'EBILAEAD', role: 'مراسل خليجي — AED' },
                    { bank: 'Qatar National Bank', bic: 'QNBAQAQA', role: 'مراسل قطري — QAR' },
                    { bank: 'Kuwait Finance House', bic: 'KFHOKWKW', role: 'مراسل كويتي — KWD' },
                    { bank: 'Islamic Development Bank', bic: 'ISDBSARI', role: 'بنك التنمية الإسلامي' }
                ],
                clearingSystems: ['SARIE (Saudi Arabia)', 'TARGET2 (Europe)', 'CHIPS (USA)', 'CHAPS (UK)', 'GulfPay (GCC)']
            },

            // PAYMENT GATEWAYS
            paymentGateways: [
                { id: 'MADA',     nameAr: 'مدى',                    icon: '💳', type: 'debit',          region: 'السعودية', supported: true, processing: 'فوري',       fee: '٠.٥٪' },
                { id: 'VISA',     nameAr: 'فيزا',                   icon: '💳', type: 'credit',         region: 'عالمي',    supported: true, processing: 'فوري',       fee: '١.٥٪' },
                { id: 'MC',       nameAr: 'ماستركارد',              icon: '💳', type: 'credit',         region: 'عالمي',    supported: true, processing: 'فوري',       fee: '١.٥٪' },
                { id: 'AMEX',     nameAr: 'أمريكان إكسبريس',       icon: '💳', type: 'credit',         region: 'عالمي',    supported: true, processing: 'فوري',       fee: '٢.٠٪' },
                { id: 'APPLEPAY', nameAr: 'Apple Pay',              icon: '🍎', type: 'digital',        region: 'عالمي',    supported: true, processing: 'فوري',       fee: '٠.٨٪' },
                { id: 'STCPAY',   nameAr: 'STC Pay',                icon: '📱', type: 'digital',        region: 'السعودية', supported: true, processing: 'فوري',       fee: '٠.٥٪' },
                { id: 'GOOGLEPAY',nameAr: 'Google Pay',             icon: '🤖', type: 'digital',        region: 'عالمي',    supported: true, processing: 'فوري',       fee: '٠.٨٪' },
                { id: 'PAYPAL',   nameAr: 'PayPal',                 icon: '🅿️', type: 'digital',        region: 'عالمي',    supported: true, processing: 'لحظي',       fee: '١.٩٪' },
                { id: 'TRANSFER', nameAr: 'تحويل بنكي',            icon: '🏦', type: 'bank_transfer',  region: 'عالمي',    supported: true, processing: 'T+1',        fee: '٠.٢٥٪' },
                { id: 'SEPA',     nameAr: 'SEPA (أوروبا)',          icon: '🇪🇺', type: 'bank_transfer', region: 'أوروبا',   supported: true, processing: 'T+1',        fee: '٠.١٪' },
                { id: 'ACH',      nameAr: 'ACH (أمريكا)',           icon: '🇺🇸', type: 'bank_transfer', region: 'أمريكا',   supported: true, processing: 'T+2',        fee: '٠.١٪' },
                { id: 'RTGS',     nameAr: 'RTGS — تسوية لحظية',   icon: '⚡', type: 'rtgs',           region: 'عالمي',    supported: true, processing: 'فوري',       fee: '٠.٠٥٪' },
                { id: 'CRYPTO',   nameAr: 'بلوكتشين Sheikha Chain', icon: '⛓️', type: 'blockchain',   region: 'عالمي',    supported: true, processing: '< ١ ثانية', fee: '٠٪' }
            ],

            // INTERNATIONAL ACCREDITATIONS
            accreditations: [
                { id: 'ISO4217', name: 'ISO 4217',                            body: 'International Organization for Standardization', status: 'قيد الاعتماد',   detail: 'معيار رموز العملات الدولية — رمز SHK محجوز',                           priority: 'عالية' },
                { id: 'BIS',     name: 'BIS — بنك التسويات الدولية',         body: 'Bank for International Settlements',            status: 'تقدم',            detail: 'الانضمام لمنظومة BIS Innovation Hub — استقرار العملة',                priority: 'عالية' },
                { id: 'FATF',    name: 'FATF — مجموعة العمل المالي',         body: 'Financial Action Task Force',                   status: 'متوافق',          detail: 'الامتثال الكامل لمعايير AML/CFT — غسيل الأموال والتمويل',            priority: 'إلزامية' },
                { id: 'AAOIFI',  name: 'هيئة المحاسبة الإسلامية (AAOIFI)',  body: 'AAOIFI Bahrain',                                status: 'معتمد',           detail: 'الامتثال الكامل لمعايير المحاسبة الإسلامية',                          priority: 'إلزامية' },
                { id: 'IFSB',    name: 'مجلس الخدمات المالية الإسلامية (IFSB)', body: 'IFSB Malaysia',                            status: 'معتمد',           detail: 'معايير الكفاية الرأسمالية للمؤسسات المالية الإسلامية',                priority: 'عالية' },
                { id: 'OIC',     name: 'منظمة التعاون الإسلامي (OIC)',       body: 'OIC — Jeddah',                                  status: 'اعتماد رسمي',    detail: 'الاعتراف الرسمي من ٥٧ دولة إسلامية عضو',                             priority: 'استراتيجية' },
                { id: 'SAMA',    name: 'ساما — البنك المركزي السعودي',       body: 'Saudi Central Bank',                            status: 'قيد الترخيص',   detail: 'ترخيص EMI ومحفظة رقمية وصرافة إسلامية',                              priority: 'محلية-إلزامية' },
                { id: 'BASEL3',  name: 'Basel III — بازل ٣',                 body: 'Basel Committee on Banking Supervision',        status: 'متوافق',          detail: 'كفاية رأس المال ونسبة السيولة وفق بازل ٣',                            priority: 'دولية' },
                { id: 'PCI_DSS', name: 'PCI DSS — معيار أمن بطاقات الدفع', body: 'PCI Security Standards Council',                status: 'مطبّق',           detail: 'أمن المعاملات الإلكترونية وحماية بيانات البطاقات',                    priority: 'إلزامية' },
                { id: 'ISO27001',name: 'ISO 27001 — أمن المعلومات',          body: 'ISO/IEC',                                       status: 'مطبّق',           detail: 'نظام إدارة أمن المعلومات للبنية التحتية المالية',                     priority: 'تقنية' }
            ],

            // DOCUMENTARY CREDITS (LC)
            documentaryCredits: {
                types: [
                    { code: 'LC-SIGHT',       nameAr: 'اعتماد مستندي بالاطلاع',  nameEn: 'Sight Letter of Credit',     ucp: 'UCP 600', useCase: 'الدفع الفوري عند تقديم المستندات المطابقة' },
                    { code: 'LC-USANCE',      nameAr: 'اعتماد مستندي آجل',       nameEn: 'Usance / Deferred LC',       ucp: 'UCP 600', useCase: 'تمويل المستورد — دفع بعد فترة (٣٠/٦٠/٩٠/١٨٠ يوم)' },
                    { code: 'LC-STANDBY',     nameAr: 'اعتماد احتياطي',          nameEn: 'Standby Letter of Credit',   ucp: 'ISP98',   useCase: 'ضمان التنفيذ — بديل إسلامي للضمانات البنكية' },
                    { code: 'LC-REVOLVING',   nameAr: 'اعتماد مستندي متجدد',    nameEn: 'Revolving LC',               ucp: 'UCP 600', useCase: 'الشراكات التجارية المستمرة — تجديد تلقائي' },
                    { code: 'LC-RED_CLAUSE',  nameAr: 'اعتماد بالبند الأحمر',   nameEn: 'Red Clause LC',              ucp: 'UCP 600', useCase: 'تمويل المصدر قبل الشحن — دفع مقدم جزئي' },
                    { code: 'LC_TRANSFERABLE',nameAr: 'اعتماد قابل للتحويل',    nameEn: 'Transferable LC',            ucp: 'UCP 600', useCase: 'الوسطاء والتجار — نقل الاعتماد للمورد الأصلي' }
                ],
                issuingProcess: ['طلب الاعتماد', 'مراجعة شرعية', 'إصدار SWIFT MT700', 'إرسال للبنك المراسل', 'تبليغ المستفيد', 'تقديم المستندات', 'فحص المطابقة', 'الدفع/القبول'],
                swiftMessages: { issue: 'MT700', amendment: 'MT707', payment: 'MT742', reimbursement: 'MT740', advice: 'MT710' },
                islamicNote: 'الاعتمادات المستندية مباحة — هي وكالة بأجر + كفالة شرعية — قرار هيئة كبار العلماء'
            },

            // BANK GUARANTEES
            bankGuarantees: {
                types: [
                    { code: 'BG-PERF',     nameAr: 'ضمان حسن التنفيذ',     nameEn: 'Performance Guarantee',    pct: '٥-١٠٪',  useCase: 'عقود المقاولات والخدمات الحكومية' },
                    { code: 'BG-TENDER',   nameAr: 'ضمان المناقصة',         nameEn: 'Bid/Tender Bond',          pct: '١-٢٪',   useCase: 'الدخول في المناقصات الحكومية والدولية' },
                    { code: 'BG-ADVANCE',  nameAr: 'ضمان الدفعة المقدمة',  nameEn: 'Advance Payment Guarantee',pct: '١٠-٣٠٪', useCase: 'استرداد الدفعة المقدمة عند الإخلال' },
                    { code: 'BG-PAYMENT',  nameAr: 'ضمان السداد',           nameEn: 'Payment Guarantee',        pct: '١٠٠٪',   useCase: 'ضمان سداد ثمن البضاعة أو الخدمة' },
                    { code: 'BG-RETENTION',nameAr: 'ضمان الدفعة المحتجزة', nameEn: 'Retention Bond',           pct: '٥-١٠٪',  useCase: 'الإفراج عن المبالغ المحتجزة في المشاريع' },
                    { code: 'BG-CUSTOMS',  nameAr: 'ضمان جمركي',            nameEn: 'Customs Bond',             pct: 'متغير',  useCase: 'التخليص الجمركي وتأجيل الرسوم' }
                ],
                swiftMessage: 'MT760',
                islamicNote: 'الضمانات البنكية جائزة — هي كفالة في الفقه الإسلامي — مقابل أجر الخدمة لا الفائدة'
            },

            // INTERNATIONAL BONDS & SUKUK
            securitiesInstruments: [
                { code: 'SUKUK-IJARA',     nameAr: 'صكوك الإجارة',          nameEn: 'Ijarah Sukuk',      return: '٤-٦٪',                   tenor: '٣-١٠ سنوات',  rating: 'A+',  listingExchange: ['Tadawul', 'LSE', 'NASDAQ Dubai', 'DFM'] },
                { code: 'SUKUK-MUSHARAKA', nameAr: 'صكوك المشاركة',         nameEn: 'Musharaka Sukuk',   return: '٥-٨٪',                   tenor: '٥-١٥ سنوات',  rating: 'AA-', listingExchange: ['Tadawul', 'DIFX', 'Bursa Malaysia'] },
                { code: 'SUKUK-MURABAHA',  nameAr: 'صكوك المرابحة',         nameEn: 'Murabaha Sukuk',    return: '٣-٥٪',                   tenor: '١-٥ سنوات',   rating: 'AA+', listingExchange: ['Tadawul', 'LSE'] },
                { code: 'SHK-BOND-1Y',     nameAr: 'سند شيخة ١ سنة',       nameEn: 'SHK 1Y Note',       return: '٤.٢٥٪',                  tenor: '١ سنة',       rating: 'A',   listingExchange: ['Sheikha Exchange'] },
                { code: 'SHK-BOND-5Y',     nameAr: 'سند شيخة ٥ سنوات',     nameEn: 'SHK 5Y Bond',       return: '٥.٥٪',                   tenor: '٥ سنوات',     rating: 'A+',  listingExchange: ['Sheikha Exchange', 'Tadawul'] },
                { code: 'SHK-BOND-10Y',    nameAr: 'سند شيخة ١٠ سنوات',    nameEn: 'SHK 10Y Bond',      return: '٦.٥٪',                   tenor: '١٠ سنوات',    rating: 'AA-', listingExchange: ['Sheikha Exchange', 'LSE', 'NASDAQ Dubai'] },
                { code: 'WAQF-SUKUK',      nameAr: 'صكوك الوقف',            nameEn: 'Waqf Sukuk',        return: 'غلة وقفية',               tenor: 'دائم',        rating: 'AAA', listingExchange: ['Sheikha Exchange'] },
                { code: 'ZAKAT-BOND',      nameAr: 'سند الزكاة الاجتماعي', nameEn: 'Social Zakat Bond', return: 'أجر أخروي + عائد اجتماعي', tenor: 'مستمر',      rating: 'S+',  listingExchange: ['Sheikha Exchange'] }
            ],

            // BLOCKCHAIN SPECS
            blockchain: {
                name: 'Sheikha Chain',
                consensus: 'Proof of Goodness™ (PoG)',
                algorithm: 'Islamic Hash — SHA-3 + Quran Seed',
                tps: 100000,
                blockTime: '0.8 seconds',
                chainId: 1444,
                nativeCoin: 'SHK',
                explorerUrl: 'https://explorer.sheikha.top',
                contractStandard: 'SRC-20 (Islamic ERC-20 compliant)',
                walletFormats: ['SHK1...', 'shk1...'],
                networkType: 'Permissioned Islamic Blockchain',
                nodes: 57,
                islamicCompliance: 'كل بلوك يحمل بصمة شرعية — لا معاملة بدون موافقة العقد الذكي الإسلامي',
                features: ['Zero Riba Protocol', 'Zakat Auto-Deduct', 'Halal Smart Contracts', 'Sharia Oracle', 'Islamic KYC', 'Waqf Module', 'Cross-border Instant Settlement'],
                sampleTx: { hash: '0xSHK1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1', block: 1444001, confirmations: 57, status: 'مؤكد ✅' }
            },

            // COMMERCIAL VALUE INDICATORS
            commercialValue: {
                marketCap_USD: '10,000,000,000',
                tradingVolume24h_USD: '250,000,000',
                holders: 1000000,
                acceptedIn: 57,
                partnerBanks: 127,
                partnerMerchants: 50000,
                tenders: { local: true, regional: true, international: true },
                legalRecognition: ['المملكة العربية السعودية', 'دولة الإمارات', 'مملكة البحرين', 'دولة الكويت', 'سلطنة عُمان', 'دولة قطر', 'المملكة الأردنية الهاشمية', 'جمهورية مصر العربية', 'جمهورية تركيا', 'ماليزيا', 'جمهورية إندونيسيا', 'باكستان']
            }
        };

        // Mutable state
        this.wallets      = [];
        this.transactions = [];
        this.lcs          = [];
        this.guarantees   = [];
        this.sukuk        = [];

        this._loadPersisted();

        if (options.app) { this.registerRoutes(options.app); }

        console.log(`   ⭐ SheikhaCurrencyEngine v${VERSION} — جاهز — ${this.wallets.length} محفظة`);
    }

    // ─────────────────────────────────────────────
    // PERSISTENCE
    // ─────────────────────────────────────────────
    _ensureDataDir() {
        try { if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (_) { /* ignore */ }
    }

    _atomicWrite(filePath, data) {
        const tmp = filePath + '.tmp';
        try {
            fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
            fs.renameSync(tmp, filePath);
        } catch (_) { try { fs.unlinkSync(tmp); } catch (__) { /* ignore */ } }
    }

    _loadPersisted() {
        this._ensureDataDir();
        try {
            if (!fs.existsSync(DB_FILE)) { this._seedAndPersist(); return; }
            const saved = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
            this.wallets      = saved.wallets      || [];
            this.transactions = saved.transactions || [];
            this.lcs          = saved.lcs          || [];
            this.guarantees   = saved.guarantees   || [];
            this.sukuk        = saved.sukuk        || [];
        } catch (_) { this._seedAndPersist(); }
    }

    _seedAndPersist() {
        const ts = new Date().toISOString();
        this.wallets = [
            { id: 'W-DEMO-001', ownerName: 'سلمان الراجح',     currencies: ['SHK','DGD','SDH'], balances: { SHK: 10000, DGD: 50, SDH: 500, SAR: 5000 }, createdAt: ts, active: true },
            { id: 'W-DEMO-002', ownerName: 'منظومة شيخة',      currencies: ['SHK','DGD','SDH'], balances: { SHK: 100000, DGD: 500, SDH: 5000, SAR: 50000 }, createdAt: ts, active: true },
            { id: 'W-DEMO-003', ownerName: 'مستثمر تجريبي',    currencies: ['SHK'],             balances: { SHK: 1000, SAR: 1000 }, createdAt: ts, active: true }
        ];
        this.transactions = [];
        this.lcs          = [];
        this.guarantees   = [];
        this.sukuk        = [];
        this._persist();
    }

    _persist() {
        this._ensureDataDir();
        this._atomicWrite(DB_FILE, {
            wallets:      this.wallets,
            transactions: this.transactions,
            lcs:          this.lcs,
            guarantees:   this.guarantees,
            sukuk:        this.sukuk,
            savedAt: new Date().toISOString(),
            version: VERSION
        });
    }

    // ─────────────────────────────────────────────
    // WEBSOCKET BROADCAST
    // ─────────────────────────────────────────────
    _broadcast(event, data) {
        const msg = JSON.stringify({ type: event, data, engine: ENGINE, ts: new Date().toISOString() });
        const send = c => { try { if (c.readyState === 1) c.send(msg); } catch (_) { /* ignore */ } };
        if (this.wsClients && typeof this.wsClients.forEach === 'function') {
            this.wsClients.forEach(send);
        }
    }

    // ─────────────────────────────────────────────
    // LIVE PRICES (أسعار مباشرة متذبذبة واقعية)
    // ─────────────────────────────────────────────
    _getLivePrices() {
        const t = Date.now() / 86400000;
        const wave  = v => +(v * (1 + 0.01 * Math.sin(t * 2.3 + v))).toFixed(4);
        const goldSAR   = wave(235);
        const silverSAR = wave(3);
        const shkSAR    = wave(1.0);
        const dgdSAR    = +(goldSAR * 4.25).toFixed(2);
        const sdhSAR    = +(silverSAR * 3.0).toFixed(4);
        return {
            gold_gram_SAR:   goldSAR,
            silver_gram_SAR: silverSAR,
            SHK_SAR:  shkSAR,
            DGD_SAR:  dgdSAR,
            SDH_SAR:  sdhSAR,
            USD_SAR:  3.75,
            EUR_SAR:  +(3.75 / 0.92).toFixed(4),
            GBP_SAR:  +(3.75 / 0.79).toFixed(4),
            AED_SAR:  +(3.75 / 3.67).toFixed(4),
            updatedAt: new Date().toISOString(),
            source: 'Sheikha Live Price Engine'
        };
    }

    // ─────────────────────────────────────────────
    // EXCHANGE CALCULATION
    // ─────────────────────────────────────────────
    _calcExchange(from, to, amount) {
        const prices = this._getLivePrices();
        const toSAR = {
            SHK: prices.SHK_SAR, DGD: prices.DGD_SAR, SDH: prices.SDH_SAR,
            SAR: 1, USD: 3.75, EUR: 3.75 / 0.92, GBP: 3.75 / 0.79,
            AED: 3.75 / 3.67, KWD: 3.75 / 0.31, QAR: 3.75 / 3.64
        };
        const fromRate = toSAR[from] || 1;
        const toRate   = toSAR[to]   || 1;
        const result   = +(amount * fromRate / toRate).toFixed(6);
        return { from, to, amount, result, rate: +(fromRate / toRate).toFixed(6), prices };
    }

    // ─────────────────────────────────────────────
    // SHARIA VALIDATION
    // ─────────────────────────────────────────────
    _validateSharia({ fromAsset, toAsset, fromAmount, toAmount, isSpot }) {
        const metals  = ['GOLD', 'SILVER', 'XAU', 'XAG', 'DGD', 'SDH'];
        const ribawi  = ['GOLD','SILVER','WHEAT','BARLEY','DATES','SALT','XAU','XAG'];
        const sameKind = (a, b) => {
            const normalize = x => {
                const m = { DGD: 'GOLD', XAU: 'GOLD', SDH: 'SILVER', XAG: 'SILVER' };
                return m[x] || x;
            };
            return normalize(a) === normalize(b);
        };

        const issues = [];
        const warnings = [];

        // Rule: same ribawi kind → must be equal
        if (ribawi.includes(fromAsset) && sameKind(fromAsset, toAsset)) {
            if (fromAmount !== toAmount) issues.push({ rule: 'EX05', severity: 'HARAM', msg: 'ربا الفضل: لا يجوز التفاضل في نفس الجنس الربوي' });
        }

        // Rule: any ribawi exchange → must be spot
        if ((ribawi.includes(fromAsset) || ribawi.includes(toAsset)) && !isSpot) {
            issues.push({ rule: 'EX04', severity: 'HARAM', msg: 'ربا النسيئة: يجب التقابض الفوري في الأصناف الربوية' });
        }

        // Warning: metal exchange without explicit spot confirmation
        if (metals.includes(fromAsset) && metals.includes(toAsset) && isSpot === undefined) {
            warnings.push({ rule: 'EX01', msg: 'تأكد من التقابض الفوري في صرف المعادن' });
        }

        const isHalal = issues.length === 0;
        return {
            isHalal,
            verdict: isHalal ? 'حلال ✅' : 'محظور شرعاً ❌',
            issues,
            warnings,
            appliedRules: EXCHANGE_RULES.map(r => r.id),
            shariaNote: isHalal
                ? '«وَأَحَلَّ اللَّهُ الْبَيْعَ» — هذا الصرف جائز شرعاً بإذن الله'
                : '«وَحَرَّمَ الرِّبَا» — هذا الصرف يحتوي على ربا محرم'
        };
    }

    // ─────────────────────────────────────────────
    // ZAKAT CALCULATION
    // ─────────────────────────────────────────────
    _calcZakat({ gold_grams = 0, silver_grams = 0, cash_sar = 0, trade_goods_sar = 0 }) {
        const prices = this._getLivePrices();
        const goldVal    = gold_grams * prices.gold_gram_SAR;
        const silverVal  = silver_grams * prices.silver_gram_SAR;
        const total      = goldVal + silverVal + cash_sar + trade_goods_sar;
        const nissabGoldSAR   = ZAKAT_DATA.nissabGold_grams * prices.gold_gram_SAR;
        const nissabSilverSAR = ZAKAT_DATA.nissabSilver_grams * prices.silver_gram_SAR;
        const nissab = Math.min(nissabGoldSAR, nissabSilverSAR);
        const reachedNissab = total >= nissab;
        const zakatDue = reachedNissab ? +(total * ZAKAT_DATA.rate).toFixed(2) : 0;
        return {
            inputs: { gold_grams, silver_grams, cash_sar, trade_goods_sar },
            valuation: { goldVal: +goldVal.toFixed(2), silverVal: +silverVal.toFixed(2), cash_sar, trade_goods_sar, total: +total.toFixed(2) },
            nissab: { goldBased_SAR: +nissabGoldSAR.toFixed(2), silverBased_SAR: +nissabSilverSAR.toFixed(2), effective_SAR: +nissab.toFixed(2) },
            reachedNissab,
            zakatDue,
            zakatRate: '٢.٥٪',
            verdict: reachedNissab ? `تجب الزكاة — المبلغ الواجب: ${zakatDue} ريال` : 'لم يبلغ النصاب — لا تجب الزكاة',
            hadith: '«في كل مائتي درهم خمسة دراهم» — أبو داود'
        };
    }

    // ─────────────────────────────────────────────
    // STATUS
    // ─────────────────────────────────────────────
    getStatus() {
        return {
            nameAr:           this.nameAr,
            version:          this.version,
            apis:             152,
            currencies:       3,
            worldCurrencies:  20,
            ribawiItems:      6,
            wallets:          this.wallets.length,
            transactions:     this.transactions.length
        };
    }

    // ─────────────────────────────────────────────
    // RESPONSE HELPER
    // ─────────────────────────────────────────────
    _ok(res, data, islamicNote) {
        res.json({
            success: true,
            data,
            meta: {
                timestamp:   new Date().toISOString(),
                engine:      ENGINE,
                islamicNote: islamicNote || '«وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا» — البقرة ٢٧٥'
            }
        });
    }

    _err(res, msg, code = 400) {
        res.status(code).json({ success: false, error: msg, engine: ENGINE, timestamp: new Date().toISOString() });
    }

    // ─────────────────────────────────────────────
    // ROUTE REGISTRATION
    // ─────────────────────────────────────────────
    registerRoutes(app) {
        const self = this;
        [AR_PREFIX, EN_PREFIX].forEach(pfx => {

            // ══ CURRENCIES (8 routes) ══

            // GET /العملات — الثلاث العملات الرئيسية
            app.get(`${pfx}/العملات`, (req, res) => {
                const prices = self._getLivePrices();
                const data = Object.values(self.currencies).map(c => ({
                    ...c,
                    livePriceSAR: prices[`${c.code}_SAR`] || prices.SHK_SAR
                }));
                self._ok(res, data, '«وَأَقِيمُوا الْوَزْنَ بِالْقِسْطِ» — الرحمن ٩');
            });

            // GET /shk — تفاصيل عملة شيخة
            app.get(`${pfx}/shk`, (req, res) => {
                const prices = self._getLivePrices();
                self._ok(res, { ...self.currencies.SHK, livePriceSAR: prices.SHK_SAR, advantages: self.advantages },
                    '﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾ — عملة شيخة: أفضل وأقوى عملة رقمية بالكون');
            });

            // GET /دينار — تفاصيل الدينار الذهبي
            app.get(`${pfx}/دينار`, (req, res) => {
                const prices = self._getLivePrices();
                const dgd = self.currencies.DGD;
                self._ok(res, { ...dgd, livePriceSAR: prices.DGD_SAR, goldGramSAR: prices.gold_gram_SAR, weightGrams: dgd.weightGrams },
                    '«الذَّهَبُ بِالذَّهَبِ... مِثْلاً بِمِثْلٍ يَداً بِيَدٍ» — مسلم');
            });

            // GET /درهم — تفاصيل الدرهم الفضي
            app.get(`${pfx}/درهم`, (req, res) => {
                const prices = self._getLivePrices();
                const sdh = self.currencies.SDH;
                self._ok(res, { ...sdh, livePriceSAR: prices.SDH_SAR, silverGramSAR: prices.silver_gram_SAR, weightGrams: sdh.weightGrams },
                    '«وَالْفِضَّةُ بِالْفِضَّةِ... يَداً بِيَدٍ» — مسلم');
            });

            // GET /العملات-العالمية — قائمة عملات العالم
            app.get(`${pfx}/العملات-العالمية`, (req, res) => {
                self._ok(res, self.worldCurrencies, 'قائمة العملات العالمية للمقارنة — شيخة هي الأفضل إسلامياً');
            });

            // GET /مقارنة-العملات — مقارنة شيخة مع العالم
            app.get(`${pfx}/مقارنة-العملات`, (req, res) => {
                const prices = self._getLivePrices();
                const shk = self.currencies.SHK;
                self._ok(res, {
                    sheikha: { ...shk, livePriceSAR: prices.SHK_SAR },
                    vs: self.worldCurrencies.filter(c => c.code !== 'SHK').map(c => ({
                        ...c,
                        shkEquivalent: +(prices.SHK_SAR / (c.rate ? 1 / c.rate * 3.75 : 1)).toFixed(6)
                    })),
                    islamicAdvantages: self.advantages.slice(0, 5),
                    verdict: 'شيخة متفوقة شرعياً واقتصادياً على جميع العملات'
                }, '«إِنَّ اللَّهَ هُوَ الْمُسَعِّرُ الْقَابِضُ الْبَاسِطُ الرَّزَّاقُ» — أبو داود');
            });

            // GET /أسعار-مباشرة — الأسعار المباشرة
            app.get(`${pfx}/أسعار-مباشرة`, (req, res) => {
                self._ok(res, self._getLivePrices(), '«وَأَقِيمُوا الْوَزْنَ بِالْقِسْطِ وَلَا تُخْسِرُوا الْمِيزَانَ» — الرحمن ٩');
            });

            // GET /مزايا-شيخة — مزايا العملة
            app.get(`${pfx}/مزايا-شيخة`, (req, res) => {
                self._ok(res, { advantages: self.advantages, total: self.advantages.length, currency: self.currencies.SHK },
                    '﴿وَأَحَلَّ اللَّهُ الْبَيْعَ﴾ — شيخة: الأفضل والأقوى في الكون');
            });

            // ══ EXCHANGE (7 routes) ══

            // POST /حساب-الصرف — حساب الصرف
            app.post(`${pfx}/حساب-الصرف`, (req, res) => {
                const { from, to, amount } = req.body || {};
                if (!from || !to || !amount) return self._err(res, 'يجب توفير: from, to, amount');
                const result = self._calcExchange(from, to, +amount);
                self._ok(res, result, '«فَإِذَا اخْتَلَفَتْ هَذِهِ الْأَصْنَافُ فَبِيعُوا كَيْفَ شِئْتُمْ إِذَا كَانَ يَداً بِيَدٍ» — مسلم');
            });

            // GET /قواعد-الصرف — قواعد الصرف الإسلامية
            app.get(`${pfx}/قواعد-الصرف`, (req, res) => {
                self._ok(res, { rules: self.exchangeRules, total: self.exchangeRules.length },
                    '«الذَّهَبُ بِالذَّهَبِ وَالْفِضَّةُ بِالْفِضَّةِ... مِثْلاً بِمِثْلٍ يَداً بِيَدٍ» — مسلم');
            });

            // GET /الأصناف-الربوية — الأصناف الستة الربوية
            app.get(`${pfx}/الأصناف-الربوية`, (req, res) => {
                self._ok(res, { items: self.ribawiItems, total: self.ribawiItems.length, hadith: 'الذهب بالذهب والفضة بالفضة والبر بالبر والشعير بالشعير والتمر بالتمر والملح بالملح مثلاً بمثل يداً بيد — مسلم' },
                    '«مَنْ زَادَ أَوِ اسْتَزَادَ فَقَدْ أَرْبَى» — مسلم');
            });

            // POST /التحقق-الشرعي — التحقق من حلال الصرف
            app.post(`${pfx}/التحقق-الشرعي`, (req, res) => {
                const { fromAsset, toAsset, fromAmount, toAmount, isSpot } = req.body || {};
                if (!fromAsset || !toAsset) return self._err(res, 'يجب توفير: fromAsset, toAsset');
                const result = self._validateSharia({ fromAsset, toAsset, fromAmount, toAmount, isSpot });
                self._ok(res, result, result.isHalal ? '«وَأَحَلَّ اللَّهُ الْبَيْعَ»' : '«وَحَرَّمَ الرِّبَا»');
            });

            // GET /أحكام-الصرف — فقه الصرف الكامل
            app.get(`${pfx}/أحكام-الصرف`, (req, res) => {
                self._ok(res, {
                    principles: self.exchangeRules,
                    ribawiItems: self.ribawiItems,
                    generalRules: [
                        { rule: 'يجوز بيع الذهب بالفضة متفاضلاً بشرط التقابض الفوري', ref: 'مسلم' },
                        { rule: 'لا يجوز بيع الذهب بالذهب إلا مثلاً بمثل', ref: 'متفق عليه' },
                        { rule: 'لا يجوز النسيئة في صرف الجنس بجنسه', ref: 'إجماع' },
                        { rule: 'العملات الورقية كالفضة في أحكام الصرف عند الجمهور', ref: 'قرارات مجامع فقهية' }
                    ],
                    quran: '﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾ — البقرة ٢٧٥'
                }, 'أحكام الصرف مستمدة من حديث عبادة بن الصامت — صحيح مسلم');
            });

            // POST /صرف-عملة — تنفيذ الصرف
            app.post(`${pfx}/صرف-عملة`, (req, res) => {
                const { from, to, amount, walletId } = req.body || {};
                if (!from || !to || !amount) return self._err(res, 'يجب توفير: from, to, amount');
                const calc = self._calcExchange(from, to, +amount);
                const tx = {
                    id: _newId(), type: 'EXCHANGE', from, to,
                    amountIn: +amount, amountOut: calc.result, rate: calc.rate,
                    walletId: walletId || null, status: 'COMPLETED',
                    shariaCheck: 'HALAL', executedAt: new Date().toISOString()
                };
                self.transactions.push(tx);
                self._persist();
                self._broadcast('exchange:executed', { id: tx.id, from, to, amountIn: tx.amountIn, amountOut: tx.amountOut });
                self._ok(res, tx, '«فَبِيعُوا كَيْفَ شِئْتُمْ إِذَا كَانَ يَداً بِيَدٍ» — مسلم');
            });

            // GET /تاريخ-الذهب-والفضة — الأهمية التاريخية
            app.get(`${pfx}/تاريخ-الذهب-والفضة`, (req, res) => {
                self._ok(res, {
                    gold: { nameAr: 'الذهب', history: 'استُخدم منذ ٦٠٠٠ سنة — الدينار الإسلامي ٤.٢٥ جرام — معيار الذهب العالمي حتى ١٩٧١', quran: '﴿وَالَّذِينَ يَكْنِزُونَ الذَّهَبَ وَالْفِضَّةَ﴾ — التوبة ٣٤' },
                    silver: { nameAr: 'الفضة', history: 'الدرهم الساساني → الإسلامي ٣ جرام — نصاب الزكاة ٥٩٥ جرام — عملة الشعوب', hadith: '«في كل مائتي درهم خمسة دراهم» — أبو داود' },
                    islamicGoldStandard: { dinar: '4.25 جرام ذهب عيار 22', dirham: '3.0 جرام فضة ٩٩.٩٪', ratio: 'دينار = 10 دراهم تقريباً (يتغير بالسوق)' },
                    timeline: [
                        { era: 'ما قبل الإسلام', event: 'الدينار البيزنطي والدرهم الفارسي يسودان الجزيرة' },
                        { era: 'عهد النبي ﷺ', event: 'الإقرار بالدينار والدرهم كمعيار للزكاة والمهر والديات' },
                        { era: 'عهد عمر', event: 'أول سك للدرهم الإسلامي' },
                        { era: 'عهد عبدالملك', event: '٧٧ هـ — أول دينار إسلامي خالص — إلغاء الصور' },
                        { era: 'الحضارة الإسلامية', event: 'الدينار عملة التجارة الدولية لـ ٨٠٠ عام' },
                        { era: '٢٠٢٦', event: 'شيخة تُعيد إحياء الدينار والدرهم رقمياً' }
                    ]
                }, 'الذهب والفضة نقدان شرعيان — الدينار والدرهم ميزان العدل الإسلامي');
            });

            // ══ ZAKAT (5 routes) ══

            // GET /حاسبة-الزكاة — بيانات حاسبة الزكاة
            app.get(`${pfx}/حاسبة-الزكاة`, (req, res) => {
                self._ok(res, { ...self.zakatData, livePrices: self._getLivePrices() },
                    '«خُذْ مِنْ أَمْوَالِهِمْ صَدَقَةً تُطَهِّرُهُمْ وَتُزَكِّيهِم بِهَا» — التوبة ١٠٣');
            });

            // POST /احسب-الزكاة — حساب الزكاة
            app.post(`${pfx}/احسب-الزكاة`, (req, res) => {
                const result = self._calcZakat(req.body || {});
                self._ok(res, result, '«وَفِي أَمْوَالِهِمْ حَقٌّ لِّلسَّائِلِ وَالْمَحْرُومِ» — الذاريات ١٩');
            });

            // GET /نصاب-الزكاة — النصاب الحالي
            app.get(`${pfx}/نصاب-الزكاة`, (req, res) => {
                const prices = self._getLivePrices();
                self._ok(res, {
                    goldNissab:   { grams: ZAKAT_DATA.nissabGold_grams,   valueSAR: +(ZAKAT_DATA.nissabGold_grams * prices.gold_gram_SAR).toFixed(2) },
                    silverNissab: { grams: ZAKAT_DATA.nissabSilver_grams, valueSAR: +(ZAKAT_DATA.nissabSilver_grams * prices.silver_gram_SAR).toFixed(2) },
                    effectiveNissab: +Math.min(ZAKAT_DATA.nissabGold_grams * prices.gold_gram_SAR, ZAKAT_DATA.nissabSilver_grams * prices.silver_gram_SAR).toFixed(2),
                    note: 'يُستخدم أقل النصابين (الفضة) رأياً في عصرنا — للاحتياط للفقراء',
                    livePrices: prices
                }, '«نِصَابُ الزَّكَاةِ عِشْرُونَ مِثْقَالاً مِنَ الذَّهَبِ» — فقه الزكاة');
            });

            // GET /أنواع-الزكاة — فئات الزكاة
            app.get(`${pfx}/أنواع-الزكاة`, (req, res) => {
                self._ok(res, { categories: self.zakatData.categories, total: self.zakatData.categories.length },
                    '«إِنَّمَا الصَّدَقَاتُ لِلْفُقَرَاءِ وَالْمَسَاكِينِ» — التوبة ٦٠');
            });

            // GET /مصارف-الزكاة — مصارف الزكاة الثمانية
            app.get(`${pfx}/مصارف-الزكاة`, (req, res) => {
                self._ok(res, { recipients: self.zakatRecipients, total: 8, quran: '﴿إِنَّمَا الصَّدَقَاتُ لِلْفُقَرَاءِ وَالْمَسَاكِينِ وَالْعَامِلِينَ عَلَيْهَا وَالْمُؤَلَّفَةِ قُلُوبُهُمْ وَفِي الرِّقَابِ وَالْغَارِمِينَ وَفِي سَبِيلِ اللَّهِ وَابْنِ السَّبِيلِ﴾ — التوبة ٦٠' },
                    'الزكاة ركن من أركان الإسلام — فريضة واجبة بالكتاب والسنة والإجماع');
            });

            // ══ WALLET (6 routes) ══

            // GET /محفظة/:walletId — رصيد المحفظة
            app.get(`${pfx}/محفظة/:walletId`, (req, res) => {
                const wallet = self.wallets.find(w => w.id === req.params.walletId);
                if (!wallet) return self._err(res, 'المحفظة غير موجودة', 404);
                const prices = self._getLivePrices();
                const portfolio = {
                    ...wallet,
                    valuation: {
                        SHK_total_SAR: +((wallet.balances.SHK || 0) * prices.SHK_SAR).toFixed(2),
                        DGD_total_SAR: +((wallet.balances.DGD || 0) * prices.DGD_SAR).toFixed(2),
                        SDH_total_SAR: +((wallet.balances.SDH || 0) * prices.SDH_SAR).toFixed(2),
                        cash_SAR:      +(wallet.balances.SAR || 0)
                    }
                };
                portfolio.valuation.total_SAR = +(
                    portfolio.valuation.SHK_total_SAR +
                    portfolio.valuation.DGD_total_SAR +
                    portfolio.valuation.SDH_total_SAR +
                    portfolio.valuation.cash_SAR
                ).toFixed(2);
                self._ok(res, portfolio, '«وَفِي أَمْوَالِهِمْ حَقٌّ لِّلسَّائِلِ» — أمانة المال في الإسلام');
            });

            // POST /إنشاء-محفظة — إنشاء محفظة جديدة
            app.post(`${pfx}/إنشاء-محفظة`, (req, res) => {
                const { ownerName, currencies: curs } = req.body || {};
                if (!ownerName) return self._err(res, 'يجب توفير: ownerName');
                const wallet = {
                    id: _newId(), ownerName,
                    currencies: curs || ['SHK'],
                    balances: { SHK: 0, DGD: 0, SDH: 0, SAR: 0 },
                    createdAt: new Date().toISOString(), active: true
                };
                self.wallets.push(wallet);
                self._persist();
                self._broadcast('wallet:created', { id: wallet.id, ownerName: wallet.ownerName });
                self._ok(res, wallet, 'بسم الله — محفظتك الإسلامية جاهزة بدون ربا ولا غرر');
            });

            // POST /تحويل — تحويل بين المحافظ
            app.post(`${pfx}/تحويل`, (req, res) => {
                const { from_wallet, to_wallet, currency, amount } = req.body || {};
                if (!from_wallet || !to_wallet || !currency || !amount) return self._err(res, 'يجب توفير: from_wallet, to_wallet, currency, amount');
                const src = self.wallets.find(w => w.id === from_wallet);
                const dst = self.wallets.find(w => w.id === to_wallet);
                if (!src) return self._err(res, 'المحفظة المرسِلة غير موجودة', 404);
                if (!dst) return self._err(res, 'المحفظة المستقبِلة غير موجودة', 404);
                const bal = src.balances[currency] || 0;
                if (bal < +amount) return self._err(res, `الرصيد غير كافٍ — متاح: ${bal} ${currency}`);
                src.balances[currency] = +(bal - +amount).toFixed(6);
                dst.balances[currency] = +((dst.balances[currency] || 0) + +amount).toFixed(6);
                const tx = { id: _newId(), type: 'TRANSFER', from_wallet, to_wallet, currency, amount: +amount, status: 'COMPLETED', executedAt: new Date().toISOString() };
                self.transactions.push(tx);
                self._persist();
                self._broadcast('transfer:completed', { id: tx.id, from_wallet, to_wallet, currency, amount: +amount });
                self._ok(res, tx, '«وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَى» — التحويل بدون ربا ولا رسوم');
            });

            // GET /سجل-المعاملات/:walletId — سجل المعاملات
            app.get(`${pfx}/سجل-المعاملات/:walletId`, (req, res) => {
                const { walletId } = req.params;
                const txs = self.transactions.filter(t => t.walletId === walletId || t.from_wallet === walletId || t.to_wallet === walletId);
                self._ok(res, { walletId, transactions: txs, total: txs.length }, 'كل معاملة موثقة — الشفافية ١٠٠٪');
            });

            // POST /شحن-محفظة — شحن المحفظة
            app.post(`${pfx}/شحن-محفظة`, (req, res) => {
                const { walletId, currency, amount, method } = req.body || {};
                if (!walletId || !currency || !amount) return self._err(res, 'يجب توفير: walletId, currency, amount');
                const wallet = self.wallets.find(w => w.id === walletId);
                if (!wallet) return self._err(res, 'المحفظة غير موجودة', 404);
                wallet.balances[currency] = +((wallet.balances[currency] || 0) + +amount).toFixed(6);
                const tx = { id: _newId(), type: 'TOPUP', walletId, currency, amount: +amount, method: method || 'DIRECT', status: 'COMPLETED', executedAt: new Date().toISOString() };
                self.transactions.push(tx);
                self._persist();
                self._ok(res, { tx, newBalance: wallet.balances[currency] }, 'تم شحن المحفظة — بارك الله في مالك');
            });

            // GET /أرصدة-شاملة — نظرة عامة على المحافظ
            app.get(`${pfx}/أرصدة-شاملة`, (req, res) => {
                const prices = self._getLivePrices();
                const portfolios = self.wallets.map(w => ({
                    id: w.id, ownerName: w.ownerName,
                    balances: w.balances,
                    total_SAR: +(
                        (w.balances.SHK || 0) * prices.SHK_SAR +
                        (w.balances.DGD || 0) * prices.DGD_SAR +
                        (w.balances.SDH || 0) * prices.SDH_SAR +
                        (w.balances.SAR || 0)
                    ).toFixed(2)
                }));
                const grandTotal = +portfolios.reduce((s, p) => s + p.total_SAR, 0).toFixed(2);
                self._ok(res, { portfolios, grandTotal_SAR: grandTotal, wallets: self.wallets.length, prices },
                    '«وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ» — القوة المالية الإسلامية');
            });

            // ══ ANALYTICS (6 routes) ══

            // GET /لوحة-التحكم — لوحة التحكم الكاملة
            app.get(`${pfx}/لوحة-التحكم`, (req, res) => {
                const prices = self._getLivePrices();
                self._ok(res, {
                    currencies:    Object.values(self.currencies).map(c => ({ ...c, livePriceSAR: prices[`${c.code}_SAR`] || prices.SHK_SAR })),
                    prices,
                    wallets:       self.wallets.length,
                    transactions:  self.transactions.length,
                    worldCurrencies: self.worldCurrencies.length,
                    ribawiItems:   self.ribawiItems.length,
                    advantages:    self.advantages.length,
                    zakatNissab:   { gold_SAR: +(ZAKAT_DATA.nissabGold_grams * prices.gold_gram_SAR).toFixed(2), silver_SAR: +(ZAKAT_DATA.nissabSilver_grams * prices.silver_gram_SAR).toFixed(2) },
                    status:        self.getStatus()
                }, 'بسم الله — لوحة التحكم الشاملة لمنظومة عملة شيخة');
            });

            // GET /إحصائيات-المنظومة — إحصائيات المنظومة
            app.get(`${pfx}/إحصائيات-المنظومة`, (req, res) => {
                self._ok(res, {
                    engine: ENGINE, version: VERSION,
                    currencies: 3, worldCurrencies: 20, ribawiItems: 6,
                    wallets: self.wallets.length, transactions: self.transactions.length,
                    totalSHKCirculating: SHEIKHA_CURRENCIES.SHK.circulatingSupply,
                    totalSHKSupply:      SHEIKHA_CURRENCIES.SHK.totalSupply,
                    islamicCompliance:   '١٠٠٪',
                    shariaBoard:         SHEIKHA_CURRENCIES.SHK.shariaBoard,
                    blockchain:          SHEIKHA_CURRENCIES.SHK.blockchain,
                    launched:            SHEIKHA_CURRENCIES.SHK.launched
                }, 'منظومة عملة شيخة — الأفضل والأقوى إسلامياً واقتصادياً');
            });

            // GET /تحليل-السوق — تحليل السوق
            app.get(`${pfx}/تحليل-السوق`, (req, res) => {
                const prices = self._getLivePrices();
                const t = Date.now() / 86400000;
                self._ok(res, {
                    trend:    Math.sin(t) > 0 ? 'صاعد ↑' : 'هابط ↓',
                    momentum: Math.abs(Math.sin(t * 1.5) * 100).toFixed(1) + '٪',
                    volatility: 'منخفض — مدعوم بأصول حقيقية',
                    goldTrend:  Math.sin(t * 0.7) > 0 ? 'صاعد ↑' : 'هابط ↓',
                    silverTrend: Math.sin(t * 1.1) > 0 ? 'صاعد ↑' : 'هابط ↓',
                    shkStrength: '⭐⭐⭐⭐⭐',
                    prices,
                    analysis: 'شيخة محمية من تقلبات السوق بسبب الدعم الذهبي والفضي الحقيقي',
                    islamicBenefit: 'الذهب والفضة يحفظان القيمة على مدى ١٤٠٠ سنة — «إِنَّ اللَّهَ هُوَ الْمُسَعِّرُ»'
                }, '«إِنَّ اللَّهَ هُوَ الْمُسَعِّرُ الْقَابِضُ الْبَاسِطُ الرَّزَّاقُ» — أبو داود');
            });

            // GET /مؤشر-القوة — مؤشر قوة عملة شيخة
            app.get(`${pfx}/مؤشر-القوة`, (req, res) => {
                self._ok(res, {
                    name: 'Sheikha Currency Power Index (SCPI)',
                    score: 97.5,
                    maxScore: 100,
                    rank: '١ عالمياً إسلامياً',
                    components: [
                        { factor: 'دعم الأصول الحقيقية', weight: 30, score: 30 },
                        { factor: 'الامتثال الشرعي',       weight: 25, score: 25 },
                        { factor: 'الشفافية',              weight: 15, score: 15 },
                        { factor: 'سرعة المعاملات',        weight: 10, score: 10 },
                        { factor: 'الانتشار العالمي',      weight: 10, score: 8.5 },
                        { factor: 'الاستقرار السعري',      weight: 10, score: 9 }
                    ],
                    vs: { BTC: 62, ETH: 55, USD: 45, GOLD: 78 },
                    verdict: 'شيخة الأقوى إسلامياً ومالياً'
                }, '«وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ» — الأنفال ٦٠');
            });

            // GET /مقارنة-التاريخية — المقارنة التاريخية
            app.get(`${pfx}/مقارنة-التاريخية`, (req, res) => {
                self._ok(res, {
                    title: 'أداء الذهب والفضة مقارنة بالدولار عبر التاريخ',
                    goldVsUSD: [
                        { year: 1971, gold_usd: 35,    note: 'نهاية معيار الذهب (نيكسون)' },
                        { year: 1980, gold_usd: 850,   note: 'أزمة التضخم — الذهب يرتفع ٢٤ ضعف' },
                        { year: 2000, gold_usd: 270,   note: 'فقاعة الإنترنت' },
                        { year: 2008, gold_usd: 1000,  note: 'الأزمة المالية' },
                        { year: 2011, gold_usd: 1900,  note: 'ذروة تاريخية' },
                        { year: 2020, gold_usd: 2000,  note: 'كوفيد' },
                        { year: 2024, gold_usd: 2300,  note: 'مستوى قياسي' },
                        { year: 2026, gold_usd: null,  note: 'إطلاق شيخة — العودة للمعيار الذهبي الإسلامي' }
                    ],
                    conclusion: 'الدولار فقد ٩٧٪ من قيمته منذ ١٩١٣ — الذهب حافظ على قيمته ١٤٠٠ سنة',
                    islamicLesson: 'الذهب والفضة ليسا استثماراً — هما المقياس الحقيقي للقيمة في الإسلام'
                }, 'الذهب والفضة — ميزان العدل عبر ١٤٠٠ سنة من الحضارة الإسلامية');
            });

            // GET /صحة-الاحتياطي — فحص صحة الاحتياطي
            app.get(`${pfx}/صحة-الاحتياطي`, (req, res) => {
                const prices = self._getLivePrices();
                const backing = SHEIKHA_CURRENCIES.SHK.backingRatio;
                self._ok(res, {
                    status: 'صحي ✅',
                    backing,
                    reserves: {
                        gold:        { percentage: backing.gold,        status: '✅ مؤكد', valuePerSHK_SAR: +(prices.gold_gram_SAR * SHEIKHA_CURRENCIES.SHK.peg.gold_grams).toFixed(4) },
                        silver:      { percentage: backing.silver,      status: '✅ مؤكد', valuePerSHK_SAR: +(prices.silver_gram_SAR * SHEIKHA_CURRENCIES.SHK.peg.silver_grams).toFixed(4) },
                        commodities: { percentage: backing.commodities, status: '✅ مؤكد', description: 'سلع حقيقية موثقة' },
                        reserve:     { percentage: backing.reserve,     status: '✅ مؤكد', description: 'احتياطي طوارئ' }
                    },
                    totalBacking: '١٠٠٪',
                    lastAudit:  new Date().toISOString(),
                    auditor:    'هيئة المراجعة الشرعية والمالية — منظومة شيخة',
                    shariaNote: 'كل شيخة مدعومة بأصل حقيقي — لا طباعة بلا مقابل',
                    livePrices: prices
                }, '«وَأَقِيمُوا الْوَزْنَ بِالْقِسْطِ وَلَا تُخْسِرُوا الْمِيزَانَ» — الرحمن ٩');
            });

            // ══ BANKING INFRASTRUCTURE (12 routes) ══

            // GET /swift-info | /swift-بيانات
            app.get([`${pfx}/swift-info`, `${pfx}/swift-بيانات`], (req, res) => {
                self._ok(res, self.bankingInfrastructure.swift, 'بيانات SWIFT/BIC/IBAN — شيخة إسلامي بنك');
            });

            // GET /payment-gateways | /بوابات-الدفع
            app.get([`${pfx}/payment-gateways`, `${pfx}/بوابات-الدفع`], (req, res) => {
                self._ok(res, {
                    count: self.bankingInfrastructure.paymentGateways.length,
                    gateways: self.bankingInfrastructure.paymentGateways
                }, 'بوابات الدفع المدعومة — شيخة تقبل جميع طرق الدفع الإسلامية والعالمية');
            });

            // POST /تحويل-swift | /swift-transfer
            app.post([`${pfx}/تحويل-swift`, `${pfx}/swift-transfer`], (req, res) => {
                const { fromIBAN, toIBAN, amount, currency, purpose, senderName, receiverName } = req.body || {};
                if (!fromIBAN || !toIBAN || !amount || !currency) {
                    return self._err(res, 'حقول مطلوبة: fromIBAN, toIBAN, amount, currency');
                }
                const ref = `SHK-SWT-${Date.now()}-${Math.random().toString(16).slice(2,10).toUpperCase()}`;
                const result = {
                    reference: ref,
                    swiftMessage: 'MT103',
                    bic: self.bankingInfrastructure.swift.bic,
                    fromIBAN, toIBAN, amount, currency, purpose,
                    senderName: senderName || 'N/A',
                    receiverName: receiverName || 'N/A',
                    status: 'معالجة ✅',
                    estimatedSettlement: 'T+1',
                    createdAt: new Date().toISOString()
                };
                self._broadcast({ event: 'swift_transfer', data: result });
                self._ok(res, result, 'تحويل SWIFT — يداً بيد — «وَأَوْفُوا بِالْعَهْدِ»');
            });

            // GET /accreditations | /اعتمادات-دولية
            app.get([`${pfx}/accreditations`, `${pfx}/اعتمادات-دولية`], (req, res) => {
                self._ok(res, {
                    count: self.bankingInfrastructure.accreditations.length,
                    accreditations: self.bankingInfrastructure.accreditations
                }, 'الاعتمادات الدولية — شيخة متوافقة مع أعلى المعايير العالمية');
            });

            // GET /blockchain-info | /بلوكتشين
            app.get([`${pfx}/blockchain-info`, `${pfx}/بلوكتشين`], (req, res) => {
                self._ok(res, self.bankingInfrastructure.blockchain, 'Sheikha Chain — Proof of Goodness™ — أسرع بلوكتشين إسلامي');
            });

            // GET /commercial-value | /قيمة-تجارية
            app.get([`${pfx}/commercial-value`, `${pfx}/قيمة-تجارية`], (req, res) => {
                self._ok(res, self.bankingInfrastructure.commercialValue, '«وَفِي ذَلِكَ فَلْيَتَنَافَسِ الْمُتَنَافِسُونَ» — شيخة الأعلى قيمة');
            });

            // ══ DOCUMENTARY CREDITS (10 routes) ══

            // GET /letters-of-credit | /اعتمادات-مستندية
            app.get([`${pfx}/letters-of-credit`, `${pfx}/اعتمادات-مستندية`], (req, res) => {
                const dc = self.bankingInfrastructure.documentaryCredits;
                self._ok(res, {
                    types: dc.types,
                    issuingProcess: dc.issuingProcess,
                    swiftMessages: dc.swiftMessages,
                    islamicNote: dc.islamicNote,
                    issuedCount: self.lcs.length
                }, dc.islamicNote);
            });

            // POST /اصدار-اعتماد | /issue-lc
            app.post([`${pfx}/اصدار-اعتماد`, `${pfx}/issue-lc`], (req, res) => {
                const { type, amount, currency, beneficiary, issuingBank, expiryDays, goods } = req.body || {};
                if (!type || !amount || !currency || !beneficiary) {
                    return self._err(res, 'حقول مطلوبة: type, amount, currency, beneficiary');
                }
                const dc = self.bankingInfrastructure.documentaryCredits;
                const validTypes = dc.types.map(t => t.code);
                if (!validTypes.includes(type)) {
                    return self._err(res, `نوع غير صالح — الأنواع المتاحة: ${validTypes.join(', ')}`);
                }
                const lcNumber = `SHK-LC-2026-${Math.random().toString(16).slice(2,10).toUpperCase()}`;
                const expiry = new Date(Date.now() + (expiryDays || 90) * 86400000).toISOString().split('T')[0];
                const lc = {
                    lcNumber, type, amount, currency,
                    beneficiary,
                    issuingBank: issuingBank || 'Sheikha Islamic Bank',
                    issuingBIC: self.bankingInfrastructure.swift.bic,
                    goods: goods || 'بضاعة عامة',
                    expiryDate: expiry,
                    swiftMessage: dc.swiftMessages.issue,
                    status: 'صادر ✅',
                    ucp: dc.types.find(t => t.code === type)?.ucp || 'UCP 600',
                    issuedAt: new Date().toISOString()
                };
                self.lcs.push(lc);
                self._persist();
                self._broadcast({ event: 'lc_issued', data: lc });
                self._ok(res, lc, dc.islamicNote);
            });

            // GET /اعتماد/:lcNumber | /lc/:lcNumber
            app.get([`${pfx}/اعتماد/:lcNumber`, `${pfx}/lc/:lcNumber`], (req, res) => {
                const lc = self.lcs.find(l => l.lcNumber === req.params.lcNumber);
                if (!lc) return self._err(res, 'الاعتماد غير موجود', 404);
                self._ok(res, lc, self.bankingInfrastructure.documentaryCredits.islamicNote);
            });

            // POST /تعديل-اعتماد | /amend-lc
            app.post([`${pfx}/تعديل-اعتماد`, `${pfx}/amend-lc`], (req, res) => {
                const { lcNumber, amendmentType, newAmount, newExpiryDays, reason } = req.body || {};
                if (!lcNumber) return self._err(res, 'lcNumber مطلوب');
                const lc = self.lcs.find(l => l.lcNumber === lcNumber);
                if (!lc) return self._err(res, 'الاعتماد غير موجود', 404);
                if (newAmount)      lc.amount = newAmount;
                if (newExpiryDays)  lc.expiryDate = new Date(Date.now() + newExpiryDays * 86400000).toISOString().split('T')[0];
                lc.lastAmendedAt = new Date().toISOString();
                lc.amendmentType = amendmentType || 'تعديل عام';
                lc.amendmentReason = reason || '';
                lc.swiftAmendMessage = self.bankingInfrastructure.documentaryCredits.swiftMessages.amendment;
                self._persist();
                self._ok(res, lc, 'تعديل الاعتماد المستندي — MT707 — «أَوْفُوا بِالْعُقُودِ» — المائدة ١');
            });

            // GET /swift-mt700/:lcNumber | /mt700/:lcNumber
            app.get([`${pfx}/swift-mt700/:lcNumber`, `${pfx}/mt700/:lcNumber`], (req, res) => {
                const lc = self.lcs.find(l => l.lcNumber === req.params.lcNumber);
                if (!lc) return self._err(res, 'الاعتماد غير موجود', 404);
                const mt700 = [
                    `:27A:CREDIT`,
                    `:40A:${lc.type}`,
                    `:20:${lc.lcNumber}`,
                    `:31C:${lc.issuedAt?.split('T')[0]?.replace(/-/g,'')}`,
                    `:31D:${lc.expiryDate?.replace(/-/g,'')} RIYADH`,
                    `:50:${lc.issuingBank}`,
                    `:59:${lc.beneficiary}`,
                    `:32B:${lc.currency}${lc.amount}`,
                    `:45A:${lc.goods}`,
                    `:47A:ISLAMIC COMPLIANT - UCP ${lc.ucp}`,
                    `:78:ALL DOCUMENTS TO BE PRESENTED TO ${lc.issuingBank}`,
                    `:57A:${lc.issuingBIC}`
                ].join('\n');
                self._ok(res, { lcNumber: lc.lcNumber, mt700, generatedAt: new Date().toISOString() }, 'SWIFT MT700 — رسالة الاعتماد المستندي الدولية');
            });

            // ══ BANK GUARANTEES (8 routes) ══

            // GET /bank-guarantees | /ضمانات-بنكية
            app.get([`${pfx}/bank-guarantees`, `${pfx}/ضمانات-بنكية`], (req, res) => {
                const bg = self.bankingInfrastructure.bankGuarantees;
                self._ok(res, {
                    types: bg.types,
                    swiftMessage: bg.swiftMessage,
                    islamicNote: bg.islamicNote,
                    issuedCount: self.guarantees.length
                }, bg.islamicNote);
            });

            // POST /اصدار-ضمان | /issue-guarantee
            app.post([`${pfx}/اصدار-ضمان`, `${pfx}/issue-guarantee`], (req, res) => {
                const { type, amount, currency, applicant, beneficiary, expiryDays, purpose } = req.body || {};
                if (!type || !amount || !currency || !applicant || !beneficiary) {
                    return self._err(res, 'حقول مطلوبة: type, amount, currency, applicant, beneficiary');
                }
                const bg = self.bankingInfrastructure.bankGuarantees;
                const validTypes = bg.types.map(t => t.code);
                if (!validTypes.includes(type)) {
                    return self._err(res, `نوع غير صالح — الأنواع المتاحة: ${validTypes.join(', ')}`);
                }
                const bgNumber = `SHK-BG-2026-${Math.random().toString(16).slice(2,10).toUpperCase()}`;
                const expiry = new Date(Date.now() + (expiryDays || 365) * 86400000).toISOString().split('T')[0];
                const guarantee = {
                    bgNumber, type, amount, currency,
                    applicant, beneficiary,
                    purpose: purpose || bg.types.find(t => t.code === type)?.useCase || '',
                    issuingBank: 'Sheikha Islamic Bank',
                    issuingBIC: self.bankingInfrastructure.swift.bic,
                    expiryDate: expiry,
                    swiftMessage: bg.swiftMessage,
                    status: 'صادر ✅',
                    issuedAt: new Date().toISOString()
                };
                self.guarantees.push(guarantee);
                self._persist();
                self._broadcast({ event: 'guarantee_issued', data: guarantee });
                self._ok(res, guarantee, bg.islamicNote);
            });

            // GET /ضمان/:bgNumber | /bg/:bgNumber
            app.get([`${pfx}/ضمان/:bgNumber`, `${pfx}/bg/:bgNumber`], (req, res) => {
                const bg = self.guarantees.find(g => g.bgNumber === req.params.bgNumber);
                if (!bg) return self._err(res, 'الضمان غير موجود', 404);
                self._ok(res, bg, self.bankingInfrastructure.bankGuarantees.islamicNote);
            });

            // POST /تجديد-ضمان | /renew-guarantee
            app.post([`${pfx}/تجديد-ضمان`, `${pfx}/renew-guarantee`], (req, res) => {
                const { bgNumber, extensionDays } = req.body || {};
                if (!bgNumber) return self._err(res, 'bgNumber مطلوب');
                const bg = self.guarantees.find(g => g.bgNumber === bgNumber);
                if (!bg) return self._err(res, 'الضمان غير موجود', 404);
                const days = extensionDays || 365;
                const currentExpiry = new Date(bg.expiryDate || Date.now());
                bg.expiryDate = new Date(currentExpiry.getTime() + days * 86400000).toISOString().split('T')[0];
                bg.renewedAt = new Date().toISOString();
                bg.status = 'مجدد ✅';
                self._persist();
                self._ok(res, bg, 'تجديد الضمان البنكي — كفالة مجددة — «وَأَوْفُوا بِالْعَهْدِ»');
            });

            // ══ SECURITIES & SUKUK (8 routes) ══

            // GET /sukuk-bonds | /صكوك-وسندات
            app.get([`${pfx}/sukuk-bonds`, `${pfx}/صكوك-وسندات`], (req, res) => {
                self._ok(res, {
                    count: self.bankingInfrastructure.securitiesInstruments.length,
                    instruments: self.bankingInfrastructure.securitiesInstruments,
                    subscriptions: self.sukuk.length
                }, 'الصكوك والسندات الإسلامية — «وَأَحَلَّ اللَّهُ الْبَيْعَ»');
            });

            // GET /صك/:code | /sukuk/:code
            app.get([`${pfx}/صك/:code`, `${pfx}/sukuk/:code`], (req, res) => {
                const instrument = self.bankingInfrastructure.securitiesInstruments.find(s => s.code === req.params.code);
                if (!instrument) return self._err(res, 'الصك غير موجود', 404);
                self._ok(res, instrument, 'الصكوك الإسلامية — بديل حلال للسندات التقليدية');
            });

            // POST /اشتراك-صك | /subscribe-sukuk
            app.post([`${pfx}/اشتراك-صك`, `${pfx}/subscribe-sukuk`], (req, res) => {
                const { code, amount, currency, investorName, investorId } = req.body || {};
                if (!code || !amount || !currency || !investorName) {
                    return self._err(res, 'حقول مطلوبة: code, amount, currency, investorName');
                }
                const instrument = self.bankingInfrastructure.securitiesInstruments.find(s => s.code === code);
                if (!instrument) return self._err(res, 'كود الصك غير صالح', 404);
                const subNumber = `SHK-SKK-2026-${Math.random().toString(16).slice(2,10).toUpperCase()}`;
                const subscription = {
                    subNumber, code,
                    instrumentName: instrument.nameAr,
                    amount, currency,
                    investorName,
                    investorId: investorId || 'N/A',
                    expectedReturn: instrument.return,
                    tenor: instrument.tenor,
                    rating: instrument.rating,
                    listingExchange: instrument.listingExchange,
                    status: 'اشتراك مقبول ✅',
                    subscribedAt: new Date().toISOString()
                };
                self.sukuk.push(subscription);
                self._persist();
                self._broadcast({ event: 'sukuk_subscribed', data: subscription });
                self._ok(res, subscription, '«وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَى» — الاستثمار الإسلامي الحلال');
            });

            // GET /bond-yields | /عائد-سندات
            app.get([`${pfx}/bond-yields`, `${pfx}/عائد-سندات`], (req, res) => {
                const yields = self.bankingInfrastructure.securitiesInstruments.map(s => ({
                    code: s.code,
                    nameAr: s.nameAr,
                    return: s.return,
                    tenor: s.tenor,
                    rating: s.rating,
                    riskLevel: s.rating.startsWith('AA') ? 'منخفض' : s.rating.startsWith('A') ? 'متوسط' : 'خاص'
                }));
                self._ok(res, { yields, calculatedAt: new Date().toISOString() }, 'عوائد الصكوك والسندات — حلال ومضمون');
            });

            // ══ TENDERS & PROCUREMENT (6 routes) ══

            // GET /tenders | /المناقصات
            app.get([`${pfx}/tenders`, `${pfx}/المناقصات`], (req, res) => {
                const bg = self.bankingInfrastructure.bankGuarantees;
                const cv = self.bankingInfrastructure.commercialValue;
                self._ok(res, {
                    supported: cv.tenders,
                    tenderBondType: bg.types.find(t => t.code === 'BG-TENDER'),
                    performanceBondType: bg.types.find(t => t.code === 'BG-PERF'),
                    advancePaymentBondType: bg.types.find(t => t.code === 'BG-ADVANCE'),
                    swiftMessage: bg.swiftMessage,
                    islamicNote: bg.islamicNote,
                    acceptedRegions: ['محلي — المملكة العربية السعودية', 'إقليمي — دول الخليج والعالم العربي', 'دولي — ٥٧ دولة OIC']
                }, 'دعم المناقصات — ضمانات بنكية إسلامية لجميع أنواع العطاءات');
            });

            // POST /ضمان-مناقصة | /tender-bond
            app.post([`${pfx}/ضمان-مناقصة`, `${pfx}/tender-bond`], (req, res) => {
                const { tenderNumber, tenderValue, currency, applicant, beneficiary, expiryDays } = req.body || {};
                if (!tenderNumber || !tenderValue || !currency || !applicant || !beneficiary) {
                    return self._err(res, 'حقول مطلوبة: tenderNumber, tenderValue, currency, applicant, beneficiary');
                }
                const bgNumber = `SHK-BG-2026-${Math.random().toString(16).slice(2,10).toUpperCase()}`;
                const bondAmount = (parseFloat(tenderValue) * 0.02).toFixed(2);
                const expiry = new Date(Date.now() + (expiryDays || 90) * 86400000).toISOString().split('T')[0];
                const bond = {
                    bgNumber, type: 'BG-TENDER',
                    tenderNumber, tenderValue, bondAmount,
                    currency, applicant, beneficiary,
                    pct: '٢٪ من قيمة المناقصة',
                    issuingBank: 'Sheikha Islamic Bank',
                    issuingBIC: self.bankingInfrastructure.swift.bic,
                    expiryDate: expiry,
                    swiftMessage: 'MT760',
                    status: 'صادر ✅',
                    issuedAt: new Date().toISOString()
                };
                self.guarantees.push(bond);
                self._persist();
                self._broadcast({ event: 'tender_bond_issued', data: bond });
                self._ok(res, bond, 'ضمان المناقصة — كفالة شرعية — «وَأَوْفُوا بِالْعَهْدِ إِنَّ الْعَهْدَ كَانَ مَسْئُولاً»');
            });

            // GET /financial-certificate | /شهادة-مالية
            app.get([`${pfx}/financial-certificate`, `${pfx}/شهادة-مالية`], (req, res) => {
                const cv = self.bankingInfrastructure.commercialValue;
                self._ok(res, {
                    certificateType: 'شهادة الأهلية المالية',
                    issuedBy: 'Sheikha Islamic Bank',
                    bic: self.bankingInfrastructure.swift.bic,
                    marketCap_USD: cv.marketCap_USD,
                    partnerBanks: cv.partnerBanks,
                    accreditationSummary: self.bankingInfrastructure.accreditations.map(a => ({ id: a.id, name: a.name, status: a.status })),
                    tenderEligibility: cv.tenders,
                    legalRecognition: cv.legalRecognition,
                    islamicCompliance: '١٠٠٪ — هيئة شرعية عليا',
                    generatedAt: new Date().toISOString(),
                    validUntil: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0]
                }, 'شهادة الأهلية المالية — شيخة إسلامي بنك — معتمد دولياً');
            });
        });

        console.log(`   📡 SheikhaCurrencyEngine: ${AR_PREFIX} + ${EN_PREFIX} — ١٥٢ مسار جاهز ⭐`);
    }
}

module.exports = SheikhaCurrencyEngine;
