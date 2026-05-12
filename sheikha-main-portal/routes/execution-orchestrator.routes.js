/**
 * 🕋 Execution Orchestrator Routes
 * مسارات محرك القرار التنفيذي
 */

const express = require('express');
const path = require('node:path');
const router = express.Router();
const { ExecutionOrchestrator, EXECUTION_MODES, ACTIONS } = require('../lib/sheikha-execution-orchestrator');
const { SheikhaNeuralOrchestrator } = require('../lib/sheikha-neural-orchestrator');
const { sheikhaRealtimeHub } = require('../lib/sheikha-realtime-hub');

// إنشاء instance واحد للتطبيق كله
const orchestrator = new ExecutionOrchestrator();
const neuralOrchestrator = new SheikhaNeuralOrchestrator(path.join(__dirname, '..'));

/**
 * GET /api/execution-orchestrator/state
 * عرض الحالة الحالية + آخر قرار
 */
router.get('/state', async (req, res) => {
    try {
        const status = orchestrator.getStatus();
        const log = await orchestrator.getExecutionLog();

        res.json({
            ok: true,
            timestamp: new Date().toISOString(),
            currentMode: status.currentMode,
            activeActions: status.activeActions,
            lastDecision: status.lastDecision,
            executionsCount: log.length,
            lastExecution: log.length > 0 ? log[log.length - 1] : null
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            error: error.message
        });
    }
});

/**
 * POST /api/execution-orchestrator/run
 * تشغيل dحلة واحدة من Decision → Execution
 * يتقبل: stateData من orchestrator/state
 */
router.post('/run', async (req, res) => {
    try {
        const stateData = req.body.stateData || {};

        // 1. قراءة حالة النظام
        const systemState = await orchestrator.readSystemState(stateData);

        if (!systemState) {
            return res.status(400).json({
                ok: false,
                error: 'فشل في قراءة حالة النظام'
            });
        }

        // 2. تحليل الحالة واتخاذ قرار
        const decision = orchestrator.analyzeAndDecide(systemState);

        // 3. تنفيذ القرار
        const executionResult = await orchestrator.executeDecision(decision);

        sheikhaRealtimeHub.emitEvent('orchestrator.mode.changed', {
            mode: decision.mode,
            actions: decision.actions,
            reasoning: decision.reasoning,
            source: 'run'
        });

        res.json({
            ok: true,
            timestamp: new Date().toISOString(),
            systemState: {
                alerts: systemState.alertCount,
                gitDirty: systemState.gitDirty,
                orders: systemState.orders,
                supply: systemState.supply,
                supplyGap: systemState.supplyGap
            },
            decision: {
                mode: decision.mode,
                reasoning: decision.reasoning,
                actions: decision.actions,
                priority: decision.priority
            },
            execution: {
                success: executionResult.success,
                actionsExecuted: executionResult.actions,
                executedAt: executionResult.executedAt
            }
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            error: error.message
        });
    }
});

/**
 * POST /api/execution-orchestrator/auto
 * تشغيل دوري تلقائي — يقرأ البيانات الحقيقية من data/orders.json و data/supply.json
 */
router.post('/auto', async (req, res) => {
    try {
        // نمرر فقط ما جاء صريحاً في الطلب، وما لم يُمرَّر يُقرأ من الملفات الحقيقية
        const stateData = {};
        if (req.body.alerts !== undefined)   stateData.alerts   = req.body.alerts;
        if (req.body.gitDirty !== undefined) stateData.gitDirty = req.body.gitDirty;
        if (req.body.orders !== undefined)   stateData.orders   = req.body.orders;
        if (req.body.supply !== undefined)   stateData.supply   = req.body.supply;
        if (req.body.contracts !== undefined) stateData.contracts = req.body.contracts;
        if (req.body.users !== undefined)    stateData.users    = req.body.users;
        if (req.body.traders !== undefined)  stateData.traders  = req.body.traders;

        const systemState = await orchestrator.readSystemState(stateData);
        const decision = orchestrator.analyzeAndDecide(systemState);
        const executionResult = await orchestrator.executeDecision(decision);

        sheikhaRealtimeHub.emitEvent('orchestrator.mode.changed', {
            mode: decision.mode,
            actions: decision.actions,
            reasoning: decision.reasoning,
            source: 'auto'
        });

        res.json({
            ok: true,
            timestamp: new Date().toISOString(),
            mode: decision.mode,
            reasoning: decision.reasoning,
            actions: decision.actions,
            systemState: {
                orders: systemState.orders,
                supply: systemState.supply,
                supplyGap: systemState.supplyGap,
                contracts: systemState.contracts,
                alerts: systemState.alertCount
            },
            actionsExecuted: executionResult.actions.length,
            executionSuccess: executionResult.success
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            error: error.message
        });
    }
});

/**
 * POST /api/execution-orchestrator/manual
 * تنفيذ إجراء يدوي محدد
 * Body: { action: "ACTIVATE_PM1" }
 */
router.post('/manual', async (req, res) => {
    try {
        const { action } = req.body;

        if (!action) {
            return res.status(400).json({
                ok: false,
                error: 'يجب تحديد الإجراء (action)'
            });
        }

        const result = await orchestrator.executeAction(action);

        sheikhaRealtimeHub.emitEvent('orchestrator.mode.changed', {
            mode: orchestrator.getStatus().currentMode,
            actions: [action],
            reasoning: [result.message],
            source: 'manual'
        });

        res.json({
            ok: true,
            timestamp: new Date().toISOString(),
            action: result.action,
            status: result.status,
            message: result.message
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            error: error.message
        });
    }
});

/**
 * GET /api/execution-orchestrator/log
 * عرض سجل التنفيذات (آخر 100 إدخال)
 */
router.get('/log', async (req, res) => {
    try {
        const limit = Number.parseInt(req.query.limit, 10) || 20;
        const log = await orchestrator.getExecutionLog();

        // أحدث الإدخالات أولاً
        const recentLog = log.reverse().slice(0, limit);

        res.json({
            ok: true,
            timestamp: new Date().toISOString(),
            total: log.length,
            returned: recentLog.length,
            log: recentLog
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            error: error.message
        });
    }
});

/**
 * GET /api/execution-orchestrator/blueprint
 * عرض مخطط التفعيل التنفيذي الموحد
 */
router.get('/blueprint', (req, res) => {
    try {
        const blueprint = neuralOrchestrator.getBlueprint();
        const status = neuralOrchestrator.getUnifiedStatus();

        res.json({
            success: true,
            data: {
                blueprint,
                status
            },
            message: 'تم جلب مخطط التفعيل التنفيذي الموحد',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            data: null,
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * GET /api/execution-orchestrator/cells-health
 * عرض جاهزية الخلايا التشغيلية
 */
router.get('/cells-health', (req, res) => {
    try {
        const health = neuralOrchestrator.getCellsHealth();

        res.json({
            success: true,
            data: health,
            message: 'تم جلب حالة الخلايا التشغيلية',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            data: null,
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * GET /api/execution-orchestrator/modes
 * عرض الأوضاع المتاحة
 */
router.get('/modes', (req, res) => {
    res.json({
        ok: true,
        timestamp: new Date().toISOString(),
        modes: Object.values(EXECUTION_MODES),
        actions: Object.values(ACTIONS),
        currentMode: orchestrator.getStatus().currentMode
    });
});

/**
 * POST /api/execution-orchestrator/reset
 * إعادة تعيين الحالة
 */
router.post('/reset', (req, res) => {
    orchestrator.reset();

    res.json({
        ok: true,
        timestamp: new Date().toISOString(),
        message: 'تم إعادة تعيين Orchestrator إلى الحالة الأولية',
        newMode: orchestrator.getStatus().currentMode
    });
});

// تصدير مرن: يدعم app.use(route) و app.use(route.router)
module.exports = router;
module.exports.router = router;
module.exports.orchestrator = orchestrator;
