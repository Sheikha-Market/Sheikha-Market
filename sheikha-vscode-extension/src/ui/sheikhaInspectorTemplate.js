'use strict';

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function metric(label, value, state = '') {
  return `<div class="metric ${esc(state)}"><span>${esc(label)}</span><b>${esc(value)}</b></div>`;
}

function row(label, value, options = {}) {
  const direction = options.ltr ? ' ltr' : '';
  return `<div class="row"><span>${esc(label)}</span><b class="${direction}">${esc(value)}</b></div>`;
}

function normalizeStatus(value, fallback = 'غير متاح') {
  return String(value || fallback).replaceAll('_', ' ');
}

function renderLoadingTemplate(nonce = '') {
  return `<!DOCTYPE html><html lang="ar" dir="rtl"><head>
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline';">
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <style>body{margin:0;padding:16px;background:var(--vscode-sideBar-background,#0d1117);color:var(--vscode-foreground,#eef2f6);font:13px system-ui,sans-serif;letter-spacing:0}.loading{display:flex;gap:8px;align-items:center;color:var(--vscode-descriptionForeground,#9ba7b4)}.loading::before{content:'';width:8px;height:8px;border-radius:50%;background:#d5ad45;animation:p 1s infinite}@keyframes p{50%{opacity:.3}}</style>
  </head><body><div class="loading">جارٍ مزامنة Enterprise Inspector...</div></body></html>`;
}

function renderInspectorTemplate(model = {}) {
  const nonce = esc(model.nonce || '');
  const local = model.local || {};
  const localRuntime = model.localRuntime || {};
  const remote = model.remote || {};
  const diagnostics = model.localDiagnostics || { errors: 0, warnings: 0, total: 0 };
  const remoteHealth = remote.health || {};
  const remoteRuntime = remote.runtime || {};
  const remoteGit = remote.git || {};
  const architecture = remote.architecture || {};
  const governance = remote.governance || {};
  const surfaces = remote.surfaces || {};
  const remoteOnline = remote.success === true;
  const overall = normalizeStatus(remoteOnline ? remoteHealth.overall || remote.status : remote.status || 'OFFLINE');
  const updatedAt = remote.generatedAt
    ? new Date(remote.generatedAt).toLocaleString('ar-SA')
    : new Date().toLocaleString('ar-SA');
  const editors = Array.isArray(local.openEditors) ? local.openEditors : [];
  const changedFiles = String(local.gitStatus || '').split('\n').filter(Boolean);
  const routes = Object.entries(surfaces).sort(([a], [b]) => a.localeCompare(b));
  const flow = Array.isArray(architecture.flow) ? architecture.flow : [];
  const prompt = JSON.stringify(model.inspectorPrompt || 'حلل حالة Enterprise Inspector وحدد أفضل إجراء تالٍ الآمن.');
  const snapshot = JSON.stringify({
    remote,
    local: { registry: local.registry, diagnostics }
  }, null, 2);

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
:root{
  color-scheme:light dark;
  --bg:var(--vscode-sideBar-background,#0d1117);
  --surface:var(--vscode-editor-background,#111820);
  --raised:var(--vscode-input-background,#171f29);
  --line:var(--vscode-panel-border,#303b48);
  --text:var(--vscode-foreground,#eef2f6);
  --muted:var(--vscode-descriptionForeground,#9ba7b4);
  --focus:var(--vscode-focusBorder,#5b9bd5);
  --accent:var(--vscode-button-background,#2f6f4e);
  --accentText:var(--vscode-button-foreground,#fff);
  --good:#68c083;--warn:#d5ad45;--bad:#e36d72;
}
*{box-sizing:border-box}html,body{min-height:100%}body{margin:0;background:var(--bg);color:var(--text);font:12px/1.55 system-ui,sans-serif;letter-spacing:0}button,input{font:inherit;letter-spacing:0}
button:focus-visible,input:focus-visible,summary:focus-visible{outline:1px solid var(--focus);outline-offset:1px}
.app{min-width:0}.top{position:sticky;top:0;z-index:2;padding:12px;background:var(--surface);border-bottom:1px solid var(--line)}
.identity{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:start}.identity h1{font-size:15px;margin:0}.identity p{margin:2px 0 0;color:var(--muted);font-size:10px}.health{display:flex;gap:6px;align-items:center;color:${remoteOnline ? 'var(--good)' : 'var(--bad)'};font-size:10px;white-space:nowrap}.health::before{content:'';width:7px;height:7px;border-radius:50%;background:currentColor}
.actions{display:flex;gap:6px;margin-top:9px}button{height:30px;border:1px solid var(--line);border-radius:6px;background:var(--raised);color:var(--text);padding:0 9px;cursor:pointer}button:hover{border-color:var(--focus)}button.primary{background:var(--accent);border-color:transparent;color:var(--accentText)}
.summary{padding:12px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;border-bottom:1px solid var(--line)}.metric{min-width:0;padding:7px;border:1px solid var(--line);border-radius:6px;background:var(--surface)}.metric span{display:block;color:var(--muted);font-size:9px}.metric b{display:block;margin-top:2px;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.metric.good b{color:var(--good)}.metric.warn b{color:var(--warn)}.metric.bad b{color:var(--bad)}
.tabs{position:sticky;top:73px;z-index:1;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:3px;padding:7px 12px;background:var(--bg);border-bottom:1px solid var(--line)}.tab{height:28px;padding:0 5px;color:var(--muted);font-size:10px}.tab.active{color:var(--text);border-color:var(--good);background:color-mix(in srgb,var(--good) 10%,var(--raised))}
.panels{padding:12px}.panel{display:none}.panel.active{display:block}.section{padding:0 0 14px;margin:0 0 14px;border-bottom:1px solid var(--line)}.section:last-child{border-bottom:0;margin-bottom:0}.section h2{font-size:12px;margin:0 0 8px;color:var(--warn)}
.rows{display:grid;gap:1px}.row{display:grid;grid-template-columns:minmax(90px,38%) minmax(0,1fr);gap:8px;padding:6px 0;border-bottom:1px solid color-mix(in srgb,var(--line) 55%,transparent)}.row:last-child{border-bottom:0}.row span{color:var(--muted)}.row b{font-weight:500;overflow-wrap:anywhere}.row b.ltr{direction:ltr;text-align:left;unicode-bidi:plaintext}
.flow{margin:0;padding:0;list-style:none;counter-reset:step}.flow li{counter-increment:step;display:grid;grid-template-columns:22px minmax(0,1fr);gap:7px;align-items:center;padding:5px 0}.flow li::before{content:counter(step);width:20px;height:20px;display:grid;place-items:center;border:1px solid #3a7250;border-radius:50%;color:var(--good);font-size:9px}
.files,.editors{margin:0;padding:0;list-style:none}.files li,.editors li{padding:5px 0;border-bottom:1px solid color-mix(in srgb,var(--line) 55%,transparent);overflow-wrap:anywhere}.files li:last-child,.editors li:last-child{border-bottom:0}.editor-language{color:var(--muted);font-size:9px;margin-inline-start:5px}
.policy{border-inline-start:3px solid var(--good);padding:7px 9px;background:color-mix(in srgb,var(--good) 7%,transparent);unicode-bidi:plaintext}
.route-tools{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:7px;margin-bottom:8px}.route-tools input{min-width:0;height:30px;border:1px solid var(--line);border-radius:6px;background:var(--raised);color:var(--text);padding:0 8px}.route-count{color:var(--muted);align-self:center}.routes{direction:ltr;text-align:left;border-top:1px solid var(--line)}.route{display:grid;grid-template-columns:minmax(110px,34%) minmax(0,1fr);gap:8px;padding:7px 0;border-bottom:1px solid var(--line)}.route b{font-size:10px;overflow-wrap:anywhere}.route code{color:var(--muted);font-size:10px;overflow-wrap:anywhere;white-space:normal}
details{margin-top:10px}summary{cursor:pointer;color:var(--muted)}pre{direction:ltr;text-align:left;white-space:pre-wrap;overflow-wrap:anywhere;max-height:280px;overflow:auto;background:var(--surface);border:1px solid var(--line);border-radius:6px;padding:9px;color:var(--muted);font-size:9px}
@media(max-width:430px){.summary{grid-template-columns:repeat(2,minmax(0,1fr))}.tabs{top:91px}.row,.route{grid-template-columns:1fr;gap:2px}.row b.ltr{text-align:right}.identity p{max-width:230px}.tab{font-size:9px}}
</style>
</head>
<body>
<main class="app">
  <header class="top">
    <div class="identity">
      <div><h1>Sheikha Enterprise Inspector</h1><p>Runtime · Governance · Diagnostics · Workspace</p></div>
      <div class="health">${esc(overall)}</div>
    </div>
    <div class="actions">
      <button id="refresh" title="تحديث الحالة">↻ تحديث</button>
      <button class="primary" id="ask" title="تحليل الحالة في شات شيخة">حلّل في الشات</button>
    </div>
  </header>

  <section class="summary" aria-label="الملخص التنفيذي">
    ${metric('Runtime', normalizeStatus(remoteHealth.runtime || (remoteOnline ? 'ACTIVE' : 'OFFLINE')), remoteOnline ? 'good' : 'bad')}
    ${metric('Governance', normalizeStatus(remoteHealth.governance || 'UNKNOWN'), remoteHealth.governance === 'ACTIVE' ? 'good' : 'warn')}
    ${metric('Errors', diagnostics.errors, diagnostics.errors ? 'bad' : 'good')}
    ${metric('Warnings', diagnostics.warnings, diagnostics.warnings ? 'warn' : 'good')}
  </section>

  <nav class="tabs" aria-label="أقسام المفتش">
    <button class="tab active" data-tab="overview">الملخص</button>
    <button class="tab" data-tab="workspace">المشروع</button>
    <button class="tab" data-tab="governance">الحوكمة</button>
    <button class="tab" data-tab="interfaces">الواجهات</button>
  </nav>

  <div class="panels">
    <section class="panel active" data-panel="overview">
      <div class="section"><h2>الحالة التشغيلية</h2><div class="rows">
        ${row('الخادم', remoteOnline ? remote.inspector : remote.error || 'غير متصل')}
        ${row('CPU / RAM', `${remoteRuntime.cpuLoad1m ?? 'n/a'} / ${remoteRuntime.ramUsedPercent ?? 'n/a'}%`, { ltr: true })}
        ${row('Heap', `${remoteRuntime.heapUsedMb ?? 'n/a'}MB / ${remoteRuntime.heapTotalMb ?? 'n/a'}MB`, { ltr: true })}
        ${row('Extension Host', `${localRuntime.cpuLoad1m} / ${localRuntime.ramUsedPercent}%`, { ltr: true })}
        ${row('آخر مزامنة', updatedAt)}
      </div></div>
      <div class="section"><h2>حالة الاتصال</h2><div class="rows">
        ${row('Extension', normalizeStatus(remoteHealth.extension || 'LOCAL'))}
        ${row('Git', changedFiles.length ? `${changedFiles.length} modified` : 'clean', { ltr: true })}
        ${row('Diagnostics', diagnostics.total ? `${diagnostics.total} total` : 'clean', { ltr: true })}
      </div></div>
    </section>

    <section class="panel" data-panel="workspace">
      <div class="section"><h2>Workspace وGit</h2><div class="rows">
        ${row('Workspace', local.workspaceRoot || 'غير متاح', { ltr: true })}
        ${row('Branch', local.gitBranch || remoteGit.branch || 'غير متاح', { ltr: true })}
        ${row('Active File', local.activeFile || 'لا يوجد', { ltr: true })}
        ${row('Language', local.languageId || 'غير محدد', { ltr: true })}
        ${row('Open Editors', editors.length)}
      </div></div>
      <div class="section"><h2>المحررات المفتوحة</h2><ul class="editors">${editors.slice(0, 50).map((editor) => `<li>${esc(editor.file || 'untitled')}<span class="editor-language">${esc(editor.languageId || '')}</span></li>`).join('') || '<li>لا توجد محررات</li>'}</ul></div>
      <div class="section"><h2>الملفات المتغيرة</h2><ul class="files">${changedFiles.slice(0, 50).map((file) => `<li>${esc(file)}</li>`).join('') || '<li>الشجرة نظيفة</li>'}</ul></div>
    </section>

    <section class="panel" data-panel="governance">
      <div class="section"><h2>مسار القرار المحكوم</h2><ol class="flow">${flow.map((step) => `<li>${esc(step)}</li>`).join('') || '<li>غير متاح</li>'}</ol></div>
      <div class="section"><h2>سياسة القرار</h2><div class="policy">${esc(governance.contextPolicy || 'MINIMUM_NECESSARY_NO_SECRETS')} · القرار النهائي للإنسان · لا تصدر المنظومة فتوى آلية.</div></div>
      <details><summary>لقطة الأدلة الخام</summary><pre>${esc(snapshot)}</pre></details>
    </section>

    <section class="panel" data-panel="interfaces">
      <div class="route-tools"><input id="routeFilter" type="search" placeholder="ابحث في المسارات..." aria-label="بحث المسارات"><span class="route-count" id="routeCount">${routes.length}</span></div>
      <div class="routes" id="routes">${routes.map(([name, route]) => `<div class="route" data-route="${esc(`${name} ${route}`.toLowerCase())}"><b>${esc(name)}</b><code>${esc(route)}</code></div>`).join('') || '<div class="route">غير متاحة</div>'}</div>
    </section>
  </div>
</main>
<script nonce="${nonce}">
const vscode = acquireVsCodeApi();
const state = vscode.getState() || {};
const tabs = Array.from(document.querySelectorAll('[data-tab]'));
const panels = Array.from(document.querySelectorAll('[data-panel]'));

function activateTab(name) {
  tabs.forEach(function (tab) { tab.classList.toggle('active', tab.dataset.tab === name); });
  panels.forEach(function (panel) { panel.classList.toggle('active', panel.dataset.panel === name); });
  vscode.setState({ tab: name });
}

tabs.forEach(function (tab) {
  tab.addEventListener('click', function () { activateTab(tab.dataset.tab); });
});
activateTab(state.tab || 'overview');

document.getElementById('refresh').addEventListener('click', function () {
  vscode.postMessage({ command: 'refresh' });
});
document.getElementById('ask').addEventListener('click', function () {
  vscode.postMessage({ command: 'ask', prompt: ${prompt} });
});

const routeFilter = document.getElementById('routeFilter');
const routeCount = document.getElementById('routeCount');
const routeRows = Array.from(document.querySelectorAll('[data-route]'));
routeFilter.addEventListener('input', function () {
  const query = routeFilter.value.trim().toLowerCase();
  let visible = 0;
  routeRows.forEach(function (route) {
    const show = !query || route.dataset.route.includes(query);
    route.hidden = !show;
    if (show) visible += 1;
  });
  routeCount.textContent = String(visible) + ' / ' + String(routeRows.length);
});
</script>
</body>
</html>`;
}

module.exports = {
  esc,
  metric,
  normalizeStatus,
  renderInspectorTemplate,
  renderLoadingTemplate,
  row
};
