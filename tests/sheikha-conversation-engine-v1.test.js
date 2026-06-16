'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  getAuditPaths,
  handleConversation,
  isDiagnosticRequest,
  status,
  writeConversationAudit
} = require('../runtime/conversation-engine/sheikha-conversation-engine-v1');
const {
  buildKnownToolResolution,
  classifyIntent,
  executePipeline
} = require('../runtime/execution/sheikha-execution-pipeline-v1');

const ROOT = path.join(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

describe('Sheikha Conversation Engine V1', () => {
  test('declares conversation as primary, inspector as diagnostic, and unified chat as fallback', () => {
    expect(status()).toMatchObject({
      engine: 'SHEIKHA_CONVERSATION_ENGINE_V1',
      primaryRoute: '/api/sheikha/conversation-engine/v1/chat',
      diagnosticRoute: '/api/sheikha/enterprise-inspector/v3/status',
      fallbackRoute: '/api/sheikha/unified-chat',
      foundry: 'SHEIKHA_FOUNDRY_V3',
      orchestrator: 'SHEIKHA_ORCHESTRATOR_FABRIC_V2',
      executionOrchestrator: 'SHEIKHA_SUPREME_ORCHESTRATOR_V1',
      orchestratorFabric: 'SHEIKHA_ORCHESTRATOR_FABRIC_V2',
      highestControlPlane: 11
    });
  });

  test('recognizes explicit diagnostic requests only', () => {
    expect(isDiagnosticRequest('حلل الحالة الحالية للمنظومة')).toBe(true);
    expect(isDiagnosticRequest('افحص المنظومة')).toBe(true);
    expect(isDiagnosticRequest('اكتب تقريراً عن الفوندري')).toBe(false);
    expect(isDiagnosticRequest('اشرح هذا الكود')).toBe(false);
    expect(isDiagnosticRequest('أصلح هذا الخطأ في Todo Tree')).toBe(false);
    expect(isDiagnosticRequest('راجع أخطاء الملف الحالي')).toBe(false);
  });

  test('routes repair requests to direct assistance instead of generic diagnostics', () => {
    expect(classifyIntent('أصلح خطأ Todo-Tree في VS Code')).toBe('CODE_ASSIST');
    expect(classifyIntent('شغل التشخيص واعرض Git status')).toBe('DEBUG_PIPELINE');
    const answer = buildKnownToolResolution(
      'Todo-Tree: Failed to find vscode-ripgrep please set todo-tree.ripgrep'
    );
    expect(answer).toContain('command -v rg');
    expect(answer).toContain('todo-tree.ripgrep');
  });

  test('answers Todo Tree ripgrep failures directly without Debug Pipeline or Inspector dump', () => {
    const response = executePipeline({
      message: "اصلحي Todo-Tree: Failed to find vscode-ripgrep - please install ripgrep manually and set 'todo-tree.ripgrep' to point to the executable",
      mode: 'smart',
      workspaceRoot: ROOT,
      vscodeTools: {
        status: 'ACTIVE',
        diagnostics: [{ file: 'example.js', diagnostics: [{ line: 1, character: 1, message: 'noise' }] }]
      }
    });

    expect(response.success).toBe(true);
    expect(response.answer).toContain('todo-tree.ripgrep');
    expect(response.answer).toContain('/usr/bin/rg');
    expect(response.answer).not.toContain('Debug Pipeline');
    expect(response.answer).not.toContain('Sheikha Enterprise Inspector');
    expect(response.answer).not.toContain('تقرير أدوات VS Code');
  });

  test('normal conversation does not inject Enterprise Inspector', async () => {
    const response = await handleConversation({
      message: 'ضع خطة Agentic محكومة لهذه المهمة',
      mode: 'agentic',
      channel: 'extension-chat',
      workspaceRoot: ROOT
    }, { persist: false });

    expect(response.success).toBe(true);
    expect(response.route).toBe('SHEIKHA_CONVERSATION_ENGINE_V1');
    expect(response.diagnosticRequested).toBe(false);
    expect(response.inspector).toBeUndefined();
    expect(response.layerStack.layers).toHaveLength(8);
    expect(response.layerStack.layers[7].name).toBe('EVIDENCE_OBSERVABILITY');
    expect(response.orchestrationFabric.apexLevel).toBe(11);
    expect(response.orchestrationFabric.fabric).toBe('SHEIKHA_ORCHESTRATOR_FABRIC_V2');
    expect(response.apexControlPlane.apexLevel).toBe(10);
    expect(response.apexControlPlane.foundry.foundry).toBe('SHEIKHA_FOUNDRY_V3');
    expect(response.apexControlPlane.orchestrator.name).toBe('SHEIKHA_SUPREME_ORCHESTRATOR_V1');
    expect(response.memory).toBeUndefined();
    expect(response.answer).toContain('خطة Agentic محكومة');
  });

  test('explicit diagnostic conversation uses the supplied inspector snapshot', async () => {
    const inspectorSnapshot = {
      inspector: 'SHEIKHA_ENTERPRISE_INSPECTOR_V3',
      status: 'ATTENTION',
      health: {
        overall: 'ATTENTION',
        runtime: 'ACTIVE',
        governance: 'ACTIVE',
        unifiedChat: 'ACTIVE',
        extension: 'CONNECTED',
        diagnostics: { errors: 1, warnings: 0, information: 0, total: 1 }
      },
      runtime: {},
      git: {},
      workspace: {},
      surfaces: {}
    };
    const response = await handleConversation({
      message: 'حلل حالة المنظومة',
      mode: 'smart',
      inspectorSnapshot,
      diagnosticRequested: true,
      workspaceRoot: ROOT
    }, { persist: false });

    expect(response.success).toBe(true);
    expect(response.diagnosticRequested).toBe(true);
    expect(response.inspector).toBe(inspectorSnapshot);
    expect(response.answer).toContain('Sheikha Enterprise Inspector');
    expect(response.answer).toContain('Errors: 1');
  });

  test('writes latest response and append-only audit evidence', () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-conversation-'));
    const record = {
      success: true,
      route: 'SHEIKHA_CONVERSATION_ENGINE_V1',
      fallback: false,
      diagnosticRequested: false,
      intent: 'GENERAL_AGENT',
      channel: 'extension-chat',
      message: 'اختبار سجل المحادثة',
      answer: 'استجابة محكومة',
      layerStack: {
        requestId: 'REQ-AUDIT-1',
        layers: [{ layer: 1, name: 'CONVERSATION_ENGINE', status: 'ACTIVE' }]
      },
      timestamp: '2026-06-14T00:00:00.000Z'
    };

    const result = writeConversationAudit(record, { rootDir });
    const paths = getAuditPaths(rootDir);
    const latest = JSON.parse(fs.readFileSync(paths.latest, 'utf8'));
    const audit = fs.readFileSync(paths.audit, 'utf8').trim().split('\n').map(JSON.parse);

    expect(result.success).toBe(true);
    expect(latest.response.answer).toBe('استجابة محكومة');
    expect(latest.requestId).toBe('REQ-AUDIT-1');
    expect(latest.layerTrace).toHaveLength(1);
    expect(latest.request).toHaveProperty('sha256');
    expect(audit).toHaveLength(1);
    expect(audit[0].response.preview).toBe('استجابة محكومة');
  });

  test('server and extension use the required endpoint policy', () => {
    const server = read('server.js');
    const route = read('routes/sheikha-conversation-engine-v1-routes.js');
    const client = read('sheikha-vscode-extension/src/sheikhaExtensionChatClient.js');
    const apiClient = read('sheikha-vscode-extension/src/sheikhaApiClient.js');
    const provider = read('sheikha-vscode-extension/src/chat/sheikhaChatProvider.js');
    const inspector = read('sheikha-vscode-extension/src/sheikhaInspectorProvider.js');
    const conversationMount = "app.use(require('./routes/sheikha-conversation-engine-v1-routes'));";
    const unifiedMount = "app.use(require('./routes/sheikha-unified-chat-fabric'));";

    expect(server.split(conversationMount).length - 1).toBe(1);
    expect(server.indexOf(conversationMount)).toBeLessThan(server.indexOf(unifiedMount));
    expect(route).toContain("router.get('/api/sheikha/conversation-engine/v1/chat'");
    expect(route).toContain("method: 'POST'");
    expect(client).toContain("const CONVERSATION_ENDPOINT = '/api/sheikha/conversation-engine/v1/chat';");
    expect(client).toContain("const INSPECTOR_STATUS_ENDPOINT = '/api/sheikha/enterprise-inspector/v3/status';");
    expect(client).toContain("const UNIFIED_CHAT_FALLBACK_ENDPOINT = '/api/sheikha/unified-chat';");
    expect(apiClient).toContain("EXTENSION_CHAT_ENDPOINT = '/api/sheikha/conversation-engine/v1/chat'");
    expect(provider).toContain('Debugging Apex · Vital Chat Apex · Runtime L1-L8 · Extension 1.0.84');
    expect(provider).toContain("command: 'debuggingStatus'");
    expect(provider).toContain('Debugging Apex');
    expect(provider).toContain('addTrace(msg.meta && msg.meta.layers)');
    expect(provider).toContain("command: 'experienceStatus'");
    expect(inspector).toContain('getEnterpriseInspectorStatus');
  });
});
