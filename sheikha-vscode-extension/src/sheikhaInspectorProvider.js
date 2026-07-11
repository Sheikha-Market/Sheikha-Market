'use strict';

const crypto = require('node:crypto');
const os = require('node:os');
const vscode = require('vscode');

const { collectVSCodeToolContext } = require('./sheikhaVSCodeToolRegistry');
const {
  DEFAULT_BASE_URL,
  getEnterpriseInspectorStatus
} = require('./sheikhaExtensionChatClient');
const {
  renderInspectorTemplate,
  renderLoadingTemplate
} = require('./ui/sheikhaInspectorTemplate');

class SheikhaInspectorProvider {
  constructor(context, options = {}) {
    this.context = context;
    this.onAsk = options.onAsk;
    this.getBaseUrl = typeof options.getBaseUrl === 'function'
      ? options.getBaseUrl
      : () => DEFAULT_BASE_URL;
    this.refreshIntervalMs = Math.max(15, Number(options.refreshSeconds) || 30) * 1000;
    this.view = null;
    this.refreshTimer = null;
    this.refreshPromise = null;
    this.refreshSequence = 0;
  }

  resolveWebviewView(webviewView) {
    this.view = webviewView;
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = renderLoadingTemplate(createNonce());

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
    }, this.refreshIntervalMs);
  }

  disposeTimer() {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
    this.refreshTimer = null;
  }

  async refresh() {
    if (this.refreshPromise) return this.refreshPromise;
    const sequence = ++this.refreshSequence;
    this.refreshPromise = (async () => {
      const local = collectVSCodeToolContext();
      const localRuntime = collectLocalRuntime();
      const remote = await getEnterpriseInspectorStatus({
        baseUrl: this.getBaseUrl(),
        timeout: Math.min(this.refreshIntervalMs - 1000, 15000)
      });
      if (!this.view || sequence !== this.refreshSequence) return;

      this.view.webview.html = inspectorHtml(local, localRuntime, remote);
    })().finally(() => {
      this.refreshPromise = null;
    });
    return this.refreshPromise;
  }
}

function createNonce() {
  return crypto.randomBytes(24).toString('base64url');
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

function inspectorHtml(local, localRuntime, remote) {
  return renderInspectorTemplate({
    nonce: createNonce(),
    local,
    localRuntime,
    remote,
    localDiagnostics: summarizeLocalDiagnostics(local.diagnostics),
    inspectorPrompt: defaultInspectorPrompt()
  });
}

module.exports = {
  SheikhaInspectorProvider,
  collectLocalRuntime,
  createNonce,
  defaultInspectorPrompt,
  inspectorHtml,
  summarizeLocalDiagnostics
};
