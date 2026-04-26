/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🌟 SHEIKHA UNIFIED INTEGRATOR — المُوحِّد الشامل لكل الأنظمة              ║
 * ║  يجمع: الشبكة العصبية + التصحيح + ERP + IDE + SDK + MCP + الناقل          ║
 * ║  55 خلية عصبية — 11 طبقة — كل الأنظمة — موحّدة لله                       ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * ﴿ قُلْ هُوَ اللَّهُ أَحَدٌ ﴾ — الإخلاص: 1
 *   التوحيد المطلق — كل الأنظمة تعمل كوحدة واحدة لله
 *
 * ﴿ وَاعْتَصِمُوا بِحَبْلِ اللَّهِ جَمِيعًا وَلَا تَفَرَّقُوا ﴾ — آل عمران: 103
 *   الاعتصام والوحدة — جميع الأنظمة مربوطة بحبل واحد
 *
 * «إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلاً أَنْ يُتْقِنَهُ» — البيهقي
 *
 * الأنظمة المُوحَّدة:
 * ┌─────────────────────────────────────────────────────────────┐
 * │  🧠 Neural Cells (55)    — core/neural/sheikha-debug-neural  │
 * │  🔍 Debug System         — منظومة التصحيح الكامل            │
 * │  🏢 ERP System           — core/neural/sheikha-erp-neural    │
 * │  🚌 Transport Bus        — core/neural/sheikha-transport-bus  │
 * │  🔧 IDE Server           — mcp-servers/sheikha-ide-server    │
 * │  📦 SDK Server           — mcp-servers/sheikha-sdk-server    │
 * │  🤖 MCP Server           — mcp-servers/sheikha-mcp-server    │
 * │  ⚙️  Engines (15+)       — core/engines/*                    │
 * │  📡 Telecom Networks     — telecom/*                          │
 * │  🌐 Unity Engine         — core/neural/unity-engine          │
 * └─────────────────────────────────────────────────────────────┘
 *
 * واجهة الوحدة:
 *   init()           — تهيئة كل الأنظمة وربطها
 *   pulse(input)     — نبضة موحدة تُشغّل كل المنظومة
 *   healthCheck()    — فحص صحة كل الأنظمة
 *   createRouter()   — Express Router موحد (/api/v2)
 *   status()         — لوحة المنظومة الكاملة
 */

'use strict';

const path = require('path');

let express;
try { express = require('express'); } catch (_) { express = null; }

// ═══════════════════════════════════════════════════════════════════════════════
// استيراد جميع الأنظمة
// ═══════════════════════════════════════════════════════════════════════════════

/** محمّل آمن يُعيد null عند الفشل */
function _safeRequire(filePath, name) {
    try {
        const mod = require(filePath);
        return mod;
    } catch (err) {
        console.warn(`[UNIFIED] ⚠️ ${name} غير متوفر: ${err.message}`);
        return null;
    }
}

const debugNeural  = _safeRequire('./sheikha-debug-neural',            'Debug Neural');
const transport    = _safeRequire('./sheikha-transport-bus',           'Transport Bus');
const erpNeural    = _safeRequire('./sheikha-erp-neural',              'ERP Neural');
const hierarchyNN  = _safeRequire('./sheikha-roots-hierarchy-neural',  'Hierarchy Neural');
const unityEngine  = _safeRequire('../neural/unity-engine',            'Unity Engine');
const neuralCells  = _safeRequire('../neural/neural-cells',    'Neural Cells (core 12)');

// المحركات
const enginesDir = path.join(__dirname, '..', 'engines');
const enginesIndex = _safeRequire(path.join(enginesDir, 'index.js'), 'Engines Index');

// شبكة الاتصالات
const aiNetwork  = _safeRequire(path.join(__dirname, '..', '..', 'telecom', 'ai-network', 'index.js'),    'AI Network');
const homeNetwork= _safeRequire(path.join(__dirname, '..', '..', 'telecom', 'home-network', 'index.js'), 'Home Network');

// ═══════════════════════════════════════════════════════════════════════════════
// حالة المُوحِّد
// ═══════════════════════════════════════════════════════════════════════════════

let _ready      = false;
let _initAt     = null;
let _pulseCount = 0;

const _systemRegistry = new Map(); // systemId → { name, module, ready, initAt }

// ═══════════════════════════════════════════════════════════════════════════════
// ① تهيئة المُوحِّد الشامل
// ═══════════════════════════════════════════════════════════════════════════════

function init() {
    if (_ready) return;

    console.log('[UNIFIED] 🌟 بسم الله الرحمن الرحيم');
    console.log('[UNIFIED] ﴿ قُلْ هُوَ اللَّهُ أَحَدٌ ﴾ — الإخلاص: 1');
    console.log('[UNIFIED] 🕌 تهيئة المُوحِّد الشامل لكل أنظمة منظومة شيخة...');

    const systems = [
        { id: 'transport-bus', name: 'الناقل الشامل',              mod: transport,    initFn: 'init'  },
        { id: 'debug-neural',  name: 'منظومة التصحيح العصبي (55 خلية)', mod: debugNeural, initFn: 'init'  },
        { id: 'erp-neural',    name: 'نظام ERP العصبي (7 وحدات)',    mod: erpNeural,    initFn: 'init'  },
        { id: 'hierarchy-nn',  name: 'الشبكة العصبية الهرمية (55 عقدة — 4 مستويات)', mod: hierarchyNN, initFn: null },
        { id: 'unity-engine',  name: 'محرك التوحيد',                 mod: unityEngine,  initFn: 'init'  },
        { id: 'neural-cells',  name: 'الخلايا العصبية الأساسية (12)',  mod: neuralCells, initFn: 'init'  },
        { id: 'ai-network',    name: 'شبكة الذكاء الاصطناعي',        mod: aiNetwork,   initFn: null    },
        { id: 'home-network',  name: 'شبكة المنزل الذكي',             mod: homeNetwork, initFn: null    },
    ];

    let initialised = 0;
    for (const sys of systems) {
        if (!sys.mod) {
            _systemRegistry.set(sys.id, { name: sys.name, ready: false, reason: 'الوحدة غير موجودة' });
            continue;
        }

        try {
            if (sys.initFn && typeof sys.mod[sys.initFn] === 'function') {
                sys.mod[sys.initFn]();
            }
            _systemRegistry.set(sys.id, { name: sys.name, module: sys.mod, ready: true, initAt: new Date().toISOString() });
            initialised++;
            console.log(`[UNIFIED] ✅ ${sys.name}`);
        } catch (err) {
            _systemRegistry.set(sys.id, { name: sys.name, ready: false, reason: err.message });
            console.warn(`[UNIFIED] ⚠️ فشل تهيئة ${sys.name}: ${err.message}`);
        }
    }

    // ربط الأنظمة عبر الناقل
    if (transport && typeof transport.activateDefaultBridges === 'function') {
        transport.activateDefaultBridges();
    }

    // ربط IDE/SDK/MCP عبر الناقل
    _registerToolSystems();

    _ready  = true;
    _initAt = new Date().toISOString();

    console.log(`[UNIFIED] 🌟 المُوحِّد جاهز — ${initialised}/${systems.length} أنظمة مُفعَّلة`);
    console.log('[UNIFIED] ﴿ وَاعْتَصِمُوا بِحَبْلِ اللَّهِ جَمِيعًا ﴾ — آل عمران: 103');
}

function _registerToolSystems() {
    if (!transport) return;

    const toolSystems = [
        { id: 'ide-server',      name: 'خادم IDE (port 3002)',    channel: 'ide.events'    },
        { id: 'sdk-server',      name: 'خادم SDK (port 3001)',    channel: 'sdk.events'    },
        { id: 'mcp-server',      name: 'خادم MCP (stdio)',        channel: 'mcp.events'    },
        { id: 'devops-pipeline', name: 'خط DevOps/CI-CD',        channel: 'devops.events' },
    ];

    for (const sys of toolSystems) {
        transport.registerSystem(sys);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ② النبضة الموحدة — تُشغّل كل المنظومة
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * نبضة موحدة تُمرر عبر كل الطبقات والأنظمة
 * ﴿ تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ ﴾ — الملك: 1
 *
 * @param {object} input — { type, data, context, debug, erp, task }
 * @returns {object} نتيجة النبضة الكاملة
 */
function pulse(input = {}) {
    if (!_ready) init();
    _pulseCount++;

    const {
        type    = 'general',
        data    = {},
        context = '',
        debug   = null,   // { system, error, severity } — إذا أُريد تشغيل التصحيح
        erp     = null,   // { module, op, data } — إذا أُريد تشغيل ERP
        task    = null,   // { name, payload } — مهمة للوكيل السحابي
    } = input;

    const pulseId = `pulse_${Date.now()}_${_pulseCount}`;
    const result  = {
        id:        pulseId,
        timestamp: new Date().toISOString(),
        type,
        neural:    null,
        debug:     null,
        erp:       null,
        unity:     null,
        transport: null,
    };

    // ─── تشغيل الشبكة العصبية الكاملة ───────────────────────────────────────
    if (debugNeural) {
        result.neural = debugNeural.process({ type, data, context });
    } else if (neuralCells) {
        result.neural = neuralCells.process({ type, data, context });
    }

    // ─── تشغيل منظومة التصحيح إذا طُلب ──────────────────────────────────────
    if (debug && debugNeural) {
        result.debug = debugNeural.debug({
            system:   debug.system   || type,
            error:    debug.error    || null,
            severity: debug.severity || 'info',
            context,
            data,
        });
    }

    // ─── تشغيل وحدة ERP إذا طُلبت ───────────────────────────────────────────
    if (erp && erpNeural) {
        const { module: mod, op, data: erpData } = erp;
        switch (mod) {
            case 'finance':    result.erp = erpNeural.finance(op, erpData);    break;
            case 'inventory':  result.erp = erpNeural.inventory(op, erpData);  break;
            case 'purchase':   result.erp = erpNeural.purchase(op, erpData);   break;
            case 'sales':      result.erp = erpNeural.sales(op, erpData);      break;
            case 'hr':         result.erp = erpNeural.hr(op, erpData);         break;
            case 'production': result.erp = erpNeural.production(op, erpData); break;
            case 'report':     result.erp = erpNeural.report(op, erpData);     break;
            default: result.erp = { error: `وحدة ERP غير معروفة: ${mod}` };
        }
    }

    // ─── تشغيل الشبكة الهرمية إذا طُلبت ─────────────────────────────────────
    if (hierarchyNN) {
        result.hierarchy = hierarchyNN.infer(data.hierarchyInput || {}, context || type);
    }

    // ─── تشغيل محرك التوحيد ──────────────────────────────────────────────────
    if (unityEngine) {
        result.unity = unityEngine.pulse({ type, data, context, task });
    }

    // ─── إطلاق نبضة على الناقل الشامل ───────────────────────────────────────
    if (transport) {
        transport.emit('neural.pulse', { pulseId, type, context }, 'unified-integrator');
        result.transport = { emitted: true };
    }

    result.summary = `نبضة موحدة "${type}" — ${Object.values(result).filter(Boolean).length - 2} أنظمة تفاعلت`;
    return result;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ③ فحص صحة كل الأنظمة
// ═══════════════════════════════════════════════════════════════════════════════

function healthCheck() {
    if (!_ready) init();

    const checks = [];

    for (const [id, sys] of _systemRegistry) {
        let moduleStatus = 'unknown';
        let details = {};

        if (sys.module && typeof sys.module.status === 'function') {
            try {
                const st = sys.module.status();
                moduleStatus = st.ready !== false ? 'healthy' : 'degraded';
                details = { ready: st.ready };
            } catch (err) {
                moduleStatus = 'error';
                details = { error: err.message };
            }
        } else {
            moduleStatus = sys.ready ? 'healthy' : 'unavailable';
        }

        checks.push({ id, name: sys.name, status: moduleStatus, ...details });
    }

    const healthy   = checks.filter(c => c.status === 'healthy').length;
    const degraded  = checks.filter(c => c.status === 'degraded').length;
    const unavailable = checks.filter(c => c.status === 'unavailable' || c.status === 'error').length;

    const overallStatus = unavailable > 0 ? 'degraded' : healthy === checks.length ? 'healthy' : 'partial';

    return {
        overall:   overallStatus,
        timestamp: new Date().toISOString(),
        healthy,
        degraded,
        unavailable,
        total:     checks.length,
        systems:   checks,
        quran:     '﴿ إِنَّ اللَّهَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ ﴾',
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ④ حالة المنظومة الكاملة
// ═══════════════════════════════════════════════════════════════════════════════

function status() {
    if (!_ready) init();

    return {
        module:      'sheikha-unified-integrator',
        nameAr:      'المُوحِّد الشامل — منظومة شيخة الكاملة',
        nameEn:      'Sheikha Unified Integrator — Complete System',
        version:     '3.0.0',
        ready:       _ready,
        initAt:      _initAt,
        pulseCount:  _pulseCount,
        systems:     _systemRegistry.size,
        health:      healthCheck(),
        neural:      debugNeural  ? debugNeural.status()   : null,
        hierarchy:   hierarchyNN  ? hierarchyNN.status()   : null,
        erp:         erpNeural    ? erpNeural.status()     : null,
        transport:   transport    ? transport.status()     : null,
        unity:       unityEngine  ? unityEngine.status()   : null,
        principle: {
            tawheed:   '﴿ قُلْ هُوَ اللَّهُ أَحَدٌ ﴾ — الإخلاص: 1',
            unity:     '﴿ وَاعْتَصِمُوا بِحَبْلِ اللَّهِ جَمِيعًا ﴾ — آل عمران: 103',
            excellence:'«إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلاً أَنْ يُتْقِنَهُ»',
            knowledge: '﴿ وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا ﴾ — البقرة: 31',
        },
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⑤ Express Router الموحد — /api/v2
// ═══════════════════════════════════════════════════════════════════════════════

function createRouter() {
    if (!_ready) init();
    if (!express) return null;

    const router = express.Router();
    router.use(express.json());

    // ─── المسارات الرئيسية ────────────────────────────────────────────────────

    // GET /api/v2/status — لوحة المنظومة الكاملة
    router.get('/status', (_req, res) => {
        res.json({ success: true, status: status() });
    });

    // GET /api/v2/health — فحص الصحة
    router.get('/health', (_req, res) => {
        const h = healthCheck();
        res.status(h.overall === 'healthy' ? 200 : 206).json({ success: true, health: h });
    });

    // POST /api/v2/pulse — نبضة موحدة
    router.post('/pulse', (req, res) => {
        const result = pulse(req.body || {});
        res.json({ success: true, result });
    });

    // ─── الشبكة العصبية ───────────────────────────────────────────────────────
    if (debugNeural && typeof debugNeural.createRouter === 'function') {
        const neuralRouter = debugNeural.createRouter();
        if (neuralRouter) router.use('/neural', neuralRouter);
    }

    // ─── الناقل الشامل ────────────────────────────────────────────────────────
    if (transport && typeof transport.createRouter === 'function') {
        const transportRouter = transport.createRouter();
        if (transportRouter) router.use('/transport', transportRouter);
    }

    // ─── الشبكة الهرمية ────────────────────────────────────────────────────────
    if (hierarchyNN && typeof hierarchyNN.createRouter === 'function') {
        const hierarchyRouter = hierarchyNN.createRouter();
        if (hierarchyRouter) router.use('/hierarchy', hierarchyRouter);
    }

    // ─── نظام ERP ─────────────────────────────────────────────────────────────
    if (erpNeural && typeof erpNeural.createRouter === 'function') {
        const erpRouter = erpNeural.createRouter();
        if (erpRouter) router.use('/erp', erpRouter);
    }

    // ─── محرك التوحيد ─────────────────────────────────────────────────────────
    if (unityEngine && typeof unityEngine.createRouter === 'function') {
        const unityRouter = unityEngine.createRouter();
        if (unityRouter) router.use('/agent', unityRouter);
    }

    // ─── IDE endpoints ─────────────────────────────────────────────────────────
    router.get('/ide/status', (_req, res) => {
        res.json({
            success: true,
            ide: {
                name:    'Sheikha IDE Server',
                port:    process.env.SHEIKHA_IDE_PORT || 3002,
                status:  'registered',
                channel: 'ide.events',
                quran:   '﴿ الَّذِي عَلَّمَ بِالْقَلَمِ ﴾ — العلق: 4',
            },
        });
    });

    // ─── SDK endpoints ─────────────────────────────────────────────────────────
    router.get('/sdk/status', (_req, res) => {
        res.json({
            success: true,
            sdk: {
                name:    'Sheikha SDK Server',
                port:    process.env.SHEIKHA_SDK_PORT || 3001,
                status:  'registered',
                channel: 'sdk.events',
                quran:   '﴿ ادْعُ إِلَىٰ سَبِيلِ رَبِّكَ بِالْحِكْمَةِ ﴾ — النحل: 125',
            },
        });
    });

    // ─── MCP endpoints ─────────────────────────────────────────────────────────
    router.get('/mcp/status', (_req, res) => {
        res.json({
            success: true,
            mcp: {
                name:    'Sheikha MCP Server',
                type:    'stdio + http',
                status:  'registered',
                channel: 'mcp.events',
                tools:   ['analyze_market', 'check_sharia', 'get_neural_status', 'debug_system', 'erp_query'],
                quran:   '﴿ وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا ﴾ — البقرة: 31',
            },
        });
    });

    return router;
}

// ─── تهيئة تلقائية ────────────────────────────────────────────────────────────

init();

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = {
    init,
    pulse,
    healthCheck,
    status,
    createRouter,
    // وصول مباشر للوحدات
    systems: {
        neural:    () => debugNeural,
        transport: () => transport,
        erp:       () => erpNeural,
        hierarchy: () => hierarchyNN,
        unity:     () => unityEngine,
    },
};
