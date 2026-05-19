/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║   SHEIKHA Operational Agents Layer — طبقة الوكلاء التشغيلية الموحَّدة      ║
 * ║   لوحة جاهزية موحَّدة: Ready / Degraded / Down لكل وكيل                   ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * ﴿وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ وَرَسُولُهُ وَالْمُؤْمِنُونَ﴾ — التوبة: ١٠٥
 *
 * تُوفِّر هذه الطبقة:
 *   ① نقطة تفعيل موحَّدة لجميع الوكلاء التشغيلية (API + Copilot + SDK/IDE + خلفية)
 *   ② لوحة جاهزية واحدة (Ready/Degraded/Down) لكل وكيل
 *   ③ تكامل مع سجل الوكلاء الرسمي
 *   ④ Event bus للتنسيق بين الوكلاء
 *
 * @module lib/sheikha-operational-agents-layer
 * @version 1.0.0
 * @identity SHEIKHA Sovereign Cognitive Infrastructure
 */

'use strict';

const EventEmitter = require('events');
const registry     = require('./sheikha-agents-activation-registry');

// ─── ثوابت ──────────────────────────────────────────────────────────────────

const LAYER_VERSION = '1.0.0';
const LAYER_ID      = 'SHEIKHA-OPERATIONAL-AGENTS-LAYER';

/** @enum {string} */
const READINESS = Object.freeze({
    READY:    'Ready',
    DEGRADED: 'Degraded',
    DOWN:     'Down',
    STANDBY:  'Standby',
    PENDING:  'Pending',
});

// ─── حالة الطبقة ─────────────────────────────────────────────────────────────

const _bus = new EventEmitter();
_bus.setMaxListeners(64);

/** خريطة: agentId → حالة التشغيل */
const _agentStates = new Map();

let _layerReady   = false;
let _activatedAt  = null;
let _activationCount = 0;

// ─── مُحمِّلات الوكلاء الأساسية ────────────────────────────────────────────

/**
 * يحاول تحميل وكيل بمساره وإعادة حالته.
 * @param {object} agentDef — تعريف الوكيل من السجل
 * @returns {{ loaded: boolean, module: object|null, error: string|null }}
 */
function _loadAgent(agentDef) {
    // قائمة الوكلاء التي لها وحدات قابلة للاستيراد مباشرة
    const LOADABLE = {
        'neural-root':         '../intelligence/sheikha-neural-root-activator',
        'intelligence-fabric': '../intelligence/sheikha-intelligence-fabric',
        'security-fabric':     '../security/sheikha-security-fabric',
        'governance-fabric':   '../governance/sheikha-governance-fabric',
        'integration-gateway': '../integration/sheikha-integration-gateway',
    };

    const modPath = LOADABLE[agentDef.id];
    if (!modPath) {
        // الوكلاء الأخرى (copilot, sdk, ide, api, background) تعمل كعمليات مستقلة
        return { loaded: true, module: null, error: null, isProcess: true };
    }

    try {
        const mod = require(modPath);
        return { loaded: true, module: mod, error: null, isProcess: false };
    } catch (e) {
        return { loaded: false, module: null, error: e.message, isProcess: false };
    }
}

/**
 * استدعاء فحص الصحة لوحدة وكيل إن وُجدت.
 * @param {object} mod — وحدة الوكيل
 * @returns {boolean|null}
 */
function _probeModuleHealth(mod) {
    if (!mod) return null;
    // محاولة استدعاء الدوال المعروفة للتحقق من الجاهزية
    try {
        if (typeof mod.health  === 'function') { const h = mod.health();  return h && (h.ready !== false); }
        if (typeof mod.status  === 'function') { const s = mod.status();  return s && (s.ready !== false); }
        if (typeof mod.isReady === 'function') { return mod.isReady(); }
    } catch (_) {}
    return true; // إذا لم توجد دالة فحص، نفترض أن الوحدة سليمة
}

// ─── تفعيل الطبقة ─────────────────────────────────────────────────────────

/**
 * تفعيل طبقة الوكلاء التشغيلية كاملة.
 * يُسجِّل حالة كل وكيل في اللوحة الموحَّدة.
 * @returns {{ success: boolean, summary: object }}
 */
function activate() {
    _activationCount++;
    _activatedAt = new Date().toISOString();

    _log(`╔═══════════════════════════════════════════════════════════╗`);
    _log(`║   SHEIKHA — تفعيل طبقة الوكلاء التشغيلية الموحَّدة         ║`);
    _log(`║   بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ                                ║`);
    _log(`╚═══════════════════════════════════════════════════════════╝`);

    const allAgents = registry.getAllAgents();
    let readyCount    = 0;
    let degradedCount = 0;
    let standbyCount  = 0;
    let downCount     = 0;

    for (const agentDef of allAgents) {
        // الوكلاء المعطَّلة — لا نفعّلها
        if (agentDef.status === registry.AGENT_STATUS.DISABLED) {
            _setAgentState(agentDef.id, READINESS.DOWN, agentDef, null, 'معطَّل في السجل');
            downCount++;
            continue;
        }

        // الوكلاء في وضع الانتظار — نُسجِّلها كـ Standby
        if (agentDef.status === registry.AGENT_STATUS.STANDBY) {
            _setAgentState(agentDef.id, READINESS.STANDBY, agentDef, null, 'في وضع الانتظار');
            standbyCount++;
            _log(`  ⏸  [STANDBY]  ${agentDef.nameAr} (${agentDef.id})`);
            continue;
        }

        // الوكلاء النشطة — نحاول تحميلها والتحقق من صحتها
        const loaded = _loadAgent(agentDef);

        if (!loaded.loaded) {
            _setAgentState(agentDef.id, READINESS.DEGRADED, agentDef, null, loaded.error);
            degradedCount++;
            _log(`  ⚠️  [DEGRADED] ${agentDef.nameAr} (${agentDef.id}) — ${loaded.error}`);
            continue;
        }

        if (loaded.isProcess) {
            // عمليات مستقلة (copilot, sdk, ide, api) — نُسجِّلها كـ Ready بدون فحص داخلي
            _setAgentState(agentDef.id, READINESS.READY, agentDef, null, 'عملية مستقلة');
            readyCount++;
            _log(`  ✅ [READY]    ${agentDef.nameAr} (${agentDef.id}) — عملية مستقلة`);
            continue;
        }

        const healthy = _probeModuleHealth(loaded.module);
        const readiness = healthy === false ? READINESS.DEGRADED : READINESS.READY;

        _setAgentState(agentDef.id, readiness, agentDef, loaded.module, null);

        if (readiness === READINESS.READY) {
            readyCount++;
            _log(`  ✅ [READY]    ${agentDef.nameAr} (${agentDef.id})`);
        } else {
            degradedCount++;
            _log(`  ⚠️  [DEGRADED] ${agentDef.nameAr} (${agentDef.id}) — فحص الصحة أعاد false`);
        }
    }

    _layerReady = true;

    const summary = {
        total:    allAgents.length,
        ready:    readyCount,
        degraded: degradedCount,
        standby:  standbyCount,
        down:     downCount,
        readinessRate: allAgents.length > 0
            ? Number(((readyCount / allAgents.length) * 100).toFixed(1))
            : 0,
    };

    _log(`\n  📊 ملخص الجاهزية:`);
    _log(`     ✅ جاهز:     ${readyCount}`);
    _log(`     ⚠️  متردٍّ:    ${degradedCount}`);
    _log(`     ⏸  انتظار:   ${standbyCount}`);
    _log(`     ❌ معطَّل:    ${downCount}`);
    _log(`     معدل الجاهزية: ${summary.readinessRate}%`);
    _log(`  ﴿إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ﴾`);
    _log(``);

    _bus.emit('agents-layer:activated', { summary, activatedAt: _activatedAt });

    return { success: true, summary, activatedAt: _activatedAt };
}

// ─── حالة الوكلاء ─────────────────────────────────────────────────────────

/**
 * ضبط حالة وكيل في اللوحة الموحَّدة.
 * @private
 */
function _setAgentState(agentId, readiness, agentDef, mod, note) {
    _agentStates.set(agentId, {
        id:          agentId,
        nameAr:      agentDef.nameAr,
        nameEn:      agentDef.nameEn,
        type:        agentDef.type,
        scope:       agentDef.scope,
        readiness,
        note:        note || null,
        hasModule:   !!mod,
        updatedAt:   new Date().toISOString(),
    });
}

/**
 * لوحة الجاهزية الموحَّدة لجميع الوكلاء.
 * @returns {object}
 */
function readinessBoard() {
    const agents = [];
    for (const [id, state] of _agentStates.entries()) {
        agents.push({ ...state });
    }

    const counts = {
        [READINESS.READY]:    0,
        [READINESS.DEGRADED]: 0,
        [READINESS.DOWN]:     0,
        [READINESS.STANDBY]:  0,
        [READINESS.PENDING]:  0,
    };
    for (const a of agents) {
        if (counts[a.readiness] !== undefined) counts[a.readiness]++;
    }

    const overallReadiness = counts[READINESS.DOWN] > 0
        ? READINESS.DEGRADED
        : counts[READINESS.DEGRADED] > 0
            ? READINESS.DEGRADED
            : READINESS.READY;

    return {
        layerId:          LAYER_ID,
        layerVersion:     LAYER_VERSION,
        layerReady:       _layerReady,
        activatedAt:      _activatedAt,
        overallReadiness,
        counts,
        agents,
        registrySummary:  registry.registrySummary(),
        boardGeneratedAt: new Date().toISOString(),
    };
}

/**
 * حالة وكيل واحد.
 * @param {string} agentId
 * @returns {object|null}
 */
function agentReadiness(agentId) {
    return _agentStates.get(agentId) || null;
}

/**
 * تحديث حالة وكيل يدوياً (لاستخدام الـ watchdog).
 * @param {string} agentId
 * @param {string} readiness — من READINESS
 * @param {string} [note]
 */
function updateAgentReadiness(agentId, readiness, note) {
    const existing = _agentStates.get(agentId);
    if (!existing) return;

    const agentDef = registry.getAgent(agentId);
    _setAgentState(agentId, readiness, agentDef || existing, null, note || null);
    _bus.emit('agents-layer:readiness-updated', { agentId, readiness, note, updatedAt: new Date().toISOString() });
}

// ─── حالة الطبقة ─────────────────────────────────────────────────────────

/**
 * حالة الطبقة الكاملة.
 * @returns {object}
 */
function status() {
    return {
        id:              LAYER_ID,
        version:         LAYER_VERSION,
        ready:           _layerReady,
        activatedAt:     _activatedAt,
        activationCount: _activationCount,
        board:           readinessBoard(),
        statusAt:        new Date().toISOString(),
    };
}

// ─── Event Bus ───────────────────────────────────────────────────────────────

function on(event, handler) { _bus.on(event, handler); }

// ─── Internal Logging ────────────────────────────────────────────────────────

function _log(msg) {
    console.log(`[SHEIKHA-AGENTS-LAYER] ${msg}`);
}

// ─── Exports ───────────────────────────────────────────────────────────────────

module.exports = {
    LAYER_VERSION,
    LAYER_ID,
    READINESS,
    activate,
    readinessBoard,
    agentReadiness,
    updateAgentReadiness,
    status,
    on,
    registry,
};
