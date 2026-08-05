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
  getOrganizationControlStatus,
  getStreamingChatApexStatus,
  getTechnicalCapabilityApexStatus,
  getVitalChatApexStatus,
  sendExtensionChat
} = require('../sheikhaExtensionChatClient');
const {
  createSafePreviewHtml,
  extractHtmlArtifact
} = require('../sheikhaArtifactPreview');
const {
  CHAT_TOOL_COMMAND_IDS,
  getChatTool,
  renderSheikhaChatTemplate
} = require('../ui/sheikhaChatTemplate');
const {
  isGovernedPreconditionDriftCaptureRequest,
  isGovernedPublishedEvidenceVerificationRequest,
  isGovernedReadOnlyEvidenceCaptureRequest,
  runGovernedPreconditionDriftCapture,
  runGovernedPublishedEvidenceVerification,
  runGovernedReadOnlyEvidenceCapture
} = require('./sheikhaReadOnlyEvidenceCapture');
const {
  isGovernedLauncherPreflightRequest,
  runGovernedLauncherPreflight
} = require('./sheikhaGovernedLauncherPreflight');
const {
  isGovernedReadOnlyScriptRequest,
  runGovernedReadOnlyScript
} = require('./sheikhaGovernedReadOnlyScriptRunner');

const CHAT_EXPERIENCE = Object.freeze({
  titleAr: 'شات شيخة المتدفق المتقدم',
  traceLabelAr: 'مسار الرد المحكوم',
  contextRail: 'contextRail',
  memory: 'Session Memory',
  layerPath:
    'L24 Computing Cognitive Apex · L23 Extension Streaming Artifact Apex · L21 Streaming Multilingual Chat Apex · L20 Technical Capability Apex',
  layers: Object.freeze([
    'L24 Computing Cognitive Apex',
    'L23 Extension Streaming Artifact Apex',
    'Vital Chat Apex',
    'Debugging Apex',
    'Chat Interface Apex',
    'IDE Apex',
    'Technical Capability Apex',
    'Streaming Multilingual Chat Apex'
  ])
});

// Streaming Apex — Conversation Engine surface labels
const CHAT_SURFACE_LABELS = Object.freeze({
  streamingApex: 'Streaming Apex',
  conversationEngine: 'Conversation Engine'
});

const STATUS_LOADERS = Object.freeze([
  {
    command: 'organizationControlStatus',
    key: 'organizationControl',
    loader: getOrganizationControlStatus
  },
  {
    command: 'experienceStatus',
    key: 'experience',
    loader: getExtensionExperienceStatus
  },
  {
    command: 'vitalStatus',
    key: 'vital',
    loader: getVitalChatApexStatus
  },
  {
    command: 'debuggingStatus',
    key: 'debugging',
    loader: getDebuggingApexStatus
  },
  {
    command: 'interfaceStatus',
    key: 'interfaceApex',
    loader: getChatInterfaceApexStatus
  },
  {
    command: 'ideApexStatus',
    key: 'ideApex',
    loader: getIdeApexStatus
  },
  {
    command: 'technicalCapabilityStatus',
    key: 'technicalCapability',
    loader: getTechnicalCapabilityApexStatus
  },
  {
    command: 'computingCognitiveApexStatus',
    key: 'computingCognitiveApex',
    loader: getComputingCognitiveApexStatus
  },
  {
    command: 'streamingApexStatus',
    key: 'streamingApex',
    loader: getStreamingChatApexStatus
  },
  {
    command: 'extensionArtifactApexStatus',
    key: 'extensionArtifactApex',
    loader: getExtensionStreamingArtifactApexStatus
  }
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

async function publishToolAvailability(webview, vscodeApi = vscode) {
  try {
    const registered = new Set(await vscodeApi.commands.getCommands(true));
    const available = CHAT_TOOL_COMMAND_IDS.filter((command) => registered.has(command));
    await webview.postMessage({
      command: 'toolAvailability',
      available,
      unavailable: CHAT_TOOL_COMMAND_IDS.filter((command) => !registered.has(command)),
      total: CHAT_TOOL_COMMAND_IDS.length
    });
    return available;
  } catch (error) {
    await webview.postMessage({
      command: 'toolAvailability',
      available: [],
      unavailable: CHAT_TOOL_COMMAND_IDS,
      total: CHAT_TOOL_COMMAND_IDS.length,
      error: String(error.message || error)
    });
    return [];
  }
}

async function executeGovernedChatTool(webview, toolId, vscodeApi = vscode) {
  const tool = getChatTool(String(toolId || ''));
  if (!tool) {
    await webview.postMessage({
      command: 'toolResult',
      toolId: String(toolId || ''),
      label: 'أداة غير معروفة',
      success: false,
      message: 'رُفض الأمر لأنه غير موجود في قائمة أدوات الشات المسموح بها.'
    });
    return false;
  }

  const registered = new Set(await vscodeApi.commands.getCommands(true));
  if (!registered.has(tool.command)) {
    await webview.postMessage({
      command: 'toolResult',
      toolId: tool.command,
      label: tool.label,
      success: false,
      message: `الأداة غير مسجلة في VS Code: ${tool.label}`
    });
    return false;
  }

  await webview.postMessage({
    command: 'toolStart',
    toolId: tool.command,
    label: tool.label,
    impact: tool.impact || 'standard'
  });

  try {
    await vscodeApi.commands.executeCommand(tool.command);
    await webview.postMessage({
      command: 'toolResult',
      toolId: tool.command,
      label: tool.label,
      success: true,
      message: `اكتمل طلب الأداة: ${tool.label}`
    });
    return true;
  } catch (error) {
    await webview.postMessage({
      command: 'toolResult',
      toolId: tool.command,
      label: tool.label,
      success: false,
      message: `تعذر تشغيل ${tool.label}: ${String(error.message || error)}`
    });
    return false;
  }
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
    webviewView.onDidDispose(() => this.views.delete(webviewView));

    const baseUrl = this.getBaseUrl();
    webviewView.webview.onDidReceiveMessage(async (message) => {
      let requestAcquired = false;
      try {
        if (!message) return;
        if (message.command === 'ready') {
          console.info('[Sheikha Chat] Webview ready', {
            version: String(message.version || 'unknown')
          });
          webviewView.webview.postMessage({
            command: 'readyAck',
            version: EXTENSION_TRANSPORT_VERSION
          });
          for (const { command, key, loader } of STATUS_LOADERS) {
            publishStatus(webviewView.webview, command, key, loader, baseUrl);
          }
          await publishToolAvailability(webviewView.webview);
          return;
        }
        if (message.command === 'tool') {
          await executeGovernedChatTool(
            webviewView.webview,
            message.toolId
          );
          return;
        }
        if (message.command !== 'ask') return;
        const text = String(message.text || '').trim();
        console.info('[Sheikha Chat] Send received', {
          characters: text.length,
          mode: String(message.mode || 'smart'),
          dialogueMode: String(message.dialogueMode || 'none')
        });

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
          text: message.dialogueMode === 'constructive'
            ? 'شيخة تبني حوارًا عادلًا وتراجع الدليل...'
            : 'شيخة تقرأ السياق وحالة المشروع...'
        });
        webviewView.webview.postMessage({ command: 'streamStart' });

        if (isGovernedReadOnlyEvidenceCaptureRequest(text)) {
          webviewView.webview.postMessage({
            command: 'progress',
            text: 'يجري التحقق من الأدلة وحالة Git للقراءة فقط'
          });
          const workspaceRoot =
            vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
          const captureResult = await runGovernedReadOnlyEvidenceCapture(
            text,
            { workspaceRoot }
          );
          this.history.push(
            { role: 'user', content: text },
            {
              role: 'assistant',
              content: captureResult.answer.slice(0, 4000)
            }
          );
          this.history = this.history.slice(-12);
          webviewView.webview.postMessage({
            command: 'reply',
            text: captureResult.answer,
            meta: {
              provider: 'Sheikha Read-Only Evidence Adapter',
              model: 'بدون نموذج',
              route: captureResult.route,
              governance:
                'SHEIKHA_GOVERNED_READ_ONLY_EVIDENCE_CAPTURE_V1',
              streaming: false,
              readOnlyExecution: true,
              boundaries: captureResult.capture.boundaries,
              layers: [
                {
                  layer: 20,
                  name: 'Governed Read-Only Evidence Adapter',
                  status: 'ACTIVE'
                },
                {
                  layer: 18,
                  name: 'Digest and Git Verification',
                  status: 'VERIFIED'
                }
              ]
            }
          });
          return;
        }

        if (isGovernedPreconditionDriftCaptureRequest(text)) {
          webviewView.webview.postMessage({
            command: 'progress',
            text: 'يجري التقاط فرق شروط I1-R1 للقراءة فقط'
          });
          const workspaceRoot =
            vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
          const driftResult = await runGovernedPreconditionDriftCapture(
            text,
            { workspaceRoot }
          );
          this.history.push(
            { role: 'user', content: text },
            {
              role: 'assistant',
              content: driftResult.answer.slice(0, 4000)
            }
          );
          this.history = this.history.slice(-12);
          webviewView.webview.postMessage({
            command: 'reply',
            text: driftResult.answer,
            meta: {
              provider: 'Sheikha Precondition Drift Adapter',
              model: 'بدون نموذج',
              route: driftResult.route,
              governance:
                'SHEIKHA_GOVERNED_PRECONDITION_DRIFT_CAPTURE_V1',
              streaming: false,
              readOnlyExecution: true,
              boundaries: driftResult.capture.truthBoundaries,
              decision: driftResult.capture.decision,
              layers: [
                {
                  layer: 20,
                  name: 'Governed Precondition Drift Adapter',
                  status: 'ACTIVE'
                },
                {
                  layer: 18,
                  name: 'I1-R1 Semantic State Comparison',
                  status: 'VERIFIED'
                }
              ]
            }
          });
          return;
        }

        if (isGovernedPublishedEvidenceVerificationRequest(text)) {
          webviewView.webview.postMessage({
            command: 'progress',
            text: 'يجري التحقق من الدليل المنشور وبصماته للقراءة فقط'
          });
          const evidenceResult =
            await runGovernedPublishedEvidenceVerification(text);
          this.history.push(
            { role: 'user', content: text },
            {
              role: 'assistant',
              content: evidenceResult.answer.slice(0, 4000)
            }
          );
          this.history = this.history.slice(-12);
          webviewView.webview.postMessage({
            command: 'reply',
            text: evidenceResult.answer,
            meta: {
              provider: 'Sheikha Published Evidence Verifier',
              model: 'بدون نموذج',
              route: evidenceResult.route,
              governance:
                'SHEIKHA_GOVERNED_PUBLISHED_EVIDENCE_VERIFICATION_V1',
              streaming: false,
              readOnlyExecution: true,
              boundaries: evidenceResult.verification.boundaries,
              decision:
                evidenceResult.verification.result.decision || null,
              layers: [
                {
                  layer: 20,
                  name: 'Governed Published Evidence Verifier',
                  status: 'ACTIVE'
                },
                {
                  layer: 18,
                  name: 'Digest and Terminal Record Verification',
                  status: 'VERIFIED'
                }
              ]
            }
          });
          return;
        }

        if (isGovernedReadOnlyScriptRequest(text)) {
          webviewView.webview.postMessage({
            command: 'progress',
            text: 'يجري التحقق من البصمة وتشغيل السكربت داخل عزل قرائي بلا شبكة'
          });
          const workspaceRoot =
            vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
          const scriptResult = await runGovernedReadOnlyScript(
            text,
            { workspaceRoot }
          );
          this.history.push(
            { role: 'user', content: text },
            {
              role: 'assistant',
              content: scriptResult.answer.slice(0, 4000)
            }
          );
          this.history = this.history.slice(-12);
          webviewView.webview.postMessage({
            command: 'reply',
            text: scriptResult.answer,
            meta: {
              provider: 'Sheikha Read-Only Script Sandbox',
              model: 'بدون نموذج',
              route: scriptResult.route,
              governance:
                'SHEIKHA_GOVERNED_READ_ONLY_SCRIPT_SANDBOX_V1',
              streaming: false,
              scriptExecuted: scriptResult.executed,
              decision:
                scriptResult.parsedOutput?.decision || scriptResult.status,
              boundaries: scriptResult.boundaries,
              layers: [
                {
                  layer: 20,
                  name: 'Governed Read-Only Script Sandbox',
                  status: scriptResult.status
                },
                {
                  layer: 18,
                  name: 'SHA-256 and Bubblewrap Isolation',
                  status: scriptResult.success ? 'VERIFIED' : 'BLOCKED'
                }
              ]
            }
          });
          return;
        }

        if (isGovernedLauncherPreflightRequest(text)) {
          webviewView.webview.postMessage({
            command: 'progress',
            text: 'يجري فحص المشغّل والبصمات وشروط الحالة دون تنفيذ'
          });
          const workspaceRoot =
            vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
          const preflightResult = await runGovernedLauncherPreflight(
            text,
            { workspaceRoot }
          );
          this.history.push(
            { role: 'user', content: text },
            {
              role: 'assistant',
              content: preflightResult.answer.slice(0, 4000)
            }
          );
          this.history = this.history.slice(-12);
          webviewView.webview.postMessage({
            command: 'reply',
            text: preflightResult.answer,
            meta: {
              provider: 'Sheikha Governed Launcher Preflight',
              model: 'بدون نموذج',
              route: preflightResult.route,
              governance: 'SHEIKHA_GOVERNED_LOCAL_LAUNCHER_PREFLIGHT_V1',
              streaming: false,
              launcherExecuted: false,
              decision: preflightResult.decision,
              boundaries: preflightResult.boundaries,
              layers: [
                {
                  layer: 20,
                  name: 'Governed Launcher Preflight',
                  status: 'ACTIVE'
                },
                {
                  layer: 18,
                  name: 'Artifact and Preconditions Verification',
                  status: preflightResult.decision
                }
              ]
            }
          });
          return;
        }

        let streamedTokens = 0;
        const result = await sendExtensionChat(text, {
          baseUrl: this.getBaseUrl(),
          mode: message.mode || 'smart',
          dialogueMode: message.dialogueMode || null,
          audienceContext:
            message.audienceContext || 'GENERAL_PUBLIC',
          religiousLensRequested:
            message.religiousLensRequested === true,
          ultraBudgetApproved:
            message.ultraBudgetApproved === true,
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
          },
          onEvent: (event) => {
            const labels = {
              progress: String(
                event.data?.text || 'جارٍ توليد الإجابة الكاملة'
              ),
              model_wait: 'يجري تهيئة النموذج للإجابة',
              'deep-continuation': 'انتقال إلى مسار الإجابة العميقة'
            };
            const progressText = labels[event.event];
            if (progressText) {
              webviewView.webview.postMessage({
                command: 'progress',
                text: progressText
              });
            }
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
          experience: CHAT_EXPERIENCE,
          mode: message.mode || 'smart',
          dialogueMode: message.dialogueMode || null,
          audienceContext:
            message.audienceContext || null,
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

    webviewView.webview.html = this.getHtml();
    console.info('[Sheikha Chat] Webview resolved', {
      version: EXTENSION_TRANSPORT_VERSION
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
    const html = renderSheikhaChatTemplate({
      nonce: getNonce(),
      version: EXTENSION_TRANSPORT_VERSION
    });
    if (!html.includes('id="clear"')) {
      throw new Error('SHEIKHA_CHAT_CLEAR_CONTROL_MISSING');
    }
    if (!html.includes('addTrace(msg.meta && msg.meta.layers)')) {
      throw new Error('SHEIKHA_CHAT_TRACE_BINDING_MISSING');
    }
    if (!html.includes('id="toolbox"') || !html.includes('id="toolSearch"')) {
      throw new Error('SHEIKHA_CHAT_TOOLBOX_MISSING');
    }
    if (!CHAT_TOOL_COMMAND_IDS.every((command) => (
      html.includes(`data-tool-command="${command}"`)
    ))) {
      throw new Error('SHEIKHA_CHAT_TOOL_COMMAND_MISSING');
    }
    if (!html.includes("msg.command === 'toolResult'")) {
      throw new Error('SHEIKHA_CHAT_TOOL_RESULT_BINDING_MISSING');
    }
    return html;
  }
}

module.exports = {
  CHAT_EXPERIENCE,
  STATUS_LOADERS,
  SheikhaChatProvider,
  executeGovernedChatTool,
  getNonce,
  publishStatus,
  publishToolAvailability
};
