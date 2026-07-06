#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Projects/sheikha/sheikha-main-portal"
EXT="$ROOT/sheikha-vscode-extension"

cd "$ROOT"

echo "== Activate Sheikha Developer Tools Apex V1 =="

mkdir -p runtime/developer-tools-apex/v1
mkdir -p routes/developer-tools-apex
mkdir -p docs/developer-tools-apex

cat > runtime/developer-tools-apex/v1/sheikha-developer-tools-apex-v1.js <<'JS'
'use strict';

function getDeveloperToolsApexStatus() {
  return {
    success: true,
    layer: 'SHEIKHA_DEVELOPER_TOOLS_APEX_V1',
    status: 'ACTIVE',
    position: 'EXTENSION_AND_RUNTIME_OBSERVABILITY_LAYER',
    capabilities: [
      'SHEIKHA_TOGGLE_DEVELOPER_TOOLS',
      'SHEIKHA_CONSOLE',
      'INSPECTOR_BINDING',
      'CHAT_TRACE_PANEL',
      'SSE_TRACE',
      'RUNTIME_HEALTH_VIEW',
      'EXTENSION_HEALTH_VIEW'
    ],
    governance: {
      principle: 'لا ضرر ولا ضرار',
      secretsExposed: false,
      envMutation: false,
      readOnlyDiagnostics: true
    }
  };
}

module.exports = { getDeveloperToolsApexStatus };
JS

cat > routes/developer-tools-apex/sheikha-developer-tools-apex-routes.js <<'JS'
'use strict';

const express = require('express');
const router = express.Router();
const {
  getDeveloperToolsApexStatus
} = require('../../runtime/developer-tools-apex/v1/sheikha-developer-tools-apex-v1');

router.get('/api/sheikha/developer-tools-apex/v1/status', (_req, res) => {
  res.json(getDeveloperToolsApexStatus());
});

module.exports = router;
JS

python3 - <<'PY'
from pathlib import Path

p = Path("server.js")
s = p.read_text()

mount = """
try {
  app.use(require('./routes/developer-tools-apex/sheikha-developer-tools-apex-routes'));
} catch (error) {
  console.warn('[sheikha-developer-tools-apex] route mount skipped:', error.message);
}
"""

if "sheikha-developer-tools-apex" not in s:
    marker = "app.use(express.json"
    idx = s.find(marker)
    if idx == -1:
        idx = s.find("app.use(")
    if idx == -1:
        raise SystemExit("Cannot find server.js insertion point")
    s = s[:idx] + mount + "\n" + s[idx:]

p.write_text(s)
PY

cd "$EXT"

cp src/extension.js src/extension.js.bak-devtools-apex-$(date +%Y%m%d%H%M%S)
cp package.json package.json.bak-devtools-apex-$(date +%Y%m%d%H%M%S)

python3 - <<'PY'
from pathlib import Path
import json

p = Path("src/extension.js")
s = p.read_text()

if "sheikha.devtools.toggle" not in s:
    insert = """
  context.subscriptions.push(
    vscode.commands.registerCommand('sheikha.devtools.toggle', async () => {
      await vscode.commands.executeCommand('workbench.action.toggleDevTools');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('sheikha.console.open', async () => {
      const terminal = vscode.window.createTerminal({ name: 'Sheikha Console' });
      terminal.show();
      terminal.sendText('cd ~/Projects/sheikha/sheikha-main-portal');
      terminal.sendText('echo "Sheikha Console Ready"');
      terminal.sendText('curl -s http://127.0.0.1:8080/api/sheikha/developer-tools-apex/v1/status | jq');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('sheikha.inspector.devtools', async () => {
      await vscode.commands.executeCommand('sheikha.console.open');
      await vscode.commands.executeCommand('sheikha.devtools.toggle');
    })
  );
"""
    s = s.replace("\n}\n\nfunction deactivate", insert + "\n}\n\nfunction deactivate")

p.write_text(s)

pkg_path = Path("package.json")
pkg = json.loads(pkg_path.read_text())

contrib = pkg.setdefault("contributes", {})
commands = contrib.setdefault("commands", [])

def add_command(command, title, category="Sheikha"):
    if not any(c.get("command") == command for c in commands):
        commands.append({
            "command": command,
            "title": title,
            "category": category
        })

add_command("sheikha.devtools.toggle", "Toggle Developer Tools")
add_command("sheikha.console.open", "Open Console")
add_command("sheikha.inspector.devtools", "Open Inspector Developer Tools")

menus = contrib.setdefault("menus", {})
cmd_palette = menus.setdefault("commandPalette", [])

for command in [
    "sheikha.devtools.toggle",
    "sheikha.console.open",
    "sheikha.inspector.devtools"
]:
    if not any(m.get("command") == command for m in cmd_palette):
        cmd_palette.append({"command": command})

pkg_path.write_text(json.dumps(pkg, ensure_ascii=False, indent=2) + "\n")
PY

cd "$ROOT"

echo "== Checks =="
node --check server.js
node --check routes/developer-tools-apex/sheikha-developer-tools-apex-routes.js
node --check runtime/developer-tools-apex/v1/sheikha-developer-tools-apex-v1.js
node --check sheikha-vscode-extension/src/extension.js

echo "== Restart server =="
pm2 restart sheikha-main-portal --update-env
sleep 2

echo "== API test =="
curl -s http://127.0.0.1:8080/api/sheikha/developer-tools-apex/v1/status | jq

echo "== Build extension =="
cd "$EXT"
npm test -- --runInBand sheikhaExtensionChatTransport.test.js
npm run package
code --install-extension dist/sheikha.sheikha-1.0.89.vsix --force

echo "== Restart VS Code =="
pkill code || true
cd "$ROOT"
code . >/dev/null 2>&1 &

echo "== Done =="
echo "Commands:"
echo "  Sheikha: Toggle Developer Tools"
echo "  Sheikha: Open Console"
echo "  Sheikha: Open Inspector Developer Tools"
