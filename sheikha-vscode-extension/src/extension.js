'use strict';

const vscode = require('vscode');
const { askSheikha } = require('./sheikhaApiClient');

function activate(context) {
  const disposable = vscode.commands.registerCommand('sheikha.ask', async () => {
    const prompt = await vscode.window.showInputBox({
      prompt: 'اسأل شيخة',
      placeHolder: 'اكتب طلبك هنا...'
    });

    if (!prompt) return;

    const editor = vscode.window.activeTextEditor;
    const selectedText = editor ? editor.document.getText(editor.selection) : '';

    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: 'Sheikha is working...',
      cancellable: false
    }, async () => {
      const result = await askSheikha(prompt, {
        fileName: editor?.document?.fileName || null,
        selectedText
      });

      const text = typeof result === 'string'
        ? result
        : JSON.stringify(result, null, 2);

      const doc = await vscode.workspace.openTextDocument({
        content: text,
        language: 'markdown'
      });

      await vscode.window.showTextDocument(doc);
    });
  });

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = { activate, deactivate };
