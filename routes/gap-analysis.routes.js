// نقطة نهاية تحليل الفجوات الهيكلية والشرعية
const express = require('express');
const router = express.Router();
const globalNeuralGovernance = require('../lib/sheikha-global-neural-governance');
const { analyzeAdapters } = require('../lib/gap-analysis');

// POST /api/global-advisory/diagnose
router.post('/diagnose', (req, res) => {
    const report = analyzeAdapters(globalNeuralGovernance.adapters);
    res.json({
        success: true,
        data: report,
        message: 'تقرير الفجوات الهيكلية والشرعية والتكاملية',
        timestamp: Date.now()
    });
});

module.exports = router;
