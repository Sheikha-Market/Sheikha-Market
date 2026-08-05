'use strict';

const vscode = require('vscode');
const { sendInspectorHeartbeat } = require('./sheikhaEnterpriseInspectorBridge');
const { DEFAULT_BASE_URL } = require('./sheikhaExtensionChatClient');
const { registerSheikhaCommandBridge } = require('./sheikhaCommandBridge');
const { collectVsCodeAwareness } = require('./vscodeAwareness');
const { collectUnifiedRegistry } = require('./sheikhaUnifiedRegistry');
const { collectRegistryBroker } = require('./sheikhaRegistryBroker');
const { collectGlobalRegistryFabric } = require('./sheikhaGlobalRegistryFabric');

async function openSheikhaChatView() {
  await vscode.commands.executeCommand('workbench.view.extension.sheikha');
  try {
    await vscode.commands.executeCommand('sheikha.chatView.focus');
  } catch (_) {}
}

function getConfiguredBaseUrl() {
  const configured = String(
    vscode.workspace.getConfiguration('sheikha').get('serverUrl', DEFAULT_BASE_URL)
  ).trim().replace(/\/+$/u, '');
  try {
    const url = new URL(configured);
    return ['http:', 'https:'].includes(url.protocol) ? url.toString().replace(/\/+$/u, '') : DEFAULT_BASE_URL;
  } catch {
    return DEFAULT_BASE_URL;
  }
}

function registerCommandOnce(context, command, handler) {
  context.subscriptions.push(vscode.commands.registerCommand(command, handler));
}

function registerWebviewProviderSafe(context, viewId, provider, options = {}) {
  try {
    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(viewId, provider, options)
    );
    return true;
  } catch (error) {
    console.warn(`[Sheikha] Failed to register view ${viewId}:`, error.message);
    return false;
  }
}

function activate(context) {
  registerCommandOnce(context, 'sheikha.chat.open', openSheikhaChatView);
  registerCommandOnce(context, 'sheikha.openChat', openSheikhaChatView);

  const refreshSeconds = Math.max(
    15,
    Number(vscode.workspace.getConfiguration('sheikha').get('inspectorRefreshSeconds', 30)) || 30
  );
  let inspectorHeartbeatInFlight = false;
  const sendHeartbeat = async () => {
    if (inspectorHeartbeatInFlight) return;
    inspectorHeartbeatInFlight = true;
    try {
      await sendInspectorHeartbeat(getConfiguredBaseUrl());
    } catch {} finally {
      inspectorHeartbeatInFlight = false;
    }
  };
  const sheikhaInspectorHeartbeat = setInterval(() => {
    sendHeartbeat();
  }, refreshSeconds * 1000);
  context.subscriptions.push({ dispose: () => clearInterval(sheikhaInspectorHeartbeat) });
  sendHeartbeat();

  let chatProvider = null;
  let inspectorProvider = null;
  const providerRegistrations = {
    chat: false,
    inspector: false
  };
  try {
    const { SheikhaChatProvider } = require('./chat/sheikhaChatProvider');
    const { SheikhaInspectorProvider } = require('./sheikhaInspectorProvider');

    chatProvider = new SheikhaChatProvider(context, { getBaseUrl: getConfiguredBaseUrl });
    inspectorProvider = new SheikhaInspectorProvider(context, {
      getBaseUrl: getConfiguredBaseUrl,
      refreshSeconds,
      onAsk: async (prompt) => {
        await openSheikhaChatView();
        await new Promise((resolve) => setTimeout(resolve, 150));
        chatProvider.prefill(prompt, true);
      }
    });

    providerRegistrations.inspector = registerWebviewProviderSafe(
      context,
      'sheikha.inspectorView',
      inspectorProvider,
      { webviewOptions: { retainContextWhenHidden: true } }
    );

    providerRegistrations.chat = registerWebviewProviderSafe(
      context,
      'sheikha.chatView',
      chatProvider,
      { webviewOptions: { retainContextWhenHidden: true } }
    );
  } catch (error) {
    console.error('[Sheikha] Chat/Inspector provider activation failed:', error);
    vscode.window.showErrorMessage(`Sheikha chat failed to activate: ${error.message}`);
  }

  registerSheikhaCommandBridge(context, {
    chatProvider,
    getBaseUrl: getConfiguredBaseUrl,
    openChat: openSheikhaChatView
  });
  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBar.name = 'Sheikha Local Runtime';
  statusBar.text = '$(pulse) شيخة: محلي';
  statusBar.tooltip = 'فتح Sheikha Enterprise Inspector';
  statusBar.command = 'sheikha.openWorkspaceControl';
  statusBar.show();
  context.subscriptions.push(statusBar);

  console.log('Sheikha extension activated');

  if (process.env.SHEIKHA_EXTENSION_SMOKE_EVIDENCE) {
    const {
      runLiveExtensionSmoke
    } = require('./sheikhaLiveExtensionSmoke');
    runLiveExtensionSmoke({
      vscode,
      context,
      chatProvider,
      inspectorProvider,
      registrations: providerRegistrations,
      expectedVersion: context.extension.packageJSON.version,
      baseUrl: getConfiguredBaseUrl()
    }).then((report) => {
      console.log('[Sheikha] Live extension smoke', report.status);
      if (process.env.SHEIKHA_EXTENSION_SMOKE_CLOSE === '1') {
        return vscode.commands.executeCommand(
          'workbench.action.closeWindow'
        );
      }
      return null;
    }).catch((error) => {
      console.error('[Sheikha] Live extension smoke failed:', error);
      if (process.env.SHEIKHA_EXTENSION_SMOKE_CLOSE === '1') {
        return vscode.commands.executeCommand(
          'workbench.action.closeWindow'
        );
      }
      return null;
    });
  }

  context.subscriptions.push(
    vscode.commands.registerCommand('sheikha.awareness.scan', async () => {
      const data = await collectVsCodeAwareness();
      const doc = await vscode.workspace.openTextDocument({
        content: JSON.stringify(data, null, 2),
        language: 'json'
      });
      await vscode.window.showTextDocument(doc);
    })
  );




  context.subscriptions.push(
    vscode.commands.registerCommand('sheikha.registry.global', async () => {
      const data = await collectGlobalRegistryFabric();
      const doc = await vscode.workspace.openTextDocument({
        content: JSON.stringify(data, null, 2),
        language: 'json'
      });
      await vscode.window.showTextDocument(doc);
    })
  );

context.subscriptions.push(
    vscode.commands.registerCommand('sheikha.registry.broker', async () => {
      const data = await collectRegistryBroker();
      const doc = await vscode.workspace.openTextDocument({
        content: JSON.stringify(data, null, 2),
        language: 'json'
      });
      await vscode.window.showTextDocument(doc);
    })
  );

context.subscriptions.push(
    vscode.commands.registerCommand('sheikha.registry.unified', async () => {
      const data = await collectUnifiedRegistry();
      const doc = await vscode.workspace.openTextDocument({
        content: JSON.stringify(data, null, 2),
        language: 'json'
      });
      await vscode.window.showTextDocument(doc);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('sheikha.devtools.toggle', async () => {
      await vscode.commands.executeCommand('workbench.action.toggleDevTools');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('sheikha.console.open', async () => {
      const terminal = vscode.window.createTerminal({ name: 'Sheikha Console' });
      terminal.show();
      terminal.sendText('cd ~/Projects/sheikha/sheikha-main-portal');
      terminal.sendText('echo "Sheikha Console Ready"');
      terminal.sendText('curl -s http://127.0.0.1:8080/api/sheikha/developer-tools-apex/v1/status | jq');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('sheikha.inspector.devtools', async () => {
      await vscode.commands.executeCommand('sheikha.console.open');
      await vscode.commands.executeCommand('sheikha.devtools.toggle');
    })
  );

}

function deactivate() {}

module.exports = { activate, deactivate, getConfiguredBaseUrl };
