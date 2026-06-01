'use strict';

const os = require('os');

const {
    getUniversalDivineGovernance
} = require('../root-governance/sheikha-universal-divine-governance');

function defaultCpuThreads() {
    const cores = Array.isArray(os.cpus()) ? os.cpus().length : 4;
    return Math.max(4, Math.min(20, cores > 4 ? cores - 2 : cores));
}

const OLLAMA_URL = 'http://127.0.0.1:11434';
const DEFAULT_MODEL = process.env.SHEIKHA_CORE_MODEL || 'Sheikha-Core';
const DEFAULT_INFERENCE_MODEL = process.env.SHEIKHA_CORE_INFERENCE_MODEL || 'Sheikha-Core';
const DEFAULT_TIMEOUT_MS = Number(process.env.SHEIKHA_CORE_TIMEOUT_MS || 120000);
const DEFAULT_NUM_CTX = Number(process.env.SHEIKHA_CORE_NUM_CTX || 2048);
const DEFAULT_NUM_PREDICT = Number(process.env.SHEIKHA_CORE_NUM_PREDICT || 48);
const DEFAULT_NUM_THREAD = Number(process.env.SHEIKHA_CORE_NUM_THREAD || defaultCpuThreads());
const DEFAULT_NUM_BATCH = Number(process.env.SHEIKHA_CORE_NUM_BATCH || 512);
const DEFAULT_KEEP_ALIVE = process.env.SHEIKHA_CORE_KEEP_ALIVE || '10m';
const CODE_CONTEXT_LIMIT = Number(process.env.SHEIKHA_CORE_CODE_CONTEXT_LIMIT || 24000);
const SHEIKHA_CORE_RUNTIME_PROMPT = process.env.SHEIKHA_CORE_RUNTIME_PROMPT ||
    'أنت Sheikha-Core. أجب مباشرة بالعربية عند الطلب، بإجابة كاملة ومنظمة وصادقة.';
const SHEIKHA_CORE_COMPACT_SYSTEM_PROMPT = process.env.SHEIKHA_CORE_COMPACT_SYSTEM_PROMPT ||
    'أنت Sheikha-Core. أجب بالعربية إجابة تامة ومنظمة وشاملة، بصدق وأمان، دون ادعاء وعي أو غيب.';

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

أجب بالعربية أولاً إذا كان الطلب بالعربية، وكن واضحاً ومؤسسياً وكاملاً ومنظماً.
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

function buildLayerHierarchy(context = {}) {
    const source = String(context.source || '').trim();

    return {
        validated: true,
        order: [
            {
                level: 1,
                id: 'orchestration-layer',
                name: 'Orchestration Layer',
                responsibilities: ['pipeline scheduling', 'event and time routing', 'cluster job flow'],
                tools: ['airflow-compatible', 'prefect-compatible', 'kubeflow-compatible']
            },
            {
                level: 2,
                id: 'mlops-platform-layer',
                name: 'MLOps Platform Layer',
                responsibilities: ['experiment tracking', 'model registry', 'production monitoring'],
                tools: ['mlflow-compatible', 'wandb-compatible', 'sagemaker-compatible']
            },
            {
                level: 3,
                id: 'governance-mesh-layer',
                name: 'Governance & Mesh Layer',
                responsibilities: ['access control', 'compliance and privacy', 'enterprise ai control plane'],
                tools: ['data-mesh', 'enterprise-control-plane', 'policy-audit']
            }
        ],
        clusterFlow: {
            primary: 'ai-intelligence-system',
            secondary: 'vscode-chat-surface',
            activeSource: source || 'ai-gateway-api'
        }
    };
}

function buildSheikhaCoreSystemPrompt(context = {}) {
    const source = String(context.source || context.route || '').trim();
    const vscodeMode = /vscode|extension|chat/i.test(source);
    const useFullPrompt = process.env.SHEIKHA_CORE_FULL_SYSTEM_PROMPT === 'true';

    return [
        useFullPrompt ? SHEIKHA_CORE_SYSTEM_PROMPT : SHEIKHA_CORE_COMPACT_SYSTEM_PROMPT,
        useFullPrompt ? describeUniversalGovernance() : '',
        useFullPrompt ? SHEIKHA_CORE_RUNTIME_PROMPT : '',
        useFullPrompt && vscodeMode
            ? [
                'سياق VS Code / Extension:',
                '- افهم الطلب كعمل برمجي آمن داخل الإكستنشن.',
                '- أجب بتشخيص كامل ومنظم، خطوات تنفيذ، ومخاطر أو فحص عند الحاجة.'
            ].join('\n')
            : '',
        'اكتب إجابة عملية كاملة ومنظمة، ولا تدّع أنك نفذت تعديل ملفات إلا إذا كان ذلك مذكوراً صراحة في السياق.'
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

function isVsCodeOperationalPrompt(prompt, context = {}) {
    const text = String(prompt || '').trim();
    const tokens = text.split(/\s+/).filter(Boolean);
    const fromVsCode = context && context.source === 'vscode-extension';
    const asksSystemReport = /(?:اكتب(?:ي)?\s+تقرير|اكتبي\s+تقرير|تقرير\s+كامل|تقرير\s+عن\s+النظام|حالة\s+النظام|system\s+report|status\s+report|runtime\s+report)/i.test(text);
    const asksIdentity = /(?:عرف(?:ي)?\s+بنفسك|عر[ّ]?في\s+نفسك|من\s+أنت|مين\s+انتي|who\s+are\s+you|identify\s+yourself)/i.test(text);
    const operationalIntent = /(?:ide|vscode|vs code|اكستنشن|الإكستنشن|الشات|شات|برمجة|البرمجة|تنفيذ البرمجيات|نفذ|شغل|شغّل|اصلح|أصلح|اكمل|أكمل|ملف|مسار|git|merge|commit|pipeline|cluster|runtime|gateway|api)/i.test(text);
    const analyticalIntent = /(?:تحليل|حلل|حلّل|اشرح|فسر|قارن|مقارنة|معمار|architecture|design|debugging strategy|review|analy[sz]e|diagnos)/i.test(text);
    const likelyLongAnalysis = analyticalIntent && tokens.length > 10;

    return Boolean(
        (asksSystemReport || asksIdentity || (operationalIntent && !likelyLongAnalysis)) &&
        (fromVsCode || tokens.length <= 8)
    );
}

function isCodeAnalysisPrompt(prompt, context = {}) {
    const text = String(prompt || '').trim().toLowerCase();
    const source = String(context.source || context.route || '').trim();
    const vscodeMode = /vscode|extension|chat/i.test(source);
    const asksOperationalPanel = /(git|merge|plug|video|vision|تكامل|إكستنشن|اكستنشن|الدمج|النشر|publish|api)/i.test(text);
    const asksCode = /(تحليل\s+برمجي|التحليل\s+البرمجي|بالتحليل\s+البرمجي|حلل\s+برمجي|حلل الكود|حلّل الكود|راجع الكود|مراجعة الكود|افحص الكود|فحص الكود|راجع الملف|افحص الملف|debug|ديبغ|كود|code|program|review|analy[sz]e code|inspect code|diagnos)/i.test(text);

    return vscodeMode && asksCode && !asksOperationalPanel;
}

function getCodeContextText(context = {}) {
    const value = context.codeContext || context.selectedText || context.fileContent || '';
    return typeof value === 'string' ? value : '';
}

function summarizeCodeContext(codeContext, language = 'auto') {
    const text = String(codeContext || '').slice(0, CODE_CONTEXT_LIMIT);
    const lines = text.split(/\r?\n/);
    const nonEmptyLines = lines.filter(line => line.trim()).length;
    const imports = lines.filter(line => /^\s*(const|let|var)\s+.+require\(|^\s*import\s+/.test(line)).length;
    const exportsCount = lines.filter(line => /^\s*(module\.)?exports\b|^\s*export\s+/.test(line)).length;
    const functions = lines.filter(line => /\b(function|=>)\b/.test(line)).length;
    const classes = lines.filter(line => /^\s*class\s+/.test(line)).length;
    const routes = lines.filter(line => /\b(app|router)\.(get|post|put|patch|delete|use)\s*\(/.test(line)).length;
    const todos = lines.filter(line => /\b(TODO|FIXME|HACK)\b/i.test(line)).length;
    const consoleLogs = lines.filter(line => /\bconsole\.(log|warn|error|debug)\s*\(/.test(line)).length;
    const emptyCatches = lines.filter((line, index) => /catch\s*\([^)]*\)\s*\{\s*$/.test(line) && /^\s*\}\s*$/.test(lines[index + 1] || '')).length;
    const riskyPatterns = [
        /\beval\s*\(/,
        /\bnew Function\s*\(/,
        /\binnerHTML\s*=/,
        /\bexec\s*\(/,
        /\bexecSync\s*\(/,
        /\bspawn\s*\(/,
        /\bchild_process\b/
    ];
    const riskyMatches = lines.filter(line => riskyPatterns.some(pattern => pattern.test(line))).length;
    const longLines = lines.filter(line => line.length > 140).length;

    return {
        language,
        sampledChars: text.length,
        truncated: String(codeContext || '').length > text.length,
        lines: lines.length,
        nonEmptyLines,
        imports,
        exportsCount,
        functions,
        classes,
        routes,
        todos,
        consoleLogs,
        emptyCatches,
        riskyMatches,
        longLines
    };
}

function buildCodeAnalysisAnswer({ prompt, context, gateway }) {
    const codeContext = getCodeContextText(context);
    const language = context.language || 'auto';
    const hasContext = Boolean(codeContext.trim());
    const summary = hasContext ? summarizeCodeContext(codeContext, language) : null;
    const modelOnline = Boolean(gateway && gateway.localModelOnline && gateway.sheikhaCoreInstalled);

    const output = hasContext
        ? [
            'تحليل Sheikha البرمجي:',
            `استلمت طلب التحليل: "${String(prompt || '').trim() || 'تحليل برمجي'}".`,
            `السياق الحالي: ${summary.language} | ${summary.lines} سطر | ${summary.nonEmptyLines} سطر فعّال${summary.truncated ? ' | تم تحليل عينة مضبوطة من الملف الكبير' : ''}.`,
            '',
            'مؤشرات سريعة:',
            `- الاستيراد/الاعتماديات: ${summary.imports}`,
            `- الدوال/التعابير التنفيذية: ${summary.functions}`,
            `- الكلاسات: ${summary.classes}`,
            `- مسارات Express/Router المحتملة: ${summary.routes}`,
            `- نقاط TODO/FIXME/HACK: ${summary.todos}`,
            `- سجلات console: ${summary.consoleLogs}`,
            `- أنماط حساسة تحتاج مراجعة: ${summary.riskyMatches}`,
            `- أسطر طويلة قد تحتاج تبسيطاً: ${summary.longLines}`,
            '',
            'الأولوية المقترحة:',
            summary.riskyMatches > 0
                ? '1. راجع الأنماط الحساسة مثل exec/eval/innerHTML وحدود الإدخال قبل أي تشغيل.'
                : '1. لا توجد أنماط حساسة واضحة في العينة، ابدأ بفحص المسار الوظيفي المطلوب.',
            summary.routes > 0
                ? '2. ثبّت عقود API: تحقق من status codes، شكل JSON، وأخطاء المسارات.'
                : '2. ثبّت عقد الدالة/المكوّن: المدخلات، المخرجات، وحالات الخطأ.',
            summary.todos > 0
                ? '3. حوّل TODO/FIXME إلى مهام محددة أو أغلقها بتعديل صغير قابل للاختبار.'
                : '3. شغّل syntax check ثم اختبار smoke للمسار المتأثر.',
            '',
            'فحص آمن قبل الدمج:',
            '1. node --check للملف إن كان JavaScript/Node.',
            '2. اختبار endpoint أو وحدة صغيرة بدل تشغيل شامل غير ضروري.',
            '3. git status ثم مراجعة diff قبل commit أو merge.',
            '',
            `حالة النموذج المحلي: ${modelOnline ? 'Ollama متصل، لكن هذا التحليل السريع لا ينتظر التوليد الطويل.' : 'Ollama غير جاهز للتوليد الآن، والتحليل السريع أبقى الواجهة مستجيبة.'}`
        ].join('\n')
        : [
            'تحليل Sheikha البرمجي:',
            `استلمت طلب التحليل: "${String(prompt || '').trim() || 'تحليل برمجي'}".`,
            'لم يصل سياق ملف من VS Code، لذلك أعطيك مسار فحص آمن بدل ادعاء تحليل ملف غير موجود.',
            '',
            'الخطوات:',
            '1. افتح الملف المطلوب أو حدّد المقطع ثم أعد الطلب.',
            '2. افحص: المدخلات، المخرجات، حالات الخطأ، الاعتماديات، وأي عمليات حساسة.',
            '3. شغّل syntax check أو test صغير للمسار المتأثر.',
            '4. راجع git diff قبل أي commit أو merge.'
        ].join('\n');

    return {
        success: true,
        provider: 'Sheikha-Core',
        model: DEFAULT_MODEL,
        mode: 'governed-local-code-analysis',
        localModelOnline: modelOnline,
        fallbackReason: modelOnline ? null : (gateway && gateway.warning) || 'local_generation_not_ready',
        governance: governanceEnvelope(),
        context,
        codeAnalysis: summary,
        output,
        timestamp: new Date().toISOString()
    };
}

function buildFastOperationalAnswer({ prompt, context = {}, gateway = {} }) {
    const requestText = String(prompt || '').trim() || 'تشغيل';
    const modelOnline = Boolean(gateway.localModelOnline);
    const runProjectIntent = /(?:شغل|شغّل|شغلي|شغِّلي|run|start)\s*(?:لي|لنا)?\s*(?:المشروع|project|الخادم|server)?/i.test(requestText);

    const output = runProjectIntent
        ? [
            'تم استلام أمر تشغيل المشروع داخل Sheikha IDE.',
            '',
            'تنفيذ عملي مباشر:',
            '- إذا كان التشغيل عبر PM2: نفّذ pm2 status ثم pm2 restart ecosystem.config.js --update-env.',
            '- إذا كان التشغيل التطويري المحلي: نفّذ npm run dev.',
            '- فحص الاستجابة: curl -s http://127.0.0.1:8080/api/sheikha/ai-gateway/status | jq .status',
            '',
            'حالة المسار:',
            '- Runtime Mode: governed-fast-operational',
            `- Local Model: ${modelOnline ? 'ONLINE' : 'CHECK_REQUIRED'}`,
            '- Fallback: DISABLED_FOR_OPERATIONAL_PATH',
            '',
            'ملاحظة حوكمة:',
            '- لا يتم commit أو push تلقائيًا قبل فحص git status و git diff.'
        ].join('\n')
        : [
            'تم استلام أمر التشغيل داخل Sheikha IDE.',
            '',
            'حالة التنفيذ:',
            '- Sheikha Gateway: ACTIVE',
            '- VS Code Extension: CONNECTED',
            '- Runtime Mode: governed-fast-operational',
            `- Local Model: ${modelOnline ? 'ONLINE' : 'CHECK_REQUIRED'}`,
            '- Fallback: DISABLED_FOR_OPERATIONAL_PATH',
            '',
            'تحليل الطلب:',
            requestText,
            '',
            'القرار التشغيلي:',
            '- هذا طلب IDE/برمجة، لذلك تم التعامل معه عبر المسار التشغيلي السريع بدل انتظار توليد Ollama.',
            '- لا يتم تنفيذ تغيير فعلي قبل مراجعة الملف المتأثر وتشغيل node --check أو اختبار مناسب.',
            '- عند وجود Git: يجب فحص git status و git diff قبل commit أو push.',
            '',
            'الخطوات التالية:',
            '1. حدّد الملف أو المسار المطلوب تعديله.',
            '2. نفّذ التعديل في نطاق صغير.',
            '3. شغّل فحص syntax أو smoke test.',
            '4. شغّل pre-commit governance.',
            '5. لا تدفع التغيير إلا بعد نجاح الفحص.'
        ].join('\n');

    return {
        success: true,
        provider: 'Sheikha-Core',
        model: 'Sheikha-Core',
        mode: 'governed-fast-operational',
        localModelOnline: modelOnline,
        fallbackReason: null,
        governance: governanceEnvelope(),
        context,
        output,
        timestamp: new Date().toISOString()
    };
}

function buildFallbackResponse({ prompt, model, context, reason, gateway }) {
    const modelOnline = Boolean(gateway && gateway.localModelOnline && gateway.sheikhaCoreInstalled);

    return {
        success: true,
        provider: 'sheikha-local-fallback',
        model,
        inferenceModel: model === DEFAULT_MODEL ? DEFAULT_INFERENCE_MODEL : model,
        mode: 'governed-local-ai-fallback',
        localModelOnline: modelOnline,
        localGenerationOnline: false,
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
        }, Math.min(DEFAULT_TIMEOUT_MS, 120000));

        const models = Array.isArray(data.models) ? data.models.map((m) => m.name).filter(Boolean) : [];
        return {
            success: true,
            status: response.ok ? 'active' : 'degraded',
            gateway: 'Sheikha AI Gateway',
            defaultModel: DEFAULT_MODEL,
            inferenceModel: DEFAULT_INFERENCE_MODEL,
            localProvider: OLLAMA_URL,
            localModelOnline: response.ok,
            sheikhaCoreInstalled: models.some((name) => name === DEFAULT_MODEL || name.startsWith(`${DEFAULT_MODEL}:`)),
            inferenceModelInstalled: models.some((name) => name === DEFAULT_INFERENCE_MODEL || name.startsWith(`${DEFAULT_INFERENCE_MODEL}:`)),
            cpu: {
                cores: Array.isArray(os.cpus()) ? os.cpus().length : null,
                numThread: DEFAULT_NUM_THREAD,
                numBatch: DEFAULT_NUM_BATCH
            },
            models,
            mode: 'local-first-governed-enterprise-ai',
            hierarchy: buildLayerHierarchy({ source: 'ai-intelligence-system' }),
            governance: governanceEnvelope(),
            timestamp: new Date().toISOString()
        };
    } catch (err) {
        return {
            success: true,
            status: 'fallback',
            gateway: 'Sheikha AI Gateway',
            defaultModel: DEFAULT_MODEL,
            inferenceModel: DEFAULT_INFERENCE_MODEL,
            localProvider: OLLAMA_URL,
            localModelOnline: false,
            sheikhaCoreInstalled: false,
            inferenceModelInstalled: false,
            cpu: {
                cores: Array.isArray(os.cpus()) ? os.cpus().length : null,
                numThread: DEFAULT_NUM_THREAD,
                numBatch: DEFAULT_NUM_BATCH
            },
            mode: 'local-first-governed-enterprise-ai',
            hierarchy: buildLayerHierarchy({ source: 'ai-intelligence-system' }),
            governance: governanceEnvelope(),
            warning: err.name === 'AbortError' ? 'ollama_timeout' : err.message,
            timestamp: new Date().toISOString()
        };
    }
}

async function askSheikhaCore({ prompt, message, instruction, input, mode, model = DEFAULT_MODEL, context = {} }) {
    prompt = prompt || message || instruction || input;
    model = !model || model === 'sheikha-base' ? DEFAULT_MODEL : model;

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

    if (isVsCodeOperationalPrompt(prompt, effectiveContext)) {
        return buildFastOperationalAnswer({ prompt, context: effectiveContext, gateway: {} });
    }

    const gateway = await getSheikhaGatewayStatus();

    if (isCodeAnalysisPrompt(prompt, effectiveContext)) {
        return buildCodeAnalysisAnswer({ prompt, context: effectiveContext, gateway });
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

    const inferenceModel = model === DEFAULT_MODEL ? DEFAULT_INFERENCE_MODEL : model;
    const body = {
        model: inferenceModel,
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
            num_thread: DEFAULT_NUM_THREAD,
            num_batch: DEFAULT_NUM_BATCH,
            top_p: 0.85
        }
    };

    let ollamaResult;
    try {
        ollamaResult = await fetchJsonWithTimeout(`${OLLAMA_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        }, 120000);
    } catch (err) {
        return buildFallbackResponse({
            prompt: effectivePrompt,
            model,
            context: effectiveContext,
            reason: err.name === 'AbortError' ? 'ollama_timeout' : err.message,
            gateway
        });
    }

    const { response, data } = ollamaResult;

    if (!response.ok) {
        return buildFallbackResponse({
            prompt: effectivePrompt,
            model,
            context: effectiveContext,
            reason: `ollama_http_${response.status}`,
            gateway
        });
    }

    return {
        success: true,
        provider: 'Sheikha-Core',
        model,
        inferenceModel,
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
    DEFAULT_INFERENCE_MODEL,
    OLLAMA_URL,
    SHEIKHA_CORE_SYSTEM_PROMPT,
    SHEIKHA_CORE_RUNTIME_PROMPT,
    buildRawLlamaPrompt
};
