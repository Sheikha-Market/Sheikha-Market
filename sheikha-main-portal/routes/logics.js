/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🧠 مسارات المنطق الجامع — منظومة شيخة
 *  Universal Logics Routes — Sheikha Integrated Logic Systems
 *
 *  GET  /api/logics                          → قائمة المنطق (مع فلتر category)
 *  GET  /api/logics/master                   → المنطق الأعلى الجامع
 *  GET  /api/logics/stats                    → إحصائيات المنطق الجامع
 *  GET  /api/logics/scopes                   → قائمة النطاقات
 *  GET  /api/logics/categories               → فئات المنطق (core/extended/master)
 *  GET  /api/logics/:id                      → تفاصيل منطق محدد
 *  GET  /api/logics/:id/scope/:scopeId       → تطبيق منطق في نطاق
 *  GET  /api/logics/scope/:scopeId           → عرض نطاق عبر جميع المنطق
 *  POST /api/logics/:id/activate             → تسجيل تفعيل منطق لكيان
 *  GET  /api/logics/activations              → سجلات التفعيل
 *
 *  ── الشبكة العصبية لكل أنواع المنطق بالكون ─────────────────────────────────
 *  POST /api/logics/neural/infer             → استدلال أي المنطقيات تنشط
 *  GET  /api/logics/neural/state             → حالة الشبكة العصبية الحالية
 *  GET  /api/logics/neural/map               → خريطة الاتصالات السينابتية
 *  POST /api/logics/neural/train             → تدريب الشبكة على مثال جديد
 *  POST /api/logics/neural/train/batch       → تدريب دُفعي
 *  POST /api/logics/neural/save              → حفظ أوزان الشبكة
 *  POST /api/logics/neural/reset             → إعادة ضبط الشبكة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const express = require('express');
const router  = express.Router();

const {
    ALL_LOGICS,
    MASTER_LOGIC,
    LOGIC_TYPES,
    SCOPE_TYPES,
    LogicActivationRecord,
    getLogicById,
    getAllLogics,
    getLogicScope,
    getScopeView,
    getLogicsStats
} = require('../models/SheikhaLogics');

const {
    getNetwork,
    encodeContext,
    N_LOGICS
} = require('../models/LogicNeuralNetwork');

// ─── قائمة المنطق الجامع ──────────────────────────────────────────────────────

router.get('/', (req, res) => {
    const { status, category } = req.query;

    const allowedStatuses    = ['active', 'suspended', 'review'];
    const allowedCategories  = ['core', 'extended', 'all', 'master'];

    if (status && !allowedStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: `قيمة status غير صحيحة. المقبول: ${allowedStatuses.join(' | ')}`
        });
    }

    if (category && !allowedCategories.includes(category)) {
        return res.status(400).json({
            success: false,
            message: `قيمة category غير صحيحة. المقبول: ${allowedCategories.join(' | ')}`
        });
    }

    const logics = getAllLogics(status || null, category || null);

    res.json({
        success:    true,
        bismillah:  'بسم الله الرحمن الرحيم',
        title:      'المنطق الجامع لمنظومة شيخة',
        totalLogics: ALL_LOGICS.length,
        masterLogic: MASTER_LOGIC.id,
        count:      logics.length,
        category:   category || 'all',
        scopes:     Object.values(SCOPE_TYPES),
        logics:     logics.map(l => ({
            id:          l.id,
            nameAr:      l.nameAr,
            nameEn:      l.nameEn,
            icon:        l.icon,
            status:      l.status,
            version:     l.version,
            category:    l.category || 'core',
            description: l.description,
            principlesCount: l.principles ? l.principles.length : l.supremePrinciples ? l.supremePrinciples.length : 0,
            scopesList:  l.scopes ? Object.keys(l.scopes) : []
        }))
    });
});

// ─── إحصائيات المنطق الجامع ───────────────────────────────────────────────────

router.get('/stats', (req, res) => {
    const stats = getLogicsStats();

    res.json({
        success: true,
        title:   'إحصائيات المنطق الجامع — منظومة شيخة',
        stats
    });
});

// ─── قائمة النطاقات ───────────────────────────────────────────────────────────

router.get('/scopes', (req, res) => {
    res.json({
        success: true,
        title:   'النطاقات الثلاثة للمنطق الجامع',
        count:   Object.keys(SCOPE_TYPES).length,
        scopes: [
            {
                id:      SCOPE_TYPES.PLATFORM,
                nameAr:  'منصة شيخة',
                nameEn:  'Sheikha Platform',
                icon:    '🌐',
                desc:    'المنصة الجامعة التي تُوحِّد جميع المنظمات والأسواق'
            },
            {
                id:      SCOPE_TYPES.ORGANIZATION,
                nameAr:  'منظمة شيخة',
                nameEn:  'Sheikha Organization',
                icon:    '🏛️',
                desc:    'الهيكل المؤسسي والتنظيمي لمنظومة شيخة'
            },
            {
                id:      SCOPE_TYPES.MARKET,
                nameAr:  'سوق شيخة',
                nameEn:  'Sheikha Market',
                icon:    '🏪',
                desc:    'البيئة التجارية والأسواق الحقيقية والإلكترونية والرقمية'
            }
        ]
    });
});

// ─── سجلات التفعيل ───────────────────────────────────────────────────────────

router.get('/activations', (req, res) => {
    const { logicId, scopeId, entityType, status, limit, offset } = req.query;

    const query = {};
    if (logicId)     query.logicId    = logicId;
    if (scopeId)     query.scopeId    = scopeId;
    if (entityType)  query.entityType = entityType;
    if (status)      query.status     = status;

    const all = LogicActivationRecord.find(query);

    const parsedOffset = Math.max(0, parseInt(offset, 10) || 0);
    const parsedLimit  = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const records      = all.slice(parsedOffset, parsedOffset + parsedLimit);

    res.json({
        success: true,
        total:   all.length,
        offset:  parsedOffset,
        limit:   parsedLimit,
        count:   records.length,
        activations: records
    });
});

// ─── عرض نطاق عبر جميع المنطق ────────────────────────────────────────────────

router.get('/scope/:scopeId', (req, res) => {
    const { scopeId } = req.params;

    const scopeNames = {
        platform:     'منصة شيخة',
        organization: 'منظمة شيخة',
        market:       'سوق شيخة'
    };

    if (!Object.values(SCOPE_TYPES).includes(scopeId)) {
        return res.status(400).json({
            success: false,
            message: `النطاق غير صحيح. المقبول: ${Object.values(SCOPE_TYPES).join(' | ')}`
        });
    }

    const view = getScopeView(scopeId);

    res.json({
        success:  true,
        scopeId,
        scopeNameAr: scopeNames[scopeId] || scopeId,
        title:    `المنطق الجامع في نطاق: ${scopeNames[scopeId] || scopeId}`,
        count:    view.length,
        logics:   view
    });
});

// ─── المنطق الأعلى الجامع ────────────────────────────────────────────────────

router.get('/master', (req, res) => {
    const activations = LogicActivationRecord.find({ logicId: MASTER_LOGIC.id });

    res.json({
        success:      true,
        bismillah:    'بسم الله الرحمن الرحيم',
        tawheed:      MASTER_LOGIC.declaration.arabic,
        title:        'المنطق الأعلى الجامع — أقوى منطق في الوجود',
        masterLogic:  MASTER_LOGIC,
        activationsCount: activations.length,
        note: 'تفعيل المنطق الأعلى يُفعِّل جميع المنطقيات الـ ' + ALL_LOGICS.length + ' تلقائياً'
    });
});

// ─── فئات المنطق ──────────────────────────────────────────────────────────────

router.get('/categories', (req, res) => {
    res.json({
        success: true,
        title:   'فئات المنطق الجامع — منظومة شيخة',
        count:   3,
        categories: [
            {
                id:      'core',
                nameAr:  'المنطق السباعي الأصلي',
                nameEn:  'Core Seven Logics',
                icon:    '🔷',
                count:   7,
                logics:  ['organizational', 'legislative', 'commercial', 'scientific', 'research', 'technical', 'technological']
            },
            {
                id:      'extended',
                nameAr:  'المنطق الموسّع',
                nameEn:  'Extended Logics',
                icon:    '🔶',
                count:   ALL_LOGICS.length - 7,
                logics:  ALL_LOGICS.slice(7).map(l => l.id)
            },
            {
                id:      'master',
                nameAr:  'المنطق الأعلى',
                nameEn:  'Supreme Master Logic',
                icon:    '☀️',
                count:   1,
                logics:  ['master']
            }
        ],
        grandTotal: ALL_LOGICS.length + 1
    });
});

router.get('/:id', (req, res) => {
    const logic = getLogicById(req.params.id);

    if (!logic) {
        return res.status(404).json({
            success: false,
            message: 'المنطق غير موجود',
            available: Object.values(LOGIC_TYPES)
        });
    }

    // سجلات التفعيل لهذا المنطق
    const allActivations = LogicActivationRecord.find({ logicId: logic.id });

    const parsedOffset = Math.max(0, parseInt(req.query.offset, 10) || 0);
    const parsedLimit  = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const activations  = allActivations.slice(parsedOffset, parsedOffset + parsedLimit);

    res.json({
        success: true,
        logic,
        activationsTotal: allActivations.length,
        offset:    parsedOffset,
        limit:     parsedLimit,
        activations
    });
});

// ─── تطبيق منطق في نطاق محدد ──────────────────────────────────────────────────

router.get('/:id/scope/:scopeId', (req, res) => {
    const { id, scopeId } = req.params;

    const logic = getLogicById(id);
    if (!logic) {
        return res.status(404).json({
            success: false,
            message: 'المنطق غير موجود',
            available: Object.values(LOGIC_TYPES)
        });
    }

    if (!Object.values(SCOPE_TYPES).includes(scopeId)) {
        return res.status(400).json({
            success: false,
            message: `النطاق غير صحيح. المقبول: ${Object.values(SCOPE_TYPES).join(' | ')}`
        });
    }

    const scope = getLogicScope(id, scopeId);

    res.json({
        success:   true,
        logicId:   logic.id,
        logicNameAr: logic.nameAr,
        logicIcon:   logic.icon,
        scopeId,
        scope,
        principles: logic.principles,
        shariaRef:  logic.shariaRef
    });
});

// ─── تسجيل تفعيل منطق لكيان ──────────────────────────────────────────────────

router.post('/:id/activate', (req, res) => {
    const logic = getLogicById(req.params.id);

    if (!logic) {
        return res.status(404).json({
            success: false,
            message: 'المنطق غير موجود',
            available: Object.values(LOGIC_TYPES)
        });
    }

    if (logic.status !== 'active') {
        return res.status(403).json({
            success: false,
            message: `المنطق "${logic.nameAr}" غير مفعَّل حالياً`
        });
    }

    const { scopeId, entityId, entityType, activatedBy, notes } = req.body;

    if (!scopeId || !Object.values(SCOPE_TYPES).includes(scopeId)) {
        return res.status(400).json({
            success: false,
            message: `scopeId مطلوب. المقبول: ${Object.values(SCOPE_TYPES).join(' | ')}`
        });
    }

    // التحقق من عدم وجود تفعيل مسبق للكيان ذاته
    if (entityId) {
        const existing = LogicActivationRecord.find({
            logicId:    logic.id,
            scopeId,
            entityId,
            status:     'active'
        });
        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'هذا المنطق مُفعَّل مسبقاً لهذا الكيان',
                existing: existing[0]
            });
        }
    }

    const record = LogicActivationRecord.create({
        logicId:    logic.id,
        scopeId,
        entityId:   entityId   || null,
        entityType: entityType || null,
        status:     'active',
        activatedBy: activatedBy || null,
        notes:      notes || ''
    });

    res.status(201).json({
        success:  true,
        message:  `تم تفعيل "${logic.nameAr}" في نطاق "${scopeId}" بنجاح — بسم الله`,
        record,
        logic: {
            id:      logic.id,
            nameAr:  logic.nameAr,
            icon:    logic.icon,
            scope:   logic.scopes[scopeId] || null
        }
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 الشبكة العصبية لكل أنواع المنطق بالكون
//    "وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا" — البقرة: 31
// ═══════════════════════════════════════════════════════════════════════════════

// ─── استدلال: أي المنطقيات تنشط في السياق المعطى ─────────────────────────────

router.post('/neural/infer', (req, res) => {
    const { context = '', inputVector, scope } = req.body;

    // بناء متجه الإدخال
    let vec;
    if (inputVector && Array.isArray(inputVector) && inputVector.length >= N_LOGICS) {
        vec = inputVector.slice(0, N_LOGICS).map(v => Math.max(0, Math.min(1, Number(v) || 0)));
    } else if (context) {
        vec = encodeContext(context);
    } else {
        vec = new Array(N_LOGICS).fill(0.5);
    }

    const net    = getNetwork();
    const result = net.infer(vec, context);

    // فلترة حسب النطاق إن طُلب
    let allResults = result.allResults;
    if (scope && ['core', 'extended'].includes(scope)) {
        allResults = allResults.filter(r => r.category === scope);
    }

    res.json({
        success:      true,
        bismillah:    'بسم الله الرحمن الرحيم',
        tawheed:      'لَا إِلَٰهَ إِلَّا اللَّهُ — المنطق الأعلى الجامع',
        inferenceId:  result.id,
        context:      context || '(غير محدد)',
        timestamp:    result.timestamp,
        masterActivation: result.masterActivation,
        masterFiring: result.masterFiring,
        topLogics:    result.topLogics,
        top5: allResults.slice(0, 5).map(r => ({
            id:         r.id,
            nameAr:     r.nameAr,
            icon:       r.icon,
            activation: r.activation,
            rank:       r.rank,
            firing:     r.neuronFiring
        })),
        allResults,
        networkStats: {
            totalInferences: net.totalInferences,
            trainedSteps:    net.trainedSteps
        }
    });
});

// ─── حالة الشبكة العصبية ─────────────────────────────────────────────────────

router.get('/neural/state', (req, res) => {
    const net   = getNetwork();
    const state = net.getState();

    res.json({
        success:      true,
        bismillah:    'بسم الله الرحمن الرحيم',
        title:        'الشبكة العصبية لكل أنواع المنطق بالكون',
        description:  'شبكة عصبية حقيقية بجافاسكربت نقي — تجمع 21 منطقاً في منظومة عصبية واحدة',
        architecture: state.architecture,
        masterNeuron: state.masterNeuron,
        neurons:      state.neurons,
        trainedSteps: state.trainedSteps,
        totalInferences: state.totalInferences,
        masterShield: state.masterShield,
        lastInference: state.lastInference,
        layers: [
            { name: 'InputLayer',  size: state.architecture.inputSize,   desc: 'طبقة الإدخال (21 بُعد — واحد لكل منطق)' },
            { name: 'CoreLayer',   size: state.architecture.coreLayers,  desc: 'طبقة المنطق الأصلي السباعي' },
            { name: 'ExtLayer',    size: state.architecture.extLayers,   desc: 'طبقة المنطق الموسّع' },
            { name: 'SynthLayer',  size: state.architecture.synthLayers, desc: 'طبقة التكامل الكامل' },
            { name: 'MasterLayer', size: state.architecture.masterUnits, desc: 'طبقة المنطق الأعلى — التوحيد' }
        ]
    });
});

// ─── خريطة الاتصالات السينابتية ──────────────────────────────────────────────

router.get('/neural/map', (req, res) => {
    const net = getNetwork();
    const map = net.getSynapticMap();

    res.json({
        success:     true,
        bismillah:   'بسم الله الرحمن الرحيم',
        title:       'خريطة الاتصالات السينابتية للمنطق الكوني',
        description: 'يُظهر اتصالات الشبكة العصبية بين كل منطقين — الوزن = قوة الارتباط الدلالي',
        totalNodes:  map.totalNodes,
        totalEdges:  map.totalEdges,
        nodes:       map.nodes,
        edges:       map.edges
    });
});

// ─── تدريب الشبكة على مثال واحد ─────────────────────────────────────────────

router.post('/neural/train', (req, res) => {
    const { inputVector, targetVector, context = '', learningRate } = req.body;

    if (!inputVector || !Array.isArray(inputVector)) {
        return res.status(400).json({
            success: false,
            message: 'inputVector مطلوب — مصفوفة أرقام بطول 20'
        });
    }

    if (!targetVector || !Array.isArray(targetVector)) {
        return res.status(400).json({
            success: false,
            message: 'targetVector مطلوب — مصفوفة أرقام بطول 20 (قيم 0 أو 1)'
        });
    }

    const lr    = Math.max(0.0001, Math.min(0.1, Number(learningRate) || 0.001));
    const net   = getNetwork();
    const loss  = net.train(
        inputVector.map(v => Number(v) || 0),
        targetVector.map(v => Number(v) || 0),
        lr
    );

    res.json({
        success:      true,
        message:      'تم التدريب بنجاح — الشبكة تتعلم',
        context:      context || '(غير محدد)',
        loss,
        trainedSteps: net.trainedSteps,
        learningRate: lr
    });
});

// ─── تدريب دُفعي ─────────────────────────────────────────────────────────────

router.post('/neural/train/batch', (req, res) => {
    const { samples, learningRate } = req.body;

    if (!samples || !Array.isArray(samples) || samples.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'samples مطلوب — مصفوفة [{inputVector, targetVector}, ...]'
        });
    }

    const lr      = Math.max(0.0001, Math.min(0.1, Number(learningRate) || 0.001));
    const net     = getNetwork();
    const losses  = [];
    let   skipped = 0;

    for (const sample of samples) {
        if (!sample.inputVector || !sample.targetVector) { skipped++; continue; }
        const loss = net.train(
            sample.inputVector.map(v => Number(v) || 0),
            sample.targetVector.map(v => Number(v) || 0),
            lr
        );
        if (loss !== null) losses.push(loss);
    }

    const avgLoss = losses.length > 0
        ? +(losses.reduce((a, b) => a + b, 0) / losses.length).toFixed(6)
        : null;

    res.json({
        success:       true,
        message:       `تم التدريب على ${losses.length} مثال`,
        samplesTotal:  samples.length,
        samplesUsed:   losses.length,
        skipped,
        avgLoss,
        trainedSteps:  net.trainedSteps,
        learningRate:  lr
    });
});

// ─── حفظ أوزان الشبكة ────────────────────────────────────────────────────────

router.post('/neural/save', (req, res) => {
    const net    = getNetwork();
    const saved  = net.save();

    res.json({
        success:      true,
        message:      'تم حفظ أوزان الشبكة العصبية — الحمد لله',
        trainedSteps: net.trainedSteps,
        savedAt:      saved.savedAt
    });
});

// ─── إعادة ضبط الشبكة ─────────────────────────────────────────────────────────

router.post('/neural/reset', (req, res) => {
    const net = getNetwork();
    net.reset();

    res.json({
        success:  true,
        message:  'تمت إعادة ضبط الشبكة العصبية — أوزان جديدة عشوائية',
        warning:  'التدريب السابق ضاع — احفظ الأوزان قبل الإعادة'
    });
});

module.exports = router;
