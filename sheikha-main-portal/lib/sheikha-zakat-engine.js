'use strict';

/**
 * sheikha-zakat-engine.js
 * محرك الزكاة التجارية والمعادن الشامل — منظومة شيخة
 * المرحلة ٤١ — زكاة المال التجاري والمعادن والسكراب والعروض
 * الأساس: القرآن الكريم + السنة النبوية + إجماع الفقهاء
 * بسم الله الرحمن الرحيم
 */

// ─────────────────────────────────────────────────────────────
// النصاب الشرعي (معتمد هيئة كبار العلماء والمجمع الفقهي)
// ─────────────────────────────────────────────────────────────
// النصاب: 85 جرام ذهب عيار 24 — أو ما يعادله من الفضة: 595 جرام
// المعتمد اليوم: نصاب الفضة لأنه أنفع للفقراء (رأي الجمهور المعاصر)

const NISAB = {
    gold_grams: 85,          // جرام ذهب 24 قيراط
    silver_grams: 595,       // جرام فضة خالصة
    // الأسعار التقديرية (SAR) — تُحدَّث من API الأسعار
    gold_price_per_gram_sar: 290,   // سعر الذهب للجرام بالريال
    silver_price_per_gram_sar: 3.5, // سعر الفضة للجرام بالريال
    // النصاب بالريال
    get nisab_by_gold_sar() { return this.gold_grams * this.gold_price_per_gram_sar; },
    get nisab_by_silver_sar() { return this.silver_grams * this.silver_price_per_gram_sar; },
    // المعتمد في شيخة: نصاب الفضة (الأنفع للفقراء — قول الجمهور المعاصر)
    get recommended_nisab_sar() { return this.nisab_by_silver_sar; },
    note: 'النصاب المعتمد في شيخة: الفضة — لأنه أنفع للفقراء وهو قول الجمهور المعاصر'
};

const ZAKAT_RATE = 0.025; // ربع العشر — 2.5%

// ─────────────────────────────────────────────────────────────
// الأدلة الشرعية
// ─────────────────────────────────────────────────────────────
const SHARIA_DALEEL = {
    quran: [
        { ref: 'التوبة:103', text: 'خُذْ مِنْ أَمْوَالِهِمْ صَدَقَةً تُطَهِّرُهُمْ وَتُزَكِّيهِمْ بِهَا', context: 'فريضة الزكاة على الأموال — أساس الحكم' },
        { ref: 'البقرة:267', text: 'يَا أَيُّهَا الَّذِينَ آمَنُوا أَنْفِقُوا مِنْ طَيِّبَاتِ مَا كَسَبْتُمْ وَمِمَّا أَخْرَجْنَا لَكُمْ مِنَ الْأَرْضِ', context: 'زكاة المكسب التجاري وما أخرجته الأرض' },
        { ref: 'التوبة:34-35', text: 'وَالَّذِينَ يَكْنِزُونَ الذَّهَبَ وَالْفِضَّةَ وَلَا يُنْفِقُونَهَا فِي سَبِيلِ اللَّهِ فَبَشِّرْهُمْ بِعَذَابٍ أَلِيمٍ', context: 'وعيد مانع زكاة الذهب والفضة والمعادن' },
        { ref: 'الذاريات:19', text: 'وَفِي أَمْوَالِهِمْ حَقٌّ لِلسَّائِلِ وَالْمَحْرُومِ', context: 'حق الفقراء في مال التاجر والمعدني' }
    ],
    hadith: [
        { ref: 'صحيح البخاري', text: 'في الرِّقَّةِ رُبُعُ العُشْرِ', context: 'نسبة الزكاة: 2.5% على النقود والعروض بالقياس' },
        { ref: 'أبو داود والنسائي — وصحح الألباني', text: 'في كل عشرين ديناراً نصف دينار، وفي الأربعين دينار دينار', context: 'نصاب الذهب: 20 ديناراً = 85 جرام ذهب اليوم' },
        { ref: 'رواه أبو داود', text: 'خُذِ الصَّدَقَةَ مِنَ أَغْنِيَائِهِمْ فَرُدَّهَا إِلَى فُقَرَائِهِمْ', context: 'وجوب إيصال الزكاة لمستحقيها في مجتمع المعاملين' },
        { ref: 'سنن أبي داود — صحيح', text: 'أَدُّوا زَكَاةَ أَمْوَالِكُمْ — وفي لفظ: في العروض المُعَدَّة للتجارة', context: 'زكاة عروض التجارة — المعادن والسكراب المعدة للبيع' }
    ],
    ijmaa: [
        'أجمع الفقهاء على وجوب الزكاة في عروض التجارة إذا بلغت النصاب وحال عليها الحول',
        'نصاب الذهب: 85 جراماً عيار 24 — معتمد المجمع الفقهي الدولي',
        'نصاب الفضة: 595 جراماً — مذهب الحنفية والمالكية ويُعمل به اليوم لنفعه للفقراء',
        'يُزكَّى السكراب والمعادن المشتراة للتجارة — بالقيمة السوقية يوم الحول لا يوم الشراء',
        'مصارف الزكاة ثمانية كما في آية التوبة:60 — الفقراء أولاً ثم في سبيل الله'
    ]
};

// ─────────────────────────────────────────────────────────────
// أنواع الزكاة المتعلقة بمنظومة شيخة
// ─────────────────────────────────────────────────────────────
const ZAKAT_TYPES = [
    {
        id: 'trade_goods',
        name: 'زكاة عروض التجارة',
        name_en: 'Trade Goods Zakat',
        applies_to: ['بضاعة معدة للبيع', 'سكراب يُعرض للبيع', 'معادن للتجارة', 'مخزون تجاري'],
        basis: 'القيمة السوقية يوم الحول',
        rate: 0.025,
        conditions: [
            'النية: أن تكون معدة للبيع (ليس للاستخدام)',
            'بلوغ النصاب: قيمة المخزون ≥ نصاب الفضة (ريال)',
            'حولان الحول: مرور سنة هجرية كاملة',
            'الملك التام: يملكها التاجر ملكاً حقيقياً'
        ],
        what_to_include: ['البضاعة في المستودع', 'البضاعة في الطريق (إذا اشترتها)', 'الذمم المدينة المؤكدة التحصيل'],
        what_to_exclude: ['الآلات والمعدات', 'العقارات غير المعدة للتجارة', 'الديون المعدومة'],
        calculation_method: 'القيمة السوقية × 2.5%',
        sheikha_note: 'سكراب الحديد والنحاس والألومنيوم المشترى للبيع يدخل في عروض التجارة وجوباً'
    },
    {
        id: 'cash_receivables',
        name: 'زكاة النقود والذمم',
        name_en: 'Cash & Receivables Zakat',
        applies_to: ['نقود في الصندوق', 'أرصدة بنكية حلال', 'ذمم مدينة مؤكدة'],
        basis: 'القيمة الاسمية',
        rate: 0.025,
        conditions: [
            'بلوغ النصاب',
            'حولان الحول',
            'أن تكون النقود فائضة عن الحاجة الأصلية'
        ],
        what_to_include: ['الكاش في الخزنة', 'الأرصدة الجارية', 'الشيكات المستحقة'],
        what_to_exclude: ['رأس المال الثابت المستخدم في التشغيل', 'الديون المشكوك فيها'],
        calculation_method: '(النقود + الذمم المؤكدة) × 2.5%',
        sheikha_note: 'أموال شيخة في الحسابات البنكية تُؤدَّى عنها الزكاة في أول كل عام هجري'
    },
    {
        id: 'gold_silver',
        name: 'زكاة الذهب والفضة',
        name_en: 'Gold & Silver Zakat',
        applies_to: ['ذهب احتياطي', 'فضة', 'مجوهرات تجارية', 'سبائك'],
        basis: 'القيمة السوقية بالجرام',
        rate: 0.025,
        conditions: [
            'بلوغ النصاب: 85 جرام ذهب أو 595 جرام فضة',
            'حولان الحول بالتقويم الهجري',
            'الإعداد للتجارة أو الادخار (ليس للحِلية المستعملة فعلاً)'
        ],
        what_to_include: ['السبائك الذهبية', 'الفضة الخام', 'الذهب التجاري'],
        what_to_exclude: ['حلي المرأة المستعمل فعلاً — خلاف فقهي (الأحوط الزكاة)'],
        calculation_method: 'وزن الجرامات × سعر السوق × 2.5%',
        nisab_note: 'نصاب الذهب: 85 جرام × سعر الجرام | نصاب الفضة: 595 جرام × سعر الجرام',
        sheikha_note: 'سبائك الذهب والفضة في مستودعات شيخة — تُزكَّى بالقيمة السوقية يوم الحول'
    },
    {
        id: 'scrap_metals',
        name: 'زكاة السكراب والمعادن الصناعية',
        name_en: 'Scrap & Industrial Metals Zakat',
        applies_to: ['حديد سكراب', 'نحاس سكراب', 'ألومنيوم', 'فولاذ', 'رصاص', 'زنك', 'نيكل', 'مواد غير حديدية'],
        basis: 'القيمة السوقية يوم إتمام الحول',
        rate: 0.025,
        conditions: [
            'أن يكون مشترى بنية إعادة البيع (عروض تجارة)',
            'بلوغ قيمته النصاب',
            'حولان الحول الهجري'
        ],
        what_to_include: ['كل كميات السكراب المشتراة للبيع بأي نوع'],
        what_to_exclude: ['المعدات المستخدمة في التشغيل (آلات الفرز والكسارات)'],
        calculation_method: 'وزن الطن × سعر الطن بالسوق × 2.5%',
        sheikha_note: 'أساس سوق شيخة — يُعرض كل تاجر سكراب كمياته ويُحسب الحول من يوم الشراء',
        metal_types: {
            ferrous: ['حديد', 'فولاذ', 'صلب', 'cast iron'],
            non_ferrous: ['نحاس', 'ألومنيوم', 'رصاص', 'زنك', 'نيكل', 'قصدير', 'تيتانيوم'],
            precious: ['ذهب', 'فضة', 'بلاتين', 'بالاديوم']
        }
    },
    {
        id: 'accounts_payable',
        name: 'معالجة الديون في الزكاة',
        name_en: 'Debt Handling in Zakat',
        applies_to: ['قروض على التاجر', 'مستحقات للموردين', 'أقساط متبقية'],
        basis: 'تُطرح الديون الحالة من الأصول الزكوية',
        rate: 0.025,
        conditions: [
            'تُطرح الديون الحالة فقط (المستحقة الدفع خلال العام)',
            'لا تُطرح الديون المؤجلة لأكثر من عام',
            'الأصل: تُطرح الديون من الزكاة — قول الجمهور'
        ],
        calculation_method: '(الأصول الزكوية − الديون الحالة) × 2.5%',
        sheikha_note: 'قرض التاجر من مورد يُطرح من وعاء الزكاة — القرض الإسلامي (مرابحة/مشاركة) يُطرح كذلك'
    }
];

// ─────────────────────────────────────────────────────────────
// المصارف الثمانية (التوبة:60)
// ─────────────────────────────────────────────────────────────
const ZAKAT_RECIPIENTS = [
    { id: 'fuqara', name: 'الفقراء', priority: 1, detail: 'من لا يجد كفايته — أول المستحقين' },
    { id: 'masakeen', name: 'المساكين', priority: 1, detail: 'من يجد بعض حاجته لا كلها' },
    { id: 'amileen', name: 'العاملون عليها', priority: 2, detail: 'جامعو الزكاة والمصرف الشرعي' },
    { id: 'muallafa', name: 'المؤلفة قلوبهم', priority: 3, detail: 'من يُرجى إسلامه أو يُخشى شره' },
    { id: 'riqab', name: 'في الرقاب', priority: 2, detail: 'تحرير العبيد — يُحمل اليوم على إعانة المديونين والمكرهين' },
    { id: 'gharimeen', name: 'الغارمون', priority: 2, detail: 'المديونون لغير معصية ولا يستطيعون السداد' },
    { id: 'fisabilillah', name: 'في سبيل الله', priority: 2, detail: 'الجهاد + نشر الدعوة + مشاريع التعليم الإسلامي' },
    { id: 'ibn_sabil', name: 'ابن السبيل', priority: 2, detail: 'المسافر المنقطع عن ماله' }
];

// ─────────────────────────────────────────────────────────────
// معادن شيخة وأسعارها التقديرية (SAR/طن)
// ─────────────────────────────────────────────────────────────
const SHEIKHA_METALS_PRICES = {
    // المعادن الحديدية (Ferrous)
    scrap_steel_heavy: { name: 'حديد سكراب ثقيل', price_sar_ton: 1400, unit: 'طن' },
    scrap_steel_light: { name: 'حديد سكراب خفيف', price_sar_ton: 1200, unit: 'طن' },
    cast_iron: { name: 'حديد زهر', price_sar_ton: 900, unit: 'طن' },
    steel_rebar: { name: 'حديد تسليح (مستعمل)', price_sar_ton: 1600, unit: 'طن' },
    // المعادن غير الحديدية (Non-Ferrous)
    copper_bare: { name: 'نحاس عاري (Bare Bright)', price_sar_ton: 38000, unit: 'طن' },
    copper_mixed: { name: 'نحاس مشكل', price_sar_ton: 30000, unit: 'طن' },
    aluminium_cast: { name: 'ألومنيوم مصهور', price_sar_ton: 7500, unit: 'طن' },
    aluminium_sheet: { name: 'ألومنيوم شيت', price_sar_ton: 8500, unit: 'طن' },
    lead: { name: 'رصاص', price_sar_ton: 6000, unit: 'طن' },
    zinc: { name: 'زنك', price_sar_ton: 9000, unit: 'طن' },
    stainless_304: { name: 'ستانلس ستيل 304', price_sar_ton: 12000, unit: 'طن' },
    brass: { name: 'نحاس أصفر (برونز/لاتون)', price_sar_ton: 25000, unit: 'طن' },
    // المعادن الثمينة
    gold_24k: { name: 'ذهب عيار 24', price_sar_gram: 290, unit: 'جرام' },
    silver_pure: { name: 'فضة خالصة', price_sar_gram: 3.5, unit: 'جرام' }
};

// ─────────────────────────────────────────────────────────────
// حاسبة الزكاة — المنطق الأساسي
// ─────────────────────────────────────────────────────────────

/**
 * حساب زكاة عروض التجارة (سكراب، بضاعة، نقود)
 * @param {object} params
 * @param {number} params.trade_goods_value   - قيمة البضاعة بالريال
 * @param {number} params.cash               - النقود والأرصدة بالريال
 * @param {number} params.receivables        - الذمم المدينة المؤكدة بالريال
 * @param {number} params.debts_due          - الديون الحالة المستحقة بالريال
 * @param {string} params.nisab_type         - 'gold' | 'silver' (default: silver)
 * @param {number} params.gold_price_gram    - سعر الذهب/جرام (اختياري)
 * @param {number} params.silver_price_gram  - سعر الفضة/جرام (اختياري)
 */
function calculateTradeZakat(params) {
    const {
        trade_goods_value = 0,
        cash = 0,
        receivables = 0,
        debts_due = 0,
        nisab_type = 'silver',
        gold_price_gram = NISAB.gold_price_per_gram_sar,
        silver_price_gram = NISAB.silver_price_per_gram_sar
    } = params;

    // تحديث أسعار النصاب إن أُرسلت
    const nisab_gold = NISAB.gold_grams * gold_price_gram;
    const nisab_silver = NISAB.silver_grams * silver_price_gram;
    const nisab_value = nisab_type === 'gold' ? nisab_gold : nisab_silver;

    // الوعاء الإجمالي
    const gross_assets = trade_goods_value + cash + receivables;
    // الوعاء الصافي (بعد طرح الديون الحالة)
    const net_zakatable = Math.max(0, gross_assets - debts_due);
    // هل بلغ النصاب؟
    const reaches_nisab = net_zakatable >= nisab_value;
    // مقدار الزكاة
    const zakat_amount = reaches_nisab ? net_zakatable * ZAKAT_RATE : 0;

    return {
        success: true,
        inputs: { trade_goods_value, cash, receivables, debts_due, nisab_type },
        calculation: {
            gross_assets: Math.round(gross_assets),
            debts_deducted: Math.round(debts_due),
            net_zakatable: Math.round(net_zakatable),
            nisab_used: nisab_type,
            nisab_value: Math.round(nisab_value),
            reaches_nisab,
            zakat_rate: '2.5%',
            zakat_amount: Math.round(zakat_amount)
        },
        verdict: reaches_nisab
            ? `✅ تجب الزكاة — المقدار: ${Math.round(zakat_amount).toLocaleString('ar-SA')} ريال`
            : `❌ لا تجب — الوعاء (${Math.round(net_zakatable).toLocaleString('ar-SA')} ر) لم يبلغ النصاب (${Math.round(nisab_value).toLocaleString('ar-SA')} ر)`,
        note: 'يُشترط حولان الحول الهجري للوجوب — هذا الحساب تقديري للتخطيط المالي'
    };
}

/**
 * حساب زكاة المعادن المحددة (بالطن أو بالجرام)
 * @param {Array} metals - [{ metal_id, quantity, unit }]
 */
function calculateMetalsZakat(metals = []) {
    let total_value = 0;
    const breakdown = [];

    for (const item of metals) {
        const metalData = SHEIKHA_METALS_PRICES[item.metal_id];
        if (!metalData) {
            breakdown.push({ metal_id: item.metal_id, error: 'معدن غير موجود في القاعدة' });
            continue;
        }
        let value = 0;
        if (metalData.unit === 'طن') {
            value = (item.quantity || 0) * metalData.price_sar_ton;
        } else if (metalData.unit === 'جرام') {
            value = (item.quantity || 0) * (metalData.price_sar_gram || 0);
        }
        total_value += value;
        breakdown.push({
            metal_id: item.metal_id,
            name: metalData.name,
            quantity: item.quantity,
            unit: metalData.unit,
            price_sar: metalData.unit === 'طن' ? metalData.price_sar_ton : metalData.price_sar_gram,
            total_sar: Math.round(value)
        });
    }

    const nisab_value = NISAB.recommended_nisab_sar;
    const reaches_nisab = total_value >= nisab_value;
    const zakat_amount = reaches_nisab ? total_value * ZAKAT_RATE : 0;

    return {
        success: true,
        breakdown,
        total_value_sar: Math.round(total_value),
        nisab_value_sar: Math.round(nisab_value),
        reaches_nisab,
        zakat_amount_sar: Math.round(zakat_amount),
        verdict: reaches_nisab
            ? `✅ تجب الزكاة — ${Math.round(zakat_amount).toLocaleString('ar-SA')} ريال`
            : `❌ لا تجب — لم يبلغ النصاب`,
        note: 'الأسعار تقديرية — يُعتمد سعر السوق يوم إتمام الحول'
    };
}

/**
 * حساب زكاة الذهب والفضة بالجرام
 */
function calculatePreciousMetalsZakat(params) {
    const { gold_grams = 0, silver_grams = 0, gold_price = NISAB.gold_price_per_gram_sar, silver_price = NISAB.silver_price_per_gram_sar } = params;
    const gold_value = gold_grams * gold_price;
    const silver_value = silver_grams * silver_price;
    const total = gold_value + silver_value;
    const nisab_gold = NISAB.gold_grams * gold_price;
    const nisab_silver = NISAB.silver_grams * silver_price;
    const reaches_gold = total >= nisab_gold;
    const reaches_silver = total >= nisab_silver;
    const zakat_amount = reaches_silver ? total * ZAKAT_RATE : 0;
    return {
        success: true,
        gold: { grams: gold_grams, price_per_gram: gold_price, value_sar: Math.round(gold_value) },
        silver: { grams: silver_grams, price_per_gram: silver_price, value_sar: Math.round(silver_value) },
        total_sar: Math.round(total),
        nisab_gold_sar: Math.round(nisab_gold),
        nisab_silver_sar: Math.round(nisab_silver),
        reaches_nisab_gold: reaches_gold,
        reaches_nisab_silver: reaches_silver,
        zakat_amount_sar: Math.round(zakat_amount),
        verdict: reaches_silver
            ? `✅ تجب الزكاة — ${Math.round(zakat_amount).toLocaleString('ar-SA')} ريال`
            : `❌ لم تبلغ النصاب`,
        recommendation: reaches_silver !== reaches_gold
            ? 'تنبيه: بلغت نصاب الذهب دون الفضة أو العكس — يُعمل بنصاب الفضة الأنفع للفقراء'
            : ''
    };
}

/**
 * خطة توزيع الزكاة على المصارف الثمانية
 */
function distributeZakat(total_zakat_sar = 0, priorities = {}) {
    if (total_zakat_sar <= 0) return { success: false, message: 'لا مبلغ للتوزيع' };
    // التوزيع الافتراضي (يمكن تعديله)
    const default_distribution = {
        fuqara: 0.40,      // 40% للفقراء — الأولوية
        masakeen: 0.25,    // 25% للمساكين
        gharimeen: 0.15,   // 15% للغارمين
        fisabilillah: 0.10, // 10% في سبيل الله (تعليم إسلامي، دعوة)
        ibn_sabil: 0.05,   // 5% لابن السبيل
        amileen: 0.05      // 5% للعاملين على الزكاة
    };
    const dist = { ...default_distribution, ...priorities };
    const result = [];
    let allocated = 0;
    for (const [key, ratio] of Object.entries(dist)) {
        const recipient = ZAKAT_RECIPIENTS.find(r => r.id === key);
        const amount = Math.round(total_zakat_sar * ratio);
        allocated += amount;
        result.push({
            id: key,
            name: recipient ? recipient.name : key,
            ratio: `${(ratio * 100).toFixed(0)}%`,
            amount_sar: amount
        });
    }
    return {
        success: true,
        total_zakat_sar: Math.round(total_zakat_sar),
        allocated_sar: allocated,
        distribution: result
    };
}

/**
 * تقويم الحول الهجري — حساب تاريخ استحقاق الزكاة
 */
function calculateHawlDate(purchase_date_gregorian) {
    // تحويل تقريبي: السنة الهجرية = 354.37 يوم
    const HIJRI_YEAR_DAYS = 354.37;
    const start = new Date(purchase_date_gregorian);
    const due = new Date(start.getTime() + HIJRI_YEAR_DAYS * 24 * 60 * 60 * 1000);
    const today = new Date();
    const days_remaining = Math.round((due - today) / (1000 * 60 * 60 * 24));
    return {
        success: true,
        purchase_date: start.toISOString().split('T')[0],
        zakat_due_date: due.toISOString().split('T')[0],
        days_remaining: days_remaining,
        is_due: days_remaining <= 0,
        status: days_remaining <= 0
            ? '🔴 الزكاة مستحقة الآن'
            : days_remaining <= 30
                ? `🟡 الزكاة مستحقة خلال ${days_remaining} يوم`
                : `🟢 الزكاة مستحقة بعد ${days_remaining} يوم`
    };
}

// ─────────────────────────────────────────────────────────────
// إحصائيات المحرك
// ─────────────────────────────────────────────────────────────
function getEngineStats() {
    return {
        zakat_types: ZAKAT_TYPES.length,
        metal_types: Object.keys(SHEIKHA_METALS_PRICES).length,
        recipients: ZAKAT_RECIPIENTS.length,
        quran_refs: SHARIA_DALEEL.quran.length,
        hadith_refs: SHARIA_DALEEL.hadith.length,
        ijmaa_points: SHARIA_DALEEL.ijmaa.length,
        nisab_gold_grams: NISAB.gold_grams,
        nisab_silver_grams: NISAB.silver_grams,
        nisab_gold_sar: NISAB.nisab_by_gold_sar,
        nisab_silver_sar: NISAB.nisab_by_silver_sar,
        recommended_nisab: 'silver',
        zakat_rate: '2.5%',
        engine_version: '1.0.0',
        phase: 41
    };
}

module.exports = {
    getEngineStats,
    getNisab: () => NISAB,
    getZakatTypes: () => ZAKAT_TYPES,
    getZakatRecipients: () => ZAKAT_RECIPIENTS,
    getMetalsPrices: () => SHEIKHA_METALS_PRICES,
    getShariaBase: () => SHARIA_DALEEL,
    calculateTradeZakat,
    calculateMetalsZakat,
    calculatePreciousMetalsZakat,
    distributeZakat,
    calculateHawlDate
};
