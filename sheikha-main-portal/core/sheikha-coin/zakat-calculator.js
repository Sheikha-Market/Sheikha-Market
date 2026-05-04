// بسم الله الرحمن الرحيم
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║           ZAKAT CALCULATOR — محرك الزكاة التلقائي                          ║
 * ║           يحسب ويُوزِّع الزكاة فور بلوغ النصاب والحول                     ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * «خُذْ مِنْ أَمْوَالِهِمْ صَدَقَةً تُطَهِّرُهُمْ وَتُزَكِّيهِم بِهَا» — التوبة:103
 * «وَفِي أَمْوَالِهِمْ حَقٌّ مَّعْلُومٌ لِّلسَّائِلِ وَالْمَحْرُومِ» — الذاريات:19
 *
 * النصاب والمعدلات (وفق الفقه الإسلامي):
 *   الذهب  : نصاب = 85 جرام ذهب  (~1,600 دولار حالياً) — زكاة 2.5٪
 *   الفضة  : نصاب = 595 جرام فضة (~10 دولار/جرام)     — زكاة 2.5٪
 *   النقود : نصاب = قيمة 85 جرام ذهب                   — زكاة 2.5٪
 *   عروض التجارة: 2.5٪ من صافي القيمة عند الحول
 *
 * المالك: سلمان أحمد بن سلمان الراجح — منظومة شيخة
 */

'use strict';

// ─── Constants ────────────────────────────────────────────────────────────────

const ZAKAT_RATE = 0.025;           // 2.5٪

// النصاب بالريال السعودي (يُحدَّث من أسعار السوق)
const NISAB = {
    GOLD_GRAMS:   85.0,             // جرام ذهب
    SILVER_GRAMS: 595.0,            // جرام فضة
    GOLD_SAR:     24000,            // قيمة 85 جرام ذهب بالريال (تقريبي)
    SILVER_SAR:   2100,             // قيمة 595 جرام فضة بالريال (تقريبي)
};

// مصارف الزكاة الثمانية (التوبة:60)
const ZAKAT_CATEGORIES = [
    { id: 'fuqara',     name: 'الفقراء',           share: 0.125 },
    { id: 'masakeen',   name: 'المساكين',           share: 0.125 },
    { id: 'amileen',    name: 'العاملون عليها',     share: 0.125 },
    { id: 'muallafah',  name: 'المؤلفة قلوبهم',    share: 0.125 },
    { id: 'riqab',      name: 'في الرقاب',          share: 0.125 },
    { id: 'gharimeen',  name: 'الغارمون',           share: 0.125 },
    { id: 'fisabilillah',name:'في سبيل الله',       share: 0.125 },
    { id: 'ibnus-sabil', name: 'ابن السبيل',        share: 0.125 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * الحصول على قيمة النصاب لعملة معينة
 */
function getNisab(currency) {
    switch (currency) {
        case 'SDN': return NISAB.GOLD_SAR / 850;    // ÷ سعر الدينار
        case 'SDH': return NISAB.SILVER_SAR / 3.20; // ÷ سعر الدرهم
        case 'SKC': return NISAB.GOLD_SAR / 10;     // ÷ سعر SKC
        default:    return NISAB.GOLD_SAR;           // بالريال
    }
}

// ─── Core Functions ───────────────────────────────────────────────────────────

/**
 * حساب الزكاة المستحقة
 * @param {number} balance — الرصيد الحالي
 * @param {string} currency — SDH | SDN | SKC | SAR
 * @param {number} [haulDays=365] — عدد أيام الحول
 * @returns {object}
 */
function calculate(balance, currency, haulDays = 365) {
    const nisab    = getNisab(currency);
    const meetsNisab = balance >= nisab;
    const meetsHaul  = haulDays >= 354;   // الحول القمري (354 يوم)

    if (!meetsNisab || !meetsHaul) {
        return {
            due: false,
            balance, currency, nisab, haulDays,
            reason: !meetsNisab
                ? `الرصيد (${balance}) أقل من النصاب (${nisab.toFixed(2)})`
                : 'لم يمر الحول بعد',
        };
    }

    const zakatAmount = parseFloat((balance * ZAKAT_RATE).toFixed(6));
    const distribution = ZAKAT_CATEGORIES.map(cat => ({
        ...cat,
        amount: parseFloat((zakatAmount * cat.share).toFixed(6)),
    }));

    return {
        due: true,
        balance,
        currency,
        nisab: parseFloat(nisab.toFixed(4)),
        haulDays,
        rate: ZAKAT_RATE,
        amount: zakatAmount,
        distribution,
        calculatedAt: new Date().toISOString(),
        quranRef: 'التوبة:60 — إِنَّمَا الصَّدَقَاتُ لِلْفُقَرَاءِ وَالْمَسَاكِينِ...',
        message: `زكاة ${(ZAKAT_RATE * 100).toFixed(1)}٪ مستحقة = ${zakatAmount} ${currency}`,
    };
}

/**
 * التحقق السريع هل الزكاة مستحقة
 */
function checkDue(balance, currency, haulDays = 365) {
    return calculate(balance, currency, haulDays);
}

/**
 * حساب زكاة عروض التجارة
 * @param {object} inventory — { items: [{ value, quantity }] }
 * @param {number} liabilities — الديون والالتزامات
 * @param {string} currency
 */
function calculateTradeZakat(inventory, liabilities, currency) {
    const totalValue = (inventory.items || []).reduce(
        (sum, item) => sum + ((item.value || 0) * (item.quantity || 1)), 0
    );
    const netValue = Math.max(0, totalValue - (liabilities || 0));
    return calculate(netValue, currency);
}

/**
 * زكاة الفطر
 * @param {number} persons — عدد الأشخاص
 * @param {number} pricePerKg — سعر كيلو التمر أو القمح
 */
function calculateFitrahZakat(persons, pricePerKg) {
    const kgPerPerson = 2.5; // تقريباً
    const totalAmount = persons * kgPerPerson * (pricePerKg || 5);
    return {
        type: 'FITRAH',
        persons,
        kgPerPerson,
        pricePerKg: pricePerKg || 5,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        currency: 'SAR',
        message: `زكاة الفطر = ${totalAmount.toFixed(2)} ريال لـ ${persons} أشخاص`,
    };
}

module.exports = {
    calculate,
    checkDue,
    calculateTradeZakat,
    calculateFitrahZakat,
    ZAKAT_RATE,
    NISAB,
    ZAKAT_CATEGORIES,
    getNisab,
};
