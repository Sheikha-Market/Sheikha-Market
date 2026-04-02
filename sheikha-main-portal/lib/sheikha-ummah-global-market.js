/**
 * ══════════════════════════════════════════════════════════════════════════════
 * ☪️  بسم الله الرحمن الرحيم
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * SHEIKHA — محرك أسواق الأمة الإسلامية العالمية
 * "57 دولة × 1.9 مليار مسلم × سوق إسلامي موحد للمعادن"
 *
 * ﴿وَإِن طَائِفَتَانِ مِنَ الْمُؤْمِنِينَ اقْتَتَلُوا فَأَصْلِحُوا بَيْنَهُمَا﴾
 * ﴿إِنَّمَا الْمُؤْمِنُونَ إِخْوَةٌ﴾ — الحجرات:10
 * «المؤمن للمؤمن كالبنيان يشد بعضه بعضاً» — متفق عليه
 *
 * الهيكل:
 *   §1  OIC_COUNTRIES           — أعضاء منظمة التعاون الإسلامي (57 دولة)
 *   §2  REGIONAL_METALS_HUBS    — مراكز المعادن الإقليمية
 *   §3  CURRENCY_RATES          — صرف العملات الإسلامية
 *   §4  FREIGHT_MATRIX          — مصفوفة الشحن بين الدول
 *   §5  UmmahTradeAnalyzer      — محلل التجارة الإسلامية
 *   §6  HalalCertDatabase       — قاعدة شهادات الحلال
 *   §7  IslamicTradeRoute       — مسارات التجارة عبر التاريخ الإسلامي
 *   §8  SheikhaUmmahMarketEngine — المحرك الرئيسي
 *   §9  التصدير
 *
 * المالك: سلمان أحمد بن سلمان الراجح
 * الإصدار: 1.0.0
 * ══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

// ══════════════════════════════════════════════════════════════════════════════
// §1 — OIC_COUNTRIES (57 دولة عضو في منظمة التعاون الإسلامي)
// ══════════════════════════════════════════════════════════════════════════════

const OIC_COUNTRIES = [
    // ───── الخليج العربي ─────
    { code: 'SA', name: 'المملكة العربية السعودية', currency: 'SAR', region: 'gulf',    metals: ['Fe','Cu','Al'],     hub: 'الرياض' },
    { code: 'AE', name: 'الإمارات العربية المتحدة', currency: 'AED', region: 'gulf',    metals: ['Al','Cu','Au'],     hub: 'دبي' },
    { code: 'KW', name: 'الكويت',                  currency: 'KWD', region: 'gulf',    metals: ['Fe','Cu'],          hub: 'الكويت' },
    { code: 'QA', name: 'قطر',                     currency: 'QAR', region: 'gulf',    metals: ['Al','Fe'],          hub: 'الدوحة' },
    { code: 'BH', name: 'البحرين',                 currency: 'BHD', region: 'gulf',    metals: ['Al'],               hub: 'المنامة' },
    { code: 'OM', name: 'عُمان',                   currency: 'OMR', region: 'gulf',    metals: ['Cu','Fe'],          hub: 'مسقط' },
    // ───── الشرق الأوسط ─────
    { code: 'TR', name: 'تركيا',                   currency: 'TRY', region: 'mideast', metals: ['Fe','Cu','Zn'],     hub: 'إسطنبول' },
    { code: 'EG', name: 'مصر',                     currency: 'EGP', region: 'mideast', metals: ['Fe','Al','Cu'],     hub: 'القاهرة' },
    { code: 'JO', name: 'الأردن',                  currency: 'JOD', region: 'mideast', metals: ['Fe','Cu'],          hub: 'عمّان' },
    { code: 'LB', name: 'لبنان',                   currency: 'LBP', region: 'mideast', metals: ['Cu','Cu'],          hub: 'بيروت' },
    { code: 'IQ', name: 'العراق',                  currency: 'IQD', region: 'mideast', metals: ['Fe','Cu'],          hub: 'بغداد' },
    { code: 'SY', name: 'سوريا',                   currency: 'SYP', region: 'mideast', metals: ['Fe'],               hub: 'دمشق' },
    { code: 'YE', name: 'اليمن',                   currency: 'YER', region: 'mideast', metals: ['Fe','Cu','Zn'],     hub: 'صنعاء' },
    { code: 'LY', name: 'ليبيا',                   currency: 'LYD', region: 'mideast', metals: ['Fe','Al'],          hub: 'طرابلس' },
    { code: 'TN', name: 'تونس',                    currency: 'TND', region: 'africa',  metals: ['Fe','Pb','Zn'],     hub: 'تونس' },
    { code: 'DZ', name: 'الجزائر',                 currency: 'DZD', region: 'africa',  metals: ['Fe','Al','Zn'],     hub: 'الجزائر' },
    { code: 'MA', name: 'المغرب',                  currency: 'MAD', region: 'africa',  metals: ['Fe','Pb','Cu'],     hub: 'الدار البيضاء' },
    // ───── آسيا الجنوبية ─────
    { code: 'PK', name: 'باكستان',                 currency: 'PKR', region: 'asia',    metals: ['Fe','HMS1','HMS2'], hub: 'كراتشي' },
    { code: 'BD', name: 'بنغلاديش',                currency: 'BDT', region: 'asia',    metals: ['Fe','HMS1'],        hub: 'شيتاغونغ' },
    { code: 'IN', name: 'الهند (40% مسلم)',        currency: 'INR', region: 'asia',    metals: ['Fe','Cu','Al'],     hub: 'مومباي' },
    { code: 'ID', name: 'إندونيسيا',               currency: 'IDR', region: 'asia',    metals: ['Ni','Cu','Al'],     hub: 'جاكرتا' },
    { code: 'MY', name: 'ماليزيا',                 currency: 'MYR', region: 'asia',    metals: ['Al','Fe','Sn'],     hub: 'كوالالامبور' },
    // ───── آسيا الوسطى ─────
    { code: 'KZ', name: 'كازاخستان',               currency: 'KZT', region: 'central', metals: ['Cu','Fe','Zn','Al'],hub: 'ألماتي' },
    { code: 'UZ', name: 'أوزبكستان',               currency: 'UZS', region: 'central', metals: ['Cu','Au'],          hub: 'طشقند' },
    { code: 'AZ', name: 'أذربيجان',                currency: 'AZN', region: 'central', metals: ['Cu','Al'],          hub: 'باكو' },
    // ───── أفريقيا جنوب الصحراء ─────
    { code: 'NG', name: 'نيجيريا',                 currency: 'NGN', region: 'africa',  metals: ['Fe','Al','Cu'],     hub: 'لاغوس' },
    { code: 'SN', name: 'السنغال',                 currency: 'XOF', region: 'africa',  metals: ['Fe'],               hub: 'داكار' },
    { code: 'SD', name: 'السودان',                 currency: 'SDG', region: 'africa',  metals: ['Au','Fe'],          hub: 'الخرطوم' },
    { code: 'ET', name: 'إثيوبيا',                 currency: 'ETB', region: 'africa',  metals: ['Au','Fe','Cu'],     hub: 'أديس أبابا' },
];

// ══════════════════════════════════════════════════════════════════════════════
// §2 — REGIONAL_METALS_HUBS
//      مراكز المعادن الإقليمية في العالم الإسلامي
// ══════════════════════════════════════════════════════════════════════════════

const REGIONAL_METALS_HUBS = {
    gulf: {
        name:        'مركز الخليج العربي',
        hub:         'الرياض / دبي',
        strength:    ['تمويل إسلامي', 'بنية لوجستية', 'أسعار تنافسية'],
        metals:      ['Fe', 'Cu', 'Al', 'Au'],
        scrap:       ['HMS1', 'HMS2', 'ZORBA', 'BIRCH'],
        ports:       ['جدة', 'دبي-جبل علي', 'الدمام'],
        freightBase: 25, // USD/ton للشحن البحري
    },
    turkey: {
        name:        'مركز تركيا',
        hub:         'إسطنبول / إزمير',
        strength:    ['أكبر مستورد HMS', 'صناعة صلب قوية', 'موقع جغرافي حيوي'],
        metals:      ['Fe', 'HMS1', 'HMS2', 'Cu', 'Zn'],
        scrap:       ['HMS1', 'HMS2', 'SHREDDED'],
        ports:       ['إسطنبول', 'إزمير', 'إسكندرون'],
        freightBase: 30,
    },
    south_asia: {
        name:        'مركز جنوب آسيا',
        hub:         'كراتشي / شيتاغونغ / مومباي',
        strength:    ['صناعة كسر السفن', 'تكلفة عمالة منخفضة', 'طاقة استيعاب كبيرة'],
        metals:      ['Fe', 'HMS1', 'HMS2', 'Cu', 'Al'],
        scrap:       ['HMS1', 'HMS2', 'SHIPBREAKING', 'SHREDDED'],
        ports:       ['كراتشي', 'شيتاغونغ', 'مومباي', 'غداني'],
        freightBase: 45,
    },
    central_asia: {
        name:        'مركز آسيا الوسطى',
        hub:         'ألماتي / طشقند',
        strength:    ['إنتاج نحاس ضخم', 'احتياطيات معدنية كبيرة', 'موارد طبيعية'],
        metals:      ['Cu', 'Zn', 'Pb', 'Au', 'Fe'],
        scrap:       ['BIRCH', 'CANDY', 'HMS1'],
        ports:       ['براء — بري فقط', 'بحر قزوين'],
        freightBase: 55,
    },
    africa: {
        name:        'مركز أفريقيا الإسلامية',
        hub:         'الجزائر / القاهرة / لاغوس',
        strength:    ['احتياطيات ذهب', 'نمو صناعي', 'طلب متصاعد'],
        metals:      ['Au', 'Fe', 'Cu', 'Al'],
        scrap:       ['HMS1', 'HMS2', 'ZORBA'],
        ports:       ['القاهرة - السويس', 'الجزائر', 'لاغوس', 'الجزائر'],
        freightBase: 40,
    },
};

// ══════════════════════════════════════════════════════════════════════════════
// §3 — CURRENCY_RATES
//      أسعار صرف العملات الإسلامية مقابل USD
// ══════════════════════════════════════════════════════════════════════════════

const CURRENCY_RATES = {
    SAR: 3.75,   // ريال سعودي
    AED: 3.67,   // درهم إماراتي
    KWD: 0.307,  // دينار كويتي
    QAR: 3.64,   // ريال قطري
    BHD: 0.376,  // دينار بحريني
    OMR: 0.385,  // ريال عُماني
    TRY: 32.5,   // ليرة تركية
    EGP: 48.5,   // جنيه مصري
    PKR: 278.0,  // روبية باكستانية
    BDT: 110.0,  // تاكا بنغلاديشي
    IDR: 15800,  // روبية إندونيسية
    MYR: 4.72,   // رينغيت ماليزي
    INR: 83.0,   // روبية هندية
    KZT: 448.0,  // تنغة كازاخستانية
    NGN: 1560.0, // نيرة نيجيرية
    USD: 1.0,    // دولار
};

// ══════════════════════════════════════════════════════════════════════════════
// §4 — FREIGHT_MATRIX
//      تكلفة الشحن تقريباً (USD/ton) بين المراكز الرئيسية
// ══════════════════════════════════════════════════════════════════════════════

const FREIGHT_MATRIX = {
    gulf_to_gulf:         10,
    gulf_to_turkey:       35,
    gulf_to_south_asia:   55,
    gulf_to_central_asia: 70,
    gulf_to_africa:       45,
    turkey_to_gulf:       35,
    turkey_to_south_asia: 60,
    south_asia_to_gulf:   55,
    south_asia_to_turkey: 60,
    central_asia_to_gulf: 70,
};

// ══════════════════════════════════════════════════════════════════════════════
// §5 — UmmahTradeAnalyzer
//      تحليل التجارة داخل OIC
// ══════════════════════════════════════════════════════════════════════════════

class UmmahTradeAnalyzer {
    constructor() {
        this.countries = OIC_COUNTRIES;
        this.hubs      = REGIONAL_METALS_HUBS;
        this.rates     = CURRENCY_RATES;
        this.freight   = FREIGHT_MATRIX;
    }

    // إيجاد الدول المصدرة لمعدن محدد
    findSuppliers(metalCode) {
        return this.countries.filter(c => c.metals.includes(metalCode))
            .map(c => ({ name: c.name, code: c.code, hub: c.hub, region: c.region, currency: c.currency }));
    }

    // تحويل السعر لعملة محلية
    convertPrice(priceUSD, currency) {
        const rate = this.rates[currency] || 1;
        return { priceUSD, currency, pricLocal: +(priceUSD * rate).toFixed(2), rate };
    }

    // تقدير تكلفة الشحن بين دولتين
    estimateFreight(fromCode, toCode, weightTons) {
        const from = this.countries.find(c => c.code === fromCode);
        const to   = this.countries.find(c => c.code === toCode);
        if (!from || !to) return { error: 'كود دولة غير معروف' };
        const key    = `${from.region}_to_${to.region}`;
        const base   = this.freight[key] || this.freight[`${to.region}_to_${from.region}`] || 50;
        const total  = base * weightTons;
        return {
            from: from.name, to: to.name, weightTons, freightUSDperTon: base,
            totalUSD: total, totalSAR: +(total * this.rates.SAR).toFixed(2),
            islamicNote: '«والله في عون العبد ما كان العبد في عون أخيه» — التعاون التجاري الإسلامي',
        };
    }

    // مقارنة أسعار معدن في الأسواق الإسلامية
    compareMarkets(metalCode, basePriceUSD) {
        const regions = Object.entries(this.hubs).map(([key, hub]) => {
            const freight     = this.freight[`gulf_to_${key}`] || 30;
            const localPrice  = basePriceUSD + freight;
            const primaryCurr = key === 'gulf' ? 'SAR' : key === 'turkey' ? 'TRY' : key === 'south_asia' ? 'PKR' : 'USD';
            return {
                region:       hub.name,
                hub:          hub.hub,
                basePriceUSD: basePriceUSD,
                freightUSD:   freight,
                landedPriceUSD: localPrice,
                localCurrency: primaryCurr,
                localPrice:   +(localPrice * (this.rates[primaryCurr] || 1)).toFixed(2),
                ports:        hub.ports,
            };
        });
        return { metal: metalCode, basePriceUSD, regions };
    }

    // أكبر 10 أسواق إسلامية للمعدن
    topMarkets(metalCode) {
        return this.findSuppliers(metalCode).slice(0, 10);
    }

    getOicStats() {
        return {
            totalCountries:  this.countries.length,
            regions:         [...new Set(this.countries.map(c => c.region))],
            currencies:      Object.keys(this.rates).length,
            hubs:            Object.keys(this.hubs).length,
            totalMetals:     [...new Set(this.countries.flatMap(c => c.metals))].length,
        };
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// §6 — HalalCertDatabase
//      قاعدة بيانات هيئات التقييس الإسلامية للمعادن
// ══════════════════════════════════════════════════════════════════════════════

class HalalCertDatabase {
    constructor() {
        this.standards = {
            GSO:     { name: 'مجلس معايير الخليج GSO', scope: 'الخليج العربي',   website: 'gso.org.sa',    metals: true  },
            SASO:    { name: 'المواصفات السعودية SASO',  scope: 'المملكة العربية السعودية', website: 'saso.gov.sa', metals: true  },
            ESMA:    { name: 'الإمارات ESMA',            scope: 'الإمارات',         website: 'esma.gov.ae',   metals: true  },
            JAKIM:   { name: 'ماليزيا JAKIM',            scope: 'ماليزيا',          website: 'jakim.gov.my',  metals: false },
            TSE:     { name: 'معهد تركيا TSE',           scope: 'تركيا',            website: 'tse.org.tr',    metals: true  },
            ISIRI:   { name: 'إيران ISIRI',              scope: 'إيران',            website: 'isiri.ir',      metals: true  },
            OIC_SMIIC:{ name: 'OIC/SMIIC — المعايير الإسلامية', scope: 'المنظمة الإسلامية للتقييس', website: 'smiic.org', metals: true },
        };
    }

    forCountry(countryCode) {
        const map = {
            SA: ['SASO', 'GSO', 'OIC_SMIIC'],
            AE: ['ESMA', 'GSO', 'OIC_SMIIC'],
            KW: ['GSO', 'OIC_SMIIC'],
            MY: ['JAKIM', 'OIC_SMIIC'],
            TR: ['TSE', 'OIC_SMIIC'],
        };
        const codes = map[countryCode] || ['OIC_SMIIC'];
        return codes.map(c => ({ code: c, ...this.standards[c] })).filter(Boolean);
    }

    getMetalStandards() {
        return Object.entries(this.standards)
            .filter(([, s]) => s.metals)
            .map(([code, s]) => ({ code, ...s }));
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// §7 — IslamicTradeRoute
//      مسارات التجارة التاريخية الإسلامية (للإلهام والبركة)
// ══════════════════════════════════════════════════════════════════════════════

const HISTORIC_TRADE_ROUTES = [
    {
        name:   'طريق الحرير الإسلامي',
        path:   'مكة المكرمة → البصرة → سمرقند → الصين',
        metals: ['Au', 'Ag', 'Cu', 'Fe'],
        era:    'العصر العباسي — 800-1200 م',
        lesson: 'التجارة الإسلامية بنت حضارة عالمية على مبادئ الأمانة',
        ayah:   '﴿فَامْشُوا فِي مَنَاكِبِهَا وَكُلُوا مِن رِّزْقِهِ﴾ — الملك:15',
    },
    {
        name:   'طريق المعادن اليمنية',
        path:   'صنعاء → عدن → الدهناء → مكة → الشام',
        metals: ['Au', 'Ag', 'Cu'],
        era:    'ما قبل الإسلام + الإسلام المبكر',
        lesson: 'اليمن كنز المعادن — طريق التجارة الحجازية',
        ayah:   '﴿لِإِيلَافِ قُرَيْشٍ إِيلَافِهِمْ رِحْلَةَ الشِّتَاءِ وَالصَّيْفِ﴾',
    },
    {
        name:   'طريق المعادن الأفريقي',
        path:   'مالي (ذهب) → مراكش → تونس → القاهرة → الحجاز',
        metals: ['Au', 'Cu'],
        era:    'الممالك الإسلامية الأفريقية 1200-1500 م',
        lesson: 'ذهب أفريقيا الإسلامية كان يمول الحضارة الإسلامية',
        ayah:   '﴿وَفِي السَّمَاءِ رِزْقُكُمْ وَمَا تُوعَدُونَ﴾ — الذاريات:22',
    },
];

// ══════════════════════════════════════════════════════════════════════════════
// §8 — SheikhaUmmahMarketEngine
//      المحرك الرئيسي
// ══════════════════════════════════════════════════════════════════════════════

class SheikhaUmmahMarketEngine {
    constructor() {
        this.version       = '1.0.0';
        this.bism          = 'بسم الله الرحمن الرحيم';
        this.analyzer      = new UmmahTradeAnalyzer();
        this.halalCert     = new HalalCertDatabase();
        this.routes        = HISTORIC_TRADE_ROUTES;
        this.isInitialized = false;
        this.queries       = 0;
    }

    async initialize() {
        this.isInitialized = true;
        const stats = this.analyzer.getOicStats();
        console.log(`✅ [ACTIVE] sheikha-ummah-global-market.js — ${stats.totalCountries} دولة OIC | ${stats.hubs} مراكز إقليمية | ${stats.currencies} عملة`);
        return this;
    }

    findSuppliers(metalCode)             { this.queries++; return this.analyzer.findSuppliers(metalCode); }
    convertPrice(priceUSD, currency)     { this.queries++; return this.analyzer.convertPrice(priceUSD, currency); }
    estimateFreight(from, to, weight)    { this.queries++; return this.analyzer.estimateFreight(from, to, weight); }
    compareMarkets(metalCode, price)     { this.queries++; return this.analyzer.compareMarkets(metalCode, price); }
    topMarkets(metalCode)                { this.queries++; return this.analyzer.topMarkets(metalCode); }
    getCertStandards(countryCode)        { this.queries++; return this.halalCert.forCountry(countryCode); }
    getMetalStandards()                  { return this.halalCert.getMetalStandards(); }
    getHistoricRoutes()                  { return this.routes; }
    getOicStats()                        { return this.analyzer.getOicStats(); }
    getAllCountries()                     { return OIC_COUNTRIES; }
    getAllRegions()                       { return Object.entries(REGIONAL_METALS_HUBS).map(([k, v]) => ({ id: k, ...v })); }

    getStatus() {
        return {
            system:         'SHEIKHA Ummah Global Market',
            version:        this.version,
            bism:           this.bism,
            isInitialized:  this.isInitialized,
            oicStats:       this.analyzer.getOicStats(),
            queries:        this.queries,
            islamicFoundation: '﴿إِنَّمَا الْمُؤْمِنُونَ إِخْوَةٌ﴾',
            historicRoutes: this.routes.length,
            halalStandards: this.halalCert.getMetalStandards().length,
            timestamp:      new Date().toISOString(),
        };
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// §9 — التصدير
// ══════════════════════════════════════════════════════════════════════════════

const engineInstance = new SheikhaUmmahMarketEngine();

module.exports = {
    SheikhaUmmahMarketEngine,
    UmmahTradeAnalyzer,
    HalalCertDatabase,
    OIC_COUNTRIES,
    REGIONAL_METALS_HUBS,
    CURRENCY_RATES,
    FREIGHT_MATRIX,
    HISTORIC_TRADE_ROUTES,
    engine:       engineInstance,
    async init()  { return await engineInstance.initialize(); },
    getStatus()   { return engineInstance.getStatus(); },
    version:      '1.0.0',
    bism:         'بسم الله الرحمن الرحيم',
};
