// بسم الله الرحمن الرحيم
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  SHEIKHA RUNTIME — بيئة التشغيل المتكاملة                                  ║
 * ║  تجمع: SHL + المُحسِّن + جميع محركات شيخة في بيئة تشغيل موحدة            ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ" — الأنبياء:30
 *   الماء = البيئة — كل شيء يحيا ببيئة مناسبة
 *
 * "وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا" — البقرة:31
 *   الأسماء = الـ API — كل محرك يُعرَّف باسم في البيئة
 *
 * ─── ما توفره بيئة التشغيل / What Runtime Provides ─────────────────────────
 *
 * • SHL Interpreter      — تشغيل كود شيخة سكريبت مباشرة
 * • Optimizer binding    — استخدام المُحسِّن من داخل SHL
 * • Neural cells         — قراءة/كتابة خلايا الشبكة العصبية
 * • Agricultural cells   — قراءة/كتابة خلايا الشبكة الزراعية
 * • Dual-analogy engine  — حسابات التكامل بين التشبيهين
 * • Market engine        — بيانات السوق والأسعار
 * • Sharia compliance    — فحص الامتثال الشرعي
 * • Session storage      — تخزين المتغيرات بين الجلسات
 * • Execution history    — سجل التنفيذ
 * • Sandbox safety       — حماية من الكود الضار
 *
 * ─── واجهة الوحدة / Module Interface ─────────────────────────────────────────
 *
 * createRuntime(opts?)     → Runtime
 * runtime.run(code)        → ExecResult
 * runtime.optimize(opts)   → OptResult
 * runtime.status()         → RuntimeStatus
 * runtime.reset()          → void
 * runtime.loadScript(name) → void
 * runtime.listBuiltins()   → string[]
 *
 * المالك: منظومة سوق شيخة™
 */

'use strict';

const path  = require('path');

// ─── تحميل وحدات اللغة والتحسين ─────────────────────────────────────────────

const shl = require('./sheikha-lang');
const opt = require('./sheikha-optimizer');

// ─── تحميل محركات شيخة (آمن — لا يوقف التشغيل عند فشل) ─────────────────────

function _safeLoad(p, name) {
    try { return require(p); }
    catch (e) { console.warn(`[SHL-RT] ⚠️ ${name} غير متاح: ${e.message}`); return null; }
}

const neuralCells = _safeLoad('../neural/neural-cells',            'خلايا عصبية');
const agncn       = _safeLoad('../neural-root-network/agricultural-ncn', 'خلايا زراعية');
const daie        = _safeLoad('../engines/dual-analogy-engine',    'DAIE');

// ─── مكتبة النصوص المدمجة (Scripts Library) ─────────────────────────────────
//
// نصوص SHL جاهزة للتشغيل — يمكن استدعاؤها باسمها
//
const STDLIB = {
    'demo': `
# مثال توضيحي — SHL Demo
let omega = psi(0.8, 0.6)
اطبع("رنين البُعد 1:", omega)
let balanced = psi(0.7071, 0.7071)
اطبع("رنين متوازن (45°):", balanced)
let health = avg([0.8, 0.6, 0.7, 0.9, 0.5, 0.8])
اطبع("صحة المنظومة:", health)
if health > 0.7 فإن "ممتاز" وإلا "يحتاج تحسين"
`,
    'market-health': `
# فحص صحة السوق
let n1 = neural(1)
let n6 = neural(6)
let a1 = plant(1)
let a7 = plant(7)
let stability = psi(n1, a1)
let growth = psi(n6, a7)
let market_score = avg([stability, growth]) * 100
اطبع("درجة صحة السوق:", round(market_score, 2), "%")
if market_score >= 70 فإن "سوق صحي" وإلا if market_score >= 40 فإن "سوق متوسط" وإلا "سوق ضعيف"
`,
    'dual-pulse': `
# نبضة التكامل الثنائي
let p = pulse()
اطبع("Ω =", p.omega)
اطبع("توافق =", p.coherence)
اطبع("الحالة:", p.systemStateAr)
p
`,
    'sharia-check': `
# فحص شرعي
let product = "تمر مدينة"
let ok = halal(product)
اطبع("المنتج:", product)
اطبع("حلال؟", ok)
if ok فإن "مسموح" وإلا "محظور"
`,
    'pareto-example': `
# مثال باريتو للتحسين المتعدد الأهداف
# يحتاج استخدام endpoint الـ optimize مباشرة
اطبع("مثال باريتو: أرسل طلب POST /api/lang/optimize")
اطبع("مع method: pareto وobjectives محددة")
"راجع توثيق /api/lang/builtins"
`,
};

// ═══════════════════════════════════════════════════════════════════════════════
// ① مُنشئ بيئة التشغيل
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * إنشاء بيئة تشغيل متكاملة جديدة
 * @param {object} [opts]
 * @param {object} [opts.globals]      — متغيرات عامة إضافية
 * @param {number} [opts.maxOutputLines=200]
 * @param {number} [opts.maxExecTime=5000]  — مللي ثانية
 */
function createRuntime(opts = {}) {
    const maxOutput  = opts.maxOutputLines || 200;
    const maxExecMs  = opts.maxExecTime    || 5000;

    // جلسة التشغيل — المتغيرات تبقى بين الاستدعاءات
    let _sessionEnv  = null;
    const _history   = [];
    let _runCount    = 0;
    let _createdAt   = new Date().toISOString();

    function _getEnv() {
        if (!_sessionEnv) _sessionEnv = _buildEnv(opts.globals || {});
        return _sessionEnv;
    }

    // ─── تشغيل كود SHL ──────────────────────────────────────────────────────

    /**
     * تشغيل نص كود SHL
     * @param {string} source
     * @returns {{ value, output, env, error?, durationMs }}
     */
    function run(source) {
        if (typeof source !== 'string') return { error: 'المصدر يجب أن يكون نصاً', output: [], value: null, durationMs: 0 };
        if (source.trim().length === 0)  return { error: 'الكود فارغ',             output: [], value: null, durationMs: 0 };

        const env     = _getEnv();
        const t0      = Date.now();
        _runCount++;

        const result  = shl.run(source, env);
        const durationMs = Date.now() - t0;

        // قطع المخرجات الطويلة
        const output = (result.output || []).slice(-maxOutput);

        const record = {
            id:       _runCount,
            source:   source.slice(0, 500), // حفظ أول 500 حرف فقط
            value:    result.value,
            output,
            error:    result.error || null,
            durationMs,
            timestamp: new Date().toISOString(),
        };
        _history.push(record);
        if (_history.length > 100) _history.shift();

        return record;
    }

    // ─── المُحسِّن من داخل بيئة التشغيل ────────────────────────────────────

    /**
     * تشغيل مُحسِّن مباشرة (بدون SHL)
     * @param {object} params
     * @param {string} [params.method]    — 'minimize'|'maximize'|'golden'|'nelder'|'grid'|'pareto'|'bestN'
     * @param {string} [params.fn]        — كود SHL يُقيّم الدالة (يستقبل x أو x[0]…)
     * @param {*}      [params.opts]      — خيارات الطريقة
     * @returns {{ result, method, durationMs, error? }}
     */
    function optimize(params = {}) {
        const t0     = Date.now();
        const method = params.method || 'minimize';

        try {
            let result;

            // إذا كانت الدالة نص SHL، حوّله لدالة JS
            const fnCode = params.fn;
            if (fnCode && typeof fnCode === 'string') {
                const fn = _shlToFn(fnCode);
                const mopts = { ...params.opts };
                if (method === 'minimize')  result = opt.minimize(fn, mopts);
                else if (method === 'maximize') result = opt.maximize(fn, mopts);
                else if (method === 'golden')   result = opt.goldenSection(fn, params.a || 0, params.b || 1, mopts);
                else if (method === 'nelder')   result = opt.nelderMead(fn, params.x0 || [0], mopts);
                else if (method === 'grid')     result = opt.gridSearch(fn, params.ranges || [[0,1,10]], mopts);
                else throw new Error(`طريقة غير معروفة: ${method}`);
            }
            // bestN — لا يحتاج دالة
            else if (method === 'bestN') {
                result = opt.bestN(params.scored || [], params.n || 3, params.maximize !== false);
            }
            // pareto — أهداف متعددة
            else if (method === 'pareto') {
                const objectives = (params.objectives || []).map(code => _shlToFn(code));
                result = opt.pareto(objectives, params.candidates || []);
            }
            else {
                throw new Error(`طريقة غير معروفة أو معاملات مفقودة: ${method}`);
            }

            return { result, method, durationMs: Date.now() - t0 };
        } catch (e) {
            return { error: e.message, method, durationMs: Date.now() - t0 };
        }
    }

    // ─── تحميل نص مدمج ──────────────────────────────────────────────────────

    function loadScript(name) {
        const src = STDLIB[name];
        if (!src) throw new Error(`نص غير موجود: '${name}' — المتاح: ${Object.keys(STDLIB).join(', ')}`);
        return run(src);
    }

    // ─── إعادة تهيئة الجلسة ─────────────────────────────────────────────────

    function reset() {
        _sessionEnv = null;
        _history.length = 0;
        _runCount = 0;
        _createdAt = new Date().toISOString();
    }

    // ─── قائمة المدمجات ──────────────────────────────────────────────────────

    function listBuiltins() {
        const env = _buildEnv({});
        const builtins = [];
        for (const [k, v] of env._vars) {
            if (typeof v === 'function') builtins.push(k);
        }
        return builtins.sort();
    }

    // ─── حالة بيئة التشغيل ───────────────────────────────────────────────────

    function status() {
        return {
            runtime:     'Sheikha Language Runtime',
            nameAr:      'بيئة تشغيل لغة شيخة',
            version:     '1.0.0',
            createdAt:   _createdAt,
            runCount:    _runCount,
            historySize: _history.length,
            engines: {
                shl:     true,
                optimizer: true,
                neural:  !!neuralCells,
                plant:   !!agncn,
                daie:    !!daie,
            },
            stdlib:      Object.keys(STDLIB),
            session: {
                hasEnv: !!_sessionEnv,
                variables: _sessionEnv ? Object.keys(_sessionEnv.snapshot()) : [],
            },
        };
    }

    return { run, optimize, loadScript, reset, listBuiltins, status, history: _history };
}

// ═══════════════════════════════════════════════════════════════════════════════
// بناء البيئة الكاملة مع ربط جميع المحركات
// ═══════════════════════════════════════════════════════════════════════════════

function _buildEnv(globals) {
    const engines = { neural: neuralCells, plant: agncn, daie };

    // بناء البيئة الأساسية من SHL
    const env = shl.createEnv(globals, engines);

    // ─── حقن دوال المُحسِّن مباشرةً في البيئة ───────────────────────────────

    env.def('minimize', (fn, optsObj) => {
        if (typeof fn !== 'function') throw new shl.ShlError('minimize: المعامل الأول يجب أن يكون دالة');
        return opt.minimize(fn, optsObj || {});
    });

    env.def('maximize', (fn, optsObj) => {
        if (typeof fn !== 'function') throw new shl.ShlError('maximize: المعامل الأول يجب أن يكون دالة');
        return opt.maximize(fn, optsObj || {});
    });

    env.def('golden', (fn, a, b, optsObj) => {
        if (typeof fn !== 'function') throw new shl.ShlError('golden: المعامل الأول يجب أن يكون دالة');
        return opt.goldenSection(fn, +a, +b, optsObj || {});
    });

    env.def('gridSearch', (fn, ranges, optsObj) => {
        if (typeof fn !== 'function') throw new shl.ShlError('gridSearch: المعامل الأول يجب أن يكون دالة');
        return opt.gridSearch(fn, ranges || [[0,1,10]], optsObj || {});
    });

    env.def('bestN', (scored, n, maximize) => {
        return opt.bestN(scored || [], n || 3, maximize !== false);
    });

    env.def('pareto', (objectives, candidates) => {
        if (!Array.isArray(objectives)) throw new shl.ShlError('pareto: objectives يجب مصفوفة');
        return opt.pareto(objectives, candidates || []);
    });

    // ─── حقن معلومات السوق ───────────────────────────────────────────────────

    env.def('marketStatus', () => {
        if (!daie) return { ready: false };
        try { return daie.status(); } catch (_) { return {}; }
    });

    env.def('dualMap', () => {
        if (!daie) return [];
        try { return daie.getDualMap(); } catch (_) { return []; }
    });

    // ─── ثوابت المنظومة ───────────────────────────────────────────────────────

    env.def('GOLDEN', opt.GOLDEN_RATIO, true);           // النسبة الذهبية
    env.def('PHI',    opt.GOLDEN_RATIO, true);           // φ
    env.def('DIMS',   12, true);                         // عدد الأبعاد
    env.def('AXES',   24, true);                         // عدد المحاور
    env.def('IDEAL_THETA', 45, true);                    // زاوية التوازن المثلى
    env.def('VERSION', '1.0.0', true);

    // ─── آية افتتاحية ─────────────────────────────────────────────────────────
    env.def('بسم', 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', true);

    return env;
}

// ─── تحويل كود SHL إلى دالة JS ──────────────────────────────────────────────

function _shlToFn(code) {
    // كود SHL يُفترض أنه يحسب قيمة x (أو x[0]…) ويُرجعها
    return function(x) {
        const bindings = {};
        if (Array.isArray(x)) {
            bindings.x = x;
            x.forEach((v, i) => { bindings[`x${i}`] = v; });
        } else {
            bindings.x = x;
        }
        const env = shl.createEnv(bindings, { neural: neuralCells, plant: agncn, daie });
        const res = shl.run(code, env);
        if (res.error) throw new Error(res.error);
        return parseFloat(res.value) || 0;
    };
}

// ─── التصغير والتصدير ────────────────────────────────────────────────────────

// بيئة تشغيل مشتركة (Singleton) للاستخدام العام
const _defaultRuntime = createRuntime();

module.exports = {
    createRuntime,
    run:          (code)   => _defaultRuntime.run(code),
    optimize:     (params) => _defaultRuntime.optimize(params),
    loadScript:   (name)   => _defaultRuntime.loadScript(name),
    reset:        ()       => _defaultRuntime.reset(),
    listBuiltins: ()       => _defaultRuntime.listBuiltins(),
    status:       ()       => _defaultRuntime.status(),
    history:      _defaultRuntime.history,
    STDLIB,
    // إعادة تصدير وحدات اللغة والتحسين
    shl,
    opt,
};
