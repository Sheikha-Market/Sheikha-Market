'use strict';
// ══════════════════════════════════════════════════════════════════
// محرك الأوقاف الرقمية الإسلامية — شيخة
// بسم الله الرحمن الرحيم
// ﴿لَن تَنَالُوا الْبِرَّ حَتَّىٰ تُنفِقُوا مِمَّا تُحِبُّونَ﴾ — آل عمران ٩٢
// ══════════════════════════════════════════════════════════════════

// ──────────────────────────────────────────────────────────────────
// ١. أنواع الأوقاف الإسلامية
// ──────────────────────────────────────────────────────────────────
const WAQF_TYPES = {
    title: 'أنواع الأوقاف المعتمدة شرعاً',
    hadith: '«إِذَا مَاتَ الإِنسَانُ انقَطَعَ عَنهُ عَمَلُهُ إِلاَّ مِن ثَلاثَةٍ: إِلاَّ مِن صَدَقَةٍ جَارِيَةٍ...» — صحيح مسلم',
    types: [
        {
            id: 'masjid',
            name: 'وقف المساجد',
            icon: '🕌',
            description: 'بناء وصيانة المساجد في كل بقاع العالم — أفضل الوقف',
            digital_form: 'رمز رقمي لكل مسجد — المانح يرى مسجده يبنى',
            priority: 1,
            min_waqf_usd: 1000,
            existing_deficit: '٣ مليار مسلم يحتاجون مساجد'
        },
        {
            id: 'education',
            name: 'وقف التعليم',
            icon: '📚',
            description: 'مدارس + جامعات إسلامية + تحفيظ القرآن + منح دراسية',
            digital_form: 'كل طالب يحمل رمزاً رقمياً يربطه بوقفه',
            priority: 2,
            min_waqf_usd: 500,
            existing_deficit: '٣٠٠ مليون مسلم بلا تعليم حلال'
        },
        {
            id: 'healthcare',
            name: 'وقف الصحة',
            icon: '⚕️',
            description: 'مستشفيات إسلامية + دواء حلال + رعاية المرضى + أطباء الفقراء',
            digital_form: 'وقف طبي يتكاثر بكل علاج مدفوع من ريعه',
            priority: 3,
            min_waqf_usd: 5000,
            existing_deficit: 'مئات الملايين بلا رعاية صحية لائقة'
        },
        {
            id: 'agriculture_water',
            name: 'وقف الماء والزراعة',
            icon: '🌱',
            description: 'آبار + مشاريع ري + زراعة مستدامة + أمن غذائي إسلامي',
            digital_form: 'كل بئر تُحفر تحمل fingerprint رقمية للواقف',
            priority: 4,
            min_waqf_usd: 2000,
            existing_deficit: '١ مليار مسلم يعيشون بشح الماء'
        },
        {
            id: 'industrial_productive',
            name: 'الوقف الإنتاجي',
            icon: '🏭',
            description: 'مصانع + شركات + أراضٍ تجارية — ريعها يذهب لمصارف الوقف',
            digital_form: 'حصص وقفية رقمية في شركات حلال',
            priority: 5,
            min_waqf_usd: 10000,
            existing_deficit: 'الوقف الإنتاجي تقريباً معدوم في الأمة'
        },
        {
            id: 'digital_waqf',
            name: 'الوقف الرقمي المباشر',
            icon: '💻',
            description: 'تطبيقات إسلامية + محتوى قرآني + برامج دعوية — وقف لا يفنى',
            digital_form: 'NFT وقفية + كود مفتوح المصدر إسلامي',
            priority: 6,
            min_waqf_usd: 100,
            existing_deficit: 'المحتوى الإسلامي الرقمي شحيح وغير مموّل'
        },
        {
            id: 'quran_dawah',
            name: 'وقف القرآن والدعوة',
            icon: '📖',
            description: 'طباعة وتوزيع القرآن + ترجمته + دعوة إسلامية عالمية',
            digital_form: 'قرآن رقمي موزع بالمليارات — الثواب للواقف',
            priority: 7,
            min_waqf_usd: 50,
            existing_deficit: 'مليارات يريدون القرآن بلغتهم'
        },
    ]
};

// ──────────────────────────────────────────────────────────────────
// ٢. مصارف ريع الأوقاف (أين يذهب الريع)
// ──────────────────────────────────────────────────────────────────
const WAQF_REVENUE_DISTRIBUTION = {
    title: 'توزيع ريع الأوقاف — وفق الشريعة',
    note: 'الأصل محفوظ — الريع فقط يُوزَّع ويُصرَف',
    distribution: [
        { id: 'poor_muslims', name: 'فقراء المسلمين', pct: 30, priority: 1 },
        { id: 'education', name: 'التعليم الإسلامي', pct: 25, priority: 2 },
        { id: 'healthcare', name: 'الرعاية الصحية', pct: 15, priority: 3 },
        { id: 'masjids', name: 'المساجد والشعائر', pct: 15, priority: 4 },
        { id: 'palestine_gaza', name: 'فلسطين — أولوية ثابتة', pct: 10, priority: 5 },
        { id: 'dawah', name: 'الدعوة والإعلام الإسلامي', pct: 5, priority: 6 }
    ],
    total: 100
};

// ──────────────────────────────────────────────────────────────────
// ٣. الأوقاف الكبرى التاريخية — نحن نحيي تراثهم
// ──────────────────────────────────────────────────────────────────
const HISTORIC_WAQF_INSPIRATIONS = [
    { name: 'وقف ابن طولون — مصر ٨٧٩م', feature: 'مستشفى + مسجد — قرون من الخدمة' },
    { name: 'أوقاف الأزهر الشريف', feature: 'موّل علماء الأمة لأكثر من ١٠٠٠ عام' },
    { name: 'وقف الخيرات — المغرب', feature: 'آلاف الأفدنة لخدمة العلماء والفقراء' },
    { name: 'وقف عثمان بن عفان', feature: 'البئر في المدينة — أول وقف إسلامي موثق' },
    { name: 'أوقاف السلطان سليمان القانوني', feature: 'مستشفيات في كل أرجاء الدولة العثمانية' },
];

// ══════════════════════════════════════════════════════════════════
// الكلاس الرئيسي
// ══════════════════════════════════════════════════════════════════
class SheikhaDigitalAwqafEngine {
    constructor() {
        this.identity = {
            name: 'محرك الأوقاف الرقمية الإسلامية',
            version: '1.0.0',
            hadith: '«إِذَا مَاتَ الإِنسَانُ انقَطَعَ عَنهُ عَمَلُهُ إِلاَّ مِن ثَلاثَةٍ»',
            owner: 'سلمان أحمد بن سلمان الراجح'
        };
        this.waqfTypes = WAQF_TYPES;
        this.revenueDistribution = WAQF_REVENUE_DISTRIBUTION;
        this.historicInspirations = HISTORIC_WAQF_INSPIRATIONS;
        this.active = false;
        this.totalWaqfRegistered = 0;
    }

    start() {
        this.active = true;
        console.log(`✅ [DigitalAwqaf] محرك الأوقاف الرقمية يعمل`);
        console.log(`   ${this.waqfTypes.types.length} أنواع وقف | ٦ مصارف ريع`);
        console.log(`   النية: إحياء الوقف الإسلامي وجعله رقمياً حديثاً`);
        return this;
    }

    getStatus() {
        return {
            active: this.active,
            name: this.identity.name,
            waqfTypes: this.waqfTypes.types.length,
            revenueChannels: this.revenueDistribution.distribution.length,
            totalRegistered: this.totalWaqfRegistered,
            historicInspiration: this.historicInspirations.length
        };
    }

    getAllTypes() { return this.waqfTypes; }
    getRevenueDistribution() { return this.revenueDistribution; }
    getHistoricInspirations() { return this.historicInspirations; }

    estimateWaqfImpact(amount_usd, waqf_type_id, years) {
        const type = this.waqfTypes.types.find(t => t.id === waqf_type_id);
        if (!type) return { error: 'نوع الوقف غير موجود' };
        const annualReturn = amount_usd * 0.07; // 7% ريع تقريبي
        const totalImpact = annualReturn * years;
        return {
            waqfType: type.name,
            principalAmount: amount_usd,
            estimatedAnnualReturn: annualReturn.toFixed(0),
            yearsProjection: years,
            totalImpactUSD: totalImpact.toFixed(0),
            sadaqaJariya: 'نعم — يستمر الأجر بعد الوفاة',
            note: '«الصدقة الجارية» — ثواب لا ينقطع'
        };
    }
}

const digitalAwqafEngine = new SheikhaDigitalAwqafEngine();
module.exports = digitalAwqafEngine;
