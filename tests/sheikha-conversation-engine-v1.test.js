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
      foundry: 'SHEIKHA_FOUNDRY_V2'
    });
  });

  test('recognizes explicit diagnostic requests only', () => {
    expect(isDiagnosticRequest('حلل الحالة الحالية للمنظومة')).toBe(true);
    expect(isDiagnosticRequest('افحص المنظومة')).toBe(true);
    expect(isDiagnosticRequest('اكتب تقريراً عن الفوندري')).toBe(false);
    expect(isDiagnosticRequest('اشرح هذا الكود')).toBe(false);
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
    expect(provider).toContain('Conversation Stack L8 · Enterprise Governance · Foundry V2 · Extension 1.0.79');
    expect(provider).toContain('addTrace(msg.meta && msg.meta.layers)');
    expect(inspector).toContain('getEnterpriseInspectorStatus');
  });
});
