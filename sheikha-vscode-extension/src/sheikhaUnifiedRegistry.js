'use strict';

const vscode = require('vscode');

async function collectUnifiedRegistry() {
  const extensions = vscode.extensions.all.map(e => ({
    id: e.id,
    active: e.isActive,
    version: e.packageJSON?.version,
    publisher: e.packageJSON?.publisher,
    displayName: e.packageJSON?.displayName
  }));

  const workspaceFolders = vscode.workspace.workspaceFolders?.map(f => ({
    name: f.name,
    path: f.uri.fsPath
  })) || [];

  const tasks = await vscode.tasks.fetchTasks();

  return {
    type: 'SHEIKHA_UNIFIED_REGISTRY',
    generatedAt: new Date().toISOString(),
    vscode: {
      extensionsCount: extensions.length,
      extensions,
      workspaceFolders,
      tasks: tasks.map(t => ({
        name: t.name,
        source: t.source,
        type: t.definition?.type
      })),
      debug: {
        breakpoints: vscode.debug.breakpoints.length,
        activeSession: vscode.debug.activeDebugSession ? {
          name: vscode.debug.activeDebugSession.name,
          type: vscode.debug.activeDebugSession.type
        } : null
      },
      openEditors: vscode.window.visibleTextEditors.map(e => ({
        file: e.document.uri.fsPath,
        language: e.document.languageId,
        dirty: e.document.isDirty
      }))
    }
  };
}

module.exports = { collectUnifiedRegistry };
