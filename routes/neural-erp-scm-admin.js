// بسم الله الرحمن الرحيم
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🧠 NEURAL ERP-SCM-ADMIN API ROUTES
 * مسارات API — الشبكة العصبية المتكاملة لـ ERP + SCM + الأدوات الإدارية
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * المسارات:
 *
 *  GET  /api/neural-admin/status             — حالة الشبكة الكاملة
 *  GET  /api/neural-admin/summary            — ملخص سريع
 *  POST /api/neural-admin/analyze            — تحليل متكامل كامل
 *  POST /api/neural-admin/analyze/erp        — تحليل ERP فقط
 *  POST /api/neural-admin/analyze/scm        — تحليل SCM فقط
 *  POST /api/neural-admin/analyze/admin      — تحليل الأدوات الإدارية فقط
 *  POST /api/neural-admin/analyze/erp/:module     — تحليل وحدة ERP واحدة
 *  POST /api/neural-admin/analyze/scm/:module     — تحليل وحدة SCM واحدة
 *  POST /api/neural-admin/analyze/admin/:tool     — تحليل أداة إدارية واحدة
 *  POST /api/neural-admin/train              — تدريب كامل
 *  POST /api/neural-admin/train/erp/:module  — تدريب وحدة ERP محددة
 *  POST /api/neural-admin/train/scm/:module  — تدريب وحدة SCM محددة
 *  POST /api/neural-admin/train/admin/:tool  — تدريب أداة إدارية محددة
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const express = require('express');
const router  = express.Router();

// تحميل الشبكة العصبية المتكاملة
let integratedNeural = null;
let erpNeural        = null;
let scmNeural        = null;
let adminNeural      = null;

try {
    const mod = require('../lib/sheikha-integrated-erp-scm-admin-neural');
    integratedNeural = mod.integratedNeuralNetwork;
} catch (e) {
    console.warn('[NEURAL-ADMIN-ROUTES] ⚠️ شبكة التكامل غير متوفرة:', e.message);
}

try {
    const mod = require('../lib/sheikha-erp-neural-network');
    erpNeural = mod.erpNeuralNetwork;
} catch (e) {
    console.warn('[NEURAL-ADMIN-ROUTES] ⚠️ ERP Neural غير متوفر:', e.message);
}

try {
    const mod = require('../lib/sheikha-scm-neural-network');
    scmNeural = mod.scmNeuralNetwork;
} catch (e) {
    console.warn('[NEURAL-ADMIN-ROUTES] ⚠️ SCM Neural غير متوفر:', e.message);
}

try {
    const mod = require('../lib/sheikha-admin-tools-neural-network');
    adminNeural = mod.adminToolsNeuralNetwork;
} catch (e) {
    console.warn('[NEURAL-ADMIN-ROUTES] ⚠️ Admin Neural غير متوفر:', e.message);
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────────────────────

// القيمة الافتراضية المحايدة للمدخلات العصبية (منتصف المجال [0,1])
const DEFAULT_INPUT_VALUE = 0.5;

function normalizeInputs(raw, expectedSize) {
    if (!Array.isArray(raw) || raw.length === 0) {
        return new Array(expectedSize).fill(DEFAULT_INPUT_VALUE);
    }
    const out = raw.map(v => (isFinite(Number(v)) ? Number(v) : DEFAULT_INPUT_VALUE));
    while (out.length < expectedSize) out.push(DEFAULT_INPUT_VALUE);
    return out.slice(0, expectedSize);
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /status — حالة الشبكة الكاملة
// ─────────────────────────────────────────────────────────────────────────────

router.get('/status', (req, res) => {
    try {
        if (!integratedNeural) {
            return res.status(503).json({ success: false, error: 'الشبكة العصبية المتكاملة غير متوفرة' });
        }
        res.json({ success: true, data: integratedNeural.getStatus() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /summary — ملخص سريع
// ─────────────────────────────────────────────────────────────────────────────

router.get('/summary', (req, res) => {
    try {
        if (!integratedNeural) {
            return res.status(503).json({ success: false, error: 'الشبكة العصبية المتكاملة غير متوفرة' });
        }
        res.json({ success: true, data: integratedNeural.getQuickSummary() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /analyze — تحليل متكامل كامل (ERP + SCM + Admin → Integration → Sovereign)
// Body: { erp: {...}, scm: {...}, admin: {...} }
// ─────────────────────────────────────────────────────────────────────────────

router.post('/analyze', (req, res) => {
    try {
        if (!integratedNeural) {
            return res.status(503).json({ success: false, error: 'الشبكة العصبية المتكاملة غير متوفرة' });
        }
        const inputs = req.body || {};
        const result = integratedNeural.analyzeAll(inputs);
        res.json({ success: true, data: result });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /analyze/erp — تحليل نظام ERP كامل
// Body: { finance: [...], hr: [...], inventory: [...], production: [...], procurement: [...], sales: [...] }
// ─────────────────────────────────────────────────────────────────────────────

router.post('/analyze/erp', (req, res) => {
    try {
        if (!erpNeural) return res.status(503).json({ success: false, error: 'ERP Neural غير متوفر' });
        const result = erpNeural.analyzeAll(req.body || {});
        res.json({ success: true, data: result });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /analyze/scm — تحليل نظام SCM كامل
// ─────────────────────────────────────────────────────────────────────────────

router.post('/analyze/scm', (req, res) => {
    try {
        if (!scmNeural) return res.status(503).json({ success: false, error: 'SCM Neural غير متوفر' });
        const result = scmNeural.analyzeAll(req.body || {});
        res.json({ success: true, data: result });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /analyze/admin — تحليل الأدوات الإدارية كلها
// ─────────────────────────────────────────────────────────────────────────────

router.post('/analyze/admin', (req, res) => {
    try {
        if (!adminNeural) return res.status(503).json({ success: false, error: 'Admin Neural غير متوفر' });
        const result = adminNeural.analyzeAll(req.body || {});
        res.json({ success: true, data: result });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /analyze/erp/:module — تحليل وحدة ERP واحدة
// modules: finance | hr | inventory | production | procurement | sales
// Body: { inputs: [...] }
// ─────────────────────────────────────────────────────────────────────────────

router.post('/analyze/erp/:module', (req, res) => {
    try {
        if (!erpNeural) return res.status(503).json({ success: false, error: 'ERP Neural غير متوفر' });
        const { module } = req.params;
        const net = erpNeural.modules[module];
        if (!net) {
            return res.status(404).json({ success: false, error: `وحدة ERP غير معروفة: ${module}`, available: Object.keys(erpNeural.modules) });
        }
        const inputs = normalizeInputs(req.body.inputs, net.layers[0].inputSize);
        const result = erpNeural.analyzeModule(module, inputs);
        res.json({ success: true, data: result });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /analyze/scm/:module — تحليل وحدة SCM واحدة
// modules: demand | supplier | logistics | risk | inventoryOpt | compliance
// ─────────────────────────────────────────────────────────────────────────────

router.post('/analyze/scm/:module', (req, res) => {
    try {
        if (!scmNeural) return res.status(503).json({ success: false, error: 'SCM Neural غير متوفر' });
        const { module } = req.params;
        const net = scmNeural.modules[module];
        if (!net) {
            return res.status(404).json({ success: false, error: `وحدة SCM غير معروفة: ${module}`, available: Object.keys(scmNeural.modules) });
        }
        const inputs = normalizeInputs(req.body.inputs, net.layers[0].inputSize);
        const result = scmNeural.analyzeModule(module, inputs);
        res.json({ success: true, data: result });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /analyze/admin/:tool — تحليل أداة إدارية واحدة
// tools: dashboard | users | reports | notifications | compliance | settings | performance | audit
// ─────────────────────────────────────────────────────────────────────────────

router.post('/analyze/admin/:tool', (req, res) => {
    try {
        if (!adminNeural) return res.status(503).json({ success: false, error: 'Admin Neural غير متوفر' });
        const { tool } = req.params;
        const net = adminNeural.tools[tool];
        if (!net) {
            return res.status(404).json({ success: false, error: `أداة إدارية غير معروفة: ${tool}`, available: Object.keys(adminNeural.tools) });
        }
        const inputs = normalizeInputs(req.body.inputs, net.layers[0].inputSize);
        const result = adminNeural.analyzeTool(tool, inputs);
        res.json({ success: true, data: result });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /train — تدريب كامل لجميع الشبكات
// Body: { erp: { finance: { inputs, targets }, ... }, scm: {...}, admin: {...}, epochs: 20 }
// ─────────────────────────────────────────────────────────────────────────────

router.post('/train', (req, res) => {
    try {
        if (!integratedNeural) {
            return res.status(503).json({ success: false, error: 'الشبكة العصبية المتكاملة غير متوفرة' });
        }
        const { epochs = 20, ...trainingData } = req.body || {};
        const result = integratedNeural.trainAll(trainingData, epochs);
        res.json({ success: true, data: result });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /train/erp/:module — تدريب وحدة ERP محددة
// Body: { inputs: [...], targets: [...], epochs: 20 }
// ─────────────────────────────────────────────────────────────────────────────

router.post('/train/erp/:module', (req, res) => {
    try {
        if (!erpNeural) return res.status(503).json({ success: false, error: 'ERP Neural غير متوفر' });
        const { module } = req.params;
        const { inputs, targets, epochs = 20 } = req.body || {};
        if (!inputs || !targets) {
            return res.status(400).json({ success: false, error: 'يجب توفير inputs و targets' });
        }
        const result = erpNeural.trainModule(module, inputs, targets, epochs);
        res.json({ success: true, data: result });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /train/scm/:module — تدريب وحدة SCM محددة
// ─────────────────────────────────────────────────────────────────────────────

router.post('/train/scm/:module', (req, res) => {
    try {
        if (!scmNeural) return res.status(503).json({ success: false, error: 'SCM Neural غير متوفر' });
        const { module } = req.params;
        const { inputs, targets, epochs = 20 } = req.body || {};
        if (!inputs || !targets) {
            return res.status(400).json({ success: false, error: 'يجب توفير inputs و targets' });
        }
        const result = scmNeural.trainModule(module, inputs, targets, epochs);
        res.json({ success: true, data: result });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /train/admin/:tool — تدريب أداة إدارية محددة
// ─────────────────────────────────────────────────────────────────────────────

router.post('/train/admin/:tool', (req, res) => {
    try {
        if (!adminNeural) return res.status(503).json({ success: false, error: 'Admin Neural غير متوفر' });
        const { tool } = req.params;
        const { inputs, targets, epochs = 20 } = req.body || {};
        if (!inputs || !targets) {
            return res.status(400).json({ success: false, error: 'يجب توفير inputs و targets' });
        }
        const result = adminNeural.trainTool(tool, inputs, targets, epochs);
        res.json({ success: true, data: result });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET / — دليل المسارات
// ─────────────────────────────────────────────────────────────────────────────

router.get('/', (req, res) => {
    res.json({
        success: true,
        nameAr:  'الشبكة العصبية المتكاملة — ERP + SCM + الأدوات الإدارية',
        nameEn:  'Sheikha Integrated ERP-SCM-Admin Neural Network',
        quranRef:'"وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ" — المائدة: 2',
        endpoints: {
            'GET  /api/neural-admin/status':              'حالة الشبكة الكاملة',
            'GET  /api/neural-admin/summary':             'ملخص سريع',
            'POST /api/neural-admin/analyze':             'تحليل متكامل كامل',
            'POST /api/neural-admin/analyze/erp':         'تحليل ERP كامل',
            'POST /api/neural-admin/analyze/scm':         'تحليل SCM كامل',
            'POST /api/neural-admin/analyze/admin':       'تحليل الأدوات الإدارية',
            'POST /api/neural-admin/analyze/erp/:module': 'تحليل وحدة ERP (finance|hr|inventory|production|procurement|sales)',
            'POST /api/neural-admin/analyze/scm/:module': 'تحليل وحدة SCM (demand|supplier|logistics|risk|inventoryOpt|compliance)',
            'POST /api/neural-admin/analyze/admin/:tool': 'تحليل أداة إدارية (dashboard|users|reports|notifications|compliance|settings|performance|audit)',
            'POST /api/neural-admin/train':               'تدريب كامل',
            'POST /api/neural-admin/train/erp/:module':   'تدريب وحدة ERP',
            'POST /api/neural-admin/train/scm/:module':   'تدريب وحدة SCM',
            'POST /api/neural-admin/train/admin/:tool':   'تدريب أداة إدارية'
        },
        architecture: {
            totalNetworks: 25,
            systems: {
                erp:   { networks: 7,  modules: ['finance', 'hr', 'inventory', 'production', 'procurement', 'sales', 'master'] },
                scm:   { networks: 7,  modules: ['demand', 'supplier', 'logistics', 'risk', 'inventoryOpt', 'compliance', 'master'] },
                admin: { networks: 9,  tools:   ['dashboard', 'users', 'reports', 'notifications', 'compliance', 'settings', 'performance', 'audit', 'master'] },
                integration: { networks: 1, description: '12 مدخل → 8 مخرجات وسيطة' },
                sovereign:   { networks: 1, description: '8 مدخلات → 4 مخرجات نهائية' }
            }
        }
    });
});

module.exports = router;
