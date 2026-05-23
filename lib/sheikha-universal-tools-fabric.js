'use strict';

const {
    getEnterpriseIdeRuntimeStatus,
    buildEnterpriseDevelopmentEnvironment,
    buildIndustryAndTechnologyServicesPlan
} = require('./sheikha-enterprise-ide-runtime');
const {
    getCertifiedAiProviderCertificate,
    getAiServiceProviderStatus
} = require('./sheikha-ai-service-provider-runtime');
const { getGoverningOsLayerStatus } = require('./sheikha-governing-os-layer');

let fabricActive = true;

const SHEIKHA_UNIVERSAL_TOOL_CATEGORIES = {
    ide: {
        name: 'IDE and Developer Tools',
        nameAr: 'بيئات التطوير وأدوات المبرمج',
        tools: ['Sheikha IDE', 'VS Code', 'extensions', 'debugger', 'terminal', 'snippets', 'syntax', 'workspace']
    },
    ai: {
        name: 'AI and Model Runtime',
        nameAr: 'الذكاء الصناعي وتشغيل النماذج',
        tools: ['Sheikha AI Provider', 'root neural cells', 'MCP SDK', 'agents', 'RAG', 'local model', 'managed model', 'hybrid model']
    },
    programming: {
        name: 'Programming and Markup',
        nameAr: 'البرمجة والترميز',
        tools: ['Sheikha Sabil', 'Sheikha Bayan', 'JavaScript', 'TypeScript', 'Python', 'PHP', 'Go', 'C#', 'Java', 'Rust', 'SQL', 'Bash', 'HTML', 'CSS', 'Markdown', 'JSON', 'YAML', 'XML']
    },
    git: {
        name: 'Git and Delivery',
        nameAr: 'Git والتسليم المؤسسي',
        tools: ['Git', 'GitHub', 'GitLab', 'PR', 'MR', 'diff review', 'release plan', 'artifact hash']
    },
    data: {
        name: 'Data Fabric',
        nameAr: 'نسيج البيانات',
        tools: ['structured data', 'semi-structured data', 'unstructured data', 'schemas', 'classification', 'redaction', 'audit']
    },
    os: {
        name: 'Operating Systems and Packages',
        nameAr: 'أنظمة التشغيل والحزم',
        tools: ['Linux', 'Pop!_OS', 'Debian', 'Ubuntu', 'Red Hat', 'Fedora', 'SUSE', 'Windows', 'macOS', 'deb', 'rpm', 'tar.gz', 'snap', 'zip', 'dmg', 'cli']
    },
    cloud: {
        name: 'Cloud and Compute',
        nameAr: 'السحابة والحوسبة',
        tools: ['API gateway', 'containers', 'observability', 'deployment plan', 'runtime registry', 'service monitoring']
    },
    security: {
        name: 'Security and Governance',
        nameAr: 'الأمن والحوكمة',
        tools: ['no secrets', 'privacy', 'no harm', 'human approval', 'audit log', 'permission boundaries', 'release gates']
    },
    industry: {
        name: 'Industry, Robotics, and Factories',
        nameAr: 'الصناعة والروبوتات والمصانع',
        tools: ['factory planning', 'production lines', 'robotics plan', 'supply chain', 'quality gates', 'safety case', 'human override']
    },
    commerce: {
        name: 'Commercial Service Provider',
        nameAr: 'مزود الخدمة التجاري',
        tools: ['subscriptions', 'licensing', 'SLA', 'support', 'consulting', 'customer onboarding', 'delivery']
    }
};

const SHEIKHA_DIGITAL_QURAN_SUNNAH_CANON = {
    principle: 'توحيد القصد لله، والعمل بالحق والعدل، وجعل التقنية أداة نفع لا ضرر.',
    quranReferences: [
        { id: 'QS-001', ref: 'العلق 96:1-5', topic: 'العلم والتعلم' },
        { id: 'QS-002', ref: 'النساء 4:58', topic: 'الأمانة والعدل' },
        { id: 'QS-003', ref: 'الملك 67:15', topic: 'السعي والعمل في الأرض' },
        { id: 'QS-004', ref: 'المائدة 5:2', topic: 'التعاون على البر والتقوى' },
        { id: 'QS-005', ref: 'الإسراء 17:36', topic: 'التثبت وعدم اتباع ما لا علم به' }
    ],
    sunnahReferences: [
        { id: 'SN-001', ref: 'لا ضرر ولا ضرار', topic: 'منع الضرر' },
        { id: 'SN-002', ref: 'إن الله يحب إذا عمل أحدكم عملاً أن يتقنه', topic: 'الإتقان' },
        { id: 'SN-003', ref: 'الدين النصيحة', topic: 'النصح والمراجعة' }
    ],
    operatingGates: [
        'halal-scope',
        'no-harm',
        'privacy',
        'truthfulness',
        'human-review',
        'permission-boundaries',
        'auditability'
    ]
};

function flattenTools() {
    return Object.entries(SHEIKHA_UNIVERSAL_TOOL_CATEGORIES).flatMap(([categoryId, category]) => (
        category.tools.map(tool => ({
            categoryId,
            categoryName: category.name,
            categoryNameAr: category.nameAr,
            tool,
            status: 'governed-adapter-ready'
        }))
    ));
}

function getUniversalToolsFabricStatus(options = {}) {
    const extensions = Array.isArray(options.extensions) ? options.extensions : [];
    const ide = getEnterpriseIdeRuntimeStatus({
        cwd: options.cwd || process.cwd(),
        extensions,
        modelMode: options.modelMode || 'hybrid'
    });
    const provider = getAiServiceProviderStatus({
        cwd: options.cwd || process.cwd(),
        extensions
    });
    const certification = getCertifiedAiProviderCertificate({
        cwd: options.cwd || process.cwd(),
        extensions
    });
    const os = getGoverningOsLayerStatus({ extensions });
    const tools = flattenTools();

    return {
        success: true,
        fabricId: 'sheikha-universal-tools-fabric',
        name: 'Sheikha Universal Tools and Technologies Fabric',
        nameAr: 'نسيج Sheikha الشامل للأدوات والتقنيات',
        status: fabricActive ? 'active' : 'inactive',
        mode: 'root-neural-governed-universal-tool-integration',
        rootNeuralNetwork: {
            active: fabricActive,
            layer: 'Sheikha root neural cells',
            role: 'classification, planning, governance, and safe orchestration'
        },
        categories: SHEIKHA_UNIVERSAL_TOOL_CATEGORIES,
        toolsCount: tools.length,
        tools,
        digitalCanon: SHEIKHA_DIGITAL_QURAN_SUNNAH_CANON,
        integrations: {
            ide: { status: ide.status, modelRuntime: ide.modelRuntime },
            provider: { status: provider.status, certification: certification.certificate.status },
            os: { platforms: os.platforms, packageCount: os.packageCount }
        },
        guaranteePolicy: 'كل نظام أو أداة جديدة تضاف كمحول governed adapter بعد تعريف الصلاحيات والاختبار والمراجعة. لا يوجد ادعاء بامتلاك أو التحكم في نظام خارجي بلا تكامل فعلي.',
        timestamp: new Date().toISOString()
    };
}

function activateUniversalToolsFabric(options = {}) {
    fabricActive = Object.prototype.hasOwnProperty.call(options, 'active')
        ? Boolean(options.active)
        : true;

    return {
        ...getUniversalToolsFabricStatus(options),
        activation: {
            requested: true,
            active: fabricActive,
            message: fabricActive
                ? 'تم تفعيل نسيج Sheikha الشامل للأدوات والتقنيات وشبكة الخلايا العصبية الجذرية.'
                : 'تم إيقاف نسيج Sheikha الشامل مؤقتًا.'
        }
    };
}

function buildUniversalToolsIntegrationPlan(options = {}) {
    const target = options.target || 'SHEIKHA UGIT-RP';
    const requestedCategories = Array.isArray(options.categories) && options.categories.length
        ? options.categories
        : Object.keys(SHEIKHA_UNIVERSAL_TOOL_CATEGORIES);
    const selectedCategories = requestedCategories
        .map(categoryId => String(categoryId).trim())
        .filter(categoryId => SHEIKHA_UNIVERSAL_TOOL_CATEGORIES[categoryId])
        .map(categoryId => ({
            id: categoryId,
            ...SHEIKHA_UNIVERSAL_TOOL_CATEGORIES[categoryId]
        }));
    const ideEnvironment = buildEnterpriseDevelopmentEnvironment({
        target,
        tier: options.tier || 'enterprise',
        modelMode: options.modelMode || 'hybrid'
    });
    const industryPlan = buildIndustryAndTechnologyServicesPlan({
        domain: options.domain || 'universal-tools-technologies',
        services: ['software', 'ai', 'business', 'cloud', 'robotics', 'factories', 'production-lines', 'supply-chain', 'data']
    });

    return {
        success: true,
        target,
        selectedCategories,
        ideEnvironment,
        industryPlan,
        flow: [
            'discover-tools-and-systems',
            'classify-capabilities',
            'bind-adapters',
            'apply-quran-sunnah-canon',
            'activate-root-neural-cells',
            'test-api-and-ide',
            'human-approve',
            'publish-and-monitor'
        ],
        guardrails: SHEIKHA_DIGITAL_QURAN_SUNNAH_CANON.operatingGates,
        timestamp: new Date().toISOString()
    };
}

function buildToolActivationPlan(options = {}) {
    const tool = String(options.tool || 'all-tools').trim();
    const category = String(options.category || 'ai').trim();
    const categorySpec = SHEIKHA_UNIVERSAL_TOOL_CATEGORIES[category] || SHEIKHA_UNIVERSAL_TOOL_CATEGORIES.ai;

    return {
        success: true,
        tool,
        category,
        categoryName: categorySpec.name,
        plan: [
            'identify-tool-interface',
            'define-permissions',
            'classify-data-risk',
            'bind-api-cli-extension-or-mcp',
            'apply-halal-no-harm-gates',
            'test-in-sandbox',
            'approve-for-human-reviewed-use'
        ],
        rootNeuralCellBinding: {
            active: fabricActive,
            role: 'analyze, classify, route, and govern the tool'
        },
        digitalCanon: SHEIKHA_DIGITAL_QURAN_SUNNAH_CANON,
        timestamp: new Date().toISOString()
    };
}

module.exports = {
    SHEIKHA_UNIVERSAL_TOOL_CATEGORIES,
    SHEIKHA_DIGITAL_QURAN_SUNNAH_CANON,
    getUniversalToolsFabricStatus,
    activateUniversalToolsFabric,
    buildUniversalToolsIntegrationPlan,
    buildToolActivationPlan
};
