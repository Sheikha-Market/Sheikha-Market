/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🔤 مسارات لغة شيخة البرمجية — Sheikha Language (SHL) API Routes
 *
 *  "اقْرَأْ بِاسْمِ رَبِّكَ" — العلق:1  •  "عَلَّمَهُ الْبَيَانَ" — الرحمن:4
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Endpoints:
 *   GET  /api/lang/status      — حالة بيئة التشغيل
 *   GET  /api/lang/builtins    — قائمة الدوال المدمجة
 *   GET  /api/lang/stdlib      — مكتبة النصوص المدمجة
 *   POST /api/lang/run         — تشغيل كود SHL
 *   POST /api/lang/optimize    — تشغيل المُحسِّن (حساب الأفضل)
 *   POST /api/lang/validate    — التحقق من صحة الكود دون تشغيله
 *   GET  /api/lang/history     — سجل التنفيذ
 *   DELETE /api/lang/reset     — إعادة تهيئة الجلسة
 */

'use strict';

const express = require('express');
const router  = express.Router();

// ─── تحميل بيئة التشغيل ──────────────────────────────────────────────────────

let rt = null;
try {
    rt = require('../core/lang/sheikha-runtime');
} catch (e) {
    console.warn('[SHL] ⚠️ بيئة التشغيل غير متاحة:', e.message);
}

function requireRT(res) {
    if (!rt) {
        res.status(503).json({
            success: false,
            error: 'بيئة تشغيل لغة شيخة (SHL) غير متاحة',
            code: 'SHL_UNAVAILABLE',
        });
        return false;
    }
    return true;
}

// ─── GET /api/lang/status ────────────────────────────────────────────────────
/**
 * حالة بيئة التشغيل الكاملة
 */
router.get('/status', (req, res) => {
    if (!requireRT(res)) return;
    try {
        res.json({
            success: true,
            data: rt.status(),
            message: '🔤 بيئة تشغيل لغة شيخة (SHL) — جاهزة',
        });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ─── GET /api/lang/builtins ──────────────────────────────────────────────────
/**
 * قائمة جميع الدوال المدمجة في اللغة مع توثيقها
 */
router.get('/builtins', (req, res) => {
    if (!requireRT(res)) return;
    try {
        const fns = rt.listBuiltins();
        res.json({
            success: true,
            data: {
                count: fns.length,
                functions: fns,
                categories: {
                    math:     ['abs','sqrt','pow','max','min','sum','avg','round','floor','ceil','log','log10','sin','cos','tan','atan2','sign','clamp','between'],
                    dualAnalogy: ['psi','gap','phi','omega','coherence','vectorMag','balance','best','أفضل','worst','rank'],
                    market:   ['neural','plant','pulse','integrate','marketStatus','dualMap'],
                    optimizer:['minimize','maximize','golden','gridSearch','bestN','pareto'],
                    sharia:   ['halal','haram'],
                    convert:  ['str','num','bool','type','len','keys','vals','range','filter','map','sort'],
                    output:   ['print','اطبع','println'],
                    constants:['pi','e','ب','sqrt2','GOLDEN','PHI','DIMS','AXES','IDEAL_THETA','VERSION','بسم'],
                },
                quickExamples: [
                    { fn: 'psi(0.8, 0.6)',         result: 0.7071, desc: 'رنين ثنائي — جذر مجموع المربعات / √2' },
                    { fn: 'omega([0.7, 0.8, 0.6])', result: 0.7,   desc: 'صحة كلية — متوسط الرنينات' },
                    { fn: 'balance(0.7, 0.8)',       result: 0.9,   desc: 'توازن — 1 − |x−y|' },
                    { fn: 'best(0.5, 0.9, 0.7)',     result: 0.9,   desc: 'الأفضل — القيمة العظمى' },
                    { fn: 'halal("تمر")',            result: true,  desc: 'فحص شرعي' },
                    { fn: 'minimize(fn, {bounds:[0,1]})', result:'x', desc: 'أدنى قيمة في [0,1]' },
                ],
            },
            message: `📚 ${fns.length} دالة مدمجة — عربي + إنجليزي`,
        });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ─── GET /api/lang/stdlib ────────────────────────────────────────────────────
/**
 * مكتبة النصوص المدمجة (scripts library) مع كودها المصدري
 */
router.get('/stdlib', (req, res) => {
    if (!requireRT(res)) return;
    try {
        const stdlib = rt.STDLIB;
        const result = {};
        for (const [name, code] of Object.entries(stdlib)) {
            result[name] = { name, code: code.trim(), lines: code.trim().split('\n').length };
        }
        res.json({
            success: true,
            data: {
                count: Object.keys(result).length,
                scripts: result,
            },
            message: `📦 ${Object.keys(result).length} نصوص مدمجة جاهزة للتشغيل`,
        });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ─── POST /api/lang/run ──────────────────────────────────────────────────────
/**
 * تشغيل كود SHL
 *
 * Body (JSON):
 * {
 *   "code":   "let x = psi(0.8, 0.6)\nاطبع(x)",    ← كود SHL
 *   "script": "demo",                               ← أو اسم نص مدمج (بدل code)
 *   "fresh":  false                                 ← بيئة جديدة (افتراضي: false — يستمر session)
 * }
 *
 * Response:
 * { success, data: { value, output, env, durationMs, id }, message }
 */
router.post('/run', (req, res) => {
    if (!requireRT(res)) return;
    try {
        const { code, script, fresh } = req.body || {};

        // إعادة تهيئة إذا طُلب
        if (fresh) rt.reset();

        let result;

        if (script) {
            result = rt.loadScript(script);
        } else if (code && typeof code === 'string') {
            if (code.trim().length === 0) {
                return res.status(400).json({ success: false, error: 'الكود فارغ' });
            }
            result = rt.run(code);
        } else {
            return res.status(400).json({
                success: false,
                error: 'يجب إرسال "code" (نص SHL) أو "script" (اسم نص مدمج)',
                hint: '{ "code": "let x = psi(0.8, 0.6)\nاطبع(x)" }',
            });
        }

        const success = !result.error;
        res.status(success ? 200 : 422).json({
            success,
            data: {
                id:         result.id,
                value:      result.value,
                output:     result.output || [],
                env:        result.env ? result.env.snapshot() : {},
                durationMs: result.durationMs,
            },
            error:   result.error || null,
            message: success
                ? `✅ تم التنفيذ — القيمة: ${_display(result.value)} | ${result.durationMs}ms`
                : `❌ خطأ: ${result.error}`,
        });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ─── POST /api/lang/optimize ─────────────────────────────────────────────────
/**
 * تشغيل المُحسِّن (حساب الأفضل)
 *
 * Body (JSON):
 * {
 *   "method":  "minimize",          ← 'minimize'|'maximize'|'golden'|'nelder'|'grid'|'pareto'|'bestN'
 *   "fn":      "x * x - 4 * x + 4", ← كود SHL لدالة الهدف (يستقبل متغير x)
 *   "opts": {
 *     "bounds": [0, 5],              ← للـ golden (1D)
 *     "x0":    [1, 1],              ← للـ nelder (nD)
 *     "ranges":[[0,5,20],[0,5,20]], ← للـ grid search
 *     "tol":   1e-6,
 *     "maxIter": 1000
 *   },
 *   // للـ pareto:
 *   "objectives": ["x * x", "abs(x - 2)"],
 *   "candidates": [[0],[1],[2],[3],[4]],
 *   // للـ bestN:
 *   "scored": [{"item":"أ","score":0.8},{"item":"ب","score":0.6}],
 *   "n": 3
 * }
 */
router.post('/optimize', (req, res) => {
    if (!requireRT(res)) return;
    try {
        const body = req.body || {};

        if (!body.method) {
            return res.status(400).json({
                success: false,
                error: 'حقل "method" مطلوب',
                valid_methods: ['minimize','maximize','golden','nelder','grid','pareto','bestN'],
            });
        }

        const result = rt.optimize(body);

        if (result.error) {
            return res.status(422).json({ success: false, ...result });
        }

        res.json({
            success: true,
            data: result,
            message: `🎯 حساب الأفضل (${result.method}) — ${result.durationMs}ms`,
        });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ─── POST /api/lang/validate ─────────────────────────────────────────────────
/**
 * التحقق من صحة كود SHL بدون تشغيله
 * يرجع: { valid, tokens, ast, errors }
 *
 * Body: { "code": "let x = psi(0.8, 0.6)" }
 */
router.post('/validate', (req, res) => {
    if (!requireRT(res)) return;
    try {
        const { code } = req.body || {};
        if (!code || typeof code !== 'string') {
            return res.status(400).json({ success: false, error: 'حقل "code" مطلوب' });
        }

        const shl = rt.shl;
        let tokens = null, ast = null, tokenError = null, parseError = null;

        try {
            tokens = shl.tokenize(code);
        } catch (e) { tokenError = e.message; }

        if (tokens && !tokenError) {
            try {
                ast = shl.parse(tokens);
            } catch (e) { parseError = e.message; }
        }

        const valid  = !tokenError && !parseError;
        const errors = [tokenError, parseError].filter(Boolean);

        res.json({
            success: valid,
            data: {
                valid,
                tokenCount: tokens ? tokens.length : 0,
                astNodeCount: ast ? _countNodes(ast) : 0,
                errors,
                // AST مبسط (أول 3 مستويات فقط)
                astSummary: ast ? _summarizeAst(ast) : null,
            },
            message: valid ? `✅ الكود صالح — ${tokens.length} توكن` : `❌ ${errors[0]}`,
        });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ─── GET /api/lang/history ───────────────────────────────────────────────────
/**
 * سجل التنفيذ (آخر 20 تشغيل)
 */
router.get('/history', (req, res) => {
    if (!requireRT(res)) return;
    try {
        const limit   = Math.min(100, parseInt(req.query.limit) || 20);
        const history = (rt.history || []).slice(-limit).reverse();
        res.json({
            success: true,
            data: {
                count: history.length,
                runs: history.map(r => ({
                    id:         r.id,
                    source:     r.source,
                    value:      r.value,
                    output:     r.output,
                    error:      r.error,
                    durationMs: r.durationMs,
                    timestamp:  r.timestamp,
                })),
            },
            message: `📜 ${history.length} من آخر ${limit} عملية تشغيل`,
        });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ─── DELETE /api/lang/reset ──────────────────────────────────────────────────
/**
 * إعادة تهيئة جلسة التشغيل (مسح المتغيرات والسجل)
 */
router.delete('/reset', (req, res) => {
    if (!requireRT(res)) return;
    try {
        rt.reset();
        res.json({
            success: true,
            data: rt.status(),
            message: '🔄 جلسة التشغيل أُعيدت تهيئتها — المتغيرات مُسحت',
        });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ─── دوال مساعدة ─────────────────────────────────────────────────────────────

function _display(v) {
    if (v === null || v === undefined) return 'فارغ';
    if (typeof v === 'object') {
        try { return JSON.stringify(v).slice(0, 80); } catch (_) { return '[كائن]'; }
    }
    return String(v).slice(0, 80);
}

function _countNodes(node) {
    if (!node || typeof node !== 'object') return 0;
    let n = 1;
    for (const v of Object.values(node)) {
        if (Array.isArray(v)) n += v.reduce((s, c) => s + _countNodes(c), 0);
        else if (typeof v === 'object' && v) n += _countNodes(v);
    }
    return n;
}

function _summarizeAst(node, depth = 0) {
    if (!node || depth > 2) return node && node.kind ? `[${node.kind}]` : null;
    if (node.kind === 'Program') return { kind: 'Program', statements: node.body.length };
    if (node.kind === 'Literal') return { kind: 'Literal', value: node.value };
    if (node.kind === 'Identifier') return { kind: 'Identifier', name: node.name };
    const s = { kind: node.kind };
    if (node.name)  s.name  = node.name;
    if (node.op)    s.op    = node.op;
    return s;
}

module.exports = router;
