/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🧠 مسارات الشبكة العصبية الجذرية — Neural Root Routes
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * ﴿ وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا ﴾ — البقرة: 31
 *
 * المسارات:
 *   GET  /api/neural/root/status       — حالة شبكة الخلايا الجذرية
 *   POST /api/neural/root/activate     — تفعيل شبكة جذرية كاملة
 *   GET  /api/neural/root/unity-score  — درجة التوحيد الحالية
 *   POST /api/neural/root/digitize     — رقمنة مفهوم بالكتاب والسنة
 *   GET  /api/neural/root/cells        — عرض كل الخلايا وحالتها
 *   POST /api/neural/root/forward      — الانتشار الأمامي بمدخلات مخصصة
 *   GET  /api/neural/root/quran-db     — قاعدة بيانات الآيات
 *   POST /api/neural/root/verify       — التحقق من توافق إجراء مع المبادئ الإسلامية
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const express = require('express');
const router = express.Router();

// ─── تحميل الوحدات ───────────────────────────────────────────────────────────
let rootRuntime, rootNCN, unifiedNN, digitizer, snrnEngine, neuralRootActivator;

try {
    rootRuntime = require('../lib/sheikha-root-neural-runtime.js');
    console.log('✅ [NEURAL-ROOT-ROUTES] Runtime الشبكة الجذرية محمّل');
} catch (e) {
    console.log('⚠️ [NEURAL-ROOT-ROUTES] فشل تحميل Runtime الجذري:', e.message);
    rootRuntime = null;
}

try {
    rootNCN = require('../lib/sheikha-root-neural-cell-network.js');
    console.log('✅ [NEURAL-ROOT-ROUTES] شبكة الخلايا العصبية الجذرية محمّلة');
} catch (e) {
    console.log('⚠️ [NEURAL-ROOT-ROUTES] فشل تحميل شبكة الخلايا الجذرية:', e.message);
    rootNCN = null;
}

try {
    unifiedNN = require('../lib/sheikha-unified-neural-network.js');
    console.log('✅ [NEURAL-ROOT-ROUTES] شبكة التوحيد الجذرية المحافِظة محمّلة');
} catch (e) {
    console.log('⚠️ [NEURAL-ROOT-ROUTES] فشل تحميل شبكة التوحيد:', e.message);
    unifiedNN = null;
}

try {
    digitizer = require('../lib/sheikha-islamic-digitizer.js');
    console.log('✅ [NEURAL-ROOT-ROUTES] المُرقمِّن الإسلامي محمّل');
} catch (e) {
    console.log('⚠️ [NEURAL-ROOT-ROUTES] فشل تحميل المُرقمِّن:', e.message);
    digitizer = null;
}

try {
    snrnEngine = require('../core/neural-root-network/snrn-engine');
    snrnEngine.init();
    console.log('✅ [NEURAL-ROOT-ROUTES] محرك SNRN محمّل ومُفعَّل (شبكة الخلايا الجذرية العصبية)');
} catch (e) {
    console.log('⚠️ [NEURAL-ROOT-ROUTES] فشل تحميل SNRN:', e.message);
    snrnEngine = null;
}

try {
    neuralRootActivator = require('../intelligence/sheikha-neural-root-activator');
    console.log('✅ [NEURAL-ROOT-ROUTES] المُفعِّل المركزي للشبكة الجذرية محمّل');
} catch (e) {
    console.log('⚠️ [NEURAL-ROOT-ROUTES] فشل تحميل المُفعِّل المركزي:', e.message);
    neuralRootActivator = null;
}

const GEO_ACTIVATION_PROFILES = {
    saudi: {
        id: 'saudi',
        labelAr: 'السعودية',
        scope: 'وطني',
        iso: ['SA'],
        domain: 'commerce',
        neuralInputs: { ilmu: 0.82, adlu: 0.92, rahma: 0.88, quwwa: 0.76 },
        governance: ['sharia-core', 'pdpl', 'sama'],
        language: 'ar-SA',
        currency: 'SAR'
    },
    gulf: {
        id: 'gulf',
        labelAr: 'الخليج',
        scope: 'إقليمي',
        iso: ['SA', 'AE', 'QA', 'KW', 'BH', 'OM'],
        domain: 'communication',
        neuralInputs: { ilmu: 0.8, adlu: 0.88, rahma: 0.84, quwwa: 0.74 },
        governance: ['gcc-trade', 'sharia-core', 'aml-regional'],
        language: 'ar',
        currency: 'SAR'
    },
    oic: {
        id: 'oic',
        labelAr: 'الدول الإسلامية',
        scope: 'دولي',
        iso: ['OIC'],
        domain: 'justice',
        neuralInputs: { ilmu: 0.78, adlu: 0.9, rahma: 0.9, quwwa: 0.72 },
        governance: ['aaoifi', 'islamic-finance', 'trade-ethics'],
        language: 'ar-en',
        currency: 'multi'
    },
    international: {
        id: 'international',
        labelAr: 'دولي',
        scope: 'دولي',
        iso: ['INTL'],
        domain: 'security',
        neuralInputs: { ilmu: 0.8, adlu: 0.86, rahma: 0.78, quwwa: 0.84 },
        governance: ['wto', 'iso-27001', 'fatf', 'sharia-core'],
        language: 'ar-en',
        currency: 'multi'
    },
    continental: {
        id: 'continental',
        labelAr: 'قاري',
        scope: 'قاري',
        iso: ['AF', 'AS', 'EU', 'NA', 'SA', 'OC'],
        domain: 'development',
        neuralInputs: { ilmu: 0.82, adlu: 0.82, rahma: 0.82, quwwa: 0.82 },
        governance: ['regional-trade-zones', 'customs-unions', 'sharia-core'],
        language: 'multi',
        currency: 'multi'
    },
    global: {
        id: 'global',
        labelAr: 'عالمي',
        scope: 'عالمي',
        iso: ['ALL'],
        domain: 'neural',
        neuralInputs: { ilmu: 0.9, adlu: 0.85, rahma: 0.8, quwwa: 0.87 },
        governance: ['un-global-compact', 'iso-27001', 'soc2', 'sharia-core'],
        language: 'multi',
        currency: 'multi'
    },
    cosmic: {
        id: 'cosmic',
        labelAr: 'كوني',
        scope: 'كوني',
        iso: ['COSMOS'],
        domain: 'vision',
        neuralInputs: { ilmu: 0.94, adlu: 0.82, rahma: 0.8, quwwa: 0.86 },
        governance: ['research-ethics', 'no-harm', 'sharia-core'],
        language: 'multi',
        currency: 'multi'
    }
};

// مأخوذة من معمارية `sheikha-root-neural-cell-network` الحالية (L0→L6 = 7 طبقات، 92 خلية إجمالاً).
const EXPECTED_ROOT_CELL_COUNT = 92;
const EXPECTED_ROOT_LAYER_COUNT = 7;
const UNITY_SCORE_WEIGHTS = Object.freeze({
    runtimeCells: 0.30,
    runtimeNetworks: 0.25,
    rootCoverage: 0.25,
    rootLayers: 0.10,
    legacyBonus: 0.10
});

function resolveGeoProfile(rawRegion) {
    const value = String(rawRegion || '').trim().toLowerCase();
    if (!value) return GEO_ACTIVATION_PROFILES.saudi;

    const aliases = {
        sa: 'saudi',
        ksa: 'saudi',
        saudi: 'saudi',
        'saudi-arabia': 'saudi',
        gcc: 'gulf',
        gulf: 'gulf',
        khaleeji: 'gulf',
        oic: 'oic',
        international: 'international',
        global: 'global',
        world: 'global',
        continental: 'continental',
        continent: 'continental',
        cosmic: 'cosmic',
        universal: 'cosmic'
    };

    const key = aliases[value] || value;
    return GEO_ACTIVATION_PROFILES[key] || GEO_ACTIVATION_PROFILES.saudi;
}

function validateGeoBody(rawBody) {
    if (rawBody && (typeof rawBody !== 'object' || Array.isArray(rawBody))) {
        return { ok: false, status: 400, message: 'صيغة body غير صالحة' };
    }

    const body = rawBody || {};
    if (body.region !== undefined && typeof body.region !== 'string') {
        return { ok: false, status: 400, message: 'region يجب أن يكون نصاً' };
    }
    if (body.action !== undefined && typeof body.action !== 'string') {
        return { ok: false, status: 400, message: 'action يجب أن يكون نصاً' };
    }

    return { ok: true, body };
}

function hasRootRuntime() {
    return !!(rootRuntime && typeof rootRuntime.status === 'function');
}

function hasRootNetwork() {
    return !!(rootNCN && typeof rootNCN.status === 'function');
}

function hasLegacyNetwork() {
    return !!(
        unifiedNN &&
        typeof unifiedNN.getStatus === 'function' &&
        typeof unifiedNN.activate === 'function' &&
        typeof unifiedNN.forward === 'function'
    );
}

function getRuntimeStatus() {
    if (!hasRootRuntime()) return null;
    return rootRuntime.status();
}

function getRootNetworkStatus() {
    if (!hasRootNetwork()) return null;
    return rootNCN.status();
}

function getLegacyStatus() {
    if (!unifiedNN || typeof unifiedNN.getStatus !== 'function') return null;
    return unifiedNN.getStatus();
}

function normalizeInputText(body = {}) {
    if (typeof body.inputText === 'string' && body.inputText.trim()) return body.inputText.trim();
    if (typeof body.text === 'string' && body.text.trim()) return body.text.trim();
    if (typeof body.concept === 'string' && body.concept.trim()) return body.concept.trim();
    if (typeof body.action === 'string' && body.action.trim()) return body.action.trim();
    if (Object.keys(body).length > 0) return JSON.stringify(body);
    return 'تشغيل الشبكة العصبية الجذرية';
}

function buildUnityScore() {
    const runtimeStatus = getRuntimeStatus();
    const rootStatus = getRootNetworkStatus();
    const legacyStatus = getLegacyStatus();

    const runtimeCellRatio = runtimeStatus && runtimeStatus.totalCells
        ? runtimeStatus.activeCells / runtimeStatus.totalCells
        : 0;
    const runtimeNetworkKeys = Object.keys(runtimeStatus?.networks || {});
    const runtimeNetworkRatio = runtimeNetworkKeys.length
        ? runtimeNetworkKeys.filter((key) => runtimeStatus.networks[key]).length / runtimeNetworkKeys.length
        : 0;
    const rootCoverage = rootStatus && rootStatus.totalCells
        ? Math.min(rootStatus.totalCells / EXPECTED_ROOT_CELL_COUNT, 1)
        : 0;
    const rootLayerRatio = rootStatus && rootStatus.layersCount
        ? Math.min(rootStatus.layersCount / EXPECTED_ROOT_LAYER_COUNT, 1)
        : 0;
    // نمنح خصماً بسيطاً فقط عند غياب الطبقة legacy لأن الهدف الأساسي الآن هو الجذر الجديد،
    // لكننا نحتفظ بإشارة طفيفة إلى اكتمال التكامل التاريخي عندما تكون متاحة.
    const legacyBonus = legacyStatus ? 1 : 0.85;

    const score = Number((
        (runtimeCellRatio * UNITY_SCORE_WEIGHTS.runtimeCells) +
        (runtimeNetworkRatio * UNITY_SCORE_WEIGHTS.runtimeNetworks) +
        (rootCoverage * UNITY_SCORE_WEIGHTS.rootCoverage) +
        (rootLayerRatio * UNITY_SCORE_WEIGHTS.rootLayers) +
        (legacyBonus * UNITY_SCORE_WEIGHTS.legacyBonus)
    ).toFixed(4));

    return {
        value: Number((score * 100).toFixed(2)),
        breakdown: {
            runtimeCellRatio: Number((runtimeCellRatio * 100).toFixed(2)),
            runtimeNetworkRatio: Number((runtimeNetworkRatio * 100).toFixed(2)),
            rootCoverage: Number((rootCoverage * 100).toFixed(2)),
            rootLayerRatio: Number((rootLayerRatio * 100).toFixed(2)),
            legacyAvailable: !!legacyStatus
        }
    };
}

// ─── مساعد التحقق ────────────────────────────────────────────────────────────
function nnCheck(res) {
    const rootReady = hasRootRuntime() && hasRootNetwork();
    if (!rootReady && !hasLegacyNetwork()) {
        res.status(503).json({
            success: false,
            message: 'شبكة الخلايا العصبية الجذرية غير متاحة',
            availability: {
                runtime: hasRootRuntime(),
                rootNetwork: hasRootNetwork(),
                legacyUnified: hasLegacyNetwork()
            },
            timestamp: new Date().toISOString()
        });
        return false;
    }
    return true;
}

// ─── GET /status ─────────────────────────────────────────────────────────────
/**
 * حالة شبكة الخلايا الجذرية الكاملة
 */
router.get('/status', (req, res) => {
    if (!nnCheck(res)) return;
    try {
        const runtimeStatus = getRuntimeStatus();
        const rootStatus = getRootNetworkStatus();
        const legacyStatus = getLegacyStatus();
        res.json({
            success: true,
            bismillah: 'بسم الله الرحمن الرحيم',
            data: {
                runtime: runtimeStatus,
                rootNeuralCellNetwork: rootStatus,
                legacyUnifiedNetwork: legacyStatus,
                unityScore: buildUnityScore()
            },
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── POST /activate ──────────────────────────────────────────────────────────
/**
 * تفعيل شبكة جذرية كاملة بمجال محدد
 * Body: { domain? }  — domain: security|commerce|vision|neural|development|knowledge|justice
 */
router.post('/activate', (req, res) => {
    if (!nnCheck(res)) return;
    try {
        const { domain = 'general' } = req.body || {};
        const inputText = normalizeInputText(req.body || {});
        if (!hasRootRuntime() || !hasRootNetwork()) {
            const legacyActivation = unifiedNN.activate(domain);
            return res.json({
                success: true,
                bismillah: 'بسم الله الرحمن الرحيم',
                data: {
                    legacyUnifiedNetwork: legacyActivation,
                    mode: 'legacy-fallback'
                },
                timestamp: new Date().toISOString()
            });
        }
        const runtimeActivation = rootRuntime.init();
        const pulse = rootRuntime.pulse({
            type: domain,
            context: inputText,
            data: { domain, source: 'api/neural/root/activate' }
        });
        const inference = rootNCN.infer(inputText);
        res.json({
            success: true,
            bismillah: 'بسم الله الرحمن الرحيم',
            data: {
                runtime: runtimeActivation,
                pulse,
                inference,
                rootNeuralCellNetwork: rootNCN.status(),
                unityScore: buildUnityScore()
            },
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── GET /unity-score ────────────────────────────────────────────────────────
/**
 * درجة التوحيد الحالية للشبكة
 */
router.get('/unity-score', (req, res) => {
    if (!nnCheck(res)) return;
    try {
        if ((!hasRootRuntime() || !hasRootNetwork()) && unifiedNN && typeof unifiedNN.unify === 'function') {
            return res.json({
                success: true,
                bismillah: 'بسم الله الرحمن الرحيم',
                data: {
                    legacyUnifiedNetwork: unifiedNN.unify(),
                    mode: 'legacy-fallback'
                },
                timestamp: new Date().toISOString()
            });
        }
        const runtimeStatus = getRuntimeStatus();
        const rootStatus = getRootNetworkStatus();
        const result = {
            ...buildUnityScore(),
            runtimeReady: !!runtimeStatus?.ready,
            activeRuntimeCells: runtimeStatus?.activeCells || 0,
            totalRuntimeCells: runtimeStatus?.totalCells || 0,
            totalRootCells: rootStatus?.totalCells || 0,
            rootLayers: rootStatus?.layersCount || 0
        };
        res.json({
            success: true,
            bismillah: 'بسم الله الرحمن الرحيم',
            data: result,
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── POST /digitize ──────────────────────────────────────────────────────────
/**
 * رقمنة مفهوم تقني بالكتاب والسنة
 * Body: { concept }
 */
router.post('/digitize', (req, res) => {
    try {
        const { concept } = req.body || {};
        if (!concept) {
            return res.status(400).json({ success: false, message: 'concept مطلوب', timestamp: new Date().toISOString() });
        }
        if (!digitizer) {
            return res.status(503).json({ success: false, message: 'المُرقمِّن غير متاح', timestamp: new Date().toISOString() });
        }
        const result = digitizer.digitize(concept);
        res.json({
            success: true,
            bismillah: 'بسم الله الرحمن الرحيم',
            data: result,
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── GET /cells ──────────────────────────────────────────────────────────────
/**
 * عرض كل الخلايا وحالتها
 */
router.get('/cells', (req, res) => {
    if (!nnCheck(res)) return;
    try {
        if ((!hasRootRuntime() || !hasRootNetwork()) && unifiedNN && typeof unifiedNN.getAllCells === 'function') {
            const cells = unifiedNN.getAllCells();
            return res.json({
                success: true,
                bismillah: 'بسم الله الرحمن الرحيم',
                total: cells.length,
                runtimeCellsCount: 0,
                rootCellsCount: cells.length,
                runtimeCells: [],
                rootCells: cells,
                mode: 'legacy-fallback',
                quranRef: '﴿ وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا ﴾ — البقرة: 31',
                timestamp: new Date().toISOString()
            });
        }
        const runtimeCells = rootRuntime.listCells();
        const rootCells = rootNCN.getCells();
        res.json({
            success: true,
            bismillah: 'بسم الله الرحمن الرحيم',
            total: runtimeCells.length + rootCells.length,
            runtimeCellsCount: runtimeCells.length,
            rootCellsCount: rootCells.length,
            runtimeCells,
            rootCells,
            quranRef: '﴿ وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا ﴾ — البقرة: 31',
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── POST /forward ────────────────────────────────────────────────────────────
/**
 * الانتشار الأمامي بمدخلات مخصصة
 * Body: { tawheed?, ilmu?, adlu?, rahma?, quwwa? }  — قيم [0-1]
 */
router.post('/forward', (req, res) => {
    if (!nnCheck(res)) return;
    try {
        const inputs = req.body || {};
        const inputText = normalizeInputText(inputs);
        if (!hasRootRuntime() || !hasRootNetwork()) {
            return res.json({
                success: true,
                bismillah: 'بسم الله الرحمن الرحيم',
                data: {
                    legacyForward: unifiedNN.forward(inputs),
                    mode: 'legacy-fallback'
                },
                timestamp: new Date().toISOString()
            });
        }
        const result = {
            runtimePulse: rootRuntime.pulse({
                type: 'forward',
                context: inputText,
                data: inputs
            }),
            rootForward: rootNCN.forward(inputText),
            rootInference: rootNCN.infer(inputText)
        };
        res.json({
            success: true,
            bismillah: 'بسم الله الرحمن الرحيم',
            data: result,
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── POST /activate/geo ───────────────────────────────────────────────────────
/**
 * تفعيل الشبكة الجذرية حسب المنطقة الجغرافية مع التكيّف الآلي
 * Body: { region?, action? }
 */
router.post('/activate/geo', (req, res) => {
    if (!nnCheck(res)) return;

    try {
        const validation = validateGeoBody(req.body);
        if (!validation.ok) {
            return res.status(validation.status).json({ success: false, message: validation.message, timestamp: new Date().toISOString() });
        }
        const payload = validation.body;

        const region = payload.region;
        const regionWasOmitted = !region;
        const profile = resolveGeoProfile(region);
        const action = (payload.action || '').trim();

        if (!hasRootRuntime() || !hasRootNetwork()) {
            const forwardResult = unifiedNN.forward(profile.neuralInputs);
            const activationResult = unifiedNN.activate(profile.domain);
            const verifyResult = digitizer ? digitizer.verify(action || `تشغيل ${profile.labelAr}`) : null;

            return res.json({
                success: true,
                bismillah: 'بسم الله الرحمن الرحيم',
                mode: 'legacy-fallback',
                profile: {
                    id: profile.id,
                    labelAr: profile.labelAr,
                    scope: profile.scope,
                    defaultedFrom: regionWasOmitted ? 'saudi' : null,
                    iso: profile.iso,
                    governance: profile.governance,
                    language: profile.language,
                    currency: profile.currency
                },
                data: {
                    forward: forwardResult,
                    activation: activationResult,
                    sharia: verifyResult
                },
                tawheed: '﴿ قُلْ هُوَ اللَّهُ أَحَدٌ ﴾',
                noHarm: 'لا ضرر ولا ضرار',
                timestamp: new Date().toISOString()
            });
        }

        const activationText = action || `تشغيل ${profile.labelAr} ضمن المجال ${profile.domain}`;
        const forwardResult = rootRuntime.pulse({
            type: profile.domain,
            context: activationText,
            data: {
                region: profile.id,
                neuralInputs: profile.neuralInputs,
                governance: profile.governance
            }
        });
        const activationResult = rootNCN.infer(activationText);
        const verifyResult = digitizer ? digitizer.verify(action || `تشغيل ${profile.labelAr}`) : null;

        res.json({
            success: true,
            bismillah: 'بسم الله الرحمن الرحيم',
            mode: 'geo-adaptive-root-activation',
            profile: {
                id: profile.id,
                labelAr: profile.labelAr,
                scope: profile.scope,
                defaultedFrom: regionWasOmitted ? 'saudi' : null,
                iso: profile.iso,
                governance: profile.governance,
                language: profile.language,
                currency: profile.currency
            },
            data: {
                forward: forwardResult,
                activation: activationResult,
                sharia: verifyResult
            },
            tawheed: '﴿ قُلْ هُوَ اللَّهُ أَحَدٌ ﴾',
            noHarm: 'لا ضرر ولا ضرار',
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── POST /geo/halal-check ────────────────────────────────────────────────────
/**
 * فحص موحّد للحلال وعدم الضرر حسب المنطقة
 * Body: { region?, action }
 */
router.post('/geo/halal-check', (req, res) => {
    try {
        const validation = validateGeoBody(req.body);
        if (!validation.ok) {
            return res.status(validation.status).json({ success: false, message: validation.message, timestamp: new Date().toISOString() });
        }
        const payload = validation.body;

        const region = payload.region;
        const regionWasOmitted = !region;
        const action = (payload.action || '').trim();
        if (!action) {
            return res.status(400).json({ success: false, message: 'action مطلوب', timestamp: new Date().toISOString() });
        }
        if (!digitizer) {
            return res.status(503).json({ success: false, message: 'المُرقمِّن غير متاح', timestamp: new Date().toISOString() });
        }

        const profile = resolveGeoProfile(region);
        const check = digitizer.verify(action);
        const risk = check.halal ? 'low' : 'high';

        res.json({
            success: true,
            profile: {
                id: profile.id,
                labelAr: profile.labelAr,
                defaultedFrom: regionWasOmitted ? 'saudi' : null,
                governance: profile.governance
            },
            halal: check.halal,
            noHarm: check.halal && !check.violations.some(v => v.action === 'harm'),
            risk,
            score: check.score,
            violations: check.violations,
            principleScores: check.principleScores,
            recommendations: check.recommendations,
            quran: '﴿ وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا ﴾',
            hadith: 'لا ضرر ولا ضرار',
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── GET /quran-db ────────────────────────────────────────────────────────────
/**
 * قاعدة بيانات الآيات والأحاديث المُصنَّفة
 * Query: ?domain=technology
 */
router.get('/quran-db', (req, res) => {
    try {
        if (!digitizer) {
            return res.status(503).json({ success: false, message: 'المُرقمِّن غير متاح', timestamp: new Date().toISOString() });
        }
        const { domain } = req.query;
        const domains = digitizer.getAllDomains();
        const data = domain
            ? { [domain]: digitizer.tag(domain) }
            : Object.fromEntries(domains.map(d => [d, digitizer.tag(d)]));

        res.json({
            success: true,
            bismillah: 'بسم الله الرحمن الرحيم',
            domains,
            data,
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── POST /verify ─────────────────────────────────────────────────────────────
/**
 * التحقق من توافق إجراء مع المبادئ الإسلامية
 * Body: { action }
 */
router.post('/verify', (req, res) => {
    try {
        const { action } = req.body || {};
        if (!action) {
            return res.status(400).json({ success: false, message: 'action مطلوب', timestamp: new Date().toISOString() });
        }
        if (!digitizer) {
            return res.status(503).json({ success: false, message: 'المُرقمِّن غير متاح', timestamp: new Date().toISOString() });
        }
        const result = digitizer.verify(action);
        res.json({
            success: true,
            bismillah: 'بسم الله الرحمن الرحيم',
            data: result,
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

// ─── POST /cosmic-integration ─────────────────────────────────────────────────
/**
 * التكامل الرقمي الكوني — يوحِّد كل أنظمة المنظومة عبر شبكة الخلايا الجذرية العصبية
 * مرقَّم بالكتاب والسنة — موحَّد لله
 *
 * ﴿ وَكُلَّ شَيْءٍ أَحْصَيْنَاهُ فِي إِمَامٍ مُبِينٍ ﴾ — يس: ١٢
 * ﴿ إِنَّا كُلَّ شَيْءٍ خَلَقْنَاهُ بِقَدَرٍ ﴾ — القمر: ٤٩
 * «إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ» — البيهقي
 *
 * Body (اختياري): { scope?: 'cosmic'|'global'|'oic'|'saudi', systems?: string[] }
 */
router.post('/cosmic-integration', (req, res) => {
    try {
        const body = (req.body && typeof req.body === 'object' && !Array.isArray(req.body))
            ? req.body : {};

        // ① تفعيل المُفعِّل المركزي إن أمكن
        let activatorResult = null;
        if (neuralRootActivator && typeof neuralRootActivator.activate === 'function') {
            try {
                activatorResult = neuralRootActivator.activate();
            } catch (_) {}
        }

        // ② تحديد النطاق وملف المنطقة
        const scopeKey = (typeof body.scope === 'string' && body.scope.trim())
            ? body.scope.trim().toLowerCase() : 'cosmic';
        const geoProfile = resolveGeoProfile(scopeKey);

        // ③ الأنظمة المطلوب توحيدها (أو الافتراضية الكاملة)
        const ALL_SYSTEMS = [
            { id: 'tawheed',   nameAr: 'التوحيد',         domain: 'vision',      ref: '﴿ قُلْ هُوَ اللَّهُ أَحَدٌ ﴾ — الإخلاص: ١' },
            { id: 'sharia',    nameAr: 'الشريعة',         domain: 'justice',     ref: '﴿ إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ ﴾ — النحل: ٩٠' },
            { id: 'market',    nameAr: 'السوق والتجارة',  domain: 'commerce',    ref: '﴿ وَأَحَلَّ اللَّهُ الْبَيْعَ ﴾ — البقرة: ٢٧٥' },
            { id: 'finance',   nameAr: 'المالية والبنوك', domain: 'commerce',    ref: '﴿ وَحَرَّمَ الرِّبَا ﴾ — البقرة: ٢٧٥' },
            { id: 'supply',    nameAr: 'سلاسل الإمداد',  domain: 'development', ref: '«لا ضرر ولا ضرار»' },
            { id: 'security',  nameAr: 'الأمن والحماية',  domain: 'security',    ref: '﴿ يَا أَيُّهَا الَّذِينَ آمَنُوا خُذُوا حِذْرَكُمْ ﴾ — النساء: ٧١' },
            { id: 'knowledge', nameAr: 'العلم والمعرفة',  domain: 'knowledge',   ref: '﴿ وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا ﴾ — البقرة: ٣١' },
            { id: 'governance',nameAr: 'الحوكمة',         domain: 'justice',     ref: '﴿ إِنَّ اللَّهَ يَأْمُرُكُمْ أَنْ تُؤَدُّوا الْأَمَانَاتِ ﴾ — النساء: ٥٨' },
            { id: 'health',    nameAr: 'الصحة والرعاية', domain: 'development', ref: '«لا ضرر ولا ضرار» — ابن ماجه' },
            { id: 'education', nameAr: 'التعليم والتدريب',domain: 'knowledge',   ref: '«طَلَبُ الْعِلْمِ فَرِيضَةٌ» — ابن ماجه: ٢٢٤' },
            { id: 'neural',    nameAr: 'الشبكة العصبية',  domain: 'neural',      ref: '﴿ صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ ﴾ — النمل: ٨٨' },
            { id: 'cosmos',    nameAr: 'الكون والبيئة',   domain: 'vision',      ref: '﴿ إِنَّا كُلَّ شَيْءٍ خَلَقْنَاهُ بِقَدَرٍ ﴾ — القمر: ٤٩' },
        ];

        const requestedIds = Array.isArray(body.systems) && body.systems.length > 0
            ? body.systems.map(s => String(s).trim().toLowerCase())
            : null;
        const systems = requestedIds
            ? ALL_SYSTEMS.filter(s => requestedIds.includes(s.id))
            : ALL_SYSTEMS;
        if (systems.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'لم يُعثر على أنظمة صالحة، المتاح: ' + ALL_SYSTEMS.map(s => s.id).join(', '),
                timestamp: new Date().toISOString()
            });
        }

        // ④ تشغيل شبكة الخلايا الجذرية لكل نظام
        const systemResults = systems.map(sys => {
            const entry = { id: sys.id, nameAr: sys.nameAr, domain: sys.domain, ref: sys.ref };

            // تشغيل SNRN
            if (snrnEngine) {
                try {
                    entry.snrn = snrnEngine.infer({ type: sys.domain, text: sys.nameAr });
                } catch (e) {
                    entry.snrn = { error: e.message };
                }
            }

            // رقمنة بالكتاب والسنة
            if (digitizer) {
                try {
                    entry.digitized = digitizer.tag(sys.domain);
                } catch (e) {
                    entry.digitized = { error: e.message };
                }
            }

            // تقييم المقاصد
            if (neuralRootActivator && typeof neuralRootActivator.assessMaqasid === 'function') {
                try {
                    entry.maqasid = neuralRootActivator.assessMaqasid({ type: sys.domain, text: sys.nameAr });
                } catch (_) {}
            }

            return entry;
        });

        // ⑤ حساب درجة التكامل الكوني الكلية
        const snrnVerdicts = systemResults
            .filter(r => r.snrn && r.snrn.verdict)
            .map(r => r.snrn.verdict);
        const halalCount = snrnVerdicts.filter(v => v === 'HALAL').length;
        const totalVerdict = snrnVerdicts.length;
        const integrationScore = totalVerdict > 0
            ? parseFloat((halalCount / totalVerdict).toFixed(4)) : 1.0;

        // ⑥ استدلال موحَّد من المُفعِّل المركزي
        let unifiedInference = null;
        if (neuralRootActivator && typeof neuralRootActivator.infer === 'function') {
            try {
                unifiedInference = neuralRootActivator.infer('التكامل الرقمي الكوني الموحَّد لله');
            } catch (_) {}
        }

        // ⑦ درجة التوحيد
        const unityScore = buildUnityScore();

        res.json({
            success: true,
            bismillah: 'بسم الله الرحمن الرحيم',
            tawheed: 'لا إله إلا الله محمد رسول الله — كل شيء لله',
            quranRef: '﴿ وَكُلَّ شَيْءٍ أَحْصَيْنَاهُ فِي إِمَامٍ مُبِينٍ ﴾ — يس: ١٢',
            hadithRef: '«إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ»',
            integration: {
                scope: scopeKey,
                geoProfile: {
                    id: geoProfile.id,
                    labelAr: geoProfile.labelAr,
                    governance: geoProfile.governance,
                    iso: geoProfile.iso,
                },
                systemsIntegrated: systemResults.length,
                integrationScore,
                unityScore,
                activatorSummary: activatorResult
                    ? { networksActivated: activatorResult.networksActivated, totalCells: activatorResult.totalCells }
                    : null,
                unifiedInference,
                systems: systemResults,
            },
            noHarm: 'لا ضرر ولا ضرار',
            activatedAt: new Date().toISOString(),
            timestamp: new Date().toISOString(),
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, timestamp: new Date().toISOString() });
    }
});

module.exports = router;
