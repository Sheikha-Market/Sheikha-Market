/**
 * بسم الله الرحمن الرحيم
 * مسارات API المنظومة المتكاملة للبكسل الذكي
 */

'use strict';

const express = require('express');
const router = express.Router();

let ecosystem = null;

// تحميل المنظومة
try {
    const ecosystemModule = require('../lib/sheikha-pixel-ai-ecosystem');
    ecosystem = ecosystemModule.createEcosystem();
    console.log('[PIXEL-API] ✅ تم تحميل منظومة البكسل الذكية');
} catch (err) {
    console.warn('[PIXEL-API] ⚠️  تحذير:', err.message);
}

// ─── تهيئة المنظومة ─────────────────────────────────────────────────────────

router.post('/ecosystem/init', (req, res) => {
    if (!ecosystem) {
        return res.status(503).json({
            success: false,
            message: 'المنظومة غير متاحة'
        });
    }

    try {
        const status = ecosystem.getEcosystemStatus();
        return res.json({
            success: true,
            status: 'initialized',
            data: status
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// ─── وظائف AI Engine ───────────────────────────────────────────────────────

router.post('/ai/train', async (req, res) => {
    if (!ecosystem) {
        return res.status(503).json({
            success: false,
            message: 'منظومة البكسل غير متاحة'
        });
    }

    try {
        const { trainingData, modelName } = req.body;

        if (!trainingData || !Array.isArray(trainingData)) {
            return res.status(400).json({
                success: false,
                message: 'بيانات التدريب مطلوبة'
            });
        }

        const model = await ecosystem.aiEngine.trainModel(trainingData, modelName || 'default');

        return res.json({
            success: true,
            data: model
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

router.post('/ai/predict', (req, res) => {
    if (!ecosystem) {
        return res.status(503).json({ success: false, message: 'غير متاح' });
    }

    try {
        const { input, modelName } = req.body;
        const prediction = ecosystem.aiEngine.predict(input, modelName);

        return res.json({
            success: true,
            data: prediction
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/ai/models', (req, res) => {
    if (!ecosystem) {
        return res.status(503).json({ success: false });
    }

    const models = Array.from(ecosystem.aiEngine.models.entries()).map(([name, model]) => ({
        name,
        accuracy: model.accuracy,
        samples: model.samples,
        trainedAt: model.trainedAt
    }));

    return res.json({ success: true, data: models });
});

// ─── وظائف LLM Bridge ──────────────────────────────────────────────────────

router.post('/llm/generate-prompt', (req, res) => {
    if (!ecosystem) {
        return res.status(503).json({ success: false });
    }

    try {
        const { pixel, context } = req.body;

        const mockPixel = pixel || { id: 'pixel-001', data: {} };
        const prompt = ecosystem.llmBridge.generatePrompt(mockPixel, context);

        return res.json({ success: true, data: prompt });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/llm/process-response', (req, res) => {
    if (!ecosystem) {
        return res.status(503).json({ success: false });
    }

    try {
        const { promptId, aiResponse } = req.body;

        const prompt = ecosystem.llmBridge.prompts.get(promptId);
        if (!prompt) {
            return res.status(404).json({
                success: false,
                message: 'الـ Prompt غير موجود'
            });
        }

        const processed = ecosystem.llmBridge.processLLMResponse(prompt, aiResponse);

        return res.json({ success: true, data: processed });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// ─── وظائف Generation Engine ───────────────────────────────────────────────

router.post('/generation/generate', async (req, res) => {
    if (!ecosystem) {
        return res.status(503).json({ success: false });
    }

    try {
        const { template, count, options } = req.body;

        const generated = await ecosystem.generationEngine.generatePixels(
            template || 'product',
            count || 10,
            options
        );

        return res.json({
            success: true,
            data: {
                generated: generated.length,
                pixels: generated.map(p => p.getState())
            }
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/generation/stats', (req, res) => {
    if (!ecosystem) {
        return res.status(503).json({ success: false });
    }

    const stats = ecosystem.generationEngine.getGenerationStats();
    return res.json({ success: true, data: stats });
});

// ─── وظائف Tools Manager ───────────────────────────────────────────────────

router.post('/tools/execute', (req, res) => {
    if (!ecosystem) {
        return res.status(503).json({ success: false });
    }

    try {
        const { toolName, args } = req.body;

        const result = ecosystem.toolsManager.executeTool(toolName, ...args);

        return res.json({
            success: true,
            data: result
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/tools/list', (req, res) => {
    if (!ecosystem) {
        return res.status(503).json({ success: false });
    }

    const tools = Array.from(ecosystem.toolsManager.tools.keys());
    return res.json({ success: true, data: { tools, count: tools.length } });
});

// ─── وظائف Scripts ─────────────────────────────────────────────────────────

router.post('/scripts/execute', async (req, res) => {
    if (!ecosystem) {
        return res.status(503).json({ success: false });
    }

    try {
        const { scriptName, context } = req.body;

        const result = await ecosystem.toolsManager.executeScript(scriptName, context);

        return res.json({
            success: true,
            data: result
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/scripts/list', (req, res) => {
    if (!ecosystem) {
        return res.status(503).json({ success: false });
    }

    const scripts = Array.from(ecosystem.toolsManager.scripts.keys());
    return res.json({ success: true, data: { scripts, count: scripts.length } });
});

// ─── الحصول على حالة المنظومة ────────────────────────────────────────────

router.get('/status', (req, res) => {
    if (!ecosystem) {
        return res.status(503).json({
            success: false,
            status: 'unavailable'
        });
    }

    const status = ecosystem.getEcosystemStatus();
    return res.json({
        success: true,
        status: 'active',
        data: status
    });
});

// ─── الـ Dashboard ──────────────────────────────────────────────────────────

router.get('/dashboard', (req, res) => {
    if (!ecosystem) {
        return res.status(503).json({ success: false });
    }

    const status = ecosystem.getEcosystemStatus();

    return res.json({
        success: true,
        dashboard: {
            title: 'لوحة تحكم منظومة البكسل الذكية',
            timestamp: new Date().toISOString(),
            components: status,
            systemHealth: {
                aiEngine: 'ready',
                llmBridge: 'connected',
                generationEngine: 'active',
                toolsManager: 'operational'
            }
        }
    });
});

module.exports = router;
