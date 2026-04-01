#!/usr/bin/env node
'use strict';

const http  = require('http');
const os    = require('os');

function getArg(name, fallback) {
    const prefix = `--${name}=`;
    const arg = process.argv.find(item => item.startsWith(prefix));
    return arg ? arg.slice(prefix.length) : fallback;
}

const host = getArg('host', '127.0.0.1');
const port = Number(getArg('port', '48482'));

// ─── استيراد فعلي لمحركات المنظومة ───
let metalsStatus   = null;
let marketStatus   = null;
let neuralStatus   = null;

try {
    const m = require('../lib/sheikha-metals-neural-universe.js');
    m.init().then(() => { metalsStatus = m.getStatus(); }).catch(() => {});
    metalsStatus = m.getStatus();
} catch (_) {}

try {
    const k = require('../lib/sheikha-market-intelligence-engine.js');
    k.init();
    marketStatus = k.getStatus();
} catch (_) {}

try {
    const n = require('../lib/sheikha-infinite-neural-agents.js');
    n.engine.initialize().catch(() => {});
    neuralStatus = n.engine.getStatus ? n.engine.getStatus() : null;
} catch (_) {}

function buildPayload() {
    const hw = {
        cpu:       os.cpus()[0]?.model || 'CPU',
        cores:     os.cpus().length,
        ramGb:     Math.round(os.totalmem() / 1e9),
        freeRamGb: Math.round(os.freemem()  / 1e9),
        platform:  os.platform(),
        node:      process.version,
        uptimeH:   Math.round(os.uptime() / 3600),
    };

    return {
        success: true,
        data: {
            cloud_name:  'Sheikha Native Edge Cloud',
            runtime:     'Node Native Edge Bridge v2',
            status:      'ACTIVE',
            bism:        'بسم الله الرحمن الرحيم',
            ayah:        '﴿وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ﴾',
            founder:     'سلمان أحمد بن سلمان الراجح',
            domain:      'sheikha.top',
            email:       'market@sheikha.top',
            location:    'Khobar, Saudi Arabia',
            islamicPrinciples: [
                'لا ربا — لا غرر — لا غش — لا احتكار — لا نجش',
                'البيع عن تراضٍ — صدق القول — دقة الوزن',
                '«التاجر الصدوق مع النبيين والصديقين والشهداء»',
                '«من غشنا فليس منا» — صدق المعلومة واجب',
            ],
            hardware: hw,
            engines: {
                metalsUniverse: metalsStatus ? {
                    active:      true,
                    totalAgents: metalsStatus?.network?.totalAgents || 'activating',
                    clusters:    metalsStatus?.universe?.totalMetals || 28,
                    scrapGrades: metalsStatus?.universe?.totalScrapGrades || 18,
                    transportModes: metalsStatus?.universe?.transportModes || 6,
                } : { active: false, note: 'initializing' },
                marketIntelligence: marketStatus ? {
                    active:     true,
                    tickers:    marketStatus.tickers,
                    buySignals: marketStatus.metrics?.buySignals,
                    spreads:    '7 فارق محلل',
                    rfqBook:    'مفعّل',
                    islamicFinance: ['مرابحة', 'استصناع', 'سلم', 'زكاة'],
                } : { active: false, note: 'initializing' },
                infiniteNeural: neuralStatus ? {
                    active:      true,
                    note:        'شبكة عصبية موحدة لله',
                } : { active: false, note: 'initializing' },
            },
            apis: {
                metals:     ['/api/sheikha/metals/status', '/api/sheikha/metals/query/:id', '/api/sheikha/metals/scrap/:code', '/api/sheikha/metals/search'],
                market:     ['/api/sheikha/market/dashboard', '/api/sheikha/market/prices', '/api/sheikha/market/signals', '/api/sheikha/market/spreads'],
                finance:    ['/api/sheikha/market/finance/murabaha', '/api/sheikha/market/finance/zakah'],
                neural:     ['/api/sheikha/neural/status', '/api/sheikha/neural/pulse'],
                simulation: ['/api/sheikha/simulation/speed', '/api/sheikha/full-status'],
            },
            protocols: [
                'Native Edge Health Check',
                'Background Runtime Integration',
                'Sheikha Main Portal Bridge (8080)',
                'Vercel Serverless Ready',
                'WebSocket: أسعار لحظية',
                'PWA: Service Worker Active',
            ],
            timestamp: new Date().toISOString(),
        },
        message: 'Sheikha Native Edge Cloud — منظومة شيخة الاقتصادية الإسلامية',
        timestamp: new Date().toISOString(),
    };
}

const server = http.createServer((req, res) => {
    // تحديث بيانات المحركات عند كل طلب
    try {
        const m = require('../lib/sheikha-metals-neural-universe.js');
        metalsStatus = m.getStatus();
    } catch (_) {}
    try {
        const k = require('../lib/sheikha-market-intelligence-engine.js');
        marketStatus = k.getStatus();
    } catch (_) {}

    const payload = buildPayload();
    const body    = JSON.stringify(payload, null, 2);
    res.writeHead(200, {
        'Content-Type':  'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
    });
    res.end(body);
});

server.listen(port, host, () => {
    process.stdout.write(`☪️  Sheikha Native Edge Cloud on http://${host}:${port}\n`);
    process.stdout.write(`    المحركات: metals | market | neural | simulation\n`);
    process.stdout.write(`    المالك: سلمان أحمد بن سلمان الراجح\n`);
});