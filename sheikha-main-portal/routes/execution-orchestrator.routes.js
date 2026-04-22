/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  ⚙️  Execution Orchestrator Routes — منفذ القرارات والإنتاج
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

// Minimum demand-supply gap that triggers BOOST_SUPPLY mode
const BOOST_THRESHOLD = 100;

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

/**
 * Calculate total pending demand from orders.json.
 * Supports both:
 *   - Simple array: [{ quantity, status }]
 *   - Object with orders key: { orders: [{ item: { quantity }, status }] }
 */
function calcPendingDemand(ordersData) {
    const list = Array.isArray(ordersData)
        ? ordersData
        : (ordersData.orders || []);

    return list.reduce((sum, o) => {
        const status = (o.status || '').toLowerCase();
        if (status !== 'pending' && status !== 'open') return sum;
        // Simple format: { quantity }
        const qty = typeof o.quantity === 'number'
            ? o.quantity
            : (o.item && typeof o.item.quantity === 'number' ? o.item.quantity : 0);
        return sum + qty;
    }, 0);
}

/**
 * Calculate total available supply from supply.json.
 * Supports both:
 *   - Simple array: [{ quantity }]
 *   - Object with inventory key: { inventory: { material: { available } } }
 */
function calcAvailableSupply(supplyData) {
    if (Array.isArray(supplyData)) {
        return supplyData.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
    }

    // Try inventory object { material: { available: N } }
    const inventory = supplyData.inventory;
    if (inventory && typeof inventory === 'object' && !Array.isArray(inventory)) {
        return Object.values(inventory).reduce((sum, v) => {
            return sum + (typeof v === 'object' ? (Number(v.available) || 0) : (Number(v) || 0));
        }, 0);
    }

    // Try supply_orders array
    const supplyOrders = supplyData.supply_orders || [];
    return supplyOrders.reduce((sum, s) => {
        const qty = s.cargo && typeof s.cargo.quantity === 'number' ? s.cargo.quantity : 0;
        return sum + qty;
    }, 0);
}

// ─── GET /api/execution-orchestrator/state — حالة الأوركسترا ─────────────────
router.get('/state', (req, res) => {
    const ordersData  = readJson(ORDERS_FILE, []);
    const supplyData  = readJson(SUPPLY_FILE, []);

    const totalDemand = calcPendingDemand(ordersData);
    const totalSupply = calcAvailableSupply(supplyData);
    const gap         = totalDemand - totalSupply;
    const mode        = gap > BOOST_THRESHOLD ? 'BOOST_SUPPLY' : 'NORMAL_PRODUCTION';

    res.json({
        success: true,
        state: {
            mode,
            totalDemand,
            totalSupply,
            gap,
            decision: gap > BOOST_THRESHOLD
                ? 'الطلب يتجاوز العرض — تفعيل وضع تعزيز الإمداد'
                : 'الإنتاج في معدلاته الطبيعية'
        },
        dataFiles: {
            orders: fs.existsSync(ORDERS_FILE),
            supply: fs.existsSync(SUPPLY_FILE)
        },
        timestamp: new Date().toISOString()
    });
});

// ─── POST /api/execution-orchestrator/auto — تشغيل التنفيذ التلقائي ──────────
router.post('/auto', (req, res) => {
    const ordersData  = readJson(ORDERS_FILE, []);
    const supplyData  = readJson(SUPPLY_FILE, []);

    const totalDemand = calcPendingDemand(ordersData);
    const totalSupply = calcAvailableSupply(supplyData);
    const gap         = totalDemand - totalSupply;
    const mode        = gap > BOOST_THRESHOLD ? 'BOOST_SUPPLY' : 'NORMAL_PRODUCTION';

    const actions = [];

    if (mode === 'BOOST_SUPPLY') {
        actions.push({
            action: 'BOOST_SUPPLY',
            reason: `فجوة الطلب والعرض: ${gap} وحدة`,
            recommendation: 'زيادة الإنتاج وفتح طلبات توريد إضافية'
        });
    } else {
        actions.push({
            action: 'MAINTAIN_PRODUCTION',
            reason: 'مستويات العرض والطلب متوازنة',
            recommendation: 'الاستمرار بالمعدلات الحالية'
        });
    }

    res.json({
        success: true,
        mode,
        analysis: {
            totalDemand,
            totalSupply,
            gap,
            threshold: BOOST_THRESHOLD
        },
        actions,
        executedAt: new Date().toISOString()
    });
});

// ─── POST /api/execution-orchestrator/activate — تفعيل وحدة ─────────────────
router.post('/activate', (req, res) => {
    const { unit } = req.body || {};
    if (!unit) {
        return res.status(400).json({ success: false, error: 'الحقل المطلوب: unit' });
    }

    const normalizedUnit = String(unit).toLowerCase().trim();
    if (!VALID_UNITS.includes(normalizedUnit)) {
        return res.status(400).json({
            success: false,
            error:   'unrecognized_unit',
            message: `الوحدة '${unit}' غير معروفة. الوحدات المدعومة: ${VALID_UNITS.join(', ')}`
        });
    }

    res.json({
        success: true,
        message: `تم تفعيل الوحدة: ${normalizedUnit}`,
        unit: normalizedUnit,
        activatedAt: new Date().toISOString()
    });
});

module.exports = router;
