'use strict';

const vscode = require('vscode');
const { sendInspectorHeartbeat } = require('./sheikhaEnterpriseInspectorBridge');
const { SheikhaInspectorProvider } = require('./sheikhaInspectorProvider');
const { collectVsCodeAwareness } = require('./vscodeAwareness');
const { collectUnifiedRegistry } = require('./sheikhaUnifiedRegistry');
const { collectRegistryBroker } = require('./sheikhaRegistryBroker');
const { collectGlobalRegistryFabric } = require('./sheikhaGlobalRegistryFabric');
const { SheikhaChatProvider } = require('./chat/sheikhaChatProvider');

function activate(context) {
  const sheikhaInspectorHeartbeat = setInterval(() => {
    sendInspectorHeartbeat().catch(() => {});
  }, 15000);
  context.subscriptions.push({ dispose: () => clearInterval(sheikhaInspectorHeartbeat) });
  sendInspectorHeartbeat().catch(() => {});

  const chatProvider = new SheikhaChatProvider(context);
  const inspectorProvider = new SheikhaInspectorProvider(context, {
    onAsk: async (prompt) => {
      await vscode.commands.executeCommand('workbench.view.extension.sheikha');
      await new Promise((resolve) => setTimeout(resolve, 150));
      chatProvider.prefill(prompt, true);
    }
  });

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'sheikha.inspectorView',
      inspectorProvider,
      { webviewOptions: { retainContextWhenHidden: true } }
    )
  );

  console.log('Sheikha extension activated');

  const chatViewIds = [
    'sheikha.chatView',
    'sheikha.advancedChatView',
    'sheikha.ai.advancedChat'
  ];

  for (const viewId of chatViewIds) {
    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(viewId, chatProvider)
    );
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
    vscode.commands.registerCommand('sheikha.chat.open', async () => {
      await vscode.commands.executeCommand('workbench.view.extension.sheikha');
    })
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
