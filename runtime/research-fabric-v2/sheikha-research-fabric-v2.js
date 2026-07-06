'use strict';

function createUpgradeResearchPlan() {
  return {
    system: 'SHEIKHA_RESEARCH_FABRIC_V2',
    status: 'ACTIVE',
    mode: 'RESEARCH_AND_PROPOSAL_ONLY',
    targets: [
      'nodejs',
      'vscode-api',
      'lsp',
      'eslint',
      'sonarqube',
      'jest',
      'mongodb',
      'google-cloud',
      'mcp',
      'ollama',
      'language-server'
    ],
    gates: [
      'compatibility-review',
      'security-review',
      'tests-pass',
      'lint-pass',
      'rollback-plan',
      'human-approval-for-high-impact-upgrades'
    ],
    noAutomaticProductionUpgrade: true
  };
}

module.exports = {
  createUpgradeResearchPlan
};
