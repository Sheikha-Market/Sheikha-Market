/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🌱 مسارات المنظومة الزراعية الرقمية — Agricultural Digital System Routes
 *  شبكة الخلايا الجذرية العصبية الزراعية — من البذرة إلى الثمرة والتجارة
 *  "أَفَرَأَيْتُم مَّا تَحْرُثُونَ — أَأَنتُمْ تَزْرَعُونَهُ أَمْ نَحْنُ الزَّارِعُونَ" — الواقعة:63-64
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Endpoints:
 *   GET  /api/agriculture/status     — حالة شبكة الخلايا الزراعية
 *   GET  /api/agriculture/lifecycle  — مراحل دورة الحياة الزراعية الرقمية
 *   GET  /api/agriculture/meadows    — المروج والأنهار الرقمية
 *   POST /api/agriculture/assess     — تقدير مرحلة المنتج في دورة الحياة
 *   POST /api/agriculture/harvest    — إتمام صفقة الحصاد
 *   POST /api/agriculture/revive     — إحياء قائمة أو منتج خامل
 *   GET  /api/agriculture/cells      — قائمة جميع الخلايا الزراعية
 */

'use strict';

const express = require('express');
const router  = express.Router();

// ─── تحميل شبكة الخلايا الزراعية العصبية ─────────────────────────────────────

let agncn = null;
try {
    agncn = require('../core/neural-root-network/agricultural-ncn');
} catch (e) {
    console.warn('[AgRoute] ⚠️ لم يتم تحميل شبكة الخلايا الزراعية:', e.message);
}

// ─── دالة مساعدة: التحقق من تفعيل الشبكة ─────────────────────────────────────

function requireNetwork(res) {
    if (!agncn) {
        res.status(503).json({
            success: false,
            error: 'شبكة الخلايا الزراعية غير متاحة',
            code: 'AGNCN_UNAVAILABLE',
        });
        return false;
    }
    return true;
}

// ─── GET /api/agriculture/status ─────────────────────────────────────────────
/**
 * حالة شبكة الخلايا الجذرية العصبية الزراعية
 */
router.get('/status', (req, res) => {
    if (!requireNetwork(res)) return;

    try {
        const st = agncn.status();
        res.json({
            success: true,
            data: st,
            message: 'شبكة الخلايا الزراعية نشطة — بسم الله الرحمن الرحيم',
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─── GET /api/agriculture/lifecycle ──────────────────────────────────────────
/**
 * مراحل دورة الحياة الزراعية الرقمية
 * من البذرة → الجذور → السقي → النمو → الفروع → الأزهار → الثمار → الحصاد → التجارة
 */
router.get('/lifecycle', (req, res) => {
    if (!requireNetwork(res)) return;

    try {
        const stages = agncn.LIFECYCLE_STAGES;
        const cells  = agncn.AGRICULTURAL_CELLS;

        const enriched = stages.map(s => {
            const cell = cells.find(c => c.id === s.cellId);
            return {
                order:       s.order,
                icon:        s.icon,
                stage:       s.stage,
                stageEn:     s.stageEn,
                nameAr:      cell ? cell.nameAr : s.stage,
                description: cell ? cell.description : '',
                ayah:        cell ? cell.ayah : '',
                marketState: cell ? cell.marketState : '',
                triggers:    cell ? cell.triggers : [],
            };
        });

        res.json({
            success: true,
            data: {
                totalStages: stages.length,
                principle: 'أَفَرَأَيْتُم مَّا تَحْرُثُونَ — الواقعة:63',
                stages: enriched,
                harvestStage:  { order: 8,  nameAr: 'الحصاد',  icon: '🌾', description: 'جني الثمار وإتمام الصفقة' },
                tradeStage:    { order: 10, nameAr: 'التجارة', icon: '🏪', description: 'البيع في السوق المفتوح' },
                revivalStage:  { order: 11, nameAr: 'الإحياء', icon: '🌊', description: 'إحياء الأرض الميتة' },
            },
            message: 'دورة الحياة الزراعية الرقمية — من البذرة للثمرة والتجارة',
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─── GET /api/agriculture/meadows ────────────────────────────────────────────
/**
 * المروج والأنهار الرقمية — نظرة شاملة على تدفق السوق
 */
router.get('/meadows', (req, res) => {
    if (!requireNetwork(res)) return;

    try {
        const meadows = agncn.getMeadows();
        res.json({
            success: true,
            data: meadows,
            message: 'المروج والأنهار الرقمية — وَأَنزَلْنَا مِنَ السَّمَاءِ مَاءً — الحجر:22',
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─── GET /api/agriculture/cells ──────────────────────────────────────────────
/**
 * قائمة جميع الخلايا الزراعية العصبية
 */
router.get('/cells', (req, res) => {
    if (!requireNetwork(res)) return;

    try {
        const cells = agncn.AGRICULTURAL_CELLS.map(c => ({
            id:          c.id,
            number:      c.number,
            nameAr:      c.nameAr,
            nameEn:      c.nameEn,
            stage:       c.stage,
            stageEn:     c.stageEn,
            ayah:        c.ayah,
            description: c.description,
            marketState: c.marketState,
            weight:      c.weight,
            triggers:    c.triggers,
        }));

        res.json({
            success: true,
            data: {
                totalCells: cells.length,
                cells,
                rootedIn: 'الكتاب والسنة — Quran & Sunnah',
            },
            message: `${cells.length} خلية زراعية عصبية — مرقّمة بالكتاب والسنة`,
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─── POST /api/agriculture/assess ────────────────────────────────────────────
/**
 * تقدير مرحلة المنتج في دورة الحياة الزراعية
 * Body: { productId, status, featured, stock, price, orderCount, reviewCount, ... }
 */
router.post('/assess', (req, res) => {
    if (!requireNetwork(res)) return;

    try {
        const product = req.body || {};

        // تحقق أساسي
        if (typeof product !== 'object' || Array.isArray(product)) {
            return res.status(400).json({
                success: false,
                error: 'بيانات المنتج يجب أن تكون كائناً (object)',
            });
        }

        const result = agncn.assessProductStage(product);

        res.json({
            success: true,
            data: result,
            message: result.reachedHarvest
                ? `🌾 وصلنا للحصاد! المنتج في مرحلة: ${result.currentStage?.nameAr}`
                : `🌱 مرحلة المنتج الحالية: ${result.currentStage?.nameAr} — المرحلة التالية: ${result.nextStage?.nameAr || 'مكتمل'}`,
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─── POST /api/agriculture/harvest ───────────────────────────────────────────
/**
 * تفعيل مرحلة الحصاد — إتمام صفقة تجارية
 * "وَآتُوا حَقَّهُ يَوْمَ حَصَادِهِ وَلَا تُسْرِفُوا" — الأنعام:141
 * Body: { productId, buyerId, supplierId, quantity, price, currency }
 */
router.post('/harvest', (req, res) => {
    if (!requireNetwork(res)) return;

    try {
        const harvestData = req.body || {};

        // التحقق من عدم وجود ربا — الشريعة الإسلامية
        if (harvestData.hasInterest || (harvestData.interestRate && harvestData.interestRate > 0)) {
            return res.status(400).json({
                success: false,
                error: 'الربا محرّم — وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا — البقرة:275',
                code: 'RIBA_PROHIBITED',
            });
        }

        const result = agncn.harvest(harvestData);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                errors: result.errors,
                stage: result.stage,
            });
        }

        res.json({
            success: true,
            data: result,
            message: `🌾 تم الحصاد بنجاح — قيمة الصفقة: ${result.totalValue} ${result.currency}`,
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─── POST /api/agriculture/revive ────────────────────────────────────────────
/**
 * إحياء الأرض الميتة — تفعيل قائمة خاملة أو منتج مهجور
 * "وَأَحْيَيْنَا بِهِ بَلْدَةً مَّيْتًا كَذَٰلِكَ الْخُرُوجُ" — ق:11
 * Body: { listingId?, productId?, reason? }
 */
router.post('/revive', (req, res) => {
    if (!requireNetwork(res)) return;

    try {
        const revivalData = req.body || {};

        if (!revivalData.listingId && !revivalData.productId) {
            return res.status(400).json({
                success: false,
                error: 'معرّف القائمة (listingId) أو المنتج (productId) مطلوب',
            });
        }

        const result = agncn.revive(revivalData);

        res.json({
            success: true,
            data: result,
            message: `🌊 تم إحياء الأرض — القائمة نشطة من جديد — وَأَحْيَيْنَا بِهِ بَلْدَةً مَّيْتًا — ق:11`,
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

module.exports = router;
