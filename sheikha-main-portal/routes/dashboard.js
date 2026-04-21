/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  📊 مسارات لوحة التحكم المركزية — Dashboard Routes
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const express = require('express');
const router  = express.Router();
const fs      = require('fs');
const path    = require('path');

function safeRead(file) {
    try { return JSON.parse(fs.readFileSync(path.join(__dirname, '../data', file), 'utf8')); }
    catch (_) { return null; }
}

// ─── GET /api/dashboard — نظرة عامة شاملة ────────────────────────────────────
router.get('/', (req, res) => {
    const activity  = safeRead('activity.json');
    const contracts = safeRead('contracts.json');
    const supply    = safeRead('supply.json');
    const govLog    = safeRead('governance-log.json');
    const gitState  = safeRead('git-state.json');

    res.json({
        success: true,
        overview: {
            market:     { status: 'active', active_offers: 42, daily_volume_sar: 2840000 },
            contracts:  { total: contracts?.meta?.total || 0, active: contracts?.meta?.active || 0 },
            supply:     { in_transit: supply?.meta?.in_transit || 0, pending: supply?.meta?.pending || 0 },
            governance: { compliance_rate: govLog?.meta?.compliance_rate || 1, violations: govLog?.meta?.failed || 0 },
            git:        { github: gitState?.github?.status || 'unknown', gitlab: gitState?.gitlab?.status || 'unknown' }
        },
        recent_activity: activity?.activity?.slice(0, 5) || [],
        alerts: [],
        timestamp: new Date().toISOString()
    });
});

// ─── GET /api/dashboard/market — حالة السوق ──────────────────────────────────
router.get('/market', (req, res) => {
    res.json({
        success: true,
        live_prices: {
            gold:     { price: 285.40, change: '+1.2%', exchange: 'LBMA', currency: 'SAR', unit: 'g' },
            silver:   { price: 3.12,   change: '+0.8%', exchange: 'COMEX', currency: 'SAR', unit: 'g' },
            copper:   { price: 42.80,  change: '-0.3%', exchange: 'LME',   currency: 'SAR', unit: 'kg' },
            aluminum: { price: 28.50,  change: '+0.5%', exchange: 'LME',   currency: 'SAR', unit: 'kg' }
        },
        active_offers: 42,
        active_buyers: 18,
        active_sellers: 24,
        daily_transactions: 37,
        timestamp: new Date().toISOString()
    });
});

// ─── GET /api/dashboard/contracts — ملخص العقود ──────────────────────────────
router.get('/contracts', (req, res) => {
    const data = safeRead('contracts.json');
    res.json({
        success: true,
        summary: data?.meta || { total: 0 },
        recent: (data?.contracts || []).slice(0, 3),
        timestamp: new Date().toISOString()
    });
});

// ─── GET /api/dashboard/supply — ملخص الإمداد ────────────────────────────────
router.get('/supply', (req, res) => {
    const data = safeRead('supply.json');
    res.json({
        success: true,
        summary: data?.meta || { total_orders: 0 },
        in_transit: (data?.supply_orders || []).filter(o => o.status === 'in_transit'),
        inventory: data?.inventory || {},
        timestamp: new Date().toISOString()
    });
});

// ─── GET /api/dashboard/governance — ملخص الحوكمة ────────────────────────────
router.get('/governance', (req, res) => {
    const data = safeRead('governance-log.json');
    res.json({
        success: true,
        summary: data?.meta || {},
        active_policies: data?.policies?.filter(p => p.status === 'active').length || 0,
        recent_checks: (data?.compliance_log || []).slice(0, 5),
        timestamp: new Date().toISOString()
    });
});

// ─── GET /api/dashboard/git — حالة Git ───────────────────────────────────────
router.get('/git', (req, res) => {
    const data = safeRead('git-state.json');
    res.json({
        success: true,
        github: data?.github || { status: 'unknown' },
        gitlab: data?.gitlab || { status: 'unknown' },
        health: data?.health || {},
        timestamp: new Date().toISOString()
    });
});

// ─── GET /api/dashboard/activity — النشاط الأخير ─────────────────────────────
router.get('/activity', (req, res) => {
    const data  = safeRead('activity.json');
    const limit = parseInt(req.query.limit) || 10;
    res.json({
        success: true,
        activities: (data?.activity || []).slice(0, limit),
        summary: data?.summary || {},
        timestamp: new Date().toISOString()
    });
});

// ─── GET /api/dashboard/alerts — التنبيهات ───────────────────────────────────
router.get('/alerts', (req, res) => {
    res.json({
        success: true,
        alerts: [
            { id: 'alt_001', level: 'info',    message: 'النحاس ارتفع 1.2% — LME', at: new Date().toISOString() },
            { id: 'alt_002', level: 'warning', message: 'عقد cnt_2026_y8b2c في انتظار الموافقة منذ 24 ساعة', at: new Date().toISOString() }
        ],
        count: 2,
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
