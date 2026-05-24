'use strict';

const GITHUB_MCP_TOOLSETS = [
  { id: 'context', icon: 'person', name: 'Context', description: 'Current user, workspace, and operating context.', category: 'identity' },
  { id: 'actions', icon: 'workflow', name: 'Actions', description: 'GitHub Actions workflows and CI/CD operations.', category: 'delivery' },
  { id: 'code_security', icon: 'codescan', name: 'Code Security', description: 'Code scanning and code security tools.', category: 'security' },
  { id: 'dependabot', icon: 'dependabot', name: 'Dependabot', description: 'Dependency update and vulnerability automation.', category: 'security' },
  { id: 'discussions', icon: 'comment-discussion', name: 'Discussions', description: 'GitHub Discussions collaboration tools.', category: 'collaboration' },
  { id: 'gists', icon: 'logo-gist', name: 'Gists', description: 'Gist management and sharing tools.', category: 'content' },
  { id: 'git', icon: 'git-branch', name: 'Git', description: 'Low-level Git object and branch operations.', category: 'source-control' },
  { id: 'issues', icon: 'issue-opened', name: 'Issues', description: 'Issue triage, tracking, and workflow tools.', category: 'planning' },
  { id: 'labels', icon: 'tag', name: 'Labels', description: 'Repository and project label management.', category: 'planning' },
  { id: 'notifications', icon: 'bell', name: 'Notifications', description: 'GitHub notification review and routing.', category: 'collaboration' },
  { id: 'orgs', icon: 'organization', name: 'Organizations', description: 'Organization-level governance and membership context.', category: 'enterprise' },
  { id: 'projects', icon: 'project', name: 'Projects', description: 'GitHub Projects planning and portfolio tracking.', category: 'planning' },
  { id: 'pull_requests', icon: 'git-pull-request', name: 'Pull Requests', description: 'Pull request review, merge, and change management.', category: 'source-control' },
  { id: 'repos', icon: 'repo', name: 'Repositories', description: 'Repository metadata, files, releases, and settings.', category: 'source-control' },
  { id: 'secret_protection', icon: 'shield-lock', name: 'Secret Protection', description: 'Secret scanning and secret protection workflows.', category: 'security' },
  { id: 'security_advisories', icon: 'shield', name: 'Security Advisories', description: 'Security advisories and vulnerability coordination.', category: 'security' },
  { id: 'stargazers', icon: 'star', name: 'Stargazers', description: 'Repository stargazer and signal context.', category: 'community' },
  { id: 'users', icon: 'people', name: 'Users', description: 'GitHub user profile and collaborator context.', category: 'identity' },
  { id: 'copilot', icon: 'copilot', name: 'Copilot', description: 'Copilot-related tools such as coding agent workflows.', category: 'ai' },
  { id: 'copilot_spaces', icon: 'spaces', name: 'Copilot Spaces', description: 'Copilot Spaces context and collaboration tools.', category: 'ai' },
  { id: 'github_support_docs_search', icon: 'support-docs-search', name: 'GitHub Support Docs Search', description: 'Search GitHub product and support documentation.', category: 'docs' }
];

const GOVERNANCE = {
  tawheed: true,
  basis: 'quran-and-sunnah',
  humanAuthority: true,
  readOnlyByDefault: true,
  publishRequiresReview: true,
  noSecretExposure: true,
  noDestructiveGitWithoutExplicitApproval: true
};

function getToolsetsStatus() {
  const enabled = GITHUB_MCP_TOOLSETS.map(toolset => ({
    ...toolset,
    status: 'active',
    lifecycle: [
      'registered',
      'discoverable',
      'api-injectable',
      'monitored',
      'governed'
    ],
    governance: GOVERNANCE
  }));

  return {
    success: true,
    name: 'Sheikha GitHub MCP Toolsets Registry',
    status: 'active',
    mode: 'root-neural-governed-toolsets',
    dynamicToolDiscovery: {
      supported: true,
      recommendedFlag: '--dynamic-toolsets',
      policy: 'enable-on-demand-under-human-review'
    },
    count: enabled.length,
    categories: Array.from(new Set(enabled.map(item => item.category))).sort(),
    toolsets: enabled,
    governance: GOVERNANCE,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  GITHUB_MCP_TOOLSETS,
  getToolsetsStatus
};
