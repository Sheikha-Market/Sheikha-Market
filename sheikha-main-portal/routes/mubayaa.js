/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🤝 مسارات المبايعة الرقمية
 *  Digital Pledge (Mubayaa) Routes
 *
 *  GET  /api/mubayaa/text              → نص المبايعة الرسمي
 *  POST /api/mubayaa                   → تقديم مبايعة رقمية جديدة
 *  GET  /api/mubayaa/:id               → تفاصيل مبايعة بالمعرّف
 *  GET  /api/mubayaa/verify/:sig       → التحقق من صحة توقيع رقمي
 *  GET  /api/mubayaa/stats             → إحصائيات المبايعات
 *  POST /api/mubayaa/neural/analyze    → تحليل عصبي جذري لبيانات مبايعة
 *  POST /api/mubayaa/neural/train      → تدريب الشبكة العصبية من السجل
 *  GET  /api/mubayaa/neural/status     → حالة الشبكة العصبية الجذرية
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const express    = require('express');
const router     = express.Router();
const Mubayaa    = require('../models/Mubayaa');
const { optionalAuth } = require('../middleware/auth');

// ─── الشبكة العصبية الجذرية ───────────────────────────────────────────────────
let neuralRoot = null;
try {
    neuralRoot = require('../lib/mubayaa-neural-root');
} catch (e) {
    console.warn('[MUBAYAA] الشبكة العصبية غير متاحة:', e.message);
}

// ─── نص المبايعة الرسمي ───────────────────────────────────────────────────────

router.get('/text', (req, res) => {
    res.json({
        success: true,
        title:   'المبايعة الرقمية — سوق شيخة',
        bismillah: 'بسم الله الرحمن الرحيم',
        textAr:  Mubayaa.officialTextAr,
        textEn:  Mubayaa.officialTextEn,
        basis:   'كتاب الله وسنة النبي محمد ﷺ'
    });
});

// ─── إحصائيات المبايعات ───────────────────────────────────────────────────────

router.get('/stats', (req, res) => {
    const total  = Mubayaa.count();
    const active = Mubayaa.count({ status: 'active' });

    res.json({
        success: true,
        stats: {
            total,
            active,
            revoked: total - active
        },
        timestamp: new Date().toISOString()
    });
});

// ─── التحقق من التوقيع الرقمي ────────────────────────────────────────────────

router.get('/verify/:signature', (req, res) => {
    const { signature } = req.params;

    if (!signature || signature.length < 10) {
        return res.status(400).json({
            success: false,
            message: 'التوقيع غير صالح'
        });
    }

    const all   = Mubayaa.findAll({ status: 'active' });
    const match = all.find(m => m.signature === signature);

    if (!match) {
        return res.json({
            success:  true,
            verified: false,
            message:  'التوقيع غير موجود في السجل'
        });
    }

    res.json({
        success:   true,
        verified:  true,
        pledgeId:  match.id,
        fullName:  match.fullName,
        pledgedAt: match.pledgedAt,
        message:   'المبايعة مسجّلة وموثّقة'
    });
});

// ─── تقديم مبايعة رقمية ──────────────────────────────────────────────────────

router.post('/', optionalAuth, (req, res) => {
    try {
        const {
            fullName,
            tribe,
            nationality = 'SA',
            religion    = 'Islam',
            madhhab,
            agreed
        } = req.body;

        // التحقق من البيانات الأساسية
        if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'الاسم الكامل مطلوب (حرفان على الأقل)'
            });
        }

        if (agreed !== true) {
            return res.status(400).json({
                success: false,
                message: 'يجب الموافقة الصريحة على نص المبايعة'
            });
        }

        // منع التكرار: مستخدم مسجّل لا يمكنه المبايعة مرتين
        const userId = req.user ? req.user.id : null;
        if (userId) {
            const existing = Mubayaa.findByUserId(userId);
            if (existing) {
                return res.status(409).json({
                    success:   false,
                    message:   'لقد سجّلت مبايعتك مسبقاً',
                    pledgeId:  existing.id,
                    pledgedAt: existing.pledgedAt,
                    signature: existing.signature
                });
            }
        }

        // إنشاء المبايعة
        const mubayaa = Mubayaa.create(
            {
                fullName: fullName.trim(),
                tribe:    tribe    ? String(tribe).trim()    : null,
                nationality,
                religion,
                madhhab:  madhhab  ? String(madhhab).trim()  : null,
                agreed:   true,
                userId
            },
            {
                ip: req.ip || req.headers['x-forwarded-for'] || null,
                ua: req.headers['user-agent'] || null
            }
        );

        res.status(201).json({
            success:   true,
            message:   'تمّت المبايعة الرقمية بنجاح — وفّقك الله',
            pledgeId:  mubayaa.id,
            signature: mubayaa.signature,
            pledgedAt: mubayaa.pledgedAt,
            textAr:    mubayaa.textAr
        });

    } catch (err) {
        console.error('خطأ في المبايعة الرقمية:', err.message);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء تسجيل المبايعة'
        });
    }
});

// ─── تفاصيل مبايعة بالمعرّف ──────────────────────────────────────────────────

router.get('/:id', (req, res) => {
    const mubayaa = Mubayaa.findById(req.params.id);

    if (!mubayaa) {
        return res.status(404).json({
            success: false,
            message: 'المبايعة غير موجودة'
        });
    }

    // إخفاء البيانات الحساسة في الاستجابة العامة
    res.json({
        success:    true,
        pledgeId:   mubayaa.id,
        fullName:   mubayaa.fullName,
        tribe:      mubayaa.tribe,
        nationality:mubayaa.nationality,
        pledgedAt:  mubayaa.pledgedAt,
        signature:  mubayaa.signature,
        status:     mubayaa.status,
        textAr:     mubayaa.textAr
    });
});

// ─── الشبكة العصبية — تحليل مبايعة ──────────────────────────────────────────

router.post('/neural/analyze', (req, res) => {
    if (!neuralRoot) {
        return res.status(503).json({ success: false, message: 'الشبكة العصبية غير متاحة' });
    }

    try {
        const data = req.body || {};
        const analysis = neuralRoot.analyze(data);

        res.json({
            success: true,
            bismillah: 'بسم الله الرحمن الرحيم',
            analysis
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── الشبكة العصبية — تدريب من السجل ────────────────────────────────────────

router.post('/neural/train', optionalAuth, (req, res) => {
    if (!neuralRoot) {
        return res.status(503).json({ success: false, message: 'الشبكة العصبية غير متاحة' });
    }

    const epochs = Math.min(parseInt(req.body.epochs || 5, 10), 20);
    const lr     = parseFloat(req.body.lr || 0.003);

    try {
        const result = neuralRoot.trainFromRegistry(epochs, lr);
        res.json({
            success: true,
            message: `تمّ تدريب الشبكة العصبية على ${result.trained} مبايعة — ${result.epochs} دورة`,
            result
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── الشبكة العصبية — الحالة ──────────────────────────────────────────────────

router.get('/neural/status', (req, res) => {
    if (!neuralRoot) {
        return res.status(503).json({ success: false, message: 'الشبكة العصبية غير متاحة' });
    }

    res.json({
        success: true,
        neural:  neuralRoot.status()
    });
});

module.exports = router;
