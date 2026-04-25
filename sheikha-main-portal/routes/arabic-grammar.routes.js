'use strict';

const express = require('express');

const router = express.Router();
const grammarEngine = require('../lib/sheikha-arabic-grammar-engine');

function now() {
    return new Date().toISOString();
}

router.get('/health', (_req, res) => {
    res.json({
        success: true,
        data: {
            service: 'arabic-grammar',
            engine: 'ready',
            version: grammarEngine.grammarRules.version
        },
        message: 'منظومة القواعد العربية تعمل بنجاح',
        timestamp: now()
    });
});

router.get('/rules', (_req, res) => {
    res.json({
        success: true,
        data: grammarEngine.grammarRules,
        message: 'تم تحميل قواعد اللغة العربية الرقمية',
        timestamp: now()
    });
});

router.get('/cells', (_req, res) => {
    res.json({
        success: true,
        data: grammarEngine.grammarRules.cells,
        message: 'تم تحميل بنية الخلايا المعرفية',
        timestamp: now()
    });
});

router.post('/analyze', (req, res) => {
    const text = req.body && (req.body.text || req.body.نص);

    if (!text) {
        return res.status(400).json({
            success: false,
            data: null,
            message: 'النص مطلوب للتحليل',
            timestamp: now()
        });
    }

    const analysis = grammarEngine.analyze(text);
    return res.json({
        success: true,
        data: analysis,
        message: 'تم التحليل النحوي بنجاح',
        timestamp: now()
    });
});

module.exports = router;
module.exports.router = router;
