'use strict';

const vscode = require('vscode');

async function collectRegistryBroker() {
  const commands = await vscode.commands.getCommands(true);
  const tasks = await vscode.tasks.fetchTasks();

  const extensions = vscode.extensions.all.map(e => ({
    id: e.id,
    active: e.isActive,
    extensionPath: e.extensionPath,
    version: e.packageJSON?.version,
    publisher: e.packageJSON?.publisher,
    displayName: e.packageJSON?.displayName,
    contributes: {
      commands: e.packageJSON?.contributes?.commands || [],
      configuration: e.packageJSON?.contributes?.configuration || null,
      languages: e.packageJSON?.contributes?.languages || [],
      grammars: e.packageJSON?.contributes?.grammars || [],
      snippets: e.packageJSON?.contributes?.snippets || [],
      views: e.packageJSON?.contributes?.views || {},
      menus: e.packageJSON?.contributes?.menus || {},
      chatParticipants: e.packageJSON?.contributes?.chatParticipants || []
    }
  }));

  return {
    type: 'SHEIKHA_REGISTRY_BROKER_V1',
    generatedAt: new Date().toISOString(),
    workspace: vscode.workspace.workspaceFolders?.map(f => ({
      name: f.name,
      path: f.uri.fsPath
    })) || [],
    activeEditor: vscode.window.activeTextEditor ? {
      file: vscode.window.activeTextEditor.document.uri.fsPath,
      language: vscode.window.activeTextEditor.document.languageId
    } : null,
    visibleEditors: vscode.window.visibleTextEditors.map(e => ({
      file: e.document.uri.fsPath,
      language: e.document.languageId,
      dirty: e.document.isDirty
    })),
    debug: {
      breakpoints: vscode.debug.breakpoints.length,
      activeSession: vscode.debug.activeDebugSession ? {
        name: vscode.debug.activeDebugSession.name,
        type: vscode.debug.activeDebugSession.type
      } : null
    },
    tasks: tasks.map(t => ({
      name: t.name,
      source: t.source,
      type: t.definition?.type
    })),
    commands: {
      count: commands.length,
      sheikha: commands.filter(c => c.toLowerCase().includes('sheikha')),
      blackbox: commands.filter(c => c.toLowerCase().includes('blackbox')),
      continue: commands.filter(c => c.toLowerCase().includes('continue')),
      copilot: commands.filter(c => c.toLowerCase().includes('copilot')),
      claude: commands.filter(c => c.toLowerCase().includes('claude')),
      coder: commands.filter(c => c.toLowerCase().includes('coder')),
      all: commands
    },
    extensions: {
      count: extensions.length,
      ai: extensions.filter(e =>
        /copilot|continue|blackbox|claude|openai|chatgpt|ollama|sixth|ai|coder/i.test(e.id + ' ' + e.displayName)
      ),
      all: extensions
    }
  };
}

module.exports = { collectRegistryBroker };
