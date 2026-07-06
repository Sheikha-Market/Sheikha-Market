'use strict';

const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

function run(cmd, args = []) {
  try { return execFileSync(cmd, args, {encoding:'utf8', timeout:15000}).trim(); }
  catch (e) { return `ERROR: ${e.message}`; }
}

const root = path.resolve(__dirname, '..');

const report = {
  generatedAt: new Date().toISOString(),
  localMachine: {
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus().length,
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    home: os.homedir()
  },
  vscode: {
    version: run('code', ['--version']),
    extensions: run('code', ['--list-extensions', '--show-versions']).split('\n').filter(Boolean)
  },
  workspace: {
    root,
    packageJson: fs.existsSync(path.join(root, 'package.json')),
    extensionClient: path.join(root, 'src/sheikhaApiClient.js'),
    chatProvider: path.join(root, 'src/chat/sheikhaChatProvider.js')
  },
  runtimes: {
    node: run('node', ['-v']),
    npm: run('npm', ['-v']),
    python: run('python3', ['--version']),
    git: run('git', ['--version']),
    ollamaModels: run('bash', ['-lc', "curl -s http://127.0.0.1:11434/api/tags | jq -r '.models[]?.name' 2>/dev/null || true"])
  },
  git: {
    branch: run('git', ['branch', '--show-current']),
    status: run('git', ['status', '--short'])
  },
  capabilities: {
    workspaceFolders: true,
    openFiles: 'requires VS Code API bridge',
    activeEditor: 'requires VS Code API bridge',
    installedExtensions: true,
    gitBranch: true,
    terminalState: 'limited-safe-mode',
    debugSessions: 'requires VS Code debug API bridge',
    tasks: 'requires VS Code tasks API bridge',
    problemsPanel: 'requires VS Code diagnostics API bridge'
  }
};

fs.mkdirSync(path.join(root, 'reports'), {recursive:true});
fs.writeFileSync(path.join(root, 'reports/vscode-awareness-report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
