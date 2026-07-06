'use strict';

const vscode = require('vscode');
const os = require('os');
const { collectVSCodeToolContext } = require('./sheikhaVSCodeToolRegistry');
const {
  DEFAULT_BASE_URL,
  getEnterpriseInspectorStatus
} = require('./sheikhaExtensionChatClient');

class SheikhaInspectorProvider {
  constructor(context, options = {}) {
    this.context = context;
    this.onAsk = options.onAsk;
    this.view = null;
    this.refreshTimer = null;
    this.refreshSequence = 0;
  }

  resolveWebviewView(webviewView) {
    this.view = webviewView;
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = loadingHtml();

    webviewView.webview.onDidReceiveMessage(async (message) => {
      if (!message) return;
      if (message.command === 'refresh') await this.refresh();
      if (message.command === 'ask' && typeof this.onAsk === 'function') {
        await this.onAsk(String(message.prompt || defaultInspectorPrompt()));
      }
    });

    webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible) this.refresh();
    });

    webviewView.onDidDispose(() => this.disposeTimer());
    this.refresh();
    this.refreshTimer = setInterval(() => {
      if (this.view?.visible) this.refresh();
    }, 15000);
  }

  disposeTimer() {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
    this.refreshTimer = null;
  }

  async refresh() {
    const sequence = ++this.refreshSequence;
    const local = collectVSCodeToolContext();
    const runtime = collectLocalRuntime();
    const remote = await getEnterpriseInspectorStatus({
      baseUrl: DEFAULT_BASE_URL
    });

    if (!this.view || sequence !== this.refreshSequence) return;
    this.view.webview.html = inspectorHtml(local, runtime, remote);
  }
}

function collectLocalRuntime() {
  const memory = process.memoryUsage();
  return {
    cpuLoad1m: Number(os.loadavg()[0].toFixed(2)),
    ramUsedPercent: Math.round((1 - os.freemem() / os.totalmem()) * 100),
    heapUsedMb: Math.round(memory.heapUsed / 1024 / 1024),
    heapTotalMb: Math.round(memory.heapTotal / 1024 / 1024),
    uptimeSeconds: Math.round(process.uptime())
  };
}

function summarizeLocalDiagnostics(groups = []) {
  const result = { errors: 0, warnings: 0, information: 0, total: 0 };
  groups.forEach((group) => {
    (group.diagnostics || []).forEach((diagnostic) => {
      result.total += 1;
      if (Number(diagnostic.severity) === 0) result.errors += 1;
      else if (Number(diagnostic.severity) === 1) result.warnings += 1;
      else result.information += 1;
    });
  });
  return result;
}

function defaultInspectorPrompt() {
  return 'حلل حالة منظومة شيخة الحالية من Enterprise Inspector، وحدد الأخطاء والمخاطر وأفضل إجراء تالٍ دون تنفيذ أي إجراء عالي الأثر.';
}

function loadingHtml() {
  return `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><style>
  body{margin:0;padding:18px;background:#0b0f14;color:#e8edf3;font:13px system-ui,sans-serif}
  .loading{border-inline-start:3px solid #c9a227;padding:12px 14px;background:#111821}
  </style></head><body><div class="loading">جارٍ مزامنة Sheikha Enterprise Inspector...</div></body></html>`;
}

function inspectorHtml(local, localRuntime, remote) {
  const localDiagnostics = summarizeLocalDiagnostics(local.diagnostics);
  const remoteHealth = remote.health || {};
  const remoteRuntime = remote.runtime || {};
  const remoteGit = remote.git || {};
  const architecture = remote.architecture || {};
  const surfaces = remote.surfaces || {};
  const remoteOnline = remote.success === true;
  const overall = remoteOnline ? remoteHealth.overall || remote.status : remote.status || 'OFFLINE';
  const updatedAt = remote.generatedAt ? new Date(remote.generatedAt).toLocaleString('ar-SA') : 'غير متاح';
  const editors = Array.isArray(local.openEditors) ? local.openEditors : [];
  const changedFiles = String(local.gitStatus || '').split('\n').filter(Boolean);

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
:root{color-scheme:dark;--bg:#0b0f14;--surface:#111821;--surface2:#161f2a;--line:#2d3947;--text:#edf2f7;--muted:#9eabb9;--green:#50b878;--gold:#d0aa35;--blue:#62a6df;--red:#e16e72}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:13px/1.55 system-ui,sans-serif;letter-spacing:0}.shell{min-width:0}.top{padding:16px;border-bottom:1px solid var(--line);background:#0f151d}.identity{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.identity h1{font-size:17px;margin:0 0 3px;color:#fff}.sub{color:var(--muted);font-size:12px}.status{display:inline-flex;align-items:center;gap:6px;color:${remoteOnline ? 'var(--green)' : 'var(--red)'};white-space:nowrap}.dot{width:8px;height:8px;border-radius:50%;background:currentColor}.toolbar{display:flex;gap:7px;margin-top:13px}.btn{border:1px solid var(--line);background:var(--surface2);color:var(--text);border-radius:6px;padding:7px 10px;cursor:pointer}.btn:hover{border-color:var(--blue)}.btn.primary{background:#19452d;border-color:#347a50}.content{padding:14px}.metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-bottom:16px}.metric{min-width:0;border:1px solid var(--line);background:var(--surface);border-radius:6px;padding:10px}.metric b{display:block;font-size:17px;color:#fff;overflow-wrap:anywhere}.metric span{color:var(--muted);font-size:11px}.metric.warn b{color:var(--gold)}.metric.bad b{color:var(--red)}section{border-top:1px solid var(--line);padding:14px 0}section:first-of-type{border-top:0}h2{font-size:13px;color:var(--gold);margin:0 0 9px}.rows{display:grid;gap:6px}.row{display:grid;grid-template-columns:minmax(90px,36%) minmax(0,1fr);gap:10px;padding:5px 0;border-bottom:1px solid #1c2631}.row:last-child{border-bottom:0}.key{color:var(--muted)}.value{direction:ltr;text-align:left;overflow-wrap:anywhere}.flow{display:flex;flex-wrap:wrap;gap:6px}.step{border:1px solid #37516b;background:#101c28;border-radius:6px;padding:5px 8px;color:#cfe6f7}.routes{direction:ltr;text-align:left;font-family:ui-monospace,monospace;font-size:11px;color:#b9cad9;overflow-wrap:anywhere}.files{margin:0;padding:0 18px 0 0;color:#c9d4df}.files li{margin:4px 0;overflow-wrap:anywhere}details{margin-top:10px}summary{cursor:pointer;color:var(--blue)}pre{direction:ltr;text-align:left;white-space:pre-wrap;overflow-wrap:anywhere;max-height:220px;overflow:auto;background:#080c11;border:1px solid var(--line);border-radius:6px;padding:9px;color:#bcc8d4;font-size:10px}@media(max-width:360px){.metrics{grid-template-columns:1fr}.identity{display:block}.status{margin-top:8px}.row{grid-template-columns:1fr}.value{text-align:right;direction:rtl}}
</style>
</head>
<body>
<div class="shell">
  <header class="top">
    <div class="identity">
      <div><h1>Sheikha Enterprise Inspector</h1><div class="sub">Runtime · Governance · Git · Diagnostics · Chat · Extension</div></div>
      <div class="status"><span class="dot"></span>${esc(overall)}</div>
    </div>
    <div class="toolbar">
      <button class="btn" id="refresh" title="تحديث المفتش">تحديث</button>
      <button class="btn primary" id="ask" title="تحليل الحالة في شات شيخة">حلل في الشات</button>
    </div>
  </header>

  <main class="content">
    <div class="metrics">
      ${metric('Runtime', remoteHealth.runtime || (remoteOnline ? 'ACTIVE' : 'OFFLINE'))}
      ${metric('Governance', remoteHealth.governance || 'UNKNOWN')}
      ${metric('Errors', localDiagnostics.errors, localDiagnostics.errors ? 'bad' : '')}
      ${metric('Warnings', localDiagnostics.warnings, localDiagnostics.warnings ? 'warn' : '')}
      ${metric('Git', changedFiles.length ? `${changedFiles.length} modified` : 'clean', changedFiles.length ? 'warn' : '')}
      ${metric('Extension', remoteHealth.extension || 'LOCAL')}
    </div>

    <section>
      <h2>الحالة التشغيلية</h2>
      <div class="rows">
        ${row('الخادم', remoteOnline ? remote.inspector : remote.error || 'غير متصل')}
        ${row('CPU / RAM', `${remoteRuntime.cpuLoad1m ?? 'n/a'} / ${remoteRuntime.ramUsedPercent ?? 'n/a'}%`)}
        ${row('Heap', `${remoteRuntime.heapUsedMb ?? 'n/a'}MB / ${remoteRuntime.heapTotalMb ?? 'n/a'}MB`)}
        ${row('Local CPU / RAM', `${localRuntime.cpuLoad1m} / ${localRuntime.ramUsedPercent}%`)}
        ${row('آخر مزامنة', updatedAt)}
      </div>
    </section>

    <section>
      <h2>Workspace وGit</h2>
      <div class="rows">
        ${row('Workspace', local.workspaceRoot || 'غير متاح')}
        ${row('Branch', local.gitBranch || remoteGit.branch || 'غير متاح')}
        ${row('Active File', local.activeFile || 'لا يوجد')}
        ${row('Language', local.languageId || 'غير محدد')}
        ${row('Open Editors', editors.length)}
      </div>
      ${changedFiles.length ? `<ul class="files">${changedFiles.slice(0, 20).map((file) => `<li>${esc(file)}</li>`).join('')}</ul>` : ''}
    </section>

    <section>
      <h2>مسار القرار المحكوم</h2>
      <div class="flow">${(architecture.flow || []).map((step) => `<span class="step">${esc(step)}</span>`).join('') || '<span class="sub">غير متاح</span>'}</div>
    </section>

    <section>
      <h2>واجهات المنظومة</h2>
      <div class="routes">${Object.entries(surfaces).map(([name, route]) => `${esc(name)}  ${esc(route)}`).join('<br>') || 'غير متاحة'}</div>
      <details><summary>لقطة المفتش</summary><pre>${esc(JSON.stringify({ remote, local: { registry: local.registry, diagnostics: localDiagnostics } }, null, 2))}</pre></details>
    </section>
  </main>
</div>
<script>
const vscode = acquireVsCodeApi();
document.getElementById('refresh').addEventListener('click', () => vscode.postMessage({command:'refresh'}));
document.getElementById('ask').addEventListener('click', () => vscode.postMessage({command:'ask',prompt:${JSON.stringify(defaultInspectorPrompt())}}));
</script>
</body>
</html>`;
}

function metric(label, value, state = '') {
  return `<div class="metric ${state}"><b>${esc(value)}</b><span>${esc(label)}</span></div>`;
}

function row(label, value) {
  return `<div class="row"><span class="key">${esc(label)}</span><span class="value">${esc(value)}</span></div>`;
}

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = {
  SheikhaInspectorProvider,
  collectLocalRuntime,
  summarizeLocalDiagnostics,
  defaultInspectorPrompt
};
