// بسم الله الرحمن الرحيم
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🌌 UNIVERSAL ENTITY NEURAL ENGINE — مسارات API
 * شبكة شيخة العصبية الكونية الجامعة لكل جنس ونوع وصنف ووسيلة وغاية
 * ═══════════════════════════════════════════════════════════════════════════════
 * "وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا" — البقرة ٣١
 */
'use strict';

const express = require('express');
const router  = express.Router();

let universalEntityNN;
try {
    ({ universalEntityNN } = require('../lib/sheikha-universal-entity-neural-engine'));
} catch (e) {
    console.warn('[universal-entity routes] تحميل:', e.message);
}

// ── مساعد: التحقق من تحميل المحرك ────────────────────────────────────────────
function requireEngine(res) {
    if (!universalEntityNN) {
        res.status(503).json({ success: false, error: 'الشبكة العصبية الكونية غير متوفرة' });
        return false;
    }
    return true;
}

// ══════════════════════════════════════════════════════════════════════════════
// حالة المحرك
// ══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/universal-entity/status
 * حالة الشبكة العصبية الكونية الجامعة
 */
router.get('/status', (req, res) => {
    try {
        if (!requireEngine(res)) return;
        res.json({ success: true, data: universalEntityNN.status() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// الأجناس الكونية الاثنا عشر
// ══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/universal-entity/genera
 * قائمة الأجناس الكونية الاثنا عشر
 * ?withTypes=true  → يُعيد تفاصيل الأنواع داخل كل جنس
 */
router.get('/genera', (req, res) => {
    try {
        if (!requireEngine(res)) return;
        const withTypes = req.query.withTypes === 'true';
        const genera = universalEntityNN.listGenera(withTypes);
        res.json({ success: true, count: genera.length, data: genera });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * GET /api/universal-entity/genera/:genusId
 * تفاصيل جنس محدد بكل أنواعه وأصنافه
 */
router.get('/genera/:genusId', (req, res) => {
    try {
        if (!requireEngine(res)) return;
        const genus = universalEntityNN.getGenus(req.params.genusId.toUpperCase());
        if (!genus) return res.status(404).json({ success: false, error: 'الجنس غير موجود' });
        res.json({ success: true, data: genus });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * GET /api/universal-entity/genera/:genusId/types
 * أنواع جنس محدد
 */
router.get('/genera/:genusId/types', (req, res) => {
    try {
        if (!requireEngine(res)) return;
        const types = universalEntityNN.listTypes(req.params.genusId.toUpperCase());
        res.json({ success: true, count: types.length, data: types });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * GET /api/universal-entity/genera/:genusId/types/:typeId
 * تفاصيل نوع محدد داخل جنس
 */
router.get('/genera/:genusId/types/:typeId', (req, res) => {
    try {
        if (!requireEngine(res)) return;
        const type = universalEntityNN.getType(req.params.genusId.toUpperCase(), req.params.typeId.toUpperCase());
        if (!type) return res.status(404).json({ success: false, error: 'النوع غير موجود' });
        res.json({ success: true, data: type });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// التحليل العصبي الكوني
// ══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/universal-entity/analyze
 * تحليل شامل لأي كيان عبر الشبكة العصبية
 *
 * Body: {
 *   name, nameAr,
 *   genusId,    — مثال: PRD | FAC | ORG | MAT | SRV | KNW | MNS | NET | GHL | PLC | SYS | TME
 *   typeId,     — مثال: FOOD | SMLT | HUMN
 *   categoryId, — مثال: حبوب
 *   isLiving, isProduct, isMeans, isNetwork,
 *   hasQuranMention, halalStatus, tradeable, digitizable,
 *   maqasidAlignment, tawheedDistance, creationRank, utilityScore,
 *   sustainability, zakatApplicable,
 *   prohibitedGoods, shariaCompliant
 * }
 */
router.post('/analyze', (req, res) => {
    try {
        if (!requireEngine(res)) return;
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ success: false, error: 'بيانات الكيان مطلوبة' });
        }
        const result = universalEntityNN.analyze(req.body);
        res.status(result.success ? 200 : 422).json(result);
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * POST /api/universal-entity/analyze/batch
 * تحليل دُفعة كيانات دفعةً واحدة (حد أقصى 100)
 *
 * Body: { entities: [...] }
 */
router.post('/analyze/batch', (req, res) => {
    try {
        if (!requireEngine(res)) return;
        const entities = req.body.entities;
        if (!Array.isArray(entities) || entities.length === 0) {
            return res.status(400).json({ success: false, error: 'entities يجب أن يكون مصفوفة غير فارغة' });
        }
        if (entities.length > 100) {
            return res.status(400).json({ success: false, error: 'الحد الأقصى للدُفعة الواحدة 100 كيان' });
        }
        const results = universalEntityNN.analyzeBatch(entities);
        const succeeded = results.filter(r => r.success).length;
        res.json({ success: true, total: results.length, succeeded, failed: results.length - succeeded, data: results });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// التسجيل في السجل الجامع
// ══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/universal-entity/register
 * تسجيل كيان في السجل الجامع لشيخة وإسناد رقم موحد
 */
router.post('/register', (req, res) => {
    try {
        if (!requireEngine(res)) return;
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ success: false, error: 'بيانات الكيان مطلوبة للتسجيل' });
        }
        const result = universalEntityNN.register(req.body);
        res.status(result.success ? 201 : 422).json(result);
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// نظام الترقيم
// ══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/universal-entity/generate-id
 * توليد رقم جامع لكيان
 *
 * Body: { genusId, typeId, categoryId }
 */
router.post('/generate-id', (req, res) => {
    try {
        if (!requireEngine(res)) return;
        const { genusId, typeId, categoryId } = req.body || {};
        if (!genusId) return res.status(400).json({ success: false, error: 'genusId مطلوب' });
        const id = universalEntityNN.generateId(genusId, typeId || 'GEN', categoryId || 'GEN');
        res.json({ success: true, data: { id, genusId, typeId, categoryId } });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// البحث في التصنيف الكوني
// ══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/universal-entity/search?q=نحاس
 * البحث في الأجناس والأنواع والأصناف
 */
router.get('/search', (req, res) => {
    try {
        if (!requireEngine(res)) return;
        const results = universalEntityNN.search(req.query.q || '');
        res.json({ success: true, count: results.length, data: results });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// الإطار الإسلامي
// ══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/universal-entity/asma-al-husna
 * أسماء الله الحسنى المرتبطة بالأجناس
 */
router.get('/asma-al-husna', (req, res) => {
    try {
        if (!requireEngine(res)) return;
        res.json({ success: true, data: universalEntityNN.listAsmaAlHusna() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * GET /api/universal-entity/maqasid
 * المقاصد الشرعية الخمس
 */
router.get('/maqasid', (req, res) => {
    try {
        if (!requireEngine(res)) return;
        res.json({ success: true, data: universalEntityNN.listMaqasid() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * GET /api/universal-entity/quran-bridge
 * جسر الربط بالآيات القرآنية لكل جنس ونوع
 */
router.get('/quran-bridge', (req, res) => {
    try {
        if (!requireEngine(res)) return;
        res.json({ success: true, data: universalEntityNN.listQuranBridge() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// تصدير/استيراد الأوزان
// ══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/universal-entity/weights/export
 * تصدير أوزان الشبكة العصبية
 */
router.get('/weights/export', (req, res) => {
    try {
        if (!requireEngine(res)) return;
        res.json({ success: true, data: universalEntityNN.exportWeights() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * POST /api/universal-entity/weights/import
 * استيراد أوزان الشبكة العصبية
 */
router.post('/weights/import', (req, res) => {
    try {
        if (!requireEngine(res)) return;
        universalEntityNN.importWeights(req.body);
        res.json({ success: true, message: 'تم استيراد الأوزان بنجاح' });
    } catch (e) {
        res.status(400).json({ success: false, error: e.message });
    }
});

module.exports = router;
