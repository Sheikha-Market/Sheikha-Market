/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║     SHEIKHA Neural Root Activator — المُفعِّل المركزي للشبكة العصبية الجذرية ║
 * ║       SHEIKHA Sovereign Cognitive Infrastructure                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
 * ﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا﴾ — البقرة: ٣١
 * ﴿أَصْلُهَا ثَابِتٌ وَفَرْعُهَا فِي السَّمَاءِ﴾ — إبراهيم: ٢٤
 *
 * هذا المُفعِّل يربط جميع شبكات الخلايا العصبية الجذرية في منظومة SHEIKHA
 * ضمن طبقة Intelligence ويُعرضها كطبقة عليا موحّدة:
 *
 *  ┌────────────────────────────────────────────────────────────────────┐
 *  │                  SHEIKHA Neural Root Activator                     │
 *  │                                                                    │
 *  │   ① lib/sheikha-root-neural-cell-network  — 92 خلية جذرية         │
 *  │        (7 طبقات: 1+7+14+21+28+14+7، 128-dim، Adam optimizer)      │
 *  │                                                                    │
 *  │   ② core/neural-root-network/snrn-engine  — 19 خلية شرعية         │
 *  │        (8 قرآن + 5 سنة + 5 مقاصد + 1 توحيد عليا)                 │
 *  │                                                                    │
 *  │   ③ core/neural/neural-cells              — 12 خلية بالكتاب والسنة │
 *  │        (مرقّمة بآيات قرآنية وأحاديث نبوية)                       │
 *  │                                                                    │
 *  │   ④ core/neural/sheikha-roots-hierarchy-neural — الهرم الجذري      │
 *  │        (ROOT_MASTER → 6 جذور كبرى → 18 فرع)                       │
 *  │                                                                    │
 *  │   ⑤ core/neural-root-network/halal-validator — فحص الحلال الفوري   │
 *  │                                                                    │
 *  │   ⑥ core/neural-root-network/maqasid-cells — المقاصد الخمس        │
 *  │                                                                    │
 *  │   TOTAL: 19 + 92 + 12 + 5 = 128 خلية عصبية جذرية نشطة                │
 *  └────────────────────────────────────────────────────────────────────┘
 *
 * بروتوكول التفعيل:
 *   1. تفعيل SNRN (19 خلية شرعية) — الحارس الشرعي
 *   2. تفعيل Root NCN (92 خلية جذرية) — الشبكة الجذرية الكاملة
 *   3. تفعيل Neural Cells (12 خلية) — الخلايا المرقّمة بالكتاب والسنة
 *   4. تفعيل Hierarchy Network — شبكة الهرم الجذري
 *   5. مزامنة كل الشبكات عبر الـ event bus الموحّد
 *
 * @module intelligence/sheikha-neural-root-activator
 * @version 1.0.0
 * @identity SHEIKHA Sovereign Cognitive Infrastructure
 */

'use strict';

const EventEmitter = require('events');

// ─── Identity ────────────────────────────────────────────────────────────────

const NEURAL_ROOT_IDENTITY = {
    name:       'SHEIKHA Neural Root Activator',
    nameAr:     'المُفعِّل المركزي للشبكة العصبية الجذرية',
    version:    '1.0.0',
    layer:      'Intelligence Layer — Neural Root',
    tawheed:    'لا إله إلا الله محمد رسول الله',
    bismillah:  'بسم الله الرحمن الرحيم',
    ayah:       '﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا﴾ — البقرة: ٣١',
    totalCells: 0,
    startedAt:  null,
};

const _bus = new EventEmitter();
_bus.setMaxListeners(64);

// ─── Sub-Network Handles ─────────────────────────────────────────────────────

const _networks = {
    rootNCN:    null,   // lib/sheikha-root-neural-cell-network (92 cells)
    snrn:       null,   // core/neural-root-network/snrn-engine (19 cells)
    cells12:    null,   // core/neural/neural-cells (12 cells)
    hierarchy:  null,   // core/neural/sheikha-roots-hierarchy-neural
    halal:      null,   // core/neural-root-network/halal-validator
    maqasid:    null,   // core/neural-root-network/maqasid-cells/index
};

const _activation = {
    rootNCN:    false,
    snrn:       false,
    cells12:    false,
    hierarchy:  false,
    halal:      false,
    maqasid:    false,
};

let _ready = false;

// ─── Network Loader ───────────────────────────────────────────────────────────

/**
 * تحميل الشبكات تدريجياً مع تحمّل الفشل (Graceful Degradation).
 */
function _loadNetworks() {
    // ① Root NCN (92 خلية)
    try {
        _networks.rootNCN = require('../lib/sheikha-root-neural-cell-network');
        _log('info', '① Root NCN محمّلة (92 خلية جذرية)');
    } catch (e) {
        _log('warn', `① Root NCN غير متاحة: ${e.message}`);
    }

    // ② SNRN (19 خلية شرعية)
    try {
        _networks.snrn = require('../core/neural-root-network/snrn-engine');
        _log('info', '② SNRN محمّلة (19 خلية شرعية)');
    } catch (e) {
        _log('warn', `② SNRN غير متاحة: ${e.message}`);
    }

    // ③ Neural Cells (12 خلية)
    try {
        _networks.cells12 = require('../core/neural/neural-cells');
        _log('info', '③ Neural Cells محمّلة (12 خلية بالكتاب والسنة)');
    } catch (e) {
        _log('warn', `③ Neural Cells غير متاحة: ${e.message}`);
    }

    // ④ Hierarchy Neural Network
    try {
        _networks.hierarchy = require('../core/neural/sheikha-roots-hierarchy-neural');
        _log('info', '④ Hierarchy Network محمّلة (جذور هرمية)');
    } catch (e) {
        _log('warn', `④ Hierarchy Network غير متاحة: ${e.message}`);
    }

    // ⑤ Halal Validator
    try {
        _networks.halal = require('../core/neural-root-network/halal-validator');
        _log('info', '⑤ Halal Validator محمّل (فحص الحلال الفوري)');
    } catch (e) {
        _log('warn', `⑤ Halal Validator غير متاح: ${e.message}`);
    }

    // ⑥ Maqasid Cells
    try {
        _networks.maqasid = require('../core/neural-root-network/maqasid-cells/index');
        _log('info', '⑥ Maqasid Cells محمّلة (المقاصد الخمس)');
    } catch (e) {
        _log('warn', `⑥ Maqasid Cells غير متاحة: ${e.message}`);
    }
}

// ─── Activation Sequence ─────────────────────────────────────────────────────

/**
 * تفعيل جميع شبكات الخلايا العصبية الجذرية.
 * @returns {{success: boolean, networksActivated: string[], totalCells: number}}
 */
function activate() {
    _log('info', '');
    _log('info', '╔═══════════════════════════════════════════════════════════╗');
    _log('info', '║   SHEIKHA — تفعيل شبكة الخلايا العصبية الجذرية             ║');
    _log('info', '║   بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ                                ║');
    _log('info', '╚═══════════════════════════════════════════════════════════╝');

    _loadNetworks();

    const activated = [];
    let totalCells = 0;

    // ① تفعيل SNRN أولاً (الحارس الشرعي)
    if (_networks.snrn) {
        try {
            _networks.snrn.init();
            _activation.snrn = true;
            activated.push('SNRN-19-cells');
            totalCells += 19;
            _log('info', '  ✅ ① SNRN — 19 خلية شرعية نشطة');
        } catch (e) {
            _log('warn', `  ⚠️  SNRN فشل: ${e.message}`);
        }
    }

    // ② تفعيل Root NCN (92 خلية)
    if (_networks.rootNCN) {
        try {
            _networks.rootNCN.init();
            _activation.rootNCN = true;
            activated.push('RootNCN-92-cells');
            totalCells += 92;
            _log('info', '  ✅ ② Root NCN — 92 خلية جذرية نشطة');
        } catch (e) {
            _log('warn', `  ⚠️  Root NCN فشل: ${e.message}`);
        }
    }

    // ③ تفعيل Neural Cells (12 خلية)
    if (_networks.cells12) {
        try {
            _networks.cells12.init();
            _activation.cells12 = true;
            activated.push('NeuralCells-12');
            totalCells += 12;
            _log('info', '  ✅ ③ Neural Cells — 12 خلية (كتاب وسنة) نشطة');
        } catch (e) {
            _log('warn', `  ⚠️  Neural Cells فشل: ${e.message}`);
        }
    }

    // ④ تفعيل Hierarchy Network
    if (_networks.hierarchy) {
        try {
            const hStatus = _networks.hierarchy.status ? _networks.hierarchy.status() : null;
            _activation.hierarchy = true;
            activated.push('HierarchyNetwork');
            _log('info', `  ✅ ④ Hierarchy Network — شبكة هرمية (${hStatus ? hStatus.totalNodes : '?'} عقدة)`);
        } catch (e) {
            _log('warn', `  ⚠️  Hierarchy Network فشل: ${e.message}`);
        }
    }

    // ⑤ تفعيل Halal Validator
    if (_networks.halal) {
        _activation.halal = true;
        activated.push('HalalValidator');
        _log('info', '  ✅ ⑤ Halal Validator — فحص الحلال الفوري نشط');
    }

    // ⑥ تفعيل Maqasid Cells
    if (_networks.maqasid) {
        _activation.maqasid = true;
        activated.push('MaqasidCells-5');
        totalCells += 5;
        _log('info', '  ✅ ⑥ Maqasid Cells — المقاصد الخمس نشطة');
    }

    NEURAL_ROOT_IDENTITY.totalCells = totalCells;
    NEURAL_ROOT_IDENTITY.startedAt  = new Date().toISOString();
    _ready = true;

    _log('info', '');
    _log('info', `  🌳 إجمالي الخلايا الجذرية النشطة: ${totalCells}`);
    _log('info', `  📡 الشبكات المُفعَّلة: ${activated.length}`);
    _log('info', '  ﴿صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ﴾ — النمل: ٨٨');
    _log('info', '');

    _bus.emit('neural-root:activated', {
        networksActivated: activated,
        totalCells,
        activatedAt: NEURAL_ROOT_IDENTITY.startedAt,
    });

    return { success: true, networksActivated: activated, totalCells };
}

// ─── Unified Inference ────────────────────────────────────────────────────────

/**
 * الاستدلال الموحّد عبر جميع الشبكات الجذرية.
 * @param {string|object} input — نص أو كائن معاملة
 * @returns {object} — نتيجة موحّدة من جميع الشبكات
 */
function infer(input) {
    if (!_ready) {
        return { error: 'الشبكة الجذرية غير مُفعَّلة — استدعِ activate() أولاً' };
    }

    const startAt = Date.now();
    const results = {};

    // ① SNRN — الاستدلال الشرعي
    if (_activation.snrn && _networks.snrn) {
        try {
            const tx = typeof input === 'string'
                ? { type: 'QUERY', text: input, interestRate: 0 }
                : input;
            results.snrn = _networks.snrn.infer(tx);
        } catch (e) {
            results.snrn = { error: e.message };
        }
    }

    // ② Root NCN — الاستدلال الجذري
    if (_activation.rootNCN && _networks.rootNCN) {
        try {
            const text = typeof input === 'string' ? input : JSON.stringify(input);
            results.rootNCN = _networks.rootNCN.infer(text);
        } catch (e) {
            results.rootNCN = { error: e.message };
        }
    }

    // ③ Neural Cells — معالجة خلوية
    if (_activation.cells12 && _networks.cells12) {
        try {
            const text = typeof input === 'string' ? input : JSON.stringify(input);
            results.cells12 = _networks.cells12.process(text);
        } catch (e) {
            results.cells12 = { error: e.message };
        }
    }

    // ④ Hierarchy — الاستدلال الهرمي
    if (_activation.hierarchy && _networks.hierarchy) {
        try {
            const inputMap = typeof input === 'string'
                ? { text: input }
                : input;
            results.hierarchy = _networks.hierarchy.infer(inputMap);
        } catch (e) {
            results.hierarchy = { error: e.message };
        }
    }

    // ⑤ Halal Check
    if (_activation.halal && _networks.halal) {
        try {
            const tx = typeof input === 'string'
                ? { type: 'QUERY', text: input }
                : input;
            results.halal = _networks.halal.validate ? _networks.halal.validate(tx) : { checked: true };
        } catch (e) {
            results.halal = { error: e.message };
        }
    }

    // ⑥ Maqasid Assessment
    if (_activation.maqasid && _networks.maqasid) {
        try {
            const tx = typeof input === 'string'
                ? { type: 'QUERY', text: input }
                : input;
            results.maqasid = _networks.maqasid.assessByMaqasid(tx);
        } catch (e) {
            results.maqasid = { error: e.message };
        }
    }

    // ─── التجميع الموحّد ──────────────────────────────────────────────────────

    const snrnVerdict    = results.snrn?.verdict || 'UNKNOWN';
    const rootConfidence = results.rootNCN?.rootConfidence || 0;
    const halalResult    = results.halal?.valid !== false;

    // القرار النهائي: الشريعة أولاً
    const finalVerdict = snrnVerdict === 'HARAM' ? 'HARAM'
                        : !halalResult           ? 'HARAM'
                        : snrnVerdict === 'HALAL' ? 'HALAL'
                        : 'REVIEW';

    const unified = {
        id:           `neural-root-${Date.now()}`,
        timestamp:    new Date().toISOString(),
        input:        typeof input === 'string' ? input : '[object]',
        finalVerdict,
        rootConfidence: parseFloat(rootConfidence.toFixed(4)),
        activeDomain: results.rootNCN?.activeDomain || null,
        activeRootCell: results.rootNCN?.activeRootCell || null,
        snrnScore:    results.snrn?.score ?? null,
        cellsActivated: results.snrn?.cellsActivated ?? null,
        maqasidFulfilled: results.maqasid?.fulfilled ?? null,
        latencyMs:    Date.now() - startAt,
        detail:       results,
    };

    _bus.emit('neural-root:inference', { unified });
    return unified;
}

// ─── Halal Quick Check ────────────────────────────────────────────────────────

/**
 * فحص سريع للحلال (مباشر بدون Full Inference).
 * @param {object} transaction
 * @returns {{valid: boolean, violations: string[], message: string}}
 */
function quickHalalCheck(transaction) {
    if (!_activation.halal || !_networks.halal) {
        return { valid: true, violations: [], message: 'Halal Validator غير متاح' };
    }
    try {
        if (typeof _networks.halal.validate === 'function') {
            return _networks.halal.validate(transaction);
        }
        if (typeof _networks.halal.check === 'function') {
            return _networks.halal.check(transaction);
        }
        // محاولة استدعاء مباشر
        const RULES = _networks.halal.RULES || [];
        const violations = RULES
            .filter(r => r.check && r.check(transaction))
            .map(r => r.message);
        return { valid: violations.length === 0, violations, message: violations[0] || 'حلال' };
    } catch (e) {
        return { valid: true, violations: [], message: e.message };
    }
}

// ─── Maqasid Assessment ───────────────────────────────────────────────────────

/**
 * تقييم المعاملة بناءً على المقاصد الشرعية الخمس.
 * @param {object} transaction
 * @returns {object}
 */
function assessMaqasid(transaction) {
    if (!_activation.maqasid || !_networks.maqasid) {
        return { available: false, message: 'Maqasid Cells غير متاحة' };
    }
    try {
        return _networks.maqasid.assessByMaqasid(transaction);
    } catch (e) {
        return { available: false, error: e.message };
    }
}

// ─── Status ───────────────────────────────────────────────────────────────────

/**
 * تقرير حالة الشبكة العصبية الجذرية الكاملة.
 * @returns {object}
 */
function status() {
    const nets = {};

    if (_activation.snrn && _networks.snrn) {
        try { nets.snrn = _networks.snrn.status(); } catch (_) { nets.snrn = { error: true }; }
    }
    if (_activation.rootNCN && _networks.rootNCN) {
        try { nets.rootNCN = _networks.rootNCN.status(); } catch (_) { nets.rootNCN = { error: true }; }
    }
    if (_activation.cells12 && _networks.cells12) {
        try { nets.cells12 = _networks.cells12.status(); } catch (_) { nets.cells12 = { error: true }; }
    }
    if (_activation.hierarchy && _networks.hierarchy) {
        try { nets.hierarchy = _networks.hierarchy.status ? _networks.hierarchy.status() : { active: true }; } catch (_) { nets.hierarchy = { error: true }; }
    }

    return {
        ...NEURAL_ROOT_IDENTITY,
        ready: _ready,
        activation: { ..._activation },
        networksCount: Object.values(_activation).filter(Boolean).length,
        networks: nets,
        statusAt: new Date().toISOString(),
    };
}

// ─── Health ───────────────────────────────────────────────────────────────────

/**
 * نقطة فحص الصحة السريعة.
 * @returns {object}
 */
function health() {
    return {
        name: NEURAL_ROOT_IDENTITY.name,
        ready: _ready,
        totalCells: NEURAL_ROOT_IDENTITY.totalCells,
        networksActive: Object.values(_activation).filter(Boolean).length,
        startedAt: NEURAL_ROOT_IDENTITY.startedAt,
    };
}

// ─── Sync with Intelligence Fabric ───────────────────────────────────────────

/**
 * مزامنة الشبكة الجذرية مع Intelligence Fabric.
 * @param {object} intelligenceFabric — طبقة الذكاء التشغيلي
 */
function syncWithIntelligence(intelligenceFabric) {
    if (!intelligenceFabric || typeof intelligenceFabric.pushDataPoint !== 'function') return;

    _bus.on('neural-root:inference', ({ unified }) => {
        intelligenceFabric.pushDataPoint('neural.rootConfidence', unified.rootConfidence);
        intelligenceFabric.pushDataPoint('neural.latencyMs', unified.latencyMs);
        if (unified.finalVerdict === 'HARAM') {
            intelligenceFabric.pushDataPoint('neural.haramBlocked', 1);
        }
    });

    _log('info', '🔗 الشبكة الجذرية مُزامَنة مع Intelligence Fabric');
}

// ─── Event Bus ────────────────────────────────────────────────────────────────

function on(event, handler) { _bus.on(event, handler); }
function emit(event, payload = {}) {
    _bus.emit(event, { ...payload, emittedAt: new Date().toISOString() });
}

// ─── Internal Logging ─────────────────────────────────────────────────────────

function _log(level, msg) {
    const tag = '[SHEIKHA-NEURAL-ROOT]';
    if (level === 'warn')  console.warn(`${tag} ⚠️  ${msg}`);
    else if (level === 'error') console.error(`${tag} ❌ ${msg}`);
    else console.log(`${tag} ${msg}`);
}

// ─── تفعيل تلقائي عند التحميل ────────────────────────────────────────────────

activate();

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
    activate,
    infer,
    quickHalalCheck,
    assessMaqasid,
    status,
    health,
    syncWithIntelligence,
    on,
    emit,
    NEURAL_ROOT_IDENTITY,
};
