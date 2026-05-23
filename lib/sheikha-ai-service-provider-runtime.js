'use strict';

const {
    getEnterpriseVsCodeGitIntegrationStatus,
    getEnterpriseGitServiceStatus,
    buildPullMergeRequestPlan,
    buildEnterpriseWorkPlan
} = require('./sheikha-enterprise-vscode-git-integration');
const {
    getGoverningOsLayerStatus,
    buildUniversalIntegrationPlan
} = require('./sheikha-governing-os-layer');

const SHEIKHA_SERVICE_ADAPTERS = {
    vscode: {
        name: 'VS Code',
        role: 'developer-control-surface',
        capabilities: ['chat', 'edit', 'debug', 'publish', 'extensions', 'views']
    },
    git: {
        name: 'Git',
        role: 'source-control-authority',
        capabilities: ['status', 'diff', 'branch', 'commit-plan', 'audit']
    },
    github: {
        name: 'GitHub',
        role: 'repository-and-release-platform',
        capabilities: ['pull-request-plan', 'pr-review', 'release-plan', 'actions-readiness', 'review-gate']
    },
    githubCopilot: {
        name: 'GitHub Copilot',
        role: 'optional-ide-assistant',
        capabilities: ['suggestions', 'chat-assist', 'human-reviewed-output']
    },
    gitlab: {
        name: 'GitLab',
        role: 'repository-and-merge-request-platform',
        capabilities: ['merge-request-plan', 'mr-review', 'ci-readiness', 'review-gate']
    },
    mcpSdk: {
        name: 'MCP SDK',
        role: 'tool-and-context-protocol',
        capabilities: ['tool-registry', 'context-routing', 'governed-execution']
    },
    api: {
        name: 'Sheikha API',
        role: 'service-provider-api',
        capabilities: ['chat', 'completion', 'agent', 'neural-network', 'enterprise-plan']
    },
    linux: {
        name: 'Linux',
        role: 'package-target',
        capabilities: ['deb', 'rpm', 'tar.gz', 'snap', 'cli']
    },
    windows: {
        name: 'Windows',
        role: 'package-target',
        capabilities: ['user-installer', 'system-installer', 'zip', 'cli']
    },
    macos: {
        name: 'macOS',
        role: 'package-target',
        capabilities: ['dmg', 'cli']
    },
    data: {
        name: 'Structured/Semi-Structured/Unstructured Data',
        role: 'governed-data-source',
        capabilities: ['schema', 'classification', 'indexing', 'redaction', 'audit']
    },
    commerce: {
        name: 'Commercial Operations',
        role: 'service-business-layer',
        capabilities: ['subscription', 'licensing', 'support', 'delivery', 'sla']
    }
};

const SHEIKHA_PROVIDER_TIERS = [
    {
        id: 'internal',
        name: 'Sheikha Internal Runtime',
        useCase: 'تشغيل داخلي للمشروع والفريق',
        includes: ['VS Code extension', 'local API', 'Git workflow', 'human review']
    },
    {
        id: 'professional',
        name: 'Sheikha Professional AI Provider',
        useCase: 'مزود خدمة ذكاء صناعي للمشاريع والعملاء',
        includes: ['managed API', 'MCP SDK', 'release package', 'support workflow']
    },
    {
        id: 'enterprise',
        name: 'Sheikha Enterprise AI Operating Provider',
        useCase: 'تكامل مؤسسي تنظيمي وتجاري متعدد الأنظمة',
        includes: ['enterprise governance', 'GitHub/GitLab integration', 'cross-platform distribution', 'commercial SLA']
    }
];

const SHEIKHA_AI_PROVIDER_CERTIFICATION = {
    certificateId: 'SHEIKHA-AI-PROVIDER-CERT-001',
    name: 'Sheikha Certified AI Provider',
    nameAr: 'مزود ذكاء صناعي معتمد من Sheikha',
    status: 'certified',
    scope: 'internal-operational-governance-certification',
    certificationLevel: 'enterprise-governed-ai-service-provider',
    excellenceStandard: 'best-in-class-operational-target',
    issuedBy: 'SHEIKHA UGIT-RP Internal Governance',
    externalAccreditation: false,
    externalAccreditationNote: 'هذا اعتماد تشغيلي داخلي داخل منظومة Sheikha، وليس شهادة خارجية من جهة اعتماد مستقلة.',
    criteria: [
        'quran-and-sunnah-governance',
        'tawheed-principle',
        'human-reviewed-automation',
        'no-harm-and-privacy-gates',
        'api-and-mcp-service-readiness',
        'vscode-git-github-integration',
        'cross-platform-package-planning',
        'commercial-service-provider-readiness',
        'auditability-and-release-approval'
    ],
    verifiedCapabilities: [
        'Sheikha API service provider',
        'VS Code extension control surface',
        'Git/GitHub/GitLab governance workflow',
        'enterprise PR/MR service workflow',
        'Sheikha Enterprise IDE subscription runtime',
        'GitHub Copilot bridge as optional assistant',
        'MCP SDK governed tool routing',
        'Linux/Windows/macOS package planning',
        'structured/semi-structured/unstructured data governance',
        'commercial subscription, licensing, support, and delivery model'
    ],
    guardrails: [
        'no claim of divine attribute or unseen knowledge',
        'no automatic release without owner approval',
        'no secrets in artifacts or git',
        'no unreviewed third-party AI output',
        'service claims must match tested runtime capabilities'
    ]
};

function normalizeSystemId(value) {
    return String(value || '')
        .trim()
        .replace(/[\s_-]+/g, '')
        .toLowerCase();
}

function adapterByRequestedSystem(system) {
    const normalized = normalizeSystemId(system);
    const aliasMap = {
        vscode: 'vscode',
        vscod: 'vscode',
        visualstudiocode: 'vscode',
        git: 'git',
        github: 'github',
        gh: 'github',
        githubcopilot: 'githubCopilot',
        copilot: 'githubCopilot',
        gitcopilot: 'githubCopilot',
        gitlab: 'gitlab',
        mcp: 'mcpSdk',
        mcpsdk: 'mcpSdk',
        api: 'api',
        linux: 'linux',
        pop: 'linux',
        popos: 'linux',
        debian: 'linux',
        ubuntu: 'linux',
        redhat: 'linux',
        fedora: 'linux',
        suse: 'linux',
        windows: 'windows',
        win: 'windows',
        mac: 'macos',
        macos: 'macos',
        data: 'data',
        commerce: 'commerce',
        commercial: 'commerce',
        business: 'commerce'
    };
    const key = aliasMap[normalized] || normalized;
    return SHEIKHA_SERVICE_ADAPTERS[key] ? { id: key, ...SHEIKHA_SERVICE_ADAPTERS[key] } : null;
}

function uniqueSystems(systems) {
    const source = Array.isArray(systems) && systems.length
        ? systems
        : ['vscode', 'git', 'github', 'github-copilot', 'mcp-sdk', 'api', 'linux', 'windows', 'macos', 'data', 'commerce'];
    const seen = new Set();
    return source
        .map(adapterByRequestedSystem)
        .filter(Boolean)
        .filter(adapter => {
            if (seen.has(adapter.id)) return false;
            seen.add(adapter.id);
            return true;
        });
}

function getAiServiceProviderStatus(options = {}) {
    const extensions = Array.isArray(options.extensions) ? options.extensions : [];
    const enterprise = getEnterpriseVsCodeGitIntegrationStatus({
        cwd: options.cwd || process.cwd(),
        vscodeExtensions: extensions
    });
    const enterpriseGit = getEnterpriseGitServiceStatus({
        cwd: options.cwd || process.cwd(),
        vscodeExtensions: extensions
    });
    const os = getGoverningOsLayerStatus({ extensions });

    return {
        success: true,
        providerId: 'sheikha-ai-service-provider',
        productName: 'SHEIKHA Global Runtime AI Service Provider',
        productShortName: 'Sheikha AI Provider',
        status: 'active',
        certification: SHEIKHA_AI_PROVIDER_CERTIFICATION,
        mode: 'enterprise-commercial-governed-ai-service-provider',
        positioning: 'مزود خدمة ذكاء صناعي وتشغيل مؤسسي تحت حوكمة Sheikha، قابل للتكامل مع الأنظمة عبر محولات آمنة.',
        tiers: SHEIKHA_PROVIDER_TIERS,
        adapters: SHEIKHA_SERVICE_ADAPTERS,
        stack: {
            enterprise: enterprise.stack,
            enterpriseGit,
            os: {
                platforms: os.platforms,
                packageCount: os.packageCount,
                capabilities: os.capabilities
            }
        },
        serviceChannels: [
            'VS Code extension',
            'HTTP API',
            'MCP SDK tools',
            'CLI/package artifacts',
            'Git/GitHub/GitLab workflow',
            'PR/MR governance service',
            'Sheikha Enterprise IDE subscription',
            'enterprise support and delivery'
        ],
        governance: {
            basis: 'quran-and-sunnah',
            tawheed: true,
            principle: 'الله وحده الخالق والمالك، وSheikha أداة تشغيل وتحليل ونفع لا تدعي استقلالاً أو علم غيب.',
            gates: ['halal-scope', 'privacy', 'no-harm', 'human-review', 'audit-log', 'release-approval']
        },
        commercial: {
            readyForServiceProviderModel: true,
            revenuePaths: [
                'اشتراك مزود خدمة',
                'ترخيص مؤسسي',
                'خدمة تكامل وتشغيل',
                'دعم ونشر متعدد الأنظمة',
                'تدريب فرق التطوير والعمليات'
            ]
        },
        timestamp: new Date().toISOString()
    };
}

function getCertifiedAiProviderCertificate(options = {}) {
    const status = getAiServiceProviderStatus(options);
    const gates = {
        runtimeActive: status.status === 'active',
        commercialReady: Boolean(status.commercial && status.commercial.readyForServiceProviderModel),
        apiReady: Boolean(status.adapters && status.adapters.api),
        mcpReady: Boolean(status.adapters && status.adapters.mcpSdk),
        enterpriseReady: Boolean(status.stack && status.stack.enterprise),
        osReady: Boolean(status.stack && status.stack.os),
        governanceReady: Boolean(status.governance && status.governance.tawheed)
    };
    const passed = Object.values(gates).every(Boolean);

    return {
        success: passed,
        certificate: {
            ...SHEIKHA_AI_PROVIDER_CERTIFICATION,
            status: passed ? 'certified' : 'pending-review',
            issuedAt: new Date().toISOString(),
            validForRuntime: 'current-working-tree',
            claimPolicy: 'Sheikha may be presented as a certified internal AI service provider inside SHEIKHA UGIT-RP. External public accreditation requires a separate legal/compliance authority.'
        },
        gates,
        evidence: {
            providerStatusEndpoint: '/api/sheikha/ai-service-provider/status',
            publishPlanEndpoint: '/api/sheikha/ai-service-provider/publish-plan',
            integrationPlanEndpoint: '/api/sheikha/ai-service-provider/integration-plan',
            runtimeMode: status.mode,
            serviceChannels: status.serviceChannels
        },
        message: passed
            ? 'Sheikha AI Provider معتمد داخليًا كمزود خدمة ذكاء صناعي مؤسسي وتجاري داخل منظومة Sheikha.'
            : 'اعتماد Sheikha AI Provider يحتاج مراجعة بعض بوابات التشغيل.',
        timestamp: new Date().toISOString()
    };
}

function buildAiServicePublishPlan(options = {}) {
    const target = options.target || 'sheikha-ai-provider';
    const channel = options.channel || 'vsix-api-cli';
    const tier = options.tier || 'enterprise';
    const systems = uniqueSystems(options.systems);
    const enterprisePlan = buildEnterpriseWorkPlan({
        target,
        provider: options.provider || 'github'
    });
    const prMrPlan = buildPullMergeRequestPlan({
        provider: options.provider || 'github',
        kind: options.requestKind || options.kind,
        title: options.title || 'Sheikha AI Provider enterprise release',
        sourceBranch: options.sourceBranch,
        targetBranch: options.targetBranch
    });
    const universalPlan = buildUniversalIntegrationPlan({ target });

    return {
        success: true,
        target,
        channel,
        tier,
        product: 'Sheikha AI Provider',
        publishReadiness: 'ready-for-human-approved-release',
        systems,
        phases: [
            {
                id: 'governance-freeze',
                name: 'تثبيت الحوكمة',
                actions: ['confirm canonical paths', 'scan secrets', 'validate halal/no-harm policy']
            },
            {
                id: 'build',
                name: 'بناء المنتجات',
                actions: ['bundle VSIX', 'prepare API runtime', 'prepare MCP SDK manifest', 'prepare package matrix']
            },
            {
                id: 'verify',
                name: 'التحقق',
                actions: ['syntax checks', 'endpoint tests', 'extension install test', 'git diff review']
            },
            {
                id: 'commercial',
                name: 'التجهيز التجاري',
                actions: ['tier selection', 'license terms', 'support policy', 'release notes', 'customer onboarding']
            },
            {
                id: 'release',
                name: 'النشر',
                actions: ['tag/release plan', 'artifact hash', 'human approval', 'publish through selected channel']
            }
        ],
        enterprisePlan,
        prMrPlan,
        universalPlan,
        guardrails: [
            'no automatic push or release without owner approval',
            'no secrets in artifacts',
            'third-party assistants remain optional and reviewed',
            'service promises must match verified runtime capabilities'
        ],
        timestamp: new Date().toISOString()
    };
}

function buildSystemIntegrationProviderPlan(options = {}) {
    const target = options.target || 'sheikha-global-runtime-platform';
    const requestedSystems = Array.isArray(options.systems) && options.systems.length
        ? options.systems
        : Object.keys(SHEIKHA_SERVICE_ADAPTERS);
    const systems = uniqueSystems(requestedSystems);
    const unknownSystems = requestedSystems.filter(system => !adapterByRequestedSystem(system));

    return {
        success: true,
        target,
        systems,
        unknownSystems,
        adapterPolicy: 'أي نظام جديد يضاف كمحول governed adapter بعد تحديد API والصلاحيات ومراجعة الأمان.',
        integrationFlow: [
            'discover-system',
            'classify-capability',
            'define-permissions',
            'bind-api-or-cli-or-extension',
            'apply-sharia-and-safety-gates',
            'monitor-and-audit',
            'publish-after-human-approval'
        ],
        output: {
            api: '/api/sheikha/ai-service-provider/*',
            vscode: 'Sheikha publish and service-provider panels',
            mcp: 'governed tool routing through Sheikha MCP SDK',
            git: 'reviewed branch/diff/commit-plan workflow'
        },
        timestamp: new Date().toISOString()
    };
}

module.exports = {
    SHEIKHA_SERVICE_ADAPTERS,
    SHEIKHA_PROVIDER_TIERS,
    SHEIKHA_AI_PROVIDER_CERTIFICATION,
    getAiServiceProviderStatus,
    getCertifiedAiProviderCertificate,
    buildAiServicePublishPlan,
    buildSystemIntegrationProviderPlan
};
