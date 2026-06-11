'use strict';

const cp = require('child_process');
const fs = require('fs');
const path = require('path');

let vscode = null;
try { vscode = require('vscode'); } catch { vscode = null; }

function sh(cmd, cwd) {
  try {
    return cp.execSync(cmd, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 5000
    }).trim();
  } catch {
    return '';
  }
}

function readJsonSafe(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return null; }
}

function collectWorkspaceContext() {
  const folder =
    vscode?.workspace?.workspaceFolders?.[0]?.uri?.fsPath ||
    process.env.SHEIKHA_WORKSPACE_ROOT ||
    process.cwd();

  const gitStatus = sh('git status --short', folder);
  const gitBranch = sh('git branch --show-current', folder);
  const packageJson = readJsonSafe(path.join(folder, 'package.json'));

  return {
    workspaceDetected: Boolean(folder),
    workspaceRoot: folder,
    gitBranch,
    gitStatus,
    changedFiles: gitStatus.split('\n').map(x => x.trim()).filter(Boolean).slice(0, 80),
    packageJson: packageJson ? {
      name: packageJson.name,
      version: packageJson.version,
      scripts: packageJson.scripts || {}
    } : null,
    activeFile: vscode?.window?.activeTextEditor?.document?.fileName || '',
    languageId: vscode?.window?.activeTextEditor?.document?.languageId || ''
  };
}

module.exports = { collectWorkspaceContext };
