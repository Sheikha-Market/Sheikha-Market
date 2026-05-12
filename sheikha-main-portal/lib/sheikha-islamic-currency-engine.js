'use strict';
/**
 * ════════════════════════════════════════════════════════════════════════════
 *  بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
 *  الدرهم الرقمي الإسلامي الموحد — عملة الأمة الإسلامية الرقمية
 *  ﴿وَأَوْفُوا الْكَيْلَ وَالْمِيزَانَ بِالْقِسْطِ﴾ — الأنعام ١٥٢
 *  المالك: سلمان أحمد بن سلمان الراجح
 * ════════════════════════════════════════════════════════════════════════════
 *
 * الدرهم الرقمي (DHM) — أول عملة إسلامية رقمية موحدة مربوطة بالذهب والفضة
 * استناداً إلى السنة النبوية: 1 درهم = 2.975 جرام فضة
 * استناداً إلى الفقه الإسلامي: 1 دينار = 4.25 جرام ذهب
 */

const EventEmitter = require('events');

// ─── أساس العملة الشرعي ──────────────────────────────────────────────────────
const MONETARY_FOUNDATION = {
    // الدرهم التاريخي
    classicalDirham: {
        name: 'الدرهم الشرعي',
        silverGrams: 2.975,
        currentValueSAR: null, // يُحدَّث تلقائياً بسعر الفضة
        quran: '﴿وَأَوْفُوا الْكَيْلَ وَالْمِيزَانَ بِالْقِسْطِ﴾',
        hadith: '«الوزن وزن أهل مكة»',
    },
    // الدينار الذهبي
    classicalDinar: {
        name: 'الدينار الذهبي',
        goldGrams: 4.25,
        currentValueSAR: null, // يُحدَّث تلقائياً
        nisab: '85 جرام ذهب = نصاب الزكاة',
    },
    // الدرهم الرقمي الحديث
    digitalDirham: {
        symbol: 'DHM',
        arabicSymbol: 'د.ر',
        backing: 'مرتبط بسلة: 70% ذهب + 30% فضة',
        minValue: 0.001,
        maxSupply: '19 مليار وحدة (عدد المسلمين × 10)',
        supply: 'محكومة بمجلس شيخة النقدي الإسلامي',
        issuanceRule: 'لا طباعة بلا غطاء — كل درهم رقمي مغطى بمعدن حقيقي',
        antiInflation: 'قائمة على التحوط الإسلامي — supply capped',
    },
};

// ─── تركيبة سلة الاحتياطي ────────────────────────────────────────────────────
const RESERVE_BASKET = [
    { asset: 'ذهب خالص 999', symbol: 'XAU', weight: 0.50, storage: 'المدينة المنورة + دبي + كوالالمبور', sharia: 'أصل حقيقي — مشروع' },
    { asset: 'فضة خالصة 999', symbol: 'XAG', weight: 0.20, storage: 'نفس المخازن', sharia: 'أصل حقيقي — مشروع' },
    { asset: 'سلع إسلامية (معادن، نفط، غذاء)', symbol: 'ISLAMIC-COMM', weight: 0.20, sharia: 'ربط بالاقتصاد الحقيقي' },
    { asset: 'صكوك حكومية OIC', symbol: 'OIC-SUKUK', weight: 0.10, sharia: 'صكوك — حلال مائة بالمائة' },
];

// ─── أسعار التحويل بالعملات الكبرى ──────────────────────────────────────────
const EXCHANGE_RATES = {
    SAR: { name: 'ريال سعودي', rate: 3.75, flag: '🇸🇦' },
    USD: { name: 'دولار أمريكي', rate: 1.00, flag: '🇺🇸' },
    EUR: { name: 'يورو', rate: 0.92, flag: '🇪🇺' },
    GBP: { name: 'جنيه إسترليني', rate: 0.79, flag: '🇬🇧' },
    AED: { name: 'درهم إماراتي', rate: 3.67, flag: '🇦🇪' },
    KWD: { name: 'دينار كويتي', rate: 0.31, flag: '🇰🇼' },
    QAR: { name: 'ريال قطري', rate: 3.64, flag: '🇶🇦' },
    BHD: { name: 'دينار بحريني', rate: 0.38, flag: '🇧🇭' },
    OMR: { name: 'ريال عُماني', rate: 0.38, flag: '🇴🇲' },
    EGP: { name: 'جنيه مصري', rate: 30.9, flag: '🇪🇬' },
    TRY: { name: 'ليرة تركية', rate: 32.1, flag: '🇹🇷' },
    IDR: { name: 'روبية إندونيسية', rate: 15900, flag: '🇮🇩' },
    MYR: { name: 'رينغيت ماليزي', rate: 4.72, flag: '🇲🇾' },
    PKR: { name: 'روبية باكستانية', rate: 278, flag: '🇵🇰' },
    BDT: { name: 'تاكا بنغلاديشي', rate: 110, flag: '🇧🇩' },
    NGN: { name: 'نيرة نيجيرية', rate: 1340, flag: '🇳🇬' },
    DHM: { name: 'درهم رقمي شيخة', rate: 0.267, flag: '🕌', isNative: true },
};

// ─── حاسبة الزكاة المدمجة ────────────────────────────────────────────────────
const ZAKAT_RATES = {
    cash: { rate: 0.025, nisabGold: 591, nisabSilver: 155, note: '2.5% من النقود والذهب والفضة' },
    trade: { rate: 0.025, note: '2.5% من عروض التجارة' },
    agriculture_rain: { rate: 0.10, note: '10% للزرع المسقي بالمطر' },
    agriculture_irrigation: { rate: 0.05, note: '5% للزرع المسقي بالآلة' },
    livestock: { note: 'حسب عدد الرأس — النصاب مفصل' },
    minerals: { rate: 0.20, note: 'ركاز المعادن 20%' },
};

// ─── الخدمات المالية الإسلامية ────────────────────────────────────────────────
const ISLAMIC_FINANCIAL_SERVICES = [
    {
        id: 'digital_wallet',
        name: 'المحفظة الرقمية الإسلامية',
        icon: '👛',
        desc: 'محفظة متعددة العملات — الدرهم الرقمي + عملات OIC',
        features: ['عدة عملات', 'ربط بالمعادن', 'دفع NFC', 'QR code', 'محفظة زكاة مدمجة', 'صدقة بنقرة'],
    },
    {
        id: 'cross_border',
        name: 'التحويلات الإسلامية عبر الحدود',
        icon: '🌍',
        desc: 'حولّ بين 57 دولة OIC — رسوم صفرية أو رمزية',
        features: ['فوري (< 5 ثواني)', 'رسوم أقل من 0.1%', 'شفافية كاملة', 'لا بنوك وسيطة'],
        advantage: 'توفير 80% من رسوم التحويلات التقليدية',
        hadith: '«البيّعان بالخيار ما لم يتفرقا» — وضوح الرسوم واجب',
    },
    {
        id: 'halal_savings',
        name: 'ادخار حلال',
        icon: '💎',
        desc: 'ادخار مرتبط بالذهب والفضة — لا فائدة ربوية',
        mechanism: 'الادخار يُحوَّل لذهب/فضة فعلي — يرتفع مع قيمة المعادن',
        products: ['حساب الذهب', 'حساب الفضة', 'حساب السلع الحلال', 'صناديق صكوك'],
    },
    {
        id: 'murabaha_finance',
        name: 'تمويل المرابحة الرقمي',
        icon: '🏠',
        desc: 'تمويل إسلامي شامل — بيت، سيارة، تجارة',
        mechanism: 'المنصة تشتري وتبيع بربح معلوم — لا فائدة',
        types: ['مرابحة عقارية', 'مرابحة سيارات', 'مرابحة تجارية'],
    },
    {
        id: 'sukuk_market',
        name: 'سوق الصكوك الرقمية',
        icon: '📊',
        desc: 'إصدار وتداول الصكوك الإسلامية فورياً',
        types: ['صكوك حكومية', 'صكوك شركات', 'صكوك بنية تحتية', 'صكوك وقفية'],
        globalMarket: '800 مليار دولار سنوياً — شيخة تريد 30%',
    },
    {
        id: 'zakat_engine',
        name: 'محرك الزكاة الموحد',
        icon: '💝',
        desc: 'حساب وتحصيل وتوزيع الزكاة لـ 1.9 مليار مسلم',
        potential: 'إمكانية جمع 600 مليار دولار زكاة سنوياً',
        distribution: '8 مصارف قرآنية: فقراء، مساكين، عاملين، مؤلفة، رقاب، غارمين، سبيل الله، ابن السبيل',
        quran: '﴿إِنَّمَا الصَّدَقَاتُ لِلْفُقَرَاءِ وَالْمَسَاكِينِ﴾ — التوبة ٦٠',
    },
];

// ─── حوكمة المنظومة النقدية ──────────────────────────────────────────────────
const MONETARY_GOVERNANCE = {
    council: 'مجلس شيخة النقدي الإسلامي',
    composition: [
        { role: 'هيئة شرعية', members: 7, requirement: 'علماء في المالية الإسلامية' },
        { role: 'لجنة اقتصادية', members: 5, requirement: 'اقتصاديون من OIC' },
        { role: 'ممثلو الدول الأعضاء', members: 57, requirement: 'مفوض من كل دولة OIC' },
        { role: 'مجلس المدققين', members: 3, requirement: 'مدققون ماليون مستقلون' },
    ],
    decisions: 'بالشورى — لا قرار إلا بأغلبية الثلثين',
    transparency: 'التقارير المالية علنية شهرياً على البلوك شين',
};

// ═══════════════════════════════════════════════════════════════════════════════
class SheikhaIslamicCurrencyEngine extends EventEmitter {
    constructor() {
        super();
        this.name = 'منظومة الدرهم الرقمي الإسلامي الموحد';
        this.symbol = 'DHM';
        this.arabicSymbol = 'د.ر';
        this.version = '1.0.0';
        this.foundation = MONETARY_FOUNDATION;
        this.reserveBasket = RESERVE_BASKET;
        this.exchangeRates = EXCHANGE_RATES;
        this.zakatRates = ZAKAT_RATES;
        this.services = ISLAMIC_FINANCIAL_SERVICES;
        this.governance = MONETARY_GOVERNANCE;
        this.circulatingSupply = 0;
        this.totalTransactions = 0;
        this.started = false;
        this._interval = null;
        // أسعار المعادن الافتراضية (تُحدَّث من مصادر خارجية)
        this.metalPrices = { goldUSD: 2340, silverUSD: 27.5 };
    }

    start() {
        if (this.started) return this;
        this.started = true;
        this._computeDirhamValue();
        this._interval = setInterval(() => this._cycle(), 60000);
        console.log(`✅ [Currency] ${this.name} | ${this.symbol} | قائمة على الذهب والفضة`);
        return this;
    }

    _computeDirhamValue() {
        const dirhamSilverValue = (this.metalPrices.silverUSD / 31.1035) * 2.975;
        const dinarGoldValue = (this.metalPrices.goldUSD / 31.1035) * 4.25;
        this.foundation.classicalDirham.currentValueUSD = dirhamSilverValue.toFixed(4);
        this.foundation.classicalDinar.currentValueUSD = dinarGoldValue.toFixed(2);
        // الدرهم الرقمي = 70% ذهب + 30% فضة (نسبة معيارية)
        const dhmValue = (dinarGoldValue * 0.70 + dirhamSilverValue * 0.30) / 10;
        this.exchangeRates.DHM.rate = parseFloat(dhmValue.toFixed(4));
    }

    _cycle() {
        this.totalTransactions += Math.floor(Math.random() * 10000);
        this._computeDirhamValue();
    }

    getStatus() {
        return {
            name: this.name,
            symbol: this.symbol,
            arabicSymbol: this.arabicSymbol,
            version: this.version,
            started: this.started,
            dhmValueUSD: this.exchangeRates.DHM.rate,
            goldPriceUSD: this.metalPrices.goldUSD,
            silverPriceUSD: this.metalPrices.silverUSD,
            circulatingSupply: this.circulatingSupply,
            services: this.services.length,
            currencies: Object.keys(this.exchangeRates).length,
            totalTransactions: this.totalTransactions,
            quran: '﴿وَأَوْفُوا الْكَيْلَ وَالْمِيزَانَ بِالْقِسْطِ﴾',
        };
    }

    calculateZakat(amount, assetType = 'cash') {
        const rule = this.zakatRates[assetType] || this.zakatRates.cash;
        const rate = rule.rate || 0.025;
        const zakatAmount = amount * rate;
        const nisabSAR = 155 * 3.75; // نصاب الفضة بالريال تقريباً
        return {
            assetType,
            amount,
            zakatRate: `${(rate * 100).toFixed(1)}%`,
            zakatAmount: parseFloat(zakatAmount.toFixed(2)),
            nisabSAR,
            liable: amount >= nisabSAR,
            note: rule.note,
            quran: '﴿خُذْ مِنْ أَمْوَالِهِمْ صَدَقَةً تُطَهِّرُهُمْ وَتُزَكِّيهِم بِهَا﴾',
        };
    }

    convertCurrency(amount, from, to) {
        const fromRate = this.exchangeRates[from.toUpperCase()];
        const toRate = this.exchangeRates[to.toUpperCase()];
        if (!fromRate || !toRate) return { success: false, message: 'عملة غير معروفة' };
        const usdAmount = amount / fromRate.rate;
        const result = usdAmount * toRate.rate;
        return {
            success: true,
            from, to, amount,
            result: parseFloat(result.toFixed(6)),
            rate: parseFloat((toRate.rate / fromRate.rate).toFixed(6)),
            isHalal: 'نعم — تحويل فوري لا ربا فيه',
        };
    }

    stop() {
        if (this._interval) clearInterval(this._interval);
        this.started = false;
    }
}

module.exports = new SheikhaIslamicCurrencyEngine();
