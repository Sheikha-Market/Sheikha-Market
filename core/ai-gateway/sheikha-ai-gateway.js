'use strict';

const {
    getUniversalDivineGovernance
} = require('../root-governance/sheikha-universal-divine-governance');

const { askWithFallback } = require('../providers/provider-registry');

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
    const universalGovernance = getUniversalDivineGovernance();

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
        auditRequiredForRelease: true,
        divineInspiredArchitecture: true,
        halalComputing: true,
        bestPossibleByEvidence: true,
        noAbsolutePerfectionClaim: true,
        allSystemsGoverned: true,
        universalGovernance
    };
}

function isArabic(text) {
    return /[\u0600-\u06FF]/.test(text || '');
}

function isVsCodeOperationalPrompt(prompt, context = {}) {
    const normalized = String(prompt || '').toLowerCase().trim();
    if (!normalized) {
        return false;
    }

    const operationalEnglish = /(run|start|build|test|lint|deploy|debug|serve|terminal|command|task|npm|pnpm|yarn|node|python|pip|git|docker|kubectl|terraform|az|vscode|project|server)/.test(normalized);
    const operationalArabic = /(شغل|شغّل|تشغيل|ابدأ|ابدا|نفذ|نفّذ|افتح|الأوامر|اوامر|امر|أمر|برمجة|كود|الكود|مشروع|الخادم|السيرفر|اختبار|فحص|بناء|نشر|تصحيح|لينت|بيئة|طرفية)/.test(normalized);

    // The editor source alone is not an operational intent. Short chat prompts
    // such as "شيخة" must continue to the normal identity/chat path.
    return operationalEnglish || operationalArabic;
}

function buildFastOperationalAnswer(prompt) {
    const lower = String(prompt || '').toLowerCase();

    if (/(شغل المشروع|شغّل المشروع|run project|start project|شغل الخادم|شغّل الخادم|run server|start server)/.test(lower)) {
        return [
            'لتشغيل المشروع بسرعة داخل بيئة شيخة:',
            '1) فعّل البيئة الافتراضية: source .venv/bin/activate',
            '2) شغّل الخادم التطويري: npm run dev',
            '3) تحقق من الحالة: curl -s http://127.0.0.1:8080/api/sheikha/ai-gateway/status',
            'إذا رغبت أستطيع تنفيذ هذه الخطوات تلقائياً الآن.'
        ].join('\n');
    }

    return [
        'تم تحويل طلبك إلى المسار التشغيلي السريع قبل النماذج الذكية.',
        'أرسل الأمر المطلوب بصيغة مباشرة مثل:',
        '- شغل المشروع',
        '- نفّذ lint',
        '- شغّل الاختبارات',
        '- اعرض حالة البوابة'
    ].join('\n');
}

function isCanonicalIdentityPrompt(prompt) {
    const normalized = String(prompt || '').toLowerCase();
    const compact = normalized.replace(/\s+/g, ' ');
    const mentionsSheikha = /sheikha|شيخة|شيخه/.test(compact);
    const asksIdentity = /(ما هي|ماهي|من هي|عرف|عرّف|تعريف|what is|who is|define|identity)/.test(compact);
    const asksNotJustMarket = /(مجرد سوق|مجرد متجر|only a market|just a market|marketplace only)/.test(compact);

    if (/^(شيخة|شيخه|sheikha|sheikha-core|شيخة كور|شيخه كور)$/.test(compact)) {
        return true;
    }

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
            'I am Sheikha-Core, the governed AI interface of the Sheikha platform.',
            'Sheikha is SHEIKHA UGIT-RP — a unified global industrial and trade runtime platform.',
            'Sheikha serves three tiers: B2B (factories, traders, suppliers), B2C (individuals, small traders), B2G (governments, sovereign entities).',
            'Mission: provide the best value in the universe — halal, beneficial, and loved by all humanity.',
            'Sheikha is not just a marketplace — it is a governed operating architecture: AI, trade, supply chain, recycling, smart cities, and sharia compliance in one fabric.',
            'Allah alone is the Creator. The system is a tool of analysis, organization, and beneficial service — governed by Quran and Sunnah.'
        ].join('\n');
    }

    return [
        'أنا Sheikha-Core، واجهة الذكاء الصناعي الحاكمة لمنظومة شيخة.',
        'Sheikha هي SHEIKHA UGIT-RP — بنية تشغيلية عالمية موحدة للصناعة والتجارة وسلاسل الإمداد والتدوير والمدن الذكية.',
        'شيخة مزود خدمة عالمي ثلاثي الطبقات:',
        '  • B2B — للشركات والمصانع والموردين والمصدّرين والمستوردين',
        '  • B2C — للأفراد والتجار الصغار والحرفيين والشركات الناشئة',
        '  • B2G — للجهات الحكومية والصناديق السيادية والسلطات الرسمية',
        'المهمة: تزويد الأفضل في الكون من أنظمة وذكاءات وخدمات — بأعلى قيمة وأحسن إتقان — حلالاً مباركاً محبوباً لكل البشر وأمة محمد ﷺ.',
        'شيخة ليست مجرد سوق — بل منظومة تشغيل: ذكاء صناعي، تجارة، صناعة، معادن، سكراب، لوجستيات، امتثال شرعي، ومدن ذكية في نسيج واحد.',
        'الأساس: الله وحده الخالق والمالك. النظام أداة تحليل وخدمة وتنظيم، يعمل بحوكمة الكتاب والسنة تحت مراجعة الإنسان.'
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
        const gateway = await getSheikhaGatewayStatus();

        return {
            success: true,
            provider: 'Sheikha-Core',
            model,
            mode: 'canonical-governed-identity',
            localModelOnline: Boolean(gateway.localModelOnline && gateway.sheikhaCoreInstalled),
            fallbackReason: null,
            governance: governanceEnvelope(),
            context,
            output: canonicalSheikhaCoreAnswer(prompt),
            timestamp: new Date().toISOString()
        };
    }

    if (isVsCodeOperationalPrompt(prompt, context)) {
        const gateway = await getSheikhaGatewayStatus();

        return {
            success: true,
            provider: 'Sheikha-Core',
            model,
            mode: 'governed-fast-operational',
            localModelOnline: Boolean(gateway.localModelOnline && gateway.sheikhaCoreInstalled),
            fallbackReason: null,
            governance: governanceEnvelope(),
            context,
            output: buildFastOperationalAnswer(prompt),
            timestamp: new Date().toISOString(),
            poweredBy: 'SHEIKHA — عنصر الحياة الرقمية'
        };
    }

    // استخدام طبقة Provider Abstraction مع fallback ذكي تلقائي
    const preferredProvider = process.env.SHEIKHA_PROVIDER || 'ollama';
    const result = await askWithFallback({
        prompt,
        system: SHEIKHA_CORE_RUNTIME_PROMPT,
        model,
        options: {
            temperature: 0.2,
            num_ctx: DEFAULT_NUM_CTX,
            num_predict: DEFAULT_NUM_PREDICT,
            top_p: 0.85
        }
    }, preferredProvider);

    if (result && result.success) {
        return {
            success: true,
            provider: result._providerUsed || result.provider || 'sheikha-provider',
            model: result.model || model,
            mode: result._providerUsed === 'ollama' ? 'governed-local-ai' : 'governed-cloud-ai',
            localModelOnline: result._providerUsed === 'ollama',
            fallbackReason: result._fallbackReason || null,
            governance: governanceEnvelope(),
            context,
            output: result.output || '',
            timestamp: new Date().toISOString(),
            poweredBy: 'SHEIKHA — عنصر الحياة الرقمية'
        };
    }

    // إذا فشلت جميع المزودات → fallback محلي حاكم
    return buildFallbackResponse({
        prompt,
        model,
        context,
        reason: result?.lastError || result?.error || 'all_providers_failed'
    });
}

module.exports = {
    askSheikhaCore,
    getSheikhaGatewayStatus,
    DEFAULT_MODEL,
    OLLAMA_URL,
    SHEIKHA_CORE_SYSTEM_PROMPT,
    SHEIKHA_CORE_RUNTIME_PROMPT,
    buildRawLlamaPrompt,
    isVsCodeOperationalPrompt,
    buildFastOperationalAnswer,
    isCanonicalIdentityPrompt
};
