/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * مسارات API — محرك التحالف بالنية والأمان
 * /api/niyyah-coalition/*
 * "ستصالحون الروم صلحاً آمناً وتغزون أنتم وهم عدواً من ورائكم" — أبو داود 4292
 * ═══════════════════════════════════════════════════════════════════════════════
 */
'use strict';

const express = require('express');
const router  = express.Router();

let _engine = null;

function getEngine() {
    if (!_engine) {
        const Engine = require('../lib/sheikha-niyyah-coalition-engine.js');
        _engine = new Engine();
        console.log('✅ [NIYYAH-COALITION] محرك التحالف بالنية والأمان — مُفعَّل');
    }
    return _engine;
}

/* ── GET: لوحة التحكم ──────────────────────────────────────────────────────── */
router.get('/dashboard', (req, res) => {
    res.json({ success: true, ...getEngine().getDashboard() });
});

/* ── GET: الحالة العامة ────────────────────────────────────────────────────── */
router.get('/status', (req, res) => {
    res.json({ success: true, ...getEngine().getStatus() });
});

/* ── GET: التقرير الكامل ───────────────────────────────────────────────────── */
router.get('/full-report', (req, res) => {
    res.json({ success: true, ...getEngine().getFullReport() });
});

/* ── GET: الحديث الأساسي ───────────────────────────────────────────────────── */
router.get('/foundation-hadith', (req, res) => {
    res.json({ success: true, ...getEngine().getFoundationHadith() });
});

/* ── GET: مراحل التحالف ────────────────────────────────────────────────────── */
router.get('/stages', (req, res) => {
    res.json({ success: true, ...getEngine().getCoalitionStages() });
});

/* ── GET: درجات النية ──────────────────────────────────────────────────────── */
router.get('/niyyah-levels', (req, res) => {
    res.json({ success: true, ...getEngine().getNiyyahLevels() });
});

/* ── GET: قواعد الأمان ─────────────────────────────────────────────────────── */
router.get('/safety-rules', (req, res) => {
    res.json({ success: true, ...getEngine().getSafetyRules() });
});

/* ── GET: سجل إعلانات النية ────────────────────────────────────────────────── */
router.get('/niyyah-history', (req, res) => {
    res.json({ success: true, ...getEngine().getNiyyahHistory() });
});

/* ── POST: التحقق من النية ─────────────────────────────────────────────────── */
/**
 * Body: { niyyahIds: string[], operation: string }
 * مثال: { "niyyahIds": ["LILLAH", "DAFU_ZULM"], "operation": "CS-01" }
 */
router.post('/validate-niyyah', (req, res) => {
    try {
        const { niyyahIds = [], operation = 'general' } = req.body || {};
        const result = getEngine().validateNiyyah(niyyahIds, operation);
        res.json({ success: true, ...result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/* ── POST: التطبيق الآمن ───────────────────────────────────────────────────── */
/**
 * Body: { stageId: string, niyyahIds: string[], context?: object }
 * مثال: { "stageId": "CS-01", "niyyahIds": ["LILLAH", "MASLAHAM"] }
 */
router.post('/apply-safely', (req, res) => {
    try {
        const { stageId, niyyahIds = [], context = {} } = req.body || {};

        if (!stageId) {
            return res.status(400).json({
                success: false,
                message: 'stageId مطلوب — مثال: CS-01 أو CS-02',
                validStageIds: ['CS-01', 'CS-02', 'CS-03', 'CS-04', 'CS-05']
            });
        }

        const result = getEngine().applySafely(stageId, niyyahIds, context);
        const httpStatus = result.allowed ? 200 : 422;
        res.status(httpStatus).json({ success: result.allowed, ...result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
