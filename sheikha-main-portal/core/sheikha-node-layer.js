/**
 * بسم الله الرحمن الرحيم
 * ╔════════════════════════════════════════════════════════════════════════════════╗
 * ║  SHEIKHA NODE COSMIC SUPREME LAYER v2.0.0                                    ║
 * ║  طبقة شيخة نود — الأقوى كونياً وعالمياً — فوق كل شيء                        ║
 * ║                                                                                ║
 * ║  الموقع الكوني في المنظومة:                                                   ║
 * ║    Hardware → Ubuntu/Linux → [GUARDIAN] → Node.js → [SHEIKHA-NODE]           ║
 * ║    → ROOT NCN (92 خلية) → Universal NN (100×16) → Genesis → Sovereign        ║
 * ║                                                                                ║
 * ║  ﴿وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ﴾ — الأنفال: ٦٠           ║
 * ║  ﴿قُلْ هُوَ اللَّهُ أَحَدٌ﴾ — الإخلاص: ١                                    ║
 * ║  ﴿صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ﴾ — النمل: ٨٨                  ║
 * ║  «إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلاً أَنْ يُتْقِنَهُ»    ║
 * ║                                                                                ║
 * ║  الشبكات المُوحَّدة في هذه الطبقة الكونية:                                    ║
 * ║    [١] Root NCN Layer          — 92 خلية × 7 طبقات × 128-dim               ║
 * ║    [٢] Universal Neural NN     — 100 خلية × 16 طبقة (150+ لغة برمجة)       ║
 * ║    [٣] Root Neural Runtime     — 19 خلية جذرية مرقّمة بالكتاب والسنة       ║
 * ║    [٤] Unified Integrator      — 55 خلية × 11 طبقة                         ║
 * ║    [٥] Root Neural Cell Ntwk   — الجذر لجذور شيخة                           ║
 * ║    [٦] Genesis Engine          — الجيل الجديد من الحضارة الرقمية             ║
 * ║    [٧] SNRN                    — مخ رقمي سيادي: Quran + Sunnah + Maqasid   ║
 * ║    [٨] Sovereign Root          — ECDSA + Shariah Contract + Chain            ║
 * ║    [٩] Mubayaa Neural Root     — الشبكة العصبية الجذرية للمبايعة            ║
 * ║    [١٠] Cosmic Enablement      — التمكين الكوني الشامل                       ║
 * ╚════════════════════════════════════════════════════════════════════════════════╝
 *
 * @module sheikha-node-cosmic-supreme-layer
 * @version 2.0.0
 * @tawheed لا إله إلا الله محمد رسول الله
 */

'use strict';

const os   = require('os');
const path = require('path');

// ══════════════════════════════════════════════════════════════════════════════
// ── الثوابت الكونية ────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const VERSION              = '2.0.0';
const TAWHEED              = 'لا إله إلا الله محمد رسول الله';
const BISMILLAH            = 'بسم الله الرحمن الرحيم';
const DEFAULT_MAIN_PORT    = parseInt(process.env.PORT || '8080', 10);
const DEFAULT_COPILOT_PORT = parseInt(process.env.COPILOT_SERVER_PORT || '3091', 10);
const DEFAULT_META_PORT    = parseInt(process.env.META_BACKGROUND_PORT || '8085', 10);

// ── الهوية الكونية للطبقة ────────────────────────────────────────────────────

const LAYER_ID = {
    name:      'Sheikha Node Cosmic Supreme Layer',
    nameAr:    'طبقة شيخة نود — الأقوى كونياً وعالمياً',
    version:   VERSION,
    layer:     'sheikha-node',
    runtime:   'node',
    rank:      'COSMIC-SUPREME',
    position:  'Ubuntu/Linux → Node.js Runtime → [SHEIKHA-NODE-COSMIC] → ROOT-NCN → Universal NN',
    startedAt: null,
    bismillah: BISMILLAH,
    tawheed:   TAWHEED,
    quranRefs: [
        '﴿وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ﴾ — الأنفال: ٦٠',
        '﴿قُلْ هُوَ اللَّهُ أَحَدٌ﴾ — الإخلاص: ١',
        '﴿صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ﴾ — النمل: ٨٨',
        '﴿وَقُل رَّبِّ زِدْنِي عِلْمًا﴾ — طه: ١١٤',
        '﴿يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ﴾ — المجادلة: ١١',
    ],
    hadithRefs: [
        '«إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلاً أَنْ يُتْقِنَهُ» — البيهقي',
        '«طَلَبُ العِلمِ فَرِيضَةٌ عَلَى كُلِّ مُسلِمٍ» — ابن ماجه',
        '«إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ» — البخاري: ١',
    ],
};

// ══════════════════════════════════════════════════════════════════════════════
// ── محمّل آمن للوحدات ─────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

function _safeLoad(modulePath) {
    try {
        return require(modulePath);
    } catch (err) {
        // خطأ غير حرج — الوحدة اختيارية في بيئات التشغيل المختلفة
        void err;
        return null;
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// ── تحميل جميع الشبكات العصبية والمحركات الكونية ──────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const LIB  = path.join(__dirname, '..', 'lib');
const CORE = __dirname;

const _modules = {
    // [١] Root NCN Layer — 92 خلية
    rootNCNLayer:      _safeLoad(path.join(CORE, 'sheikha-root-ncn-layer')),
    // [٢] Universal Neural Network — 100 خلية × 16 طبقة
    universalNN:       _safeLoad(path.join(LIB, 'sheikha-universal-neural-network')),
    // [٣] Root Neural Runtime — 19 خلية جذرية
    rootRuntime:       _safeLoad(path.join(LIB, 'sheikha-root-neural-runtime')),
    // [٤] Unified Integrator — 55 خلية × 11 طبقة
    unifiedIntegrator: _safeLoad(path.join(CORE, 'neural', 'sheikha-unified-integrator')),
    // [٥] Root Neural Cell Network (lib) — جذر شيخة للجذور
    rootNCN:           _safeLoad(path.join(LIB, 'sheikha-root-neural-cell-network')),
    // [٦] Genesis Engine
    genesis:           _safeLoad(path.join(CORE, 'sheikha-genesis')),
    // [٧] SNRN — مخ رقمي سيادي
    snrn:              _safeLoad(path.join(CORE, 'neural-root-network', 'snrn-engine')),
    // [٨] Sovereign Root — ECDSA + Shariah
    sovereignRoot:     _safeLoad(path.join(CORE, 'sovereign-root', 'sheikha-sovereign-root')),
    // [٩] Mubayaa Neural Root
    mubayaaNR:         _safeLoad(path.join(LIB, 'mubayaa-neural-root')),
    // [١٠] Cosmic Enablement Engine
    cosmicEnablement:  _safeLoad(path.join(LIB, 'sheikha-cosmic-enablement-engine')),
};

// ══════════════════════════════════════════════════════════════════════════════
// ── ثوابت الخلايا لكل شبكة ────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

// عدد خلايا كل شبكة مُحدَّد بتعريفاتها الأصلية داخل وحداتها؛ هذه الثوابت
// تُستخدم فقط لإحصاءات اللوحة الكونية عند عدم توفر status() للوحدة.
// UNIFIED_INTEGRATOR_CELL_COUNT = 55 ← مُوثَّق في core/neural/sheikha-unified-integrator.js
// MUBAYAA_CELL_COUNT            = 8  ← inputSize معرَّف في lib/mubayaa-neural-root.js
const UNIFIED_INTEGRATOR_CELL_COUNT = 55;
const MUBAYAA_CELL_COUNT            = 8;

// ══════════════════════════════════════════════════════════════════════════════
// ── الحالة الداخلية ────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

let _ready      = false;
let _pulseCount = 0;

// ══════════════════════════════════════════════════════════════════════════════
// ── مساعدات القياس ────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

function _pick(obj, ...paths) {
    for (const p of paths) {
        const v = p.split('.').reduce((o, k) => (o != null ? o[k] : undefined), obj);
        if (v != null && v !== 0) return v;
    }
    return 0;
}

// ══════════════════════════════════════════════════════════════════════════════
// ── خوادم الخلفية ─────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

function getBackgroundServers() {
    return [
        {
            key:        'sheikha-copilot',
            name:       'Sheikha Copilot MCP',
            nameAr:     'مساعد كوبيلوت شيخة',
            mode:       'background',
            managedBy:  'pm2',
            configured: true,
            activation: 'pm2-ready',
            port:       DEFAULT_COPILOT_PORT,
            script:     './scripts/sheikha-copilot-server.js',
        },
        {
            key:        'sheikha-meta-background',
            name:       'Sheikha Meta Background',
            nameAr:     'خادم الميتا الخلفي',
            mode:       'background',
            managedBy:  'pm2',
            configured: true,
            activation: 'pm2-ready',
            port:       DEFAULT_META_PORT,
            script:     './scripts/sheikha-meta-background.js',
        },
    ];
}

// ══════════════════════════════════════════════════════════════════════════════
// ── لوحة الشبكات العصبية الكونية ──────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

function _getNetworkDashboard() {
    const networks = {};

    // [١] Root NCN Layer
    if (_modules.rootNCNLayer && typeof _modules.rootNCNLayer.status === 'function') {
        try {
            const s = _modules.rootNCNLayer.status();
            networks.rootNCNLayer = {
                active: !!s.ready,
                configured: true,
                layer: s.layer,
                cells: _pick(s, 'network.cells', 'cells') || 92,
                layers: s.network?.layersCount ?? s.layers ?? 7,
                embedDim: _pick(s, 'network.embedDim', 'embedDim') || 128,
                nameAr: s.nameAr || 'شبكة الخلايا العصبية الجذرية — 92 خلية فوق Guardian',
            };
        } catch (_) { networks.rootNCNLayer = { active: false }; }
    } else {
        networks.rootNCNLayer = { active: false, configured: false };
    }

    // [٢] Universal Neural Network
    if (_modules.universalNN) {
        try {
            const s = (typeof _modules.universalNN.getStatus === 'function')
                ? _modules.universalNN.getStatus()
                : { cells: 100, layers: 16 };
            networks.universalNN = {
                active: true,
                cells: s.cells || s.totalCells || 100,
                layers: s.layers || s.layersCount || 16,
                nameAr: 'الشبكة العصبية الشاملة — 100 خلية × 16 طبقة (150+ لغة برمجة)',
            };
        } catch (_) { networks.universalNN = { active: true, cells: 100, layers: 16, nameAr: 'الشبكة العصبية الشاملة' }; }
    } else {
        networks.universalNN = { active: false, configured: false };
    }

    // [٣] Root Neural Runtime
    if (_modules.rootRuntime && typeof _modules.rootRuntime.status === 'function') {
        try {
            const s = _modules.rootRuntime.status();
            networks.rootRuntime = {
                active:      !!s.ready,
                cells:       s.totalCells || s.activeCells || 19,
                pulseCount:  s.pulseCount || 0,
                networks:    s.networks || {},
                nameAr:      'الشبكة العصبية الجذرية — Runtime (19 خلية مرقّمة بالكتاب والسنة)',
            };
        } catch (_) { networks.rootRuntime = { active: false }; }
    } else {
        networks.rootRuntime = { active: false, configured: false };
    }

    // [٤] Unified Integrator
    if (_modules.unifiedIntegrator) {
        try {
            const s = (typeof _modules.unifiedIntegrator.status === 'function')
                ? _modules.unifiedIntegrator.status()
                : {};
            networks.unifiedIntegrator = {
                active:  !!s.ready,
                systems: s.systems || 8,
                nameAr:  'المُوحِّد الشامل — 55 خلية × 11 طبقة (IDE + SDK + MCP + ERP + Transport)',
            };
        } catch (_) { networks.unifiedIntegrator = { active: false }; }
    } else {
        networks.unifiedIntegrator = { active: false, configured: false };
    }

    // [٥] Root NCN lib — جذر شيخة للجذور
    if (_modules.rootNCN && typeof _modules.rootNCN.status === 'function') {
        try {
            const s = _modules.rootNCN.status();
            networks.rootNCN = {
                active:   true,
                cells:    s.totalCells || 92,
                layers:   s.layersCount || 7,
                trained:  !!s.trained,
                queries:  s.queries || 0,
                nameAr:   'شبكة الخلايا العصبية الجذرية — جذر شيخة للجذور',
            };
        } catch (_) { networks.rootNCN = { active: false }; }
    } else {
        networks.rootNCN = { active: false, configured: false };
    }

    // [٦] Genesis Engine
    if (_modules.genesis) {
        try {
            const instance = typeof _modules.genesis.getInstance === 'function'
                ? _modules.genesis.getInstance()
                : _modules.genesis;
            if (instance && typeof instance.universe === 'function') {
                const u = instance.universe();
                networks.genesis = {
                    active:        true,
                    generation:    u.generation,
                    activeDomains: u.activeDomains,
                    nameAr:        'محرك الجينيسيس — الجيل الجديد من الحضارة الرقمية',
                };
            } else {
                networks.genesis = { active: true, nameAr: 'محرك الجينيسيس' };
            }
        } catch (_) { networks.genesis = { active: false }; }
    } else {
        networks.genesis = { active: false, configured: false };
    }

    // [٧] SNRN — مخ رقمي سيادي
    if (_modules.snrn && typeof _modules.snrn.status === 'function') {
        try {
            const s = _modules.snrn.status();
            networks.snrn = {
                active:     !!s.active,
                totalCells: s.totalCells || 19,
                nameAr:     'SNRN — المخ الرقمي السيادي: القرآن + السنة + المقاصد',
            };
        } catch (_) { networks.snrn = { active: false }; }
    } else {
        networks.snrn = { active: false, configured: false };
    }

    // [٨] Sovereign Root
    if (_modules.sovereignRoot && typeof _modules.sovereignRoot.status === 'function') {
        try {
            const s = _modules.sovereignRoot.status();
            networks.sovereignRoot = {
                active:      !!s.initialized,
                chainHeight: s.chainHeight || 0,
                nameAr:      'الجذر السيادي — ECDSA + عقد شرعي + سلسلة كتل جذرية',
            };
        } catch (_) { networks.sovereignRoot = { active: false }; }
    } else {
        networks.sovereignRoot = { active: false, configured: false };
    }

    // [٩] Mubayaa Neural Root
    if (_modules.mubayaaNR && typeof _modules.mubayaaNR.status === 'function') {
        try {
            const s = _modules.mubayaaNR.status();
            networks.mubayaaNR = {
                active:       true,
                totalParams:  s.architecture?.totalParams || 0,
                registeredInRoot: !!s.registeredInRoot,
                nameAr:       'الشبكة العصبية الجذرية للمبايعة — 8 مُدخَل → 4 طبقات → 3 مُخرَجات',
            };
        } catch (_) { networks.mubayaaNR = { active: false }; }
    } else {
        networks.mubayaaNR = { active: false, configured: false };
    }

    // [١٠] Cosmic Enablement
    if (_modules.cosmicEnablement) {
        networks.cosmicEnablement = {
            active: true,
            nameAr: 'محرك التمكين الكوني — الميثاق الاستراتيجي + التحالف + السيادة',
        };
    } else {
        networks.cosmicEnablement = { active: false, configured: false };
    }

    return networks;
}

// ══════════════════════════════════════════════════════════════════════════════
// ── إحصاءات الحالة الكونية ────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

function _getCosmicStats(networks) {
    const netList = Object.values(networks);
    const activeNetworkCount  = netList.filter(n => n.active).length;
    const totalNetworkCount   = netList.length;
    const totalCells = (
        (networks.rootNCNLayer?.cells       || 0) +
        (networks.universalNN?.cells        || 0) +
        (networks.rootRuntime?.cells        || 0) +
        (networks.unifiedIntegrator?.systems ? UNIFIED_INTEGRATOR_CELL_COUNT : 0) +
        (networks.rootNCN?.cells            || 0) +
        (networks.snrn?.totalCells          || 0) +
        (networks.mubayaaNR?.active         ? MUBAYAA_CELL_COUNT  : 0)
    );
    const totalLayers = (
        (networks.rootNCNLayer?.layers      || 0) +
        (networks.universalNN?.layers       || 0) +
        (networks.rootNCN?.layers           || 0)
    );
    return {
        activeNetworks:    activeNetworkCount,
        totalNetworks:     totalNetworkCount,
        totalNeuralCells:  totalCells,
        totalLayers,
        cosmicPower:       `${Math.round((activeNetworkCount / Math.max(totalNetworkCount, 1)) * 100)}%`,
    };
}

// ══════════════════════════════════════════════════════════════════════════════
// ── حالة الطبقة الكونية ───────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

function status() {
    const networks         = _getNetworkDashboard();
    const cosmicStats      = _getCosmicStats(networks);
    const backgroundServers = getBackgroundServers();

    return {
        ...LAYER_ID,
        ready: _ready,
        pulseCount: _pulseCount,

        // معلومات بيئة التشغيل
        runtimeInfo: {
            node:     process.version,
            pid:      process.pid,
            platform: process.platform,
            arch:     process.arch,
            uptime:   process.uptime(),
            memory:   {
                heapUsedMB: (process.memoryUsage().heapUsed / 1024 ** 2).toFixed(1),
                rssMB:      (process.memoryUsage().rss / 1024 ** 2).toFixed(1),
            },
            cpu: {
                cores:   os.cpus().length,
                loadAvg: os.loadavg().map(v => +v.toFixed(2)),
            },
        },

        // الخادم الرئيسي
        apiServer: {
            key:    'sheikha-api',
            mode:   'foreground',
            active: true,
            port:   DEFAULT_MAIN_PORT,
            pid:    process.pid,
        },

        // خوادم الخلفية
        backgroundServers,

        // الشبكات العصبية الكونية الكاملة
        neuralNetworks: networks,

        // إحصاءات الطاقة الكونية
        cosmicStats,

        // الشبكة العصبية الجذرية (للتوافق مع الاختبارات السابقة)
        rootNeuralCellNetwork: {
            active:     networks.rootNCNLayer.active,
            configured: networks.rootNCNLayer.configured !== false,
            cells:      networks.rootNCNLayer.cells      || 92,
            layers:     networks.rootNCNLayer.layers     || 7,
            embedDim:   networks.rootNCNLayer.embedDim   || 128,
        },
    };
}

// ══════════════════════════════════════════════════════════════════════════════
// ── النبضة الكونية الموحدة ─────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/**
 * نبضة كونية موحدة تمر عبر كل الشبكات العصبية في المنظومة
 * ﴿تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ﴾ — الملك: ١
 *
 * @param {{ type?: string, context?: string, data?: object }} input
 * @returns {object}
 */
function cosmicPulse(input = {}) {
    if (!_ready) init();
    _pulseCount++;

    const { type = 'cosmic', context = '', data = {} } = input;
    const ts  = new Date().toISOString();
    const result = {
        id:        `cosmic_pulse_${Date.now()}_${_pulseCount}`,
        tawheed:   TAWHEED,
        bismillah: BISMILLAH,
        timestamp: ts,
        type,
        pulseCount: _pulseCount,
        responses:  {},
    };

    // [١] Root Runtime pulse
    if (_modules.rootRuntime && typeof _modules.rootRuntime.pulse === 'function') {
        try { result.responses.rootRuntime = _modules.rootRuntime.pulse({ type, context, data }); }
        catch (_) { result.responses.rootRuntime = { error: true }; }
    }

    // [٢] Universal NN infer
    if (_modules.universalNN && typeof _modules.universalNN.infer === 'function') {
        try { result.responses.universalNN = _modules.universalNN.infer({ type, context, data }); }
        catch (_) { result.responses.universalNN = { error: true }; }
    }

    // [٣] Unified Integrator pulse
    if (_modules.unifiedIntegrator && typeof _modules.unifiedIntegrator.pulse === 'function') {
        try { result.responses.unifiedIntegrator = _modules.unifiedIntegrator.pulse({ type, data, context }); }
        catch (_) { result.responses.unifiedIntegrator = { error: true }; }
    }

    // [٤] Root NCN infer
    if (_modules.rootNCN && typeof _modules.rootNCN.infer === 'function') {
        try { result.responses.rootNCN = _modules.rootNCN.infer(context || type); }
        catch (_) { result.responses.rootNCN = { error: true }; }
    }

    result.networksReached = Object.keys(result.responses).length;
    return result;
}

// ══════════════════════════════════════════════════════════════════════════════
// ── تهيئة الطبقة الكونية ──────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

async function init() {
    if (_ready) return status();

    LAYER_ID.startedAt = new Date().toISOString();
    _ready = true;

    const networks = _getNetworkDashboard();
    const stats    = _getCosmicStats(networks);

    console.log('');
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║  بسم الله الرحمن الرحيم                                        ║');
    console.log('║  SHEIKHA NODE COSMIC SUPREME LAYER v2.0.0                      ║');
    console.log('║  طبقة شيخة نود — الأقوى كونياً وعالمياً                         ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    console.log(`[SHEIKHA-NODE-COSMIC] 🌌 Node.js Runtime : ${process.version}`);
    console.log(`[SHEIKHA-NODE-COSMIC] 🖥  API Server      : :${DEFAULT_MAIN_PORT}`);
    console.log(`[SHEIKHA-NODE-COSMIC] 🔧 Background      : ${getBackgroundServers().map(s => `${s.key}:${s.port}`).join(' | ')}`);
    console.log(`[SHEIKHA-NODE-COSMIC] 🧠 الشبكات النشطة  : ${stats.activeNetworks}/${stats.totalNetworks}`);
    console.log(`[SHEIKHA-NODE-COSMIC] 🔬 إجمالي الخلايا  : ${stats.totalNeuralCells} خلية عصبية`);
    console.log(`[SHEIKHA-NODE-COSMIC] 📐 إجمالي الطبقات  : ${stats.totalLayers} طبقة`);
    console.log(`[SHEIKHA-NODE-COSMIC] ⚡ القوة الكونية   : ${stats.cosmicPower}`);
    console.log(`[SHEIKHA-NODE-COSMIC] 🕌 ${TAWHEED}`);
    console.log('');

    return status();
}

// ══════════════════════════════════════════════════════════════════════════════
// ── الواجهة العامة ────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

module.exports = {
    LAYER_ID,
    TAWHEED,
    BISMILLAH,
    VERSION,
    DEFAULT_MAIN_PORT,
    DEFAULT_COPILOT_PORT,
    DEFAULT_META_PORT,
    init,
    status,
    cosmicPulse,
    getBackgroundServers,
};
