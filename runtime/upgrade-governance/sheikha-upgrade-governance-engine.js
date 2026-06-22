'use strict';

function createModuleModernizationPlan() {
  return {
    system: 'SHEIKHA_UPGRADE_GOVERNANCE_ENGINE_V1',
    status: 'ACTIVE',
    warning: 'File is a CommonJS module; it may be converted to an ES module',
    category: 'MODULE_SYSTEM_MODERNIZATION',
    upgrade: {
      from: 'CommonJS',
      to: 'ES Module',
      strategy: 'INCREMENTAL_GOVERNED_MIGRATION',
      automaticFullMigration: false
    },
    goals: [
      'modern-nodejs-compatibility',
      'vscode-lsp-readiness',
      'sonar-warning-reduction-through-real-fixes',
      'future-language-platform-readiness',
      'safe-upgrade-with-rollback'
    ],
    gates: [
      'research',
      'proposal',
      'compatibility-review',
      'sandbox',
      'tests-pass',
      'lint-pass',
      'rollback-plan',
      'human-approval'
    ],
    protectedBoundaries: [
      'do-not-break-jest',
      'do-not-change-package-type-globally-without-plan',
      'do-not-hide-warning',
      'do-not-overwrite-config',
      'preserve-runtime-contracts'
    ]
  };
}

module.exports = {
  createModuleModernizationPlan
};
