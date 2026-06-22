'use strict';

function createTechnologyRadar() {
  return {
    system: 'SHEIKHA_TECHNOLOGY_RADAR_ENGINE_V1',
    status: 'ACTIVE',
    mode: 'RESEARCH_AND_PROPOSAL_ONLY',
    watchedTechnologies: [
      'nodejs',
      'vscode-api',
      'lsp',
      'mcp',
      'eslint',
      'jest',
      'sonarqube',
      'mongodb',
      'google-cloud',
      'ollama',
      'npm-dependencies'
    ],
    outputs: [
      'upgrade-proposal',
      'compatibility-matrix',
      'risk-assessment',
      'rollback-plan',
      'test-plan'
    ]
  };
}

module.exports = { createTechnologyRadar };
