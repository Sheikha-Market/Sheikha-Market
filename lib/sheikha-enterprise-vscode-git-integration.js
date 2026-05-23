'use strict';

const { execFileSync } = require('child_process');

function runGit(args, cwd = process.cwd()) {
    try {
        return execFileSync('git', args, {
            cwd,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
            timeout: 5000
        }).trim();
    } catch (_) {
        return '';
    }
}

function parseRemoteProvider(remoteUrl) {
    const remote = String(remoteUrl || '').toLowerCase();
    if (remote.includes('github.com')) return 'github';
    if (remote.includes('gitlab.com')) return 'gitlab';
    if (remote) return 'custom-git';
    return 'none';
}

function decodeBasicEntities(value) {
    return String(value || '')
        .replace(/&amp;#x2F;/g, '/')
        .replace(/&#x2F;/g, '/')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
}

function getGitSnapshot(cwd = process.cwd()) {
    const branch = runGit(['rev-parse', '--abbrev-ref', 'HEAD'], cwd) || 'unknown';
    const commit = runGit(['log', '-1', '--oneline'], cwd) || 'unknown';
    const remote = runGit(['remote', 'get-url', 'origin'], cwd);
    const statusRaw = runGit(['status', '--short'], cwd);
    const changedFiles = statusRaw ? statusRaw.split('\n').filter(Boolean) : [];

    return {
        available: Boolean(branch && branch !== 'unknown'),
        branch,
        commit,
        remote,
        provider: parseRemoteProvider(remote),
        changedFilesCount: changedFiles.length,
        changedFiles: changedFiles.slice(0, 50),
        clean: changedFiles.length === 0
    };
}

function getEnterpriseVsCodeGitIntegrationStatus(options = {}) {
    const git = getGitSnapshot(options.cwd);
    const vscodeExtensions = Array.isArray(options.vscodeExtensions) ? options.vscodeExtensions : [];
    const extensionIds = new Set(vscodeExtensions.map(ext => String(ext.id || ext).toLowerCase()));
    const copilotDetected = extensionIds.has('github.copilot') || extensionIds.has('github.copilot-chat');
    const githubPullRequestsDetected = extensionIds.has('github.vscode-pull-request-github');

    return {
        success: true,
        name: 'Sheikha Enterprise VS Code Git Integration',
        status: 'active',
        mode: 'enterprise-organizational-commercial-governance',
        stack: {
            vscode: {
                role: 'IDE control surface',
                extensionId: 'sheikha.sheikha',
                panels: ['chat', 'status', 'api', 'publish', 'paths', 'programming', 'debug', 'editing', 'neural', 'enterprise'],
                copilotDetected,
                githubPullRequestsDetected
            },
            git: {
                role: 'local source-control authority',
                ...git
            },
            github: {
                role: 'repository, review, PR, releases, actions',
                providerDetected: git.provider === 'github',
                tokenConfigured: Boolean(process.env.GITHUB_TOKEN || process.env.GH_TOKEN),
                recommendedFlow: 'branch -> diff -> test -> human review -> PR -> merge'
            },
            githubCopilot: {
                role: 'optional IDE assistant only',
                detectedInVsCode: copilotDetected,
                governance: 'Sheikha remains the project governance layer; Copilot suggestions require review.'
            }
        },
        governance: {
            basis: 'quran-and-sunnah',
            rules: [
                'لا تعديل بلا معرفة الملف والمسار',
                'لا commit قبل git status وقراءة diff',
                'لا push بلا موافقة المالك',
                'لا merge بلا مراجعة واختبار',
                'اقتراحات GitHub Copilot أدوات مساعدة وليست مصدر حوكمة',
                'Sheikha هي طبقة التنظيم والتجارة والاعتماد داخل المشروع'
            ]
        },
        commercialModel: {
            product: 'Sheikha Enterprise Developer Runtime',
            offering: [
                'VS Code extension',
                'Git/GitHub/GitLab governance',
                'AI-assisted code workflow',
                'enterprise audit trail',
                'commercial project delivery console'
            ],
            revenuePaths: [
                'اشتراك مؤسسة',
                'ترخيص داخلي للشركات',
                'خدمة تركيب وتشغيل',
                'تدريب فرق التطوير',
                'حوكمة مشاريع برمجية وتجارية'
            ]
        },
        timestamp: new Date().toISOString()
    };
}

function getEnterpriseGitServiceStatus(options = {}) {
    const git = getGitSnapshot(options.cwd);
    const vscodeExtensions = Array.isArray(options.vscodeExtensions) ? options.vscodeExtensions : [];
    const extensionIds = new Set(vscodeExtensions.map(ext => String(ext.id || ext).toLowerCase()));
    const provider = options.provider || git.provider || 'github';
    const isGithub = provider === 'github';
    const isGitlab = provider === 'gitlab';

    return {
        success: true,
        serviceId: 'sheikha-enterprise-git-service',
        name: 'Sheikha Enterprise Git Service',
        nameAr: 'خدمة Sheikha Git المؤسسية',
        status: 'active',
        mode: 'pr-mr-review-release-governance',
        provider,
        git,
        capabilities: {
            branchGovernance: true,
            pullRequest: true,
            mergeRequest: true,
            codeReview: true,
            diffAudit: true,
            releasePlan: true,
            githubActionsReadiness: isGithub,
            gitlabCiReadiness: isGitlab,
            githubCopilotBridge: extensionIds.has('github.copilot') || extensionIds.has('github.copilot-chat'),
            githubPullRequestExtension: extensionIds.has('github.vscode-pull-request-github')
        },
        providerReadiness: {
            githubPR: isGithub || provider === 'custom-git',
            gitlabMR: isGitlab || provider === 'custom-git',
            currentProvider: provider
        },
        governance: {
            basis: 'quran-and-sunnah',
            tawheed: true,
            rules: [
                'كل PR/MR يبدأ من فرع واضح ومراجعة diff',
                'لا merge قبل الاختبار والمراجعة',
                'لا push أو tag أو release بلا موافقة المالك',
                'Copilot أداة اقتراح فقط، وSheikha هي طبقة الحوكمة',
                'تمنع الأسرار والبيانات الحساسة في Git'
            ]
        },
        commercial: {
            product: 'Sheikha Enterprise Git Governance Service',
            value: 'خدمة مؤسسية لإدارة PR/MR والمراجعة والنشر لمزود خدمة ذكاء صناعي',
            serviceLevels: ['internal', 'professional', 'enterprise']
        },
        timestamp: new Date().toISOString()
    };
}

function buildPullMergeRequestPlan(options = {}) {
    const provider = String(options.provider || 'github').toLowerCase();
    const requestKind = String(options.kind || (provider === 'gitlab' ? 'MR' : 'PR')).toUpperCase();
    const targetBranch = decodeBasicEntities(options.targetBranch || 'main');
    const sourceBranch = decodeBasicEntities(options.sourceBranch || 'current-branch');
    const title = decodeBasicEntities(options.title || `Sheikha governed ${requestKind}`);

    return {
        success: true,
        serviceId: 'sheikha-enterprise-git-service',
        provider,
        requestKind,
        title,
        sourceBranch,
        targetBranch,
        mode: 'human-approved-pr-mr-plan',
        phases: [
            {
                id: 'prepare',
                name: 'تجهيز الفرع',
                actions: ['git status', 'git diff', 'scope changed files', 'confirm no secrets']
            },
            {
                id: 'validate',
                name: 'التحقق',
                actions: ['syntax checks', 'targeted tests', 'endpoint checks', 'extension build if relevant']
            },
            {
                id: 'review',
                name: 'المراجعة',
                actions: ['generate summary', 'list risks', 'request human approval', 'assign reviewer']
            },
            {
                id: 'open-request',
                name: requestKind === 'MR' ? 'فتح Merge Request' : 'فتح Pull Request',
                actions: [
                    requestKind === 'MR' ? 'create GitLab MR draft' : 'create GitHub PR draft',
                    'attach evidence',
                    'link tests and docs',
                    'block merge until approved'
                ]
            },
            {
                id: 'merge-release',
                name: 'الدمج والنشر',
                actions: ['merge after approval', 'tag/release plan', 'artifact hash', 'deployment approval']
            }
        ],
        automationPolicy: {
            canOpenDraft: true,
            canMergeAutomatically: false,
            canPushAutomatically: false,
            requiresHumanApproval: true
        },
        guardrails: [
            'no-secrets',
            'no-unreviewed-ai-output',
            'no-force-push-without-explicit-approval',
            'no-merge-with-failing-checks',
            'no-release-without-owner-approval'
        ],
        timestamp: new Date().toISOString()
    };
}

function buildEnterpriseWorkPlan(options = {}) {
    const target = options.target || 'current-project';
    const provider = options.provider || 'github';
    return {
        success: true,
        target,
        provider,
        phases: [
            {
                id: 'discover',
                name: 'جرد البيئة',
                actions: ['VS Code extensions sync', 'git status', 'remote detection', 'branch policy check']
            },
            {
                id: 'govern',
                name: 'الحوكمة',
                actions: ['route ownership', 'file scope', 'diff review', 'sharia/no-harm gate']
            },
            {
                id: 'develop',
                name: 'التطوير',
                actions: ['Sheikha chat', 'inline edit', 'Copilot optional suggestions', 'tests', 'debug']
            },
            {
                id: 'commercialize',
                name: 'التجهيز التجاري',
                actions: ['release notes', 'pricing tier', 'support policy', 'installation package', 'customer handover']
            },
            {
                id: 'deliver',
                name: 'التسليم',
                actions: ['branch', 'commit', 'pull request', 'review', 'merge', 'tag/release']
            }
        ],
        guardrails: [
            'human approval before commit/push',
            'no secrets in commits',
            'no unsafe automation',
            'all third-party assistant output reviewed'
        ],
        timestamp: new Date().toISOString()
    };
}

module.exports = {
    getEnterpriseVsCodeGitIntegrationStatus,
    getEnterpriseGitServiceStatus,
    buildPullMergeRequestPlan,
    buildEnterpriseWorkPlan
};
