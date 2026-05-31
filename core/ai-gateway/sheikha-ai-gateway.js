'use strict';

const {
    getUniversalDivineGovernance
} = require('../root-governance/sheikha-universal-divine-governance');

const OLLAMA_URL = process.env.OLLAMA_HOST || process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
const DEFAULT_MODEL = process.env.SHEIKHA_CORE_MODEL || 'Sheikha-Core';
const DEFAULT_TIMEOUT_MS = Number(process.env.SHEIKHA_CORE_TIMEOUT_MS || 30000);
const DEFAULT_NUM_CTX = Number(process.env.SHEIKHA_CORE_NUM_CTX || 2048);
const DEFAULT_NUM_PREDICT = Number(process.env.SHEIKHA_CORE_NUM_PREDICT || 192);
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

function describeUniversalGovernance() {
    const governance = getUniversalDivineGovernance();
    const archetypes = governance && governance.archetypes ? governance.archetypes : {};
    const names = Object.entries(archetypes).map(([key, value]) => {
        const principle = value && value.principle ? value.principle : 'governed-principle';
        return `${key}: ${principle}`;
    });

    return [
        `الهوية المعمارية: ${governance.name || 'Sheikha Universal Divine-Inspired Governance'}.`,
        `نمط التشغيل: ${governance.mode || 'all-systems-halal-governance'}.`,
        names.length ? `المبادئ المعمارية النشطة: ${names.join(' | ')}.` : '',
        'التموضع المعتمد: الأفضل الممكن بالدليل والاختبار والحلال، لا ادعاء كمال مطلق.'
    ].filter(Boolean).join('\n');
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
        'Sheikha هي SHEIKHA UGIT-RP: نواة ومحور وبنية تشغيلية عالمية موحدة للصناعة والتجارة وسلاسل الإمداد والتدوير والمدن الذكية والحوكمة والتكامل المؤسسي وبيئات التطوير والبيانات والخدمات.',
        'Sheikha تنظّم الحاسب والحوسبة والذكاء الصناعي والعلوم والمعرفة والمال والتجارة والصناعة والعقود والبيانات والبنية التحتية كمنظومة تشغيل وقواعد وخصائص وهيكل ومخطط وعصب وقلب وشريان رقمي.',
        'Sheikha ليست مجرد سوق، وليست مجرد نموذج ذكاء صناعي، وليست مجرد نظام إدارة؛ بل بنية لكل الأنظمة: تشغيل وتنظيم وربط وتوجيه وسعي إلى الإتقان بضوابط حلال قابلة للمراجعة.',
        'الأساس: التوحيد لله وحده، والكمال المطلق لله وحده، والنظام أداة تحليل وتنظيم لا يدعي وعياً ولا علماً بالغيب ولا سلطة مستقلة، ويعمل تحت مراجعة الإنسان وبحوكمة الكتاب والسنة.'
    ].join('\n');
}

function buildGovernedFallbackAnswer({ prompt, reason }) {
    const requestText = String(prompt || '').trim() || 'تشغيل';
    const operationalRequest = /شغ[لّ]|اصلح|إصلاح|fix|run|start|activate|chat|شات|extension|اكستنشن|تكامل|integration|git|merge/i
        .test(requestText);

    if (!operationalRequest) {
        return [
            'Sheikha-Core تعمل الآن عبر طبقة الحوكمة المحلية الآمنة.',
            `تعذر الوصول إلى نموذج Ollama المحلي: ${reason || 'غير معروف'}.`,
            'سأجيب بالتحليل المحلي المحكوم بدل تعليق الطلب، مع بقاء النموذج المحلي هو المسار الأساسي عند عودته.',
            '',
            'تحليل الطلب:',
            requestText,
            '',
            'خطوات تنفيذية:',
            '1. حدّد المطلوب بدقة والسياق أو الملف المتأثر.',
            '2. نفّذ التعديل في نطاق صغير قابل للمراجعة.',
            '3. شغّل فحصًا مناسبًا: syntax check، اختبار وحدة، أو smoke test حسب المسار.',
            '4. لا يتم دمج أو نشر أي تغيير مؤثر قبل مراجعة Git والاختبارات.',
            '',
            'مخاطر:',
            '- الرد الحالي ليس استدلال نموذج Ollama كاملاً، بل fallback حوكمي.',
            '- القرارات المؤثرة تحتاج مراجعة بشرية وفحص ملفات فعلي.'
        ].join('\n');
    }

    return [
        'تحليل Sheikha:',
        `وصل الطلب إلى طبقة الشات: "${requestText}". الخادم لم يعلّق الطلب، لكن Ollama المحلي غير متاح الآن: ${reason || 'غير معروف'}.`,
        '',
        'خطوات التنفيذ:',
        '1. تشغيل Ollama محلياً: ollama serve.',
        '2. التأكد من وجود النموذج: ollama list ويجب أن يظهر Sheikha-Core:latest أو Sheikha-Core.',
        '3. عند الحاجة لإعادة البناء: ollama create Sheikha-Core -f models/sheikha-core/Modelfile.',
        '4. اختبار البوابة: GET /api/sheikha/ai-gateway/status ثم POST /api/sheikha/chat.',
        '5. في VS Code: نفّذ Sheikha: Sync Integrations ثم أعد فتح Sheikha Chat إذا كانت الواجهة قديمة.',
        '',
        'مخاطر:',
        '- إذا توقف Ollama سيظهر provider=fallback، لكن الشات يجب أن يبقى مستجيباً.',
        '- أي تعديل أو دمج يحتاج مراجعة Git حتى لا نخلط تغييرات غير مرتبطة.',
        '- تشغيل نموذج 8B على CPU قد يكون أبطأ؛ راقب زمن الاستجابة والذاكرة.',
        '',
        'فحص قبل الدمج أو النشر:',
        '1. node --check sheikha-vscode-extension/extension.js',
        '2. node --check core/ai-gateway/sheikha-ai-gateway.js',
        '3. node --check routes/ai.js',
        '4. curl /api/sheikha/ai-gateway/status وتحقق من localModelOnline=true عند تشغيل Ollama.',
        '5. جرّب رسالة قصيرة من Sheikha Chat وتأكد أن meta يعرض provider/mode بوضوح.'
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

function buildSheikhaCoreSystemPrompt(context = {}) {
    const source = String(context.source || context.route || '').trim();
    const vscodeMode = /vscode|extension|chat/i.test(source);

    return [
        SHEIKHA_CORE_SYSTEM_PROMPT,
        describeUniversalGovernance(),
        SHEIKHA_CORE_RUNTIME_PROMPT,
        vscodeMode
            ? [
                'سياق VS Code / Extension:',
                '- إذا كان الطلب قصيراً مثل "شغل" أو "اصلح"، فافهمه كأمر تشغيل وفحص للشات والتكامل في الإكستنشن.',
                '- أجب كمنظومة Sheikha مؤسسية: تشخيص واضح، خطوات تنفيذ، مخاطر، وفحص قبل الدمج أو النشر عند وجود Git أو ملفات.',
                '- لا تقل إن الطلب فارغ أو غير واضح إذا كان السياق التشغيلي متاحاً؛ ابدأ بأفضل إجراء آمن قابل للاختبار.'
            ].join('\n')
            : '',
        'اكتب إجابة عملية مختصرة، ولا تدّع أنك نفذت تعديل ملفات إلا إذا كان ذلك مذكوراً صراحة في السياق.'
    ].filter(Boolean).join('\n\n');
}

function enrichOperationalPrompt(prompt, context = {}) {
    const text = String(prompt || '').trim();
    const source = String(context.source || context.route || '').trim();
    const vscodeMode = /vscode|extension|chat/i.test(source);

    if (vscodeMode && /^(شغل|شغّل|شغلها|run|start|go|activate)$/i.test(text)) {
        return [
            `الطلب المختصر من المستخدم: "${text}".`,
            'المقصود في سياق VS Code هو تشغيل/فحص Sheikha Chat وتكامل الإكستنشن مع Git وAPI وSheikha-Core.',
            'أجب بتحليل واضح، خطوات تنفيذ، مخاطر، وفحص قبل الدمج أو النشر.'
        ].join('\n');
    }

    return text;
}

function isVscodeOperationalPrompt(prompt, context = {}) {
    const text = String(prompt || '').trim();
    const source = String(context.source || context.route || '').trim();
    const vscodeMode = /vscode|extension|chat/i.test(source);

    return vscodeMode && /^(شغل|شغّل|شغلها|اصلح|أصلح|fix|run|start|go|activate|merge|git|plug|video|vision|file\+?)$/i.test(text);
}

function buildFastOperationalAnswer({ prompt, context, gateway }) {
    const requestText = String(prompt || '').trim() || 'تشغيل';
    const modelOnline = Boolean(gateway && gateway.localModelOnline && gateway.sheikhaCoreInstalled);

    return {
        success: true,
        provider: 'Sheikha-Core',
        model: DEFAULT_MODEL,
        mode: 'governed-fast-operational',
        localModelOnline: modelOnline,
        fallbackReason: null,
        governance: governanceEnvelope(),
        context,
        output: [
            'تحليل Sheikha:',
            `تم استلام أمر التشغيل "${requestText}" من VS Code. السيرفر مفعل، وبوابة Sheikha-Core حالتها: ${modelOnline ? 'online' : 'local model not ready'}.`,
            'الهوية والمعمارية الجديدة مفعلة داخل حوكمة Sheikha Universal Divine-Inspired Governance وتُعرض كجزء من شبكة الخلايا الجذرية.',
            '',
            'خطوات التنفيذ:',
            '1. الشات يستخدم /api/sheikha/chat كمسار أساسي ويعود إلى /api/sheikha/ai-gateway/ask عند الحاجة.',
            '2. التكاملات تعرض حالة Sheikha-Core وGit والـ API داخل واجهة الإكستنشن.',
            '3. Ollama يجب أن يبقى شغالاً عبر PM2 باسم sheikha-ollama، والنموذج المطلوب هو Sheikha-Core:latest.',
            '4. عند الضغط على Merge أو Git أو Plug أو Vision أو File+ يتم إرسال Prompt تشغيلي واضح بدل أمر مبهم.',
            '',
            'المخاطر:',
            '- نموذج 8B على CPU قد يتأخر؛ لذلك هذا المسار التشغيلي السريع يمنع تعليق واجهة VS Code.',
            '- لا يتم تنفيذ commit أو merge أو نشر تلقائي من الشات بدون مراجعة بشرية.',
            '- أي توقف في Ollama يجب أن يظهر في status بدلاً من إخفائه.',
            '',
            'فحص قبل الدمج أو النشر:',
            '1. تحقق من /api/sheikha/ai-gateway/status وأن localModelOnline=true.',
            '2. جرّب /api/sheikha/chat برسالة قصيرة وتأكد أن provider=Sheikha-Core.',
            '3. شغّل node --check على ملفات الإكستنشن والبوابة والراوتر.',
            '4. راجع git status قبل أي commit أو push.'
        ].join('\n'),
        timestamp: new Date().toISOString()
    };
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
            : buildGovernedFallbackAnswer({ prompt, reason }),
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

async function askSheikhaCore({ prompt, message, instruction, input, mode, model = DEFAULT_MODEL, context = {} }) {
    prompt = prompt || message || instruction || input;

    if (!prompt || typeof prompt !== 'string') {
        return {
            success: false,
            error: 'invalid_prompt',
            message: 'prompt أو message مطلوب'
        };
    }

    const effectiveContext = {
        ...context,
        mode: context.mode || mode || 'chat'
    };

    if (mode === 'chat' && !effectiveContext.source) {
        effectiveContext.source = 'api-ai-gateway-chat';
    }

    const effectivePrompt = enrichOperationalPrompt(prompt, effectiveContext);
    const gateway = await getSheikhaGatewayStatus();

    if (isVscodeOperationalPrompt(prompt, effectiveContext)) {
        return buildFastOperationalAnswer({ prompt, context: effectiveContext, gateway });
    }

    if (isCanonicalIdentityPrompt(effectivePrompt)) {
        return {
            success: true,
            provider: 'Sheikha-Core',
            model,
            mode: 'canonical-governed-identity',
            localModelOnline: Boolean(gateway.localModelOnline && gateway.sheikhaCoreInstalled),
            fallbackReason: null,
            governance: governanceEnvelope(),
            context: effectiveContext,
            output: canonicalSheikhaCoreAnswer(effectivePrompt),
            timestamp: new Date().toISOString()
        };
    }

    const body = {
        model,
        prompt: buildRawLlamaPrompt({
            system: buildSheikhaCoreSystemPrompt(effectiveContext),
            prompt: effectivePrompt
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
            prompt: effectivePrompt,
            model,
            context: effectiveContext,
            reason: err.name === 'AbortError' ? 'ollama_timeout' : err.message
        });
    }

    const { response, data } = ollamaResult;

    if (!response.ok) {
        return buildFallbackResponse({
            prompt: effectivePrompt,
            model,
            context: effectiveContext,
            reason: `ollama_http_${response.status}`
        });
    }

    return {
        success: true,
        provider: 'Sheikha-Core',
        model,
        mode: 'governed-local-ai',
        localModelOnline: true,
        fallbackReason: null,
        governance: governanceEnvelope(),
        context: effectiveContext,
        output: data.response || '',
        timestamp: new Date().toISOString(),
        poweredBy: 'SHEIKHA — عنصر الحياة الرقمية'
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
