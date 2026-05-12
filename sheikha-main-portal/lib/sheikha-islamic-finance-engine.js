'use strict';
// ══════════════════════════════════════════════════════════════════
// محرك التمويل الإسلامي — شيخة
// بسم الله الرحمن الرحيم
// ﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾ — البقرة ٢٧٥
// ══════════════════════════════════════════════════════════════════

// ──────────────────────────────────────────────────────────────────
// ١. صيغ التمويل الإسلامي المعتمدة
// ──────────────────────────────────────────────────────────────────
const FINANCING_MODES = {
    title: 'صيغ التمويل الإسلامي المعتمدة شرعاً',
    modes: [
        {
            id: 'qard_hasan',
            name: 'القرض الحسن',
            arabic: '«مَن ذَا الَّذِي يُقْرِضُ اللَّهَ قَرْضًا حَسَنًا»',
            type: 'تبرعي',
            return: 'صفر — بدون فائدة — للأجر فقط',
            best_for: ['مسلمو الحاجة الشديدة', 'طلاب العلم', 'إعادة التأهيل'],
            sharia_grade: 'واجب — فرض كفاية',
            zakat_eligible: false,
            target_amount_usd_m: 500
        },
        {
            id: 'murabaha',
            name: 'المرابحة',
            arabic: 'البيع بثمن التكلفة + ربح معلوم',
            type: 'تجاري',
            return: 'ربح ثابت معلوم — لا يتغير',
            best_for: ['شراء معادن', 'شراء بضاعة', 'تمويل مخزون'],
            sharia_grade: 'حلال — معتمد من جمهور العلماء',
            zakat_eligible: true,
            target_amount_usd_m: 2000
        },
        {
            id: 'musharaka',
            name: 'المشاركة',
            arabic: 'شركة المضاربة + شركة العنان',
            type: 'استثماري',
            return: 'ربح وخسارة بالنسبة — لا ضمان رأس المال',
            best_for: ['مشاريع ناشئة', 'شركات صغيرة', 'تجارة شراكة'],
            sharia_grade: 'مستحب — روح التجارة الإسلامية',
            zakat_eligible: true,
            target_amount_usd_m: 3000
        },
        {
            id: 'mudaraba',
            name: 'المضاربة',
            arabic: 'رب المال + المضارب — ربح مشترك',
            type: 'استثماري',
            return: 'ربح مشترك بالنسبة المتفق عليها — خسارة على رب المال فقط',
            best_for: ['رجال الأعمال المهرة', 'صناديق الاستثمار الإسلامية'],
            sharia_grade: 'حلال — معتمد بالإجماع',
            zakat_eligible: true,
            target_amount_usd_m: 1500
        },
        {
            id: 'ijara',
            name: 'الإجارة',
            arabic: 'تأجير الأصول مع نقل المنفعة',
            type: 'تأجيري',
            return: 'إيجار ثابت + تمليك نهائي اختياري',
            best_for: ['معدات', 'عقارات', 'مصانع', 'سفن'],
            sharia_grade: 'حلال — بديل شرعي للتأجير التقليدي',
            zakat_eligible: true,
            target_amount_usd_m: 1200
        },
        {
            id: 'sukuk',
            name: 'الصكوك الإسلامية',
            arabic: 'أوراق مالية شرعية مدعومة بأصل حقيقي',
            type: 'سوق رأس المال',
            return: 'عائد من الأصل الحقيقي — لا فائدة',
            best_for: ['حكومات', 'شركات كبرى', 'مشاريع بنية تحتية'],
            sharia_grade: 'حلال — تختلف أنواعها في الدرجة',
            zakat_eligible: true,
            target_amount_usd_m: 5000
        },
        {
            id: 'istisnaa',
            name: 'الاستصناع',
            arabic: 'تمويل التصنيع والمقاولات',
            type: 'إنتاجي',
            return: 'ربح ثابت على المنتج المصنع',
            best_for: ['مشاريع إنشاء', 'مصانع', 'بناء سفن وطائرات'],
            sharia_grade: 'حلال — معتمد لأهل الحرف والصناعة',
            zakat_eligible: true,
            target_amount_usd_m: 800
        },
        {
            id: 'salam',
            name: 'السلم',
            arabic: 'دفع سعر البضاعة مقدماً على تسليم مؤجل معلوم',
            type: 'زراعي-تجاري',
            return: 'خصم سعري مقابل الدفع المقدم',
            best_for: ['المحاصيل الزراعية', 'المواد الخام', 'المعادن'],
            sharia_grade: 'حلال باستثناء من الغرر لمصلحة الزارع',
            zakat_eligible: true,
            target_amount_usd_m: 400
        }
    ]
};

// ──────────────────────────────────────────────────────────────────
// ٢. صناديق التمويل الإسلامي المتخصصة
// ──────────────────────────────────────────────────────────────────
const ISLAMIC_FUNDS = [
    {
        id: 'metals_fund',
        name: 'صندوق المعادن والسكراب الإسلامي',
        sheikha_specialty: true,
        target_usd_m: 300,
        mode: 'murabaha',
        beneficiaries: 'تجار المعادن + شركات السكراب في الدول الإسلامية',
        return_expected_pct: '8-12',
        sharia_structure: 'مرابحة + مشاركة متناقصة'
    },
    {
        id: 'sme_fund',
        name: 'صندوق تمويل المشاريع الصغيرة',
        sheikha_specialty: false,
        target_usd_m: 500,
        mode: 'musharaka',
        beneficiaries: 'أصحاب المشاريع الصغيرة والمتوسطة في ٥٧ دولة OIC',
        return_expected_pct: '6-10',
        sharia_structure: 'مشاركة + مضاربة'
    },
    {
        id: 'agriculture_fund',
        name: 'صندوق الزراعة والأمن الغذائي',
        sheikha_specialty: false,
        target_usd_m: 400,
        mode: 'salam',
        beneficiaries: 'المزارعون في أفريقيا وجنوب آسيا + أمن غذائي',
        return_expected_pct: '5-8',
        sharia_structure: 'سلم + استصناع'
    },
    {
        id: 'infrastructure_sukuk',
        name: 'صكوك البنية التحتية الإسلامية',
        sheikha_specialty: false,
        target_usd_m: 2000,
        mode: 'sukuk',
        beneficiaries: 'مشاريع بنية تحتية في الدول الإسلامية الأقل نمواً',
        return_expected_pct: '4-6',
        sharia_structure: 'صكوك إجارة + استصناع'
    },
    {
        id: 'qard_hasan_fund',
        name: 'صندوق القرض الحسن — للمحتاجين',
        sheikha_specialty: false,
        target_usd_m: 100,
        mode: 'qard_hasan',
        beneficiaries: 'المسلمون المحتاجون + طلاب العلم + المعسرون',
        return_expected_pct: '0 — للأجر فقط',
        sharia_structure: 'قرض حسن خالص'
    },
    {
        id: 'palestine_reconstruction_fund',
        name: 'صندوق إعادة إعمار فلسطين',
        sheikha_specialty: false,
        target_usd_m: 1000,
        mode: 'musharaka',
        beneficiaries: 'فلسطين — أولوية قصوى — فرض عين',
        return_expected_pct: 'فريضة — لا عائد مادي مطلوب',
        sharia_structure: 'مشاركة إسلامية + تبرع'
    }
];

// ──────────────────────────────────────────────────────────────────
// ٣. آلة حاسبة التمويل الإسلامي
// ──────────────────────────────────────────────────────────────────
function calculateMurabaha(cost, profitPct) {
    const profit = cost * (profitPct / 100);
    const totalPrice = cost + profit;
    return {
        costPrice: cost,
        profitMargin: profitPct,
        profitAmount: profit,
        totalSellingPrice: totalPrice,
        mode: 'مرابحة حلال',
        note: 'الثمن ثابت لا يتغير بعد التعاقد — لا ربا'
    };
}

function calculateMusharaka(capital1, capital2, profitSplit1Pct) {
    const totalCapital = capital1 + capital2;
    const split2Pct = 100 - profitSplit1Pct;
    return {
        partner1Capital: capital1,
        partner2Capital: capital2,
        totalCapital,
        partner1Pct: (capital1 / totalCapital * 100).toFixed(1),
        partner2Pct: (capital2 / totalCapital * 100).toFixed(1),
        profitSplit: `${profitSplit1Pct}٪ / ${split2Pct}٪ — متفق عليه`,
        note: 'الخسارة بنسبة رأس المال فقط — الربح بالاتفاق'
    };
}

function calculateZakatOnTrade(stockValue, cashAmount, receivablesCollectable, liabilities) {
    const zakatBase = stockValue + cashAmount + receivablesCollectable - liabilities;
    const nisab_usd = 5950; // قيمة تقريبية للنصاب بالدولار
    const dutyPct = 2.5;
    if (zakatBase <= 0) return { due: false, reason: 'الوعاء صفر أو سالب' };
    if (zakatBase < nisab_usd) return { due: false, reason: 'لم يبلغ النصاب', zakatBase };
    return {
        due: true,
        zakatBase,
        zakatAmount: zakatBase * (dutyPct / 100),
        dutyPct,
        note: '«في كل ما أدير للتجارة زكاة ٢.٥٪ بعد حول الحول»'
    };
}

// ══════════════════════════════════════════════════════════════════
// الكلاس الرئيسي
// ══════════════════════════════════════════════════════════════════
class SheikhaIslamicFinanceEngine {
    constructor() {
        this.identity = {
            name: 'محرك التمويل الإسلامي — شيخة',
            version: '1.0.0',
            verse: '﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾',
            owner: 'سلمان أحمد بن سلمان الراجح'
        };
        this.financingModes = FINANCING_MODES;
        this.islamicFunds = ISLAMIC_FUNDS;
        this.calculators = { murabaha: calculateMurabaha, musharaka: calculateMusharaka, zakatOnTrade: calculateZakatOnTrade };
        this.active = false;
    }

    start() {
        this.active = true;
        console.log(`✅ [IslamicFinance] محرك التمويل الإسلامي يعمل`);
        console.log(`   ${this.financingModes.modes.length} صيغ تمويل | ${this.islamicFunds.length} صناديق`);
        console.log(`   النية: إلغاء الربا من كل المعاملات — البديل الإسلامي الكامل`);
        return this;
    }

    getStatus() {
        return {
            active: this.active,
            name: this.identity.name,
            financingModes: this.financingModes.modes.length,
            funds: this.islamicFunds.length,
            totalTargetFunding: this.islamicFunds.reduce((s, f) => s + f.target_usd_m, 0),
            calculators: Object.keys(this.calculators).length
        };
    }

    getModes() { return this.financingModes; }
    getFunds() { return this.islamicFunds; }

    calculate(type, params) {
        switch (type) {
            case 'murabaha': return calculateMurabaha(params.cost, params.profitPct);
            case 'musharaka': return calculateMusharaka(params.capital1, params.capital2, params.profitSplit1Pct);
            case 'zakat': return calculateZakatOnTrade(params.stock, params.cash, params.receivables, params.liabilities);
            default: return { error: 'نوع الحساب غير موجود' };
        }
    }
}

const islamicFinanceEngine = new SheikhaIslamicFinanceEngine();
module.exports = islamicFinanceEngine;
