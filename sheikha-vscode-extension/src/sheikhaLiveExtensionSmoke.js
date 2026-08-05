'use strict';

const fs = require('node:fs');
const path = require('node:path');

const {
  CHAT_TOOL_COMMAND_IDS
} = require('./ui/sheikhaChatTemplate');

function createDisposable() {
  return { dispose() {} };
}

function createWebviewHarness() {
  const messages = [];
  let messageHandler = null;
  let html = '';
  const webview = {
    options: {},
    get html() {
      return html;
    },
    set html(value) {
      html = String(value || '');
    },
    onDidReceiveMessage(handler) {
      messageHandler = handler;
      return createDisposable();
    },
    postMessage(message) {
      messages.push(message);
      return Promise.resolve(true);
    }
  };
  const view = {
    visible: true,
    webview,
    onDidDispose() {
      return createDisposable();
    },
    onDidChangeVisibility() {
      return createDisposable();
    }
  };
  return {
    view,
    messages,
    html: () => html,
    async dispatch(message) {
      if (typeof messageHandler !== 'function') {
        throw new Error('WEBVIEW_MESSAGE_HANDLER_NOT_REGISTERED');
      }
      await messageHandler(message);
    }
  };
}

function resolveEvidenceTarget(vscode, configuredPath) {
  const workspaceRoot =
    vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) {
    throw new Error('LIVE_SMOKE_WORKSPACE_REQUIRED');
  }
  const target = path.resolve(configuredPath);
  const root = path.resolve(workspaceRoot);
  if (target !== root && !target.startsWith(`${root}${path.sep}`)) {
    throw new Error('LIVE_SMOKE_EVIDENCE_MUST_BE_INSIDE_WORKSPACE');
  }
  return target;
}

function writeJsonAtomic(target, value) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const temporary = `${target}.${process.pid}.tmp`;
  fs.writeFileSync(
    temporary,
    `${JSON.stringify(value, null, 2)}\n`,
    'utf8'
  );
  fs.renameSync(temporary, target);
}

function finalChatMessage(messages) {
  return [...messages].reverse().find((entry) =>
    entry.command === 'streamDone' ||
    entry.command === 'reply'
  ) || null;
}

async function runLiveExtensionSmoke(options) {
  const {
    vscode,
    context,
    chatProvider,
    inspectorProvider,
    registrations
  } = options;
  const configuredTarget =
    process.env.SHEIKHA_EXTENSION_SMOKE_EVIDENCE;
  if (!configuredTarget) {
    return {
      executed: false,
      reason: 'LIVE_SMOKE_NOT_REQUESTED'
    };
  }
  if (!chatProvider || !inspectorProvider) {
    throw new Error('CHAT_AND_INSPECTOR_PROVIDERS_REQUIRED');
  }

  const target = resolveEvidenceTarget(vscode, configuredTarget);
  const startedAt = new Date().toISOString();
  const chat = createWebviewHarness();
  const inspector = createWebviewHarness();

  chatProvider.resolveWebviewView(chat.view);
  await chat.dispatch({
    command: 'ready',
    version: context.extension.packageJSON.version
  });
  await chat.dispatch({
    command: 'ask',
    text: 'اكتب فقط هذا النص: SHEIKHA_EXTENSION_LIVE_SMOKE_OK',
    mode: 'smart',
    dialogueMode: null,
    audienceContext: 'GENERAL_PUBLIC'
  });

  inspectorProvider.resolveWebviewView(inspector.view);
  await inspectorProvider.refresh();
  inspectorProvider.disposeTimer();

  const chatHtml = chat.html();
  const inspectorHtml = inspector.html();
  const finalMessage = finalChatMessage(chat.messages);
  const finalText = String(finalMessage?.text || '');
  const toolAvailability = chat.messages.find((entry) =>
    entry.command === 'toolAvailability'
  );
  const checks = {
    actualVsCodeExtensionHost:
      Boolean(vscode.version && context.extension?.id),
    versionMatchesPackage:
      context.extension.packageJSON.version ===
      options.expectedVersion,
    chatProviderRegistered:
      registrations.chat === true,
    inspectorProviderRegistered:
      registrations.inspector === true,
    composerRendered:
      chatHtml.includes('id="composerForm"') &&
      chatHtml.includes('id="input"'),
    sendControlRendered:
      chatHtml.includes('id="send"') &&
      chatHtml.includes('type="button"'),
    sendEventBound:
      chatHtml.includes("send.addEventListener('click', ask)") &&
      chatHtml.includes(
        "composerForm.addEventListener('submit', ask)"
      ),
    sendDoesNotDependOnReadyAck:
      chatHtml.includes('send.disabled = busy;') &&
      !chatHtml.includes(
        'send.disabled = busy || !bridgeReady;'
      ),
    stalledRequestUnlocksComposer:
      chatHtml.includes('armRequestTimeout();') &&
      chatHtml.includes(
        'const REQUEST_IDLE_TIMEOUT_MS = 100000;'
      ) &&
      chatHtml.includes(
        "finishRequest('انتهت مهلة الرد؛ يمكنك إعادة الإرسال', true)"
      ),
    progressFeedbackHandled:
      chatHtml.includes("msg.command === 'progress'") &&
      chatHtml.includes(
        "activity.textContent = msg.text || 'يجري توليد الإجابة'"
      ),
    toolboxRendered:
      chatHtml.includes('id="toolbox"') &&
      chatHtml.includes('id="toolSearch"'),
    allDeclaredToolsRendered:
      CHAT_TOOL_COMMAND_IDS.every((command) =>
        chatHtml.includes(`data-tool-command="${command}"`)
      ),
    governedToolMessagesBound:
      chatHtml.includes("command: 'tool'") &&
      chatHtml.includes("msg.command === 'toolResult'"),
    allToolsRegisteredInExtensionHost:
      Array.isArray(toolAvailability?.available) &&
      toolAvailability.available.length === CHAT_TOOL_COMMAND_IDS.length,
    readyHandshakeObserved:
      chat.messages.some((entry) =>
        entry.command === 'readyAck'
      ),
    askMessageProcessed:
      chat.messages.some((entry) =>
        entry.command === 'streamStart'
      ),
    chatResponseObserved:
      Boolean(finalMessage && finalText.trim()),
    responseNotProvisionalOnly:
      finalText.trim() !== 'تم، أعمل على ذلك الآن.',
    inspectorRendered:
      inspectorHtml.includes('Sheikha Enterprise Inspector'),
    inspectorLoadingReplaced:
      !inspectorHtml.includes('جارٍ تحميل حالة المنظومة')
  };
  const failedChecks = Object.entries(checks)
    .filter(([, passed]) => passed !== true)
    .map(([id]) => id);
  const report = {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_VSCODE_LIVE_EXTENSION_HOST_SMOKE_V1',
    status: failedChecks.length === 0
      ? 'LIVE_EXTENSION_HOST_SMOKE_PASSED'
      : 'LIVE_EXTENSION_HOST_SMOKE_FAILED',
    passed: failedChecks.length === 0,
    startedAt,
    finishedAt: new Date().toISOString(),
    vscodeVersion: vscode.version,
    extensionId: context.extension.id,
    extensionVersion: context.extension.packageJSON.version,
    extensionMode: String(context.extensionMode),
    platform: process.platform,
    architecture: process.arch,
    runtimeBaseUrl: options.baseUrl,
    checks,
    failedChecks,
    observations: {
      postedMessageCount: chat.messages.length,
      streamTokenCount: chat.messages.filter((entry) =>
        entry.command === 'streamToken'
      ).length,
      declaredChatToolCount: CHAT_TOOL_COMMAND_IDS.length,
      availableChatToolCount:
        toolAvailability?.available?.length || 0,
      finalCommand: finalMessage?.command || null,
      finalTextBytes: Buffer.byteLength(finalText),
      finalRoute: finalMessage?.meta?.route || null,
      inspectorHtmlBytes: Buffer.byteLength(inspectorHtml)
    },
    boundaries: {
      shellExecuted: false,
      arbitraryFilesystemAccessGranted: false,
      externalNetworkRequired: false,
      highImpactActionExecuted: false,
      automatedReligiousRulingIssued: false,
      evidenceWriteRestrictedToWorkspace: true
    }
  };
  writeJsonAtomic(target, report);
  return report;
}

module.exports = {
  createWebviewHarness,
  finalChatMessage,
  resolveEvidenceTarget,
  runLiveExtensionSmoke,
  writeJsonAtomic
};
