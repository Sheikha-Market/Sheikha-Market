#!/usr/bin/env node
/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  SHEIKHA STARTUP DISPLAY — لوحة بدء تشغيل سوق شيخة                         ║
 * ║  يعرض حالة الخوادم + المحركات + المنافذ + PM2 بشكل مرئي منظّم               ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * التشغيل: node scripts/sheikha-startup-display.js
 *          npm run status  (إذا أُضيف للـ package.json)
 */

'use strict';

const http         = require('http');
const { execSync } = require('child_process');

// ─── ألوان ANSI ───────────────────────────────────────────────────────────────
const C = {
    reset:  '\x1b[0m',
    bold:   '\x1b[1m',
    dim:    '\x1b[2m',
    green:  '\x1b[32m',
    yellow: '\x1b[33m',
    red:    '\x1b[31m',
    cyan:   '\x1b[36m',
    blue:   '\x1b[34m',
    white:  '\x1b[37m',
    gray:   '\x1b[90m',
};

// ─── ثوابت ───────────────────────────────────────────────────────────────────
const MAIN_PORT     = parseInt(process.env.PORT || '8080', 10);
const PROXY_PORT    = 8081;
const HEALTH_PATH   = '/api/sheikha/status';
const CHECK_TIMEOUT = 2000; // ms

// ─── المحركات L0 (النشطة عند الإقلاع) ───────────────────────────────────────
const L0_ENGINES = [
    ['Security Engine',        'Sharia Engine'],
    ['Taqwa Engine',           'Quran & Sunnah'],
    ['Market Engine',          'Trade Engine'],
    ['AI Core (RAG+Agents)',   'Sovereign Cloud'],
    ['AWS Integration',        'Payments Engine'],
    ['Contracts Engine',       'Logistics Engine'],
    ['Metals+Scrap Markets',   'Legal Engine'],
    ['Dashboard Engine',       'Accounting Engine'],
    ['Smart Market',           'Trust Auth'],
    ['Digital Root v2',        'UMB Marketing'],
    ['Telecom Engine',         ''],
];

// ─── المحركات الكسولة (تُحمَّل عند الطلب) ────────────────────────────────────
const LAZY_ENGINES = [
    'Ihsan', 'Itqan', 'Barakah', 'Hikmah',
    'Calendar', 'Community', 'DevOps', 'Medical',
    'Capital', 'Cosmos', 'Gov Engine', 'Kaizen',
];

// ═══════════════════════════════════════════════════════════════════════════════
// أدوات مساعدة
// ═══════════════════════════════════════════════════════════════════════════════

/** فحص إذا كان المنفذ يستجيب عبر HTTP */
function checkPort(port) {
    return new Promise((resolve) => {
        const req = http.request(
            { hostname: '127.0.0.1', port, path: '/api/sheikha/status', method: 'GET' },
            (res) => {
                res.resume();
                resolve({ open: true, status: res.statusCode });
            }
        );
        req.setTimeout(CHECK_TIMEOUT, () => {
            req.destroy();
            resolve({ open: false, status: null });
        });
        req.on('error', () => resolve({ open: false, status: null }));
        req.end();
    });
}

/** فحص إذا كان المنفذ مستخدَماً (TCP فقط بدون HTTP) */
function isTcpPortBusy(port) {
    return new Promise((resolve) => {
        const net = require('net');
        const sock = new net.Socket();
        sock.setTimeout(CHECK_TIMEOUT);
        sock.on('connect', () => { sock.destroy(); resolve(true); });
        sock.on('error',   () => { sock.destroy(); resolve(false); });
        sock.on('timeout', () => { sock.destroy(); resolve(false); });
        sock.connect(port, '127.0.0.1');
    });
}

/** تنسيق عمود بعرض ثابت */
function pad(text, width) {
    const plain = text.replace(/\x1b\[[0-9;]*m/g, ''); // إزالة رموز الألوان للقياس
    const spaces = Math.max(0, width - plain.length);
    return text + ' '.repeat(spaces);
}

/** قراءة حالة PM2 */
function getPm2Status() {
    try {
        const raw = execSync('pm2 jlist 2>/dev/null', { timeout: 4000, encoding: 'utf8' });
        if (!raw.trim()) return [];
        const list = JSON.parse(raw);
        return list.map((p) => ({
            name:   p.name,
            status: p.pm2_env?.status || 'unknown',
            port:   p.pm2_env?.PORT || p.pm2_env?.env?.PORT || '—',
            pid:    p.pid ? String(p.pid) : '—',
            memory: p.monit?.memory ? Math.round(p.monit.memory / 1024 / 1024) + 'MB' : '—',
        }));
    } catch {
        return null; // PM2 غير متاح
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// الشاشة الرئيسية
// ═══════════════════════════════════════════════════════════════════════════════

async function display() {
    const W = 78; // عرض الصندوق الداخلي

    // ── 0. جمع البيانات بالتوازي ─────────────────────────────────────────────
    const [mainResult, proxyResult, mainTcp, pm2List] = await Promise.all([
        checkPort(MAIN_PORT),
        checkPort(PROXY_PORT),
        isTcpPortBusy(MAIN_PORT),
        Promise.resolve(getPm2Status()),
    ]);

    const mainUp   = mainResult.open;
    const proxyUp  = proxyResult.open;
    const mainBusy = mainTcp; // المنفذ مستخدَم حتى لو لم يردّ بـ HTTP

    // ── 1. بانر العنوان ──────────────────────────────────────────────────────
    console.log(`\n${C.cyan}╔${'═'.repeat(W)}╗${C.reset}`);
    console.log(`${C.cyan}║${C.reset}${' '.repeat(Math.floor((W - 28) / 2))}${C.bold}بسم الله الرحمن الرحيم${C.reset}${' '.repeat(Math.ceil((W - 28) / 2))}${C.cyan}║${C.reset}`);
    console.log(`${C.cyan}║${C.reset}${' '.repeat(W)}${C.cyan}║${C.reset}`);

    const logo = [
        '███████╗██╗  ██╗███████╗██╗██╗  ██╗██╗  ██╗ █████╗ ',
        '██╔════╝██║  ██║██╔════╝██║██║ ██╔╝██║  ██║██╔══██╗',
        '███████╗███████║█████╗  ██║█████╔╝ ███████║███████║',
        '╚════██║██╔══██║██╔══╝  ██║██╔═██╗ ██╔══██║██╔══██║',
        '███████║██║  ██║███████╗██║██║  ██╗██║  ██║██║  ██║',
        '╚══════╝╚═╝  ╚═╝╚══════╝╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝',
    ];
    for (const line of logo) {
        const pad0 = Math.floor((W - line.length) / 2);
        const pad1 = W - line.length - pad0;
        console.log(`${C.cyan}║${C.reset}${' '.repeat(pad0)}${C.bold}${C.cyan}${line}${C.reset}${' '.repeat(pad1)}${C.cyan}║${C.reset}`);
    }

    console.log(`${C.cyan}║${C.reset}${' '.repeat(W)}${C.cyan}║${C.reset}`);

    const sub1 = 'أول منظومة اقتصادية إسلامية رقمية للمعادن والسكراب';
    const sub1pad = Math.floor((W - sub1.length) / 2);
    console.log(`${C.cyan}║${C.reset}${' '.repeat(sub1pad)}${sub1}${' '.repeat(W - sub1.length - sub1pad)}${C.cyan}║${C.reset}`);

    const sub2 = 'المالك: سلمان أحمد بن سلمان الراجح';
    const sub2pad = Math.floor((W - sub2.length) / 2);
    console.log(`${C.cyan}║${C.reset}${' '.repeat(sub2pad)}${C.dim}${sub2}${C.reset}${' '.repeat(W - sub2.length - sub2pad)}${C.cyan}║${C.reset}`);

    console.log(`${C.cyan}║${C.reset}${' '.repeat(W)}${C.cyan}║${C.reset}`);
    console.log(`${C.cyan}╚${'═'.repeat(W)}╝${C.reset}\n`);

    // ── 2. حالة المنافذ ───────────────────────────────────────────────────────
    console.log(`  ${C.bold}╔══ حالة المنافذ ${'─'.repeat(W - 20)}${C.reset}\n`);

    function portLine(port, result, label) {
        if (result.open) {
            return `  ${C.green}✅${C.reset} المنفذ ${C.bold}${port}${C.reset}  ${C.green}يعمل${C.reset}  ${C.dim}HTTP ${result.status}${C.reset}  ${C.gray}← ${label}${C.reset}`;
        } else if (mainBusy && port === MAIN_PORT) {
            return `  ${C.yellow}⚡${C.reset} المنفذ ${C.bold}${port}${C.reset}  ${C.yellow}مشغول (TCP)${C.reset} — ${C.dim}الخادم يبدأ أو يستخدمه تطبيق آخر${C.reset}  ${C.gray}← ${label}${C.reset}`;
        } else {
            return `  ${C.red}🔴${C.reset} المنفذ ${C.bold}${port}${C.reset}  ${C.red}غير متاح${C.reset}  ${C.dim}الخادم لم يبدأ بعد${C.reset}  ${C.gray}← ${label}${C.reset}`;
        }
    }

    console.log(portLine(MAIN_PORT,  mainResult,  'الخادم الرئيسي'));
    console.log(portLine(PROXY_PORT, proxyResult, 'البروكسي / متصفح Codespaces'));

    // إذا الرئيسي لا يعمل لكن البروكسي يعمل → توضيح
    if (!mainUp && proxyUp) {
        console.log(`\n  ${C.yellow}ℹ️${C.reset}  ${C.bold}البروكسي 8081 يعمل لكن الخادم الرئيسي 8080 لا يستجيب بـ HTTP${C.reset}`);
        console.log(`     ابدأ الخادم أولاً:  ${C.cyan}npm start${C.reset}  ثم سيعمل 8080 وتُعاد توجيه الطلبات تلقائياً`);
    } else if (!mainUp && !proxyUp) {
        console.log(`\n  ${C.red}⚠️${C.reset}  ${C.bold}الخادم لم يبدأ بعد${C.reset}`);
        console.log(`     لبدء التشغيل:  ${C.cyan}npm start${C.reset}  أو  ${C.cyan}pm2 start ecosystem.config.js${C.reset}`);
    }

    console.log('');

    // ── 3. محركات المنظومة ────────────────────────────────────────────────────
    const l0Count    = L0_ENGINES.reduce((n, [a, b]) => n + (a ? 1 : 0) + (b ? 1 : 0), 0);
    const lazyCount  = LAZY_ENGINES.length;

    console.log(`  ${C.bold}╔══ محركات المنظومة ${'─'.repeat(W - 23)}${C.reset}\n`);
    console.log(`  ${C.green}✅ محركات نشطة (${l0Count})${C.reset}`);

    for (const [a, b] of L0_ENGINES) {
        const left  = pad(`  ${C.green}✅${C.reset} ${a}`, 44);
        const right = b ? `${C.green}✅${C.reset} ${b}` : '';
        console.log(left + right);
    }

    console.log(`\n  ${C.yellow}⏸️  تحميل ذكي (${lazyCount})${C.reset}  ${C.dim}— تُحمَّل عند الطلب فقط${C.reset}`);
    console.log(`  ${C.gray}${LAZY_ENGINES.join(' · ')}${C.reset}\n`);

    // ── 4. حالة PM2 ───────────────────────────────────────────────────────────
    console.log(`  ${C.bold}╔══ PM2 — حالة العمليات ${'─'.repeat(W - 27)}${C.reset}\n`);

    if (pm2List === null) {
        console.log(`  ${C.dim}PM2 غير مفعّل في هذه البيئة — الخادم يعمل بدون PM2${C.reset}`);
    } else if (pm2List.length === 0) {
        console.log(`  ${C.yellow}لا توجد عمليات PM2 نشطة${C.reset}  ${C.dim}— شغّل:  pm2 start ecosystem.config.js${C.reset}`);
    } else {
        const COL = [32, 18, 12, 10, 12];
        const header = [
            pad('  الاسم',           COL[0]),
            pad('الحالة',            COL[1]),
            pad('المنفذ',            COL[2]),
            pad('PID',               COL[3]),
            'الذاكرة',
        ];
        console.log(`  ${C.bold}${C.white}${header.join('')}${C.reset}`);
        console.log(`  ${'─'.repeat(W - 4)}`);

        for (const p of pm2List) {
            const statusIcon = p.status === 'online'  ? `${C.green}● online${C.reset}`
                             : p.status === 'stopped' ? `${C.red}○ stopped${C.reset}`
                             : p.status === 'errored' ? `${C.red}✗ errored${C.reset}`
                             :                          `${C.yellow}◌ ${p.status}${C.reset}`;

            const line = [
                pad(`  ${C.bold}${p.name}${C.reset}`, COL[0] + 11 /* offset for ANSI */),
                pad(statusIcon,                        COL[1] + 14),
                pad(String(p.port),                    COL[2]),
                pad(String(p.pid),                     COL[3]),
                String(p.memory),
            ];
            console.log(line.join(''));
        }
    }

    console.log(`\n${'═'.repeat(W + 2)}\n`);

    // ── 5. بانر الخلاصة ──────────────────────────────────────────────────────
    const activePort = mainUp ? MAIN_PORT : proxyUp ? PROXY_PORT : null;
    const portLabel  = mainUp
        ? `✅ المنفذ الرئيسي: ${MAIN_PORT}`
        : proxyUp
            ? `🔄 عبر البروكسي: ${PROXY_PORT} → ${MAIN_PORT}`
            : `⏳ في انتظار بدء الخادم`;
    const baseUrl    = activePort ? `http://localhost:${activePort}` : `http://localhost:${MAIN_PORT}`;

    const statusTitle = activePort
        ? `🕌  شيخة — ${mainUp ? 'جاهزة للخدمة' : 'متاحة عبر البروكسي'}`
        : '🕌  شيخة — في انتظار بدء الخادم';

    console.log(`${C.cyan}╔${'═'.repeat(W)}╗${C.reset}`);

    function centerLine(text) {
        const plain = text.replace(/\x1b\[[0-9;]*m/g, '');
        const p0 = Math.floor((W - plain.length) / 2);
        const p1 = W - plain.length - p0;
        console.log(`${C.cyan}║${C.reset}${' '.repeat(p0)}${text}${' '.repeat(p1)}${C.cyan}║${C.reset}`);
    }

    centerLine(`${C.bold}${statusTitle}${C.reset}`);
    console.log(`${C.cyan}║${C.reset}${' '.repeat(W)}${C.cyan}║${C.reset}`);
    centerLine(portLabel);

    if (activePort) {
        centerLine(`${C.bold}🌐 ${baseUrl}${C.reset}`);
        centerLine(`🧠 الشبكة العصبية: ${baseUrl}/neural-network.html`);
        centerLine(`📡 صحة النظام:      ${baseUrl}${HEALTH_PATH}`);
    } else {
        centerLine(`${C.yellow}لبدء الخادم:  npm start${C.reset}`);
    }

    console.log(`${C.cyan}║${C.reset}${' '.repeat(W)}${C.cyan}║${C.reset}`);
    centerLine(`${C.dim}لا إله إلا الله · لا ضرر ولا ضرار${C.reset}`);
    console.log(`${C.cyan}╚${'═'.repeat(W)}╝${C.reset}\n`);
}

display().catch((err) => {
    console.error('خطأ في عرض الشاشة:', err.message);
    process.exit(1);
});
