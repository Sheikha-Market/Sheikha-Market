/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  📋 مسارات العقود الرقمية — Contracts Routes
 *  "يَا أَيُّهَا الَّذِينَ آمَنُوا أَوْفُوا بِالْعُقُودِ" — المائدة: 1
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const express = require('express');
const router  = express.Router();
const fs      = require('fs');
const path    = require('path');

const DATA_FILE = path.join(__dirname, '../data/contracts.json');

function readData() {
    try {
        if (!fs.existsSync(DATA_FILE)) return { contracts: [], meta: {} };
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch (_) {
        return { contracts: [], meta: {} };
    }
}

function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// ─── GET /api/contracts — قائمة العقود ───────────────────────────────────────
router.get('/', (req, res) => {
    const { status, type, page = 1, limit = 20 } = req.query;
    const data = readData();
    let contracts = data.contracts || [];

    if (status) contracts = contracts.filter(c => c.status === status);
    if (type)   contracts = contracts.filter(c => c.type   === type);

    const start = (Number(page) - 1) * Number(limit);
    const paged = contracts.slice(start, start + Number(limit));

    res.json({
        success: true,
        count: paged.length,
        total: contracts.length,
        page: Number(page),
        contracts: paged,
        timestamp: new Date().toISOString()
    });
});

// ─── GET /api/contracts/status — ملخص الحالة ──────────────────────────────────
router.get('/status', (req, res) => {
    const data  = readData();
    const total = (data.contracts || []).length;
    const byStatus = {};
    (data.contracts || []).forEach(c => { byStatus[c.status] = (byStatus[c.status] || 0) + 1; });

    res.json({
        success: true,
        total,
        by_status: byStatus,
        meta: data.meta || {},
        timestamp: new Date().toISOString()
    });
});

// ─── GET /api/contracts/:id — عقد واحد ───────────────────────────────────────
router.get('/:id', (req, res) => {
    const data     = readData();
    const contract = (data.contracts || []).find(c => c.id === req.params.id);

    if (!contract) {
        return res.status(404).json({ success: false, message: 'العقد غير موجود' });
    }

    res.json({ success: true, contract, timestamp: new Date().toISOString() });
});

// ─── POST /api/contracts — إنشاء عقد ─────────────────────────────────────────
router.post('/', (req, res) => {
    const { type, parties, items, terms } = req.body;

    if (!type || !parties || !items || !items.length) {
        return res.status(400).json({ success: false, message: 'بيانات العقد غير مكتملة' });
    }

    const data     = readData();
    const now      = new Date().toISOString();
    const contract = {
        id:         `cnt_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
        type,
        status:     'draft',
        created_at: now,
        parties,
        items,
        terms:      terms || {},
        sharia:     { compliant: null, checked_at: null },
        audit:      [{ action: 'created', by: parties?.buyer?.id || 'system', at: now }]
    };

    (data.contracts = data.contracts || []).push(contract);
    data.meta.total = data.contracts.length;
    data.meta.last_updated = now;
    writeData(data);

    res.status(201).json({
        success: true,
        message: 'تم إنشاء العقد بنجاح — في انتظار مراجعة الحوكمة',
        contract,
        timestamp: now
    });
});

// ─── PUT /api/contracts/:id/approve — الموافقة على العقد ──────────────────────
router.put('/:id/approve', (req, res) => {
    const data     = readData();
    const idx      = (data.contracts || []).findIndex(c => c.id === req.params.id);

    if (idx === -1) return res.status(404).json({ success: false, message: 'العقد غير موجود' });

    const now = new Date().toISOString();
    data.contracts[idx].status = 'active';
    data.contracts[idx].audit  = data.contracts[idx].audit || [];
    data.contracts[idx].audit.push({ action: 'approved', by: req.body.approver || 'system', at: now });
    writeData(data);

    res.json({
        success: true,
        message: 'تمت الموافقة على العقد',
        contract: data.contracts[idx],
        timestamp: now
    });
});

// ─── PUT /api/contracts/:id/close — إغلاق العقد ──────────────────────────────
router.put('/:id/close', (req, res) => {
    const data = readData();
    const idx  = (data.contracts || []).findIndex(c => c.id === req.params.id);

    if (idx === -1) return res.status(404).json({ success: false, message: 'العقد غير موجود' });

    const now = new Date().toISOString();
    data.contracts[idx].status     = 'completed';
    data.contracts[idx].closed_at  = now;
    data.contracts[idx].audit.push({ action: 'closed', by: req.body.closed_by || 'system', at: now, rating: req.body.rating });
    writeData(data);

    res.json({ success: true, message: 'تم إغلاق العقد وأرشفته', contract: data.contracts[idx], timestamp: now });
});

module.exports = router;
