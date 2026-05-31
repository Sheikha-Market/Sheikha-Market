// Sheikha Extension for VS Code
// نظام مساعد البرمجة الذكي — قائم على مبادئ الكتاب والسنة

const vscode = require('vscode');
const os = require('os');
const NeuralNetworkProvider = require('./providers/neural-network-provider');
let fetch = globalThis.fetch ? globalThis.fetch.bind(globalThis) : null;
if (!fetch) {
    try {
        fetch = require('node-fetch');
    } catch (_) {
        fetch = async () => {
            throw new Error('fetch غير متوفر في بيئة VS Code الحالية');
        };
    }
}

let extensionContext;
let copilotPanel;
const SERVER_URL = 'http://localhost:8080';
const SERVER_CANDIDATES = [
    'http://localhost:8080',
    'http://localhost:8081',
    'http://127.0.0.1:8080',
    'http://127.0.0.1:8081'
];
const TOKEN_SECRET_KEY = 'sheikha.auth.token';
const USER_SECRET_KEY = 'sheikha.auth.user';
const EXTENSIONS_SYNC_KEY = 'sheikha.integrations.extensions.snapshot';
const CHAT_HISTORY_LIMIT = 18;

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
                throw new Error('الخادم المحلي لـ Sheikha غير شغال على المنفذ 8080. شغّل السيرفر ثم أعد المحاولة.', { cause: error });
            }
            throw new Error(`تعذر الاتصال بخادم Sheikha: ${message}`, { cause: error });
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

        // fallback: بعض بيئات Sheikha لا توفر /api/auth/me
        const tokenUser = decodeUserFromToken(this.token);
        if (!tokenUser) {
            return null;
        }

        this.user = tokenUser;
        await this.context.secrets.store(USER_SECRET_KEY, JSON.stringify(this.user));
        return this.user;
    }
}

class SheikhaProvider {
    constructor(context) {
        this.config = {};
        this.shariaGuardrails = true;
        this.context = context;
        this.authManager = new SheikhaAuthManager(context, this);
        this.loadConfig();
    }

    loadConfig() {
        const wsConfig = vscode.workspace.getConfiguration('sheikha');
        const configuredServerUrl = wsConfig.get('serverUrl');
        this.config = {
            serverUrl: configuredServerUrl || SERVER_URL,
            serverUrlConfigured: Boolean(configuredServerUrl),
            enableInlineCompletions: wsConfig.get('enableInlineCompletions', true),
            enableChat: wsConfig.get('enableChat', true),
            enableAgentMode: wsConfig.get('enableAgentMode', true),
            enableNES: wsConfig.get('enableNES', true),
            shariaGuardrails: wsConfig.get('shariaGuardrails', true),
            defaultModel: wsConfig.get('defaultModel', 'sheikha-base'),
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

    async resolveServerUrl() {
        const configured = this.config.serverUrlConfigured ? this.config.serverUrl : null;
        const candidates = Array.from(new Set([configured, ...SERVER_CANDIDATES].filter(Boolean)));

        for (const candidate of candidates) {
            try {
                const response = await fetchWithTimeout(`${candidate}/api/health`, { method: 'GET' }, 1500);
                if (response.ok) {
                    this.config.serverUrl = candidate;
                    return candidate;
                }
            } catch (_) {
                // try the next candidate
            }

            try {
                const response = await fetchWithTimeout(`${candidate}/api/sheikha/ai-gateway/status`, { method: 'GET' }, 1500);
                if (response.ok) {
                    this.config.serverUrl = candidate;
                    return candidate;
                }
            } catch (_) {
                // try the next candidate
            }
        }

        return this.config.serverUrl;
    }

    async getCompletions(code, language, cursorPos, context) {
        try {
            const authHeaders = await this.authManager.getAuthHeaders();
            const response = await fetch(`${this.config.serverUrl}/api/sheikha/completions`, {
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
            console.error('[Sheikha] خطأ في الحصول على الاقتراحات:', err.message);
            return [];
        }
    }

    async chat(message, codeContext, language, history) {
        const authHeaders = await this.authManager.getAuthHeaders();
        const payload = {
            message,
            codeContext,
            language,
            history: Array.isArray(history) ? history.slice(-CHAT_HISTORY_LIMIT) : [],
            model: this.config.defaultModel
        };

        try {
            const response = await fetch(`${this.config.serverUrl}/api/sheikha/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders },
                body: JSON.stringify(payload)
            });
            const data = await readResponseJson(response);
            if (!response.ok || data.success === false) {
                throw new Error(data.message || data.error || `chat_http_${response.status}`);
            }
            return normalizeChatPayload(data);
        } catch (err) {
            try {
                const fallbackResponse = await fetch(`${this.config.serverUrl}/api/sheikha/ai-gateway/ask`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...authHeaders },
                    body: JSON.stringify({
                        prompt: message,
                        mode: 'chat',
                        context: {
                            source: 'vscode-extension',
                            language,
                            codeContext: codeContext ? codeContext.slice(0, 12000) : '',
                            history: history || []
                        }
                    })
                });
                const fallbackData = await readResponseJson(fallbackResponse);
                if (!fallbackResponse.ok || !fallbackData.success) {
                    throw new Error(fallbackData.message || fallbackData.error || 'ai-gateway unavailable');
                }
                return normalizeChatPayload(fallbackData);
            } catch (fallbackErr) {
                return {
                    reply: `خطأ: ${fallbackErr.message || err.message}`,
                    codeSnippet: null,
                    provider: 'extension-offline',
                    mode: 'chat-error'
                };
            }
        }
    }

    async startAgent(task, files, language) {
        try {
            const authHeaders = await this.authManager.getAuthHeaders();
            const response = await fetch(`${this.config.serverUrl}/api/sheikha/agent`, {
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
            const response = await fetch(`${this.config.serverUrl}/api/sheikha/extension/status`, {
                headers: authHeaders
            });
            const data = await response.json();
            return data.data;
        } catch (err) {
            return null;
        }
    }

    async getAiGatewayStatus() {
        try {
            const authHeaders = await this.authManager.getAuthHeaders();
            const response = await fetchWithTimeout(`${this.config.serverUrl}/api/sheikha/ai-gateway/status`, {
                headers: authHeaders
            }, 3500);
            const data = await readResponseJson(response);
            return data && data.success ? data : { success: false, status: 'unavailable', warning: data.message || data.error || 'unknown' };
        } catch (err) {
            return { success: false, status: 'offline', warning: err.message };
        }
    }

    async syncExtensionsState(extensions, reason) {
        const authHeaders = await this.authManager.getAuthHeaders();
        const response = await fetch(`${this.config.serverUrl}/api/sheikha/extensions-sync`, {
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
        const response = await fetch(`${this.config.serverUrl}/api/sheikha/extensions-live`, {
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

class SheikhaFeatureViewProvider {
    constructor(htmlGenerator) {
        this.htmlGenerator = htmlGenerator;
        this.view = null;
    }

    resolveWebviewView(webviewView) {
        this.view = webviewView;
        webviewView.webview.options = { enableScripts: true };
        webviewView.webview.html = this.htmlGenerator();
    }
}

class SheikhaChatSidebarProvider {
    constructor(provider) {
        this.provider = provider;
        this.view = null;
        this.history = [];
        this.pending = false;
    }

    resolveWebviewView(webviewView) {
        this.view = webviewView;
        webviewView.webview.options = { enableScripts: true };
        webviewView.webview.html = getSidebarChatHtml();
        this.postRuntimeStatus();

        webviewView.webview.onDidReceiveMessage(async message => {
            if (message.command === 'ready') {
                await this.postRuntimeStatus();
                return;
            }

            if (message.command === 'clear') {
                this.history = [];
                webviewView.webview.postMessage({ command: 'cleared' });
                await this.postRuntimeStatus();
                return;
            }

            if (message.command !== 'chat') {
                return;
            }

            const userMessage = String(message.message || '').trim();
            if (!userMessage || this.pending) {
                return;
            }

            const editor = vscode.window.activeTextEditor;
            const codeContext = editor ? editor.document.getText() : '';
            const language = editor ? editor.document.languageId : 'auto';

            this.pending = true;
            webviewView.webview.postMessage({ command: 'pending', value: true });

            try {
                const responseData = await this.provider.chat(userMessage, codeContext, language, this.history);
                this.history.push(
                    { role: 'user', content: userMessage },
                    {
                        role: 'assistant',
                        content: responseData.reply || '',
                        provider: responseData.provider || null,
                        mode: responseData.mode || null
                    }
                );
                this.history = this.history.slice(-CHAT_HISTORY_LIMIT);
                webviewView.webview.postMessage({ command: 'response', data: responseData });
                await this.postRuntimeStatus();
            } catch (error) {
                webviewView.webview.postMessage({
                    command: 'response',
                    data: {
                        reply: `خطأ في الشات: ${error.message}`,
                        provider: 'extension-error',
                        mode: 'chat-error'
                    }
                });
            } finally {
                this.pending = false;
                webviewView.webview.postMessage({ command: 'pending', value: false });
            }
        });
    }

    async postRuntimeStatus() {
        if (!this.view) {
            return;
        }

        const [extensionStatus, gatewayStatus] = await Promise.all([
            this.provider.getStatus(),
            this.provider.getAiGatewayStatus()
        ]);

        this.view.webview.postMessage({
            command: 'runtimeStatus',
            data: {
                serverUrl: this.provider.config.serverUrl,
                extensionStatus: extensionStatus || { status: 'offline' },
                gatewayStatus,
                historyCount: this.history.length
            }
        });
    }
}

async function activate(context) {
    extensionContext = context;
    const provider = new SheikhaProvider(context);
    await provider.initializeAuth();
    const resolveServerUrlPromise = provider.resolveServerUrl().catch(() => provider.config.serverUrl);

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
    const apiViewProvider = new SheikhaFeatureViewProvider(() => getRootNeuralFeatureViewHtml('api', provider.config.serverUrl));
    const publishViewProvider = new SheikhaFeatureViewProvider(() => getRootNeuralFeatureViewHtml('publish', provider.config.serverUrl));
    const pathsViewProvider = new SheikhaFeatureViewProvider(() => getRootNeuralFeatureViewHtml('paths', provider.config.serverUrl));
    const programmingViewProvider = new SheikhaFeatureViewProvider(() => getRootNeuralFeatureViewHtml('programming', provider.config.serverUrl));
    const debugViewProvider = new SheikhaFeatureViewProvider(() => getRootNeuralFeatureViewHtml('debug', provider.config.serverUrl));
    const editingViewProvider = new SheikhaFeatureViewProvider(() => getRootNeuralFeatureViewHtml('editing', provider.config.serverUrl));
    const neuralViewProvider = new SheikhaFeatureViewProvider(() => getRootNeuralFeatureViewHtml('neural', provider.config.serverUrl));
    const enterpriseViewProvider = new SheikhaFeatureViewProvider(() => getRootNeuralFeatureViewHtml('enterprise', provider.config.serverUrl));
    const osViewProvider = new SheikhaFeatureViewProvider(() => getRootNeuralFeatureViewHtml('os', provider.config.serverUrl));
    const serviceProviderViewProvider = new SheikhaFeatureViewProvider(() => getRootNeuralFeatureViewHtml('serviceProvider', provider.config.serverUrl));
    const ideViewProvider = new SheikhaFeatureViewProvider(() => getRootNeuralFeatureViewHtml('ide', provider.config.serverUrl));
    const toolsViewProvider = new SheikhaFeatureViewProvider(() => getRootNeuralFeatureViewHtml('tools', provider.config.serverUrl));
    const neuralTreeProvider = new NeuralNetworkProvider();

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('sheikha.statusView', dashboardProvider),
        vscode.window.registerWebviewViewProvider('sheikha.chatView', chatSidebarProvider),
        vscode.window.registerWebviewViewProvider('sheikha.apiView', apiViewProvider),
        vscode.window.registerWebviewViewProvider('sheikha.publishView', publishViewProvider),
        vscode.window.registerWebviewViewProvider('sheikha.pathsView', pathsViewProvider),
        vscode.window.registerWebviewViewProvider('sheikha.programmingView', programmingViewProvider),
        vscode.window.registerWebviewViewProvider('sheikha.debugView', debugViewProvider),
        vscode.window.registerWebviewViewProvider('sheikha.editingView', editingViewProvider),
        vscode.window.registerWebviewViewProvider('sheikha.neuralView', neuralViewProvider),
        vscode.window.registerWebviewViewProvider('sheikha.enterpriseView', enterpriseViewProvider),
        vscode.window.registerWebviewViewProvider('sheikha.osView', osViewProvider),
        vscode.window.registerWebviewViewProvider('sheikha.serviceProviderView', serviceProviderViewProvider),
        vscode.window.registerWebviewViewProvider('sheikha.ideView', ideViewProvider),
        vscode.window.registerWebviewViewProvider('sheikha.toolsView', toolsViewProvider),
        vscode.window.registerTreeDataProvider('sheikhaNeuralNetwork', neuralTreeProvider)
    );

    const updateAccountStatus = () => {
        const user = provider.authManager.user;
        const syncIcon = isSyncingIntegrations ? ' $(sync~spin)' : (lastSyncSummary ? ' $(sync)' : '');
        const backendIcon = isStartingBackend ? ' $(loading~spin)' : ' $(server-process)';
        if (provider.authManager.isSignedIn() && user) {
            const name = user.name || user.email || 'Sheikha User';
            accountStatusItem.text = `$(account) Sheikha: ${name}${syncIcon}${backendIcon}`;
            accountStatusItem.tooltip = lastSyncSummary
                ? `إدارة حساب Sheikha\nتزامن الإضافات: ${lastSyncSummary}\nالخادم: ${lastBackendSummary}`
                : `إدارة حساب Sheikha\nالخادم: ${lastBackendSummary}`;
        } else {
            accountStatusItem.text = `$(account) Sheikha: تسجيل الدخول${syncIcon}${backendIcon}`;
            accountStatusItem.tooltip = lastSyncSummary
                ? `تسجيل الدخول إلى حساب Sheikha\nتزامن الإضافات: ${lastSyncSummary}\nالخادم: ${lastBackendSummary}`
                : `تسجيل الدخول إلى حساب Sheikha\nالخادم: ${lastBackendSummary}`;
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

    const startBackendTerminal = async () => {
        const terminalName = 'Sheikha Backend';
        let terminal = vscode.window.terminals.find(t => t.name === terminalName);
        if (!terminal) {
            terminal = vscode.window.createTerminal({ name: terminalName });
        }
        terminal.show(false);
        terminal.sendText('npm run dev');
        return true;
    };

    const tryStartBackendTask = async () => {
        const tasks = await vscode.tasks.fetchTasks();
        const knownStartTaskNames = new Set([
            'Sheikha: Start Dev (No Cursor)',
            'Sheikha: Full Dev Power (No Cursor)',
            '🟢 Start Dev (No Cursor)',
            '🚀 Sheikha — تشغيل الخادم (dev)',
            '🚀 شيخة — تشغيل الخادم (dev)',
            '🚀 Start Development Server'
        ]);
        const target = tasks.find(task => knownStartTaskNames.has(task.name));

        if (target) {
            await vscode.tasks.executeTask(target);
            return true;
        }

        return await startBackendTerminal();
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
    resolveServerUrlPromise.then(async url => {
        if (url) {
            lastBackendSummary = `server-url:${url}`;
            updateAccountStatus();
            if (neuralTreeProvider && typeof neuralTreeProvider.refresh === 'function') {
                await neuralTreeProvider.refresh();
            }
        }
    });

    const getEditorContext = () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return { editor: null, codeContext: '', selectedText: '', language: 'workspace', files: [] };
        }

        return {
            editor,
            codeContext: editor.document.getText(),
            selectedText: editor.document.getText(editor.selection),
            language: editor.document.languageId,
            files: [editor.document.uri.fsPath]
        };
    };

    const showSheikhaResponse = async (title, prompt, preferredContext = null) => {
        const ctx = preferredContext || getEditorContext();
        await vscode.window.withProgress(
            { location: vscode.ProgressLocation.Notification, title },
            async () => {
                const response = await provider.chat(
                    prompt,
                    ctx.selectedText || ctx.codeContext || '',
                    ctx.language || 'workspace',
                    []
                );
                const reply = response && response.reply ? response.reply : 'Sheikha جاهزة.';
                const output = vscode.window.createOutputChannel('Sheikha');
                output.appendLine(`## ${title}`);
                output.appendLine(reply);
                if (response && response.codeSnippet) {
                    output.appendLine('');
                    output.appendLine(response.codeSnippet);
                }
                output.show(true);
                vscode.window.showInformationMessage(`Sheikha: ${reply.slice(0, 180)}`);
            }
        );
    };

    // ── أمر: فتح المحادثة ──
    const chatCommand = vscode.commands.registerCommand('sheikha.openChat', async () => {
        vscode.window.showInformationMessage('Sheikha AI Activated');
        if (!copilotPanel) {
            copilotPanel = vscode.window.createWebviewPanel(
                'sheikha-chat',
                'Sheikha Chat',
                vscode.ViewColumn.Beside,
                { enableScripts: true }
            );
            copilotPanel.webview.html = getChatHtml();
            copilotPanel.onDidDispose(() => { copilotPanel = null; });

            let panelHistory = [];
            let panelPending = false;
            const postPanelRuntimeStatus = async () => {
                if (!copilotPanel) {
                    return;
                }

                const [extensionStatus, gatewayStatus] = await Promise.all([
                    provider.getStatus(),
                    provider.getAiGatewayStatus()
                ]);

                copilotPanel.webview.postMessage({
                    command: 'runtimeStatus',
                    data: {
                        serverUrl: provider.config.serverUrl,
                        extensionStatus: extensionStatus || { status: 'offline' },
                        gatewayStatus,
                        historyCount: panelHistory.length
                    }
                });
            };

            await postPanelRuntimeStatus();

            copilotPanel.webview.onDidReceiveMessage(async (msg) => {
                if (msg.command === 'ready') {
                    await postPanelRuntimeStatus();
                    return;
                }

                if (msg.command === 'clear') {
                    panelHistory = [];
                    copilotPanel.webview.postMessage({ command: 'cleared' });
                    await postPanelRuntimeStatus();
                    return;
                }

                if (msg.command === 'chat') {
                    const userMessage = String(msg.message || '').trim();
                    if (!userMessage || panelPending) {
                        return;
                    }

                    panelPending = true;
                    copilotPanel.webview.postMessage({ command: 'pending', value: true });

                    const editor = vscode.window.activeTextEditor;
                    try {
                        const responseData = await provider.chat(
                            userMessage,
                            editor ? editor.document.getText() : '',
                            editor ? editor.document.languageId : 'auto',
                            panelHistory
                        );
                        panelHistory.push(
                            { role: 'user', content: userMessage },
                            {
                                role: 'assistant',
                                content: responseData.reply || '',
                                provider: responseData.provider || null,
                                mode: responseData.mode || null
                            }
                        );
                        panelHistory = panelHistory.slice(-CHAT_HISTORY_LIMIT);
                        copilotPanel.webview.postMessage({ command: 'response', data: responseData });
                        await postPanelRuntimeStatus();
                    } catch (error) {
                        copilotPanel.webview.postMessage({
                            command: 'response',
                            data: {
                                reply: `خطأ في الشات: ${error.message}`,
                                provider: 'extension-error',
                                mode: 'chat-error'
                            }
                        });
                    } finally {
                        panelPending = false;
                        copilotPanel.webview.postMessage({ command: 'pending', value: false });
                    }
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
        const ctx = getEditorContext();
        const task = await vscode.window.showInputBox({ prompt: 'صف المهمة التي تريد من Sheikha Agent تنفيذها:' });
        if (!task) return;

        vscode.window.withProgress(
            { location: vscode.ProgressLocation.Notification, title: 'Sheikha Agent يعمل...' },
            async () => {
                const result = await provider.startAgent(task, ctx.files, ctx.language);
                if (result) {
                    const stepsCount = Array.isArray(result.steps) ? result.steps.length : 1;
                    vscode.window.showInformationMessage(`Sheikha Agent: المهمة في معالجة — ${stepsCount} خطوة`);
                    return;
                }
                await showSheikhaResponse('Sheikha Agent', `نفّذ كوكيل مؤسسي داخل Sheikha: ${task}`, ctx);
            }
        );
    });

    // ── أمر: محادثة مضمّنة ──
    const inlineChatCommand = vscode.commands.registerCommand('sheikha.inlineChat', async () => {
        const ctx = getEditorContext();
        const selectedCode = ctx.selectedText || ctx.codeContext || '';
        const instruction = await vscode.window.showInputBox({
            prompt: 'أرسل تعليمات للمحادثة المضمّنة (مثل: refactor, explain, add error handling)',
            value: ''
        });

        if (!instruction) return;

        if (!ctx.editor) {
            await showSheikhaResponse('Sheikha Inline Chat', instruction, ctx);
            return;
        }

        try {
            const authHeaders = await provider.authManager.getAuthHeaders();
            const response = await fetch(`${provider.config.serverUrl}/api/sheikha/inline-chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders },
                body: JSON.stringify({
                    prompt: instruction,
                    selectedCode,
                    language: ctx.language,
                    instruction
                })
            });
            const data = await response.json();
            if (data.data && data.data.modifiedCode && instruction.toLowerCase().includes('refactor')) {
                ctx.editor.edit(edit => {
                    edit.replace(ctx.editor.selection, data.data.modifiedCode);
                });
                vscode.window.showInformationMessage('Sheikha: تم تطبيق التعديل');
            } else {
                await showSheikhaResponse('Sheikha Inline Chat', `${instruction}\n\n${selectedCode}`, ctx);
            }
        } catch (err) {
            await showSheikhaResponse('Sheikha Inline Chat', `${instruction}\n\n${selectedCode}`, ctx);
        }
    });

    // ── أمر: حالة النظام ──
    const statusCommand = vscode.commands.registerCommand('sheikha.showStatus', async () => {
        const status = await provider.getStatus();
        if (status) {
            const languageCount = Array.isArray(status.supportedLanguages)
                ? status.supportedLanguages.length
                : (Array.isArray(status.languages) ? status.languages.length : 'غير محدد');
            vscode.window.showInformationMessage(`Sheikha v${status.version} — ${status.status} | ${languageCount} لغة | شريعة: ✅`);
        } else {
            vscode.window.showErrorMessage('Sheikha: لم يتمكن من الاتصال بالخادم');
        }
    });

    // ── أمر: اقتراح التعديل التالي ──
    const nesCommand = vscode.commands.registerCommand('sheikha.nextEditSuggestion', async () => {
        vscode.window.showInformationMessage('Sheikha NES: سيتم تفعيل اقتراحات التعديل التالي قريباً');
    });

    const enableNESCommand = vscode.commands.registerCommand('sheikha.enableNES', async () => {
        try {
            const cfg = vscode.workspace.getConfiguration('sheikha');
            const current = cfg.get('enableNES', true);
            await cfg.update('enableNES', !current, vscode.ConfigurationTarget.Global);
            // reload provider config
            provider.loadConfig();
            vscode.window.showInformationMessage(`Sheikha NES الآن ${!current ? 'مفعّل' : 'معطّل'}`);
        } catch (err) {
            vscode.window.showErrorMessage('تعذّر تبديل حالة NES: ' + (err.message || err));
        }
    });

    const signInCommand = vscode.commands.registerCommand('sheikha.signIn', async () => {
        const backendReady = await ensureBackendReady('signin');
        if (!backendReady) {
            vscode.window.showErrorMessage('الخادم المحلي لـ Sheikha لم يجهز بعد. حاول بعد لحظات أو شغّل السيرفر يدويًا.');
            return;
        }

        const email = await vscode.window.showInputBox({
            prompt: 'أدخل البريد الإلكتروني لحساب Sheikha',
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
            vscode.window.showInformationMessage('تم تسجيل الدخول إلى حساب Sheikha بنجاح');
        } catch (err) {
            vscode.window.showErrorMessage(`فشل تسجيل الدخول: ${err.message}`);
        }
    });

    const signOutCommand = vscode.commands.registerCommand('sheikha.signOut', async () => {
        await provider.authManager.signOut();
        updateAccountStatus();
        vscode.window.showInformationMessage('تم تسجيل الخروج من حساب Sheikha');
    });

    const manageAccountCommand = vscode.commands.registerCommand('sheikha.manageAccount', async () => {
        const isSignedIn = provider.authManager.isSignedIn();
        if (!isSignedIn) {
            const choice = await vscode.window.showQuickPick(
                [{ label: 'تسجيل الدخول', action: 'signin' }],
                { placeHolder: 'حساب Sheikha غير مسجل حاليًا' }
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
            { placeHolder: 'إدارة حساب Sheikha' }
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
        await vscode.commands.executeCommand('workbench.view.extension.sheikha');
    });

    // ── أوامر متقدمة: الشبكة العصبية الجذرية ──
    const activateNeuralEngineCommand = vscode.commands.registerCommand('sheikha.activateNeuralEngine', async () => {
        try {
            const backendReady = await ensureBackendReady('neural-engine');
            if (backendReady) {
                const response = await fetch(`${provider.config.serverUrl}/api/sheikha/ai-neural-cell-network/activate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ activate: true })
                });
                const data = await response.json();
                if (data.success) {
                    vscode.window.showInformationMessage('✅ محرك الشبكة العصبية الجذرية فعّال الآن');
                } else {
                    vscode.window.showWarningMessage('⚠️ ' + (data.message || 'لم يتم تفعيل المحرك'));
                }
            }
        } catch (err) {
            vscode.window.showErrorMessage('خطأ في تفعيل محرك الشبكة العصبية: ' + err.message);
        }
    });

    const refactorCodeCommand = vscode.commands.registerCommand('sheikha.refactorCode', async () => {
        await showSheikhaResponse('Sheikha Refactor', 'أعد هيكلة السياق الحالي أو اقترح خطة إعادة هيكلة مؤسسية آمنة.');
    });

    const explainCodeCommand = vscode.commands.registerCommand('sheikha.explainCode', async () => {
        await showSheikhaResponse('Sheikha Explain', 'اشرح السياق الحالي أو أعط شرحاً مؤسسياً عاماً إذا لا يوجد ملف مفتوح.');
    });

    const generateTestsCommand = vscode.commands.registerCommand('sheikha.generateTests', async () => {
        await showSheikhaResponse('Sheikha Tests', 'ولّد خطة اختبارات أو اختبارات وحدة مناسبة للسياق الحالي مع ضوابط السلامة.');
    });

    const reviewCodeCommand = vscode.commands.registerCommand('sheikha.reviewCode', async () => {
        await showSheikhaResponse('Sheikha Review', 'راجع السياق الحالي كمراجعة كود: أخطاء، مخاطر، اختبارات ناقصة، وتحسينات.');
    });

    const optimizePerformanceCommand = vscode.commands.registerCommand('sheikha.optimizePerformance', async () => {
        await showSheikhaResponse('Sheikha Performance', 'اقترح تحسين أداء آمن وقابل للقياس للسياق الحالي أو للمنظومة عامة.');
    });

    const checkShariaCommand = vscode.commands.registerCommand('sheikha.checkSharia', async () => {
        await showSheikhaResponse('Sheikha Sharia Check', 'افحص السياق الحالي وفق الكتاب والسنة: منع الربا، الغش، الظلم، الضرر، التزييف، وانتهاك الخصوصية.');
    });

    const neuralNetworkCommand = vscode.commands.registerCommand('sheikha.neuralNetwork', async () => {
        const choice = await vscode.window.showQuickPick([
            { label: '🧠 تفعيل محرك الشبكة العصبية الجذرية', action: 'activate' },
            { label: '📊 عرض حالة الشبكة العصبية', action: 'status' },
            { label: '✅ تحقق التكامل الجذري الكامل', action: 'validate' },
            { label: '⚙️ إعدادات الشبكة العصبية', action: 'settings' },
            { label: '🔄 إعادة تدريب النموذج', action: 'retrain' }
        ], { placeHolder: 'اختر إجراء للشبكة العصبية' });

        if (!choice) return;

        try {
            switch (choice.action) {
                case 'activate':
                    await vscode.commands.executeCommand('sheikha.activateNeuralEngine');
                    break;
                case 'status': {
                    const response = await fetch(`${provider.config.serverUrl}/api/sheikha/ai-neural-cell-network/status`);
                    const data = await response.json();
                    if (data.success) {
                        const message = `شبكة الخلايا العصبية: ${data.status.toUpperCase()} — الإصدار ${data.version} — آخر تحديث ${data.lastRetrainedAt || 'لم يتم إعادة تدريب'}.`;
                        vscode.window.showInformationMessage(message);
                    } else {
                        vscode.window.showWarningMessage('⚠️ فشل جلب حالة الشبكة العصبية');
                    }
                    break;
                }
                case 'validate':
                    await vscode.commands.executeCommand('sheikha.validateRootNeuralIntegration');
                    break;
                case 'settings':
                    vscode.window.showInformationMessage('🔧 إعدادات الشبكة العصبية متاحة في إعدادات Sheikha');
                    break;
                case 'retrain': {
                    const response = await fetch(`${provider.config.serverUrl}/api/sheikha/ai-neural-cell-network/retrain`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ dataset: 'sheikha-governed-corpus' })
                    });
                    const data = await response.json();
                    if (data.success) {
                        vscode.window.showInformationMessage(`✅ ${data.message}`);
                    } else {
                        vscode.window.showWarningMessage('⚠️ فشل إعادة تدريب الشبكة العصبية');
                    }
                    break;
                }
            }
        } catch (err) {
            vscode.window.showErrorMessage('خطأ في أمر الشبكة العصبية: ' + err.message);
        }
    });

    const validateRootNeuralIntegrationCommand = vscode.commands.registerCommand('sheikha.validateRootNeuralIntegration', async () => {
        try {
            const backendReady = await ensureBackendReady('root-neural-integration');
            if (!backendReady) {
                vscode.window.showWarningMessage('Sheikha: الخادم غير جاهز لفحص التكامل الجذري.');
                return;
            }

            const response = await fetch(`${provider.config.serverUrl}/api/sheikha/root-neural-integration/activate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    objective: 'complete-root-neural-integration',
                    mode: 'itqan',
                    source: 'vscode-command'
                })
            });
            const data = await response.json();
            if (data.success) {
                vscode.window.showInformationMessage(`Sheikha: التكامل الجذري الكامل مفعل — الدرجة ${data.score}%`);
            } else {
                vscode.window.showWarningMessage(`Sheikha: التكامل يحتاج مراجعة — الدرجة ${data.score || 0}%`);
            }
            if (neuralTreeProvider && typeof neuralTreeProvider.refresh === 'function') {
                await neuralTreeProvider.refresh();
            }
        } catch (err) {
            vscode.window.showErrorMessage('خطأ في تحقق التكامل الجذري: ' + err.message);
        }
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
        enableNESCommand,
        signInCommand,
        signOutCommand,
        manageAccountCommand,
        syncIntegrationsCommand,
        openIntegrationsDashboardCommand,
        activateNeuralEngineCommand,
        refactorCodeCommand,
        explainCodeCommand,
        generateTestsCommand,
        reviewCodeCommand,
        optimizePerformanceCommand,
        checkShariaCommand,
        neuralNetworkCommand,
        validateRootNeuralIntegrationCommand,
        { dispose: () => clearInterval(autoRefreshInterval) },
        accountStatusItem
    );

    console.log('✅ [Sheikha Extension] مفعّل — جاهز للبرمجة الذكية');
    vscode.window.showInformationMessage('Sheikha مفعّل! استخدم Ctrl+Shift+I لفتح المحادثة');
}

function getChatHtml() {
    return getSidebarChatHtml();
}

function deactivate() {
    console.log('Sheikha Extension deactivated');
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

async function fetchWithTimeout(url, options = {}, timeoutMs = 2500) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(url, { ...options, signal: controller.signal });
    } finally {
        clearTimeout(timeout);
    }
}

async function readResponseJson(response) {
    const text = await response.text();
    if (!text) {
        return {};
    }

    try {
        return JSON.parse(text);
    } catch (_) {
        return {
            success: false,
            message: text
        };
    }
}

function normalizeChatPayload(payload) {
    const data = payload && typeof payload.data === 'object' && payload.data
        ? payload.data
        : (payload || {});
    const reply = data.reply || data.output || data.response || payload.output || payload.message || 'Sheikha جاهزة.';

    return {
        ...data,
        reply: String(reply),
        codeSnippet: data.codeSnippet || data.code || payload.codeSnippet || null,
        provider: data.provider || payload.provider || 'Sheikha',
        mode: data.mode || payload.mode || null,
        model: data.model || payload.model || null,
        localModelOnline: typeof data.localModelOnline === 'boolean'
            ? data.localModelOnline
            : (typeof payload.localModelOnline === 'boolean' ? payload.localModelOnline : null),
        fallbackReason: data.fallbackReason || payload.fallbackReason || null
    };
}

function getRootNeuralFeatureConfig(featureId) {
    const configs = {
        api: {
            title: 'API',
            subtitle: 'بوابة Sheikha API مربوطة بالشات، Sheikha-Core، وسجل الشبكة الجذرية.',
            primary: '/api/sheikha/extension/status',
            cells: ['extension/status', 'chat', 'completions', 'agent', 'inline-chat'],
            actions: [
                { label: 'Status', method: 'GET', path: '/api/sheikha/extension/status' },
                { label: 'Core', method: 'GET', path: '/api/sheikha/ai-gateway/status' },
                { label: 'Ask Core', method: 'POST', path: '/api/sheikha/ai-gateway/ask', body: { prompt: 'شغل', mode: 'chat', context: { source: 'vscode-feature-view' } } },
                { label: 'Chat', method: 'POST', path: '/api/sheikha/chat', body: { message: 'شغل', language: 'ar', history: [] } }
            ]
        },
        publish: {
            title: 'النشر',
            subtitle: 'نشر Sheikha كمنظومة خدمة ذكاء صناعي مع حوكمة وفحص قبل الإطلاق.',
            primary: '/api/sheikha/ai-service-provider/status',
            cells: ['provider/status', 'certification', 'publish-plan', 'integration-plan'],
            actions: [
                { label: 'Provider', method: 'GET', path: '/api/sheikha/ai-service-provider/status' },
                { label: 'Certification', method: 'GET', path: '/api/sheikha/ai-service-provider/certification' },
                { label: 'Publish Plan', method: 'POST', path: '/api/sheikha/ai-service-provider/publish-plan', body: { target: 'sheikha-global-runtime-ai-provider', tier: 'enterprise' } }
            ]
        },
        paths: {
            title: 'المسارات',
            subtitle: 'خريطة مسارات تشغيلية تربط Git وAPI وMCP وخلايا الجذر.',
            primary: '/api/sheikha/extension/status',
            cells: ['api/sheikha/chat', 'api/sheikha/ai-gateway/status', 'api/sheikha/root-neural-integration/activate', 'api/sheikha/extensions-live'],
            actions: [
                { label: 'Routes', method: 'GET', path: '/api/sheikha/extension/status' },
                { label: 'Gateway', method: 'GET', path: '/api/sheikha/ai-gateway/status' },
                { label: 'Integrations', method: 'GET', path: '/api/sheikha/extensions-live' }
            ]
        },
        programming: {
            title: 'البرمجة',
            subtitle: 'طبقة برمجة حاكمة: تحليل، توليد، فحص، ومراجعة قبل الدمج.',
            primary: '/api/sheikha/extension/status',
            cells: ['language/status', 'completions', 'inline-chat', 'agent'],
            actions: [
                { label: 'Languages', method: 'GET', path: '/api/sheikha/languages' },
                { label: 'Completion', method: 'POST', path: '/api/sheikha/completions', body: { code: 'function ', language: 'javascript', cursor: 9 } },
                { label: 'Chat', method: 'POST', path: '/api/sheikha/chat', body: { message: 'افحص البرمجة والتكامل', language: 'javascript', history: [] } }
            ]
        },
        debug: {
            title: 'DEBUG',
            subtitle: 'تشخيص الأخطاء عبر Sheikha-Core مع حفظ السبب والأثر وخطة الرجوع.',
            primary: '/api/sheikha/extension/status',
            cells: ['health', 'ai-gateway', 'root-neural-cells', 'logs'],
            actions: [
                { label: 'Health', method: 'GET', path: '/api/health' },
                { label: 'Gateway', method: 'GET', path: '/api/sheikha/ai-gateway/status' },
                { label: 'Debug Chat', method: 'POST', path: '/api/sheikha/chat', body: { message: 'حلل وضع DEBUG في الإكستنشن', language: 'auto', history: [] } }
            ]
        },
        editing: {
            title: 'التحرير',
            subtitle: 'تحرير آمن للملفات: اقتراح، مراجعة، فحص، ثم اعتماد بشري.',
            primary: '/api/sheikha/extension/status',
            cells: ['review', 'refactor', 'tests', 'sharia-check'],
            actions: [
                { label: 'Review', method: 'POST', path: '/api/sheikha/chat', body: { message: 'راجع الملف المفتوح واقترح تعديلا آمنا', language: 'auto', history: [] } },
                { label: 'Core', method: 'GET', path: '/api/sheikha/ai-gateway/status' },
                { label: 'Status', method: 'GET', path: '/api/sheikha/extension/status' }
            ]
        },
        neural: {
            title: 'شبكة الخلايا العصبية',
            subtitle: 'Root Neural Cell Network: حوكمة، MCP، خلايا نشطة، وربط مباشر بالشات.',
            primary: '/api/sheikha/extension/status',
            cells: ['root-neural-cells', 'neural-mcp', 'ai-foundations', 'islamic-intelligence'],
            actions: [
                { label: 'Neural Status', method: 'GET', path: '/api/sheikha/extension/status' },
                { label: 'MCP', method: 'GET', path: '/api/sheikha/neural-mcp/status' },
                { label: 'Activate', method: 'POST', path: '/api/sheikha/root-neural-integration/activate', body: { objective: 'complete-root-neural-integration', mode: 'itqan', source: 'vscode-feature-view' } }
            ]
        },
        enterprise: {
            title: 'التكامل المؤسسي',
            subtitle: 'تكامل Git وGitHub وVS Code وAPI داخل طبقة حوكمة واحدة.',
            primary: '/api/sheikha/enterprise-vscode-git/status',
            cells: ['git/status', 'enterprise-vscode-git', 'enterprise-git-service', 'pr-mr-plan'],
            actions: [
                { label: 'Git', method: 'GET', path: '/api/sheikha/git/status' },
                { label: 'Enterprise Git', method: 'GET', path: '/api/sheikha/enterprise-vscode-git/status' },
                { label: 'Work Plan', method: 'POST', path: '/api/sheikha/enterprise-vscode-git/work-plan', body: { target: 'sheikha-main-portal', provider: 'github' } }
            ]
        },
        os: {
            title: 'SHEIKHA AI AL OS',
            subtitle: 'نواة تشغيل حاكمة تجمع الحاسب، الذكاء الصناعي، أدوات التطوير، والتكاملات.',
            primary: '/api/sheikha/governing-os/status',
            cells: ['governing-os', 'package-plan', 'universal-integration', 'core-chat'],
            actions: [
                { label: 'OS Status', method: 'GET', path: '/api/sheikha/governing-os/status' },
                { label: 'Package Plan', method: 'POST', path: '/api/sheikha/governing-os/package-plan', body: { target: 'sheikha-ai-al-os' } },
                { label: 'Universal', method: 'POST', path: '/api/sheikha/governing-os/universal-integration-plan', body: { target: 'sheikha-ai-al-os' } }
            ]
        },
        serviceProvider: {
            title: 'AI مزود خدمة',
            subtitle: 'Sheikha كمزود خدمة ذكاء صناعي مؤسسي قابل للنشر والاعتماد.',
            primary: '/api/sheikha/ai-service-provider/status',
            cells: ['service-provider', 'certification', 'publish-plan', 'provider-keys'],
            actions: [
                { label: 'Provider', method: 'GET', path: '/api/sheikha/ai-service-provider/status' },
                { label: 'Keys Policy', method: 'GET', path: '/api/sheikha/provider-keys/policy' },
                { label: 'Metering', method: 'GET', path: '/api/sheikha/provider-metering/status' }
            ]
        },
        ide: {
            title: 'SHEIKHA IDE',
            subtitle: 'بيئة تطوير مؤسسية تدمج الشات، الملفات، Git، والذكاء الصناعي تحت شبكة الجذر.',
            primary: '/api/sheikha/enterprise-ide/status',
            cells: ['enterprise-ide', 'development-environment', 'subscription-model', 'industry-services'],
            actions: [
                { label: 'IDE Status', method: 'POST', path: '/api/sheikha/enterprise-ide/status', body: { modelMode: 'hybrid' } },
                { label: 'Environment', method: 'POST', path: '/api/sheikha/enterprise-ide/development-environment', body: { target: 'SHEIKHA UGIT-RP', tier: 'enterprise' } },
                { label: 'Subscriptions', method: 'POST', path: '/api/sheikha/enterprise-ide/subscription-model', body: { tier: 'enterprise' } }
            ]
        },
        tools: {
            title: 'الأدوات والتقنيات',
            subtitle: 'نسيج أدوات موحد: Sheikha-Core، MCP، VS Code، Git، API، ومزودات قابلة للاستبدال.',
            primary: '/api/sheikha/universal-tools-fabric/status',
            cells: ['tools-fabric', 'mcp-tools', 'provider-gateway', 'extensions-sync'],
            actions: [
                { label: 'Fabric', method: 'GET', path: '/api/sheikha/universal-tools-fabric/status' },
                { label: 'MCP Tools', method: 'GET', path: '/api/sheikha/neural-mcp/tools' },
                { label: 'Core', method: 'GET', path: '/api/sheikha/ai-gateway/status' }
            ]
        }
    };

    return configs[featureId] || configs.api;
}

function getRootNeuralFeatureViewHtml(featureId, serverUrl = SERVER_URL) {
    const safeServerUrl = String(serverUrl || SERVER_URL).replace(/"/g, '\\"');
    const feature = getRootNeuralFeatureConfig(featureId);
    const featureJson = safeJsonForHtml(feature);

    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sheikha ${feature.title}</title>
    <style>
        :root { color-scheme: dark; }
        * { box-sizing: border-box; }
        body { margin: 0; padding: 10px; background: #0b1020; color: #f8fafc; font-family: var(--vscode-font-family, 'Tajawal', sans-serif); }
        .shell { display: flex; flex-direction: column; gap: 10px; min-height: calc(100vh - 20px); }
        .hero { border: 1px solid #2f3b52; border-radius: 8px; padding: 12px; background: #121a2b; }
        .eyebrow { display: inline-flex; color: #34d399; border: 1px solid #0f766e; border-radius: 999px; padding: 3px 8px; font-size: 11px; font-weight: 800; margin-bottom: 8px; }
        h1 { color: #fbbf24; margin: 0 0 6px; font-size: 20px; line-height: 1.25; }
        p { margin: 0; color: #d7dee9; line-height: 1.55; }
        .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
        .tile { min-height: 74px; border: 1px solid #334155; border-radius: 8px; padding: 10px; background: #111827; }
        .label { color: #93c5fd; font-size: 11px; margin-bottom: 6px; }
        .value { color: #f8fafc; font-weight: 800; overflow-wrap: anywhere; }
        .architecture { display: grid; gap: 7px; }
        .arch-card { border: 1px solid #30405a; border-radius: 8px; padding: 9px 10px; background: #101827; }
        .arch-card strong { display: block; color: #fbbf24; font-size: 12px; margin-bottom: 4px; }
        .arch-card span { display: block; color: #cbd5e1; font-size: 12px; line-height: 1.45; overflow-wrap: anywhere; }
        .cells { display: grid; gap: 7px; }
        .cell { display: flex; align-items: center; justify-content: space-between; gap: 8px; border: 1px solid #293548; border-radius: 7px; padding: 8px 9px; background: #0f172a; }
        .cell span:first-child { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .pulse { width: 10px; height: 10px; flex: 0 0 10px; border-radius: 999px; background: #34d399; box-shadow: 0 0 0 3px rgba(52, 211, 153, .14); }
        .actions { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
        button { min-height: 34px; border: 1px solid #465772; border-radius: 7px; padding: 7px 8px; background: #172033; color: #f8fafc; cursor: pointer; font-weight: 800; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        button.primary { background: #fbbf24; color: #111827; border-color: #fbbf24; }
        button:hover { border-color: #fbbf24; }
        .output { min-height: 160px; max-height: 360px; overflow: auto; direction: ltr; text-align: left; white-space: pre-wrap; border: 1px solid #334155; border-radius: 8px; padding: 10px; background: #060b16; color: #dbeafe; font-family: var(--vscode-editor-font-family, monospace); font-size: 12px; }
        .note { border-inline-start: 3px solid #fbbf24; padding: 8px 10px; background: #111827; border-radius: 6px; color: #cbd5e1; line-height: 1.5; }
        @media (max-width: 280px) { .grid, .actions { grid-template-columns: 1fr; } h1 { font-size: 17px; } }
    </style>
</head>
<body>
    <div class="shell">
        <section class="hero">
            <div class="eyebrow">Root Neural Fabric</div>
            <h1>Sheikha ${escapeHtmlForTemplate(feature.title)}</h1>
            <p>${escapeHtmlForTemplate(feature.subtitle)}</p>
        </section>

        <section class="grid">
            <div class="tile"><div class="label">Sheikha-Core</div><div id="coreState" class="value">...</div></div>
            <div class="tile"><div class="label">الخلايا الجذرية</div><div id="cellsState" class="value">...</div></div>
            <div class="tile"><div class="label">MCP</div><div id="mcpState" class="value">...</div></div>
            <div class="tile"><div class="label">السيرفر</div><div id="serverState" class="value">...</div></div>
            <div class="tile"><div class="label">الهوية والمعمارية</div><div id="identityState" class="value">...</div></div>
        </section>

        <section class="note">الهدف: أفضل منظومة حاسب وذكاء صناعي ممكنة بأمر الله، بالدليل والاختبار، مع مراجعة بشرية وحوكمة تمنع الضرر.</section>

        <section class="architecture" id="architecture"></section>

        <section class="cells" id="cells"></section>

        <section class="actions" id="actions"></section>

        <pre id="output" class="output">جار فحص شبكة Sheikha الجذرية...</pre>
    </div>

    <script>
        const serverUrl = "${safeServerUrl}";
        const feature = ${featureJson};

        function setText(id, value) {
            document.getElementById(id).textContent = value == null ? '---' : String(value);
        }

        function renderCells() {
            const root = document.getElementById('cells');
            root.innerHTML = '';
            (feature.cells || []).forEach(name => {
                const row = document.createElement('div');
                row.className = 'cell';
                row.innerHTML = '<span>' + escapeHtml(name) + '</span><span class="pulse"></span>';
                root.appendChild(row);
            });
        }

        function renderActions() {
            const root = document.getElementById('actions');
            root.innerHTML = '';
            const refresh = document.createElement('button');
            refresh.className = 'primary';
            refresh.textContent = 'تحديث';
            refresh.addEventListener('click', refreshAll);
            root.appendChild(refresh);

            (feature.actions || []).forEach((action, index) => {
                const button = document.createElement('button');
                button.textContent = action.label;
                button.addEventListener('click', () => runAction(index));
                root.appendChild(button);
            });
        }

        function renderArchitecture(governance) {
            const root = document.getElementById('architecture');
            root.innerHTML = '';
            const universal = governance && governance.universalGovernance ? governance.universalGovernance : {};
            const archetypes = universal.archetypes || {};
            const cards = Object.keys(archetypes).map(key => {
                const item = archetypes[key] || {};
                return {
                    title: key,
                    text: item.principle || 'governed-principle',
                    rules: Array.isArray(item.rules) ? item.rules.join(' / ') : ''
                };
            });

            const identity = document.createElement('div');
            identity.className = 'arch-card';
            identity.innerHTML = '<strong>' + escapeHtml(universal.name || 'Sheikha Universal Governance') + '</strong><span>' + escapeHtml(universal.mode || 'all-systems-halal-governance') + '</span>';
            root.appendChild(identity);

            cards.forEach(card => {
                const node = document.createElement('div');
                node.className = 'arch-card';
                node.innerHTML = '<strong>' + escapeHtml(card.title) + '</strong><span>' + escapeHtml(card.text + (card.rules ? ' — ' + card.rules : '')) + '</span>';
                root.appendChild(node);
            });
        }

        async function fetchJson(path, options = {}) {
            const response = await fetch(serverUrl + path, options);
            const text = await response.text();
            try {
                return text ? JSON.parse(text) : {};
            } catch (_) {
                return { success: false, raw: text };
            }
        }

        async function refreshAll() {
            const output = document.getElementById('output');
            output.textContent = 'جار فحص Sheikha-Core والشبكة الجذرية...';
            try {
                const [extensionStatus, gatewayStatus, primaryStatus] = await Promise.all([
                    fetchJson('/api/sheikha/extension/status').catch(error => ({ success: false, error: error.message })),
                    fetchJson('/api/sheikha/ai-gateway/status').catch(error => ({ success: false, error: error.message })),
                    fetchJson(feature.primary || '/api/sheikha/extension/status').catch(error => ({ success: false, error: error.message }))
                ]);

                const ext = extensionStatus.data || {};
                const neural = ext.neural || {};
                const rootCells = neural.rootNeuralCells || {};
                const mcp = neural.mcpSdk || {};
                const universal = gatewayStatus.governance && gatewayStatus.governance.universalGovernance
                    ? gatewayStatus.governance.universalGovernance
                    : {};
                setText('coreState', gatewayStatus.localModelOnline ? 'online' : (gatewayStatus.status || 'fallback'));
                setText('cellsState', rootCells.activeCells != null ? rootCells.activeCells + ' active' : rootCells.status || 'unknown');
                setText('mcpState', mcp.status ? mcp.status + ' / ' + (mcp.registeredTools || 0) + ' tools' : 'unknown');
                setText('serverState', ext.status || gatewayStatus.status || 'unknown');
                setText('identityState', universal.status ? universal.status + ' / ' + (universal.mode || 'governed') : 'governed');
                renderArchitecture(gatewayStatus.governance || {});
                output.textContent = JSON.stringify({
                    feature: feature.title,
                    gateway: {
                        status: gatewayStatus.status,
                        localModelOnline: gatewayStatus.localModelOnline,
                        sheikhaCoreInstalled: gatewayStatus.sheikhaCoreInstalled,
                        models: gatewayStatus.models,
                        universalGovernance: universal
                    },
                    neural: {
                        rootNeuralCells: rootCells,
                        mcpSdk: mcp
                    },
                    primary: primaryStatus
                }, null, 2);
            } catch (error) {
                output.textContent = 'خطأ في الفحص: ' + error.message;
            }
        }

        async function runAction(index) {
            const action = (feature.actions || [])[index];
            if (!action) return;
            const output = document.getElementById('output');
            output.textContent = 'جار تنفيذ ' + action.label + '...';
            try {
                const options = {
                    method: action.method || 'GET',
                    headers: { 'Content-Type': 'application/json' }
                };
                if (options.method !== 'GET') {
                    options.body = JSON.stringify(action.body || {});
                }
                const data = await fetchJson(action.path, options);
                output.textContent = JSON.stringify(data, null, 2);
                await refreshAll();
            } catch (error) {
                output.textContent = 'خطأ في ' + action.label + ': ' + error.message;
            }
        }

        function escapeHtml(text) {
            return String(text).replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');
        }

        renderCells();
        renderActions();
        refreshAll();
    </script>
</body>
</html>`;
}

function escapeHtmlForTemplate(value) {
    return String(value || '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[char]));
}

function getIntegrationsDashboardHtml() {
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>لوحة تكاملات Sheikha</title>
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
        <div class="title">لوحة تكاملات Sheikha</div>
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

function getApiViewHtml(serverUrl = SERVER_URL) {
    const safeServerUrl = serverUrl.replace(/"/g, '\\"');
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sheikha API</title>
    <style>
        body { font-family: 'Tajawal', sans-serif; background: #111827; color: #f9fafb; margin: 0; padding: 14px; }
        h1 { color: #fbbf24; margin-bottom: 10px; }
        .card { background: #1f2937; border: 1px solid #374151; border-radius: 10px; padding: 12px; margin-bottom: 12px; }
        .label { color: #c7d2fe; font-size: 13px; margin-bottom: 4px; }
        .value { color: #fff; font-size: 14px; white-space: pre-wrap; }
        button { background: #fbbf24; color: #111827; border: none; border-radius: 8px; padding: 8px 12px; cursor: pointer; font-weight: 700; }
    </style>
</head>
<body>
    <h1>واجهة برمجة تطبيقات Sheikha</h1>
    <div class="card">
        <div class="label">Base URL</div>
        <div class="value">${safeServerUrl}/api/sheikha</div>
    </div>
    <div class="card">
        <div class="label">Endpoints متاحة</div>
        <div class="value">extension/status | chat | completions | agent | inline-chat | languages | language/status | language/interpret | ide/status | git/status | git/edit-plan | enterprise-vscode-git/status | enterprise-vscode-git/work-plan | enterprise-git-service/status | enterprise-git-service/pr-mr-plan | enterprise-ide/status | enterprise-ide/development-environment | enterprise-ide/subscription-model | enterprise-ide/industry-services-plan | governing-os/status | governing-os/package-plan | governing-os/universal-integration-plan | ai-service-provider/status | ai-service-provider/certification | ai-service-provider/publish-plan | ai-service-provider/integration-plan | tawheed-foundations | extensions-sync | extensions-live | ai-foundations/status | islamic-intelligence/status | neural-mcp/status | neural-mcp/tools | ai-neural-cell-network/status | ai-neural-cell-network/activate | ai-neural-cell-network/retrain | ai-neural-cell-network/production-plan | ai-neural-cell-network/universal-halal-runtime</div>
    </div>
    <button onclick="pingStatus()">اختبار المسار /extension/status</button>
    <div id="output" class="card" style="margin-top:12px;"></div>
    <script>
        const vscode = acquireVsCodeApi();
        const serverUrl = "${safeServerUrl}";
        async function pingStatus() {
            const output = document.getElementById('output');
            try {
                const res = await fetch(serverUrl + '/api/sheikha/extension/status');
                const body = await res.json();
                output.textContent = JSON.stringify(body, null, 2);
            } catch (err) {
                output.textContent = 'خطأ في الاتصال: ' + err.message;
            }
        }
    </script>
</body>
</html>`;
}

function getPublishViewHtml(serverUrl = 'http://localhost:8080') {
    const safeServerUrl = serverUrl.replace(/"/g, '\\"');
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sheikha النشر ومزود الخدمة</title>
    <style>
        body { font-family: 'Tajawal', sans-serif; background: #111827; color: #f9fafb; margin: 0; padding: 14px; }
        h1 { color: #fbbf24; margin-bottom: 10px; }
        .card { background: #1f2937; border: 1px solid #374151; border-radius: 10px; padding: 14px; margin-bottom: 12px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
        .tile { background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 10px; }
        .label { color: #c7d2fe; font-size: 12px; }
        .value { color: #f9fafb; margin-top: 4px; word-break: break-word; }
        button { background: #fbbf24; color: #111827; border: none; border-radius: 8px; padding: 9px 12px; cursor: pointer; font-weight: 700; margin: 4px 0; }
        .secondary { background: #10b981; }
        pre { background: #0f172a; border: 1px solid #334155; padding: 10px; border-radius: 8px; white-space: pre-wrap; direction: ltr; text-align: left; max-height: 300px; overflow: auto; }
    </style>
</head>
<body>
    <h1>Sheikha النشر ومزود خدمة الذكاء الصناعي</h1>
    <div class="card">
        <p>تشغيل Sheikha كمزود خدمة ذكاء صناعي: VS Code، Git، GitHub، GitHub Copilot، MCP SDK، API، الحزم متعددة الأنظمة، والنشر التجاري تحت حوكمة Sheikha.</p>
        <button onclick="refreshProvider()">حالة المزود</button>
        <button onclick="certification()">شهادة الاعتماد</button>
        <button class="secondary" onclick="publishPlan()">خطة نشر تجاري</button>
        <button onclick="integrationPlan()">خطة تكامل كل الأنظمة</button>
    </div>
    <div class="card grid">
        <div class="tile"><div class="label">المزود</div><div id="providerName" class="value">---</div></div>
        <div class="tile"><div class="label">الحالة</div><div id="providerStatus" class="value">---</div></div>
        <div class="tile"><div class="label">القنوات</div><div id="channelsCount" class="value">---</div></div>
        <div class="tile"><div class="label">النموذج التجاري</div><div id="commercialReady" class="value">---</div></div>
    </div>
    <div class="card">
        <div class="label">المخرجات</div>
        <pre id="publishOutput">لم يتم الفحص بعد.</pre>
    </div>
    <script>
        const serverUrl = '${safeServerUrl}';

        async function refreshProvider() {
            const output = document.getElementById('publishOutput');
            output.textContent = 'جارٍ فحص مزود خدمة Sheikha...';
            try {
                const response = await fetch(serverUrl + '/api/sheikha/ai-service-provider/status');
                const data = await response.json();
                document.getElementById('providerName').textContent = data.productShortName || data.productName || 'Sheikha';
                document.getElementById('providerStatus').textContent = data.status || 'unknown';
                document.getElementById('channelsCount').textContent = String((data.serviceChannels || []).length);
                document.getElementById('commercialReady').textContent = data.commercial && data.commercial.readyForServiceProviderModel ? 'جاهز' : 'قيد التجهيز';
                output.textContent = JSON.stringify(data, null, 2);
            } catch (err) {
                output.textContent = 'خطأ في الاتصال: ' + err.message;
            }
        }

        async function publishPlan() {
            const output = document.getElementById('publishOutput');
            output.textContent = 'جارٍ بناء خطة النشر التجاري...';
            try {
                const response = await fetch(serverUrl + '/api/sheikha/ai-service-provider/publish-plan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        target: 'sheikha-global-runtime-ai-provider',
                        channel: 'vsix-api-mcp-cli',
                        tier: 'enterprise',
                        provider: 'github',
                        systems: ['vscode', 'git', 'github', 'github-copilot', 'mcp-sdk', 'api', 'linux', 'windows', 'macos', 'commerce']
                    })
                });
                output.textContent = JSON.stringify(await response.json(), null, 2);
            } catch (err) {
                output.textContent = 'خطأ في خطة النشر: ' + err.message;
            }
        }

        async function certification() {
            const output = document.getElementById('publishOutput');
            output.textContent = 'جارٍ فحص شهادة اعتماد Sheikha AI Provider...';
            try {
                const response = await fetch(serverUrl + '/api/sheikha/ai-service-provider/certification');
                output.textContent = JSON.stringify(await response.json(), null, 2);
            } catch (err) {
                output.textContent = 'خطأ في شهادة الاعتماد: ' + err.message;
            }
        }

        async function integrationPlan() {
            const output = document.getElementById('publishOutput');
            output.textContent = 'جارٍ بناء خطة التكامل الشامل...';
            try {
                const response = await fetch(serverUrl + '/api/sheikha/ai-service-provider/integration-plan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        target: 'SHEIKHA UGIT-RP',
                        systems: ['vscode', 'git', 'github', 'github-copilot', 'gitlab', 'mcp-sdk', 'api', 'linux', 'windows', 'macos', 'data', 'commerce']
                    })
                });
                output.textContent = JSON.stringify(await response.json(), null, 2);
            } catch (err) {
                output.textContent = 'خطأ في خطة التكامل: ' + err.message;
            }
        }

        refreshProvider();
    </script>
</body>
</html>`;
}

function getServiceProviderViewHtml(serverUrl = 'http://localhost:8080') {
    return getPublishViewHtml(serverUrl);
}

function getEnterpriseIdeViewHtml(serverUrl = 'http://localhost:8080') {
    const safeServerUrl = serverUrl.replace(/"/g, '\\"');
    const extensionsJson = safeJsonForHtml(getInstalledExtensionSnapshot());
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sheikha Enterprise IDE</title>
    <style>
        body { font-family: 'Tajawal', sans-serif; background: #111827; color: #f9fafb; margin: 0; padding: 14px; }
        h1 { color: #fbbf24; margin-bottom: 10px; }
        .card { background: #1f2937; border: 1px solid #374151; border-radius: 10px; padding: 14px; margin-bottom: 12px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
        .tile { background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 10px; }
        .label { color: #c7d2fe; font-size: 12px; }
        .value { color: #f9fafb; margin-top: 4px; word-break: break-word; }
        button { background: #fbbf24; color: #111827; border: none; border-radius: 8px; padding: 9px 12px; cursor: pointer; font-weight: 700; margin: 4px 0; }
        .secondary { background: #10b981; }
        pre { background: #0f172a; border: 1px solid #334155; padding: 10px; border-radius: 8px; white-space: pre-wrap; direction: ltr; text-align: left; max-height: 300px; overflow: auto; }
    </style>
</head>
<body>
    <h1>Sheikha Enterprise IDE</h1>
    <div class="card">
        <p>بيئة Sheikha المؤسسية للتطوير بالذكاء الصناعي: نموذج يعمل داخل أدوات التطوير، اشتراك مؤسسي، خدمات استشارية وتطويرية، وتكامل للأنظمة والأعمال والمصانع والروبوتات تحت حوكمة Sheikha.</p>
        <button onclick="refreshIde()">حالة IDE</button>
        <button class="secondary" onclick="developmentEnvironment()">بيئة التطوير</button>
        <button onclick="subscriptionModel()">نموذج الاشتراك</button>
        <button onclick="industryPlan()">خدمات التقنية والصناعة</button>
    </div>
    <div class="card grid">
        <div class="tile"><div class="label">IDE</div><div id="ideName" class="value">---</div></div>
        <div class="tile"><div class="label">الحالة</div><div id="ideStatus" class="value">---</div></div>
        <div class="tile"><div class="label">النموذج</div><div id="modelMode" class="value">---</div></div>
        <div class="tile"><div class="label">الاشتراكات</div><div id="tiers" class="value">---</div></div>
    </div>
    <div class="card">
        <pre id="ideOutput">لم يتم الفحص بعد.</pre>
    </div>
    <script>
        const serverUrl = '${safeServerUrl}';
        const extensions = ${extensionsJson};

        async function refreshIde() {
            const output = document.getElementById('ideOutput');
            output.textContent = 'جارٍ فحص Sheikha Enterprise IDE...';
            try {
                const response = await fetch(serverUrl + '/api/sheikha/enterprise-ide/status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ extensions, modelMode: 'hybrid' })
                });
                const data = await response.json();
                document.getElementById('ideName').textContent = data.name || 'Sheikha Enterprise IDE';
                document.getElementById('ideStatus').textContent = data.status || 'unknown';
                document.getElementById('modelMode').textContent = data.modelRuntime && data.modelRuntime.defaultMode || 'hybrid';
                document.getElementById('tiers').textContent = String((data.subscriptionTiers || []).length);
                output.textContent = JSON.stringify(data, null, 2);
            } catch (err) {
                output.textContent = 'خطأ في الاتصال: ' + err.message;
            }
        }

        async function developmentEnvironment() {
            const output = document.getElementById('ideOutput');
            output.textContent = 'جارٍ بناء بيئة التطوير المؤسسية...';
            try {
                const response = await fetch(serverUrl + '/api/sheikha/enterprise-ide/development-environment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ target: 'SHEIKHA UGIT-RP', tier: 'enterprise', modelMode: 'hybrid' })
                });
                output.textContent = JSON.stringify(await response.json(), null, 2);
            } catch (err) {
                output.textContent = 'خطأ في بيئة التطوير: ' + err.message;
            }
        }

        async function subscriptionModel() {
            const output = document.getElementById('ideOutput');
            output.textContent = 'جارٍ بناء نموذج الاشتراك...';
            try {
                const response = await fetch(serverUrl + '/api/sheikha/enterprise-ide/subscription-model', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tier: 'enterprise' })
                });
                output.textContent = JSON.stringify(await response.json(), null, 2);
            } catch (err) {
                output.textContent = 'خطأ في الاشتراك: ' + err.message;
            }
        }

        async function industryPlan() {
            const output = document.getElementById('ideOutput');
            output.textContent = 'جارٍ بناء خطة الخدمات التقنية والصناعية...';
            try {
                const response = await fetch(serverUrl + '/api/sheikha/enterprise-ide/industry-services-plan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        domain: 'enterprise-industry-ai-services',
                        services: ['software', 'ai', 'business', 'cloud', 'robotics', 'factories', 'production-lines', 'supply-chain', 'data']
                    })
                });
                output.textContent = JSON.stringify(await response.json(), null, 2);
            } catch (err) {
                output.textContent = 'خطأ في خطة الخدمات: ' + err.message;
            }
        }

        refreshIde();
    </script>
</body>
</html>`;
}

function getUniversalToolsViewHtml(serverUrl = 'http://localhost:8080') {
    const safeServerUrl = serverUrl.replace(/"/g, '\\"');
    const extensionsJson = safeJsonForHtml(getInstalledExtensionSnapshot());
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sheikha Tools Fabric</title>
    <style>
        body { font-family: 'Tajawal', sans-serif; background: #111827; color: #f9fafb; margin: 0; padding: 14px; }
        h1 { color: #fbbf24; margin-bottom: 10px; }
        .card { background: #1f2937; border: 1px solid #374151; border-radius: 10px; padding: 14px; margin-bottom: 12px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
        .tile { background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 10px; }
        .label { color: #c7d2fe; font-size: 12px; }
        .value { color: #f9fafb; margin-top: 4px; word-break: break-word; }
        button { background: #fbbf24; color: #111827; border: none; border-radius: 8px; padding: 9px 12px; cursor: pointer; font-weight: 700; margin: 4px 0; }
        .secondary { background: #10b981; }
        pre { background: #0f172a; border: 1px solid #334155; padding: 10px; border-radius: 8px; white-space: pre-wrap; direction: ltr; text-align: left; max-height: 320px; overflow: auto; }
    </style>
</head>
<body>
    <h1>Sheikha الأدوات والتقنيات</h1>
    <div class="card">
        <p>تفعيل كل الأدوات والإمكانات والتقنيات عبر محولات حاكمة، مع Sheikha-Core وشبكة الخلايا العصبية الجذرية، ووحدة الكتاب والسنة.</p>
        <button onclick="refreshFabric()">حالة النسيج</button>
        <button class="secondary" onclick="activateFabric()">تفعيل النسيج</button>
        <button onclick="integrationPlan()">خطة التكامل</button>
        <button onclick="coreStatus()">Sheikha-Core</button>
        <button onclick="coreArchitecture()">معمارية النواة</button>
        <button onclick="editorStatus()">Sheikha Editor</button>
        <button onclick="keysPolicy()">مفاتيح المزود</button>
        <button onclick="meteringStatus()">قياس الاستخدام</button>
    </div>
    <div class="card grid">
        <div class="tile"><div class="label">النسيج</div><div id="fabricStatus" class="value">---</div></div>
        <div class="tile"><div class="label">الأدوات</div><div id="toolsCount" class="value">---</div></div>
        <div class="tile"><div class="label">Sheikha-Core</div><div id="coreState" class="value">---</div></div>
        <div class="tile"><div class="label">الاعتماد</div><div id="certState" class="value">---</div></div>
    </div>
    <div class="card">
        <pre id="toolsOutput">لم يتم الفحص بعد.</pre>
    </div>
    <script>
        const serverUrl = '${safeServerUrl}';
        const extensions = ${extensionsJson};

        async function requestJson(path, options = {}) {
            const response = await fetch(serverUrl + path, options);
            return response.json();
        }

        async function refreshFabric() {
            const output = document.getElementById('toolsOutput');
            output.textContent = 'جارٍ فحص نسيج الأدوات والتقنيات...';
            try {
                const data = await requestJson('/api/sheikha/universal-tools-fabric/status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ extensions, modelMode: 'hybrid' })
                });
                document.getElementById('fabricStatus').textContent = data.status || 'unknown';
                document.getElementById('toolsCount').textContent = String(data.toolsCount || 0);
                document.getElementById('certState').textContent = data.integrations && data.integrations.provider && data.integrations.provider.certification || '---';
                output.textContent = JSON.stringify(data, null, 2);
            } catch (err) {
                output.textContent = 'خطأ في الاتصال: ' + err.message;
            }
        }

        async function activateFabric() {
            const output = document.getElementById('toolsOutput');
            output.textContent = 'جارٍ تفعيل النسيج الشامل...';
            try {
                const data = await requestJson('/api/sheikha/universal-tools-fabric/activate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ active: true, extensions })
                });
                output.textContent = JSON.stringify(data, null, 2);
                await refreshFabric();
            } catch (err) {
                output.textContent = 'خطأ في التفعيل: ' + err.message;
            }
        }

        async function integrationPlan() {
            const output = document.getElementById('toolsOutput');
            output.textContent = 'جارٍ بناء خطة التكامل الأفضل...';
            try {
                const data = await requestJson('/api/sheikha/universal-tools-fabric/integration-plan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ target: 'SHEIKHA UGIT-RP', tier: 'enterprise', modelMode: 'hybrid' })
                });
                output.textContent = JSON.stringify(data, null, 2);
            } catch (err) {
                output.textContent = 'خطأ في خطة التكامل: ' + err.message;
            }
        }

        async function coreStatus() {
            const output = document.getElementById('toolsOutput');
            output.textContent = 'جارٍ فحص Sheikha-Core...';
            try {
                const data = await requestJson('/api/sheikha/core/status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ extensions, modelMode: 'hybrid' })
                });
                document.getElementById('coreState').textContent = data.status || 'unknown';
                output.textContent = JSON.stringify(data, null, 2);
            } catch (err) {
                output.textContent = 'خطأ في Sheikha-Core: ' + err.message;
            }
        }

        async function coreArchitecture() {
            const output = document.getElementById('toolsOutput');
            output.textContent = 'جارٍ بناء معمارية Sheikha-Core...';
            try {
                const data = await requestJson('/api/sheikha/core/architecture', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ target: 'SHEIKHA UGIT-RP' })
                });
                output.textContent = JSON.stringify(data, null, 2);
            } catch (err) {
                output.textContent = 'خطأ في المعمارية: ' + err.message;
            }
        }

        async function editorStatus() {
            const output = document.getElementById('toolsOutput');
            output.textContent = 'جارٍ فحص Sheikha Editor...';
            try {
                output.textContent = JSON.stringify(await requestJson('/api/sheikha/editor/status'), null, 2);
            } catch (err) {
                output.textContent = 'خطأ في Sheikha Editor: ' + err.message;
            }
        }

        async function keysPolicy() {
            const output = document.getElementById('toolsOutput');
            output.textContent = 'جارٍ فحص سياسة مفاتيح المزود...';
            try {
                output.textContent = JSON.stringify(await requestJson('/api/sheikha/provider-keys/policy'), null, 2);
            } catch (err) {
                output.textContent = 'خطأ في سياسة المفاتيح: ' + err.message;
            }
        }

        async function meteringStatus() {
            const output = document.getElementById('toolsOutput');
            output.textContent = 'جارٍ فحص قياس الاستخدام...';
            try {
                output.textContent = JSON.stringify(await requestJson('/api/sheikha/usage-metering/status'), null, 2);
            } catch (err) {
                output.textContent = 'خطأ في قياس الاستخدام: ' + err.message;
            }
        }

        refreshFabric();
    </script>
</body>
</html>`;
}

function getPathsViewHtml() {
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sheikha المسارات</title>
    <style>
        body { font-family: 'Tajawal', sans-serif; background: #111827; color: #f9fafb; margin: 0; padding: 14px; }
        h1 { color: #fbbf24; margin-bottom: 10px; }
        .list { list-style: none; padding: 0; }
        .item { background: #1f2937; border: 1px solid #374151; border-radius: 10px; padding: 10px; margin-bottom: 8px; }
    </style>
</head>
<body>
    <h1>Sheikha المسارات</h1>
    <ul class="list">
        <li class="item">/api/sheikha/extension/status</li>
        <li class="item">/api/sheikha/chat</li>
        <li class="item">/api/sheikha/completions</li>
        <li class="item">/api/sheikha/agent</li>
        <li class="item">/api/sheikha/inline-chat</li>
        <li class="item">/api/sheikha/languages</li>
        <li class="item">/api/sheikha/language/status</li>
        <li class="item">/api/sheikha/markup/status</li>
        <li class="item">/api/sheikha/language/interpret</li>
        <li class="item">/api/sheikha/ide/status</li>
        <li class="item">/api/sheikha/git/status</li>
        <li class="item">/api/sheikha/git/edit-plan</li>
        <li class="item">/api/sheikha/read-write-publish/status</li>
        <li class="item">/api/sheikha/read-write-publish/plan</li>
        <li class="item">/api/sheikha/read-write-publish/evaluate</li>
        <li class="item">/api/sheikha/enterprise-vscode-git/status</li>
        <li class="item">/api/sheikha/enterprise-vscode-git/work-plan</li>
        <li class="item">/api/sheikha/enterprise-git-service/status</li>
        <li class="item">/api/sheikha/enterprise-git-service/pr-mr-plan</li>
        <li class="item">/api/sheikha/enterprise-ide/status</li>
        <li class="item">/api/sheikha/enterprise-ide/development-environment</li>
        <li class="item">/api/sheikha/enterprise-ide/subscription-model</li>
        <li class="item">/api/sheikha/enterprise-ide/industry-services-plan</li>
        <li class="item">/api/sheikha/universal-tools-fabric/status</li>
        <li class="item">/api/sheikha/universal-tools-fabric/activate</li>
        <li class="item">/api/sheikha/universal-tools-fabric/integration-plan</li>
        <li class="item">/api/sheikha/universal-tools-fabric/tool-plan</li>
        <li class="item">/api/sheikha/core/status</li>
        <li class="item">/api/sheikha/core/activate</li>
        <li class="item">/api/sheikha/core/architecture</li>
        <li class="item">/api/sheikha/editor/status</li>
        <li class="item">/api/sheikha/provider-keys/policy</li>
        <li class="item">/api/sheikha/usage-metering/status</li>
        <li class="item">/api/sheikha/usage-metering/event</li>
        <li class="item">/api/sheikha/governing-os/status</li>
        <li class="item">/api/sheikha/governing-os/package-plan</li>
        <li class="item">/api/sheikha/governing-os/universal-integration-plan</li>
        <li class="item">/api/sheikha/ai-service-provider/status</li>
        <li class="item">/api/sheikha/ai-service-provider/certification</li>
        <li class="item">/api/sheikha/ai-service-provider/publish-plan</li>
        <li class="item">/api/sheikha/ai-service-provider/integration-plan</li>
        <li class="item">/api/sheikha/tawheed-foundations</li>
        <li class="item">/api/sheikha/ai-foundations/status</li>
        <li class="item">/api/sheikha/ai-foundations/query</li>
        <li class="item">/api/sheikha/islamic-intelligence/status</li>
        <li class="item">/api/sheikha/islamic-intelligence/query</li>
        <li class="item">/api/sheikha/neural-mcp/status</li>
        <li class="item">/api/sheikha/neural-mcp/tools</li>
        <li class="item">/api/sheikha/ai-neural-cell-network/status</li>
        <li class="item">/api/sheikha/ai-neural-cell-network/activate</li>
        <li class="item">/api/sheikha/ai-neural-cell-network/retrain</li>
        <li class="item">/api/sheikha/ai-neural-cell-network/evaluate</li>
        <li class="item">/api/sheikha/ai-neural-cell-network/production-plan</li>
        <li class="item">/api/sheikha/ai-neural-cell-network/universal-halal-runtime</li>
        <li class="item">/api/sheikha/neural-runtime-registry/status</li>
        <li class="item">/api/sheikha/neural-runtime-registry/cells</li>
        <li class="item">/api/sheikha/neural-runtime-registry/cells/:id/hot-load</li>
        <li class="item">/api/sheikha/neural-runtime-registry/cells/:id/inject</li>
        <li class="item">/api/sheikha/supreme-root-neural-fabric/status</li>
        <li class="item">/api/sheikha/supreme-root-neural-fabric/activate</li>
        <li class="item">/api/sheikha/supreme-root-neural-fabric/orchestrate</li>
        <li class="item">/api/sheikha/supreme-root-neural-fabric/validate</li>
        <li class="item">/api/sheikha/root-neural-integration/status</li>
        <li class="item">/api/sheikha/root-neural-integration/activate</li>
    </ul>
</body>
</html>`;
}

function getProgrammingViewHtml() {
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sheikha البرمجة</title>
    <style>
        body { font-family: 'Tajawal', sans-serif; background: #111827; color: #f9fafb; margin: 0; padding: 14px; }
        h1 { color: #fbbf24; margin-bottom: 10px; }
        .card { background: #1f2937; border: 1px solid #374151; border-radius: 10px; padding: 12px; margin-bottom: 12px; }
    </style>
</head>
<body>
    <h1>Sheikha البرمجة</h1>
    <div class="card">
        <p>تم تفعيل قدرات البرمجة الذكية: Sheikha Sabil، PHP، اقتراح الكود، التفسير، إصلاح الأخطاء، وإعادة الهيكلة.</p>
    </div>
    <div class="card">
        <p>المفسر متعدد اللغات يعمل عبر شبكة الخلايا العصبية: JavaScript، TypeScript، Python، PHP، Go، Rust، C#، Java، SQL، Bash، HTML، CSS، وغيرها مع مراجعة بشرية.</p>
    </div>
    <div class="card">
        <p>Git/GitHub/GitLab مفعلة كخطة تحرير آمنة: status، diff، review، branch، ثم PR/MR عند الحاجة.</p>
    </div>
</body>
</html>`;
}

function getDebugViewHtml() {
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sheikha Debug</title>
    <style>
        body { font-family: 'Tajawal', sans-serif; background: #111827; color: #f9fafb; margin: 0; padding: 14px; }
        h1 { color: #fbbf24; margin-bottom: 10px; }
        .card { background: #1f2937; border: 1px solid #374151; border-radius: 10px; padding: 12px; margin-bottom: 12px; }
    </style>
</head>
<body>
    <h1>Sheikha Debug</h1>
    <div class="card">
        <p>أدوات مراقبة الأخطاء، سجلات التشغيل، وتحليل المسارات البرمجية متاحة في هذه الواجهة.</p>
    </div>
    <div class="card">
        <p>يمكنك استخدام console.error، debugger، و stack trace لتفكيك أي خطأ بسرعة.</p>
    </div>
</body>
</html>`;
}

function getEditingViewHtml() {
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sheikha التحرير</title>
    <style>
        body { font-family: 'Tajawal', sans-serif; background: #111827; color: #f9fafb; margin: 0; padding: 14px; }
        h1 { color: #fbbf24; margin-bottom: 10px; }
        .card { background: #1f2937; border: 1px solid #374151; border-radius: 10px; padding: 12px; margin-bottom: 12px; }
    </style>
</head>
<body>
    <h1>Sheikha التحرير</h1>
    <div class="card">
        <p>تم تفعيل التحرير الذكي: تحسين الحقول، إعادة الهيكلة، الترجمة، وتعليقات الشرح بالعربية.</p>
    </div>
</body>
</html>`;
}

function getNeuralViewHtml(serverUrl = 'http://localhost:8080') {
    const safeServerUrl = serverUrl.replace(/"/g, '\\"');
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sheikha شبكة الخلايا العصبية</title>
    <style>
        body { font-family: 'Tajawal', sans-serif; background: #111827; color: #f9fafb; margin: 0; padding: 14px; }
        h1 { color: #fbbf24; margin-bottom: 10px; }
        .card { background: #1f2937; border: 1px solid #374151; border-radius: 10px; padding: 16px; margin-bottom: 14px; }
        .highlight { color: #34d399; }
        .button-row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 12px; }
        button { padding: 10px 14px; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; color: #111827; background: #fbbf24; }
        textarea { width: 100%; min-height: 120px; border-radius: 10px; border: 1px solid #374151; background: #0f172a; color: #f9fafb; padding: 12px; resize: vertical; }
        .meta { margin-top: 10px; color: #d1d5db; }
        .meta strong { color: #f8fafc; }
        .status-ok { color: #34d399; }
        .status-warn { color: #fbbf24; }
        .status-error { color: #f87171; }
    </style>
</head>
<body>
    <h1>شبكة الخلايا العصبية الجذرية</h1>
    <div class="card">
        <p class="highlight">شبكة Sheikha العصبية تعمل بحوكمة الكتاب والسنة، وتوفر تحليلًا آمنًا ومفسرًا.</p>
        <div class="meta">قاعدة التشغيل: تحليل بيانات برمجية، منع الادعاءات بالوعي، وحماية الخصوصية.</div>
        <div class="button-row">
            <button onclick="activateNetwork(true)">تفعيل الشبكة</button>
            <button onclick="activateNetwork(false)">إيقاف الشبكة</button>
            <button onclick="retrainNetwork()">إعادة تدريب</button>
            <button onclick="refreshStatus()">تحديث الحالة</button>
        </div>
    </div>
    <div class="card">
        <strong>نسيج Sheikha الجذري الأعلى:</strong>
        <p class="highlight">طبقة تنظيم أعلى من الشبكة الجذرية: تنسق الخلايا، MCP، Git، اللغات، الترميز، البيانات، وخطوط الإنتاج تحت حوكمة الكتاب والسنة.</p>
        <div class="button-row">
            <button onclick="activateSupremeFabric()">تفعيل النسيج الأعلى</button>
            <button onclick="orchestrateSupremeFabric()">تنسيق كامل</button>
            <button onclick="validateCompleteIntegration()">تحقق التكامل التام</button>
            <button onclick="refreshSupremeFabric()">تحديث النسيج</button>
        </div>
        <div id="fabricMessage" class="meta">لم يتم فحص النسيج الأعلى بعد.</div>
    </div>
    <div class="card">
        <strong>حالة الشبكة الآن:</strong>
        <div id="statusMessage" class="meta">جارٍ التحقق...</div>
        <div class="meta"><strong>الحالة:</strong> <span id="networkStatus">---</span></div>
        <div class="meta"><strong>الإصدار:</strong> <span id="networkVersion">---</span></div>
        <div class="meta"><strong>آخر إعادة تدريب:</strong> <span id="networkRetrain">---</span></div>
    </div>
    <div class="card">
        <strong>تقييم عينة نصية:</strong>
        <textarea id="evaluationInput" placeholder="أدخل نص أو وصف مهمة لتقييمه بواسطة شبكة الخلايا العصبية"></textarea>
        <div class="button-row"><button onclick="evaluateInput()">تقييم</button></div>
    </div>
    <div class="card" id="evaluationResult">
        <strong>نتيجة التقييم:</strong>
        <div id="resultMessage" class="meta">لا توجد نتيجة بعد.</div>
    </div>
    <script>
        const serverUrl = '${safeServerUrl}';
        const basePath = serverUrl + '/api/sheikha/ai-neural-cell-network';
        const fabricPath = serverUrl + '/api/sheikha/supreme-root-neural-fabric';
        const integrationPath = serverUrl + '/api/sheikha/root-neural-integration';

        async function refreshStatus() {
            const statusMessage = document.getElementById('statusMessage');
            const networkStatus = document.getElementById('networkStatus');
            const networkVersion = document.getElementById('networkVersion');
            const networkRetrain = document.getElementById('networkRetrain');
            statusMessage.textContent = 'جارٍ جلب الحالة من الخادم...';
            try {
                const response = await fetch(basePath + '/status');
                const data = await response.json();
                if (data.success) {
                    statusMessage.textContent = data.message;
                    networkStatus.textContent = data.status;
                    networkVersion.textContent = data.version || 'غير معروف';
                    networkRetrain.textContent = data.lastRetrainedAt || 'لم يتم إعادة تدريب';
                    networkStatus.className = data.status === 'active' ? 'status-ok' : 'status-warn';
                } else {
                    statusMessage.textContent = 'فشل جلب حالة الشبكة';
                    networkStatus.textContent = 'خطأ';
                    networkStatus.className = 'status-error';
                }
            } catch (err) {
                statusMessage.textContent = 'خطأ في الاتصال بالخادم: ' + err.message;
                networkStatus.textContent = 'غير متاح';
                networkStatus.className = 'status-error';
            }
        }

        async function refreshSupremeFabric() {
            const fabricMessage = document.getElementById('fabricMessage');
            fabricMessage.textContent = 'جارٍ فحص النسيج الأعلى...';
            try {
                const response = await fetch(fabricPath + '/status');
                const data = await response.json();
                if (data.success) {
                    const orchestration = data.orchestration || {};
                    fabricMessage.textContent = '✅ ' + data.status + ' | الخلايا: ' + (orchestration.cellsCount || 0) +
                        ' | اللغات: ' + (orchestration.languagesCount || 0) +
                        ' | الترميز: ' + (orchestration.markupLanguagesCount || 0) +
                        ' | المصانع: ' + (orchestration.factoriesCount || 0);
                } else {
                    fabricMessage.textContent = '⚠️ النسيج الأعلى غير متاح.';
                }
            } catch (err) {
                fabricMessage.textContent = 'خطأ في الاتصال بالنسيج الأعلى: ' + err.message;
            }
        }

        async function activateSupremeFabric() {
            const fabricMessage = document.getElementById('fabricMessage');
            fabricMessage.textContent = 'جارٍ تفعيل النسيج الأعلى...';
            try {
                const response = await fetch(fabricPath + '/activate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ active: true })
                });
                const data = await response.json();
                fabricMessage.textContent = data.message || 'تم التفعيل.';
                await refreshSupremeFabric();
                await refreshStatus();
            } catch (err) {
                fabricMessage.textContent = 'خطأ في تفعيل النسيج الأعلى: ' + err.message;
            }
        }

        async function orchestrateSupremeFabric() {
            const fabricMessage = document.getElementById('fabricMessage');
            fabricMessage.textContent = 'جارٍ التنسيق الكامل للنسيج الأعلى...';
            try {
                const response = await fetch(fabricPath + '/orchestrate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        domain: 'sheikha-global-runtime-platform',
                        objective: 'complete-halal-root-runtime',
                        priority: 'itqan'
                    })
                });
                const data = await response.json();
                fabricMessage.textContent = data.success
                    ? '✅ تم التنسيق: ' + data.decision + ' | المنتج: ' + data.production.productType
                    : '⚠️ تعذر التنسيق الكامل.';
                await refreshSupremeFabric();
            } catch (err) {
                fabricMessage.textContent = 'خطأ في التنسيق الكامل: ' + err.message;
            }
        }

        async function validateCompleteIntegration() {
            const fabricMessage = document.getElementById('fabricMessage');
            fabricMessage.textContent = 'جارٍ تفعيل وفحص التكامل الجذري الكامل...';
            try {
                const response = await fetch(integrationPath + '/activate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        objective: 'complete-root-neural-integration',
                        mode: 'itqan',
                        source: 'vscode-extension'
                    })
                });
                const data = await response.json();
                const failed = Array.isArray(data.checks)
                    ? data.checks.filter(check => !check.ok).map(check => check.label)
                    : [];
                fabricMessage.textContent = data.success
                    ? '✅ التكامل الجذري الكامل مفعل | الدرجة: ' + data.score + '% | القرار: ' + data.decision
                    : '⚠️ يحتاج مراجعة | الدرجة: ' + (data.score || 0) + '% | ' + failed.join('، ');
                await refreshSupremeFabric();
                await refreshStatus();
            } catch (err) {
                fabricMessage.textContent = 'خطأ في تحقق التكامل الجذري الكامل: ' + err.message;
            }
        }

        async function activateNetwork(active) {
            const actionText = active ? 'تفعيل' : 'إيقاف';
            const statusMessage = document.getElementById('statusMessage');
            statusMessage.textContent = actionText + ' الشبكة...';
            try {
                const response = await fetch(basePath + '/activate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ activate: active })
                });
                const data = await response.json();
                statusMessage.textContent = data.message || (actionText + ' اكتمل.');
                await refreshStatus();
            } catch (err) {
                statusMessage.textContent = 'خطأ في الاتصال بالخادم: ' + err.message;
            }
        }

        async function retrainNetwork() {
            const statusMessage = document.getElementById('statusMessage');
            statusMessage.textContent = 'جارٍ إعادة تدريب الشبكة...';
            try {
                const response = await fetch(basePath + '/retrain', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ dataset: 'sheikha-governed-corpus' })
                });
                const data = await response.json();
                statusMessage.textContent = data.message || 'تمت إعادة التدريب';
                await refreshStatus();
            } catch (err) {
                statusMessage.textContent = 'خطأ في الاتصال بالخادم: ' + err.message;
            }
        }

        async function evaluateInput() {
            const input = document.getElementById('evaluationInput').value.trim();
            const resultMessage = document.getElementById('resultMessage');
            if (!input) {
                resultMessage.textContent = 'أدخل نصًا أو مهمة لتقييمها.';
                return;
            }
            resultMessage.textContent = 'جارٍ التقييم...';
            try {
                const response = await fetch(basePath + '/evaluate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ input, source: 'sheikha-vscode' })
                });
                const data = await response.json();
                if (data.success) {
                    resultMessage.textContent = '✅ القرار: ' + data.decision + '. وُجدت انتهاكات: ' + (data.violations.length ? data.violations.join(', ') : 'لا شيء');
                } else {
                    resultMessage.textContent = '⚠️ فشل التقييم. تحقق من حالة الشبكة.';
                }
            } catch (err) {
                resultMessage.textContent = 'خطأ في التقييم: ' + err.message;
            }
        }

        refreshStatus();
        refreshSupremeFabric();
    </script>
</body>
</html>`;
}

function getInstalledExtensionSnapshot() {
    try {
        return vscode.extensions.all.map(ext => ({
            id: ext.id,
            displayName: ext.packageJSON && (ext.packageJSON.displayName || ext.packageJSON.name),
            version: ext.packageJSON && ext.packageJSON.version,
            publisher: ext.packageJSON && ext.packageJSON.publisher
        }));
    } catch (_) {
        return [];
    }
}

function safeJsonForHtml(value) {
    return JSON.stringify(value).replace(/</g, '\\u003c');
}

function getEnterpriseIntegrationViewHtml(serverUrl = 'http://localhost:8080') {
    const safeServerUrl = serverUrl.replace(/"/g, '\\"');
    const extensionsJson = safeJsonForHtml(getInstalledExtensionSnapshot());
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sheikha التكامل المؤسسي</title>
    <style>
        body { font-family: 'Tajawal', sans-serif; background: #111827; color: #f9fafb; margin: 0; padding: 14px; }
        h1 { color: #fbbf24; margin-bottom: 10px; }
        .card { background: #1f2937; border: 1px solid #374151; border-radius: 10px; padding: 14px; margin-bottom: 12px; }
        .row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .label { color: #c7d2fe; font-size: 12px; margin-bottom: 4px; }
        .value { color: #f9fafb; font-size: 14px; word-break: break-word; }
        button { background: #fbbf24; color: #111827; border: none; border-radius: 8px; padding: 9px 12px; cursor: pointer; font-weight: 700; margin: 4px 0; }
        pre { background: #0f172a; border: 1px solid #334155; padding: 10px; border-radius: 8px; white-space: pre-wrap; direction: ltr; text-align: left; max-height: 260px; overflow: auto; }
    </style>
</head>
<body>
    <h1>Sheikha التكامل المؤسسي</h1>
    <div class="card">
        <p>طبقة تنظيمية وتجارية تربط VS Code وGit وGitHub وGitHub Copilot داخل Sheikha، مع بقاء Sheikha هي طبقة الحوكمة والاعتماد.</p>
        <button onclick="refreshEnterprise()">تحديث الحالة</button>
        <button onclick="buildWorkPlan()">خطة العمل المؤسسية</button>
        <button onclick="refreshGitService()">خدمة Git المؤسسية</button>
        <button onclick="buildPrPlan()">خطة PR</button>
        <button onclick="buildMrPlan()">خطة MR</button>
    </div>
    <div class="card row">
        <div><div class="label">Git</div><div id="gitStatus" class="value">---</div></div>
        <div><div class="label">GitHub</div><div id="githubStatus" class="value">---</div></div>
        <div><div class="label">GitHub Copilot</div><div id="copilotStatus" class="value">---</div></div>
        <div><div class="label">الإضافات</div><div id="extensionsStatus" class="value">---</div></div>
    </div>
    <div class="card">
        <div class="label">المخرجات</div>
        <pre id="enterpriseOutput">لم يتم الفحص بعد.</pre>
    </div>
    <script>
        const serverUrl = '${safeServerUrl}';
        const extensions = ${extensionsJson};

        async function refreshEnterprise() {
            const output = document.getElementById('enterpriseOutput');
            output.textContent = 'جارٍ فحص التكامل المؤسسي...';
            try {
                const response = await fetch(serverUrl + '/api/sheikha/enterprise-vscode-git/status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ extensions })
                });
                const data = await response.json();
                const stack = data.stack || {};
                document.getElementById('gitStatus').textContent = (stack.git && (stack.git.branch + ' | ' + stack.git.provider)) || 'غير معروف';
                document.getElementById('githubStatus').textContent = stack.github && stack.github.providerDetected ? 'متصل عبر remote' : 'جاهز للتكوين';
                document.getElementById('copilotStatus').textContent = stack.githubCopilot && stack.githubCopilot.detectedInVsCode ? 'مكتشف في VS Code' : 'غير مكتشف';
                document.getElementById('extensionsStatus').textContent = extensions.length + ' إضافة';
                output.textContent = JSON.stringify(data, null, 2);
            } catch (err) {
                output.textContent = 'خطأ في الاتصال: ' + err.message;
            }
        }

        async function buildWorkPlan() {
            const output = document.getElementById('enterpriseOutput');
            output.textContent = 'جارٍ بناء خطة العمل...';
            try {
                const response = await fetch(serverUrl + '/api/sheikha/enterprise-vscode-git/work-plan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ target: 'sheikha-main-portal', provider: 'github' })
                });
                const data = await response.json();
                output.textContent = JSON.stringify(data, null, 2);
            } catch (err) {
                output.textContent = 'خطأ في الخطة: ' + err.message;
            }
        }

        async function refreshGitService() {
            const output = document.getElementById('enterpriseOutput');
            output.textContent = 'جارٍ فحص خدمة Git المؤسسية...';
            try {
                const response = await fetch(serverUrl + '/api/sheikha/enterprise-git-service/status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ extensions, provider: 'github' })
                });
                output.textContent = JSON.stringify(await response.json(), null, 2);
            } catch (err) {
                output.textContent = 'خطأ في خدمة Git المؤسسية: ' + err.message;
            }
        }

        async function buildPrPlan() {
            const output = document.getElementById('enterpriseOutput');
            output.textContent = 'جارٍ بناء خطة PR...';
            try {
                const response = await fetch(serverUrl + '/api/sheikha/enterprise-git-service/pr-mr-plan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        provider: 'github',
                        kind: 'PR',
                        title: 'Sheikha AI Provider enterprise activation',
                        sourceBranch: 'current-branch',
                        targetBranch: 'main'
                    })
                });
                output.textContent = JSON.stringify(await response.json(), null, 2);
            } catch (err) {
                output.textContent = 'خطأ في خطة PR: ' + err.message;
            }
        }

        async function buildMrPlan() {
            const output = document.getElementById('enterpriseOutput');
            output.textContent = 'جارٍ بناء خطة MR...';
            try {
                const response = await fetch(serverUrl + '/api/sheikha/enterprise-git-service/pr-mr-plan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        provider: 'gitlab',
                        kind: 'MR',
                        title: 'Sheikha AI Provider enterprise activation',
                        sourceBranch: 'current-branch',
                        targetBranch: 'main'
                    })
                });
                output.textContent = JSON.stringify(await response.json(), null, 2);
            } catch (err) {
                output.textContent = 'خطأ في خطة MR: ' + err.message;
            }
        }

        refreshEnterprise();
    </script>
</body>
</html>`;
}

function getGoverningOsViewHtml(serverUrl = 'http://localhost:8080') {
    const safeServerUrl = serverUrl.replace(/"/g, '\\"');
    const extensionsJson = safeJsonForHtml(getInstalledExtensionSnapshot());
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sheikha AI AL OS</title>
    <style>
        body { font-family: 'Tajawal', sans-serif; background: #111827; color: #f9fafb; margin: 0; padding: 14px; }
        h1 { color: #fbbf24; margin-bottom: 10px; }
        .card { background: #1f2937; border: 1px solid #374151; border-radius: 10px; padding: 14px; margin-bottom: 12px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 10px; }
        .tile { background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 10px; }
        .label { color: #c7d2fe; font-size: 12px; }
        .value { color: #f9fafb; font-size: 14px; margin-top: 4px; }
        button { background: #fbbf24; color: #111827; border: none; border-radius: 8px; padding: 9px 12px; cursor: pointer; font-weight: 700; margin: 4px 0; }
        pre { background: #0f172a; border: 1px solid #334155; padding: 10px; border-radius: 8px; white-space: pre-wrap; direction: ltr; text-align: left; max-height: 260px; overflow: auto; }
    </style>
</head>
<body>
    <h1>Sheikha AI AL OS</h1>
    <div class="card">
        <p>طبقة Sheikha الحاكمة لأنظمة التشغيل والحزم والإضافات: Linux، Pop!_OS، Debian، Ubuntu، Red Hat، Fedora، SUSE، Windows، macOS، مع deb/rpm/tar.gz/snap/zip/dmg/cli.</p>
        <button onclick="refreshOs()">تحديث الطبقة</button>
        <button onclick="planPackage('linux','deb','x64')">خطة .deb</button>
        <button onclick="planPackage('linux','rpm','x64')">خطة .rpm</button>
        <button onclick="planPackage('windows','user-installer','x64')">خطة Windows</button>
        <button onclick="planPackage('macos','dmg','universal')">خطة Mac</button>
        <button onclick="universalPlan()">خطة تكامل شامل</button>
    </div>
    <div class="card grid">
        <div class="tile"><div class="label">المنصات</div><div id="platforms" class="value">---</div></div>
        <div class="tile"><div class="label">أنواع الحزم</div><div id="packages" class="value">---</div></div>
        <div class="tile"><div class="label">الإضافات</div><div id="extensions" class="value">---</div></div>
        <div class="tile"><div class="label">الحالة</div><div id="osStatus" class="value">---</div></div>
    </div>
    <div class="card">
        <pre id="osOutput">لم يتم الفحص بعد.</pre>
    </div>
    <script>
        const serverUrl = '${safeServerUrl}';
        const extensions = ${extensionsJson};

        async function refreshOs() {
            const output = document.getElementById('osOutput');
            output.textContent = 'جارٍ فحص Sheikha AI AL OS...';
            try {
                const response = await fetch(serverUrl + '/api/sheikha/governing-os/status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ extensions })
                });
                const data = await response.json();
                document.getElementById('platforms').textContent = (data.platforms || []).join(', ');
                document.getElementById('packages').textContent = String(data.packageCount || 0);
                document.getElementById('extensions').textContent = String(data.extensions && data.extensions.count || 0);
                document.getElementById('osStatus').textContent = data.status || 'unknown';
                output.textContent = JSON.stringify(data, null, 2);
            } catch (err) {
                output.textContent = 'خطأ في الاتصال: ' + err.message;
            }
        }

        async function planPackage(platform, packageType, arch) {
            const output = document.getElementById('osOutput');
            output.textContent = 'جارٍ إعداد خطة الحزمة...';
            try {
                const response = await fetch(serverUrl + '/api/sheikha/governing-os/package-plan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ platform, packageType, arch })
                });
                output.textContent = JSON.stringify(await response.json(), null, 2);
            } catch (err) {
                output.textContent = 'خطأ في خطة الحزمة: ' + err.message;
            }
        }

        async function universalPlan() {
            const output = document.getElementById('osOutput');
            output.textContent = 'جارٍ بناء خطة التكامل الشامل...';
            try {
                const response = await fetch(serverUrl + '/api/sheikha/governing-os/universal-integration-plan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ target: 'sheikha-ai-al-os' })
                });
                output.textContent = JSON.stringify(await response.json(), null, 2);
            } catch (err) {
                output.textContent = 'خطأ في خطة التكامل: ' + err.message;
            }
        }

        refreshOs();
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
        :root { color-scheme: dark; }
        * { box-sizing: border-box; }
        body { font-family: var(--vscode-font-family, 'Tajawal', sans-serif); background: #0f172a; color: #f8fafc; margin: 0; padding: 8px; }
        .shell { display: grid; grid-template-rows: auto auto minmax(0, 1fr) auto; gap: 8px; height: calc(100vh - 16px); min-height: 260px; }
        .top { display: flex; align-items: center; justify-content: space-between; gap: 8px; min-width: 0; }
        .header { color: #fbbf24; font-weight: 800; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .status { color: #cbd5e1; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .actions { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
        .actions button, .footer button { min-height: 32px; border: 1px solid #334155; border-radius: 6px; background: #111c31; color: #f8fafc; font-weight: 700; cursor: pointer; }
        .actions button:hover, .footer button:hover { border-color: #fbbf24; }
        .messages { min-height: 0; overflow-y: auto; background: #1f2937; border: 1px solid #374151; border-radius: 8px; padding: 8px; }
        .message { margin: 0 0 8px; padding: 9px; border-radius: 6px; line-height: 1.55; white-space: pre-wrap; overflow-wrap: anywhere; }
        .assistant { background: #0b1220; border-inline-start: 3px solid #fbbf24; }
        .user { background: #123120; border-inline-start: 3px solid #34d399; direction: auto; }
        .meta { margin-top: 8px; color: #94a3b8; font-size: 11px; direction: ltr; text-align: left; white-space: normal; }
        pre { margin: 8px 0 0; padding: 8px; border-radius: 6px; background: #020617; color: #e2e8f0; overflow-x: auto; direction: ltr; text-align: left; white-space: pre-wrap; }
        .footer { display: grid; grid-template-columns: minmax(0, 1fr) 64px; gap: 6px; align-items: end; }
        textarea { width: 100%; min-width: 0; height: 46px; max-height: 120px; resize: vertical; padding: 8px; background: #0b1220; color: #fff; border: 1px solid #475569; border-radius: 6px; font-family: inherit; line-height: 1.4; }
        textarea:focus { outline: 1px solid #fbbf24; border-color: #fbbf24; }
        button.primary { background: #fbbf24; color: #111827; border-color: #fbbf24; }
        button:disabled, textarea:disabled { opacity: .58; cursor: wait; }
    </style>
</head>
<body>
    <div class="shell">
        <div class="top">
            <div class="header">Sheikha Chat</div>
            <div id="status" class="status">جار الفحص...</div>
        </div>
        <div class="actions">
            <button data-prompt="افحص حالة الدمج وGit والتكامل، ثم أعطني خطة تنفيذ وفحص قبل الدمج.">Merge</button>
            <button data-prompt="افحص حالة Git الحالية واقترح خطوات آمنة قبل أي commit أو push.">Git</button>
            <button data-prompt="افحص تكاملات الإكستنشن والـ API واذكر الناقص والمخاطر.">Plug</button>
            <button data-prompt="جهز خطة تكامل الفيديو داخل Sheikha مع فحص الخصوصية والأداء.">Video</button>
            <button data-prompt="حلل مسار Vision داخل Sheikha واربطه بالشات والتكاملات.">Vision</button>
            <button data-prompt="افحص الملف المفتوح وسياقه، ثم اقترح تعديلًا آمنًا قابلًا للمراجعة.">File+</button>
        </div>
        <div id="messages" class="messages"></div>
        <div class="footer">
            <textarea id="input" placeholder="اكتب طلبك أو ارفع سياقك هنا..."></textarea>
            <button id="send" class="primary">إرسال</button>
        </div>
    </div>
    <script>
        const vscode = acquireVsCodeApi();
        const input = document.getElementById('input');
        const send = document.getElementById('send');
        const statusEl = document.getElementById('status');
        const messages = document.getElementById('messages');
        let lastStatusText = 'جاهز';
        let pending = false;

        vscode.postMessage({ command: 'ready' });
        input.addEventListener('keydown', event => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
            }
        });
        send.addEventListener('click', sendMessage);
        document.querySelectorAll('[data-prompt]').forEach(button => {
            button.addEventListener('click', () => sendPrompt(button.getAttribute('data-prompt')));
        });

        function sendMessage() {
            sendPrompt(input.value);
        }

        function sendPrompt(raw) {
            const msg = String(raw || '').trim();
            if (!msg) return;
            if (pending) return;
            appendMessage('user', msg);
            input.value = '';
            setPending(true);
            vscode.postMessage({ command: 'chat', message: msg });
        }

        window.addEventListener('message', event => {
            if (!event.data) return;
            if (event.data.command === 'pending') {
                setPending(Boolean(event.data.value));
                return;
            }
            if (event.data.command === 'runtimeStatus') {
                applyRuntimeStatus(event.data.data || {});
                return;
            }
            if (event.data.command === 'cleared') {
                messages.textContent = '';
                return;
            }
            if (event.data.command !== 'response') return;
            const data = event.data.data || {};
            const reply = data.reply || 'لا توجد استجابة';
            const meta = [data.provider, data.mode, data.model, data.localModelOnline === false ? 'local-offline' : '']
                .filter(Boolean)
                .join(' · ');
            appendMessage('assistant', reply, meta, data.codeSnippet || '');
            setPending(false);
        });

        function appendMessage(role, text, meta, code) {
            const item = document.createElement('div');
            item.className = 'message ' + (role === 'user' ? 'user' : 'assistant');
            item.textContent = text;
            if (code) {
                const pre = document.createElement('pre');
                pre.textContent = code;
                item.appendChild(pre);
            }
            if (meta) {
                const metaEl = document.createElement('div');
                metaEl.className = 'meta';
                metaEl.textContent = meta;
                item.appendChild(metaEl);
            }
            messages.appendChild(item);
            messages.scrollTop = messages.scrollHeight;
        }

        function setPending(value) {
            pending = value;
            input.disabled = value;
            send.disabled = value;
            statusEl.textContent = value ? 'يعالج الطلب...' : lastStatusText;
        }

        function applyRuntimeStatus(data) {
            const gateway = data.gatewayStatus || {};
            const ext = data.extensionStatus || {};
            const online = gateway.localModelOnline === true || gateway.sheikhaCoreInstalled === true;
            const backend = ext.status || 'unknown';
            const model = gateway.defaultModel || ext.model || 'Sheikha-Core';
            lastStatusText = online
                ? model + ' online · ' + backend
                : model + ' fallback · ' + backend;
            if (!pending) statusEl.textContent = lastStatusText;
        }
    </script>
</body>
</html>`;
}

async function loadEcosystemSignals(serverUrl, authHeaders) {
    // فحص endpoints الخادم
    const checks = [
        { name: 'Sheikha', path: '/api/sheikha/extension/status', mapper: data => (data && data.data && data.data.status) || 'unknown' },
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
