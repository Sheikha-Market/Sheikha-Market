// بسم الله الرحمن الرحيم
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🧠⚙️ NEURAL OPERATIONS — API ROUTES
 *    عملية شيخة شبكة عصبية — مسارات مركز العمليات
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * «وَشَاوِرْهُمْ فِي الْأَمْرِ» — آل عمران: 159
 *
 *  GET  /api/neural-ops                       — دليل المسارات
 *  GET  /api/neural-ops/status                — حالة النظام (الوحدات + الإحصاءات)
 *  POST /api/neural-ops/process               — معالجة عملية كاملة (القرار العصبي)
 *  POST /api/neural-ops/batch                 — معالجة دُفعة من العمليات
 *  POST /api/neural-ops/scan                  — مسح سريع (بدون تحليل عصبي كامل)
 *  GET  /api/neural-ops/log                   — سجل العمليات الأخيرة
 *  GET  /api/neural-ops/types                 — أنواع العمليات المدعومة
 *
 *  معالجة متخصصة:
 *  POST /api/neural-ops/trade                 — عملية تجارية
 *  POST /api/neural-ops/payment               — دفع ومعاملة مالية
 *  POST /api/neural-ops/contract              — عقد ذكي إسلامي
 *  POST /api/neural-ops/exchange              — تداول عملات (إجباري عبر SHK)
 *  POST /api/neural-ops/analysis              — تحليل عصبي شامل للمنظومة
 *  POST /api/neural-ops/text                  — تحليل نص عربي/إنجليزي
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const express = require('express');
const router  = express.Router();

let neuralOps = null;
let OP_TYPES  = null;

try {
    const mod = require('../lib/sheikha-neural-operations');
    neuralOps = mod.neuralOps;
    OP_TYPES  = mod.OP_TYPES;
} catch (e) {
    console.warn('[NEURAL-OPS-ROUTES] ⚠️ Neural Operations غير متوفر:', e.message, '— جميع المسارات ستعيد 503');
}

function notAvailable(res) {
    return res.status(503).json({ success: false, error: 'Neural Operations Center غير متوفر' });
}

function wrap(fn) {
    return (req, res) => {
        try { fn(req, res); }
        catch (e) { res.status(500).json({ success: false, error: e.message }); }
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// GET / — دليل المسارات
// ─────────────────────────────────────────────────────────────────────────────

router.get('/', (req, res) => {
    res.json({
        success: true,
        nameAr:  'مركز عمليات شيخة العصبي',
        nameEn:  'Sheikha Neural Operations Center',
        version: '1.0.0',
        quranRef:'«وَشَاوِرْهُمْ فِي الْأَمْرِ» — آل عمران: 159',
        pipeline: {
            step1: 'تصنيف تلقائي للعملية',
            step2: 'توجيه للشبكات العصبية المناسبة (ERP + SCM + Blockchain + SHK)',
            step3: 'تجميع القرارات العصبية',
            step4: 'فحص شرعي تلقائي',
            step5: 'تقييم SHK (كعملة أساسية)',
            step6: 'تسجيل على البلوكشين',
            step7: 'إصدار القرار النهائي'
        },
        supportedTypes: OP_TYPES || [],
        endpoints: {
            'GET  /api/neural-ops/status':   'حالة النظام الكاملة',
            'POST /api/neural-ops/process':  'معالجة عملية { type?, ...data }',
            'POST /api/neural-ops/batch':    'معالجة دُفعة [ {...}, {...} ]',
            'POST /api/neural-ops/scan':     'مسح سريع { type?, ...data }',
            'GET  /api/neural-ops/log':      'سجل العمليات الأخيرة',
            'GET  /api/neural-ops/types':    'أنواع العمليات المدعومة',
            'POST /api/neural-ops/trade':    'عملية تجارية',
            'POST /api/neural-ops/payment':  'معاملة مالية',
            'POST /api/neural-ops/contract': 'عقد ذكي إسلامي',
            'POST /api/neural-ops/exchange': 'تداول عملات (SHK إجباري)',
            'POST /api/neural-ops/analysis': 'تحليل شامل للمنظومة',
            'POST /api/neural-ops/text':     'تحليل نص عربي/إنجليزي'
        }
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /status — حالة النظام
// ─────────────────────────────────────────────────────────────────────────────

router.get('/status', wrap((req, res) => {
    if (!neuralOps) return notAvailable(res);
    res.json({ success: true, data: neuralOps.getStatus() });
}));

// ─────────────────────────────────────────────────────────────────────────────
// GET /types — أنواع العمليات المدعومة
// ─────────────────────────────────────────────────────────────────────────────

router.get('/types', wrap((req, res) => {
    res.json({
        success: true,
        data: (OP_TYPES || []).map(t => ({
            type: t,
            descAr: {
                trade:       'عملية تجارية (بيع، شراء، تصدير، استيراد)',
                payment:     'دفع ومعاملة مالية',
                contract:    'عقد ذكي إسلامي (مرابحة، مضاربة، إجارة...)',
                logistics:   'شحن ولوجستيات وتسليم',
                procurement: 'مشتريات وتوريد',
                inventory:   'إدارة المخزون',
                hr:          'الموارد البشرية',
                exchange:    'تداول عملات — SHK هي العملة الأساسية الإجبارية',
                analysis:    'تحليل عصبي شامل للمنظومة كاملاً',
                text:        'تحليل نص عربي أو إنجليزي (Word2Vec + SelfAttention)'
            }[t] || t,
            networks: {
                trade:       ['ERP-Sales', 'ERP-Finance', 'SCM-Demand', 'SCM-Risk', 'SHK-Oracle'],
                payment:     ['ERP-Finance', 'SHK-Oracle', 'Shariah-Filter'],
                contract:    ['Shariah-Filter', 'Contract-Validator', 'ERP-Finance'],
                logistics:   ['SCM-Logistics', 'SCM-Risk', 'SCM-Compliance'],
                procurement: ['ERP-Procurement', 'ERP-Finance', 'SCM-Supplier'],
                inventory:   ['ERP-Inventory', 'SCM-InventoryOpt'],
                hr:          ['ERP-HR'],
                exchange:    ['SHK-Oracle', 'SHK-Exchange', 'Shariah-Filter'],
                analysis:    ['Integrated-Sovereign', 'ERP-Full', 'SCM-Full'],
                text:        ['NeuralCore-Word2Vec', 'SelfAttention']
            }[t] || []
        }))
    });
}));

// ─────────────────────────────────────────────────────────────────────────────
// GET /log — سجل العمليات
// ─────────────────────────────────────────────────────────────────────────────

router.get('/log', wrap((req, res) => {
    if (!neuralOps) return notAvailable(res);
    const limit = Math.min(parseInt(req.query.limit || 50), 200);
    res.json({ success: true, data: neuralOps.getOperationLog(limit) });
}));

// ─────────────────────────────────────────────────────────────────────────────
// POST /process — معالجة عملية كاملة (القرار العصبي الموحد)
// Body: { type?, description?, amount?, from?, to?, category?, ...anyData }
// ─────────────────────────────────────────────────────────────────────────────

router.post('/process', wrap((req, res) => {
    if (!neuralOps) return notAvailable(res);
    if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ success: false, error: 'body العملية مطلوب' });
    }
    const result = neuralOps.process(req.body);
    res.json({ success: true, data: result });
}));

// ─────────────────────────────────────────────────────────────────────────────
// POST /batch — معالجة دُفعة
// Body: [ {...}, {...}, ... ] أو { operations: [...] }
// ─────────────────────────────────────────────────────────────────────────────

router.post('/batch', wrap((req, res) => {
    if (!neuralOps) return notAvailable(res);
    const operations = Array.isArray(req.body) ? req.body : (req.body && req.body.operations);
    if (!Array.isArray(operations) || operations.length === 0) {
        return res.status(400).json({ success: false, error: 'مطلوب مصفوفة عمليات' });
    }
    if (operations.length > 50) {
        return res.status(400).json({ success: false, error: 'الحد الأقصى 50 عملية في الدُفعة' });
    }
    const result = neuralOps.processBatch(operations);
    res.json({ success: true, data: result });
}));

// ─────────────────────────────────────────────────────────────────────────────
// POST /scan — مسح سريع
// Body: { type?, ...anyData }
// ─────────────────────────────────────────────────────────────────────────────

router.post('/scan', wrap((req, res) => {
    if (!neuralOps) return notAvailable(res);
    if (!req.body) return res.status(400).json({ success: false, error: 'body مطلوب' });
    const result = neuralOps.quickScan(req.body);
    res.json({ success: true, data: result });
}));

// ─────────────────────────────────────────────────────────────────────────────
// مسارات متخصصة — تضيف type تلقائياً
// ─────────────────────────────────────────────────────────────────────────────

const TYPED_ROUTES = ['trade', 'payment', 'contract', 'logistics', 'procurement', 'inventory', 'hr', 'exchange', 'analysis', 'text'];

for (const opType of TYPED_ROUTES) {
    router.post(`/${opType}`, wrap((req, res) => {
        if (!neuralOps) return notAvailable(res);
        const operation = { ...(req.body || {}), type: opType };
        const result    = neuralOps.process(operation);
        res.json({ success: true, data: result });
    }));
}

module.exports = router;
