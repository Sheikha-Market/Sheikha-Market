#!/usr/bin/env node
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║   🌌 شيخة Meta AI — خادم الخلفية المستقل                                  ║
 * ║   Sheikha Meta AI Background Worker                                        ║
 * ║   يعمل بالخلفية بشكل مستقل عبر PM2 — autorestart: true                   ║
 * ║                                                                              ║
 * ║   بسم الله الرحمن الرحيم                                                    ║
 * ║   رُقِّمَت بالكتاب والسنة — وُحِّدَت لله وحده                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * تشغيل: pm2 start ecosystem.config.js --only sheikha-meta-background
 * إيقاف: pm2 stop sheikha-meta-background
 * حالة: pm2 status sheikha-meta-background
 * سجلات: pm2 logs sheikha-meta-background
 */

'use strict';

try { require('dotenv').config(); } catch (_) {}

const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const fs       = require('fs');
const crypto   = require('crypto');

const PORT = process.env.META_BACKGROUND_PORT || 8085;
const app  = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── تحميل محرك Meta ─────────────────────────────────────────────────────────
let engine;
try {
    const SheikhMetaEngine = require('../lib/sheikha-meta-engine');
    engine = new SheikhMetaEngine({ app });
    console.log('✅ [Meta Background] SheikhMetaEngine محمّل — 65 API مسار');
} catch (e) {
    console.error('❌ [Meta Background] فشل تحميل SheikhMetaEngine:', e.message);
    process.exit(1);
}

// ─── صفحة الحالة ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    const status = engine.getStatus();
    res.json({
        service: 'شيخة Meta AI — خادم الخلفية',
        version: status.version,
        port: PORT,
        uptime: process.uptime().toFixed(0) + 's',
        status: 'running ✅',
        apis: status.apis,
        stats: status.stats,
        docs: `http://localhost:${PORT}/api/شيخة-ميتا/لوحة-التحكم`,
    });
});

// ─── نبض الخادم Heartbeat ────────────────────────────────────────────────────
let heartbeatCount = 0;
setInterval(() => {
    heartbeatCount++;
    if (heartbeatCount % 60 === 0) { // كل دقيقة
        const stats = engine.getStatus().stats;
        console.log(`💓 [Meta Background] نبض #${heartbeatCount / 60}min | أحداث: ${stats.eventsSent} | واتساب: ${stats.whatsappSent} | عملاء: ${stats.leadsCaptures}`);
    }
}, 1000);

// ─── معالجة إشارات الإغلاق الأمان ────────────────────────────────────────────
process.on('SIGTERM', () => {
    console.log('🛑 [Meta Background] استقبل SIGTERM — إغلاق أمن...');
    server.close(() => { console.log('✅ [Meta Background] أُغلق بأمان'); process.exit(0); });
    setTimeout(() => process.exit(0), 5000);
});
process.on('SIGINT', () => {
    console.log('🛑 [Meta Background] استقبل SIGINT — إغلاق...');
    process.exit(0);
});
process.on('uncaughtException', e => {
    console.error('❌ [Meta Background] استثناء غير محجوز:', e.message);
});
process.on('unhandledRejection', e => {
    console.error('❌ [Meta Background] رفض غير محجوز:', e?.message || e);
});

// ─── بدء الاستماع ────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════════════╗
║        🌌 شيخة Meta AI — خادم الخلفية المستقل                  ║
╠══════════════════════════════════════════════════════════════════╣
║   🌐 http://localhost:${PORT}                                       ║
║   📡 CAPI: http://localhost:${PORT}/api/شيخة-ميتا/capi/حدث         ║
║   📱 WA:   http://localhost:${PORT}/api/شيخة-ميتا/واتساب/رسالة     ║
║   📊 Stats: http://localhost:${PORT}/api/شيخة-ميتا/إحصائيات        ║
╚══════════════════════════════════════════════════════════════════╝
`);
});
