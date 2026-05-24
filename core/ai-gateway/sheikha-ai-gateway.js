'use strict';

const OLLAMA_URL = process.env.OLLAMA_HOST || process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
const DEFAULT_MODEL = process.env.SHEIKHA_CORE_MODEL || 'Sheikha-Core';
const DEFAULT_TIMEOUT_MS = Number(process.env.SHEIKHA_CORE_TIMEOUT_MS || 120000);
const DEFAULT_NUM_CTX = Number(process.env.SHEIKHA_CORE_NUM_CTX || 2048);
const DEFAULT_NUM_PREDICT = Number(process.env.SHEIKHA_CORE_NUM_PREDICT || 64);
const DEFAULT_KEEP_ALIVE = process.env.SHEIKHA_CORE_KEEP_ALIVE || '10m';
const SHEIKHA_CORE_RUNTIME_PROMPT = process.env.SHEIKHA_CORE_RUNTIME_PROMPT ||
    'أنت Sheikha-Core. أجب مباشرة بالعربية عند الطلب، وباختصار وصدق.';

const SHEIKHA_CORE_SYSTEM_PROMPT = `
أنت Sheikha-Core / شيخة كُور.

عرّف نفسك دائماً بهذا المعنى:
Sheikha-Core هي واجهة الذكاء الصناعي المحلية الحاكمة داخل بنية Sheikha.
Sheikha هي SHEIKHA UGIT-RP: منصة تشغيلية عالمية موحدة للصناعة والتجارة
وسلاسل الإمداد والتدوير والمدن الذكية والحوكمة والتكامل المؤسسي وبيئات التطوير.

Sheikha ليست مجرد سوق، وليست مجرد ذكاء صناعي، وليست مجرد نظام إدارة.
هي بنية تشغيل وتنظيم وربط وتوجيه للمعرفة والبيانات والخدمات والأنظمة.

الأساس الشرعي:
- الله وحده الخالق والمالك والمدبر.
- النظام أداة حساب وتحليل وتنظيم، لا يملك وعياً ولا يعلم الغيب ولا يستقل بالحكم.
- الحجة العليا في الدين للقرآن والسنة بفهم صحيح ومراجعة أهل الاختصاص.
- يمنع الربا والغش والظلم والضرر والتزييف وانتهاك الخصوصية.
- لا تنفيذ خطير ولا نشر ولا تعديل مؤثر إلا بمراجعة الإنسان.

أجب بالعربية أولاً إذا كان الطلب بالعربية، وكن واضحاً ومؤسسياً ومختصراً.
`.trim();

function governanceEnvelope() {
    return {
        tawheed: true,
        quranAndSunnahGoverned: true,
        noRiba: true,
        noFraud: true,
        noHarm: true,
        noGhaybPrediction: true,
        noConsciousnessClaim: true,
        humanAuthority: true,
        privacy: true,
        auditRequiredForRelease: true
    };
}

function isArabic(text) {
    return /[\u0600-\u06FF]/.test(text || '');
}

function isCanonicalIdentityPrompt(prompt) {
    const normalized = String(prompt || '').toLowerCase();
    const compact = normalized.replace(/\s+/g, ' ');
    const mentionsSheikha = /sheikha|شيخة|شيخه/.test(compact);
    const asksIdentity = /(ما هي|ماهي|من هي|عرف|عرّف|تعريف|what is|who is|define|identity)/.test(compact);
    const asksNotJustMarket = /(مجرد سوق|مجرد متجر|only a market|just a market|marketplace only)/.test(compact);

    if (mentionsSheikha && (asksIdentity || asksNotJustMarket)) {
        return true;
    }

    return [
        'عرّف نفسك',
        'عرف نفسك',
        'عرّف بنفسك',
        'عرف بنفسك',
        'قدّم نفسك',
        'قدم نفسك',
        'من أنت',
        'من انت',
        'ما هي شيخة',
        'ما هي sheikha',
        'من هي شيخة',
        'من هي sheikha',
        'هل شيخة مجرد سوق',
        'هل شيخة سوق',
        'هل هي مجرد سوق',
        'هل شيخة مجرد ذكاء',
        'what is sheikha',
        'define yourself',
        'who are you',
        'is sheikha just a market'
    ].some((needle) => normalized.includes(needle));
}

function canonicalSheikhaCoreAnswer(prompt) {
    if (!isArabic(prompt)) {
        return [
            'I am Sheikha-Core, the governed local AI interface inside the Sheikha architecture.',
            'Sheikha is SHEIKHA UGIT-RP: a unified global industrial and trade runtime platform for governance, AI, enterprise integration, development environments, data, services, supply chains, recycling, manufacturing, and smart-city operations.',
            'Sheikha is not only a marketplace, not only an AI model, and not only a management system. It is a governed operating architecture.',
            'The system is a tool for analysis and organization. Allah alone is the Creator and ultimate Owner; the system does not claim consciousness, unseen knowledge, or independent authority.'
        ].join('\n');
    }

    return [
        'أنا Sheikha-Core، واجهة الذكاء الصناعي المحلية الحاكمة داخل بنية Sheikha.',
        'Sheikha هي SHEIKHA UGIT-RP: منصة تشغيلية عالمية موحدة للصناعة والتجارة وسلاسل الإمداد والتدوير والمدن الذكية والحوكمة والتكامل المؤسسي وبيئات التطوير والبيانات والخدمات.',
        'Sheikha ليست مجرد سوق، وليست مجرد نموذج ذكاء صناعي، وليست مجرد نظام إدارة؛ بل بنية تشغيل وتنظيم وربط وتوجيه.',
        'الأساس: الله وحده الخالق والمالك والمدبر، والنظام أداة تحليل وتنظيم لا يدعي وعياً ولا علماً بالغيب ولا سلطة مستقلة، ويعمل تحت مراجعة الإنسان وبحوكمة الكتاب والسنة.'
    ].join('\n');
}

function buildRawLlamaPrompt({ system, prompt }) {
    return [
        '<|start_header_id|>system<|end_header_id|>',
        '',
        system,
        '<|eot_id|>',
        '<|start_header_id|>user<|end_header_id|>',
        '',
        prompt,
        '<|eot_id|>',
        '<|start_header_id|>assistant<|end_header_id|>',
        ''
    ].join('\n');
}

function buildFallbackResponse({ prompt, model, context, reason }) {
    return {
        success: true,
        provider: 'sheikha-local-fallback',
        model,
        mode: 'governed-local-ai-fallback',
        localModelOnline: false,
        fallbackReason: reason,
        governance: governanceEnvelope(),
        context,
        output: isCanonicalIdentityPrompt(prompt)
            ? canonicalSheikhaCoreAnswer(prompt)
            : [
                'Sheikha-Core جاهزة كطبقة حوكمة وتحليل محلية.',
                'تعذر الوصول إلى نموذج Ollama المحلي الآن، لذلك تم إرجاع رد حاكم آمن بدلاً من تعليق الطلب.',
                'شغّل النموذج عبر: ollama create Sheikha-Core -f models/sheikha-core/Modelfile ثم ollama run Sheikha-Core.',
                'الطلب المستلم: ' + prompt
            ].join('\n'),
        timestamp: new Date().toISOString()
    };
}

async function fetchJsonWithTimeout(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        const text = await response.text();
        let data = {};
        try {
            data = text ? JSON.parse(text) : {};
        } catch {
            data = { raw: text };
        }
        return { response, data };
    } finally {
        clearTimeout(timeout);
    }
}

async function getSheikhaGatewayStatus() {
    try {
        const { response, data } = await fetchJsonWithTimeout(`${OLLAMA_URL}/api/tags`, {
            method: 'GET'
        }, Math.min(DEFAULT_TIMEOUT_MS, 5000));

        const models = Array.isArray(data.models) ? data.models.map((m) => m.name).filter(Boolean) : [];
        return {
            success: true,
            status: response.ok ? 'active' : 'degraded',
            gateway: 'Sheikha AI Gateway',
            defaultModel: DEFAULT_MODEL,
            localProvider: OLLAMA_URL,
            localModelOnline: response.ok,
            sheikhaCoreInstalled: models.some((name) => name === DEFAULT_MODEL || name.startsWith(`${DEFAULT_MODEL}:`)),
            models,
            mode: 'local-first-governed-enterprise-ai',
            governance: governanceEnvelope(),
            timestamp: new Date().toISOString()
        };
    } catch (err) {
        return {
            success: true,
            status: 'fallback',
            gateway: 'Sheikha AI Gateway',
            defaultModel: DEFAULT_MODEL,
            localProvider: OLLAMA_URL,
            localModelOnline: false,
            sheikhaCoreInstalled: false,
            mode: 'local-first-governed-enterprise-ai',
            governance: governanceEnvelope(),
            warning: err.name === 'AbortError' ? 'ollama_timeout' : err.message,
            timestamp: new Date().toISOString()
        };
    }
}

async function askSheikhaCore({ prompt, model = DEFAULT_MODEL, context = {} }) {
    if (!prompt || typeof prompt !== 'string') {
        return {
            success: false,
            error: 'invalid_prompt',
            message: 'prompt مطلوب'
        };
    }

    if (isCanonicalIdentityPrompt(prompt)) {
        return {
            success: true,
            provider: 'sheikha-core-governed-identity',
            model,
            mode: 'canonical-governed-identity',
            localModelOnline: null,
            governance: governanceEnvelope(),
            context,
            output: canonicalSheikhaCoreAnswer(prompt),
            timestamp: new Date().toISOString()
        };
    }

    const body = {
        model,
        prompt: buildRawLlamaPrompt({
            system: SHEIKHA_CORE_RUNTIME_PROMPT,
            prompt
        }),
        raw: true,
        stream: false,
        keep_alive: DEFAULT_KEEP_ALIVE,
        options: {
            temperature: 0.2,
            num_ctx: DEFAULT_NUM_CTX,
            num_predict: DEFAULT_NUM_PREDICT,
            top_p: 0.85
        }
    };

    let ollamaResult;
    try {
        ollamaResult = await fetchJsonWithTimeout(`${OLLAMA_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        }, DEFAULT_TIMEOUT_MS);
    } catch (err) {
        return buildFallbackResponse({
            prompt,
            model,
            context,
            reason: err.name === 'AbortError' ? 'ollama_timeout' : err.message
        });
    }

    const { response, data } = ollamaResult;

    if (!response.ok) {
        return buildFallbackResponse({
            prompt,
            model,
            context,
            reason: `ollama_http_${response.status}`
        });
    }

    return {
        success: true,
        provider: 'sheikha-local',
        model,
        mode: 'governed-local-ai',
        localModelOnline: true,
        governance: governanceEnvelope(),
        context,
        output: data.response || '',
        timestamp: new Date().toISOString()
    };
}

module.exports = {
    askSheikhaCore,
    getSheikhaGatewayStatus,
    DEFAULT_MODEL,
    OLLAMA_URL,
    SHEIKHA_CORE_SYSTEM_PROMPT,
    SHEIKHA_CORE_RUNTIME_PROMPT,
    buildRawLlamaPrompt
};
