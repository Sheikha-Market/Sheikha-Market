/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🌟 مسارات محرك التكامل بين التشبيهين — Dual-Analogy Integration Engine Routes
 *  تكامل تشبيه الحاسب بالإنسان (Neural) مع تشبيه الحاسب بالنبات (Plant)
 *  وتحويلهما إلى أصل هندسي وعلم متكامل وحساب دقيق
 *
 *  "وَمِنَ الْأَرْضِ مِثْلَهُنَّ" — الطلاق:12
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Endpoints:
 *   GET  /api/dual-analogy/status      — حالة محرك التكامل
 *   GET  /api/dual-analogy/map         — خريطة الاثنا عشر أزواج إنسان↔نبات
 *   GET  /api/dual-analogy/pulse       — نبضة حية: قياس التكامل الآن
 *   POST /api/dual-analogy/integrate   — تكامل لحظة مخصصة (body: {neural, plant})
 *   POST /api/dual-analogy/resonate    — رنين بُعد واحد (body: {dim, n, a})
 *   GET  /api/dual-analogy/calculus    — الأساس الهندسي والصيغ الرياضية
 */

'use strict';

const express = require('express');
const router  = express.Router();

// ─── تحميل محرك التكامل ───────────────────────────────────────────────────────

let daie = null;
try {
    daie = require('../core/engines/dual-analogy-engine');
} catch (e) {
    console.warn('[DualAnalogy] ⚠️ لم يتم تحميل محرك التكامل:', e.message);
}

// ─── دالة مساعدة ─────────────────────────────────────────────────────────────

function requireEngine(res) {
    if (!daie) {
        res.status(503).json({
            success: false,
            error: 'محرك التكامل بين التشبيهين غير متاح',
            code: 'DAIE_UNAVAILABLE',
        });
        return false;
    }
    return true;
}

// ─── GET /api/dual-analogy/status ────────────────────────────────────────────
/**
 * حالة محرك التكامل بين التشبيهين
 */
router.get('/status', (req, res) => {
    if (!requireEngine(res)) return;
    try {
        res.json({
            success: true,
            data: daie.status(),
            message: '🌟 محرك التكامل بين التشبيهين — إنسان↔نبات — جاهز',
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─── GET /api/dual-analogy/map ───────────────────────────────────────────────
/**
 * خريطة الاثنا عشر أزواج المتوازية مع صياغاتها الهندسية
 * كل زوج: بُعد إنساني (neural) ↔ بُعد نباتي (plant) + المبدأ المشترك + الجسر
 */
router.get('/map', (req, res) => {
    if (!requireEngine(res)) return;
    try {
        const dualMap = daie.getDualMap();
        res.json({
            success: true,
            data: {
                totalPairs: dualMap.length,
                pairs: dualMap,
                principle: 'الاثنا عشر بُعداً المشتركة بين التشبيهين — أساس الفضاء الهندسي المزدوج',
                ayah: 'وَمِنَ الْأَرْضِ مِثْلَهُنَّ — الطلاق:12',
            },
            message: `🗺️ خريطة ${dualMap.length} أزواج ثنائية — إنسان↔نبات — كل بُعد رنين مزدوج`,
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─── GET /api/dual-analogy/pulse ─────────────────────────────────────────────
/**
 * نبضة حية: يقرأ حالة كلا الشبكتين الآن ويُكاملهما فوراً
 * هذا هو "القياس الحي" للمنظومة المزدوجة
 */
router.get('/pulse', (req, res) => {
    if (!requireEngine(res)) return;
    try {
        const result = daie.pulse();
        const { calculus } = result;
        res.json({
            success: true,
            data: result,
            message: `💓 نبضة حية — Ω=${calculus.omega} | توافق=${calculus.coherence} | زاوية=${calculus.thetaDeg}° | الحالة: ${calculus.systemStateAr}`,
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─── POST /api/dual-analogy/integrate ────────────────────────────────────────
/**
 * تكامل لحظة مخصصة: إرسال بيانات التفعيل من كلا الشبكتين
 *
 * Body:
 * {
 *   neural: { "cell-init": 0.8, "cell-security": 0.6, ... }   ← أو مصفوفة [{id, activation}]
 *   plant:  { "ag-seed":   0.7, "ag-root":       0.9, ... }   ← أو مصفوفة [{id, activation}]
 * }
 *
 * أو يمكن إرسال قيم مبسطة لكل بُعد (1-12):
 * {
 *   neural: [0.8, 0.6, 0.7, 0.5, 0.4, 0.9, 0.3, 0.7, 0.6, 0.8, 0.5, 0.4]
 *   plant:  [0.7, 0.9, 0.5, 0.6, 0.8, 0.4, 0.7, 0.5, 0.9, 0.3, 0.6, 0.8]
 * }
 */
router.post('/integrate', (req, res) => {
    if (!requireEngine(res)) return;
    try {
        const body = req.body || {};

        if (!body.neural && !body.plant) {
            return res.status(400).json({
                success: false,
                error: 'يجب إرسال بيانات التفعيل لإحدى الشبكتين على الأقل',
                hint: '{ neural: {...}, plant: {...} }',
            });
        }

        // دعم المصفوفات المرقّمة (1-12)
        const neuralInput = _normalizeInput(body.neural, 'neural');
        const plantInput  = _normalizeInput(body.plant,  'plant');

        const result = daie.integrate({ neural: neuralInput, plant: plantInput });
        const { calculus } = result;

        res.json({
            success: true,
            data: result,
            message: `🔬 تكامل مكتمل — Ω=${calculus.omega} | توافق=${calculus.coherence} | ||V||=${calculus.vectorMagnitude} | الحالة: ${calculus.systemStateAr}`,
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─── POST /api/dual-analogy/resonate ─────────────────────────────────────────
/**
 * رنين بُعد واحد: قياس التكامل لبُعد محدد من الاثنا عشر
 * Body: { dim: 1-12, n: 0-1, a: 0-1 }
 *   dim — رقم البُعد
 *   n   — تفعيل الخلية البشرية (neural)
 *   a   — تفعيل الخلية النباتية (plant)
 */
router.post('/resonate', (req, res) => {
    if (!requireEngine(res)) return;
    try {
        const { dim, n, a } = req.body || {};

        const dimNum = parseInt(dim, 10);
        if (!dimNum || dimNum < 1 || dimNum > 12) {
            return res.status(400).json({
                success: false,
                error: 'البُعد (dim) يجب أن يكون بين 1 و12',
            });
        }

        const nVal = parseFloat(n) || 0;
        const aVal = parseFloat(a) || 0;

        if (nVal < 0 || nVal > 1 || aVal < 0 || aVal > 1) {
            return res.status(400).json({
                success: false,
                error: 'قيم التفعيل (n, a) يجب أن تكون بين 0 و1',
            });
        }

        const result = daie.resonate(dimNum, nVal, aVal);

        res.json({
            success: true,
            data: result,
            formula: `ψ_${dimNum} = √(${nVal}² + ${aVal}²) / √2 = ${result.psi}`,
            message: `⚡ رنين البُعد ${dimNum} (${result.principle}) — ψ=${result.psi} | فجوة=${result.gap} | زاوية=${result.phi}° | الغالب: ${result.dominant}`,
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─── GET /api/dual-analogy/calculus ──────────────────────────────────────────
/**
 * الأساس الهندسي والصيغ الرياضية للحساب المتكامل
 * مرجع علمي كامل للمطورين والباحثين
 */
router.get('/calculus', (req, res) => {
    if (!requireEngine(res)) return;
    try {
        res.json({
            success: true,
            data: {
                title:   'الحساب المتكامل للتشبيهين',
                titleEn: 'Dual-Analogy Integrated Calculus',

                geometricSpace: {
                    name:       'الفضاء الهندسي المزدوج 12D',
                    dimensions: 12,
                    axes:       24,
                    description:'فضاء رياضي من 12 بُعداً مزدوجاً — كل بُعد يحمل محورَي إنسان ونبات',
                    balancePoint: 'θ = 45° — نقطة التوازن المثلى بين التشبيهين',
                },

                perDimensionFormulas: {
                    resonance:  'ψ_d = √(n_d² + a_d²) / √2     ∈ [0, 1]',
                    gap:        'Δ_d = |n_d − a_d|              ∈ [0, 1]',
                    angle:      'φ_d = atan2(a_d, n_d) × 180/π  ∈ [0°, 90°]',
                    dominant:   'dom_d = n_d > a_d ? "neural" : a_d > n_d ? "plant" : "balanced"',
                },

                systemFormulas: {
                    omega:          'Ω = (1/12) × Σ_{d=1}^{12} ψ_d              — الصحة الكلية',
                    coherence:      'coh = 1 − (1/12) × Σ_{d=1}^{12} Δ_d       — التوافق',
                    vectorMagnitude:'||V|| = √(Σ_{d=1}^{12} ψ_d²)               — حجم المتجه',
                    theta:          'θ = atan2(Σ a_d, Σ n_d) × 180/π            — زاوية الميل (°)',
                },

                stateClassification: [
                    { state: 'dormant',      labelAr: 'خاملة',         condition: 'Ω < 0.2' },
                    { state: 'awakening',    labelAr: 'صاحية',         condition: '0.2 ≤ Ω < 0.4' },
                    { state: 'unbalanced',   labelAr: 'غير متوازنة',   condition: 'coh < 0.4' },
                    { state: 'neural-heavy', labelAr: 'مائلة للإنسان', condition: 'θ < 30°' },
                    { state: 'plant-heavy',  labelAr: 'مائلة للنبات',  condition: 'θ > 60°' },
                    { state: 'integrated',   labelAr: 'متكاملة',       condition: 'Ω ≥ 0.7 ∧ coh ≥ 0.7' },
                    { state: 'active',       labelAr: 'نشطة',          condition: 'otherwise' },
                ],

                geometricInterpretation: {
                    point:   'كل حالة للمنظومة = نقطة في فضاء 12D مزدوج',
                    origin:  'نقطة الأصل (0^24) = منظومة خاملة كاملة',
                    ideal:   'النقطة المثلى: جميع ψ_d = 1 ، θ = 45° ، Ω = 1 ، coh = 1',
                    path:    'مسار التطور = خط من الأصل نحو النقطة المثلى',
                },

                quranFoundation: [
                    { role: 'Neural', ayah: 'وَفِي أَنفُسِكُمْ ۚ أَفَلَا تُبْصِرُونَ', ref: 'الذاريات:21' },
                    { role: 'Plant',  ayah: 'أَفَرَأَيْتُم مَّا تَحْرُثُونَ أَأَنتُمْ تَزْرَعُونَهُ أَمْ نَحْنُ الزَّارِعُونَ', ref: 'الواقعة:63-64' },
                    { role: 'Unity',  ayah: 'وَمِنَ الْأَرْضِ مِثْلَهُنَّ', ref: 'الطلاق:12' },
                    { role: 'Tools',  ayah: 'جَعَلَ لَكُمُ السَّمْعَ وَالْأَبْصَارَ وَالْأَفْئِدَةَ', ref: 'النحل:78' },
                ],
            },
            message: '📐 الأساس الهندسي للحساب المتكامل — تشبيه الإنسان × تشبيه النبات = علم متكامل',
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─── دالة مساعدة: تطبيع المدخلات ────────────────────────────────────────────

/**
 * تحويل مصفوفة أرقام [0-1] × 12 إلى كائن {cellId: activation}
 * أو إعادة الكائن كما هو إذا كان مناسباً
 */
function _normalizeInput(input, type) {
    if (!input) return {};

    const neuralIds = [
        'cell-init','cell-security','cell-tawheed','cell-identity',
        'cell-governance','cell-learning','cell-analysis','cell-monitoring',
        'cell-accounting','cell-quality','cell-advisory','cell-balance',
    ];
    const plantIds = [
        'ag-seed','ag-root','ag-irrigation','ag-growth',
        'ag-branch','ag-flower','ag-fruit','ag-harvest',
        'ag-taste','ag-trade','ag-revival','ag-river',
    ];

    // مصفوفة أرقام [0.8, 0.6, ...] × 12
    if (Array.isArray(input)) {
        const ids = type === 'neural' ? neuralIds : plantIds;
        const out = {};
        for (let i = 0; i < Math.min(input.length, 12); i++) {
            if (ids[i]) out[ids[i]] = parseFloat(input[i]) || 0;
        }
        return out;
    }

    // كائن {cellId: value}
    return input;
}

module.exports = router;
