/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🤖 مسارات الذكاء الاصطناعي — الإصدار المتقدم
 *  AI Routes v3.0 — RAG + Agents + Function Calling + Production Ready
 * ═══════════════════════════════════════════════════════════════════════════════
 *  "وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ وَرَسُولُهُ وَالْمُؤْمِنُونَ"
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const SheikhaOllamaOrchestrator = require('../lib/sheikha-ollama-orchestrator');

// ─── استيراد المحركات الأساسية ───────────────────────────────────────────────
let SheikaAIEngine = null;
let DevelopmentEngine = null;
let localMind = null;
const enableLocalMindBoot = String(process.env.SHEIKHA_LOCALMIND_BOOT || '').toLowerCase() === '1' ||
    String(process.env.SHEIKHA_LOCALMIND_BOOT || '').toLowerCase() === 'true';

try { SheikaAIEngine = require('../lib/sheikha-ai-engine'); } catch (e) {
    console.warn('⚠️ محرك ذكاء شيخة غير متوفر');
}
try { DevelopmentEngine = require('../lib/development-engine'); } catch (e) {
    console.warn('⚠️ محرك التطوير غير متوفر');
}

// ─── العقل المحلي المستقل (Neural + Lexicon + Language Model) ────────────────
// ملاحظة: الإقلاع الافتراضي بدون تدريب LocalMind لتقليل استهلاك الذاكرة في بيئات التطوير.
if (enableLocalMindBoot) {
    try {
        const { SheikhaLocalMind } = require('../lib/sheikha-local-mind');
        localMind = new SheikhaLocalMind();
        localMind.initialize().then(() => {
            console.log('✅ [LocalMind] عقل شيخة المحلي — جاهز ومُدرَّب | بدون API خارجي');
        }).catch(e => {
            console.warn('⚠️ [LocalMind] خطأ في التهيئة:', e.message);
        });
    } catch (e) {
        console.warn('⚠️ [LocalMind] العقل المحلي غير متوفر:', e.message);
    }
} else {
    console.log('⏸️ [LocalMind] تهيئة الإقلاع معطّلة (اضبط SHEIKHA_LOCALMIND_BOOT=true للتفعيل)');
}

// ─── استيراد منظومة RAG والوكلاء ─────────────────────────────────────────────
let SheikhaRAGEngine = null;
let AgentSystem = null;
let ragEngine = null;
let agentOrchestrator = null;
let productionMonitor = null;
let islamicGuardrails = null;
const ollamaOrchestrator = new SheikhaOllamaOrchestrator({
    ollamaHost: config.ai?.ollama?.host
});
if (config.ai?.ollama?.enabled && config.ai?.ollama?.autoUpdate) {
    ollamaOrchestrator.startAutoSync();
}

try {
    SheikhaRAGEngine = require('../lib/sheikha-rag-engine');
    AgentSystem = require('../lib/sheikha-agent-system');

    // تهيئة محرك RAG
    ragEngine = new SheikhaRAGEngine({
        chunking: { chunkSize: 512, chunkOverlap: 64 },
        topK: 5,
        minScore: 0.08,
        includeIslamicContext: true
    });

    // تهيئة مراقب الإنتاج
    productionMonitor = new AgentSystem.ProductionMonitor();

    // تهيئة حواجز الأمان الشرعية
    islamicGuardrails = new AgentSystem.IslamicGuardrails();

    // تهيئة منسق الوكلاء
    agentOrchestrator = new AgentSystem.AgentOrchestrator(ragEngine);

    // ─── إدخال المعرفة في محرك RAG ──────────────────────────────────────
    // 1. المعرفة المحلية من sheikha-ai.js
    try {
        const localAI = require('../lib/sheikha-ai');
        if (localAI && typeof localAI === 'object') {
            // إذا كان كائن معرفي
            if (localAI.KNOWLEDGE_BASE) {
                ragEngine.ingestKnowledge(localAI.KNOWLEDGE_BASE, 'metals', 'sheikha-ai');
            }
        }
    } catch (e) { /* المعرفة المحلية اختيارية */ }

    // 2. المعرفة الإسلامية
    try {
        const QuranSunnahEngine = require('../lib/sheikha-quran-sunnah-engine');
        const qsEngine = new QuranSunnahEngine();
        ragEngine.ingestIslamicKnowledge(qsEngine);
    } catch (e) { /* المعرفة الإسلامية اختيارية */ }

    // 3. معرفة السوق والمعادن
    ragEngine.ingest(
        `المعادن الرئيسية في سوق شيخة: الحديد والنحاس والألمنيوم والذهب والفضة والرصاص والزنك والقصدير.
        السوق السعودي للمعادن يخضع لهيئة السوق المالية وعدة جهات تنظيمية.
        التسعير يعتمد على العرض والطلب — والعرض والطلب بتقدير الله سبحانه وتعالى.
        أسعار LME (بورصة لندن للمعادن) هي المرجع العالمي لأسعار المعادن الأساسية.
        إعادة التدوير توفر 74% من الطاقة للحديد و85% للنحاس و95% للألمنيوم.
        السكراب يشمل: HMS1, HMS2, حديد مفروم, نحاس Berry, نحاس Birch, سكراب إلكتروني.
        شيخة منصة رائدة في تجارة المعادن والسكراب بالمملكة العربية السعودية.`,
        'market', { source: 'core-knowledge', topic: 'metals-market' }
    );

    console.log('✅ [AI] منظومة RAG + الوكلاء + الأدوات — جاهزة للإنتاج');
    console.log(`   📊 قطع المعرفة: ${ragEngine.getStats().vectorStore.totalChunks}`);
    console.log(`   🤖 وكلاء نشطين: ${Object.keys(agentOrchestrator.getStats().agents).length}`);
    console.log(`   🔧 أدوات مسجلة: ${Object.keys(agentOrchestrator.getStats().tools).length}`);

} catch (e) {
    console.warn('⚠️ [AI] خطأ في تهيئة RAG/Agents:', e.message);
}

// ─── تخزين سياق المحادثات (لميزة ضغط السياق) ──────────────────────────────
const conversationContexts = new Map();

// ─── حالة المحركات ────────────────────────────────────────────────────────────

router.get('/status', (req, res) => {
    const ollamaRec = ollamaOrchestrator.recommendedModels(ollamaOrchestrator.detectResources());
    res.json({
        success: true,
        engines: {
            ollama: {
                enabled: !!config.ai?.ollama?.enabled,
                host: config.ai?.ollama?.host,
                profile: config.ai?.ollama?.profile,
                autoUpdate: !!config.ai?.ollama?.autoUpdate,
                bestModel: ollamaRec.bestModel
            },
            openai: {
                enabled: !!config.ai.openai.apiKey,
                model: config.ai.openai.model
            },
            anthropic: {
                enabled: !!config.ai.anthropic.apiKey,
                model: config.ai.anthropic.model,
                version: config.ai.anthropic.version,
                releaseDate: config.ai.anthropic.releaseDate,
                features: {
                    adaptiveThinking: config.ai.anthropic.adaptiveThinking,
                    extendedContext: config.ai.anthropic.extendedContext,
                    contextCompaction: config.ai.anthropic.contextCompaction,
                    maxTokens: config.ai.anthropic.maxTokens
                },
                capabilities: config.ai.anthropic.capabilities
            },
            sheikhaAI: {
                enabled: !!SheikaAIEngine,
                features: SheikaAIEngine ? ['تحليل الشركات', 'التحليل اللغوي', 'الابتكار'] : []
            },
            development: {
                enabled: !!DevelopmentEngine,
                features: DevelopmentEngine ? ['تحليل الكود', 'توليد الكود', 'إصلاح الأخطاء'] : []
            },
            rag: {
                enabled: !!ragEngine,
                stats: ragEngine ? ragEngine.getStats() : null
            },
            agents: {
                enabled: !!agentOrchestrator,
                stats: agentOrchestrator ? agentOrchestrator.getStats() : null
            },
            production: {
                enabled: !!productionMonitor,
                metrics: productionMonitor ? productionMonitor.getMetrics() : null
            },
            islamicGuardrails: {
                enabled: !!islamicGuardrails
            }
        },
        routing: config.ai.routing,
        mode: config.ai.mode
    });
});

router.get('/model-strategy', (req, res) => {
    const resources = ollamaOrchestrator.detectResources();
    const recommendation = ollamaOrchestrator.recommendedModels(resources);
    res.json({
        success: true,
        data: {
            goal: 'تقوية ذكاء شيخة مع تحقيق المنفعة بلا ضرر',
            resources,
            bestOverall: {
                claude: 'claude-opus-4-6-20260205',
                openai: config.ai.openai.model || 'gpt-5.2',
                ollama: recommendation.bestModel,
                note: 'الأفضل يعتمد على نوع المهمة والموارد'
            },
            orchestration: {
                cursor: 'هندسة وتطوير الكود (Control Plane)',
                claude: 'استدلال عميق وتحليل معقد',
                openai: 'محادثة عامة وسرعة استجابة',
                ollama: 'تشغيل محلي وسيادة البيانات',
                localMind: 'هوية شيخة المعرفية الداخلية'
            },
            taskRouting: {
                sharia: ['claude', 'localMind', 'ollama'],
                development: ['claude', 'openai', 'ollama'],
                marketAnalysis: ['openai', 'claude', 'ollama'],
                privateData: ['ollama', 'localMind', 'claude'],
                fallback: ['ollama', 'localMind']
            },
            policy: SheikhaOllamaOrchestrator.policy()
        },
        timestamp: new Date().toISOString()
    });
});

// ─── Ollama Orchestrator APIs ────────────────────────────────────────────────
router.get('/ollama/resources', (req, res) => {
    const resources = ollamaOrchestrator.detectResources();
    res.json({
        success: true,
        data: resources,
        message: 'تم قياس موارد الخادم بنجاح',
        timestamp: new Date().toISOString()
    });
});

router.get('/ollama/recommendation', (req, res) => {
    const resources = ollamaOrchestrator.detectResources();
    const rec = ollamaOrchestrator.recommendedModels(resources);
    res.json({
        success: true,
        data: {
            resources,
            profile: rec.profile,
            bestModel: rec.bestModel,
            models: rec.models,
            policy: SheikhaOllamaOrchestrator.policy()
        },
        message: 'توصية النماذج حسب الموارد والسياسة الشرعية',
        timestamp: new Date().toISOString()
    });
});

router.get('/ollama/models', (req, res) => {
    const installed = ollamaOrchestrator.listInstalledModels();
    res.json({
        success: true,
        data: { installed },
        message: 'النماذج المثبتة محلياً',
        timestamp: new Date().toISOString()
    });
});

router.post('/ollama/sync', (req, res) => {
    const mode = String(req.body?.mode || 'plan');
    const dryRun = mode !== 'apply';
    const result = ollamaOrchestrator.syncModels({ dryRun });
    res.json({
        success: true,
        data: result,
        message: dryRun ? 'خطة مزامنة فقط (بدون تحميل)' : 'تم تنفيذ المزامنة',
        timestamp: new Date().toISOString()
    });
});

router.post('/model-router/plan', (req, res) => {
    const { message = '', context = '', forcedModel = 'auto' } = req.body || {};
    const taskType = detectTaskType(message);
    const sensitivity = detectSensitivity(message, context);
    const preferredModel = forcedModel !== 'auto' ? forcedModel : getPreferredModel(taskType);
    const modelPipeline = buildModelPipeline({
        forcedModel,
        preferredModel,
        taskType,
        sensitivity,
        hasClaude: !!config.ai.anthropic.apiKey,
        hasOpenAI: !!config.ai.openai.apiKey,
        hasOllama: !!config.ai?.ollama?.enabled
    });
    res.json({
        success: true,
        data: {
            taskType,
            sensitivity,
            preferredModel,
            modelPipeline,
            ollamaModel: selectOllamaModel(taskType, sensitivity),
            policy: SheikhaOllamaOrchestrator.policy()
        },
        timestamp: new Date().toISOString()
    });
});

router.get('/model-router/status', (req, res) => {
    const resources = ollamaOrchestrator.detectResources();
    const recommendation = ollamaOrchestrator.recommendedModels(resources);
    res.json({
        success: true,
        data: {
            cloud: {
                claude: !!config.ai.anthropic.apiKey,
                openai: !!config.ai.openai.apiKey
            },
            local: {
                ollama: !!config.ai?.ollama?.enabled,
                localMind: !!localMind
            },
            recommendation,
            policy: SheikhaOllamaOrchestrator.policy()
        },
        timestamp: new Date().toISOString()
    });
});

// ─── إدارة تكاملات النماذج (Model Registry) ───────────────────────────────────
const modelRegistryPath = path.join(__dirname, '..', 'data', 'ai-model-integrations.json');

function defaultModelRegistry() {
    return {
        autoRefreshEnabled: true,
        autoRefreshIntervalHours: 24,
        lastRefreshedAt: null,
        integrations: [
            {
                id: 'openai-primary',
                name: 'OpenAI Primary',
                provider: 'openai',
                model: config.ai?.openai?.model || 'gpt-5.2',
                llmLanguage: 'ar',
                devLanguage: 'javascript',
                baseUrl: 'https://api.openai.com/v1',
                apiKeyEnv: 'OPENAI_API_KEY',
                active: !!config.ai?.openai?.apiKey,
                autoUpgrade: true,
                notes: 'مسار المحادثة العامة والتحليلات',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'claude-development',
                name: 'Claude Development',
                provider: 'anthropic',
                model: config.ai?.anthropic?.model || 'claude-opus-4-6-20260205',
                llmLanguage: 'ar',
                devLanguage: 'javascript',
                baseUrl: 'https://api.anthropic.com/v1',
                apiKeyEnv: 'ANTHROPIC_API_KEY',
                active: !!config.ai?.anthropic?.apiKey,
                autoUpgrade: true,
                notes: 'أولوية المهام العميقة والتطوير',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'ollama-local',
                name: 'Ollama Local',
                provider: 'ollama',
                model: config.ai?.ollama?.defaultModel || 'qwen2.5-coder:14b',
                llmLanguage: 'ar',
                devLanguage: 'javascript',
                baseUrl: config.ai?.ollama?.host || 'http://127.0.0.1:11434',
                apiKeyEnv: '',
                active: !!config.ai?.ollama?.enabled,
                autoUpgrade: false,
                notes: 'تشغيل محلي وسيادة بيانات',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ]
    };
}

function loadModelRegistry() {
    try {
        if (!fs.existsSync(modelRegistryPath)) {
            const seed = defaultModelRegistry();
            fs.writeFileSync(modelRegistryPath, JSON.stringify(seed, null, 2), 'utf8');
            return seed;
        }
        const raw = fs.readFileSync(modelRegistryPath, 'utf8');
        const parsed = JSON.parse(raw || '{}');
        if (!Array.isArray(parsed.integrations)) parsed.integrations = [];
        return parsed;
    } catch (_) {
        return defaultModelRegistry();
    }
}

function saveModelRegistry(state) {
    fs.writeFileSync(modelRegistryPath, JSON.stringify(state, null, 2), 'utf8');
}

function buildModelRecommendations() {
    const resources = ollamaOrchestrator.detectResources();
    const ollamaRec = ollamaOrchestrator.recommendedModels(resources);
    return {
        openai: { recommended: 'gpt-5.3', reason: 'أداء أعلى في التخطيط والتطوير متعدد الخطوات' },
        anthropic: { recommended: 'claude-opus-4-6-20260205', reason: 'تحليل عميق واستدلال قوي' },
        ollama: { recommended: ollamaRec.bestModel, reason: 'موصى به حسب موارد الخادم الحالية' }
    };
}

router.get('/model-integrations', (req, res) => {
    const registry = loadModelRegistry();
    const recommendations = buildModelRecommendations();
    return res.json({
        success: true,
        data: {
            ...registry,
            recommendations
        },
        message: 'تم جلب سجل تكاملات النماذج',
        timestamp: new Date().toISOString()
    });
});

router.post('/model-integrations', (req, res) => {
    const {
        name,
        provider,
        model,
        baseUrl = '',
        apiKeyEnv = '',
        llmLanguage = 'ar',
        devLanguage = 'javascript',
        autoUpgrade = true,
        notes = ''
    } = req.body || {};

    if (!name || !provider || !model) {
        return res.status(400).json({
            success: false,
            message: 'الحقول المطلوبة: name, provider, model',
            timestamp: new Date().toISOString()
        });
    }

    const registry = loadModelRegistry();
    const id = `${String(provider).toLowerCase()}-${Date.now()}`;
    registry.integrations.push({
        id,
        name: String(name).trim(),
        provider: String(provider).trim().toLowerCase(),
        model: String(model).trim(),
        llmLanguage: String(llmLanguage).trim(),
        devLanguage: String(devLanguage).trim(),
        baseUrl: String(baseUrl).trim(),
        apiKeyEnv: String(apiKeyEnv).trim(),
        active: false,
        autoUpgrade: !!autoUpgrade,
        notes: String(notes).trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
    saveModelRegistry(registry);

    return res.json({
        success: true,
        data: { id },
        message: 'تمت إضافة نموذج جديد إلى سجل التكامل',
        timestamp: new Date().toISOString()
    });
});

router.patch('/model-integrations/:id', (req, res) => {
    const id = String(req.params.id || '');
    const { active, autoUpgrade, model, llmLanguage, devLanguage, notes } = req.body || {};
    const registry = loadModelRegistry();
    const target = registry.integrations.find(item => item.id === id);
    if (!target) {
        return res.status(404).json({
            success: false,
            message: 'النموذج غير موجود',
            timestamp: new Date().toISOString()
        });
    }

    if (typeof active === 'boolean') target.active = active;
    if (typeof autoUpgrade === 'boolean') target.autoUpgrade = autoUpgrade;
    if (typeof model === 'string' && model.trim()) target.model = model.trim();
    if (typeof llmLanguage === 'string' && llmLanguage.trim()) target.llmLanguage = llmLanguage.trim();
    if (typeof devLanguage === 'string' && devLanguage.trim()) target.devLanguage = devLanguage.trim();
    if (typeof notes === 'string') target.notes = notes.trim();
    target.updatedAt = new Date().toISOString();

    saveModelRegistry(registry);
    return res.json({
        success: true,
        data: target,
        message: 'تم تحديث إعداد النموذج بنجاح',
        timestamp: new Date().toISOString()
    });
});

router.post('/model-integrations/auto-refresh', (req, res) => {
    const registry = loadModelRegistry();
    const recommendations = buildModelRecommendations();
    let upgradedCount = 0;

    registry.integrations = registry.integrations.map(item => {
        if (!item.autoUpgrade) return item;
        const rec = recommendations[item.provider];
        if (rec && rec.recommended && rec.recommended !== item.model) {
            upgradedCount += 1;
            return {
                ...item,
                model: rec.recommended,
                updatedAt: new Date().toISOString()
            };
        }
        return item;
    });

    registry.lastRefreshedAt = new Date().toISOString();
    saveModelRegistry(registry);

    return res.json({
        success: true,
        data: {
            upgradedCount,
            lastRefreshedAt: registry.lastRefreshedAt
        },
        message: `تم تحديث السجل تلقائياً — عدد النماذج المحدثة: ${upgradedCount}`,
        timestamp: new Date().toISOString()
    });
});

// ─── محادثة ذكية ──────────────────────────────────────────────────────────────

router.post('/chat', async (req, res) => {
    const { message, context, model = 'auto', conversationId, enableThinking = false, useRAG = true } = req.body;
    const startMs = Date.now();

    if (!message) {
        return res.status(400).json({ success: false, message: 'يرجى إدخال رسالة' });
    }

    // ─── حواجز الأمان الشرعية ───────────────────────────────────────
    if (islamicGuardrails) {
        const inputCheck = islamicGuardrails.validateInput(message);
        if (!inputCheck.safe) {
            return res.status(400).json({ success: false, message: inputCheck.reason });
        }
    }

    // ─── Rate Limiting ──────────────────────────────────────────────
    if (productionMonitor) {
        const userId = req.body.userId || req.ip || 'anonymous';
        if (!productionMonitor.checkRateLimit(userId)) {
            return res.status(429).json({ success: false, message: 'تم تجاوز الحد الأقصى للطلبات. انتظر قليلاً.' });
        }
        if (productionMonitor.isCircuitOpen()) {
            return res.status(503).json({ success: false, message: 'الخدمة تحت الصيانة المؤقتة. حاول لاحقاً.' });
        }
    }

    try {
        let response;
        let provider = 'local';
        let thinking = null;
        let ragContext = null;

        // ─── 1. استرجاع معزز بـ RAG ────────────────────────────────
        if (useRAG && ragEngine) {
            try {
                ragContext = await ragEngine.process(message, { topK: 3 });
            } catch (e) {
                console.warn('[RAG] خطأ في الاسترجاع:', e.message);
            }
        }

        // ─── 2. توجيه ذكي حسب نوع المهمة ─────────────────────────
        const taskType = detectTaskType(message);
        const preferredModel = model !== 'auto' ? model : getPreferredModel(taskType);
        const sensitivity = detectSensitivity(message, context);
        const modelPipeline = buildModelPipeline({
            forcedModel: model,
            preferredModel,
            taskType,
            sensitivity,
            hasClaude: !!config.ai.anthropic.apiKey,
            hasOpenAI: !!config.ai.openai.apiKey,
            hasOllama: !!config.ai?.ollama?.enabled
        });

        // ─── 3. أولوية Claude Opus 4.6 مع سياق RAG ────────────────
        if (config.ai.anthropic.apiKey && (preferredModel === 'claude' || preferredModel === 'anthropic')) {
            try {
                const augmentedContext = ragContext
                    ? `${ragContext.systemPrompt}\n\n${context || ''}`
                    : context;
                const result = await callClaudeOpus46(message, augmentedContext, conversationId, enableThinking);
                response = result.response;
                thinking = result.thinking;
                provider = 'claude-opus-4.6+rag';
            } catch (e) {
                console.warn('Claude Opus 4.6 error:', e.message);
            }
        }

        // ─── 4. OpenAI GPT-5.2 كبديل ───────────────────────────────
        if (!response && config.ai.openai.apiKey && (preferredModel === 'openai' || preferredModel === 'auto')) {
            try {
                response = await callOpenAI(message, context);
                provider = 'openai-gpt-5.2';
            } catch (e) {
                console.warn('OpenAI error:', e.message);
            }
        }

        // ─── 4.5. Ollama (محلي/‏VPS) ضمن منظومة التكامل ─────────────
        if (!response && config.ai?.ollama?.enabled && modelPipeline.includes('ollama')) {
            try {
                response = await callOllama(message, context, taskType, sensitivity);
                if (response) provider = `ollama-${selectOllamaModel(taskType, sensitivity)}`;
            } catch (e) {
                console.warn('Ollama error:', e.message);
            }
        }

        // ─── 5. Ollama المحلي (تشغيل VPS/On-Prem) ────────────────────
        if (!response && config.ai?.ollama?.enabled && (preferredModel === 'ollama' || preferredModel === 'auto' || preferredModel === 'local')) {
            try {
                const ollamaModel = resolveOllamaModel(taskType, req.body?.ollamaModel);
                response = await callOllama(message, context, ollamaModel);
                provider = `ollama-${ollamaModel}`;
            } catch (e) {
                console.warn('Ollama error:', e.message);
            }
        }

        // ─── 6. عقل شيخة المحلي المستقل (الأولوية الأولى بدون API) ──
        if (!response && localMind && localMind.ready) {
            try {
                const userId = req.body.userId || req.ip || 'anonymous';
                const mindResult = await localMind.process(message, { userId, ip: req.ip });
                response = mindResult.response;
                provider = 'sheikha-local-mind';
                // إضافة سياق RAG إن وجد
                if (ragContext && ragContext.retrieval?.results?.length > 0) {
                    const extraContext = ragContext.retrieval.results.slice(0, 2)
                        .map(r => r.text).join(' | ');
                    if (extraContext.length > 20) {
                        response += '\n\n📚 معلومات إضافية: ' + extraContext;
                    }
                    provider = 'sheikha-local-mind+rag';
                }
            } catch (e) {
                console.warn('[LocalMind] خطأ:', e.message);
            }
        }

        // ─── 7. استجابة محلية بسيطة كاحتياط أخير ─────────────────────
        if (!response) {
            if (ragContext && ragContext.retrieval?.results?.length > 0) {
                const topResults = ragContext.retrieval.results.slice(0, 3);
                response = 'بناءً على معرفتي:\n\n' + topResults.map((r, i) =>
                    `${i + 1}. ${r.text}`
                ).join('\n\n');
                if (ragContext.retrieval.islamicContext) {
                    response += '\n\n📖 السياق الشرعي: ' + ragContext.retrieval.islamicContext.map(ic => ic.text).join(' | ');
                }
                provider = 'sheikha-rag-local';
            } else {
                response = generateLocalResponse(message);
                provider = 'sheikha-local';
            }
        }

        // ─── 8. فحص المخرجات ────────────────────────────────────────
        if (islamicGuardrails) {
            const outputCheck = islamicGuardrails.validateOutput(response);
            if (outputCheck.warnings.length > 0) {
                response = islamicGuardrails.addDisclaimer(response, message);
            }
        }

        // ─── 9. تقييم الجودة ────────────────────────────────────────
        let quality = null;
        if (ragEngine && ragContext) {
            quality = ragEngine.evaluateQuality(message, response, ragContext.retrieval.results);
        }

        const latency = Date.now() - startMs;
        if (productionMonitor) productionMonitor.recordRequest(true, latency);

        const result = {
            success: true,
            response,
            provider,
            taskType,
            sensitivity,
            modelPipeline,
            pipeline: ragContext ? 'rag-augmented' : 'direct',
            quality: quality ? { grade: quality.grade, score: Math.round(quality.scores.overall * 100) } : null,
            timestamp: new Date().toISOString()
        };

        if (thinking) result.thinking = thinking;
        if (conversationId) result.conversationId = conversationId;

        res.json(result);

    } catch (error) {
        if (productionMonitor) productionMonitor.recordError(error);
        res.status(500).json({ success: false, message: 'خطأ في المحادثة', error: error.message });
    }
});

// ─── محادثة مع التفكير التكيفي (Adaptive Thinking) ────────────────────────────

router.post('/chat/think', async (req, res) => {
    const { message, context, budget = 'medium' } = req.body;

    if (!message) {
        return res.status(400).json({
            success: false,
            message: 'يرجى إدخال رسالة'
        });
    }

    if (!config.ai.anthropic.apiKey) {
        return res.status(503).json({
            success: false,
            message: 'التفكير التكيفي يتطلب Claude Opus 4.6'
        });
    }

    // ميزانية التفكير
    const thinkingBudgets = {
        low: 2048,
        medium: 8192,
        high: 32768,
        maximum: 65536
    };

    try {
        const result = await callClaudeWithThinking(message, context, thinkingBudgets[budget] || 8192);

        res.json({
            success: true,
            response: result.response,
            thinking: result.thinking,
            thinkingBudget: budget,
            provider: 'claude-opus-4.6-thinking',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في التفكير التكيفي',
            error: error.message
        });
    }
});

// ─── ضغط السياق (Context Compaction) ──────────────────────────────────────────

router.post('/chat/compact', async (req, res) => {
    const { conversationId, messages } = req.body;

    if (!conversationId || !messages) {
        return res.status(400).json({
            success: false,
            message: 'يرجى إدخال معرف المحادثة والرسائل'
        });
    }

    try {
        // ضغط السياق باستخدام Claude Opus 4.6
        const compacted = await compactContext(messages);
        
        // تخزين السياق المضغوط
        conversationContexts.set(conversationId, {
            summary: compacted,
            messageCount: messages.length,
            compactedAt: new Date().toISOString()
        });

        res.json({
            success: true,
            conversationId,
            originalMessages: messages.length,
            compactedSummary: compacted,
            message: 'تم ضغط السياق بنجاح - يمكن الاستمرار في المحادثة بلا حدود'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في ضغط السياق',
            error: error.message
        });
    }
});

// ─── تحليل شركة ───────────────────────────────────────────────────────────────

router.post('/analyze-company', async (req, res) => {
    const { companyName, companyId } = req.body;

    if (!companyName && !companyId) {
        return res.status(400).json({
            success: false,
            message: 'يرجى إدخال اسم الشركة أو معرفها'
        });
    }

    try {
        let analysis;

        if (SheikaAIEngine && SheikaAIEngine.analyzeCompany) {
            analysis = await SheikaAIEngine.analyzeCompany(companyName || companyId);
        } else {
            analysis = {
                company: companyName || companyId,
                status: 'basic-analysis',
                note: 'التحليل المتقدم يتطلب تفعيل محرك شيخة'
            };
        }

        res.json({
            success: true,
            analysis
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في التحليل',
            error: error.message
        });
    }
});

// ─── تحليل مفهوم ──────────────────────────────────────────────────────────────

router.post('/analyze-concept', (req, res) => {
    const { concept, context } = req.body;

    if (!concept) {
        return res.status(400).json({
            success: false,
            message: 'يرجى إدخال المفهوم'
        });
    }

    // تحليل لغوي للمفهوم
    const analysis = {
        concept,
        context: context || 'عام',
        meanings: analyzeMeaning(concept, context),
        similarities: findSimilarities(concept),
        applications: findApplications(concept)
    };

    res.json({
        success: true,
        analysis
    });
});

// ─── تطوير - تحليل كود ────────────────────────────────────────────────────────

router.post('/development/analyze', async (req, res) => {
    const { code, language = 'javascript' } = req.body;

    if (!code) {
        return res.status(400).json({
            success: false,
            message: 'يرجى إدخال الكود'
        });
    }

    try {
        let analysis;
        let provider = 'local';

        if (DevelopmentEngine && DevelopmentEngine.analyzeCode) {
            analysis = await DevelopmentEngine.analyzeCode(code, language);
            provider = 'development-engine';
        } else if (config.ai.anthropic.apiKey) {
            analysis = await analyzeCodeWithClaude(code, language);
            provider = 'claude';
        } else {
            analysis = basicCodeAnalysis(code, language);
            provider = 'local';
        }

        res.json({
            success: true,
            analysis,
            provider
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في تحليل الكود',
            error: error.message
        });
    }
});

// ─── تطوير - توليد كود ────────────────────────────────────────────────────────

router.post('/development/generate', async (req, res) => {
    const { description, type = 'function', language = 'javascript' } = req.body;

    if (!description) {
        return res.status(400).json({
            success: false,
            message: 'يرجى وصف ما تريد توليده'
        });
    }

    try {
        let code;
        let provider = 'local';

        if (DevelopmentEngine && DevelopmentEngine.generateCode) {
            code = await DevelopmentEngine.generateCode(description, type, language);
            provider = 'development-engine';
        } else {
            code = generateBasicCode(description, type, language);
            provider = 'local';
        }

        res.json({
            success: true,
            code,
            provider
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في توليد الكود',
            error: error.message
        });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// RAG ENDPOINTS — مسارات التوليد المعزز بالاسترجاع
// ═══════════════════════════════════════════════════════════════════════════════

router.post('/rag/query', async (req, res) => {
    const { query, collection, topK = 5 } = req.body;
    if (!query) return res.status(400).json({ success: false, message: 'يرجى إدخال استعلام' });
    if (!ragEngine) return res.status(503).json({ success: false, message: 'محرك RAG غير متوفر' });

    try {
        const result = await ragEngine.process(query, { collection, topK });
        res.json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/rag/ingest', async (req, res) => {
    const { text, collection = 'custom', metadata = {} } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'يرجى إدخال نص' });
    if (!ragEngine) return res.status(503).json({ success: false, message: 'محرك RAG غير متوفر' });

    try {
        const result = ragEngine.ingest(text, collection, metadata);
        res.json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/rag/stats', (req, res) => {
    if (!ragEngine) return res.status(503).json({ success: false, message: 'محرك RAG غير متوفر' });
    res.json({ success: true, stats: ragEngine.getStats() });
});

// ═══════════════════════════════════════════════════════════════════════════════
// AGENT ENDPOINTS — مسارات الوكلاء
// ═══════════════════════════════════════════════════════════════════════════════

router.post('/agent/task', async (req, res) => {
    const { task, userId } = req.body;
    if (!task) return res.status(400).json({ success: false, message: 'يرجى تحديد المهمة' });
    if (!agentOrchestrator) return res.status(503).json({ success: false, message: 'نظام الوكلاء غير متوفر' });

    try {
        const context = { userId: userId || req.ip, authenticated: !!req.body.token };
        const result = await agentOrchestrator.processTask(task, context);
        res.json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/agent/list', (req, res) => {
    if (!agentOrchestrator) return res.status(503).json({ success: false, message: 'نظام الوكلاء غير متوفر' });
    res.json({ success: true, ...agentOrchestrator.getStats() });
});

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL ENDPOINTS — مسارات الأدوات (Function Calling)
// ═══════════════════════════════════════════════════════════════════════════════

router.post('/tools/call', async (req, res) => {
    const { tool, args = {}, userId } = req.body;
    if (!tool) return res.status(400).json({ success: false, message: 'يرجى تحديد الأداة' });
    if (!agentOrchestrator) return res.status(503).json({ success: false, message: 'نظام الأدوات غير متوفر' });

    try {
        const context = { userId: userId || req.ip, authenticated: !!req.body.token };
        const result = await agentOrchestrator.toolRegistry.execute(tool, args, context);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/tools/list', (req, res) => {
    if (!agentOrchestrator) return res.status(503).json({ success: false, message: 'نظام الأدوات غير متوفر' });
    const format = req.query.format || 'openai';
    res.json({
        success: true,
        tools: agentOrchestrator.toolRegistry.getToolDefinitions(format),
        stats: agentOrchestrator.toolRegistry.getStats()
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCTION ENDPOINTS — مسارات الإنتاج والمراقبة
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/production/metrics', (req, res) => {
    if (!productionMonitor) return res.status(503).json({ success: false, message: 'مراقب الإنتاج غير متوفر' });
    res.json({ success: true, metrics: productionMonitor.getMetrics() });
});

router.get('/production/health', (req, res) => {
    const health = {
        status: 'healthy',
        components: {
            rag: ragEngine ? 'active' : 'inactive',
            agents: agentOrchestrator ? 'active' : 'inactive',
            monitor: productionMonitor ? 'active' : 'inactive',
            guardrails: islamicGuardrails ? 'active' : 'inactive',
            openai: config.ai.openai.apiKey ? 'configured' : 'missing',
            anthropic: config.ai.anthropic.apiKey ? 'configured' : 'missing'
        },
        circuitBreaker: productionMonitor ? productionMonitor.circuitBreaker.state : 'unknown',
        timestamp: new Date().toISOString()
    };
    const allActive = Object.values(health.components).every(v => v !== 'inactive');
    health.status = allActive ? 'healthy' : 'degraded';
    res.json({ success: true, health });
});

// ═══════════════════════════════════════════════════════════════════════════════
// CAPABILITIES — القدرات الكاملة للذكاء
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/capabilities', (req, res) => {
    res.json({
        success: true,
        system: 'منظومة شيخة للذكاء الاصطناعي — الإصدار المتقدم',
        architecture: {
            rag: {
                nameAr: 'التوليد المعزز بالاسترجاع',
                nameEn: 'Retrieval-Augmented Generation',
                components: ['Chunking Engine', 'TF-IDF Embedding', 'Vector Store (In-Memory)', 'MMR Reranking', 'Quality Evaluation'],
                status: ragEngine ? 'active' : 'inactive',
                useCases: ['الإجابة على الأسئلة', 'البحث في المعرفة', 'الاستشارات المتخصصة']
            },
            agents: {
                nameAr: 'نظام الوكلاء',
                nameEn: 'Agent System',
                types: [
                    { name: 'market-agent', nameAr: 'وكيل السوق', type: 'hybrid', desc: 'تحليل الأسعار والسوق' },
                    { name: 'sharia-agent', nameAr: 'وكيل الشريعة', type: 'backend', desc: 'فتاوى وأحكام شرعية' },
                    { name: 'legal-agent', nameAr: 'وكيل القانون', type: 'backend', desc: 'عقود وتراخيص' },
                    { name: 'business-agent', nameAr: 'وكيل الأعمال', type: 'backend', desc: 'دراسات جدوى وتخطيط' },
                    { name: 'knowledge-agent', nameAr: 'وكيل المعرفة', type: 'frontend', desc: 'إجابة الأسئلة العامة (RAG)' }
                ],
                status: agentOrchestrator ? 'active' : 'inactive'
            },
            functionCalling: {
                nameAr: 'نداء الدوال',
                nameEn: 'Function Calling',
                tools: agentOrchestrator ? agentOrchestrator.toolRegistry.getToolDefinitions('openai') : [],
                formats: ['openai', 'anthropic'],
                status: agentOrchestrator ? 'active' : 'inactive'
            },
            production: {
                nameAr: 'جاهزية الإنتاج',
                nameEn: 'Production Readiness',
                features: ['Rate Limiting', 'Circuit Breaker', 'Latency Percentiles (p50/p95/p99)', 'Token Tracking', 'Error Logging', 'Islamic Guardrails'],
                status: productionMonitor ? 'active' : 'inactive'
            },
            islamicIntegration: {
                nameAr: 'التكامل الإسلامي',
                nameEn: 'Islamic Integration',
                features: ['آيات تجارية من القرآن', 'أحاديث البيع والتجارة', 'حواجز أمان شرعية', 'تقييم التوافق الشرعي', 'إخلاء مسؤولية تلقائي'],
                principle: '"إن الله يحب إذا عمل أحدكم عملاً أن يتقنه"',
                status: islamicGuardrails ? 'active' : 'inactive'
            }
        },
        decisionMatrix: {
            description: 'متى نستخدم RAG ومتى نستخدم Agents',
            rag: {
                useCases: ['سؤال يحتاج معرفة مخزنة', 'بحث في المعرفة الإسلامية', 'استعلام عن معلومات المعادن', 'سؤال عام يحتاج سياق'],
                strengths: ['سرعة الاسترجاع', 'دقة المعلومات', 'تتبع المصادر', 'تقييم الجودة']
            },
            agents: {
                useCases: ['مهمة تحتاج أدوات', 'حساب زكاة', 'إنشاء عقد', 'تحليل سوق', 'دراسة جدوى'],
                strengths: ['تنفيذ متعدد الخطوات', 'استخدام أدوات', 'تخطيط ذكي', 'تنسيق معقد']
            }
        }
    });
});

// ─── دوال مساعدة ──────────────────────────────────────────────────────────────

async function callOpenAI(message, context) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.ai.openai.apiKey}`
        },
        body: JSON.stringify({
            model: config.ai.openai.model,
            messages: [
                { role: 'system', content: 'أنت شيخة، مساعد ذكي متخصص في المعادن والسكراب.' },
                { role: 'user', content: message }
            ],
            max_tokens: config.ai.openai.maxTokens
        })
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'لم أتمكن من الرد';
}

async function callOllama(message, context, taskType, sensitivity) {
    const model = selectOllamaModel(taskType, sensitivity);
    const systemPrompt = 'أنت شيخة، مساعد ذكي يعمل وفق الشريعة الإسلامية ويمنع الضرر والغش والربا.';
    const messages = [
        { role: 'system', content: systemPrompt }
    ];
    if (context) {
        messages.push({ role: 'user', content: `سياق: ${typeof context === 'string' ? context : JSON.stringify(context)}` });
    }
    messages.push({ role: 'user', content: message });

    const timeoutMs = config.ai?.ollama?.timeoutMs || 90000;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
        const response = await fetch(`${config.ai?.ollama?.host || 'http://127.0.0.1:11434'}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model,
                messages,
                stream: false,
                options: {
                    temperature: 0.2,
                    num_ctx: 8192
                }
            }),
            signal: ctrl.signal
        });
        const data = await response.json();
        if (!response.ok || data.error) {
            throw new Error(data.error || `Ollama HTTP ${response.status}`);
        }
        return data?.message?.content || '';
    } finally {
        clearTimeout(timer);
    }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  Claude Opus 4.6 — النداء الرئيسي مع جميع المميزات الجديدة
 * ═══════════════════════════════════════════════════════════════════════════
 */
async function callClaudeOpus46(message, context, conversationId, enableThinking) {
    const systemPrompt = `أنت شيخة — مساعد ذكي متخصص في المعادن والسكراب والتجارة الإلكترونية.
مبني على Claude Opus 4.6 — أقوى نموذج ذكاء اصطناعي في العالم.
تعمل وفق الشريعة الإسلامية وتخدم السوق السعودي والخليجي.
تتحدث العربية الفصحى بطلاقة وتفهم المصطلحات التجارية والتقنية.
لديك قدرات: التفكير التكيفي، تحليل الأكواد، التخطيط متعدد الخطوات، والتحليل المالي.`;

    // بناء الرسائل مع دعم السياق المضغوط
    const messages = [];
    
    // إضافة السياق المضغوط إذا وُجد
    if (conversationId && conversationContexts.has(conversationId)) {
        const ctx = conversationContexts.get(conversationId);
        messages.push({
            role: 'user',
            content: `[سياق المحادثة السابقة]: ${ctx.summary}`
        });
        messages.push({
            role: 'assistant',
            content: 'فهمت السياق السابق. أنا جاهز للمتابعة.'
        });
    }

    // إضافة السياق الإضافي
    if (context) {
        messages.push({
            role: 'user',
            content: `[سياق إضافي]: ${typeof context === 'string' ? context : JSON.stringify(context)}`
        });
        messages.push({
            role: 'assistant',
            content: 'تم استيعاب السياق.'
        });
    }

    messages.push({ role: 'user', content: message });

    // بناء الطلب
    const requestBody = {
        model: config.ai.anthropic.model,
        max_tokens: config.ai.anthropic.maxTokens,
        system: systemPrompt,
        messages
    };

    // تفعيل التفكير التكيفي إذا طُلب
    if (enableThinking && config.ai.anthropic.adaptiveThinking) {
        requestBody.thinking = {
            type: 'enabled',
            budget_tokens: 8192
        };
        // عند تفعيل التفكير، يجب رفع max_tokens
        requestBody.max_tokens = 16384;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': config.ai.anthropic.apiKey,
            'anthropic-version': '2025-04-14'
        },
        body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (data.error) {
        throw new Error(data.error.message || 'خطأ من Claude Opus 4.6');
    }

    // استخراج الرد والتفكير
    let responseText = '';
    let thinkingText = null;

    if (data.content) {
        for (const block of data.content) {
            if (block.type === 'thinking') {
                thinkingText = block.thinking;
            } else if (block.type === 'text') {
                responseText = block.text;
            }
        }
    }

    return {
        response: responseText || 'لم أتمكن من الرد',
        thinking: thinkingText
    };
}

/**
 * Claude Opus 4.6 مع التفكير التكيفي المتقدم
 */
async function callClaudeWithThinking(message, context, thinkingBudget) {
    const systemPrompt = `أنت شيخة — مساعد ذكي متخصص. استخدم التفكير العميق لتحليل السؤال بدقة.
حلل المشكلة خطوة بخطوة قبل تقديم الإجابة النهائية.`;

    const messages = [];
    if (context) {
        messages.push({ role: 'user', content: `[سياق]: ${context}` });
        messages.push({ role: 'assistant', content: 'تم.' });
    }
    messages.push({ role: 'user', content: message });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': config.ai.anthropic.apiKey,
            'anthropic-version': '2025-04-14'
        },
        body: JSON.stringify({
            model: config.ai.anthropic.model,
            max_tokens: thinkingBudget + 8192,
            system: systemPrompt,
            thinking: {
                type: 'enabled',
                budget_tokens: thinkingBudget
            },
            messages
        })
    });

    const data = await response.json();

    if (data.error) {
        throw new Error(data.error.message);
    }

    let responseText = '';
    let thinkingText = '';

    for (const block of (data.content || [])) {
        if (block.type === 'thinking') thinkingText = block.thinking;
        if (block.type === 'text') responseText = block.text;
    }

    return { response: responseText, thinking: thinkingText };
}

/**
 * ضغط السياق — لمحادثات لا نهائية
 */
async function compactContext(messages) {
    if (config.ai.anthropic.apiKey) {
        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': config.ai.anthropic.apiKey,
                    'anthropic-version': '2025-04-14'
                },
                body: JSON.stringify({
                    model: config.ai.anthropic.model,
                    max_tokens: 2048,
                    system: 'لخّص المحادثة التالية بشكل مكثف مع الحفاظ على جميع المعلومات المهمة والقرارات والسياق.',
                    messages: [{
                        role: 'user',
                        content: `لخّص هذه المحادثة:\n${JSON.stringify(messages)}`
                    }]
                })
            });

            const data = await response.json();
            return data.content?.[0]?.text || 'ملخص غير متوفر';
        } catch (e) {
            console.warn('Context compaction error:', e.message);
        }
    }
    
    // ضغط محلي بسيط
    return messages.map(m => `${m.role}: ${m.content?.substring(0, 100)}`).join('\n');
}

/**
 * كشف نوع المهمة للتوجيه الذكي
 */
function detectTaskType(message) {
    const patterns = {
        development: /كود|برمج|دال[ةه]|خطأ|bug|code|function|api|script|تطوير|إصلاح/i,
        analysis: /حلل|تحليل|تقرير|إحصائ|بيانات|مقارن|analysis|report/i,
        coding: /أنش[ئي]|بناء|إضاف|تعديل|create|build|implement/i,
        financial: /سعر|ربح|خسار|مال|إيراد|زكا[ةه]|ميزاني/i,
        sharia: /شرع|حلال|حرام|ربا|فتو[ىي]|إسلام/i,
        market: /سوق|شرك[ةه]|تجار|معد[نن]|سكراب|بيع|شراء/i
    };

    for (const [type, pattern] of Object.entries(patterns)) {
        if (pattern.test(message)) return type;
    }
    return 'general';
}

/**
 * اختيار النموذج المفضل حسب نوع المهمة
 */
function getPreferredModel(taskType) {
    const routing = config.ai.routing;
    
    switch (taskType) {
        case 'development':
        case 'coding':
            return routing.development === 'anthropic' ? 'claude' : 'openai';
        case 'analysis':
        case 'financial':
            return routing.analysis === 'anthropic' ? 'claude' : 'openai';
        default:
            return routing.chat === 'anthropic' ? 'claude' : 'openai';
    }
}

function detectSensitivity(message, context) {
    const text = `${message || ''} ${typeof context === 'string' ? context : JSON.stringify(context || {})}`;
    const privatePattern = /رقم هوية|هوية وطنية|جواز|iban|حساب بنكي|كلمة مرور|otp|سرّي|سري|confidential|private|token|api key/i;
    const highRiskPattern = /اختراق|تهكير|تجاوز|تزوير|غش|ربا|احتيال|احتكار/i;
    if (highRiskPattern.test(text)) return 'high-risk';
    if (privatePattern.test(text)) return 'private';
    return 'normal';
}

function buildModelPipeline({ forcedModel = 'auto', preferredModel, taskType, sensitivity, hasClaude, hasOpenAI, hasOllama }) {
    if (forcedModel && forcedModel !== 'auto') return [forcedModel, 'localMind', 'local'];

    const order = [];
    if (sensitivity === 'private') {
        if (hasOllama) order.push('ollama');
        order.push('localMind');
        if (hasClaude) order.push('claude');
        if (hasOpenAI) order.push('openai');
    } else if (taskType === 'sharia' || taskType === 'analysis') {
        if (hasClaude) order.push('claude');
        if (hasOllama) order.push('ollama');
        order.push('localMind');
        if (hasOpenAI) order.push('openai');
    } else if (taskType === 'development' || taskType === 'coding') {
        if (hasClaude) order.push('claude');
        if (hasOpenAI) order.push('openai');
        if (hasOllama) order.push('ollama');
        order.push('localMind');
    } else {
        if (preferredModel === 'openai' && hasOpenAI) order.push('openai');
        if (preferredModel === 'claude' && hasClaude) order.push('claude');
        if (hasOllama) order.push('ollama');
        order.push('localMind');
        if (hasClaude && !order.includes('claude')) order.push('claude');
        if (hasOpenAI && !order.includes('openai')) order.push('openai');
    }
    order.push('local');
    return [...new Set(order)];
}

function selectOllamaModel(taskType, sensitivity) {
    if (sensitivity === 'private') return config.ai?.ollama?.strongModel || config.ai?.ollama?.defaultModel;
    if (taskType === 'sharia' || taskType === 'analysis') return config.ai?.ollama?.strongModel || config.ai?.ollama?.defaultModel;
    if (taskType === 'coding' || taskType === 'development') return config.ai?.ollama?.defaultModel;
    return config.ai?.ollama?.lightModel || config.ai?.ollama?.defaultModel;
}

function generateLocalResponse(message) {
    const responses = {
        'مرحبا': 'مرحباً بك في منظومة شيخة! كيف يمكنني مساعدتك؟',
        'السعر': 'أسعار المعادن تتغير يومياً. يمكنك الاطلاع على الأسعار الحالية من صفحة الأسعار.',
        'تسجيل': 'للتسجيل، يرجى زيارة صفحة التسجيل وإدخال بياناتك.',
        'default': 'شكراً لتواصلك مع شيخة. سأحاول مساعدتك قدر الإمكان.'
    };

    for (const [key, value] of Object.entries(responses)) {
        if (message.includes(key)) return value;
    }
    return responses.default;
}

function analyzeMeaning(concept, context) {
    const meanings = {
        'نمو': {
            'مالي': 'زيادة في الإيرادات أو الأرباح أو القيمة السوقية',
            'بيولوجي': 'زيادة في الحجم أو العدد للكائنات الحية',
            'اقتصادي': 'توسع في النشاط الاقتصادي والإنتاج'
        },
        'حركة': {
            'فيزيائي': 'انتقال من مكان لآخر',
            'اقتصادي': 'تداول وتبادل تجاري',
            'اجتماعي': 'تغير في الأوضاع والعلاقات'
        }
    };

    return meanings[concept] || { 'عام': `معنى ${concept} حسب السياق` };
}

function findSimilarities(concept) {
    return [
        { type: 'لغوي', similar: [`${concept} بمعنى مقارب`] },
        { type: 'مفهومي', similar: ['مفاهيم مرتبطة'] }
    ];
}

function findApplications(concept) {
    return [
        'تطبيق في مجال المعادن',
        'تطبيق في سلسلة التوريد',
        'تطبيق في التحليل المالي'
    ];
}

function basicCodeAnalysis(code, language) {
    const lines = code.split('\n').length;
    const functions = (code.match(/function\s+\w+/g) || []).length;
    const classes = (code.match(/class\s+\w+/g) || []).length;

    return {
        lines,
        functions,
        classes,
        language,
        complexity: lines > 100 ? 'high' : lines > 50 ? 'medium' : 'low'
    };
}

function generateBasicCode(description, type, language) {
    if (type === 'function' && language === 'javascript') {
        return `/**
 * ${description}
 */
function myFunction() {
    // TODO: تنفيذ الوظيفة
    console.log('${description}');
}`;
    }
    return `// ${description}\n// TODO: تنفيذ الكود`;
}

async function analyzeCodeWithClaude(code, language) {
    // يتطلب مفتاح Claude
    return basicCodeAnalysis(code, language);
}

module.exports = router;
