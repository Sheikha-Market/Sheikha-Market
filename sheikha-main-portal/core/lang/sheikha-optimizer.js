// بسم الله الرحمن الرحيم
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  SHEIKHA OPTIMIZER — محرك حساب الأفضل                                      ║
 * ║  البحث عن الحل الأمثل في ظل القيود الشرعية والهندسية                       ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "وَهُوَ أَعْلَمُ بِالْمُهْتَدِينَ" — القصص:56
 *   الهداية للأمثل — الله وحده يعلم الأفضل على الإطلاق
 *
 * "وَفَوْقَ كُلِّ ذِي عِلْمٍ عَلِيمٌ" — يوسف:76
 *   التواضع في الحساب — كل أمثل نحسبه تقريب لا يقين
 *
 * ─── طرق التحسين / Optimization Methods ─────────────────────────────────────
 *
 * 1. Golden Section Search    — لدالة 1D أحادية المتغير
 * 2. Nelder-Mead Simplex      — لدوال nD متعددة المتغيرات (بدون مشتقات)
 * 3. Grid Search              — بحث شبكي مع ترتيب النتائج
 * 4. Pareto Multi-Objective   — تحسين متعدد الأهداف (Pareto frontier)
 * 5. Constrained Optimization — مع قيود شرعية وهندسية
 * 6. Best-N Selection         — اختيار أفضل N حل من مجموعة
 *
 * ─── واجهة الوحدة / Module Interface ─────────────────────────────────────────
 *
 * minimize(fn, options)           → OptResult
 * maximize(fn, options)           → OptResult
 * goldenSection(fn, a, b, opts)   → OptResult
 * nelderMead(fn, x0, opts)        → OptResult
 * gridSearch(fn, ranges, opts)    → OptResult[]
 * pareto(objectives, candidates)  → ParetoResult
 * bestN(scored, n)                → any[]
 * constrained(fn, constraints, opts) → OptResult
 *
 * المالك: منظومة سوق شيخة™
 */

'use strict';

// ─── حالة الوحدة ─────────────────────────────────────────────────────────────

const MAX_ITER     = 5000;   // أقصى عدد تكرارات (حماية من الحلقات اللانهائية)
const GOLDEN_RATIO = (Math.sqrt(5) - 1) / 2; // φ = 0.618…
const TOLERANCE    = 1e-8;

// ═══════════════════════════════════════════════════════════════════════════════
// ① Golden Section Search — بحث القسم الذهبي (1D)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * إيجاد الحد الأدنى لدالة f(x) في النطاق [a, b]
 * تعقيد: O(log(1/tol))  — لا مشتقات مطلوبة
 *
 * @param {Function} fn     — دالة من x → رقم
 * @param {number}   a      — بداية النطاق
 * @param {number}   b      — نهاية النطاق
 * @param {object}  [opts]
 * @param {number}  [opts.tol=1e-6]  — دقة التقارب
 * @param {number}  [opts.maxIter]   — أقصى تكرارات
 * @returns {{ x, value, iterations, converged }}
 */
function goldenSection(fn, a, b, opts = {}) {
    _validateBounds(a, b);
    const tol     = opts.tol     || 1e-6;
    const maxIter = opts.maxIter || MAX_ITER;

    let lo = Math.min(a, b);
    let hi = Math.max(a, b);
    let iter = 0;

    let x1 = lo + (1 - GOLDEN_RATIO) * (hi - lo);
    let x2 = lo + GOLDEN_RATIO       * (hi - lo);
    let f1 = fn(x1);
    let f2 = fn(x2);

    while ((hi - lo) > tol && iter < maxIter) {
        if (f1 < f2) {
            hi = x2;
            x2 = x1; f2 = f1;
            x1 = lo + (1 - GOLDEN_RATIO) * (hi - lo);
            f1 = fn(x1);
        } else {
            lo = x1;
            x1 = x2; f1 = f2;
            x2 = lo + GOLDEN_RATIO * (hi - lo);
            f2 = fn(x2);
        }
        iter++;
    }

    const x = (lo + hi) / 2;
    return { x, value: fn(x), iterations: iter, converged: (hi - lo) <= tol };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ② Nelder-Mead Simplex — المثلث المتحرك (nD)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * إيجاد الحد الأدنى لدالة f(x₁,…,xₙ) ابتداءً من x0
 * خوارزمية بدون مشتقات — تعمل على أي دالة سلسة أو غير سلسة
 *
 * @param {Function}  fn    — دالة من number[] → رقم
 * @param {number[]}  x0    — نقطة البداية
 * @param {object}   [opts]
 * @param {number}   [opts.tol=1e-6]
 * @param {number}   [opts.maxIter=2000]
 * @param {number}   [opts.step=0.05]   — حجم الخطوة الأولى
 * @returns {{ x, value, iterations, converged }}
 */
function nelderMead(fn, x0, opts = {}) {
    if (!Array.isArray(x0) || x0.length === 0) throw new OptError('x0 يجب أن تكون مصفوفة غير فارغة');
    const n       = x0.length;
    const tol     = opts.tol     || 1e-6;
    const maxIter = opts.maxIter || 2000;
    const step    = opts.step    || 0.05;

    // معاملات النمو والانكماش الكلاسيكية
    const alpha = 1.0;   // انعكاس
    const gamma = 2.0;   // توسع
    const rho   = 0.5;   // انكماش
    const sigma = 0.5;   // انكماش الكامل

    // بناء الرباعي الأولي (simplex)
    let simplex = [x0.slice()];
    for (let i = 0; i < n; i++) {
        const pt = x0.slice();
        pt[i] += step;
        simplex.push(pt);
    }

    let evals = simplex.map(p => fn(p));
    let iter  = 0;

    while (iter < maxIter) {
        // ترتيب
        const order = _argsort(evals);
        simplex = order.map(i => simplex[i]);
        evals   = order.map(i => evals[i]);

        // تحقق التقارب
        const range = evals[evals.length - 1] - evals[0];
        if (Math.abs(range) < tol) break;

        // مركز ثقل النقاط الأفضل (كل النقاط ما عدا الأسوأ)
        const centroid = _centroid(simplex.slice(0, n));

        // انعكاس
        const reflected = _add(centroid, _scale(_sub(centroid, simplex[n]), alpha));
        const fReflected = fn(reflected);

        if (fReflected < evals[0]) {
            // توسع
            const expanded  = _add(centroid, _scale(_sub(reflected, centroid), gamma));
            const fExpanded  = fn(expanded);
            if (fExpanded < fReflected) { simplex[n] = expanded; evals[n] = fExpanded; }
            else                         { simplex[n] = reflected; evals[n] = fReflected; }
        } else if (fReflected < evals[n - 1]) {
            simplex[n] = reflected;
            evals[n]   = fReflected;
        } else {
            // انكماش
            const contracted = _add(centroid, _scale(_sub(simplex[n], centroid), rho));
            const fContracted = fn(contracted);
            if (fContracted < evals[n]) { simplex[n] = contracted; evals[n] = fContracted; }
            else {
                // انكماش كامل نحو الأفضل
                for (let i = 1; i <= n; i++) {
                    simplex[i] = _add(simplex[0], _scale(_sub(simplex[i], simplex[0]), sigma));
                    evals[i]   = fn(simplex[i]);
                }
            }
        }
        iter++;
    }

    // النتيجة
    const bestIdx = _argmin(evals);
    return {
        x:          simplex[bestIdx],
        value:      evals[bestIdx],
        iterations: iter,
        converged:  iter < maxIter,
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ③ Grid Search — البحث الشبكي
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * تقييم الدالة على شبكة من النقاط وإرجاع النتائج مرتبة
 *
 * @param {Function}  fn      — دالة من number[] → رقم
 * @param {Array<[min,max,steps]>} ranges — نطاق كل متغير [من، إلى، خطوات]
 * @param {object}   [opts]
 * @param {number}   [opts.topN=10]    — أفضل N نتيجة
 * @param {boolean}  [opts.minimize]   — هل نبحث عن أدنى (افتراضي: true)
 * @returns {Array<{x, value}>}
 */
function gridSearch(fn, ranges, opts = {}) {
    if (!Array.isArray(ranges) || ranges.length === 0) throw new OptError('ranges يجب أن تكون مصفوفة غير فارغة');
    const topN     = opts.topN     || 10;
    const minimize = opts.minimize !== false;

    // بناء الشبكة
    const axes = ranges.map(([lo, hi, steps = 10]) => {
        const arr = [];
        const n = Math.max(2, Math.min(100, steps));
        for (let i = 0; i < n; i++) arr.push(lo + (hi - lo) * i / (n - 1));
        return arr;
    });

    const results = [];
    _cartesian(axes, (point) => {
        const value = fn(point);
        results.push({ x: point.slice(), value });
    });

    results.sort((a, b) => minimize ? a.value - b.value : b.value - a.value);
    return results.slice(0, topN);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ④ Pareto Multi-Objective — جبهة باريتو
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * إيجاد جبهة باريتو من مجموعة مرشحين بأهداف متعددة
 * المرشح p يسود q إذا كان p أفضل في كل هدف أو متساوياً وأفضل في هدف واحد على الأقل
 *
 * @param {Function[]}  objectives  — دوال الهدف (كل دالة تُعاد تصغيرها)
 * @param {Array}       candidates  — المرشحون (مصفوفة من المتجهات أو أي قيم)
 * @returns {{ frontier, dominated, scores }}
 */
function pareto(objectives, candidates) {
    if (!Array.isArray(objectives) || objectives.length === 0) throw new OptError('objectives يجب أن تكون مصفوفة من الدوال');
    if (!Array.isArray(candidates) || candidates.length === 0) throw new OptError('candidates يجب أن تكون مصفوفة غير فارغة');

    // تقييم جميع المرشحين
    const scores = candidates.map((c, i) => ({
        index:  i,
        candidate: c,
        values: objectives.map(f => f(c)),
    }));

    // إيجاد غير المسودين
    const frontier  = [];
    const dominated = [];

    for (let i = 0; i < scores.length; i++) {
        let isDominated = false;
        for (let j = 0; j < scores.length; j++) {
            if (i === j) continue;
            if (_dominates(scores[j].values, scores[i].values)) {
                isDominated = true;
                break;
            }
        }
        if (isDominated) dominated.push(scores[i]);
        else             frontier.push(scores[i]);
    }

    return { frontier, dominated, scores };
}

/**
 * هل q تسود على r؟ (أقل في كل الأهداف أو مساوٍ مع أفضل في واحد)
 */
function _dominates(q, r) {
    let strictlyBetter = false;
    for (let i = 0; i < q.length; i++) {
        if (q[i] > r[i]) return false; // q أسوأ في هدف واحد → لا سيادة
        if (q[i] < r[i]) strictlyBetter = true;
    }
    return strictlyBetter;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⑤ Constrained Optimization — تحسين مقيّد
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * تحسين مقيّد بقيود متساوية وغير متساوية
 * الطريقة: عقوبة الانتهاك (Penalty Method)
 *
 * @param {Function}  fn          — دالة الهدف
 * @param {object}    constraints
 * @param {Function[]} [constraints.lte]  — يجب أن تكون ≤ 0
 * @param {Function[]} [constraints.eq]   — يجب أن تكون = 0
 * @param {Function[]} [constraints.sharia] — قيود شرعية (boolean → false = انتهاك)
 * @param {object}    opts        — كـ nelderMead
 * @returns {OptResult & { violations }}
 */
function constrained(fn, constraints = {}, opts = {}) {
    const penalty = opts.penalty || 1e6;
    const { lte = [], eq = [], sharia = [] } = constraints;

    function penalizedFn(x) {
        let val = fn(x);

        // قيود ≤ 0
        for (const g of lte) {
            const gv = g(x);
            if (gv > 0) val += penalty * gv * gv;
        }
        // قيود = 0
        for (const h of eq) {
            const hv = h(x);
            val += penalty * hv * hv;
        }
        // قيود شرعية (Boolean)
        for (const s of sharia) {
            if (!s(x)) val += penalty;
        }

        return val;
    }

    const x0   = opts.x0 || (typeof fn === 'function' ? [0] : [0]);
    const result = nelderMead(penalizedFn, x0, opts);

    // فحص الانتهاكات النهائية
    const violations = [];
    for (let i = 0; i < lte.length; i++) {
        const gv = lte[i](result.x);
        if (gv > TOLERANCE) violations.push({ type: 'lte', index: i, value: gv });
    }
    for (let i = 0; i < eq.length; i++) {
        const hv = Math.abs(eq[i](result.x));
        if (hv > TOLERANCE) violations.push({ type: 'eq', index: i, value: hv });
    }
    for (let i = 0; i < sharia.length; i++) {
        if (!sharia[i](result.x)) violations.push({ type: 'sharia', index: i, value: 'انتهاك شرعي' });
    }

    return { ...result, violations, feasible: violations.length === 0 };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⑥ Best-N Selection — اختيار أفضل N
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * اختيار أفضل N عنصر من مجموعة مُسجَّلة
 *
 * @param {Array<{item, score}>} scored  — مصفوفة من {item, score}
 * @param {number} n                     — عدد العناصر المطلوبة
 * @param {boolean} [maximize=true]      — أعلى score هو الأفضل
 * @returns {Array<{item, score, rank}>}
 */
function bestN(scored, n = 3, maximize = true) {
    if (!Array.isArray(scored)) throw new OptError('scored يجب أن تكون مصفوفة');
    const sorted = [...scored].sort((a, b) => maximize ? b.score - a.score : a.score - b.score);
    return sorted.slice(0, Math.max(1, Math.floor(+n))).map((s, i) => ({ ...s, rank: i + 1 }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⑦ Minimize / Maximize — واجهة موحدة
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * تصغير دالة تلقائياً باختيار الطريقة المناسبة
 * @param {Function} fn     — دالة الهدف
 * @param {object}   opts
 * @param {number[]}        [opts.x0]      — نقطة بداية (nD)
 * @param {number[]}        [opts.bounds]  — [a, b] للـ 1D golden section
 * @param {object}          [opts.constraints]
 * @returns {OptResult}
 */
function minimize(fn, opts = {}) {
    if (opts.constraints && (opts.constraints.lte?.length || opts.constraints.eq?.length || opts.constraints.sharia?.length)) {
        return constrained(fn, opts.constraints, opts);
    }
    if (opts.bounds && opts.bounds.length === 2 && !opts.x0) {
        return goldenSection(fn, opts.bounds[0], opts.bounds[1], opts);
    }
    const x0 = opts.x0 || [0];
    return nelderMead(fn, x0, opts);
}

/**
 * تعظيم دالة — يعكس الإشارة ويُصغّر
 * @param {Function} fn
 * @param {object}   opts
 * @returns {OptResult}
 */
function maximize(fn, opts = {}) {
    const neg = typeof fn === 'function' ? (x => -fn(x)) : fn;
    const result = minimize(neg, opts);
    result.value = -result.value;
    return result;
}

// ═══════════════════════════════════════════════════════════════════════════════
// دوال مساعدة / Helpers
// ═══════════════════════════════════════════════════════════════════════════════

function _argsort(arr)      { return arr.map((v,i)=>({v,i})).sort((a,b)=>a.v-b.v).map(x=>x.i); }
function _argmin(arr)       { return arr.reduce((bi,v,i,a)=>v<a[bi]?i:bi,0); }
function _add(a, b)         { return a.map((v,i)=>v+b[i]); }
function _sub(a, b)         { return a.map((v,i)=>v-b[i]); }
function _scale(a, s)       { return a.map(v=>v*s); }
function _centroid(pts)     { const n=pts.length; return pts[0].map((_,i)=>pts.reduce((s,p)=>s+p[i],0)/n); }

function _validateBounds(a, b) {
    if (typeof a !== 'number' || typeof b !== 'number' || a >= b) {
        throw new OptError(`حدود غير صالحة: a=${a}, b=${b} — يجب أن يكون a < b`);
    }
}

/**
 * الضرب الديكارتي لعدة محاور (قيمة واحدة في كل مرة لتوفير الذاكرة)
 */
function _cartesian(axes, callback) {
    const n = axes.length;
    const indices = new Array(n).fill(0);
    const sizes   = axes.map(a => a.length);
    let total = sizes.reduce((p,s)=>p*s,1);
    while (total-- > 0) {
        callback(indices.map((idx, i) => axes[i][idx]));
        // زيادة العداد
        for (let i = n-1; i >= 0; i--) {
            if (++indices[i] < sizes[i]) break;
            indices[i] = 0;
        }
    }
}

class OptError extends Error {
    constructor(msg) { super(msg); this.name = 'OptError'; }
}

// ─── تصدير الوحدة ────────────────────────────────────────────────────────────

module.exports = {
    minimize,
    maximize,
    goldenSection,
    nelderMead,
    gridSearch,
    pareto,
    bestN,
    constrained,
    OptError,
    GOLDEN_RATIO,
};
