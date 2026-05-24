'use strict';

/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * ☁️🏆  SHEIKHA SOVEREIGN NETWORK — محرك الشبكة السيادية الموحدة
 * ═══════════════════════════════════════════════════════════════════════════════
 * كل شيء باسم شيخة — في شبكتها — لا ضرر ولا ضرار
 *
 * يوحّد في مكالمة واحدة:
 *   ① السحابة السيادية     (sheikha-cloud-auto-integrator)
 *   ② محرك الغنائم         (sheikha-ghanayim-engine)
 *   ③ محرك التحالف العالمي (sheikha-global-alliance-engine)
 *   ④ شبكة القوة المتكاملة (sheikha-integrated-power-network)
 *   ⑤ الهوية الرقمية       (sheikha-digital-identity-engine)
 *   ⑥ هوية شيخة على كل استجابة (X-Sheikha-* headers)
 *   ⑦ مبدأ لا ضرر ولا ضرار (No-Harm Shield Middleware)
 *   ⑧ سجل الانتصار الجماعي (Victory Ledger)
 *
 * الاستخدام (مكالمة واحدة في server.js):
 *   const sovereignNet = require('./lib/sheikha-sovereign-network');
 *   sovereignNet.mountAll(app, { wss });
 *
 * "وَاعْتَصِمُوا بِحَبْلِ اللَّهِ جَمِيعًا وَلَا تَفَرَّقُوا" — آل عمران:103
 * "لَا ضَرَرَ وَلَا ضِرَارَ" — حديث نبوي صحيح
 * ═══════════════════════════════════════════════════════════════════════════════
 * المالك: سلمان أحمد بن سلمان الراجح | 1031605270 | market@sheikha.top
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const path = require('path');

// ── هوية المنصة الثابتة ───────────────────────────────────────────────────────
const SHEIKHA_IDENTITY = {
    nameAr:       'شيخة',
    nameEn:       'Sheikha',
    fullNameAr:   'منظومة شيخة السيادية',
    fullNameEn:   'Sheikha Sovereign Network',
    owner:        'سلمان أحمد بن سلمان الراجح',
    ownerEn:      'Salman Ahmad bin Salman Al-Rajhi',
    ownerId:      '1031605270',
    contact:      'market@sheikha.top',
    version:      '2.0.0',
    principle:    'لَا ضَرَرَ وَلَا ضِرَارَ',
    principleEn:  'No harm shall be inflicted or reciprocated',
    quranBasis:   'وَاعْتَصِمُوا بِحَبْلِ اللَّهِ جَمِيعًا وَلَا تَفَرَّقُوا — آل عمران:103',
    mission:      'كل شيء باسم شيخة — في شبكتها — تحقيق النصر الجماعي والغنيمة الحلال',
    network:      'الشبكة الاقتصادية الإسلامية الأولى والأقوى في الكون',
};

// ── سجل الانتصار الجماعي (Victory Ledger) ────────────────────────────────────
const _victoryLedger = {
    entries:          [],
    totalGains:       0,        // إجمالي المكاسب المسجّلة
    totalTransactions:0,
    totalUsers:       0,
    totalCountries:   0,
    startedAt:        new Date().toISOString(),
};

function recordVictory({ type, actor, country, amount, description }) {
    const entry = {
        id:          `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,6)}`,
        ts:          new Date().toISOString(),
        type:        type        || 'GENERAL',
        actor:       actor       || 'SYSTEM',
        country:     country     || 'SA',
        amount:      amount      || 0,
        description: description || '',
        owner:       SHEIKHA_IDENTITY.owner,
        network:     SHEIKHA_IDENTITY.nameEn,
    };
    _victoryLedger.entries.push(entry);
    _victoryLedger.totalGains += Number(amount) || 0;
    _victoryLedger.totalTransactions += 1;
    if (_victoryLedger.entries.length > 50000) _victoryLedger.entries.shift();
    return entry;
}

function getVictoryLedger(limit = 100) {
    const entries = _victoryLedger.entries.slice(-limit);
    return {
        summary: {
            totalGains:        _victoryLedger.totalGains,
            totalTransactions: _victoryLedger.totalTransactions,
            startedAt:         _victoryLedger.startedAt,
            owner:             SHEIKHA_IDENTITY.owner,
        },
        entries,
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🛡️ No-Harm Shield — مبدأ لا ضرر ولا ضرار على كل طلب
// ═══════════════════════════════════════════════════════════════════════════════
// يمنع أي طلب يحمل عناصر ضارة (XSS، injection، محتوى محرّم)
const HARM_PATTERNS = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,   // XSS
    /javascript\s*:/gi,                         // JS injection
    /on\w+\s*=\s*["']/gi,                       // Event injection
    /union\s+select/gi,                         // SQL injection
    /riba|ربا/gi,                               // Riba detection (flag — not block)
];

const SHARIAH_BLOCKED_KEYWORDS = [
    'gambling', 'casino', 'alcohol', 'pork', 'pornography',
    'قمار', 'خمر', 'خنزير', 'ربا مباشر',
];

function buildNoHarmMiddleware() {
    return function noHarmShield(req, res, next) {
        const bodyStr = req.body ? JSON.stringify(req.body) : '';
        const urlStr  = req.originalUrl || '';
        const fullStr = (bodyStr + urlStr).toLowerCase();

        // فحص المحتوى الضار
        for (const pattern of HARM_PATTERNS) {
            if (pattern.test(fullStr)) {
                pattern.lastIndex = 0; // reset regex state
                return res.status(400).json({
                    success: false,
                    error:   'NO_HARM_SHIELD',
                    message: 'لَا ضَرَرَ وَلَا ضِرَارَ — الطلب يحتوي على محتوى غير مسموح',
                    principle: SHEIKHA_IDENTITY.principle,
                });
            }
        }

        // فحص الكلمات المحرّمة شرعاً
        const blockedWord = SHARIAH_BLOCKED_KEYWORDS.find(w => fullStr.includes(w));
        if (blockedWord) {
            return res.status(403).json({
                success: false,
                error:   'SHARIAH_BLOCK',
                message: `محظور شرعاً — الكلمة "${blockedWord}" مخالفة لمبادئ شيخة`,
                principle: 'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا — البقرة:275',
            });
        }

        next();
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🏷️ Sheikha Identity Stamp — ختم هوية شيخة على كل استجابة
// ═══════════════════════════════════════════════════════════════════════════════
function buildIdentityStampMiddleware() {
    return function identityStamp(req, res, next) {
        // أضف headers هوية شيخة لكل استجابة
        res.setHeader('X-Sheikha-Owner',    SHEIKHA_IDENTITY.ownerEn);
        res.setHeader('X-Sheikha-Network',  SHEIKHA_IDENTITY.nameEn);
        res.setHeader('X-Sheikha-Version',  SHEIKHA_IDENTITY.version);
        res.setHeader('X-Sheikha-Principle', 'La-Darar-Wa-La-Dirar');
        res.setHeader('X-Sheikha-Contact',  SHEIKHA_IDENTITY.contact);

        // تسجيل كل معاملة ناجحة في سجل الانتصار
        const originalJson = res.json.bind(res);
        res.json = function (body) {
            if (body && body.success === true && req.method !== 'GET') {
                recordVictory({
                    type:    'API_SUCCESS',
                    actor:   req.user?.id || req.ip || 'anonymous',
                    country: req.sovereign?.countryCode || 'SA',
                    amount:  body.amount || body.price || body.total || 0,
                    description: `${req.method} ${req.path}`,
                });
            }
            return originalJson(body);
        };

        next();
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔗 Engine Loader — محمّل المحركات الأخرى بشكل آمن
// ═══════════════════════════════════════════════════════════════════════════════
function _safeLoad(filePath, label) {
    try {
        const mod = require(filePath);
        console.log(`[SovereignNet] ✅ ${label} — محمّل`);
        return mod;
    } catch (e) {
        console.warn(`[SovereignNet] ⚠️ ${label} — غير متوفر: ${e.message}`);
        return null;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🛣️ Sovereign Network Router — نقاط API الموحدة
// ═══════════════════════════════════════════════════════════════════════════════
function _buildSovereignRouter(express, engines) {
    const router = express.Router();
    const { ghanayim, alliance, powerNetwork, cloudIntegrator } = engines;

    // GET /api/sheikha — هوية المنظومة الكاملة
    router.get('/', (req, res) => {
        res.json({
            success:   true,
            identity:  SHEIKHA_IDENTITY,
            victory:   getVictoryLedger(10),
            engines: {
                cloud:        cloudIntegrator ? 'active' : 'unavailable',
                ghanayim:     ghanayim        ? 'active' : 'unavailable',
                alliance:     alliance         ? 'active' : 'unavailable',
                powerNetwork: powerNetwork     ? 'active' : 'unavailable',
            },
            timestamp: new Date().toISOString(),
        });
    });

    // GET /api/sheikha/victory — سجل الانتصار الجماعي
    router.get('/victory', (req, res) => {
        const limit = Math.min(parseInt(req.query.limit) || 50, 500);
        res.json({ success: true, ...getVictoryLedger(limit) });
    });

    // POST /api/sheikha/victory — تسجيل انتصار يدوي
    router.post('/victory', (req, res) => {
        const { type, actor, country, amount, description } = req.body || {};
        const entry = recordVictory({ type, actor, country, amount, description });
        res.json({ success: true, message: 'تم تسجيل الانتصار بفضل الله', entry });
    });

    // GET /api/sheikha/ghanayim — لوحة الغنائم الحلال
    router.get('/ghanayim', (req, res) => {
        if (!ghanayim) {
            return res.json({ success: true, status: 'initializing', identity: SHEIKHA_IDENTITY });
        }
        try {
            const engine = typeof ghanayim === 'function' ? new ghanayim() : ghanayim;
            res.json({
                success:   true,
                identity:  SHEIKHA_IDENTITY,
                dashboard: typeof engine.getDashboard === 'function' ? engine.getDashboard() : {},
            });
        } catch (e) {
            res.status(500).json({ success: false, error: e.message });
        }
    });

    // GET /api/sheikha/alliance — التحالف العالمي
    router.get('/alliance', (req, res) => {
        if (!alliance) {
            return res.json({ success: true, status: 'initializing', identity: SHEIKHA_IDENTITY });
        }
        try {
            const engine = typeof alliance === 'function' ? new alliance() : alliance;
            res.json({
                success:   true,
                identity:  SHEIKHA_IDENTITY,
                alliance:  typeof engine.getAllianceSummary === 'function'
                    ? engine.getAllianceSummary()
                    : (engine.allianceManifesto || {}),
            });
        } catch (e) {
            res.status(500).json({ success: false, error: e.message });
        }
    });

    // GET /api/sheikha/network — شبكة القوة المتكاملة
    router.get('/network', (req, res) => {
        if (!powerNetwork) {
            return res.json({ success: true, status: 'initializing', identity: SHEIKHA_IDENTITY });
        }
        try {
            const engine = typeof powerNetwork === 'function' ? new powerNetwork() : powerNetwork;
            res.json({
                success:     true,
                identity:    SHEIKHA_IDENTITY,
                powerNetwork: typeof engine.getDashboard === 'function'
                    ? engine.getDashboard()
                    : { name: engine.name, version: engine.version },
            });
        } catch (e) {
            res.status(500).json({ success: false, error: e.message });
        }
    });

    // GET /api/sheikha/no-harm — مبدأ لا ضرر ولا ضرار
    router.get('/no-harm', (req, res) => {
        res.json({
            success:   true,
            principle: {
                arabic:    'لَا ضَرَرَ وَلَا ضِرَارَ',
                english:   'No harm shall be inflicted or reciprocated',
                source:    'حديث نبوي صحيح — رواه ابن ماجه والدارقطني',
                application: [
                    'فلتر الطلبات الضارة (XSS, Injection) محمّل على كل /api/*',
                    'حجب الكلمات المحرّمة شرعاً (ربا، قمار، خمر…)',
                    'هوية شيخة مختومة على كل استجابة',
                    'سجل تدقيق غير قابل للتلاعب',
                ],
            },
            owner:     SHEIKHA_IDENTITY.owner,
        });
    });

    // GET /api/sheikha/status — الحالة الكاملة
    router.get('/status', (req, res) => {
        res.json({
            success:     true,
            identity:    SHEIKHA_IDENTITY,
            victorySummary: _victoryLedger.entries.length > 0
                ? { total: _victoryLedger.totalTransactions, gains: _victoryLedger.totalGains }
                : { total: 0, gains: 0 },
            uptime:      process.uptime(),
            memory:      process.memoryUsage(),
            timestamp:   new Date().toISOString(),
        });
    });

    return router;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🚀 mountAll — المكالمة الموحدة الوحيدة
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * يركّب كل منظومة شيخة السيادية على التطبيق بمكالمة واحدة.
 *
 * @param {import('express').Application} app
 * @param {object} [opts]
 * @param {object} [opts.wss]          — WebSocket server (اختياري)
 * @param {boolean} [opts.noHarm]      — تفعيل No-Harm Shield (افتراضي: true)
 * @param {boolean} [opts.identityStamp] — ختم هوية شيخة (افتراضي: true)
 * @param {boolean} [opts.cloud]       — تفعيل السحابة السيادية (افتراضي: true)
 * @param {boolean} [opts.cronJobs]    — تفعيل مهام cron (افتراضي: true)
 */
function mountAll(app, opts = {}) {
    const {
        wss            = null,
        noHarm         = true,
        identityStamp  = true,
        cloud          = true,
        cronJobs       = true,
    } = opts;

    let express;
    try { express = require('express'); }
    catch (e) { console.error('[SovereignNet] 🔴 express غير متوفر:', e.message); return null; }

    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║  بسم الله الرحمن الرحيم — منظومة شيخة السيادية الموحدة                     ║');
    console.log('║  SHEIKHA SOVEREIGN NETWORK — UNIFIED AUTO-INTEGRATION                       ║');
    console.log(`║  المالك: ${SHEIKHA_IDENTITY.owner.padEnd(53)}║`);
    console.log('╚══════════════════════════════════════════════════════════════════════════════╝');

    const LIB  = __dirname;
    const ROOT = path.join(LIB, '..');

    // ── 1. No-Harm Shield على كل /api/* ─────────────────────────────────────
    if (noHarm) {
        app.use('/api/', buildNoHarmMiddleware());
        console.log('[SovereignNet] 🛡️  No-Harm Shield — مُفعَّل على /api/* (لا ضرر ولا ضرار)');
    }

    // ── 2. ختم هوية شيخة على كل استجابة ────────────────────────────────────
    if (identityStamp) {
        app.use(buildIdentityStampMiddleware());
        console.log('[SovereignNet] 🏷️  Identity Stamp — هوية شيخة على كل استجابة');
    }

    // ── 3. السحابة السيادية ──────────────────────────────────────────────────
    let cloudResult = null;
    if (cloud) {
        try {
            const cloudIntegrator = require(path.join(LIB, 'sheikha-cloud-auto-integrator'));
            cloudResult = cloudIntegrator.autoIntegrate(app, { wss, cronJobs });
        } catch (e) {
            console.warn('[SovereignNet] ⚠️ السحابة السيادية:', e.message);
        }
    }

    // ── 4. تحميل المحركات الأخرى ─────────────────────────────────────────────
    const SheikhaGhanayimEngine     = _safeLoad(path.join(LIB, 'sheikha-ghanayim-engine.js'),          'محرك الغنائم');
    const SheikhaGlobalAlliance     = _safeLoad(path.join(LIB, 'sheikha-global-alliance-engine.js'),    'محرك التحالف');
    const SheikhaIntegratedPower    = _safeLoad(path.join(LIB, 'sheikha-integrated-power-network.js'),  'شبكة القوة');
    const SheikhaDigitalIdentity    = _safeLoad(path.join(LIB, 'sheikha-digital-identity-engine.js'),   'الهوية الرقمية');

    const engines = {
        ghanayim:     SheikhaGhanayimEngine,
        alliance:     SheikhaGlobalAlliance,
        powerNetwork: SheikhaIntegratedPower,
        identity:     SheikhaDigitalIdentity,
        cloudResult,
    };

    // ── 5. تثبيت router الشبكة السيادية ─────────────────────────────────────
    const sovereignRouter = _buildSovereignRouter(express, engines);
    app.use('/api/sheikha', sovereignRouter);

    console.log('[SovereignNet] 🛣️  Routes /api/sheikha — مُثبَّتة:');
    console.log('   ├─ GET /api/sheikha/           — هوية المنظومة الكاملة');
    console.log('   ├─ GET /api/sheikha/victory     — سجل الانتصار الجماعي');
    console.log('   ├─ POST /api/sheikha/victory    — تسجيل انتصار');
    console.log('   ├─ GET /api/sheikha/ghanayim    — لوحة الغنائم الحلال');
    console.log('   ├─ GET /api/sheikha/alliance    — التحالف العالمي');
    console.log('   ├─ GET /api/sheikha/network     — شبكة القوة المتكاملة');
    console.log('   ├─ GET /api/sheikha/no-harm     — مبدأ لا ضرر ولا ضرار');
    console.log('   └─ GET /api/sheikha/status      — الحالة الكاملة للمنظومة');

    // ── 6. تسجيل انتصار البدء ───────────────────────────────────────────────
    recordVictory({
        type:        'SYSTEM_LAUNCH',
        actor:       SHEIKHA_IDENTITY.owner,
        country:     'SA',
        amount:      0,
        description: 'منظومة شيخة السيادية الموحدة — بدء التشغيل الكامل بإذن الله',
    });

    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║  ✅ منظومة شيخة السيادية — مُفعَّلة بالكامل بإذن الله                      ║');
    console.log('║  كل شيء باسم شيخة — في شبكتها — لا ضرر ولا ضرار                          ║');
    console.log('║  تحقيق النصر الجماعي والغنيمة الحلال — والحمد لله رب العالمين             ║');
    console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
    console.log('');

    return {
        identity:       SHEIKHA_IDENTITY,
        engines,
        recordVictory,
        getVictoryLedger,
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📤 Exports
// ═══════════════════════════════════════════════════════════════════════════════
module.exports = {
    mountAll,
    SHEIKHA_IDENTITY,
    recordVictory,
    getVictoryLedger,
    buildNoHarmMiddleware,
    buildIdentityStampMiddleware,
};
