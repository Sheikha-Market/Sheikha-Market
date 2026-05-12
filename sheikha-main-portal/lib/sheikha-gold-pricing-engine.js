/**
 * بسم الله الرحمن الرحيم
 * ══════════════════════════════════════════════════════════════════════════════
 *  منظومة شيخة — محرك تسعير الذهب والفضة والمطعوم
 *  SHEIKHA GOLD · SILVER · FOOD PRICING ENGINE
 * ══════════════════════════════════════════════════════════════════════════════
 *  «الذَّهبُ بالذَّهبِ، والفضَّةُ بالفضَّةِ، والبُرُّ بالبُرِّ، والتَّمرُ بالتَّمرِ،
 *   والشَّعيرُ بالشَّعيرِ، والمِلحُ بالمِلحِ مِثلًا بمِثلٍ، سواءً بسواءٍ، يَدًا بيَدٍ»
 *   — صحيح مسلم ١٥٨٧
 *
 *  أساس التسعير الإسلامي:
 *  • الدينار  = ١ مثقال = ٤.٢٥ جرام ذهب خالص (٢٤ قيراط)
 *  • الدرهم   = ٢.٩٧٥ جرام فضة خالصة
 *  • نصاب الذهب  = ٢٠ ديناراً = ٨٥ جرام ذهب
 *  • نصاب الفضة  = ٢٠٠ درهم = ٥٩٥ جرام فضة
 * ══════════════════════════════════════════════════════════════════════════════
 */
'use strict';

// ══════════════════════════════════════════════════════════════════════════════
// ١. المعايير الإسلامية الثابتة للأوزان
// ══════════════════════════════════════════════════════════════════════════════
const ISLAMIC_WEIGHT_STANDARDS = {
    dinar: {
        name: 'الدينار الإسلامي',
        metal: 'gold',
        weight_grams: 4.25,
        purity: 24,    // قيراط
        purity_ratio: 1.0,
        nisab_count: 20,
        nisab_grams: 85,
        hadith: '«كل وزن مكي»',
        authority: 'إجماع العلماء على أن الدينار = مثقال = ٤.٢٥ جرام ذهب خالص',
    },
    dirham: {
        name: 'الدرهم الإسلامي',
        metal: 'silver',
        weight_grams: 2.975,
        purity: 24,
        purity_ratio: 1.0,
        nisab_count: 200,
        nisab_grams: 595,
        hadith: '«الدرهم الإسلامي = سبعة دراهم في عشرة مثاقيل»',
        authority: 'علماء الفقه الإسلامي — الزكاة والمعاملات',
    },
    ratio: {
        gold_silver_classic: '١:١٠', // نسبة الذهب للفضة تاريخياً
        note: 'نسبة ١ دينار = ١٠ دراهم تاريخياً — تتغير حسب السوق اليوم',
    },
};

// ══════════════════════════════════════════════════════════════════════════════
// ٢. أسعار المعادن — قاعدة بيانات الأسعار العالمية (أبريل ٢٠٢٦)
// ══════════════════════════════════════════════════════════════════════════════

/**
 * أسعار أوقية تروي (31.1035 جرام)
 * المصادر: LBMA، CME Group، ICE Benchmark
 */
const SPOT_PRICES_BASE = {
    // أسعار أبريل 2026 — بالدولار الأمريكي لكل أوقية تروي
    gold_usd_per_oz:   3287.50,   // LBMA Gold AM Fix
    silver_usd_per_oz: 38.95,     // LBMA Silver Fix
    platinum_usd_per_oz: 1124.00,
    palladium_usd_per_oz: 1050.00,
    troy_oz_in_grams:  31.1035,
    last_updated:      '2026-04-07T06:00:00Z',
    source:            'LBMA + CME + شيخة',
};

/**
 * أسعار الذهب بكل عملات العالم الرئيسية
 * الحساب: سعر_الأوقية_دولار × سعر_صرف_العملة
 */
const GOLD_PRICE_BY_CURRENCY = (function () {
    const ozUSD = SPOT_PRICES_BASE.gold_usd_per_oz;
    // أسعار الصرف مقابل الدولار (أبريل 2026)
    const fx = {
        USD:  1.0,        SAR:  3.75,       AED:  3.6725,    KWD:  0.3076,
        QAR:  3.64,       BHD:  0.376,      OMR:  0.385,     JOD:  0.709,
        EGP:  49.2,       TRY:  36.8,       PKR:  279.0,     BDT:  116.5,
        IDR:  16240,      MYR:  4.71,       EUR:  0.918,      GBP:  0.792,
        JPY:  152.4,      CNY:  7.24,       INR:  85.1,       RUB:  92.6,
        NGN:  1620,       ZAR:  18.9,       MXN:  17.4,      BRL:  5.12,
        CAD:  1.365,      AUD:  1.548,      CHF:  0.898,      SGD:  1.342,
        THB:  35.2,       VND:  25200,      PHP:  57.8,       KZT:  465,
        TND:  3.145,      MAD:  9.95,       DZD:  134,        LYD:  4.86,
        SDG:  601,        SOS:  571,        XOF:  602,        XAF:  602,
        AFN:  71.5,       IRR:  42000,       IQD:  1310,      SYP:  13000,
        YER:  249,        LBP:  89500,
    };
    const result = {};
    for (const [code, rate] of Object.entries(fx)) {
        const perOz    = +(ozUSD * rate).toFixed(4);
        const perGram  = +(perOz / SPOT_PRICES_BASE.troy_oz_in_grams).toFixed(4);
        const perDinar = +(perGram * ISLAMIC_WEIGHT_STANDARDS.dinar.weight_grams).toFixed(4);
        result[code] = { per_oz: perOz, per_gram: perGram, per_dinar: perDinar, fx_rate: rate };
    }
    return result;
})();

/**
 * أسعار الفضة بكل عملة
 */
const SILVER_PRICE_BY_CURRENCY = (function () {
    const ozUSD = SPOT_PRICES_BASE.silver_usd_per_oz;
    const fxRates = {
        USD:1.0, SAR:3.75, AED:3.6725, KWD:0.3076, QAR:3.64, BHD:0.376,
        EUR:0.918, GBP:0.792, JPY:152.4, CNY:7.24, INR:85.1, TRY:36.8,
        EGP:49.2, PKR:279.0, IDR:16240, MYR:4.71, CAD:1.365, AUD:1.548,
        CHF:0.898, SGD:1.342, MAD:9.95, TND:3.145, NGN:1620,
    };
    const result = {};
    for (const [code, rate] of Object.entries(fxRates)) {
        const perOz     = +(ozUSD * rate).toFixed(4);
        const perGram   = +(perOz / SPOT_PRICES_BASE.troy_oz_in_grams).toFixed(4);
        const perDirham = +(perGram * ISLAMIC_WEIGHT_STANDARDS.dirham.weight_grams).toFixed(4);
        result[code] = { per_oz: perOz, per_gram: perGram, per_dirham: perDirham, fx_rate: rate };
    }
    return result;
})();

// ══════════════════════════════════════════════════════════════════════════════
// ٣. الخزائن الذهبية العالمية — احتياطيات الدول (أبريل ٢٠٢٦)
//    المصدر: World Gold Council
// ══════════════════════════════════════════════════════════════════════════════
const GLOBAL_GOLD_RESERVES = [
    { rank:1,  country:'الولايات المتحدة',   iso:'US', tons:8133.46, pct_reserve:'65.3%', vault:'Fort Knox + نيويورك + ويست بوينت' },
    { rank:2,  country:'ألمانيا',            iso:'DE', tons:3351.53, pct_reserve:'66.0%', vault:'بنك ألمانيا الاتحادي + بنك إنجلترا + FED' },
    { rank:3,  country:'إيطاليا',            iso:'IT', tons:2451.84, pct_reserve:'64.5%', vault:'بنك إيطاليا + FED' },
    { rank:4,  country:'فرنسا',              iso:'FR', tons:2436.88, pct_reserve:'57.4%', vault:'بنك بنك فرنسا' },
    { rank:5,  country:'روسيا',              iso:'RU', tons:2336.90, pct_reserve:'27.0%', vault:'البنك المركزي الروسي' },
    { rank:6,  country:'الصين',              iso:'CN', tons:2279.56, pct_reserve:'4.3%',  vault:'بنك الشعب الصيني' },
    { rank:7,  country:'سويسرا',             iso:'CH', tons:1040.00, pct_reserve:'7.2%',  vault:'SNB' },
    { rank:8,  country:'اليابان',            iso:'JP', tons:845.97,  pct_reserve:'3.7%',  vault:'BOJ' },
    { rank:9,  country:'الهند',              iso:'IN', tons:803.58,  pct_reserve:'8.5%',  vault:'RBI' },
    { rank:10, country:'هولندا',             iso:'NL', tons:612.45,  pct_reserve:'58.7%', vault:'DNB + FED' },
    { rank:11, country:'تركيا',              iso:'TR', tons:586.00,  pct_reserve:'37.3%', vault:'CBRT' },
    { rank:12, country:'المملكة العربية السعودية', iso:'SA', tons:323.07, pct_reserve:'3.4%', vault:'SAMA' },
    { rank:13, country:'الإمارات',           iso:'AE', tons:65.12,   pct_reserve:'2.1%',  vault:'CBUAE' },
    { rank:14, country:'قطر',               iso:'QA', tons:63.00,   pct_reserve:'10.5%', vault:'QCB' },
    { rank:15, country:'الكويت',             iso:'KW', tons:79.00,   pct_reserve:'8.2%',  vault:'CBK' },
    { rank:16, country:'كازاخستان',          iso:'KZ', tons:280.65,  pct_reserve:'54.4%', vault:'NBK' },
    { rank:17, country:'أوزبكستان',          iso:'UZ', tons:365.38,  pct_reserve:'67.8%', vault:'CBU' },
    { rank:18, country:'مصر',               iso:'EG', tons:126.56,  pct_reserve:'10.3%', vault:'CBE' },
    { rank:19, country:'المغرب',             iso:'MA', tons:22.07,   pct_reserve:'4.8%',  vault:'BAM' },
    { rank:20, country:'البنك الدولي — IMF', iso:'XX', tons:2814.00, pct_reserve:'حصص SDR', vault:'IMF واشنطن' },
];

// ══════════════════════════════════════════════════════════════════════════════
// ٤. مناجم الذهب والفضة العالمية
// ══════════════════════════════════════════════════════════════════════════════
const GLOBAL_GOLD_MINES = [
    { name:'Muruntau',         country:'أوزبكستان',   annual_tons:100, operator:'Navoi Mining' },
    { name:'Carlin Trend',     country:'الولايات المتحدة', annual_tons:89, operator:'Nevada Gold Mines (Barrick+Newmont)' },
    { name:'Grasberg',         country:'إندونيسيا',   annual_tons:72, operator:'Freeport-McMoRan' },
    { name:'Olimpiada',        country:'روسيا',        annual_tons:50, operator:'Polyus' },
    { name:'Cortez',           country:'الولايات المتحدة', annual_tons:48, operator:'Barrick Gold' },
    { name:'Kibali',           country:'الكونغو',      annual_tons:45, operator:'Barrick Gold' },
    { name:'Boddington',       country:'أستراليا',     annual_tons:42, operator:'Newmont' },
    { name:'Pueblo Viejo',     country:'الدومينيكان',  annual_tons:38, operator:'Barrick + Newmont' },
    { name:'Ad Duwayhi',       country:'المملكة العربية السعودية', annual_tons:22, operator:'Ma\'aden' },
    { name:'Mahd ad Dhahab',   country:'المملكة العربية السعودية', annual_tons:8,  operator:'Ma\'aden — مهد الذهب' },
    { name:'السعودية الإجمالي', country:'المملكة العربية السعودية', annual_tons:55, operator:'معادن + aramco minerals' },
];

const ESTIMATED_WORLD_GOLD_ABOVE_GROUND = {
    total_tons:          208_874,
    jewelry_tons:        96_519,
    private_invest_tons: 46_068,
    central_banks_tons:  35_715,
    use_industry_tons:   30_572,
    note:                'World Gold Council 2025 estimate',
};

// ══════════════════════════════════════════════════════════════════════════════
// ٥. تسعير المطعوم — الحبوب والتمر والملح (كما في الحديث الشريف)
//    «البُرُّ بالبُرِّ، والتَّمرُ بالتَّمرِ، والشَّعيرُ بالشَّعيرِ، والمِلحُ بالمِلحِ»
// ══════════════════════════════════════════════════════════════════════════════
const FOOD_COMMODITY_PRICES = {
    wheat: {
        name_ar: 'البُر (القمح)',
        hadith_ref: '«البر بالبر مثلاً بمثل»',
        unit: 'بوشل (٢٧.٢ كجم)',
        global_usd_per_bushel: 5.85,
        global_usd_per_kg: 0.215,
        saudi_sar_per_kg: 1.10,
        sources: ['CME Chicago Board of Trade', 'FAOSTAT'],
        // سعر الدينار من القمح: كم كجم يساوي دينار واحد؟
        kg_per_dinar_calc: function(dinarUsd) { return (dinarUsd / this.global_usd_per_kg).toFixed(2); },
    },
    barley: {
        name_ar: 'الشعير',
        hadith_ref: '«الشعير بالشعير مثلاً بمثل»',
        unit: 'بوشل (٢١.٨ كجم)',
        global_usd_per_bushel: 3.85,
        global_usd_per_kg: 0.176,
        saudi_sar_per_kg: 0.90,
        sources: ['CME', 'FAOSTAT'],
    },
    dates: {
        name_ar: 'التَّمر',
        hadith_ref: '«التمر بالتمر مثلاً بمثل»',
        unit: 'كيلوجرام',
        global_usd_per_kg: 1.85,   // درجة متوسطة
        saudi_sar_per_kg: 8.50,    // أجود التمور السعودية
        premium_saudi_sar_per_kg: 45.00,  // تمر المدينة العجوة
        sources: ['FAO', 'أسواق المدينة'],
        islamic_note: 'التمر كان وسيط تبادل في المدينة المنورة',
    },
    salt: {
        name_ar: 'المِلح',
        hadith_ref: '«الملح بالملح مثلاً بمثل»',
        unit: 'كيلوجرام',
        global_usd_per_kg: 0.045,
        saudi_sar_per_kg: 0.25,
        sources: ['USGS', 'IHS Markit'],
    },
    rice: {
        name_ar: 'الأرز',
        unit: 'كيلوجرام',
        global_usd_per_kg: 0.53,
        saudi_sar_per_kg: 2.20,
        sources: ['FAO'],
    },
    olive_oil: {
        name_ar: 'زيت الزيتون',
        unit: 'كيلوجرام',
        global_usd_per_kg: 7.20,
        saudi_sar_per_kg: 29.00,
        islamic_note: '«ائتدموا بالزيت» — النبي ﷺ',
        sources: ['IOC International Olive Council'],
    },
};

// ══════════════════════════════════════════════════════════════════════════════
// ٦. الخوارزمية الذكية لتسعير الدينار الإسلامي
//    «أقوى تسعير بالكون» — مبني على الكتاب والسنة + السوق الحقيقي
// ══════════════════════════════════════════════════════════════════════════════
const DINAR_PRICING_ALGORITHM = {
    name: 'خوارزمية تسعير دينار شيخة الإسلامي',
    version: '١.٠',
    foundations: [
        'الأساس الأول: ٤.٢٥ جرام ذهب خالص = ١ دينار (ثابت لا يتغير)',
        'الأساس الثاني: ٢.٩٧٥ جرام فضة خالصة = ١ درهم (ثابت لا يتغير)',
        'الأساس الثالث: سعر الذهب العالمي اللحظي (LBMA Fix)',
        'الأساس الرابع: تعديل الزكاة التلقائي في السعر',
        'الأساس الخامس: اتساق مع سعر المطعوم (inflation hedge)',
    ],
    algo: {
        step1_gold_usd:   'اقرأ سعر الذهب من LBMA: gold_usd_per_oz',
        step2_gram_price: 'احسب السعر لكل جرام: gold_usd_per_oz ÷ 31.1035',
        step3_dinar_usd:  'احسب الدينار: gram_price × 4.25',
        step4_convert:    'حوّل لأي عملة: dinar_usd × fx_rate',
        step5_dirham:     'الدرهم = dinar_usd × (2.975 / 4.25) = dinar_usd × 0.7',
        step6_zakat_check:'إذا رصيد ≥ ٨٥ جرام ذهب → أشعر بالاستحقاق',
        step7_peg_verify: 'تحقق من ثبات النسبة: dirham / dinar = 0.7 (ثابت شرعاً)',
    },
    anti_manipulation: [
        'لا يمكن طباعة الدينار بدون ذهب مقابل',
        'كل دينار في التداول مدعوم بجزء من ذهب مودع',
        'الطرح الجديد يتطلب شراء ذهب فعلي أولاً',
        'Smart Contract على Blockchain يمنع الإصدار الفارغ',
        'تدقيق ربع سنوي على الاحتياطي',
    ],
    hedge_mechanism: {
        description: 'إذا ارتفع التضخم في المطعوم، يرتفع الدينار تلقائياً لأنه مربوط بالذهب تاريخياً يرتفع هو الآخر',
        example: 'ارتفع سعر القمح ٢٠٪ → الذهب تاريخياً يرتفع ٨–١٥٪ → الدينار يرتفع تلقائياً',
    },
};

// ══════════════════════════════════════════════════════════════════════════════
// ٧. خوارزمية الصكوك الذهبية — الشراء الفعلي مقابل الدينار
// ══════════════════════════════════════════════════════════════════════════════
const SUKUK_GOLD_ALGORITHM = {
    name: 'صكوك الذهب الإسلامية — Sheikha Gold Sukuk',
    type: 'مرابحة / إجارة — بدون ربا',
    verse: '﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾',
    mechanism: [
        'المالك يودع ذهباً حقيقياً في خزانة معتمدة (LBMA-certified vault)',
        'شيخة تُصدر صكوكاً تساوي وزن الذهب المودَع تماماً',
        'كل صَكّ = جزء مُسمَّى من ذهب فعلي مُخزَّن',
        'صاحب الصك يملك الذهب — ليس وعداً أو ديناً',
        'بيع الصك = بيع الذهب نفسه — يدًا بيد',
        'لا فائدة — لا ربا — الربح من ارتفاع قيمة الذهب فقط',
    ],
    gold_token_specs: {
        SKD_per_gram:    'SKD1G = ١ جرام ذهب ٢٤ قيراط',
        SKD_dinar:       'SKD_D = ٤.٢٥ جرام = دينار إسلامي كامل',
        SKD_nisab:       'SKD_NZ = ٨٥ جرام = نصاب الزكاة',
        min_purchase:    '٠.١ جرام (أصغر وحدة)',
        max_denomination:'١ كيلوجرام (١٠٠٠ جرام)',
        purity_guarantee:'٩٩٩.٩ / ٢٤ قيراط',
        storage_fee:     '٠.١٥٪ سنوياً — رسم حفظ إسلامي بدون ربا',
    },
    redemption: {
        digital_to_physical: 'طلب تحويل رقمي → شحن ذهب فيزيائي في ٧ أيام عمل',
        forms: ['سبائك ١ جرام', 'سبائك ٥ جرام', 'سبائك ١٠ جرام', 'سبائك ١٠٠ جرام', 'سبائك ١ كجم'],
        delivery_regions: ['المملكة العربية السعودية', 'الإمارات', 'الكويت', 'قطر', 'البحرين', 'عُمان', 'دول BRICS الإسلامية'],
    },
    smart_contract_rules: [
        'إصدار SKD ممنوع بدون إيداع ذهب مقابل (1:1)',
        'الاسترداد الفوري مضمون في وقت السوق',
        'يدًا بيد: كل معاملة تُسوَّى فوراً في نفس الجلسة',
        'تدقيق شرعي تلقائي على كل معاملة',
        'منع بيع ما لا تملك (بيع العَيْن بعد القبض فقط)',
    ],
    sharia_compliance: {
        fatwa_basis: 'المجمع الفقهي الإسلامي + هيئة المحاسبة والمراجعة AAOIFI',
        hadith:      '«الذهب بالذهب مثلاً بمثل يداً بيد»',
        school_consensus: 'الحنفية والمالكية والشافعية والحنابلة — إجماع',
        key_condition: 'التقابض الفوري — الرقمي يعني تسجيل Blockchain آني = قبض شرعي',
    },
};

// ══════════════════════════════════════════════════════════════════════════════
// ٨. قوانين البنك المركزي لسوق شيخة
// ══════════════════════════════════════════════════════════════════════════════
const SHEIKHA_CENTRAL_BANK_LAWS = {
    name: 'لوائح البنك المركزي لسوق شيخة الإسلامي',
    authority: 'هيئة السوق المالية + SAMA + AAOIFI + مجلس الخبراء الشرعي',
    laws: [
        {
            id: 'CBL-01',
            title: 'ربط الدينار بالذهب',
            text: 'كل دينار رقمي صادر يجب أن يقابله ٤.٢٥ جرام ذهب خالص في الخزانة المعتمدة',
            verse: '﴿هَٰذَا عَطَاؤُنَا فَامْنُنْ أَوْ أَمْسِكْ بِغَيْرِ حِسَابٍ﴾',
        },
        {
            id: 'CBL-02',
            title: 'تحريم الربا المطلق',
            text: 'يُحظر أي نظام فائدة على الدينار الرقمي — كل ربح يجب أن يكون من ربح تجاري حقيقي',
            hadith: '«كل ربا موضوع» — خطبة الوداع',
        },
        {
            id: 'CBL-03',
            title: 'التقابض الفوري',
            text: 'كل معاملة بالذهب والفضة تُسوَّى فوراً (T+0) — لا تأجيل في الصرف',
            hadith: '«يداً بيد» — صحيح مسلم ١٥٨٧',
        },
        {
            id: 'CBL-04',
            title: 'الشفافية في الاحتياطي',
            text: 'ينشر سوق شيخة تقريراً يومياً عاماً لحجم الذهب المودَع مقابل الدنانير المُصدَرة',
            principle: 'لا غرر — لا مجهول',
        },
        {
            id: 'CBL-05',
            title: 'الزكاة التلقائية',
            text: 'أي رصيد يبلغ ٨٥ جرام ذهب أو ٥٩٥ جرام فضة يُفعَّل فيه حساب الزكاة (٢.٥٪)',
            verse: '﴿وَفِي أَمْوَالِهِمْ حَقٌّ لِّلسَّائِلِ وَالْمَحْرُومِ﴾',
        },
        {
            id: 'CBL-06',
            title: 'منع الاحتكار',
            text: 'لا يحق لجهة واحدة امتلاك أكثر من ١٪ من إجمالي الدنانير المُصدَرة',
            hadith: '«من احتكر فهو خاطئ»',
        },
        {
            id: 'CBL-07',
            title: 'سعر الصرف العادل',
            text: 'يُحسم سعر الصرف بين الدينار وأي عملة بالسعر اللحظي الموثَّق — لا هامش ظلم',
            principle: 'البيع عن تراضٍ',
        },
        {
            id: 'CBL-08',
            title: 'التكامل مع البنوك الإسلامية',
            text: 'كل بنك إسلامي معتمد يمكنه الانضمام للشبكة وتحويل الدينار مباشرة في حسابات عملائه',
            standard: 'AAOIFI FAS 7 + 28',
        },
        {
            id: 'CBL-09',
            title: 'قابلية التحويل للمعدن الفيزيائي',
            text: 'في أي وقت، يحق لصاحب الدينار الرقمي تحويله لذهب فيزيائي معياري خلال ٧ أيام عمل',
            form: 'سبائك LBMA-Good-Delivery مختومة ومعتمدة',
        },
        {
            id: 'CBL-10',
            title: 'البورصة الإسلامية للمعادن',
            text: 'تدير شيخة بورصة لحظية للذهب والفضة والدرهم والدينار — متاحة ٢٤/٧ — السعر شفاف ومُعلَن',
            benchmark: 'Sheikha Islamic Gold Fix (SIGF)',
        },
    ],
};

// ══════════════════════════════════════════════════════════════════════════════
// ٩. بورصة شيخة العالمية للمعادن والذهب والفضة
// ══════════════════════════════════════════════════════════════════════════════
const SHEIKHA_METALS_EXCHANGE = {
    name: 'بورصة شيخة الإسلامية للمعادن',
    tagline: 'أول بورصة إسلامية للذهب والفضة والدينار والدرهم',
    basis: 'الكتاب والسنة — لا ربا — لا غرر — لا احتكار',
    verse: '﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾',

    instruments: [
        { code:'SKD_D',   name:'دينار شيخة (٤.٢٥ج ذهب)',   type:'gold_backed',   settling:'T+0 فوري' },
        { code:'SKD_S',   name:'درهم شيخة (٢.٩٧٥ج فضة)',  type:'silver_backed', settling:'T+0 فوري' },
        { code:'SKD_1G',  name:'جرام ذهب شيخة',           type:'gold_backed',   settling:'T+0 فوري' },
        { code:'SKD_1S',  name:'جرام فضة شيخة',           type:'silver_backed', settling:'T+0 فوري' },
        { code:'SKD_NZ',  name:'صك نصاب الزكاة (٨٥ج)',    type:'gold_backed',   settling:'T+0 فوري' },
    ],

    pricing_sources: [
        'LBMA Gold AM/PM Fix (لندن)',
        'CME COMEX (نيويورك)',
        'SGX Gold (سنغافورة)',
        'Shanghai Gold Exchange (شنغهاي)',
        'Sheikha SIGF (المتوسط الإسلامي المرجحي)',
    ],

    trading_rules: [
        'التداول ٢٤/٧ — البركة في كل ساعة',
        'لا تداول آجل (فيوتشرز) على المعادن — حرام',
        'لا بيع ما لا تملك (short selling) — محرم',
        'لا هامش ديون (margin trading) — ربا',
        'التسعير اللحظي مُعلَن للجميع بدون تأخير',
        'الحد الأدنى للتداول: ٠.١ جرام',
        'رسوم التداول: ٠.٢٥٪ على كل صفقة → تذهب لصندوق الزكاة',
    ],

    global_integration: {
        payment_rails: ['SWIFT', 'SWIFT GPI', 'ISO 20022', 'CBUAE ICS', 'SAMA SARIE'],
        card_networks: ['Mada (مدى)', 'Apple Pay', 'STCPay', 'Tabby', 'Tamara'],
        banking:       ['البنوك الإسلامية AAOIFI', 'مصرف الراجحي', 'بنك الإنماء', 'HSBC Amanah'],
        trade_finance: ['الاعتمادات المستندية LC', 'الكفالات البنكية', 'أوامر الصرف'],
        blockchain:    ['Ethereum L2', 'Polkadot', 'Hyperledger Fabric (للبنوك)'],
        standards:     ['ISO 4217 (طلب ترميز SKD)', 'AAOIFI Standard 57', 'IFSB-17'],
    },

    recognition_roadmap: [
        {
            step: 1,
            title: 'الاعتماد السعودي المحلي',
            body: 'ترخيص SAMA + هيئة السوق المالية للعملة الرقمية الإسلامية',
            status: 'قيد التنفيذ',
        },
        {
            step: 2,
            title: 'الاعتماد الخليجي',
            body: 'إطار المجلس الخليجي للتعاون + صندوق النقد العربي',
            status: 'مقرر',
        },
        {
            step: 3,
            title: 'الاعتماد الإسلامي الدولي',
            body: 'AAOIFI + IDB + المجمع الفقهي الإسلامي',
            status: 'مقرر',
        },
        {
            step: 4,
            title: 'البورصات العالمية',
            body: 'إدراج في LBMA + CME (رمز SKD) + BRICS Gold Exchange',
            status: 'مستهدف',
        },
        {
            step: 5,
            title: 'العملة الرسمية لدول الأمة',
            body: 'اعتماد ١٣٩+ دولة للدينار كعملة تجارة إسلامية رسمية',
            status: 'رؤية ٢٠٣٠–٢٠٤٠',
        },
    ],
};

// ══════════════════════════════════════════════════════════════════════════════
// ١٠. حاسبة التسعير الذكية
// ══════════════════════════════════════════════════════════════════════════════
class SheikhaGoldPricingEngine {

    getSpotPrices() {
        return {
            ...SPOT_PRICES_BASE,
            gold_per_gram_usd:  +(SPOT_PRICES_BASE.gold_usd_per_oz / SPOT_PRICES_BASE.troy_oz_in_grams).toFixed(4),
            silver_per_gram_usd:+(SPOT_PRICES_BASE.silver_usd_per_oz / SPOT_PRICES_BASE.troy_oz_in_grams).toFixed(4),
            dinar_usd:  +(SPOT_PRICES_BASE.gold_usd_per_oz / SPOT_PRICES_BASE.troy_oz_in_grams * ISLAMIC_WEIGHT_STANDARDS.dinar.weight_grams).toFixed(4),
            dirham_usd: +(SPOT_PRICES_BASE.silver_usd_per_oz / SPOT_PRICES_BASE.troy_oz_in_grams * ISLAMIC_WEIGHT_STANDARDS.dirham.weight_grams).toFixed(4),
            dinar_sar:  +(SPOT_PRICES_BASE.gold_usd_per_oz / SPOT_PRICES_BASE.troy_oz_in_grams * ISLAMIC_WEIGHT_STANDARDS.dinar.weight_grams * 3.75).toFixed(2),
            dirham_sar: +(SPOT_PRICES_BASE.silver_usd_per_oz / SPOT_PRICES_BASE.troy_oz_in_grams * ISLAMIC_WEIGHT_STANDARDS.dirham.weight_grams * 3.75).toFixed(4),
        };
    }

    getWeightStandards()    { return ISLAMIC_WEIGHT_STANDARDS; }
    getGoldByCurrency()     { return GOLD_PRICE_BY_CURRENCY; }
    getSilverByCurrency()   { return SILVER_PRICE_BY_CURRENCY; }
    getGlobalReserves()     { return GLOBAL_GOLD_RESERVES; }
    getGlobalMines()        { return GLOBAL_GOLD_MINES; }
    getWorldGoldStock()     { return ESTIMATED_WORLD_GOLD_ABOVE_GROUND; }
    getFoodPrices()         { return FOOD_COMMODITY_PRICES; }
    getPricingAlgorithm()   { return DINAR_PRICING_ALGORITHM; }
    getSukukAlgorithm()     { return SUKUK_GOLD_ALGORITHM; }
    getCentralBankLaws()    { return SHEIKHA_CENTRAL_BANK_LAWS; }
    getExchange()           { return SHEIKHA_METALS_EXCHANGE; }

    /**
     * احسب قيمة الدينار في أي عملة
     */
    calculateDinarValue(currency = 'SAR') {
        const cur = currency.toUpperCase();
        const gold = GOLD_PRICE_BY_CURRENCY[cur];
        const silver = SILVER_PRICE_BY_CURRENCY[cur];
        if (!gold) return null;
        return {
            currency:     cur,
            dinar_value:  gold.per_dinar,
            dirham_value: silver ? silver.per_dirham : null,
            gold_per_gram: gold.per_gram,
            silver_per_gram: silver ? silver.per_gram : null,
            dinar_weight: `${ISLAMIC_WEIGHT_STANDARDS.dinar.weight_grams}ج ذهب خالص`,
            dirham_weight:`${ISLAMIC_WEIGHT_STANDARDS.dirham.weight_grams}ج فضة خالصة`,
            gold_ratio_to_silver: gold.per_gram / (silver?.per_gram || 1),
            nisab_gold_value:    +(gold.per_gram * 85).toFixed(2),
            nisab_silver_value:  silver ? +(silver.per_gram * 595).toFixed(2) : null,
            hadith: '«الذهب بالذهب... مثلاً بمثل، يداً بيد»',
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * احسب كمية الذهب مقابل كمية نقدية معطاة
     */
    calculateGoldPurchase(amount, currency = 'SAR') {
        const cur = currency.toUpperCase();
        const gold = GOLD_PRICE_BY_CURRENCY[cur];
        if (!gold || !amount || amount <= 0) return null;
        const grams   = +(amount / gold.per_gram).toFixed(4);
        const dinars  = +(grams / ISLAMIC_WEIGHT_STANDARDS.dinar.weight_grams).toFixed(4);
        const skd_tokens = grams; // 1 SKD_1G = 1 gram
        return {
            input_amount:    amount,
            currency:        cur,
            gold_grams:      grams,
            Islamic_dinars:  dinars,
            skd_tokens:      skd_tokens,
            physical_forms:  this._suggestPhysicalForms(grams),
            storage_fee_annual: +(grams * 0.0015 * gold.per_gram).toFixed(4),
            zakat_applicable: grams >= 85,
            zakat_grams:      grams >= 85 ? +(grams * 0.025).toFixed(4) : 0,
            sukuk_type:       'مرابحة ذهب — AAOIFI Standard 28',
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * اقتراح أشكال الذهب الفيزيائي
     */
    _suggestPhysicalForms(grams) {
        const forms = [];
        const denominations = [1000, 100, 50, 10, 5, 1];
        let remaining = grams;
        for (const d of denominations) {
            if (remaining >= d) {
                const count = Math.floor(remaining / d);
                forms.push({ bar_grams: d, count, label: `${count} × سبيكة ${d}ج` });
                remaining = +(remaining % d).toFixed(4);
            }
        }
        if (remaining > 0.1) forms.push({ bar_grams: remaining, count: 1, label: `${remaining}ج كسور` });
        return forms;
    }

    /**
     * حاسبة التسعير الذكية بحسب نوع المنتج
     * «الذهب بالذهب، والفضة بالفضة، والبر بالبر...»
     */
    smartProductPrice(product_type, amount, currency = 'SAR') {
        const cur = currency.toUpperCase();
        const gold   = GOLD_PRICE_BY_CURRENCY[cur]?.per_gram || 0;
        const silver = SILVER_PRICE_BY_CURRENCY[cur]?.per_gram || 0;
        let benchmark, dinar_equivalent, explanation;

        switch (product_type) {
            case 'gold':   case 'jewelry':
                benchmark = `${gold.toFixed(2)} ${cur}/جرام ذهب`;
                dinar_equivalent = +(amount / gold / ISLAMIC_WEIGHT_STANDARDS.dinar.weight_grams).toFixed(4);
                explanation = '«الذهب بالذهب مثلاً بمثل»';
                break;
            case 'silver': case 'silver_jewelry':
                benchmark = `${silver.toFixed(4)} ${cur}/جرام فضة`;
                dinar_equivalent = +(amount / gold / ISLAMIC_WEIGHT_STANDARDS.dinar.weight_grams).toFixed(4);
                explanation = '«الفضة بالفضة مثلاً بمثل»';
                break;
            case 'wheat':  case 'flour':  case 'bread':
                const wpkg = FOOD_COMMODITY_PRICES.wheat.global_usd_per_kg * (GOLD_PRICE_BY_CURRENCY[cur]?.fx_rate || 3.75);
                benchmark = `${wpkg.toFixed(3)} ${cur}/كجم قمح`;
                dinar_equivalent = +(amount / gold / ISLAMIC_WEIGHT_STANDARDS.dinar.weight_grams).toFixed(4);
                explanation = '«البر بالبر مثلاً بمثل»';
                break;
            case 'dates':  case 'tamr':
                const dpkg = FOOD_COMMODITY_PRICES.dates.saudi_sar_per_kg * ((GOLD_PRICE_BY_CURRENCY[cur]?.fx_rate || 1) / 3.75);
                benchmark = `${dpkg.toFixed(2)} ${cur}/كجم تمر`;
                dinar_equivalent = +(amount / gold / ISLAMIC_WEIGHT_STANDARDS.dinar.weight_grams).toFixed(4);
                explanation = '«التمر بالتمر مثلاً بمثل»';
                break;
            case 'metals': case 'scrap':  case 'recycled':
                benchmark = `${gold.toFixed(2)} ${cur}/جرام ذهب (قياس)`;
                dinar_equivalent = +(amount / gold / ISLAMIC_WEIGHT_STANDARDS.dinar.weight_grams).toFixed(4);
                explanation = 'موزون بالذهب — سوق شيخة للمعادن';
                break;
            default:
                benchmark = `${gold.toFixed(2)} ${cur}/جرام ذهب (مرجع افتراضي)`;
                dinar_equivalent = +(amount / gold / ISLAMIC_WEIGHT_STANDARDS.dinar.weight_grams).toFixed(4);
                explanation = 'الذهب مرجع التسعير الإسلامي الشامل';
        }
        return {
            product_type, amount, currency: cur,
            dinar_equivalent, benchmark, explanation,
            hadith: '«الذهب بالذهب، والفضة بالفضة... مثلاً بمثل، يداً بيد»',
            timestamp: new Date().toISOString(),
        };
    }

    getLiveExchangeRates(base = 'SKD_D') {
        const dinarUSD = GOLD_PRICE_BY_CURRENCY['USD'].per_dinar;
        const rates = {};
        for (const [cur, data] of Object.entries(GOLD_PRICE_BY_CURRENCY)) {
            rates[cur] = +(dinarUSD * data.fx_rate).toFixed(6);
        }
        return {
            base,
            base_description: `١ دينار شيخة = ${ISLAMIC_WEIGHT_STANDARDS.dinar.weight_grams}ج ذهب خالص`,
            rates,
            total_currencies: Object.keys(rates).length,
            last_updated: SPOT_PRICES_BASE.last_updated,
        };
    }
}

module.exports = new SheikhaGoldPricingEngine();
