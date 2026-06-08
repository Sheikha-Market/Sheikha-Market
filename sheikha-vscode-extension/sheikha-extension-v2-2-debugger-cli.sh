#!/usr/bin/env bash
set -euo pipefail

echo "==> تفعيل Sheikha CLI و Sheikha Debugger"

cat > extension.js <<'EOF'
'use strict';

const vscode = require('vscode');
const cp = require('child_process');
const { SheikhaChatProvider } = require('./src/chat/sheikhaChatProvider');

function runTerminalCommand(name, command) {
  const terminal = vscode.window.createTerminal(name);
  terminal.show(true);
  terminal.sendText(command, true);
}

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
    vscode.commands.registerCommand('sheikha.cli.status', () => {
      runTerminalCommand('Sheikha CLI', `
cd ~/Projects/sheikha/sheikha-main-portal
echo "=== Sheikha CLI Status ==="
git status --short
pm2 status
curl -s http://127.0.0.1:8080/api/sheikha/protocol/status; echo
`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('sheikha.cli.health', () => {
      runTerminalCommand('Sheikha Health', `
cd ~/Projects/sheikha/sheikha-main-portal
echo "=== Runtime Health ==="
curl -s http://127.0.0.1:8080/api/health; echo
curl -s http://127.0.0.1:8080/api/sheikha/protocol/status; echo
curl -s http://127.0.0.1:11434/api/tags; echo
`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('sheikha.debugger.run', () => {
      runTerminalCommand('Sheikha Debugger', `
cd ~/Projects/sheikha/sheikha-main-portal
echo "=== Sheikha Debugger ==="
npm test -- --runInBand || true
npm run lint || true
node tools/drift/sheikha-runtime-drift-detector.js || true
git status --short
`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('sheikha.debugger.logs', () => {
      runTerminalCommand('Sheikha Logs', `
pm2 logs sheikha-main-portal --lines 120
`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('sheikha.runtime.restart', () => {
      runTerminalCommand('Sheikha Runtime Restart', `
cd ~/Projects/sheikha/sheikha-main-portal
pm2 restart sheikha-main-portal --update-env
sleep 2
pm2 status
curl -s http://127.0.0.1:8080/api/sheikha/protocol/status; echo
`);
    })
  );

  console.log('Sheikha Extension activated: chat + cli + debugger');
}

function deactivate() {}

module.exports = { activate, deactivate };
EOF

node - <<'NODE'
const fs = require('fs');
const p = 'package.json';
const pkg = JSON.parse(fs.readFileSync(p, 'utf8'));

pkg.version = '1.0.13';
pkg.main = './extension.js';

pkg.activationEvents = Array.from(new Set([
  ...(pkg.activationEvents || []),
  'onStartupFinished',
  'onCommand:sheikha.openChat',
  'onCommand:sheikha.cli.status',
  'onCommand:sheikha.cli.health',
  'onCommand:sheikha.debugger.run',
  'onCommand:sheikha.debugger.logs',
  'onCommand:sheikha.runtime.restart',
  'onView:sheikha.chatView',
  'onView:sheikha.advancedChatView'
]));

pkg.contributes = pkg.contributes || {};
pkg.contributes.commands = pkg.contributes.commands || [];

const cmds = [
  ['sheikha.openChat', 'Sheikha: افتح المحادثة الذكية'],
  ['sheikha.cli.status', 'Sheikha CLI: الحالة العامة'],
  ['sheikha.cli.health', 'Sheikha CLI: فحص الصحة'],
  ['sheikha.debugger.run', 'Sheikha Debugger: تشغيل الفحص الكامل'],
  ['sheikha.debugger.logs', 'Sheikha Debugger: عرض السجلات'],
  ['sheikha.runtime.restart', 'Sheikha Runtime: إعادة التشغيل']
];

for (const [command, title] of cmds) {
  if (!pkg.contributes.commands.some(c => c.command === command)) {
    pkg.contributes.commands.push({ command, title });
  }
}

fs.writeFileSync(p, JSON.stringify(pkg, null, 2));
NODE

npm run compile || true
rm -f *.vsix
npx vsce package --no-dependencies
code --install-extension sheikha-1.0.13.vsix --force

echo "✅ تم تفعيل Sheikha CLI + Sheikha Debugger"
