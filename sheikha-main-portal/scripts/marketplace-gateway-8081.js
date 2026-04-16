#!/usr/bin/env node
/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  SHEIKHA MARKETPLACE GATEWAY — بوابة سوق الأسواق الجامع                    ║
 * ║  منفذ 8081 (أو أقرب منفذ حر تلقائياً عبر الشبكة العصبية)                  ║
 * ║                                                                              ║
 * ║  • سوق للأسواق: معادن + تقنية + علوم + استشارات + تمويل إسلامي + وقف      ║
 * ║  • لا ضرر ولا ضرار — شريعة إسلامية في كل معاملة                           ║
 * ║  • لا يعتمد على منفذ واحد — الشبكة العصبية تجد المنفذ الحر                 ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * التشغيل: node scripts/marketplace-gateway-8081.js
 * أو عبر pm2: pm2 start scripts/marketplace-gateway-8081.js --name sheikha-marketplace
 */

'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const http    = require('http');
const https   = require('https');
const url     = require('url');
const path    = require('path');

// ─── الشبكة العصبية للمنافذ ──────────────────────────────────────────────────
const { portEngine }           = require('../core/ports');
const { MARKETPLACE_SECTORS,
        resolveMarketSector }  = require('../core/ports/marketplace-router');

// ─── ثوابت ───────────────────────────────────────────────────────────────────
const MAIN_PORT      = parseInt(process.env.PORT || '8080', 10);
const MAIN_HOST      = '127.0.0.1';
const TAWHEED        = 'لا إله إلا الله';
const NO_HARM        = 'لا ضرر ولا ضرار';

// ─── قواعد CORS للمنفذ 8081 ──────────────────────────────────────────────────
const CORS_HEADERS = {
    'Access-Control-Allow-Origin':  process.env.MARKETPLACE_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Sheikha-DID',
    'Access-Control-Max-Age':       '86400',
    'X-Powered-By':                 'Sheikha Neural Port Network',
    'X-Tawheed':                    TAWHEED,
    'X-No-Harm':                    NO_HARM,
};

// ─── الحماية الأمنية ─────────────────────────────────────────────────────────
const SECURITY_HEADERS = {
    'X-Content-Type-Options':  'nosniff',
    'X-Frame-Options':         'SAMEORIGIN',
    'X-XSS-Protection':        '1; mode=block',
    'Referrer-Policy':         'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self' https:; connect-src 'self' https: wss:;",
};

// ─── Rate limiting بسيط ──────────────────────────────────────────────────────
const _requests = new Map();   // ip → { count, resetAt }
const RATE_LIMIT = 1000;       // 1000 طلب / 15 دقيقة
const RATE_WINDOW = 15 * 60 * 1000;

function checkRateLimit(ip) {
    const now = Date.now();
    const rec = _requests.get(ip);
    if (!rec || now > rec.resetAt) {
        _requests.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
        return true;
    }
    rec.count++;
    return rec.count <= RATE_LIMIT;
}

// ═══════════════════════════════════════════════════════════════
// معالج كل طلب
// ═══════════════════════════════════════════════════════════════
function handleRequest(req, res) {
    const ip       = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const parsed   = url.parse(req.url, true);
    const pathname = parsed.pathname || '/';

    // ── CORS preflight ──────────────────────────────────────────
    if (req.method === 'OPTIONS') {
        res.writeHead(204, { ...CORS_HEADERS, ...SECURITY_HEADERS });
        return res.end();
    }

    // ── رفض المنهجيات المحظورة ───────────────────────────────────
    if (['TRACE', 'TRACK'].includes(req.method)) {
        return sendJSON(res, 405, { success: false, message: 'Method Not Allowed' });
    }

    // ── Rate limit ───────────────────────────────────────────────
    if (!checkRateLimit(ip)) {
        return sendJSON(res, 429, {
            success: false,
            message: 'تم تجاوز حد الطلبات. حاول بعد قليل.',
            no_harm: NO_HARM,
        });
    }

    const allHeaders = { ...CORS_HEADERS, ...SECURITY_HEADERS };

    // ══════════════════════════════════════════════════════════════
    // صفحة الترحيب / الصفحة الرئيسية
    // ══════════════════════════════════════════════════════════════
    if (pathname === '/' || pathname === '/marketplace') {
        return sendJSON(res, 200, {
            schema:   'sheikha/v2',
            tawheed:  TAWHEED,
            nameAr:   'سوق الأسواق الجامع — شيخة',
            nameEn:   'Sheikha Multi-Marketplace Gateway',
            verse:    { ref: 'النساء:٢٩', text: 'إِلَّا أَن تَكُونَ تِجَارَةً عَن تَرَاضٍ مِّنكُمْ' },
            no_harm:  NO_HARM,
            sectors:  MARKETPLACE_SECTORS.map((s) => ({
                id:     s.id,
                nameAr: s.nameAr,
                nameEn: s.nameEn,
                icon:   s.icon,
                scope:  s.scope,
                path:   s.path,
                maqsad: s.maqsad,
            })),
            port: portEngine.marketplacePort,
            main_api: `http://${MAIN_HOST}:${MAIN_PORT}/api`,
        }, allHeaders);
    }

    // ══════════════════════════════════════════════════════════════
    // فحص الصحة
    // ══════════════════════════════════════════════════════════════
    if (pathname === '/marketplace/health' || pathname === '/health') {
        return sendJSON(res, 200, {
            status:     'OK',
            schema:     'sheikha/v2',
            tawheed:    TAWHEED,
            no_harm:    NO_HARM,
            port:       portEngine.marketplacePort,
            main_port:  portEngine.mainPort || MAIN_PORT,
            network:    portEngine._rawStatus(),
            timestamp:  new Date().toISOString(),
        }, allHeaders);
    }

    // ══════════════════════════════════════════════════════════════
    // حالة الشبكة العصبية
    // ══════════════════════════════════════════════════════════════
    if (pathname === '/marketplace/network' || pathname === '/network') {
        return sendJSON(res, 200, portEngine._network.getNetworkStatus(), allHeaders);
    }

    // ══════════════════════════════════════════════════════════════
    // قائمة القطاعات
    // ══════════════════════════════════════════════════════════════
    if (pathname === '/marketplace/sectors') {
        return sendJSON(res, 200, {
            schema:  'sheikha/v2',
            tawheed: TAWHEED,
            sectors: MARKETPLACE_SECTORS,
            count:   MARKETPLACE_SECTORS.length,
        }, allHeaders);
    }

    // ══════════════════════════════════════════════════════════════
    // توجيه طلبات /marketplace/* إلى الخادم الرئيسي
    // ══════════════════════════════════════════════════════════════
    if (pathname.startsWith('/marketplace/')) {
        const sector = resolveMarketSector(pathname);
        const targetPath = sector && sector.target
            ? sector.target.replace(`http://${MAIN_HOST}:${MAIN_PORT}`, '') + (parsed.search || '')
            : pathname.replace('/marketplace', '/api') + (parsed.search || '');

        return proxyToMain(req, res, targetPath, allHeaders);
    }

    // ══════════════════════════════════════════════════════════════
    // أي مسار آخر: وكيل عام للخادم الرئيسي
    // ══════════════════════════════════════════════════════════════
    return proxyToMain(req, res, req.url, allHeaders);
}

// ═══════════════════════════════════════════════════════════════
// وكيل الطلبات للخادم الرئيسي (8080)
// ═══════════════════════════════════════════════════════════════
function proxyToMain(req, res, targetPath, extraHeaders = {}) {
    const actualMain = portEngine.mainPort || MAIN_PORT;

    const options = {
        hostname: MAIN_HOST,
        port:     actualMain,
        path:     targetPath,
        method:   req.method,
        headers:  {
            ...req.headers,
            host: `${MAIN_HOST}:${actualMain}`,
            'X-Forwarded-For':   req.socket.remoteAddress,
            'X-Gateway-Port':    String(portEngine.marketplacePort),
            'X-Sheikha-Gateway': 'marketplace-8081',
        },
        timeout: 25000,
    };

    const proxyReq = http.request(options, (proxyRes) => {
        const responseHeaders = {
            ...proxyRes.headers,
            ...extraHeaders,
        };
        res.writeHead(proxyRes.statusCode || 200, responseHeaders);
        proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('timeout', () => {
        proxyReq.destroy();
        sendJSON(res, 504, {
            success: false,
            message: 'انتهت مهلة الاتصال بالخادم الرئيسي',
            no_harm: NO_HARM,
        }, extraHeaders);
    });

    proxyReq.on('error', (err) => {
        if (!res.headersSent) {
            sendJSON(res, 502, {
                success:    false,
                message:    `خطأ في الاتصال بالخادم الرئيسي: ${err.code || err.message}`,
                suggestion: `تأكد من تشغيل الخادم الرئيسي على المنفذ ${actualMain}`,
                no_harm:    NO_HARM,
            }, extraHeaders);
        }
    });

    if (req.method !== 'GET' && req.method !== 'HEAD') {
        req.pipe(proxyReq, { end: true });
    } else {
        proxyReq.end();
    }
}

// ═══════════════════════════════════════════════════════════════
// مساعد: إرسال JSON
// ═══════════════════════════════════════════════════════════════
function sendJSON(res, code, body, extraHeaders = {}) {
    const payload = JSON.stringify(body, null, 2);
    if (!res.headersSent) {
        res.writeHead(code, {
            'Content-Type':   'application/json; charset=utf-8',
            'Content-Length': Buffer.byteLength(payload),
            ...extraHeaders,
        });
    }
    res.end(payload);
}

// ═══════════════════════════════════════════════════════════════
// الإطلاق عبر الشبكة العصبية
// ═══════════════════════════════════════════════════════════════
async function start() {

    // ① أحداث الشبكة العصبية
    portEngine.on('cell:relocated', (info) => console.log(info.msg));
    portEngine.on('cell:alive',     (info) => {
        if (info.cell === 'MARKETPLACE') {
            console.log(`🏪 [MARKETPLACE] بوابة الأسواق تعمل على المنفذ ${info.port}`);
        }
    });
    portEngine.on('cell:healing',   (info) => console.log(`🔄 [${info.cell}] يتعافى — محاولة ${info.attempt}/${info.max}`));
    portEngine.on('cell:dead',      (info) => console.error(`💀 [${info.cell}] توقف: ${info.reason}`));

    // ② أطلق الشبكة (تكتشف المنفذ الحر تلقائياً)
    await portEngine.ignite();

    const GATEWAY_PORT = portEngine.marketplacePort;
    if (!GATEWAY_PORT) {
        console.error('❌ لا يوجد منفذ حر لبوابة الأسواق في النطاق 8081-8091');
        process.exit(1);
    }

    // ③ أنشئ خادم البوابة على المنفذ الفعلي الذي وجدته الشبكة العصبية
    const server = http.createServer(handleRequest);

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`⛔ المنفذ ${GATEWAY_PORT} مشغول — الشبكة العصبية ستحاول منفذاً آخر`);
            // الخلية ستتعافى تلقائياً عبر heal()
        } else {
            console.error('❌ خطأ في خادم البوابة:', err.message);
        }
    });

    // إيقاف نظيف
    process.on('SIGTERM', () => { portEngine.shutdown('SIGTERM'); server.close(); });
    process.on('SIGINT',  () => { portEngine.shutdown('SIGINT');  server.close(); });

    server.listen(GATEWAY_PORT, '0.0.0.0', () => {
        console.log(`
╔═══════════════════════════════════════════════════════════════════════╗
║   🏪 شيخة — سوق الأسواق الجامع                                        ║
║   Sheikha Multi-Marketplace Gateway                                   ║
╠═══════════════════════════════════════════════════════════════════════╣
║   🌐 المنفذ الفعلي : ${String(GATEWAY_PORT).padEnd(49)}║
║   🔗 الخادم الرئيسي: http://${MAIN_HOST}:${portEngine.mainPort || MAIN_PORT}${' '.repeat(38 - String(portEngine.mainPort || MAIN_PORT).length)}║
║   🧠 الشبكة العصبية: لا اعتماد على منفذ واحد                         ║
║   ✅ قطاعات السوق: ${String(MARKETPLACE_SECTORS.length).padEnd(51)}║
╠═══════════════════════════════════════════════════════════════════════╣
║   ${TAWHEED.padEnd(67)}║
║   ${NO_HARM.padEnd(67)}║
╚═══════════════════════════════════════════════════════════════════════╝`);
    });
}

// ── لا تُشغَّل إذا كان مطلوباً كوحدة (require) ──────────────────────────────
if (require.main === module) {
    start().catch((err) => {
        console.error('❌ فشل في إطلاق بوابة الأسواق:', err.message);
        process.exit(1);
    });
}

module.exports = { start };
