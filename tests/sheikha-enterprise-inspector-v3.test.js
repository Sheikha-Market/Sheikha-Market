'use strict';

const fs = require('fs');
const path = require('path');
const {
  collectEnterpriseInspector,
  compactInspectorContext,
  sanitizeExtensionContext,
  summarizeDiagnostics
} = require('../core/enterprise/sheikha-enterprise-inspector-v3');
const {
  executePipeline,
  classifyIntent,
  buildEnterpriseInspectorReport
} = require('../runtime/execution/sheikha-execution-pipeline-v1');

const ROOT = path.join(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

describe('Sheikha Enterprise Inspector V3', () => {
  test('registry keeps operational claims governed and truthful', () => {
    const registry = JSON.parse(read(
      'runtime/enterprise-inspector/v3/sheikha-enterprise-inspector-v3.json'
    ));

    expect(registry.system).toBe('SHEIKHA_ENTERPRISE_INSPECTOR_V3');
    expect(registry.status).toBe('ACTIVE');
    expect(registry.governance.minimumNecessaryContext).toBe(true);
    expect(registry.governance.secretsExcluded).toBe(true);
    expect(registry.intelligence.agiClaimed).toBe(false);
    expect(registry.intelligence.asiClaimed).toBe(false);
  });

  test('extension context is minimized and excludes selected source text', () => {
    const context = sanitizeExtensionContext({
      vscodeTools: {
        registry: 'SHEIKHA_VSCODE_TOOL_REGISTRY_V1',
        status: 'ACTIVE',
        workspaceRoot: '/work/private/project',
        activeFile: '/work/private/project/server.js',
        selectedText: 'SECRET_SOURCE_MUST_NOT_LEAVE_EXTENSION',
        gitStatus: ' M server.js',
        diagnostics: [{
          file: '/work/private/project/server.js',
          diagnostics: [{ message: 'Unexpected value', severity: 0, line: 8, character: 2 }]
        }]
      }
    });

    expect(context.workspace.name).toBe('project');
    expect(context.workspace.activeFile).toBe('server.js');
    expect(JSON.stringify(context)).not.toContain('SECRET_SOURCE_MUST_NOT_LEAVE_EXTENSION');
    expect(JSON.stringify(context)).not.toContain('/work/private');
    expect(summarizeDiagnostics(context.diagnostics)).toEqual({
      errors: 1,
      warnings: 0,
      information: 0,
      total: 1
    });
  });

  test('snapshot unifies runtime, governance, chat, extension, and architecture', () => {
    const snapshot = collectEnterpriseInspector({
      vscodeTools: {
        status: 'ACTIVE',
        gitBranch: 'feature/inspector',
        diagnostics: []
      }
    });
    const compact = compactInspectorContext(snapshot);

    expect(snapshot.success).toBe(true);
    expect(snapshot.inspector).toBe('SHEIKHA_ENTERPRISE_INSPECTOR_V3');
    expect(snapshot.governance.contextPolicy).toBe('MINIMUM_NECESSARY_NO_SECRETS');
    expect(snapshot.surfaces.unifiedChat).toBe('/api/sheikha/unified-chat');
    expect(snapshot.surfaces.extensionChat).toBe('/api/sheikha/extension/chat');
    expect(snapshot.surfaces.streamingChatApex)
      .toBe('/api/sheikha/streaming-chat-apex/v1/status');
    expect(snapshot.health.streamingChatApex).toBe('ACTIVE');
    expect(snapshot.surfaces.cloudProductionDeploymentApex)
      .toBe('/api/sheikha/cloud-production-deployment-apex/v1/status');
    expect(snapshot.health.cloudProductionDeploymentApex).toBe('ACTIVE');
    expect(snapshot.surfaces.distributionReleaseApex)
      .toBe('/api/sheikha/distribution-apex/v1/status');
    expect(snapshot.health.distributionReleaseApex)
      .toBe('ACTIVE_WITH_EVIDENCE_GATED_LOCAL_RELEASE');
    expect(snapshot.distributionReleaseApex.apexLevel).toBe(27);
    expect(snapshot.distributionReleaseApex.layerRelationship.crossPlaneAuthorityEscalation)
      .toBe(false);
    expect(snapshot.surfaces.publicBenefitPolicy)
      .toBe('/api/governance/generator/public-benefit-policy');
    expect(snapshot.health.publicBenefitCapabilityRouter)
      .toBe('ACTIVE_GOVERNED_EVALUATION_ONLY');
    expect(snapshot.publicBenefitCapabilityRouter.coverage.policyCoverageActivatesComponents)
      .toBe(false);
    expect(snapshot.architecture.flow).toContain('Governance Review');
    expect(snapshot.architecture.nodes).toContain('Streaming Multilingual Chat Apex');
    expect(snapshot.architecture.nodes).toContain('Cloud Production Deployment Apex');
    expect(snapshot.architecture.nodes).toContain('Universal Distribution Release Apex');
    expect(snapshot.architecture.nodes).toContain('Runtime Fabric V5');
    expect(snapshot.surfaces.runtimeFabric).toBe('/api/sheikha/runtime-fabric/v5/status');
    expect(snapshot.runtimeFabric.cluster.multiNode.active).toBe(false);
    expect(snapshot.surfaces.civilizationCommand)
      .toBe('/api/sheikha/civilization-command/v1/status');
    expect(snapshot.surfaces.civilizationStewardship)
      .toBe('/api/sheikha/civilization-stewardship/v1/status');
    expect(snapshot.civilizationStewardship.apexLevel).toBe(16);
    expect(snapshot.surfaces.covenantGovernance)
      .toBe('/api/sheikha/covenant-governance/v1/status');
    expect(snapshot.covenantGovernance.apexLevel).toBe(17);
    expect(snapshot.civilizationCommand.governanceAuthority)
      .toBe('SHEIKHA_CIVILIZATION_GOVERNANCE_V2');
    expect(compact.success).toBe(true);
    expect(compact.intelligence).toBeUndefined();
  });

  test('chat recognizes inspector requests and returns measured state', () => {
    const snapshot = {
      inspector: 'SHEIKHA_ENTERPRISE_INSPECTOR_V3',
      status: 'ATTENTION',
      health: {
        overall: 'ATTENTION',
        runtime: 'ACTIVE',
        governance: 'ACTIVE',
        unifiedChat: 'ACTIVE',
        extension: 'ACTIVE',
        diagnostics: { errors: 2, warnings: 1, information: 0, total: 3 }
      },
      runtime: { cpuLoad1m: 0.5, ramUsedPercent: 30, heapUsedMb: 20, heapTotalMb: 40, uptimeSeconds: 60 },
      git: { branch: 'main', clean: false, changedFileCount: 1 },
      workspace: { branch: 'main', activeFile: 'server.js', changedFiles: ['M server.js'] },
      surfaces: {}
    };

    expect(classifyIntent('اعرض حالة المنظومة من المفتش')).toBe('ENTERPRISE_INSPECTOR');
    expect(buildEnterpriseInspectorReport(snapshot)).toContain('Errors: 2');

    const result = executePipeline({
      message: 'اعرض حالة المنظومة من Enterprise Inspector',
      mode: 'smart',
      workspaceRoot: ROOT,
      enterpriseInspector: snapshot
    });

    expect(result.intent).toBe('ENTERPRISE_INSPECTOR');
    expect(result.answer).toContain('Sheikha Enterprise Inspector');
    expect(result.answer).toContain('تحتاج مراجعة');
  });

  test('server mounts inspector once before unified chat', () => {
    const server = read('server.js');
    const inspectorMount = "app.use(require('./routes/sheikha-enterprise-inspector-v3-routes'));";
    const chatMount = "app.use(require('./routes/sheikha-unified-chat-fabric'));";

    expect(server.split(inspectorMount).length - 1).toBe(1);
    expect(server.indexOf(inspectorMount)).toBeLessThan(server.indexOf(chatMount));
  });

  test('extension inspector and chat share an actionable governed flow', () => {
    const activation = read('sheikha-vscode-extension/src/extension.js');
    const inspector = read('sheikha-vscode-extension/src/sheikhaInspectorProvider.js');
    const chat = read('sheikha-vscode-extension/src/chat/sheikhaChatProvider.js');
    const client = read('sheikha-vscode-extension/src/sheikhaExtensionChatClient.js');
    const extensionPackage = JSON.parse(read('sheikha-vscode-extension/package.json'));

    expect(activation).toContain('chatProvider.prefill(prompt, true)');
    expect(activation).toContain("registerCommandOnce(context, 'sheikha.openChat'");
    expect(activation).toContain("registerWebviewProviderSafe(\n      context,\n      'sheikha.chatView'");
    expect(activation).not.toContain("'sheikha.advancedChatView'");
    expect(activation).not.toContain("'sheikha.ai.advancedChat'");
    expect(extensionPackage.activationEvents).toContain('onView:sheikha.chatView');
    expect(extensionPackage.activationEvents).toContain('onView:sheikha.inspectorView');
    expect(extensionPackage.activationEvents).not.toContain('onView:sheikha.chatview');
    expect(inspector).toContain('getEnterpriseInspectorStatus');
    expect(inspector).toContain('حلل في الشات');
    expect(chat).toContain("command: 'prefill'");
    expect(chat).toContain('حالة المنظومة');
    expect(client).toContain('SHEIKHA_ENTERPRISE_CHAT_GOVERNANCE_V1');
  });
});
