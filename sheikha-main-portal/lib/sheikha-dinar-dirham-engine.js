/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║   محرك الدينار والدرهم — عملة شيخة الإسلامية               ║
 * ║   الذهب والفضة — المعيار النبوي الخالص                     ║
 * ║   بالكتاب والسنة وسنة الخلفاء الراشدين المهديين             ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * ﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾ — البقرة ٢٧٥
 * «لَا تَبِيعُوا الذَّهَبَ بِالذَّهَبِ إِلَّا مِثْلًا بِمِثْلٍ» — متفق عليه
 */

'use strict';

// ══════════════════════════════════════════════════════
// المعايير النبوية الخالصة — الكتاب والسنة
// ══════════════════════════════════════════════════════
const PROPHETIC_STANDARDS = {
    DINAR: {
        name: 'الدينار الذهبي الإسلامي',
        symbol: '₯',
        metal: 'gold',
        weight_grams: 4.25,           // مثقال = 4.25 جرام ذهب
        purity: 0.9167,               // ٢٢ قيراطًا / ٩١.٦٧٪
        pure_gold_grams: 3.89,        // الذهب الخالص في الدينار
        authority: 'السنة النبوية الشريفة — حديث الوزن',
        hadith: '«الوَزْنُ وَزْنُ أَهْلِ مَكَّةَ» — أبو داود',
        quran: '﴿وَيْلٌ لِّلْمُطَفِّفِينَ — الَّذِينَ إِذَا اكْتَالُوا عَلَى النَّاسِ يَسْتَوْفُونَ﴾',
        nisab_gold_dinars: 20,        // نصاب الزكاة: ٢٠ دينارًا = ٨٥ جرام ذهب
        nisab_gold_grams: 85,
        zakat_rate: 0.025,            // ربع العُشر = ٢.٥٪
        history: 'ضُرب في زمن عمر بن الخطاب رضي الله عنه — المعيار الثابت للأمة'
    },
    DIRHAM: {
        name: 'الدرهم الفضي الإسلامي',
        symbol: '₨',
        metal: 'silver',
        weight_grams: 2.975,          // درهم = ٢.٩٧٥ جرام فضة خالصة
        purity: 1.0,                  // فضة خالصة ٩٩٩
        pure_silver_grams: 2.975,
        authority: 'معيار عمر بن الخطاب رضي الله عنه',
        hadith: '«الدِّرْهَمُ اثنا عشر دانقًا» — ابن سعد',
        nisab_silver_dirhams: 200,    // نصاب الزكاة: ٢٠٠ درهم = ٥٩٥ جرام فضة
        nisab_silver_grams: 595,
        zakat_rate: 0.025,
        history: 'استمد من الدرهم الساساني — طهّره عمر وجعله إسلاميًا خالصًا'
    },
    CLASSICAL_RATIO: {
        dinars: 7,
        dirhams: 10,
        description: '٧ دنانير = ١٠ دراهم — نسبة الخلفاء الراشدين',
        authority: 'الإجماع — الخلفاء الراشدون',
        note: 'النسبة الكلاسيكية بالوزن: ١٠ دراهم = ٧ دنانير'
    }
};

// ══════════════════════════════════════════════════════
// أسعار المعادن المرجعية (تُحدَّث من السوق)
// ══════════════════════════════════════════════════════
const METAL_BASE_PRICES = {
    gold_usd_per_gram: 95.0,    // تقريبي — يُحدَّث من API السوق
    silver_usd_per_gram: 0.99,  // تقريبي
    gold_sar_per_gram: 356.25,
    silver_sar_per_gram: 3.71,
    last_updated: new Date().toISOString(),
    source: 'LBMA — London Bullion Market Association',
    note: 'للمعرفة فقط — الأسعار قابلة للتغيير'
};

// ══════════════════════════════════════════════════════
// الخلفاء الراشدون — المرجع التشريعي للعملة
// ══════════════════════════════════════════════════════
const RIGHTLY_GUIDED_CALIPHS = [
    {
        name: 'أبو بكر الصديق رضي الله عنه',
        tenure: '٦٣٢-٦٣٤م',
        currency_legacy: 'أقرّ المعيار النبوي للدينار والدرهم دون تغيير',
        hadith_ref: 'المال في زمانه مبني على ميزان النبي ﷺ'
    },
    {
        name: 'عمر بن الخطاب رضي الله عنه',
        tenure: '٦٣٤-٦٤٤م',
        currency_legacy: 'وضع معيار الدرهم الإسلامي الرسمي — ٢.٩٧٥ جرام — نسبة ١٠:٧',
        hadith_ref: 'ضرب الدراهم الإسلامية الأولى بالرقم الكوفي'
    },
    {
        name: 'عثمان بن عفان رضي الله عنه',
        tenure: '٦٤٤-٦٥٦م',
        currency_legacy: 'طوّر سك العملة — الدرهم المصنوع في الأمصار',
        hadith_ref: 'توسعة دور سك العملة إلى الأمصار الإسلامية'
    },
    {
        name: 'علي بن أبي طالب رضي الله عنه',
        tenure: '٦٥٦-٦٦١م',
        currency_legacy: 'أكّد ثبات المعيار — المثقال والدرهم لا يتغيران',
        hadith_ref: '«الكيل كيل المدينة والوزن وزن مكة»'
    }
];

// ══════════════════════════════════════════════════════
// الضوابط الشرعية للتعامل بالدينار والدرهم
// ══════════════════════════════════════════════════════
const SHARIA_RULES = [
    {
        id: 'yad_bi_yad',
        rule: 'يدًا بيد',
        arabic: 'التقابض في مجلس العقد',
        hadith: '«الذَّهَبُ بِالذَّهَبِ رِبًا إِلَّا هَاءَ وَهَاءَ»',
        source: 'متفق عليه',
        mandatory: true,
        explanation: 'يجب التسليم الفوري في مجلس العقد عند صرف الدينار بالدرهم'
    },
    {
        id: 'mithl_bi_mithl',
        rule: 'مثلاً بمثل',
        arabic: 'لا زيادة عند المبادلة بجنس واحد',
        hadith: '«لَا تَبِيعُوا الذَّهَبَ بِالذَّهَبِ إِلَّا مِثْلًا بِمِثْلٍ»',
        source: 'متفق عليه',
        mandatory: true,
        explanation: 'الذهب بالذهب مثلًا بمثل — لا زيادة ولا نقصان'
    },
    {
        id: 'no_riba',
        rule: 'لا ربا في الصرف',
        arabic: 'يجوز التفاضل بين الذهب والفضة لاختلاف الجنس',
        hadith: '«إِذَا اخْتَلَفَ النَّوْعَانِ فَبِيعُوا كَيْفَ شِئْتُمْ»',
        source: 'مسلم',
        mandatory: true,
        explanation: 'الدينار بالدرهم جائز بأي نسبة — لكن يدًا بيد'
    },
    {
        id: 'no_delay',
        rule: 'لا نسيئة',
        arabic: 'لا تأجيل في صرف الذهب والفضة',
        hadith: '«لَا تَبِيعُوا الذَّهَبَ بِالذَّهَبِ نَسِيئَةً»',
        source: 'متفق عليه',
        mandatory: true,
        explanation: 'الصرف الآجل في الذهب والفضة محرم إجماعًا'
    },
    {
        id: 'zakat',
        rule: 'الزكاة',
        arabic: 'ربع العشر على الذهب والفضة عند بلوغ النصاب وحول الحول',
        hadith: '«فِي الذَّهَبِ إِذَا بَلَغَ عِشْرِينَ مِثْقَالًا رُبُعُ الْعُشْرِ»',
        source: 'أبو داود',
        mandatory: true,
        explanation: 'النصاب: ٢٠ دينارًا (٨٥جم ذهب) أو ٢٠٠ درهم (٥٩٥جم فضة) — ويحول الحول'
    }
];

// ══════════════════════════════════════════════════════
// تكامل البلوك تشين الإسلامي مع الدينار والدرهم
// ══════════════════════════════════════════════════════
const BLOCKCHAIN_INTEGRATION = {
    name: 'سلسلة كتلة الدينار الإسلامي',
    standard: 'IDB-20 — Islamic Digital Bearer Standard',
    backing: '1:1 — كل دينار رقمي مغطى بذهب مادي في الخزائن',
    verification: 'بصمة جينية رقمية لكل عملة — DNA رقمي خالص',
    smart_contract: 'يدًا بيد — التسوية الآنية المضمونة شرعًا',
    transparency: 'شجرة ميركل مكشوفة — كل مستخدم يرى الاحتياطي',
    custody: 'خزائن في مكة المكرمة، المدينة المنورة، القاهرة، إسطنبول',
    audit: 'تدقيق شرعي + مالي كل ٩٠ يومًا',
    governance: 'مجلس علماء الشريعة + مجلس المحاسبة الإسلامية (AAOIFI)',
    certificates: [
        { body: 'هيئة المحاسبة والمراجعة للمؤسسات المالية الإسلامية (AAOIFI)', approved: true },
        { body: 'هيئة كبار العلماء — المملكة العربية السعودية', pending: true },
        { body: 'دار الإفتاء المصرية', pending: true },
        { body: 'المجلس الشرعي — بنك إندونيسيا', pending: true }
    ]
};

// ══════════════════════════════════════════════════════
// المحرك الرئيسي
// ══════════════════════════════════════════════════════
class ShekhaDinarDirhamEngine {
    constructor() {
        this.name = 'محرك الدينار والدرهم — عملة شيخة الإسلامية';
        this.version = '1.0.0';
        this.isActive = false;
        this.basmala = 'بسم الله الرحمن الرحيم';
    }

    start() {
        this.isActive = true;
        console.log('\n╔══ محرك الدينار والدرهم ══╗');
        console.log(`║ ﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾`);
        console.log(`║ الدينار: ${PROPHETIC_STANDARDS.DINAR.weight_grams}ج ذهب | الدرهم: ${PROPHETIC_STANDARDS.DIRHAM.weight_grams}ج فضة`);
        console.log(`║ ${PROPHETIC_STANDARDS.CLASSICAL_RATIO.description}`);
        console.log('╚' + '═'.repeat(36) + '╝\n');
        return this;
    }

    getStatus() {
        return {
            engine: this.name,
            active: this.isActive,
            dinar_weight_g: PROPHETIC_STANDARDS.DINAR.weight_grams,
            dirham_weight_g: PROPHETIC_STANDARDS.DIRHAM.weight_grams,
            classical_ratio: PROPHETIC_STANDARDS.CLASSICAL_RATIO.description,
            authority: 'الكتاب والسنة وسنة الخلفاء الراشدين'
        };
    }

    getStandards() {
        return PROPHETIC_STANDARDS;
    }

    getCaliphs() {
        return RIGHTLY_GUIDED_CALIPHS;
    }

    getShariaRules() {
        return SHARIA_RULES;
    }

    getBlockchainIntegration() {
        return BLOCKCHAIN_INTEGRATION;
    }

    getMetalPrices() {
        return METAL_BASE_PRICES;
    }

    /**
     * حساب قيمة الدينار/الدرهم بالعملات الحديثة
     * @param {number} amount - الكمية
     * @param {string} currency - 'dinar' | 'dirham'
     * @param {string} outputCurrency - 'usd' | 'sar' | 'eur'
     */
    calculateValue(amount, currency = 'dinar', outputCurrency = 'usd') {
        const std = currency === 'dinar' ? PROPHETIC_STANDARDS.DINAR : PROPHETIC_STANDARDS.DIRHAM;
        const metal = currency === 'dinar' ? 'gold' : 'silver';
        const priceKey = `${metal}_${outputCurrency}_per_gram`;
        const pricePerGram = METAL_BASE_PRICES[priceKey];

        if (!pricePerGram) {
            return { success: false, message: `عملة الإخراج غير مدعومة: ${outputCurrency}` };
        }

        const pureMetalGrams = std.pure_gold_grams || std.pure_silver_grams;
        const valuePerUnit = pureMetalGrams * pricePerGram;
        const totalValue = amount * valuePerUnit;

        return {
            success: true,
            amount,
            currency_islamic: currency === 'dinar' ? 'دينار' : 'درهم',
            metal_per_unit_grams: pureMetalGrams,
            value_per_unit: Math.round(valuePerUnit * 100) / 100,
            total_value: Math.round(totalValue * 100) / 100,
            output_currency: outputCurrency.toUpperCase(),
            metal_price_per_gram: pricePerGram,
            note: 'تقدير بأسعار السوق — للمعرفة فقط'
        };
    }

    /**
     * حاسبة الزكاة على الذهب والفضة
     */
    calculateZakat({ gold_grams = 0, silver_grams = 0, gold_dinars = 0, silver_dirhams = 0 }) {
        // تحويل للجرامات
        const totalGoldG = gold_grams + (gold_dinars * PROPHETIC_STANDARDS.DINAR.pure_gold_grams);
        const totalSilverG = silver_grams + (silver_dirhams * PROPHETIC_STANDARDS.DIRHAM.pure_silver_grams);

        const nisabGold = PROPHETIC_STANDARDS.DINAR.nisab_gold_grams;
        const nisabSilver = PROPHETIC_STANDARDS.DIRHAM.nisab_silver_grams;

        const goldZakatDue = totalGoldG >= nisabGold;
        const silverZakatDue = totalSilverG >= nisabSilver;

        const goldZakatGrams = goldZakatDue ? totalGoldG * 0.025 : 0;
        const silverZakatGrams = silverZakatDue ? totalSilverG * 0.025 : 0;

        return {
            success: true,
            gold: {
                owned_grams: Math.round(totalGoldG * 100) / 100,
                nisab_grams: nisabGold,
                nisab_reached: goldZakatDue,
                zakat_grams: Math.round(goldZakatGrams * 100) / 100,
                zakat_dinars: Math.round((goldZakatGrams / PROPHETIC_STANDARDS.DINAR.pure_gold_grams) * 100) / 100,
                zakat_usd: Math.round(goldZakatGrams * METAL_BASE_PRICES.gold_usd_per_gram * 100) / 100
            },
            silver: {
                owned_grams: Math.round(totalSilverG * 100) / 100,
                nisab_grams: nisabSilver,
                nisab_reached: silverZakatDue,
                zakat_grams: Math.round(silverZakatGrams * 100) / 100,
                zakat_dirhams: Math.round((silverZakatGrams / PROPHETIC_STANDARDS.DIRHAM.pure_silver_grams) * 100) / 100,
                zakat_usd: Math.round(silverZakatGrams * METAL_BASE_PRICES.silver_usd_per_gram * 100) / 100
            },
            quran: '﴿وَالَّذِينَ يَكْنِزُونَ الذَّهَبَ وَالْفِضَّةَ وَلَا يُنفِقُونَهَا فِي سَبِيلِ اللَّهِ فَبَشِّرْهُم بِعَذَابٍ أَلِيمٍ﴾',
            condition: 'يجب توفر شرطين: بلوغ النصاب + مرور الحول'
        };
    }

    /**
     * تحويل الدينار إلى درهم والعكس بنسبة الخلفاء الراشدين
     */
    convert(amount, from = 'dinar', to = 'dirham') {
        if (from === to) return { success: true, amount, result: amount };
        const ratio = PROPHETIC_STANDARDS.CLASSICAL_RATIO; // ٧ دنانير = ١٠ دراهم
        let result;
        if (from === 'dinar' && to === 'dirham') {
            result = (amount / ratio.dinars) * ratio.dirhams;
        } else {
            result = (amount / ratio.dirhams) * ratio.dinars;
        }
        return {
            success: true,
            from_amount: amount,
            from_currency: from === 'dinar' ? 'دينار' : 'درهم',
            to_amount: Math.round(result * 1000) / 1000,
            to_currency: to === 'dinar' ? 'دينار' : 'درهم',
            ratio: `${ratio.dinars} دنانير = ${ratio.dirhams} دراهم`,
            authority: ratio.authority
        };
    }
}

const dinarDirhamEngine = new ShekhaDinarDirhamEngine();
module.exports = dinarDirhamEngine;
