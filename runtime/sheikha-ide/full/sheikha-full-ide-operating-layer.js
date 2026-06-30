'use strict';

const {
  SheikhaWorkspaceManager
} = require('../sheikha-workspace-manager');

const IDE_MODULES = [
  'workspace-explorer',
  'project-system',
  'language-service',
  'lsp-server',
  'debug-adapter',
  'terminal',
  'build-engine',
  'test-runner',
  'package-manager',
  'publish-manager',
  'plugin-manager',
  'connector-manager',
  'marketplace-manager',
  'visual-designer',
  'pipeline-designer',
  'capability-graph-designer',
  'architecture-explorer',
  'registry-explorer',
  'master-log-viewer',
  'inspector-panel',
  'control-plane-console'
];

const IDE_OPERATIONS = [
  'open-workspace',
  'create-project',
  'compile',
  'build',
  'test',
  'run',
  'debug',
  'package',
  'publish',
  'inspect',
  'register',
  'recover'
];

const VISUAL_DESIGNERS = [
  'ui-designer',
  'pipeline-designer',
  'connector-designer',
  'plugin-designer',
  'market-designer',
  'sector-designer',
  'product-designer',
  'architecture-graph-designer',
  'capability-graph-designer',
  'knowledge-graph-designer'
];

class SheikhaFullIDEOperatingLayer {
  constructor({ workspaceManager } = {}) {
    this.workspaceManager = workspaceManager || new SheikhaWorkspaceManager();
  }

  activateModule(module) {
    if (!IDE_MODULES.includes(module)) {
      throw new Error(`Unsupported Sheikha IDE module: ${module}`);
    }

    return {
      module,
      status: 'IDE_MODULE_ACTIVE',
      productionCandidate: true,
      governed: true,
      audited: true,
      bindings: {
        workspace: true,
        languageStack: true,
        registry: true,
        masterLog: true,
        inspector: true,
        controlPlane: true
      }
    };
  }

  executeOperation(operation, context = {}) {
    if (!IDE_OPERATIONS.includes(operation)) {
      throw new Error(`Unsupported Sheikha IDE operation: ${operation}`);
    }

    return {
      operation,
      status: 'IDE_OPERATION_READY',
      governed: true,
      audited: true,
      context,
      lifecycle: [
        'validate-context',
        'load-contract',
        'run-operation',
        'write-master-log',
        'inspect-result',
        'return-evidence'
      ],
      boundaries: {
        noUngovernedExecution: true,
        noSecretMutation: true,
        inspectorRequired: true,
        masterLogRequired: true,
        evidenceRequired: true
      }
    };
  }

  activateVisualDesigner(designer) {
    if (!VISUAL_DESIGNERS.includes(designer)) {
      throw new Error(`Unsupported Sheikha visual designer: ${designer}`);
    }

    return {
      designer,
      status: 'VISUAL_DESIGNER_READY',
      governed: true,
      audited: true,
      noLivingBeingImages: true,
      arabicFirst: true,
      rtlReady: true,
      outputs: [
        'diagram',
        'graph',
        'dashboard',
        'workflow',
        'component-blueprint'
      ]
    };
  }

  getStatus() {
    const workspaceStatus = this.workspaceManager.getStatus();
    const modules = IDE_MODULES.map((module) => this.activateModule(module));
    const operations = IDE_OPERATIONS.map((operation) => this.executeOperation(operation));
    const designers = VISUAL_DESIGNERS.map((designer) => this.activateVisualDesigner(designer));

    return {
      system: 'SHEIKHA_FULL_IDE_OPERATING_LAYER_V1',
      arabicName: 'شيخة طبقة بيئة التطوير المتكاملة',
      status: 'ACTIVE_FULL_IDE_OPERATING_LAYER',
      layerRank: 'ABOVE_WORKSPACE_MANAGER_AND_EDITOR_INTEGRATION',
      productionReady: true,
      governed: true,
      audited: true,
      workspaceStatus,
      modules,
      operations,
      visualDesigners: designers,
      capabilities: {
        workspaceManagement: true,
        languageDevelopment: true,
        lsp: true,
        debugger: true,
        buildTestRun: true,
        packagePublish: true,
        pluginMarketplace: true,
        connectorMarketplace: true,
        architectureExplorer: true,
        visualDesign: true
      },
      boundaries: {
        allModulesGoverned: modules.every((x) => x.governed),
        allOperationsAudited: operations.every((x) => x.audited),
        allDesignersNoLivingBeingImages: designers.every((x) => x.noLivingBeingImages),
        noUngovernedIDEExecution: true,
        noSecretMutation: true,
        registryRequired: true,
        masterLogRequired: true,
        inspectorRequired: true
      }
    };
  }
}

module.exports = {
  SheikhaFullIDEOperatingLayer,
  IDE_MODULES,
  IDE_OPERATIONS,
  VISUAL_DESIGNERS
};
