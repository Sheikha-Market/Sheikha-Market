'use strict';

const cp = require('child_process');
let vscode = null;
try { vscode = require('vscode'); } catch { vscode = null; }

function sh(cmd, cwd) {
  try {
    return cp.execSync(cmd, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 8000
    }).trim();
  } catch {
    return '';
  }
}

function collectVSCodeToolContext() {
  const root = vscode?.workspace?.workspaceFolders?.[0]?.uri?.fsPath || process.env.SHEIKHA_WORKSPACE_ROOT || process.cwd();
  const editor = vscode?.window?.activeTextEditor;
  const doc = editor?.document;

  const diagnostics = vscode
    ? vscode.languages.getDiagnostics()
        .slice(0, 30)
        .map(([uri, items]) => ({
          file: uri.fsPath,
          diagnostics: items.slice(0, 20).map(d => ({
            message: d.message,
            severity: d.severity,
            line: d.range.start.line + 1,
            character: d.range.start.character + 1
          }))
        }))
    : [];

  return {
    registry: 'SHEIKHA_VSCODE_TOOL_REGISTRY_V1',
    status: 'ACTIVE',
    workspaceRoot: root,
    gitBranch: sh('git branch --show-current', root),
    gitStatus: sh('git status --short', root),
    activeFile: doc?.fileName || '',
    languageId: doc?.languageId || '',
    selectedText: editor && !editor.selection.isEmpty ? doc.getText(editor.selection).slice(0, 8000) : '',
    openEditors: vscode?.workspace?.textDocuments?.map(d => ({
      file: d.fileName,
      languageId: d.languageId,
      isDirty: d.isDirty
    })).slice(0, 50) || [],
    diagnostics,
    safeCommands: [
      'git status --short',
      'git branch --show-current',
      'npm test',
      'npm run lint',
      'node --check server.js'
    ]
  };
}

module.exports = { collectVSCodeToolContext };
