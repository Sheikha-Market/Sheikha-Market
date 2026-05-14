/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 *  📊 SHEIKHA International Consulting Organization — KPI System
 *  منظمة شيخة للاستشارات الدولية — نظام مؤشرات الأداء
 *
 *  ﴿ وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ ﴾ — التوبة: 105
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

// ─── مؤشرات الأداء الرئيسية ───────────────────────────────────────────────────
const KPI_DEFINITIONS = [
    // ─── الأداء التشغيلي ──────────────────────────────────────────────────────
    { id: 'project-delivery-rate',   nameAr: 'معدل تسليم المشاريع في الوقت',    unit: '%',          target: 95,  category: 'operational',  weight: 0.2 },
    { id: 'client-satisfaction',     nameAr: 'مستوى رضا العملاء',               unit: '/10',        target: 8.5, category: 'quality',       weight: 0.2 },
    { id: 'sharia-compliance-rate',  nameAr: 'معدل الامتثال الشرعي',            unit: '%',          target: 100, category: 'compliance',    weight: 0.15 },
    { id: 'active-projects',         nameAr: 'المشاريع النشطة',                  unit: 'مشروع',      target: null, category: 'volume',       weight: 0.1 },
    { id: 'revenue-growth',          nameAr: 'نمو الإيرادات',                   unit: '%/ربع سنة',  target: 15,  category: 'financial',     weight: 0.15 },
    { id: 'knowledge-articles',      nameAr: 'المقالات المعرفية المنشورة',       unit: 'مقال',       target: 20,  category: 'knowledge',     weight: 0.05 },
    { id: 'report-quality-score',    nameAr: 'جودة التقارير',                   unit: '/10',        target: 9.0, category: 'quality',       weight: 0.1 },
    { id: 'supply-chain-optimized',  nameAr: 'سلاسل إمداد محسّنة',              unit: 'سلسلة',      target: null, category: 'impact',       weight: 0.05 },

    // ─── مؤشرات سوق المعادن والسكراب ─────────────────────────────────────────
    { id: 'metals-quality-analyses', nameAr: 'تحليلات جودة المعادن المُنجزة',   unit: 'تحليل',     target: null, category: 'metals-market', weight: 0.0 },
    { id: 'scrap-chains-reviewed',   nameAr: 'سلاسل سكراب تمت مراجعتها',        unit: 'سلسلة',     target: null, category: 'metals-market', weight: 0.0 },
    { id: 'hs-codes-mapped',         nameAr: 'بنود HS Code تم ربطها',           unit: 'بند',       target: null, category: 'hs-intel',      weight: 0.0 },
];

// ─── بيانات KPI التشغيلية (محاكاة مبدئية) ────────────────────────────────────
let _kpiData = {
    'project-delivery-rate':   { value: 96.5,  updatedAt: null },
    'client-satisfaction':     { value: 8.7,   updatedAt: null },
    'sharia-compliance-rate':  { value: 100,   updatedAt: null },
    'active-projects':         { value: 0,     updatedAt: null },
    'revenue-growth':          { value: 0,     updatedAt: null },
    'knowledge-articles':      { value: 0,     updatedAt: null },
    'report-quality-score':    { value: 9.1,   updatedAt: null },
    'supply-chain-optimized':  { value: 0,     updatedAt: null },
    'metals-quality-analyses': { value: 0,     updatedAt: null },
    'scrap-chains-reviewed':   { value: 0,     updatedAt: null },
    'hs-codes-mapped':         { value: 0,     updatedAt: null },
};

// ─── حساب مؤشر الأداء العام ──────────────────────────────────────────────────
function calculateOverallScore() {
    let weightedSum  = 0;
    let totalWeight  = 0;

    for (const kpi of KPI_DEFINITIONS) {
        if (kpi.target === null || kpi.weight === 0) continue;
        const current = _kpiData[kpi.id]?.value ?? 0;
        const score   = Math.min((current / kpi.target) * 100, 100);
        weightedSum  += score * kpi.weight;
        totalWeight  += kpi.weight;
    }

    return totalWeight > 0 ? (weightedSum / totalWeight).toFixed(1) : 0;
}

// ─── الحصول على جميع مؤشرات الأداء ──────────────────────────────────────────
function getAllKPIs() {
    const now = new Date().toISOString();
    return KPI_DEFINITIONS.map(kpi => {
        const data    = _kpiData[kpi.id] || { value: 0 };
        const onTarget = kpi.target ? data.value >= kpi.target : null;
        return {
            ...kpi,
            currentValue: data.value,
            onTarget,
            lastUpdated:  data.updatedAt || now,
        };
    });
}

// ─── تحديث قيمة مؤشر ─────────────────────────────────────────────────────────
function updateKPI(kpiId, value) {
    if (!_kpiData[kpiId]) {
        return { success: false, message: `مؤشر غير موجود: ${kpiId}` };
    }
    _kpiData[kpiId] = { value, updatedAt: new Date().toISOString() };
    return { success: true, kpiId, newValue: value };
}

// ─── مؤشرات حسب الفئة ────────────────────────────────────────────────────────
function getKPIsByCategory(category) {
    return getAllKPIs().filter(k => k.category === category);
}

// ─── ملخص لوحة التحكم ────────────────────────────────────────────────────────
function getDashboardSummary() {
    const all         = getAllKPIs();
    const onTarget    = all.filter(k => k.onTarget === true).length;
    const belowTarget = all.filter(k => k.onTarget === false).length;
    const noTarget    = all.filter(k => k.onTarget === null).length;

    return {
        overallScore:    calculateOverallScore(),
        totalKPIs:       all.length,
        onTarget,
        belowTarget,
        noTarget,
        categories:      [...new Set(KPI_DEFINITIONS.map(k => k.category))],
        kpis:            all,
        generatedAt:     new Date().toISOString(),
    };
}

module.exports = {
    KPI_DEFINITIONS,
    getAllKPIs,
    updateKPI,
    getKPIsByCategory,
    getDashboardSummary,
    calculateOverallScore,
};
