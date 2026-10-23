'use strict';
const vscode = require('vscode');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

exports.run = async function () {
  const root = vscode.workspace.workspaceFolders?.find(f => f.name === 'SHEIKHA')?.uri.fsPath;
  assert.ok(root, 'SHEIKHA_WORKSPACE_REQUIRED');
  const directory = path.join(root, 'reports/private/sheikha-workspace-activation-20261017');
  assert.equal(fs.lstatSync(directory).isSymbolicLink(), false);
  const report = { checkedAt: new Date().toISOString(), vscodeVersion: vscode.version,
    actualExtensionHost: true, trustBypassed: false, passed: false };
  try {
    assert.equal(vscode.workspace.isTrusted, true, 'WORKSPACE_TRUST_REQUIRED');
    const extension = vscode.extensions.getExtension('sheikha.sheikha');
    assert.ok(extension, 'SHEIKHA_EXTENSION_REQUIRED');
    const api = await extension.activate();
    report.extensionVersion = extension.packageJSON.version;
    assert.equal(report.extensionVersion, '1.0.143');
    report.activation = await api.workspaceCenter.activateLocal();
    report.snapshot = api.workspaceCenter.inspect();
    report.centerCommandRegistered = (await vscode.commands.getCommands(true)).includes('sheikha.awareness.scan');
    assert.equal(report.centerCommandRegistered, true);
    assert.equal(report.activation.status, 'COMPLETED');
    assert.equal(report.activation.results.length, 5);
    report.passed = true;
  } finally {
    fs.writeFileSync(path.join(directory, 'extension-host.json'), JSON.stringify(report, null, 2), { mode: 0o600, flag: 'wx' });
  }
};
