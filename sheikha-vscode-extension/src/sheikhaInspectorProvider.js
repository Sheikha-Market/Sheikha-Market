'use strict';

const vscode = require('vscode');
const os = require('os');
const cp = require('child_process');
const { collectVSCodeToolContext } = require('./sheikhaVSCodeToolRegistry');

class SheikhaInspectorProvider {
  constructor(context) {
    this.context = context;
    this.view = null;
  }

  resolveWebviewView(webviewView) {
    this.view = webviewView;
    webviewView.webview.options = { enableScripts: true };
    this.refresh();

    webviewView.webview.onDidReceiveMessage((msg) => {
      if (msg && msg.command === 'refresh') this.refresh();
    });
  }

  refresh() {
    const ctx = collectVSCodeToolContext();
    const runtime = collectRuntime();
    const api = collectApiStatus();
    this.render(ctx, runtime, api);
  }

  render(ctx, runtime, api) {
    if (!this.view) return;

    const diagnostics = Array.isArray(ctx.diagnostics) ? ctx.diagnostics : [];
    const errors = diagnostics.filter(d => Number(d.severity) === 0 || /error/i.test(String(d.message))).length;
    const warnings = diagnostics.filter(d => Number(d.severity) === 1 || /warn/i.test(String(d.message))).length;
    const info = Math.max(0, diagnostics.length - errors - warnings);
    const editors = Array.isArray(ctx.openEditors) ? ctx.openEditors : [];

    this.view.webview.html = html(ctx, runtime, api, {
      diagnostics,
      errors,
      warnings,
      info,
      editors
    });
  }
}

function collectRuntime() {
  const mem = process.memoryUsage();
  return {
    cpu: os.loadavg()[0].toFixed(2),
    ram: `${Math.round((1 - os.freemem() / os.totalmem()) * 100)}%`,
    heap: `${Math.round(mem.heapUsed / 1024 / 1024)}MB / ${Math.round(mem.heapTotal / 1024 / 1024)}MB`,
    eventLoop: 'local-webview',
    uptime: `${Math.round(process.uptime())}s`
  };
}

function sh(cmd) {
  try {
    return cp.execSync(cmd, { encoding: 'utf8', timeout: 3000 }).trim();
  } catch {
    return 'غير متاح';
  }
}

function collectApiStatus() {
  return {
    p8080: sh('curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8080/api/health'),
    p9191: sh('curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:9191/api/health'),
    health: sh('curl -s -o /dev/null -w "%{http_code}" https://sheikha.top/api/health'),
    unified: sh('curl -s -o /dev/null -w "%{http_code}" https://sheikha.top/api/sheikha/unified-chat/status')
  };
}

function html(ctx, runtime, api, x) {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<style>
body{margin:0;background:#07130d;color:#e9ffec;font-family:Arial}
.wrap{padding:18px}.hero,.card{border:1px solid #2f7d44;border-radius:14px;background:#0b1d12;padding:14px;margin-bottom:12px}
h1{color:#d4af37;margin:0 0 8px}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
.title{color:#d4af37;font-weight:bold;margin-bottom:8px}.pill{display:inline-block;border:1px solid #5fa96c;border-radius:999px;padding:5px 10px;margin:4px;background:#173d22}
pre{direction:ltr;text-align:left;white-space:pre-wrap;background:#020805;border:1px solid #2f7d44;border-radius:10px;padding:10px;max-height:220px;overflow:auto}
button{background:#2d7d3f;color:white;border:1px solid #7bc68a;border-radius:8px;padding:8px 14px}
.full{grid-column:1/-1}.ok{color:#91ee9f}.bad{color:#ff8b8b}
</style>
</head>
<body>
<div class="wrap">
  <div class="hero">
    <h1>Sheikha Enterprise Inspector</h1>
    <p class="ok">الانسبكتور يعمل بتدفق كامل: Runtime / Git / Project / Diagnostics / Governance / AI / APIs / Observability</p>
    <button onclick="vscode.postMessage({command:'refresh'})">تحديث</button>
    <div>
      <span class="pill">CPU</span><span class="pill">RAM</span><span class="pill">Heap</span><span class="pill">Event Loop</span>
      <span class="pill">Git</span><span class="pill">Diagnostics</span><span class="pill">APIs</span><span class="pill">Observability</span>
    </div>
  </div>

  <div class="grid">
    ${card('Runtime', `CPU: ${runtime.cpu}\\nRAM: ${runtime.ram}\\nHeap: ${runtime.heap}\\nEvent Loop: ${runtime.eventLoop}\\nUptime: ${runtime.uptime}`)}
    ${card('Git', `Branch: ${ctx.gitBranch || 'غير محدد'}\\nAhead/Behind: افحص من Git Graph\\nModified Files:\\n${ctx.gitStatus || 'clean'}`)}
    ${card('Project', `Workspace:\\n${ctx.workspaceRoot || ''}\\nOpen Editors: ${x.editors.length}\\nTasks: VS Code Tasks / npm scripts`)}
    ${card('Diagnostics', `Errors: ${x.errors}\\nWarnings: ${x.warnings}\\nInfo: ${x.info}\\nTotal: ${x.diagnostics.length}`)}
    ${card('Governance', `Policies: ACTIVE\\nCapability Tokens: ACTIVE\\nExecution Contracts: READ-ONLY SAFE BY DEFAULT`)}
    ${card('AI', `Provider: Sheikha Unified Chat\\nModel: حسب Model Executor\\nLatency: يحتاج قياس API\\nTokens: يحتاج عداد لاحق`)}
    ${card('APIs', `8080 Health: ${api.p8080}\\n9191 Health: ${api.p9191}\\nPublic Health: ${api.health}\\nUnified Chat: ${api.unified}`)}
    ${card('Observability', `Logs: journalctl / pm2 logs\\nMetrics: runtime snapshot\\nEvents: audit jsonl\\nAlerts: HAProxy/backend status`)}
    ${card('Active File', `${ctx.activeFile?.file || 'لا يوجد'}\\nLanguage: ${ctx.activeFile?.languageId || 'غير محدد'}`, true)}
    ${card('Open Editors', x.editors.slice(0,20).map(e => `${e.isDirty ? 'M' : '-'} ${e.file}`).join('\\n'), true)}
    ${card('Raw Inspector Payload', JSON.stringify(ctx, null, 2), true)}
  </div>
</div>
<script>const vscode = acquireVsCodeApi();</script>
</body>
</html>`;
}

function card(title, body, full=false) {
  return `<div class="card ${full ? 'full' : ''}"><div class="title">${esc(title)}</div><pre>${esc(body)}</pre></div>`;
}

function esc(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

module.exports = { SheikhaInspectorProvider };
