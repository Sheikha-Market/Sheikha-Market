/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  ⚙️  Execution Orchestrator Routes — منفذ القرارات والإنتاج
 *  مدعوم بشبكة الخلايا العصبية (Sheikha Execution Neural Cell Network)
 *  "إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ"
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const express = require('express');
const router  = express.Router();
const fs      = require('fs');
const path    = require('path');

const DATA_DIR    = path.join(__dirname, '../data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const SUPPLY_FILE = path.join(DATA_DIR, 'supply.json');

// ─── تحميل الشبكة العصبية ──────────────────────────────────────────────────────
let neuralNetwork = null;
try {
    const { getNetwork } = require('../lib/sheikha-execution-neural-cell-network');
    neuralNetwork = getNetwork();
    console.log('✅ [ORCHESTRATOR] شبكة الخلايا العصبية — مُحمَّلة ومُفعَّلة');
} catch (e) {
    console.warn('⚠️ [ORCHESTRATOR] فشل تحميل الشبكة العصبية:', e.message);
}

// Recognized units for the /activate endpoint
const VALID_UNITS = [
    'pm4', 'pm-neural', 'sheikha-code', 'git', 'dashboard',
    'market', 'supply', 'orchestrator', 'auto-execution'
];

// ─── helpers ──────────────────────────────────────────────────────────────────
function readJson(filePath, fallback) {
    try {
        if (!fs.existsSync(filePath)) return fallback;
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (_) {
        return fallback;
    }
}

// ─── GET /api/execution-orchestrator/state — حالة الأوركسترا ─────────────────
router.get('/state', (req, res) => {
    if (!neuralNetwork) {
        return res.status(503).json({ ok: false, error: 'الشبكة العصبية غير متوفرة' });
    }

    const state = neuralNetwork.getState();
    res.json(state);
});

// ─── POST /api/execution-orchestrator/auto — تشغيل التنفيذ التلقائي ──────────
router.post('/auto', (req, res) => {
    if (!neuralNetwork) {
        return res.status(503).json({ ok: false, error: 'الشبكة العصبية غير متوفرة' });
    }

    const ordersData = readJson(ORDERS_FILE, []);
    const supplyData = readJson(SUPPLY_FILE, []);

    const result = neuralNetwork.execute(ordersData, supplyData);

    res.json({
        ok:         true,
        timestamp:  result.executedAt,
        mode:       result.mode,
        reasoning:  result.reasoning,
        actions:    result.actions,
        systemState: {
            orders:    result.analysis.totalDemand,
            supply:    result.analysis.totalSupply,
            supplyGap: result.analysis.gap,
            contracts: 0,
            alerts:    result.analysis.gap > 100 ? 1 : 0
        },
        neural: result.neural,
        actionsExecuted:  result.actionsExecuted.length,
        executionSuccess: true
    });
});

// ─── GET /api/execution-orchestrator/network — حالة الشبكة العصبية ───────────
router.get('/network', (req, res) => {
    if (!neuralNetwork) {
        return res.status(503).json({ ok: false, error: 'الشبكة العصبية غير متوفرة' });
    }
    res.json({ ok: true, network: neuralNetwork.getNetworkStatus() });
});

// ─── POST /api/execution-orchestrator/activate — تفعيل وحدة ─────────────────
router.post('/activate', (req, res) => {
    const { unit } = req.body || {};
    if (!unit) {
        return res.status(400).json({ ok: false, error: 'الحقل المطلوب: unit' });
    }

    const normalizedUnit = String(unit).toLowerCase().trim();
    if (!VALID_UNITS.includes(normalizedUnit)) {
        return res.status(400).json({
            ok:      false,
            error:   'unrecognized_unit',
            message: `الوحدة '${unit}' غير معروفة. الوحدات المدعومة: ${VALID_UNITS.join(', ')}`
        });
    }

    res.json({
        ok:          true,
        message:     `تم تفعيل الوحدة: ${normalizedUnit}`,
        unit:        normalizedUnit,
        activatedAt: new Date().toISOString()
    });
});

module.exports = router;

