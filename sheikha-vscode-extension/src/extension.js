'use strict';

const vscode = require('vscode');
const { askSheikha } = require('./sheikhaApiClient');
const { SheikhaChatProvider } = require('./chat/sheikhaChatProvider');

function activate(context) {
  const chatProvider = new SheikhaChatProvider(context);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('sheikha.advancedChatView', chatProvider)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('sheikha.ask', async () => {
      await vscode.commands.executeCommand('workbench.view.extension.sheikha-ai');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('sheikha.agent.run', async () => {
      const prompt = await vscode.window.showInputBox({ prompt: 'أمر Agentic لشيخة' });
      if (!prompt) return;
      const result = await askSheikha(prompt, { mode: 'agentic-full' });
      const doc = await vscode.workspace.openTextDocument({
        content: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
        language: 'markdown'
      });
      vscode.window.showTextDocument(doc);
    })
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
