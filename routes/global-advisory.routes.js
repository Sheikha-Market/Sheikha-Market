// نقطة نهاية REST لاختبار الحوكمة العصبية الكونية
const express = require('express');
const router = express.Router();
const runGlobalAdvisory = require('../global-neural-governance-init');

// POST /api/global-advisory
router.post('/advisory', async (req, res) => {
    try {
        const context = req.body || {};
        const results = await runGlobalAdvisory(context);
        res.json({
            success: true,
            data: results,
            message: 'تم تنفيذ الاستشارة العصبية الكونية بنجاح',
            timestamp: Date.now()
        });
    } catch (e) {
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء تنفيذ الاستشارة',
            error: e.message,
            timestamp: Date.now()
        });
    }
});

module.exports = router;
