'use strict';

const crypto = require('node:crypto');
const vscode = require('vscode');

const {
  DEFAULT_BASE_URL,
  EXTENSION_TRANSPORT_VERSION,
  getChatInterfaceApexStatus,
  getComputingCognitiveApexStatus,
  getDebuggingApexStatus,
  getExtensionStreamingArtifactApexStatus,
  getExtensionExperienceStatus,
  getIdeApexStatus,
  getStreamingChatApexStatus,
  getTechnicalCapabilityApexStatus,
  getVitalChatApexStatus,
  sendExtensionChat
} = require('../sheikhaExtensionChatClient');
const {
  createSafePreviewHtml,
  extractHtmlArtifact
} = require('../sheikhaArtifactPreview');
const { renderSheikhaChatTemplate } = require('../ui/sheikhaChatTemplate');

const STATUS_LOADERS = Object.freeze([
  ['experienceStatus', 'experience', getExtensionExperienceStatus],
  ['vitalStatus', 'vital', getVitalChatApexStatus],
  ['debuggingStatus', 'debugging', getDebuggingApexStatus],
  ['interfaceStatus', 'interfaceApex', getChatInterfaceApexStatus],
  ['ideApexStatus', 'ideApex', getIdeApexStatus],
  ['technicalCapabilityStatus', 'technicalCapability', getTechnicalCapabilityApexStatus],
  ['computingCognitiveApexStatus', 'computingCognitiveApex', getComputingCognitiveApexStatus],
  ['streamingApexStatus', 'streamingApex', getStreamingChatApexStatus],
  ['extensionArtifactApexStatus', 'extensionArtifactApex', getExtensionStreamingArtifactApexStatus]
]);

function getNonce() {
  return crypto.randomBytes(24).toString('base64url');
}

function publishStatus(webview, command, key, loader, baseUrl) {
  loader({ baseUrl })
    .then((value) => webview.postMessage({ command, [key]: value }))
    .catch((error) => webview.postMessage({
      command,
      [key]: { success: false, error: String(error.message || error) }
    }));
}

class SheikhaChatProvider {
  constructor(context, options = {}) {
    this.context = context;
    this.getBaseUrl = typeof options.getBaseUrl === 'function'
      ? options.getBaseUrl
      : () => DEFAULT_BASE_URL;
    this.views = new Set();
    this.pendingViews = new WeakSet();
    this.conversationId = crypto.randomUUID();
    this.history = [];
    this.artifactPanel = null;
  }

  resolveWebviewView(webviewView) {
    this.views.add(webviewView);
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = this.getHtml();
    webviewView.onDidDispose(() => this.views.delete(webviewView));

    const baseUrl = this.getBaseUrl();
    for (const [command, key, loader] of STATUS_LOADERS) {
      publishStatus(webviewView.webview, command, key, loader, baseUrl);
    }

    webviewView.webview.onDidReceiveMessage(async (message) => {
      let requestAcquired = false;
      try {
        if (!message || message.command !== 'ask') return;
        const text = String(message.text || '').trim();

        if (!text) {
          webviewView.webview.postMessage({
            command: 'reply',
            text: 'بسم الله الرحمن الرحيم\n\nما الذي تحتاج إليه من مساعدة أو عون؟',
            meta: { route: 'SHEIKHA_SMART_CHAT_ORCHESTRATOR' }
          });
          return;
        }

        if (this.pendingViews.has(webviewView)) {
          webviewView.webview.postMessage({
            command: 'reply',
            text: 'يوجد طلب قيد المعالجة. انتظر اكتماله قبل إرسال طلب آخر.',
            meta: { busy: true }
          });
          return;
        }

        this.pendingViews.add(webviewView);
        requestAcquired = true;
        webviewView.webview.postMessage({
          command: 'typing',
          text: 'شيخة تقرأ السياق وحالة المشروع...'
        });
        webviewView.webview.postMessage({ command: 'streamStart' });

        let streamedTokens = 0;
        const result = await sendExtensionChat(text, {
          baseUrl: this.getBaseUrl(),
          mode: message.mode || 'smart',
          conversationId: this.conversationId,
          history: this.history,
          greetingAllowed: this.history.length === 0,
          streaming: true,
          onToken: (event) => {
            streamedTokens += 1;
            webviewView.webview.postMessage({
              command: 'streamToken',
              text: String(event.text || event.data?.text || '')
            });
          }
        });

        this.history.push(
          { role: 'user', content: text },
          { role: 'assistant', content: String(result.answer || '').slice(0, 4000) }
        );
        this.history = this.history.slice(-12);

        const meta = {
          provider: 'Sheikha',
          model: 'شيخة',
          route: result.raw?.endpoint || result.raw?.route || 'SHEIKHA_CONVERSATION_ENGINE_V1',
          governance: 'SHEIKHA_ENTERPRISE_CHAT_GOVERNANCE_V1',
          mode: message.mode || 'smart',
          streaming: result.raw?.streaming === true,
          layers: (result.raw?.layerStack?.layers || []).map((layer) => ({
            layer: layer.layer,
            name: layer.name,
            status: layer.status
          }))
        };

        webviewView.webview.postMessage({
          command: streamedTokens > 0 ? 'streamDone' : 'reply',
          text: result.answer || 'ما الذي تحتاج إليه من مساعدة أو عون؟',
          meta
        });
        this.showArtifactPreview(result.answer);
      } catch (error) {
        webviewView.webview.postMessage({
          command: 'reply',
          text: `حدث خطأ في شات شيخة.\n\n${String(error.message || error)}`,
          meta: { error: true }
        });
      } finally {
        if (requestAcquired) this.pendingViews.delete(webviewView);
      }
    });
  }

  showArtifactPreview(answer) {
    const artifact = extractHtmlArtifact(answer);
    if (!artifact) return;

    if (!this.artifactPanel) {
      this.artifactPanel = vscode.window.createWebviewPanel(
        'sheikhaArtifactPreview',
        'Sheikha Live Preview',
        vscode.ViewColumn.Beside,
        { enableScripts: false, retainContextWhenHidden: true }
      );
      this.artifactPanel.onDidDispose(() => {
        this.artifactPanel = null;
      });
    }

    this.artifactPanel.webview.html = createSafePreviewHtml(artifact.content);
    this.artifactPanel.reveal(vscode.ViewColumn.Beside, true);
  }

  prefill(text, autoSend = true) {
    for (const view of this.views) {
      view.webview.postMessage({ command: 'prefill', text: String(text || ''), autoSend });
    }
  }

  getHtml() {
    return renderSheikhaChatTemplate({
      nonce: getNonce(),
      version: EXTENSION_TRANSPORT_VERSION
    });
  }
}

module.exports = {
  STATUS_LOADERS,
  SheikhaChatProvider,
  getNonce,
  publishStatus
};
