'use strict';

jest.mock('vscode', () => ({
  commands: {
    executeCommand: jest.fn(),
    getCommands: jest.fn(async () => [])
  }
}), { virtual: true });

const {
  CHAT_TOOL_COMMAND_IDS
} = require('../src/ui/sheikhaChatTemplate');
const {
  executeGovernedChatTool,
  isSheikhaConsoleRequest,
  SheikhaChatProvider,
  publishToolAvailability
} = require('../src/chat/sheikhaChatProvider');

function createWebview() {
  return { postMessage: jest.fn(async () => true) };
}

describe('Sheikha governed chat toolbox', () => {
  test('transcript report, DOC, SUM and PKG stay in local routes and out of model history', async () => {
    const { QUICK_ACTIONS } = require('../src/ui/sheikhaChatTemplate');
    const provider = new SheikhaChatProvider({}); let receive;
    const view = { webview: { postMessage: jest.fn(async () => true),
      onDidReceiveMessage: handler => { receive = handler; } }, onDidDispose: () => {} };
    provider.resolveWebviewView(view);
    provider.history = [{ role: 'assistant', content: 'التشخيص: OLD_INSPECTOR_507' }];
    await receive({ command: 'ask', text: 'هيكل شيخة' });
    provider.workbench.output('فهرس البيانات', 'SIDEBAR_EMPTY_CATALOG');
    await receive({ command: 'ask', text: 'اكتب تقرير' });
    let reply = view.webview.postMessage.mock.calls.filter(([event]) => event.command === 'reply').at(-1)[0];
    expect(reply.text).toContain('إدارة الذكاء الصناعي');
    expect(reply.text).not.toContain('OLD_INSPECTOR_507');
    expect(reply.text).not.toContain('SIDEBAR_EMPTY_CATALOG');
    for (const icon of ['DOC', 'SUM']) {
      await receive({ command: 'ask', text: QUICK_ACTIONS.find(item => item.icon === icon).prompt });
      reply = view.webview.postMessage.mock.calls.filter(([event]) => event.command === 'reply').at(-1)[0];
      expect(reply.meta.route).toBe('SHEIKHA_LOCAL_CONTEXT_REPORT');
      expect(reply.meta.modelHistoryIncluded).toBe(false);
    }
    provider.workbench.handle = jest.fn(async () => { provider.workbench.output('PKG', 'LOCAL_PACKAGE_HASH'); return true; });
    await receive({ command: 'ask', text: QUICK_ACTIONS.find(item => item.icon === 'PKG').prompt });
    expect(provider.workbench.handle).toHaveBeenCalledWith({ command: 'workbench', action: 'delivery' });
    expect(provider.history).toEqual([{ role: 'assistant', content: 'التشخيص: OLD_INSPECTOR_507' }]);
    expect(view.webview.postMessage.mock.calls.some(([event]) => event.command === 'streamStart')).toBe(false);
  });
  test('clears actual provider memory and refuses clear while a request is pending', async () => {
    const provider = new SheikhaChatProvider({});
    let receive;
    const view = { webview: { postMessage: jest.fn(async () => true),
      onDidReceiveMessage: handler => { receive = handler; } }, onDidDispose: () => {} };
    provider.resolveWebviewView(view);
    const conversationId = provider.conversationId;
    provider.history = [{ role: 'user', content: 'session-private' }];
    provider.pendingViews.add(view);
    await receive({ command: 'clearConversation' });
    expect(provider.history).toHaveLength(1);
    provider.pendingViews.delete(view);
    await receive({ command: 'clearConversation' });
    expect(provider.history).toEqual([]);
    expect(provider.conversationId).not.toBe(conversationId);
    expect(view.webview.postMessage).toHaveBeenCalledWith({ command: 'conversationCleared' });
  });

  test('an explicit architecture request returns the local document through the actual provider', async () => {
    const provider = new SheikhaChatProvider({}); let receive;
    const view = { webview: { postMessage: jest.fn(async () => true),
      onDidReceiveMessage: handler => { receive = handler; } }, onDidDispose: () => {} };
    provider.resolveWebviewView(view);
    await receive({ command: 'ask', text: 'هيكل شيخة' });
    expect(view.webview.postMessage).toHaveBeenCalledWith(expect.objectContaining({ command: 'reply',
      text: expect.stringContaining('إدارة الذكاء الصناعي'), meta: expect.objectContaining({ route: 'SHEIKHA_LOCAL_WORKBENCH', externalRequest: false }) }));
    expect(provider.history).toHaveLength(0);
    expect(provider.workbench.outputs).toHaveLength(1);
  });

  test('local evidence never enters model history and a concurrent tool cannot run', async () => {
    const provider = new SheikhaChatProvider({}); let receive;
    const view = { webview: { postMessage: jest.fn(async () => true),
      onDidReceiveMessage: handler => { receive = handler; } }, onDidDispose: () => {} };
    provider.resolveWebviewView(view);
    provider.history = [{ role: 'user', content: 'previous normal conversation' }];
    const api = require('vscode'); api.commands.executeCommand.mockClear();
    provider.pendingViews.add(view);
    await receive({ command: 'tool', toolId: 'sheikha.showStatus' });
    await receive({ command: 'ask', text: 'cli' });
    expect(api.commands.executeCommand).not.toHaveBeenCalled();
    provider.pendingViews.delete(view);
    provider.workbench.handle = jest.fn(async () => {
      provider.workbench.output('evidence', 'PRIVATE_LOCAL_EVIDENCE'); return true;
    });
    await receive({ command: 'ask', text: 'تكامل شيخة' });
    expect(provider.history).toEqual([{ role: 'user', content: 'previous normal conversation' }]);
    expect(view.webview.postMessage).toHaveBeenCalledWith(expect.objectContaining({ command: 'reply',
      text: 'PRIVATE_LOCAL_EVIDENCE', meta: expect.objectContaining({ modelHistoryIncluded: false }) }));
  });
  test('recognizes direct console requests without treating arbitrary text as CLI', () => {
    expect(isSheikhaConsoleRequest('شغل cli')).toBe(true);
    expect(isSheikhaConsoleRequest('cmd')).toBe(true);
    expect(isSheikhaConsoleRequest('شغل أمرًا ضارًا')).toBe(false);
  });
  test('reports the registered command subset to the webview', async () => {
    const webview = createWebview();
    const vscodeApi = {
      commands: {
        getCommands: jest.fn(async () => [
          'sheikha.ask',
          'sheikha.showStatus',
          'unrelated.command'
        ])
      }
    };

    const available = await publishToolAvailability(webview, vscodeApi);

    expect(available).toEqual(['sheikha.ask', 'sheikha.showStatus']);
    expect(webview.postMessage).toHaveBeenCalledWith(expect.objectContaining({
      command: 'toolAvailability',
      available: ['sheikha.ask', 'sheikha.showStatus'],
      total: 39
    }));
  });

  test('executes an allowlisted and registered tool without passing webview arguments', async () => {
    const webview = createWebview();
    const executeCommand = jest.fn(async () => undefined);
    const vscodeApi = {
      commands: {
        getCommands: jest.fn(async () => [...CHAT_TOOL_COMMAND_IDS]),
        executeCommand
      }
    };

    const result = await executeGovernedChatTool(
      webview,
      'sheikha.showStatus',
      vscodeApi
    );

    expect(result).toBe(true);
    expect(executeCommand).toHaveBeenCalledWith('sheikha.showStatus');
    expect(executeCommand).toHaveBeenCalledTimes(1);
    expect(webview.postMessage).toHaveBeenCalledWith(expect.objectContaining({
      command: 'toolResult',
      toolId: 'sheikha.showStatus',
      success: true
    }));
  });

  test('rejects an arbitrary command that is not in the chat allowlist', async () => {
    const webview = createWebview();
    const executeCommand = jest.fn();
    const vscodeApi = {
      commands: {
        getCommands: jest.fn(async () => ['workbench.action.terminal.sendSequence']),
        executeCommand
      }
    };

    const result = await executeGovernedChatTool(
      webview,
      'workbench.action.terminal.sendSequence',
      vscodeApi
    );

    expect(result).toBe(false);
    expect(executeCommand).not.toHaveBeenCalled();
    expect(webview.postMessage).toHaveBeenCalledWith(expect.objectContaining({
      command: 'toolResult',
      success: false
    }));
  });
});
