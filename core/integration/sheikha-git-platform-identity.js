'use strict';

const SHEIKHA_GIT_PLATFORM_IDENTITY = Object.freeze({
  id: 'sheikha-git-platform-identity',
  name: 'Sheikha Git Platform Identity',
  nameAr: 'هوية شيخة في Git وGitHub وGitLab',
  status: 'active',
  version: '1.0.0',
  definition: {
    short: 'Sheikha is the governed enterprise operating identity for Git, GitHub, GitLab, and any institutional system.',
    ar: 'شيخة هي هوية تشغيل وحوكمة مؤسسية وتجارية وتنظيمية واستشارية للتعامل مع Git وGitHub وGitLab وأي نظام داخلي أو خارجي.',
    en: 'Sheikha is a governed enterprise, commercial, organizational, and advisory operating identity for Git, GitHub, GitLab, and any internal or external system.'
  },
  positioning: {
    marketName: 'SHEIKHA Global Runtime Platform',
    officialAcronym: 'SHEIKHA UGIT-RP',
    role: 'enterprise-runtime-governance-and-integration-layer',
    notJust: [
      'ai-model',
      'marketplace',
      'repository',
      'bot',
      'marketing-slogan'
    ]
  },
  platforms: [
    {
      id: 'git',
      name: 'Git',
      role: 'local-source-control-and-audit-root',
      command: 'git sheikha',
      capabilities: [
        'identity',
        'status',
        'diff-review',
        'commit-plan',
        'branch-plan',
        'release-plan',
        'human-review-before-publish'
      ]
    },
    {
      id: 'github',
      name: 'GitHub',
      role: 'pull-request-actions-release-and-enterprise-collaboration',
      capabilities: [
        'pull-request',
        'actions-ci',
        'security-audit',
        'sbom',
        'code-review',
        'issue-triage',
        'release-governance'
      ]
    },
    {
      id: 'gitlab',
      name: 'GitLab',
      role: 'merge-request-ci-and-enterprise-delivery',
      capabilities: [
        'merge-request',
        'pipeline',
        'review',
        'release',
        'deployment-gates',
        'enterprise-controls'
      ]
    },
    {
      id: 'any-system',
      name: 'Any Internal Or External System',
      role: 'governed-integration-surface',
      capabilities: [
        'enterprise-integration',
        'commercial-workflow',
        'organizational-policy',
        'technical-delivery',
        'consulting-guidance',
        'marketing-identity',
        'formal-documentation',
        'auditability'
      ]
    }
  ],
  governance: {
    tawheed: true,
    quranAndSunnahGoverned: true,
    noNewRevelationClaim: true,
    noFatwaWithoutQualifiedScholar: true,
    noGhaybPrediction: true,
    noConsciousnessClaim: true,
    noAbsolutePerfectionClaim: true,
    humanAuthority: true,
    privacyByDefault: true,
    auditRequired: true
  },
  rules: [
    'لا commit قبل git status وقراءة diff',
    'لا push قبل الفحص والمراجعة البشرية',
    'لا PR/MR بلا هدف واضح وفحوص واضحة',
    'لا merge بلا اعتماد صاحب الصلاحية',
    'لا أسرار أو مفاتيح أو بيانات خاصة داخل Git',
    'لا اعتماد أعمى لأي تكامل خارجي',
    'كل تكامل مؤسسي أو تجاري أو فني يمر عبر الحلال، الأمانة، منع الضرر، والتوثيق',
    'Sheikha توحّد التشغيل لله بمعنى ضبط النية والحدود والحلال، لا بمعنى ادعاء سلطة دينية مستقلة'
  ],
  enterpriseCapabilities: [
    'governed-source-control',
    'pr-mr-planning',
    'enterprise-consulting',
    'commercial-workflow-design',
    'organizational-policy-mapping',
    'technical-integration',
    'formal-brand-identity',
    'marketing-positioning',
    'security-and-audit',
    'human-reviewed-automation'
  ]
});

function getSheikhaGitPlatformIdentity() {
  return {
    ...SHEIKHA_GIT_PLATFORM_IDENTITY,
    timestamp: new Date().toISOString()
  };
}

function buildSheikhaGitPlatformPlan(input = {}) {
  const platform = String(input.platform || 'git').toLowerCase();
  const action = String(input.action || 'identity').toLowerCase();
  const target = input.target || 'working-tree';
  const identity = getSheikhaGitPlatformIdentity();
  const matchedPlatform = identity.platforms.find((item) => item.id === platform) || identity.platforms[0];
  const publishRequested = ['push', 'publish', 'release', 'merge', 'deploy'].includes(action);

  return {
    success: true,
    status: publishRequested ? 'requires-human-review' : 'ready-for-governed-planning',
    platform: matchedPlatform,
    action,
    target,
    identity,
    plan: [
      'تثبيت الهوية: Sheikha Git Platform Identity',
      'قراءة git status وتحديد نطاق العمل',
      'قراءة diff قبل أي commit أو PR/MR',
      'تصنيف العمل: مؤسسي، تجاري، تنظيمي، فني، استشاري، تسويقي',
      'فحص الحلال والخصوصية ومنع الضرر والتسريب',
      platform === 'gitlab' ? 'إعداد Merge Request عند الحاجة' : 'إعداد Pull Request عند الحاجة',
      'تشغيل الفحوص المناسبة',
      'اعتماد بشري قبل push أو merge أو release',
      'توثيق القرار في سجل مراجعة قابل للتتبع'
    ],
    gates: {
      statusReviewed: Boolean(input.statusReviewed),
      diffReviewed: Boolean(input.diffReviewed),
      testsPassed: Boolean(input.testsPassed),
      humanApproved: !publishRequested || Boolean(input.humanApproved),
      noSecrets: input.noSecrets !== false
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  SHEIKHA_GIT_PLATFORM_IDENTITY,
  getSheikhaGitPlatformIdentity,
  buildSheikhaGitPlatformPlan
};
