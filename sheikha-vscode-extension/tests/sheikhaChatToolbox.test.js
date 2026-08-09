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
  publishToolAvailability
} = require('../src/chat/sheikhaChatProvider');

function createWebview() {
  return { postMessage: jest.fn(async () => true) };
}

describe('Sheikha governed chat toolbox', () => {
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
