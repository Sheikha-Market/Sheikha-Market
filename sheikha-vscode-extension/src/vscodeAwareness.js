'use strict';

const vscode = require('vscode');

async function collectVsCodeAwareness() {
  const workspaceFolders = vscode.workspace.workspaceFolders?.map(f => ({
    name: f.name,
    uri: f.uri.fsPath
  })) || [];

  const active = vscode.window.activeTextEditor;
  const visible = vscode.window.visibleTextEditors.map(e => ({
    file: e.document.uri.fsPath,
    language: e.document.languageId,
    lineCount: e.document.lineCount,
    isDirty: e.document.isDirty
  }));

  const extensions = vscode.extensions.all.map(e => ({
    id: e.id,
    active: e.isActive,
    version: e.packageJSON?.version
  }));

  const tasks = await vscode.tasks.fetchTasks();

  const diagnostics = vscode.languages.getDiagnostics().slice(0, 50).map(([uri, ds]) => ({
    file: uri.fsPath,
    count: ds.length,
    diagnostics: ds.slice(0, 5).map(d => ({
      message: d.message,
      severity: d.severity,
      line: d.range.start.line + 1
    }))
  }));

  return {
    generatedAt: new Date().toISOString(),
    workspaceFolders,
    activeEditor: active ? {
      file: active.document.uri.fsPath,
      language: active.document.languageId,
      lineCount: active.document.lineCount,
      isDirty: active.document.isDirty,
      selection: {
        startLine: active.selection.start.line + 1,
        endLine: active.selection.end.line + 1
      }
    } : null,
    visibleEditors: visible,
    extensionsCount: extensions.length,
    extensions,
    tasks: tasks.map(t => ({
      name: t.name,
      source: t.source,
      type: t.definition?.type
    })),
    debug: {
      activeDebugSession: vscode.debug.activeDebugSession ? {
        name: vscode.debug.activeDebugSession.name,
        type: vscode.debug.activeDebugSession.type
      } : null,
      breakpoints: vscode.debug.breakpoints.length
    },
    problems: diagnostics
  };
}

module.exports = { collectVsCodeAwareness };
