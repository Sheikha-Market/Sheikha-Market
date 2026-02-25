'use strict';
/**
 * بسم الله الرحمن الرحيم
 * Routes: علامات الساعة (تثقيف شرعي)
 */
const express = require('express');
const router = express.Router();
const SheikhaAkhirAlzamanEngine = require('../lib/sheikha-akhir-alzaman-engine');

const engine = new SheikhaAkhirAlzamanEngine();

router.get('/status', (req, res) => {
    res.json({
        success: true,
        data: engine.getStatus(),
        timestamp: new Date().toISOString()
    });
});

router.get('/signs', (req, res) => {
    const level = String(req.query.level || 'all').toLowerCase();
    const allowed = ['all', 'major', 'minor'];
    const selected = allowed.includes(level) ? level : 'all';
    res.json({
        success: true,
        data: engine.getSigns(selected),
        disclaimer: 'العلم عند الله — لا تحديد زمني ولا جزم بوقوع حدث معيّن الآن',
        timestamp: new Date().toISOString()
    });
});

router.get('/important', (req, res) => {
    res.json({
        success: true,
        data: engine.getImportantAlerts(),
        timestamp: new Date().toISOString()
    });
});

module.exports = router;

