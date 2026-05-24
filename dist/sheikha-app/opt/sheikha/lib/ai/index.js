/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                      lib/ai/index.js                                        ║
 * ║              طبقة الذكاء الصناعي — LLM / Agents / Memory / RAG             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * مكوّنات طبقة الذكاء:
 *  - LLM orchestration
 *  - prompt system
 *  - tools / agents
 *  - memory (short + long term)
 *  - embeddings / RAG
 *  - action execution
 *  - policy layer
 */

'use strict';

// ─── AI Config ────────────────────────────────────────────────────────────────

const AI_CONFIG = {
    provider:       process.env.AI_PROVIDER       || 'openai',
    model:          process.env.AI_MODEL           || 'gpt-4o',
    apiKey:         process.env.OPENAI_API_KEY     || '',
    maxTokens:      parseInt(process.env.AI_MAX_TOKENS || '2048', 10),
    temperature:    parseFloat(process.env.AI_TEMPERATURE || '0.3'),
    policyEnforced: true,
};

// ─── Prompt System ────────────────────────────────────────────────────────────

const _promptTemplates = new Map();

/**
 * تسجيل قالب prompt
 * @param {string} name
 * @param {string} template  — يستخدم {{key}} للمتغيرات
 */
function registerPrompt(name, template) {
    _promptTemplates.set(name, template);
}

/**
 * بناء prompt من قالب
 * @param {string} name
 * @param {object} vars
 */
function buildPrompt(name, vars = {}) {
    const template = _promptTemplates.get(name);
    if (!template) throw new Error(`قالب غير موجود: ${name}`);
    return template.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? '');
}

// ─── Memory ───────────────────────────────────────────────────────────────────

const _shortTermMemory = []; // آخر N تفاعل
const _longTermMemory  = new Map(); // key → value (دائم في الجلسة)

/**
 * إضافة إلى الذاكرة قصيرة المدى
 * @param {object} entry — { role, content }
 */
function rememberShort(entry) {
    _shortTermMemory.push({ ...entry, at: new Date().toISOString() });
    if (_shortTermMemory.length > 100) _shortTermMemory.shift();
}

/**
 * استرجاع الذاكرة قصيرة المدى
 * @param {number} limit
 */
function recallShort(limit = 10) {
    return _shortTermMemory.slice(-limit);
}

/**
 * حفظ في الذاكرة طويلة المدى
 * @param {string} key
 * @param {*} value
 */
function rememberLong(key, value) {
    _longTermMemory.set(key, { value, savedAt: new Date().toISOString() });
}

/**
 * استرجاع من الذاكرة طويلة المدى
 * @param {string} key
 */
function recallLong(key) {
    return _longTermMemory.get(key)?.value ?? null;
}

// ─── Tool Registry ────────────────────────────────────────────────────────────

const _tools = new Map();

/**
 * تسجيل أداة AI
 * @param {string} name
 * @param {object} spec  — { description, parameters, handler }
 */
function registerTool(name, spec) {
    _tools.set(name, spec);
    console.log(`[AI-LAYER] 🔧 أداة مسجّلة: ${name}`);
}

/**
 * تنفيذ أداة
 * @param {string} name
 * @param {object} args
 */
async function executeTool(name, args = {}) {
    const tool = _tools.get(name);
    if (!tool) return { ok: false, error: `أداة غير موجودة: ${name}` };
    if (AI_CONFIG.policyEnforced) {
        // فحص السياسة: لا تنفيذ أداة خطرة بدون إذن صريح
        if (tool.dangerous && !args._approved) {
            return { ok: false, error: `الأداة "${name}" خطرة وتتطلب موافقة صريحة` };
        }
    }
    try {
        const result = await tool.handler(args);
        return { ok: true, result };
    } catch (err) {
        return { ok: false, error: err.message };
    }
}

/**
 * قائمة الأدوات المتاحة
 */
function listTools() {
    return Array.from(_tools.entries()).map(([name, spec]) => ({
        name,
        description: spec.description || '',
        dangerous:   spec.dangerous   || false,
    }));
}

// ─── Agent Runner ─────────────────────────────────────────────────────────────

/**
 * تشغيل وكيل بسيط (ReAct loop)
 * @param {object} config — { goal, maxSteps, tools }
 * @returns {object}
 */
async function runAgent(config) {
    const { goal, maxSteps = 5 } = config;
    const steps = [];
    let currentGoal = goal;

    for (let i = 0; i < maxSteps; i++) {
        const step = {
            step:    i + 1,
            thought: `تحليل الهدف: ${currentGoal}`,
            action:  'observe',
            result:  null,
        };
        // في الإنتاج: يتصل بـ LLM ويستخدم الأدوات
        step.result = { status: 'completed', note: 'محاكاة — يتطلب LLM حقيقي في الإنتاج' };
        steps.push(step);
        break; // في هذا البناء الأساسي نكتفي بخطوة واحدة
    }

    return { goal, steps, done: true };
}

// ─── Embedding / RAG stub ─────────────────────────────────────────────────────

/**
 * توليد embedding (stub — يتطلب provider في الإنتاج)
 * @param {string} text
 */
async function embed(text) {
    // في الإنتاج: استخدم OpenAI Embeddings API أو محلي
    return { text, vector: [], provider: AI_CONFIG.provider, note: 'stub' };
}

// ─── Init ─────────────────────────────────────────────────────────────────────

async function init() {
    console.log('[AI-LAYER] 🤖 تشغيل طبقة الذكاء...');
    console.log(`[AI-LAYER]    المزود: ${AI_CONFIG.provider} | النموذج: ${AI_CONFIG.model}`);
    console.log(`[AI-LAYER]    السياسة: ${AI_CONFIG.policyEnforced ? 'مُفعَّلة' : 'معطّلة'}`);

    // قوالب أساسية
    registerPrompt('market-analysis', 'حلّل السوق التالي وقدّم توصيات:\n\nالسوق: {{market}}\nالبيانات: {{data}}');
    registerPrompt('product-summary', 'لخّص المنتج التالي للمشتري:\n\nالمنتج: {{product}}\nالمواصفات: {{specs}}');

    console.log('[AI-LAYER] ✅ جاهز');
}

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = {
    AI_CONFIG,
    init,
    registerPrompt,
    buildPrompt,
    rememberShort,
    recallShort,
    rememberLong,
    recallLong,
    registerTool,
    executeTool,
    listTools,
    runAgent,
    embed,
};
