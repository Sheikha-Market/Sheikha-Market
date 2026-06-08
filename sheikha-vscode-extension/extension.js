'use strict';

const vscode = require('vscode');
const { SheikhaChatProvider } = require('./src/chat/sheikhaChatProvider');

function activate(context) {
  const chatProvider = new SheikhaChatProvider(context);

  for (const id of ['sheikha.chatView', 'sheikha.advancedChatView']) {
    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(id, chatProvider, {
        webviewOptions: { retainContextWhenHidden: true }
      })
    );
  }

  context.subscriptions.push(
    vscode.commands.registerCommand('sheikha.openChat', async () => {
      await vscode.commands.executeCommand('workbench.view.extension.sheikha');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('sheikha.ask', async () => {
      await vscode.commands.executeCommand('workbench.view.extension.sheikha');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('sheikha.agent.run', async () => {
      await vscode.commands.executeCommand('workbench.view.extension.sheikha');
    })
  );

  console.log('Sheikha Extension activated: v2 advanced chat');
}

function deactivate() {}

module.exports = { activate, deactivate };
