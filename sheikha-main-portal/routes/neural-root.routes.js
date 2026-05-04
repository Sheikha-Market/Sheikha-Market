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
