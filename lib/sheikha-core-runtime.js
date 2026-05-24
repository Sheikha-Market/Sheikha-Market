'use strict';

const { getCertifiedAiProviderCertificate } = require('./sheikha-ai-service-provider-runtime');
const { getEnterpriseIdeRuntimeStatus } = require('./sheikha-enterprise-ide-runtime');
const { getUniversalToolsFabricStatus } = require('./sheikha-universal-tools-fabric');

let sheikhaCoreActive = true;
const usageCounters = {
    requests: 0,
    tokensEstimated: 0,
    toolCalls: 0,
    lastEventAt: null
};

const SHEIKHA_CORE_COMPONENTS = {
    sheikhaCore: {
        name: 'Sheikha-Core',
        role: 'native-ai-operating-kernel',
        status: 'active'
    },
    providerApiKeys: {
        name: 'Sheikha Provider API Keys',
        role: 'vault-backed-provider-key-policy',
        status: 'governed',
        env: ['SHEIKHA_PROVIDER_KEY', 'OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'OLLAMA_HOST'],
        rule: 'لا تعرض المفاتيح ولا تحفظها داخل Git؛ تستخدم متغيرات بيئة أو vault فقط.'
    },
    usageMetering: {
        name: 'Usage Metering',
        role: 'requests-tokens-tools-accounting',
        status: 'active'
    },
    enterpriseAuth: {
        name: 'Enterprise Auth',
        role: 'tenant-role-policy-access',
        status: 'governed',
        modes: ['local-owner', 'enterprise-tenant', 'service-account']
    },
    multiModelRouter: {
        name: 'Multi-Model Router',
        role: 'route-local-managed-hybrid-models',
        status: 'active',
        routes: ['sheikha-core', 'local-ollama', 'managed-openai-compatible', 'managed-anthropic-compatible', 'fallback-rule-based']
    },
    gpuScheduler: {
        name: 'GPU Scheduler',
        role: 'gpu-queue-resource-policy',
        status: 'ready',
        policy: 'لا يحجز GPU إلا بعد فحص الموارد والموافقة.'
    },
    localVectorMemory: {
        name: 'Local Vector Memory',
        role: 'local-rag-index-memory',
        status: 'ready',
        storagePolicy: 'local-private-indexes-with-redaction'
    },
    sheikhaCloudNode: {
        name: 'Sheikha Cloud Node',
        role: 'cloud-node-federation',
        status: 'planned-active-adapter',
        policy: 'لا يتصل بسحابة خارجية بلا مفاتيح وصلاحيات وموافقة.'
    },
    sheikhaIdeRuntime: {
        name: 'Sheikha IDE Runtime',
        role: 'model-inside-development-tools',
        status: 'active'
    },
    localRagStack: {
        name: 'Local RAG Stack',
        role: 'retrieval-augmented-local-knowledge',
        status: 'ready',
        sources: ['docs', 'code', 'architecture', 'registry', 'approved knowledge']
    },
    internalRegistryGovernance: {
        name: 'Internal Registry & Governance Engine',
        role: 'runtime-registry-policy-audit',
        status: 'active'
    },
    sheikhaEditor: {
        name: 'Sheikha Editor',
        role: 'governed-code-and-document-editor',
        status: 'active',
        capabilities: ['edit-plan', 'safe-refactor', 'documentation', 'translation', 'diff-aware-changes']
    }
};

const SHEIKHA_AI_FOUNDATION_RULES = {
    tawheed: 'الله وحده الخالق والمالك، والتقنية سبب وأداة لا تستقل ولا تدعي علم الغيب.',
    knowledge: 'لا حكم بلا علم، ولا تنفيذ بلا تحقق.',
    data: 'البيانات أمانة: تصنيف، خصوصية، منع تسريب، منع تضليل.',
    algorithms: 'الخوارزميات أدوات قياس وتحليل، وتخضع للتفسير والمراجعة.',
    models: 'النماذج لا تدعي وعياً ولا يقيناً مطلقاً؛ مخرجاتها توصيات قابلة للمراجعة.',
    safety: 'لا ضرر ولا ضرار، وكل تشغيل صناعي أو روبوتي يحتاج حدود أمان ومراجعة إنسان.',
    commerce: 'كل خدمة تجارية يجب أن تكون مباحة، واضحة، عادلة، وخالية من الغش والربا والظلم.',
    release: 'لا نشر ولا دمج ولا تشغيل مؤثر بلا موافقة المالك.'
};

function getConfiguredProviderSignals() {
    return {
        sheikhaProviderKey: Boolean(process.env.SHEIKHA_PROVIDER_KEY),
        openai: Boolean(process.env.OPENAI_API_KEY),
        anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
        ollama: Boolean(process.env.OLLAMA_HOST || process.env.AI_LLM_BASE_URL),
        local: true
    };
}

function getSheikhaCoreStatus(options = {}) {
    const extensions = Array.isArray(options.extensions) ? options.extensions : [];
    const providerCertificate = getCertifiedAiProviderCertificate({
        cwd: options.cwd || process.cwd(),
        extensions
    });
    const ide = getEnterpriseIdeRuntimeStatus({
        cwd: options.cwd || process.cwd(),
        extensions,
        modelMode: options.modelMode || 'hybrid'
    });
    const toolsFabric = getUniversalToolsFabricStatus({
        cwd: options.cwd || process.cwd(),
        extensions,
        modelMode: options.modelMode || 'hybrid'
    });

    return {
        success: true,
        coreId: 'sheikha-core',
        name: 'Sheikha-Core',
        nameAr: 'نواة Sheikha للذكاء الصناعي',
        status: sheikhaCoreActive ? 'active' : 'inactive',
        mode: 'root-neural-ai-operating-kernel',
        providerCertification: providerCertificate.certificate,
        components: SHEIKHA_CORE_COMPONENTS,
        providerSignals: getConfiguredProviderSignals(),
        usageMetering: usageCounters,
        aiFoundationRules: SHEIKHA_AI_FOUNDATION_RULES,
        rootNeuralIntegration: {
            active: sheikhaCoreActive,
            fabric: toolsFabric.fabricId,
            toolsCount: toolsFabric.toolsCount,
            role: 'توحيد الأساسيات والقواعد والنماذج والأدوات تحت شبكة الخلايا العصبية الجذرية.'
        },
        ideRuntime: {
            status: ide.status,
            modelRuntime: ide.modelRuntime,
            subscriptionTiers: ide.subscriptionTiers
        },
        architecture: {
            layers: [
                'Tawheed and Governance Canon',
                'Sheikha-Core Kernel',
                'Provider API Keys and Enterprise Auth',
                'Multi-Model Router',
                'GPU Scheduler',
                'Local Vector Memory and RAG',
                'MCP SDK Tools',
                'Sheikha IDE Runtime and Editor',
                'Registry and Usage Metering',
                'Cloud Node and Enterprise Delivery'
            ]
        },
        timestamp: new Date().toISOString()
    };
}

function activateSheikhaCore(options = {}) {
    sheikhaCoreActive = Object.prototype.hasOwnProperty.call(options, 'active')
        ? Boolean(options.active)
        : true;
    return {
        ...getSheikhaCoreStatus(options),
        activation: {
            active: sheikhaCoreActive,
            message: sheikhaCoreActive
                ? 'تم تفعيل Sheikha-Core ونواة الذكاء الصناعي وشبكة الخلايا العصبية الجذرية.'
                : 'تم إيقاف Sheikha-Core مؤقتًا.'
        }
    };
}

function buildSheikhaCoreArchitecture(options = {}) {
    const target = options.target || 'SHEIKHA UGIT-RP';
    return {
        success: true,
        target,
        architectureId: 'sheikha-core-ai-foundations-blueprint',
        name: 'Sheikha-Core AI Foundations and Rules Blueprint',
        principles: SHEIKHA_AI_FOUNDATION_RULES,
        components: Object.values(SHEIKHA_CORE_COMPONENTS).map(component => ({
            name: component.name,
            role: component.role,
            status: component.status
        })),
        phases: [
            'establish-tawheed-governance-canon',
            'activate-sheikha-core-kernel',
            'bind-provider-keys-and-auth',
            'route-models-local-managed-hybrid',
            'enable-vector-memory-and-rag',
            'schedule-gpu-resources-safely',
            'activate-sheikha-editor-and-ide-runtime',
            'register-tools-and-policies',
            'meter-usage-and-audit',
            'publish-as-certified-ai-provider-after-human-approval'
        ],
        timestamp: new Date().toISOString()
    };
}

function getSheikhaEditorStatus(options = {}) {
    return {
        success: true,
        editorId: 'sheikha-editor',
        name: 'Sheikha Editor',
        status: sheikhaCoreActive ? 'active' : 'inactive',
        mode: 'governed-ai-editor',
        capabilities: SHEIKHA_CORE_COMPONENTS.sheikhaEditor.capabilities,
        integrations: ['Sheikha IDE Runtime', 'Git diff review', 'MCP SDK', 'Local RAG Stack', 'Root Neural Cells'],
        rules: [
            'لا تعديل بلا فهم الملف والمسار',
            'لا كتابة أسرار',
            'لا refactor واسع بلا موافقة',
            'كل تعديل مؤثر يمر عبر diff ومراجعة'
        ],
        context: options.context || 'workspace',
        timestamp: new Date().toISOString()
    };
}

function getUsageMeteringStatus() {
    return {
        success: true,
        meterId: 'sheikha-usage-metering',
        status: 'active',
        counters: usageCounters,
        dimensions: ['tenant', 'workspace', 'model', 'tool', 'endpoint', 'estimatedTokens'],
        timestamp: new Date().toISOString()
    };
}

function recordUsageEvent(options = {}) {
    const estimatedTokens = Number.isFinite(Number(options.estimatedTokens))
        ? Number(options.estimatedTokens)
        : 0;
    usageCounters.requests += 1;
    usageCounters.tokensEstimated += Math.max(0, estimatedTokens);
    usageCounters.toolCalls += options.tool ? 1 : 0;
    usageCounters.lastEventAt = new Date().toISOString();
    return getUsageMeteringStatus();
}

function buildProviderKeysPolicy() {
    return {
        success: true,
        policyId: 'sheikha-provider-api-keys-policy',
        status: 'active',
        keys: SHEIKHA_CORE_COMPONENTS.providerApiKeys.env.map(name => ({
            name,
            configured: Boolean(process.env[name]),
            storage: 'environment-or-vault',
            exposed: false
        })),
        rotation: ['create-in-vault', 'deploy-env', 'restart-runtime', 'verify-health', 'revoke-old-key'],
        rules: SHEIKHA_CORE_COMPONENTS.providerApiKeys.rule,
        timestamp: new Date().toISOString()
    };
}

module.exports = {
    SHEIKHA_CORE_COMPONENTS,
    SHEIKHA_AI_FOUNDATION_RULES,
    getSheikhaCoreStatus,
    activateSheikhaCore,
    buildSheikhaCoreArchitecture,
    getSheikhaEditorStatus,
    getUsageMeteringStatus,
    recordUsageEvent,
    buildProviderKeysPolicy
};
