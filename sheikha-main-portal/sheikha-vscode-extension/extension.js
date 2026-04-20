// Sheikha Copilot Extension for VS Code
// نظام مساعد البرمجة الذكي — قائم على مبادئ الكتاب والسنة

const vscode = require('vscode');
const fetch = require('node-fetch');
const os = require('os');

let extensionContext;
let copilotPanel;
const SERVER_URL = 'http://localhost:8080';
const TOKEN_SECRET_KEY = 'sheikha.auth.token';
const USER_SECRET_KEY = 'sheikha.auth.user';
const EXTENSIONS_SYNC_KEY = 'sheikha.integrations.extensions.snapshot';

class SheikhaAuthManager {
    constructor(context, provider) {
        this.context = context;
        this.provider = provider;
        this.token = null;
        this.user = null;
    }

    async initialize() {
        this.token = await this.context.secrets.get(TOKEN_SECRET_KEY);
        const userRaw = await this.context.secrets.get(USER_SECRET_KEY);
        this.user = userRaw ? safeJsonParse(userRaw) : null;
    }

    async getAuthHeaders() {
        if (!this.token) {
            return {};
        }
        return { Authorization: `Bearer ${this.token}` };
    }

    isSignedIn() {
        return Boolean(this.token);
    }

    async signIn(email, password) {
        let response;
        try {
            response = await fetch(`${this.provider.config.serverUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
        } catch (error) {
            const message = String(error && error.message ? error.message : error);
            if (message.includes('ECONNREFUSED')) {
                throw new Error('الخادم المحلي لشيخة غير شغال على المنفذ 8080. شغّل السيرفر ثم أعد المحاولة.');
            }
            throw new Error(`تعذر الاتصال بخادم شيخة: ${message}`);
        }

        const data = await response.json();
        const { token, user } = extractTokenAndUser(data);

        if (!response.ok || !data.success || !token) {
            throw new Error(data.message || 'فشل تسجيل الدخول');
        }

        this.token = token;
        this.user = user || decodeUserFromToken(token) || { email };

        await this.context.secrets.store(TOKEN_SECRET_KEY, this.token);
        await this.context.secrets.store(USER_SECRET_KEY, JSON.stringify(this.user));
        return this.user;
    }

    async signOut() {
        try {
            if (this.token) {
                await fetch(`${this.provider.config.serverUrl}/api/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${this.token}`
                    }
                });
            }
        } catch (_) {
            // تجاهل فشل الشبكة عند الخروج المحلي
        }

        this.token = null;
        this.user = null;
        await this.context.secrets.delete(TOKEN_SECRET_KEY);
        await this.context.secrets.delete(USER_SECRET_KEY);
    }

    async fetchCurrentUser() {
        if (!this.token) {
            return null;
        }

        try {
            const response = await fetch(`${this.provider.config.serverUrl}/api/auth/me`, {
                headers: { Authorization: `Bearer ${this.token}` }
            });

            if (response.ok) {
                const data = await response.json();
                const resolvedUser = data.user || (data.data && (data.data.user || data.data)) || null;
                if (data.success && resolvedUser) {
                    this.user = resolvedUser;
                    await this.context.secrets.store(USER_SECRET_KEY, JSON.stringify(this.user));
                    return this.user;
                }
            }
        } catch (_) {
            // تجاهل فشل الشبكة واستخدم fallback المحلي
        }

        // fallback: بعض بيئات شيخة لا توفر /api/auth/me
        const tokenUser = decodeUserFromToken(this.token);
        if (!tokenUser) {
            return null;
        }

        this.user = tokenUser;
        await this.context.secrets.store(USER_SECRET_KEY, JSON.stringify(this.user));
        return this.user;
    }
}

class SheikhaCopilotProvider {
    constructor(context) {
        this.config = {};
        this.shariaGuardrails = true;
        this.context = context;
        this.authManager = new SheikhaAuthManager(context, this);
        this.loadConfig();
    }

    loadConfig() {
        const wsConfig = vscode.workspace.getConfiguration('sheikha.copilot');
        this.config = {
            serverUrl: wsConfig.get('serverUrl') || SERVER_URL,
            enableInlineCompletions: wsConfig.get('enableInlineCompletions', true),
            enableChat: wsConfig.get('enableChat', true),
            enableAgentMode: wsConfig.get('enableAgentMode', true),
            enableNES: wsConfig.get('enableNES', true),
            shariaGuardrails: wsConfig.get('shariaGuardrails', true),
            defaultModel: wsConfig.get('defaultModel', 'sheikha-copilot-base'),
            completionDelay: wsConfig.get('completionDelay', 150),
            maxCompletions: wsConfig.get('maxCompletions', 3),
            arabicComments: wsConfig.get('arabicComments', true),
            autoStartBackend: wsConfig.get('autoStartBackend', true),
            backendStartupRetries: wsConfig.get('backendStartupRetries', 8),
            dashboardRefreshSeconds: wsConfig.get('dashboardRefreshSeconds', 60)
        };
    }

    async initializeAuth() {
        await this.authManager.initialize();
    }

    async getCompletions(code, language, cursorPos, context) {
        try {
            const authHeaders = await this.authManager.getAuthHeaders();
            const response = await fetch(`${this.config.serverUrl}/api/sheikha/copilot/completions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders },
                body: JSON.stringify({
                    code,
                    language,
                    cursor: cursorPos,
                    context,
                    maxSuggestions: this.config.maxCompletions,
                    model: this.config.defaultModel
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return data.data.completions || [];
        } catch (err) {
            console.error('[Sheikha Copilot] خطأ في الحصول على الاقتراحات:', err.message);
            return [];
        }
    }

    async chat(message, codeContext, language, history) {
        try {
            const authHeaders = await this.authManager.getAuthHeaders();
            const response = await fetch(`${this.config.serverUrl}/api/sheikha/copilot/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders },
                body: JSON.stringify({
                    message,
                    codeContext,
                    language,
                    history: history || [],
                    model: this.config.defaultModel
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return data.data;
        } catch (err) {
            return { reply: `خطأ: ${err.message}`, codeSnippet: null };
        }
    }

    async startAgent(task, files, language) {
        try {
            const authHeaders = await this.authManager.getAuthHeaders();
            const response = await fetch(`${this.config.serverUrl}/api/sheikha/copilot/agent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders },
                body: JSON.stringify({
                    task,
                    files: files || [],
                    language: language || 'auto',
                    autoFix: true,
                    model: this.config.defaultModel
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return data.data;
        } catch (err) {
            vscode.window.showErrorMessage(`Sheikha Agent Error: ${err.message}`);
            return null;
        }
    }

    async getStatus() {
        try {
            const authHeaders = await this.authManager.getAuthHeaders();
            const response = await fetch(`${this.config.serverUrl}/api/sheikha/copilot/status`, {
                headers: authHeaders
            });
            const data = await response.json();
            return data.data;
        } catch (err) {
            return null;
        }
    }

    async syncExtensionsState(extensions, reason) {
        const authHeaders = await this.authManager.getAuthHeaders();
        const response = await fetch(`${this.config.serverUrl}/api/sheikha/copilot/extensions-sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
            body: JSON.stringify({
                extensions,
                reason,
                machineName: os.hostname(),
                workspaceName: vscode.workspace.name || 'Sheikha Workspace'
            })
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
            throw new Error(data.message || 'فشل مزامنة الإضافات مع الخادم');
        }
        return data.data;
    }

    async getExtensionsLiveData() {
        const authHeaders = await this.authManager.getAuthHeaders();
        const response = await fetch(`${this.config.serverUrl}/api/sheikha/copilot/extensions-live`, {
            headers: authHeaders
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
            throw new Error(data.message || 'تعذر تحميل لوحة التكاملات');
        }
        return data.data;
    }
}

class SheikhaIntegrationsDashboardProvider {
    constructor(context, getState, onRefreshRequest) {
        this.context = context;
        this.getState = getState;
        this.onRefreshRequest = onRefreshRequest;
        this.view = null;
    }

    resolveWebviewView(webviewView) {
        this.view = webviewView;
        webviewView.webview.options = { enableScripts: true };
        webviewView.webview.html = getIntegrationsDashboardHtml();
        webviewView.webview.onDidReceiveMessage(async message => {
            if (message.command === 'refresh') {
                await this.onRefreshRequest('manual');
            }
        });
        this.refresh();
    }

    refresh() {
        if (!this.view) {
            return;
        }
        this.view.webview.postMessage({ command: 'state', data: this.getState() });
    }
}

class SheikhaChatSidebarProvider {
    constructor(provider) {
        this.provider = provider;
        this.view = null;
    }

    resolveWebviewView(webviewView) {
        this.view = webviewView;
        webviewView.webview.options = { enableScripts: true };
        webviewView.webview.html = getSidebarChatHtml();

        webviewView.webview.onDidReceiveMessage(async message => {
            if (message.command !== 'chat') {
                return;
            }

            const editor = vscode.window.activeTextEditor;
            const codeContext = editor ? editor.document.getText() : '';
            const language = editor ? editor.document.languageId : 'auto';

            const responseData = await this.provider.chat(message.message, codeContext, language, []);
            webviewView.webview.postMessage({ command: 'response', data: responseData });
        });
    }
}

async function activate(context) {
    extensionContext = context;
    const provider = new SheikhaCopilotProvider(context);
    await provider.initializeAuth();

    const accountStatusItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    accountStatusItem.command = 'sheikha.manageAccount';

    let isSyncingIntegrations = false;
    let isStartingBackend = false;
    let lastSyncSummary = null;
    let lastBackendSummary = 'غير متحقق بعد';
    let dashboardState = {
        backend: { status: 'unknown', detail: 'لم يتم التحقق بعد' },
        sync: { summary: 'غير متزامن بعد' },
        account: { signedIn: false, user: null },
        extensions: [],
        summary: { total: 0, enabled: 0, thirdParty: 0, publishers: [] },
        ecosystem: [],
        governance: {
            principle: 'لا حدود إلا حدود الله',
            basis: 'الكتاب والسنة',
            controls: ['no-harm', 'privacy-by-default', 'human-governed-automation']
        }
    };

    const dashboardProvider = new SheikhaIntegrationsDashboardProvider(
        context,
        () => dashboardState,
        async reason => {
            await syncExtensionsIntegrations(reason);
        }
    );

    const chatSidebarProvider = new SheikhaChatSidebarProvider(provider);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('sheikha.statusView', dashboardProvider),
        vscode.window.registerWebviewViewProvider('sheikha.chatView', chatSidebarProvider)
    );

    const updateAccountStatus = () => {
        const user = provider.authManager.user;
        const syncIcon = isSyncingIntegrations ? ' $(sync~spin)' : (lastSyncSummary ? ' $(sync)' : '');
        const backendIcon = isStartingBackend ? ' $(loading~spin)' : ' $(server-process)';
        if (provider.authManager.isSignedIn() && user) {
            const name = user.name || user.email || 'Sheikha User';
            accountStatusItem.text = `$(account) شيخة: ${name}${syncIcon}${backendIcon}`;
            accountStatusItem.tooltip = lastSyncSummary
                ? `إدارة حساب شيخة\nتزامن الإضافات: ${lastSyncSummary}\nالخادم: ${lastBackendSummary}`
                : `إدارة حساب شيخة\nالخادم: ${lastBackendSummary}`;
        } else {
            accountStatusItem.text = `$(account) شيخة: تسجيل الدخول${syncIcon}${backendIcon}`;
            accountStatusItem.tooltip = lastSyncSummary
                ? `تسجيل الدخول إلى حساب شيخة\nتزامن الإضافات: ${lastSyncSummary}\nالخادم: ${lastBackendSummary}`
                : `تسجيل الدخول إلى حساب شيخة\nالخادم: ${lastBackendSummary}`;
        }
        accountStatusItem.show();
        dashboardState.account = {
            signedIn: provider.authManager.isSignedIn(),
            user: user || null
        };
        dashboardState.sync = { summary: lastSyncSummary || 'غير متزامن بعد' };
        dashboardState.backend = {
            status: isStartingBackend ? 'starting' : (String(lastBackendSummary).includes('active') ? 'active' : 'unknown'),
            detail: lastBackendSummary
        };
        dashboardProvider.refresh();
    };

    const checkBackendReachable = async () => {
        try {
            const status = await provider.getStatus();
            return Boolean(status && status.status === 'active');
        } catch (_) {
            return false;
        }
    };

    const tryStartBackendTask = async () => {
        const tasks = await vscode.tasks.fetchTasks();
        const knownStartTaskNames = new Set([
            'Sheikha: Start Dev (No Cursor)',
            'Sheikha: Full Dev Power (No Cursor)',
            '🟢 Start Dev (No Cursor)',
            '🚀 شيخة — تشغيل الخادم (dev)',
            '🚀 Start Development Server'
        ]);
        const target = tasks.find(task => knownStartTaskNames.has(task.name));

        if (!target) {
            return false;
        }

        await vscode.tasks.executeTask(target);
        return true;
    };

    const ensureBackendReady = async reason => {
        const alreadyReady = await checkBackendReachable();
        if (alreadyReady) {
            lastBackendSummary = 'active';
            updateAccountStatus();
            return true;
        }

        if (!provider.config.autoStartBackend) {
            lastBackendSummary = 'الخادم غير شغال والتشغيل التلقائي معطل';
            updateAccountStatus();
            return false;
        }

        isStartingBackend = true;
        lastBackendSummary = `محاولة تشغيل الخادم (${reason})`;
        updateAccountStatus();

        try {
            const started = await tryStartBackendTask();
            if (!started) {
                lastBackendSummary = 'تعذر العثور على مهمة تشغيل الخادم داخل VS Code';
                return false;
            }

            for (let attempt = 1; attempt <= provider.config.backendStartupRetries; attempt += 1) {
                await sleep(3000);
                const ok = await checkBackendReachable();
                if (ok) {
                    lastBackendSummary = `active بعد ${attempt} محاولة`;
                    return true;
                }
                lastBackendSummary = `انتظار الخادم... المحاولة ${attempt}/${provider.config.backendStartupRetries}`;
                updateAccountStatus();
            }

            lastBackendSummary = 'لم يجهز الخادم بعد المحاولات التلقائية';
            return false;
        } finally {
            isStartingBackend = false;
            updateAccountStatus();
        }
    };

    const syncExtensionsIntegrations = async (reason) => {
        isSyncingIntegrations = true;
        updateAccountStatus();

        try {
            const all = buildExtensionSnapshot(vscode.extensions.all);
            const allIds = all.map(ext => ext.id);

            const previous = context.globalState.get(EXTENSIONS_SYNC_KEY, []);
            const previousSet = new Set(previous);
            const allSet = new Set(allIds);

            const added = allIds.filter(id => !previousSet.has(id));
            const removed = previous.filter(id => !allSet.has(id));

            await context.globalState.update(EXTENSIONS_SYNC_KEY, allIds);

            const backendReady = await ensureBackendReady(`extensions-sync:${reason}`);
            if (backendReady) {
                const persisted = await provider.syncExtensionsState(all, reason);
                const snapshot = persisted.lastSnapshot || {};
                lastSyncSummary = `+${(snapshot.added || []).length} / -${(snapshot.removed || []).length} / الإجمالي ${snapshot.totalExtensions || all.length}`;
                const liveData = await provider.getExtensionsLiveData();
                const ecosystem = await loadEcosystemSignals(provider.config.serverUrl, await provider.authManager.getAuthHeaders());
                dashboardState = {
                    ...dashboardState,
                    ...liveData,
                    sync: { summary: lastSyncSummary },
                    ecosystem,
                    account: {
                        signedIn: provider.authManager.isSignedIn(),
                        user: provider.authManager.user || null
                    },
                    backend: { status: 'active', detail: lastBackendSummary }
                };
            } else {
                lastSyncSummary = `+${added.length} / -${removed.length} / الإجمالي ${all.length}`;
                dashboardState = {
                    ...dashboardState,
                    extensions: all,
                    summary: {
                        total: all.length,
                        enabled: all.filter(item => item.enabled).length,
                        thirdParty: all.filter(item => !item.isBuiltin).length,
                        publishers: Array.from(new Set(all.map(item => item.publisher).filter(Boolean))).sort()
                    }
                };
            }

            if (reason === 'manual') {
                vscode.window.showInformationMessage(`Sheikha Sync: ${lastSyncSummary}`);
            } else if (added.length > 0) {
                vscode.window.showInformationMessage(`Sheikha Sync: تم اكتشاف ${added.length} إضافة جديدة وتمت مزامنتها`);
            }
        } catch (error) {
            if (reason === 'manual') {
                vscode.window.showErrorMessage(`فشل مزامنة الإضافات: ${error.message}`);
            }
        } finally {
            isSyncingIntegrations = false;
            updateAccountStatus();
        }
    };

    updateAccountStatus();

    // ── أمر: فتح المحادثة ──
    const chatCommand = vscode.commands.registerCommand('sheikha.openChat', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('Sheikha: يرجى فتح ملف أولاً');
            return;
        }

        if (!copilotPanel) {
            copilotPanel = vscode.window.createWebviewPanel(
                'sheikha-chat',
                'Sheikha Copilot Chat',
                vscode.ViewColumn.Beside,
                { enableScripts: true }
            );
            copilotPanel.webview.html = getChatHtml();
            copilotPanel.onDidDispose(() => { copilotPanel = null; });

            copilotPanel.webview.onDidReceiveMessage(async (msg) => {
                if (msg.command === 'chat') {
                    const langId = editor.document.languageId;
                    const responseData = await provider.chat(msg.message, editor.document.getText(), langId, []);
                    copilotPanel.webview.postMessage({ command: 'response', data: responseData });
                }
            });
        } else {
            copilotPanel.reveal(vscode.ViewColumn.Beside);
        }
    });

    // ── أمر: اقتراح الكود ──
    const completionCommand = vscode.commands.registerCommand('sheikha.triggerCompletion', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const position = editor.selection.active;
        const lineStart = new vscode.Position(position.line, 0);
        const line = editor.document.getText(new vscode.Range(lineStart, position));
        const completions = await provider.getCompletions(editor.document.getText(), editor.document.languageId, position.character, line);

        if (completions.length === 0) {
            vscode.window.showInformationMessage('Sheikha: لا توجد اقتراحات متاحة');
            return;
        }

        const items = completions.map(c => ({ label: c.label, description: c.text }));
        const selected = await vscode.window.showQuickPick(items, { placeHolder: 'اختر الاقتراح' });

        if (selected) {
            const match = completions.find(c => c.label === selected.label);
            editor.edit(edit => {
                edit.insert(position, match.text);
            });
        }
    });

    // ── أمر: وضع الوكيل ──
    const agentCommand = vscode.commands.registerCommand('sheikha.startAgent', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('Sheikha: يرجى فتح ملف أولاً');
            return;
        }

        const task = await vscode.window.showInputBox({ prompt: 'صف المهمة التي تريد من Sheikha Agent تنفيذها:' });
        if (!task) return;

        vscode.window.withProgress(
            { location: vscode.ProgressLocation.Notification, title: 'Sheikha Agent يعمل...' },
            async () => {
                const result = await provider.startAgent(task, [editor.document.uri.fsPath], editor.document.languageId);
                if (result) {
                    vscode.window.showInformationMessage(`Sheikha Agent: المهمة في معالجة — ${result.steps.length} خطوة`);
                }
            }
        );
    });

    // ── أمر: محادثة مضمّنة ──
    const inlineChatCommand = vscode.commands.registerCommand('sheikha.inlineChat', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || !editor.selection) {
            vscode.window.showWarningMessage('Sheikha: يرجى تحديد نص أولاً');
            return;
        }

        const selectedCode = editor.document.getText(editor.selection);
        const instruction = await vscode.window.showInputBox({
            prompt: 'أرسل تعليمات للمحادثة المضمّنة (مثل: refactor, explain, add error handling)',
            value: ''
        });

        if (!instruction) return;

        try {
            const authHeaders = await provider.authManager.getAuthHeaders();
            const response = await fetch(`${provider.config.serverUrl}/api/sheikha/copilot/inline-chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders },
                body: JSON.stringify({
                    prompt: instruction,
                    selectedCode,
                    language: editor.document.languageId,
                    instruction
                })
            });
            const data = await response.json();
            if (data.data.modifiedCode && instruction.toLowerCase().includes('refactor')) {
                editor.edit(edit => {
                    edit.replace(editor.selection, data.data.modifiedCode);
                });
                vscode.window.showInformationMessage('Sheikha: تم تطبيق التعديل');
            } else {
                vscode.window.showInformationMessage(`Sheikha: ${data.data.explanation}`);
            }
        } catch (err) {
            vscode.window.showErrorMessage(`خطأ Sheikha: ${err.message}`);
        }
    });

    // ── أمر: حالة النظام ──
    const statusCommand = vscode.commands.registerCommand('sheikha.showStatus', async () => {
        const status = await provider.getStatus();
        if (status) {
            const languageCount = Array.isArray(status.supportedLanguages)
                ? status.supportedLanguages.length
                : (Array.isArray(status.languages) ? status.languages.length : 'غير محدد');
            vscode.window.showInformationMessage(`Sheikha Copilot v${status.version} — ${status.status} | ${languageCount} لغة | شريعة: ✅`);
        } else {
            vscode.window.showErrorMessage('Sheikha: لم يتمكن من الاتصال بالخادم');
        }
    });

    // ── أمر: اقتراح التعديل التالي ──
    const nesCommand = vscode.commands.registerCommand('sheikha.nextEditSuggestion', async () => {
        vscode.window.showInformationMessage('Sheikha NES: سيتم تفعيل اقتراحات التعديل التالي قريباً');
    });

    const signInCommand = vscode.commands.registerCommand('sheikha.signIn', async () => {
        const backendReady = await ensureBackendReady('signin');
        if (!backendReady) {
            vscode.window.showErrorMessage('الخادم المحلي لشيخة لم يجهز بعد. حاول بعد لحظات أو شغّل السيرفر يدويًا.');
            return;
        }

        const email = await vscode.window.showInputBox({
            prompt: 'أدخل البريد الإلكتروني لحساب شيخة',
            placeHolder: 'name@sheikha.top'
        });
        if (!email) return;

        const password = await vscode.window.showInputBox({
            prompt: 'أدخل كلمة المرور',
            password: true,
            ignoreFocusOut: true
        });
        if (!password) return;

        try {
            await provider.authManager.signIn(email, password);
            updateAccountStatus();
            vscode.window.showInformationMessage('تم تسجيل الدخول إلى حساب شيخة بنجاح');
        } catch (err) {
            vscode.window.showErrorMessage(`فشل تسجيل الدخول: ${err.message}`);
        }
    });

    const signOutCommand = vscode.commands.registerCommand('sheikha.signOut', async () => {
        await provider.authManager.signOut();
        updateAccountStatus();
        vscode.window.showInformationMessage('تم تسجيل الخروج من حساب شيخة');
    });

    const manageAccountCommand = vscode.commands.registerCommand('sheikha.manageAccount', async () => {
        const isSignedIn = provider.authManager.isSignedIn();
        if (!isSignedIn) {
            const choice = await vscode.window.showQuickPick(
                [{ label: 'تسجيل الدخول', action: 'signin' }],
                { placeHolder: 'حساب شيخة غير مسجل حاليًا' }
            );
            if (choice && choice.action === 'signin') {
                await vscode.commands.executeCommand('sheikha.signIn');
            }
            return;
        }

        const user = await provider.authManager.fetchCurrentUser() || provider.authManager.user;
        const role = user && user.role ? user.role : 'user';
        const plan = role === 'admin' ? 'enterprise' : 'free';

        const choice = await vscode.window.showQuickPick(
            [
                { label: `الحساب: ${user && (user.email || user.name) ? (user.email || user.name) : 'غير معروف'}`, action: 'noop' },
                { label: `الخطة الحالية: ${plan}`, action: 'noop' },
                { label: `حالة التزامن: ${lastSyncSummary || 'غير متزامن بعد'}`, action: 'noop' },
                { label: 'إدارة الخطة والاشتراك', action: 'billing' },
                { label: 'مزامنة إضافات VS Code الآن', action: 'sync' },
                { label: 'عرض الصلاحيات', action: 'permissions' },
                { label: 'تسجيل الخروج', action: 'signout' }
            ],
            { placeHolder: 'إدارة حساب شيخة' }
        );

        if (!choice) return;
        if (choice.action === 'signout') {
            await vscode.commands.executeCommand('sheikha.signOut');
            return;
        }
        if (choice.action === 'billing') {
            vscode.env.openExternal(vscode.Uri.parse('https://sheikha.top/account/billing'));
            return;
        }
        if (choice.action === 'sync') {
            await syncExtensionsIntegrations('manual');
            return;
        }
        if (choice.action === 'permissions') {
            vscode.window.showInformationMessage(`صلاحية المستخدم الحالية: ${role}`);
        }
    });

    const syncIntegrationsCommand = vscode.commands.registerCommand('sheikha.syncIntegrations', async () => {
        await syncExtensionsIntegrations('manual');
    });

    const openIntegrationsDashboardCommand = vscode.commands.registerCommand('sheikha.openIntegrationsDashboard', async () => {
        await vscode.commands.executeCommand('workbench.view.extension.sheikha-copilot');
    });

    await ensureBackendReady('startup');
    await syncExtensionsIntegrations('startup');

    const autoRefreshInterval = setInterval(async () => {
        try {
            await syncExtensionsIntegrations('auto');
        } catch (_) {
            // تجاهل فشل التحديث الدوري
        }
    }, Math.max(30, Number(provider.config.dashboardRefreshSeconds || 60)) * 1000);

    if (vscode.extensions && vscode.extensions.onDidChange) {
        context.subscriptions.push(vscode.extensions.onDidChange(async () => {
            await syncExtensionsIntegrations('extensions-changed');
        }));
    }

    context.subscriptions.push(
        chatCommand,
        completionCommand,
        agentCommand,
        inlineChatCommand,
        statusCommand,
        nesCommand,
        signInCommand,
        signOutCommand,
        manageAccountCommand,
        syncIntegrationsCommand,
        openIntegrationsDashboardCommand,
        { dispose: () => clearInterval(autoRefreshInterval) },
        accountStatusItem
    );

    console.log('✅ [Sheikha Copilot Extension] مفعّل — جاهز للبرمجة الذكية');
    vscode.window.showInformationMessage('Sheikha Copilot مفعّل! استخدم Ctrl+Shift+I لفتح المحادثة');
}

function getChatHtml() {
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sheikha Copilot Chat</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Tajawal', sans-serif; background: #1e1e1e; color: #fff; padding: 12px; }
        .chat-container { display: flex; flex-direction: column; height: 100vh; }
        .messages { flex: 1; overflow-y: auto; margin-bottom: 12px; padding: 8px; background: #252526; border-radius: 4px; }
        .message { margin: 8px 0; padding: 8px; border-radius: 4px; line-height: 1.5; }
        .assistant { background: #2d2d30; border-left: 3px solid #d4af37; }
        .user { background: #1e3a1a; border-left: 3px solid #4ec9b0; text-align: left; }
        input[type="text"] { width: 100%; padding: 8px; background: #3e3e42; color: #fff; border: 1px solid #555; border-radius: 4px; font-family: inherit; }
        button { padding: 8px 16px; background: #d4af37; color: #1e1e1e; border: none; border-radius: 4px; cursor: pointer; margin-right: 8px; font-weight: bold; }
        button:hover { background: #b87333; }
        .header { color: #d4af37; font-weight: bold; margin-bottom: 8px; }
    </style>
</head>
<body>
    <div class="chat-container">
        <div class="header">🤖 Sheikha Copilot Chat — مساعد البرمجة الذكي</div>
        <div class="messages" id="messages"></div>
        <div style="display: flex; gap: 8px;">
            <input type="text" id="input" placeholder="اكتب رسالتك...">
            <button onclick="sendMessage()">إرسال</button>
        </div>
    </div>
    <script>
        const vscode = acquireVsCodeApi();
        document.getElementById('input').addEventListener('keydown', e => e.key === 'Enter' && sendMessage());

        function sendMessage() {
            const input = document.getElementById('input');
            const msg = input.value.trim();
            if (!msg) return;

            const messagesDiv = document.getElementById('messages');
            messagesDiv.innerHTML += '<div class="message user">' + escapeHtml(msg) + '</div>';
            input.value = '';

            vscode.postMessage({ command: 'chat', message: msg });
        }

        window.addEventListener('message', event => {
            if (event.data.command === 'response') {
                const messagesDiv = document.getElementById('messages');
                const { reply, codeSnippet } = event.data.data;
                messagesDiv.innerHTML += '<div class="message assistant">' + escapeHtml(reply) + 
                    (codeSnippet ? '<pre style="background:#1e1e1e; padding: 8px; margin-top: 8px; border-radius: 4px; overflow-x: auto;">' + escapeHtml(codeSnippet) + '</pre>' : '') + 
                    '</div>';
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
            }
        });

        function escapeHtml(text) { return text.replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';'); }
    </script>
</body>
</html>`;
}

function deactivate() {
    console.log('Sheikha Copilot Extension deactivated');
}

module.exports = { activate, deactivate };

function safeJsonParse(value) {
    try {
        return JSON.parse(value);
    } catch (_) {
        return null;
    }
}

function extractTokenAndUser(data) {
    const payload = data && typeof data.data === 'object' ? data.data : data;
    if (!payload || typeof payload !== 'object') {
        return { token: null, user: null };
    }

    return {
        token: payload.token || payload.accessToken || payload.jwt || null,
        user: payload.user || payload.profile || null
    };
}

function decodeUserFromToken(token) {
    try {
        const parts = String(token).split('.');
        if (parts.length !== 3) {
            return null;
        }

        const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(Buffer.from(normalized, 'base64').toString('utf8'));

        return {
            id: payload.sub || payload.userId || payload.id || null,
            email: payload.email || null,
            name: payload.name || payload.username || null,
            role: payload.role || null
        };
    } catch (_) {
        return null;
    }
}

function buildExtensionSnapshot(extensions) {
    return extensions
        .filter(ext => !ext.packageJSON.isBuiltin)
        .map(ext => ({
            id: ext.id,
            displayName: ext.packageJSON.displayName || ext.packageJSON.name || ext.id,
            version: ext.packageJSON.version || 'unknown',
            enabled: true,
            isBuiltin: Boolean(ext.packageJSON.isBuiltin),
            publisher: ext.packageJSON.publisher || 'unknown'
        }))
        .sort((a, b) => a.id.localeCompare(b.id, 'en'));
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getIntegrationsDashboardHtml() {
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>لوحة تكاملات شيخة</title>
    <style>
        body { font-family: 'Tajawal', sans-serif; background: #111827; color: #f9fafb; margin: 0; padding: 12px; }
        .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .title { font-size: 16px; font-weight: 700; color: #fbbf24; }
        .badge { display: inline-block; padding: 4px 8px; border-radius: 999px; background: #1f2937; color: #93c5fd; font-size: 12px; }
        .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-bottom: 12px; }
        .card { background: #1f2937; border: 1px solid #374151; border-radius: 10px; padding: 10px; }
        .card strong { display: block; color: #f3f4f6; margin-bottom: 4px; }
        .muted { color: #9ca3af; font-size: 12px; }
        .controls { display: flex; gap: 8px; margin-bottom: 12px; }
        button { background: #fbbf24; color: #111827; border: none; border-radius: 8px; padding: 8px 12px; cursor: pointer; font-weight: 700; }
        button:hover { background: #f59e0b; }
        .list { display: flex; flex-direction: column; gap: 8px; }
        .item { background: #0f172a; border: 1px solid #1f2937; border-radius: 8px; padding: 10px; }
        .item-header { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .item-title { font-size: 13px; font-weight: 700; color: #f9fafb; }
        .item-meta { color: #9ca3af; font-size: 12px; margin-top: 4px; }
        .status-ok { color: #34d399; }
        .status-warn { color: #fbbf24; }
        .status-off { color: #f87171; }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">لوحة تكاملات شيخة</div>
        <span id="backendBadge" class="badge">الخادم: ...</span>
    </div>
    <div class="controls">
        <button onclick="refreshNow()">تحديث الآن</button>
    </div>
    <div class="grid">
        <div class="card"><strong id="totalCount">0</strong><span class="muted">إجمالي الإضافات</span></div>
        <div class="card"><strong id="enabledCount">0</strong><span class="muted">الإضافات المفعلة</span></div>
        <div class="card"><strong id="thirdPartyCount">0</strong><span class="muted">إضافات خارجية</span></div>
        <div class="card"><strong id="syncSummary">غير متزامن</strong><span class="muted">آخر ملخص مزامنة</span></div>
    </div>
    <div class="card" style="margin-bottom: 12px;">
        <strong>الحوكمة</strong>
        <div class="muted" id="governanceText">الكتاب والسنة</div>
    </div>
    <div class="card" style="margin-bottom: 12px;">
        <strong>تكاملات الإنتاج</strong>
        <div id="ecosystemList" class="muted">جاري التحميل...</div>
    </div>
    <div class="list" id="extensionsList"></div>

    <script>
        const vscode = acquireVsCodeApi();

        function refreshNow() {
            vscode.postMessage({ command: 'refresh' });
        }

        function renderState(state) {
            const summary = state.summary || {};
            document.getElementById('totalCount').textContent = summary.total || 0;
            document.getElementById('enabledCount').textContent = summary.enabled || 0;
            document.getElementById('thirdPartyCount').textContent = summary.thirdParty || 0;
            document.getElementById('syncSummary').textContent = (state.sync && state.sync.summary) || 'غير متزامن';
            document.getElementById('backendBadge').textContent = 'الخادم: ' + ((state.backend && state.backend.detail) || 'غير معروف');
            document.getElementById('governanceText').textContent = ((state.governance && state.governance.basis) || 'الكتاب والسنة') + ' | ' + ((state.governance && state.governance.principle) || 'لا حدود إلا حدود الله');

            const ecosystem = state.ecosystem || [];
            const ecosystemList = document.getElementById('ecosystemList');
            if (!ecosystem.length) {
                ecosystemList.innerHTML = 'لا توجد بيانات تكاملات بعد';
            } else {
                ecosystemList.innerHTML = ecosystem.map(item => {
                    const cls = item.status === 'active' ? 'status-ok' : (item.status === 'inactive' ? 'status-off' : 'status-warn');
                    return '<div class="' + cls + '">• ' + escapeHtml(item.name) + ': ' + escapeHtml(item.status) + '</div>';
                }).join('');
            }

            const list = document.getElementById('extensionsList');
            list.innerHTML = '';
            const extensions = state.extensions || [];
            if (!extensions.length) {
                list.innerHTML = '<div class="item"><div class="item-title status-warn">لا توجد بيانات إضافات بعد</div></div>';
                return;
            }

            extensions.slice(0, 100).forEach(ext => {
                const item = document.createElement('div');
                item.className = 'item';
                item.innerHTML = '<div class="item-header">'
                    + '<div class="item-title">' + escapeHtml(ext.displayName || ext.id) + '</div>'
                    + '<div class="status-ok">مفعل</div>'
                    + '</div>'
                    + '<div class="item-meta">' + escapeHtml(ext.id || '') + ' | v' + escapeHtml(ext.version || 'unknown') + ' | ' + escapeHtml(ext.publisher || 'unknown') + '</div>';
                list.appendChild(item);
            });
        }

        function escapeHtml(text) {
            return String(text).replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');
        }

        window.addEventListener('message', event => {
            if (event.data.command === 'state') {
                renderState(event.data.data || {});
            }
        });
    </script>
</body>
</html>`;
}

function getSidebarChatHtml() {
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sheikha Sidebar Chat</title>
    <style>
        body { font-family: 'Tajawal', sans-serif; background: #111827; color: #f9fafb; margin: 0; padding: 10px; }
        .header { color: #fbbf24; font-weight: 700; margin-bottom: 8px; }
        .messages { height: calc(100vh - 120px); overflow-y: auto; background: #1f2937; border: 1px solid #374151; border-radius: 8px; padding: 8px; }
        .message { margin: 6px 0; padding: 8px; border-radius: 6px; line-height: 1.5; }
        .assistant { background: #0f172a; border-left: 3px solid #fbbf24; }
        .user { background: #1e3a1a; border-left: 3px solid #34d399; text-align: left; }
        .row { display: flex; gap: 8px; margin-top: 8px; }
        input { flex: 1; padding: 8px; background: #0f172a; color: #fff; border: 1px solid #374151; border-radius: 6px; }
        button { padding: 8px 12px; background: #fbbf24; color: #111827; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; }
    </style>
</head>
<body>
    <div class="header">🤖 شات شيخة</div>
    <div id="messages" class="messages"></div>
    <div class="row">
        <input id="input" type="text" placeholder="اكتب سؤالك البرمجي..." />
        <button onclick="sendMessage()">إرسال</button>
    </div>
    <script>
        const vscode = acquireVsCodeApi();
        const input = document.getElementById('input');
        input.addEventListener('keydown', e => e.key === 'Enter' && sendMessage());

        function sendMessage() {
            const msg = input.value.trim();
            if (!msg) return;
            const messages = document.getElementById('messages');
            messages.innerHTML += '<div class="message user">' + escapeHtml(msg) + '</div>';
            input.value = '';
            vscode.postMessage({ command: 'chat', message: msg });
        }

        window.addEventListener('message', event => {
            if (event.data.command !== 'response') return;
            const data = event.data.data || {};
            const reply = data.reply || 'لا توجد استجابة';
            const code = data.codeSnippet ? '<pre style="margin-top:6px;white-space:pre-wrap;">' + escapeHtml(data.codeSnippet) + '</pre>' : '';
            const messages = document.getElementById('messages');
            messages.innerHTML += '<div class="message assistant">' + escapeHtml(reply) + code + '</div>';
            messages.scrollTop = messages.scrollHeight;
        });

        function escapeHtml(text) { return String(text).replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';'); }
    </script>
</body>
</html>`;
}

async function loadEcosystemSignals(serverUrl, authHeaders) {
    // فحص endpoints الخادم
    const checks = [
        { name: 'Sheikha Copilot', path: '/api/sheikha/copilot/status', mapper: data => (data && data.data && data.data.status) || 'unknown' },
        { name: 'Sheikha Unified Integrations', path: '/api/sheikha/unified-integrations', mapper: data => (data && data.success ? 'active' : 'unknown') },
        { name: 'Google Integration', path: '/api/sheikha/integrations/google-safe-status', mapper: data => (data && data.success ? 'active' : 'unknown') },
        { name: 'CNTXT Integration', path: '/api/sheikha/integrations/cntxt-safe-status', mapper: data => (data && data.success ? 'active' : 'unknown') }
    ];

    const results = [];
    for (const item of checks) {
        try {
            const response = await fetch(`${serverUrl}${item.path}`, { headers: authHeaders });
            if (!response.ok) {
                results.push({ name: item.name, status: 'inactive' });
                continue;
            }
            const data = await response.json();
            results.push({ name: item.name, status: item.mapper(data) || 'unknown' });
        } catch (_) {
            results.push({ name: item.name, status: 'unknown' });
        }
    }

    // فحص إضافات VS Code الفعلية المثبتة في البيئة
    const vsExt = [
        { name: 'GitHub Copilot', id: 'GitHub.copilot' },
        { name: 'GitHub Copilot Chat', id: 'GitHub.copilot-chat' },
        { name: 'GitHub Pull Requests', id: 'GitHub.vscode-pull-request-github' },
        { name: 'Live Share (Microsoft)', id: 'MS-vsliveshare.vsliveshare' },
        { name: 'Azure Tools (Microsoft)', id: 'ms-vscode.vscode-node-azure-pack' },
        { name: 'Google Cloud Code', id: 'GoogleCloudTools.cloudcode' },
        { name: 'NVIDIA Nsight', id: 'NVIDIA.nsight-vscode-edition' },
        { name: 'Python (Microsoft)', id: 'ms-python.python' },
        { name: 'ESLint', id: 'dbaeumer.vscode-eslint' }
    ];

    for (const ext of vsExt) {
        try {
            const installed = vscode.extensions.getExtension(ext.id);
            results.push({ name: ext.name, status: installed ? 'active' : 'not-installed' });
        } catch (_) {
            results.push({ name: ext.name, status: 'unknown' });
        }
    }

    return results;
}
