/**
 * بسم الله الرحمن الرحيم
 * ════════════════════════════════════════════════════════════════
 *  ROUTES — التفعيل الموحد بالكتاب والسنة
 *  /api/tawheed/*
 * ════════════════════════════════════════════════════════════════
 * «إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ» — النحل:90
 */
'use strict';

const express = require('express');
const router = express.Router();

const tawheedActivation = require('../lib/sheikha-tawheed-unified-activation');

// ─── GET /api/tawheed/status — حالة التفعيل ──────────────────────
router.get('/status', async (req, res) => {
    try {
        const report = await tawheedActivation.activateUnifiedSystem({
            region: req.query.region || 'SA',
            operatorId: req.query.operatorId || 'system'
        });

        res.json({
            success: true,
            basmala: report.basmala,
            shahada: report.shahada,
            data: {
                activatedAt: report.activatedAt,
                region: report.region,
                layers: report.layers,
                activationVerification: report.activationVerification,
                governance: report.governance,
                stats: report.stats
            },
            message: report.hamd,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'خطأ في تفعيل المنظومة: ' + err.message,
            timestamp: new Date().toISOString()
        });
    }
});

// ─── POST /api/tawheed/verify — التحقق الشرعي من أي محتوى ────────
// Body: { content, scope?, operationId? }
// scope: commerce | finance | data | general
router.post('/verify', (req, res) => {
    try {
        const { content, scope = 'general', operationId } = req.body || {};

        if (content === undefined || content === null) {
            return res.status(400).json({
                success: false,
                message: 'يجب إرسال حقل content للتحقق الشرعي',
                timestamp: new Date().toISOString()
            });
        }

        const result = tawheedActivation.verifyWithQuranSunnah({ content, scope, operationId });

        res.json({
            success: true,
            basmala: result.basmala,
            data: result,
            message: result.halal
                ? 'الحمد لله — المحتوى موافق للكتاب والسنة ✓'
                : 'يحتاج مراجعة شرعية — الرجاء مراجعة العلماء المختصين',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'خطأ في التحقق الشرعي: ' + err.message,
            timestamp: new Date().toISOString()
        });
    }
});

// ─── GET /api/tawheed/principles — مبادئ التوحيد والكتاب والسنة ──
router.get('/principles', (req, res) => {
    const principles = tawheedActivation.TAWHEED_PRINCIPLES;

    res.json({
        success: true,
        basmala: 'بسم الله الرحمن الرحيم',
        data: {
            principles,
            quran: {
                totalSurahs: 114,
                totalAyahs: 6236,
                primaryReference: 'القرآن الكريم — كلام الله المنزل على نبيه ﷺ'
            },
            sunnah: {
                mainBooks: ['صحيح البخاري', 'صحيح مسلم', 'السنن الأربعة', 'مسند أحمد', 'موطأ مالك'],
                primaryHadith: '«لَا ضَرَرَ وَلَا ضِرَارَ» — ابن ماجه، صحيح'
            },
            hardRules: [
                'لا ربا — «وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا» البقرة:275',
                'لا غرر — نهى ﷺ عن بيع الغرر',
                'لا غش — «مَنْ غَشَّنَا فَلَيْسَ مِنَّا»',
                'لا احتكار — «لَا يَحْتَكِرُ إِلَّا خَاطِئٌ»',
                'لا ضرر ولا ضرار — «لَا ضَرَرَ وَلَا ضِرَارَ»',
                'لا طاعة لمخلوق في معصية الخالق'
            ],
            governance: {
                layer0: 'القرآن الكريم + السنة النبوية — الأولوية المطلقة',
                layer1: 'أنظمة المملكة العربية السعودية',
                layer2: 'قانون دولة التشغيل — مشروط'
            }
        },
        message: 'الحمد لله على نعمة الإسلام',
        timestamp: new Date().toISOString()
    });
});

// ─── GET /api/tawheed/stats — إحصائيات التحقق الشرعي ─────────────
router.get('/stats', (req, res) => {
    const s = tawheedActivation.getStats();
    res.json({
        success: true,
        data: {
            ...s,
            isReady: tawheedActivation.isReady(),
            halalRate: s.totalVerifications > 0
                ? ((s.halalCount / s.totalVerifications) * 100).toFixed(1) + '%'
                : 'لا يوجد تحقق حتى الآن'
        },
        message: 'إحصائيات المنظومة الشرعية',
        timestamp: new Date().toISOString()
    });
});

console.log('[ROUTE: tawheed-activation] ✅ بسم الله — مسار التوحيد جاهز على /api/tawheed/*');

module.exports = router;
