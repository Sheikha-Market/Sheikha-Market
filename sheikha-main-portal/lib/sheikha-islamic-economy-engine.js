'use strict';
/**
 * lib/sheikha-islamic-economy-engine.js
 * المرحلة ٣٥ — محرك الاقتصاد الإسلامي الكوني
 *
 * «إن الله هو المُسَعِّر، القابضُ، الباسطُ، الرازقُ،
 *  وإني لأرجو أن ألقى الله وليس أحدٌ منكم يَطلُبني بمظلمةٍ في دمٍ ولا مال»
 * — رواه الترمذي (١٣١٤) وأبو داود (٣٤٥١) — صحيح
 *
 * المالك: سلمان أحمد بن سلمان الراجح
 * sheikha.top | بسم الله الرحمن الرحيم
 */

// ══════════════════════════════════════════════════════════════════════════════
// ١. الأساس الشرعي — الله هو المُسَعِّر
// ══════════════════════════════════════════════════════════════════════════════
const ALLAH_IS_AL_MUSAIER = {
    hadith:    '«إن الله هو المُسَعِّر، القابضُ، الباسطُ، الرازقُ»',
    narrator:  'أنس بن مالك رضي الله عنه',
    source:    'رواه الترمذي (١٣١٤) وأبو داود (٣٤٥١) — صحيح',
    verse_1:   '﴿وَزِنُوا بِالْقِسْطَاسِ الْمُسْتَقِيمِ﴾ — الإسراء ٣٥',
    verse_2:   '﴿وَأَقِيمُوا الْوَزْنَ بِالْقِسْطِ وَلَا تُخْسِرُوا الْمِيزَانَ﴾ — الرحمن ٩',
    verse_3:   '﴿وَيُعَلِّمُكُمُ اللَّهُ﴾ — البقرة ٢٨٢',
    principle: 'التسعير العادل من الله — لا احتكار — لا غبن — لا غش — البيع بالتراضي',
    dua:       'اللهم أنت المُسَعِّر فاجعل أسعارنا عادلة ومباركة تُغني الفقير وترحم المسكين وتُيسر المعاملات بين الناس — آمين',
    tasmia:    'بسم الله الرحمن الرحيم — كل سعر في شيخة يُذكر اسم الله عليه',
};

// ══════════════════════════════════════════════════════════════════════════════
// ٢. أسعار الإغلاق اليومية — قاعدة التسعير (أبريل ٢٠٢٦)
// ══════════════════════════════════════════════════════════════════════════════
const SPOT = {
    gold_usd_oz:    3287.50,   // LBMA AM Fix
    silver_usd_oz:  38.95,     // LBMA
    plat_usd_oz:    1124.00,
    troy_g:         31.1035,
    date:           '2026-04-07',
    source:         'LBMA + CME + شيخة',
};

// أسعار الصرف — الدولار أساس
const FX = {
    USD:1.0,     SAR:3.75,     AED:3.6725,  KWD:0.3076,  QAR:3.64,
    BHD:0.376,   OMR:0.385,    JOD:0.709,   EGP:49.2,    LBP:89500,
    IQD:1310,    SYP:13000,    YER:530,     MAD:9.95,    TND:3.145,
    DZD:134.0,   LYD:4.85,     SDG:601,     MRO:35.8,    SO:571,
    EUR:0.918,   GBP:0.792,    CHF:0.898,   SEK:10.42,   NOK:10.58,
    DKK:6.845,   PLN:3.985,    CZK:23.15,   HUF:368,     RON:4.575,
    TRY:36.8,    RUB:88.5,     UAH:41.2,
    CNY:7.24,    JPY:152.4,    KRW:1365,    INR:85.1,    PKR:279.0,
    IDR:16240,   MYR:4.71,     THB:34.8,    PHP:57.6,    VND:25420,
    BDT:110.0,   LKR:300,      NPR:134.5,   MMK:2100,
    IRR:42000,   AFN:71.5,
    NGN:1620,    GHS:15.6,     KES:130.5,   ETB:118.5,   TZS:2560,
    ZAR:18.75,   UGX:3720,     XOF:600,     XAF:600,
    CAD:1.365,   AUD:1.548,    NZD:1.678,   BRL:5.07,    MXN:17.25,
    ARS:878,     CLP:950,      COP:4200,
    SGD:1.342,   HKD:7.785,    TWD:32.8,
};

// ══════════════════════════════════════════════════════════════════════════════
// ٣. أسعار المطعوم العالمية — معيار الكتاب والسنة
// ══════════════════════════════════════════════════════════════════════════════
const FOOD_USD = {
    wheat:     { name_ar:'البُر (القمح)',    kg:0.215,  unit:'كجم', hadith:'«البر بالبر مثلاً بمثل»',               icon:'🌾' },
    barley:    { name_ar:'الشعير',           kg:0.176,  unit:'كجم', hadith:'«الشعير بالشعير مثلاً بمثل»',          icon:'🌿' },
    dates:     { name_ar:'التَّمر',          kg:1.85,   unit:'كجم', hadith:'«التمر بالتمر مثلاً بمثل»',            icon:'🌴' },
    salt:      { name_ar:'المِلح',           kg:0.045,  unit:'كجم', hadith:'«الملح بالملح مثلاً بمثل»',            icon:'🧂' },
    rice:      { name_ar:'الأرز',            kg:0.53,   unit:'كجم', hadith:'قوت الأمم المسلمة',                    icon:'🍚' },
    olive_oil: { name_ar:'زيت الزيتون',      kg:7.20,   unit:'كجم', hadith:'«ائتدموا بالزيت» — النبي ﷺ',          icon:'🫒' },
    lentils:   { name_ar:'العدس',            kg:0.88,   unit:'كجم', hadith:'قوت الأنبياء',                         icon:'🫘' },
    honey:     { name_ar:'العسل',            kg:3.80,   unit:'كجم', hadith:'«فيه شفاء للناس»',                     icon:'🍯' },
    milk:      { name_ar:'الحليب',           kg:0.45,   unit:'لتر', hadith:'«ليشرب من لبنها»',                     icon:'🥛' },
    camel:     { name_ar:'الإبل',            kg:8.50,   unit:'كجم', hadith:'وسيلة النقل والقوت في الجزيرة',        icon:'🐪' },
    sheep:     { name_ar:'الغنم (لحم)',       kg:7.20,   unit:'كجم', hadith:'«من ملك أربعين شاة»',                  icon:'🐑' },
};

// ══════════════════════════════════════════════════════════════════════════════
// ٤. الإنتاج العالمي والعرض والطلب — سنوياً
// ══════════════════════════════════════════════════════════════════════════════
const PRODUCTION_SUPPLY_DEMAND = {
    gold: {
        name_ar: 'الذهب',
        unit: 'طن',
        annual_production: 3300,
        recycling:         1150,
        total_supply:      4450,
        demand: {
            jewelry:       2100,
            investment:    780,
            technology:    330,
            central_banks: 450,
            other:         90,
        },
        surplus_tons:      700,
        world_stock_tons:  208874,
        years_supply:      63,
        top_producers: [
            { country:'الصين',        tons:370, pct:'11.2%' },
            { country:'أستراليا',     tons:310, pct:'9.4%'  },
            { country:'روسيا',        tons:295, pct:'8.9%'  },
            { country:'الولايات المتحدة', tons:172, pct:'5.2%' },
            { country:'كندا',         tons:195, pct:'5.9%'  },
            { country:'غانا',         tons:130, pct:'3.9%'  },
            { country:'المكسيك',      tons:125, pct:'3.8%'  },
            { country:'إندونيسيا',    tons:120, pct:'3.6%'  },
            { country:'أوزبكستان',    tons:108, pct:'3.3%'  },
            { country:'السعودية',     tons:55,  pct:'1.7%'  },
        ],
    },
    silver: {
        name_ar: 'الفضة',
        unit: 'طن',
        annual_production: 25000,
        recycling:         6000,
        total_supply:      31000,
        demand: {
            industrial:    17000,
            jewelry:       6200,
            investment:    4500,
            photography:   900,
            silverware:    700,
        },
        surplus_tons:      1700,
        world_stock_tons:  1600000,
        years_supply:      64,
        top_producers: [
            { country:'المكسيك',      tons:5600, pct:'22.4%' },
            { country:'الصين',        tons:3300, pct:'13.2%' },
            { country:'بيرو',         tons:3100, pct:'12.4%' },
            { country:'الشيلي',       tons:1420, pct:'5.7%'  },
            { country:'روسيا',        tons:1400, pct:'5.6%'  },
            { country:'بوليفيا',      tons:1200, pct:'4.8%'  },
            { country:'أستراليا',     tons:1100, pct:'4.4%'  },
            { country:'الأرجنتين',    tons:780,  pct:'3.1%'  },
        ],
    },
    wheat: {
        name_ar: 'القمح',
        unit: 'مليون طن',
        annual_production: 793,
        consumption:       790,
        surplus:           3,
        stocks:            295,
        stocks_to_use_pct: '37.3%',
        top_producers: [
            { country:'الصين',        mtons:130, pct:'16.4%' },
            { country:'الهند',        mtons:108, pct:'13.6%' },
            { country:'روسيا',        mtons:92,  pct:'11.6%' },
            { country:'الولايات المتحدة', mtons:50, pct:'6.3%' },
            { country:'أستراليا',     mtons:36,  pct:'4.5%'  },
            { country:'كندا',         mtons:35,  pct:'4.4%'  },
            { country:'أوكرانيا',     mtons:23,  pct:'2.9%'  },
            { country:'باكستان',      mtons:28,  pct:'3.5%'  },
            { country:'السعودية',     mtons:1.2, pct:'0.15%' },
        ],
        islamic_world_share_pct: 24,
        main_islamic_importers: ['مصر','الجزائر','المغرب','السعودية','إندونيسيا','باكستان'],
    },
    dates: {
        name_ar: 'التمر',
        unit: 'مليون طن',
        annual_production: 9.8,
        consumption:       9.5,
        surplus:           0.3,
        stocks:            0.8,
        top_producers: [
            { country:'مصر',           mtons:1.65, pct:'16.8%' },
            { country:'السعودية',      mtons:1.48, pct:'15.1%' },
            { country:'إيران',         mtons:1.20, pct:'12.2%' },
            { country:'الجزائر',       mtons:1.10, pct:'11.2%' },
            { country:'العراق',        mtons:0.95, pct:'9.7%'  },
            { country:'الإمارات',      mtons:0.75, pct:'7.7%'  },
            { country:'المملكة',       mtons:0.70, pct:'7.1%'  },
            { country:'باكستان',       mtons:0.55, pct:'5.6%'  },
            { country:'تونس',          mtons:0.28, pct:'2.9%'  },
            { country:'ليبيا',         mtons:0.19, pct:'1.9%'  },
        ],
        islamic_world_share_pct: 92,
    },
    barley: {
        name_ar: 'الشعير',
        unit: 'مليون طن',
        annual_production: 155,
        consumption:       153,
        surplus:           2,
        stocks:            22,
        top_producers: [
            { country:'روسيا',         mtons:22,  pct:'14.2%' },
            { country:'أوكرانيا',      mtons:14,  pct:'9.0%'  },
            { country:'أستراليا',      mtons:12,  pct:'7.7%'  },
            { country:'الصين',         mtons:9.5, pct:'6.1%'  },
            { country:'كندا',          mtons:8.5, pct:'5.5%'  },
            { country:'ألمانيا',       mtons:10,  pct:'6.5%'  },
            { country:'تركيا',         mtons:7.5, pct:'4.8%'  },
            { country:'السعودية',      mtons:5.1, pct:'3.3%'  },
        ],
        islamic_world_share_pct: 18,
    },
    rice: {
        name_ar: 'الأرز',
        unit: 'مليون طن',
        annual_production: 520,
        consumption:       518,
        surplus:           2,
        stocks:            185,
        top_producers: [
            { country:'الصين',         mtons:145, pct:'27.9%' },
            { country:'الهند',         mtons:125, pct:'24.0%' },
            { country:'بنغلاديش',      mtons:35,  pct:'6.7%'  },
            { country:'إندونيسيا',     mtons:52,  pct:'10.0%' },
            { country:'فيتنام',        mtons:28,  pct:'5.4%'  },
            { country:'تايلاند',       mtons:24,  pct:'4.6%'  },
            { country:'ميانمار',       mtons:13,  pct:'2.5%'  },
            { country:'باكستان',       mtons:10,  pct:'1.9%'  },
        ],
        islamic_world_share_pct: 46,
    },
};

// ══════════════════════════════════════════════════════════════════════════════
// ٥. اقتصاد الزكاة والفقر — معادلة تحرير العالم من الفقر
// ══════════════════════════════════════════════════════════════════════════════
const ZAKAT_POVERTY_MODEL = {
    // السكان
    global_population:        8_100_000_000,
    muslim_population:        2_100_000_000,  // 26% من العالم
    muslim_population_pct:    26.0,

    // الفقر
    global_extreme_poor:      693_000_000,   // $2.15/يوم — البنك الدولي 2025
    muslim_extreme_poor:      280_000_000,   // تقدير 40% منهم مسلمون
    muslim_poor_per_dinin:    {              // كم دينار يحتاج الفقير سنوياً
        minimum_daily_usd:    2.15,
        annual_usd:           785,
        annual_sar:           2943,
        annual_dinars:        (785 / 449.21).toFixed(3), // ~1.747 دينار
    },

    // النصاب والزكاة
    nisab_gold_g:             85,
    nisab_gold_usd:           38_184,  // 85 × 449.21
    nisab_gold_sar:           143_190, // 85 × 1684.52
    nisab_silver_g:           595,
    nisab_silver_usd:         744,     // 595 × 1.25
    zakat_rate:               0.025,   // ربع العشر

    // تقديرات اقتصادية
    estimated_muslim_wealth_usd:     40_000_000_000_000,  // $40 تريليون
    estimated_zakatable_wealth_usd:  15_000_000_000_000,  // $15 تريليون
    potential_annual_zakat_usd:      375_000_000_000,     // 2.5% × 15T
    actual_collected_zakat_usd:      90_000_000_000,      // تقدير ما يُجمع فعلاً ~24%
    collection_gap_usd:              285_000_000_000,
    collection_rate_current:         0.24,

    // القضاء على الفقر
    cost_eliminate_muslim_poverty_usd: 220_000_000_000,   // $220 مليار سنوياً
    cost_per_poor_muslim_usd:          786,                // $786/فقير/سنة
    zakat_surplus_after_poverty:       155_000_000_000,    // $155B فائض للتنمية

    // مؤشرات النمو الإلزامي — للوصول للتشبع
    growth_path: [
        { year:2026, collection_pct:24,  collected_b:90,   poverty_impact:'لا يكفي' },
        { year:2027, collection_pct:35,  collected_b:131,  poverty_impact:'انخفاض الفقر 15%' },
        { year:2028, collection_pct:48,  collected_b:180,  poverty_impact:'انخفاض الفقر 40%' },
        { year:2029, collection_pct:62,  collected_b:233,  poverty_impact:'انخفاض الفقر 70%' },
        { year:2030, collection_pct:78,  collected_b:293,  poverty_impact:'شبه القضاء على الفقر' },
        { year:2031, collection_pct:90,  collected_b:338,  poverty_impact:'زوال الفقر المدقع' },
        { year:2032, collection_pct:100, collected_b:375,  poverty_impact:'تشبع كامل — لا فقير' },
    ],

    // مؤشرات الزكاة الإلزامية
    required_annual_growth_rate: 0.27,   // 27% نمو سنوي في الجمع
    zakat_payers_estimate:       320_000_000,
    avg_zakat_per_payer_usd:     281,    // الحالي

    // الزكاة كنسبة من الاقتصاد
    global_gdp_usd:              110_000_000_000_000,
    oic_gdp_usd:                 22_000_000_000_000,
    zakat_pct_global_gdp:        0.00034,
    zakat_pct_oic_gdp:           0.0017,

    verse:   '﴿خُذْ مِنْ أَمْوَالِهِمْ صَدَقَةً تُطَهِّرُهُمْ وَتُزَكِّيهِم بِهَا﴾ — التوبة ١٠٣',
    hadith:  '«لَا تَزَالُ أُمَّتِي بِخَيْرٍ مَا تَرَاحَمُوا وَأَعْطَوُا الزَّكَاةَ»',
};

// ══════════════════════════════════════════════════════════════════════════════
// ٦. حجم التجارة العالمية — الإسلامي وغير الإسلامي
// ══════════════════════════════════════════════════════════════════════════════
const TRADE_VOLUMES = {
    // عالمي
    global_merchandise_trade_usd:     30_000_000_000_000,
    global_services_trade_usd:         7_800_000_000_000,
    global_total_trade_usd:           37_800_000_000_000,
    global_annual_transactions_count:  1_800_000_000_000,  // 1.8 تريليون معاملة
    global_ecommerce_usd:              6_200_000_000_000,
    global_trade_growth_annual:        0.043,

    // منظمة التعاون الإسلامي (OIC — 57 دولة)
    oic_countries_count:     57,
    oic_gdp_usd:             22_000_000_000_000,
    oic_population:          2_000_000_000,
    oic_total_trade_usd:      5_200_000_000_000,  // 13.8% من التجارة العالمية
    intra_oic_trade_usd:      1_100_000_000_000,  // تجارة بينية
    intra_oic_pct:            21.2,               // % من إجمالي OIC
    oic_target_intra_2025:    0.25,               // هدف OIC للتجارة البينية
    oic_trade_growth:         0.065,

    // الأسواق الإسلامية التخصصية
    halal_food_usd:           1_900_000_000_000,
    halal_travel_usd:          220_000_000_000,
    halal_fashion_usd:         295_000_000_000,
    islamic_finance_assets:    4_500_000_000_000,
    sukuk_outstanding_usd:     756_000_000_000,
    takaful_insurance_usd:      31_000_000_000,
    halal_pharma_usd:          131_000_000_000,
    halal_market_total:        3_345_000_000_000,
    halal_growth_annual:       0.12,

    // المعاملات الإسلامية
    oic_annual_transactions:   420_000_000_000,
    daily_transactions_oic:    1_150_000_000,
    avg_transaction_usd:       12.4,

    verse:  '﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾ — البقرة ٢٧٥',
    note:   'كل معاملة حلال = عبادة + رزق مبارك',
};

// ══════════════════════════════════════════════════════════════════════════════
// ٧. المعيار اليومي — الدينار والدرهم والمطعوم بكل عملة
// ══════════════════════════════════════════════════════════════════════════════
function getDailyBenchmark(currency) {
    const fx = FX[currency];
    if (!fx) return null;

    const goldGramUSD  = SPOT.gold_usd_oz   / SPOT.troy_g;
    const silverGramUSD= SPOT.silver_usd_oz  / SPOT.troy_g;
    const dinarUSD     = goldGramUSD   * 4.25;
    const dirhamUSD    = silverGramUSD * 2.975;

    const r = (v, d=4) => +v.toFixed(d);

    const gold = {
        per_oz:    r(SPOT.gold_usd_oz   * fx, 2),
        per_gram:  r(goldGramUSD        * fx, 2),
        per_dinar: r(dinarUSD           * fx, 2),  // 4.25g
    };
    const silver = {
        per_oz:     r(SPOT.silver_usd_oz * fx, 2),
        per_gram:   r(silverGramUSD      * fx, 4),
        per_dirham: r(dirhamUSD          * fx, 2),  // 2.975g
    };

    const food = {};
    for (const [k, f] of Object.entries(FOOD_USD)) {
        food[k] = { name_ar: f.name_ar, icon: f.icon, per_kg: r(f.kg * fx, 3) };
    }

    // النسب والفروقات
    const ratios = {
        // كم جرام فضة = جرام ذهب
        gold_silver_gram_ratio: r(goldGramUSD / silverGramUSD, 2),
        // تاريخياً 10:1 — اليوم أعلى بكثير (الفضة أرخص)
        historic_gold_silver:   10,
        silver_undervalue_pct:  r((goldGramUSD / silverGramUSD / 10 - 1) * 100, 1),

        // دينار مقابل المطعوم
        dinar_wheat_kg:         r(dinarUSD / FOOD_USD.wheat.kg, 1),
        dinar_dates_kg:         r(dinarUSD / FOOD_USD.dates.kg, 1),
        dinar_rice_kg:          r(dinarUSD / FOOD_USD.rice.kg, 1),
        dinar_olive_oil_kg:     r(dinarUSD / FOOD_USD.olive_oil.kg,1),

        // درهم مقابل المطعوم
        dirham_wheat_kg:        r(dirhamUSD / FOOD_USD.wheat.kg, 1),
        dirham_dates_kg:        r(dirhamUSD / FOOD_USD.dates.kg, 2),
        dirham_salt_kg:         r(dirhamUSD / FOOD_USD.salt.kg, 1),

        // يوم معيشة بالدينار
        daily_food_cost_usd:    r(FOOD_USD.wheat.kg * 1.5 + FOOD_USD.dates.kg * 0.2, 3),
        days_per_dinar:         r(dinarUSD / (FOOD_USD.wheat.kg * 1.5 + FOOD_USD.dates.kg * 0.2), 1),
        days_per_dirham:        r(dirhamUSD / (FOOD_USD.wheat.kg * 1.5 + FOOD_USD.dates.kg * 0.2), 2),
    };

    // فرق الذهب والفضة
    const diff = {
        gold_vs_silver_gram_value:     r((gold.per_gram - silver.per_gram) * 1, 2),
        gold_vs_silver_pct:            r((goldGramUSD / silverGramUSD - 1) * 100, 1),
        gold_vs_wheat_gram_vs_kg:      r(gold.per_gram / food.wheat.per_kg, 2),
        silver_vs_wheat_gram_vs_kg:    r(silver.per_gram / food.wheat.per_kg, 4),
        dinar_vs_daily_living_pct:     r((dinarUSD / ratios.daily_food_cost_usd) * 100, 1),
    };

    return {
        currency, date: SPOT.date, source: SPOT.source,
        gold, silver, food, ratios, diff,
        hadith: ALLAH_IS_AL_MUSAIER.hadith,
        verse:  ALLAH_IS_AL_MUSAIER.verse_1,
    };
}

// ══════════════════════════════════════════════════════════════════════════════
// ٨. مصفوفة الأسعار الأفقية والعمودية — كل منتج × كل عملة
// ══════════════════════════════════════════════════════════════════════════════
function getPriceMatrix() {
    const goldGramUSD   = SPOT.gold_usd_oz   / SPOT.troy_g;
    const silverGramUSD = SPOT.silver_usd_oz  / SPOT.troy_g;
    const dinarUSD      = goldGramUSD * 4.25;
    const dirhamUSD     = silverGramUSD * 2.975;

    // الصفوف: المنتجات | الأعمدة: العملات
    const currencies = ['USD','SAR','AED','KWD','EGP','TRY','EUR','GBP','JPY','CNY','INR','IDR','PKR','NGN','MAD','TND','DZD'];

    const matrix = {};
    for (const cur of currencies) {
        const fx = FX[cur] || 1;
        const r = (v, d=2) => +v.toFixed(d);
        matrix[cur] = {
            gold_gram:   r(goldGramUSD   * fx),
            gold_dinar:  r(dinarUSD      * fx),
            silver_gram: r(silverGramUSD * fx, 4),
            silver_dir:  r(dirhamUSD     * fx),
            wheat_kg:    r(FOOD_USD.wheat.kg * fx, 3),
            barley_kg:   r(FOOD_USD.barley.kg * fx, 3),
            dates_kg:    r(FOOD_USD.dates.kg * fx),
            salt_kg:     r(FOOD_USD.salt.kg * fx, 3),
            rice_kg:     r(FOOD_USD.rice.kg * fx),
            olive_oil_kg:r(FOOD_USD.olive_oil.kg * fx),
            // الفروقات
            gold_silver_diff:  r((goldGramUSD - silverGramUSD) * fx),
            gold_silver_ratio: r(goldGramUSD / silverGramUSD, 2),
            dinar_vs_wheat_ratio: r(dinarUSD / FOOD_USD.wheat.kg, 1),
            dinar_vs_dates_ratio: r(dinarUSD / FOOD_USD.dates.kg, 1),
        };
    }

    return {
        date:       SPOT.date,
        products:   ['gold_gram','gold_dinar','silver_gram','silver_dir','wheat_kg','barley_kg','dates_kg','salt_kg','rice_kg','olive_oil_kg'],
        currencies,
        matrix,
        note:       'الأسعار أفقياً = نفس المنتج بكل العملات | عمودياً = كل المنتجات بعملة واحدة',
        verse:      ALLAH_IS_AL_MUSAIER.verse_2,
    };
}

// ══════════════════════════════════════════════════════════════════════════════
// ٩. المعامل الرقمي لكل دولة — القوة الشرائية الحقيقية
// ══════════════════════════════════════════════════════════════════════════════
function getDigitalCoefficient() {
    const goldGramUSD = SPOT.gold_usd_oz / SPOT.troy_g;
    const dinarUSD    = goldGramUSD * 4.25;

    // بيانات الدول: الدخل الفردي + معيار الحياة
    const countries = [
        { code:'SA', name:'السعودية',       gdp_per_cap:25000, fx_key:'SAR' },
        { code:'AE', name:'الإمارات',        gdp_per_cap:46000, fx_key:'AED' },
        { code:'KW', name:'الكويت',          gdp_per_cap:36000, fx_key:'KWD' },
        { code:'QA', name:'قطر',             gdp_per_cap:65000, fx_key:'QAR' },
        { code:'EG', name:'مصر',             gdp_per_cap:3800,  fx_key:'EGP' },
        { code:'TR', name:'تركيا',           gdp_per_cap:10600, fx_key:'TRY' },
        { code:'MA', name:'المغرب',          gdp_per_cap:3500,  fx_key:'MAD' },
        { code:'PK', name:'باكستان',         gdp_per_cap:1580,  fx_key:'PKR' },
        { code:'ID', name:'إندونيسيا',       gdp_per_cap:4800,  fx_key:'IDR' },
        { code:'NG', name:'نيجيريا',         gdp_per_cap:2250,  fx_key:'NGN' },
        { code:'BD', name:'بنغلاديش',        gdp_per_cap:2700,  fx_key:'BDT' },
        { code:'MY', name:'ماليزيا',         gdp_per_cap:13000, fx_key:'MYR' },
        { code:'US', name:'الولايات المتحدة',gdp_per_cap:80000, fx_key:'USD' },
        { code:'DE', name:'ألمانيا',         gdp_per_cap:51000, fx_key:'EUR' },
        { code:'CN', name:'الصين',           gdp_per_cap:13700, fx_key:'CNY' },
        { code:'IN', name:'الهند',           gdp_per_cap:2800,  fx_key:'INR' },
        { code:'JP', name:'اليابان',         gdp_per_cap:34000, fx_key:'JPY' },
        { code:'GB', name:'بريطانيا',        gdp_per_cap:48000, fx_key:'GBP' },
    ];

    return countries.map(c => {
        const fx = FX[c.fx_key] || 1;
        const gdpLocal = c.gdp_per_cap * fx;
        const dinarsPerCapita = c.gdp_per_cap / dinarUSD;
        const wheatKgPerDinar = dinarUSD / FOOD_USD.wheat.kg;
        const datesKgPerDinar = dinarUSD / FOOD_USD.dates.kg;
        const goldGramPerAnnualSalary = c.gdp_per_cap / goldGramUSD;

        // المعامل الرقمي: نسبة دخل الفرد إلى دينار
        const digitalCoeff = +(dinarsPerCapita).toFixed(2);

        // كمية الذهب التي يملكها المواطن نظرياً
        const gold_g_per_cap = +goldGramPerAnnualSalary.toFixed(2);

        // هل يبلغ نصاب الزكاة؟
        const above_nisab = c.gdp_per_cap > 38184;

        return {
            ...c,
            gdp_local: Math.round(gdpLocal),
            dinars_per_capita: digitalCoeff,
            gold_grams_per_capita: gold_g_per_cap,
            above_nisab,
            wheat_kg_per_dinar: +wheatKgPerDinar.toFixed(1),
            dates_kg_per_dinar: +datesKgPerDinar.toFixed(1),
            purchasing_power_index: +(c.gdp_per_cap / dinarUSD * 100 / (80000/dinarUSD)).toFixed(3),
        };
    });
}

// ══════════════════════════════════════════════════════════════════════════════
// ١٠. المبادلة العادلة — «إذا اختلف الجنس فبيعوا كيف شئتم يداً بيد»
// ══════════════════════════════════════════════════════════════════════════════
function getFairExchange(prod1, qty1, prod2, currency = 'SAR') {
    const fx = FX[currency] || 3.75;
    const goldGramUSD = SPOT.gold_usd_oz / SPOT.troy_g;

    const priceMap = {
        gold_gram:    goldGramUSD,
        gold_dinar:   goldGramUSD * 4.25,
        silver_gram:  SPOT.silver_usd_oz / SPOT.troy_g,
        silver_dirham:(SPOT.silver_usd_oz / SPOT.troy_g) * 2.975,
        wheat:        FOOD_USD.wheat.kg,
        barley:       FOOD_USD.barley.kg,
        dates:        FOOD_USD.dates.kg,
        salt:         FOOD_USD.salt.kg,
        rice:         FOOD_USD.rice.kg,
        olive_oil:    FOOD_USD.olive_oil.kg,
        honey:        FOOD_USD.honey.kg,
    };

    const p1 = priceMap[prod1], p2 = priceMap[prod2];
    if (!p1 || !p2) return { error: 'منتج غير معروف' };

    const total_usd   = p1 * qty1;
    const qty2_needed = total_usd / p2;
    const fairRatio   = qty1 / qty2_needed;

    // إذا اتحد الجنس يجب التماثل
    const same_genus = (prod1 === prod2) ||
        (prod1.startsWith('gold') && prod2.startsWith('gold')) ||
        (prod1.startsWith('silver') && prod2.startsWith('silver'));

    return {
        from:           { product: prod1, qty: qty1, unit_usd: p1, total_usd: +(total_usd).toFixed(4), total_local: +(total_usd * fx).toFixed(2) },
        to:             { product: prod2, qty_needed: +qty2_needed.toFixed(4), unit_usd: p2 },
        currency,
        exchange_ratio: +fairRatio.toFixed(6),
        same_genus,
        sharia_rule:    same_genus
            ? '⚠️ جنس واحد — يجب التساوي وزناً والتقابض في المجلس (يداً بيد)'
            : '✅ جنسان مختلفان — يجوز التفاضل ويُشترط التقابض في المجلس',
        hadith:         '«الذهب بالذهب مثلاً بمثل... وإذا اختلفت هذه الأجناس فبيعوا كيف شئتم إذا كان يداً بيد» — مسلم ١٥٨٧',
    };
}

// ══════════════════════════════════════════════════════════════════════════════
// ١١. التقرير الاقتصادي اليومي الشامل
// ══════════════════════════════════════════════════════════════════════════════
function getDailyEconomicReport(currency = 'SAR') {
    return {
        report_date:        SPOT.date,
        currency,
        allah_is_al_musaier: ALLAH_IS_AL_MUSAIER,
        daily_benchmark:    getDailyBenchmark(currency),
        zakat_summary: {
            nisab_gold_local:    +(38184 * (FX[currency]||1)).toFixed(2),
            nisab_silver_local:  +(744   * (FX[currency]||1)).toFixed(2),
            zakat_rate:          '٢.٥٪',
            verse:               ZAKAT_POVERTY_MODEL.verse,
            poor_muslims:        ZAKAT_POVERTY_MODEL.muslim_extreme_poor,
            potential_zakat_usd: ZAKAT_POVERTY_MODEL.potential_annual_zakat_usd,
            cost_to_end_poverty: ZAKAT_POVERTY_MODEL.cost_eliminate_muslim_poverty_usd,
        },
        trade_summary: {
            global_trade:       TRADE_VOLUMES.global_total_trade_usd,
            oic_trade:          TRADE_VOLUMES.oic_total_trade_usd,
            halal_market:       TRADE_VOLUMES.halal_market_total,
            daily_transactions: TRADE_VOLUMES.daily_transactions_oic,
        },
        key_ratios: getDailyBenchmark(currency)?.ratios,
        growth_targets: ZAKAT_POVERTY_MODEL.growth_path,
        dua: ALLAH_IS_AL_MUSAIER.dua,
    };
}

// ══════════════════════════════════════════════════════════════════════════════
// ١٢. تصدير
// ══════════════════════════════════════════════════════════════════════════════
module.exports = {
    getAllahIsAlMusaier:         ()           => ALLAH_IS_AL_MUSAIER,
    getDailyBenchmark,
    getAllBenchmarks:            ()           => {
        const result = {};
        for (const cur of Object.keys(FX)) { result[cur] = getDailyBenchmark(cur); }
        return result;
    },
    getPriceMatrix,
    getDigitalCoefficient,
    getFairExchange,
    getDailyEconomicReport,
    getZakatPovertyModel:       ()           => ZAKAT_POVERTY_MODEL,
    getTradeVolumes:            ()           => TRADE_VOLUMES,
    getProductionData:          ()           => PRODUCTION_SUPPLY_DEMAND,
    getProductionByItem:        (item)       => PRODUCTION_SUPPLY_DEMAND[item] || null,
    getSpot:                    ()           => SPOT,
    getSupportedCurrencies:     ()           => Object.keys(FX),
};
