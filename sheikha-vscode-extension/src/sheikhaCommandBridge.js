'use strict';

const {
  getJson,
  postJson
} = require('./sheikhaExtensionChatClient');

const TOKEN_SECRET_KEY = 'sheikha.auth.token';
const USER_SECRET_KEY = 'sheikha.auth.user';

const BRIDGE_COMMAND_IDS = Object.freeze([
  'sheikha.triggerCompletion',
  'sheikha.startAgent',
  'sheikha.inlineChat',
  'sheikha.showStatus',
  'sheikha.nextEditSuggestion',
  'sheikha.enableNES',
  'sheikha.signIn',
  'sheikha.signOut',
  'sheikha.manageAccount',
  'sheikha.syncIntegrations',
  'sheikha.openIntegrationsDashboard',
  'sheikha.openWorkspaceControl',
  'sheikha.gitStatus',
  'sheikha.openPullRequest',
  'sheikha.openMergeRequest',
  'sheikha.activateNeuralEngine',
  'sheikha.refactorCode',
  'sheikha.explainCode',
  'sheikha.generateTests',
  'sheikha.reviewCode',
  'sheikha.optimizePerformance',
  'sheikha.checkSharia',
  'sheikha.neuralNetwork',
  'sheikha.validateRootNeuralIntegration',
  'sheikha.ask',
  'sheikha.agent.run',
  'sheikha.cli.status',
  'sheikha.cli.health',
  'sheikha.debugger.run',
  'sheikha.debugger.logs',
  'sheikha.runtime.restart'
]);

const CHAT_ACTIONS = Object.freeze({
  'sheikha.refactorCode': 'أعد هيكلة الكود التالي مع الحفاظ على السلوك، واشرح التغييرات واختبرها:',
  'sheikha.explainCode': 'اشرح الكود التالي بالعربية بوضوح، وبيّن المدخلات والمخرجات والمخاطر:',
  'sheikha.generateTests': 'أنشئ اختبارات مناسبة للكود التالي وفق إطار الاختبار الموجود في المشروع:',
  'sheikha.reviewCode': 'راجع الكود التالي بحثًا عن الأخطاء والمخاطر والانحدارات والاختبارات الناقصة:',
  'sheikha.optimizePerformance': 'حلل أداء الكود التالي واقترح تحسينات مقيسة دون تغيير السلوك:',
  'sheikha.checkSharia': 'راجع هذا السياق وفق سياسات المشروع القيمية. لا تصدر فتوى آلية، وبيّن ما يحتاج مراجعة مختص مؤهل:'
});

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function selectedEditorContext(vscode, limit = 12000) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return { text: '', language: 'plaintext', file: '' };
  const selected = editor.document.getText(editor.selection);
  const text = selected || editor.document.getText();
  return {
    text: String(text || '').slice(0, limit),
    language: editor.document.languageId || 'plaintext',
    file: editor.document.uri?.fsPath || ''
  };
}

function compactExtensionSnapshot(vscode) {
  return (vscode.extensions?.all || []).map((extension) => ({
    id: extension.id,
    version: extension.packageJSON?.version || null,
    active: extension.isActive === true,
    builtin: extension.packageJSON?.isBuiltin === true
  }));
}

function extractAccount(data = {}) {
  const payload = data.data && typeof data.data === 'object' ? data.data : data;
  return {
    token: payload.token || payload.accessToken || payload.jwt || null,
    user: payload.user || payload.profile || null
  };
}

async function focusView(vscode, containerId, viewId) {
  await vscode.commands.executeCommand(`workbench.view.extension.${containerId}`);
  await delay(80);
  try {
    await vscode.commands.executeCommand(`${viewId}.focus`);
  } catch {}
}

function registerSheikhaCommandBridge(context, options = {}) {
  const vscode = require('vscode');
  const chatProvider = options.chatProvider;
  const getBaseUrl = typeof options.getBaseUrl === 'function'
    ? options.getBaseUrl
    : () => 'http://127.0.0.1:8080';
  const openChat = typeof options.openChat === 'function'
    ? options.openChat
    : () => focusView(vscode, 'sheikha', 'sheikha.chatView');

  function register(command, handler) {
    context.subscriptions.push(vscode.commands.registerCommand(command, async (...args) => {
      try {
        return await handler(...args);
      } catch (error) {
        vscode.window.showErrorMessage(`Sheikha ${command}: ${error.message || error}`);
        return undefined;
      }
    }));
  }

  async function sendToChat(prompt) {
    if (!chatProvider) {
      vscode.window.showErrorMessage('تعذر تفعيل مزود شات شيخة. شغّل فحص الإضافة ثم أعد المحاولة.');
      return;
    }
    await openChat();
    await delay(100);
    chatProvider.prefill(String(prompt || ''), true);
  }

  async function openStatus(title, endpoint) {
    const data = await getJson(endpoint, getBaseUrl(), 15000);
    const document = await vscode.workspace.openTextDocument({
      content: JSON.stringify({ title, endpoint, data }, null, 2),
      language: 'json'
    });
    await vscode.window.showTextDocument(document, { preview: true });
    return data;
  }

  register('sheikha.triggerCompletion', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      await vscode.commands.executeCommand('editor.action.inlineSuggest.trigger');
      return;
    }
    const position = editor.selection.active;
    const response = await postJson('/api/sheikha/copilot/completions', {
      code: editor.document.getText().slice(0, 50000),
      language: editor.document.languageId,
      cursor: position.character,
      maxSuggestions: 3
    }, getBaseUrl());
    const completions = response.data?.completions || response.completions || [];
    if (!completions.length) {
      await vscode.commands.executeCommand('editor.action.inlineSuggest.trigger');
      return;
    }
    const selected = await vscode.window.showQuickPick(
      completions.map((item, index) => ({
        label: item.label || `اقتراح ${index + 1}`,
        description: String(item.text || '').slice(0, 160),
        completion: item
      })),
      { placeHolder: 'اختر اقتراح شيخة' }
    );
    if (selected?.completion?.text) {
      await editor.edit((builder) => builder.insert(position, selected.completion.text));
    }
  });

  register('sheikha.nextEditSuggestion', async () => {
    await vscode.commands.executeCommand('editor.action.inlineSuggest.trigger');
  });

  register('sheikha.enableNES', async () => {
    const configuration = vscode.workspace.getConfiguration('sheikha');
    const enabled = configuration.get('enableNES', true);
    const target = vscode.workspace.workspaceFolders?.length
      ? vscode.ConfigurationTarget.Workspace
      : vscode.ConfigurationTarget.Global;
    await configuration.update('enableNES', !enabled, target);
    vscode.window.showInformationMessage(`Sheikha NES: ${!enabled ? 'مفعّل' : 'متوقف'}`);
  });

  register('sheikha.startAgent', async () => {
    const task = await vscode.window.showInputBox({ prompt: 'صف المهمة المحكومة لوكيل شيخة' });
    if (task) await sendToChat(`وضع الوكيل المحكوم:\n${task}`);
  });

  register('sheikha.agent.run', async () => {
    const task = await vscode.window.showInputBox({ prompt: 'ما المهمة التي تريد تشغيلها؟' });
    if (task) await sendToChat(`نفّذ كمهمة وكيل مع خطة واختبارات وحدود أمان:\n${task}`);
  });

  register('sheikha.inlineChat', async () => {
    const editorContext = selectedEditorContext(vscode);
    const instruction = await vscode.window.showInputBox({ prompt: 'ما المطلوب في السياق المحدد؟' });
    if (!instruction) return;
    await sendToChat(`${instruction}\n\nاللغة: ${editorContext.language}\nالملف: ${editorContext.file}\n\n${editorContext.text}`);
  });

  for (const [command, instruction] of Object.entries(CHAT_ACTIONS)) {
    register(command, async () => {
      const editorContext = selectedEditorContext(vscode);
      if (!editorContext.text) {
        vscode.window.showWarningMessage('افتح ملفًا أو حدد كودًا أولًا.');
        return;
      }
      await sendToChat(`${instruction}\n\nاللغة: ${editorContext.language}\nالملف: ${editorContext.file}\n\n${editorContext.text}`);
    });
  }

  register('sheikha.ask', async () => {
    const question = await vscode.window.showInputBox({ prompt: 'اسأل شيخة' });
    if (question) await sendToChat(question);
  });

  register('sheikha.showStatus', () => openStatus(
    'Sheikha Enterprise Inspector',
    '/api/sheikha/enterprise-inspector/v3/context'
  ));
  register('sheikha.cli.status', () => openStatus('Sheikha Status', '/api/sheikha/status'));
  register('sheikha.cli.health', () => openStatus('Sheikha Health', '/api/health'));
  register('sheikha.debugger.run', () => openStatus(
    'Sheikha Debugging Apex',
    '/api/sheikha/debugging-apex/v1/status'
  ));
  register('sheikha.neuralNetwork', () => openStatus(
    'Sheikha Root Neural Fabric',
    '/api/sheikha/supreme-root-neural-fabric/status'
  ));

  register('sheikha.activateNeuralEngine', async () => {
    const confirmation = await vscode.window.showWarningMessage(
      'تفعيل محرك الشبكة العصبية الجذرية في Runtime المحلي؟',
      { modal: true },
      'تفعيل المحرك'
    );
    if (confirmation !== 'تفعيل المحرك') return;
    const data = await postJson(
      '/api/sheikha/supreme-root-neural-fabric/activate',
      { actor: 'vscode-extension', reason: 'explicit-user-command' },
      getBaseUrl()
    );
    vscode.window.showInformationMessage(`Sheikha Neural: ${data.status || data.decision || 'تم الطلب'}`);
  });

  register('sheikha.validateRootNeuralIntegration', async () => {
    const data = await postJson(
      '/api/sheikha/supreme-root-neural-fabric/validate',
      { actor: 'vscode-extension', readOnly: true },
      getBaseUrl()
    );
    const document = await vscode.workspace.openTextDocument({
      content: JSON.stringify(data, null, 2),
      language: 'json'
    });
    await vscode.window.showTextDocument(document, { preview: true });
  });

  register('sheikha.openWorkspaceControl', () => focusView(
    vscode,
    'sheikha-inspector',
    'sheikha.inspectorView'
  ));
  register('sheikha.openIntegrationsDashboard', () => focusView(
    vscode,
    'sheikha-inspector',
    'sheikha.inspectorView'
  ));
  register('sheikha.gitStatus', () => vscode.commands.executeCommand('workbench.view.scm'));

  async function executeOptionalExternal(commands, unavailableMessage) {
    const available = new Set(await vscode.commands.getCommands(true));
    const command = commands.find((candidate) => available.has(candidate));
    if (command) return vscode.commands.executeCommand(command);
    vscode.window.showInformationMessage(unavailableMessage);
    return undefined;
  }

  register('sheikha.openPullRequest', () => executeOptionalExternal(
    ['githubPullRequests.createPullRequest', 'pr.create'],
    'تكامل GitHub اختياري وغير مطلوب لتشغيل شيخة. استخدم السجل المحلي أو ثبّت مزود PR عند الحاجة.'
  ));
  register('sheikha.openMergeRequest', () => executeOptionalExternal(
    ['gl.createMergeRequest', 'gitlab.createMergeRequest'],
    'تكامل GitLab اختياري وغير مطلوب لتشغيل شيخة. استخدم السجل المحلي أو ثبّت مزود MR عند الحاجة.'
  ));

  register('sheikha.signIn', async () => {
    const email = await vscode.window.showInputBox({ prompt: 'البريد الإلكتروني لحساب شيخة' });
    if (!email) return;
    const password = await vscode.window.showInputBox({ prompt: 'كلمة المرور', password: true });
    if (!password) return;
    const response = await postJson('/api/auth/login', { email, password }, getBaseUrl());
    const account = extractAccount(response);
    if (!account.token) throw new Error(response.message || 'لم يُرجع الخادم رمز دخول صالحًا');
    await context.secrets.store(TOKEN_SECRET_KEY, account.token);
    await context.secrets.store(USER_SECRET_KEY, JSON.stringify(account.user || { email }));
    vscode.window.showInformationMessage('تم تسجيل الدخول إلى حساب شيخة المحلي.');
  });

  register('sheikha.signOut', async () => {
    await context.secrets.delete(TOKEN_SECRET_KEY);
    await context.secrets.delete(USER_SECRET_KEY);
    vscode.window.showInformationMessage('تم تسجيل الخروج محليًا من شيخة.');
  });

  register('sheikha.manageAccount', async () => {
    const raw = await context.secrets.get(USER_SECRET_KEY);
    const user = raw ? JSON.parse(raw) : null;
    vscode.window.showInformationMessage(user
      ? `حساب شيخة المحلي: ${user.email || user.name || 'مسجل'}`
      : 'لا يوجد حساب محلي مسجل.');
  });

  register('sheikha.syncIntegrations', async () => {
    const extensions = compactExtensionSnapshot(vscode);
    const response = await postJson('/api/sheikha/copilot/extensions-sync', {
      extensions,
      reason: 'explicit-user-command',
      machineName: require('node:os').hostname(),
      workspaceName: vscode.workspace.name || 'Sheikha Workspace'
    }, getBaseUrl());
    vscode.window.showInformationMessage(
      `تمت مزامنة ${response.data?.totalExtensions || extensions.length} إضافة مع الخادم المحلي.`
    );
  });

  register('sheikha.debugger.logs', () => {
    const terminal = vscode.window.createTerminal({ name: 'Sheikha Runtime Logs' });
    terminal.show();
    terminal.sendText('pm2 logs sheikha-main-portal --lines 120');
  });

  register('sheikha.runtime.restart', async () => {
    const confirmation = await vscode.window.showWarningMessage(
      'إعادة تشغيل sheikha-main-portal محليًا؟',
      { modal: true },
      'إعادة التشغيل'
    );
    if (confirmation !== 'إعادة التشغيل') return;
    const terminal = vscode.window.createTerminal({ name: 'Sheikha Runtime' });
    terminal.show();
    terminal.sendText('pm2 restart sheikha-main-portal --update-env');
  });

  return BRIDGE_COMMAND_IDS;
}

module.exports = {
  BRIDGE_COMMAND_IDS,
  CHAT_ACTIONS,
  compactExtensionSnapshot,
  extractAccount,
  registerSheikhaCommandBridge,
  selectedEditorContext
};
