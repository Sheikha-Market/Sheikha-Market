/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🔗 مسارات سلاسل الإمداد — Supply Chain Routes
 *  "وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ" — الأنفال: 60
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const express = require('express');
const router  = express.Router();
const fs      = require('fs');
const path    = require('path');

const DATA_FILE = path.join(__dirname, '../data/supply.json');

function readData() {
    try {
        if (!fs.existsSync(DATA_FILE)) return { supply_orders: [], inventory: {}, suppliers: [] };
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch (_) {
        return { supply_orders: [], inventory: {}, suppliers: [] };
    }
}

function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// ─── GET /api/supply — نظرة عامة على الإمداد ──────────────────────────────────
router.get('/', (req, res) => {
    const data = readData();
    res.json({
        success: true,
        total_orders: (data.supply_orders || []).length,
        inventory_items: Object.keys(data.inventory || {}).length,
        active_suppliers: (data.suppliers || []).length,
        meta: data.meta || {},
        timestamp: new Date().toISOString()
    });
});

// ─── GET /api/supply/orders — أوامر التوريد ───────────────────────────────────
router.get('/orders', (req, res) => {
    const { status } = req.query;
    const data = readData();
    let orders = data.supply_orders || [];
    if (status) orders = orders.filter(o => o.status === status);

    res.json({ success: true, count: orders.length, orders, timestamp: new Date().toISOString() });
});

// ─── GET /api/supply/track/:id — تتبع الشحنة ──────────────────────────────────
router.get('/track/:id', (req, res) => {
    const data  = readData();
    const order = (data.supply_orders || []).find(o => o.id === req.params.id);

    if (!order) return res.status(404).json({ success: false, message: 'أمر التوريد غير موجود' });

    res.json({
        success: true,
        id: order.id,
        status: order.status,
        cargo: order.cargo,
        logistics: order.logistics,
        checkpoints: order.checkpoints || [],
        timestamp: new Date().toISOString()
    });
});

// ─── GET /api/supply/inventory — المخزون ─────────────────────────────────────
router.get('/inventory', (req, res) => {
    const data = readData();
    res.json({
        success: true,
        inventory: data.inventory || {},
        timestamp: new Date().toISOString()
    });
});

// ─── GET /api/supply/suppliers — الموردون ────────────────────────────────────
router.get('/suppliers', (req, res) => {
    const data = readData();
    res.json({
        success: true,
        count: (data.suppliers || []).length,
        suppliers: data.suppliers || [],
        timestamp: new Date().toISOString()
    });
});

// ─── POST /api/supply/orders — إنشاء أمر توريد ───────────────────────────────
router.post('/orders', (req, res) => {
    const { order_ref, supplier, cargo } = req.body;
    if (!cargo) return res.status(400).json({ success: false, message: 'بيانات الشحنة مطلوبة' });

    const data  = readData();
    const now   = new Date().toISOString();
    const order = {
        id:         `sup_${Date.now()}`,
        status:     'pending',
        created_at: now,
        order_ref:  order_ref || null,
        supplier:   supplier || null,
        cargo,
        logistics:  null,
        checkpoints: []
    };

    (data.supply_orders = data.supply_orders || []).push(order);
    data.meta = { ...data.meta, total_orders: data.supply_orders.length, last_sync: now };
    writeData(data);

    res.status(201).json({ success: true, message: 'تم إنشاء أمر التوريد', order, timestamp: now });
});

// ─── POST /api/supply/sync — مزامنة الإمداد ──────────────────────────────────
router.post('/sync', (req, res) => {
    const data = readData();
    const now  = new Date().toISOString();

    // تحديث وقت المزامنة
    data.meta = { ...data.meta, last_sync: now };
    writeData(data);

    res.json({
        success: true,
        message: 'تمت مزامنة سلسلة الإمداد بنجاح',
        synced_orders: (data.supply_orders || []).length,
        synced_suppliers: (data.suppliers || []).length,
        timestamp: now
    });
});

// ─── PUT /api/supply/orders/:id/status — تحديث حالة الأمر ───────────────────
router.put('/orders/:id/status', (req, res) => {
    const { status, checkpoint } = req.body;
    if (!status) return res.status(400).json({ success: false, message: 'الحالة مطلوبة' });

    const data = readData();
    const idx  = (data.supply_orders || []).findIndex(o => o.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'أمر التوريد غير موجود' });

    const now = new Date().toISOString();
    data.supply_orders[idx].status = status;
    if (checkpoint) {
        (data.supply_orders[idx].checkpoints = data.supply_orders[idx].checkpoints || []).push({
            ...checkpoint, at: now
        });
    }
    writeData(data);

    res.json({ success: true, message: 'تم تحديث حالة الشحنة', order: data.supply_orders[idx], timestamp: now });
});

module.exports = router;
