'use strict';

const vscode = require('vscode');
const { SheikhaChatProvider } = require('./src/chat/sheikhaChatProvider');

function activate(context) {
  const chatProvider = new SheikhaChatProvider(context);

  const registerView = (id) => {
    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(id, chatProvider, {
        webviewOptions: { retainContextWhenHidden: true }
      })
    );
  };

  // الواجهة الجديدة
  registerView('sheikha.advancedChatView');

  // الواجهة القديمة الموجودة في package.json
  registerView('sheikha.chatView');

  context.subscriptions.push(
    vscode.commands.registerCommand('sheikha.openChat', async () => {
      await vscode.commands.executeCommand('workbench.view.extension.sheikha');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('sheikha.ask', async () => {
      await vscode.commands.executeCommand('workbench.view.extension.sheikha-ai');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('sheikha.agent.run', async () => {
      await vscode.commands.executeCommand('workbench.view.extension.sheikha-ai');
    })
  );

  console.log('Sheikha Extension activated: legacy + advanced chat');
}

function deactivate() {}

module.exports = { activate, deactivate };
