/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🧠 مسارات الشبكة العصبية الجذرية — Neural Root Routes
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * ﴿ وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا ﴾ — البقرة: 31
 *
 * المسارات:
 *   GET  /api/neural/root/status       — حالة شبكة الخلايا الجذرية
 *   POST /api/neural/root/activate     — تفعيل شبكة جذرية كاملة
 *   GET  /api/neural/root/unity-score  — درجة التوحيد الحالية
 *   POST /api/neural/root/digitize     — رقمنة مفهوم بالكتاب والسنة
 *   GET  /api/neural/root/cells        — عرض كل الخلايا وحالتها
 *   POST /api/neural/root/forward      — الانتشار الأمامي بمدخلات مخصصة
 *   GET  /api/neural/root/quran-db     — قاعدة بيانات الآيات
 *   POST /api/neural/root/verify       — التحقق من توافق إجراء مع المبادئ الإسلامية
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const express = require('express');
const router = express.Router();

// ─── تحميل الوحدات ───────────────────────────────────────────────────────────
let unifiedNN, digitizer;

try {
    unifiedNN = require('../lib/sheikha-unified-neural-network.js');
    console.log('✅ [NEURAL-ROOT-ROUTES] شبكة التوحيد الجذرية محمّلة');
} catch (e) {
    console.log('⚠️ [NEURAL-ROOT-ROUTES] فشل تحميل شبكة التوحيد:', e.message);
    unifiedNN = null;
}

try {
    digitizer = require('../lib/sheikha-islamic-digitizer.js');
    console.log('✅ [NEURAL-ROOT-ROUTES] المُرقمِّن الإسلامي محمّل');
} catch (e) {
    console.log('⚠️ [NEURAL-ROOT-ROUTES] فشل تحميل المُرقمِّن:', e.message);
    digitizer = null;
}

const GEO_ACTIVATION_PROFILES = {
    saudi: {
        id: 'saudi',
        labelAr: 'السعودية',
        scope: 'وطني',
        iso: ['SA'],
        domain: 'commerce',
        neuralInputs: { ilmu: 0.82, adlu: 0.92, rahma: 0.88, quwwa: 0.76 },
        governance: ['sharia-core', 'pdpl', 'sama'],
        language: 'ar-SA',
        currency: 'SAR'
    },
    gulf: {
        id: 'gulf',
        labelAr: 'الخليج',
        scope: 'إقليمي',
        iso: ['SA', 'AE', 'QA', 'KW', 'BH', 'OM'],
        domain: 'communication',
        neuralInputs: { ilmu: 0.8, adlu: 0.88, rahma: 0.84, quwwa: 0.74 },
        governance: ['gcc-trade', 'sharia-core', 'aml-regional'],
        language: 'ar',
        currency: 'SAR'
    },
    oic: {
        id: 'oic',
        labelAr: 'الدول الإسلامية',
        scope: 'دولي',
        iso: ['OIC'],
        domain: 'justice',
        neuralInputs: { ilmu: 0.78, adlu: 0.9, rahma: 0.9, quwwa: 0.72 },
        governance: ['aaoifi', 'islamic-finance', 'trade-ethics'],
        language: 'ar-en',
        currency: 'multi'
    },
    international: {
        id: 'international',
        labelAr: 'دولي',
        scope: 'دولي',
        iso: ['INTL'],
        domain: 'security',
        neuralInputs: { ilmu: 0.8, adlu: 0.86, rahma: 0.78, quwwa: 0.84 },
        governance: ['wto', 'iso-27001', 'fatf', 'sharia-core'],
        language: 'ar-en',
        currency: 'multi'
    },
    continental: {
        id: 'continental',
        labelAr: 'قاري',
        scope: 'قاري',
        iso: ['AF', 'AS', 'EU', 'NA', 'SA', 'OC'],
        domain: 'development',
        neuralInputs: { ilmu: 0.82, adlu: 0.82, rahma: 0.82, quwwa: 0.82 },
        governance: ['regional-trade-zones', 'customs-unions', 'sharia-core'],
        language: 'multi',
        currency: 'multi'
    },
    global: {
        id: 'global',
        labelAr: 'عالمي',
        scope: 'عالمي',
        iso: ['ALL'],
        domain: 'neural',
        neuralInputs: { ilmu: 0.9, adlu: 0.85, rahma: 0.8, quwwa: 0.87 },
        governance: ['un-global-compact', 'iso-27001', 'soc2', 'sharia-core'],
        language: 'multi',
        currency: 'multi'
    },
    cosmic: {
        id: 'cosmic',
        labelAr: 'كوني',
        scope: 'كوني',
        iso: ['COSMOS'],
        domain: 'vision',
        neuralInputs: { ilmu: 0.94, adlu: 0.82, rahma: 0.8, quwwa: 0.86 },
        governance: ['research-ethics', 'no-harm', 'sharia-core'],
        language: 'multi',
        currency: 'multi'
    }
};

function resolveGeoProfile(rawRegion) {
    const value = String(rawRegion || '').trim().toLowerCase();
    if (!value) return GEO_ACTIVATION_PROFILES.saudi;

    const aliases = {
        sa: 'saudi',
        ksa: 'saudi',
        saudi: 'saudi',
        'saudi-arabia': 'saudi',
        gcc: 'gulf',
        gulf: 'gulf',
        khaleeji: 'gulf',
        oic: 'oic',
        international: 'international',
        global: 'global',
        world: 'global',
        continental: 'continental',
        continent: 'continental',
        cosmic: 'cosmic',
        universal: 'cosmic'
    };

    const key = aliases[value] || value;
    return GEO_ACTIVATION_PROFILES[key] || GEO_ACTIVATION_PROFILES.saudi;
}

// ─── مساعد التحقق ────────────────────────────────────────────────────────────
function nnCheck(res) {
    if (!unifiedNN) {
        res.status(503).json({
            success: false,
            message: 'شبكة الخلايا العصبية الجذرية غير متاحة',
            timestamp: new Date().toISOString()
        });
        return false;
    }
    return true;
}

// ─── GET /status ─────────────────────────────────────────────────────────────
/**
 * حالة شبكة الخلايا الجذرية الكاملة
 */
router.get('/status', (req, res) => {
    if (!nnCheck(res)) return;
    try {
        res.json({
            success: true,
            bismillah: 'بسم الله الرحمن الرحيم',
            data: unifiedNN.getStatus(),
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── POST /activate ──────────────────────────────────────────────────────────
/**
 * تفعيل شبكة جذرية كاملة بمجال محدد
 * Body: { domain? }  — domain: security|commerce|vision|neural|development|knowledge|justice
 */
router.post('/activate', (req, res) => {
    if (!nnCheck(res)) return;
    try {
        const { domain = 'general' } = req.body || {};
        const result = unifiedNN.activate(domain);
        res.json({
            success: true,
            bismillah: 'بسم الله الرحمن الرحيم',
            data: result,
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── GET /unity-score ────────────────────────────────────────────────────────
/**
 * درجة التوحيد الحالية للشبكة
 */
router.get('/unity-score', (req, res) => {
    if (!nnCheck(res)) return;
    try {
        const result = unifiedNN.unify();
        res.json({
            success: true,
            bismillah: 'بسم الله الرحمن الرحيم',
            data: result,
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── POST /digitize ──────────────────────────────────────────────────────────
/**
 * رقمنة مفهوم تقني بالكتاب والسنة
 * Body: { concept }
 */
router.post('/digitize', (req, res) => {
    try {
        const { concept } = req.body || {};
        if (!concept) {
            return res.status(400).json({ success: false, message: 'concept مطلوب', timestamp: new Date().toISOString() });
        }
        if (!digitizer) {
            return res.status(503).json({ success: false, message: 'المُرقمِّن غير متاح', timestamp: new Date().toISOString() });
        }
        const result = digitizer.digitize(concept);
        res.json({
            success: true,
            bismillah: 'بسم الله الرحمن الرحيم',
            data: result,
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── GET /cells ──────────────────────────────────────────────────────────────
/**
 * عرض كل الخلايا وحالتها
 */
router.get('/cells', (req, res) => {
    if (!nnCheck(res)) return;
    try {
        const cells = unifiedNN.getAllCells();
        res.json({
            success: true,
            bismillah: 'بسم الله الرحمن الرحيم',
            total: cells.length,
            cells,
            quranRef: '﴿ وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا ﴾ — البقرة: 31',
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── POST /forward ────────────────────────────────────────────────────────────
/**
 * الانتشار الأمامي بمدخلات مخصصة
 * Body: { tawheed?, ilmu?, adlu?, rahma?, quwwa? }  — قيم [0-1]
 */
router.post('/forward', (req, res) => {
    if (!nnCheck(res)) return;
    try {
        const inputs = req.body || {};
        const result = unifiedNN.forward(inputs);
        res.json({
            success: true,
            bismillah: 'بسم الله الرحمن الرحيم',
            data: result,
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── POST /activate/geo ───────────────────────────────────────────────────────
/**
 * تفعيل الشبكة الجذرية حسب المنطقة الجغرافية مع التكيّف الآلي
 * Body/Query: { region?, action? }
 */
router.post('/activate/geo', (req, res) => {
    if (!nnCheck(res)) return;

    try {
        const region = req.body?.region || req.query?.region || 'saudi';
        const profile = resolveGeoProfile(region);
        const action = req.body?.action || '';

        const forwardResult = unifiedNN.forward(profile.neuralInputs);
        const activationResult = unifiedNN.activate(profile.domain);
        const verifyResult = digitizer ? digitizer.verify(action || `تشغيل ${profile.labelAr}`) : null;

        res.json({
            success: true,
            bismillah: 'بسم الله الرحمن الرحيم',
            mode: 'geo-adaptive-root-activation',
            profile: {
                id: profile.id,
                labelAr: profile.labelAr,
                scope: profile.scope,
                iso: profile.iso,
                governance: profile.governance,
                language: profile.language,
                currency: profile.currency
            },
            data: {
                forward: forwardResult,
                activation: activationResult,
                sharia: verifyResult
            },
            tawheed: '﴿ قُلْ هُوَ اللَّهُ أَحَدٌ ﴾',
            noHarm: 'لا ضرر ولا ضرار',
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── POST /geo/halal-check ────────────────────────────────────────────────────
/**
 * فحص موحّد للحلال وعدم الضرر حسب المنطقة
 * Body: { region?, action }
 */
router.post('/geo/halal-check', (req, res) => {
    try {
        const region = req.body?.region || req.query?.region || 'saudi';
        const action = req.body?.action;
        if (!action) {
            return res.status(400).json({ success: false, message: 'action مطلوب', timestamp: new Date().toISOString() });
        }
        if (!digitizer) {
            return res.status(503).json({ success: false, message: 'المُرقمِّن غير متاح', timestamp: new Date().toISOString() });
        }

        const profile = resolveGeoProfile(region);
        const check = digitizer.verify(action);
        const risk = check.halal ? 'low' : 'high';

        res.json({
            success: true,
            profile: {
                id: profile.id,
                labelAr: profile.labelAr,
                governance: profile.governance
            },
            halal: check.halal,
            noHarm: check.halal && !check.violations.some(v => v.action === 'harm'),
            risk,
            score: check.score,
            violations: check.violations,
            principleScores: check.principleScores,
            recommendations: check.recommendations,
            quran: '﴿ وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا ﴾',
            hadith: 'لا ضرر ولا ضرار',
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── GET /quran-db ────────────────────────────────────────────────────────────
/**
 * قاعدة بيانات الآيات والأحاديث المُصنَّفة
 * Query: ?domain=technology
 */
router.get('/quran-db', (req, res) => {
    try {
        if (!digitizer) {
            return res.status(503).json({ success: false, message: 'المُرقمِّن غير متاح', timestamp: new Date().toISOString() });
        }
        const { domain } = req.query;
        const domains = digitizer.getAllDomains();
        const data = domain
            ? { [domain]: digitizer.tag(domain) }
            : Object.fromEntries(domains.map(d => [d, digitizer.tag(d)]));

        res.json({
            success: true,
            bismillah: 'بسم الله الرحمن الرحيم',
            domains,
            data,
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── POST /verify ─────────────────────────────────────────────────────────────
/**
 * التحقق من توافق إجراء مع المبادئ الإسلامية
 * Body: { action }
 */
router.post('/verify', (req, res) => {
    try {
        const { action } = req.body || {};
        if (!action) {
            return res.status(400).json({ success: false, message: 'action مطلوب', timestamp: new Date().toISOString() });
        }
        if (!digitizer) {
            return res.status(503).json({ success: false, message: 'المُرقمِّن غير متاح', timestamp: new Date().toISOString() });
        }
        const result = digitizer.verify(action);
        res.json({
            success: true,
            bismillah: 'بسم الله الرحمن الرحيم',
            data: result,
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

module.exports = router;
