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
            dashboardRefreshSeconds: wsConfig.get('dashboardRefreshSeconds', 60),
            chatRetries: Math.max(0, wsConfig.get('chatRetries', 2)),
            chatRequestTimeoutMs: Math.max(800, wsConfig.get('chatRequestTimeoutMs', 4000)),
            chatSloLatencyMs: Math.max(500, wsConfig.get('chatSloLatencyMs', 2500))
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
        const startedAt = Date.now();
        const totalAttempts = this.config.chatRetries + 1;

        const requestChatEndpoint = async () => {
            const response = await fetchWithTimeout(`${this.config.serverUrl}/api/sheikha/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders },
                body: JSON.stringify({
                    message,
                    codeContext,
                    language,
                    history: history || [],
                    model: this.config.defaultModel
                })
            }, this.config.chatRequestTimeoutMs);

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || `chat endpoint ${response.status}`);
            }
            return data.data;
        };

        const requestFallbackEndpoint = async () => {
            const fallbackResponse = await fetchWithTimeout(`${this.config.serverUrl}/api/sheikha/ai-gateway/ask`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders },
                body: JSON.stringify({
                    prompt: message,
                    context: {
                        source: 'vscode-extension',
                        language,
                        codeContext: codeContext ? codeContext.slice(0, 12000) : '',
                        history: history || []
                    }
                })
            }, this.config.chatRequestTimeoutMs);

            const fallbackData = await fallbackResponse.json();
            if (!fallbackResponse.ok || !fallbackData.success) {
                throw new Error(fallbackData.message || fallbackData.error || 'ai-gateway unavailable');
            }
            return {
                reply: fallbackData.output || fallbackData.message || 'Sheikha جاهزة.',
                codeSnippet: fallbackData.codeSnippet || null,
                provider: fallbackData.provider,
                mode: fallbackData.mode
            };
        };

        let lastError = null;
        for (let attempt = 1; attempt <= totalAttempts; attempt += 1) {
            try {
                const data = await requestChatEndpoint();
                const latencyMs = Date.now() - startedAt;
                return {
                    ...data,
                    meta: {
                        ...(data && data.meta ? data.meta : {}),
                        attempts: attempt,
                        latencyMs,
                        meetsSLO: latencyMs <= this.config.chatSloLatencyMs,
                        source: 'chat-endpoint'
                    }
                };
            } catch (error) {
                lastError = error;
                if (attempt >= totalAttempts) {
                    break;
                }
            }
        }

        try {
            const fallbackResult = await requestFallbackEndpoint();
            const latencyMs = Date.now() - startedAt;
            return {
                ...fallbackResult,
                meta: {
                    attempts: totalAttempts + 1,
                    latencyMs,
                    meetsSLO: latencyMs <= this.config.chatSloLatencyMs,
                    source: 'ai-gateway-fallback'
                }
            };
        } catch (fallbackErr) {
            const latencyMs = Date.now() - startedAt;
            return {
                reply: `خطأ: ${fallbackErr.message || (lastError && lastError.message) || 'تعذر تنفيذ المحادثة'}`,
                codeSnippet: null,
                meta: {
                    attempts: totalAttempts + 1,
                    latencyMs,
                    meetsSLO: false,
                    source: 'failed'
                }
            };
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
    const apiViewProvider = new SheikhaFeatureViewProvider(() => getApiViewHtml(provider.config.serverUrl));
    const publishViewProvider = new SheikhaFeatureViewProvider(() => getPublishViewHtml(provider.config.serverUrl));
    const pathsViewProvider = new SheikhaFeatureViewProvider(getPathsViewHtml);
    const programmingViewProvider = new SheikhaFeatureViewProvider(getProgrammingViewHtml);
    const debugViewProvider = new SheikhaFeatureViewProvider(getDebugViewHtml);
    const editingViewProvider = new SheikhaFeatureViewProvider(getEditingViewHtml);
    const neuralViewProvider = new SheikhaFeatureViewProvider(() => getNeuralViewHtml(provider.config.serverUrl));
    const enterpriseViewProvider = new SheikhaFeatureViewProvider(() => getEnterpriseIntegrationViewHtml(provider.config.serverUrl));
    const osViewProvider = new SheikhaFeatureViewProvider(() => getGoverningOsViewHtml(provider.config.serverUrl));
    const serviceProviderViewProvider = new SheikhaFeatureViewProvider(() => getServiceProviderViewHtml(provider.config.serverUrl));
    const ideViewProvider = new SheikhaFeatureViewProvider(() => getEnterpriseIdeViewHtml(provider.config.serverUrl));
    const toolsViewProvider = new SheikhaFeatureViewProvider(() => getUniversalToolsViewHtml(provider.config.serverUrl));
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

            copilotPanel.webview.onDidReceiveMessage(async (msg) => {
                if (msg.command === 'chat') {
                    const editor = vscode.window.activeTextEditor;
                    const responseData = await provider.chat(
                        msg.message,
                        editor ? editor.document.getText() : '',
                        editor ? editor.document.languageId : 'auto',
                        []
                    );
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
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sheikha Chat</title>
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
        <div class="header">🤖 Sheikha Chat — مساعد البرمجة الذكي</div>
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
    <div class="header">🤖 شات Sheikha</div>
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
