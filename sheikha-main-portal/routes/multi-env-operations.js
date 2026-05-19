'use strict';

const express = require('express');
const router = express.Router();

const blueprint = require('../lib/sheikha-multi-env-blueprint');
const { contextLoader } = require('../middleware/multi-env-context');

router.use(contextLoader);

router.get('/', (req, res) => {
    res.json({
        success: true,
        title: 'بوابة التشغيل متعددة البيئات — Sheikha Platform Blueprint',
        context: req.multiEnvContext,
        blueprint: blueprint.getBlueprint(),
        endpoints: {
            'GET  /api/multi-env/status': 'حالة البيئات والمحولات والامتثال',
            'GET  /api/multi-env/blueprint': 'الخدمات والمسارات والأولويات والخطة المرحلية',
            'GET  /api/multi-env/environments': 'قائمة البيئات المدعومة',
            'GET  /api/multi-env/adapters': 'المحولات المدمجة وحالة البوابة',
            'GET  /api/multi-env/operations-bot': 'حالة بوت التشغيل والرونبوكس',
            'GET  /api/multi-env/compliance': 'حالة الامتثال وسلسلة الإمداد البرمجية',
            'POST /api/multi-env/validate': 'تحقق سريع من الجاهزية لبيئة/قطاع محدد'
        },
        timestamp: new Date().toISOString()
    });
});

router.get('/status', (req, res) => {
    res.json({ success: true, context: req.multiEnvContext, data: blueprint.getStatus() });
});

router.get('/blueprint', (req, res) => {
    res.json({ success: true, context: req.multiEnvContext, data: blueprint.getBlueprint() });
});

router.get('/environments', (req, res) => {
    res.json({ success: true, data: blueprint.listEnvironmentStatuses() });
});

router.get('/adapters', (req, res) => {
    const status = blueprint.getStatus();
    res.json({ success: true, data: status.adapters });
});

router.get('/operations-bot', (req, res) => {
    res.json({ success: true, data: blueprint.getOperationsBotStatus() });
});

router.get('/compliance', (req, res) => {
    res.json({ success: true, data: blueprint.getComplianceStatus() });
});

router.post('/validate', (req, res) => {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
        return res.status(400).json({
            success: false,
            error: 'invalid_body',
            message: 'body يجب أن يكون كائن JSON صالح',
            timestamp: new Date().toISOString()
        });
    }

    const result = blueprint.validateRequest(req.body);
    if (!result.ok) {
        return res.status(400).json({
            success: false,
            errors: result.errors,
            timestamp: new Date().toISOString()
        });
    }

    return res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
