'use strict';

const vscode = require('vscode');
const { sendInspectorHeartbeat } = require('./sheikhaEnterpriseInspectorBridge');
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

  const sheikhaInspectorHeartbeat = setInterval(() => {
    sendInspectorHeartbeat().catch(() => {});
  }, 15000);
  context.subscriptions.push({ dispose: () => clearInterval(sheikhaInspectorHeartbeat) });
  sendInspectorHeartbeat().catch(() => {});

  let chatProvider = null;
  try {
    const { SheikhaChatProvider } = require('./chat/sheikhaChatProvider');
    const { SheikhaInspectorProvider } = require('./sheikhaInspectorProvider');

    chatProvider = new SheikhaChatProvider(context);
    const inspectorProvider = new SheikhaInspectorProvider(context, {
      onAsk: async (prompt) => {
        await openSheikhaChatView();
        await new Promise((resolve) => setTimeout(resolve, 150));
        chatProvider.prefill(prompt, true);
      }
    });

    registerWebviewProviderSafe(
      context,
      'sheikha.inspectorView',
      inspectorProvider,
      { webviewOptions: { retainContextWhenHidden: true } }
    );

    registerWebviewProviderSafe(
      context,
      'sheikha.chatView',
      chatProvider,
      { webviewOptions: { retainContextWhenHidden: true } }
    );
  } catch (error) {
    console.error('[Sheikha] Chat/Inspector provider activation failed:', error);
    vscode.window.showErrorMessage(`Sheikha chat failed to activate: ${error.message}`);
  }

  console.log('Sheikha extension activated');

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

module.exports = { activate, deactivate };
