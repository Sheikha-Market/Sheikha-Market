'use strict';

const SHEIKHA_OS_PACKAGE_MATRIX = {
    linux: {
        name: 'Linux',
        families: ['Pop!_OS', 'Debian', 'Ubuntu', 'Red Hat', 'Fedora', 'SUSE'],
        packageTypes: [
            { id: 'deb', name: '.deb', distros: ['Pop!_OS', 'Debian', 'Ubuntu'], arch: ['x64', 'arm32', 'arm64'] },
            { id: 'rpm', name: '.rpm', distros: ['Red Hat', 'Fedora', 'SUSE'], arch: ['x64', 'arm32', 'arm64'] },
            { id: 'tar.gz', name: '.tar.gz', distros: ['universal-linux'], arch: ['x64', 'arm32', 'arm64'] },
            { id: 'snap', name: 'Snap', distros: ['snap-store'], arch: ['x64', 'arm64'] },
            { id: 'cli', name: 'CLI', distros: ['universal-linux'], arch: ['x64', 'arm32', 'arm64'] }
        ]
    },
    windows: {
        name: 'Windows',
        families: ['Windows 10', 'Windows 11', 'Windows 12'],
        packageTypes: [
            { id: 'user-installer', name: 'User Installer', arch: ['x64', 'arm64'] },
            { id: 'system-installer', name: 'System Installer', arch: ['x64', 'arm64'] },
            { id: 'zip', name: '.zip', arch: ['x64', 'arm64'] },
            { id: 'cli', name: 'CLI', arch: ['x64', 'arm64'] }
        ]
    },
    macos: {
        name: 'macOS',
        families: ['macOS 12.0+'],
        packageTypes: [
            { id: 'dmg', name: '.dmg', arch: ['intel-chip', 'apple-silicon', 'universal'] },
            { id: 'cli', name: 'CLI', arch: ['intel-chip', 'apple-silicon'] }
        ]
    }
};

const SHEIKHA_EXTENSION_CAPABILITY_MAP = [
    { match: 'github.copilot', capability: 'ai-assist', system: 'GitHub Copilot' },
    { match: 'github.copilot-chat', capability: 'ai-chat', system: 'GitHub Copilot Chat' },
    { match: 'github.vscode-pull-request-github', capability: 'pull-requests', system: 'GitHub PR' },
    { match: 'gitlab', capability: 'merge-requests', system: 'GitLab' },
    { match: 'ms-python.python', capability: 'python', system: 'Python' },
    { match: 'dbaeumer.vscode-eslint', capability: 'lint', system: 'ESLint' },
    { match: 'ms-azuretools', capability: 'cloud-publish', system: 'Azure Tools' },
    { match: 'docker', capability: 'container-build', system: 'Docker' },
    { match: 'kubernetes', capability: 'cluster-ops', system: 'Kubernetes' }
];

function flattenPackages() {
    return Object.entries(SHEIKHA_OS_PACKAGE_MATRIX).flatMap(([platform, spec]) => (
        spec.packageTypes.map(pkg => ({
            platform,
            os: spec.name,
            families: spec.families,
            ...pkg
        }))
    ));
}

function normalizeExtension(extension) {
    if (typeof extension === 'string') {
        return { id: extension, displayName: extension };
    }
    return {
        id: String(extension && extension.id ? extension.id : ''),
        displayName: String(extension && (extension.displayName || extension.name) ? (extension.displayName || extension.name) : ''),
        version: extension && extension.version ? String(extension.version) : 'unknown',
        publisher: extension && extension.publisher ? String(extension.publisher) : 'unknown'
    };
}

function classifyExtension(extension) {
    const normalized = normalizeExtension(extension);
    const haystack = `${normalized.id} ${normalized.displayName}`.toLowerCase();
    const matches = SHEIKHA_EXTENSION_CAPABILITY_MAP
        .filter(item => haystack.includes(item.match))
        .map(item => ({ capability: item.capability, system: item.system }));

    return {
        ...normalized,
        status: 'governed',
        capabilities: matches.length ? matches : [{ capability: 'extension-adapter', system: 'VS Code' }],
        governance: 'reviewed-before-automation'
    };
}

function getGoverningOsLayerStatus(options = {}) {
    const extensions = Array.isArray(options.extensions) ? options.extensions : [];
    const classifiedExtensions = extensions.map(classifyExtension);
    const packages = flattenPackages();

    return {
        success: true,
        name: 'Sheikha AI AL OS Governing Layer',
        nameAr: 'طبقة Sheikha الحاكمة لأنظمة التشغيل والتكامل',
        status: 'active',
        mode: 'universal-governed-os-and-extension-orchestration',
        principle: 'تكامل شامل للأدوات والأنظمة الممكنة عبر محولات حاكمة، لا ادعاء بامتلاك كل نظام فعليًا.',
        osMatrix: SHEIKHA_OS_PACKAGE_MATRIX,
        packageCount: packages.length,
        platforms: Object.keys(SHEIKHA_OS_PACKAGE_MATRIX),
        extensions: {
            count: classifiedExtensions.length,
            governed: classifiedExtensions
        },
        capabilities: {
            edit: true,
            publish: true,
            debug: true,
            api: true,
            mcp: true,
            git: true,
            github: true,
            gitlab: true,
            githubCopilotBridge: true,
            vscodeExtensions: true,
            packagePlanning: true,
            crossPlatformDistribution: true
        },
        governance: {
            basis: 'quran-and-sunnah',
            tawheed: true,
            rules: [
                'كل تكامل مباح ونافع وآمن تحت مراجعة الإنسان',
                'لا تشغيل أو نشر أو تعديل مؤثر بلا موافقة',
                'لا أسرار في الحزم أو Git',
                'اقتراحات الإضافات وCopilot أدوات مساعدة فقط',
                'Sheikha هي طبقة التنظيم والاعتماد والتجارة'
            ]
        },
        timestamp: new Date().toISOString()
    };
}

function buildPackagePlan(options = {}) {
    const platform = String(options.platform || 'linux').toLowerCase();
    const packageType = String(options.packageType || 'cli').toLowerCase();
    const arch = String(options.arch || 'x64').toLowerCase();
    const packages = flattenPackages();
    const selected = packages.find(pkg => (
        pkg.platform === platform &&
        String(pkg.id).toLowerCase() === packageType &&
        (pkg.arch || []).map(x => String(x).toLowerCase()).includes(arch)
    ));

    return {
        success: Boolean(selected),
        requested: { platform, packageType, arch },
        package: selected || null,
        plan: selected ? [
            'validate-source-tree',
            'run-syntax-checks',
            'bundle-vscode-extension',
            `prepare-${selected.id}-artifact`,
            'sign-or-hash-artifact',
            'publish-after-human-approval'
        ] : [],
        message: selected
            ? `خطة حزمة ${selected.name} على ${selected.os} جاهزة للمراجعة.`
            : 'نوع الحزمة أو المعمارية غير مدعوم في المصفوفة الحالية.',
        timestamp: new Date().toISOString()
    };
}

function buildUniversalIntegrationPlan(options = {}) {
    const target = options.target || 'sheikha-enterprise-runtime';
    return {
        success: true,
        target,
        layers: [
            'Sheikha Supreme Root Neural Fabric',
            'Sheikha AI AL OS Governing Layer',
            'VS Code Extension Control Surface',
            'Git/GitHub/GitLab Governance',
            'MCP SDK Runtime',
            'Cross-platform Package Matrix',
            'Human Review and Commercial Approval'
        ],
        flows: [
            'extension-detect -> classify -> govern -> expose-capability',
            'edit -> diff -> test -> review -> commit-plan',
            'package -> validate -> sign/hash -> release-plan',
            'api -> mcp -> neural-cell -> governed-output',
            'commercial-scope -> license -> support -> delivery'
        ],
        commercialUse: [
            'اشتراك مؤسسة',
            'ترخيص منصة داخلية',
            'تشغيل وتكامل مخصص',
            'تدريب فرق التطوير',
            'دعم ونشر متعدد الأنظمة'
        ],
        timestamp: new Date().toISOString()
    };
}

module.exports = {
    SHEIKHA_OS_PACKAGE_MATRIX,
    getGoverningOsLayerStatus,
    buildPackagePlan,
    buildUniversalIntegrationPlan
};
